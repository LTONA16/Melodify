import { catalogPorts, spotifyAuth, spotifyCatalog } from "../ports";

/**
 * Los tres puertos ya están registrados y comparten **una sola** instancia de
 * sesión y de catálogo (TS-18, TS-35, R-01): dos máquinas de token serían dos
 * hidrataciones y dos respuestas distintas a «¿hay sesión?».
 */
describe("puertos del catálogo", () => {
  it("registra los tres puertos y no deja ninguno en `null`", () => {
    expect(Object.keys(catalogPorts).sort()).toEqual([
      "resolve",
      "search",
      "session",
    ]);
    expect(catalogPorts.session).not.toBeNull();
    expect(catalogPorts.search).not.toBeNull();
    expect(catalogPorts.resolve).not.toBeNull();
  });

  it("la sesión de C5 es la misma máquina de autorización que usa la cáscara", () => {
    expect(catalogPorts.session).toBe(spotifyAuth);
    expect(typeof spotifyAuth.getState().status).toBe("string");
  });

  it("la búsqueda y la resolución son el mismo cliente de catálogo", () => {
    expect(catalogPorts.search).toBe(spotifyCatalog);
    expect(catalogPorts.resolve).toBe(spotifyCatalog);
  });

  it("sin client ID la sesión arranca en `notConfigured` y la app sigue operativa", () => {
    expect(spotifyAuth.getState().status).toBe("notConfigured");
    expect(() => spotifyAuth.connect()).not.toThrow();
  });
});
