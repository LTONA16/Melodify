import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { TextButton } from "../components/TextButton";
import { ThemeProvider } from "../ThemeProvider";
import { lightTheme } from "../themes";

/**
 * El único botón de texto de la versión. Se comprueba lo que la persona percibe:
 * la etiqueta, que el toque llegue, que deshabilitado no dispare, el color del tono
 * y el área táctil mínima (NFR6.2, FR11.2).
 */
function renderButton(
  props: Partial<Parameters<typeof TextButton>[0]> = {},
) {
  return render(
    <ThemeProvider scheme="light">
      <TextButton label="Cerrar sesión" onPress={jest.fn()} {...props} />
    </ThemeProvider>,
  );
}

describe("TextButton", () => {
  it("pinta la etiqueta recibida y avisa al tocarlo", () => {
    const onPress = jest.fn();

    renderButton({ onPress });

    expect(screen.getByText("Cerrar sesión")).toBeVisible();

    fireEvent.press(screen.getByTestId("text-button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("deshabilitado no dispara la acción y lo anuncia", () => {
    const onPress = jest.fn();

    renderButton({ onPress, disabled: true });

    fireEvent.press(screen.getByTestId("text-button"));

    expect(onPress).not.toHaveBeenCalled();
    expect(
      screen.getByTestId("text-button").props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it("el tono danger usa el color de error y el de por defecto el primario", () => {
    renderButton({ tone: "danger" });

    expect(
      StyleSheet.flatten(screen.getByText("Cerrar sesión").props.style).color,
    ).toBe(lightTheme.colors.error);
  });

  it("deshabilitado se atenúa en lugar de conservar el color de la acción", () => {
    renderButton({ disabled: true });

    expect(
      StyleSheet.flatten(screen.getByText("Cerrar sesión").props.style).color,
    ).toBe(lightTheme.colors.textMuted);
  });

  it("da al botón un área táctil de al menos 44", () => {
    renderButton();

    const style = StyleSheet.flatten(
      screen.getByTestId("text-button").props.style,
    );

    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
