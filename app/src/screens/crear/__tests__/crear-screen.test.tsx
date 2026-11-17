import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";
import {
  CreateEntryContext,
  GlobalServicesContext,
  ShellServicesContext,
  type CreateEntry,
  type GlobalServices,
  type ShellServices,
  type SpotifyStatus,
} from "@melodify/app-shell";
import type { AppSession, SessionView } from "@melodify/app-session";
import type { Catalog, SearchResult, WorkView } from "@melodify/catalog";
import type {
  ContentResult,
  ContentSnapshot,
  ContentStore,
  OpinionView,
} from "@melodify/content-store";
import { ThemeProvider } from "@melodify/design-system";

import type { AppLogger } from "../../../bootstrap/logger";
import { CrearScreen } from "../CrearScreen";
import { SEARCH_DEBOUNCE_MS } from "../../../state/useWorkSearch";

/**
 * Crear y Editar contra la cáscara cableada (BR11.1–BR11.7, BR12.1–BR12.7,
 * BR13.1–BR13.5): lo que se comprueba es la integración —la identidad que llega, la
 * preselección, el orden «navegar y después avisar», el `409` que lleva a «ya
 * opinaste» y el reinicio por `formKey` sin desmontar— no la pintura, que ya cubre
 * `crear-view.test.tsx`.
 *
 * C4 y C5 son dobles porque esta unidad no posee su contrato y la prueba necesita
 * forzar respuestas (`409`, `422`, `404`) que el almacén real solo produce con datos
 * concretos; la sesión, la red y las acciones globales también, porque son C3 y C2.
 */
const DEMO = "demo";

const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: DEMO,
  remembered: true,
};

const WORK_1: WorkView = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
  origin: "sample",
};

const WORK_2: WorkView = {
  workId: "work-2",
  title: "Bohemian Rhapsody",
  artist: "Queen",
  coverUrl: null,
  origin: "sample",
};

const WORK_3: WorkView = {
  workId: "work-3",
  title: "Blinding Lights",
  artist: "The Weeknd",
  coverUrl: null,
  origin: "sample",
};

const ENTRY_CREATE: CreateEntry = {
  mode: "create",
  preselectedWorkId: null,
  editingOpinionId: null,
  returnTo: null,
  formKey: 1,
};

function opinionView(overrides: Partial<OpinionView> = {}): OpinionView {
  return {
    opinionId: "op-1",
    workId: WORK_1.workId,
    workTitle: WORK_1.title,
    workArtist: WORK_1.artist,
    author: {
      authorId: DEMO,
      displayName: "Alex de la Nasa",
      handle: "alex",
      followedByMe: false,
    },
    text: "Un temazo de principio a fin.",
    rating: 4,
    createdAt: "2026-11-10T09:00:00.000Z",
    updatedAt: "2026-11-10T09:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: true,
    ...overrides,
  };
}

function ok<T, C extends 200 | 201 = 200>(
  value: T,
  code?: C,
): ContentResult<T, C> {
  return { ok: true, code: (code ?? 200) as C, value };
}

interface ContentDouble {
  store: ContentStore;
  subscribeContent: jest.Mock;
  listOpinions: jest.Mock;
  getOpinion: jest.Mock;
  createOpinion: jest.Mock;
  updateOpinion: jest.Mock;
}

function contentDouble(
  overrides: {
    getOpinion?: jest.Mock;
    listOpinions?: jest.Mock;
    createOpinion?: jest.Mock;
    updateOpinion?: jest.Mock;
  } = {},
): ContentDouble {
  const subscribeContent = jest.fn(
    (_viewerId: string | null | undefined, listener: (snapshot: ContentSnapshot) => void) => {
      listener({ revision: 0, opinions: [] });
      return ok<() => void>(() => undefined);
    },
  );
  const listOpinions = overrides.listOpinions ?? jest.fn(() => ok([]));
  const getOpinion =
    overrides.getOpinion ?? jest.fn(() => ok(opinionView()));
  const createOpinion =
    overrides.createOpinion ?? jest.fn(() => ok(opinionView(), 201));
  const updateOpinion =
    overrides.updateOpinion ?? jest.fn(() => ok(opinionView()));

  return {
    store: {
      subscribeContent,
      listOpinions,
      getOpinion,
      createOpinion,
      updateOpinion,
    } as unknown as ContentStore,
    subscribeContent,
    listOpinions,
    getOpinion,
    createOpinion,
    updateOpinion,
  };
}

interface CatalogDouble {
  store: Catalog;
  listSampleWorks: jest.Mock;
  countOpinions: jest.Mock;
  getWork: jest.Mock;
  searchWorks: jest.Mock;
}

function catalogDouble(
  searchWorks: jest.Mock = jest.fn(
    async (): Promise<SearchResult> => ({
      status: "ok",
      works: [{ ...WORK_3, workId: "work-9", title: "Obra buscada" }],
    }),
  ),
): CatalogDouble {
  const works = [WORK_1, WORK_2, WORK_3];
  const listSampleWorks = jest.fn(() => ({ works }));
  const countOpinions = jest.fn((workId: string) => ({
    workId,
    count: workId === WORK_2.workId ? 0 : 2,
  }));
  const getWork = jest.fn((workId: string) => {
    const found = works.find((work) => work.workId === workId) ?? WORK_1;
    return ok(found);
  });

  return {
    store: {
      listSampleWorks,
      countOpinions,
      getWork,
      searchWorks,
    } as unknown as Catalog,
    listSampleWorks,
    countOpinions,
    getWork,
    searchWorks,
  };
}

function signedInSession(): AppSession {
  return {
    getSession: jest.fn(async () => ({ code: 200 as const, session: SIGNED_IN })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    subscribeSession: jest.fn(() => () => undefined),
  } as unknown as AppSession;
}

function silentLogger(): AppLogger & { warn: jest.Mock; error: jest.Mock } {
  return { warn: jest.fn(), error: jest.fn() };
}

function shellServices(options: {
  spotify?: SpotifyStatus;
  online?: boolean;
}): ShellServices {
  return {
    network: {
      online: options.online ?? true,
      subscribe: () => () => undefined,
    },
    spotify: {
      status: options.spotify ?? "disconnected",
      subscribe: () => () => undefined,
      connect: () => undefined,
      disconnect: () => undefined,
      retry: () => undefined,
    },
    comments: {
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: () => () => undefined,
      open: () => undefined,
      close: () => undefined,
      retry: () => undefined,
      submit: () => false,
    },
  };
}

function globalServices(): GlobalServices {
  return {
    showSnackbar: jest.fn(),
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
  };
}

interface HarnessOptions {
  entry?: CreateEntry;
  content?: ContentDouble;
  catalog?: CatalogDouble;
  spotify?: SpotifyStatus;
  online?: boolean;
}

function setup(options: HarnessOptions = {}) {
  const content = options.content ?? contentDouble();
  const catalog = options.catalog ?? catalogDouble();
  const session = signedInSession();
  const log = silentLogger();
  const services = shellServices(options);
  const global = globalServices();
  const entry = options.entry ?? ENTRY_CREATE;

  const tree = (nextEntry: CreateEntry) => (
    <ThemeProvider scheme="light">
      <CreateEntryContext.Provider value={nextEntry}>
        <ShellServicesContext.Provider value={services}>
          <GlobalServicesContext.Provider value={global}>
            <CrearScreen
              session={session}
              content={content.store}
              catalog={catalog.store}
              log={log}
            />
          </GlobalServicesContext.Provider>
        </ShellServicesContext.Provider>
      </CreateEntryContext.Provider>
    </ThemeProvider>
  );

  const result = render(tree(entry));

  return {
    ...result,
    entry,
    tree,
    content,
    catalog,
    session,
    log,
    global,
    services,
  };
}

/** Deja resolver la sesión y el efecto que deriva el formulario con la identidad. */
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("CrearScreen — composición y carga", () => {
  it("sin colaboradores se queda en carga en lugar de inventar instancias", () => {
    render(
      <ThemeProvider scheme="light">
        <CrearScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText("Crear")).toBeVisible();
    expect(screen.getByTestId("crear-loading")).toBeVisible();
  });

  it("con identidad y catálogo pinta el selector de ejemplo y las ocho filas con su recuento", async () => {
    const view = setup();

    await view.findByText(
      "Conecta Spotify para buscar en el catálogo completo.",
    );

    expect(view.getAllByTestId(/^work-result-work-/)).toHaveLength(3);
    expect(view.getAllByTestId("work-result-opinions")[0]).toHaveTextContent(
      "2 opiniones",
    );
    expect(view.getAllByTestId("work-result-opinions")[1]).toHaveTextContent(
      "Sé el primero en opinar",
    );
    expect(view.catalog.countOpinions).toHaveBeenCalledTimes(3);
    expect(view.getByTestId("crear-submit")).toBeDisabled();
  });

  it("sin conexión avisa con el texto de Crear y el formulario sigue utilizable", async () => {
    const view = setup({ online: false });

    await view.findByTestId("work-result-work-1");

    expect(
      view.getByText("Sin conexión. Puedes opinar sobre las obras de ejemplo."),
    ).toBeVisible();
  });
});

describe("CrearScreen — publicar", () => {
  it("elegir obra, escribir y valorar habilita publicar; al publicar navega a Inicio y avisa después", async () => {
    const view = setup();

    await view.findByTestId("work-result-work-1");

    fireEvent.press(view.getByTestId("work-result-work-1"));
    fireEvent.changeText(view.getByTestId("crear-text"), "  Un temazo.  ");
    fireEvent.press(view.getByTestId("rating-input-star-4"));

    expect(view.getByTestId("crear-submit")).toBeEnabled();

    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.content.createOpinion).toHaveBeenCalledWith({
      authorId: DEMO,
      workId: WORK_1.workId,
      workTitle: WORK_1.title,
      workArtist: WORK_1.artist,
      text: "Un temazo.",
      rating: 4,
    });
    expect(view.global.goToTab).toHaveBeenCalledWith({ name: "inicio" });
    expect(view.global.showSnackbar).toHaveBeenCalledWith({
      message: "Opinión publicada",
    });
    expect(
      (view.global.goToTab as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan(
      (view.global.showSnackbar as jest.Mock).mock.invocationCallOrder[0]!,
    );
  });

  it("la obra preseleccionada se resuelve con C5 y, si ya hay opinión, ofrece editarla", async () => {
    const own = opinionView();
    const content = contentDouble({
      listOpinions: jest.fn(() => ok([own])),
    });

    const view = setup({
      entry: { ...ENTRY_CREATE, preselectedWorkId: WORK_1.workId },
      content,
    });

    await view.findByText("Ya opinaste sobre esta obra.");

    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.queryByTestId("crear-submit")).toBeNull();

    fireEvent.press(view.getByTestId("crear-edit-existing"));

    expect(view.global.openEdit).toHaveBeenCalledWith({ opinionId: "op-1" });
  });

  it("un 409 pasa a «ya opinaste» y «Editar mi opinión» abre la opinión propia", async () => {
    const own = opinionView();
    const content = contentDouble({
      listOpinions: jest
        .fn()
        .mockReturnValueOnce(ok([]))
        .mockReturnValue(ok([own])),
      createOpinion: jest.fn(() => ({
        ok: false as const,
        code: 409 as const,
        message: "Ya hay una opinión tuya.",
      })),
    });

    const view = setup({ content });

    await view.findByTestId("work-result-work-1");
    fireEvent.press(view.getByTestId("work-result-work-1"));
    fireEvent.changeText(view.getByTestId("crear-text"), "Un temazo.");
    fireEvent.press(view.getByTestId("rating-input-star-4"));
    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.getByText("Ya opinaste sobre esta obra.")).toBeVisible();
    expect(view.global.goToTab).not.toHaveBeenCalled();

    fireEvent.press(view.getByTestId("crear-edit-existing"));
    expect(view.global.openEdit).toHaveBeenCalledWith({ opinionId: "op-1" });
  });

  it("un 422 conserva el borrador y «Reintentar» repite la publicación", async () => {
    const createOpinion = jest.fn(() => ({
      ok: false as const,
      code: 422 as const,
      message: "No se puede validar.",
    }));

    const view = setup({ content: contentDouble({ createOpinion }) });

    await view.findByTestId("work-result-work-1");
    fireEvent.press(view.getByTestId("work-result-work-1"));
    fireEvent.changeText(view.getByTestId("crear-text"), "Un temazo.");
    fireEvent.press(view.getByTestId("rating-input-star-4"));
    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.getByText("No pudimos publicar tu opinión.")).toBeVisible();
    expect(view.getByTestId("crear-text").props.value).toBe("Un temazo.");
    expect(view.global.goToTab).not.toHaveBeenCalled();

    fireEvent.press(view.getByTestId("error-state-retry"));

    expect(createOpinion).toHaveBeenCalledTimes(2);
  });
});

describe("CrearScreen — editar", () => {
  const EDIT_ENTRY: CreateEntry = {
    mode: "edit",
    preselectedWorkId: null,
    editingOpinionId: "op-1",
    returnTo: null,
    formKey: 3,
  };

  it("carga la opinión propia, guarda y cierra antes de avisar", async () => {
    const view = setup({ entry: EDIT_ENTRY });

    await view.findByDisplayValue("Un temazo de principio a fin.");
    expect(view.getByText("Editar opinión")).toBeVisible();
    expect(view.queryByTestId("search-field")).toBeNull();

    fireEvent.changeText(
      view.getByTestId("crear-text"),
      "La escucho cada mañana.",
    );
    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.content.updateOpinion).toHaveBeenCalledWith({
      opinionId: "op-1",
      authorId: DEMO,
      viewerId: DEMO,
      text: "La escucho cada mañana.",
      rating: 4,
    });
    expect(view.global.closeCreate).toHaveBeenCalledTimes(1);
    expect(view.global.showSnackbar).toHaveBeenCalledWith({
      message: "Opinión actualizada",
    });
    expect(
      (view.global.closeCreate as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan(
      (view.global.showSnackbar as jest.Mock).mock.invocationCallOrder[0]!,
    );
  });

  it("guardar sin cambios cierra sin escribir ni confirmar", async () => {
    const view = setup({ entry: EDIT_ENTRY });

    await view.findByDisplayValue("Un temazo de principio a fin.");
    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.content.updateOpinion).not.toHaveBeenCalled();
    expect(view.global.closeCreate).toHaveBeenCalledTimes(1);
    expect(view.global.showSnackbar).not.toHaveBeenCalled();
  });

  it("si la opinión no se puede leer pinta el error de carga y «Reintentar» vuelve a leer", async () => {
    const getOpinion = jest.fn(() => ({
      ok: false as const,
      code: 404 as const,
      message: "No existe.",
    }));

    const view = setup({
      entry: EDIT_ENTRY,
      content: contentDouble({ getOpinion }),
    });

    await view.findByText("No pudimos cargar tu opinión.");
    expect(view.queryByTestId("crear-submit")).toBeNull();

    fireEvent.press(view.getByTestId("error-state-retry"));

    expect(getOpinion).toHaveBeenCalledTimes(2);
  });

  it("un fallo al guardar pinta «No pudimos guardar los cambios.» y reintenta", async () => {
    const updateOpinion = jest.fn(() => ({
      ok: false as const,
      code: 422 as const,
      message: "No se puede validar.",
    }));

    const view = setup({
      entry: EDIT_ENTRY,
      content: contentDouble({ updateOpinion }),
    });

    await view.findByDisplayValue("Un temazo de principio a fin.");
    fireEvent.changeText(view.getByTestId("crear-text"), "Otro texto.");
    fireEvent.press(view.getByTestId("crear-submit"));

    expect(view.getByText("No pudimos guardar los cambios.")).toBeVisible();
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(updateOpinion).toHaveBeenCalledTimes(2);
  });
});

describe("CrearScreen — buscador y visitas", () => {
  it("con Spotify, dos caracteres y 400 ms consultan a C5 y elegir una obra pliega el buscador", async () => {
    jest.useFakeTimers();

    try {
      const view = setup({ spotify: "connected" });
      await settle();

      expect(view.getByTestId("search-field")).toBeVisible();

      fireEvent.changeText(view.getByTestId("search-field-input"), "bad");

      await act(async () => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(view.catalog.searchWorks).toHaveBeenCalledWith("bad");

      fireEvent.press(view.getByTestId("work-result-work-9"));

      expect(view.queryByTestId("search-field")).toBeNull();
      expect(view.getByTestId("work-result-work-9")).toBeVisible();
      expect(view.getByTestId("crear-change-work")).toBeVisible();
    } finally {
      jest.useRealTimers();
    }
  });

  it("cambiar formKey reinicia el borrador y el buscador sin desmontar la pantalla", async () => {
    const view = setup();

    await view.findByTestId("work-result-work-1");
    fireEvent.press(view.getByTestId("work-result-work-1"));
    fireEvent.changeText(view.getByTestId("crear-text"), "Un temazo.");
    fireEvent.press(view.getByTestId("rating-input-star-4"));

    expect(view.getByTestId("crear-submit")).toBeEnabled();

    view.rerender(view.tree({ ...ENTRY_CREATE, formKey: 2 }));

    expect(view.getByTestId("crear-view")).toBeVisible();
    expect(view.getByTestId("crear-text").props.value).toBe("");
    expect(view.getByTestId("crear-submit")).toBeDisabled();
    // La visita nueva vuelve al selector: la obra anterior no se arrastra.
    expect(view.getByTestId("work-result-work-2")).toBeVisible();
    expect(view.getByTestId("rating-input-value")).toHaveTextContent(
      "Sin valorar",
    );
  });
});
