/**
 * La superficie de `@melodify/connectivity` (paso 14 del plan): la fábrica y el
 * adaptador de `expo-network`, que es el único que habla con el módulo nativo.
 *
 * El adaptador se comprueba por su forma y no ejecutándolo contra el sistema: en
 * Jest `expo-network` está doblado en el arnés común, y su comportamiento tiene su
 * propia prueba (`expo-network-adapter.test.ts`).
 */
import * as connectivityModule from "../index";
import { createConnectivity, expoNetworkAdapter } from "../index";

const NOW_MS = Date.parse("2026-11-12T09:00:00.000Z");

describe("@melodify/connectivity — superficie", () => {
  it("expone la fábrica y el adaptador que nombra su contrato", () => {
    expect(Object.keys(connectivityModule).sort()).toEqual([
      "createConnectivity",
      "expoNetworkAdapter",
    ]);
  });

  it("una construcción con un adaptador doblado es usable desde la superficie", () => {
    const connectivity = createConnectivity({
      network: {
        getState: async () => ({ online: true }),
        addListener: () => () => {},
      },
      now: () => NOW_MS,
    });

    expect(connectivity.getNetworkState()).toEqual({
      online: true,
      measuredAt: new Date(NOW_MS).toISOString(),
    });
  });

  it("el adaptador publicado tiene la forma que espera la fábrica", () => {
    expect(typeof expoNetworkAdapter.getState).toBe("function");
    expect(typeof expoNetworkAdapter.addListener).toBe("function");
  });
});
