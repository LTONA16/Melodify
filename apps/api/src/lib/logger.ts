import type { Env } from "../config/env";

/**
 * La configuración del registro del servicio.
 *
 * Lo que se tacha no es cosmético: la cabecera `Authorization` lleva el token de
 * acceso, las cookies y `set-cookie` llevan credenciales, y cualquier cuerpo con
 * `password` o su hash no puede acabar en un archivo de logs que alguien copie a
 * un ticket. El registro se escribe con el logger del propio Fastify (pino).
 */
export interface LoggerOptions {
  level: string;
  redact: {
    paths: string[];
    censor: string;
  };
}

const REDACTED_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
  "*.password",
  "*.passwordHash",
  "*.refreshToken",
];

export function loggerOptions(env: Env): LoggerOptions {
  const level =
    env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug";

  return {
    level,
    redact: { paths: REDACTED_PATHS, censor: "[redactado]" },
  };
}
