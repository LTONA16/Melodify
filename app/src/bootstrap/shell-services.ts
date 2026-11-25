import type { ShellServices } from "@melodify/app-shell";

import { commentsController } from "./comments";
import { connectivity } from "./instances";
import { spotifyAuth } from "./ports";

/**
 * Los servicios por defecto de la cáscara (C2, tabla de la revisión de U2).
 *
 * La red ya no es el valor fijo de U1 (BR6.4): `online` es el estado vigente de C6
 * y `subscribe` reenvía sus emisiones —la primera llega al establecerse, así que
 * la pantalla no arranca con un estado inventado—.
 *
 * Spotify ya es la máquina real de C7 (`ports.ts`): `status` lee el estado vigente
 * y `subscribe` reenvía sus emisiones tal cual. No se emite un estado inventado al
 * suscribirse: mientras la hidratación del token no termina, la pantalla ve `null`
 * y puede pintar carga (R-07); en cuanto C7 hidrata, la suscripción recibe el
 * estado real. Las tres acciones se delegan sin envolverlas, para que la identidad
 * de la máquina sea la misma que la del punto de composición.
 *
 * Los comentarios siguen siendo los de verdad (1.3.0): el controlador de
 * `app/src/comments/` lee y escribe en C4 con la identidad de C3, y la cáscara lo
 * consume a través del contrato, sin conocer el almacén (LC-1).
 */
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
    get status() {
      return spotifyAuth.getState().status;
    },
    subscribe: (listener) =>
      spotifyAuth.subscribe((view) => listener(view.status)),
    connect: () => spotifyAuth.connect(),
    disconnect: () => spotifyAuth.disconnect(),
    retry: () => spotifyAuth.retry(),
  },
  comments: commentsController,
};
