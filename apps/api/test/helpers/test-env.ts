import type { Env } from "../../src/config/env";

/**
 * La base de pruebas y el entorno que comparten todos los archivos de prueba.
 *
 * La base vive en la misma instancia de Postgres que desarrollo, con otro
 * nombre: así las migraciones son las mismas y ninguna prueba borra los datos
 * con los que alguien está trabajando.
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://melodify:melodify@localhost:55432/melodify_test?schema=public";

export function testEnv(overrides: Partial<Env> = {}): Env {
  return {
    NODE_ENV: "test",
    HOST: "127.0.0.1",
    PORT: 3100,
    DATABASE_URL: TEST_DATABASE_URL,
    JWT_ACCESS_SECRET: "x".repeat(40),
    ACCESS_TOKEN_TTL: "15m",
    REFRESH_TOKEN_TTL_DAYS: 30,
    CORS_ORIGINS: [],
    SEED_DEMO: "false",
    ...overrides,
  };
}
