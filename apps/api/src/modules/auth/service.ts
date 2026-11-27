import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient, type User } from "@prisma/client";

import type { SessionView, UserView } from "@melodify/contracts";

import { ApiError } from "../../lib/errors";
import { hashPassword, verifyPassword } from "../../lib/passwords";
import { addDays, generateRefreshToken, hashRefreshToken } from "../../lib/tokens";

/**
 * Las reglas de las cuentas y las sesiones, sin Fastify ni HTTP.
 *
 * Qué vive aquí y por qué:
 * - **Normalización del handle**: `Demo` y `demo` son la misma cuenta. El
 *   esquema acepta mayúsculas; el servicio las baja antes de guardar o buscar.
 * - **Argon2id**: la contraseña nunca se guarda ni se registra en claro.
 * - **Refresh rotatorio**: cada uso emite un token nuevo y revoca el anterior.
 *   Si llega uno ya revocado, se revoca la familia entera: o alguien copió el
 *   token, o hay dos clientes usando la misma cadena, y en ambos casos lo
 *   prudente es cerrar todas las sesiones de esa cadena.
 *
 * El servicio no decide códigos HTTP; lanza `ApiError` y el manejador de errores
 * lo traduce.
 */
export interface AccessToken {
  token: string;
  /** Segundos que vive el token, para que la app sepa cuándo renovarlo. */
  expiresIn: number;
}

export interface AuthServiceOptions {
  prisma: PrismaClient;
  signAccessToken: (payload: { sub: string; handle: string }) => AccessToken;
  refreshTokenTtlDays: number;
  /** Inyectable en pruebas; por defecto, el reloj real. */
  now?: () => Date;
}

export interface RegisterData {
  handle: string;
  displayName: string;
  password: string;
}

export interface LoginData {
  handle: string;
  password: string;
}

export interface AuthService {
  register(input: RegisterData): Promise<SessionView>;
  login(input: LoginData): Promise<SessionView>;
  refresh(refreshToken: string): Promise<SessionView>;
  logout(refreshToken: string): Promise<void>;
  me(userId: string): Promise<UserView>;
}

const HANDLE_TAKEN_MESSAGE = "Ese nombre de usuario ya está ocupado. Prueba con otro.";
const INVALID_CREDENTIALS_MESSAGE =
  "El nombre de usuario o la contraseña no son correctos.";
const SESSION_EXPIRED_MESSAGE = "Tu sesión caducó. Vuelve a iniciar sesión.";
const REFRESH_REUSED_MESSAGE =
  "Por seguridad cerramos esta sesión. Vuelve a iniciar sesión.";

/**
 * Un hash de relleno para cuando el handle no existe. Verificarlo cuesta lo
 * mismo que verificar uno real, así que el tiempo de respuesta no delata qué
 * handles están registrados. Se calcula una sola vez por proceso.
 */
let dummyPasswordHash: Promise<string> | null = null;

function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= hashPassword("melodify-timing-equalizer");
  return dummyPasswordHash;
}

function normalizeHandle(handle: string): string {
  return handle.trim().toLowerCase();
}

function toUserView(user: User): UserView {
  return {
    userId: user.id,
    handle: user.handle,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}

function isHandleTaken(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function createAuthService(options: AuthServiceOptions): AuthService {
  const { prisma } = options;
  const clock = options.now ?? (() => new Date());

  async function revokeFamily(familyId: string, now: Date): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async function issueSession(user: User): Promise<SessionView> {
    const now = clock();
    const access = options.signAccessToken({ sub: user.id, handle: user.handle });
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        familyId: randomUUID(),
        expiresAt: addDays(now, options.refreshTokenTtlDays),
      },
    });

    return {
      user: toUserView(user),
      accessToken: access.token,
      refreshToken,
      expiresIn: access.expiresIn,
    };
  }

  async function register(input: RegisterData): Promise<SessionView> {
    const passwordHash = await hashPassword(input.password);

    let user: User;
    try {
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          handle: normalizeHandle(input.handle),
          displayName: input.displayName.trim(),
          passwordHash,
        },
      });
    } catch (error) {
      if (isHandleTaken(error)) {
        throw new ApiError(409, "handle_taken", HANDLE_TAKEN_MESSAGE);
      }
      throw error;
    }

    return issueSession(user);
  }

  async function login(input: LoginData): Promise<SessionView> {
    const user = await prisma.user.findUnique({
      where: { handle: normalizeHandle(input.handle) },
    });

    const passwordHash = user?.passwordHash ?? (await getDummyPasswordHash());
    const matches = await verifyPassword(passwordHash, input.password);

    if (user === null || !matches) {
      throw new ApiError(401, "invalid_credentials", INVALID_CREDENTIALS_MESSAGE);
    }

    return issueSession(user);
  }

  async function refresh(rawToken: string): Promise<SessionView> {
    const now = clock();
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(rawToken) },
    });

    if (stored === null) {
      throw new ApiError(401, "token_expired", SESSION_EXPIRED_MESSAGE);
    }

    if (stored.revokedAt !== null) {
      await revokeFamily(stored.familyId, now);
      throw new ApiError(401, "refresh_reused", REFRESH_REUSED_MESSAGE);
    }

    if (stored.expiresAt.getTime() <= now.getTime()) {
      throw new ApiError(401, "token_expired", SESSION_EXPIRED_MESSAGE);
    }

    // La rotación se reclama con un UPDATE condicional: si otra petición ya
    // revocó este token, `count` es 0 y no se emite un segundo par.
    const rotated = await prisma.$transaction(async (tx) => {
      const claimed = await tx.refreshToken.updateMany({
        where: { id: stored.id, revokedAt: null },
        data: { revokedAt: now },
      });

      if (claimed.count !== 1) {
        return null;
      }

      const user = await tx.user.findUnique({ where: { id: stored.userId } });
      if (user === null) {
        return null;
      }

      const refreshToken = generateRefreshToken();
      await tx.refreshToken.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          tokenHash: hashRefreshToken(refreshToken),
          familyId: stored.familyId,
          expiresAt: addDays(now, options.refreshTokenTtlDays),
        },
      });

      const access = options.signAccessToken({ sub: user.id, handle: user.handle });

      return {
        user: toUserView(user),
        accessToken: access.token,
        refreshToken,
        expiresIn: access.expiresIn,
      };
    });

    if (rotated === null) {
      await revokeFamily(stored.familyId, now);
      throw new ApiError(401, "refresh_reused", REFRESH_REUSED_MESSAGE);
    }

    return rotated;
  }

  async function logout(rawToken: string): Promise<void> {
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(rawToken) },
    });

    if (stored === null) {
      // Idempotente: cerrar una sesión que ya no existe no es un error.
      return;
    }

    await revokeFamily(stored.familyId, clock());
  }

  async function me(userId: string): Promise<UserView> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user === null) {
      throw new ApiError(401, "token_expired", SESSION_EXPIRED_MESSAGE);
    }

    return toUserView(user);
  }

  return { register, login, refresh, logout, me };
}
