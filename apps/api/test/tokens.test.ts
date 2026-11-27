import { describe, expect, it } from "vitest";

import { addDays, generateRefreshToken, hashRefreshToken } from "../src/lib/tokens";

describe("refresh tokens", () => {
  it("genera valores largos y distintos cada vez", () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();

    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(first).not.toBe(second);
  });

  it("guarda un hash SHA-256 de 64 caracteres, estable y sin el token dentro", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(hashRefreshToken(token));
    expect(hash).not.toContain(token);
  });

  it("suma días sin tocar la hora", () => {
    const start = new Date("2026-01-01T10:30:00.000Z");
    const end = addDays(start, 30);

    expect(end.toISOString()).toBe("2026-01-31T10:30:00.000Z");
  });
});
