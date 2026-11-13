import type { SessionLogger } from "@melodify/app-session";

/**
 * El logger del proyecto (LC-5): el único sitio del repositorio que llama a
 * `console` (NFR9.1). Implementa el puerto que declara `@melodify/app-session` y la
 * app se lo inyecta; el paquete nunca importa este archivo.
 *
 * `warn` se apaga fuera de desarrollo (`__DEV__`) y `error` siempre queda: en un
 * binario de release solo sobreviven los fallos del sistema.
 */
export const logger: SessionLogger = {
  warn(code, message) {
    if (__DEV__) {
      console.warn(`[melodify] ${code}: ${message}`);
    }
  },

  error(code, message) {
    console.error(`[melodify] ${code}: ${message}`);
  },
};
