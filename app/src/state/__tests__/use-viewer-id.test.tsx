import { act, renderHook } from "@testing-library/react-native";
import type { AppSession, SessionView } from "@melodify/app-session";

import { useViewerId } from "../useViewerId";

/**
 * Quién mira: la identidad sale de C3 y se refresca con su suscripción. Sin sesión
 * iniciada no hay identidad aunque C3 lleve un `authorId` por defecto, porque sin
 * sesión no hay nadie mirando (BR4.6).
 */
const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: "demo",
  remembered: true,
};

const SIGNED_OUT: SessionView = {
  status: "signedOut",
  authorId: "demo",
  remembered: false,
};

interface SessionDouble {
  session: AppSession;
  resolveRead: (view: SessionView) => void;
  emit: (view: SessionView) => void;
  unsubscribe: jest.Mock;
}

function sessionDouble(): SessionDouble {
  const listeners = new Set<(view: SessionView) => void>();
  const unsubscribe = jest.fn();
  let resolveRead: (view: SessionView) => void = () => {};

  const read = new Promise<{ code: 200; session: SessionView }>((resolve) => {
    resolveRead = (view) => resolve({ code: 200, session: view });
  });

  const session = {
    getSession: jest.fn(() => read),
    signIn: jest.fn(),
    signOut: jest.fn(),
    subscribeSession: jest.fn((listener: (view: SessionView) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        unsubscribe();
      };
    }),
  } as unknown as AppSession;

  return {
    session,
    resolveRead: (view) => resolveRead(view),
    emit: (view) => {
      for (const listener of [...listeners]) {
        listener(view);
      }
    },
    unsubscribe,
  };
}

describe("useViewerId", () => {
  it("no tiene identidad hasta que la lectura de la sesión termina", async () => {
    const double = sessionDouble();

    const { result } = renderHook(() => useViewerId(double.session));

    expect(result.current).toBeNull();

    await act(async () => {
      double.resolveRead(SIGNED_IN);
    });

    expect(result.current).toBe("demo");
  });

  it("sin sesión iniciada no hay identidad", async () => {
    const double = sessionDouble();

    const { result } = renderHook(() => useViewerId(double.session));

    await act(async () => {
      double.resolveRead(SIGNED_OUT);
    });

    expect(result.current).toBeNull();
  });

  it("sigue los cambios de sesión sin volver a leerla", () => {
    const double = sessionDouble();

    const { result } = renderHook(() => useViewerId(double.session));

    act(() => {
      double.emit(SIGNED_IN);
    });

    expect(result.current).toBe("demo");

    act(() => {
      double.emit(SIGNED_OUT);
    });

    expect(result.current).toBeNull();
    expect(double.session.getSession).toHaveBeenCalledTimes(1);
  });

  it("al desmontar deja de escuchar la sesión", () => {
    const double = sessionDouble();

    const { unmount } = renderHook(() => useViewerId(double.session));
    unmount();

    expect(double.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("se suscribe una sola vez aunque la pantalla se vuelva a pintar", () => {
    const double = sessionDouble();

    const { rerender } = renderHook(() => useViewerId(double.session));
    rerender({});
    rerender({});

    // Una suscripción por montaje: si cada repintado abriera otra, C3 acumularía
    // oyentes y la identidad se recalcularía tantas veces como pinturas.
    expect(double.session.subscribeSession).toHaveBeenCalledTimes(1);
  });

  it("se suscribe antes de pedir la lectura, para no perder un cambio intermedio", () => {
    const order: string[] = [];
    const double = sessionDouble();
    const getSession = double.session.getSession as jest.Mock;
    const subscribeSession = double.session.subscribeSession as jest.Mock;

    subscribeSession.mockImplementationOnce(() => {
      order.push("subscribe");
      return () => {};
    });
    getSession.mockImplementationOnce(() => {
      order.push("read");
      return new Promise(() => {});
    });

    renderHook(() => useViewerId(double.session));

    expect(order).toEqual(["subscribe", "read"]);
  });
});
