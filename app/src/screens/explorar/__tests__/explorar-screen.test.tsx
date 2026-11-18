import { act, fireEvent, render } from "@testing-library/react-native";
import {
  GlobalServicesContext,
  ShellServicesContext,
  type GlobalServices,
  type ShellServices,
  type SpotifyStatus,
} from "@melodify/app-shell";
import type { Catalog, SearchResult, WorkView } from "@melodify/catalog";
import { ThemeProvider } from "@melodify/design-system";

import { ExplorarScreen } from "../ExplorarScreen";
import { SEARCH_DEBOUNCE_MS } from "../../../state/useWorkSearch";

/**
 * Explorar contra la cáscara cableada (BR17.2, BR17.6, BR18.6, BR19.1): lo que se
 * comprueba es el cableado —la conexión, el relleno del artista, la apertura del
 * detalle con `data` y la capa de token caído— no la pintura, que ya cubre
 * `explorar-view.test.tsx`.
 */
const SAMPLE: WorkView = {
  workId: "sample-1",
  title: "Bohemian Rhapsody",
  artist: "Queen",
  coverUrl: null,
  origin: "sample",
};

const WORK: WorkView = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
  origin: "spotify",
  workKind: "track",
};

const ARTIST = { artistId: "artist-1", name: "Billie Eilish" };

function catalogDouble(searchWorks: jest.Mock): Catalog {
  return {
    listSampleWorks: () => ({ works: [SAMPLE] }),
    getWork: (workId: string) => ({
      ok: true as const,
      code: 200 as const,
      value: { ...SAMPLE, workId },
    }),
    countOpinions: (workId: string) => ({
      workId,
      count: workId === SAMPLE.workId ? 2 : 0,
    }),
    coverFor: () => ({ kind: "initialBlock" as const, value: null }),
    searchWorks,
    subscribe: (listener) => {
      listener({ works: [SAMPLE], coverFailure: false });
      return () => undefined;
    },
    getCoverFailure: () => false,
    retryCovers: () => undefined,
  };
}

function spotifyDouble(initial: SpotifyStatus) {
  let status = initial;
  const listeners = new Set<(next: SpotifyStatus) => void>();

  const service: ShellServices["spotify"] = {
    get status() {
      return status;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(status);
      return () => {
        listeners.delete(listener);
      };
    },
    connect: jest.fn(),
    disconnect: jest.fn(),
    retry: jest.fn(),
  };

  return {
    service,
    set(next: SpotifyStatus) {
      status = next;
      for (const listener of [...listeners]) {
        listener(next);
      }
    },
  };
}

function shellServices(spotify: ShellServices["spotify"]): ShellServices {
  return {
    network: {
      online: true,
      subscribe: () => () => undefined,
    },
    spotify,
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

function setup(
  options: {
    spotify?: SpotifyStatus;
    searchWorks?: jest.Mock;
  } = {},
) {
  const searchWorks =
    options.searchWorks ??
    jest.fn(
      async (): Promise<SearchResult> => ({
        status: "ok",
        works: [WORK],
        artists: [ARTIST],
      }),
    );
  const catalog = catalogDouble(searchWorks);
  const spotify = spotifyDouble(options.spotify ?? "connected");
  const global = globalServices();
  const log = { warn: jest.fn(), error: jest.fn() };

  const tree = (
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={shellServices(spotify.service)}>
        <GlobalServicesContext.Provider value={global}>
          <ExplorarScreen catalog={catalog} log={log} />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>
  );

  return {
    ...render(tree),
    tree,
    catalog,
    spotify,
    global,
    searchWorks,
  };
}

async function search(view: ReturnType<typeof setup>, text: string) {
  fireEvent.changeText(view.getByTestId("search-field-input"), text);
  await act(async () => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    await Promise.resolve();
  });
}

describe("ExplorarScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sin sesión pinta sugerencias y conecta desde la tarjeta", async () => {
    const view = setup({ spotify: "disconnected" });

    await view.findByText("Busca en todo Spotify");
    fireEvent.press(view.getByTestId("connection-card-action"));

    expect(view.spotify.service.connect).toHaveBeenCalledTimes(1);
    expect(view.queryByTestId("search-field")).toBeNull();
  });

  it("tocar un artista rellena el campo y relanza la búsqueda sin navegar", async () => {
    const view = setup();

    await view.findByTestId("search-field");
    await search(view, "bil");
    await view.findByTestId("artist-result-artist-1");

    fireEvent.press(view.getByTestId("artist-result-artist-1"));

    expect(view.getByTestId("search-field-input").props.value).toBe(
      "Billie Eilish",
    );

    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(view.searchWorks).toHaveBeenLastCalledWith("Billie Eilish");
    expect(view.global.openWorkDetail).not.toHaveBeenCalled();
  });

  it("tocar una obra abre el detalle con la vista resuelta", async () => {
    const view = setup();

    await view.findByTestId("search-field");
    await search(view, "bad");
    await view.findByTestId("work-result-work-1");

    fireEvent.press(view.getByTestId("work-result-work-1"));

    expect(view.global.openWorkDetail).toHaveBeenCalledWith({
      workId: WORK.workId,
      data: WORK,
    });
  });

  it("la capa de token caído conserva la lista y bloquea nuevas peticiones", async () => {
    const view = setup();

    await view.findByTestId("search-field");
    await search(view, "bad");
    await view.findByTestId("work-result-work-1");

    act(() => {
      view.spotify.set("invalidToken");
    });

    expect(view.getByText("Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.")).toBeVisible();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.getByTestId("search-field-input").props.value).toBe("bad");

    const calls = view.searchWorks.mock.calls.length;
    fireEvent.changeText(view.getByTestId("search-field-input"), "otra");
    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(view.searchWorks).toHaveBeenCalledTimes(calls);
    fireEvent.press(view.getByTestId("explorar-reconnect"));
    expect(view.spotify.service.connect).toHaveBeenCalledTimes(1);
  });

  it("con invalidToken escribe en el campo sin lanzar peticiones", async () => {
    const view = setup({ spotify: "invalidToken" });

    await view.findByText(
      "Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.",
    );

    fireEvent.changeText(view.getByTestId("search-field-input"), "bad");
    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
      await Promise.resolve();
    });

    expect(view.searchWorks).not.toHaveBeenCalled();
  });
});
