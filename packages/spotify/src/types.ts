/**
 * Los tipos compartidos de `@melodify/spotify` (C7 1.0.0).
 *
 * Qué vive aquí y qué no:
 * - **Los puertos de dispositivo** —almacén seguro, navegador, cripto, reloj y
 *   `fetch`— son interfaces propias del paquete para que ninguna prueba toque un
 *   módulo nativo ni la red: `auth/device.ts` es el único archivo que los implementa
 *   con Expo (NFR3.17, TS-31).
 * - **El estado de conexión no se declara aquí.** `SpotifyConnectionStatus` es
 *   propiedad de C1 (`@melodify/design-system`) y este paquete lo importa solo como
 *   tipo, sin redeclararlo ni exportarlo (frontend-components.md § `@melodify/spotify`).
 * - **El token no se expone**: su forma persistida vive en `auth/token.ts`, que no
 *   forma parte de la superficie pública.
 */
import type { SpotifyConnectionStatus } from "@melodify/design-system";

/** Lo que `getState()` devuelve: el estado vigente de la conexión. */
export interface AuthorizationStateView {
  status: SpotifyConnectionStatus;
}

/**
 * Los seis códigos de diagnóstico de Spotify (NFR9.7). Son los únicos valores que
 * el paquete escribe en el logger del proyecto: nunca llevan token, código, `state`,
 * verifier, URL de retorno ni texto de búsqueda.
 */
export type SpotifyLogCode =
  | "SPOTIFY_REDIRECT_RESOLVED"
  | "SPOTIFY_TOKEN_READ_FAILED"
  | "SPOTIFY_TOKEN_SAVE_FAILED"
  | "SPOTIFY_TOKEN_DELETE_FAILED"
  | "SPOTIFY_REFRESH_FAILED"
  | "SPOTIFY_SEARCH_FAILED";

/**
 * El logger que el paquete exige inyectar. No hay logger por defecto: si falta, el
 * paquete no se construye (plan paso 3). `warn` es para lo previsto y recuperable
 * —una lectura de token que falla y arranca desconectado— y `error` para el defecto
 * que la persona no puede resolver sola.
 */
export interface SpotifyLogPort {
  warn(code: SpotifyLogCode, message: string): void;
  error(code: SpotifyLogCode, message: string): void;
}

/** El almacén seguro del dispositivo, reducido a lo que el token necesita. */
export interface SecureStoreAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

/** Lo que devuelve abrir el navegador del sistema. La URL nunca se registra. */
export type BrowserAuthResult =
  | { type: "success"; url: string }
  | { type: "cancel" }
  | { type: "error"; message?: string };

export interface BrowserAdapter {
  openAuthSessionAsync(
    url: string,
    redirectUri: string,
  ): Promise<BrowserAuthResult>;
}

/**
 * La criptografía que PKCE necesita: bytes aleatorios y SHA-256. El adaptador de
 * dispositivo usa `expo-crypto`; las pruebas pasan valores deterministas.
 */
export interface CryptoAdapter {
  randomBytes(length: number): Uint8Array;
  sha256(text: string): Promise<Uint8Array>;
}

/** Reloj inyectable: epoch en milisegundos. Ninguna prueba usa `Date.now()` real. */
export interface Clock {
  now(): number;
}

/** La respuesta mínima de `fetch` que el paquete consume. */
export interface HttpResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/** `fetch` inyectable: ninguna prueba sale a la red (TS-32). */
export type FetchLike = (
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<HttpResponseLike>;
