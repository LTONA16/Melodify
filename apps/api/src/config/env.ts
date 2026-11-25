import { z } from "zod";

/**
 * La configuración del proceso, validada una sola vez al arrancar.
 *
 * Por qué falla al arrancar y no al primer uso: un servicio que arranca sin
 * `DATABASE_URL` y falla en la primera petición es más difícil de diagnosticar
 * que uno que no arranca y dice qué falta. El mensaje nombra la variable, nunca
 * su valor: un secreto no se imprime ni cuando está mal.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, "es obligatorio"),
  JWT_ACCESS_SECRET: z.string().min(32, "debe tener al menos 32 caracteres"),
  ACCESS_TOKEN_TTL: z.string().min(2, "debe ser una duración como 15m o 1h").default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  SEED_DEMO: z.enum(["true", "false"]).default("false"),
});

export type Env = z.infer<typeof envSchema>;

/** Falta o está mal una variable: el proceso no debe seguir. */
export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

const REQUIRED_KEYS = ["DATABASE_URL", "JWT_ACCESS_SECRET"] as const;

/** Los mensajes de Zod vienen en inglés; aquí se explican en español y sin valores. */
function describeIssue(issue: z.ZodIssue): string {
  const field = issue.path.join(".") || "configuración";
  switch (issue.code) {
    case "invalid_type":
      return `${field} no tiene el tipo esperado`;
    case "invalid_value":
      return `${field} no es uno de los valores permitidos`;
    default:
      return `${field}: ${issue.message}`;
  }
}

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const missing = REQUIRED_KEYS.filter((key) => (source[key] ?? "").trim().length === 0);

  if (missing.length > 0) {
    throw new EnvError(`Falta configuración obligatoria del API: ${missing.join(", ")}.`);
  }

  const result = envSchema.safeParse(source);

  if (!result.success) {
    const problems = result.error.issues.map(describeIssue).join("; ");
    throw new EnvError(`Configuración del API inválida: ${problems}.`);
  }

  return result.data;
}

/** La configuración real del proceso. Solo la llama el arranque, nunca las pruebas. */
export function loadEnv(): Env {
  return parseEnv(process.env);
}
