import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import type { HealthResponse } from "@melodify/contracts";
import { healthResponseSchema } from "@melodify/contracts/schemas";

import { API_VERSION } from "../../version";

/**
 * `GET /health`: ¿está vivo el servicio y alcanza su base de datos?
 *
 * El `503` no es un fallo del proceso, es la verdad: responde pero no puede
 * servir datos. Se devuelve el mismo cuerpo que el `200` para que quien lo
 * consuma no tenga que leer dos formas distintas.
 */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["salud"],
        summary: "Sonda de vida y de base de datos",
        response: { 200: healthResponseSchema, 503: healthResponseSchema },
      },
    },
    async (request, reply) => {
      try {
        await app.prisma.$queryRawUnsafe("SELECT 1");
        const payload: HealthResponse = {
          status: "ok",
          version: API_VERSION,
          database: "up",
        };
        return payload;
      } catch (error) {
        // Sin base de datos el servicio no sirve para nada, pero sigue vivo: se
        // registra el fallo y se responde 503 con un cuerpo que lo dice.
        request.log.error({ err: error }, "la base de datos no responde");
        const payload: HealthResponse = {
          status: "degraded",
          version: API_VERSION,
          database: "down",
        };
        return reply.code(503).send(payload);
      }
    },
  );
};
