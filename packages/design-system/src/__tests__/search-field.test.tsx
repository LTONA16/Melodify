import { fireEvent, render, screen } from "@testing-library/react-native";

import { SearchField } from "../components/SearchField";
import { ThemeProvider } from "../ThemeProvider";

/**
 * El buscador de C1 1.3.0: enseña lo escrito, avisa de cada cambio, limpia y se
 * deja deshabilitar. No busca ni temporiza: los 400 ms son del contenedor
 * (BR13.1), así que aquí no hay reloj que avanzar.
 */
function renderField(props: Partial<Parameters<typeof SearchField>[0]> = {}) {
  const onChangeText = jest.fn();
  const onClear = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <SearchField
        value=""
        onChangeText={onChangeText}
        onClear={onClear}
        {...props}
      />
    </ThemeProvider>,
  );

  return { onChangeText, onClear };
}

describe("SearchField", () => {
  it("pinta el valor que recibe", () => {
    renderField({ value: "blinding" });

    expect(screen.getByTestId("search-field-input").props.value).toBe(
      "blinding",
    );
  });

  it("avisa de cada cambio de texto", () => {
    const { onChangeText } = renderField();

    fireEvent.changeText(screen.getByTestId("search-field-input"), "harry");

    expect(onChangeText).toHaveBeenCalledWith("harry");
  });

  it("sin texto no pinta la ✕", () => {
    renderField({ value: "" });

    expect(screen.queryByTestId("search-field-clear")).toBeNull();
  });

  it("con texto, la ✕ limpia la búsqueda", () => {
    const { onClear } = renderField({ value: "harry" });

    fireEvent.press(screen.getByTestId("search-field-clear"));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("mientras espera pinta el indicador y no ofrece limpiar", () => {
    renderField({ value: "harry", loading: true });

    expect(screen.getByTestId("search-field-loading")).toBeTruthy();
    expect(screen.queryByTestId("search-field-clear")).toBeNull();
  });

  it("deshabilitado no se puede escribir ni limpiar", () => {
    renderField({ value: "harry", disabled: true });

    expect(screen.getByTestId("search-field-input").props.editable).toBe(false);
    expect(screen.queryByTestId("search-field-clear")).toBeNull();
  });
});
