import { fireEvent, render, screen, within } from "@testing-library/react-native";
import {
  ThemeProvider,
  type OpinionCardModel,
} from "@melodify/design-system";

import {
  DetalleObraView,
  type DetalleObraViewProps,
} from "../DetalleObraView";

/**
 * La vista pura del detalle de obra (BR8.1–BR8.8): cada variante de la siembra se
 * recorre sin almacén y sin catálogo, porque la identidad, las opiniones y la portada
 * llegan ya resueltas por props. Lo que se afirma es lo que la persona ve —los textos
 * exactos, el orden de las tarjetas, los esqueletos y a quién llama el botón—, no cómo
 * está montado el árbol.
 *
 * Los dobles de opinión reproducen los campos de la siembra que esta pantalla pinta
 * (autor, obra, valoración, texto y fechas); los datos reales de C4 se comprueban en
 * `detalle-obra-screen.test.tsx`.
 */
const DEMO = "demo";

function card(overrides: Partial<OpinionCardModel> = {}): OpinionCardModel {
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
    createdAt: "2026-11-12T07:00:00.000Z",
    updatedAt: "2026-11-12T07:00:00.000Z",
    likeCount: 1,
    commentCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

const OWN_BOHEMIAN = card({
  opinionId: "op-001",
  authorId: DEMO,
  authorName: "Usuario demo",
  authorHandle: "demo",
  followedByMe: false,
  text: "Seis minutos que no se sienten como seis minutos. Cada vez que la pongo encuentro una capa nueva: el piano, las voces, ese silencio antes del final.",
  rating: 5,
  createdAt: "2026-11-09T09:00:00.000Z",
  updatedAt: "2026-11-09T09:00:00.000Z",
  likeCount: 1,
  commentCount: 1,
});

const OTHER_BOHEMIAN = card();

const BOHEMIAN = {
  workId: "4u7EnebtmKWzUH433Rbtpz",
  title: "Bohemian Rhapsody",
  artist: "Queen",
};

const BAD_GUY = {
  workId: "2Fxmhks0bxGSBdJ92vM42m",
  title: "bad guy",
  artist: "Billie Eilish",
};

const AS_IT_WAS = {
  workId: "4LRPiXqCikLlN15c3yImP7",
  title: "As It Was",
  artist: "Harry Styles",
};

function renderView(overrides: Partial<DetalleObraViewProps> = {}) {
  const props: DetalleObraViewProps = {
    status: "ready",
    work: BOHEMIAN,
    coverUrl: null,
    average: 5,
    opinionCount: 2,
    own: OWN_BOHEMIAN,
    others: [OTHER_BOHEMIAN],
    online: true,
    onRetry: jest.fn(),
    onRetryCovers: jest.fn(),
    onCreateOpinion: jest.fn(),
    ...overrides,
  };

  render(
    <ThemeProvider scheme="light">
      <DetalleObraView {...props} />
    </ThemeProvider>,
  );

  return props;
}

describe("DetalleObraView", () => {
  it("mientras carga pinta el esqueleto de cabecera y dos de opinión, sin identidad ni tarjetas", () => {
    renderView({ status: "loading", work: null, own: null, others: [] });

    expect(screen.getByTestId("skeleton-header-1")).toBeTruthy();
    expect(screen.getByTestId("skeleton-card-2")).toBeTruthy();
    expect(screen.queryByTestId("work-header")).toBeNull();
    expect(screen.queryAllByTestId(/^opinion-card-/)).toHaveLength(0);
    expect(screen.queryByTestId("error-state")).toBeNull();
  });

  it("con opinión propia la pinta primera y destacada, y «Otras opiniones» debajo", () => {
    renderView();

    const cards = screen.getAllByTestId(/^opinion-card-/);

    expect(cards).toHaveLength(2);
    expect(cards[0]!.props.testID).toBe("opinion-card-op-001");
    expect(cards[1]!.props.testID).toBe("opinion-card-op-002");
    expect(within(cards[0]!).getByTestId("opinion-own-label")).toHaveTextContent(
      "Tu opinión",
    );
    expect(within(cards[0]!).getByTestId("opinion-edit")).toBeTruthy();
    expect(screen.getByText("Otras opiniones")).toBeVisible();
    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(
      within(screen.getByTestId("work-header")).getByTestId("rating-value"),
    ).toHaveTextContent("5 de 5");
    expect(screen.getByTestId("work-header-count")).toHaveTextContent(
      "2 opiniones",
    );
    // Con opinión propia no se ofrece publicar otra (BR8.3, BR8.4).
    expect(screen.queryByTestId("detalle-obra-create")).toBeNull();
  });

  it("la opinión propia editada enseña creación y edición, no la primera sola", () => {
    renderView({
      work: {
        workId: "0VjIjW4GlUZAMYd2vXMi3b",
        title: "Blinding Lights",
        artist: "The Weeknd",
      },
      own: card({
        opinionId: "op-004",
        authorId: DEMO,
        authorName: "Usuario demo",
        authorHandle: "demo",
        workId: "0VjIjW4GlUZAMYd2vXMi3b",
        workTitle: "Blinding Lights",
        workArtist: "The Weeknd",
        rating: 5,
        createdAt: "2026-11-11T09:00:00.000Z",
        updatedAt: "2026-11-12T05:00:00.000Z",
      }),
      others: [
        card({
          opinionId: "op-003",
          authorId: "ana",
          authorName: "Ana Ríos",
          authorHandle: "ana",
          workId: "0VjIjW4GlUZAMYd2vXMi3b",
          workTitle: "Blinding Lights",
          workArtist: "The Weeknd",
          rating: 4,
        }),
      ],
    });

    expect(screen.getByTestId("opinion-own-dates")).toHaveTextContent(
      "Creada el 11 nov 2026 · Editada el 12 nov 2026",
    );
  });

  it("sin opinión propia pinta las ajenas bajo «Otras opiniones» y el botón de opinar", () => {
    const props = renderView({
      work: BAD_GUY,
      average: 3,
      opinionCount: 1,
      own: null,
      others: [
        card({
          opinionId: "op-005",
          authorId: "bruno",
          authorName: "Bruno Salas",
          authorHandle: "bruno",
          workId: "2Fxmhks0bxGSBdJ92vM42m",
          workTitle: "bad guy",
          workArtist: "Billie Eilish",
          rating: 3,
        }),
      ],
    });

    expect(screen.getByText("Otras opiniones")).toBeVisible();
    expect(screen.queryByTestId("opinion-own-label")).toBeNull();
    expect(screen.getByTestId("work-header-count")).toHaveTextContent(
      "1 opinión",
    );
    expect(screen.queryByText("Nadie más ha opinado todavía.")).toBeNull();

    fireEvent.press(screen.getByTestId("detalle-obra-create"));

    expect(props.onCreateOpinion).toHaveBeenCalledTimes(1);
  });

  it("con la propia y ninguna ajena dice «Nadie más ha opinado todavía.»", () => {
    renderView({
      work: {
        workId: "5ghIJDpPoe3CfHMGu71E6T",
        title: "Smells Like Teen Spirit",
        artist: "Nirvana",
      },
      average: 4,
      opinionCount: 1,
      own: card({
        opinionId: "op-008",
        authorId: DEMO,
        authorName: "Usuario demo",
        authorHandle: "demo",
        workId: "5ghIJDpPoe3CfHMGu71E6T",
        workTitle: "Smells Like Teen Spirit",
        workArtist: "Nirvana",
        rating: 4,
        createdAt: "2026-11-08T09:00:00.000Z",
        updatedAt: "2026-11-08T09:00:00.000Z",
      }),
      others: [],
    });

    expect(screen.getByTestId("opinion-own-label")).toHaveTextContent(
      "Tu opinión",
    );
    expect(screen.getByText("Nadie más ha opinado todavía.")).toBeVisible();
    expect(screen.queryByText("Otras opiniones")).toBeNull();
    expect(screen.queryByTestId("detalle-obra-create")).toBeNull();
  });

  it("sin ninguna opinión pinta la identidad, el mensaje y el botón", () => {
    renderView({
      work: AS_IT_WAS,
      average: 0,
      opinionCount: 0,
      own: null,
      others: [],
    });

    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "As It Was",
    );
    expect(
      screen.getByText("Todavía nadie ha opinado sobre esta obra."),
    ).toBeVisible();
    expect(screen.getByTestId("detalle-obra-create")).toBeTruthy();
  });

  it("si falla con la identidad ya resuelta, la conserva sobre el error y reintenta", () => {
    const props = renderView({
      status: "error",
      work: BOHEMIAN,
      own: null,
      others: [],
    });

    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(screen.getByText("No pudimos cargar esta obra.")).toBeVisible();
    expect(screen.queryByTestId("skeleton")).toBeNull();
    expect(screen.queryByTestId("detalle-obra-create")).toBeNull();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("si falla sin identidad no inventa una cabecera de obra", () => {
    const props = renderView({ status: "error", work: null, own: null, others: [] });

    expect(screen.queryByTestId("work-header")).toBeNull();
    expect(screen.getByText("No pudimos cargar esta obra.")).toBeVisible();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("sin conexión pinta el aviso único, conserva la identidad y reintenta portadas", () => {
    const props = renderView({ online: false });

    expect(
      screen.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(props.onRetryCovers).toHaveBeenCalledTimes(1);
  });

  it("las opiniones del detalle llevan el texto completo, sin recortar", () => {
    renderView();

    for (const text of screen.getAllByTestId("opinion-text")) {
      expect(text.props.numberOfLines).toBeUndefined();
    }
  });

  it("la opinión ajena lleva autor y tiempo transcurrido, y la portada sin URL deja la inicial", () => {
    renderView();

    const others = screen.getByTestId("opinion-card-op-002");

    expect(within(others).getByTestId("opinion-author")).toHaveTextContent(
      "Lucía Ferrer",
    );
    expect(within(others).getByTestId("opinion-created-at")).toBeTruthy();
    expect(
      within(screen.getByTestId("work-header")).getByTestId("cover-initial"),
    ).toHaveTextContent("B");
  });
});
