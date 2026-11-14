/**
 * Las lecturas de C4 (paso 6 del plan) sobre la siembra de ejemplo.
 *
 * Aquí se comprueban dos cosas que ninguna otra capa puede demostrar: que los
 * campos derivados —`isOwn`, `likedByMe`, `followedByMe`— se calculan contra quien
 * mira en cada lectura (BR4.6) y que toda lectura que los devuelve responde `422`
 * cuando falta `viewerId`, en lugar de inventarlos. El reloj es fijo (`NOW`): las
 * fechas esperadas se escriben a partir de él y no caducan (NFR5.7).
 */
import { createContentStore, type ContentStore } from "../store";
import type {
  ContentErrorCode,
  ContentResult,
  ContentSuccessCode,
  OpinionView,
} from "../views";

const NOW = "2026-11-12T09:00:00.000Z";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const BOHEMIAN_RHAPSODY = "4u7EnebtmKWzUH433Rbtpz";

/** El orden del feed que fija la tabla de la especificación (BR4.5). */
const FEED_ORDER = [
  "op-002",
  "op-003",
  "op-009",
  "op-004",
  "op-005",
  "op-006",
  "op-010",
  "op-001",
  "op-007",
  "op-008",
];

function newStore(): ContentStore {
  return createContentStore({ now: NOW });
}

function unwrap<T, C extends ContentSuccessCode>(
  result: ContentResult<T, C>,
): T {
  if (!result.ok) {
    throw new Error(
      `Se esperaba un resultado correcto y llegó ${result.code}: ${result.message}`,
    );
  }
  return result.value;
}

function expectFailure<T, C extends ContentSuccessCode>(
  result: ContentResult<T, C>,
  code: ContentErrorCode,
): void {
  expect(result.ok).toBe(false);
  if (result.ok) {
    return;
  }
  expect(result.code).toBe(code);
}

function opinionById(opinions: OpinionView[], opinionId: string): OpinionView {
  const found = opinions.find((opinion) => opinion.opinionId === opinionId);
  if (found === undefined) {
    throw new Error(`La siembra no tiene la opinión ${opinionId}`);
  }
  return found;
}

describe("las lecturas de C4", () => {
  it("lista las diez opiniones de la más reciente a la más antigua", () => {
    const store = newStore();

    const opinions = unwrap(store.listOpinions({ viewerId: "demo" }));

    expect(opinions.map((opinion) => opinion.opinionId)).toEqual(FEED_ORDER);
  });

  it("filtra el feed por obra y conserva el orden por creación", () => {
    const store = newStore();

    const opinions = unwrap(
      store.listOpinions({ viewerId: "demo", workId: BOHEMIAN_RHAPSODY }),
    );

    // De `Bohemian Rhapsody` solo hay dos: la de Lucía (2 h) es más reciente que
    // la de la cuenta demo (3 d), y así se leen (BR4.5).
    expect(opinions.map((opinion) => opinion.opinionId)).toEqual([
      "op-002",
      "op-001",
    ]);
    expect(opinions.every((opinion) => opinion.workId === BOHEMIAN_RHAPSODY)).toBe(
      true,
    );
    const newest = opinionById(opinions, "op-002");
    expect(newest.workTitle).toBe("Bohemian Rhapsody");
    expect(newest.workArtist).toBe("Queen");
  });

  it("filtra el feed por autor y devuelve las tres opiniones de demo", () => {
    const store = newStore();

    const opinions = unwrap(
      store.listOpinions({ viewerId: "demo", authorId: "demo" }),
    );

    expect(opinions.map((opinion) => opinion.opinionId)).toEqual([
      "op-004",
      "op-001",
      "op-008",
    ]);
    expect(opinions.every((opinion) => opinion.author.authorId === "demo")).toBe(
      true,
    );
  });

  it("no lista nada sin quién mira: responde 422 en lugar de inventar los derivados", () => {
    const store = newStore();

    expectFailure(store.listOpinions({}), 422);
    // La cadena vacía es la misma ausencia: no hay identidad que comparar.
    expectFailure(store.listOpinions({ viewerId: "" }), 422);
    expectFailure(store.listOpinions({ viewerId: null }), 422);
  });

  it("devuelve una opinión con su autor, sus contadores y sus fechas", () => {
    const store = newStore();

    const opinion = unwrap(
      store.getOpinion({ opinionId: "op-002", viewerId: "demo" }),
    );

    expect(opinion).toMatchObject({
      opinionId: "op-002",
      workId: BOHEMIAN_RHAPSODY,
      workTitle: "Bohemian Rhapsody",
      workArtist: "Queen",
      author: {
        authorId: "lucia",
        displayName: "Lucía Ferrer",
        handle: "lucia",
        followedByMe: true,
      },
      rating: 4,
      createdAt: "2026-11-12T07:00:00.000Z",
      updatedAt: "2026-11-12T07:00:00.000Z",
      likeCount: 1,
      commentCount: 0,
      likedByMe: false,
      isOwn: false,
    });
    expect(opinion.text).toBe(
      "La escuché por primera vez en un viaje largo y desde entonces es mi canción de carretera. La segunda mitad es otra canción y las dos funcionan.",
    );
  });

  it("responde 422 sin quién mira y 404 si la opinión no existe", () => {
    const store = newStore();

    expectFailure(store.getOpinion({ opinionId: "op-002" }), 422);
    expectFailure(
      store.getOpinion({ opinionId: "op-999", viewerId: "demo" }),
      404,
    );
  });

  it("devuelve la identidad de demo con los contadores de Perfil: 3 opiniones y 2 siguiendo", () => {
    const store = newStore();

    const author = unwrap(store.getAuthor({ authorId: "demo", viewerId: "demo" }));

    expect(author).toEqual({
      authorId: "demo",
      displayName: "Usuario demo",
      handle: "demo",
      followedByMe: false,
      opinionCount: 3,
      followingCount: 2,
    });
  });

  it("responde 422 sin quién mira y 404 si el autor no existe", () => {
    const store = newStore();

    expectFailure(store.getAuthor({ authorId: "demo" }), 422);
    expectFailure(
      store.getAuthor({ authorId: "nadie", viewerId: "demo" }),
      404,
    );
  });

  it("lista los dos seguidos de demo de la más reciente a la más antigua", () => {
    const store = newStore();

    const following = unwrap(
      store.listFollowing({ authorId: "demo", viewerId: "demo" }),
    );

    // Ana (4 d) es más reciente que Lucía (5 d), y ambas están seguidas (BR4.5).
    expect(following.authorId).toBe("demo");
    expect(following.followingCount).toBe(2);
    expect(following.following.map((author) => author.handle)).toEqual([
      "ana",
      "lucia",
    ]);
    expect(following.following.every((author) => author.followedByMe)).toBe(true);
  });

  it("responde 422 sin quién mira y 404 si el autor de los seguidos no existe", () => {
    const store = newStore();

    expectFailure(store.listFollowing({ authorId: "demo" }), 422);
    expectFailure(
      store.listFollowing({ authorId: "nadie", viewerId: "demo" }),
      404,
    );
  });

  it("lista quién dio me gusta a una opinión, con su fecha", () => {
    const store = newStore();

    const likes = unwrap(store.listLikes({ opinionId: "op-001" }));

    expect(likes.opinionId).toBe("op-001");
    expect(likes.likeCount).toBe(1);
    expect(likes.likes).toHaveLength(1);
    expect(likes.likes[0]).toMatchObject({
      opinionId: "op-001",
      author: { authorId: "lucia", displayName: "Lucía Ferrer" },
      createdAt: new Date(Date.parse(NOW) - 2 * DAY_MS).toISOString(),
    });

    // Una opinión sin me gusta devuelve la lista vacía, no un fallo.
    const empty = unwrap(store.listLikes({ opinionId: "op-008" }));
    expect(empty).toEqual({ opinionId: "op-008", likeCount: 0, likes: [] });

    expectFailure(store.listLikes({ opinionId: "op-999" }), 404);
  });

  it("lista los comentarios de una opinión y responde 404 si no existe", () => {
    const store = newStore();

    const comments = unwrap(store.listComments({ opinionId: "op-001" }));

    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      opinionId: "op-001",
      text: "Totalmente de acuerdo.",
      author: { authorId: "ana", displayName: "Ana Ríos" },
      createdAt: new Date(Date.parse(NOW) - DAY_MS).toISOString(),
    });

    // `op-002` no recibió comentarios: lista vacía y sin fallo.
    expect(unwrap(store.listComments({ opinionId: "op-002" }))).toEqual([]);

    expectFailure(store.listComments({ opinionId: "op-999" }), 404);
  });

  it("marca `isOwn` solo en las opiniones de quien mira", () => {
    const store = newStore();

    const forDemo = unwrap(store.listOpinions({ viewerId: "demo" }));
    expect(
      forDemo
        .filter((opinion) => opinion.isOwn)
        .map((opinion) => opinion.opinionId),
    ).toEqual(["op-004", "op-001", "op-008"]);

    // Con otra identidad el mismo contenido se ve distinto: eso es BR4.6.
    const forLucia = unwrap(store.listOpinions({ viewerId: "lucia" }));
    expect(
      forLucia
        .filter((opinion) => opinion.isOwn)
        .map((opinion) => opinion.opinionId),
    ).toEqual(["op-002", "op-007"]);
  });

  it("calcula `likedByMe` y `followedByMe` contra quien mira, no contra el autor", () => {
    const store = newStore();

    const forLucia = unwrap(store.listOpinions({ viewerId: "lucia" }));
    // Lucía dio el me gusta de `op-001` en la siembra y no sigue a nadie.
    expect(opinionById(forLucia, "op-001").likedByMe).toBe(true);
    expect(
      forLucia.filter((opinion) => opinion.likedByMe).map((o) => o.opinionId),
    ).toEqual(["op-001"]);
    expect(opinionById(forLucia, "op-001").author.followedByMe).toBe(false);

    const forDemo = unwrap(store.listOpinions({ viewerId: "demo" }));
    // La cuenta demo no ha dado ningún me gusta, pero sí sigue a Lucía y a Ana.
    expect(forDemo.some((opinion) => opinion.likedByMe)).toBe(false);
    expect(opinionById(forDemo, "op-002").author.followedByMe).toBe(true);
    expect(opinionById(forDemo, "op-007").author.followedByMe).toBe(true);
    expect(opinionById(forDemo, "op-005").author.followedByMe).toBe(false);
    // Las opiniones de `demo` no cambian de forma por mirarlas desde otra cuenta.
    expect(opinionById(forLucia, "op-004").isOwn).toBe(false);
    expect(opinionById(forDemo, "op-004").isOwn).toBe(true);
    expect(opinionById(forDemo, "op-004").createdAt).toBe(
      new Date(Date.parse(NOW) - DAY_MS).toISOString(),
    );
    expect(opinionById(forDemo, "op-003").createdAt).toBe(
      new Date(Date.parse(NOW) - 5 * HOUR_MS).toISOString(),
    );
  });
});
