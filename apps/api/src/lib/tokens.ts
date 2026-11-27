import { createHash, randomBytes } from "node:crypto";

/**
 * El refresh token es un valor aleatorio de 32 bytes (43 caracteres en
 * base64url): no lleva información dentro, así que no se puede adivinar ni
 * falsificar. En la base de datos solo vive su hash SHA-256, que ocupa 64
 * caracteres y encaja con la columna `tokenHash`.
 *
 * Por qué SHA-256 y no Argon2 para el refresh token: no es una contraseña
 * elegida por una persona, es un valor de 256 bits que nadie puede adivinar; un
 * hash lento solo encarecería cada rotación sin aportar nada.
 */
const REFRESH_TOKEN_BYTES = 32;

export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
