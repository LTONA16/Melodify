/**
 * El área segura de Android (BR2.2, AC1.1.2): desde RN 0.86 el sistema pinta a
 * sangre por el borde, así que la barra de estado y la de navegación se superponen
 * al contenido si la cáscara no reserva su alto.
 *
 * El resto de pruebas monta insets a cero para poder afirmar contenido; esta es la
 * única que los pone a un valor real y comprueba que la cáscara los aplica.
 */
import { render, screen } from "@testing-library/react-native";
import { StyleSheet, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { AppShell } from "../AppShell";
import type { ScreenModule, ShellServices } from "../types";

/** El doble del área segura: arriba la barra de estado, abajo la navegación. */
jest.mock("react-native-safe-area-context", () => {
  const React = jest.requireActual("react");
  const { View: MockView } = jest.requireActual("react-native");
  const insets = { top: 24, left: 0, right: 0, bottom: 12 };
  const frame = { x: 0, y: 0, width: 360, height: 780 };

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(MockView, null, children),
    SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) =>
      React.createElement(MockView, props, children),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaFrameContext: React.createContext(frame),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { frame, insets },
  };
});

function Home() {
  return <Text>Inicio</Text>;
}

const SCREENS: ScreenModule[] = [
  { name: "inicio", title: "Inicio", component: Home },
  { name: "explorar", title: "Explorar", component: Home },
  { name: "crear", title: "Crear", component: Home },
  { name: "actividad", title: "Actividad", component: Home },
  { name: "perfil", title: "Perfil", component: Home },
];

function services(): ShellServices {
  const noop = () => () => undefined;

  return {
    network: { online: true, subscribe: noop },
    spotify: {
      status: "disconnected",
      subscribe: noop,
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
    },
    comments: {
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: noop,
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  };
}

function paddingOf(testID: string): Record<string, number | undefined> {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style) ?? {};
}

describe("cáscara — área segura del sistema", () => {
  it("reserva la barra de estado sobre las cinco pestañas", () => {
    render(
      <ThemeProvider>
        <AppShell screens={SCREENS} initialRoute="inicio" services={services()} />
      </ThemeProvider>,
    );

    expect(paddingOf("app-shell-tabs").paddingTop).toBe(24);
  });

  it("reserva la barra de navegación bajo la barra inferior", () => {
    render(
      <ThemeProvider>
        <AppShell screens={SCREENS} initialRoute="inicio" services={services()} />
      </ThemeProvider>,
    );

    expect(paddingOf("app-shell-tabbar").paddingBottom).toBe(12);
  });

  it("Login también reserva arriba y abajo", () => {
    render(
      <ThemeProvider>
        <AppShell
          screens={SCREENS}
          initialRoute="inicio"
          services={services()}
          entry={<View><Text>Entrar</Text></View>}
        />
      </ThemeProvider>,
    );

    const style = paddingOf("app-shell-entry");
    expect(style.paddingTop).toBe(24);
    expect(style.paddingBottom).toBe(12);
  });
});
