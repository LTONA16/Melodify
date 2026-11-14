/**
 * El contenedor de Perfil (F10): identidad, opiniones propias y cierre de sesión.
 *
 * Lee la identidad con `useViewerId`, el contenido con `usePerfil` y la red para el
 * aviso; mapea las opiniones propias a tarjetas una sola vez por cambio real y pasa a
 * la vista todo ya resuelto. La vista no conoce C4, C5 ni la sesión.
 *
 * «Cerrar sesión» llama a la sesión inyectada por la composición (R-01): es la misma
 * instancia que decide Login/Inicio en el arranque, así que su suscripción devuelve la
 * app a Login sin navegar a mano, y el contenido no se borra (BR9.8). Una sesión
 * construida aquí no movería esa máquina.
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
import { useMemo } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { toOpinionCardModel } from "../../state/opinionCardModel";
import { useCatalog } from "../../state/useCatalog";
import { useNetwork } from "../../state/useNetwork";
import { useViewerId } from "../../state/useViewerId";
import type { ScreenDependencies } from "../dependencies";
import { PerfilView } from "./PerfilView";
import { usePerfil } from "./usePerfil";

export type PerfilScreenProps = ScreenDependencies;

/** Sin colaboradores no hay nada que hacer ni a quién llamar; la vista está en carga. */
const NO_ACTION = () => undefined;

export function PerfilScreen({
  session,
  content,
  catalog,
  log = logger,
}: PerfilScreenProps) {
  if (session === undefined || content === undefined || catalog === undefined) {
    return (
      <PerfilView
        status="loading"
        author={null}
        cards={[]}
        online
        onOpenOpinion={NO_ACTION}
        onRetry={NO_ACTION}
        onRetryCovers={NO_ACTION}
        onCreate={NO_ACTION}
        onSignOut={NO_ACTION}
      />
    );
  }

  return (
    <PerfilConnected
      session={session}
      content={content}
      catalog={catalog}
      log={log}
    />
  );
}

interface PerfilConnectedProps {
  session: AppSession;
  content: ContentStore;
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven aquí y no en el componente de arriba para que las reglas de hooks
 * se cumplan: `PerfilScreen` puede devolver una vista sin hooks, y un componente que
 * a veces los llama y a veces no rompería el orden entre renderizados.
 */
function PerfilConnected({
  session,
  content,
  catalog,
  log,
}: PerfilConnectedProps) {
  const viewerId = useViewerId(session);
  const { status, author, opinions, retry } = usePerfil(viewerId, content, log);
  const catalogVersion = useCatalog(catalog);
  const online = useNetwork();
  const global = useGlobalServices();

  const cards = useMemo(
    () =>
      opinions.map((opinion) =>
        toOpinionCardModel({
          opinion,
          cover: catalog.coverFor(opinion.workId),
        }),
      ),
    // `catalogVersion` y `online` son la clave del mapeo aunque no se lean en el
    // cuerpo: la portada se decide con la versión del catálogo y con la red, y el
    // mapeo solo debe rehacerse cuando alguna cambia (NFR8.5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opinions, catalogVersion, online, catalog],
  );

  return (
    <PerfilView
      status={status}
      author={author}
      cards={cards}
      online={online}
      onOpenOpinion={(opinionId) => global.openOpinionDetail({ opinionId })}
      onRetry={retry}
      onRetryCovers={() => catalog.retryCovers()}
      onCreate={() => global.goToTab({ name: "crear" })}
      onSignOut={() => {
        void session.signOut();
      }}
    />
  );
}
