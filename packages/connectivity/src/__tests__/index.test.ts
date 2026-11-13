/**
 * Humo de `@melodify/connectivity`: el paquete compila y su módulo de entrada se
 * resuelve desde las pruebas. La superficie completa se afirma en el paso 14.
 */
import * as connectivity from "../index";

describe("@melodify/connectivity — módulo de entrada", () => {
  it("se importa sin lanzar", () => {
    expect(connectivity).toBeDefined();
  });
});
