/**
 * La superficie pública de `@melodify/spotify`.
 *
 * `AuthorizationStateView` es lo que consume la cáscara; `SpotifyConnectionStatus`
 * pertenece a C1 y aquí solo se importa como tipo, nunca se declara ni se reexporta.
 */
export type {
  AuthorizationStateView,
  FetchLike,
  SpotifyLogCode,
  SpotifyLogPort,
} from "./types";
export {
  isValidWorkId,
  REQUEST_TIMEOUT_MS,
  SPOTIFY_ACCOUNTS_BASE,
  SPOTIFY_API_BASE,
} from "./http";
export type { HttpFailure, HttpResult } from "./http";
