import type { SecureStoreAdapter } from "../../types";
import {
  clearToken,
  parseToken,
  readToken,
  REFRESH_AHEAD_MS,
  saveToken,
  serializeToken,
  shouldRefresh,
  TOKEN_STORAGE_KEY,
  type StoredToken,
} from "../token";

const token: StoredToken = {
  accessToken: "access-123",
  refreshToken: "refresh-456",
  expiresAt: new Date("2026-11-18T10:00:00.000Z").getTime(),
  obtainedAt: new Date("2026-11-18T09:00:00.000Z").getTime(),
};

function store(initial: string | null = null): SecureStoreAdapter & {
  values: Map<string, string>;
} {
  const values = new Map<string, string>();

  if (initial !== null) {
    values.set(TOKEN_STORAGE_KEY, initial);
  }

  return {
    values,
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    deleteItem: jest.fn(async (key: string) => {
      values.delete(key);
    }),
  };
}

describe("token de Spotify", () => {
  it("usa la clave exacta y guarda los cuatro campos sin añadir otros", () => {
    expect(TOKEN_STORAGE_KEY).toBe("melodify.spotify.token");

    expect(JSON.parse(serializeToken(token))).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      expiresAt: token.expiresAt,
      obtainedAt: token.obtainedAt,
    });
  });

  it("serializa y vuelve a leer el token completo", () => {
    expect(parseToken(serializeToken(token))).toEqual(token);
  });

  it("descarta JSON inválido, campos ausentes, tipos distintos y caducidad anterior", () => {
    expect(parseToken(null)).toBeNull();
    expect(parseToken("")).toBeNull();
    expect(parseToken("{")).toBeNull();
    expect(parseToken("null")).toBeNull();
    expect(parseToken("42")).toBeNull();
    expect(parseToken("[]")).toBeNull();
    expect(
      parseToken(
        JSON.stringify({
          accessToken: "a",
          refreshToken: "r",
          expiresAt: token.expiresAt,
        }),
      ),
    ).toBeNull();
    expect(
      parseToken(
        JSON.stringify({
          accessToken: "",
          refreshToken: "r",
          expiresAt: token.expiresAt,
          obtainedAt: token.obtainedAt,
        }),
      ),
    ).toBeNull();
    expect(
      parseToken(
        JSON.stringify({
          accessToken: "a",
          refreshToken: "r",
          expiresAt: token.obtainedAt,
          obtainedAt: token.expiresAt,
        }),
      ),
    ).toBeNull();
    expect(
      parseToken(
        JSON.stringify({
          accessToken: "a",
          refreshToken: "r",
          expiresAt: Number.NaN,
          obtainedAt: token.obtainedAt,
        }),
      ),
    ).toBeNull();
  });

  it("renueva al entrar en la ventana de 60 s, no antes", () => {
    const boundary = token.expiresAt - REFRESH_AHEAD_MS;

    expect(shouldRefresh(token, boundary - 1)).toBe(false);
    expect(shouldRefresh(token, boundary)).toBe(true);
    expect(shouldRefresh(token, token.expiresAt)).toBe(true);
  });

  it("lee, guarda y borra con el adaptador inyectado", async () => {
    const adapter = store();

    await saveToken(adapter, token);
    expect(adapter.values.get(TOKEN_STORAGE_KEY)).toBe(serializeToken(token));
    await expect(readToken(adapter)).resolves.toEqual(token);

    await clearToken(adapter);
    expect(adapter.values.has(TOKEN_STORAGE_KEY)).toBe(false);
    await expect(readToken(adapter)).resolves.toBeNull();
  });

  it("propaga el fallo del almacén para que quien llama decida cómo registrarlo", async () => {
    const adapter = store();
    adapter.getItem = jest.fn(async () => {
      throw new Error("sin llavero");
    });

    await expect(readToken(adapter)).rejects.toThrow("sin llavero");
  });
});
