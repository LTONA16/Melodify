import { render, screen } from "@testing-library/react-native";
import { Text, useColorScheme } from "react-native";
import type { ColorSchemeName } from "react-native";

import { ThemeProvider } from "../ThemeProvider";
import { darkTheme, lightTheme } from "../themes";
import { useTheme } from "../useTheme";

/**
 * El esquema del sistema se sustituye por un doble: la prueba fija qué devuelve
 * `useColorScheme()` en cada caso, incluido `null`, que el sistema trata como
 * claro (NFR6.3). Se dobla el módulo del que el índice de React Native saca el
 * hook, sin reemplazar todo `react-native`.
 */
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseColorScheme = useColorScheme as jest.MockedFunction<
  () => ColorSchemeName | null | undefined
>;

function SchemeProbe() {
  const theme = useTheme();

  return (
    <Text testID="probe">{`${theme.scheme}|${theme.colors.bg}|${theme.colors.text}`}</Text>
  );
}

function renderWithProvider(scheme?: "light" | "dark" | "system") {
  render(
    <ThemeProvider scheme={scheme}>
      <SchemeProbe />
    </ThemeProvider>,
  );

  return screen.getByTestId("probe").props.children as string;
}

describe("ThemeProvider", () => {
  it("trata un esquema nulo como claro", () => {
    mockedUseColorScheme.mockReturnValue(null);

    expect(renderWithProvider()).toBe(
      `light|${lightTheme.colors.bg}|${lightTheme.colors.text}`,
    );
  });

  it("sigue al sistema cuando está en claro", () => {
    mockedUseColorScheme.mockReturnValue("light");

    expect(renderWithProvider("system")).toBe(
      `light|${lightTheme.colors.bg}|${lightTheme.colors.text}`,
    );
  });

  it("sigue al sistema cuando está en oscuro", () => {
    mockedUseColorScheme.mockReturnValue("dark");

    expect(renderWithProvider("system")).toBe(
      `dark|${darkTheme.colors.bg}|${darkTheme.colors.text}`,
    );
  });

  it("permite fijar el esquema sin cambiar el del sistema", () => {
    mockedUseColorScheme.mockReturnValue("light");

    expect(renderWithProvider("dark")).toBe(
      `dark|${darkTheme.colors.bg}|${darkTheme.colors.text}`,
    );

    mockedUseColorScheme.mockReturnValue("dark");
    render(
      <ThemeProvider scheme="light">
        <SchemeProbe />
      </ThemeProvider>,
    );

    expect(
      screen.getAllByTestId("probe").at(-1)?.props.children,
    ).toBe(`light|${lightTheme.colors.bg}|${lightTheme.colors.text}`);
  });
});

describe("useTheme", () => {
  it("falla con un mensaje en español fuera del proveedor", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<SchemeProbe />)).toThrow(
      "useTheme debe usarse dentro de ThemeProvider: falta el proveedor del tema.",
    );

    consoleError.mockRestore();
  });

  it("entrega las escalas del tema junto con los colores", () => {
    mockedUseColorScheme.mockReturnValue("light");

    function ScaleProbe() {
      const theme = useTheme();
      const scale = `${theme.type.body.fontSize}|${theme.space[4]}|${theme.radius.md}|${theme.size.touch}`;

      return <Text testID="scale-probe">{scale}</Text>;
    }

    render(
      <ThemeProvider>
        <ScaleProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("scale-probe")).toHaveTextContent("16|16|12|44");
  });
});
