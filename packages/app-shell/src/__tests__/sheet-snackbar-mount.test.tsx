import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import { ThemeProvider } from "@melodify/design-system";

import { AppShell } from "../AppShell";
import { useGlobalServices } from "../contexts";
import type {
  CommentSheetState,
  ScreenModule,
  ShellServices,
} from "../types";

/**
 * Los dos montajes reales de C2 1.3.0: la hoja se pinta desde
 * `services.comments` y el aviso desde `showSnackbar`. Con la hoja abierta el aviso
 * viaja **dentro** del modal —un `Snackbar` fuera quedaría detrás del velo
 * (NFR8.10)—, desaparece a los 4 s y cualquier cambio de pestaña lo limpia.
 */
const CLOSED: CommentSheetState = {
  opinionId: null,
  comments: [],
  status: "empty",
  failed: false,
  maxLength: 300,
  counterFrom: 250,
};

/**
 * Un controlador de mentira con estado movible: la cáscara lo lee con
 * `useSyncExternalStore`, así que la prueba necesita poder empujar estados nuevos
 * como lo haría el controlador real.
 */
function createCommentsDouble() {
  let state: CommentSheetState = CLOSED;
  const listeners = new Set<(state: CommentSheetState) => void>();

  return {
    get state() {
      return state;
    },
    subscribe(listener: (state: CommentSheetState) => void) {
      listeners.add(listener);
      listener(state);

      return () => {
        listeners.delete(listener);
      };
    },
    open: jest.fn(),
    close: jest.fn(),
    retry: jest.fn(),
    submit: jest.fn(() => true),
    /** Lo que el controlador real publica al abrir la hoja. */
    emit(next: CommentSheetState) {
      state = next;
      for (const listener of [...listeners]) {
        listener(state);
      }
    },
  };
}

function Home() {
  const global = useGlobalServices();

  return (
    <View>
      <Text>Pantalla Inicio</Text>
      <Pressable
        testID="show-snackbar"
        onPress={() => global.showSnackbar({ message: "Opinión publicada" })}
      >
        <Text>Avisar</Text>
      </Pressable>
    </View>
  );
}

const SCREENS: ScreenModule[] = [
  { name: "inicio", title: "Inicio", component: Home },
  { name: "perfil", title: "Perfil", component: () => <Text>Pantalla Perfil</Text> },
];

function createServices(comments: ReturnType<typeof createCommentsDouble>) {
  const noopUnsubscribe = () => {};

  const services: ShellServices = {
    network: { online: true, subscribe: () => noopUnsubscribe },
    spotify: {
      status: "disconnected",
      subscribe: () => noopUnsubscribe,
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
    },
    comments,
  };

  return services;
}

function renderShell(comments = createCommentsDouble()) {
  render(
    <ThemeProvider scheme="light">
      <AppShell
        screens={SCREENS}
        initialRoute="inicio"
        services={createServices(comments)}
      />
    </ThemeProvider>,
  );

  return comments;
}

describe("AppShell — montaje de la hoja de comentarios", () => {
  it("cerrada no se monta", () => {
    renderShell();

    expect(screen.queryByTestId("comment-sheet")).toBeNull();
  });

  it("se monta cuando el controlador abre una opinión y trae su estado", () => {
    const comments = renderShell();

    act(() => {
      comments.emit({
        ...CLOSED,
        opinionId: "op-4",
        status: "empty",
      });
    });

    expect(screen.getByTestId("comment-sheet")).toBeTruthy();
    expect(screen.getByTestId("comment-sheet-empty")).toHaveTextContent(
      "Sé el primero en comentar",
    );
  });

  it("enviar avisa al controlador y pide «Comentario publicado» al salir bien", () => {
    const comments = renderShell();

    act(() => {
      comments.emit({ ...CLOSED, opinionId: "op-4", status: "empty" });
    });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "Qué temazo",
    );
    fireEvent.press(screen.getByTestId("comment-sheet-send"));

    expect(comments.submit).toHaveBeenCalledWith("Qué temazo");
    expect(screen.getByTestId("snackbar-message")).toHaveTextContent(
      "Comentario publicado",
    );
  });

  it("el ✕ pide cerrar al controlador", () => {
    const comments = renderShell();

    act(() => {
      comments.emit({ ...CLOSED, opinionId: "op-4", status: "empty" });
    });

    fireEvent.press(screen.getByTestId("comment-sheet-close"));

    expect(comments.close).toHaveBeenCalledTimes(1);
  });
});

describe("AppShell — el aviso", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("se pinta fuera de la hoja y se va a los 4 s", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("show-snackbar"));

    expect(screen.getByTestId("snackbar-message")).toHaveTextContent(
      "Opinión publicada",
    );

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByTestId("snackbar")).toBeNull();
  });

  it("cambiar de pestaña limpia el aviso antes de tiempo", () => {
    renderShell();

    fireEvent.press(screen.getByTestId("show-snackbar"));
    fireEvent.press(screen.getByTestId("tab-perfil"));

    expect(screen.queryByTestId("snackbar")).toBeNull();
  });

  it("con la hoja abierta, el aviso se pinta dentro del modal", () => {
    const comments = renderShell();

    act(() => {
      comments.emit({ ...CLOSED, opinionId: "op-4", status: "empty" });
    });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "Otra opinión",
    );
    fireEvent.press(screen.getByTestId("comment-sheet-send"));

    // El aviso está dentro de la hoja, no en la capa de la app que el `Modal`
    // tapa: si estuviera fuera, esta consulta no lo encontraría.
    const sheet = screen.getByTestId("comment-sheet");

    expect(within(sheet).getByTestId("snackbar-message")).toHaveTextContent(
      "Comentario publicado",
    );
  });
});
