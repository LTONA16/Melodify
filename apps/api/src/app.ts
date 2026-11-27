import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import type { Env } from "./config/env";
import { loggerOptions } from "./lib/logger";
import { authRoutes } from "./modules/auth/routes";
import { healthRoutes } from "./modules/health/routes";
import { meRoutes } from "./modules/me/routes";
import { registerAuth } from "./plugins/auth";
import { registerErrorHandling } from "./plugins/errors";
import { registerOpenApi } from "./plugins/openapi";
import { registerPrisma } from "./plugins/prisma";
import { API_VERSION } from "./version";

/**
 * El servidor, construido sin abrir puerto.
 *
 * `buildApp` es puro a propósito: las pruebas lo montan con `inject` (sin red,
 * sin puerto, sin procesos hijos) y el arranque real solo añade `listen`. Todo
 * lo que el servidor sabe hacer queda así probado contra la misma composición
 * que corre en el teléfono.
 *
 * Orden de registro: los manejadores de error primero (para que cubran todo),
 * el cliente de base de datos antes de cualquier ruta que lo use, y la
 * documentación antes de las rutas para que las vea al registrarse.
 */
export interface BuildAppOptions {
  env: Env;
  /** Cliente de base de datos ya construido; si falta, se crea uno. */
  prisma?: PrismaClient;
  /** `false` silencia el registro en las pruebas. */
  logger?: boolean | Record<string, unknown>;
  /** Publica `/api/v1/docs`; por defecto, en todo entorno menos producción. */
  docs?: boolean;
}

export function buildApp(options: BuildAppOptions) {
  const { env } = options;
  const docs = options.docs ?? env.NODE_ENV !== "production";

  const app = Fastify({
    logger: options.logger ?? loggerOptions(env),
    bodyLimit: 64 * 1024,
    trustProxy: false,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  registerErrorHandling(app);
  registerPrisma(app, { client: options.prisma });
  registerAuth(app, env);

  if (docs) {
    registerOpenApi(app, API_VERSION);
  }

  app.register(helmet, { contentSecurityPolicy: false });
  app.register(cors, {
    // La app nativa no necesita CORS; se abre solo si alguien declara orígenes
    // (por ejemplo, para probar desde el navegador).
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : false,
  });
  app.register(rateLimit, {
    // Desactivado por defecto: cada ruta decide su límite. El de autenticación
    // será el estricto, y el resto hereda este marco.
    global: false,
  });

  app.register(healthRoutes, { prefix: "/api/v1" });
  app.register(authRoutes, { prefix: "/api/v1" });
  app.register(meRoutes, { prefix: "/api/v1" });

  return app;
}
