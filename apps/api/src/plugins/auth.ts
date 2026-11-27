import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest } from "fastify";

import type { Env } from "../config/env";
import { ApiError } from "../lib/errors";
import { createAuthService, type AuthService } from "../modules/auth/service";

/**
 * Las sesiones del servicio: firma y verificación del JWT de acceso, y el
 * servicio de cuentas como decorador (`app.auth`).
 *
 * El JWT solo lleva lo que hace falta para identificar la cuenta (`sub` y
 * `handle`). Ni permisos ni datos personales: si cambian, se piden a la base de
 * datos, no se confía en un token que puede tener días.
 */
declare module "fastify" {
  interface FastifyInstance {
    auth: AuthService;
    /** `preHandler` de las rutas que exigen sesión. */
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; handle: string };
    user: { sub: string; handle: string };
  }
}

const SESSION_EXPIRED_MESSAGE = "Tu sesión caducó o no es válida. Vuelve a iniciar sesión.";

/** Segundos de vida del token, leídos del propio JWT ya firmado. */
function lifetimeSeconds(decoded: { iat?: number; exp?: number } | null): number {
  if (decoded && typeof decoded.iat === "number" && typeof decoded.exp === "number") {
    return Math.max(1, decoded.exp - decoded.iat);
  }
  return 1;
}

export function registerAuth(app: FastifyInstance, env: Env): void {
  app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.ACCESS_TOKEN_TTL },
  });

  app.decorate(
    "auth",
    createAuthService({
      prisma: app.prisma,
      signAccessToken: (payload) => {
        const token = app.jwt.sign(payload);
        const decoded = app.jwt.decode<{ iat?: number; exp?: number }>(token);
        return { token, expiresIn: lifetimeSeconds(decoded) };
      },
      refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
    }),
  );

  app.decorate("authenticate", async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch {
      // Token ausente, mal firmado o caducado: para quien lo usa es lo mismo.
      throw new ApiError(401, "token_expired", SESSION_EXPIRED_MESSAGE);
    }
  });
}
