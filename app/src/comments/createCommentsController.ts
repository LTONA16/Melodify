/**
 * El controlador de la hoja de comentarios (U3): el dueño del estado que la
 * cáscara pinta y de las cuatro acciones de `ShellServices.comments`.
 *
 * Por qué existe: la cáscara no conoce C4 —solo recibe `CommentSheetState`— y la
 * pantalla que abre la hoja no puede ser la dueña de su estado, porque la hoja se
 * monta en la cáscara y sobrevive al cambio de pestaña. Este módulo es la única
 * pieza que lee y escribe comentarios.
 *
 * Decisiones:
 * - **Síncrono, como C4.** `submit` devuelve `boolean` y no una promesa: la
 *   escritura ya terminó cuando responde, y la cáscara usa ese resultado para
 *   pedir «Comentario publicado» sin que el controlador sepa que hay un aviso.
 * - **Sin `getSession()`.** La identidad se toma de `subscribeSession`, que emite
 *   el valor vigente al establecerse: `getSession` es una promesa, y esperarla
 *   obligaría a `submit` a devolver una promesa que el contrato de C2 1.3.0 no
 *   pide. Además, así el controlador se prueba sin resolver nada.
 * - **El estado solo cambia cuando cambia algo.** La cáscara lo lee con
 *   `useSyncExternalStore`, así que devolver un objeto nuevo en cada lectura
 *   volvería a pintar la app sin motivo.
 * - **Un solo objeto cerrado, reutilizado.** Cerrar no deja residuos: la lista, el
 *   error de envío y la opinión se van juntos, y con ellos el borrador que vive en
 *   la pieza (BR14.5).
 * - **No conoce la navegación, ni la pestaña activa, ni el aviso.** Su superficie
 *   es la de `ShellServices.comments`; nada más.
 */
import type { AppSession } from "@melodify/app-session";
import type { CommentSheetState } from "@melodify/app-shell";
import {
  MAX_COMMENT_LENGTH,
  type CommentView,
  type ContentResult,
  type ContentStore,
} from "@melodify/content-store";

import { toCommentModel } from "./toCommentModel";

/**
 * Desde cuántos caracteres se pinta el contador del comentario. 250 sobre 300
 * avisa cuando queda un sexto de margen, no desde el primer carácter (BR14.5).
 */
export const COMMENT_COUNTER_FROM = 250;

/** Lo que el controlador necesita de C4: leer la lista y escribir un comentario. */
export type CommentsContentPort = Pick<
  ContentStore,
  "listComments" | "addComment"
>;

/** Lo que el controlador necesita de C3: quién escribe. */
export type CommentsSessionPort = Pick<AppSession, "subscribeSession">;

export interface CommentsControllerDeps {
  content: CommentsContentPort;
  session: CommentsSessionPort;
}

export interface CommentsController {
  /** El estado vigente; cambia de identidad solo cuando cambia algo. */
  readonly state: CommentSheetState;
  /** Emite el estado vigente al establecerse y en cada cambio. Devuelve la baja. */
  subscribe(listener: (state: CommentSheetState) => void): () => void;
  open(opinionId: string): void;
  close(): void;
  retry(): void;
  submit(text: string): boolean;
}

function closedState(): CommentSheetState {
  return {
    opinionId: null,
    comments: [],
    status: "empty",
    failed: false,
    maxLength: MAX_COMMENT_LENGTH,
    counterFrom: COMMENT_COUNTER_FROM,
  };
}

export function createCommentsController({
  content,
  session,
}: CommentsControllerDeps): CommentsController {
  const listeners = new Set<(state: CommentSheetState) => void>();
  let state = closedState();
  // Sin sesión resuelta no hay quién escriba. La suscripción de abajo emite el
  // valor en cuanto existe, y el arranque de la app ya la resolvió antes de
  // montar la cáscara (F1), así que en el teléfono siempre está puesto.
  let authorId: string | null = null;

  function emit(): void {
    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function update(patch: Partial<CommentSheetState>): void {
    state = { ...state, ...patch };
    emit();
  }

  function read(opinionId: string): void {
    const result = content.listComments({ opinionId });

    if (!result.ok) {
      // Leer un comentario falla entero: no se deja media lista de una lectura
      // anterior que ya no corresponde a esta opinión.
      update({ comments: [], status: "error", failed: false });
      return;
    }

    const comments = result.value.map(toCommentModel);

    update({
      comments,
      status: comments.length === 0 ? "empty" : "ready",
      failed: false,
    });
  }

  function addComment(
    opinionId: string,
    text: string,
  ): ContentResult<CommentView, 201> {
    // `authorId` se comprobó antes de llamar; el `??` existe para que el tipo no
    // mienta y para que un fallo de la sesión no escriba en nombre de nadie.
    return content.addComment({ opinionId, authorId: authorId ?? "", text });
  }

  session.subscribeSession((view) => {
    authorId = view.authorId;
  });

  return {
    get state() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);
      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },

    open(opinionId) {
      // El estado «cargando» se emite aunque la lectura sea síncrona: una lectura
      // que tarda una promesa en otro almacén no puede llegar a una hoja que
      // nunca supo que estaba cargando.
      state = {
        ...closedState(),
        opinionId,
        status: "loading",
      };
      emit();
      read(opinionId);
    },

    close() {
      state = closedState();
      emit();
    },

    retry() {
      const opinionId = state.opinionId;

      // El reintento es de la lista que está a la vista: con la hoja cerrada no
      // hay nada que releer (y no se abre una hoja por accidente).
      if (opinionId === null) {
        return;
      }

      update({ status: "loading" });
      read(opinionId);
    },

    submit(text) {
      const trimmed = text.trim();
      const opinionId = state.opinionId;

      if (opinionId === null || trimmed === "" || authorId === null) {
        // Un envío vacío no es un fallo que merezca «No pudimos enviar tu
        // comentario»: no se escribe, no se marca `failed` y se dice que no.
        if (opinionId !== null && trimmed !== "" && authorId === null) {
          update({ failed: true });
        }
        return false;
      }

      const result = addComment(opinionId, trimmed);

      if (!result.ok) {
        // La lista leída no se toca: lo que falló fue la escritura, no la lectura
        // (BR14.5). La hoja conserva el texto porque el borrador es suyo.
        update({ failed: true });
        return false;
      }

      update({
        comments: [...state.comments, toCommentModel(result.value)],
        status: "ready",
        failed: false,
      });

      return true;
    },
  };
}
