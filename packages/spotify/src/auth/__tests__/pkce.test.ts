import { createHash } from "crypto";

import type { CryptoAdapter } from "../../types";
import {
  buildAuthorizeUrl,
  createChallenge,
  createState,
  createVerifier,
  RANDOM_BYTES,
  toBase64Url,
} from "../pkce";

function cryptoDouble(): CryptoAdapter {
  let seed = 0;

  return {
    randomBytes: (length) => {
      seed += 1;
      return new Uint8Array(length).fill(seed);
    },
    sha256: async (text) => new Uint8Array(createHash("sha256").update(text).digest()),
  };
}

describe("PKCE", () => {
  it("codifica base64url sin padding", () => {
    expect(toBase64Url(new Uint8Array([0, 0, 0]))).toBe("AAAA");
    expect(toBase64Url(new Uint8Array([255, 255]))).toBe("__8");
    expect(toBase64Url(new Uint8Array([255]))).toBe("_w");
    expect(toBase64Url(new Uint8Array())).toBe("");
  });

  it("cumple el vector de la RFC 7636 para S256", async () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

    await expect(createChallenge(verifier, cryptoDouble())).resolves.toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("genera un verifier de 32 bytes en el alfabeto permitido", () => {
    const verifier = createVerifier(cryptoDouble());

    expect(RANDOM_BYTES).toBe(32);
    expect(verifier).toHaveLength(43);
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]{43}$/);
  });

  it("genera un state distinto en cada arranque", () => {
    const crypto = cryptoDouble();
    const first = createState(crypto);
    const second = createState(crypto);

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9\-._~]{43}$/);
  });

  it("arma la URL de autorización con S256 y sin scopes", () => {
    const url = new URL(
      buildAuthorizeUrl({
        clientId: "client id",
        redirectUri: "exp://127.0.0.1:8081/--/spotify-callback",
        codeChallenge: "challenge-value",
        state: "state-value",
      }),
    );

    expect(url.origin + url.pathname).toBe(
      "https://accounts.spotify.com/authorize",
    );
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "exp://127.0.0.1:8081/--/spotify-callback",
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-value");
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("scope")).toBeNull();
  });
});
