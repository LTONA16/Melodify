import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";

import { SESSION_STORAGE_KEY } from "@melodify/app-session";

import { App } from "../App";

/**
 * `expo-network` se dobla con un oyente que la prueba puede mover: la app monta la
 * conectividad de verdad, y el aviso de sin conexión solo se puede comprobar si el
 * adaptador emite. Empieza en línea, como el doble del arnés (NFR4.5).
 */
jest.mock("expo-network", () => {
  const listeners = new Set();

  return {
    __listeners: listeners,
    getNetworkStateAsync: jest.fn(async () => ({
      isConnected: true,
      isInternetReachable: true,
      type: "WIFI",
    })),
    addNetworkStateListener: jest.fn((listener: unknown) => {
      listeners.add(listener);
      return {
        remove: () => {
          listeners.delete(listener);
        },
      };
    }),
  };
});

const readItem = jest.mocked(SecureStore.getItemAsync);
const deleteItem = jest.mocked(SecureStore.deleteItemAsync);
const hideSplash = jest.mocked(SplashScreen.hideAsync);

const networkMock = jest.requireMock("expo-network") as unknown as {
  __listeners: Set<
    (state: {
      isConnected: boolean;
      isInternetReachable: boolean | null;
      type: string;
    }) => void
  >;
};

const OFFLINE = "Sin conexión. Estás viendo lo último que cargamos.";

/**
 * Mueve la red como lo haría el sistema operativo. La conectividad de la app es una
 * sola instancia para todo el archivo, así que cada prueba la deja como la encontró.
 */
function setOnline(online: boolean): void {
  for (const listener of [...networkMock.__listeners]) {
    listener({
      isConnected: online,
      isInternetReachable: online,
      type: online ? "WIFI" : "NONE",
    });
  }
}

/** Un registro con la forma que fija la especificación funcional. */
const VALID_RECORD = JSON.stringify({
  authorId: "demo",
  startedAt: "2026-11-11T09:00:00.000Z",
});

const SAVE_ERROR = "No pudimos guardar tu sesión. Inténtalo de nuevo.";

beforeEach(() => {
  jest.clearAllMocks();
  readItem.mockResolvedValue(null);
  hideSplash.mockResolvedValue(undefined);
});

afterEach(() => {
  setOnline(true);
});

describe("arranque de la app", () => {
  it("con una sesión recordada válida arranca en Inicio con Inicio como pestaña activa", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");

    expect(
      screen.getByTestId("tab-inicio").props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(screen.queryByText("Opiniones sobre música")).toBeNull();
    expect(hideSplash).toHaveBeenCalled();
  });

  it("con el almacenamiento vacío abre Login, sin barra inferior ni aviso", async () => {
    render(<App />);

    await screen.findByText("Opiniones sobre música");

    expect(screen.queryByTestId("bottom-tab-bar")).toBeNull();
    expect(screen.queryByText(SAVE_ERROR)).toBeNull();
    expect(hideSplash).toHaveBeenCalled();
  });

  it("con un registro inválido abre Login, lo borra y no avisa", async () => {
    readItem.mockResolvedValue(
      JSON.stringify({ authorId: "otra-persona", startedAt: "ayer" }),
    );

    render(<App />);

    await screen.findByText("Opiniones sobre música");

    expect(deleteItem).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(screen.queryByText(SAVE_ERROR)).toBeNull();
    expect(hideSplash).toHaveBeenCalled();
  });

  it("si la lectura falla con 503 abre Login sin aviso ni reintento", async () => {
    readItem.mockRejectedValue(new Error("el almacenamiento no responde"));

    render(<App />);

    await screen.findByText("Opiniones sobre música");

    expect(screen.queryByText(SAVE_ERROR)).toBeNull();
    expect(screen.queryByText("Reintentar")).toBeNull();
    expect(hideSplash).toHaveBeenCalled();
  });

  it("mientras el arranque no termina no pinta Login ni Inicio, y el splash sigue visible", async () => {
    let resolveRead: (value: string | null) => void = () => {};
    readItem.mockImplementation(
      () =>
        new Promise<string | null>((resolve) => {
          resolveRead = resolve;
        }),
    );

    render(<App />);

    expect(screen.queryByText("Melodify")).toBeNull();
    expect(screen.queryByText("Para ti")).toBeNull();
    expect(hideSplash).not.toHaveBeenCalled();

    await act(async () => {
      resolveRead(null);
    });

    await screen.findByText("Opiniones sobre música");
    expect(hideSplash).toHaveBeenCalledTimes(1);
  });

  it("con sesión válida la barra muestra los cinco destinos en orden", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");

    expect(screen.getByTestId("tab-label-inicio")).toHaveTextContent("Inicio");
    expect(screen.getByTestId("tab-label-explorar")).toHaveTextContent(
      "Explorar",
    );
    expect(screen.getByTestId("tab-label-crear")).toHaveTextContent("Crear");
    expect(screen.getByTestId("tab-label-actividad")).toHaveTextContent(
      "Actividad",
    );
    expect(screen.getByTestId("tab-label-perfil")).toHaveTextContent("Perfil");
  });

  it("con sesión válida Inicio pinta las diez tarjetas de la siembra", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");

    expect(await screen.findAllByTestId(/^opinion-card-/)).toHaveLength(10);
    expect(screen.getByTestId("opinion-card-op-001")).toBeVisible();
  });

  it("abrir una opinión deja la raíz montada y «‹ Volver» devuelve al feed", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");
    fireEvent.press(await screen.findByTestId("opinion-card-op-001"));

    expect(await screen.findByTestId("detalle-opinion")).toBeVisible();
    // AC2.3.2: el feed sigue montado debajo (oculto, no desmontado), así que volver
    // no lo recarga.
    expect(
      screen.getByText("Para ti", { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(screen.getByTestId("header-back")).toBeVisible();

    fireEvent.press(screen.getByTestId("header-back"));

    expect(screen.queryByTestId("detalle-opinion")).toBeNull();
    expect(screen.getByText("Para ti")).toBeVisible();
  });

  it("sin conexión el aviso aparece en Inicio, en el detalle y en Perfil", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");

    act(() => {
      setOnline(false);
    });

    const inicio = screen.getByTestId("tab-panel-inicio");
    expect(await within(inicio).findByText(OFFLINE)).toBeVisible();

    fireEvent.press(await screen.findByTestId("opinion-card-op-001"));
    const detalle = await screen.findByTestId("detalle-opinion");
    expect(within(detalle).getByText(OFFLINE)).toBeVisible();

    fireEvent.press(screen.getByTestId("header-back"));
    fireEvent.press(screen.getByTestId("tab-perfil"));

    await screen.findByTestId("perfil-name");
    expect(
      within(screen.getByTestId("tab-panel-perfil")).getByText(OFFLINE),
    ).toBeVisible();
  });

  it("desde Perfil se abre una opinión propia con «Editar» visible", async () => {
    readItem.mockResolvedValue(VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");
    fireEvent.press(screen.getByTestId("tab-perfil"));

    await screen.findByTestId("perfil-name");
    fireEvent.press(screen.getByTestId("opinion-card-op-004"));

    const detalle = await screen.findByTestId("detalle-opinion");
    expect(detalle).toBeVisible();
    expect(within(detalle).getByTestId("opinion-edit")).toBeVisible();
    expect(within(detalle).getByText("Tu opinión")).toBeVisible();
  });
});
