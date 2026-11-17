/**
 * El mapeo de C4 a C1 para la hoja de comentarios (U3): el único sitio donde un
 * `CommentView` se convierte en `CommentModel`.
 *
 * Está aparte porque lo usan dos caminos —la lista que se lee y el comentario que
 * se acaba de escribir— y dos copias del mapeo acabarían discrepando en el handle
 * o en el nombre. El sistema de diseño no conoce el almacén: recibe nombre y
 * handle ya planos (LC-2).
 */
import type { CommentView } from "@melodify/content-store";
import type { CommentModel } from "@melodify/design-system";

export function toCommentModel(view: CommentView): CommentModel {
  return {
    commentId: view.commentId,
    authorName: view.author.displayName,
    authorHandle: view.author.handle,
    text: view.text,
    createdAt: view.createdAt,
  };
}
