/**
 * La zona horaria se fija antes de que Jest arranque sus workers: el archivo de
 * configuración se carga en el proceso padre y los workers heredan el entorno.
 * Ponerla en `jest.setup.js` no basta: allí llega tarde y la zona del runner
 * sigue mandando (en el CI, UTC), que es justo lo que hacía fallar la prueba de
 * la medianoche.
 */
process.env.TZ = "Europe/Madrid";

/**
 * Un solo proyecto de Jest para todo el monorepo (TS-10): la raíz manda y ningún
 * paquete tiene script propio. Los paquetes internos se resuelven a su `src`
 * porque Metro y Babel ya compilan TypeScript; así las pruebas no dependen de un
 * `dist` construido.
 */
module.exports = {
  preset: "jest-expo",
  rootDir: __dirname,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@melodify/design-system$": "<rootDir>/packages/design-system/src",
    "^@melodify/activity$": "<rootDir>/packages/activity/src",
    "^@melodify/app-session$": "<rootDir>/packages/app-session/src",
    "^@melodify/app-shell$": "<rootDir>/packages/app-shell/src",
    "^@melodify/content-store$": "<rootDir>/packages/content-store/src",
    "^@melodify/catalog$": "<rootDir>/packages/catalog/src",
    "^@melodify/connectivity$": "<rootDir>/packages/connectivity/src",
    "^@melodify/spotify$": "<rootDir>/packages/spotify/src",
    "^@melodify/spotify/auth$": "<rootDir>/packages/spotify/src/auth",
    "^@melodify/spotify/catalog$": "<rootDir>/packages/spotify/src/catalog",
  },
  testMatch: [
    "<rootDir>/app/src/**/*.test.{ts,tsx}",
    "<rootDir>/packages/*/src/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "app/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/*.test.{ts,tsx}",
    "!**/jest.setup.*",
    "!app/index.ts",
  ],
  // Las pruebas de pantalla montan el árbol completo con `findBy*`, y con la
  // instrumentación de cobertura el arranque de la app pasa de los 5 s por defecto.
  // El límite es de la suite entera, no de una prueba floja: el presupuesto de 2 s
  // del arranque se mide en el teléfono (NFR8.1), no aquí.
  testTimeout: 20000,
  // El suelo se mide por árbol: un paquete bien probado no compensa a otro (TS-10).
  coverageThreshold: {
    "./app/src/**": { lines: 80 },
    "./packages/design-system/src/**": { lines: 80 },
    "./packages/activity/src/**": { lines: 80 },
    "./packages/app-shell/src/**": { lines: 80 },
    "./packages/app-session/src/**": { lines: 80 },
    "./packages/content-store/src/**": { lines: 80 },
    "./packages/catalog/src/**": { lines: 80 },
    "./packages/connectivity/src/**": { lines: 80 },
    "./packages/spotify/src/**": { lines: 80 },
  },
};
