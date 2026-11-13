import { ThemeProvider } from "@melodify/design-system";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { InicioScreen } from "../InicioScreen";
import { inicioSeed } from "../seed";

function renderInicio(opinions?: readonly (typeof inicioSeed)[number][]) {
  return render(
    <ThemeProvider scheme="light">
      <InicioScreen opinions={opinions} />
    </ThemeProvider>,
  );
}

describe("InicioScreen", () => {
  it("pinta la cabecera «Inicio», el encabezado «Para ti» y una sola tarjeta", () => {
    renderInicio();

    expect(screen.getByText("Inicio")).toBeVisible();
    expect(screen.getByText("Para ti")).toBeVisible();
    expect(screen.getAllByTestId("opinion-work-title")).toHaveLength(1);
  });

  it("la tarjeta muestra título, artista y los contadores en cero", () => {
    renderInicio();

    const [seed] = inicioSeed;
    expect(seed).toBeDefined();
    expect(screen.getByTestId("opinion-work-title")).toHaveTextContent(
      seed?.workTitle ?? "",
    );
    expect(screen.getByTestId("opinion-work-artist")).toHaveTextContent(
      seed?.workArtist ?? "",
    );
    expect(screen.getByText("♡ 0")).toBeVisible();
    expect(screen.getByText("💬 0")).toBeVisible();
  });

  it("la siembra es de un autor distinto de demo y no muestra «Editar»", () => {
    renderInicio();

    const [seed] = inicioSeed;
    expect(seed?.authorId).not.toBe("demo");
    expect(screen.getByTestId("opinion-author")).toHaveTextContent(
      seed?.authorName ?? "",
    );
    expect(screen.queryByTestId("opinion-edit")).toBeNull();
  });

  it("la tarjeta es de lectura: ni navega ni responde a me gusta ni a comentarios", () => {
    renderInicio();

    const card = screen.getByTestId(`opinion-card-${inicioSeed[0]?.opinionId ?? ""}`);

    // Sin `onPress` la tarjeta no es un botón y no cambia de pantalla.
    expect(card.props.accessibilityRole).toBeUndefined();
    expect(screen.getByTestId("social-like").props.accessibilityState).toMatchObject(
      { disabled: true },
    );
    expect(screen.getByTestId("social-comment").props.accessibilityState).toMatchObject(
      { disabled: true },
    );

    fireEvent.press(card);
    fireEvent.press(screen.getByTestId("social-like"));
    fireEvent.press(screen.getByTestId("social-comment"));

    // Nada de lo tocado cambia los datos: siguen los contadores en cero.
    expect(screen.getByText("♡ 0")).toBeVisible();
    expect(screen.getByText("💬 0")).toBeVisible();
  });

  it("sin semilla pinta el estado vacío sin botón de acción", () => {
    renderInicio([]);

    expect(
      screen.getByText("Aún no hay opiniones. Sé el primero."),
    ).toBeVisible();
    expect(screen.queryByTestId("empty-state-action")).toBeNull();
    expect(screen.queryAllByTestId("opinion-work-title")).toHaveLength(0);
  });

  it("el chip de Spotify dice «Conectar» y en U1 no hace nada", () => {
    renderInicio();

    const chip = screen.getByTestId("spotify-chip");
    expect(chip).toHaveTextContent("Conectar");
    expect(chip.props.accessibilityLabel).toBe("Conectar");

    // La acción se cablea en U4; aquí tocarla no cambia la pantalla.
    fireEvent.press(chip);
    expect(screen.getByText("Para ti")).toBeVisible();
  });
});
