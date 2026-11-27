import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  apiErrorBodySchema,
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
  sessionViewSchema,
} from "@melodify/contracts/schemas";

/**
 * Las rutas de cuentas y sesiones.
 *
 * Límites por ruta: registrar e iniciar sesión son las puertas caras (Argon2id)
 * y las que un atacante probaría en masa, así que van más apretadas que el
 * resto. El límite se cuenta por IP y por ventana; el `429` sale con el mismo
 * sobre de error que todo lo demás.
 */
const CREDENTIALS_RATE_LIMIT = { max: 20, timeWindow: "1 minute" } as const;
const SESSION_RATE_LIMIT = { max: 60, timeWindow: "1 minute" } as const;

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/auth/register",
    {
      config: { rateLimit: CREDENTIALS_RATE_LIMIT },
      schema: {
        tags: ["cuentas"],
        summary: "Crea una cuenta y abre una sesión",
        body: registerBodySchema,
        response: {
          201: sessionViewSchema,
          409: apiErrorBodySchema,
          422: apiErrorBodySchema,
        },
      },
    },
    async (request, reply) => {
      const session = await app.auth.register(request.body);
      return reply.code(201).send(session);
    },
  );

  app.post(
    "/auth/login",
    {
      config: { rateLimit: CREDENTIALS_RATE_LIMIT },
      schema: {
        tags: ["cuentas"],
        summary: "Inicia sesión con handle y contraseña",
        body: loginBodySchema,
        response: {
          200: sessionViewSchema,
          401: apiErrorBodySchema,
          422: apiErrorBodySchema,
        },
      },
    },
    async (request, reply) => {
      const session = await app.auth.login(request.body);
      return reply.code(200).send(session);
    },
  );

  app.post(
    "/auth/refresh",
    {
      config: { rateLimit: SESSION_RATE_LIMIT },
      schema: {
        tags: ["cuentas"],
        summary: "Rota el refresh token y emite un par nuevo",
        body: refreshBodySchema,
        response: {
          200: sessionViewSchema,
          401: apiErrorBodySchema,
          422: apiErrorBodySchema,
        },
      },
    },
    async (request, reply) => {
      const session = await app.auth.refresh(request.body.refreshToken);
      return reply.code(200).send(session);
    },
  );

  app.post(
    "/auth/logout",
    {
      config: { rateLimit: SESSION_RATE_LIMIT },
      schema: {
        tags: ["cuentas"],
        summary: "Cierra la sesión de ese refresh token",
        body: refreshBodySchema,
        response: { 204: z.null(), 422: apiErrorBodySchema },
      },
    },
    async (request, reply) => {
      await app.auth.logout(request.body.refreshToken);
      return reply.code(204).send(null);
    },
  );
};
