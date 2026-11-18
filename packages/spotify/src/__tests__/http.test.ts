import type { FetchLike, HttpResponseLike } from "../types";
import { isValidWorkId, requestJson } from "../http";

function response(
  value: unknown,
  status = 200,
): HttpResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
  };
}

describe("cliente HTTP de Spotify", () => {
  it("valida el identificador de obra antes de usarlo en una ruta", () => {
    expect(isValidWorkId("4uLU6hMCjMI75M1A2tKUQC")).toBe(true);
    expect(isValidWorkId("album123")).toBe(true);
    expect(isValidWorkId("../../me")).toBe(false);
    expect(isValidWorkId("con espacio")).toBe(false);
    expect(isValidWorkId("")).toBe(false);
  });

  it("devuelve el JSON del 200 sin reintentar", async () => {
    const fetchMock = jest.fn(async () => response({ tracks: [] }));

    const result = await requestJson<{ tracks: unknown[] }>({
      url: "https://api.spotify.com/v1/search?q=x",
      fetch: fetchMock as unknown as FetchLike,
    });

    expect(result).toEqual({ ok: true, value: { tracks: [] } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("clasifica 401, 429, 404 y 5xx sin devolver el body", async () => {
    const cases: [number, string][] = [
      [401, "unauthorized"],
      [429, "rateLimited"],
      [404, "notFound"],
      [503, "error"],
    ];

    for (const [status, failure] of cases) {
      const result = await requestJson({
        url: "https://api.spotify.com/v1/tracks/1",
        fetch: (async () => response({ error: "secreto" }, status)) as FetchLike,
      });

      expect(result).toEqual({ ok: false, failure, status });
      expect(JSON.stringify(result)).not.toContain("secreto");
    }
  });

  it("corta a los 10 s con timeout y no reintenta", async () => {
    const fetchMock = jest.fn(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise<HttpResponseLike>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("abortado")),
          );
        }),
    );

    const result = await requestJson({
      url: "https://api.spotify.com/v1/search?q=x",
      fetch: fetchMock as unknown as FetchLike,
      timeoutMs: 10,
    });

    expect(result).toEqual({ ok: false, failure: "timeout" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("mapea una red caída a network", async () => {
    const result = await requestJson({
      url: "https://api.spotify.com/v1/search?q=x",
      fetch: (async () => {
        throw new Error("sin red");
      }) as FetchLike,
    });

    expect(result).toEqual({ ok: false, failure: "network" });
  });

  it("un 200 con JSON ilegible es error, no éxito", async () => {
    const result = await requestJson({
      url: "https://api.spotify.com/v1/search?q=x",
      fetch: (async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("body roto");
        },
      })) as FetchLike,
    });

    expect(result).toEqual({ ok: false, failure: "error", status: 200 });
  });

  it("envía método, cabeceras y body tal cual, sin añadir credenciales", async () => {
    const fetchMock = jest.fn(async () => response({}));

    await requestJson({
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=authorization_code",
      fetch: fetchMock as unknown as FetchLike,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://accounts.spotify.com/api/token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=authorization_code",
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
