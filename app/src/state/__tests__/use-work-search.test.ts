import { act, renderHook } from "@testing-library/react-native";
import type { Catalog, SearchResult, WorkView } from "@melodify/catalog";

import type { AppLogger } from "../../bootstrap/logger";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_LENGTH,
  useWorkSearch,
} from "../useWorkSearch";

/**
 * La búsqueda de Crear (BR13.1–BR13.5, NFR9.6): los 2 caracteres, los 400 ms, la
 * cancelación del temporizador anterior, el descarte de respuestas tardías y el
 * registro acotado —un `offline` previsto no se registra; un puerto que falta o que
 * lanza, sí—. Todo con temporizadores falsos: la espera es parte del contrato.
 */
const WORKS: WorkView[] = [
  {
    workId: "work-1",
    title: "Bad Guy",
    artist: "Billie Eilish",
    coverUrl: null,
    origin: "spotify",
  },
];

function loggerDouble(): AppLogger & { warn: jest.Mock; error: jest.Mock } {
  return { warn: jest.fn(), error: jest.fn() };
}

function catalogDouble(
  handler: (query: string) => Promise<SearchResult>,
): { catalog: Catalog; searchWorks: jest.Mock } {
  const searchWorks = jest.fn(handler);

  return {
    catalog: { searchWorks } as unknown as Catalog,
    searchWorks,
  };
}

/** Una promesa que la prueba resuelve cuando quiere, para simular respuestas lentas. */
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });

  return { promise, resolve };
}

function ok(works: WorkView[], artists: SearchResult["artists"] = []): SearchResult {
  return { status: "ok", works, artists };
}

/** Avanza la espera y deja resolver la promesa que la búsqueda tenga en vuelo. */
async function advance(ms: number = SEARCH_DEBOUNCE_MS): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

function renderSearch(options: {
  handler?: (query: string) => Promise<SearchResult>;
  enabled?: boolean;
  includeArtists?: boolean;
  paused?: boolean;
}) {
  const logger = loggerDouble();
  const { catalog, searchWorks } = catalogDouble(
    options.handler ?? (async () => ok(WORKS)),
  );

  const view = renderHook(
    ({ enabled, paused }: { enabled: boolean; paused: boolean }) =>
      useWorkSearch(catalog, enabled, logger, {
        includeArtists: options.includeArtists,
        paused,
      }),
    {
      initialProps: {
        enabled: options.enabled ?? true,
        paused: options.paused ?? false,
      },
    },
  );

  return { ...view, logger, searchWorks };
}

describe("useWorkSearch — disparo y espera", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("arranca en el estado inicial, sin consulta ni resultados", () => {
    const { result } = renderSearch({});

    expect(result.current.query).toBe("");
    expect(result.current.status).toBe("idle");
    expect(result.current.results).toEqual([]);
    expect(result.current.artists).toEqual([]);
  });

  it("con menos de 2 caracteres no pide nada y lo dice", async () => {
    const { result, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("a");
    });

    expect(result.current.status).toBe("short");
    expect(SEARCH_MIN_LENGTH).toBe(2);

    await advance(2000);

    expect(searchWorks).not.toHaveBeenCalled();
    expect(result.current.status).toBe("short");
  });

  it("a los 400 ms pide una sola vez y pinta los resultados", async () => {
    const { result, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("ba");
    });

    expect(result.current.status).toBe("searching");

    await advance(SEARCH_DEBOUNCE_MS - 1);
    expect(searchWorks).not.toHaveBeenCalled();

    await advance(1);

    expect(searchWorks).toHaveBeenCalledTimes(1);
    expect(searchWorks).toHaveBeenCalledWith("ba");
    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(WORKS);
  });

  it("escribir de nuevo cancela el temporizador anterior", async () => {
    const { result, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("ba");
    });
    await advance(200);

    act(() => {
      result.current.setQuery("bad");
    });
    await advance(SEARCH_DEBOUNCE_MS);

    expect(searchWorks).toHaveBeenCalledTimes(1);
    expect(searchWorks).toHaveBeenCalledWith("bad");
  });

  it("un espacio al final no reinicia la espera ni repite la consulta", async () => {
    const { result, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("bad gu");
    });
    await advance(200);

    act(() => {
      result.current.setQuery("bad gu ");
    });
    await advance(SEARCH_DEBOUNCE_MS);

    // La consulta normalizada no cambió: el efecto no se rehízo.
    expect(searchWorks).toHaveBeenCalledTimes(1);
    expect(searchWorks).toHaveBeenCalledWith("bad gu");
  });

  it("una respuesta tardía se descarta y no pisa la de la consulta vigente", async () => {
    const slow = deferred<SearchResult>();
    const newerWorks: WorkView[] = [
      {
        workId: "work-2",
        title: "Happier",
        artist: "Marshmello",
        coverUrl: null,
        origin: "spotify",
      },
    ];

    const { result, searchWorks } = renderSearch({
      handler: (query) =>
        query === "ba" ? slow.promise : Promise.resolve(ok(newerWorks)),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    act(() => {
      result.current.setQuery("bad");
    });
    await advance();

    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(newerWorks);

    // Llega la respuesta vieja: se descarta.
    await act(async () => {
      slow.resolve(ok(WORKS));
      await Promise.resolve();
    });

    expect(searchWorks).toHaveBeenCalledTimes(2);
    expect(result.current.results).toEqual(newerWorks);
  });

  it("sin resultados queda vacía, no en error", async () => {
    const { result } = renderSearch({ handler: async () => ok([]) });

    act(() => {
      result.current.setQuery("xyz");
    });
    await advance();

    expect(result.current.status).toBe("empty");
    expect(result.current.results).toEqual([]);
  });

  it("la respuesta `empty` de C5 también queda vacía", async () => {
    const { result } = renderSearch({
      handler: async () => ({ status: "empty", works: [] }),
    });

    act(() => {
      result.current.setQuery("zz");
    });
    await advance();

    expect(result.current.status).toBe("empty");
  });

  it("«limpiar» vacía el campo, cancela la espera y no pide nada", async () => {
    const { result, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();
    expect(result.current.status).toBe("results");

    act(() => {
      result.current.clear();
    });

    expect(result.current.query).toBe("");
    expect(result.current.status).toBe("idle");
    expect(result.current.results).toEqual([]);

    await advance(2000);

    expect(searchWorks).toHaveBeenCalledTimes(1);
  });
});

describe("useWorkSearch — los dos fallos que se pintan igual", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("`offline` de C5 se pinta como sin conexión y NO se registra", async () => {
    const { result, logger } = renderSearch({
      handler: async () => ({ status: "offline", works: [] }),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("offline");
    expect(result.current.results).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("`rateLimited` de C5 se pinta con su propio estado y NO se registra", async () => {
    const { result, logger } = renderSearch({
      handler: async () => ({ status: "rateLimited", works: [] }),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    // La sesión sigue viva: es un límite temporal de Spotify, no un defecto del
    // puerto ni un token que haya que renovar.
    expect(result.current.status).toBe("rateLimited");
    expect(result.current.results).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("`error` de C5 se pinta como error y NO se registra: C7 ya registró la causa", async () => {
    const { result, logger } = renderSearch({
      handler: async () => ({ status: "error", works: [] }),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("error");
    // Un 400/5xx de Spotify no es un defecto del puerto: duplicarlo aquí con
    // `SEARCH_PORT_UNAVAILABLE` mandaba a buscar el problema al sitio equivocado.
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("un puerto ausente o que lanza se registra y queda en error", async () => {
    const { result, logger } = renderSearch({
      handler: () => Promise.reject(new Error("sin puerto")),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("error");
    expect(result.current.results).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      "SEARCH_PORT_UNAVAILABLE",
      expect.any(String),
    );
  });

  it("el registro no lleva la consulta escrita", async () => {
    const { result, logger } = renderSearch({
      handler: () => Promise.reject(new Error("sin puerto")),
    });

    act(() => {
      result.current.setQuery("una consulta privada");
    });
    await advance();

    for (const call of logger.warn.mock.calls) {
      expect(String(call[1])).not.toContain("una consulta privada");
    }
  });

  it("«Reintentar» repite la consulta vigente y deja de estar en error", async () => {
    let fail = true;
    const { result, searchWorks } = renderSearch({
      handler: async () =>
        fail ? { status: "error", works: [] } : ok(WORKS),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();
    expect(result.current.status).toBe("error");

    fail = false;

    act(() => {
      result.current.retry();
    });
    expect(result.current.status).toBe("searching");

    await advance();

    expect(searchWorks).toHaveBeenCalledTimes(2);
    expect(searchWorks).toHaveBeenLastCalledWith("ba");
    expect(result.current.status).toBe("results");
    expect(result.current.query).toBe("ba");
  });
});

describe("useWorkSearch — artistas de Explorar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("con includeArtists devuelve obras y artistas en results", async () => {
    const { result } = renderSearch({
      includeArtists: true,
      handler: async () =>
        ok(WORKS, [{ artistId: "artist1", name: "Luna" }]),
    });

    act(() => {
      result.current.setQuery("luna");
    });
    await advance();

    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(WORKS);
    expect(result.current.artists).toEqual([
      { artistId: "artist1", name: "Luna" },
    ]);
  });

  it("en Explorar, artistas sin obras siguen siendo results", async () => {
    const { result } = renderSearch({
      includeArtists: true,
      handler: async () =>
        ok([], [{ artistId: "artist1", name: "Luna" }]),
    });

    act(() => {
      result.current.setQuery("luna");
    });
    await advance();

    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual([]);
    expect(result.current.artists).toHaveLength(1);
  });

  it("en Crear los artistas no cuentan: sin obras queda empty", async () => {
    const { result } = renderSearch({
      handler: async () =>
        ok([], [{ artistId: "artist1", name: "Luna" }]),
    });

    act(() => {
      result.current.setQuery("luna");
    });
    await advance();

    expect(result.current.status).toBe("empty");
    expect(result.current.results).toEqual([]);
    expect(result.current.artists).toEqual([]);
  });

  it("limpiar también vacía los artistas", async () => {
    const { result } = renderSearch({
      includeArtists: true,
      handler: async () =>
        ok([], [{ artistId: "artist1", name: "Luna" }]),
    });

    act(() => {
      result.current.setQuery("luna");
    });
    await advance();
    expect(result.current.artists).toHaveLength(1);

    act(() => {
      result.current.clear();
    });

    expect(result.current.artists).toEqual([]);
    expect(result.current.status).toBe("idle");
  });
});

describe("useWorkSearch — sin buscador montado", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("con `enabled` falso no pide, no registra y se queda en el estado inicial", async () => {
    const { result, searchWorks, logger } = renderSearch({
      enabled: false,
      handler: async () => ({ status: "error", works: [] }),
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance(2000);

    expect(searchWorks).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.results).toEqual([]);
  });

  it("con `paused` no pide y conserva lo que ya estaba cargado", async () => {
    const { result, rerender, searchWorks } = renderSearch({});

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(WORKS);

    act(() => {
      rerender({ enabled: true, paused: true });
    });
    act(() => {
      result.current.setQuery("otra");
    });
    await advance(2000);

    expect(searchWorks).toHaveBeenCalledTimes(1);
    expect(result.current.query).toBe("otra");
    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(WORKS);

    act(() => {
      rerender({ enabled: true, paused: false });
    });
    await advance();

    // Al levantar la pausa no se revalida sola lo que ya estaba en pantalla (F25).
    expect(searchWorks).toHaveBeenCalledTimes(1);
    expect(result.current.query).toBe("otra");
    expect(result.current.status).toBe("results");
    expect(result.current.results).toEqual(WORKS);

    act(() => {
      result.current.retry();
    });
    await advance();

    expect(searchWorks).toHaveBeenCalledTimes(2);
    expect(searchWorks).toHaveBeenLastCalledWith("otra");
  });

  it("pausar con una petición en vuelo descarta su respuesta", async () => {
    const pending = deferred<SearchResult>();
    const { result, rerender } = renderSearch({
      handler: () => pending.promise,
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("searching");

    act(() => {
      rerender({ enabled: true, paused: true });
    });
    await act(async () => {
      pending.resolve(ok(WORKS));
      await Promise.resolve();
    });

    expect(result.current.status).toBe("searching");
    expect(result.current.results).toEqual([]);
  });

  it("pausar con una petición que falla no la registra ni la pinta como error", async () => {
    let fail: (error: Error) => void = () => undefined;
    const pending = new Promise<SearchResult>((_resolve, reject) => {
      fail = reject;
    });
    const { result, rerender, logger } = renderSearch({
      handler: () => pending,
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    expect(result.current.status).toBe("searching");

    act(() => {
      rerender({ enabled: true, paused: true });
    });
    await act(async () => {
      fail(new Error("sin red"));
      await Promise.resolve();
    });

    // La pausa también silencia el fallo del puerto: no hay error que pintar ni
    // defecto interno que registrar mientras dura la capa de BR18.6.
    expect(result.current.status).toBe("searching");
    expect(result.current.results).toEqual([]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("apagarlo con una búsqueda en vuelo descarta lo que llegue después", async () => {
    const slow = deferred<SearchResult>();
    const { result, rerender } = renderSearch({
      handler: () => slow.promise,
    });

    act(() => {
      result.current.setQuery("ba");
    });
    await advance();

    rerender({ enabled: false, paused: false });

    await act(async () => {
      slow.resolve(ok(WORKS));
      await Promise.resolve();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.results).toEqual([]);
  });
});
