import { fireEvent, render, screen } from "@testing-library/react-native";

import { ConnectionCard } from "../components/ConnectionCard";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La invitación a conectar de C1 1.3.0: título, explicación y una acción que la
 * pantalla decide. La pieza no sabe qué es Spotify y por eso la acción puede
 * seguir sin efecto hasta U4 sin cambiarla (BR11.9).
 */
function renderCard(
  props: Partial<Parameters<typeof ConnectionCard>[0]> = {},
) {
  const onAction = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <ConnectionCard
        title="Escucha más allá"
        body="Conecta Spotify para buscar en el catálogo completo."
        actionLabel="Conectar con Spotify"
        onAction={onAction}
        {...props}
      />
    </ThemeProvider>,
  );

  return onAction;
}

describe("ConnectionCard", () => {
  it("pinta el título, el cuerpo y la etiqueta de la acción", () => {
    renderCard();

    expect(screen.getByTestId("connection-card-title")).toHaveTextContent(
      "Escucha más allá",
    );
    expect(screen.getByTestId("connection-card-body")).toHaveTextContent(
      "Conecta Spotify para buscar en el catálogo completo.",
    );
    expect(screen.getByTestId("connection-card-action")).toHaveTextContent(
      "Conectar con Spotify",
    );
  });

  it("la acción avisa a quien la monta", () => {
    const onAction = renderCard();

    fireEvent.press(screen.getByTestId("connection-card-action"));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("sin acción solo informa: no pinta un botón que no haría nada", () => {
    renderCard({ actionLabel: undefined, onAction: undefined });

    expect(screen.getByTestId("connection-card-title")).toBeVisible();
    expect(screen.queryByTestId("connection-card-action")).toBeNull();
  });

  it("una etiqueta sin callback pinta el botón y pulsarlo no rompe nada", () => {
    renderCard({ onAction: undefined });

    fireEvent.press(screen.getByTestId("connection-card-action"));

    expect(screen.getByTestId("connection-card-action")).toBeVisible();
  });
});
