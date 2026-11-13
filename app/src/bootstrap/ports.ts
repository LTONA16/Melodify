/**
 * Punto de extensión de C5 en el punto de composición: los tres puertos del
 * catálogo **declarados y sin implementación**. U1 crea el archivo y U4 registra
 * aquí las implementaciones al montar `@melodify/spotify`; hasta entonces no hay
 * sesión, ni búsqueda, ni resolución, y el catálogo de ejemplo y los bloques con la
 * inicial funcionan solos (C5 § `x-composition`, NFR3.2).
 *
 * Nada de este archivo importa `@melodify/spotify` ni `@melodify/catalog`: solo
 * fluyen formas. La prohibición del contrato es de importación en tiempo de
 * ejecución, y un `import type` de los tipos de C5 cuando existan no la rompe.
 */

/**
 * La forma mínima de una obra que cruza estos puertos. Es la misma que la vista
 * `WorkView` de C5 (`workId`, `title`, `artist`, `coverUrl`, `origin`), sin
 * `origin` porque el catálogo la decide él mismo.
 */
export interface PortWorkView {
  workId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
}

export type SearchPortFailure =
  | "unauthorized"
  | "rateLimited"
  | "timeout"
  | "network"
  | "error";

export type ResolvePortFailure = SearchPortFailure | "notFound";

/** Resultado de una búsqueda: el catálogo normaliza `failure` a `offline` o `error`. */
export interface SearchPortResult {
  kind: "ok" | "empty" | "failure";
  works?: PortWorkView[];
  failure?: SearchPortFailure;
}

/** Resultado de resolver una obra ya conocida; es lo que trae su portada real. */
export interface ResolvePortResult {
  kind: "ok" | "failure";
  work?: PortWorkView;
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
 * error, y por eso el catálogo de ejemplo sigue funcionando.
 */
export interface CatalogPorts {
  session: SpotifySessionPort | null;
  search: SpotifySearchPort | null;
  resolve: SpotifyResolvePort | null;
}

export const catalogPorts: CatalogPorts = {
  session: null,
  search: null,
  resolve: null,
};
