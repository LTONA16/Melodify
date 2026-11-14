import { ThemeProvider } from "@melodify/design-system";
import type { OpinionCardModel } from "@melodify/design-system";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { PerfilView } from "../PerfilView";
import type { PerfilAuthorView, PerfilViewProps } from "../PerfilView";

/**
 * La vista de Perfil (BR9.1–BR9.9, AC9.1.1–AC9.1.7): identidad, contadores con
 * singular correcto, opiniones propias en variante compacta, los cuatro estados y
 * el cierre de sesión. La tarjeta de Spotify **no** existe en U2: su hueco es de U4
 * (AC9.1.8 sigue `Deferred`).
 */
function card(opinionId: string): OpinionCardModel {
  return {
    opinionId,
    authorId: "demo",
    authorName: "Usuario demo",
    authorHandle: "demo",
    followedByMe: false,
    workId: `obra-${opinionId}`,
    workTitle: `Obra ${opinionId}`,
    workArtist: "Queen",
    coverUrl: null,
    text: `Texto de ${opinionId}.`,
    rating: 5,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
  };
}

const AUTHOR: PerfilAuthorView = {
  displayName: "Usuario demo",
  handle: "demo",
  opinionCount: 3,
  followingCount: 2,
};

function baseProps(overrides: Partial<PerfilViewProps> = {}): PerfilViewProps {
  return {
    status: "ready",
    author: AUTHOR,
    cards: [card("op-001"), card("op-004"), card("op-008")],
    online: true,
    onOpenOpinion: jest.fn(),
    onRetry: jest.fn(),
    onRetryCovers: jest.fn(),
    onCreate: jest.fn(),
    onSignOut: jest.fn(),
    ...overrides,
  };
}

function renderPerfil(overrides: Partial<PerfilViewProps> = {}) {
  return render(
    <ThemeProvider scheme="light">
      <PerfilView {...baseProps(overrides)} />
    </ThemeProvider>,
  );
}

describe("PerfilView", () => {
  it("pinta la identidad «Usuario demo» y «@demo»", () => {
    renderPerfil();

    expect(screen.getByText("Perfil")).toBeVisible();
    expect(screen.getByTestId("perfil-name")).toHaveTextContent("Usuario demo");
    expect(screen.getByTestId("perfil-handle")).toHaveTextContent("@demo");
  });

  it("pinta los contadores exactos y las tres opiniones en variante compacta", () => {
    renderPerfil();

    expect(screen.getByTestId("perfil-counters")).toHaveTextContent(
      "3 opiniones · 2 siguiendo",
    );
    expect(screen.getByText("Mis opiniones")).toBeVisible();
    expect(screen.getAllByTestId("opinion-text")).toHaveLength(3);
    expect(screen.getAllByTestId("opinion-text")[0]?.props.numberOfLines).toBe(2);
  });

  it("con un solo elemento escribe «1 opinión · 1 siguiendo»", () => {
    renderPerfil({
      author: { ...AUTHOR, opinionCount: 1, followingCount: 1 },
      cards: [card("op-001")],
    });

    expect(screen.getByTestId("perfil-counters")).toHaveTextContent(
      "1 opinión · 1 siguiendo",
    );
  });

  it("sin opiniones pinta el vacío y «Crear opinión» llama a onCreate", () => {
    const onCreate = jest.fn();
    renderPerfil({
      author: { ...AUTHOR, opinionCount: 0 },
      cards: [],
      onCreate,
    });

    expect(screen.getByText("Todavía no has publicado opiniones.")).toBeVisible();

    fireEvent.press(screen.getByTestId("empty-state-action"));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("en carga pinta esqueletos y no la identidad", () => {
    renderPerfil({ status: "loading", author: null, cards: [] });

    expect(screen.getByTestId("perfil-loading")).toBeVisible();
    expect(screen.queryByTestId("perfil-name")).toBeNull();
  });

  it("en error pinta «No pudimos cargar tu perfil.» y «Reintentar» llama a onRetry", () => {
    const onRetry = jest.fn();
    renderPerfil({ status: "error", author: null, cards: [], onRetry });

    expect(screen.getByText("No pudimos cargar tu perfil.")).toBeVisible();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("«Cerrar sesión» es un botón de texto en tono de error que llama a onSignOut", () => {
    const onSignOut = jest.fn();
    renderPerfil({ onSignOut });

    fireEvent.press(screen.getByTestId("perfil-sign-out"));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("no pinta ninguna tarjeta de Spotify en esta unidad", () => {
    renderPerfil();

    expect(screen.queryByText(/spotify/i)).toBeNull();
    expect(screen.queryByText("Conectar")).toBeNull();
    expect(screen.queryByText("Conectado")).toBeNull();
  });

  it("sin conexión pinta el aviso y la identidad sigue visible", () => {
    renderPerfil({ online: false });

    expect(
      screen.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
    expect(screen.getByTestId("perfil-name")).toBeVisible();
  });

  it("tocar una opinión llama a onOpenOpinion con su opinionId", () => {
    const onOpenOpinion = jest.fn();
    renderPerfil({ onOpenOpinion });

    fireEvent.press(screen.getByTestId("opinion-card-op-004"));

    expect(onOpenOpinion).toHaveBeenCalledWith("op-004");
  });
});
