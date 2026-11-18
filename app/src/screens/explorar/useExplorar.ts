/**
 * El estado de Explorar que no es de búsqueda (BR17.3, BR17.7, BR18.6, BR19.1):
 * las sugerencias locales con su recuento, si hay sesión de Spotify, la capa de
 * token caído y las acciones de conexión y navegación.
 *
 * La búsqueda no vive aquí: `useWorkSearch` es la única pieza que aplica los dos
 * caracteres, los 400 ms y el descarte de respuestas tardías, y la pantalla la
 * monta junto a este hook. Separarlo evita dos temporizadores y dos verdades sobre
 * la misma consulta.
 *
 * Las sugerencias se leen del catálogo único (R-01) y se recuentan con C5. La
 * versión del catálogo entra en la clave del `useMemo` para que una portada que se
 * resuelve en segundo plano repinte la fila sin volver a montar la pantalla
 * (NFR8.5).
 */
import {
  useGlobalServices,
  useShellServices,
  type SpotifyStatus,
} from "@melodify/app-shell";
import type { Catalog, WorkView } from "@melodify/catalog";
import { useMemo } from "react";

import { useCatalog } from "../../state/useCatalog";

/** Una sugerencia local con el recuento que C5 resuelve para su fila. */
export interface ExplorarSuggestion {
  work: WorkView;
  opinionCount: number;
}

export interface ExplorarState {
  /** `null` mientras la hidratación no ha entregado el primer estado real. */
  status: SpotifyStatus | null;
  /** La tarjeta compacta con el botón deshabilitado (BR19.2). */
  connecting: boolean;
  /** Sin sesión: no hay buscador que consultar (BR19.1). */
  sinSesion: boolean;
  /** La capa de BR18.6: conserva consulta y lista, y bloquea nuevas peticiones. */
  tokenCaido: boolean;
  sugerencias: ExplorarSuggestion[];
  connect: () => void;
  retryConnection: () => void;
  volverAConectar: () => void;
  openWork: (work: WorkView) => void;
  openCreate: (work: WorkView) => void;
}

export function useExplorar(
  catalog: Catalog,
  status: SpotifyStatus | null,
): ExplorarState {
  const { spotify } = useShellServices();
  const global = useGlobalServices();
  const catalogVersion = useCatalog(catalog);

  const sugerencias = useMemo(
    () =>
      catalog.listSampleWorks().works.map((work) => {
        // Con sesión y red, `coverFor` devuelve el bloque de inmediato y dispara la
        // resolución de fondo; la próxima emisión del catálogo vuelve a mapear.
        const cover = catalog.coverFor(work.workId);

        return {
          work:
            cover.kind === "url"
              ? { ...work, coverUrl: cover.value }
              : { ...work, coverUrl: null },
          opinionCount: catalog.countOpinions(work.workId).count,
        };
      }),
    // La versión es la clave aunque no se lea en el cuerpo: las portadas y los
    // recuentos cambian sin que cambien el catálogo ni la lista de ejemplo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, catalogVersion],
  );

  const tokenCaido = status === "invalidToken";
  const connecting = status === "connecting";
  const sinSesion =
    status !== null &&
    status !== "connected" &&
    status !== "connecting";

  return {
    status,
    connecting,
    sinSesion,
    tokenCaido,
    sugerencias,
    connect: spotify.connect,
    retryConnection: spotify.retry,
    volverAConectar: spotify.connect,
    openWork: (work) =>
      global.openWorkDetail({ workId: work.workId, data: work }),
    openCreate: (work) =>
      global.openCreate({ workId: work.workId, data: work }),
  };
}
