import type { ApiErrorCode, ApiErrorDetail } from "@melodify/contracts";

/**
 * Un fallo que ya sabe qué responder.
 *
 * Se lanza desde el módulo que conoce la regla (una opinión duplicada, un
 * `handle` ocupado) y el manejador de errores lo traduce al sobre HTTP. Así la
 * regla de negocio no construye respuestas ni conoce Fastify.
 */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
