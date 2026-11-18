import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { fireEvent, render, screen, within } from "@testing-library/react-native";

import { SESSION_STORAGE_KEY } from "@melodify/app-session";

import { App } from "../App";

/**
 * La integración que solo aparece cuando se monta el arranque entero: los puertos
 * reales de C5 alimentados por el cliente de Spotify, la ruta de detalle de obra que
 * registra Explorar y el chip de Inicio leyendo la misma sesión que Perfil.
 *
 * Los puertos se doblan aquí, no las pantallas: se sustituye la frontera con la red
 * (`../ports`) y se deja que C5, C1 y la cáscara hagan su trabajo. Así la búsqueda
 * recorre el camino real `Explorar → C5 → puerto → detalle` y la obra llega a Crear
 * con su `data`, que es lo que no prueba ninguna prueba de pantalla aislada.
 */
const WORK = {
  workId: "spotify-bad-guy",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
  origin: "spotify",
  workKind: "track",
};

jest.mock("../ports", () => {
  const listeners = new Set();
  const state = { status: "connected" as string };
  const search = jest.fn(async () => ({
    kind: "ok",
    works: [WORK],
    artists: [],
  }));
  const resolve = jest.fn(async () => ({ kind: "failure", failure: "notFound" }));

  const emit = (): void => {
    for (const listener of [...listeners]) {
      (listener as (state: { status: string }) => void)({
        status: state.status,
      });
    }
  };

  return {
    __search: search,
    __setStatus: (status: string) => {
      state.status = status;
      emit();
    },
    __listenerCount: () => listeners.size,
    spotifyAuth: {
      getState: () => ({ status: state.status }),
      subscribe: (listener: (view: { status: string }) => void) => {
        listeners.add(listener);
        listener({ status: state.status });
        return () => {
          listeners.delete(listener);
        };
      },
      connect: jest.fn(async () => {
        state.status = "connected";
        emit();
      }),
      disconnect: jest.fn(async () => {
        state.status = "disconnected";
        emit();
      }),
      retry: jest.fn(async () => {
        state.status = "connected";
        emit();
      }),
    },
    spotifyCatalog: { search, resolve },
    catalogPorts: {
      session: {
        isConnected: () => state.status === "connected",
        onConnectionChange: () => () => undefined,
      },
      search: { search },
      resolve: { resolve },
    },
  };
});

interface PortsDouble {
  __search: jest.Mock;
  __setStatus: (status: string) => void;
  __listenerCount: () => number;
}

const ports = jest.requireMock("../ports") as unknown as PortsDouble;
const readItem = jest.mocked(SecureStore.getItemAsync);

const VALID_RECORD = JSON.stringify({
  authorId: "demo",
  startedAt: "2026-11-11T09:00:00.000Z",
});

beforeEach(() => {
  jest.clearAllMocks();
  ports.__setStatus("connected");
  readItem.mockImplementation(async (key) =>
    key === SESSION_STORAGE_KEY ? VALID_RECORD : null,
  );
  jest.mocked(SplashScreen.hideAsync).mockResolvedValue(undefined);
});

describe("arranque con Spotify conectado", () => {
  it("Explorar busca con el puerto real de C5 y lleva la obra a detalle y a Crear", async () => {
    render(<App />);

    await screen.findByText("Para ti");

    fireEvent.press(screen.getByTestId("tab-explorar"));
    await screen.findByTestId("explorar-view");

    fireEvent.changeText(screen.getByTestId("search-field-input"), "bad");
    fireEvent.press(await screen.findByTestId("work-result-spotify-bad-guy"));

    const detalle = await screen.findByTestId("detalle-obra");
    expect(within(detalle).getByText("Bad Guy")).toBeVisible();
    expect(within(detalle).getByText("Billie Eilish")).toBeVisible();
    expect(ports.__search).toHaveBeenCalledWith("bad");

    fireEvent.press(within(detalle).getByTestId("detalle-obra-create"));

    const crear = await screen.findByTestId("crear-view");
    expect(
      within(crear).getByTestId("work-result-spotify-bad-guy"),
    ).toBeVisible();
    expect(within(crear).getByText("Bad Guy")).toBeVisible();
    // La obra viajó con `data`: no se volvió a pedir al puerto al abrir Crear.
    expect(ports.__search).toHaveBeenCalledTimes(1);
  });

  it("Perfil conecta y desconecta, Inicio actualiza el chip y no se duplican suscripciones", async () => {
    ports.__setStatus("disconnected");

    render(<App />);

    await screen.findByText("Para ti");

    const subscriptionsAtStart = ports.__listenerCount();
    expect(subscriptionsAtStart).toBeGreaterThan(0);
    expect(screen.getByTestId("spotify-chip")).toHaveAccessibleName("Conectar");

    fireEvent.press(screen.getByTestId("spotify-chip"));

    expect(await screen.findByLabelText("Conectado")).toBeVisible();
    expect(ports.__listenerCount()).toBe(subscriptionsAtStart);

    fireEvent.press(screen.getByTestId("tab-perfil"));
    await screen.findByTestId("perfil-name");

    fireEvent.press(screen.getByTestId("spotify-card-disconnect"));

    expect(await screen.findByTestId("spotify-card-connect")).toBeVisible();
    expect(ports.__listenerCount()).toBe(subscriptionsAtStart);

    fireEvent.press(screen.getByTestId("tab-inicio"));
    expect(screen.getByTestId("spotify-chip")).toHaveAccessibleName("Conectar");
  });
});
