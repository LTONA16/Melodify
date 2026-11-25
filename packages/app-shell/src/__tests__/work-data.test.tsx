import { fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";
import type { WorkView } from "@melodify/catalog";

import { AppShell } from "../AppShell";
import { useCreateEntry, useGlobalServices } from "../contexts";
import type { ScreenModule, ShellServices } from "../types";

const WORK: WorkView = {
  workId: "track1",
  title: "Cielo de neón",
  artist: "Luna",
  coverUrl: "https://img/cielo.jpg",
  origin: "spotify",
  workKind: "track",
};

function RootScreen() {
  const global = useGlobalServices();

  return (
    <Pressable
      testID="open-work-with-data"
      onPress={() => global.openWorkDetail({ workId: WORK.workId, data: WORK })}
    >
      <Text>Abrir obra con datos</Text>
    </Pressable>
  );
}

function WorkDetail({
  work,
}: {
  work: { workId: string; data?: WorkView };
}) {
  const global = useGlobalServices();

  return (
    <View>
      <Text testID="route-work-id">{work.workId}</Text>
      <Text testID="route-work-title">{work.data?.title ?? "sin datos"}</Text>
      <Text testID="route-work-kind">{work.data?.workKind ?? "sin kind"}</Text>
      <Pressable
        testID="open-create-with-data"
        onPress={() => global.openCreate({ workId: work.workId, data: work.data })}
      >
        <Text>Crear con datos</Text>
      </Pressable>
    </View>
  );
}

function CreateProbe() {
  const entry = useCreateEntry();

  return (
    <View>
      <Text testID="create-work-title">
        {entry.preselectedWork?.title ?? "sin obra"}
      </Text>
      <Text testID="create-work-id">{entry.preselectedWorkId ?? "sin id"}</Text>
      <Text testID="create-work-kind">
        {entry.preselectedWork?.workKind ?? "sin kind"}
      </Text>
    </View>
  );
}

const SCREENS: ScreenModule[] = [
  {
    name: "inicio",
    title: "Inicio",
    component: RootScreen,
    details: [{ kind: "work", component: WorkDetail }],
  },
  { name: "crear", title: "Crear", component: CreateProbe },
];

function createServices(): ShellServices {
  const unsubscribe = () => {};

  return {
    network: { online: true, subscribe: () => unsubscribe },
    spotify: {
      status: "disconnected",
      subscribe: () => unsubscribe,
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
      subscribe: () => unsubscribe,
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  };
}

describe("AppShell — la WorkView viaja con la ruta (C2 1.4.0)", () => {
  it("conserva la obra resuelta al abrir el detalle", () => {
    render(
      <ThemeProvider scheme="light">
        <AppShell
          screens={SCREENS}
          initialRoute="inicio"
          services={createServices()}
        />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByTestId("open-work-with-data"));

    expect(screen.getByTestId("route-work-id")).toHaveTextContent("track1");
    expect(screen.getByTestId("route-work-title")).toHaveTextContent(
      "Cielo de neón",
    );
    expect(screen.getByTestId("route-work-kind")).toHaveTextContent("track");
  });

  it("la obra completa llega a Crear sin volver a resolverla", () => {
    render(
      <ThemeProvider scheme="light">
        <AppShell
          screens={SCREENS}
          initialRoute="inicio"
          services={createServices()}
        />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByTestId("open-work-with-data"));
    fireEvent.press(screen.getByTestId("open-create-with-data"));

    expect(screen.getByTestId("create-work-title")).toHaveTextContent(
      "Cielo de neón",
    );
    expect(screen.getByTestId("create-work-id")).toHaveTextContent("track1");
    expect(screen.getByTestId("create-work-kind")).toHaveTextContent("track");
  });
});
