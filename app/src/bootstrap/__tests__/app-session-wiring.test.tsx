import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { SESSION_STORAGE_KEY } from "@melodify/app-session";

import { App } from "../App";
import { appSession } from "../session";

/**
 * Prueba del cableado de la sesión (R-01): solo hay una instancia para toda la app.
 *
 * Si `App` construyera la suya, cerrar sesión por la instancia del punto de
 * composición no devolvería la app a Login y el «Cerrar sesión» de U2 (US1.3)
 * quedaría desconectado. Aquí se monta la app de verdad, se entra por la pantalla
 * de Login y se desconecta por la instancia exportada, que es exactamente lo que
 * hará U2.
 *
 * El doble del almacenamiento es en memoria porque la instancia compartida se crea
 * al importar `../session`: el mapa se vacía en cada caso y las tres puertas del
 * módulo nativo se respaldan con él. Ninguna prueba sale a la red.
 */
const stored = new Map<string, string>();
const readItem = jest.mocked(SecureStore.getItemAsync);
const writeItem = jest.mocked(SecureStore.setItemAsync);
const deleteItem = jest.mocked(SecureStore.deleteItemAsync);

/** Un registro con la forma que fija la especificación funcional. */
const VALID_RECORD = JSON.stringify({
  authorId: "demo",
  startedAt: "2026-11-11T09:00:00.000Z",
});

beforeEach(() => {
  jest.clearAllMocks();
  stored.clear();

  readItem.mockImplementation(async (key) => stored.get(key) ?? null);
  writeItem.mockImplementation(async (key, value) => {
    stored.set(key, value);
  });
  deleteItem.mockImplementation(async (key) => {
    stored.delete(key);
  });
  jest.mocked(SplashScreen.hideAsync).mockResolvedValue(undefined);
});

describe("la sesión de la app", () => {
  it("es una sola instancia: cerrar sesión desde el punto de composición devuelve la app al Login", async () => {
    render(<App />);

    await screen.findByText("Opiniones sobre música");

    fireEvent.changeText(screen.getByTestId("login-handle"), "demo");
    fireEvent.changeText(screen.getByTestId("login-password"), "demo");

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    // Entrar deja la app en Inicio, con la barra inferior y el recuerdo escrito.
    await screen.findByText("Para ti");
    expect(screen.getByTestId("bottom-tab-bar")).toBeTruthy();
    expect(stored.has(SESSION_STORAGE_KEY)).toBe(true);

    // Desconectar por la instancia exportada es lo que hará U2.
    await act(async () => {
      await appSession.signOut();
    });

    // Volver al Login sin navegar a mano es la prueba de que la app escucha esta
    // misma instancia y no una copia construida en `App.tsx`.
    expect(await screen.findByText("Opiniones sobre música")).toBeVisible();
    expect(screen.queryByText("Para ti")).toBeNull();
    expect(screen.queryByTestId("bottom-tab-bar")).toBeNull();
    expect(stored.has(SESSION_STORAGE_KEY)).toBe(false);
  });

  it("al arrancar con sesión recordada, desconectar en la instancia compartida también vuelve al Login", async () => {
    stored.set(SESSION_STORAGE_KEY, VALID_RECORD);

    render(<App />);

    await screen.findByText("Para ti");

    await act(async () => {
      await appSession.signOut();
    });

    expect(await screen.findByText("Opiniones sobre música")).toBeVisible();
    expect(screen.queryByTestId("bottom-tab-bar")).toBeNull();
    expect(deleteItem).toHaveBeenCalledWith(SESSION_STORAGE_KEY);
    expect(stored.has(SESSION_STORAGE_KEY)).toBe(false);
  });
});
