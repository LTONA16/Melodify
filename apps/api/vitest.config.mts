import { defineConfig } from "vitest/config";

/**
 * Las pruebas del API no comparten nada con Jest: el preset de la app es
 * `jest-expo` y arrastrarlo al servidor metería módulos nativos donde no hay
 * pantalla. Vitest corre en Node, contra un Fastify real sin abrir puerto
 * (`inject`) y contra el Postgres de `docker compose`.
 *
 * El suelo de cobertura se mide sobre `src/**` y excluye el arranque
 * (`src/server.ts`): abrir un puerto no es una unidad que se pueda probar sin
 * levantar el proceso entero, y su contenido es cableado.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    globalSetup: ["test/helpers/global-setup.ts"],
    env: { NODE_ENV: "test" },
    testTimeout: 20000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts"],
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
