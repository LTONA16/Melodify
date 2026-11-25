import type { PrismaClient } from "@prisma/client";

import { buildApp } from "../../src/app";
import { testEnv } from "./test-env";

/**
 * El servidor montado para una prueba, sin red y sin puerto.
 *
 * El cliente de base de datos se sustituye por un doble salvo que la prueba pida
 * uno real: la sonda de salud solo necesita saber si la consulta responde, no
 * tener un Postgres delante.
 */
export interface PrismaProbeStub {
  $queryRawUnsafe: (query: string) => Promise<unknown>;
  $disconnect: () => Promise<void>;
}

export function prismaStub(overrides: Partial<PrismaProbeStub> = {}): PrismaClient {
  const stub: PrismaProbeStub = {
    $queryRawUnsafe: async () => [{ existe: 1 }],
    $disconnect: async () => undefined,
    ...overrides,
  };

  // Doble de prueba deliberado: el servidor solo usa estas dos puertas en esta
  // etapa. Un cliente real llegará cuando haya datos que leer.
  return stub as unknown as PrismaClient;
}

export interface BuildTestAppOptions {
  prisma?: PrismaClient;
  docs?: boolean;
}

export function buildTestApp(options: BuildTestAppOptions = {}) {
  return buildApp({
    env: testEnv(),
    prisma: options.prisma ?? prismaStub(),
    logger: false,
    docs: options.docs ?? false,
  });
}
