import "dotenv/config";

import { buildApp } from "./app";
import { loadEnv } from "./config/env";

/**
 * El único archivo que abre un puerto.
 *
 * Todo lo demás (rutas, plugins, manejador de errores) se construye con
 * `buildApp` y se prueba con `inject`. Aquí solo queda el cableado del proceso:
 * leer la configuración, escuchar y cerrar ordenadamente.
 */
async function main(): Promise<void> {
  const env = loadEnv();
  const app = buildApp({ env });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, "cerrando el servidor");
    // `close` dispara `onClose`: desconecta Prisma y deja de aceptar peticiones.
    await app.close();
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error({ err: error }, "no se pudo arrancar el servidor");
    process.exitCode = 1;
    await app.close();
  }
}

void main();
