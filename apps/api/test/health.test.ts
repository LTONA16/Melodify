import { afterEach, describe, expect, it } from "vitest";

import { buildTestApp, prismaStub } from "./helpers/build-test-app";

/**
 * La sonda de salud: lo primero que existe del servicio y lo que el despliegue
 * local usa para saber si puede empezar a hablarle.
 */
const apps: ReturnType<typeof buildTestApp>[] = [];

function appWith(prisma = prismaStub()) {
  const app = buildTestApp({ prisma });
  apps.push(app);
  return app;
}

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("GET /api/v1/health", () => {
  it("responde 200 con la versión y la base de datos arriba", async () => {
    const response = await appWith().inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      version: expect.any(String),
      database: "up",
    });
  });

  it("responde 503 cuando la base de datos no responde", async () => {
    const failing = prismaStub({
      $queryRawUnsafe: async () => {
        throw new Error("sin conexión");
      },
    });

    const response = await appWith(failing).inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ status: "degraded", database: "down" });
  });

  it("publica su contrato en OpenAPI cuando la documentación está activa", async () => {
    const app = buildTestApp({ docs: true });
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/api/v1/docs/json" });

    expect(response.statusCode).toBe(200);
    const document = response.json() as {
      openapi?: string;
      paths?: Record<string, unknown>;
    };
    expect(document.openapi).toBe("3.0.3");
    expect(document.paths?.["/api/v1/health"]).toBeDefined();
  });
});
