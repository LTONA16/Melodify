/**
 * La superficie de catálogo de Spotify (C7 1.0.0 sobre C10, BR17, BR20.5).
 *
 * Dos operaciones, un solo cliente HTTP y ningún acceso al almacén:
 * - `search` pide canciones, álbumes y artistas en una sola llamada, los normaliza y
 *   los devuelve en ese orden. Un artista no se convierte en obra: sería inventarle
 *   título y recuento (BR17.3, BR20.6).
 * - `resolve` prueba primero `/tracks/{id}` y solo con `404` prueba `/albums/{id}`.
 *   La obra de ejemplo es una canción, y un álbum buscado tiene que resolver igual
 *   (BR20.5).
 * - Un `401` avisa a la máquina de autorización con `markInvalid()`: el token se
 *   borra una sola vez y el estado pasa a `invalidToken`.
 *
 * Lo que no cruza: ni el token ni el cuerpo de un error salen de aquí. Los fallos se
 * clasifican y se registran sin la consulta ni cabeceras (NFR4.10, NFR9.7).
 */
import type { SpotifyLogPort } from "../types";
import type { HttpFailure, HttpFailureResult } from "../http";
import {
  isValidWorkId,
  requestJson,
  SPOTIFY_API_BASE,
} from "../http";
import type { SpotifyAuth } from "../auth/spotify-auth";

/** Una obra opinable: canción o álbum. La clase viaja para la etiqueta de la fila. */
export interface SpotifyWork {
  workId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  origin: "spotify";
  workKind: "track" | "album";
}

/** Un atajo de búsqueda: no es obra, no abre detalle ni Crear (BR20.6). */
export interface SpotifyArtist {
  artistId: string;
  name: string;
}

export type SpotifyCatalogFailure =
  | "unauthorized"
  | "forbidden"
  | "rateLimited"
  | "timeout"
  | "network"
  | "error";

export interface SpotifySearchResult {
  kind: "ok" | "empty" | "failure";
  works?: SpotifyWork[];
  artists?: SpotifyArtist[];
  failure?: SpotifyCatalogFailure;
}

export interface SpotifyResolveResult {
  kind: "ok" | "failure";
  work?: SpotifyWork;
  failure?: SpotifyCatalogFailure | "notFound";
}

export interface SpotifyCatalog {
  search(query: string): Promise<SpotifySearchResult>;
  resolve(workId: string): Promise<SpotifyResolveResult>;
}

export interface SpotifyCatalogOptions {
  auth: SpotifyAuth;
  fetch?: Parameters<typeof requestJson>[0]["fetch"];
  clock?: () => number;
  log: SpotifyLogPort;
}

interface SpotifyImage {
  url?: unknown;
}

interface SpotifyNamed {
  id?: unknown;
  name?: unknown;
}

interface SpotifyTrack extends SpotifyNamed {
  artists?: SpotifyNamed[];
  album?: { images?: SpotifyImage[] };
}

interface SpotifyAlbum extends SpotifyNamed {
  artists?: SpotifyNamed[];
  images?: SpotifyImage[];
}

interface SpotifySearchResponse {
  tracks?: { items?: SpotifyTrack[] };
  albums?: { items?: SpotifyAlbum[] };
  artists?: { items?: SpotifyNamed[] };
}

interface SpotifyTrackResponse extends SpotifyTrack {
  album?: { images?: SpotifyImage[] };
}

type SpotifyAlbumResponse = SpotifyAlbum;

function firstImageUrl(images: SpotifyImage[] | undefined): string | null {
  const url = images?.[0]?.url;
  return typeof url === "string" && url !== "" ? url : null;
}

function firstArtistName(artists: SpotifyNamed[] | undefined): string {
  const name = artists?.[0]?.name;
  return typeof name === "string" ? name : "";
}

function toTrackWork(track: SpotifyTrack): SpotifyWork | null {
  if (typeof track.id !== "string" || typeof track.name !== "string") {
    return null;
  }

  return {
    workId: track.id,
    title: track.name,
    artist: firstArtistName(track.artists),
    coverUrl: firstImageUrl(track.album?.images),
    origin: "spotify",
    workKind: "track",
  };
}

function toAlbumWork(album: SpotifyAlbum): SpotifyWork | null {
  if (typeof album.id !== "string" || typeof album.name !== "string") {
    return null;
  }

  return {
    workId: album.id,
    title: album.name,
    artist: firstArtistName(album.artists),
    coverUrl: firstImageUrl(album.images),
    origin: "spotify",
    workKind: "album",
  };
}

function toArtist(artist: SpotifyNamed): SpotifyArtist | null {
  if (typeof artist.id !== "string" || typeof artist.name !== "string") {
    return null;
  }

  return { artistId: artist.id, name: artist.name };
}

function classifyFailure(failure: HttpFailure): SpotifyCatalogFailure {
  return failure === "notFound" ? "error" : failure;
}

/**
 * Lo que el registro añade al mensaje: la clase del fallo y el código HTTP cuando
 * hubo respuesta. Nunca la consulta, el token, las cabeceras ni el body (NFR4.10,
 * NFR9.7). Sin el código, un `429` y un `403` se leían igual en el teléfono y no
 * había forma de saber si el problema era la cuota o el acceso de la cuenta.
 */
function describeFailure(result: HttpFailureResult): string {
  return result.status === undefined
    ? result.failure
    : `${result.failure}, HTTP ${result.status}`;
}

export function createSpotifyCatalog(
  options: SpotifyCatalogOptions,
): SpotifyCatalog {
  const { auth, fetch, log } = options;
  const now = options.clock ?? (() => Date.now());

  const authorizedFetch = async (url: string) => {
    const token = await auth.getAccessToken();

    if (token === null) {
      return null;
    }

    return requestJson<unknown>({
      url,
      fetch: fetch ?? (globalThis.fetch as Parameters<typeof requestJson>[0]["fetch"]),
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const search = async (query: string): Promise<SpotifySearchResult> => {
    // `limit` es por tipo y Spotify lo capó en 10 (rango 0–10 en su referencia):
    // con 20 la API responde `400` y la búsqueda entera falla. Tres tipos × 10 son
    // hasta treinta filas, que es lo que la lista pinta sin paginar (OQ2).
    const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=10`;

    if (!auth.isConnected()) {
      return { kind: "failure", failure: "unauthorized" };
    }

    let result: Awaited<ReturnType<typeof authorizedFetch>>;

    try {
      result = await authorizedFetch(url);
    } catch {
      // Un `fetch` que no devuelve promesa válida no puede tumbar la pantalla.
      log.error(
        "SPOTIFY_SEARCH_FAILED",
        "la búsqueda de Spotify no obtuvo respuesta",
      );
      return { kind: "failure", failure: "network" };
    }

    if (result === null) {
      return { kind: "failure", failure: "unauthorized" };
    }

    if (!result.ok) {
      if (result.failure === "unauthorized") {
        auth.markInvalid();
      }

      log.error(
        "SPOTIFY_SEARCH_FAILED",
        `la búsqueda de Spotify falló: ${describeFailure(result)}`,
      );

      return { kind: "failure", failure: classifyFailure(result.failure) };
    }

    const body = result.value as SpotifySearchResponse | null;
    const works: SpotifyWork[] = [
      ...(body?.tracks?.items ?? [])
        .map(toTrackWork)
        .filter((work): work is SpotifyWork => work !== null),
      ...(body?.albums?.items ?? [])
        .map(toAlbumWork)
        .filter((work): work is SpotifyWork => work !== null),
    ];
    const artists = (body?.artists?.items ?? [])
      .map(toArtist)
      .filter((artist): artist is SpotifyArtist => artist !== null);

    if (works.length === 0 && artists.length === 0) {
      return { kind: "empty" };
    }

    return { kind: "ok", works, artists };
  };

  const resolve = async (workId: string): Promise<SpotifyResolveResult> => {
    if (!isValidWorkId(workId)) {
      return { kind: "failure", failure: "notFound" };
    }

    if (!auth.isConnected()) {
      return { kind: "failure", failure: "unauthorized" };
    }

    let track: Awaited<ReturnType<typeof authorizedFetch>>;

    try {
      track = await authorizedFetch(
        `${SPOTIFY_API_BASE}/tracks/${encodeURIComponent(workId)}`,
      );
    } catch {
      // Igual que en `search`: una promesa que no se puede esperar es falta de
      // respuesta, no una excepción que la portada deba atrapar sin registro.
      log.error(
        "SPOTIFY_SEARCH_FAILED",
        "la resolución de Spotify no obtuvo respuesta",
      );
      return { kind: "failure", failure: "network" };
    }

    if (track === null) {
      return { kind: "failure", failure: "unauthorized" };
    }

    if (track.ok) {
      const work = toTrackWork(track.value as SpotifyTrackResponse);

      if (work === null) {
        log.error("SPOTIFY_SEARCH_FAILED", "la obra de Spotify llegó incompleta");
        return { kind: "failure", failure: "error" };
      }

      return { kind: "ok", work };
    }

    if (track.failure !== "notFound") {
      if (track.failure === "unauthorized") {
        auth.markInvalid();
      }
      log.error(
        "SPOTIFY_SEARCH_FAILED",
        `la resolución de Spotify falló: ${describeFailure(track)}`,
      );
      return { kind: "failure", failure: classifyFailure(track.failure) };
    }

    let album: Awaited<ReturnType<typeof authorizedFetch>>;

    try {
      album = await authorizedFetch(
        `${SPOTIFY_API_BASE}/albums/${encodeURIComponent(workId)}`,
      );
    } catch {
      log.error(
        "SPOTIFY_SEARCH_FAILED",
        "la resolución del álbum de Spotify no obtuvo respuesta",
      );
      return { kind: "failure", failure: "network" };
    }

    if (album === null) {
      return { kind: "failure", failure: "unauthorized" };
    }

    if (album.ok) {
      const work = toAlbumWork(album.value as SpotifyAlbumResponse);

      if (work === null) {
        log.error("SPOTIFY_SEARCH_FAILED", "el álbum de Spotify llegó incompleto");
        return { kind: "failure", failure: "error" };
      }

      return { kind: "ok", work };
    }

    if (album.failure === "unauthorized") {
      auth.markInvalid();
    }

    log.error(
      "SPOTIFY_SEARCH_FAILED",
      `la resolución del álbum de Spotify falló: ${describeFailure(album)}`,
    );

    if (album.failure === "notFound") {
      return { kind: "failure", failure: "notFound" };
    }

    return { kind: "failure", failure: classifyFailure(album.failure) };
  };

  // `clock` no interviene en las peticiones: la antigüedad la decide `auth`. Se
  // mantiene en las opciones para que el punto de composición comparta el reloj.
  void now;

  return { search, resolve };
}
