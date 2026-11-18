import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";
import {
  ShellServicesContext,
  type ShellServices,
  type SpotifyStatus,
} from "@melodify/app-shell";

import { useSpotifyConnection } from "../useSpotifyConnection";

function servicesDouble(): {
  services: ShellServices;
  emit: (status: SpotifyStatus) => void;
  unsubscribe: jest.Mock;
} {
  let listener: ((status: SpotifyStatus) => void) | null = null;
  const unsubscribe = jest.fn();

  const services: ShellServices = {
    network: { online: true, subscribe: () => () => {} },
    spotify: {
      status: "disconnected",
      subscribe: (next) => {
        listener = next;
        return unsubscribe;
      },
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
    },
    comments: {
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: () => () => {},
      open: jest.fn(),
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  };

  return {
    services,
    emit: (status) => listener?.(status),
    unsubscribe,
  };
}

function wrapper(services: ShellServices) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ShellServicesContext.Provider value={services}>
      {children}
    </ShellServicesContext.Provider>
  );
  Wrapper.displayName = "ShellServicesWrapper";
  return Wrapper;
}

describe("useSpotifyConnection", () => {
  it("empieza en null y nunca inventa connecting al hidratar", () => {
    const { services } = servicesDouble();

    const { result } = renderHook(() => useSpotifyConnection(), {
      wrapper: wrapper(services),
    });

    expect(result.current.status).toBeNull();
  });

  it("toma el primer estado que emite la cáscara", () => {
    const { services, emit } = servicesDouble();

    const { result } = renderHook(() => useSpotifyConnection(), {
      wrapper: wrapper(services),
    });

    act(() => {
      emit("connected");
    });

    expect(result.current.status).toBe("connected");
  });

  it("delega conectar, desconectar y reintentar en los servicios", () => {
    const { services } = servicesDouble();
    const { result } = renderHook(() => useSpotifyConnection(), {
      wrapper: wrapper(services),
    });

    act(() => {
      result.current.connect();
      result.current.disconnect();
      result.current.retry();
    });

    expect(services.spotify.connect).toHaveBeenCalledTimes(1);
    expect(services.spotify.disconnect).toHaveBeenCalledTimes(1);
    expect(services.spotify.retry).toHaveBeenCalledTimes(1);
  });

  it("se da de baja al desmontar", () => {
    const { services, unsubscribe } = servicesDouble();

    const { unmount } = renderHook(() => useSpotifyConnection(), {
      wrapper: wrapper(services),
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
