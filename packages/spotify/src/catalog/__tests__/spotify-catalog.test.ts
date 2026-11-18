import type { SpotifyAuth } from "../../auth/spotify-auth";
import type { FetchLike, HttpResponseLike } from "../../types";
import { createSpotifyCatalog } from "../spotify-catalog";

interface FetchCall {
  url: string;
  init?: { headers?: Record<string, string> };
}

function response(value: unknown, status = 200): HttpResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
  };
}

function authDouble(overrides: Partial<SpotifyAuth> = {}): SpotifyAuth {
  return {
    getState: () => ({ status: "connected" }),
    subscribe: () => () => undefined,
    connect: () => undefined,
    disconnect: () => undefined,
    retry: () => undefined,
    getAccessToken: async () => "token-1",
    markInvalid: jest.fn(),
    isConnected: () => true,
    onConnectionChange: () => () => undefined,
    whenReady: async () => undefined,
    ...overrides,
  };
}

function catalogWith(
  handler: (url: string) => HttpResponseLike | Promise<HttpResponseLike>,
  auth: SpotifyAuth = authDouble(),
) {
  const calls: FetchCall[] = [];
  const fetchMock = jest.fn(async (url: string, init?: FetchCall["init"]) => {
    calls.push({ url, init });
    return handler(url);
  });
  const logger = { warn: jest.fn(), error: jest.fn() };

  const catalog = createSpotifyCatalog({
    auth,
    fetch: fetchMock as unknown as FetchLike,
    clock: () => 0,
    log: logger,
  });

  return { catalog, calls, fetchMock, logger };
}

const searchBody = {
  tracks: {
    items: [
      {
        id: "track-1",
        name: "Canción uno",
        artists: [{ id: "artist-track", name: "Artista de la canción" }],
        album: { images: [{ url: "https://img/track.jpg" }] },
      },
      { id: "sin-nombre", artists: [] },
      {
        id: "track-2",
        name: "Canción dos",
        artists: [{ id: "artist-track-2", name: "Otro artista" }],
        album: { images: [] },
      },
    ],
  },
  albums: {
    items: [
      {
        id: "album-1",
        name: "Álbum uno",
        artists: [{ id: "artist-album", name: "Artista del álbum" }],
        images: [{ url: "https://img/album.jpg" }],
      },
      { name: "sin id", artists: [] },
    ],
  },
  artists: {
    items: [
      { id: "artist-1", name: "Artista uno" },
      { id: "artist-2" },
      { name: "sin id" },
    ],
  },
};

describe("catálogo de Spotify", () => {
  it("pide la URL exacta, con el token actual y sin reintento", async () => {
    const { catalog, calls, fetchMock } = catalogWith(() =>
      response(searchBody),
    );

    await catalog.search("bad bunny & friends");

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      "https://api.spotify.com/v1/search?q=bad%20bunny%20%26%20friends&type=track,album,artist&limit=20",
    );
    expect(calls[0]?.init?.headers).toEqual({
      Authorization: "Bearer token-1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("mapea canciones, álbumes y artistas en ese orden y descarta lo incompleto", async () => {
    const { catalog } = catalogWith(() => response(searchBody));

    const result = await catalog.search("algo");

    expect(result.kind).toBe("ok");
    expect(result.works).toEqual([
      {
        workId: "track-1",
        title: "Canción uno",
        artist: "Artista de la canción",
        coverUrl: "https://img/track.jpg",
        origin: "spotify",
        workKind: "track",
      },
      {
        workId: "track-2",
        title: "Canción dos",
        artist: "Otro artista",
        coverUrl: null,
        origin: "spotify",
        workKind: "track",
      },
      {
        workId: "album-1",
        title: "Álbum uno",
        artist: "Artista del álbum",
        coverUrl: "https://img/album.jpg",
        origin: "spotify",
        workKind: "album",
      },
    ]);
    expect(result.artists).toEqual([{ artistId: "artist-1", name: "Artista uno" }]);
  });

  it("devuelve empty cuando las tres clases vienen vacías", async () => {
    const { catalog } = catalogWith(() =>
      response({ tracks: { items: [] }, albums: { items: [] }, artists: { items: [] } }),
    );

    await expect(catalog.search("nada")).resolves.toEqual({ kind: "empty" });
  });

  it("un 401 avisa a auth y devuelve unauthorized", async () => {
    const auth = authDouble();
    const { catalog } = catalogWith(() => response({}, 401), auth);

    const result = await catalog.search("algo");

    expect(result).toEqual({ kind: "failure", failure: "unauthorized" });
    expect(auth.markInvalid).toHaveBeenCalledTimes(1);
  });

  it("clasifica 429, timeout, red y 5xx sin filtrar el body", async () => {
    const cases: [HttpResponseLike | Error, string][] = [
      [response({ error: "temporal" }, 429), "rateLimited"],
      [new Error("sin red"), "network"],
      [response({ error: "roto" }, 500), "error"],
    ];

    for (const [outcome, failure] of cases) {
      const { catalog } = catalogWith(() => {
        if (outcome instanceof Error) {
          throw outcome;
        }
        return outcome;
      });

      const result = await catalog.search("algo");

      expect(result).toEqual({ kind: "failure", failure });
      expect(JSON.stringify(result)).not.toContain("roto");
    }
  });

  it("registra el fallo sin la consulta ni el token", async () => {
    const { catalog, logger } = catalogWith(() => response({}, 500));

    await catalog.search("consulta secreta");

    expect(logger.error).toHaveBeenCalledWith(
      "SPOTIFY_SEARCH_FAILED",
      expect.any(String),
    );
    const logged = JSON.stringify(logger.error.mock.calls);
    expect(logged).not.toContain("consulta secreta");
    expect(logged).not.toContain("token-1");
  });

  it("sin sesión no pide token ni toca la red", async () => {
    const auth = authDouble({
      isConnected: () => false,
      getAccessToken: jest.fn(async () => null),
    });
    const { catalog, fetchMock } = catalogWith(() => response(searchBody), auth);

    await expect(catalog.search("algo")).resolves.toEqual({
      kind: "failure",
      failure: "unauthorized",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resuelve una canción con workKind track", async () => {
    const { catalog, calls } = catalogWith(() =>
      response({
        id: "track1",
        name: "Canción",
        artists: [{ id: "artist-1", name: "Artista" }],
        album: { images: [{ url: "https://img/cover.jpg" }] },
      }),
    );

    const result = await catalog.resolve("track1");

    expect(result).toEqual({
      kind: "ok",
      work: {
        workId: "track1",
        title: "Canción",
        artist: "Artista",
        coverUrl: "https://img/cover.jpg",
        origin: "spotify",
        workKind: "track",
      },
    });
    expect(calls.map((call) => call.url)).toEqual([
      "https://api.spotify.com/v1/tracks/track1",
    ]);
  });

  it("solo tras un 404 de la canción prueba el álbum", async () => {
    const { catalog, calls } = catalogWith((url) => {
      if (url.includes("/tracks/")) {
        return response({}, 404);
      }
      return response({
        id: "album1",
        name: "Álbum",
        artists: [{ id: "artist-1", name: "Artista" }],
        images: [{ url: "https://img/album.jpg" }],
      });
    });

    const result = await catalog.resolve("album1");

    expect(result.kind).toBe("ok");
    expect(result.work?.workKind).toBe("album");
    expect(calls.map((call) => call.url)).toEqual([
      "https://api.spotify.com/v1/tracks/album1",
      "https://api.spotify.com/v1/albums/album1",
    ]);
  });

  it("dos 404 terminan en notFound", async () => {
    const { catalog } = catalogWith(() => response({}, 404));

    await expect(catalog.resolve("404404")).resolves.toEqual({
      kind: "failure",
      failure: "notFound",
    });
  });

  it("valida el workId antes de armar la ruta", async () => {
    const { catalog, fetchMock } = catalogWith(() => response({}));

    await expect(catalog.resolve("../../me")).resolves.toEqual({
      kind: "failure",
      failure: "notFound",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("un JSON inválido se clasifica como error", async () => {
    const { catalog } = catalogWith(() => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("json roto");
      },
    }));

    await expect(catalog.resolve("track1")).resolves.toEqual({
      kind: "failure",
      failure: "error",
    });
  });
});
