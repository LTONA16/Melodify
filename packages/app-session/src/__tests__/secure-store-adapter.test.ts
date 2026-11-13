import * as SecureStore from "expo-secure-store";

import {
  createSessionStorage,
  secureStorePort,
  sessionStorage,
} from "../secure-store-adapter";
import { SESSION_STORAGE_KEY } from "../storage-keys";

jest.mock("expo-secure-store");

const mockedStore = SecureStore as jest.Mocked<typeof SecureStore>;

const OTHER_KEYS = ["melodify.spotify.token", "melodify.other"];

describe("adaptador del almacenamiento seguro de la sesión", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStore.getItemAsync.mockResolvedValue(null);
    mockedStore.setItemAsync.mockResolvedValue(undefined);
    mockedStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  it("lee la clave de la sesión y devuelve lo guardado", async () => {
    mockedStore.getItemAsync.mockResolvedValue('{"authorId":"demo"}');

    const result = await sessionStorage.read();

    expect(mockedStore.getItemAsync).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(result).toEqual({ ok: true, value: '{"authorId":"demo"}' });
  });

  it("escribe en la clave de la sesión, con el valor recibido", async () => {
    const result = await sessionStorage.write('{"authorId":"demo"}');

    expect(mockedStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      '{"authorId":"demo"}',
    );
    expect(result).toEqual({ ok: true, value: null });
  });

  it("borra la clave de la sesión", async () => {
    const result = await sessionStorage.clear();

    expect(mockedStore.deleteItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
    );
    expect(result).toEqual({ ok: true, value: null });
  });

  it("traduce un rechazo de lectura a un código de fallo, no a una excepción", async () => {
    mockedStore.getItemAsync.mockRejectedValue(new Error("keystore bloqueado"));

    await expect(sessionStorage.read()).resolves.toEqual({
      ok: false,
      failure: "read",
    });
  });

  it("traduce los rechazos de escritura y de borrado a su código de fallo", async () => {
    mockedStore.setItemAsync.mockRejectedValue(new Error("sin espacio"));
    mockedStore.deleteItemAsync.mockRejectedValue(new Error("keystore bloqueado"));

    await expect(sessionStorage.write("{}")).resolves.toEqual({
      ok: false,
      failure: "write",
    });
    await expect(sessionStorage.clear()).resolves.toEqual({
      ok: false,
      failure: "delete",
    });
  });

  it("no toca ninguna otra clave del almacenamiento", async () => {
    await sessionStorage.read();
    await sessionStorage.write("{}");
    await sessionStorage.clear();

    const usedKeys = [
      ...mockedStore.getItemAsync.mock.calls,
      ...mockedStore.setItemAsync.mock.calls,
      ...mockedStore.deleteItemAsync.mock.calls,
    ].map(([key]) => key);

    expect(usedKeys).toEqual([
      SESSION_STORAGE_KEY,
      SESSION_STORAGE_KEY,
      SESSION_STORAGE_KEY,
    ]);
    OTHER_KEYS.forEach((key) => {
      expect(usedKeys).not.toContain(key);
    });
  });

  it("construye el adaptador sobre el puerto que recibe", async () => {
    const port = {
      getItemAsync: jest.fn(async () => "valor"),
      setItemAsync: jest.fn(async () => undefined),
      deleteItemAsync: jest.fn(async () => undefined),
    };

    const storage = createSessionStorage(port);

    await expect(storage.read()).resolves.toEqual({ ok: true, value: "valor" });
    await storage.write("nuevo");
    await storage.clear();

    expect(port.setItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      "nuevo",
    );
    expect(port.deleteItemAsync).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
  });

  it("el puerto real delega en el módulo nativo", async () => {
    await secureStorePort.getItemAsync(SESSION_STORAGE_KEY);
    await secureStorePort.setItemAsync(SESSION_STORAGE_KEY, "valor");
    await secureStorePort.deleteItemAsync(SESSION_STORAGE_KEY);

    expect(mockedStore.getItemAsync).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(mockedStore.setItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
      "valor",
    );
    expect(mockedStore.deleteItemAsync).toHaveBeenCalledWith(
      SESSION_STORAGE_KEY,
    );
  });
});
