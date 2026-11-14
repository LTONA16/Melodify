import type { ShellServices } from "@melodify/app-shell";

import { connectivity } from "./instances";

/**
 * Los servicios por defecto de la cáscara (C2, tabla de la revisión de U2).
 *
 * La red ya no es el valor fijo de U1 (BR6.4): `online` es el estado vigente de C6
 * y `subscribe` reenvía sus emisiones —la primera llega al establecerse, así que la
 * pantalla no arranca con un estado inventado—. Spotify y comentarios siguen con
 * sus valores por defecto: U4 y U5 los sustituirán en este mismo archivo, sin tocar
 * la cáscara.
 *
 * Ninguna acción lanza ni hace nada todavía: una pantalla puede llamarlas desde el
 * primer día y no rompe nada.
 */
const noopUnsubscribe = () => {};

export const defaultShellServices: ShellServices = {
  network: {
    // Un lector y no una foto: la cáscara lee `online` al montar la pantalla, y una
    // copia tomada al importar el módulo seguiría diciendo «en línea» después de un
    // corte. La suscripción emite además el valor vigente al establecerse (BR6.4).
    get online() {
      return connectivity.getNetworkState().online;
    },
    subscribe: (listener) =>
      connectivity.subscribeNetwork((state) => listener(state.online)),
  },
  spotify: {
    status: "disconnected",
    subscribe: () => noopUnsubscribe,
    connect: () => {},
    disconnect: () => {},
    retry: () => {},
  },
  comments: {
    state: {
      opinionId: null,
      comments: [],
      status: "empty",
    },
    subscribe: () => noopUnsubscribe,
    open: () => {},
    close: () => {},
    retry: () => {},
    submit: () => {},
  },
};
