/**
 * La superficie de `@melodify/content-store` (paso 14 del plan): el paquete
 * publica su fábrica y los dos topes de longitud de la 1.2.0, y una construcción
 * sin argumentos es usable.
 *
 * Esta prueba mira lo que se puede importar en ejecución, no los tipos: un tipo
 * exportado no aparece en el módulo y su comprobación es el typecheck. Lo que se
 * afirma es que nadie añadió una segunda puerta de entrada sin pasar por el
 * contrato (C4 1.2.0).
 */
import * as contentStore from "../index";
import {
  createContentStore,
  MAX_COMMENT_LENGTH,
  MAX_OPINION_LENGTH,
} from "../index";

describe("@melodify/content-store — superficie", () => {
  it("expone la fábrica y los dos topes que nombra su contrato", () => {
    expect(Object.keys(contentStore).sort()).toEqual([
      "MAX_COMMENT_LENGTH",
      "MAX_OPINION_LENGTH",
      "createContentStore",
    ]);
  });

  it("los topes son los del contrato: 500 para la opinión y 300 para el comentario", () => {
    expect(MAX_OPINION_LENGTH).toBe(500);
    expect(MAX_COMMENT_LENGTH).toBe(300);
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
