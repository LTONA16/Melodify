/**
 * ESLint del monorepo (NFR3.2 y R-03 de NFR Design). Un solo archivo en la raíz,
 * que es lo que ejecuta el CI: `eslint .` recorre `app/` y `packages/*`.
 *
 * Las tres prohibiciones de importación no son estilo, son límites de la
 * arquitectura:
 * - `expo-secure-store` solo lo toca el adaptador de la sesión; una pantalla que lo
 *   importe estaría saltándose C3.
 * - Un paquete no importa la app: las dependencias van de `app/` hacia los paquetes.
 * - `@react-native-async-storage/async-storage` no se usa en ningún sitio: el
 *   recuerdo de sesión y el token de Spotify viven en el almacenamiento seguro.
 */
const expoConfig = require("eslint-config-expo/flat");

const SECURE_STORE_ADAPTER = "packages/app-session/src/secure-store-adapter.ts";
const PROJECT_LOGGER = "app/src/bootstrap/logger.ts";

const ASYNC_STORAGE_RESTRICTION = {
  name: "@react-native-async-storage/async-storage",
  message:
    "La sesión y el token viven en el almacenamiento seguro, no en AsyncStorage (NFR3.3).",
};

const PACKAGE_TO_APP_RESTRICTION = {
  group: ["@melodify/app", "**/app/**"],
  message:
    "Un paquete no importa la app: las dependencias van de la app a los paquetes (C1–C3).",
};

module.exports = [
  ...expoConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "coverage/**",
      "**/.expo/**",
      // Árboles del arnés de AI-DLC y del harness: no son código de la app y el
      // CI no los mantiene.
      ".aidlc/**",
      ".opencode/**",
      ".claude/**",
      ".kiro/**",
      ".codex/**",
      ".cursor/**",
    ],
  },
  {
    // Los dos archivos de configuración de Jest usan globals de Node y su API,
    // que el preset no declara.
    files: ["jest.config.js", "jest.setup.js"],
    languageOptions: {
      globals: { __dirname: "readonly", jest: "readonly" },
    },
  },
  {
    rules: {
      // El logger del proyecto es el único sitio que escribe en consola (NFR9.1).
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "expo-secure-store",
              message:
                "Solo el adaptador de @melodify/app-session toca el almacenamiento seguro (NFR3.3).",
            },
            ASYNC_STORAGE_RESTRICTION,
          ],
          patterns: [PACKAGE_TO_APP_RESTRICTION],
        },
      ],
    },
  },
  {
    // La excepción de `console` se declara aquí y solo aquí.
    files: [PROJECT_LOGGER],
    rules: {
      "no-console": "off",
    },
  },
  {
    // El adaptador es el único archivo autorizado a importar `expo-secure-store`;
    // las otras dos prohibiciones siguen aplicándose dentro de él.
    files: [SECURE_STORE_ADAPTER],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [ASYNC_STORAGE_RESTRICTION],
          patterns: [PACKAGE_TO_APP_RESTRICTION],
        },
      ],
    },
  },
  {
    // Las pruebas doblan el módulo nativo y por eso lo importan para burlarse de
    // él: la prohibición es de código de producción, no de los dobles.
    files: ["**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [ASYNC_STORAGE_RESTRICTION],
          patterns: [PACKAGE_TO_APP_RESTRICTION],
        },
      ],
    },
  },
];
