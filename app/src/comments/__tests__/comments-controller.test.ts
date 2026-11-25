import type { CommentView, ContentResult } from "@melodify/content-store";
import type { CommentSheetState } from "@melodify/app-shell";
import type { SessionView } from "@melodify/app-session";

import {
  COMMENT_COUNTER_FROM,
  createCommentsController,
  type CommentsContentPort,
  type CommentsSessionPort,
} from "../createCommentsController";

/**
 * El controlador de la hoja (U3): los seis estados de la especificación —cerrada,
 * cargando, vacía, con lista, error de carga y error de envío—, más la regla que
 * los distingue: un fallo de lectura se reintenta con `retry()` y un fallo de
 * escritura con `submit()`, sin borrar lo que ya estaba leído (BR14.5).
 */
function commentView(
  commentId: string,
  text: string,
  overrides: Partial<CommentView> = {},
): CommentView {
  return {
    commentId,
    opinionId: "op-4",
    author: {
      authorId: "ana",
      displayName: "Ana Ruiz",
      handle: "anaruiz",
      followedByMe: false,
    },
    text,
    createdAt: "2026-11-10T09:00:00.000Z",
    ...overrides,
  };
}

const SEED: CommentView[] = [
  commentView("cm-1", "Totalmente de acuerdo."),
  commentView("cm-2", "A mí me pasó lo mismo."),
];

function createContentDouble() {
  let nextList: ContentResult<CommentView[]> = {
    ok: true,
    code: 200,
    value: SEED,
  };
  let nextAdd: ContentResult<CommentView, 201> | null = null;

  return {
    listComments: jest.fn((): ContentResult<CommentView[]> => nextList),
    addComment: jest.fn((): ContentResult<CommentView, 201> => {
      if (nextAdd !== null) {
        return nextAdd;
      }

      return {
        ok: true,
        code: 201,
        value: commentView("cm-new", "Buenísima"),
      };
    }),
    /** Lo que la próxima lectura devolverá. */
    willList(result: ContentResult<CommentView[]>): void {
      nextList = result;
    },
    /** Lo que el próximo envío devolverá. `null` vuelve al éxito por defecto. */
    willAdd(result: ContentResult<CommentView, 201> | null): void {
      nextAdd = result;
    },
  };
}

function createSessionDouble(
  authorId: string | null = "demo",
): CommentsSessionPort {
  const listeners = new Set<(view: SessionView) => void>();

  return {
    subscribeSession(listener) {
      listeners.add(listener);

      if (authorId !== null) {
        listener({
          status: "signedIn",
          authorId,
          remembered: true,
        });
      }

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function setup(options: { authorId?: string | null } = {}) {
  const content = createContentDouble();
  const session = createSessionDouble(options.authorId);
  const controller = createCommentsController({
    content: content as unknown as CommentsContentPort,
    session,
  });

  return { content, session, controller };
}

/** Recoge cada estado que el controlador publica, en orden. */
function record(controller: ReturnType<typeof createCommentsController>): {
  states: CommentSheetState[];
  stop: () => void;
} {
  const states: CommentSheetState[] = [];
  const stop = controller.subscribe((state) => states.push(state));

  return { states, stop };
}

describe("createCommentsController — el estado inicial", () => {
  it("arranca cerrada, sin comentarios y con los dos topes de C4", () => {
    const { controller } = setup();

    expect(controller.state).toEqual({
      opinionId: null,
      comments: [],
      status: "empty",
      failed: false,
      maxLength: 300,
      counterFrom: COMMENT_COUNTER_FROM,
    });
    expect(COMMENT_COUNTER_FROM).toBe(250);
  });

  it("emite el estado vigente al establecerse la suscripción", () => {
    const { controller } = setup();

    const seen: CommentSheetState[] = [];
    const stop = controller.subscribe((state) => seen.push(state));

    expect(seen).toEqual([controller.state]);

    stop();
  });

  it("deja de emitir tras darse de baja", () => {
    const { controller, content } = setup();
    const seen: CommentSheetState[] = [];
    const stop = controller.subscribe((state) => seen.push(state));

    stop();
    content.willList({ ok: true, code: 200, value: [] });
    controller.open("op-4");

    expect(seen).toHaveLength(1);
  });
});

describe("createCommentsController — abrir y leer", () => {
  it("pasa por cargando y llega a vacía cuando no hay comentarios", () => {
    const { controller, content } = setup();
    content.willList({ ok: true, code: 200, value: [] });

    const { states } = record(controller);
    controller.open("op-4");

    expect(states.map((state) => state.status)).toEqual(["empty", "loading", "empty"]);
    expect(states.at(-1)?.opinionId).toBe("op-4");
  });

  it("con comentarios queda lista y conserva el orden de la lectura", () => {
    const { controller } = setup();

    controller.open("op-4");

    expect(controller.state.status).toBe("ready");
    expect(controller.state.comments.map((comment) => comment.commentId)).toEqual([
      "cm-1",
      "cm-2",
    ]);
    expect(controller.state.opinionId).toBe("op-4");
  });

  it("si la lectura falla queda en error de carga y sin lista a medias", () => {
    const { controller, content } = setup();
    controller.open("op-4");
    content.willList({ ok: false, code: 404, message: "no existe" });

    controller.retry();

    expect(controller.state.status).toBe("error");
    expect(controller.state.comments).toEqual([]);
    expect(controller.state.failed).toBe(false);
  });

  it("el reintento de la lista no hace nada con la hoja cerrada", () => {
    const { controller, content } = setup();

    controller.retry();

    expect(content.listComments).not.toHaveBeenCalled();
    expect(controller.state.opinionId).toBeNull();
  });

  it("cerrar descarta la opinión, la lista y el error de envío", () => {
    const { controller, content } = setup();
    controller.open("op-4");
    content.willAdd({ ok: false, code: 422, message: "falló" });
    controller.submit("Otra vez");

    controller.close();

    expect(controller.state).toEqual({
      opinionId: null,
      comments: [],
      status: "empty",
      failed: false,
      maxLength: 300,
      counterFrom: 250,
    });
  });
});

describe("createCommentsController — escribir", () => {
  it("un texto vacío o en blanco no escribe y devuelve falso", () => {
    const { controller, content } = setup();
    controller.open("op-4");

    expect(controller.submit("   ")).toBe(false);
    expect(content.addComment).not.toHaveBeenCalled();
    expect(controller.state.failed).toBe(false);
  });

  it("con la hoja cerrada no escribe", () => {
    const { controller, content } = setup();

    expect(controller.submit("Hola")).toBe(false);
    expect(content.addComment).not.toHaveBeenCalled();
  });

  it("escribe con el autor de la sesión y añade el comentario al final", () => {
    const { controller, content } = setup();

    controller.open("op-4");
    const wrote = controller.submit("  Buenísima  ");

    expect(wrote).toBe(true);
    expect(content.addComment).toHaveBeenCalledWith({
      opinionId: "op-4",
      authorId: "demo",
      text: "Buenísima",
    });
    expect(controller.state.status).toBe("ready");
    expect(controller.state.comments).toHaveLength(3);
    expect(controller.state.comments.at(-1)?.text).toBe("Buenísima");
    expect(controller.state.comments.at(-1)?.commentId).toBe("cm-new");
  });

  it("el primer comentario de una lista vacía la deja lista, no vacía", () => {
    const { controller, content } = setup();
    content.willList({ ok: true, code: 200, value: [] });
    controller.open("op-4");

    controller.submit("Buenísima");

    expect(controller.state.status).toBe("ready");
    expect(controller.state.comments).toHaveLength(1);
  });

  it("si la escritura falla marca `failed` sin tocar la lista", () => {
    const { controller, content } = setup();
    controller.open("op-4");
    content.willAdd({ ok: false, code: 422, message: "falló" });

    const wrote = controller.submit("Otra vez");

    expect(wrote).toBe(false);
    expect(controller.state.failed).toBe(true);
    expect(controller.state.comments.map((comment) => comment.commentId)).toEqual([
      "cm-1",
      "cm-2",
    ]);
    expect(controller.state.status).toBe("ready");
  });

  it("el reintento del envío limpia `failed` y añade el comentario", () => {
    const { controller, content } = setup();
    controller.open("op-4");
    content.willAdd({ ok: false, code: 422, message: "falló" });
    controller.submit("Otra vez");
    content.willAdd(null);

    const wrote = controller.submit("Otra vez");

    expect(wrote).toBe(true);
    expect(controller.state.failed).toBe(false);
    expect(controller.state.comments.at(-1)?.text).toBe("Buenísima");
  });

  it("sin sesión resuelta no escribe en nombre de nadie", () => {
    const { controller, content } = setup({ authorId: null });
    controller.open("op-4");

    expect(controller.submit("Hola")).toBe(false);
    expect(content.addComment).not.toHaveBeenCalled();
    expect(controller.state.failed).toBe(true);
  });
});
