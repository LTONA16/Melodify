import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { BottomTabBar } from "../components/BottomTabBar";
import type { TabItem } from "../models";
import { ThemeProvider } from "../ThemeProvider";
import { lightTheme } from "../themes";

const ITEMS: TabItem[] = [
  { name: "inicio", label: "Inicio", icon: "home" },
  { name: "explorar", label: "Explorar", icon: "search" },
  { name: "crear", label: "Crear", icon: "plus" },
  { name: "actividad", label: "Actividad", icon: "activity" },
  { name: "perfil", label: "Perfil", icon: "profile" },
];

function renderBar(activeIndex = 0, onSelect = jest.fn()) {
  render(
    <ThemeProvider scheme="light">
      <BottomTabBar items={ITEMS} activeIndex={activeIndex} onSelect={onSelect} />
    </ThemeProvider>,
  );

  return onSelect;
}

describe("BottomTabBar", () => {
  it("pinta los cinco destinos en el orden recibido", () => {
    renderBar();

    const labels = screen.getAllByRole("tab").map((node) => node.props.accessibilityLabel);

    expect(labels).toEqual([
      "Inicio",
      "Explorar",
      "Crear",
      "Actividad",
      "Perfil",
    ]);
  });

  it("muestra el destino activo con el color primario y el icono relleno", () => {
    renderBar(2);

    const label = screen.getByTestId("tab-label-crear");
    expect(StyleSheet.flatten(label.props.style).color).toBe(
      lightTheme.colors.primary,
    );
    expect(screen.getByTestId("tab-icon-crear-filled")).toBeTruthy();
    expect(screen.queryByTestId("tab-icon-crear-outline")).toBeNull();
  });

  it("muestra los destinos inactivos con texto atenuado y el icono de contorno", () => {
    renderBar(2);

    const label = screen.getByTestId("tab-label-inicio");
    expect(StyleSheet.flatten(label.props.style).color).toBe(
      lightTheme.colors.textMuted,
    );
    expect(screen.getByTestId("tab-icon-inicio-outline")).toBeTruthy();
    expect(screen.queryByTestId("tab-icon-inicio-filled")).toBeNull();
  });

  it("mantiene la etiqueta visible en todos los destinos", () => {
    renderBar();

    ITEMS.forEach((item) => {
      expect(screen.getByTestId(`tab-label-${item.name}`)).toHaveTextContent(
        item.label,
      );
    });
  });

  it("entrega el índice del destino tocado", () => {
    const onSelect = renderBar();

    fireEvent.press(screen.getByTestId("tab-actividad"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it("da a cada destino un área táctil de al menos 44 por lado", () => {
    renderBar();

    ITEMS.forEach((item) => {
      const style = StyleSheet.flatten(screen.getByTestId(`tab-${item.name}`).props.style);

      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });
  });
});
