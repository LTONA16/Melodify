import type { ArtistSummary } from "@melodify/design-system";
import { ThemeProvider } from "@melodify/design-system";
import type { WorkView } from "@melodify/catalog";
import { fireEvent, render } from "@testing-library/react-native";

import {
  EXPLORAR_CONNECT_BODY,
  EXPLORAR_NOT_CONFIGURED_BODY,
  EXPLORAR_OFFLINE_MESSAGE,
  EXPLORAR_TOKEN_MESSAGE,
  ExplorarView,
  type ExplorarViewProps,
} from "../ExplorarView";

/**
 * La vista pura de Explorar (BR17.7, BR18.6, BR19.1–BR19.3): cada estado se
 * recorre sin catálogo, sin sesión y sin red, porque todo llega por props.
 */
const WORK: WorkView = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
  origin: "spotify",
  workKind: "track",
};

const ALBUM: WorkView = {
  workId: "album-1",
  title: "Future Nostalgia",
  artist: "Dua Lipa",
  coverUrl: null,
  origin: "spotify",
  workKind: "album",
};

const ARTIST: ArtistSummary = {
  artistId: "artist-1",
  name: "Billie Eilish",
};

function sugerencias(): ExplorarViewProps["sugerencias"] {
  return [
    { work: { ...WORK, origin: "sample" }, opinionCount: 2 },
    { work: { ...ALBUM, origin: "sample" }, opinionCount: 0 },
  ];
}

function props(overrides: Partial<ExplorarViewProps> = {}): ExplorarViewProps {
  return {
    spotifyStatus: "disconnected",
    connecting: false,
    sinSesion: true,
    tokenCaido: false,
    online: true,
    onConnect: jest.fn(),
    onRetryConnection: jest.fn(),
    onVolverAConectar: jest.fn(),
    query: "",
    searchStatus: "idle",
    results: [],
    artists: [],
    onChangeQuery: jest.fn(),
    onClearQuery: jest.fn(),
    onSearchRetry: jest.fn(),
    onOpenWork: jest.fn(),
    onOpenArtist: jest.fn(),
    opinionCountFor: (workId) => (workId === WORK.workId ? 2 : 0),
    sugerencias: sugerencias(),
    ...overrides,
  };
}

function setup(overrides: Partial<ExplorarViewProps> = {}) {
  return render(
    <ThemeProvider scheme="light">
      <ExplorarView {...props(overrides)} />
    </ThemeProvider>,
  );
}

describe("ExplorarView — sin sesión", () => {
  it("pinta la tarjeta completa y las sugerencias, sin buscador", () => {
    const view = setup();

    expect(view.getByText("Busca en todo Spotify")).toBeVisible();
    expect(view.getByText(EXPLORAR_CONNECT_BODY)).toBeVisible();
    expect(view.getByText("Conectar con Spotify")).toBeVisible();
    expect(view.getByText("Sugerencias para empezar")).toBeVisible();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.getAllByTestId("work-result-opinions")[0]).toHaveTextContent(
      "2 opiniones",
    );
    expect(view.queryByTestId("search-field")).toBeNull();
  });

  it("conecta desde la tarjeta y abre una sugerencia con sus datos", () => {
    const onConnect = jest.fn();
    const onOpenWork = jest.fn();
    const view = setup({ onConnect, onOpenWork });

    fireEvent.press(view.getByTestId("connection-card-action"));
    fireEvent.press(view.getByTestId("work-result-work-1"));

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onOpenWork).toHaveBeenCalledWith(
      expect.objectContaining({ workId: WORK.workId, origin: "sample" }),
    );
  });

  it("en connecting pinta la tarjeta compacta con el botón deshabilitado", () => {
    const view = setup({
      spotifyStatus: "connecting",
      connecting: true,
      sinSesion: false,
    });

    expect(view.getByTestId("explorar-connecting")).toBeVisible();
    expect(view.getByTestId("explorar-connecting-action")).toBeDisabled();
    expect(view.getByText("Sugerencias para empezar")).toBeVisible();
    expect(view.queryByTestId("search-field")).toBeNull();
  });

  it("connectionError y notConfigured muestran su mensaje; solo el error reintenta", () => {
    const onRetryConnection = jest.fn();
    const error = setup({ spotifyStatus: "connectionError", onRetryConnection });

    expect(error.getByText("No pudimos conectar con Spotify.")).toBeVisible();
    fireEvent.press(error.getByTestId("connection-card-action"));
    expect(onRetryConnection).toHaveBeenCalledTimes(1);
    error.unmount();

    const notConfigured = setup({ spotifyStatus: "notConfigured" });

    expect(
      notConfigured.getByText(
        "La conexión con Spotify no está configurada en esta instalación.",
      ),
    ).toBeVisible();
    expect(notConfigured.getByText(EXPLORAR_NOT_CONFIGURED_BODY)).toBeVisible();
    // Sin client ID no hay nada que reintentar: un botón aquí no cambiaría nada.
    expect(notConfigured.queryByTestId("connection-card-action")).toBeNull();
  });
});

describe("ExplorarView — con sesión", () => {
  const connected: Partial<ExplorarViewProps> = {
    spotifyStatus: "connected",
    connecting: false,
    sinSesion: false,
  };

  it("en inicial pinta título, explicación y sugerencias", () => {
    const view = setup(connected);

    expect(view.getByTestId("search-field")).toBeVisible();
    expect(view.getByText("Encuentra tu próxima opinión")).toBeVisible();
    expect(
      view.getByText(
        "Busca en el catálogo completo de Spotify o empieza por una de estas.",
      ),
    ).toBeVisible();
    expect(view.getByText("Sugerencias para empezar")).toBeVisible();
  });

  it("con menos de dos caracteres pinta la ayuda exacta", () => {
    const view = setup({ ...connected, query: "b", searchStatus: "short" });

    expect(view.getByText("Escribe al menos 2 caracteres.")).toBeVisible();
    expect(view.queryByText("Sugerencias para empezar")).toBeNull();
  });

  it("mientras busca pinta cinco esqueletos de fila", () => {
    const view = setup({
      ...connected,
      query: "bad",
      searchStatus: "searching",
    });

    expect(view.getAllByTestId(/^skeleton-row-/)).toHaveLength(5);
    expect(view.getByTestId("search-field-loading")).toBeVisible();
  });

  it("con resultados pinta obras primero, después artistas y sus acciones", () => {
    const onOpenWork = jest.fn();
    const onOpenArtist = jest.fn();
    const view = setup({
      ...connected,
      query: "billie",
      searchStatus: "results",
      results: [WORK, ALBUM],
      artists: [ARTIST],
      onOpenWork,
      onOpenArtist,
      opinionCountFor: (workId) => (workId === WORK.workId ? 2 : 0),
    });

    expect(view.getByText("Obras")).toBeVisible();
    expect(view.getByText("Artistas")).toBeVisible();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.getAllByTestId("work-result-kind")[0]).toHaveTextContent(
      "Canción",
    );
    expect(view.getByTestId("work-result-album-1")).toBeVisible();
    expect(view.getByTestId("artist-result-artist-1")).toBeVisible();

    fireEvent.press(view.getByTestId("work-result-work-1"));
    expect(onOpenWork).toHaveBeenCalledWith(WORK);

    fireEvent.press(view.getByTestId("artist-result-artist-1"));
    expect(onOpenArtist).toHaveBeenCalledWith(ARTIST);
  });

  it("sin resultados pinta el texto buscado y la ayuda", () => {
    const view = setup({
      ...connected,
      query: "zzz",
      searchStatus: "empty",
    });

    expect(view.getByText("Sin resultados para «zzz»")).toBeVisible();
    expect(
      view.getByText("Prueba con otra grafía o con el nombre del artista."),
    ).toBeVisible();
  });

  it("un fallo de búsqueda se anuncia y «Reintentar» lo repite", () => {
    const onSearchRetry = jest.fn();
    const view = setup({
      ...connected,
      query: "bad",
      searchStatus: "error",
      onSearchRetry,
    });

    expect(view.getByText("No pudimos buscar en Spotify.")).toBeVisible();
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(onSearchRetry).toHaveBeenCalledTimes(1);
  });

  it("sin red pinta el banner y el bloque de error con su reintento", () => {
    const onSearchRetry = jest.fn();
    const view = setup({
      ...connected,
      online: false,
      query: "bad",
      searchStatus: "offline",
      onSearchRetry,
    });

    expect(view.getAllByText(EXPLORAR_OFFLINE_MESSAGE)).toHaveLength(2);
    fireEvent.press(view.getByTestId("banner-action"));
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(onSearchRetry).toHaveBeenCalledTimes(2);
  });
});

describe("ExplorarView — token caído", () => {
  it("conserva consulta y lista, y ofrece volver a conectar", () => {
    const onVolverAConectar = jest.fn();
    const view = setup({
      spotifyStatus: "invalidToken",
      connecting: false,
      sinSesion: true,
      tokenCaido: true,
      query: "bad",
      searchStatus: "results",
      results: [WORK],
      artists: [ARTIST],
      onVolverAConectar,
    });

    expect(view.getByText(EXPLORAR_TOKEN_MESSAGE)).toBeVisible();
    expect(view.getByTestId("search-field-input").props.value).toBe("bad");
    expect(view.getByTestId("search-field-input").props.placeholder).toBe(
      "Busca canciones, álbumes o artistas…",
    );
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.getByTestId("artist-result-artist-1")).toBeVisible();
    expect(view.queryByText("Sugerencias para empezar")).toBeNull();
    expect(view.queryByTestId("error-state")).toBeNull();

    fireEvent.press(view.getByTestId("explorar-reconnect"));
    expect(onVolverAConectar).toHaveBeenCalledTimes(1);
  });

  it("si el 401 llegó en la primera búsqueda no pinta esqueletos ni error", () => {
    const view = setup({
      spotifyStatus: "invalidToken",
      connecting: false,
      sinSesion: true,
      tokenCaido: true,
      query: "bad",
      searchStatus: "searching",
      results: [],
    });

    expect(view.getByText(EXPLORAR_TOKEN_MESSAGE)).toBeVisible();
    expect(view.queryByTestId("explorar-search-loading")).toBeNull();
    expect(view.queryByTestId("error-state")).toBeNull();
    expect(view.queryByText("Sugerencias para empezar")).toBeNull();
  });
});
