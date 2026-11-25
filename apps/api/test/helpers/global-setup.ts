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
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const schema = resolveSchemaPath();

  try {
    execFileSync(npx, ["prisma", "migrate", "deploy", "--schema", schema], {
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
