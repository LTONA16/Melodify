/**
 * Humo de `@melodify/content-store`: el paquete compila y su módulo de entrada se
 * resuelve desde las pruebas. La superficie completa se afirma en el paso 14.
 */
import * as contentStore from "../index";

describe("@melodify/content-store — módulo de entrada", () => {
  it("se importa sin lanzar", () => {
    expect(contentStore).toBeDefined();
  });
});
