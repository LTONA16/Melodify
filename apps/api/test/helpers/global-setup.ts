import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { TEST_DATABASE_URL } from "./test-env";

/**
 * Prepara la base de pruebas **una vez por ejecución**: le aplica las
 * migraciones reales (`prisma migrate deploy`) antes de que empiece ninguna
 * prueba. No hay esquema paralelo ni tablas creadas a mano, así que una
 * migración rota se ve aquí y no en producción.
 */
export default function setup(): void {
  const schema = resolveSchemaPath();
  const [command, args] = prismaMigrateDeploy(schema);

  try {
    execFileSync(command, args, {
      cwd: resolve(schema, "..", ".."),
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: "pipe",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo preparar la base de datos de pruebas (${TEST_DATABASE_URL}). ` +
        "¿Está levantado Postgres? En apps/api: `docker compose up -d`. " +
        `Detalle: ${detail}`,
    );
  }
}

/**
 * En Windows `npx` es un `.cmd` y Node ya no lo ejecuta directamente
 * (`spawnSync EINVAL`), así que se pasa por `cmd.exe`. No se usa `shell: true`
 * porque Node lo desaconseja al combinar shell y argumentos; aquí el comando y
 * los argumentos son constantes y la ruta la calcula el propio helper.
 */
function prismaMigrateDeploy(schema: string): [string, string[]] {
  const args = ["prisma", "migrate", "deploy", "--schema", schema];

  if (process.platform === "win32") {
    const cmd = process.env.ComSpec ?? "cmd.exe";
    return [cmd, ["/d", "/s", "/c", "npx", ...args]];
  }

  return ["npx", args];
}

/** Acepta que la suite se lance desde `apps/api` o desde la raíz del monorepo. */
function resolveSchemaPath(): string {
  const fromPackage = resolve(process.cwd(), "prisma", "schema.prisma");
  if (existsSync(fromPackage)) {
    return fromPackage;
  }

  const fromRoot = resolve(process.cwd(), "apps", "api", "prisma", "schema.prisma");
  if (existsSync(fromRoot)) {
    return fromRoot;
  }

  throw new Error(
    "No encuentro `prisma/schema.prisma`. Ejecuta las pruebas desde apps/api o desde la raíz del monorepo.",
  );
}
