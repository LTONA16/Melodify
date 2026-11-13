import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { BackHandler, Pressable, Text, View } from "react-native";

import { AppShell } from "../AppShell";
import { useCreateEntry, useGlobalServices, useShellServices } from "../contexts";
import type { ScreenModule, ShellServices } from "../types";
import { ThemeProvider } from "@melodify/design-system";

function Probe({ name }: { name: string }) {
  const services = useShellServices();
  const createEntry = useCreateEntry();

  return (
    <View>
      <Text testID={`probe-${name}`}>{`${createEntry.returnTo ?? "ninguno"}|${createEntry.editingOpinionId ?? "ninguna"}`}</Text>
      <Text testID={`status-${name}`}>{`${services.network.online}|${services.spotify.status}`}</Text>
    </View>
  );
}

function HomeScreen() {
  const global = useGlobalServices();

  return (
    <View>
      <Text>Pantalla Inicio</Text>
      <Probe name="inicio" />
      <Pressable
        testID="open-work"
        onPress={() => global.openWorkDetail({ workId: "work-1" })}
      >
        <Text>Abrir obra</Text>
      </Pressable>
      <Pressable
        testID="open-create"
        onPress={() => global.openCreate({ workId: "work-1" })}
      >
        <Text>Crear opinión</Text>
      </Pressable>
      <Pressable
        testID="edit-opinion"
        onPress={() => global.openEdit({ opinionId: "op-1" })}
      >
        <Text>Editar opinión</Text>
      </Pressable>
      <Pressable
        testID="open-opinion-without-detail"
        onPress={() => global.openOpinionDetail({ opinionId: "op-1" })}
      >
        <Text>Abrir opinión</Text>
      </Pressable>
    </View>
  );
}

function CrearScreen() {
  const global = useGlobalServices();

  return (
    <View>
      <Text>Pantalla Crear</Text>
      <Probe name="crear" />
      <Pressable
        testID="go-inicio"
        onPress={() => global.goToTab({ name: "inicio" })}
      >
        <Text>Ir a Inicio</Text>
      </Pressable>
      <Pressable testID="cancelar" onPress={() => global.closeCreate()}>
        <Text>Cancelar</Text>
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
        testID="detail-go-inicio"
        onPress={() => global.goToTab({ name: "inicio" })}
      >
        <Text>Ir a Inicio</Text>
      </Pressable>
      <Pressable
        testID="detail-set-header"
        onPress={() => global.setHeader({ title: "Otra obra" })}
      >
        <Text>Cambiar cabecera</Text>
      </Pressable>
      <Pressable
        testID="detail-snackbar"
        onPress={() => global.showSnackbar({ message: "Publicado" })}
      >
        <Text>Avisar</Text>
      </Pressable>
    </View>
  );
}

function OpinionDetail({ opinion }: { opinion: { opinionId: string } }) {
  return <Text testID="opinion-detail">{opinion.opinionId}</Text>;
}

function ExplorarScreen() {
  const global = useGlobalServices();

  return (
    <View>
      <Text>Pantalla Explorar</Text>
      <Probe name="explorar" />
      <Pressable
        testID="open-opinion-detail"
        onPress={() => global.openOpinionDetail({ opinionId: "op-9" })}
      >
        <Text>Abrir opinión</Text>
      </Pressable>
    </View>
  );
}

function SimpleScreen({ title }: { title: string }) {
  return (
    <View>
      <Text>{`Pantalla ${title}`}</Text>
      <Probe name={title.toLowerCase()} />
    </View>
  );
}

function createScreens(): ScreenModule[] {
  return [
    {
      name: "inicio",
      title: "Inicio",
      component: HomeScreen,
      details: [{ kind: "work", component: WorkDetail }],
    },
    {
      name: "explorar",
      title: "Explorar",
      component: ExplorarScreen,
      details: [{ kind: "opinion", component: OpinionDetail }],
    },
    { name: "crear", title: "Crear", component: CrearScreen },
    {
      name: "actividad",
      title: "Actividad",
      component: () => <SimpleScreen title="Actividad" />,
    },
    {
      name: "perfil",
      title: "Perfil",
      component: () => <SimpleScreen title="Perfil" />,
    },
  ];
}

function createServices(overrides: Partial<ShellServices> = {}): ShellServices {
  const noopUnsubscribe = () => {};

  return {
    network: {
      online: true,
      subscribe: () => noopUnsubscribe,
    },
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
    ...overrides,
  };
}

function renderShell(
  options: {
    initialRoute?: string;
    services?: ShellServices;
    entry?: React.ReactNode;
    screens?: ScreenModule[];
  } = {},
) {
  const {
    initialRoute = "inicio",
    services = createServices(),
    entry,
    screens = createScreens(),
  } = options;

  render(
    <ThemeProvider scheme="light">
      <AppShell
        screens={screens}
        initialRoute={initialRoute}
        services={services}
        entry={entry}
      />
    </ThemeProvider>,
  );
}

function pressTab(name: string) {
  fireEvent.press(screen.getByTestId(`tab-${name}`));
}

describe("AppShell — barra de cinco pestañas", () => {
  it("pinta cinco destinos hermanos en el orden recibido y ninguno más", () => {
    renderShell();

    const labels = screen
      .getAllByRole("tab")
      .map((node) => node.props.accessibilityLabel);

    expect(labels).toEqual([
      "Inicio",
      "Explorar",
      "Crear",
      "Actividad",
      "Perfil",
    ]);
  });

  it("arranca con la pestaña inicial activa, por color e icono relleno", () => {
    renderShell({ initialRoute: "inicio" });

    expect(screen.getByTestId("tab-icon-inicio-filled")).toBeTruthy();
    expect(screen.getByTestId("tab-icon-explorar-outline")).toBeTruthy();
    expect(screen.getByTestId("tab-panel-inicio")).toBeVisible();
    expect(screen.queryByTestId("tab-panel-explorar")).toBeNull();
  });

  it("cambia de pestaña al tocar un destino", () => {
    renderShell();

    pressTab("actividad");

    expect(screen.getByTestId("tab-panel-actividad")).toBeVisible();
    expect(screen.queryByTestId("tab-panel-inicio")).toBeNull();
    expect(screen.getByTestId("tab-icon-actividad-filled")).toBeTruthy();
  });
});

describe("AppShell — pila por pestaña", () => {
  it("conserva el detalle apilado al cambiar de pestaña y volver", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));
    expect(screen.getByTestId("work-detail")).toBeVisible();

    pressTab("explorar");
    expect(screen.queryByTestId("work-detail")).toBeNull();

    pressTab("inicio");
    expect(screen.getByTestId("work-detail")).toBeVisible();
  });

  it("apila el detalle dentro de la pestaña de origen, no como sexto destino", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));

    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByTestId("tab-panel-inicio")).toBeVisible();
  });

  it("goToTab desapila y vuelve a la raíz de la pestaña", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("detail-go-inicio"));

    expect(screen.queryByTestId("work-detail")).toBeNull();
    expect(screen.getByTestId("probe-inicio")).toBeVisible();
  });
});

describe("AppShell — CreateEntry", () => {
  it("arranca con el valor por defecto vacío", () => {
    renderShell();

    expect(screen.getByTestId("probe-inicio")).toHaveTextContent(
      "ninguno|ninguna",
    );
  });

  it("tocar Crear apunta la pestaña de origen y una visita nueva", () => {
    renderShell();

    pressTab("crear");

    expect(screen.getByTestId("probe-crear")).toHaveTextContent("inicio|ninguna");
  });

  it("goToTab limpia CreateEntry", () => {
    renderShell();

    pressTab("crear");
    fireEvent.press(screen.getByTestId("go-inicio"));

    expect(screen.getByTestId("probe-inicio")).toHaveTextContent(
      "ninguno|ninguna",
    );
  });
});

describe("AppShell — rama de sesión y puntos de montaje", () => {
  it("pinta la pantalla de entrada sin barra inferior", () => {
    renderShell({ entry: <Text>Pantalla Login</Text> });

    expect(screen.getByText("Pantalla Login")).toBeVisible();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByTestId("bottom-tab-bar")).toBeNull();
  });

  it("recibe los servicios por defecto: en línea y Spotify desconectado", () => {
    renderShell();

    expect(screen.getByTestId("status-inicio")).toHaveTextContent(
      "true|disconnected",
    );
  });

  it("no monta el aviso ni la hoja mientras no tengan contenido", () => {
    renderShell();

    expect(screen.queryByTestId("snackbar-mount")).toBeNull();
    expect(screen.queryByTestId("comment-sheet-mount")).toBeNull();
  });

  it("declara el punto de montaje de la hoja cuando hay opinión abierta", () => {
    const services = createServices();
    renderShell({
      services: {
        ...services,
        comments: {
          ...services.comments,
          state: { opinionId: "op-1", comments: [], status: "loading" },
        },
      },
    });

    expect(screen.getByTestId("comment-sheet-mount")).toBeTruthy();
  });
});

describe("AppShell — acciones globales", () => {
  it("openCreate y openEdit llevan a Crear con su entrada y su pestaña de origen", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-create"));

    expect(screen.getByTestId("tab-panel-crear")).toBeVisible();
    expect(screen.getByTestId("probe-crear")).toHaveTextContent(
      "inicio|ninguna",
    );

    fireEvent.press(screen.getByTestId("go-inicio"));
    fireEvent.press(screen.getByTestId("edit-opinion"));

    expect(screen.getByTestId("tab-panel-crear")).toBeVisible();
    expect(screen.getByTestId("probe-crear")).toHaveTextContent("inicio|op-1");
  });

  it("closeCreate vuelve a la pestaña de origen y limpia la entrada", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-create"));
    fireEvent.press(screen.getByTestId("cancelar"));

    expect(screen.getByTestId("tab-panel-inicio")).toBeVisible();
    expect(screen.queryByTestId("probe-crear")).toBeNull();
    expect(screen.getByTestId("probe-inicio")).toHaveTextContent(
      "ninguno|ninguna",
    );
  });

  it("setHeader cambia la cabecera del detalle y showSnackbar monta el aviso", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-work"));
    fireEvent.press(screen.getByTestId("detail-set-header"));

    expect(screen.getByTestId("app-header")).toHaveTextContent("Otra obra");

    fireEvent.press(screen.getByTestId("detail-snackbar"));

    expect(screen.getByTestId("snackbar-mount")).toBeTruthy();
  });

  it("abre el detalle de opinión en la pestaña que lo registra", () => {
    renderShell();

    pressTab("explorar");
    fireEvent.press(screen.getByTestId("open-opinion-detail"));

    expect(screen.getByTestId("opinion-detail")).toHaveTextContent("op-9");
  });

  it("pedir un detalle que la pestaña no registra no apila nada", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("open-opinion-without-detail"));

    expect(screen.queryByTestId("opinion-detail")).toBeNull();
    expect(screen.getByTestId("probe-inicio")).toBeVisible();
  });
});

describe("AppShell — botón atrás", () => {
  it("desapila una pantalla interna y, en la raíz, deja que la app se cierre", () => {
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
      expect(screen.getByTestId("work-detail")).toBeVisible();

      let handled = false;
      act(() => {
        handled = pressBack();
      });

      expect(handled).toBe(true);
      expect(screen.queryByTestId("work-detail")).toBeNull();

      let atRoot = true;
      act(() => {
        atRoot = pressBack();
      });

      expect(atRoot).toBe(false);
    } finally {
      addSpy.mockRestore();
    }
  });
});
