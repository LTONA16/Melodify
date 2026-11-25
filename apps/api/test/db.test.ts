import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";

import { TEST_DATABASE_URL } from "./helpers/test-env";

/**
 * La base de datos real de pruebas, con las migraciones aplicadas por el
 * `globalSetup`. Esto no comprueba el esquema que Prisma "cree" tener: comprueba
 * las tablas y las restricciones que existen de verdad en Postgres.
 */
const prisma = new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });

afterAll(async () => {
  await prisma.$disconnect();
});

describe("esquema de la base de datos", () => {
  it("acepta una consulta trivial", async () => {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    expect(rows[0]?.ok).toBe(1);
  });

  it("tiene las siete tablas del modelo", async () => {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    const tables = rows.map((row) => row.table_name);

    expect(tables).toEqual(
      expect.arrayContaining([
        "users",
        "works",
        "opinions",
        "likes",
        "comments",
        "follows",
        "refresh_tokens",
      ]),
    );
  });

  it("aplica las dos reglas que Prisma no modela", async () => {
    const rows = await prisma.$queryRaw<Array<{ conname: string }>>`
      SELECT conname
      FROM pg_constraint
      WHERE contype = 'c'
        AND conname IN ('opinions_rating_range', 'follows_no_self')
    `;

    expect(rows.map((row) => row.conname).sort()).toEqual([
      "follows_no_self",
      "opinions_rating_range",
    ]);
  });

  it("impide que una persona se siga a sí misma", async () => {
    // Se insertan dos usuarios reales y se intenta el follow imposible dentro de
    // una transacción que se deshace: la prueba no deja basura en la base.
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.user.createMany({
          data: [
            { id: "self-check-a", handle: "self-check-a", displayName: "A", passwordHash: "x" },
            { id: "self-check-b", handle: "self-check-b", displayName: "B", passwordHash: "x" },
          ],
        });
        await tx.follow.create({
          data: { followerId: "self-check-a", followeeId: "self-check-a" },
        });
        throw new Error("la restricción no se aplicó");
      }),
    ).rejects.toThrow(/follows_no_self/);
  });
});
