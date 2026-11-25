import { fireEvent, render, screen } from "@testing-library/react-native";

import { SpotifyCard } from "../components/SpotifyCard";
import type { SpotifyConnectionStatus } from "../models";
import { ThemeProvider } from "../ThemeProvider";

function renderCard(status: SpotifyConnectionStatus) {
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onRetry = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <SpotifyCard
        status={status}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onRetry={onRetry}
      />
    </ThemeProvider>,
  );

  return { onConnect, onDisconnect, onRetry };
}

describe("SpotifyCard", () => {
  it("sin conectar invita a conectar", () => {
    const { onConnect } = renderCard("disconnected");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "Sin conectar",
    );
    expect(screen.getByTestId("spotify-card-body")).toHaveTextContent(
      "Conecta para ver portadas y buscar en el catálogo completo.",
    );
    fireEvent.press(screen.getByTestId("spotify-card-connect"));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("conectando muestra indicador y botón deshabilitado", () => {
    renderCard("connecting");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "Conectando…",
    );
    expect(screen.getByTestId("spotify-card-connecting")).toBeOnTheScreen();
    expect(screen.getByTestId("spotify-card-connecting-button")).toBeDisabled();
  });

  it("conectado permite desconectar en tono de peligro", () => {
    const { onDisconnect } = renderCard("connected");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "Conectado",
    );
    expect(screen.getByTestId("spotify-card-body")).toHaveTextContent(
      "Conectado con tu cuenta.",
    );
    fireEvent.press(screen.getByTestId("spotify-card-disconnect"));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("un error de conexión ofrece reintentar", () => {
    const { onRetry } = renderCard("connectionError");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "No pudimos conectar con Spotify.",
    );
    fireEvent.press(screen.getByTestId("spotify-card-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("una sesión caducada pide volver a conectar", () => {
    const { onConnect } = renderCard("invalidToken");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "Tu sesión de Spotify caducó. Vuelve a conectar.",
    );
    fireEvent.press(screen.getByTestId("spotify-card-connect"));
    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("una instalación sin client ID lo explica y no ofrece una acción muerta", () => {
    renderCard("notConfigured");

    expect(screen.getByTestId("spotify-card-status")).toHaveTextContent(
      "La conexión con Spotify no está configurada en esta instalación.",
    );
    expect(screen.getByTestId("spotify-card-body")).toHaveTextContent(
      /Falta el client ID de Spotify en esta instalación\./,
    );
    expect(screen.queryByTestId("spotify-card-retry")).toBeNull();
    expect(screen.queryByTestId("spotify-card-connect")).toBeNull();
  });
});
