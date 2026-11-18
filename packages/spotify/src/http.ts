/**
 * El único cliente HTTP de `@melodify/spotify` (R-08, NFR4.9, NFR4.10).
 *
 * Por qué uno solo y con estas piezas:
 * - **Un único `requestJson`** para autorización y catálogo: dos clientes acabarían
 *   mapeando los fallos distinto —uno trataría el `429` como error y otro como
 *   espera— y las pantallas verían dos comportamientos de la misma red.
 * - **Timeout de 10 s con `AbortController`**: una petición colgada no deja la
 *   pantalla en esqueletos para siempre (NFR4.9).
 * - **Sin reintento automático**: un `429` o un `5xx` se devuelve tal cual; reintentar
 *   solo lo decide la persona con «Reintentar» (BR17.6, BR20.7).
 * - **Hosts fijos y `encodeURIComponent`**: la URL se construye aquí y en el
 *   catálogo, nunca con datos sin codificar.
 * - **Nunca se registra ni se devuelve el body**: puede traer tokens o datos de la
 *   cuenta; el resultado solo lleva la clasificación del fallo (NFR4.10, NFR9.7).
 */
import type { FetchLike } from "./types";

/** El host de la API de datos de Spotify. */
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

/** El host de autorización e intercambio de token. */
export const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";

/** El presupuesto de una petición (NFR4.9). */
export const REQUEST_TIMEOUT_MS = 10_000;

/** Un identificador de obra que Spotify acepta: solo letras y números. */
const WORK_ID_PATTERN = /^[A-Za-z0-9]+$/;

export function isValidWorkId(workId: string): boolean {
  return WORK_ID_PATTERN.test(workId);
}

/** La clasificación de un fallo; el mensaje de Spotify nunca viaja con ella. */
export type HttpFailure =
  | "unauthorized"
  | "notFound"
  | "rateLimited"
  | "timeout"
  | "network"
  | "error";

export interface HttpSuccess<T> {
  ok: true;
  value: T;
}

export interface HttpFailureResult {
  ok: false;
  failure: HttpFailure;
  /** El código HTTP cuando llegó respuesta; ausente si no hubo respuesta. */
  status?: number;
}

export type HttpResult<T> = HttpSuccess<T> | HttpFailureResult;

export interface RequestOptions {
  url: string;
  fetch: FetchLike;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: string;
  /** Para las pruebas: un presupuesto más corto. */
  timeoutMs?: number;
}

function classify(status: number): HttpFailure {
  if (status === 401) {
    return "unauthorized";
  }
  if (status === 404) {
    return "notFound";
  }
  if (status === 429) {
    return "rateLimited";
  }
  return "error";
}

/**
 * Ejecuta una petición y devuelve el JSON ya parseado o la clasificación del fallo.
 * Nunca lanza: un fallo de red o un body ilegible son resultados, no excepciones que
 * una pantalla deba atrapar.
 */
export async function requestJson<T>(
  options: RequestOptions,
): Promise<HttpResult<T>> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Awaited<ReturnType<FetchLike>>;

  try {
    response = await options.fetch(options.url, {
      method: options.method ?? "GET",
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });
  } catch {
    // Un aborto por presupuesto es `timeout`; cualquier otra excepción es red caída.
    return { ok: false, failure: timedOut ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    return {
      ok: false,
      failure: classify(response.status),
      status: response.status,
    };
  }

  try {
    return { ok: true, value: (await response.json()) as T };
  } catch {
    // Un 200 con un body que no es JSON es un defecto del servidor, no un éxito.
    return { ok: false, failure: "error", status: response.status };
  }
}
