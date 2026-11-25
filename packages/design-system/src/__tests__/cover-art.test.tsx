import { fireEvent, render, screen } from "@testing-library/react-native";

import { CoverArt } from "../components/CoverArt";
import { ThemeProvider } from "../ThemeProvider";

describe("CoverArt", () => {
  it("si la imagen falla, deja el bloque con la inicial y no un hueco", () => {
    render(
      <ThemeProvider scheme="light">
        <CoverArt
          title="Cielo de neón"
          coverUrl="https://img/rota.jpg"
          size="result"
        />
      </ThemeProvider>,
    );

    fireEvent(screen.getByTestId("cover-art"), "error");

    expect(screen.getByTestId("cover-initial")).toHaveTextContent("C");
    expect(screen.getByTestId("cover-art")).toHaveStyle({
      width: 56,
      height: 56,
    });
  });

  it("al cambiar de portada vuelve a intentar la imagen", () => {
    const { rerender } = render(
      <ThemeProvider scheme="light">
        <CoverArt title="Cielo de neón" coverUrl="https://img/rota.jpg" size="result" />
      </ThemeProvider>,
    );

    fireEvent(screen.getByTestId("cover-art"), "error");
    expect(screen.getByTestId("cover-initial")).toBeOnTheScreen();

    rerender(
      <ThemeProvider scheme="light">
        <CoverArt
          title="Cielo de neón"
          coverUrl="https://img/buena.jpg"
          size="result"
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("cover-art").props.source).toEqual({
      uri: "https://img/buena.jpg",
    });
  });
});
