/**
 * La lógica de C5 (paso 10 del plan): catálogo de ejemplo, decisión de portada,
 * recuento de opiniones y búsqueda sin red.
 *
 * Por qué cada colaborador entra doblado: las pruebas no tocan Spotify, ni el
 * sistema operativo, ni la red. La conectividad es un doble literal con el reloj
 * fijo (`NOW`) para que `measuredAt` no dependa de la máquina (NFR5.7), y los
 * puertos de Spotify son dobles que responden lo que cada caso necesita. Ningún
 * puerto se construye con `@melodify/spotify`: el catálogo no lo conoce (BR5.6).
 */
import type { Connectivity } from "@melodify/connectivity";
import { createContentStore } from "@melodify/content-store";

import {
  createCatalog,
  type Catalog,
  type CatalogSnapshot,
  type CreateCatalogOptions,
} from "../catalog";
import type {
  SearchPortResult,
  SpotifyResolvePort,
  SpotifySearchPort,
  SpotifySessionPort,
  WorkView,
} from "../ports";
import { SAMPLE_WORKS } from "../sample";

const NOW = "2026-11-12T09:00:00.000Z";
const BOHEMIAN = "4u7EnebtmKWzUH433Rbtpz";
const AS_IT_WAS = "4LRPiXqCikLlN15c3yImP7";
const BOHEMIAN_COVER = "https://i.scdn.co/image/bohemian.jpg";

type SnapshotListener = jest.Mock<void, [CatalogSnapshot]>;

/** Un estado de red fijo: la portada real depende de este booleano y solo de él. */
function fixedConnectivity(online: boolean): Connectivity {
  return {
    getNetworkState: () => ({ online, measuredAt: NOW }),
    subscribeNetwork: () => () => {},
  };
}

/** Una sesión de Spotify sin token: el catálogo solo pregunta si hay o no. */
function sessionPort(connected: boolean): SpotifySessionPort {
  return {
    isConnected: () => connected,
    onConnectionChange: () => () => {},
  };
}

function newCatalog(overrides: Partial<CreateCatalogOptions> = {}): Catalog {
  return createCatalog({
    content: overrides.content ?? createContentStore({ now: NOW }),
    connectivity: overrides.connectivity ?? fixedConnectivity(true),
    session: overrides.session ?? null,
    search: overrides.search ?? null,
    resolve: overrides.resolve ?? null,
  });
}

/** Una obra que llegó por búsqueda: nace sin portada hasta que se resuelva. */
function spotifyWork(workId: string, title = "Otra obra"): WorkView {
  return {
    workId,
    title,
    artist: "Otra persona",
    coverUrl: null,
    origin: "spotify",
  };
}

/**
 * Resuelve solo Bohemian Rhapsody. Las demás obras responden `notFound`, que es
 * lo que hace un catálogo sin sesión: el bloque con la inicial sigue siendo la
 * respuesta correcta para ellas.
 */
function coverResolver(): SpotifyResolvePort {
  return {
    async resolve(workId) {
      if (workId !== BOHEMIAN) {
        return { kind: "failure", failure: "notFound" };
      }
      return {
        kind: "ok",
        work: {
          workId: BOHEMIAN,
          title: "Bohemian Rhapsody",
          artist: "Queen",
          coverUrl: BOHEMIAN_COVER,
          origin: "sample",
        },
      };
    },
  };
}

function failingResolver(): SpotifyResolvePort {
  return {
    async resolve() {
      return { kind: "failure", failure: "network" };
    },
  };
}

/**
 * Los puertos son asíncronos y `retryCovers` no devuelve promesa —la pantalla no
 * espera—, así que las pruebas vacían las microtareas antes de mirar el catálogo.
 * `setTimeout(0)` está tipado en este proyecto; `setImmediate` no.
 */
async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

async function catalogWithBohemianCovered(
  overrides: Partial<CreateCatalogOptions> = {},
): Promise<Catalog> {
  const catalog = newCatalog({ resolve: coverResolver(), ...overrides });
  catalog.retryCovers();
  await flushMicrotasks();
  return catalog;
}

function searchPortWith(result: SearchPortResult): {
  port: SpotifySearchPort;
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    port: {
      async search(query) {
        calls.push(query);
        return result;
      },
    },
  };
}

describe("listSampleWorks", () => {
  it("devuelve las 8 obras de ejemplo en su orden, sin portada y de origen `sample`", () => {
    const { works } = newCatalog().listSampleWorks();

    expect(works).toHaveLength(8);
    expect(works.map((work) => work.workId)).toEqual(
      SAMPLE_WORKS.map((work) => work.workId),
    );
    expect(works.every((work) => work.origin === "sample")).toBe(true);
    expect(works.every((work) => work.coverUrl === null)).toBe(true);
    expect(works[0]?.title).toBe("Bohemian Rhapsody");
    expect(works[7]?.title).toBe("Flowers");
  });

  it("entrega copias: tocar la lista devuelta no cambia el catálogo", () => {
    const catalog = newCatalog();
    const [first] = catalog.listSampleWorks().works;
    if (first === undefined) {
      throw new Error("El catálogo de ejemplo llegó vacío.");
    }

    first.title = "Cambiada por quien leyó";

    expect(catalog.listSampleWorks().works[0]?.title).toBe("Bohemian Rhapsody");
  });
});

describe("getWork", () => {
  it("resuelve una obra del catálogo con 200 y su vista completa", () => {
    const result = newCatalog().getWork(BOHEMIAN);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.code).toBe(200);
    expect(result.value).toEqual({
      workId: BOHEMIAN,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      coverUrl: null,
      origin: "sample",
    });
  });

  it("responde 404 cuando la obra no está en el catálogo", () => {
    const result = newCatalog().getWork("obra-que-no-existe");

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe(404);
  });
});

describe("countOpinions", () => {
  it("cuenta sobre C4 en el instante de la llamada, sin guardar el número", () => {
    const catalog = newCatalog();

    expect(catalog.countOpinions(BOHEMIAN)).toEqual({ workId: BOHEMIAN, count: 2 });
    expect(catalog.countOpinions(AS_IT_WAS)).toEqual({
      workId: AS_IT_WAS,
      count: 0,
    });
  });
});

describe("coverFor", () => {
  it("sin sesión o sin portada responde el bloque con la inicial", () => {
    const catalog = newCatalog();

    expect(catalog.coverFor(BOHEMIAN)).toEqual({ kind: "initialBlock", value: null });
    expect(catalog.coverFor(AS_IT_WAS)).toEqual({ kind: "initialBlock", value: null });
  });

  it("con sesión conectada, conexión y portada resuelta devuelve la URL real", async () => {
    const catalog = await catalogWithBohemianCovered({
      session: sessionPort(true),
      connectivity: fixedConnectivity(true),
    });

    expect(catalog.coverFor(BOHEMIAN)).toEqual({
      kind: "url",
      value: BOHEMIAN_COVER,
    });
  });

  it("con la portada resuelta pero sin conexión vuelve al bloque con la inicial", async () => {
    const catalog = await catalogWithBohemianCovered({
      session: sessionPort(true),
      connectivity: fixedConnectivity(false),
    });

    expect(catalog.coverFor(BOHEMIAN)).toEqual({ kind: "initialBlock", value: null });
  });

  it("con la portada resuelta y conexión pero sin sesión vuelve al bloque con la inicial", async () => {
    const catalog = await catalogWithBohemianCovered({
      session: sessionPort(false),
      connectivity: fixedConnectivity(true),
    });

    expect(catalog.coverFor(BOHEMIAN)).toEqual({ kind: "initialBlock", value: null });
  });
});

describe("searchWorks", () => {
  it("sin puerto de búsqueda responde `offline` sin tocar la red", async () => {
    const result = await newCatalog().searchWorks("bad guy");

    expect(result).toEqual({ status: "offline", works: [] });
  });

  it("una consulta de menos de dos caracteres responde `empty` sin llamar al puerto", async () => {
    const { port, calls } = searchPortWith({ kind: "empty" });
    const catalog = newCatalog({ search: port });

    expect(await catalog.searchWorks(" a ")).toEqual({ status: "empty", works: [] });
    expect(calls).toHaveLength(0);
  });

  it("registra las obras encontradas y mantiene las 8 de ejemplo", async () => {
    const { port } = searchPortWith({
      kind: "ok",
      works: [spotifyWork("spotify-nueva", "Canción encontrada")],
    });
    const catalog = newCatalog({ search: port });

    const result = await catalog.searchWorks("canción");

    expect(result.status).toBe("ok");
    expect(result.works).toHaveLength(1);

    const found = catalog.getWork("spotify-nueva");
    expect(found.ok).toBe(true);
    if (!found.ok) {
      return;
    }
    expect(found.value.title).toBe("Canción encontrada");
    expect(found.value.origin).toBe("spotify");
    // La lista de ejemplo sigue siendo la de siempre: C5 no la contamina (BR5.1).
    expect(catalog.listSampleWorks().works).toHaveLength(8);
  });

  it("normaliza la consulta para la caché y devuelve copias del resultado guardado", async () => {
    const { port, calls } = searchPortWith({
      kind: "ok",
      works: [spotifyWork("spotify-cacheada", "Canción cacheada")],
    });
    const catalog = newCatalog({ search: port });

    const first = await catalog.searchWorks("  Canción   Cacheada ");
    const cached = first.works[0];
    if (cached === undefined) {
      throw new Error("La búsqueda no devolvió la obra esperada.");
    }
    cached.title = "Cambiada por quien leyó";

    const second = await catalog.searchWorks("canción cacheada");

    expect(calls).toHaveLength(1);
    expect(second.status).toBe("ok");
    expect(second.works[0]?.title).toBe("Canción cacheada");
  });

  it("traduce el fallo `network` a `offline` y el resto de fallos a `error`", async () => {
    const network = searchPortWith({ kind: "failure", failure: "network" });
    const offline = await newCatalog({ search: network.port }).searchWorks("bad guy");

    const timeout = searchPortWith({ kind: "failure", failure: "timeout" });
    const failed = await newCatalog({ search: timeout.port }).searchWorks("bad guy");

    expect(offline).toEqual({ status: "offline", works: [] });
    expect(failed).toEqual({ status: "error", works: [] });
  });

  it("no cachea un fallo: la siguiente consulta vuelve a llamar al puerto", async () => {
    let result: SearchPortResult = { kind: "failure", failure: "network" };
    const calls: string[] = [];
    const catalog = newCatalog({
      search: {
        async search(query) {
          calls.push(query);
          return result;
        },
      },
    });

    expect(await catalog.searchWorks("bad guy")).toEqual({
      status: "offline",
      works: [],
    });

    result = { kind: "ok", works: [spotifyWork("spotify-reintentada")] };
    const retried = await catalog.searchWorks("bad guy");

    expect(retried.status).toBe("ok");
    expect(calls).toHaveLength(2);
  });

  it("un puerto que lanza responde `error` y no queda cacheado", async () => {
    const calls: string[] = [];
    const catalog = newCatalog({
      search: {
        async search(query) {
          calls.push(query);
          throw new Error("el doble falla");
        },
      },
    });

    expect(await catalog.searchWorks("bad guy")).toEqual({
      status: "error",
      works: [],
    });
    expect(await catalog.searchWorks("bad guy")).toEqual({
      status: "error",
      works: [],
    });
    expect(calls).toHaveLength(2);
  });
});

describe("subscribe", () => {
  it("emite al suscribirse y vuelve a emitir cuando una portada se resuelve", async () => {
    const catalog = newCatalog({ resolve: coverResolver() });
    const listener: SnapshotListener = jest.fn<void, [CatalogSnapshot]>();

    const unsubscribe = catalog.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);

    catalog.retryCovers();
    await flushMicrotasks();

    expect(listener).toHaveBeenCalledTimes(2);
    const snapshot = listener.mock.calls[1]?.[0];
    expect(
      snapshot?.works.find((work) => work.workId === BOHEMIAN)?.coverUrl,
    ).toBe(BOHEMIAN_COVER);

    unsubscribe();
  });

  it("deja de emitir cuando llega la baja", async () => {
    const { port } = searchPortWith({
      kind: "ok",
      works: [spotifyWork("spotify-tarde")],
    });
    const catalog = newCatalog({ search: port });
    const listener: SnapshotListener = jest.fn<void, [CatalogSnapshot]>();

    const unsubscribe = catalog.subscribe(listener);
    unsubscribe();

    await catalog.searchWorks("tarde");

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("retryCovers", () => {
  it("sin puerto de resolución no hace nada y el aviso de portadas queda apagado", async () => {
    const catalog = newCatalog();

    catalog.retryCovers();
    await flushMicrotasks();

    expect(catalog.getCoverFailure()).toBe(false);
  });

  it("con un puerto que falla enciende el aviso de portadas y avisa a quien escucha", async () => {
    const catalog = newCatalog({ resolve: failingResolver() });
    const listener: SnapshotListener = jest.fn<void, [CatalogSnapshot]>();
    catalog.subscribe(listener);

    catalog.retryCovers();
    await flushMicrotasks();

    expect(catalog.getCoverFailure()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1]?.[0].coverFailure).toBe(true);
  });
});
