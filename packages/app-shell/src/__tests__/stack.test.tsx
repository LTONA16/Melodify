import { act, fireEvent, render, screen, within } from "@testing-library/react-native";
import { useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { AppShell } from "../AppShell";
import { useGlobalServices } from "../contexts";
import type { ScreenModule, ShellServices } from "../types";

/**
 * La pila de C2 1.2.0: abrir un detalle **no** desmonta la raíz, solo la oculta con
 * `display: none`; «‹ Volver» desapila y devuelve a la raíz con su estado intacto
 * (AC2.3.2). Las pruebas leen lo oculto con `includeHiddenElements: true` para poder
 * distinguir «montado pero oculto» de «desmontado».
 */
function RootScreen() {
  const global = useGlobalServices();
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text testID="counter">{count}</Text>
      <Pressable
        testID="increment"
        onPress={() => setCount((previous) => previous + 1)}
      >
        <Text>Sumar</Text>
      </Pressable>
      <Pressable
        testID="open-work"
        onPress={() => global.openWorkDetail({ workId: "work-1" })}
      >
        <Text>Abrir obra</Text>
      </Pressable>
    </View>
  );
}

function WorkDetail({ work }: { work: { workId: string } }) {
  const global = useGlobalServices();

  return (
    <View>
      <Text testID="work-detail">{work.workId}</Text>
      <Pressable
        testID="detail-set-header"
        onPress={() => global.setHeader({ title: "Detalle de obra" })}
      >
        <Text>Fijar cabecera</Text>
      </Pressable>
      <Pressable
        testID="open-opinion"
        onPress={() => global.openOpinionDetail({ opinionId: "op-1" })}
      >
        <Text>Abrir opinión</Text>
      </Pressable>
    </View>
  );
}

function OpinionDetail({ opinion }: { opinion: { opinionId: string } }) {
  return <Text testID="opinion-detail">{opinion.opinionId}</Text>;
}

const SCREENS: ScreenModule[] = [
  {
    name: "inicio",
    title: "Inicio",
    component: RootScreen,
    details: [
      { kind: "work", component: WorkDetail },
      { kind: "opinion", component: OpinionDetail },
    ],
  },
  { name: "perfil", title: "Perfil", component: () => <Text>Perfil</Text> },
];

function createServices(): ShellServices {
  const noopUnsubscribe = () => {};

  return {
    network: { online: true, subscribe: () => noopUnsubscribe },
    spotify: {
      status: "disconnected",
      subscribe: () => noopUnsubscribe,
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
    },
    comments: {
      state: { opinionId: null, comments: [], status: "empty" },
      subscribe: () => noopUnsubscribe,
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  };
}

function renderShell() {
  render(
    <ThemeProvider scheme="light">
      <AppShell
        screens={SCREENS}
        initialRoute="inicio"
        services={createServices()}
      />
    </ThemeProvider>,
  );
}

/** Lo que está montado aunque esté oculto bajo el detalle. */
function hidden(id: string) {
  return screen.getByTestId(id, { includeHiddenElements: true });
}

describe("AppShell — pila que conserva la raíz", () => {
  it("abrir un detalle oculta la raíz sin desmontarla", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("increment"));
    fireEvent.press(screen.getByTestId("open-work"));

    expect(screen.getByTestId("work-detail")).toBeVisible();
    expect(screen.queryByTestId("counter")).toBeNull();
    expect(hidden("counter")).toHaveTextContent("1");
  });

  it("«‹ Volver» desapila y devuelve a la raíz con su estado intacto", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("increment"));
    fireEvent.press(screen.getByTestId("increment"));
    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("header-back"));

    expect(screen.queryByTestId("work-detail")).toBeNull();
    expect(screen.getByTestId("counter")).toHaveTextContent("2");
  });

  it("la cabecera del detalle solo existe con algo apilado y trae «‹ Volver»", () => {
    renderShell();

    expect(screen.queryByTestId("app-header")).toBeNull();
    expect(screen.queryByTestId("header-back")).toBeNull();

    fireEvent.press(screen.getByTestId("open-work"));

    expect(
      screen.getByTestId("header-back", { includeHiddenElements: true }),
    ).toHaveTextContent("‹ Volver");
    expect(
      within(screen.getByTestId("app-header")).getByText("Detalle"),
    ).toBeVisible();
  });

  it("muestra el título que fija la pantalla y lo vacía al desapilar", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("detail-set-header"));

    expect(
      within(screen.getByTestId("app-header")).getByText("Detalle de obra"),
    ).toBeVisible();

    fireEvent.press(screen.getByTestId("header-back"));

    expect(screen.queryByTestId("app-header")).toBeNull();

    // El siguiente detalle no hereda el título del anterior.
    fireEvent.press(screen.getByTestId("open-work"));

    expect(
      within(screen.getByTestId("app-header")).getByText("Detalle"),
    ).toBeVisible();
  });

  it("dos detalles apilados dejan ver solo el de arriba", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("open-opinion"));

    expect(screen.getByTestId("opinion-detail")).toHaveTextContent("op-1");
    expect(screen.queryByTestId("work-detail")).toBeNull();

    fireEvent.press(screen.getByTestId("header-back"));

    expect(screen.getByTestId("work-detail")).toBeVisible();
  });

  it("volver a la raíz desde un segundo detalle conserva el estado de la raíz", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("increment"));
    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("open-opinion"));
    fireEvent.press(screen.getByTestId("header-back"));
    fireEvent.press(screen.getByTestId("header-back"));

    expect(screen.getByTestId("counter")).toHaveTextContent("1");
  });

  it("el gesto atrás de Android desapila y limpia el título", () => {
    type BackListener = Parameters<typeof BackHandler.addEventListener>[1];
    const listeners: BackListener[] = [];
    const addSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, listener) => {
        listeners.push(listener);
        return { remove: jest.fn() };
      });

    const pressBack = (): boolean =>
      listeners.at(-1)?.({ type: "hardwareBackPress", timeStamp: 0 }) ?? false;

    try {
      renderShell();

      fireEvent.press(screen.getByTestId("open-work"));
      fireEvent.press(screen.getByTestId("detail-set-header"));

      act(() => {
        pressBack();
      });

      expect(screen.queryByTestId("work-detail")).toBeNull();
      expect(screen.queryByTestId("app-header")).toBeNull();

      fireEvent.press(screen.getByTestId("open-work"));

      expect(
        within(screen.getByTestId("app-header")).getByText("Detalle"),
      ).toBeVisible();
    } finally {
      addSpy.mockRestore();
    }
  });
});
