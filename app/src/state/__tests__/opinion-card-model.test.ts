import type { OpinionView } from "@melodify/content-store";

import { toOpinionCardModel } from "../opinionCardModel";

/**
 * El único mapeo de C4 a la tarjeta de C1 (BR7.10): copia los campos derivados tal
 * como llegan y pone la portada solo cuando la decisión de C5 es una URL.
 */
const OPINION: OpinionView = {
  opinionId: "op-004",
  workId: "work-002",
  workTitle: "Blinding Lights",
  workArtist: "The Weeknd",
  author: {
    authorId: "demo",
    displayName: "Usuario demo",
    handle: "demo",
    followedByMe: false,
  },
  text: "La puse una noche de vuelta a casa y ya no salió de la lista.",
  rating: 5,
  createdAt: "2026-11-04T10:00:00.000Z",
  updatedAt: "2026-11-06T18:00:00.000Z",
  likeCount: 2,
  commentCount: 1,
  likedByMe: true,
  isOwn: true,
};

describe("toOpinionCardModel", () => {
  it("pone la URL cuando la decisión del catálogo es una portada real", () => {
    const card = toOpinionCardModel({
      opinion: OPINION,
      cover: { kind: "url", value: "https://example.test/cover.png" },
    });

    expect(card.coverUrl).toBe("https://example.test/cover.png");
  });

  it("deja la portada nula cuando la decisión es el bloque con la inicial", () => {
    const card = toOpinionCardModel({
      opinion: OPINION,
      cover: { kind: "initialBlock", value: null },
    });

    expect(card.coverUrl).toBeNull();
  });

  it("aplana el autor en nombre y handle", () => {
    const card = toOpinionCardModel({
      opinion: OPINION,
      cover: { kind: "initialBlock", value: null },
    });

    expect(card.authorId).toBe("demo");
    expect(card.authorName).toBe("Usuario demo");
    expect(card.authorHandle).toBe("demo");
    expect(card.followedByMe).toBe(false);
  });

  it("copia los campos derivados sin recalcularlos", () => {
    const card = toOpinionCardModel({
      opinion: { ...OPINION, likeCount: 7, commentCount: 3, likedByMe: false },
      cover: { kind: "initialBlock", value: null },
    });

    expect(card.likeCount).toBe(7);
    expect(card.commentCount).toBe(3);
    expect(card.likedByMe).toBe(false);
  });

  it("conserva obra, valoración, texto y las dos fechas", () => {
    const card = toOpinionCardModel({
      opinion: OPINION,
      cover: { kind: "initialBlock", value: null },
    });

    expect(card.opinionId).toBe("op-004");
    expect(card.workId).toBe("work-002");
    expect(card.workTitle).toBe("Blinding Lights");
    expect(card.workArtist).toBe("The Weeknd");
    expect(card.rating).toBe(5);
    expect(card.text).toBe(OPINION.text);
    expect(card.createdAt).toBe(OPINION.createdAt);
    expect(card.updatedAt).toBe(OPINION.updatedAt);
  });
});
