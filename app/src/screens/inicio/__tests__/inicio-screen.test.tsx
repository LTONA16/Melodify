import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import {
  GlobalServicesContext,
  ShellServicesContext,
  type GlobalServices,
  type ShellServices,
} from "@melodify/app-shell";
import type { AppSession, SessionView } from "@melodify/app-session";
import { createCatalog, type Catalog } from "@melodify/catalog";
import type { Connectivity, NetworkView } from "@melodify/connectivity";
import {
  createContentStore,
  type ContentSnapshot,
  type ContentStore,
} from "@melodify/content-store";
import { ThemeProvider } from "@melodify/design-system";

import type { AppLogger } from "../../../bootstrap/logger";
import { InicioScreen } from "../InicioScreen";

/**
 * Inicio completo contra un C4 y un C5 reales sembrados (AC2.1.1, AC2.1.3, AC2.3.1,
 * NFR8.5): lo que se comprueba es la integración —diez tarjetas de la siembra, una
 * sola decisión de portada por opinión y por cambio real, y la navegación al detalle—
 * no la pintura, que ya cubre `inicio-view.test.tsx`.
 *
 * La sesión, la red y las acciones globales son dobles porque son las fronteras que
 * esta unidad no posee (C3 y C2); el contenido y el catálogo no se doblan: una prueba
 * de integración con almacenes de mentira no probaría el mapeo que se quiere probar.
 */
const NOW = "2026-11-12T09:00:00.000Z";
const DEMO = "demo";

const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: DEMO,
  remembered: true,
};

function silentLogger(): AppLogger {
  return { warn: jest.fn(), error: jest.fn() };
}

function signedInSession(): AppSession {
  return {
    getSession: jest.fn(async () => ({ code: 200 as const, session: SIGNED_IN })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    subscribeSession: jest.fn(() => () => undefined),
  } as unknown as AppSession;
}

/**
 * Una red que se puede mover desde la prueba: la cáscara lee el booleano y el
 * catálogo pregunta a C6 por la decisión de portada, así que el doble alimenta las
 * dos caras de la misma verdad.
 */
function networkDouble(initial: boolean) {
  let online = initial;
  const shellListeners = new Set<(value: boolean) => void>();
  const stateListeners = new Set<(view: NetworkView) => void>();

  const view = (): NetworkView => ({ online, measuredAt: NOW });

  const connectivity: Connectivity = {
    getNetworkState: () => view(),
    subscribeNetwork: (listener) => {
      stateListeners.add(listener);
      listener(view());
      return () => {
        stateListeners.delete(listener);
      };
    },
  };

  return {
    connectivity,
    service: {
      online,
      subscribe: (listener: (value: boolean) => void) => {
        shellListeners.add(listener);
        return () => {
          shellListeners.delete(listener);
        };
      },
    },
    set(next: boolean) {
      online = next;
      for (const listener of [...stateListeners]) {
        listener(view());
      }
      for (const listener of [...shellListeners]) {
        listener(next);
      }
    },
  };
}

interface HarnessOptions {
  content?: ContentStore;
  catalog?: Catalog;
  network?: ReturnType<typeof networkDouble>;
}

function setup(options: HarnessOptions = {}) {
  const network = options.network ?? networkDouble(true);
  const content = options.content ?? createContentStore({ now: NOW });
  const catalog =
    options.catalog ??
    createCatalog({
      content,
      connectivity: network.connectivity,
      session: null,
      search: null,
      resolve: null,
    });
  const log = silentLogger();
  const session = signedInSession();

  const services: ShellServices = {
    network: network.service,
    spotify: {
      status: "disconnected",
      subscribe: () => () => undefined,
      connect: () => undefined,
      disconnect: () => undefined,
      retry: () => undefined,
    },
    comments: {
      state: { opinionId: null, comments: [], status: "empty" },
      subscribe: () => () => undefined,
      open: () => undefined,
      close: () => undefined,
      retry: () => undefined,
      submit: () => undefined,
    },
  };

  const global: GlobalServices = {
    showSnackbar: jest.fn(),
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
  };

  const tree = (
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={services}>
        <GlobalServicesContext.Provider value={global}>
          <InicioScreen
            session={session}
            content={content}
            catalog={catalog}
            log={log}
          />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>
  );

  const result = render(tree);

  return { ...result, tree, network, content, catalog, global, session, log };
}

describe("InicioScreen", () => {
  it("pinta las diez opiniones de la siembra con su autor, obra y valoración", async () => {
    const view = setup();

    await view.findByTestId("opinion-card-op-002");

    expect(view.getAllByTestId("opinion-work-title")).toHaveLength(10);
    expect(view.getAllByTestId("opinion-author")[0]).toHaveTextContent(
      "Lucía Ferrer",
    );
    expect(view.getAllByTestId("opinion-work-title")[0]).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(view.getAllByTestId("rating-value")[0]).toHaveTextContent("4 de 5");
    expect(view.queryByTestId("skeleton")).toBeNull();
  });

  it("pide la portada una vez por opinión y no vuelve a pedirla desde la tarjeta", async () => {
    const network = networkDouble(true);
    const content = createContentStore({ now: NOW });
    const catalog = createCatalog({
      content,
      connectivity: network.connectivity,
      session: null,
      search: null,
      resolve: null,
    });
    const coverFor = jest.spyOn(catalog, "coverFor");

    const view = setup({ content, catalog, network });

    await view.findByTestId("opinion-card-op-002");

    expect(coverFor).toHaveBeenCalledTimes(10);

    fireEvent.press(view.getByTestId("opinion-card-op-002"));

    expect(coverFor).toHaveBeenCalledTimes(10);
  });

  it("al cambiar la red vuelve a decidir las diez portadas y al repintar sin cambio no", async () => {
    const network = networkDouble(true);
    const content = createContentStore({ now: NOW });
    const catalog = createCatalog({
      content,
      connectivity: network.connectivity,
      session: null,
      search: null,
      resolve: null,
    });
    const coverFor = jest.spyOn(catalog, "coverFor");

    const view = setup({ content, catalog, network });

    await view.findByTestId("opinion-card-op-002");
    expect(coverFor).toHaveBeenCalledTimes(10);

    act(() => {
      network.set(false);
    });

    expect(coverFor).toHaveBeenCalledTimes(20);
    expect(
      view.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();

    view.rerender(view.tree);

    expect(coverFor).toHaveBeenCalledTimes(20);
  });

  it("tocar una tarjeta abre el detalle de esa opinión", async () => {
    const view = setup();

    await view.findByTestId("opinion-card-op-003");

    fireEvent.press(view.getByTestId("opinion-card-op-003"));

    expect(view.global.openOpinionDetail).toHaveBeenCalledWith({
      opinionId: "op-003",
    });
  });

  it("sin opiniones pinta el vacío de la siembra vacía y «Crear opinión» va a Crear", async () => {
    const content = createContentStore({ now: NOW, seed: { opinions: [] } });

    const view = setup({ content });

    await view.findByText("Aún no hay opiniones.");

    expect(view.getByText("Sé el primero.")).toBeVisible();

    fireEvent.press(view.getByTestId("empty-state-action"));

    expect(view.global.goToTab).toHaveBeenCalledWith({ name: "crear" });
  });

  it("si la suscripción falla pinta el error de contenido y «Reintentar» vuelve a suscribirse", async () => {
    const subscribeContent = jest.fn(
      (_viewerId: string | null | undefined, _listener: (snapshot: ContentSnapshot) => void) =>
        ({ ok: false as const, code: 422 as const, message: "Falta quien mira." }),
    );
    const content = { subscribeContent } as unknown as ContentStore;

    const view = setup({ content });

    await view.findByText("No pudimos cargar las opiniones.");
    expect(view.log.error).toHaveBeenCalledWith(
      "CONTENT_SUBSCRIBE_FAILED",
      "Falta quien mira.",
    );

    fireEvent.press(view.getByTestId("error-state-retry"));

    expect(subscribeContent).toHaveBeenCalledTimes(2);
  });

  it("sin colaboradores se queda en carga en lugar de inventar instancias", () => {
    render(
      <ThemeProvider scheme="light">
        <InicioScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText("Para ti")).toBeVisible();
    expect(screen.getByTestId("skeleton-card-3")).toBeTruthy();
    expect(screen.queryAllByTestId(/^opinion-card-/)).toHaveLength(0);
  });
});
