import type { CommentView } from "@melodify/content-store";

import { toCommentModel } from "../toCommentModel";

/**
 * El único mapeo de C4 a C1 (U3): nombre y handle planos, texto y fecha tal como
 * están. El sistema de diseño no sabe qué es un autor de C4, así que todo lo que
 * necesita viaja aquí (LC-2).
 */
const VIEW: CommentView = {
  commentId: "cm-7",
  opinionId: "op-4",
  author: {
    authorId: "ana",
    displayName: "Ana Ruiz",
    handle: "anaruiz",
    followedByMe: true,
  },
  text: "Totalmente de acuerdo.",
  createdAt: "2026-11-10T09:00:00.000Z",
};

describe("toCommentModel", () => {
  it("lleva el identificador y el texto sin tocarlos", () => {
    const model = toCommentModel(VIEW);

    expect(model.commentId).toBe("cm-7");
    expect(model.text).toBe("Totalmente de acuerdo.");
  });

  it("aplana el autor a nombre y handle", () => {
    const model = toCommentModel(VIEW);

    expect(model.authorName).toBe("Ana Ruiz");
    expect(model.authorHandle).toBe("anaruiz");
  });

  it("conserva la fecha de creación", () => {
    expect(toCommentModel(VIEW).createdAt).toBe("2026-11-10T09:00:00.000Z");
  });

  it("no arrastra campos que C1 no conoce", () => {
    const model = toCommentModel(VIEW);

    expect(Object.keys(model).sort()).toEqual([
      "authorHandle",
      "authorName",
      "commentId",
      "createdAt",
      "text",
    ]);
  });
});
