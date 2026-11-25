/**
 * El sobre de error del API y los códigos que puede devolver.
 *
 * Una sola forma para todos los fallos: `{ error: { code, message } }`, con un
 * mensaje en español, llano y accionable. El `code` es lo que programa la app (y
 * lo que las pruebas afirman); el mensaje es para la persona, nunca un detalle
 * técnico ni una traza.
 */

export type ApiErrorCode =
  | "not_found"
  | "validation_failed"
  | "handle_taken"
  | "invalid_credentials"
  | "token_expired"
  | "refresh_reused"
  | "not_opinion_owner"
  | "opinion_already_exists"
  | "cannot_follow_self"
  | "rate_limited"
  | "internal_error";

export interface ApiErrorDetail {
  /** Ruta del campo que no valida, con puntos (`author.handle`). */
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode | (string & {});
    message: string;
    details?: ApiErrorDetail[];
  };
}
