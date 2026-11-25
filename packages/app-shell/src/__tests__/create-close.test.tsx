import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { AppShell } from "../AppShell";
import { useGlobalServices } from "../contexts";
import type { ScreenModule, ShellServices } from "../types";

/**
 * Salir de Crear en C2 1.3.0 (FR5.4, FR6.2, revisión 15 del contrato): «Cancelar»,
 * «Guardar» y el atrás del sistema hacen lo mismo —volver a `returnTo` **sin tocar
 * su pila**—, y el atrás consume el evento porque es la única pantalla con un
 * borrador que se perdería.
 */
function Home() {
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
        testID="open-create"
        onPress={() => global.openCreate({ workId: work.workId })}
      >
        <Text>Opinar</Text>
      </Pressable>
    </View>
  );
}

function Crear() {
  const global = useGlobalServices();

  return (
    <View>
      <Text testID="crear-form">Formulario</Text>
      <Pressable testID="cancelar" onPress={() => global.closeCreate()}>
        <Text>Cancelar</Text>
      </Pressable>
      <Pressable testID="guardar" onPress={() => global.closeCreate()}>
        <Text>Guardar</Text>
      </Pressable>
    </View>
  );
}

const SCREENS: ScreenModule[] = [
  {
    name: "inicio",
    title: "Inicio",
    component: Home,
    details: [{ kind: "work", component: WorkDetail }],
  },
  { name: "crear", title: "Crear", component: Crear },
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
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: () => noopUnsubscribe,
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(() => false),
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

/** Abre Crear desde el detalle de obra, que es el caso con pila de verdad. */
function openCreateFromDetail(): void {
  fireEvent.press(screen.getByTestId("increment"));
  fireEvent.press(screen.getByTestId("open-work"));
  fireEvent.press(screen.getByTestId("open-create"));

  expect(screen.getByTestId("crear-form")).toBeVisible();
}

describe("AppShell — salir de Crear", () => {
  it("«Cancelar» vuelve al detalle de origen y no a la raíz de la pestaña", () => {
    renderShell();
    openCreateFromDetail();

    fireEvent.press(screen.getByTestId("cancelar"));

    // El detalle sigue apilado: la pila no se reinició al salir (AC6.1.3).
    expect(screen.getByTestId("work-detail")).toHaveTextContent("work-1");
    expect(screen.queryByTestId("crear-form")).toBeNull();
  });

  it("«Guardar» recorre el mismo camino que «Cancelar»", () => {
    renderShell();
    openCreateFromDetail();

    fireEvent.press(screen.getByTestId("guardar"));

    expect(screen.getByTestId("work-detail")).toBeVisible();
  });

  it("la raíz conserva su estado después de pasar por Crear", () => {
    renderShell();
    openCreateFromDetail();

    fireEvent.press(screen.getByTestId("cancelar"));
    fireEvent.press(screen.getByTestId("header-back"));

    // El contador siguió en 1: la raíz nunca se desmontó.
    expect(screen.getByTestId("counter")).toHaveTextContent("1");
  });

  it("el atrás del sistema cancela y consume el evento", () => {
    type BackListener = Parameters<typeof BackHandler.addEventListener>[1];
    const listeners: BackListener[] = [];
    const addSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, listener) => {
        listeners.push(listener);
        return { remove: jest.fn() };
      });

    try {
      renderShell();
      openCreateFromDetail();

      let handled = false;

      act(() => {
        handled =
          listeners.at(-1)?.({ type: "hardwareBackPress", timeStamp: 0 }) ??
          false;
      });

      expect(handled).toBe(true);

      expect(screen.getByTestId("work-detail")).toBeVisible();
      expect(screen.queryByTestId("crear-form")).toBeNull();
    } finally {
      addSpy.mockRestore();
    }
  });
});
