import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiError } from "../src/lib/errors";
import { toErrorResponse } from "../src/plugins/errors";

import { buildTestApp } from "./helpers/build-test-app";

/**
 * El sobre de error: una sola forma para todos los fallos y ninguna traza hacia
 * quien hizo la petición. Se prueba la traducción directamente, sin levantar el
 * servidor, porque es una función pura.
 */
describe("traducción de errores a HTTP", () => {
  it("respeta el código y el mensaje de un ApiError", () => {
    const response = toErrorResponse(
      new ApiError(409, "opinion_already_exists", "Ya tienes una opinión de esta obra.", [
        { path: "workId", message: "ya existe" },
      ]),
    );

    expect(response.statusCode).toBe(409);
    expect(response.body.error.code).toBe("opinion_already_exists");
    expect(response.body.error.details).toEqual([{ path: "workId", message: "ya existe" }]);
  });

  it("convierte un fallo de validación de Zod en 422 con el campo señalado", () => {
    const parsed = z.object({ text: z.string() }).safeParse({ text: 42 });
    if (parsed.success) throw new Error("la prueba necesita un fallo de validación");

    const response = toErrorResponse(parsed.error);

    expect(response.statusCode).toBe(422);
    expect(response.body.error.code).toBe("validation_failed");
    expect(response.body.error.details?.[0]?.path).toBe("text");
  });

  it("convierte la validación de Fastify en 422 y traduce la ruta del campo", () => {
    const response = toErrorResponse({
      statusCode: 400,
      validation: [{ instancePath: "/rating", message: "must be <= 5" }],
    });

    expect(response.statusCode).toBe(422);
    expect(response.body.error.details?.[0]).toEqual({
      path: "rating",
      message: "must be <= 5",
    });
  });

  it("conserva el 429 del límite de peticiones con un mensaje accionable", () => {
    const response = toErrorResponse({ statusCode: 429 });

    expect(response.statusCode).toBe(429);
    expect(response.body.error.code).toBe("rate_limited");
    expect(response.body.error.message).toContain("vuelve a intentarlo");
  });

  it("no filtra el detalle interno en un 500", () => {
    const response = toErrorResponse(new Error("la contraseña maestra es 1234"));

    expect(response.statusCode).toBe(500);
    expect(response.body.error.code).toBe("internal_error");
    expect(JSON.stringify(response.body)).not.toContain("1234");
  });
});

describe("rutas que no existen", () => {
  it("responden 404 con el mismo sobre", async () => {
    const app = buildTestApp();

    const response = await app.inject({ method: "GET", url: "/api/v1/no-existe" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: { code: "not_found", message: "No encontramos lo que buscas." },
    });

    await app.close();
  });
});
