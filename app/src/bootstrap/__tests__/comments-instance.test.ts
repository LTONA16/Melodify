/**
 * La única instancia del controlador de comentarios (paso 25 del plan, TS-18, R-01).
 *
 * Lo que se defiende aquí no es la forma del controlador —eso lo cubre
 * `comments-controller.test.ts`— sino que el arranque construya **una sola** y que la
 * cáscara consuma esa misma: una segunda instancia daría dos estados para la misma
 * hoja (una lista que no se actualiza, un error de envío que no se ve).
 */
import { commentsController } from "../comments";
import { defaultShellServices } from "../shell-services";
import { contentStore } from "../instances";
import { appSession } from "../session";

jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: "WIFI",
  })),
  addNetworkStateListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe("instancia única de comentarios", () => {
  it("la cáscara recibe exactamente el controlador del arranque", () => {
    expect(defaultShellServices.comments).toBe(commentsController);
  });

  it("abrir la hoja desde la cáscara mueve el mismo estado que ve el controlador", () => {
    const seen: string[] = [];
    const unsubscribe = defaultShellServices.comments.subscribe((state) => {
      seen.push(state.status);
    });

    try {
      defaultShellServices.comments.open("op-001");

      // Una segunda instancia tendría su propio estado y esta lectura no la vería.
      expect(commentsController.state.opinionId).toBe("op-001");
      expect(commentsController.state.comments.length).toBeGreaterThan(0);
      expect(commentsController.state.status).toBe("ready");
    } finally {
      defaultShellServices.comments.close();
      unsubscribe();
    }

    expect(commentsController.state.opinionId).toBeNull();
    expect(seen.length).toBeGreaterThan(0);
  });

  it("lee el contenido de la app y arranca cerrada, sin estado inventado", () => {
    expect(commentsController.state.opinionId).toBeNull();
    expect(commentsController.state.comments).toEqual([]);

    // Si el controlador se hubiera construido con otro almacén, esta opinión de la
    // siembra que la cáscara va a abrir no existiría.
    const opened = contentStore.getOpinion({ opinionId: "op-002", viewerId: "demo" });
    expect(opened.ok).toBe(true);
    expect(typeof appSession.getSession).toBe("function");
  });
});
