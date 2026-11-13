/**
 * Humo de `@melodify/catalog`: el paquete compila y su módulo de entrada se
 * resuelve desde las pruebas. La superficie completa se afirma en el paso 14.
 */
import * as catalog from "../index";

describe("@melodify/catalog — módulo de entrada", () => {
  it("se importa sin lanzar", () => {
    expect(catalog).toBeDefined();
  });
});
