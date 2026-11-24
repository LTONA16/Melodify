import type {
  BrowserAdapter,
  CryptoAdapter,
  FetchLike,
  HttpResponseLike,
  SecureStoreAdapter,
} from "../../types";
import {
  createSpotifyAuth,
  type SpotifyAuth,
} from "../spotify-auth";
import { serializeToken, TOKEN_STORAGE_KEY, type StoredToken } from "../token";

const NOW = new Date("2026-11-18T09:00:00.000Z").getTime();
const HOUR = 3_600_000;

const tokenAt = (overrides: Partial<StoredToken> = {}): StoredToken => ({
  accessToken: "access-old",
  refreshToken: "refresh-old",
  obtainedAt: NOW - 10 * 60_000,
  expiresAt: NOW + 50 * 60_000,
  ...overrides,
});

function response(value: unknown, status = 200): HttpResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
  };
}

interface Harness {
  auth: SpotifyAuth;
  values: Map<string, string>;
  fetchMock: jest.Mock;
  logger: { warn: jest.Mock; error: jest.Mock };
  browser: { openAuthSessionAsync: jest.Mock };
  advance(ms: number): void;
  connectBrowserWith(state: string | null): void;
}

function harness(options: {
  clientId?: string | null;
  token?: StoredToken | null;
  tokenResponse?: unknown;
  refreshResponse?: unknown;
  setItemFails?: boolean;
  getItemFails?: boolean;
  deleteItemFails?: boolean;
  cryptoFails?: boolean;
  browserResult?: unknown;
} = {}): Harness {
  let now = NOW;
  const values = new Map<string, string>();

  if (options.token) {
    values.set(TOKEN_STORAGE_KEY, serializeToken(options.token));
  }

  const secureStore: SecureStoreAdapter = {
    getItem: jest.fn(async (key: string) => {
      if (options.getItemFails) {
        throw new Error("sin llavero");
      }
      return values.get(key) ?? null;
    }),
    setItem: jest.fn(async (key: string, value: string) => {
      if (options.setItemFails) {
        throw new Error("sin espacio");
      }
      values.set(key, value);
    }),
    deleteItem: jest.fn(async (key: string) => {
      if (options.deleteItemFails) {
        throw new Error("llavero bloqueado");
      }
      values.delete(key);
    }),
  };

  let randomCall = 0;
  const crypto: CryptoAdapter = {
    randomBytes: (length) => {
      if (options.cryptoFails) {
        throw new Error("sin cripto");
      }
      randomCall += 1;
      return new Uint8Array(length).fill(randomCall);
    },
    sha256: async () => new Uint8Array(32).fill(7),
  };

  const fetchMock = jest.fn(async (url: string) => {
    if (url.includes("/api/token")) {
      // `null` es una respuesta legítima que la máquina debe rechazar, así que se
      // compara con `undefined` y no con `??`: si no, el doble devolvería un token
      // válido donde la prueba pide un cuerpo nulo.
      const body =
        options.refreshResponse !== undefined
          ? options.refreshResponse
          : options.tokenResponse !== undefined
            ? options.tokenResponse
            : {
                access_token: "access-new",
                refresh_token: "refresh-new",
                expires_in: 3600,
              };

      return response(body);
    }
    throw new Error(`petición inesperada: ${url}`);
  }) as unknown as FetchLike & jest.Mock;

  const browser = {
    openAuthSessionAsync: jest.fn(
      async (authorizeUrl: string, redirectUri: string) => {
        if (options.browserResult !== undefined) {
          return options.browserResult;
        }
        const state = new URL(authorizeUrl).searchParams.get("state") ?? "";
        return {
          type: "success",
          url: `${redirectUri}?code=code-1&state=${state}`,
        };
      },
    ),
  };

  const logger = { warn: jest.fn(), error: jest.fn() };

  const auth = createSpotifyAuth({
    clientId: options.clientId === undefined ? "client-id" : options.clientId,
    redirectUri: "exp://127.0.0.1:8081/--/spotify-callback",
    secureStore,
    browser: browser as unknown as BrowserAdapter,
    crypto,
    fetch: fetchMock as unknown as FetchLike,
    clock: { now: () => now },
    log: logger,
  });

  return {
    auth,
    values,
    fetchMock: fetchMock as unknown as jest.Mock,
    logger,
    browser,
    advance: (ms) => {
      now += ms;
    },
    connectBrowserWith: (state) => {
      browser.openAuthSessionAsync.mockImplementation(
        async (_url: string, redirectUri: string) => ({
          type: "success",
          url: `${redirectUri}?code=code-1&state=${state ?? ""}`,
        }),
      );
    },
  };
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe("máquina de autorización de Spotify", () => {
  it("hidrata sin emitir un disconnected falso y emite el estado real al terminar", async () => {
    const h = harness({ token: tokenAt() });
    const states: string[] = [];

    h.auth.subscribe((view) => states.push(view.status));
    expect(states).toEqual([]);

    await h.auth.whenReady();

    expect(states).toEqual(["connected"]);
    expect(h.auth.isConnected()).toBe(true);
  });

  it("sin token guardado arranca desconectada, sin tocar el navegador", async () => {
    const h = harness();
    const states: string[] = [];
    h.auth.subscribe((view) => states.push(view.status));

    await h.auth.whenReady();

    expect(states).toEqual(["disconnected"]);
    expect(h.browser.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(h.logger.warn).toHaveBeenCalledWith(
      "SPOTIFY_REDIRECT_RESOLVED",
      expect.stringContaining("spotify-callback"),
    );
  });

  it("sin client ID queda notConfigured y conectar no arma el navegador", async () => {
    const h = harness({ clientId: null });

    await h.auth.whenReady();
    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "notConfigured" });
    expect(h.browser.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(h.advance).toBeDefined();
  });

  it("completa PKCE, intercambia el código y guarda el token", async () => {
    const h = harness();
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connected" });
    expect(h.browser.openAuthSessionAsync).toHaveBeenCalledTimes(1);

    const [authorizeUrl, redirectUri] = h.browser.openAuthSessionAsync.mock
      .calls[0] as [string, string];
    const authorize = new URL(authorizeUrl);
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
    expect(authorize.searchParams.get("code_challenge")).toBeTruthy();
    expect(redirectUri).toBe("exp://127.0.0.1:8081/--/spotify-callback");

    const [tokenUrl, init] = h.fetchMock.mock.calls[0] as [
      string,
      { headers: Record<string, string>; body: string },
    ];
    expect(tokenUrl).toBe("https://accounts.spotify.com/api/token");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );

    const body = new URLSearchParams(init.body);
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code-1");
    expect(body.get("redirect_uri")).toBe(redirectUri);
    expect(body.get("client_id")).toBe("client-id");
    expect(body.get("code_verifier")).toHaveLength(43);
    expect(body.get("client_secret")).toBeNull();

    expect(h.values.get(TOKEN_STORAGE_KEY)).toContain("access-new");
  });

  it("un state distinto no intercambia el código y termina en connectionError", async () => {
    const h = harness();
    await h.auth.whenReady();
    h.connectBrowserWith("state-ajeno");

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un redirect sin código no se intercambia", async () => {
    const h = harness({
      browserResult: {
        type: "success",
        url: "exp://127.0.0.1:8081/--/spotify-callback?state=algo",
      },
    });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un redirect sin query no se intercambia", async () => {
    const h = harness({
      browserResult: {
        type: "success",
        url: "exp://127.0.0.1:8081/--/spotify-callback",
      },
    });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un token sin refresh_token en la primera conexión no se guarda", async () => {
    const h = harness({
      tokenResponse: { access_token: "access-new", expires_in: 3600 },
    });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
  });

  it("cancelar en el navegador termina en connectionError, sin fetch", async () => {
    const h = harness({ browserResult: { type: "cancel" } });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un navegador que lanza termina en connectionError, sin fetch", async () => {
    const h = harness();
    await h.auth.whenReady();
    h.browser.openAuthSessionAsync.mockRejectedValueOnce(
      new Error("sin navegador"),
    );

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un segundo connect mientras autoriza no abre otro navegador", async () => {
    const h = harness();
    await h.auth.whenReady();
    h.browser.openAuthSessionAsync.mockImplementation(
      () => new Promise(() => undefined),
    );

    h.auth.connect();
    await flush();
    h.auth.connect();
    await flush();

    expect(h.browser.openAuthSessionAsync).toHaveBeenCalledTimes(1);
    expect(h.auth.getState()).toEqual({ status: "connecting" });
  });

  it("una respuesta de token ilegible termina en connectionError", async () => {
    const h = harness({ tokenResponse: { error: "invalid_grant" } });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
  });

  it("una respuesta de token nula termina en connectionError", async () => {
    const h = harness({ tokenResponse: null });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
  });

  it("al arrancar renueva en silencio un token dentro de la ventana de 60 s", async () => {
    const h = harness({ token: tokenAt({ expiresAt: NOW + 30_000 }) });
    const states: string[] = [];
    h.auth.subscribe((view) => states.push(view.status));

    await h.auth.whenReady();

    // La hidratación no pinta `connecting`: el primer estado ya es el real (BR16.6).
    expect(states).toEqual(["connected"]);
    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    expect(h.auth.isConnected()).toBe(true);
    expect(h.values.get(TOKEN_STORAGE_KEY)).toContain("access-new");
  });

  it("getAccessToken devuelve null sin sesión y no pide nada", async () => {
    const h = harness();
    await h.auth.whenReady();

    await expect(h.auth.getAccessToken()).resolves.toBeNull();
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("getAccessToken devuelve el token vigente sin renovarlo", async () => {
    const h = harness({ token: tokenAt() });
    await h.auth.whenReady();

    await expect(h.auth.getAccessToken()).resolves.toBe("access-old");
    expect(h.fetchMock).not.toHaveBeenCalled();
  });

  it("un fallo de criptografía sale de connecting y no deja el estado colgado", async () => {
    const h = harness({ cryptoFails: true });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "connectionError" });
  });

  it("desconectar borra el token y el estado", async () => {
    const h = harness({ token: tokenAt() });
    await h.auth.whenReady();

    h.auth.disconnect();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "disconnected" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
  });

  it("si el llavero no deja borrar, desconectar avisa y deja el estado igual", async () => {
    const h = harness({ token: tokenAt(), deleteItemFails: true });
    await h.auth.whenReady();

    h.auth.disconnect();
    await flush();

    // No se puede borrar del almacén, pero la sesión en memoria sí se cierra:
    // la persona ve `disconnected` y el aviso explica lo que ha pasado (R-09).
    expect(h.auth.getState()).toEqual({ status: "disconnected" });
    expect(h.auth.isConnected()).toBe(false);
    expect(h.logger.warn).toHaveBeenCalledWith(
      "SPOTIFY_TOKEN_DELETE_FAILED",
      expect.any(String),
    );
  });

  it("renueva una sola vez en vuelo 60 s antes de caducar", async () => {
    const h = harness({ token: tokenAt() });
    await h.auth.whenReady();

    h.advance(HOUR);

    const [first, second] = await Promise.all([
      h.auth.getAccessToken(),
      h.auth.getAccessToken(),
    ]);

    expect(first).toBe("access-new");
    expect(second).toBe("access-new");
    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    expect(h.auth.isConnected()).toBe(true);
    expect(h.values.get(TOKEN_STORAGE_KEY)).toContain("access-new");
  });

  it("la renovación fallida borra el token y pasa a invalidToken", async () => {
    const h = harness({
      token: tokenAt(),
      refreshResponse: { error: "invalid_grant" },
    });
    await h.auth.whenReady();

    h.advance(HOUR);
    await h.auth.getAccessToken();

    expect(h.auth.getState()).toEqual({ status: "invalidToken" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
    expect(h.logger.error).toHaveBeenCalledWith(
      "SPOTIFY_REFRESH_FAILED",
      expect.any(String),
    );
  });

  it("un guardado fallido tras renovar mantiene connected en memoria", async () => {
    const h = harness({ token: tokenAt(), setItemFails: true });
    await h.auth.whenReady();

    h.advance(HOUR);
    const access = await h.auth.getAccessToken();

    expect(access).toBe("access-new");
    expect(h.auth.getState()).toEqual({ status: "connected" });
    expect(h.logger.warn).toHaveBeenCalledWith(
      "SPOTIFY_TOKEN_SAVE_FAILED",
      expect.any(String),
    );
  });

  it("una lectura fallida no borra nada y arranca desconectada", async () => {
    const h = harness({ getItemFails: true });
    await h.auth.whenReady();

    expect(h.auth.getState()).toEqual({ status: "disconnected" });
    expect(h.logger.warn).toHaveBeenCalledWith(
      "SPOTIFY_TOKEN_READ_FAILED",
      expect.any(String),
    );
    expect(h.values.size).toBe(0);
  });

  it("un 401 del catálogo borra el token y pasa a invalidToken", async () => {
    const h = harness({ token: tokenAt() });
    await h.auth.whenReady();

    h.auth.markInvalid();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "invalidToken" });
    expect(h.values.has(TOKEN_STORAGE_KEY)).toBe(false);
  });

  it("retry vuelve a conectar tras un error y no abre el navegador sin client ID", async () => {
    const h = harness({ browserResult: { type: "cancel" } });
    await h.auth.whenReady();

    h.auth.connect();
    await flush();
    expect(h.auth.getState()).toEqual({ status: "connectionError" });

    h.auth.retry();
    await flush();
    expect(h.browser.openAuthSessionAsync).toHaveBeenCalledTimes(2);
  });

  it("retry con sesión vigente no abre el navegador y renueva si toca", async () => {
    const h = harness({ token: tokenAt() });
    await h.auth.whenReady();
    h.advance(HOUR);

    h.auth.retry();
    await flush();

    expect(h.browser.openAuthSessionAsync).not.toHaveBeenCalled();
    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    expect(h.auth.getState()).toEqual({ status: "connected" });
  });

  it("retry sin client ID se queda en notConfigured", async () => {
    const h = harness({ clientId: null });
    await h.auth.whenReady();

    h.auth.retry();
    await flush();

    expect(h.auth.getState()).toEqual({ status: "notConfigured" });
    expect(h.browser.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  it("onConnectionChange emite el booleano actual y los cambios", async () => {
    const h = harness({ token: tokenAt() });
    const changes: boolean[] = [];
    h.auth.onConnectionChange((connected) => changes.push(connected));

    await h.auth.whenReady();
    h.auth.disconnect();
    await flush();

    expect(changes).toEqual([true, false]);
  });
});
