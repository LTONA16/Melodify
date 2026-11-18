/**
 * El modelo del token de Spotify y su persistencia (NFR3.17, NFR3.18).
 *
 * Por qué el token tiene cuatro campos y no solo el `access_token`: la renovación
 * silenciosa (BR16.6) necesita saber cuándo caduca (`expiresAt`) y desde cuándo es
 * válido (`obtainedAt`), y el `refresh_token` es lo único que permite renovar sin
 * volver a abrir el navegador. Nada de eso sale de `@melodify/spotify/auth`.
 *
 * Decisiones:
 * - **La clave es literal** (`melodify.spotify.token`): una clave derivada del
 *   nombre de la app cambiaría al renombrarla y dejaría huérfano el token.
 * - **La validación es estricta**: un JSON con campos que faltan, tipos distintos o
 *   una caducidad anterior a la obtención se descarta entero. Un token a medias
 *   haría fallar la primera búsqueda en vez de arrancar desconectado.
 * - **La renovación se adelanta 60 s**: pedir el token justo al caducar deja la
 *   primera petición sin red por una carrera de milisegundos.
 */
import type { SecureStoreAdapter } from "../types";

/** La clave exacta en el almacén seguro (NFR3.18). */
export const TOKEN_STORAGE_KEY = "melodify.spotify.token";

/** Cuánto antes de caducar se renueva el token (BR16.6). */
export const REFRESH_AHEAD_MS = 60_000;

/** La forma persistida del token: cuatro campos, ni uno más. */
export interface StoredToken {
  accessToken: string;
  refreshToken: string;
  /** Epoch en milisegundos en que el token deja de valer. */
  expiresAt: number;
  /** Epoch en milisegundos en que se obtuvo. */
  obtainedAt: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Serializa el token para el almacén. No incluye nada más que los cuatro campos. */
export function serializeToken(token: StoredToken): string {
  return JSON.stringify({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: token.expiresAt,
    obtainedAt: token.obtainedAt,
  });
}

/**
 * Lee y valida un token persistido. Devuelve `null` para ausente, JSON inválido o
 * forma incompleta: los tres casos son «sin token», no un error que deba propagarse.
 */
export function parseToken(raw: string | null): StoredToken | null {
  if (raw === null || raw.trim() === "") {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const candidate = parsed as Record<string, unknown>;

  if (
    !isNonEmptyString(candidate.accessToken) ||
    !isNonEmptyString(candidate.refreshToken) ||
    !isFiniteNumber(candidate.expiresAt) ||
    !isFiniteNumber(candidate.obtainedAt) ||
    candidate.expiresAt <= candidate.obtainedAt
  ) {
    return null;
  }

  return {
    accessToken: candidate.accessToken,
    refreshToken: candidate.refreshToken,
    expiresAt: candidate.expiresAt,
    obtainedAt: candidate.obtainedAt,
  };
}

/** Si toca renovar: el token caduca dentro de los próximos 60 s o ya caducó. */
export function shouldRefresh(token: StoredToken, now: number): boolean {
  return now >= token.expiresAt - REFRESH_AHEAD_MS;
}

/** Lee el token del almacén. Un fallo del almacén se propaga para registrarlo. */
export async function readToken(
  store: SecureStoreAdapter,
): Promise<StoredToken | null> {
  return parseToken(await store.getItem(TOKEN_STORAGE_KEY));
}

/** Guarda el token. Un fallo del almacén se propaga para registrarlo. */
export async function saveToken(
  store: SecureStoreAdapter,
  token: StoredToken,
): Promise<void> {
  await store.setItem(TOKEN_STORAGE_KEY, serializeToken(token));
}

/** Borra el token. Un fallo del almacén se propaga para registrarlo. */
export async function clearToken(store: SecureStoreAdapter): Promise<void> {
  await store.deleteItem(TOKEN_STORAGE_KEY);
}
