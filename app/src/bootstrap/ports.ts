/**
 * Punto de extensión de C5 en el punto de composición: los tres puertos del
 * catálogo **declarados y sin implementación**. U1 crea el archivo y U4 registra
 * aquí las implementaciones al montar `@melodify/spotify`; hasta entonces no hay
 * sesión, ni búsqueda, ni resolución, y el catálogo de ejemplo y los bloques con la
 * inicial funcionan solos (C5 § `x-composition`, NFR3.2).
 *
 * Los tipos ya no se declaran aquí: se importan de `@melodify/catalog` con
 * `import type`. Así una implementación de U4 no puede discrepar de la declaración
 * del consumidor, y no se crea ninguna arista de ejecución hacia el paquete
 * (TS-21, NFR3.11). `PortWorkView` desaparece porque su forma era `WorkView` sin
 * `origin`, y el contrato devuelve `WorkView` completa.
 */
import type { CatalogPorts } from "@melodify/catalog";

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
} from "@melodify/catalog";

/**
 * Los tres puertos tal como los ve el punto de composición. Los tres arrancan en
 * `null`: «sin implementación registrada» es un estado válido y observable, no un
 * error, y por eso el catálogo de ejemplo sigue funcionando (BR5.6).
 */
export const catalogPorts: CatalogPorts = {
  session: null,
  search: null,
  resolve: null,
};
