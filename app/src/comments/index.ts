/**
 * Superficie de `app/src/comments/` (U3): el controlador de la hoja y el mapeo de
 * C4 a C1. La composición construye el controlador una sola vez y lo entrega a la
 * cáscara dentro de `ShellServices.comments`.
 */
export {
  COMMENT_COUNTER_FROM,
  createCommentsController,
  type CommentsContentPort,
  type CommentsController,
  type CommentsControllerDeps,
  type CommentsSessionPort,
} from "./createCommentsController";
export { toCommentModel } from "./toCommentModel";
