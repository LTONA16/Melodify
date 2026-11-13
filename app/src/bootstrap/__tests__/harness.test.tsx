import { render, screen } from "@testing-library/react-native";
import { Text, View } from "react-native";

/**
 * Comprobación del arnés: si este archivo no pasa, el preset de Expo, React Native
 * o Testing Library no están resolviendo y ninguna otra prueba es fiable.
 */
describe("arnés de pruebas", () => {
  it("monta un componente de React Native y lee su texto", () => {
    render(
      <View>
        <Text>Melodify</Text>
      </View>,
    );

    expect(screen.getByText("Melodify")).toBeTruthy();
  });

  it("resuelve los tipos de Jest y los matchers de Testing Library", () => {
    const node = render(<Text>Opiniones sobre música</Text>);

    expect(node.getByText("Opiniones sobre música")).toBeVisible();
  });
});
