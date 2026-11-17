import { fireEvent, render, screen } from "@testing-library/react-native";

import { RatingInput } from "../components/RatingInput";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La valoración de C1 1.3.0: cinco objetivos de 44×44, el valor se dice con
 * palabras y repetir el toque no borra (BR11.4). Quitar la valoración es una
 * acción de texto de la pantalla, no un segundo toque escondido.
 */
function renderRating(props: Partial<Parameters<typeof RatingInput>[0]> = {}) {
  const onChange = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <RatingInput value={0} onChange={onChange} {...props} />
    </ThemeProvider>,
  );

  return onChange;
}

describe("RatingInput", () => {
  it("sin valorar lo dice con palabras", () => {
    renderRating();

    expect(screen.getByTestId("rating-input-value")).toHaveTextContent(
      "Sin valorar",
    );
  });

  it("con valor, lee «4 de 5»", () => {
    renderRating({ value: 4 });

    expect(screen.getByTestId("rating-input-value")).toHaveTextContent(
      "4 de 5",
    );
  });

  it("tocar una estrella avisa de esa valoración", () => {
    const onChange = renderRating();

    fireEvent.press(screen.getByTestId("rating-input-star-4"));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("repetir el toque no borra: vuelve a pedir el mismo valor", () => {
    const onChange = renderRating({ value: 4 });

    fireEvent.press(screen.getByTestId("rating-input-star-4"));

    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByTestId("rating-input-value")).toHaveTextContent(
      "4 de 5",
    );
  });

  it("se anuncia como grupo de opciones con la elegida marcada", () => {
    renderRating({ value: 3 });

    expect(screen.getByTestId("rating-input").props.accessibilityRole).toBe(
      "radiogroup",
    );
    expect(
      screen.getByTestId("rating-input-star-3").props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      screen.getByTestId("rating-input-star-5").props.accessibilityState,
    ).toMatchObject({ selected: false });
  });

  it("deshabilitado no cambia de valor", () => {
    const onChange = renderRating({ value: 2, disabled: true });
    const star = screen.getByTestId("rating-input-star-5");

    expect(star.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(star);

    expect(onChange).not.toHaveBeenCalled();
  });
});
