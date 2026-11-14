import { catalog, connectivity, contentStore } from "../instances";

/**
 * El punto de composición (TS-18, R-01): una sola instancia por dominio, y el
 * catálogo hablando con **esas** instancias y no con copias.
 *
 * Se comprueba por comportamiento, no por identidad de referencia: una escritura en
 * C4 tiene que mover el recuento de C5, y una suscripción a C6 tiene que emitir el
 * estado vigente. Si el catálogo tuviera su propio almacén, el recuento no se
 * movería aunque las dos piezas existieran.
 */
describe("instancias de la app", () => {
  it("expone las tres fábricas con la forma de su contrato", () => {
    expect(typeof contentStore.listOpinions).toBe("function");
    expect(typeof contentStore.subscribeContent).toBe("function");
    expect(typeof connectivity.getNetworkState).toBe("function");
    expect(typeof connectivity.subscribeNetwork).toBe("function");
    expect(typeof catalog.coverFor).toBe("function");
    expect(typeof catalog.countOpinions).toBe("function");
    expect(typeof catalog.searchWorks).toBe("function");
  });

  it("el catálogo cuenta sobre la misma instancia de contenido que exporta la app", () => {
    const workId = "4LRPiXqCikLlN15c3yImP7";
    const before = catalog.countOpinions(workId).count;

    const created = contentStore.createOpinion({
      authorId: "demo",
      workId,
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "Una opinión que solo existe en esta prueba.",
      rating: 4,
    });

    expect(created.ok).toBe(true);
    expect(catalog.countOpinions(workId).count).toBe(before + 1);
  });

  it("la conectividad exportada es la que alimenta la decisión de portada", () => {
    const state = connectivity.getNetworkState();

    expect(typeof state.online).toBe("boolean");
    expect(typeof state.measuredAt).toBe("string");

    let received: boolean | null = null;
    const unsubscribe = connectivity.subscribeNetwork((next) => {
      received = next.online;
    });
    unsubscribe();

    expect(received).toBe(state.online);
  });

  it("los tres puertos de Spotify siguen en `null`: sin sesión no hay búsqueda ni portada real", async () => {
    const search = await catalog.searchWorks("queen");
    const cover = catalog.coverFor("4u7EnebtmKWzUH433Rbtpz");

    expect(search.status).toBe("offline");
    expect(cover).toEqual({ kind: "initialBlock", value: null });
  });

  it("una obra desconocida no está en el catálogo y no se inventa", () => {
    const work = catalog.getWork("obra-que-no-existe");

    expect(work.ok).toBe(false);
    expect(catalog.countOpinions("obra-que-no-existe").count).toBe(0);
  });
});
