import type { SpotifyConnectionStatus } from "@melodify/design-system";

import type {
  AuthorizationStateView,
  SpotifyLogCode,
  SpotifyLogPort,
} from "../types";

describe("estados de conexión", () => {
  it("publica exactamente los seis estados del contrato", () => {
    const states: SpotifyConnectionStatus[] = [
      "disconnected",
      "connecting",
      "connected",
      "connectionError",
      "invalidToken",
      "notConfigured",
    ];

    expect(states).toHaveLength(6);
    expect(new Set(states).size).toBe(6);
  });

  it("una vista de autorización solo acepta un estado de la unión", () => {
    const view: AuthorizationStateView = { status: "connected" };

    expect(view.status).toBe("connected");

    // @ts-expect-error un estado fuera de la unión no compila.
    const invalid: AuthorizationStateView = { status: "loggedIn" };
    expect(invalid).toBeDefined();
  });
});

describe("puerto de diagnóstico", () => {
  it("expone warn y error con código y mensaje, sin logger implícito", () => {
    const calls: { code: SpotifyLogCode; message: string }[] = [];
    const log: SpotifyLogPort = {
      warn: (code, message) => calls.push({ code, message }),
      error: (code, message) => calls.push({ code, message }),
    };

    log.warn("SPOTIFY_TOKEN_READ_FAILED", "sin token");
    log.error("SPOTIFY_SEARCH_FAILED", "sin respuesta");

    expect(calls).toEqual([
      { code: "SPOTIFY_TOKEN_READ_FAILED", message: "sin token" },
      { code: "SPOTIFY_SEARCH_FAILED", message: "sin respuesta" },
    ]);
  });
});
