import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { AppShell } from "../AppShell";
import { useCreateEntry, useGlobalServices } from "../contexts";
import type { ScreenModule, ShellServices } from "../types";

/**
 * La entrada de Crear en C2 1.3.0: `formKey` sube en **cada** visita —al abrir
 * desde un botón, al pedir «Editar» y al tocar la pestaña—, para que la pantalla
 * descarte el borrador anterior sin que la cáscara guarde texto (BR11.3). Y
 * `openEdit` desde Crear conserva el destino de la entrada vigente, o «Guardar»
 * volvería al formulario en vez de al detalle (AC6.1.3).
 */
function Probe({ name }: { name: string }) {
  const entry = useCreateEntry();

  return (
    <Text testID={`entry-${name}`}>
      {`${entry.returnTo ?? "ninguno"}|${entry.editingOpinionId ?? "ninguna"}|${entry.formKey}`}
    </Text>
  );
}

function Home() {
  const global = useGlobalServices();

  return (
    <View>
      <Probe name="inicio" />
      <Pressable
        testID="open-create"
        onPress={() => global.openCreate({ workId: "work-1" })}
      >
        <Text>Crear opinión</Text>
      </Pressable>
      <Pressable
        testID="open-edit"
        onPress={() => global.openEdit({ opinionId: "op-7" })}
      >
        <Text>Editar opinión</Text>
      </Pressable>
    </View>
  );
}

function Crear() {
  const global = useGlobalServices();

  return (
    <View>
      <Probe name="crear" />
      <Pressable
        testID="edit-from-crear"
        onPress={() => global.openEdit({ opinionId: "op-9" })}
      >
        <Text>Editar desde Crear</Text>
      </Pressable>
    </View>
  );
}

const SCREENS: ScreenModule[] = [
  { name: "inicio", title: "Inicio", component: Home },
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

describe("AppShell — la marca de formulario de Crear", () => {
  it("arranca en cero", () => {
    renderShell();

    expect(screen.getByTestId("entry-inicio")).toHaveTextContent("ninguno|ninguna|0");
  });

  it("sube al abrir Crear desde una acción y vuelve a subir en la siguiente visita", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-create"));

    expect(screen.getByTestId("entry-crear")).toHaveTextContent(
      "inicio|ninguna|1",
    );

    fireEvent.press(screen.getByTestId("tab-inicio"));
    fireEvent.press(screen.getByTestId("open-create"));

    expect(screen.getByTestId("entry-crear")).toHaveTextContent(
      "inicio|ninguna|2",
    );
  });

  it("sube también al pedir «Editar» y al tocar la pestaña Crear", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-edit"));

    expect(screen.getByTestId("entry-crear")).toHaveTextContent(
      "inicio|op-7|1",
    );

    fireEvent.press(screen.getByTestId("tab-inicio"));
    fireEvent.press(screen.getByTestId("tab-crear"));

    expect(screen.getByTestId("entry-crear")).toHaveTextContent(
      "inicio|ninguna|2",
    );
  });

  it("«Editar» desde Crear conserva el destino de la entrada vigente", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-create"));
    fireEvent.press(screen.getByTestId("edit-from-crear"));

    // El destino sigue siendo Inicio —de donde se vino— y no el formulario, y la
    // marca sube porque es un formulario nuevo.
    expect(screen.getByTestId("entry-crear")).toHaveTextContent(
      "inicio|op-9|2",
    );
  });
});
