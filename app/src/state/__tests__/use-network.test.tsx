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
}

function servicesDouble(initialOnline: boolean): NetworkDouble {
  const listeners = new Set<(online: boolean) => void>();
  const unsubscribe = jest.fn();

  const services: ShellServices = {
    network: {
      online: initialOnline,
      subscribe: (listener) => {
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
});
