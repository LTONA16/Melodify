import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { OpinionCard } from "../components/OpinionCard";
import type { OpinionCardModel } from "../models";
import { ThemeProvider } from "../ThemeProvider";
import { lightTheme } from "../themes";

/**
 * El estado `own` de la tarjeta en variante `detail` (C1 1.2.0): la opinión propia
 * se destaca, se rotula «Tu opinión», pinta «Editar» y cambia el tiempo transcurrido
 * por la línea de fechas. Las fechas son fijas, así que nada depende del reloj de la
 * máquina (AC4.2.1, AC4.2.4).
 */
const CREATED = "2026-11-04T10:00:00.000Z";
const EDITED = "2026-11-06T18:00:00.000Z";

const BASE_OPINION: OpinionCardModel = {
  opinionId: "op-004",
  authorId: "demo",
  authorName: "Demo",
  authorHandle: "demo",
  followedByMe: false,
  workId: "work-002",
  workTitle: "Blinding Lights",
  workArtist: "The Weeknd",
  coverUrl: null,
  text: "La puse una noche de vuelta a casa y ya no salió de la lista.",
  rating: 5,
  createdAt: CREATED,
  updatedAt: CREATED,
  likeCount: 1,
  commentCount: 0,
  likedByMe: false,
};

function renderCard(
  overrides: Partial<OpinionCardModel> = {},
  props: Partial<Parameters<typeof OpinionCard>[0]> = {},
) {
  render(
    <ThemeProvider scheme="light">
      <OpinionCard
        opinion={{ ...BASE_OPINION, ...overrides }}
        variant="detail"
        isOwn
        {...props}
      />
    </ThemeProvider>,
  );
}

describe("OpinionCard en estado own", () => {
  it("destaca la tarjeta y la rotula «Tu opinión»", () => {
    renderCard();

    expect(screen.getByTestId("opinion-own-label")).toHaveTextContent(
      "Tu opinión",
    );
    expect(
      StyleSheet.flatten(screen.getByTestId("opinion-card-op-004").props.style)
        .backgroundColor,
    ).toBe(lightTheme.colors.primaryContainer);
  });

  it("cambia el tiempo transcurrido por la fecha de creación", () => {
    renderCard();

    expect(screen.getByTestId("opinion-own-dates")).toHaveTextContent(
      "Creada el 4 nov 2026",
    );
    expect(screen.queryByTestId("opinion-created-at")).toBeNull();
  });

  it("pinta «Editar» sin callback y no responde al tocarlo", () => {
    renderCard();

    const edit = screen.getByTestId("opinion-edit");

    expect(edit.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(edit);

    expect(screen.getByTestId("opinion-card-op-004")).toBeTruthy();
  });

  it("con callback, «Editar» avisa del toque", () => {
    const onEdit = jest.fn();

    renderCard({}, { onEdit });

    fireEvent.press(screen.getByTestId("opinion-edit"));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("una opinión editada añade la fecha de edición detrás de un punto medio", () => {
    renderCard({ updatedAt: EDITED });

    expect(screen.getByTestId("opinion-own-dates")).toHaveTextContent(
      "Creada el 4 nov 2026 · Editada el 6 nov 2026",
    );
  });

  it("no destaca una opinión ajena ni le pinta «Editar»", () => {
    renderCard({}, { isOwn: false });

    expect(screen.queryByTestId("opinion-own-label")).toBeNull();
    expect(screen.queryByTestId("opinion-own-dates")).toBeNull();
    expect(screen.queryByText("Editar")).toBeNull();
    expect(screen.getByTestId("opinion-created-at")).toBeTruthy();
  });
});

/**
 * Las dos precisiones de la 1.3.0 en la tarjeta: la opinión propia conserva el
 * contador de me gusta pero no deja dárselo, y seguir alterna «Seguir autor» y
 * «Siguiendo» con la etiqueta accesible de AC7.3.1 y AC7.3.2.
 */
describe("OpinionCard 1.3.0: me gusta propio y acción de seguir", () => {
  it("en la propia, el me gusta es texto y no responde", () => {
    const onLike = jest.fn();

    renderCard({}, { onLike });

    const like = screen.getByTestId("social-like");

    expect(like).toHaveTextContent("♡ 1");
    expect(like.props.accessibilityRole).toBeUndefined();

    fireEvent.press(like);

    expect(onLike).not.toHaveBeenCalled();
  });

  it("la propia no pinta la acción de seguir", () => {
    renderCard({ followedByMe: false }, { onFollow: jest.fn() });

    expect(screen.queryByTestId("opinion-follow")).toBeNull();
  });

  it("sin seguir, la etiqueta es «Seguir autor» y su etiqueta accesible nombra al autor", () => {
    renderCard({ followedByMe: false }, { isOwn: false, onFollow: jest.fn() });

    const follow = screen.getByTestId("opinion-follow");

    expect(follow).toHaveTextContent("Seguir autor");
    expect(follow.props.accessibilityLabel).toBe("Seguir a Demo");
    expect(follow.props.accessibilityState).toMatchObject({ selected: false });
  });

  it("siguiendo, la etiqueta es «Siguiendo» y ofrece dejar de seguir", () => {
    renderCard({ followedByMe: true }, { isOwn: false, onFollow: jest.fn() });

    const follow = screen.getByTestId("opinion-follow");

    expect(follow).toHaveTextContent("Siguiendo");
    expect(follow.props.accessibilityLabel).toBe("Dejar de seguir a Demo");
    expect(follow.props.accessibilityState).toMatchObject({ selected: true });
  });
});
