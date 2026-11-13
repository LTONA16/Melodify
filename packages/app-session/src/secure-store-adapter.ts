/**
 * El adaptador del almacenamiento seguro: **el único archivo del repositorio que
 * importa `expo-secure-store`** para la sesión (NFR3.2). Un solo punto de acceso
 * deja la superficie de seguridad en un archivo y permite probar la sesión con un
 * doble en memoria sin tocar el dispositivo.
 *
 * El puerto `SecureStorePort` es lo que el contrato C3 expone para sustituirlo en
 * las pruebas; el adaptador real y la traducción de sus rechazos a códigos de
 * fallo viven aquí, de modo que nada lanza hacia arriba (NFR3.3).
 */
import * as SecureStore from "expo-secure-store";

import { SESSION_STORAGE_KEY } from "./storage-keys";

export interface SecureStorePort {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

/** Qué puerta del almacenamiento falló. */
export type StorageFailure = "read" | "write" | "delete";

/** El fallo es un valor, no una excepción: la sesión responde con su código. */
export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; failure: StorageFailure };

export interface SessionStorage {
  read(): Promise<StorageResult<string | null>>;
  write(value: string): Promise<StorageResult<null>>;
  clear(): Promise<StorageResult<null>>;
}

/** El módulo nativo real, sin adornos: rechaza como rechaza `expo-secure-store`. */
export const secureStorePort: SecureStorePort = {
  getItemAsync: (key) => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
};

/**
 * Ata el puerto a la clave de la sesión y convierte cualquier rechazo en el código
 * de la puerta que falló. Ninguna otra clave se toca desde aquí (NFR4.2).
 */
export function createSessionStorage(
  store: SecureStorePort = secureStorePort,
): SessionStorage {
  return {
    async read() {
      try {
        return { ok: true, value: await store.getItemAsync(SESSION_STORAGE_KEY) };
      } catch {
        return { ok: false, failure: "read" };
      }
    },

    async write(value: string) {
      try {
        await store.setItemAsync(SESSION_STORAGE_KEY, value);
        return { ok: true, value: null };
      } catch {
        return { ok: false, failure: "write" };
      }
    },

    async clear() {
      try {
        await store.deleteItemAsync(SESSION_STORAGE_KEY);
        return { ok: true, value: null };
      } catch {
        return { ok: false, failure: "delete" };
      }
    },
  };
}

/** El almacenamiento por defecto de la sesión: el del dispositivo. */
export const sessionStorage: SessionStorage = createSessionStorage();
