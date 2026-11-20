import { act, renderHook } from "@testing-library/react-native";
import type {
  ActivityFeed,
  ActivityGroupView,
  ActivityView,
} from "@melodify/activity";

import type { AppLogger } from "../../bootstrap/logger";
import { useActividad } from "../useActividad";

/**
 * Doble de C8 con emisión manual (paso 15). Las pruebas no construyen la máquina:
 * verifican que el hook traduce cada vista y que el registro de error va una vez
 * por intento, aunque C8 emita varias vistas de error seguidas.
 */
const READY_GROUPS: ActivityGroupView[] = [
  {
    day: "today",
    label: "Hoy",
    events: [
      {
        eventId: "comment:cm-002",
        kind: "commentReceived",
        opinionId: "op-004",
        workTitle: "Blinding Lights",
        createdAt: "2026-11-19T10:00:00.000Z",
        actorHandle: "bruno",
      },
    ],
  },
];

const LOADING: ActivityView = { status: "loading", groups: [] };
const ERROR: ActivityView = { status: "error", groups: [] };
const EMPTY: ActivityView = { status: "empty", groups: [] };

interface FeedDouble {
  feed: ActivityFeed;
  subscribed: jest.Mock;
  unsubscribe: jest.Mock;
  retry: jest.Mock;
  emit: (view: ActivityView) => void;
}

function feedDouble(initial?: ActivityView): FeedDouble {
  const listeners: ((view: ActivityView) => void)[] = [];
  const unsubscribe = jest.fn();
  const subscribed = jest.fn();
  const retry = jest.fn(() => {
    emit(LOADING);
  });

  const feed = {
    getActivity: jest.fn(() => LOADING),
    retryActivity: retry,
    subscribeActivity: jest.fn((listener: (view: ActivityView) => void) => {
      subscribed();
      listeners.push(listener);
      if (initial !== undefined) {
        listener(initial);
      }
      return unsubscribe;
    }),
  } as unknown as ActivityFeed;

  function emit(view: ActivityView): void {
    for (const listener of [...listeners]) {
      listener(view);
    }
  }

  return { feed, subscribed, unsubscribe, retry, emit };
}

function silentLogger(): AppLogger & { error: jest.Mock } {
  return { warn: jest.fn(), error: jest.fn() };
}

describe("useActividad", () => {
  it("queda en carga si C8 todavía no emite", () => {
    const double = feedDouble();

    const { result } = renderHook(() => useActividad(double.feed));

    expect(double.subscribed).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("loading");
    expect(result.current.groups).toEqual([]);
  });

  it("entrega los grupos de una vista ready sin tocarlos", () => {
    const double = feedDouble();

    const { result } = renderHook(() => useActividad(double.feed));

    act(() => {
      double.emit({ status: "ready", groups: READY_GROUPS });
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.groups).toBe(READY_GROUPS);
  });

  it("entrega el vacío sin inventar un error", () => {
    const log = silentLogger();
    const double = feedDouble();

    const { result } = renderHook(() => useActividad(double.feed, log));

    act(() => {
      double.emit(EMPTY);
    });

    expect(result.current.status).toBe("empty");
    expect(result.current.groups).toEqual([]);
    expect(log.error).not.toHaveBeenCalled();
  });

  it("registra ACTIVITY_LOAD_FAILED una vez por intento fallido", () => {
    const log = silentLogger();
    const double = feedDouble();

    const { result } = renderHook(() => useActividad(double.feed, log));

    act(() => {
      double.emit(ERROR);
    });
    act(() => {
      double.emit(ERROR);
    });

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenCalledWith(
      "ACTIVITY_LOAD_FAILED",
      "No se pudo derivar la actividad",
    );
  });

  it("«Reintentar» pasa por carga y rearma el registro del error", () => {
    const log = silentLogger();
    const double = feedDouble(ERROR);

    const { result } = renderHook(() => useActividad(double.feed, log));
    expect(log.error).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.retry();
    });
    expect(double.retry).toHaveBeenCalledTimes(1);

    act(() => {
      double.emit(ERROR);
    });
    expect(log.error).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("error");
  });

  it("al desmontar deja la suscripción e ignora emisiones tardías", () => {
    const double = feedDouble();

    const { result, unmount } = renderHook(() => useActividad(double.feed));
    unmount();

    expect(double.unsubscribe).toHaveBeenCalledTimes(1);

    act(() => {
      double.emit({ status: "ready", groups: READY_GROUPS });
    });
    expect(result.current.status).toBe("loading");
    expect(result.current.groups).toEqual([]);
  });
});
