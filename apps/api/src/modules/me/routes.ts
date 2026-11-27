import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

import { apiErrorBodySchema, userViewSchema } from "@melodify/contracts/schemas";

/**
 * `GET /me`: la cuenta dueña de la sesión.
 *
 * Es la primera llamada que hace la app al arrancar para saber si el access
 * token guardado sigue sirviendo. Devuelve la misma vista que un perfil, pero
 * sin pedir nada más: la identidad sale del token, no de la URL.
 */
export const meRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/me",
    {
      preHandler: app.authenticate,
      schema: {
        tags: ["cuentas"],
        summary: "La cuenta de la sesión actual",
        response: { 200: userViewSchema, 401: apiErrorBodySchema },
      },
    },
    async (request) => app.auth.me(request.user.sub),
  );
};
