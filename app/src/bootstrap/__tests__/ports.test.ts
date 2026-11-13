import { catalogPorts } from "../ports";

/**
 * Los tres puertos de C5 existen declarados y **sin implementación registrada**:
 * «sin sesión, sin búsqueda y sin resolución» es un estado observable, no un
 * error, y es lo que deja que el catálogo de ejemplo funcione solo (C5).
 */
describe("puertos del catálogo", () => {
  it("declara los tres puertos y ninguno arranca implementado", () => {
    expect(Object.keys(catalogPorts).sort()).toEqual([
      "resolve",
      "search",
      "session",
    ]);
    expect(catalogPorts.session).toBeNull();
    expect(catalogPorts.search).toBeNull();
    expect(catalogPorts.resolve).toBeNull();
  });
});
