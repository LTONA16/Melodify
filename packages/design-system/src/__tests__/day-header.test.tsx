import { render, screen } from "@testing-library/react-native";

import { DayHeader } from "../components/DayHeader";
import { ThemeProvider } from "../ThemeProvider";

/**
 * Encabezado de día de C1 1.5.0 (paso 12): las tres formas de etiqueta que
 * produce C8 y el alto que deja sitio a una cabecera pegajosa sin tapar filas.
 */
function renderHeader(label: string) {
  render(
    <ThemeProvider scheme="light">
      <DayHeader label={label} />
    </ThemeProvider>,
  );
}

describe("DayHeader", () => {
  it("pinta «Hoy»", () => {
    renderHeader("Hoy");

    expect(screen.getByTestId("day-header-label")).toHaveTextContent("Hoy");
  });

  it("pinta «Ayer»", () => {
    renderHeader("Ayer");

    expect(screen.getByTestId("day-header-label")).toHaveTextContent("Ayer");
  });

  it("pinta una fecha larga tal cual la recibe", () => {
    renderHeader("16 nov 2026");

    expect(screen.getByTestId("day-header-label")).toHaveTextContent("16 nov 2026");
  });

  it("mide 32 de alto y no es tocable", () => {
    renderHeader("Hoy");

    const header = screen.getByTestId("day-header");
    expect(header.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 32 })]),
    );
    expect(header.props.accessibilityRole).toBeUndefined();
    expect(header.props.onPress).toBeUndefined();
  });
});
