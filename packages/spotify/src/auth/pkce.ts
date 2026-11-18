/**
 * PKCE S256 (RFC 7636) y la URL de autorización de Spotify (NFR3.17, TS-33).
 *
 * Por qué S256 y no `plain`: el `code_verifier` viaja en el intercambio del código y
 * el `code_challenge` en la URL que abre el navegador; con S256, quien vea la URL no
 * puede reconstruir el verifier. El cliente es público —una app móvil no puede
 * guardar un secreto— y PKCE es lo que sustituye al `client_secret` (CT-04).
 *
 * Decisiones:
 * - **32 bytes y base64url sin padding**: el resultado son 43 caracteres, dentro del
 *   rango que exige la RFC (43–128) y con solo el alfabeto permitido.
 * - **Sin scopes**: esta versión solo busca y lee portadas del catálogo público; pedir
 *   permisos de biblioteca o reproducción ampliaría el consentimiento sin usarlo.
 * - **El `state` es de 32 bytes y nuevo en cada arranque de conexión**: es lo que
 *   impide que un redirect ajeno se acepte como propio.
 */
import type { CryptoAdapter } from "../types";
import { SPOTIFY_ACCOUNTS_BASE } from "../http";

/** Bytes del `code_verifier` y del `state`: 32 producen 43 caracteres base64url. */
export const RANDOM_BYTES = 32;

/** Los scopes que pide esta versión: ninguno. */
export const PKCE_SCOPES = "";

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Codifica bytes en base64url sin padding, sin depender de `Buffer`. */
export function toBase64Url(bytes: Uint8Array): string {
  let output = "";
  let index = 0;

  while (index + 3 <= bytes.length) {
    const chunk =
      ((bytes[index] ?? 0) << 16) |
      ((bytes[index + 1] ?? 0) << 8) |
      (bytes[index + 2] ?? 0);
    output += BASE64URL_ALPHABET[(chunk >> 18) & 63];
    output += BASE64URL_ALPHABET[(chunk >> 12) & 63];
    output += BASE64URL_ALPHABET[(chunk >> 6) & 63];
    output += BASE64URL_ALPHABET[chunk & 63];
    index += 3;
  }

  const remaining = bytes.length - index;

  if (remaining === 1) {
    const chunk = (bytes[index] ?? 0) << 16;
    output += BASE64URL_ALPHABET[(chunk >> 18) & 63];
    output += BASE64URL_ALPHABET[(chunk >> 12) & 63];
  } else if (remaining === 2) {
    const chunk = ((bytes[index] ?? 0) << 16) | ((bytes[index + 1] ?? 0) << 8);
    output += BASE64URL_ALPHABET[(chunk >> 18) & 63];
    output += BASE64URL_ALPHABET[(chunk >> 12) & 63];
    output += BASE64URL_ALPHABET[(chunk >> 6) & 63];
  }

  return output;
}

/** Un `code_verifier` nuevo: 32 bytes aleatorios en base64url sin padding. */
export function createVerifier(crypto: CryptoAdapter): string {
  return toBase64Url(crypto.randomBytes(RANDOM_BYTES));
}

/** Un `state` nuevo, con el mismo tamaño que el verifier. */
export function createState(crypto: CryptoAdapter): string {
  return toBase64Url(crypto.randomBytes(RANDOM_BYTES));
}

/** El `code_challenge` S256: base64url(SHA-256(verifier)). */
export async function createChallenge(
  verifier: string,
  crypto: CryptoAdapter,
): Promise<string> {
  return toBase64Url(await crypto.sha256(verifier));
}

export interface AuthorizeUrlInput {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}

/** La URL exacta de la página de autorización de Spotify. */
export function buildAuthorizeUrl(input: AuthorizeUrlInput): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    code_challenge_method: "S256",
    code_challenge: input.codeChallenge,
    state: input.state,
  });

  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}
