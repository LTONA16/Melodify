/**
 * Superficie pública de `@melodify/connectivity` (C6 1.0.0).
 *
 * `createConnectivity` es la única fábrica y el adaptador de `expo-network` viaja
 * con ella porque es el que monta el punto de composición de la app; las pruebas
 * lo sustituyen por un doble. `NetworkAdapter` se publica para que ese doble —y
 * cualquier otra plataforma— pueda implementarse sin copiar la forma a mano.
 *
 * `NetworkLogger` viaja porque `CreateConnectivityOptions` lo referencia: sin él,
 * la degradación de C6 no se podría inyectar desde fuera (NFR9.4).
 */
export { createConnectivity } from "./connectivity";
export type {
  Connectivity,
  CreateConnectivityOptions,
  NetworkAdapter,
  NetworkAdapterState,
  NetworkLogCode,
  NetworkLogger,
  NetworkView,
} from "./connectivity";
export { expoNetworkAdapter } from "./expo-network-adapter";
