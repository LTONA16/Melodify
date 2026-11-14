import { act, fireEvent, render, renderHook } from "@testing-library/react-native";
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
import { PerfilScreen } from "../PerfilScreen";
import { usePerfil } from "../usePerfil";

/**
 * Perfil contra un C4 y un C5 reales sembrados (Paso 28, BR9.1–BR9.8): identidad y
 * contadores de la siembra, navegación al detalle, cierre de sesión por la sesión
 * inyectada —que no borra contenido— y el aviso de sin conexión.
 *
 * La sesión, la red y las acciones globales son dobles porque son las fronteras que
 * esta unidad no posee (C3 y C2); el contenido y el catálogo no se doblan: una prueba
 * de integración con almacenes de mentira no probaría la lectura que se quiere probar.
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
    signOut: jest.fn(async () => ({ code: 200 as const })),
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
  content?: ContentStore;
  catalog?: Catalog;
  network?: ReturnType<typeof networkDouble>;
  global?: GlobalServices;
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
  const global = options.global ?? globalServices();

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

  const tree = (
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={services}>
        <GlobalServicesContext.Provider value={global}>
          <PerfilScreen
            session={session}
            content={content}
            catalog={catalog}
            log={log}
          />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>
  );

  return { ...render(tree), tree, network, content, catalog, global, session };
}

function globalServices(
  overrides: Partial<GlobalServices> = {},
): GlobalServices {
  return {
    showSnackbar: jest.fn(),
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
    ...overrides,
  };
}

describe("PerfilScreen", () => {
  it("pinta la identidad y los contadores de la siembra", async () => {
    const view = setup();

    expect(await view.findByTestId("perfil-name")).toHaveTextContent(
      "Usuario demo",
    );
    expect(view.getByTestId("perfil-handle")).toHaveTextContent("@demo");
    expect(view.getByTestId("perfil-counters")).toHaveTextContent(
      "3 opiniones · 2 siguiendo",
    );
  });

  it("pregunta la portada una vez por opinión propia", async () => {
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

    await view.findByTestId("perfil-name");

    expect(coverFor).toHaveBeenCalledTimes(3);

    view.rerender(view.tree);

    expect(coverFor).toHaveBeenCalledTimes(3);
  });

  it("tocar una opinión abre su detalle", async () => {
    const global = globalServices();
    const view = setup({ global });

    await view.findByTestId("perfil-name");

    fireEvent.press(view.getByTestId("opinion-card-op-004"));

    expect(global.openOpinionDetail).toHaveBeenCalledWith({
      opinionId: "op-004",
    });
  });

  it("«Cerrar sesión» llama a la sesión inyectada y no borra el contenido", async () => {
    const view = setup();
    await view.findByTestId("perfil-name");

    await act(async () => {
      fireEvent.press(view.getByTestId("perfil-sign-out"));
    });

    expect(view.session.signOut).toHaveBeenCalledTimes(1);

    const listed = view.content.listOpinions({ viewerId: DEMO });
    expect(listed.ok && listed.value).toHaveLength(10);
  });

  it("sin conexión pinta el aviso y la identidad sigue", async () => {
    const view = setup();
    await view.findByTestId("perfil-name");

    act(() => {
      view.network.set(false);
    });

    expect(
      await view.findByText(
        "Sin conexión. Estás viendo lo último que cargamos.",
      ),
    ).toBeVisible();
    expect(view.getByTestId("perfil-name")).toBeVisible();
  });

  it("sin dependencias de composición se queda en carga en lugar de inventar un almacén", () => {
    const view = render(
      <ThemeProvider scheme="light">
        <PerfilScreen />
      </ThemeProvider>,
    );

    expect(view.getByTestId("perfil-loading")).toBeVisible();
  });
});

describe("usePerfil", () => {
  it("sin identidad no lee el autor y se queda cargando", () => {
    const real = createContentStore({ now: NOW });
    const getAuthor = jest.fn();
    const content: ContentStore = { ...real, getAuthor };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(null, content, log));

    expect(result.current.status).toBe("loading");
    expect(getAuthor).not.toHaveBeenCalled();
  });

  it("si el autor no se puede leer deja error y lo registra", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      getAuthor: jest.fn(() => ({
        ok: false as const,
        code: 404,
        message: "el autor no existe",
      })),
    };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(DEMO, content, log));

    expect(result.current.status).toBe("error");
    expect(result.current.author).toBeNull();
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_READ_FAILED",
      "el autor no existe",
    );
  });

  it("si el listado de opiniones falla deja error y lo registra", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      listOpinions: jest.fn(() => ({
        ok: false as const,
        code: 404,
        message: "el listado no está disponible",
      })),
    };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(DEMO, content, log));

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_READ_FAILED",
      "el listado no está disponible",
    );
  });

  it("si la suscripción al contenido falla deja error y lo registra", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      subscribeContent: jest.fn(() => ({
        ok: false as const,
        code: 422,
        message: "falta quién mira",
      })),
    };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(DEMO, content, log));

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_READ_FAILED",
      "falta quién mira",
    );
  });

  it("si el seguimiento falla el perfil conserva el contador del autor", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      listFollowing: jest.fn(() => ({
        ok: false as const,
        code: 404,
        message: "el seguimiento no está disponible",
      })),
    };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(DEMO, content, log));

    expect(result.current.status).toBe("ready");
    expect(result.current.author?.followingCount).toBe(2);
  });

  it("«Reintentar» vuelve a leer y se recupera del fallo anterior", () => {
    const real = createContentStore({ now: NOW });
    let fail = true;
    const getAuthor = jest.fn(
      (input: { authorId: string; viewerId?: string | null }) => {
        if (fail) {
          fail = false;
          return {
            ok: false as const,
            code: 404 as const,
            message: "el autor no responde todavía",
          };
        }
        return real.getAuthor(input);
      },
    );
    const content: ContentStore = { ...real, getAuthor };
    const log = silentLogger();

    const { result } = renderHook(() => usePerfil(DEMO, content, log));

    expect(result.current.status).toBe("error");

    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.author?.displayName).toBe("Usuario demo");
  });
});
