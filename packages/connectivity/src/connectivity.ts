/**
 * La conectividad de C6 1.0.0: el estado de red del dispositivo, leído del
 * adaptador de plataforma y difundido por suscripción.
 *
 * Por qué el estado de red no se deduce de los fallos de las peticiones (BR6.1):
 * «sin conexión» y «la petición falló» son cosas distintas, y confundirlas pinta un
 * error de servidor donde solo falta cobertura. Aquí se pregunta al sistema
 * operativo —a través del adaptador— o se devuelve el último estado escuchado; este
 * paquete no abre sockets, no pide nada a Spotify y no guarda datos (BR6.5).
 *
 * Dos degradaciones que son comportamiento y no superficie:
 * - Si el adaptador falta, falla al leer o falla al registrar el oyente, la
 *   instancia **arranca en línea**, no bloquea la app y deja constancia con
 *   `NETWORK_STATE_UNAVAILABLE` (BR6.3, NFR9.4). Un fallo del módulo de red no
 *   puede impedir leer el contenido local.
 * - `measuredAt` sale de un reloj inyectable: las pruebas fijan el instante y no
 *   dependen del reloj de la máquina (NFR5.7).
 */
/**
 * El puerto de diagnóstico que C6 espera. Es la parte de `AppLogger` que este
 * paquete necesita y ninguna más: el paquete no importa el logger de la app, se lo
 * inyecta ella (NFR9.1). La firma cerrada a dos cadenas impide arrastrar datos de
 * la persona a un mensaje (NFR4.6).
 */
export type NetworkLogCode = "NETWORK_STATE_UNAVAILABLE";

export interface NetworkLogger {
  warn(code: NetworkLogCode, message: string): void;
}

/** El estado mínimo que traduce un adaptador: un solo booleano (NFR4.5). */
export interface NetworkAdapterState {
  online: boolean;
}

/**
 * La forma del adaptador de plataforma que C6 recibe en la construcción. El de
 * `expo-network` vive en este mismo paquete; en las pruebas se sustituye por un
 * doble y nunca se toca el sistema operativo.
 */
export interface NetworkAdapter {
  getState(): Promise<NetworkAdapterState>;
  addListener(listener: (state: NetworkAdapterState) => void): () => void;
}

/** Lo que cruza el contrato de C6: el estado vigente y cuándo se midió. */
export interface NetworkView {
  online: boolean;
  measuredAt: string;
}

export interface Connectivity {
  getNetworkState(): NetworkView;
  subscribeNetwork(listener: (state: NetworkView) => void): () => void;
}

export interface CreateConnectivityOptions {
  /** El adaptador de plataforma; no hay valor por defecto que lea el sistema solo. */
  network: NetworkAdapter;
  /** Reloj en milisegundos desde la época; las pruebas lo fijan (NFR5.7). */
  now?: () => number;
  /** El logger de la app; sin él la degradación es silenciosa pero no cambia. */
  logger?: NetworkLogger;
}

/**
 * Mensaje literal del diagnóstico de red (NFR4.6): no nombra el SSID, la IP, el
 * tipo de red ni ningún dato de la persona.
 */
const NETWORK_UNAVAILABLE_MESSAGE = "módulo de red no disponible";

export function createConnectivity(
  options: CreateConnectivityOptions,
): Connectivity {
  const clock = options.now ?? (() => Date.now());
  const stamp = (): string => new Date(clock()).toISOString();
  const listeners = new Set<(state: NetworkView) => void>();

  // Arranca en línea para no pintar un aviso que la persona no puede resolver
  // mientras el adaptador aún no ha respondido (BR6.3).
  let current: NetworkView = { online: true, measuredAt: stamp() };

  const publish = (online: boolean): void => {
    current = { online, measuredAt: stamp() };
    for (const listener of [...listeners]) {
      listener({ ...current });
    }
  };

  const reportUnavailable = (): void => {
    options.logger?.warn("NETWORK_STATE_UNAVAILABLE", NETWORK_UNAVAILABLE_MESSAGE);
  };

  try {
    options.network.addListener((state) => {
      publish(state.online === true);
    });
  } catch {
    // Un adaptador que no deja escuchar sigue sirviendo para la lectura inicial;
    // si tampoco lee, la instancia se queda en línea y ya está.
    reportUnavailable();
  }

  void (async () => {
    try {
      const state = await options.network.getState();
      publish(state.online === true);
    } catch {
      reportUnavailable();
    }
  })();

  return {
    getNetworkState() {
      return { ...current };
    },

    subscribeNetwork(listener) {
      listeners.add(listener);
      // Emisión inmediata: sin ella la pantalla arranca con un estado inventado y
      // el aviso de sin conexión no llega nunca (BR6.2, LC-9).
      listener({ ...current });
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
