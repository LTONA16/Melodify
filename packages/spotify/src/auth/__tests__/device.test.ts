import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import * as Crypto from "expo-crypto";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

import {
  expoBrowser,
  expoCrypto,
  expoSecureStore,
  resolveRedirectUri,
} from "../device";

jest.mock("expo-crypto", () => ({
  getRandomBytes: jest.fn((length: number) => new Uint8Array(length).fill(1)),
  digestStringAsync: jest.fn(async () => "ab".repeat(32)),
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
}));

jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "exp://calculado/--/spotify-callback"),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => "guardado"),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(async () => ({
    type: "success",
    url: "exp://retorno/--/spotify-callback?code=1",
  })),
}));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return entry.name === "__tests__" ? [] : sourceFiles(path);
    }

    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

describe("adaptador de dispositivo", () => {
  it("es el único módulo de producción que importa Expo", () => {
    const root = join(__dirname, "..", "..");
    const offenders = sourceFiles(root)
      .filter((path) => !path.endsWith("auth/device.ts"))
      .filter((path) => /from\s+"expo-/.test(readFileSync(path, "utf8")));

    expect(offenders).toEqual([]);
  });

  it("resuelve el redirect explícito por encima del calculado", () => {
    expect(resolveRedirectUri("exp://elegido/--/spotify-callback")).toBe(
      "exp://elegido/--/spotify-callback",
    );
    expect(makeRedirectUri).not.toHaveBeenCalled();
  });

  it("calcula el redirect de Expo Go cuando no hay variable", () => {
    expect(resolveRedirectUri(undefined)).toBe(
      "exp://calculado/--/spotify-callback",
    );
    expect(resolveRedirectUri("  ")).toBe(
      "exp://calculado/--/spotify-callback",
    );
    expect(makeRedirectUri).toHaveBeenCalledWith({ path: "spotify-callback" });
  });

  it("delega el almacén seguro en expo-secure-store", async () => {
    await expoSecureStore.getItem("clave");
    await expoSecureStore.setItem("clave", "valor");
    await expoSecureStore.deleteItem("clave");

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("clave");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("clave", "valor");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("clave");
  });

  it("normaliza la cancelación del navegador y conserva el éxito", async () => {
    await expect(
      expoBrowser.openAuthSessionAsync("https://autorizar", "exp://retorno"),
    ).resolves.toEqual({
      type: "success",
      url: "exp://retorno/--/spotify-callback?code=1",
    });

    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValueOnce({
      type: "dismiss",
    });
    await expect(
      expoBrowser.openAuthSessionAsync("https://autorizar", "exp://retorno"),
    ).resolves.toEqual({ type: "cancel" });
  });

  it("convierte el SHA-256 hexadecimal de Expo en bytes", async () => {
    await expect(expoCrypto.sha256("verifier")).resolves.toEqual(
      new Uint8Array(32).fill(0xab),
    );
    expect(expoCrypto.randomBytes(4)).toEqual(new Uint8Array(4).fill(1));
    expect(Crypto.getRandomBytes(32)).toEqual(new Uint8Array(32).fill(1));
  });
});
