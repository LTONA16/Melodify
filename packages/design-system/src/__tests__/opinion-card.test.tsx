import { fireEvent, render, screen } from "@testing-library/react-native";

import { OpinionCard } from "../components/OpinionCard";
import type { OpinionCardModel } from "../models";
import { ThemeProvider } from "../ThemeProvider";

const NOW = Date.now();

const BASE_OPINION: OpinionCardModel = {
  opinionId: "op-1",
  authorId: "ana",
  authorName: "Ana Ruiz",
  authorHandle: "anaruiz",
  followedByMe: false,
  workId: "work-1",
  workTitle: "Cielo de Neón",
  workArtist: "Aurora Vega",
  coverUrl: null,
  text: "Un disco que se escucha entero, de la primera a la última canción, y que mejora con cada vuelta.",
  rating: 4,
  createdAt: new Date(NOW - 6 * 60_000).toISOString(),
  updatedAt: new Date(NOW - 6 * 60_000).toISOString(),
  likeCount: 0,
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
        variant="feed"
        isOwn={false}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe("OpinionCard en variante feed", () => {
  it("pinta la portada con la inicial cuando no hay imagen", () => {
    renderCard();

    expect(screen.getByTestId("cover-initial")).toHaveTextContent("C");
  });

  it("pinta el título, el artista y la valoración con su número", () => {
    renderCard();

    expect(screen.getByTestId("opinion-work-title")).toHaveTextContent(
      "Cielo de Neón",
    );
    expect(screen.getByTestId("opinion-work-artist")).toHaveTextContent(
      "Aurora Vega",
    );
    expect(screen.getByTestId("rating-value")).toHaveTextContent("4 de 5");
  });

  it("pinta el autor, el tiempo transcurrido y los contadores en cero", () => {
    renderCard();

    expect(screen.getByTestId("opinion-author")).toHaveTextContent("Ana Ruiz");
    expect(screen.getByTestId("opinion-created-at")).toHaveTextContent(
      "hace 6 min",
    );
    expect(screen.getByTestId("social-like")).toHaveTextContent("♡ 0");
    expect(screen.getByTestId("social-comment")).toHaveTextContent("💬 0");
  });

  it("recorta el texto a tres líneas en el feed", () => {
    renderCard();

    expect(screen.getByTestId("opinion-text").props.numberOfLines).toBe(3);
  });

  it("no muestra «Editar» en una opinión ajena", () => {
    renderCard({}, { isOwn: false });

    expect(screen.queryByText("Editar")).toBeNull();
  });

  it("no responde a las acciones cuando no recibe callbacks", () => {
    renderCard();

    expect(
      screen.getByTestId("social-like").props.accessibilityState,
    ).toMatchObject({ disabled: true });
    expect(
      screen.getByTestId("social-comment").props.accessibilityState,
    ).toMatchObject({ disabled: true });

    fireEvent.press(screen.getByTestId("social-like"));
    fireEvent.press(screen.getByTestId("social-comment"));
    fireEvent.press(screen.getByTestId("opinion-card-op-1"));

    expect(screen.getByTestId("opinion-card-op-1")).toBeTruthy();
  });
});

describe("OpinionCard propia y con acciones", () => {
  it("muestra «Editar» solo en una opinión propia y con callback", () => {
    const onEdit = jest.fn();

    renderCard({}, { isOwn: true, onEdit });

    fireEvent.press(screen.getByTestId("opinion-edit"));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("no muestra «Editar» si es propia pero no hay callback", () => {
    renderCard({}, { isOwn: true });

    expect(screen.queryByText("Editar")).toBeNull();
  });

  it("avisa del me gusta, del comentario, del toque y de seguir", () => {
    const onLike = jest.fn();
    const onComment = jest.fn();
    const onPress = jest.fn();
    const onFollow = jest.fn();

    renderCard({}, { onLike, onComment, onPress, onFollow });

    fireEvent.press(screen.getByTestId("social-like"));
    fireEvent.press(screen.getByTestId("social-comment"));
    fireEvent.press(screen.getByTestId("opinion-card-op-1"));
    fireEvent.press(screen.getByTestId("opinion-follow"));

    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onComment).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onFollow).toHaveBeenCalledTimes(1);
  });

  it("marca el corazón cuando la opinión ya tiene me gusta", () => {
    renderCard({ likedByMe: true, likeCount: 3 });

    expect(screen.getByTestId("social-like")).toHaveTextContent("♥ 3");
  });
});
