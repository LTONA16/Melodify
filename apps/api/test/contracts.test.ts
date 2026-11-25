import { describe, expect, it } from "vitest";

import {
  apiErrorBodySchema,
  healthResponseSchema,
  isoTimestampSchema,
  paginationQuerySchema,
} from "@melodify/contracts/schemas";

/**
 * Los esquemas del contrato son la única puerta de entrada del API y la fuente
 * de la documentación: si aceptan lo que no deben, el fallo se propaga a las
 * dos cosas a la vez.
 */
describe("healthResponseSchema", () => {
  it("acepta la respuesta sana y la degradada", () => {
    expect(
      healthResponseSchema.safeParse({ status: "ok", version: "0.1.0", database: "up" }).success,
    ).toBe(true);
    expect(
      healthResponseSchema.safeParse({
        status: "degraded",
        version: "0.1.0",
        database: "down",
      }).success,
    ).toBe(true);
  });

  it("rechaza un estado que no existe", () => {
    expect(
      healthResponseSchema.safeParse({ status: "vivo", version: "0.1.0", database: "up" })
        .success,
    ).toBe(false);
  });
});

describe("apiErrorBodySchema", () => {
  it("acepta el sobre con y sin detalles", () => {
    expect(
      apiErrorBodySchema.safeParse({ error: { code: "not_found", message: "No está." } }).success,
    ).toBe(true);
    expect(
      apiErrorBodySchema.safeParse({
        error: {
          code: "validation_failed",
          message: "Revisa los datos.",
          details: [{ path: "text", message: "es obligatorio" }],
        },
      }).success,
    ).toBe(true);
  });

  it("rechaza un error sin mensaje", () => {
    expect(apiErrorBodySchema.safeParse({ error: { code: "not_found" } }).success).toBe(false);
  });
});

describe("paginationQuerySchema", () => {
  it("aplica el límite por defecto", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it("convierte el límite que llega como texto de la URL", () => {
    expect(paginationQuerySchema.parse({ limit: "12" }).limit).toBe(12);
  });

  it("no acepta más de 50 ni menos de 1", () => {
    expect(paginationQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("acepta un cursor opaco", () => {
    expect(paginationQuerySchema.parse({ cursor: "b3BhY28=" }).cursor).toBe("b3BhY28=");
  });
});

describe("isoTimestampSchema", () => {
  it("acepta ISO 8601 con zona", () => {
    expect(isoTimestampSchema.safeParse("2026-11-25T10:00:00.000Z").success).toBe(true);
    expect(isoTimestampSchema.safeParse("2026-11-25T10:00:00+02:00").success).toBe(true);
  });

  it("rechaza lo que no es una fecha con zona", () => {
    expect(isoTimestampSchema.safeParse("demo").success).toBe(false);
    expect(isoTimestampSchema.safeParse("25/11/2026").success).toBe(false);
  });
});
