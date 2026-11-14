/**
 * Dobles compartidos por las pruebas de pantalla de U2.
 *
 * Las pantallas importan sus instancias del punto de composición, así que la única
 * forma de probarlas sin tocar el sistema operativo ni el almacenamiento es
 * sustituir esos dos módulos con `jest.mock`. Este archivo concentra la sustitución
 * en un solo sitio: tres copias del mismo cableado acabarían discrepando y una
 * prueba pasaría por el motivo equivocado.
 *
 * No es un archivo de pruebas —el `testMatch` solo recoge `*.test.*`— y vive bajo
 * `__tests__/` para quedar fuera de la cobertura, igual que las pruebas.
 */
import { createCatalog } from "@melodify/catalog";
import { createConnectivity } from "@melodify/connectivity";
import { createContentStore } from "@melodify/content-store";

/** El instante fijo de la siembra: ni un solo cálculo depende del reloj real. */
const NOW = Date.parse("2026-11-13T12:00:00.000Z");

export interface InstanceDoubles {
  contentStore: ReturnType<typeof createContentStore>;
  connectivity: ReturnType<typeof createConnectivity>;
  catalog: ReturnType<typeof createCatalog>;
  /** Mueve la red como lo haría el sistema operativo, sin `expo-network`. */
  __setOnline: (online: boolean) => void;
}

/** El contenido, el catálogo y la red de la app, con la siembra real. */
export function createInstanceDoubles(): InstanceDoubles {
  const listeners = new Set<(state: { online: boolean }) => void>();
  let online = true;

  const contentStore = createContentStore({ now: NOW });
  const connectivity = createConnectivity({
    network: {
      getState: async () => ({ online }),
      addListener: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
    now: () => NOW,
  });
  const catalog = createCatalog({
    content: contentStore,
    connectivity,
    session: null,
    search: null,
    resolve: null,
  });

  return {
    contentStore,
    connectivity,
    catalog,
    __setOnline: (next) => {
      online = next;
      for (const listener of listeners) {
        listener({ online: next });
      }
    },
  };
}

/** La sesión única de la app: `demo` dentro, con `signOut` espiable. */
export function createSessionModule() {
  const listeners = new Set<(view: unknown) => void>();

  return {
    appSession: {
      getSession: jest.fn(async () => ({
        code: 200 as const,
        session: { status: "signedIn" as const, authorId: "demo", remembered: true },
      })),
      signIn: jest.fn(async () => ({ code: 401 as const })),
      signOut: jest.fn(async () => {
        for (const listener of listeners) {
          listener({ status: "signedOut", authorId: "demo", remembered: false });
        }
        return { code: 204 as const };
      }),
      subscribeSession: (listener: (view: unknown) => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  };
}
