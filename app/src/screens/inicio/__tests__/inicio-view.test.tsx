import { fireEvent, render, screen, within } from "@testing-library/react-native";
import {
  ThemeProvider,
  type OpinionCardModel,
} from "@melodify/design-system";

import { InicioView, type InicioCard, type InicioViewProps } from "../InicioView";

/**
 * La vista pura de Inicio (BR7.1–BR7.6, BR7.9): cada estado se recorre sin almacén,
 * sin catálogo y sin red, porque todo llega por props. Lo que se afirma es lo que la
 * persona ve —los textos exactos, las tarjetas, los avisos y a quién llama cada
 * acción—, no cómo está montado el árbol.
 */
const CREATED_AT = "2026-11-04T10:00:00.000Z";

const OFFICIAL_OFFLINE =
  "Sin conexión. Estás viendo lo último que cargamos.";

function opinionCard(
  overrides: Partial<OpinionCardModel> = {},
): OpinionCardModel {
  return {
    opinionId: "op-002",
    authorId: "lucia",
    authorName: "Lucía Ferrer",
    authorHandle: "lucia",
    followedByMe: true,
    workId: "4u7EnebtmKWzUH433Rbtpz",
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    coverUrl: null,
    text: "La escuché por primera vez en un viaje largo y desde entonces es mi canción de carretera.",
    rating: 4,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    likeCount: 1,
    commentCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

const FEED: InicioCard[] = [
  { opinion: opinionCard(), isOwn: false },
  {
    opinion: opinionCard({
      opinionId: "op-003",
      authorId: "ana",
      authorName: "Ana Ríos",
      authorHandle: "ana",
      followedByMe: false,
      workId: "0VjIjW4GlUZAMYd2vXMi3b",
      workTitle: "Blinding Lights",
      workArtist: "The Weeknd",
      text: "Suena a noche de viernes.",
      rating: 3,
    }),
    isOwn: false,
  },
];

function renderView(overrides: Partial<InicioViewProps> = {}) {
  const props: InicioViewProps = {
    status: "ready",
    cards: FEED,
    online: true,
    metadataError: false,
    spotifyStatus: "disconnected",
    onOpenOpinion: jest.fn(),
    onRetry: jest.fn(),
    onRetryCovers: jest.fn(),
    onCreate: jest.fn(),
    ...overrides,
  };

  render(
    <ThemeProvider scheme="light">
      <InicioView {...props} />
    </ThemeProvider>,
  );

  return props;
}

describe("InicioView", () => {
  it("mientras carga pinta «Para ti» y tres esqueletos, sin tarjetas", () => {
    renderView({ status: "loading", cards: [] });

    expect(screen.getByText("Para ti")).toBeVisible();
    expect(screen.getByTestId("skeleton-card-3")).toBeTruthy();
    expect(screen.queryAllByTestId(/^opinion-card-/)).toHaveLength(0);
    expect(screen.queryByTestId("empty-state")).toBeNull();
    expect(screen.queryByTestId("error-state")).toBeNull();
  });

  it("con el feed listo pinta cada tarjeta con obra, artista, autor, valoración y texto", () => {
    renderView();

    expect(screen.getAllByTestId("opinion-work-title")).toHaveLength(2);
    expect(
      screen.getAllByTestId("opinion-work-title")[0],
    ).toHaveTextContent("Bohemian Rhapsody");
    expect(screen.getAllByTestId("opinion-work-artist")[0]).toHaveTextContent(
      "Queen",
    );
    expect(screen.getAllByTestId("opinion-author")[0]).toHaveTextContent(
      "Lucía Ferrer",
    );
    expect(screen.getAllByTestId("rating-value")[0]).toHaveTextContent(
      "4 de 5",
    );
    expect(screen.getAllByTestId("opinion-text")[0]).toHaveTextContent(
      /mi canción de carretera/,
    );
  });

  it("sin opiniones pinta el vacío con su cuerpo y «Crear opinión» abre Crear", () => {
    const props = renderView({ cards: [] });

    expect(screen.getByText("Aún no hay opiniones.")).toBeVisible();
    expect(screen.getByText("Sé el primero.")).toBeVisible();

    fireEvent.press(screen.getByTestId("empty-state-action"));

    expect(props.onCreate).toHaveBeenCalledTimes(1);
  });

  it("si el contenido falla pinta el texto exacto y «Reintentar» vuelve a intentarlo", () => {
    const props = renderView({ status: "error", cards: [] });

    expect(screen.getByText("No pudimos cargar las opiniones.")).toBeVisible();
    expect(screen.queryByTestId("skeleton")).toBeNull();
    expect(screen.queryByTestId("empty-state")).toBeNull();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("si fallan los metadatos avisa con su texto y deja la lista a la vista", () => {
    const props = renderView({ metadataError: true });

    expect(
      screen.getByText("No pudimos actualizar las portadas."),
    ).toBeVisible();
    expect(screen.getAllByTestId("opinion-work-title")).toHaveLength(2);

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(props.onRetryCovers).toHaveBeenCalledTimes(1);
  });

  it("sin conexión pinta el aviso único, conserva la lista y reintenta portadas", () => {
    const props = renderView({ online: false });

    expect(screen.getByText(OFFICIAL_OFFLINE)).toBeVisible();
    expect(screen.getAllByTestId("opinion-work-title")).toHaveLength(2);

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(props.onRetryCovers).toHaveBeenCalledTimes(1);
  });

  it("pinta el aviso de metadatos antes que el de sin conexión, los dos sobre la lista", () => {
    renderView({ metadataError: true, online: false });

    const banners = screen.getAllByTestId("banner");

    expect(banners).toHaveLength(2);
    expect(
      within(banners[0]!).getByText("No pudimos actualizar las portadas."),
    ).toBeVisible();
    expect(within(banners[1]!).getByText(OFFICIAL_OFFLINE)).toBeVisible();
    expect(screen.getAllByTestId("opinion-work-title")).toHaveLength(2);
  });

  it("el chip dice «Conectar» sin sesión de Spotify y en U2 no responde", () => {
    renderView();

    const chip = screen.getByTestId("spotify-chip");

    expect(chip).toHaveTextContent("Conectar");
    expect(chip.props.accessibilityLabel).toBe("Conectar");
    expect(screen.queryByTestId("spotify-chip-dot")).toBeNull();

    // La acción se cablea en U4; aquí tocarlo no cambia la pantalla.
    fireEvent.press(chip);

    expect(screen.getByText("Para ti")).toBeVisible();
  });

  it("el chip dice «Conectado» y lleva su punto cuando Spotify está conectado", () => {
    renderView({ spotifyStatus: "connected" });

    expect(screen.getByTestId("spotify-chip")).toHaveTextContent("Conectado");
    expect(screen.getByTestId("spotify-chip-dot")).toBeTruthy();
  });

  it("tocar una tarjeta abre el detalle de esa opinión", () => {
    const props = renderView();

    fireEvent.press(screen.getByTestId("opinion-card-op-003"));

    expect(props.onOpenOpinion).toHaveBeenCalledWith("op-003");
  });

  it("las tarjetas del feed son de lectura: sin «Tu opinión», sin «Editar» y con las acciones inertes", () => {
    renderView({ cards: [{ opinion: opinionCard(), isOwn: true }] });

    expect(screen.queryByTestId("opinion-own-label")).toBeNull();
    expect(screen.queryByTestId("opinion-edit")).toBeNull();
    expect(
      screen.getByTestId("social-like").props.accessibilityState,
    ).toMatchObject({ disabled: true });
    expect(
      screen.getByTestId("social-comment").props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });
});
