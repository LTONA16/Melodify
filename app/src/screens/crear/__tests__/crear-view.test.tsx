import { fireEvent, render } from "@testing-library/react-native";
import type { WorkSummary } from "@melodify/design-system";
import { ThemeProvider } from "@melodify/design-system";

import {
  CrearView,
  CREAR_CONNECT_BODY,
  CREAR_NOT_CONFIGURED_BODY,
  CREAR_OFFLINE_MESSAGE,
  CREAR_SEARCH_OFFLINE_MESSAGE,
  type CrearViewProps,
} from "../CrearView";

/**
 * La vista pura de Crear y Editar (BR11.1–BR11.11, BR12.1–BR12.7, BR13.1–BR13.5):
 * cada estado se recorre sin almacén, sin catálogo y sin red, porque todo llega por
 * props. Lo que se afirma es lo que la persona ve —los textos exactos, las ramas del
 * selector y a quién llama cada acción—, no cómo está montado el árbol.
 */
const WORK: WorkSummary = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
};

const OTHER: WorkSummary = {
  workId: "work-2",
  title: "Bohemian Rhapsody",
  artist: "Queen",
  coverUrl: null,
};

function sampleWorks(): CrearViewProps["sampleWorks"] {
  return [
    { work: WORK, opinionCount: 2 },
    { work: OTHER, opinionCount: 0 },
  ];
}

function props(overrides: Partial<CrearViewProps> = {}): CrearViewProps {
  return {
    mode: "create",
    screenStatus: "ready",
    online: true,
    spotifyStatus: "disconnected",
    onConnectSpotify: jest.fn(),
    onRetrySpotify: jest.fn(),
    work: null,
    text: "",
    rating: 0,
    canSubmit: false,
    alreadyOpined: false,
    submitError: null,
    searchVisible: false,
    query: "",
    searchStatus: "idle",
    results: [],
    onChangeQuery: jest.fn(),
    onClearQuery: jest.fn(),
    onToggleSearch: jest.fn(),
    onChooseWork: jest.fn(),
    onSearchRetry: jest.fn(),
    sampleWorks: sampleWorks(),
    onPublish: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onEditExisting: jest.fn(),
    onClearRating: jest.fn(),
    onRate: jest.fn(),
    onChangeText: jest.fn(),
    onRetryLoad: jest.fn(),
    ...overrides,
  };
}

function setup(overrides: Partial<CrearViewProps> = {}) {
  const view = render(
    <ThemeProvider scheme="light">
      <CrearView {...props(overrides)} />
    </ThemeProvider>,
  );

  return view;
}

describe("CrearView — cabecera y estados de pantalla", () => {
  it("en carga pinta la cabecera de Crear y esqueletos, sin formulario", () => {
    const view = setup({ screenStatus: "loading" });

    expect(view.getByText("Crear")).toBeVisible();
    expect(view.getByTestId("crear-loading")).toBeVisible();
    expect(view.queryByTestId("crear-submit")).toBeNull();
    expect(view.queryByText("Obra")).toBeNull();
  });

  it("en edición la cabecera dice «Editar opinión» y «Cancelar» llama a la acción", () => {
    const onCancel = jest.fn();

    const view = setup({ mode: "edit", screenStatus: "loading", onCancel });

    expect(view.getByText("Editar opinión")).toBeVisible();
    fireEvent.press(view.getByTestId("crear-cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("el error de carga dice «No pudimos cargar tu opinión.» y «Reintentar» reintenta", () => {
    const onRetryLoad = jest.fn();

    const view = setup({ screenStatus: "loadError", onRetryLoad });

    expect(view.getByText("No pudimos cargar tu opinión.")).toBeVisible();
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(onRetryLoad).toHaveBeenCalledTimes(1);
    expect(view.queryByTestId("crear-text")).toBeNull();
  });
});

describe("CrearView — sin Spotify (selector de ejemplo)", () => {
  it("pinta la tarjeta de conexión y las obras de ejemplo con su recuento", () => {
    const view = setup();

    expect(view.getByText(CREAR_CONNECT_BODY)).toBeVisible();
    expect(view.getByText("Conectar con Spotify")).toBeVisible();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.getByTestId("work-result-work-2")).toBeVisible();
    expect(view.getAllByTestId("work-result-opinions")[0]).toHaveTextContent(
      "2 opiniones",
    );
    expect(view.getAllByTestId("work-result-opinions")[1]).toHaveTextContent(
      "Sé el primero en opinar",
    );
  });

  it("mientras C7 hidrata no invita a conectar: pinta un esqueleto", () => {
    const view = setup({ spotifyStatus: null });

    expect(view.queryByTestId("connection-card-action")).toBeNull();
    expect(view.getByTestId("skeleton-card-1")).toBeVisible();
  });

  it("«Conectar con Spotify» abre la autorización de verdad", () => {
    const onConnectSpotify = jest.fn();
    const view = setup({ onConnectSpotify });

    fireEvent.press(view.getByTestId("connection-card-action"));

    expect(onConnectSpotify).toHaveBeenCalledTimes(1);
  });

  it("un fallo de conexión se puede reintentar desde la tarjeta", () => {
    const onRetrySpotify = jest.fn();
    const view = setup({ spotifyStatus: "connectionError", onRetrySpotify });

    expect(view.getByText("No pudimos conectar con Spotify.")).toBeVisible();
    fireEvent.press(view.getByTestId("connection-card-action"));

    expect(onRetrySpotify).toHaveBeenCalledTimes(1);
  });

  it("mientras autoriza dice «Conectando…» y no deja repetir la acción", () => {
    const view = setup({ spotifyStatus: "connecting" });

    expect(view.getAllByText("Conectando…")).toHaveLength(2);
    expect(
      view.getByText("Termina la autorización en Spotify; volverás aquí solo."),
    ).toBeVisible();
    expect(view.getByTestId("connection-card-action")).toBeDisabled();
  });

  it("con el token caducado invita a volver a conectar desde la tarjeta", () => {
    const onConnectSpotify = jest.fn();
    const view = setup({ spotifyStatus: "invalidToken", onConnectSpotify });

    expect(
      view.getByText("Tu sesión de Spotify caducó. Vuelve a conectar."),
    ).toBeVisible();
    expect(view.getByText(CREAR_CONNECT_BODY)).toBeVisible();
    fireEvent.press(view.getByTestId("connection-card-action"));

    expect(onConnectSpotify).toHaveBeenCalledTimes(1);
  });

  it("sin client ID lo explica y no ofrece un botón que no hace nada", () => {
    const view = setup({ spotifyStatus: "notConfigured" });

    expect(
      view.getByText(
        "La conexión con Spotify no está configurada en esta instalación.",
      ),
    ).toBeVisible();
    expect(view.getByText(CREAR_NOT_CONFIGURED_BODY)).toBeVisible();
    expect(view.queryByTestId("connection-card-action")).toBeNull();
  });

  it("tocar una obra de ejemplo la elige", () => {
    const onChooseWork = jest.fn();

    const view = setup({ onChooseWork });

    fireEvent.press(view.getByTestId("work-result-work-2"));

    expect(onChooseWork).toHaveBeenCalledWith(OTHER);
  });

  it("la fila elegida usa el rótulo de álbum cuando la obra lo trae", () => {
    const view = setup({ work: { ...WORK, workKind: "album" } });

    expect(view.getByTestId("work-result-kind")).toHaveTextContent("Álbum");
  });

  it("con obra elegida pliega el selector y deja su fila con «Cambiar», sin buscador", () => {
    const view = setup({ work: WORK });

    expect(view.queryByTestId("crear-change-work")).not.toBeNull();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(view.queryByTestId("work-result-work-2")).toBeNull();
    expect(
      view.queryByText("Conecta Spotify para buscar en el catálogo completo."),
    ).toBeNull();
  });
});

describe("CrearView — con Spotify (buscador)", () => {
  it("escribe el aviso de dos caracteres y no monta la tarjeta de conexión", () => {
    const view = setup({ spotifyStatus: "connected", searchStatus: "short" });

    expect(view.getByText("Escribe al menos 2 caracteres.")).toBeVisible();
    expect(
      view.queryByText("Conecta Spotify para buscar en el catálogo completo."),
    ).toBeNull();
  });

  it("mientras busca pinta esqueletos de fila", () => {
    const view = setup({ spotifyStatus: "connected", searchStatus: "searching" });

    expect(view.getAllByTestId(/^skeleton-row-/)).toHaveLength(3);
  });

  it("con resultados lista como máximo cinco filas y elegir una la entrega", () => {
    const onChooseWork = jest.fn();
    const results = Array.from({ length: 7 }, (_, index) => ({
      ...WORK,
      workId: `r-${index}`,
      title: `Obra ${index}`,
    }));

    const view = setup({
      spotifyStatus: "connected",
      query: "bad",
      searchStatus: "results",
      results,
      onChooseWork,
    });

    expect(view.getAllByTestId("work-result-title")).toHaveLength(5);
    fireEvent.press(view.getByTestId("work-result-r-1"));
    expect(onChooseWork).toHaveBeenCalledWith(results[1]);
  });

  it("sin resultados lo dice con la frase exacta", () => {
    const view = setup({
      spotifyStatus: "connected",
      query: "zzz",
      searchStatus: "empty",
    });

    expect(
      view.getByText("No encontramos esa obra. Prueba con otro nombre."),
    ).toBeVisible();
  });

  it("un fallo de búsqueda se anuncia y «Reintentar» lo reintenta", () => {
    const onSearchRetry = jest.fn();

    const view = setup({
      spotifyStatus: "connected",
      query: "bad",
      searchStatus: "error",
      onSearchRetry,
    });

    expect(view.getByText("No pudimos buscar en Spotify.")).toBeVisible();
    fireEvent.press(view.getByTestId("crear-search-retry"));
    expect(onSearchRetry).toHaveBeenCalledTimes(1);
  });

  it("sin conexión el buscador lo dice y deja reintentar la consulta vigente", () => {
    const onSearchRetry = jest.fn();

    const view = setup({
      spotifyStatus: "connected",
      query: "bad",
      searchStatus: "offline",
      onSearchRetry,
    });

    expect(view.getByTestId("crear-search-offline")).toHaveTextContent(
      CREAR_SEARCH_OFFLINE_MESSAGE,
    );
    fireEvent.press(view.getByTestId("crear-search-offline-retry"));
    expect(onSearchRetry).toHaveBeenCalledTimes(1);
  });

  it("«Cambiar» pliega el buscador y vuelve a desplegarlo", () => {
    const onToggleSearch = jest.fn();

    const view = setup({ spotifyStatus: "connected", work: WORK, onToggleSearch });

    expect(view.queryByTestId("search-field")).toBeNull();
    fireEvent.press(view.getByTestId("crear-change-work"));

    expect(onToggleSearch).toHaveBeenCalledTimes(1);
  });
});

describe("CrearView — formulario y envío", () => {
  it("el botón «Publicar» está deshabilitado sin texto ni valoración", () => {
    const view = setup({ work: WORK, text: "", rating: 0 });

    expect(view.getByTestId("crear-submit")).toBeDisabled();
    expect(view.getByText("Publicar")).toBeVisible();
    expect(view.getByTestId("rating-input-value")).toHaveTextContent(
      "Sin valorar",
    );
    expect(view.queryByTestId("crear-clear-rating")).toBeNull();
  });

  it("el botón «Publicar» llama a publicar cuando el borrador es válido", () => {
    const onPublish = jest.fn();

    const view = setup({
      work: WORK,
      text: "Un temazo.",
      rating: 4,
      canSubmit: true,
      onPublish,
    });

    expect(view.getByTestId("crear-submit")).toBeEnabled();
    expect(view.getByTestId("rating-input-value")).toHaveTextContent("4 de 5");
    fireEvent.press(view.getByTestId("crear-submit"));
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("las estrellas y «Quitar valoración» llaman a sus acciones", () => {
    const onRate = jest.fn();
    const onClearRating = jest.fn();

    const view = setup({
      work: WORK,
      rating: 3,
      canSubmit: true,
      onRate,
      onClearRating,
    });

    fireEvent.press(view.getByTestId("rating-input-star-5"));
    expect(onRate).toHaveBeenCalledWith(5);

    fireEvent.press(view.getByTestId("crear-clear-rating"));
    expect(onClearRating).toHaveBeenCalledTimes(1);
  });

  it("«Publicar» fallido pinta el error encima del botón y «Reintentar» repite", () => {
    const onPublish = jest.fn();

    const view = setup({
      work: WORK,
      text: "Un temazo.",
      rating: 4,
      canSubmit: true,
      submitError: "publish",
      onPublish,
    });

    expect(view.getByText("No pudimos publicar tu opinión.")).toBeVisible();
    // Los campos siguen ahí: el error no borra el borrador (BR11.7).
    expect(view.getByTestId("crear-text")).toBeVisible();
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("si ya hay opinión propia ofrece «Editar mi opinión» en vez de publicar", () => {
    const onEditExisting = jest.fn();

    const view = setup({
      work: WORK,
      alreadyOpined: true,
      onEditExisting,
    });

    expect(view.getByText("Ya opinaste sobre esta obra.")).toBeVisible();
    expect(view.queryByTestId("crear-submit")).toBeNull();
    fireEvent.press(view.getByTestId("crear-edit-existing"));
    expect(onEditExisting).toHaveBeenCalledTimes(1);
  });
});

describe("CrearView — edición", () => {
  it("no muestra buscador ni «Cambiar» y guarda con «Guardar»", () => {
    const onSave = jest.fn();

    const view = setup({
      mode: "edit",
      work: WORK,
      text: "Lo escucho cada mañana.",
      rating: 5,
      canSubmit: true,
      onSave,
    });

    expect(view.queryByTestId("crear-change-work")).toBeNull();
    expect(view.queryByTestId("search-field")).toBeNull();
    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    fireEvent.press(view.getByTestId("crear-submit"));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(view.getByText("Guardar")).toBeVisible();
  });

  it("«Guardar» fallido pinta su mensaje propio y «Reintentar» guarda otra vez", () => {
    const onSave = jest.fn();

    const view = setup({
      mode: "edit",
      work: WORK,
      text: "Lo escucho cada mañana.",
      rating: 5,
      canSubmit: true,
      submitError: "save",
      onSave,
    });

    expect(view.getByText("No pudimos guardar los cambios.")).toBeVisible();
    fireEvent.press(view.getByTestId("error-state-retry"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("en edición la obra es fija y no hay selector aunque no haya Spotify", () => {
    const view = setup({ mode: "edit", work: WORK, spotifyStatus: "connected" });

    expect(view.getByTestId("work-result-work-1")).toBeVisible();
    expect(
      view.queryByText("Escribe al menos 2 caracteres."),
    ).toBeNull();
  });
});

describe("CrearView — sin conexión", () => {
  it("en Crear avisa de que se puede opinar sobre el catálogo de ejemplo, sin acción", () => {
    const view = setup({ online: false });

    expect(view.getByText(CREAR_OFFLINE_MESSAGE)).toBeVisible();
    expect(view.queryByText("Reintentar")).toBeNull();
  });

  it("en Editar usa el aviso único de U2", () => {
    const view = setup({ mode: "edit", work: WORK, online: false });

    expect(
      view.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
  });
});
