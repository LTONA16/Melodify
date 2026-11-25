import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { WorkHeader } from "../WorkHeader";

/**
 * La identidad de obra de los dos detalles (BR8.1, BR8.11): portada de 96, título,
 * artista, estrellas con la media y el recuento con el singular bien escrito.
 */
function renderHeader(
  props: Partial<Parameters<typeof WorkHeader>[0]> = {},
) {
  render(
    <ThemeProvider scheme="light">
      <WorkHeader
        title="Bohemian Rhapsody"
        artist="Queen"
        coverUrl={null}
        average={5}
        opinionCount={2}
        {...props}
      />
    </ThemeProvider>,
  );
}

describe("WorkHeader", () => {
  it("pinta el título, el artista y la portada con la inicial", () => {
    renderHeader();

    expect(screen.getByTestId("work-header-title")).toHaveTextContent(
      "Bohemian Rhapsody",
    );
    expect(screen.getByTestId("work-header-artist")).toHaveTextContent("Queen");
    expect(screen.getByTestId("cover-initial")).toHaveTextContent("B");
  });

  it("da a la portada el tamaño de detalle, 96", () => {
    renderHeader();

    const style = StyleSheet.flatten(
      screen.getByTestId("cover-art").props.style,
    );

    expect(style.width).toBe(96);
    expect(style.height).toBe(96);
  });

  it("pinta las estrellas de la media con su número", () => {
    renderHeader({ average: 4 });

    expect(screen.getByTestId("star-4")).toHaveTextContent("★");
    expect(screen.getByTestId("star-5")).toHaveTextContent("☆");
    expect(screen.getByTestId("rating-value")).toHaveTextContent("4 de 5");
  });

  it("escribe el recuento en plural cuando hay más de una", () => {
    renderHeader({ opinionCount: 2 });

    expect(screen.getByTestId("work-header-count")).toHaveTextContent(
      "2 opiniones",
    );
  });

  it("escribe «1 opinión» en singular", () => {
    renderHeader({ opinionCount: 1 });

    expect(screen.getByTestId("work-header-count")).toHaveTextContent(
      "1 opinión",
    );
  });

  it("pinta la URL cuando la obra tiene portada resuelta", () => {
    renderHeader({ coverUrl: "https://example.test/cover.png" });

    expect(screen.getByTestId("cover-art").props.source).toEqual({
      uri: "https://example.test/cover.png",
    });
  });
});
