import {
  createAppSession,
  type SessionLogger,
  type SessionView,
} from "../app-session";
import type { SecureStorePort } from "../secure-store-adapter";
import { SESSION_STORAGE_KEY } from "../storage-keys";

/**
 * Doble del almacenamiento en memoria: las pruebas de la sesión nunca tocan el
 * módulo nativo (TS-10). Lleva las claves escritas a la vista para poder afirmar
 * que solo se toca la de la sesión.
 */
function createMemoryStore(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));

  const store = {
    values,
    getItemAsync: jest.fn(async (key: string) => values.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      values.delete(key);
    }),
  } satisfies SecureStorePort & { values: Map<string, string> };

  return store;
}

function createLogger(): jest.Mocked<SessionLogger> {
  return { warn: jest.fn(), error: jest.fn() };
}

const VALID_RECORD = {
  authorId: "demo",
  startedAt: "2026-11-11T08:00:00.000Z",
};

const OTHER_KEY = "melodify.spotify.token";

function seedValidSession() {
  return createMemoryStore({
    [SESSION_STORAGE_KEY]: JSON.stringify(VALID_RECORD),
    [OTHER_KEY]: "token-de-otra-parte",
  });
}

describe("getSession", () => {
  it("devuelve 200 y la sesión iniciada cuando hay un registro válido", async () => {
    const session = createAppSession({ store: seedValidSession() });

    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedIn", authorId: "demo", remembered: true },
    });
  });

  it("devuelve 200 y la sesión cerrada cuando no hay nada guardado", async () => {
    const session = createAppSession({ store: createMemoryStore() });

    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
  });

  it("trata la cadena vacía como «no hay sesión»", async () => {
    const session = createAppSession({
      store: createMemoryStore({ [SESSION_STORAGE_KEY]: "" }),
    });

    const result = await session.getSession();

    expect(result).toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
  });

  it("devuelve 200 y la sesión cerrada con un registro inválido, y lo registra", async () => {
    const store = createMemoryStore({
      [SESSION_STORAGE_KEY]: '{"authorId":"ana"}',
    });
    const logger = createLogger();
    const session = createAppSession({ store, logger });

    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "SESSION_RECORD_INVALID",
      expect.any(String),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("borra el registro inválido para no volver a tropezar con él", async () => {
    const store = createMemoryStore({
      [SESSION_STORAGE_KEY]: "demo",
      [OTHER_KEY]: "token-de-otra-parte",
    });
    const session = createAppSession({ store });

    await session.getSession();

    expect(store.deleteItemAsync).toHaveBeenCalledTimes(1);
    expect(store.deleteItemAsync).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(store.values.get(OTHER_KEY)).toBe("token-de-otra-parte");
  });

  it("registra el fallo de borrado del registro inválido y responde 200 igualmente", async () => {
    const store = createMemoryStore({ [SESSION_STORAGE_KEY]: "demo" });
    store.deleteItemAsync.mockRejectedValue(new Error("keystore bloqueado"));
    const logger = createLogger();
    const session = createAppSession({ store, logger });

    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "SESSION_DELETE_FAILED",
      expect.any(String),
    );
  });

  it("devuelve 503 y lo registra cuando la lectura del almacenamiento falla", async () => {
    const store = createMemoryStore();
    store.getItemAsync.mockRejectedValue(new Error("keystore bloqueado"));
    const logger = createLogger();
    const session = createAppSession({ store, logger });

    await expect(session.getSession()).resolves.toEqual({ code: 503 });
    expect(logger.warn).toHaveBeenCalledWith(
      "SESSION_READ_FAILED",
      expect.any(String),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe("signIn", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-11T08:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("entra con las credenciales demo y responde 200", async () => {
    const store = createMemoryStore();
    const session = createAppSession({ store });

    await expect(
      session.signIn({ handle: "demo", password: "demo" }),
    ).resolves.toEqual({
      code: 200,
      session: { status: "signedIn", authorId: "demo", remembered: true },
    });
  });

  it("guarda el registro con la fecha del momento en la clave de la sesión", async () => {
    const store = createMemoryStore();
    const session = createAppSession({ store });

    await session.signIn({ handle: "demo", password: "demo" });

    expect(store.setItemAsync).toHaveBeenCalledTimes(1);
    expect(store.setItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      JSON.stringify(VALID_RECORD),
    );
  });

  it("no guarda la contraseña en el registro", async () => {
    const store = createMemoryStore();
    const session = createAppSession({ store });

    await session.signIn({ handle: "demo", password: "demo" });

    const call = store.setItemAsync.mock.calls[0];
    expect(call).toBeDefined();
    const written = call?.[1] ?? "";
    expect(Object.keys(JSON.parse(written))).toEqual([
      "authorId",
      "startedAt",
    ]);
    expect(written).not.toContain("password");
  });

  it("recorta los espacios de las credenciales antes de compararlas", async () => {
    const session = createAppSession({ store: createMemoryStore() });

    await expect(
      session.signIn({ handle: "  demo  ", password: " demo " }),
    ).resolves.toMatchObject({ code: 200 });
  });

  it("responde 401 y no escribe nada con credenciales distintas", async () => {
    const store = createMemoryStore();
    const session = createAppSession({ store });

    await expect(
      session.signIn({ handle: "ana", password: "demo" }),
    ).resolves.toEqual({ code: 401 });
    await expect(
      session.signIn({ handle: "demo", password: "otra" }),
    ).resolves.toEqual({ code: 401 });
    expect(store.setItemAsync).not.toHaveBeenCalled();
  });

  it("devuelve 503, no entra y lo registra si el guardado falla", async () => {
    const store = createMemoryStore();
    store.setItemAsync.mockRejectedValue(new Error("sin espacio"));
    const logger = createLogger();
    const session = createAppSession({ store, logger });

    await expect(
      session.signIn({ handle: "demo", password: "demo" }),
    ).resolves.toEqual({ code: 503 });
    expect(logger.error).toHaveBeenCalledWith(
      "SESSION_SAVE_FAILED",
      expect.any(String),
    );
    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
  });
});

describe("signOut", () => {
  it("responde 204 y borra la clave de la sesión", async () => {
    const store = seedValidSession();
    const session = createAppSession({ store });

    await expect(session.signOut()).resolves.toEqual({ code: 204 });

    expect(store.deleteItemAsync).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(store.values.has(SESSION_STORAGE_KEY)).toBe(false);
  });

  it("no toca ninguna otra clave del almacenamiento", async () => {
    const store = seedValidSession();
    const session = createAppSession({ store });

    await session.signOut();

    expect(store.deleteItemAsync).toHaveBeenCalledTimes(1);
    expect(store.values.get(OTHER_KEY)).toBe("token-de-otra-parte");
  });

  it("responde 204 y lo registra cuando el borrado falla", async () => {
    const store = seedValidSession();
    store.deleteItemAsync.mockRejectedValue(new Error("keystore bloqueado"));
    const logger = createLogger();
    const session = createAppSession({ store, logger });

    await expect(session.signOut()).resolves.toEqual({ code: 204 });
    expect(logger.error).toHaveBeenCalledWith(
      "SESSION_DELETE_FAILED",
      expect.any(String),
    );
  });
});

describe("subscribeSession", () => {
  it("emite el valor actual al suscribirse", async () => {
    const session = createAppSession({ store: seedValidSession() });
    await session.getSession();

    const listener = jest.fn();
    session.subscribeSession(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({
      status: "signedIn",
      authorId: "demo",
      remembered: true,
    } satisfies SessionView);
  });

  it("emite tras cada cambio de sesión", async () => {
    const session = createAppSession({ store: createMemoryStore() });
    await session.getSession();

    const listener = jest.fn();
    session.subscribeSession(listener);
    listener.mockClear();

    await session.signIn({ handle: "demo", password: "demo" });
    await session.signOut();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0][0]).toMatchObject({ status: "signedIn" });
    expect(listener.mock.calls[1][0]).toMatchObject({ status: "signedOut" });
  });

  it("deja de emitir cuando se da de baja la suscripción", async () => {
    const session = createAppSession({ store: createMemoryStore() });
    await session.getSession();

    const listener = jest.fn();
    const unsubscribe = session.subscribeSession(listener);
    listener.mockClear();

    unsubscribe();
    await session.signIn({ handle: "demo", password: "demo" });

    expect(listener).not.toHaveBeenCalled();
  });

  it("emite en cuanto la primera lectura resuelve, si se suscribe antes", async () => {
    const session = createAppSession({ store: createMemoryStore() });
    const listener = jest.fn();

    session.subscribeSession(listener);

    // La lectura arranca al suscribirse; una vuelta del bucle de eventos deja que
    // resuelva y publique.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ status: "signedOut" }),
    );
  });
});
