import {
  act,
  fireEvent,
  render,
  within,
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
import { createContentStore, type ContentStore } from "@melodify/content-store";
import { ThemeProvider } from "@melodify/design-system";

import type { AppLogger } from "../../../bootstrap/logger";
import { DetalleObraScreen } from "../DetalleObraScreen";

/**
 * El detalle de obra contra un C4 y un C5 reales sembrados (AC4.1.1, AC4.1.6,
 * AC4.2.1, AC4.3.2, AC4.3.3, NFR8.5): se comprueba la integración —las opiniones y
 * la media de la siembra, el botón que abre Crear con su obra, el aviso de sin
 * conexión y una sola decisión de portada por lectura— no la pintura, que ya cubre
 * `detalle-obra-view.test.tsx`.
 *
 * La sesión, la red y las acciones globales son dobles porque son las fronteras que
 * esta unidad no posee (C3 y C2); el contenido y el catálogo no se doblan: una prueba
 * de integración con almacenes de mentira no probaría la lectura que se quiere probar.
 */
const NOW = "2026-11-12T09:00:00.000Z";
const DEMO = "demo";
const BOHEMIAN = "4u7EnebtmKWzUH433Rbtpz";
const BAD_GUY = "2Fxmhks0bxGSBdJ92vM42m";

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

/** Una red que se puede mover desde la prueba; alimenta la cáscara y el catálogo. */
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
  workId?: string;
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
  const workId = options.workId ?? BOHEMIAN;

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
          <DetalleObraScreen
            work={{ workId }}
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

describe("DetalleObraScreen", () => {
  it("fija el título de su detalle en la cabecera de la cáscara una sola vez", async () => {
    const view = setup();

    await view.findByTestId("opinion-card-op-001");

    expect(view.global.setHeader).toHaveBeenCalledTimes(1);
    expect(view.global.setHeader).toHaveBeenCalledWith({
      title: "Detalle de obra",
    });

    view.rerender(view.tree);

    expect(view.global.setHeader).toHaveBeenCalledTimes(1);
  });

  it("pinta la opinión propia y la ajena de la siembra con la media y el recuento de la obra", async () => {
    const view = setup();

    await view.findByTestId("opinion-card-op-001");

    const cards = view.getAllByTestId(/^opinion-card-/);

    expect(cards).toHaveLength(2);
    expect(cards[0]!.props.testID).toBe("opinion-card-op-001");
    expect(view.getByTestId("opinion-own-label")).toHaveTextContent(
      "Tu opinión",
    );
    expect(view.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(
      within(view.getByTestId("work-header")).getByTestId("rating-value"),
    ).toHaveTextContent("5 de 5");
    expect(view.getByTestId("work-header-count")).toHaveTextContent(
      "2 opiniones",
    );
    expect(view.queryByTestId("detalle-obra-create")).toBeNull();
  });

  it("«Editar» está en la tarjeta propia y en U2 no navega a ninguna parte", async () => {
    const view = setup();

    await view.findByTestId("opinion-card-op-001");

    fireEvent.press(view.getByTestId("opinion-edit"));

    expect(view.global.openEdit).not.toHaveBeenCalled();
    expect(view.global.openCreate).not.toHaveBeenCalled();
    expect(view.global.openOpinionDetail).not.toHaveBeenCalled();
    expect(view.global.openWorkDetail).not.toHaveBeenCalled();
  });

  it("«Opinar sobre esta obra» abre Crear con la obra preseleccionada", async () => {
    const view = setup({ workId: BAD_GUY });

    await view.findByTestId("opinion-card-op-005");

    expect(view.queryByTestId("opinion-own-label")).toBeNull();

    fireEvent.press(view.getByTestId("detalle-obra-create"));

    expect(view.global.openCreate).toHaveBeenCalledWith({ workId: BAD_GUY });
  });

  it("sin conexión pinta el aviso, conserva la identidad y reintenta las portadas", async () => {
    const network = networkDouble(false);
    const content = createContentStore({ now: NOW });
    const catalog = createCatalog({
      content,
      connectivity: network.connectivity,
      session: null,
      search: null,
      resolve: null,
    });
    const retryCovers = jest.spyOn(catalog, "retryCovers");

    const view = setup({ content, catalog, network });

    await view.findByTestId("opinion-card-op-001");

    expect(
      view.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
    expect(view.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );

    fireEvent.press(view.getByTestId("banner-action"));

    expect(retryCovers).toHaveBeenCalledTimes(1);
  });

  it("pregunta la portada una vez por lectura y no la vuelve a preguntar al repintar", async () => {
    const content = createContentStore({ now: NOW });
    const network = networkDouble(true);
    const catalog = createCatalog({
      content,
      connectivity: network.connectivity,
      session: null,
      search: null,
      resolve: null,
    });
    const coverFor = jest.spyOn(catalog, "coverFor");

    const view = setup({ content, catalog, network });

    await view.findByTestId("opinion-card-op-001");

    expect(coverFor).toHaveBeenCalledTimes(1);

    act(() => {
      network.set(false);
    });

    // La decisión depende de la red: al cambiar hay que volver a preguntar (BR5.3).
    expect(coverFor).toHaveBeenCalledTimes(2);

    view.rerender(view.tree);

    expect(coverFor).toHaveBeenCalledTimes(2);
  });

  it("si la obra no está en el catálogo pinta el error, lo registra y «Reintentar» relee", async () => {
    const view = setup({ workId: "obra-que-no-existe" });

    await view.findByText("No pudimos cargar esta obra.");

    expect(view.queryByTestId("work-header")).toBeNull();
    expect(view.log.error).toHaveBeenCalledWith(
      "CONTENT_READ_FAILED",
      "La obra no está en el catálogo.",
    );

    fireEvent.press(view.getByTestId("error-state-retry"));

    expect(view.getByText("No pudimos cargar esta obra.")).toBeVisible();
  });
});
