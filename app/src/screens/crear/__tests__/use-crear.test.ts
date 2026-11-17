import { act, renderHook } from "@testing-library/react-native";
import type { CreateEntry } from "@melodify/app-shell";
import type { WorkView } from "@melodify/catalog";
import type { OpinionView } from "@melodify/content-store";

import type { CrearCatalogPort, CrearContentPort } from "../useCrear";
import { useCrear } from "../useCrear";
import type { SelectedWork } from "../validateOpinionDraft";

/**
 * El formulario de Crear y Editar (BR11.1–BR11.7, BR12.1–BR12.7): los dos modos, las
 * cinco respuestas de las escrituras (`201`, `409`, `422`, `200`, `404`), «Guardar»
 * sin cambios y el descarte del borrador al cambiar `formKey`.
 *
 * C4 y C5 son dobles porque lo que se prueba es la decisión del hook —qué escribe,
 * qué conserva y qué entrega al contenedor—, no el almacén, que ya tiene sus propias
 * pruebas de contrato.
 */
const DEMO = "demo";

const ENTRY: CreateEntry = {
  mode: "create",
  preselectedWorkId: null,
  editingOpinionId: null,
  returnTo: null,
  formKey: 1,
};

const WORK: SelectedWork = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
};

function workView(): WorkView {
  return {
    workId: WORK.workId,
    title: WORK.title,
    artist: WORK.artist,
    coverUrl: null,
    origin: "sample",
  };
}

function opinionView(overrides: Partial<OpinionView> = {}): OpinionView {
  return {
    opinionId: "op-1",
    workId: WORK.workId,
    workTitle: WORK.title,
    workArtist: WORK.artist,
    author: {
      authorId: DEMO,
      displayName: "Alex de la Nasa",
      handle: "alex",
      followedByMe: false,
    },
    text: "Un temazo.",
    rating: 4,
    createdAt: "2026-11-10T09:00:00.000Z",
    updatedAt: "2026-11-10T09:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: true,
    ...overrides,
  };
}

interface ContentDouble {
  listOpinions: jest.Mock;
  getOpinion: jest.Mock;
  createOpinion: jest.Mock;
  updateOpinion: jest.Mock;
}

interface CatalogDouble {
  getWork: jest.Mock;
}

function contentDouble(): ContentDouble {
  return {
    listOpinions: jest.fn(() => ({ ok: true as const, code: 200 as const, value: [] })),
    getOpinion: jest.fn(() => ({
      ok: true as const,
      code: 200 as const,
      value: opinionView(),
    })),
    createOpinion: jest.fn(() => ({
      ok: true as const,
      code: 201 as const,
      value: opinionView(),
    })),
    updateOpinion: jest.fn(() => ({
      ok: true as const,
      code: 200 as const,
      value: opinionView(),
    })),
  };
}

function catalogDouble(): CatalogDouble {
  return {
    getWork: jest.fn(() => ({
      ok: true as const,
      code: 200 as const,
      value: workView(),
    })),
  };
}

interface HarnessOptions {
  entry?: CreateEntry;
  viewerId?: string | null;
  content?: ContentDouble;
  catalog?: CatalogDouble;
}

function setup(options: HarnessOptions = {}) {
  const content = options.content ?? contentDouble();
  const catalog = options.catalog ?? catalogDouble();
  const onDone = jest.fn();
  const onEditExisting = jest.fn();
  const initialProps = {
    entry: options.entry ?? ENTRY,
    viewerId: options.viewerId === undefined ? DEMO : options.viewerId,
  };

  const view = renderHook(
    ({ entry, viewerId }: { entry: CreateEntry; viewerId: string | null }) =>
      useCrear({
        entry,
        viewerId,
        content: content as unknown as CrearContentPort,
        catalog: catalog as unknown as CrearCatalogPort,
        onDone,
        onEditExisting,
      }),
    { initialProps },
  );

  return { ...view, content, catalog, onDone, onEditExisting };
}

describe("useCrear — arranque y obra", () => {
  it("sin identidad se queda cargando y no lee nada", () => {
    const { result, content, catalog } = setup({ viewerId: null });

    expect(result.current.state.status).toBe("loading");
    expect(result.current.state.canSubmit).toBe(false);
    expect(content.listOpinions).not.toHaveBeenCalled();
    expect(catalog.getWork).not.toHaveBeenCalled();
  });

  it("al resolver la identidad pasa a listo con el formulario vacío", () => {
    const { result } = setup();

    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.work).toBeNull();
    expect(result.current.state.text).toBe("");
    expect(result.current.state.rating).toBe(0);
    expect(result.current.state.canSubmit).toBe(false);
  });

  it("precarga la obra preseleccionada y comprueba la opinión propia", () => {
    const { result, content } = setup({
      entry: { ...ENTRY, preselectedWorkId: "work-1" },
    });

    expect(result.current.state.work).toEqual(WORK);
    expect(result.current.state.alreadyOpined).toBe(false);
    expect(content.listOpinions).toHaveBeenCalledWith({
      workId: "work-1",
      viewerId: DEMO,
    });
  });

  it("una obra preseleccionada que no está en el catálogo no bloquea el formulario", () => {
    const catalog = catalogDouble();
    catalog.getWork.mockReturnValue({
      ok: false as const,
      code: 404 as const,
      message: "No está en el catálogo.",
    });

    const { result } = setup({
      entry: { ...ENTRY, preselectedWorkId: "work-9" },
      catalog,
    });

    // Sin título con el que pintarla no se inventa uno: el formulario arranca vacío.
    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.work).toBeNull();
  });

  it("elegir una obra con opinión propia deja el formulario en YaOpinada", () => {
    const content = contentDouble();
    content.listOpinions.mockReturnValue({
      ok: true as const,
      code: 200 as const,
      value: [opinionView()],
    });

    const { result } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });

    expect(result.current.state.alreadyOpined).toBe(true);
    expect(result.current.state.ownOpinionId).toBe("op-1");

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.changeText("Otro texto.");
      result.current.actions.rate(3);
    });
    act(() => {
      result.current.actions.publish();
    });

    expect(content.createOpinion).not.toHaveBeenCalled();
  });

  it("«Editar mi opinión» abre la opinión propia que ya existe", () => {
    const content = contentDouble();
    content.listOpinions.mockReturnValue({
      ok: true as const,
      code: 200 as const,
      value: [opinionView()],
    });

    const { result, onEditExisting } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.editExisting();
    });

    expect(onEditExisting).toHaveBeenCalledWith("op-1");
  });
});

describe("useCrear — publicar", () => {
  it("con 201 recorta el texto, escribe y entrega el resultado", () => {
    const { result, content, onDone } = setup();

    act(() => {
      result.current.actions.chooseWork(WORK);
      result.current.actions.changeText("  Un temazo.  ");
      result.current.actions.rate(5);
    });

    expect(result.current.state.canSubmit).toBe(true);

    act(() => {
      result.current.actions.publish();
    });

    expect(content.createOpinion).toHaveBeenCalledWith({
      authorId: DEMO,
      workId: "work-1",
      workTitle: "Bad Guy",
      workArtist: "Billie Eilish",
      text: "Un temazo.",
      rating: 5,
    });
    expect(onDone).toHaveBeenCalledWith({
      kind: "published",
      opinion: expect.objectContaining({ opinionId: "op-1" }),
    });
  });

  it("con 409 pasa a YaOpinada y relee la opinión propia, sin error", () => {
    const content = contentDouble();
    content.listOpinions
      .mockReturnValueOnce({ ok: true as const, code: 200 as const, value: [] })
      .mockReturnValueOnce({
        ok: true as const,
        code: 200 as const,
        value: [opinionView({ opinionId: "op-9" })],
      });
    content.createOpinion.mockReturnValue({
      ok: false as const,
      code: 409 as const,
      message: "Ya existe una opinión tuya sobre esta obra.",
    });

    const { result, onDone } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.changeText("Un temazo.");
      result.current.actions.rate(4);
    });
    act(() => {
      result.current.actions.publish();
    });

    expect(result.current.state.alreadyOpined).toBe(true);
    expect(result.current.state.ownOpinionId).toBe("op-9");
    expect(result.current.state.submitError).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("con 422 pinta el error de publicación y conserva todo", () => {
    const content = contentDouble();
    content.createOpinion.mockReturnValue({
      ok: false as const,
      code: 422 as const,
      message: "No cumple las reglas.",
    });

    const { result, onDone } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.changeText("Un temazo.");
      result.current.actions.rate(4);
    });
    act(() => {
      result.current.actions.publish();
    });

    expect(result.current.state.submitError).toBe("publish");
    expect(result.current.state.work).toEqual(WORK);
    expect(result.current.state.text).toBe("Un temazo.");
    expect(result.current.state.rating).toBe(4);
    expect(result.current.state.canSubmit).toBe(true);
    expect(onDone).not.toHaveBeenCalled();
  });

  it("«Reintentar» vuelve a enviar con los mismos valores", () => {
    const content = contentDouble();
    content.createOpinion
      .mockReturnValueOnce({
        ok: false as const,
        code: 422 as const,
        message: "No cumple las reglas.",
      })
      .mockReturnValueOnce({
        ok: true as const,
        code: 201 as const,
        value: opinionView(),
      });

    const { result, onDone } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.changeText("Un temazo.");
      result.current.actions.rate(4);
    });
    act(() => {
      result.current.actions.publish();
    });

    act(() => {
      result.current.actions.publish();
    });

    expect(content.createOpinion).toHaveBeenCalledTimes(2);
    expect(content.createOpinion).toHaveBeenLastCalledWith(
      expect.objectContaining({ text: "Un temazo.", rating: 4 }),
    );
    expect(onDone).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "published" }),
    );
  });

  it("escribir después de un fallo retira el aviso", () => {
    const content = contentDouble();
    content.createOpinion.mockReturnValue({
      ok: false as const,
      code: 422 as const,
      message: "No cumple las reglas.",
    });

    const { result } = setup({ content });

    act(() => {
      result.current.actions.chooseWork(WORK);
    });
    act(() => {
      result.current.actions.changeText("Un temazo.");
      result.current.actions.rate(4);
    });
    act(() => {
      result.current.actions.publish();
    });
    expect(result.current.state.submitError).toBe("publish");

    act(() => {
      result.current.actions.changeText("Un temazo mejor.");
    });

    expect(result.current.state.submitError).toBeNull();
  });

  it("no habilita Publicar con texto de solo espacios ni sin valoración", () => {
    const { result } = setup();

    act(() => {
      result.current.actions.chooseWork(WORK);
      result.current.actions.changeText("   ");
      result.current.actions.rate(4);
    });
    expect(result.current.state.canSubmit).toBe(false);

    act(() => {
      result.current.actions.changeText("Un temazo.");
      result.current.actions.clearRating();
    });
    expect(result.current.state.rating).toBe(0);
    expect(result.current.state.canSubmit).toBe(false);
  });

  it("el texto se recorta al tope de 500 caracteres", () => {
    const { result } = setup();

    act(() => {
      result.current.actions.chooseWork(WORK);
      result.current.actions.changeText("a".repeat(600));
      result.current.actions.rate(4);
    });

    expect(result.current.state.text).toHaveLength(500);
  });
});

describe("useCrear — editar", () => {
  const EDIT_ENTRY: CreateEntry = {
    mode: "edit",
    preselectedWorkId: null,
    editingOpinionId: "op-1",
    returnTo: "work",
    formKey: 2,
  };

  it("carga la opinión propia con su obra, texto y valoración", () => {
    const content = contentDouble();
    content.getOpinion.mockReturnValue({
      ok: true as const,
      code: 200 as const,
      value: opinionView({ text: "Un temazo.", rating: 5 }),
    });

    const { result } = setup({ entry: EDIT_ENTRY, content });

    expect(content.getOpinion).toHaveBeenCalledWith({
      opinionId: "op-1",
      viewerId: DEMO,
    });
    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.mode).toBe("edit");
    expect(result.current.state.work).toEqual({
      workId: "work-1",
      title: "Bad Guy",
      artist: "Billie Eilish",
      coverUrl: null,
    });
    expect(result.current.state.text).toBe("Un temazo.");
    expect(result.current.state.rating).toBe(5);
    expect(result.current.state.canSubmit).toBe(true);
  });

  it("una opinión que no existe deja el error de carga", () => {
    const content = contentDouble();
    content.getOpinion.mockReturnValue({
      ok: false as const,
      code: 404 as const,
      message: "No existe.",
    });

    const { result } = setup({ entry: EDIT_ENTRY, content });

    expect(result.current.state.status).toBe("loadError");
  });

  it("una opinión ajena también es error de carga", () => {
    const content = contentDouble();
    content.getOpinion.mockReturnValue({
      ok: true as const,
      code: 200 as const,
      value: opinionView({ isOwn: false }),
    });

    const { result } = setup({ entry: EDIT_ENTRY, content });

    expect(result.current.state.status).toBe("loadError");
  });

  it("«Reintentar» del error de carga vuelve a leer la opinión", () => {
    const content = contentDouble();
    content.getOpinion.mockReturnValue({
      ok: false as const,
      code: 404 as const,
      message: "No existe.",
    });

    const { result } = setup({ entry: EDIT_ENTRY, content });

    act(() => {
      result.current.actions.retryLoad();
    });

    expect(content.getOpinion).toHaveBeenCalledTimes(2);
  });

  it("Guardar sin cambios no escribe y cierra", () => {
    const { result, content, onDone } = setup({ entry: EDIT_ENTRY });

    act(() => {
      result.current.actions.save();
    });

    expect(content.updateOpinion).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledWith({ kind: "unchanged" });
  });

  it("unos espacios de más no son un cambio", () => {
    const { result, content, onDone } = setup({ entry: EDIT_ENTRY });

    act(() => {
      result.current.actions.changeText("  Un temazo.  ");
    });
    act(() => {
      result.current.actions.save();
    });

    expect(content.updateOpinion).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledWith({ kind: "unchanged" });
  });

  it("Guardar con cambios escribe el texto recortado y entrega el resultado", () => {
    const { result, content, onDone } = setup({ entry: EDIT_ENTRY });

    act(() => {
      result.current.actions.changeText("  Otro texto.  ");
      result.current.actions.rate(2);
    });

    act(() => {
      result.current.actions.save();
    });

    expect(content.updateOpinion).toHaveBeenCalledWith({
      opinionId: "op-1",
      authorId: DEMO,
      viewerId: DEMO,
      text: "Otro texto.",
      rating: 2,
    });
    expect(onDone).toHaveBeenCalledWith({
      kind: "saved",
      opinion: expect.objectContaining({ opinionId: "op-1" }),
    });
  });

  it("un 404 al guardar pasa al error de carga", () => {
    const content = contentDouble();
    content.updateOpinion.mockReturnValue({
      ok: false as const,
      code: 404 as const,
      message: "No existe.",
    });

    const { result, onDone } = setup({ entry: EDIT_ENTRY, content });

    act(() => {
      result.current.actions.changeText("Otro texto.");
    });
    act(() => {
      result.current.actions.save();
    });

    expect(result.current.state.status).toBe("loadError");
    expect(result.current.state.submitError).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });

  it("un 422 al guardar conserva lo escrito con el aviso de guardado", () => {
    const content = contentDouble();
    content.updateOpinion.mockReturnValue({
      ok: false as const,
      code: 422 as const,
      message: "No cumple las reglas.",
    });

    const { result } = setup({ entry: EDIT_ENTRY, content });

    act(() => {
      result.current.actions.changeText("Otro texto.");
      result.current.actions.rate(2);
    });
    act(() => {
      result.current.actions.save();
    });

    expect(result.current.state.submitError).toBe("save");
    expect(result.current.state.status).toBe("ready");
    expect(result.current.state.text).toBe("Otro texto.");
    expect(result.current.state.rating).toBe(2);
  });
});

describe("useCrear — cada visita empieza limpia", () => {
  it("al cambiar formKey se descarta el borrador sin desmontar nada", () => {
    const { result, rerender } = setup();

    act(() => {
      result.current.actions.chooseWork(WORK);
      result.current.actions.changeText("Un temazo.");
      result.current.actions.rate(5);
    });

    expect(result.current.state.canSubmit).toBe(true);

    rerender({ entry: { ...ENTRY, formKey: 2 }, viewerId: DEMO });

    expect(result.current.state.work).toBeNull();
    expect(result.current.state.text).toBe("");
    expect(result.current.state.rating).toBe(0);
    expect(result.current.state.canSubmit).toBe(false);
  });

  it("al cambiar formKey se vuelve a leer la edición que toque", () => {
    const content = contentDouble();

    const { rerender } = setup({
      entry: {
        mode: "edit",
        preselectedWorkId: null,
        editingOpinionId: "op-1",
        returnTo: null,
        formKey: 1,
      },
      content,
    });

    rerender({
      entry: {
        mode: "edit",
        preselectedWorkId: null,
        editingOpinionId: "op-2",
        returnTo: null,
        formKey: 2,
      },
      viewerId: DEMO,
    });

    expect(content.getOpinion).toHaveBeenLastCalledWith({
      opinionId: "op-2",
      viewerId: DEMO,
    });
  });
});
