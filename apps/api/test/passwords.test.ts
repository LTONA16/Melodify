import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../src/lib/passwords";

describe("passwords", () => {
  it("hashea con Argon2id y con sal: dos hashes de la misma contraseña difieren", async () => {
    const first = await hashPassword("contrasena-larga");
    const second = await hashPassword("contrasena-larga");

    expect(first).toContain("$argon2id$");
    expect(second).toContain("$argon2id$");
    expect(first).not.toBe(second);
    expect(first).not.toContain("contrasena-larga");
  });

  it("verifica la contraseña correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword("contrasena-larga");

    await expect(verifyPassword(hash, "contrasena-larga")).resolves.toBe(true);
    await expect(verifyPassword(hash, "otra-contrasena")).resolves.toBe(false);
  });

  it("no revienta con un hash corrupto: simplemente no coincide", async () => {
    await expect(verifyPassword("no-es-un-hash", "contrasena-larga")).resolves.toBe(false);
  });
});
