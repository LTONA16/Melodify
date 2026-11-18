/**
 * El adaptador de dispositivo de `@melodify/spotify` (TS-31, NFR3.17).
 *
 * Es el **único** archivo del paquete que importa módulos de Expo: almacén seguro,
 * navegador del sistema, criptografía y `makeRedirectUri`. El resto del paquete
 * recibe estas piezas inyectadas, así que sus pruebas no tocan un módulo nativo y el
 * límite se puede comprobar leyendo los imports (plan paso 6).
 *
 * Decisiones:
 * - **El redirect explícito gana**: `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` permite
 *   registrar en el panel de Spotify el valor exacto que la instalación usa. Si no
 *   está, se calcula con `makeRedirectUri({ path: "spotify-callback" })`, que es el
 *   que funciona en Expo Go sin esquema propio ni dev client (BR16.2).
 * - **El navegador se normaliza**: `dismiss` y `locked` son una cancelación para la
 *   máquina de estados; solo `success` trae un redirect que intercambiar.
 * - **La criptografía se reduce a dos operaciones**: bytes aleatorios y SHA-256. La
 *   codificación base64url la hace `pkce.ts`, no el adaptador.
 */
import * as Crypto from "expo-crypto";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

import type {
  BrowserAdapter,
  BrowserAuthResult,
  CryptoAdapter,
  SecureStoreAdapter,
} from "../types";

export const expoSecureStore: SecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

export const expoBrowser: BrowserAdapter = {
  async openAuthSessionAsync(url, redirectUri): Promise<BrowserAuthResult> {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);

    if (result.type === "success") {
      return { type: "success", url: result.url };
    }

    return { type: "cancel" };
  },
};

function hexToBytes(hex: string): Uint8Array {
  const length = Math.floor(hex.length / 2);
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    const pair = hex.slice(index * 2, index * 2 + 2);
    bytes[index] = Number.parseInt(pair, 16);
  }

  return bytes;
}

export const expoCrypto: CryptoAdapter = {
  randomBytes: (length) => Crypto.getRandomBytes(length),
  async sha256(text) {
    const hex = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      text,
    );
    return hexToBytes(hex);
  },
};

/** El redirect exacto que esta instalación usa, sin tocar el panel de Spotify. */
export function resolveRedirectUri(
  explicit: string | null | undefined,
): string {
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit;
  }

  return makeRedirectUri({ path: "spotify-callback" });
}
