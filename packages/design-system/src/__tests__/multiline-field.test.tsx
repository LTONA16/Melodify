import { fireEvent, render, screen } from "@testing-library/react-native";

import { MultilineField } from "../components/MultilineField";
import { ThemeProvider } from "../ThemeProvider";

/**
 * El campo largo de C1 1.3.0: escribe, avisa del cambio, enseña el error con texto
 * e icono, cuenta desde el umbral y se deja deshabilitar. El tope viaja como
 * `maxLength` al campo nativo; el almacén lo vuelve a comprobar (TS-28).
 */
function renderField(
  props: Partial<Parameters<typeof MultilineField>[0]> = {},
) {
  const onChangeText = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <MultilineField
        label="Tu opinión"
        value=""
        onChangeText={onChangeText}
        {...props}
      />
    </ThemeProvider>,
  );

  return onChangeText;
}

describe("MultilineField", () => {
  it("pinta la etiqueta y el valor", () => {
    renderField({ value: "Una opinión" });

    expect(screen.getByTestId("multiline-field-label")).toHaveTextContent(
      "Tu opinión",
    );
    expect(screen.getByTestId("multiline-field").props.value).toBe(
      "Una opinión",
    );
  });

  it("avisa de cada cambio de texto", () => {
    const onChangeText = renderField();

    fireEvent.changeText(screen.getByTestId("multiline-field"), "Me gusta");

    expect(onChangeText).toHaveBeenCalledWith("Me gusta");
  });

  it("pinta el error con texto e icono, no solo con color", () => {
    renderField({ error: "Escribe algo antes de publicar." });

    expect(screen.getByTestId("multiline-field-error")).toHaveTextContent(
      "Escribe algo antes de publicar.",
    );
    expect(screen.getByTestId("multiline-field-error-icon")).toBeTruthy();
  });

  it("sin error no pinta el bloque de error", () => {
    renderField();

    expect(screen.queryByTestId("multiline-field-error")).toBeNull();
  });

  it("el contador aparece desde el umbral y no antes", () => {
    renderField({ value: "a".repeat(420), maxLength: 500, counterFrom: 400 });

    expect(screen.getByTestId("multiline-field-counter")).toHaveTextContent(
      "420/500",
    );
  });

  it("por debajo del umbral no hay contador", () => {
    renderField({ value: "a".repeat(399), maxLength: 500, counterFrom: 400 });

    expect(screen.queryByTestId("multiline-field-counter")).toBeNull();
  });

  it("el tope de longitud llega al campo nativo", () => {
    renderField({ maxLength: 500 });

    expect(screen.getByTestId("multiline-field").props.maxLength).toBe(500);
  });

  it("deshabilitado no se puede editar", () => {
    renderField({ editable: false });

    expect(screen.getByTestId("multiline-field").props.editable).toBe(false);
  });

  it("sin etiqueta no pinta un rótulo vacío", () => {
    renderField({ label: "" });

    expect(screen.queryByTestId("multiline-field-label")).toBeNull();
  });
});
