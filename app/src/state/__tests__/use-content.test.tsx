import { act, renderHook } from "@testing-library/react-native";
import { createContentStore } from "@melodify/content-store";
import type {
  ContentResult,
  ContentSnapshot,
  ContentStore,
  OpinionView,
} from "@melodify/content-store";

import { useContent } from "../useContent";
import type { AppLogger } from "../../bootstrap/logger";

/**
 * La suscripción de C4 traducida a los tres estados de las vistas (NFR8.4). El
 * almacén real emite de forma síncrona al suscribirse, así que el paso de `loading`
 * a `ready` se ve sin avanzar temporizadores; los dobles solo existen para los casos
 * que el almacén real no produce —no emitir, fallar, lanzar—.
 */
const DEMO = "demo";

function silentLogger(): AppLogger & { error: jest.Mock } {
  return { warn: jest.fn(), error: jest.fn() };
}

interface StoreDouble {
  store: ContentStore;
  subscribed: jest.Mock;
  unsubscribe: jest.Mock;
  emit: (snapshot: ContentSnapshot) => void;
}

/**
 * Un almacén de doble con emisión manual: guarda al oyente y deja dispararlo desde
 * la prueba. `result` permite devolver el `422` del contrato o lanzar.
 */
function storeDouble(
  options: {
    result?: ContentResult<() => void>;
    throws?: boolean;
  } = {},
): StoreDouble {
  const listeners: ((snapshot: ContentSnapshot) => void)[] = [];
  const unsubscribe = jest.fn();
  const subscribed = jest.fn();

  const store = {
    subscribeContent: jest.fn(
      (_viewerId: string | null | undefined, listener: (snapshot: ContentSnapshot) => void) => {
        subscribed();
        if (options.throws === true) {
          throw new Error("el almacén lanzó");
        }
        if (options.result !== undefined) {
          return options.result;
        }
        listeners.push(listener);
        return { ok: true, code: 200, value: unsubscribe };
      },
    ),
  } as unknown as ContentStore;

  return {
    store,
    subscribed,
    unsubscribe,
    emit: (snapshot) => {
      for (const listener of [...listeners]) {
        listener(snapshot);
      }
    },
  };
}

function opinionFixture(): OpinionView {
  return {
    opinionId: "op-1",
    workId: "work-1",
    workTitle: "Cielo de Neón",
    workArtist: "Aurora Vega",
    author: {
      authorId: DEMO,
      displayName: "Usuario demo",
      handle: "demo",
      followedByMe: false,
    },
    text: "Un disco que se escucha entero.",
    rating: 4,
    createdAt: "2026-11-04T10:00:00.000Z",
    updatedAt: "2026-11-04T10:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: true,
  };
}

describe("useContent", () => {
  it("queda listo con la primera emisión del almacén, sin temporizadores", () => {
    const store = createContentStore();

    const { result } = renderHook(() => useContent(DEMO, store));

    expect(result.current.status).toBe("ready");
    expect(result.current.opinions).toHaveLength(10);
    expect(result.current.revision).toBe(0);
  });

  it("sigue cargando mientras el almacén no emite", () => {
    const double = storeDouble();

    const { result } = renderHook(() => useContent(DEMO, double.store));

    expect(double.subscribed).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("loading");
    expect(result.current.opinions).toEqual([]);
  });

  it("sin viewerId no se suscribe y no inventa un error", () => {
    const double = storeDouble();

    const { result } = renderHook(() => useContent(null, double.store));

    expect(double.subscribed).not.toHaveBeenCalled();
    expect(result.current.status).toBe("loading");
  });

  it("«Reintentar» vuelve a suscribirse y pasa otra vez por carga", () => {
    const double = storeDouble();

    const { result } = renderHook(() => useContent(DEMO, double.store));
    expect(result.current.status).toBe("loading");

    act(() => {
      result.current.retry();
    });

    expect(double.subscribed).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("loading");
  });

  it("un cambio del almacén actualiza opiniones y revisión", () => {
    const store = createContentStore();

    const { result } = renderHook(() => useContent(DEMO, store));

    act(() => {
      store.createOpinion({
        authorId: "lucia",
        workId: "work-9",
        workTitle: "Otra obra",
        workArtist: "Otra artista",
        text: "Una opinión más para el feed.",
        rating: 4,
      });
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.opinions).toHaveLength(11);
    expect(result.current.revision).toBe(1);
  });

  it("un fallo del contrato deja error y registra CONTENT_SUBSCRIBE_FAILED", () => {
    const log = silentLogger();
    const double = storeDouble({
      result: { ok: false, code: 422, message: "Falta quien mira." },
    });

    const { result } = renderHook(() => useContent(DEMO, double.store, log));

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_SUBSCRIBE_FAILED",
      "Falta quien mira.",
    );
  });

  it("una suscripción que lanza deja error y registra el código", () => {
    const log = silentLogger();
    const double = storeDouble({ throws: true });

    const { result } = renderHook(() => useContent(DEMO, double.store, log));

    expect(result.current.status).toBe("error");
    expect(log.error).toHaveBeenCalledWith(
      "CONTENT_SUBSCRIBE_FAILED",
      expect.any(String),
    );
  });

  it("al desmontar deja la suscripción", () => {
    const double = storeDouble();

    const { unmount } = renderHook(() => useContent(DEMO, double.store));
    unmount();

    expect(double.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("deja de pintar emisiones llegadas después de desmontar el doble", () => {
    const double = storeDouble();

    const { result, unmount } = renderHook(() =>
      useContent(DEMO, double.store),
    );

    unmount();
    double.emit({ revision: 3, opinions: [opinionFixture()] });

    expect(result.current.status).toBe("loading");
    expect(result.current.opinions).toEqual([]);
  });
});
