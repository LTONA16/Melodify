import { hash, verify } from "@node-rs/argon2";

/**
 * Las contraseñas se guardan con **Argon2id**, el algoritmo que recomienda
 * OWASP para contraseñas nuevas: resiste ataques con GPU y con canales
 * laterales. Los parámetros son los mínimos recomendados (19 MiB de memoria y
 * dos pasadas); subirlos encarece cada inicio de sesión, bajarlos regala trabajo
 * al atacante.
 *
 * El hash incluye su propia sal y sus parámetros, así que `verify` no necesita
 * que se los pasemos: se leen del propio hash guardado.
 */
const ARGON2_OPTIONS = {
  // `Algorithm.Argon2id`. El paquete lo declara como `const enum` y con
  // `isolatedModules` no se puede leer en tiempo de compilación; el valor es
  // estable y está documentado en su API.
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

/**
 * `false` en vez de una excepción: un hash corrupto o de otro algoritmo no es
 * un fallo del servidor, es una credencial que no coincide. Así el llamador no
 * tiene que distinguir «mal escrito» de «guardado mal» para responder 401.
 */
export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password).catch(() => false);
}
