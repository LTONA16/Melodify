/**
 * El contenedor de Crear y Editar (BR11.1–BR11.11, BR12.1–BR12.7, BR13.1–BR13.5):
 * lee la entrada de la cáscara, la identidad, la red y los servicios, monta
 * `useCrear` y `useWorkSearch`, y entrega a la vista todo ya resuelto.
 *
 * Por qué la navegación vive aquí y no en el hook: cuando una escritura termina
 * bien, `useCrear` entrega un resultado y este contenedor decide a dónde ir y qué
 * aviso pedir, en el orden «navegar y después avisar» (BR11.5, BR12.3). El hook se
 * prueba así sin cáscara.
 *
 * Decisiones:
 * - **`formKey` reinicia la visita** (BR11.1, NFR3.16): al cambiar la entrada se
 *   descarta el buscador desplegado y su consulta, sin desmontar la pantalla; el
 *   borrador lo descarta `useCrear` con la misma clave.
 * - **Las obras de ejemplo se leen del catálogo único** (R-01) y se recuentan con C5;
 *   la revisión de C4 es la clave para que un recuento no se quede viejo (NFR8.5).
 * - **Un fallo de envío no navega**: el hook ya dejó el aviso en su estado y aquí no
 *   se pide snackbar (BR11.7, BR12.5).
 */
import type { AppSession } from "@melodify/app-session";
import { useCreateEntry, useGlobalServices } from "@melodify/app-shell";
import type { Catalog } from "@melodify/catalog";
import type { ContentStore } from "@melodify/content-store";
import { useEffect, useMemo, useState } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { useContent } from "../../state/useContent";
import { useNetwork } from "../../state/useNetwork";
import { useSpotifyConnection } from "../../state/useSpotifyConnection";
import { useViewerId } from "../../state/useViewerId";
import { useWorkSearch } from "../../state/useWorkSearch";
import type { ScreenDependencies } from "../dependencies";
import { CrearView } from "./CrearView";
import { useCrear, type CrearOutcome } from "./useCrear";
import type { SelectedWork } from "./validateOpinionDraft";

export type CrearScreenProps = ScreenDependencies;

const NO_ACTION = () => undefined;

/** Sin colaboradores no hay nada que cargar: la vista pinta su estado honesto. */
export function CrearScreen({
  session,
  content,
  catalog,
  log = logger,
}: CrearScreenProps) {
  if (session === undefined || content === undefined || catalog === undefined) {
    return (
      <CrearView
        mode="create"
        screenStatus="loading"
        online
        spotifyStatus={null}
        onConnectSpotify={NO_ACTION}
        onRetrySpotify={NO_ACTION}
        work={null}
        text=""
        rating={0}
        canSubmit={false}
        alreadyOpined={false}
        submitError={null}
        searchVisible={false}
        query=""
        searchStatus="idle"
        results={[]}
        onChangeQuery={NO_ACTION}
        onClearQuery={NO_ACTION}
        onToggleSearch={NO_ACTION}
        onChooseWork={NO_ACTION}
        onSearchRetry={NO_ACTION}
        sampleWorks={[]}
        onPublish={NO_ACTION}
        onSave={NO_ACTION}
        onCancel={NO_ACTION}
        onEditExisting={NO_ACTION}
        onClearRating={NO_ACTION}
        onRate={NO_ACTION}
        onChangeText={NO_ACTION}
        onRetryLoad={NO_ACTION}
      />
    );
  }

  return (
    <CrearConnected
      session={session}
      content={content}
      catalog={catalog}
      log={log}
    />
  );
}

interface CrearConnectedProps {
  session: AppSession;
  content: ContentStore;
  catalog: Catalog;
  log: AppLogger;
}

/**
 * Los hooks viven aquí y no en el componente de arriba para que las reglas de hooks
 * se cumplan: `CrearScreen` puede devolver una vista sin hooks, y un componente que
 * a veces los llama y a veces no rompería el orden entre renderizados.
 */
function CrearConnected({
  session,
  content,
  catalog,
  log,
}: CrearConnectedProps) {
  const entry = useCreateEntry();
  const global = useGlobalServices();
  const viewerId = useViewerId(session);
  const online = useNetwork();
  // La revisión de C4 es la clave del recuento de las obras de ejemplo: publicar
  // cambia el número que pinta su fila, y sin suscripción se quedaría en el viejo.
  const { revision } = useContent(viewerId, content, log);
  // La tarjeta de la rama de ejemplo es la misma pieza que la de Explorar: lee el
  // estado real de C7 para poder decir «Conectando…» o «No pudimos conectar» y
  // ofrecer conectar de verdad, no un botón que no hace nada.
  const { status: spotifyStatus, connect, retry } = useSpotifyConnection();
  const spotifyConnected = spotifyStatus === "connected";
  const search = useWorkSearch(catalog, spotifyConnected, log);

  const [searchVisible, setSearchVisible] = useState(
    entry.mode === "create" && entry.preselectedWorkId === null,
  );

  const { state, actions } = useCrear({
    entry,
    viewerId,
    content,
    catalog,
    onDone: (outcome: CrearOutcome) => {
      if (outcome.kind === "published") {
        // Primero navegar y después avisar: el cambio de pestaña no borra el aviso
        // porque ya está pedido (BR11.5, Aviso único de C2).
        global.goToTab({ name: "inicio" });
        global.showSnackbar({ message: "Opinión publicada" });
        return;
      }

      if (outcome.kind === "saved") {
        global.closeCreate();
        global.showSnackbar({ message: "Opinión actualizada" });
        return;
      }

      // «Guardar» sin cambios cierra sin escribir y sin confirmar (BR12.4).
      global.closeCreate();
    },
    onEditExisting: (opinionId) => global.openEdit({ opinionId }),
  });

  const { clear: clearSearch } = search;

  useEffect(() => {
    // Cada visita (formKey) empieza con el buscador plegado si trae obra y con la
    // consulta vacía: no se arrastra nada de la visita anterior (NFR3.16). Es una
    // sincronización con una fuente externa —la entrada de C2—, no un estado derivado
    // que la regla del linter describa, igual que en `useCrear`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchVisible(
      entry.mode === "create" && entry.preselectedWorkId === null,
    );
    clearSearch();
  }, [
    entry.formKey,
    entry.mode,
    entry.preselectedWorkId,
    clearSearch,
  ]);

  const sampleWorks = useMemo(
    () =>
      catalog.listSampleWorks().works.map((work) => ({
        work,
        opinionCount: catalog.countOpinions(work.workId).count,
      })),
    // `revision` es la clave del recuento aunque no se lea en el cuerpo: C5 cuenta
    // contra C4 y la fila solo debe releerse cuando el contenido cambia (NFR8.5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, revision],
  );

  const chooseWork = (work: SelectedWork): void => {
    actions.chooseWork(work);
    // Elegir una obra pliega el buscador y deja solo su fila (BR13.3).
    clearSearch();
    setSearchVisible(false);
  };

  const toggleSearch = (): void => {
    // «Cambiar» vuelve a desplegar el buscador con el texto vacío (BR13.3).
    clearSearch();
    setSearchVisible(true);
  };

  return (
    <CrearView
      mode={state.mode}
      screenStatus={state.status}
      online={online}
      spotifyStatus={spotifyStatus}
      onConnectSpotify={connect}
      onRetrySpotify={retry}
      work={state.work}
      text={state.text}
      rating={state.rating}
      canSubmit={state.canSubmit}
      alreadyOpined={state.alreadyOpined}
      submitError={state.submitError}
      searchVisible={searchVisible}
      query={search.query}
      searchStatus={search.status}
      results={search.results}
      onChangeQuery={search.setQuery}
      onClearQuery={search.clear}
      onToggleSearch={toggleSearch}
      onChooseWork={chooseWork}
      onSearchRetry={search.retry}
      sampleWorks={sampleWorks}
      onPublish={actions.publish}
      onSave={actions.save}
      onCancel={global.closeCreate}
      onEditExisting={actions.editExisting}
      onClearRating={actions.clearRating}
      onRate={actions.rate}
      onChangeText={actions.changeText}
      onRetryLoad={actions.retryLoad}
    />
  );
}
