/**
 * Derivación desde C4 (pasos 5 y 6 del plan). La siembra real se usa con reloj
 * fijado para no duplicar las edades: si U2 cambiara un desfase, esta prueba y la
 * pantalla verían el mismo cambio. El resto de casos aísla una regla cada uno.
 */
import type {
  CommentView,
  ContentResult,
  LikeList,
  OpinionView,
} from "@melodify/content-store";
import { deriveActivityEvents } from "../derive";
import { createFixtureContentStore } from "./activity-fixture";

const NOW = "2026-11-19T12:00:00.000Z";

function author(authorId: string, handle = authorId) {
  return {
    authorId,
    displayName: handle,
    handle,
    followedByMe: false,
  };
}

function opinion(opinionId: string, overrides: Partial<OpinionView> = {}): OpinionView {
  return {
    opinionId,
    workId: `work-${opinionId}`,
    workTitle: "Blinding Lights",
    workArtist: "The Weeknd",
    author: author("demo"),
    text: "Opinión de ejemplo.",
    rating: 5,
    createdAt: NOW,
    updatedAt: NOW,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: true,
    ...overrides,
  };
}

function opinions(value: OpinionView[]): ContentResult<OpinionView[]> {
  return { ok: true, code: 200, value };
}

function likes(value: LikeList): ContentResult<LikeList> {
  return { ok: true, code: 200, value };
}

function comments(value: CommentView[]): ContentResult<CommentView[]> {
  return { ok: true, code: 200, value };
}

describe("deriveActivityEvents", () => {
  it("deriva los ocho eventos de la siembra y descarta los me gusta ajenos", () => {
    const store = createFixtureContentStore({ now: NOW });

    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: (input) => store.listOpinions(input),
      listLikes: (input) => store.listLikes(input),
      listComments: (input) => store.listComments(input),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.now).toBe(Date.parse(NOW));
    expect(result.events.map((event) => event.eventId).sort()).toEqual([
      "comment:cm-001",
      "comment:cm-002",
      "comment:cm-003",
      "like:op-001:lucia",
      "like:op-004:ana",
      "own:op-001",
      "own:op-004",
      "own:op-008",
    ]);
    expect(result.events).toHaveLength(8);
    expect(
      result.events.find((event) => event.eventId === "like:op-004:ana"),
    ).toMatchObject({
      kind: "likeReceived",
      opinionId: "op-004",
      workTitle: "Blinding Lights",
      createdAt: "2026-11-19T09:00:00.000Z",
      actorHandle: "ana",
    });
    expect(
      result.events.find((event) => event.eventId === "comment:cm-002"),
    ).toMatchObject({
      kind: "commentReceived",
      opinionId: "op-004",
      createdAt: "2026-11-19T10:00:00.000Z",
      actorHandle: "bruno",
    });
    expect(
      result.events.some((event) => event.eventId === "like:op-002:bruno"),
    ).toBe(false);
    expect(
      result.events.some((event) => event.eventId === "like:op-009:marcos"),
    ).toBe(false);
  });

  it("usa createdAt de la publicación aunque la opinión esté editada", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () =>
        opinions([
          opinion("op-004", {
            createdAt: "2026-11-18T12:00:00.000Z",
            updatedAt: "2026-11-19T08:00:00.000Z",
          }),
        ]),
      listLikes: () => likes({ opinionId: "op-004", likeCount: 0, likes: [] }),
      listComments: () => comments([]),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.events[0]).toMatchObject({
      eventId: "own:op-004",
      createdAt: "2026-11-18T12:00:00.000Z",
    });
  });

  it("descarta likes y comentarios de la propia cuenta", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () => opinions([opinion("op-001", { likeCount: 2, commentCount: 2 })]),
      listLikes: () =>
        likes({
          opinionId: "op-001",
          likeCount: 2,
          likes: [
            {
              opinionId: "op-001",
              author: author("demo"),
              createdAt: NOW,
            },
            {
              opinionId: "op-001",
              author: author("lucia"),
              createdAt: NOW,
            },
          ],
        }),
      listComments: () =>
        comments([
          {
            commentId: "cm-propio",
            opinionId: "op-001",
            author: author("demo"),
            text: "Mío.",
            createdAt: NOW,
          },
          {
            commentId: "cm-ajeno",
            opinionId: "op-001",
            author: author("ana"),
            text: "Ajeno.",
            createdAt: NOW,
          },
        ]),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.events.map((event) => event.eventId).sort()).toEqual([
      "comment:cm-ajeno",
      "like:op-001:lucia",
      "own:op-001",
    ]);
  });

  it("no lee listas cuando los contadores son cero", () => {
    let likeReads = 0;
    let commentReads = 0;

    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () => opinions([opinion("op-001")]),
      listLikes: () => {
        likeReads += 1;
        return likes({ opinionId: "op-001", likeCount: 0, likes: [] });
      },
      listComments: () => {
        commentReads += 1;
        return comments([]);
      },
    });

    expect(result.ok).toBe(true);
    expect(likeReads).toBe(0);
    expect(commentReads).toBe(0);
  });

  it("no mezcla opiniones de otros autores", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () =>
        opinions([opinion("op-001"), opinion("op-002", { author: author("lucia") })]),
      listLikes: () => {
        throw new Error("No se debe leer una opinión ajena.");
      },
      listComments: () => {
        throw new Error("No se debe leer una opinión ajena.");
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.events.map((event) => event.eventId)).toEqual(["own:op-001"]);
  });

  it("devuelve fallo cuando falla listOpinions", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () => ({ ok: false, code: 422, message: "Fallo de C4." }),
      listLikes: () => {
        throw new Error("No se debe llegar aquí.");
      },
      listComments: () => {
        throw new Error("No se debe llegar aquí.");
      },
    });

    expect(result).toEqual({ ok: false });
  });

  it("devuelve fallo cuando falla la lectura de me gusta", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () => opinions([opinion("op-001", { likeCount: 1 })]),
      listLikes: () => ({ ok: false, code: 422, message: "Fallo de C4." }),
      listComments: () => comments([]),
    });

    expect(result).toEqual({ ok: false });
  });

  it("devuelve fallo cuando falla la lectura de comentarios", () => {
    const result = deriveActivityEvents({
      viewerId: "demo",
      now: NOW,
      listOpinions: () => opinions([opinion("op-001", { commentCount: 1 })]),
      listLikes: () => likes({ opinionId: "op-001", likeCount: 0, likes: [] }),
      listComments: () => ({ ok: false, code: 422, message: "Fallo de C4." }),
    });

    expect(result).toEqual({ ok: false });
  });
});
