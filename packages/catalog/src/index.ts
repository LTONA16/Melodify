/**
 * Superficie pública de `@melodify/catalog` (C5 1.1.0).
 *
 * Una sola fábrica —`createCatalog`— y los tipos con los que se habla con ella.
 * Los tipos de los puertos viajan aquí porque el punto de composición y U4 los
 * implementan contra esta misma declaración: una implementación no puede apoyarse
 * en un tipo que no se puede nombrar desde fuera. Es un `export type`, así que no
 * se crea ninguna arista de ejecución hacia Spotify (NFR3.11).
 *
 * El catálogo de ejemplo (`SAMPLE_WORKS`) queda dentro del paquete: se consume por
 * `listSampleWorks`, que es la operación que el contrato nombra (BR5.1).
 */
export { createCatalog } from "./catalog";
export type {
  Catalog,
  CatalogFailure,
  CatalogResult,
  CatalogSnapshot,
  CatalogSuccess,
  CoverDecision,
  CreateCatalogOptions,
  SearchResult,
  SearchStatus,
  WorkOpinionCount,
} from "./catalog";
export type {
  CatalogPorts,
  ResolvePortFailure,
  ResolvePortResult,
  SearchPortFailure,
  SearchPortResult,
  SpotifyResolvePort,
  SpotifySearchPort,
  SpotifySessionPort,
  WorkView,
} from "./ports";
