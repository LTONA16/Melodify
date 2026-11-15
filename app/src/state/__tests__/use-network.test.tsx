import { act, renderHook } from "@testing-library/react-native";
import { ShellServicesContext } from "@melodify/app-shell";
import type { ShellServices } from "@melodify/app-shell";

import { useNetwork } from "../useNetwork";

/**
 * La red de la cáscara (BR6.4): valor inicial del servicio y cada cambio que emite,
 * sin inventarse un estado propio mientras no llega el primero.
 */
interface NetworkDouble {
  services: ShellServices;
  setOnline: (online: boolean) => void;
  unsubscribe: jest.Mock;
  subscribeCalls: () => number;
}

function servicesDouble(initialOnline: boolean): NetworkDouble {
  const listeners = new Set<(online: boolean) => void>();
  const unsubscribe = jest.fn();
  let subscribeCalls = 0;

  const services: ShellServices = {
    network: {
      online: initialOnline,
      subscribe: (listener) => {
        subscribeCalls += 1;
        listeners.add(listener);
        listener(initialOnline);
        return () => {
          listeners.delete(listener);
          unsubscribe();
        };
      },
    },
    spotify: {
      status: "disconnected",
      subscribe: () => () => {},
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
    },
    comments: {
      state: { opinionId: null, comments: [], status: "empty" },
      subscribe: () => () => {},
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  };

  return {
    services,
    setOnline: (online) => {
      for (const listener of [...listeners]) {
        listener(online);
      }
    },
    unsubscribe,
    subscribeCalls: () => subscribeCalls,
  };
}

function renderNetwork(double: NetworkDouble) {
  return renderHook(() => useNetwork(), {
    wrapper: ({ children }) => (
      <ShellServicesContext.Provider value={double.services}>
        {children}
      </ShellServicesContext.Provider>
    ),
  });
}

describe("useNetwork", () => {
  it("arranca con el valor que ya trae el servicio", () => {
    const double = servicesDouble(false);

    const { result } = renderNetwork(double);

    expect(result.current).toBe(false);
  });

  it("sigue los cambios que emite el servicio", () => {
    const double = servicesDouble(true);

    const { result } = renderNetwork(double);

    expect(result.current).toBe(true);

    act(() => {
      double.setOnline(false);
    });

    expect(result.current).toBe(false);
  });

  it("al desmontar deja de escuchar", () => {
    const double = servicesDouble(true);

    const { unmount } = renderNetwork(double);
    unmount();

    expect(double.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("sigue varios cambios seguidos en ambos sentidos", () => {
    const double = servicesDouble(true);

    const { result } = renderNetwork(double);

    act(() => {
      double.setOnline(false);
    });
    expect(result.current).toBe(false);

    act(() => {
      double.setOnline(true);
    });
    expect(result.current).toBe(true);
  });

  it("se suscribe una sola vez: los cambios no acumulan oyentes", () => {
    const double = servicesDouble(true);

    const { result } = renderNetwork(double);

    act(() => {
      double.setOnline(false);
    });
    act(() => {
      double.setOnline(true);
    });

    // Si cada cambio reabriera la suscripción, el doble tendría más de un oyente
    // y este contador lo delataría antes de que la pantalla note nada.
    expect(double.subscribeCalls()).toBe(1);
    expect(result.current).toBe(true);
  });
});
