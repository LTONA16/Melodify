import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { act, render, screen } from "@testing-library/react-native";

import { SESSION_STORAGE_KEY } from "@melodify/app-session";

import { App } from "../App";

const readItem = jest.mocked(SecureStore.getItemAsync);
const deleteItem = jest.mocked(SecureStore.deleteItemAsync);
const hideSplash = jest.mocked(SplashScreen.hideAsync);

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
});
