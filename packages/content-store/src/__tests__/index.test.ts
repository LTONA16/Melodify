/**
 * La superficie de `@melodify/content-store` (paso 14 del plan): el paquete
 * publica **solo** su fábrica, y una construcción sin argumentos es usable.
 *
 * Esta prueba mira lo que se puede importar en ejecución, no los tipos: un tipo
 * exportado no aparece en el módulo y su comprobación es el typecheck. Lo que se
 * afirma es que nadie añadió una segunda puerta de entrada sin pasar por el
 * contrato (C4 1.0.0).
 */
import * as contentStore from "../index";
import { createContentStore } from "../index";

describe("@melodify/content-store — superficie", () => {
  it("expone exactamente la fábrica que nombra su contrato", () => {
    expect(Object.keys(contentStore).sort()).toEqual(["createContentStore"]);
  });

  it("una construcción sin argumentos es usable desde la superficie", () => {
    const store = createContentStore();
    const opinions = store.listOpinions({ viewerId: "demo" });

    expect(opinions.ok).toBe(true);
    if (!opinions.ok) {
      return;
    }
    expect(opinions.value.length).toBeGreaterThan(0);
  });
});
