/**
 * La conectividad de C6 (paso 12 del plan): estado de red, suscripción y las dos
 * degradaciones que son comportamiento y no superficie.
 *
 * El adaptador es siempre un doble: ninguna prueba lee la red del sistema
 * operativo. El reloj entra inyectado para que `measuredAt` sea determinista
 * (NFR5.7) y el logger es un doble que deja ver el diagnóstico exacto sin que
 * ningún dato de la persona viaje en el mensaje (NFR4.6).
 */
import {
  createConnectivity,
  type Connectivity,
  type NetworkAdapter,
  type NetworkAdapterState,
  type NetworkLogCode,
} from "../connectivity";

const NOW = "2026-11-12T09:00:00.000Z";
const NOW_MS = Date.parse(NOW);

interface AdapterOptions {
  initial?: NetworkAdapterState;
  readError?: Error;
  listenError?: Error;
}

interface FakeAdapter extends NetworkAdapter {
  emit(state: NetworkAdapterState): void;
  listenerCount(): number;
}

function fakeAdapter(options: AdapterOptions = {}): FakeAdapter {
  const listeners = new Set<(state: NetworkAdapterState) => void>();

  return {
    getState: jest.fn(async () => {
      if (options.readError !== undefined) {
        throw options.readError;
      }
      return options.initial ?? { online: true };
    }),

    addListener: jest.fn((listener: (state: NetworkAdapterState) => void) => {
      if (options.listenError !== undefined) {
        throw options.listenError;
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }),

    emit(state) {
      for (const listener of [...listeners]) {
        listener(state);
      }
    },

    listenerCount() {
      return listeners.size;
    },
  };
}

type LoggerSpy = jest.Mock<void, [NetworkLogCode, string]>;

function newLogger(): LoggerSpy {
  return jest.fn<void, [NetworkLogCode, string]>();
}

/**
 * La lectura inicial del adaptador es asíncrona y la construcción no espera por
 * ella, así que las pruebas vacían las microtareas antes de mirar el estado.
 */
async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

function newConnectivity(
  adapter: FakeAdapter,
  overrides: { now?: () => number; logger?: LoggerSpy } = {},
): Connectivity {
  return createConnectivity({
    network: adapter,
    now: overrides.now ?? (() => NOW_MS),
    logger: overrides.logger === undefined ? undefined : { warn: overrides.logger },
  });
}

describe("createConnectivity", () => {
  it("arranca en línea con `measuredAt` del reloj inyectado, en formato ISO", () => {
    const connectivity = newConnectivity(fakeAdapter());

    const state = connectivity.getNetworkState();

    expect(state.online).toBe(true);
    expect(state.measuredAt).toBe(NOW);
    expect(Number.isNaN(Date.parse(state.measuredAt))).toBe(false);
  });

  it("publica lo que responde el adaptador en la lectura inicial", async () => {
    const connectivity = newConnectivity(
      fakeAdapter({ initial: { online: false } }),
    );

    await flushMicrotasks();

    expect(connectivity.getNetworkState().online).toBe(false);
  });

  it("emite el estado vigente nada más suscribirse", () => {
    const connectivity = newConnectivity(
      fakeAdapter({ initial: { online: false } }),
    );
    const listener = jest.fn<void, [{ online: boolean; measuredAt: string }]>();

    connectivity.subscribeNetwork(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ online: true, measuredAt: NOW });
  });

  it("emite el nuevo estado cuando el adaptador avisa de un cambio", async () => {
    let nowMs = NOW_MS;
    const adapter = fakeAdapter();
    const connectivity = newConnectivity(adapter, { now: () => nowMs });
    await flushMicrotasks();

    const listener = jest.fn<void, [{ online: boolean; measuredAt: string }]>();
    connectivity.subscribeNetwork(listener);

    nowMs += 60_000;
    adapter.emit({ online: false });

    const lastCall = listener.mock.calls[listener.mock.calls.length - 1];
    expect(lastCall?.[0]).toEqual({
      online: false,
      measuredAt: new Date(nowMs).toISOString(),
    });
    expect(connectivity.getNetworkState().online).toBe(false);
  });

  it("deja de emitir cuando se da de baja la suscripción", async () => {
    const adapter = fakeAdapter();
    const connectivity = newConnectivity(adapter);
    const listener = jest.fn<void, [{ online: boolean; measuredAt: string }]>();

    const unsubscribe = connectivity.subscribeNetwork(listener);
    unsubscribe();

    await flushMicrotasks();
    adapter.emit({ online: false });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("entrega copias del estado: tocar lo leído no cambia la instancia", () => {
    const connectivity = newConnectivity(fakeAdapter());

    const state = connectivity.getNetworkState();
    state.online = false;

    expect(connectivity.getNetworkState().online).toBe(true);
  });

  it("si el adaptador falla al leer, arranca en línea y registra el diagnóstico literal", async () => {
    const logger = newLogger();
    const connectivity = newConnectivity(
      fakeAdapter({ readError: new Error("sin módulo nativo") }),
      { logger },
    );

    await flushMicrotasks();

    expect(connectivity.getNetworkState().online).toBe(true);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(
      "NETWORK_STATE_UNAVAILABLE",
      "módulo de red no disponible",
    );
  });

  it("si el adaptador falla al registrar el oyente, lo registra y sigue leyendo", async () => {
    const logger = newLogger();
    const connectivity = newConnectivity(
      fakeAdapter({
        initial: { online: false },
        listenError: new Error("sin oyente"),
      }),
      { logger },
    );

    await flushMicrotasks();

    expect(logger).toHaveBeenCalledWith(
      "NETWORK_STATE_UNAVAILABLE",
      "módulo de red no disponible",
    );
    expect(connectivity.getNetworkState().online).toBe(false);
  });

  it("sin logger la degradación es silenciosa y no altera el arranque en línea", async () => {
    const connectivity = newConnectivity(
      fakeAdapter({ readError: new Error("sin módulo nativo") }),
    );

    await flushMicrotasks();

    expect(connectivity.getNetworkState().online).toBe(true);
  });
});
