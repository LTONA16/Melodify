import { ThemeProvider } from "@melodify/design-system";
import type { OpinionCardModel } from "@melodify/design-system";
import { createCatalog, type Catalog } from "@melodify/catalog";
import {
  createContentStore,
  type ContentStore,
  type OpinionView,
} from "@melodify/content-store";
import type { Connectivity, NetworkView } from "@melodify/connectivity";
import type { AppSession, SessionView } from "@melodify/app-session";
import {
  GlobalServicesContext,
  ShellServicesContext,
  type GlobalServices,
  type ShellServices,
} from "@melodify/app-shell";
import {
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";

import type { AppLogger } from "../../../bootstrap/logger";
import { DetalleOpinionScreen } from "../DetalleOpinionScreen";
import { DetalleOpinionView } from "../DetalleOpinionView";
import type { DetalleOpinionViewProps } from "../DetalleOpinionView";
import { useDetalleOpinion } from "../useDetalleOpinion";

/**
 * El detalle de opinión (F8, AC2.3.3, AC9.1.4, BR5.2, NFR9.4), en sus tres piezas:
 * la vista pura, el hook con un `getOpinion` que se puede forzar a `404` o a lanzar,
 * y el contenedor que fija la cabecera.
 *
 * El `404` **no** se registra: no hay nada roto, el identificador no existe. El
 * almacén que lanza sí, con `CONTENT_READ_FAILED`; esa es la diferencia que esta
 * prueba defiende. El contenido y el catálogo son los reales —una prueba de
 * integración con almacenes de mentira no probaría la lectura— y la sesión, la red y
 * las acciones globales son dobles porque son las fronteras que esta unidad no posee.
 */
const NOW = "2026-11-12T09:00:00.000Z";
const DEMO = "demo";
const BOHEMIAN = "4u7EnebtmKWzUH433Rbtpz";

const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: DEMO,
  remembered: true,
};

function silentLogger(): AppLogger & { error: jest.Mock } {
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
  };
}

function shellServices(network: ReturnType<typeof networkDouble>): ShellServices {
  return {
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

function card(overrides: Partial<OpinionCardModel> = {}): OpinionCardModel {
  return {
    opinionId: "op-001",
    authorId: "demo",
    authorName: "Usuario demo",
    authorHandle: "demo",
    followedByMe: false,
    workId: BOHEMIAN,
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    coverUrl: null,
    text: "Seis minutos que no se sienten como seis minutos.",
    rating: 5,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

function baseProps(
  overrides: Partial<DetalleOpinionViewProps> = {},
): DetalleOpinionViewProps {
  return {
    status: "ready",
    card: card(),
    isOwn: true,
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    coverUrl: null,
    average: 5,
    opinionCount: 2,
    online: true,
    onRetry: jest.fn(),
    onRetryCovers: jest.fn(),
    ...overrides,
  };
}

function renderView(overrides: Partial<DetalleOpinionViewProps> = {}) {
  return render(
    <ThemeProvider scheme="light">
      <DetalleOpinionView {...baseProps(overrides)} />
    </ThemeProvider>,
  );
}

/** Una opinión de C4 con la forma que devuelve `getOpinion`. */
function opinionView(
  store: ContentStore,
  overrides: Partial<OpinionView> = {},
): OpinionView {
  const base = store.getOpinion({ opinionId: "op-001", viewerId: DEMO });
  if (!base.ok) {
    throw new Error("la siembra de prueba debería tener op-001");
  }
  return { ...base.value, ...overrides };
}

interface HookOptions {
  opinionId?: string;
  viewerId?: string | null;
  content?: ContentStore;
  catalog?: Catalog;
  online?: boolean;
  log?: AppLogger;
}

function setupHook(options: HookOptions = {}) {
  const network = networkDouble(options.online ?? true);
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
  const log = options.log ?? silentLogger();
  const opinionId = options.opinionId ?? "op-001";
  const viewerId = options.viewerId === undefined ? DEMO : options.viewerId;

  const result = renderHook(() =>
    useDetalleOpinion(
      opinionId,
      viewerId,
      content,
      catalog,
      network.connectivity.getNetworkState().online,
      log,
    ),
  );

  return { ...result, content, catalog, log };
}

interface ScreenOptions extends HookOptions {
  global?: GlobalServices;
  network?: ReturnType<typeof networkDouble>;
}

function setupScreen(options: ScreenOptions = {}) {
  const network = options.network ?? networkDouble(options.online ?? true);
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
  const log = options.log ?? silentLogger();
  const global = options.global ?? globalServices();
  const session = signedInSession();
  const opinionId = options.opinionId ?? "op-001";

  const tree = (
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={shellServices(network)}>
        <GlobalServicesContext.Provider value={global}>
          <DetalleOpinionScreen
            opinion={{ opinionId }}
            session={session}
            content={content}
            catalog={catalog}
            log={log}
          />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>
  );

  return { ...render(tree), tree, content, catalog, global, log, session };
}

describe("DetalleOpinionView", () => {
  it("pinta el texto completo sin recortar", () => {
    const text =
      "Seis minutos que no se sienten como seis minutos. Cada vez que la pongo encuentro una capa nueva: el piano, las voces, ese silencio antes del final.";
    renderView({ card: card({ text }) });

    const rendered = screen.getByTestId("opinion-text");
    expect(rendered).toHaveTextContent(text);
    expect(rendered.props.numberOfLines).toBeUndefined();
  });

  it("una opinión ajena no pinta «Editar» ni la etiqueta propia", () => {
    renderView({ isOwn: false, card: card({ authorId: "lucia" }) });

    expect(screen.queryByText("Tu opinión")).toBeNull();
    expect(screen.queryByTestId("opinion-edit")).toBeNull();
  });

  it("una opinión propia pinta «Tu opinión», «Editar» y las fechas", () => {
    renderView({
      isOwn: true,
      card: card({
        createdAt: "2026-11-01T10:00:00.000Z",
        updatedAt: "2026-11-03T10:00:00.000Z",
      }),
    });

    expect(screen.getByText("Tu opinión")).toBeVisible();
    expect(screen.getByTestId("opinion-edit")).toBeVisible();
    expect(screen.getByTestId("opinion-own-dates")).toHaveTextContent(
      "Creada el 1 nov 2026 · Editada el 3 nov 2026",
    );
  });

  it("con la obra fuera del catálogo usa el título de la opinión y el bloque con la inicial", () => {
    renderView({
      card: card({ coverUrl: null, workTitle: "Obra fuera del catálogo" }),
      workTitle: "Obra fuera del catálogo",
      workArtist: "Artista desconocido",
    });

    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "Obra fuera del catálogo",
    );
    expect(screen.getByTestId("work-header-artist")).toHaveTextContent(
      "Artista desconocido",
    );
    expect(screen.getAllByTestId("cover-initial")).toHaveLength(2);
  });

  it("en carga pinta esqueletos y en error el texto exacto con «Reintentar»", () => {
    const onRetry = jest.fn();
    const view = renderView({ status: "loading" });

    expect(screen.getByTestId("detalle-opinion-loading")).toBeVisible();
    expect(screen.queryByTestId("opinion-text")).toBeNull();

    view.rerender(
      <ThemeProvider scheme="light">
        <DetalleOpinionView {...baseProps({ status: "error", onRetry })} />
      </ThemeProvider>,
    );

    expect(screen.getByText("No pudimos cargar esta opinión.")).toBeVisible();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("sin conexión pinta el aviso encima de la opinión", () => {
    renderView({ online: false });

    expect(
      screen.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
    expect(screen.getByTestId("opinion-card-op-001")).toBeVisible();
  });
});

describe("useDetalleOpinion", () => {
  it("un 404 deja el error de pantalla y no registra CONTENT_READ_FAILED", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      getOpinion: jest.fn(() => ({
        ok: false as const,
        code: 404,
        message: "la opinión no existe",
      })),
    };
    const log = silentLogger();

    const { result } = setupHook({
      opinionId: "op-inexistente",
      content,
      log,
    });

    expect(result.current.status).toBe("error");
    expect(result.current.opinion).toBeNull();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("un almacén que lanza deja error y registra CONTENT_READ_FAILED", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      getOpinion: jest.fn(() => {
        throw new Error("el almacén no responde");
      }),
    };
    const log = silentLogger();

    const { result } = setupHook({ content, log });

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_READ_FAILED",
      expect.any(String),
    );
  });

  it("con la obra fuera del catálogo degrada al título y artista de la opinión", () => {
    const real = createContentStore({ now: NOW });
    const content: ContentStore = {
      ...real,
      getOpinion: jest.fn(() => ({
        ok: true as const,
        code: 200,
        value: opinionView(real, {
          workId: "obra-que-no-existe",
          workTitle: "Obra fuera del catálogo",
          workArtist: "Artista desconocido",
        }),
      })),
    };

    const { result } = setupHook({ content });

    expect(result.current.status).toBe("ready");
    expect(result.current.workTitle).toBe("Obra fuera del catálogo");
    expect(result.current.workArtist).toBe("Artista desconocido");
    expect(result.current.cover).toEqual({ kind: "initialBlock", value: null });
  });

  it("con la obra en el catálogo toma título, artista y portada de C5", () => {
    const { result } = setupHook();

    expect(result.current.status).toBe("ready");
    expect(result.current.workTitle).toBe("Bohemian Rhapsody");
    expect(result.current.workArtist).toBe("Queen");
    expect(result.current.opinion?.isOwn).toBe(true);
    expect(result.current.average).toBe(5);
    expect(result.current.opinionCount).toBe(2);
  });

  it("sin identidad no lee la opinión y se queda cargando", () => {
    const real = createContentStore({ now: NOW });
    const getOpinion = jest.fn();
    const content: ContentStore = { ...real, getOpinion };

    const { result } = setupHook({ content, viewerId: null });

    expect(result.current.status).toBe("loading");
    expect(getOpinion).not.toHaveBeenCalled();
  });
});

describe("DetalleOpinionScreen", () => {
  it("fija la cabecera «Detalle de opinión» y pinta la obra con su opinión", async () => {
    const view = setupScreen();

    await view.findByTestId("opinion-card-op-001");

    expect(view.global.setHeader).toHaveBeenCalledWith({
      title: "Detalle de opinión",
    });
    expect(view.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(view.getByText("Tu opinión")).toBeVisible();
  });

  it("sin dependencias de composición se queda en carga en lugar de inventar un almacén", () => {
    render(
      <ThemeProvider scheme="light">
        <DetalleOpinionScreen opinion={{ opinionId: "op-001" }} />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("detalle-opinion-loading")).toBeVisible();
  });
});
