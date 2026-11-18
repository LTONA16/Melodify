/**
 * El estado del formulario de Crear y Editar (BR11.1–BR11.7, BR12.1–BR12.7): la obra
 * elegida, el texto, la valoración, la comprobación de «ya opinaste», la carga de la
 * edición, el error de envío y las dos escrituras. Devuelve `{ state, actions }`.
 *
 * Por qué toda la lógica vive aquí y no en la pantalla: la vista es pura y no
 * temporiza ni escribe (frontend-components.md), y las dos escrituras comparten las
 * mismas reglas (BR12.7). El contenedor solo cablea navegación, snackbar y buscador.
 *
 * Decisiones:
 * - **La navegación no entra en el hook.** Cuando una escritura termina bien, el
 *   hook entrega un resultado (`published`, `saved` o `unchanged`) y el contenedor
 *   decide a dónde ir y qué aviso pedir. Así el hook se prueba sin cáscara y el orden
 *   «navegar y después avisar» (BR11.5, BR12.3) vive en un solo sitio.
 * - **`formKey` descarta el borrador** (BR11.1): al cambiar la entrada se vuelve a
 *   derivar el estado desde cero, con la obra preseleccionada o la opinión editada.
 *   Nunca se arrastra texto ni obra de la visita anterior.
 * - **El `409` no es un error**: pasa a `YaOpinada` y se relée la opinión propia para
 *   que «Editar mi opinión» tenga a dónde ir (BR11.6).
 * - **El `404` al guardar es un error de carga**: la opinión que se estaba editando
 *   ya no existe, así que se pinta «No pudimos cargar tu opinión.» con «Reintentar»
 *   (BR12.5). El resto de fallos conserva todo y pide reintentar (BR11.7, BR12.5).
 * - **«Guardar» compara el texto recortado**: unos espacios de más no son un cambio
 *   (BR12.4).
 */
import type { CreateEntry } from "@melodify/app-shell";
import type { Catalog, WorkView } from "@melodify/catalog";
import type { ContentStore, OpinionView } from "@melodify/content-store";
import { MAX_OPINION_LENGTH } from "@melodify/content-store";
import { useCallback, useEffect, useState } from "react";

import {
  isValidRating,
  validateOpinionDraft,
  type OpinionDraft,
  type SelectedWork,
} from "./validateOpinionDraft";

export type CrearMode = "create" | "edit";

export type CrearScreenStatus = "loading" | "ready" | "loadError";

/** El bloque de error que se pinta sobre el botón principal. */
export type CrearSubmitError = "publish" | "save" | null;

/**
 * Lo que el hook entrega cuando una escritura termina bien. «Sin cambios» no escribe
 * y aun así cierra: el contenedor no debe confundirlo con una edición guardada.
 */
export type CrearOutcome =
  | { kind: "published"; opinion: OpinionView }
  | { kind: "saved"; opinion: OpinionView }
  | { kind: "unchanged" };

export interface CrearState {
  status: CrearScreenStatus;
  mode: CrearMode;
  work: SelectedWork | null;
  text: string;
  rating: number;
  alreadyOpined: boolean;
  /** La opinión propia vigente sobre la obra; es la que abre «Editar mi opinión». */
  ownOpinionId: string | null;
  submitError: CrearSubmitError;
  canSubmit: boolean;
  /**
   * Lo cargado al abrir la edición: contra esto compara «Guardar» para no sellar
   * `updatedAt` sin cambios (BR12.4). En modo publicar es `null`.
   */
  baseline: { text: string; rating: number } | null;
}

export interface CrearActions {
  /** Fija la obra elegida y comprueba si ya tiene opinión propia (BR11.6). */
  chooseWork: (work: SelectedWork) => void;
  changeText: (text: string) => void;
  rate: (value: number) => void;
  clearRating: () => void;
  publish: () => void;
  save: () => void;
  /** «Editar mi opinión» en `YaOpinada` (BR11.6). */
  editExisting: () => void;
  /** «Reintentar» del error de carga (BR12.1). */
  retryLoad: () => void;
}

/** Lo que el hook necesita de C4: las dos lecturas y las dos escrituras. */
export type CrearContentPort = Pick<
  ContentStore,
  "listOpinions" | "getOpinion" | "createOpinion" | "updateOpinion"
>;

/** Lo que necesita de C5: resolver la obra preseleccionada (BR11.10). */
export type CrearCatalogPort = Pick<Catalog, "getWork">;

export interface UseCrearDeps {
  entry: CreateEntry;
  viewerId: string | null;
  content: CrearContentPort;
  catalog: CrearCatalogPort;
  onDone: (outcome: CrearOutcome) => void;
  onEditExisting: (opinionId: string) => void;
}

export interface CrearController {
  state: CrearState;
  actions: CrearActions;
}

/** El formulario antes de tener identidad o datos: esqueletos, nada decidido. */
function emptyState(mode: CrearMode): CrearState {
  return {
    status: "loading",
    mode,
    work: null,
    text: "",
    rating: 0,
    alreadyOpined: false,
    ownOpinionId: null,
    submitError: null,
    canSubmit: false,
    baseline: null,
  };
}

/** Recalcula `canSubmit` con la validación compartida (BR11.2, BR12.7). */
function withValidity(state: CrearState): CrearState {
  const draft: OpinionDraft = {
    work: state.work,
    text: state.text,
    rating: state.rating,
  };

  return { ...state, canSubmit: validateOpinionDraft(draft).valid };
}

/**
 * La opinión propia sobre una obra, si la hay. Un fallo de lectura no bloquea
 * publicar: C4 respondería `409` en la carrera y el formulario lo trataría igual
 * (BR11.6).
 */
function findOwnOpinion(
  content: CrearContentPort,
  workId: string,
  viewerId: string,
): OpinionView | null {
  const result = content.listOpinions({ workId, viewerId });

  if (!result.ok) {
    return null;
  }

  return result.value.find((opinion) => opinion.isOwn) ?? null;
}

interface EntryFields {
  mode: CrearMode;
  /** La obra ya resuelta por la pantalla que abrió Crear: gana sobre el id. */
  preselectedWork: WorkView | null;
  preselectedWorkId: string | null;
  editingOpinionId: string | null;
}

/** Deriva el estado inicial de una visita: carga, borrador vacío o edición leída. */
function deriveState(
  entry: EntryFields,
  viewerId: string | null,
  content: CrearContentPort,
  catalog: CrearCatalogPort,
): CrearState {
  const base = emptyState(entry.mode);

  if (viewerId === null) {
    // Sin identidad no se puede decidir «ya opinaste» ni leer la edición.
    return base;
  }

  if (entry.mode === "edit") {
    if (entry.editingOpinionId === null) {
      return { ...base, status: "loadError" };
    }

    const result = content.getOpinion({
      opinionId: entry.editingOpinionId,
      viewerId,
    });

    if (!result.ok || !result.value.isOwn) {
      return { ...base, status: "loadError" };
    }

    const opinion = result.value;

    return withValidity({
      ...base,
      status: "ready",
      work: {
        workId: opinion.workId,
        title: opinion.workTitle,
        artist: opinion.workArtist,
        // La portada la decide C5 y aquí no hace falta: la fila pinta el bloque
        // con la inicial, como el resto de la app sin sesión de Spotify (BR5.3).
        coverUrl: null,
      },
      text: opinion.text,
      rating: opinion.rating,
      ownOpinionId: opinion.opinionId,
      baseline: { text: opinion.text, rating: opinion.rating },
    });
  }

  let work: SelectedWork | null = null;

  // La obra que ya venía resuelta gana sobre volver a buscarla por id (BR11.10):
  // conserva el título, la portada y `workKind` que la ruta ya conocía.
  if (
    entry.preselectedWork !== null &&
    entry.preselectedWork.workId === entry.preselectedWorkId
  ) {
    work = {
      workId: entry.preselectedWork.workId,
      title: entry.preselectedWork.title,
      artist: entry.preselectedWork.artist,
      coverUrl: entry.preselectedWork.coverUrl,
      workKind: entry.preselectedWork.workKind,
    };
  } else if (entry.preselectedWorkId !== null) {
    const found = catalog.getWork(entry.preselectedWorkId);

    if (found.ok) {
      work = {
        workId: found.value.workId,
        title: found.value.title,
        artist: found.value.artist,
        coverUrl: found.value.coverUrl,
        workKind: found.value.workKind,
      };
    }
  }

  const own =
    work === null ? null : findOwnOpinion(content, work.workId, viewerId);

  return withValidity({
    ...base,
    status: "ready",
    work,
    alreadyOpined: own !== null,
    ownOpinionId: own?.opinionId ?? null,
  });
}

export function useCrear({
  entry,
  viewerId,
  content,
  catalog,
  onDone,
  onEditExisting,
}: UseCrearDeps): CrearController {
  const {
    formKey,
    mode,
    preselectedWork,
    preselectedWorkId,
    editingOpinionId,
  } = entry;
  // El primer render pinta el estado honesto —cargando— y el efecto deriva los datos
  // una sola vez por visita. Derivarlo también en el inicializador duplicaría las
  // lecturas de C4 sin cambiar lo que se ve.
  const [state, setState] = useState<CrearState>(() => emptyState(mode));
  // Reintentar la carga de la edición vuelve a derivar el estado sin cambiar la
  // entrada; el contador es lo único que hace falta para disparar el efecto.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Cada visita (formKey) y cada resolución de identidad vuelven a derivar el
    // formulario: es una sincronización con una fuente externa (la entrada de C2 y
    // la sesión), no un estado derivado que la regla del linter describa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(
      deriveState(
        { mode, preselectedWork, preselectedWorkId, editingOpinionId },
        viewerId,
        content,
        catalog,
      ),
    );
  }, [
    formKey,
    mode,
    preselectedWork,
    preselectedWorkId,
    editingOpinionId,
    viewerId,
    attempt,
    content,
    catalog,
  ]);

  const chooseWork = useCallback(
    (work: SelectedWork): void => {
      const own =
        viewerId === null
          ? null
          : findOwnOpinion(content, work.workId, viewerId);

      setState((previous) =>
        withValidity({
          ...previous,
          work,
          alreadyOpined: own !== null,
          ownOpinionId: own?.opinionId ?? null,
          submitError: null,
        }),
      );
    },
    [content, viewerId],
  );

  const changeText = useCallback((text: string): void => {
    // El campo ya recorta por `maxLength`; el tope aquí es la segunda mitad de la
    // regla, para que ni un valor pegado se cuele (BR11.3).
    setState((previous) =>
      withValidity({
        ...previous,
        text: text.slice(0, MAX_OPINION_LENGTH),
        submitError: null,
      }),
    );
  }, []);

  const rate = useCallback((value: number): void => {
    if (!isValidRating(value)) {
      return;
    }

    setState((previous) =>
      withValidity({ ...previous, rating: value, submitError: null }),
    );
  }, []);

  const clearRating = useCallback((): void => {
    setState((previous) =>
      withValidity({ ...previous, rating: 0, submitError: null }),
    );
  }, []);

  const publish = useCallback((): void => {
    if (
      state.status !== "ready" ||
      state.mode !== "create" ||
      !state.canSubmit ||
      state.work === null ||
      state.alreadyOpined ||
      viewerId === null
    ) {
      return;
    }

    const work = state.work;
    const result = content.createOpinion({
      authorId: viewerId,
      workId: work.workId,
      workTitle: work.title,
      workArtist: work.artist,
      text: state.text.trim(),
      rating: state.rating,
    });

    if (result.ok) {
      onDone({ kind: "published", opinion: result.value });
      return;
    }

    if (result.code === 409) {
      // Carrera con otra pestaña o con una comprobación previa fallida: la obra ya
      // tiene opinión propia, que es exactamente `YaOpinada` (BR11.6).
      const own = findOwnOpinion(content, work.workId, viewerId);

      setState((previous) =>
        withValidity({
          ...previous,
          alreadyOpined: true,
          ownOpinionId: own?.opinionId ?? previous.ownOpinionId,
          submitError: null,
        }),
      );
      return;
    }

    // `422` y cualquier otro fallo: el texto exacto sobre el botón, con todo
    // conservado para reintentar (BR11.7).
    setState((previous) => ({ ...previous, submitError: "publish" }));
  }, [state, viewerId, content, onDone]);

  const save = useCallback((): void => {
    if (
      state.status !== "ready" ||
      state.mode !== "edit" ||
      !state.canSubmit ||
      state.ownOpinionId === null ||
      viewerId === null
    ) {
      return;
    }

    const text = state.text.trim();
    const baseline = state.baseline;

    if (
      baseline !== null &&
      text === baseline.text.trim() &&
      state.rating === baseline.rating
    ) {
      // Ni escritura, ni `updatedAt`, ni confirmación (BR12.4).
      onDone({ kind: "unchanged" });
      return;
    }

    const result = content.updateOpinion({
      opinionId: state.ownOpinionId,
      authorId: viewerId,
      viewerId,
      text,
      rating: state.rating,
    });

    if (result.ok) {
      onDone({ kind: "saved", opinion: result.value });
      return;
    }

    if (result.code === 404) {
      // La opinión que se estaba editando ya no existe: es el error de carga, no el
      // de guardado (BR12.5).
      setState((previous) => ({
        ...previous,
        status: "loadError",
        submitError: null,
      }));
      return;
    }

    setState((previous) => ({ ...previous, submitError: "save" }));
  }, [state, viewerId, content, onDone]);

  const editExisting = useCallback((): void => {
    if (state.ownOpinionId === null) {
      return;
    }

    onEditExisting(state.ownOpinionId);
  }, [state.ownOpinionId, onEditExisting]);

  const retryLoad = useCallback((): void => {
    setAttempt((previous) => previous + 1);
  }, []);

  return {
    state,
    actions: {
      chooseWork,
      changeText,
      rate,
      clearRating,
      publish,
      save,
      editExisting,
      retryLoad,
    },
  };
}
