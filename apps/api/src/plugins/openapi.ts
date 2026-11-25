import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * La documentación se genera de los mismos esquemas Zod que validan las
 * peticiones: si la especificación y la validación se escribieran dos veces,
 * acabarían contando cosas distintas.
 *
 * Vive bajo `/api/v1/docs` y solo en desarrollo: en producción el servicio no
 * publica su superficie de depuración.
 */
export function registerOpenApi(app: FastifyInstance, version: string): void {
  app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Melodify API",
        description:
          "API social de Melodify: cuentas, opiniones, me gusta, comentarios, seguimientos, feed y actividad. Spotify no pasa por aquí: la app sigue hablando con Spotify directamente.",
        version,
      },
      tags: [{ name: "salud", description: "Sonda de vida del servicio" }],
    },
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: "/api/v1/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });
}
