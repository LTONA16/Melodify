import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { SecondaryButton } from "../components/SecondaryButton";
import { ThemeProvider } from "../ThemeProvider";
import { lightTheme } from "../themes";

/**
 * La jerarquía secundaria de C1 1.3.0: borde y sin fondo, con el mismo mínimo de
 * alto que la principal y el área táctil de 44 del sistema (NFR6.2).
 */
function renderButton(
  props: Partial<Parameters<typeof SecondaryButton>[0]> = {},
) {
  const onPress = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <SecondaryButton label="Cambiar" onPress={onPress} {...props} />
    </ThemeProvider>,
  );

  return onPress;
}

describe("SecondaryButton", () => {
  it("pinta su etiqueta con borde y sin fondo", () => {
    renderButton();

    const button = screen.getByTestId("secondary-button");

    expect(button).toHaveTextContent("Cambiar");
    expect(StyleSheet.flatten(button.props.style)).toEqual(
      expect.objectContaining({ borderWidth: 1, backgroundColor: "transparent" }),
    );
  });

  it("avisa del toque", () => {
    const onPress = renderButton();

    fireEvent.press(screen.getByTestId("secondary-button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("deshabilitado se anuncia como tal y no dispara", () => {
    const onPress = renderButton({ disabled: true });
    const button = screen.getByTestId("secondary-button");

    expect(button.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it("el mínimo de alto es el del botón del sistema", () => {
    renderButton();

    expect(StyleSheet.flatten(screen.getByTestId("secondary-button").props.style)).toEqual(
      expect.objectContaining({ minHeight: lightTheme.size.button }),
    );
  });
});
