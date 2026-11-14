/**
 * El contenedor del detalle de obra (BR8.1–BR8.12): resuelve quién mira, lee la obra
 * con C4 y C5 en `useDetalleObra`, escucha la red para el aviso y fija el título de la
 * cabecera que posee la cáscara. La vista no conoce ninguna de esas piezas.
 *
 * El título se fija al montar porque la cáscara solo sabe que hay un detalle encima,
 * no cómo se llama: es la pantalla quien lo sabe (BR8.9), y la cáscara lo limpia al
 * desapilar (C2 1.2.0, revisión 12).
 *
 * «Opinar sobre esta obra» llama a `openCreate({ workId })` (BR8.3): la obra llega
 * preseleccionada y el formulario es de U3, así que aquí no hay nada más que cablear.
 * El «Reintentar» del error repite la lectura; el del aviso de sin conexión vuelve a
 * pedir la portada a C5, que es lo único que depende de la red en esta pantalla.
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
import { useEffect } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { useNetwork } from "../../state/useNetwork";
import { useViewerId } from "../../state/useViewerId";
import type { ScreenDependencies } from "../dependencies";
import { DetalleObraView } from "./DetalleObraView";
import { useDetalleObra } from "./useDetalleObra";

export interface DetalleObraScreenProps extends ScreenDependencies {
  /** La obra apilada por la cáscara; el registro `{ kind: "work" }` le pasa esto. */
  work: { workId: string };
}

/** Sin colaboradores no hay nada que hacer ni a quién llamar; la vista está en carga. */
const NO_ACTION = () => undefined;

export function DetalleObraScreen({
  work,
  session,
  content,
  catalog,
  log = logger,
}: DetalleObraScreenProps) {
  if (session === undefined || content === undefined || catalog === undefined) {
    return (
      <DetalleObraView
        status="loading"
        work={null}
        coverUrl={null}
        average={0}
        opinionCount={0}
        own={null}
        others={[]}
        online
        onRetry={NO_ACTION}
        onRetryCovers={NO_ACTION}
        onCreateOpinion={NO_ACTION}
      />
    );
  }

  return (
    <DetalleObraConnected
      workId={work.workId}
      session={session}
      content={content}
      catalog={catalog}
      log={log}
    />
  );
}

interface DetalleObraConnectedProps {
  workId: string;
  session: AppSession;
  content: ContentStore;
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven aquí y no en el componente de arriba para que las reglas de hooks
 * se cumplan: `DetalleObraScreen` puede devolver una vista sin hooks, y un componente
 * que a veces los llama y a veces no rompería el orden entre renderizados.
 */
function DetalleObraConnected({
  workId,
  session,
  content,
  catalog,
  log,
}: DetalleObraConnectedProps) {
  const viewerId = useViewerId(session);
  const online = useNetwork();
  const { status, work, own, others, average, opinionCount, cover, retry } =
    useDetalleObra(workId, viewerId, content, catalog, online, log);
  const global = useGlobalServices();

  useEffect(() => {
    global.setHeader({ title: "Detalle de obra" });
    // El objeto de servicios globales se recrea en cada render de la cáscara, así que
    // incluirlo en las dependencias volvería a fijar el título en cada repintado. El
    // título es fijo para esta pantalla: basta con fijarlo al montar, y la cáscara lo
    // limpia al desapilar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DetalleObraView
      status={status}
      work={work}
      coverUrl={cover.kind === "url" ? cover.value : null}
      average={average}
      opinionCount={opinionCount}
      own={own}
      others={others}
      online={online}
      onRetry={retry}
      onRetryCovers={() => catalog.retryCovers()}
      onCreateOpinion={() => global.openCreate({ workId })}
    />
  );
}
