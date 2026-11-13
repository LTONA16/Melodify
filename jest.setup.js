/**
 * Arnés común de las pruebas: los matchers de Testing Library y los dobles de los
 * módulos nativos que ninguna prueba debe tocar de verdad (TS-10). Cada prueba que
 * necesite otro comportamiento ajusta estos mismos dobles.
 */
require("@testing-library/react-native");

/**
 * Los iconos vectoriales cargan una fuente por red/asset al montar, lo que en Jest
 * deja actualizaciones fuera de `act`. Ninguna prueba mide el glifo: se sustituyen
 * por un nodo con su `testID`, que es lo que sí se afirma.
 */
jest.mock("@expo/vector-icons/Ionicons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    __esModule: true,
    default: ({ testID }) => React.createElement(Text, { testID }),
  };
});

/**
 * `SafeAreaProvider` real no pinta a sus hijos en Jest hasta medir la ventana, así
 * que la cáscara quedaría vacía. El doble pinta siempre y devuelve insets cero, que
 * es lo que necesita una prueba: el diseño con área segura se mide en el teléfono.
 */
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");
  const insets = { top: 0, left: 0, right: 0, bottom: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };

  return {
    SafeAreaProvider: ({ children }) =>
      React.createElement(View, null, children),
    SafeAreaView: ({ children, ...props }) =>
      React.createElement(View, props, children),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaFrameContext: React.createContext(frame),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { frame, insets },
  };
});

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
  setOptions: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
  isAvailableAsync: jest.fn(async () => true),
}));

/**
 * `expo-network` es el único módulo nativo que lee la red del sistema operativo
 * (C6). En Jest no existe: el doble responde «en línea» para que la app arranque
 * entera y las pruebas del adaptador lo sustituyan por su propia fábrica cuando
 * necesiten simular un cambio o un fallo (NFR4.5).
 */
jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: "WIFI",
  })),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));
