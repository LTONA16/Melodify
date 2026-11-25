/**
 * La superficie de `@melodify/catalog` (paso 14 del plan): una sola fábrica y sus
 * colaboradores mínimos —contenido y conectividad— bastan para construir.
 *
 * Los puertos viajan en `null` en esta prueba, que es el estado real de la unidad
 * hasta U4: sin sesión, sin búsqueda y sin resolución el catálogo de ejemplo sigue
 * siendo usable (BR5.6).
 */
import type { Connectivity } from "@melodify/connectivity";
import { createContentStore } from "@melodify/content-store";

import * as catalogModule from "../index";
import { createCatalog } from "../index";

const NOW = "2026-11-12T09:00:00.000Z";

function fixedConnectivity(): Connectivity {
  return {
    getNetworkState: () => ({ online: true, measuredAt: NOW }),
    subscribeNetwork: () => () => {},
  };
}

describe("@melodify/catalog — superficie", () => {
  it("expone exactamente la fábrica que nombra su contrato", () => {
    expect(Object.keys(catalogModule).sort()).toEqual(["createCatalog"]);
  });

  it("se construye con contenido y conectividad, sin ningún puerto registrado", () => {
    const catalog = createCatalog({
      content: createContentStore({ now: NOW }),
      connectivity: fixedConnectivity(),
      session: null,
      search: null,
      resolve: null,
    });

    expect(catalog.listSampleWorks().works).toHaveLength(8);
    expect(catalog.getCoverFailure()).toBe(false);
  });
});
