/**
 * Registro de los tres puertos de Spotify en el punto de composición (TS-21,
 * NFR3.11, NFR3.17).
 *
 * Una sola instancia de C7 y una sola del catálogo de Spotify: la sesión, la
 * búsqueda y la resolución comparten la misma máquina de token y el mismo cliente
 * HTTP. Construirlas por pantalla daría dos hidrataciones del token y dos respuestas
 * distintas a la misma pregunta (R-01, TS-18).
 *
 * Los tipos de los puertos se importan de `@melodify/catalog` y el paquete Spotify
 * los implementa estructuralmente; no se declara aquí ninguna copia. Sin client ID
 * la sesión arranca en `notConfigured` y los tres puertos siguen funcionando: la
 * búsqueda responde `offline` y las portadas vuelven al bloque con la inicial.
 */
import type { CatalogPorts } from "@melodify/catalog";
import {
  createSpotifyAuth,
  expoBrowser,
  expoCrypto,
  expoSecureStore,
  resolveRedirectUri,
} from "@melodify/spotify/auth";
import { createSpotifyCatalog } from "@melodify/spotify/catalog";

import { logger } from "./logger";

export type {
  CatalogPorts,
  ResolvePortFailure,
  ResolvePortResult,
  SearchPortFailure,
  SearchPortResult,
  SpotifyResolvePort,
  SpotifySearchPort,
  SpotifySessionPort,
  WorkView,
} from "@melodify/catalog";

const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? null;

/**
 * El redirect se resuelve una sola vez, al importar. `makeRedirectUri` necesita el
 * manifiesto de Expo y en Jest no existe; ahí se usa el esquema declarado en
 * `app.json`, que es el mismo valor que el manifiesto produciría. En el teléfono
 * manda siempre el valor del manifiesto o `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI`.
 */
function resolveBootstrapRedirectUri(): string {
  try {
    return resolveRedirectUri(process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI);
  } catch {
    return "melodify://spotify-callback";
  }
}

const redirectUri = resolveBootstrapRedirectUri();

/**
 * La única máquina de autorización de la app. `device.ts` es el único archivo de
 * C7 que toca módulos nativos; aquí solo se eligen sus adaptadores reales.
 */
export const spotifyAuth = createSpotifyAuth({
  clientId,
  redirectUri,
  secureStore: expoSecureStore,
  browser: expoBrowser,
  crypto: expoCrypto,
  // `globalThis.fetch` no se captura al importar: así una prueba puede sustituirlo
  // y el token se renueva con la implementación vigente.
  fetch: (url, init) => globalThis.fetch(url, init),
  clock: { now: () => Date.now() },
  log: logger,
});

/** El cliente de búsqueda y resolución; comparte el token con `spotifyAuth`. */
export const spotifyCatalog = createSpotifyCatalog({
  auth: spotifyAuth,
  log: logger,
});

/**
 * Los tres puertos tal como los ve C5. Son las mismas instancias que exporta este
 * módulo, no adaptadores nuevos: el catálogo puede comprobar la sesión y pedir la
 * búsqueda sin conocer el paquete (BR5.6, NFR3.11).
 */
export const catalogPorts: CatalogPorts = {
  session: spotifyAuth,
  search: spotifyCatalog,
  resolve: spotifyCatalog,
};
