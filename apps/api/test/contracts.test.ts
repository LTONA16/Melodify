import { describe, expect, it } from "vitest";

import {
  apiErrorBodySchema,
  handleSchema,
  healthResponseSchema,
  isoTimestampSchema,
  loginBodySchema,
  paginationQuerySchema,
  passwordSchema,
  registerBodySchema,
  sessionViewSchema,
  userViewSchema,
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

describe("handleSchema", () => {
  it("acepta letras, números y guion bajo, también en mayúsculas", () => {
    expect(handleSchema.safeParse("demo_user").success).toBe(true);
    expect(handleSchema.safeParse("Demo_User_2").success).toBe(true);
  });

  it("rechaza lo que es demasiado corto, demasiado largo o trae símbolos", () => {
    expect(handleSchema.safeParse("ab").success).toBe(false);
    expect(handleSchema.safeParse("a".repeat(25)).success).toBe(false);
    expect(handleSchema.safeParse("con espacio").success).toBe(false);
    expect(handleSchema.safeParse("con-guion").success).toBe(false);
    expect(handleSchema.safeParse("con@arroba").success).toBe(false);
  });
});

describe("registerBodySchema", () => {
  it("acepta un registro completo", () => {
    const result = registerBodySchema.safeParse({
      handle: "Demo_User",
      displayName: "Demo",
      password: "contrasena-larga",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza una contraseña corta y un nombre visible vacío", () => {
    expect(
      registerBodySchema.safeParse({
        handle: "demo_user",
        displayName: "",
        password: "contrasena-larga",
      }).success,
    ).toBe(false);
    expect(passwordSchema.safeParse("corta").success).toBe(false);
  });

  it("rechaza un nombre visible de más de 40 caracteres", () => {
    expect(
      registerBodySchema.safeParse({
        handle: "demo_user",
        displayName: "a".repeat(41),
        password: "contrasena-larga",
      }).success,
    ).toBe(false);
  });
});

describe("loginBodySchema", () => {
  it("no acepta una contraseña vacía", () => {
    expect(loginBodySchema.safeParse({ handle: "demo_user", password: "" }).success).toBe(false);
    expect(
      loginBodySchema.safeParse({ handle: "demo_user", password: "contrasena-larga" }).success,
    ).toBe(true);
  });
});

describe("userViewSchema y sessionViewSchema", () => {
  const user = {
    userId: "u-1",
    handle: "demo_user",
    displayName: "Demo",
    createdAt: "2026-11-25T10:00:00.000Z",
  };

  it("aceptan una cuenta y una sesión completas", () => {
    expect(userViewSchema.safeParse(user).success).toBe(true);
    expect(
      sessionViewSchema.safeParse({
        user,
        accessToken: "aaa.bbb.ccc",
        refreshToken: "x".repeat(43),
        expiresIn: 900,
      }).success,
    ).toBe(true);
  });

  it("rechazan una fecha sin zona y una vida de token no positiva", () => {
    expect(userViewSchema.safeParse({ ...user, createdAt: "ayer" }).success).toBe(false);
    expect(
      sessionViewSchema.safeParse({
        user,
        accessToken: "aaa.bbb.ccc",
        refreshToken: "x".repeat(43),
        expiresIn: 0,
      }).success,
    ).toBe(false);
  });
});
