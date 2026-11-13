import type { ShellServices } from "@melodify/app-shell";

/**
 * Valores por defecto de los servicios de la cáscara (C2, tabla de la revisión de
 * NFR Design). U1 no tiene red ni Spotify: la app arranca con estos valores y U2 y
 * U4 los sustituirán en este mismo archivo, sin tocar la cáscara.
 *
 * Ninguna acción lanza ni hace nada todavía: una pantalla puede llamarlas desde el
 * primer día y no rompe nada.
 */
const noopUnsubscribe = () => {};

export const defaultShellServices: ShellServices = {
  network: {
    online: true,
    subscribe: () => noopUnsubscribe,
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
