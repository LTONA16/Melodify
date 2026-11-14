/**
 * La forma de una obra y los tres puertos de Spotify de C5 (§ `x-ports`).
 *
 * Por qué este archivo existe en el catálogo y no en el punto de composición: los
 * tipos viven donde vive el consumidor. `app/src/bootstrap/ports.ts` los importa
 * con `import type` (TS-21), así que no hay dos declaraciones del mismo tipo que
 * puedan discrepar y no se crea ninguna arista de ejecución hacia Spotify (NFR3.11).
 *
 * `WorkView` se declara aquí porque es lo que cruza los resultados de los puertos;
 * las obras de ejemplo de `sample.ts` lo consumen como dato.
 */

/** La vista de obra de C5: identificador real de Spotify, título, artista y portada. */
export interface WorkView {
  workId: string;
  title: string;
  artist: string;
  /**
   * La portada que resolvió Spotify, o `null` mientras no haya ninguna. Las obras
   * de ejemplo nacen en `null`: en U2 no hay sesión y todas se pintan como bloque
   * con la inicial (BR5.3).
   */
  coverUrl: string | null;
  /** De dónde entró la obra: catálogo de ejemplo o búsqueda en Spotify. */
  origin: "sample" | "spotify";
}

export type SearchPortFailure =
  | "unauthorized"
  | "rateLimited"
  | "timeout"
  | "network"
  | "error";

export type ResolvePortFailure = SearchPortFailure | "notFound";

/** Resultado de una búsqueda; el catálogo normaliza `failure` a `offline` o `error`. */
export interface SearchPortResult {
  kind: "ok" | "empty" | "failure";
  works?: WorkView[];
  failure?: SearchPortFailure;
}

/** Resultado de resolver una obra ya conocida; es lo que trae su portada real. */
export interface ResolvePortResult {
  kind: "ok" | "failure";
  work?: WorkView;
  failure?: ResolvePortFailure;
}

/** Si hay sesión de Spotify, sin que el catálogo conozca el paquete ni su token. */
export interface SpotifySessionPort {
  isConnected(): boolean;
  onConnectionChange(listener: (connected: boolean) => void): () => void;
}

/** Búsqueda de obras; el catálogo nunca propaga el error de Spotify. */
export interface SpotifySearchPort {
  search(query: string): Promise<SearchPortResult>;
}

/** Metadatos y portada de una obra del catálogo de ejemplo que nunca se buscó. */
export interface SpotifyResolvePort {
  resolve(workId: string): Promise<ResolvePortResult>;
}

/**
 * Los tres puertos tal como los ve el punto de composición. Los tres arrancan en
 * `null`: «sin implementación registrada» es un estado válido y observable, no un
 * error, y por eso el catálogo de ejemplo y los bloques con la inicial funcionan
 * solos (BR5.6).
 */
export interface CatalogPorts {
  session: SpotifySessionPort | null;
  search: SpotifySearchPort | null;
  resolve: SpotifyResolvePort | null;
}
