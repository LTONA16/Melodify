/**
 * El contenedor de Explorar (BR17.1–BR17.11, BR18.6, BR19.1–BR19.3): monta el
 * estado de la pantalla y la búsqueda, cablea la conexión y entrega a la vista
 * todo ya resuelto.
 *
 * La búsqueda se monta con `includeArtists: true` y con `paused` mientras el token
 * está caído: así el campo sigue editable y la lista y la consulta no se borran al
 * recibir un `401` (BR18.6). No hay una segunda instancia de C5 ni de la sesión;
 * ambas llegan del punto de composición (R-01).
 */
import type { Catalog } from "@melodify/catalog";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { useNetwork } from "../../state/useNetwork";
import { useSpotifyConnection } from "../../state/useSpotifyConnection";
import { useWorkSearch } from "../../state/useWorkSearch";
import type { ScreenDependencies } from "../dependencies";
import { ExplorarView } from "./ExplorarView";
import { useExplorar } from "./useExplorar";

export type ExplorarScreenProps = ScreenDependencies;

const NO_ACTION = () => undefined;
const NO_COUNT = () => 0;

export function ExplorarScreen({
  catalog,
  log = logger,
}: ExplorarScreenProps) {
  if (catalog === undefined) {
    return (
      <ExplorarView
        spotifyStatus={null}
        connecting={false}
        sinSesion={false}
        tokenCaido={false}
        online
        onConnect={NO_ACTION}
        onRetryConnection={NO_ACTION}
        onVolverAConectar={NO_ACTION}
        query=""
        searchStatus="idle"
        results={[]}
        artists={[]}
        onChangeQuery={NO_ACTION}
        onClearQuery={NO_ACTION}
        onSearchRetry={NO_ACTION}
        onOpenWork={NO_ACTION}
        onOpenArtist={NO_ACTION}
        opinionCountFor={NO_COUNT}
        sugerencias={[]}
      />
    );
  }

  return <ExplorarConnected catalog={catalog} log={log} />;
}

interface ExplorarConnectedProps {
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven en este componente para que `ExplorarScreen` pueda devolver una
 * vista sin hooks mientras falte el catálogo, sin romper el orden entre renders.
 */
function ExplorarConnected({ catalog, log }: ExplorarConnectedProps) {
  const online = useNetwork();
  // La suscripción es lo que levanta la capa al recibir un `401`: leer `status`
  // una sola vez dejaría la pantalla con el estado del montaje.
  const { status } = useSpotifyConnection();
  const {
    connecting,
    sinSesion,
    tokenCaido,
    sugerencias,
    connect,
    retryConnection,
    volverAConectar,
    openWork,
  } = useExplorar(catalog, status);
  // Durante la reconexión la lista y la consulta también se conservan: F25 pide
  // que volver de `invalidToken` no borre lo que la persona estaba leyendo.
  const searchSuspended = tokenCaido || connecting;
  const search = useWorkSearch(
    catalog,
    status === "connected" || searchSuspended,
    log,
    {
      includeArtists: true,
      paused: searchSuspended,
    },
  );

  return (
    <ExplorarView
      spotifyStatus={status}
      connecting={connecting}
      sinSesion={sinSesion}
      tokenCaido={tokenCaido}
      online={online}
      onConnect={connect}
      onRetryConnection={retryConnection}
      onVolverAConectar={volverAConectar}
      query={search.query}
      searchStatus={search.status}
      results={search.results}
      artists={search.artists}
      onChangeQuery={search.setQuery}
      onClearQuery={search.clear}
      onSearchRetry={search.retry}
      onOpenWork={openWork}
      onOpenArtist={(artist) => search.setQuery(artist.name)}
      opinionCountFor={(workId) => catalog.countOpinions(workId).count}
      sugerencias={sugerencias}
    />
  );
}
