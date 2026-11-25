/**
 * El adaptador de `expo-network` (C6, NFR4.5). Es el **único** archivo del
 * repositorio que importa `expo-network`: el resto de la app lee la red a través
 * de `Connectivity`, y una regla de lint cierra la puerta a los demás (se añade en
 * el paso de configuración de la unidad).
 *
 * De la respuesta del sistema operativo se usa un solo booleano. No se leen el
 * tipo de red, el SSID ni la dirección IP: no se necesitan, no se registran y no
 * salen del teléfono (NFR4.5). Tampoco se pide ningún permiso nuevo: Expo Go ya
 * declara `ACCESS_NETWORK_STATE`.
 *
 * Hay conexión cuando el dispositivo dice que está conectado y la accesibilidad a
 * internet no es explícitamente falsa. Si el módulo no devuelve estado —un binario
 * sin el módulo nativo—, la lectura **lanza** para que `Connectivity` degrade a
 * «en línea» y lo registre (BR6.3), en vez de informar de una falta de red que no
 * existe.
 */
import * as Network from "expo-network";

import type { NetworkAdapter, NetworkAdapterState } from "./connectivity";

function isOnline(state: Network.NetworkState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export const expoNetworkAdapter: NetworkAdapter = {
  async getState(): Promise<NetworkAdapterState> {
    const state = await Network.getNetworkStateAsync();

    if (state === null || typeof state !== "object") {
      throw new Error("expo-network no devolvió un estado de red");
    }

    return { online: isOnline(state) };
  },

  addListener(listener) {
    const subscription = Network.addNetworkStateListener((state) => {
      listener({ online: isOnline(state) });
    });

    // Un adaptador que no devuelve suscripción no puede dar de baja nada; el
    // contrato de C6 promete una función, así que siempre se devuelve una.
    return () => {
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      }
    };
  },
};
