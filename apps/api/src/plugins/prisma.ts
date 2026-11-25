import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

/**
 * El cliente de base de datos como decorador del servidor: `app.prisma`.
 *
 * Una sola instancia por proceso, cerrada en `onClose` para que las pruebas no
 * dejen conexiones abiertas (Vitest se queda esperando si las hay). El cliente
 * puede inyectarse: las pruebas de la sonda de salud no necesitan una base real,
 * y las que sí la necesitan apuntan a `melodify_test`.
 */
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export interface RegisterPrismaOptions {
  /** Cliente ya construido (pruebas). Si falta, se construye con la configuración del entorno. */
  client?: PrismaClient;
}

export function registerPrisma(
  app: FastifyInstance,
  options: RegisterPrismaOptions = {},
): PrismaClient {
  const client = options.client ?? new PrismaClient();

  app.decorate("prisma", client);
  app.addHook("onClose", async () => {
    await client.$disconnect();
  });

  return client;
}
