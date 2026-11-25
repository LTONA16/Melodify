import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

import type { ApiErrorBody, ApiErrorCode, ApiErrorDetail } from "@melodify/contracts";

import { ApiError } from "../lib/errors";

/**
 * Un solo envoltorio de error para todo el API y un solo sitio que decide el
 * código HTTP.
 *
 * Qué garantiza:
 * - **Nada se filtra.** Un fallo inesperado responde 500 con un mensaje llano;
 *   el detalle (y la traza) se queda en el registro del servidor.
 * - **La validación es 422**, no 400: el cuerpo llegó bien formado pero trae
 *   datos que no cumplen la regla, y eso es lo que la app necesita distinguir.
 * - **El 429 del límite de peticiones** también habla el mismo idioma.
 *
 * El mensaje siempre va en español y dice qué puede hacer la persona; el `code`
 * es lo que programa la app.
 */
export interface ErrorResponse {
  statusCode: number;
  body: ApiErrorBody;
}

const VALIDATION_MESSAGE = "Revisa los datos: hay campos que no son válidos.";
const RATE_LIMITED_MESSAGE =
  "Has hecho demasiadas peticiones seguidas. Espera un momento y vuelve a intentarlo.";
const INTERNAL_MESSAGE = "Algo falló en el servidor. Inténtalo de nuevo.";
const NOT_FOUND_MESSAGE = "No encontramos lo que buscas.";

export function errorBody(
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetail[],
): ApiErrorBody {
  if (details !== undefined && details.length > 0) {
    return { error: { code, message, details } };
  }
  return { error: { code, message } };
}

interface FastifyLikeError {
  statusCode?: number;
  validation?: unknown;
}

function isFastifyLikeError(value: unknown): value is FastifyLikeError {
  return typeof value === "object" && value !== null;
}

/** `/author/handle` → `author.handle`, que es como lo lee una persona. */
function fieldPath(instancePath: string): string {
  const trimmed = instancePath.replace(/^\//, "").replace(/\//g, ".");
  return trimmed.length > 0 ? trimmed : "cuerpo";
}

function detailsFromValidation(validation: unknown): ApiErrorDetail[] {
  if (!Array.isArray(validation)) {
    return [];
  }

  return validation.map((item: unknown) => {
    const entry = (item ?? {}) as { instancePath?: unknown; message?: unknown };
    return {
      path:
        typeof entry.instancePath === "string" ? fieldPath(entry.instancePath) : "cuerpo",
      message: typeof entry.message === "string" ? entry.message : "no es válido",
    };
  });
}

function detailsFromZod(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "cuerpo",
    message: issue.message,
  }));
}

/**
 * La traducción de cualquier fallo a la respuesta HTTP. Es una función pura para
 * poder probarla sin levantar el servidor.
 */
export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      body: errorBody(error.code, error.message, error.details),
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 422,
      body: errorBody("validation_failed", VALIDATION_MESSAGE, detailsFromZod(error)),
    };
  }

  if (isFastifyLikeError(error)) {
    if (error.validation !== undefined) {
      return {
        statusCode: 422,
        body: errorBody(
          "validation_failed",
          VALIDATION_MESSAGE,
          detailsFromValidation(error.validation),
        ),
      };
    }

    if (error.statusCode === 429) {
      return { statusCode: 429, body: errorBody("rate_limited", RATE_LIMITED_MESSAGE) };
    }
  }

  return { statusCode: 500, body: errorBody("internal_error", INTERNAL_MESSAGE) };
}

export function registerErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const response = toErrorResponse(error);

    // El detalle se queda en el servidor: es lo único que permite diagnosticar
    // sin enseñar la traza a quien hizo la petición.
    if (response.statusCode >= 500) {
      request.log.error({ err: error }, "error no controlado");
    }

    return reply.code(response.statusCode).send(response.body);
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.code(404).send(errorBody("not_found", NOT_FOUND_MESSAGE));
  });
}
