import { afterAll, beforeEach, describe, expect, it } from "vitest";

import type { SessionView, UserView } from "@melodify/contracts";

import { buildApp } from "../src/app";
import { clearDatabase, realPrisma } from "./helpers/real-prisma";
import { testEnv } from "./helpers/test-env";

/**
 * Las cuentas y las sesiones, contra el Postgres de pruebas de verdad.
 *
 * No se dobla la base de datos: lo que se afirma es que el usuario quedó
 * guardado con Argon2id, que el refresh rotó y que un token revocado ya no
 * sirve. Un doble podría decir que sí a todo.
 */
const prisma = realPrisma();
const app = buildApp({ env: testEnv(), prisma, logger: false, docs: false });

const PASSWORD = "contrasena-larga";

async function register(
  overrides: Partial<{ handle: string; displayName: string; password: string }> = {},
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: { handle: "demo_user", displayName: "Demo", password: PASSWORD, ...overrides },
  });
}

async function sessionFor(handle: string): Promise<SessionView> {
  const response = await register({ handle });
  expect(response.statusCode).toBe(201);
  return response.json() as SessionView;
}

function refresh(refreshToken: string) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/refresh",
    payload: { refreshToken },
  });
}

function login(handle: string, password: string) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { handle, password },
  });
}

beforeEach(async () => {
  await clearDatabase(prisma);
});

afterAll(async () => {
  await app.close();
});

describe("POST /api/v1/auth/register", () => {
  it("crea la cuenta, abre sesión y no devuelve el hash", async () => {
    const response = await register({ handle: "Demo_User", displayName: "  Demo  " });

    expect(response.statusCode).toBe(201);

    const session = response.json() as SessionView;
    expect(session.user.handle).toBe("demo_user");
    expect(session.user.displayName).toBe("Demo");
    expect(session.user.userId).toEqual(expect.any(String));
    expect(session.accessToken.split(".")).toHaveLength(3);
    expect(session.refreshToken.length).toBeGreaterThanOrEqual(40);
    expect(session.expiresIn).toBe(900);
    expect(JSON.stringify(session)).not.toContain("passwordHash");
  });

  it("guarda la contraseña con Argon2id, nunca en claro", async () => {
    await register({ handle: "hash_user" });

    const stored = await prisma.user.findUnique({ where: { handle: "hash_user" } });
    expect(stored?.passwordHash).toContain("$argon2id$");
    expect(stored?.passwordHash).not.toBe(PASSWORD);
  });

  it("rechaza un handle ya ocupado sin distinguir mayúsculas", async () => {
    await register({ handle: "repetido" });

    const response = await register({ handle: "REPETIDO", displayName: "Otro" });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ error: { code: "handle_taken" } });
  });

  it("responde 422 con el detalle cuando los datos no valen", async () => {
    const response = await register({ handle: "ab", password: "corta" });

    expect(response.statusCode).toBe(422);

    const body = response.json() as { error: { code: string; details: { path: string }[] } };
    expect(body.error.code).toBe("validation_failed");
    expect(body.error.details.map((detail) => detail.path)).toEqual(
      expect.arrayContaining(["handle", "password"]),
    );
  });
});

describe("POST /api/v1/auth/login", () => {
  it("entra con el handle en otra caja y la contraseña correcta", async () => {
    await register({ handle: "login_user" });

    const response = await login("Login_User", PASSWORD);

    expect(response.statusCode).toBe(200);
    expect((response.json() as SessionView).user.handle).toBe("login_user");
  });

  it("responde lo mismo con contraseña mala que con una cuenta que no existe", async () => {
    await register({ handle: "login_user" });

    const badPassword = await login("login_user", "otra-contrasena");
    const unknownUser = await login("nadie", PASSWORD);

    expect(badPassword.statusCode).toBe(401);
    expect(unknownUser.statusCode).toBe(401);
    expect(badPassword.json()).toMatchObject({ error: { code: "invalid_credentials" } });
    expect(unknownUser.json()).toMatchObject({ error: { code: "invalid_credentials" } });
    expect((unknownUser.json() as { error: { message: string } }).error.message).toBe(
      (badPassword.json() as { error: { message: string } }).error.message,
    );
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("rota el token y el nuevo access token sirve en /me", async () => {
    const session = await sessionFor("refresh_user");

    const response = await refresh(session.refreshToken);

    expect(response.statusCode).toBe(200);

    const next = response.json() as SessionView;
    expect(next.refreshToken).not.toBe(session.refreshToken);
    expect(next.user.userId).toBe(session.user.userId);

    const me = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${next.accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect((me.json() as UserView).handle).toBe("refresh_user");
  });

  it("reutilizar un token ya rotado revoca la familia entera", async () => {
    const session = await sessionFor("reuse_user");
    const rotated = (await refresh(session.refreshToken)).json() as SessionView;

    const reuse = await refresh(session.refreshToken);

    expect(reuse.statusCode).toBe(401);
    expect(reuse.json()).toMatchObject({ error: { code: "refresh_reused" } });

    const afterReuse = await refresh(rotated.refreshToken);
    expect(afterReuse.statusCode).toBe(401);
    expect(afterReuse.json()).toMatchObject({ error: { code: "refresh_reused" } });
  });

  it("rechaza un token desconocido y uno caducado", async () => {
    const unknown = await refresh("token-que-no-existe-pero-es-largo");
    expect(unknown.statusCode).toBe(401);
    expect(unknown.json()).toMatchObject({ error: { code: "token_expired" } });

    const session = await sessionFor("expired_user");
    await prisma.refreshToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1_000) } });

    const expired = await refresh(session.refreshToken);
    expect(expired.statusCode).toBe(401);
    expect(expired.json()).toMatchObject({ error: { code: "token_expired" } });
  });

  it("dos rotaciones a la vez dejan una sola sesión viva", async () => {
    const session = await sessionFor("race_user");

    const [first, second] = await Promise.all([
      refresh(session.refreshToken),
      refresh(session.refreshToken),
    ]);

    expect([first.statusCode, second.statusCode].sort()).toEqual([200, 401]);
    const failed = first.statusCode === 401 ? first : second;
    expect(failed.json()).toMatchObject({ error: { code: "refresh_reused" } });
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("cierra la sesión y el refresh token deja de servir", async () => {
    const session = await sessionFor("logout_user");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: { refreshToken: session.refreshToken },
    });

    expect(response.statusCode).toBe(204);

    const after = await refresh(session.refreshToken);
    expect(after.statusCode).toBe(401);
  });

  it("es idempotente con un token que no existe", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: { refreshToken: "token-que-no-existe-pero-es-largo" },
    });

    expect(response.statusCode).toBe(204);
  });
});

describe("GET /api/v1/me", () => {
  it("devuelve la cuenta dueña del access token", async () => {
    const session = await sessionFor("perfil_user");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${session.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      userId: session.user.userId,
      handle: "perfil_user",
      displayName: "Demo",
    });
  });

  it("responde 401 sin token o con uno que no es nuestro", async () => {
    const withoutToken = await app.inject({ method: "GET", url: "/api/v1/me" });
    expect(withoutToken.statusCode).toBe(401);
    expect(withoutToken.json()).toMatchObject({ error: { code: "token_expired" } });

    const garbage = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: "Bearer no.es.un.jwt" },
    });
    expect(garbage.statusCode).toBe(401);
  });

  it("rechaza el token de una cuenta que ya no existe", async () => {
    const session = await sessionFor("borrado");
    await prisma.user.delete({ where: { id: session.user.userId } });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: { authorization: `Bearer ${session.accessToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({ error: { code: "token_expired" } });
  });
});

describe("límite de peticiones", () => {
  it("corta con 429 cuando se repite el registro en la misma ventana", async () => {
    const limitedPrisma = realPrisma();
    const limited = buildApp({
      env: testEnv(),
      prisma: limitedPrisma,
      logger: false,
      docs: false,
    });

    try {
      let last = await limited.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: { handle: "rate_0", displayName: "Rate", password: PASSWORD },
      });

      for (let index = 1; index <= 20; index += 1) {
        last = await limited.inject({
          method: "POST",
          url: "/api/v1/auth/register",
          payload: { handle: `rate_${index}`, displayName: "Rate", password: PASSWORD },
        });
      }

      expect(last.statusCode).toBe(429);
      expect(last.json()).toMatchObject({ error: { code: "rate_limited" } });
    } finally {
      await limited.close();
    }
  });
});
