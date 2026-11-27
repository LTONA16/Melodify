import { PrismaClient } from "@prisma/client";

import { TEST_DATABASE_URL } from "./test-env";

/**
 * Un cliente real contra `melodify_test`.
 *
 * Las pruebas de cuentas no pueden usar el doble de la sonda de salud: aquí se
 * escriben usuarios y refresh tokens de verdad, y lo que se afirma es lo que
 * quedó en Postgres. El `globalSetup` ya aplicó las migraciones.
 */
export function realPrisma(): PrismaClient {
  return new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });
}

/**
 * Deja la base como estaba entre pruebas. El orden importa: primero las filas
 * que apuntan a otras y al final las cuentas y las obras.
 */
export async function clearDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.opinion.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
  await prisma.work.deleteMany();
}
