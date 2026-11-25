import { describe, expect, it } from "vitest";

import { EnvError, parseEnv } from "../src/config/env";
import { loggerOptions } from "../src/lib/logger";

import { testEnv } from "./helpers/test-env";

/**
 * La configuración: lo que el proceso exige para arrancar y los valores por
 * defecto que no deberían sorprender a nadie.
 */
const MINIMAL = {
  DATABASE_URL: "postgresql://melodify:melodify@localhost:5433/melodify?schema=public",
  JWT_ACCESS_SECRET: "s".repeat(40),
};

describe("parseEnv", () => {
  it("aplica los valores por defecto de desarrollo", () => {
    const env = parseEnv({ ...MINIMAL });

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3000);
    expect(env.HOST).toBe("0.0.0.0");
    expect(env.ACCESS_TOKEN_TTL).toBe("15m");
    expect(env.REFRESH_TOKEN_TTL_DAYS).toBe(30);
    expect(env.SEED_DEMO).toBe("false");
    expect(env.CORS_ORIGINS).toEqual([]);
  });

  it("convierte el puerto y separa los orígenes de CORS", () => {
    const env = parseEnv({
      ...MINIMAL,
      PORT: "8080",
      CORS_ORIGINS: "https://a.test, https://b.test ,",
    });

    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGINS).toEqual(["https://a.test", "https://b.test"]);
  });

  it("nombra la variable que falta sin imprimir valores", () => {
    expect(() => parseEnv({ JWT_ACCESS_SECRET: MINIMAL.JWT_ACCESS_SECRET })).toThrowError(
      /DATABASE_URL/,
    );
    expect(() => parseEnv({ JWT_ACCESS_SECRET: MINIMAL.JWT_ACCESS_SECRET })).toThrowError(
      EnvError,
    );
  });

  it("rechaza un secreto demasiado corto y nombra el campo", () => {
    expect(() => parseEnv({ ...MINIMAL, JWT_ACCESS_SECRET: "corto" })).toThrowError(
      /JWT_ACCESS_SECRET/,
    );
  });

  it("rechaza un puerto fuera de rango", () => {
    expect(() => parseEnv({ ...MINIMAL, PORT: "0" })).toThrowError(/PORT/);
    expect(() => parseEnv({ ...MINIMAL, PORT: "abc" })).toThrowError(/PORT/);
  });

  it("rechaza un NODE_ENV que no es uno de los tres", () => {
    expect(() => parseEnv({ ...MINIMAL, NODE_ENV: "staging" })).toThrowError(/NODE_ENV/);
  });
});

describe("loggerOptions", () => {
  it("calla en pruebas y tacha las credenciales en cualquier entorno", () => {
    expect(loggerOptions(testEnv()).level).toBe("silent");

    const production = loggerOptions(testEnv({ NODE_ENV: "production" }));
    expect(production.level).toBe("info");
    expect(production.redact.paths).toContain("req.headers.authorization");
    expect(production.redact.paths).toContain("*.password");
    expect(production.redact.censor).toBe("[redactado]");
  });
});
