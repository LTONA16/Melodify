/**
 * La máquina de estados de la conexión con Spotify (C7 1.0.0, BR16, BR17, NFR3.17–3.20).
 *
 * Qué decide este módulo:
 * - **PKCE S256** con un `state` propio por intento, verificado antes de intercambiar
 *   el código; un `state` distinto termina en `connectionError` sin llamar a
 *   `/api/token` (BR16.4).
 * - **El token vive solo aquí**: se guarda en el almacén seguro, se renueva en
 *   segundo plano 60 s antes de caducar y se borra al desconectar, al fallar la
 *   renovación y al recibir `401` (BR16.5, BR16.6, BR17.9). Ni la URL de retorno ni
 *   el token se registran.
 * - **La hidratación es silenciosa**: al arrancar se lee el token y se renueva si
 *   toca, sin pasar por `connecting`; solo al terminar se emite el estado real. Un
 *   fallo de lectura no borra nada y arranca desconectado (R-09).
 * - **La renovación es single-flight**: dos búsquedas simultáneas con el token a
 *   punto de caducar comparten una sola petición.
 *
 * Lo que este módulo no hace: no conoce C1, C2, C5 ni las pantallas, y no lee el
 * almacén desde ningún otro sitio. El catálogo pide el token por `getAccessToken()`
 * y avisa del `401` con `markInvalid()`.
 */
import { requestJson, SPOTIFY_ACCOUNTS_BASE } from "../http";
import type {
  AuthorizationStateView,
  BrowserAdapter,
  Clock,
  CryptoAdapter,
  FetchLike,
  SecureStoreAdapter,
  SpotifyLogPort,
} from "../types";
import {
  buildAuthorizeUrl,
  createChallenge,
  createState,
  createVerifier,
} from "./pkce";
import {
  clearToken,
  readToken,
  saveToken,
  shouldRefresh,
  type StoredToken,
} from "./token";

export interface SpotifyAuthOptions {
  /** Sin client ID la app arranca en `notConfigured` y el resto sigue funcionando. */
  clientId: string | null;
  redirectUri: string;
  secureStore: SecureStoreAdapter;
  browser: BrowserAdapter;
  crypto: CryptoAdapter;
  fetch: FetchLike;
  clock: Clock;
  log: SpotifyLogPort;
}

export interface SpotifyAuth {
  getState(): AuthorizationStateView;
  subscribe(listener: (state: AuthorizationStateView) => void): () => void;
  connect(): void;
  disconnect(): void;
  /** Reintenta la última operación fallida: conectar, o renovar si ya hay sesión. */
  retry(): void;
  /** El token vigente, renovándolo si toca; `null` si no hay sesión válida. */
  getAccessToken(): Promise<string | null>;
  /** Un `401` del catálogo: borra el token y pasa a `invalidToken`. */
  markInvalid(): void;
  isConnected(): boolean;
  onConnectionChange(listener: (connected: boolean) => void): () => void;
  /** Espera a la hidratación inicial; existe para el arranque y las pruebas. */
  whenReady(): Promise<void>;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.access_token === "string" &&
    candidate.access_token.length > 0 &&
    (candidate.refresh_token === undefined ||
      typeof candidate.refresh_token === "string") &&
    typeof candidate.expires_in === "number" &&
    Number.isFinite(candidate.expires_in) &&
    candidate.expires_in > 0
  );
}

/** El `code` y el `state` que devolvió el navegador, o `null` si no son usables. */
function parseCallback(
  url: string,
): { code: string; state: string } | null {
  const queryIndex = url.indexOf("?");

  if (queryIndex < 0) {
    return null;
  }

  const params = new URLSearchParams(url.slice(queryIndex + 1));
  const code = params.get("code");
  const state = params.get("state");

  if (code === null || code === "" || state === null || state === "") {
    return null;
  }

  return { code, state };
}

export function createSpotifyAuth(options: SpotifyAuthOptions): SpotifyAuth {
  const {
    clientId,
    redirectUri,
    secureStore,
    browser,
    crypto,
    fetch,
    clock,
    log,
  } = options;

  const configured = clientId !== null && clientId.trim() !== "";
  const listeners = new Set<(state: AuthorizationStateView) => void>();

  // Se registra una sola vez para poder pegar el valor exacto en el panel de
  // Spotify; la URL no contiene token ni query de la persona (NFR9.7).
  log.warn(
    "SPOTIFY_REDIRECT_RESOLVED",
    `redirect de Spotify resuelto: ${redirectUri}`,
  );

  let state: AuthorizationStateView = {
    status: configured ? "disconnected" : "notConfigured",
  };
  let hydrated = false;
  let currentToken: StoredToken | null = null;
  let pendingState: string | null = null;
  let refreshing: Promise<string | null> | null = null;

  const emit = (): void => {
    if (!hydrated) {
      return;
    }
    for (const listener of [...listeners]) {
      listener(state);
    }
  };

  const setStatus = (status: AuthorizationStateView["status"]): void => {
    state = { status };
    emit();
  };

  const exchange = async (
    body: URLSearchParams,
  ): Promise<TokenResponse | null> => {
    const result = await requestJson<TokenResponse>({
      url: `${SPOTIFY_ACCOUNTS_BASE}/api/token`,
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      fetch,
    });

    if (!result.ok || !isTokenResponse(result.value)) {
      return null;
    }

    return result.value;
  };

  const toStored = (
    response: TokenResponse,
    previousRefreshToken: string | null,
  ): StoredToken | null => {
    const refreshToken = response.refresh_token ?? previousRefreshToken;

    if (refreshToken === null) {
      return null;
    }

    const obtainedAt = clock.now();

    return {
      accessToken: response.access_token,
      refreshToken,
      expiresAt: obtainedAt + response.expires_in * 1000,
      obtainedAt,
    };
  };

  const persist = async (token: StoredToken): Promise<boolean> => {
    try {
      await saveToken(secureStore, token);
      return true;
    } catch {
      // El token sigue valiendo en memoria: un fallo de guardado no desconecta
      // (R-09). Solo significa que el próximo arranque pedirá conectar otra vez.
      log.warn(
        "SPOTIFY_TOKEN_SAVE_FAILED",
        "no se pudo guardar el token en el almacén seguro",
      );
      return false;
    }
  };

  const discard = async (): Promise<void> => {
    try {
      await clearToken(secureStore);
    } catch {
      log.warn(
        "SPOTIFY_TOKEN_DELETE_FAILED",
        "no se pudo borrar el token del almacén seguro",
      );
    }
  };

  const refreshTokenValue = async (
    token: StoredToken,
  ): Promise<string | null> => {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: clientId ?? "",
    });
    const response = await exchange(body);
    const next = response === null ? null : toStored(response, token.refreshToken);

    if (next === null) {
      log.error(
        "SPOTIFY_REFRESH_FAILED",
        "la renovación del token falló; se borra la sesión",
      );
      currentToken = null;
      await discard();
      setStatus("invalidToken");
      return null;
    }

    currentToken = next;
    await persist(next);
    // Si el guardado falla, la sesión sigue `connected` en memoria (R-09).
    setStatus("connected");
    return next.accessToken;
  };

  const hydrate = async (): Promise<void> => {
    if (!configured) {
      // Sin client ID no hay nada que leer: el estado honesto es `notConfigured`.
      return;
    }

    let stored: StoredToken | null;

    try {
      stored = await readToken(secureStore);
    } catch {
      // Un almacén que falla no es un token inválido: no se borra nada y se
      // arranca desconectado, que es lo que la persona puede resolver (R-09).
      log.warn(
        "SPOTIFY_TOKEN_READ_FAILED",
        "no se pudo leer el token del almacén seguro",
      );
      stored = null;
    }

    if (stored === null) {
      return;
    }

    if (shouldRefresh(stored, clock.now())) {
      // Renovar al arrancar es silencioso: no se pinta `connecting` (BR16.6).
      currentToken = stored;
      await refreshTokenValue(stored);
      return;
    }

    currentToken = stored;
    setStatus("connected");
  };

  const ready: Promise<void> = hydrate().finally(() => {
    hydrated = true;
    emit();
  });

  const connect = (): void => {
    void (async () => {
      if (!configured) {
        setStatus("notConfigured");
        return;
      }

      if (state.status === "connecting") {
        return;
      }

      let verifier: string;
      let challenge: string;
      let antiForgeryState: string;

      try {
        verifier = createVerifier(crypto);
        challenge = await createChallenge(verifier, crypto);
        antiForgeryState = createState(crypto);
      } catch {
        // Sin cripto no se puede armar PKCE: es un fallo de conexión, no un cuelgue.
        setStatus("connectionError");
        return;
      }

      pendingState = antiForgeryState;
      setStatus("connecting");

      let result: Awaited<ReturnType<BrowserAdapter["openAuthSessionAsync"]>>;

      try {
        result = await browser.openAuthSessionAsync(
          buildAuthorizeUrl({
            clientId: clientId ?? "",
            redirectUri,
            codeChallenge: challenge,
            state: antiForgeryState,
          }),
          redirectUri,
        );
      } catch {
        pendingState = null;
        setStatus("connectionError");
        return;
      }

      if (result.type !== "success") {
        // Cancelar o un error del navegador: la persona puede reintentar.
        pendingState = null;
        setStatus("connectionError");
        return;
      }

      const callback = parseCallback(result.url);

      if (
        callback === null ||
        pendingState === null ||
        callback.state !== pendingState
      ) {
        // Un redirect que no es el nuestro no se intercambia nunca (BR16.4).
        pendingState = null;
        setStatus("connectionError");
        return;
      }

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: callback.code,
        redirect_uri: redirectUri,
        client_id: clientId ?? "",
        code_verifier: verifier,
      });
      const response = await exchange(body);
      const token = response === null ? null : toStored(response, null);

      pendingState = null;

      if (token === null) {
        setStatus("connectionError");
        return;
      }

      currentToken = token;
      await persist(token);
      setStatus("connected");
    })();
  };

  const disconnect = (): void => {
    void (async () => {
      currentToken = null;
      await discard();
      setStatus("disconnected");
    })();
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (state.status !== "connected" || currentToken === null) {
      return null;
    }

    if (!shouldRefresh(currentToken, clock.now())) {
      return currentToken.accessToken;
    }

    if (refreshing !== null) {
      return refreshing;
    }

    const token = currentToken;
    refreshing = refreshTokenValue(token).finally(() => {
      refreshing = null;
    });

    return refreshing;
  };

  const markInvalid = (): void => {
    currentToken = null;
    void discard();
    setStatus("invalidToken");
  };

  const retry = (): void => {
    if (
      state.status === "connectionError" ||
      state.status === "notConfigured" ||
      state.status === "invalidToken"
    ) {
      connect();
      return;
    }

    if (state.status === "connected") {
      // Reintentar con sesión vigente solo tiene sentido si el token toca renovarse.
      void getAccessToken();
    }
  };

  const subscribe = (listener: (state: AuthorizationStateView) => void) => {
    listeners.add(listener);
    // La hidratación no emite un estado falso: hasta que termina, quien se
    // suscribe no recibe nada y la interfaz puede pintar carga (R-07).
    if (hydrated) {
      listener(state);
    }
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState: () => state,
    subscribe,
    connect,
    disconnect,
    retry,
    getAccessToken,
    markInvalid,
    isConnected: () => state.status === "connected",
    onConnectionChange(listener) {
      return subscribe((view) => listener(view.status === "connected"));
    },
    whenReady: () => ready,
  };
}
