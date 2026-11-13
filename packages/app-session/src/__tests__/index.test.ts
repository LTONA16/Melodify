import * as publicApi from "../index";

/**
 * C3 v1.1.0 es la superficie que consumen la app y las pruebas: si un símbolo
 * cambia de nombre o desaparece, esto lo dice antes de que falle una pantalla.
 */
describe("superficie pública de @melodify/app-session", () => {
  it("expone exactamente los valores de C3 1.1.0", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      "SESSION_STORAGE_KEY",
      "createAppSession",
      "getSession",
      "parseSessionRecord",
      "signIn",
      "signOut",
      "subscribeSession",
    ]);
  });

  it("construye una sesión usable sin argumentos", async () => {
    const session = publicApi.createAppSession();

    await expect(session.getSession()).resolves.toEqual({
      code: 200,
      session: { status: "signedOut", authorId: "demo", remembered: false },
    });
  });
});
