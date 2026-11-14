import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@melodify/design-system";

import { OfflineBanner, OFFLINE_MESSAGE } from "../OfflineBanner";

/**
 * El aviso de sin conexión de las cuatro pantallas (BR10.5): un solo texto, exacto,
 * y su «Reintentar» enganchado a la resolución de portadas.
 */
function renderBanner(onRetry = jest.fn()) {
  render(
    <ThemeProvider scheme="light">
      <OfflineBanner onRetry={onRetry} />
    </ThemeProvider>,
  );

  return onRetry;
}

describe("OfflineBanner", () => {
  it("pinta el texto único de sin conexión", () => {
    renderBanner();

    expect(screen.getByText(OFFLINE_MESSAGE)).toBeVisible();
    expect(OFFLINE_MESSAGE).toBe(
      "Sin conexión. Estás viendo lo último que cargamos.",
    );
  });

  it("se anuncia como alerta, no solo por color", () => {
    renderBanner();

    expect(screen.getByTestId("banner").props.accessibilityRole).toBe("alert");
  });

  it("tocar «Reintentar» pide reintentar las portadas", () => {
    const onRetry = renderBanner();

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("la acción se llama «Reintentar», como el resto de los errores", () => {
    renderBanner();

    expect(screen.getByTestId("banner-action")).toHaveTextContent("Reintentar");
  });
});
