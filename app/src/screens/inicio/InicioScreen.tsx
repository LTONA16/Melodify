/**
 * El contenedor de Inicio (BR7.1–BR7.10): reúne la identidad, el contenido, la red y
 * el catálogo, mapea las opiniones a tarjetas una sola vez por cambio real y entrega
 * a la vista todo ya resuelto. La vista no conoce C4, C5 ni la sesión; esta pantalla
 * no decide cómo se pinta nada.
 *
 * El mapeo va en un `useMemo` con clave `(opinions, revision, catalogVersion, online)`
 * (NFR8.5): cada tarjeta pide `coverFor` a C5, y eso son diez decisiones por feed. Sin
 * la clave, cualquier repintado —abrir el detalle, un cambio de red sin consecuencias—
 * volvería a preguntar por las diez portadas; con ella, solo se rehace cuando cambia
 * el contenido, el catálogo o la red, que son las tres cosas que pueden cambiar la
 * respuesta.
 *
 * Las dependencias de composición son opcionales mientras `bootstrap/instances.ts` no
 * exista (ver `screens/dependencies.ts`): sin ellas la pantalla se queda en carga —su
 * estado honesto, porque no ha recibido nada que cargar— en lugar de construir una
 * segunda instancia de C4 o C5. El paso 29 de la composición las pasa una vez.
 */
import type { AppSession } from "@melodify/app-session";
import { useGlobalServices, useShellServices } from "@melodify/app-shell";
import type { Catalog } from "@melodify/catalog";
import type { ContentStore } from "@melodify/content-store";
import { useMemo } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { toOpinionCardModel } from "../../state/opinionCardModel";
import { useCatalog } from "../../state/useCatalog";
import { useContent } from "../../state/useContent";
import { useNetwork } from "../../state/useNetwork";
import { useViewerId } from "../../state/useViewerId";
import type { ScreenDependencies } from "../dependencies";
import { InicioView } from "./InicioView";

export type InicioScreenProps = ScreenDependencies;

/** Sin colaboradores no hay nada que hacer ni a quién llamar; la vista está en carga. */
const NO_ACTION = () => undefined;

export function InicioScreen({
  session,
  content,
  catalog,
  log = logger,
}: InicioScreenProps) {
  if (session === undefined || content === undefined || catalog === undefined) {
    return (
      <InicioView
        status="loading"
        cards={[]}
        online
        metadataError={false}
        spotifyStatus="disconnected"
        onOpenOpinion={NO_ACTION}
        onRetry={NO_ACTION}
        onRetryCovers={NO_ACTION}
        onCreate={NO_ACTION}
      />
    );
  }

  return (
    <InicioConnected
      session={session}
      content={content}
      catalog={catalog}
      log={log}
    />
  );
}

interface InicioConnectedProps {
  session: AppSession;
  content: ContentStore;
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven aquí y no en el componente de arriba para que las reglas de hooks
 * se cumplan: `InicioScreen` puede devolver una vista sin hooks, y un componente que
 * a veces los llama y a veces no rompería el orden entre renderizados.
 */
function InicioConnected({
  session,
  content,
  catalog,
  log,
}: InicioConnectedProps) {
  const viewerId = useViewerId(session);
  const { status, opinions, revision, retry } = useContent(
    viewerId,
    content,
    log,
  );
  const online = useNetwork();
  const catalogVersion = useCatalog(catalog);
  const { spotify } = useShellServices();
  const global = useGlobalServices();

  const cards = useMemo(
    () =>
      opinions.map((opinion) => ({
        opinion: toOpinionCardModel({
          opinion,
          cover: catalog.coverFor(opinion.workId),
        }),
        isOwn: opinion.isOwn,
      })),
    // `revision`, `catalogVersion` y `online` son la clave del mapeo aunque no se lean
    // en el cuerpo: las portadas se deciden con la versión del catálogo y con la red, y
    // el mapeo solo debe rehacerse cuando alguna cambia (NFR8.5). La primera emisión
    // del catálogo no cuenta como cambio, y `opinions` ya cambia con la revisión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opinions, revision, catalogVersion, online, catalog],
  );

  return (
    <InicioView
      status={status}
      cards={cards}
      online={online}
      metadataError={catalog.getCoverFailure()}
      spotifyStatus={spotify.status}
      onOpenOpinion={(opinionId) => global.openOpinionDetail({ opinionId })}
      onRetry={retry}
      onRetryCovers={() => catalog.retryCovers()}
      onCreate={() => global.goToTab({ name: "crear" })}
    />
  );
}
