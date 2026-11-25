/**
 * El adaptador de `expo-network` (paso 12 del plan, NFR4.5).
 *
 * `expo-network` se sustituye entero: ninguna prueba toca el sistema operativo ni
 * pide permiso de red. Lo que se afirma es la traducción —un solo booleano— y que
 * del estado del sistema no se lee nada más: ni el tipo de red, ni el SSID, ni la
 * IP (NFR4.5). La baja de la suscripción también se comprueba, porque el contrato
 * de C6 promete una función de baja aunque el módulo no colabore.
 */
import { expoNetworkAdapter } from "../expo-network-adapter";

const mockGetNetworkStateAsync = jest.fn();
const mockAddNetworkStateListener = jest.fn();

jest.mock("expo-network", () => ({
  getNetworkStateAsync: () => mockGetNetworkStateAsync(),
  addNetworkStateListener: (listener: (state: unknown) => void) =>
    mockAddNetworkStateListener(listener),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("expoNetworkAdapter.getState", () => {
  it("está en línea cuando hay conexión y la accesibilidad no es explícitamente falsa", async () => {
    mockGetNetworkStateAsync.mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: true,
      type: "WIFI",
    });
    await expect(expoNetworkAdapter.getState()).resolves.toEqual({ online: true });

    mockGetNetworkStateAsync.mockResolvedValueOnce({
      isConnected: true,
      isInternetReachable: undefined,
    });
    await expect(expoNetworkAdapter.getState()).resolves.toEqual({ online: true });
  });

  it("no está en línea cuando el sistema dice que no hay conexión", async () => {
    mockGetNetworkStateAsync.mockResolvedValueOnce({
      isConnected: false,
      isInternetReachable: true,
    });
    await expect(expoNetworkAdapter.getState()).resolves.toEqual({ online: false });

    mockGetNetworkStateAsync.mockResolvedValueOnce({
      isConnected: undefined,
      isInternetReachable: true,
    });
    await expect(expoNetworkAdapter.getState()).resolves.toEqual({ online: false });
  });

  it("solo lee `isConnected` e `isInternetReachable`, nunca el tipo de red ni el SSID", async () => {
    const state: Record<string, unknown> = {
      isConnected: true,
      isInternetReachable: true,
    };
    for (const field of ["type", "ssid", "isWifiEnabled"]) {
      Object.defineProperty(state, field, {
        enumerable: true,
        get() {
          throw new Error(`El adaptador no debe leer ${field}.`);
        },
      });
    }
    mockGetNetworkStateAsync.mockResolvedValueOnce(state);

    await expect(expoNetworkAdapter.getState()).resolves.toEqual({ online: true });
  });
});

describe("expoNetworkAdapter.addListener", () => {
  it("traduce cada aviso del sistema y su baja llama a `remove`", () => {
    const remove = jest.fn();
    mockAddNetworkStateListener.mockReturnValueOnce({ remove });
    const listener = jest.fn();

    const unsubscribe = expoNetworkAdapter.addListener(listener);

    const registered = mockAddNetworkStateListener.mock.calls[0]?.[0];
    if (registered === undefined) {
      throw new Error("El adaptador no registró ningún oyente.");
    }
    registered({ isConnected: false, isInternetReachable: true });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ online: false });

    unsubscribe();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
