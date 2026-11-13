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
    "^@melodify/app-session$": "<rootDir>/packages/app-session/src",
    "^@melodify/app-shell$": "<rootDir>/packages/app-shell/src",
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
  // El suelo se mide por árbol: un paquete bien probado no compensa a otro (TS-10).
  coverageThreshold: {
    "./app/src/**": { lines: 80 },
    "./packages/design-system/src/**": { lines: 80 },
    "./packages/app-shell/src/**": { lines: 80 },
    "./packages/app-session/src/**": { lines: 80 },
  },
};
