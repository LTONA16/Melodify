/**
 * El contenedor del detalle de opinión (F8, AC2.3.3): resuelve quién mira, lee la
 * opinión con C4 y C5 en `useDetalleOpinion`, escucha la red para el aviso y fija el
 * título que posee la cáscara. La vista no conoce ninguna de esas piezas.
 *
 * El mapeo a tarjeta va aquí y no en la vista: la tarjeta recibe la decisión de
 * portada de C5 ya resuelta, igual que en Inicio (BR7.10). Si la obra no está en el
 * catálogo, el hook entrega el título y el artista que la propia opinión guarda y la
 * portada cae al bloque con la inicial (BR5.2).
 *
 * El título se fija al montar porque la cáscara solo sabe que hay un detalle encima,
 * no cómo se llama: es la pantalla quien lo sabe (BR8.9), y la cáscara lo limpia al
 * desapilar (C2 1.2.0, revisión 12).
 *
 * Las dependencias de composición son opcionales mientras `bootstrap/instances.ts` no
 * exista (ver `screens/dependencies.ts`): sin ellas la pantalla se queda en carga —el
 * estado honesto, porque no ha recibido nada que cargar— en lugar de construir un
 * segundo almacén o un segundo catálogo. El paso 29 de la composición las pasa una vez.
 */
import type { AppSession } from "@melodify/app-session";
import { useGlobalServices } from "@melodify/app-shell";
import type { Catalog } from "@melodify/catalog";
import type { ContentStore } from "@melodify/content-store";
import { useEffect, useMemo } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { toOpinionCardModel } from "../../state/opinionCardModel";
import { useNetwork } from "../../state/useNetwork";
import { useViewerId } from "../../state/useViewerId";
import type { ScreenDependencies } from "../dependencies";
import { DetalleOpinionView } from "./DetalleOpinionView";
import { useDetalleOpinion } from "./useDetalleOpinion";

export interface DetalleOpinionScreenProps extends ScreenDependencies {
  /** La opinión apilada por la cáscara; el registro `{ kind: "opinion" }` pasa esto. */
  opinion: { opinionId: string };
}

/** Sin colaboradores no hay nada que hacer ni a quién llamar; la vista está en carga. */
const NO_ACTION = () => undefined;

export function DetalleOpinionScreen({
  opinion,
  session,
  content,
  catalog,
  log = logger,
}: DetalleOpinionScreenProps) {
  if (session === undefined || content === undefined || catalog === undefined) {
    return (
      <DetalleOpinionView
        status="loading"
        card={null}
        isOwn={false}
        workTitle=""
        workArtist=""
        coverUrl={null}
        average={0}
        opinionCount={0}
        online
        onRetry={NO_ACTION}
        onRetryCovers={NO_ACTION}
      />
    );
  }

  return (
    <DetalleOpinionConnected
      opinionId={opinion.opinionId}
      session={session}
      content={content}
      catalog={catalog}
      log={log}
    />
  );
}

interface DetalleOpinionConnectedProps {
  opinionId: string;
  session: AppSession;
  content: ContentStore;
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven aquí y no en el componente de arriba para que las reglas de hooks
 * se cumplan: `DetalleOpinionScreen` puede devolver una vista sin hooks, y un
 * componente que a veces los llama y a veces no rompería el orden entre renderizados.
 */
function DetalleOpinionConnected({
  opinionId,
  session,
  content,
  catalog,
  log,
}: DetalleOpinionConnectedProps) {
  const viewerId = useViewerId(session);
  const online = useNetwork();
  const { status, opinion, workTitle, workArtist, average, opinionCount, cover, retry } =
    useDetalleOpinion(opinionId, viewerId, content, catalog, online, log);
  const global = useGlobalServices();

  useEffect(() => {
    global.setHeader({ title: "Detalle de opinión" });
    // El objeto de servicios globales se recrea en cada render de la cáscara, así que
    // incluirlo en las dependencias volvería a fijar el título en cada repintado. El
    // título es fijo para esta pantalla: basta con fijarlo al montar, y la cáscara lo
    // limpia al desapilar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = useMemo(
    () =>
      opinion === null ? null : toOpinionCardModel({ opinion, cover }),
    [opinion, cover],
  );

  return (
    <DetalleOpinionView
      status={status}
      card={card}
      isOwn={opinion?.isOwn === true}
      workTitle={workTitle}
      workArtist={workArtist}
      coverUrl={cover.kind === "url" ? cover.value : null}
      average={average}
      opinionCount={opinionCount}
      online={online}
      onRetry={retry}
      onRetryCovers={() => catalog.retryCovers()}
    />
  );
}
