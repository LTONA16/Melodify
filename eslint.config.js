/**
 * ESLint del monorepo (NFR3.2 y R-03 de NFR Design). Un solo archivo en la raíz,
 * que es lo que ejecuta el CI: `eslint .` recorre `app/` y `packages/*`.
 *
 * Las prohibiciones de importación no son estilo, son límites de la arquitectura:
 * - `expo-secure-store` solo lo toca el adaptador de la sesión; una pantalla que lo
 *   importe estaría saltándose C3.
 * - `expo-network` solo lo toca el adaptador de C6; el resto lee la red por el
 *   contrato de conectividad, que es lo único que las pruebas pueden doblar.
 * - Un paquete no importa la app: las dependencias van de `app/` hacia los paquetes.
 * - `@react-native-async-storage/async-storage` no se usa en ningún sitio: el
 *   recuerdo de sesión y el token de Spotify viven en el almacenamiento seguro.
 * - `@melodify/catalog` y `@melodify/spotify` no se conocen en tiempo de ejecución
 *   (NFR3.11). La segunda regla solo morderá cuando U4 cree el paquete de Spotify.
 */
const expoConfig = require("eslint-config-expo/flat");

const SECURE_STORE_ADAPTER = "packages/app-session/src/secure-store-adapter.ts";
const EXPO_NETWORK_ADAPTER = "packages/connectivity/src/expo-network-adapter.ts";
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

const CACHE_FIRST_RESTRICTIONS = {
  paths: [ASYNC_STORAGE_RESTRICTION],
  patterns: [PACKAGE_TO_APP_RESTRICTION],
};

const SECURE_STORE_RESTRICTION = {
  name: "expo-secure-store",
  message:
    "Solo el adaptador de @melodify/app-session toca el almacenamiento seguro (NFR3.3).",
};

const EXPO_NETWORK_RESTRICTION = {
  name: "expo-network",
  message:
    "Solo el adaptador de @melodify/connectivity lee la red del sistema (NFR4.5).",
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
            SECURE_STORE_RESTRICTION,
            EXPO_NETWORK_RESTRICTION,
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
    // las otras prohibiciones siguen aplicándose dentro de él.
    files: [SECURE_STORE_ADAPTER],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [EXPO_NETWORK_RESTRICTION, ASYNC_STORAGE_RESTRICTION],
          patterns: [PACKAGE_TO_APP_RESTRICTION],
        },
      ],
    },
  },
  {
    // Y este es el único autorizado a importar `expo-network`, por la misma razón:
    // el resto de la app lee la red por el contrato de C6 (NFR4.5).
    files: [EXPO_NETWORK_ADAPTER],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [SECURE_STORE_RESTRICTION, ASYNC_STORAGE_RESTRICTION],
          patterns: [PACKAGE_TO_APP_RESTRICTION],
        },
      ],
    },
  },
  {
    // Los dos paquetes que se tocarán en U4 no se conocen en ejecución: el catálogo
    // puede nombrar tipos de Spotify, nunca importar su código; Spotify no puede
    // importar el catálogo ni siquiera como tipo (NFR3.11).
    files: ["packages/catalog/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@melodify/spotify",
              message:
                "El catálogo no importa Spotify: le habla por sus puertos (NFR3.11).",
              allowTypeImports: false,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/spotify/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@melodify/catalog",
              message:
                "Spotify no importa el catálogo, ni sus tipos: los tipos de los puertos viven en el catálogo (NFR3.11).",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    // Las pruebas doblan los módulos nativos y por eso los importan para burlarse de
    // ellos: la prohibición es de código de producción, no de los dobles.
    files: ["**/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          ...CACHE_FIRST_RESTRICTIONS,
        },
      ],
    },
  },
];
