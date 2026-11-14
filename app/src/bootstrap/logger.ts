import type { SessionLogCode } from "@melodify/app-session";

/**
 * Los códigos de diagnóstico de la app: los de C3 más los tres que estrena U2
 * —suscripción y lectura de contenido, y el módulo de red—. El tipo vive aquí y no
 * en los paquetes porque es vocabulario de la app; un paquete recibe la parte que
 * necesita inyectada y no importa este archivo (NFR9.1, NFR9.4).
 *
 * El tipo es **más amplio** que `SessionLogCode`, no más estrecho: así `logger` se
 * puede entregar a `@melodify/app-session` y a `@melodify/connectivity` sin
 * conversión y sin perder los códigos nuevos (revisión 13 del contrato).
 */
export type AppLogCode =
  | SessionLogCode
  | "CONTENT_SUBSCRIBE_FAILED"
  | "CONTENT_READ_FAILED"
  | "NETWORK_STATE_UNAVAILABLE";

export interface AppLogger {
  warn(code: AppLogCode, message: string): void;
  error(code: AppLogCode, message: string): void;
}

/**
 * El logger del proyecto (LC-5): el único sitio del repositorio que llama a
 * `console` (NFR9.1). La app se lo inyecta a los paquetes; ninguno importa este
 * archivo.
 *
 * `warn` se apaga fuera de desarrollo (`__DEV__`) y `error` siempre queda: en un
 * binario de release solo sobreviven los fallos del sistema.
 */
export const logger: AppLogger = {
  warn(code, message) {
    if (__DEV__) {
      console.warn(`[melodify] ${code}: ${message}`);
    }
  },

  error(code, message) {
    console.error(`[melodify] ${code}: ${message}`);
  },
};
