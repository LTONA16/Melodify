import { act, render, screen } from "@testing-library/react-native";

import { Snackbar, SNACKBAR_DURATION_MS } from "../components/Snackbar";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La franja de aviso de C1 1.3.0: un mensaje, sin acciones y 4 s (BR15.1). El
 * temporizador es de la pieza y se comprueba con relojes falsos para no esperar
 * cuatro segundos de verdad.
 */
function renderSnackbar(visible = true, onDismiss = jest.fn()) {
  render(
    <ThemeProvider scheme="light">
      <Snackbar
        message="Opinión publicada"
        visible={visible}
        onDismiss={onDismiss}
      />
    </ThemeProvider>,
  );

  return onDismiss;
}

describe("Snackbar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("oculto no pinta nada", () => {
    renderSnackbar(false);

    expect(screen.queryByTestId("snackbar")).toBeNull();
  });

  it("visible pinta el mensaje y se anuncia como aviso", () => {
    renderSnackbar();

    expect(screen.getByTestId("snackbar-message")).toHaveTextContent(
      "Opinión publicada",
    );
    expect(screen.getByTestId("snackbar").props.accessibilityRole).toBe(
      "alert",
    );
  });

  it("se va a los 4 s", () => {
    const onDismiss = renderSnackbar();

    act(() => {
      jest.advanceTimersByTime(SNACKBAR_DURATION_MS - 1);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("al ocultarse antes de tiempo cancela su temporizador", () => {
    const onDismiss = jest.fn();
    const { rerender } = render(
      <ThemeProvider scheme="light">
        <Snackbar
          message="Opinión publicada"
          visible
          onDismiss={onDismiss}
        />
      </ThemeProvider>,
    );

    rerender(
      <ThemeProvider scheme="light">
        <Snackbar
          message="Opinión publicada"
          visible={false}
          onDismiss={onDismiss}
        />
      </ThemeProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(SNACKBAR_DURATION_MS);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
