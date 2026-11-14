import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ErrorState } from "../components/ErrorState";
import { ThemeProvider } from "../ThemeProvider";

const MESSAGE = "No pudimos cargar las opiniones.";
const RETRY = "Reintentar";

/**
 * El bloque de error con reintento: el mensaje llega escrito por la pantalla y la
 * pieza solo se ocupa de que se lea, se anuncie y el reintento responda (FR11.2).
 */
function renderErrorState(onRetry = jest.fn()) {
  render(
    <ThemeProvider scheme="light">
      <ErrorState message={MESSAGE} retryLabel={RETRY} onRetry={onRetry} />
    </ThemeProvider>,
  );

  return onRetry;
}

describe("ErrorState", () => {
  it("pinta el mensaje recibido y la etiqueta de reintento", () => {
    renderErrorState();

    expect(screen.getByTestId("error-state-message")).toHaveTextContent(MESSAGE);
    expect(screen.getByText(RETRY)).toBeVisible();
  });

  it("anuncia el bloque como alerta para que se lea sin verlo", () => {
    renderErrorState();

    expect(screen.getByTestId("error-state").props.accessibilityRole).toBe(
      "alert",
    );
  });

  it("tocar «Reintentar» llama a onRetry una vez", () => {
    const onRetry = renderErrorState();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("da al reintento un área táctil de al menos 44", () => {
    renderErrorState();

    const style = StyleSheet.flatten(
      screen.getByTestId("error-state-retry").props.style,
    );

    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
