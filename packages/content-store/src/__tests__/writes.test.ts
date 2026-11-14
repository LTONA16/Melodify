/**
 * Las escrituras de C4 (paso 8 del plan): publicar, editar, dar me gusta, comentar
 * y seguir, con sus códigos y sus reglas (BR4.3, BR4.4, BR4.7, BR4.8).
 *
 * Las escrituras son lo que U3 cablea a la interfaz, así que aquí se fija lo que la
 * interfaz puede esperar: cada operación devuelve la vista ya calculada, ninguna
 * muta el estado anterior —un oyente que guardó la emisión previa sigue viendo lo
 * que leyó— y ninguna se salta la identidad. `NOW` fija el reloj para que las
 * fechas y el orden no dependan de la máquina (NFR5.7).
 */
import { createContentStore, type ContentStore } from "../store";
import type {
  ContentErrorCode,
  ContentResult,
  ContentSnapshot,
  ContentSuccessCode,
  OpinionView,
} from "../views";

const NOW = "2026-11-12T09:00:00.000Z";

const BOHEMIAN_RHAPSODY = "4u7EnebtmKWzUH433Rbtpz";
const BLINDING_LIGHTS = "0VjIjW4GlUZAMYd2vXMi3b";
const SMELLS_LIKE_TEEN_SPIRIT = "5ghIJDpPoe3CfHMGu71E6T";
const AS_IT_WAS = "4LRPiXqCikLlN15c3yImP7";

type Listener = jest.Mock<void, [ContentSnapshot]>;

function newListener(): Listener {
  return jest.fn<void, [ContentSnapshot]>();
}

function snapshotAt(listener: Listener, index: number): ContentSnapshot {
  const call = listener.mock.calls[index];
  if (call === undefined) {
    throw new Error(`El oyente no recibió la emisión ${index}.`);
  }
  return call[0];
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

function opinionOf(opinions: OpinionView[], opinionId: string): OpinionView {
  const found = opinions.find((opinion) => opinion.opinionId === opinionId);
  if (found === undefined) {
    throw new Error(`El feed no tiene la opinión ${opinionId}`);
  }
  return found;
}

describe("las escrituras de C4", () => {
  let store: ContentStore;

  beforeEach(() => {
    store = createContentStore({ now: NOW });
  });

  function feed(): OpinionView[] {
    return unwrap(store.listOpinions({ viewerId: "demo" }));
  }

  describe("createOpinion", () => {
    it("crea la opinión con 201 y la devuelve sellada con el reloj inyectado", () => {
      const created = store.createOpinion({
        authorId: "demo",
        workId: AS_IT_WAS,
        workTitle: "As It Was",
        workArtist: "Harry Styles",
        text: "  La pongo en bucle desde ayer.  ",
        rating: 5,
      });

      expect(created.ok).toBe(true);
      if (!created.ok) {
        return;
      }
      expect(created.code).toBe(201);
      expect(created.value).toMatchObject({
        workId: AS_IT_WAS,
        workTitle: "As It Was",
        workArtist: "Harry Styles",
        author: {
          authorId: "demo",
          displayName: "Usuario demo",
          handle: "demo",
        },
        rating: 5,
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
        isOwn: true,
      });
      // El texto se guarda recortado; los bordes no son contenido.
      expect(created.value.text).toBe("La pongo en bucle desde ayer.");
      expect(created.value.createdAt).toBe("2026-11-12T09:00:00.001Z");
      expect(created.value.updatedAt).toBe(created.value.createdAt);
    });

    it("deja la opinión nueva la primera del feed y sube la revisión", () => {
      const listener = newListener();
      unwrap(store.subscribeContent("demo", listener));

      const created = unwrap(
        store.createOpinion({
          authorId: "demo",
          workId: AS_IT_WAS,
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: "Recién publicada y ya arriba.",
          rating: 4,
        }),
      );

      const opinions = feed();
      expect(opinions).toHaveLength(11);
      expect(opinions.map((opinion) => opinion.opinionId)[0]).toBe(
        created.opinionId,
      );
      // Es la única de demo sobre esa obra y la única que la obra tiene (BR4.3).
      expect(store.countOpinions(AS_IT_WAS)).toBe(1);
      expect(listener).toHaveBeenCalledTimes(2);
      const snapshot = snapshotAt(listener, 1);
      expect(snapshot.revision).toBe(1);
    });

    it("responde 409 si esa persona ya opinó sobre esa obra y no escribe nada", () => {
      const listener = newListener();
      unwrap(store.subscribeContent("demo", listener));

      const duplicated = store.createOpinion({
        authorId: "demo",
        workId: BOHEMIAN_RHAPSODY,
        workTitle: "Bohemian Rhapsody",
        workArtist: "Queen",
        text: "Otra opinión sobre la misma obra.",
        rating: 3,
      });

      expectFailure(duplicated, 409);
      expect(feed()).toHaveLength(10);
      expect(store.countOpinions(BOHEMIAN_RHAPSODY)).toBe(2);
    });

    it("responde 422 con la valoración fuera de rango", () => {
      for (const rating of [0, 6, 2.5]) {
        const result = store.createOpinion({
          authorId: "demo",
          workId: AS_IT_WAS,
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: "Texto válido con valoración imposible.",
          rating,
        });
        expectFailure(result, 422);
      }
      expect(feed()).toHaveLength(10);
    });

    it("responde 422 con el texto vacío o en blanco", () => {
      for (const text of ["", "   ", "\n\t "]) {
        const result = store.createOpinion({
          authorId: "demo",
          workId: AS_IT_WAS,
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text,
          rating: 4,
        });
        expectFailure(result, 422);
      }
      expect(feed()).toHaveLength(10);
    });

    it("responde 422 si quien publica no existe y no crea la obra", () => {
      const result = store.createOpinion({
        authorId: "fantasma",
        workId: "obra-inventada",
        workTitle: "Obra inventada",
        workArtist: "Nadie",
        text: "Una opinión sin autor real.",
        rating: 4,
      });

      expectFailure(result, 422);
      expect(store.countOpinions("obra-inventada")).toBe(0);
    });
  });

  describe("updateOpinion", () => {
    it("edita la propia con 200: sella `updatedAt` y deja `createdAt` intacto", () => {
      const before = unwrap(
        store.getOpinion({ opinionId: "op-004", viewerId: "demo" }),
      );

      const edited = unwrap(
        store.updateOpinion({
          opinionId: "op-004",
          authorId: "demo",
          viewerId: "demo",
          text: "La producción sigue siendo una clase de cómo hacer mucho con poco.",
          rating: 3,
        }),
      );

      expect(edited.text).toBe(
        "La producción sigue siendo una clase de cómo hacer mucho con poco.",
      );
      expect(edited.rating).toBe(3);
      expect(edited.createdAt).toBe(before.createdAt);
      expect(Date.parse(edited.updatedAt)).toBeGreaterThan(
        Date.parse(before.updatedAt),
      );
      expect(edited.isOwn).toBe(true);

      // Editar no crea una segunda opinión ni mueve su lugar en el feed (BR4.4).
      const opinions = feed();
      expect(opinions.filter((opinion) => opinion.opinionId === "op-004")).toHaveLength(
        1,
      );
      expect(opinions.map((opinion) => opinion.opinionId)[3]).toBe("op-004");
      expect(store.countOpinions(BLINDING_LIGHTS)).toBe(2);
      expect(opinionOf(opinions, "op-004").rating).toBe(3);
    });

    it("responde 403 al editar la opinión ajena y no la modifica", () => {
      const before = unwrap(
        store.getOpinion({ opinionId: "op-002", viewerId: "demo" }),
      );

      const forbidden = store.updateOpinion({
        opinionId: "op-002",
        authorId: "demo",
        viewerId: "demo",
        text: "Me apropio de la opinión de otra persona.",
        rating: 1,
      });

      expectFailure(forbidden, 403);
      const after = unwrap(
        store.getOpinion({ opinionId: "op-002", viewerId: "demo" }),
      );
      expect(after.text).toBe(before.text);
      expect(after.rating).toBe(before.rating);
      expect(after.updatedAt).toBe(before.updatedAt);
    });

    it("responde 404 si la opinión no existe y 422 sin quién mira", () => {
      expectFailure(
        store.updateOpinion({
          opinionId: "op-999",
          authorId: "demo",
          viewerId: "demo",
          text: "No hay nada que editar.",
        }),
        404,
      );

      expectFailure(
        store.updateOpinion({
          opinionId: "op-004",
          authorId: "demo",
          text: "Sin identidad no se calculan los derivados.",
        }),
        422,
      );
    });

    it("responde 422 con el texto o la valoración fuera de rango", () => {
      expectFailure(
        store.updateOpinion({
          opinionId: "op-004",
          authorId: "demo",
          viewerId: "demo",
          rating: 6,
        }),
        422,
      );
      expectFailure(
        store.updateOpinion({
          opinionId: "op-004",
          authorId: "demo",
          viewerId: "demo",
          text: "   ",
        }),
        422,
      );

      const unchanged = unwrap(
        store.getOpinion({ opinionId: "op-004", viewerId: "demo" }),
      );
      expect(unchanged.rating).toBe(5);
      expect(unchanged.text).toContain("Me costó entenderla");
    });
  });

  describe("toggleLike", () => {
    it("pone el me gusta y devuelve el contador con `likedByMe`", () => {
      const result = unwrap(
        store.toggleLike({
          opinionId: "op-008",
          authorId: "demo",
        }),
      );

      expect(result).toEqual({
        opinionId: "op-008",
        likeCount: 1,
        likedByMe: true,
      });

      const opinion = unwrap(
        store.getOpinion({ opinionId: "op-008", viewerId: "demo" }),
      );
      expect(opinion.likeCount).toBe(1);
      expect(opinion.likedByMe).toBe(true);
      // El me gusta es de quien lo dio, no de quien escribió la opinión (BR4.6).
      expect(
        unwrap(store.getOpinion({ opinionId: "op-008", viewerId: "lucia" }))
          .likedByMe,
      ).toBe(false);
    });

    it("quita el me gusta que ya existía en la siembra", () => {
      const result = unwrap(
        store.toggleLike({
          opinionId: "op-001",
          authorId: "lucia",
        }),
      );

      expect(result).toEqual({
        opinionId: "op-001",
        likeCount: 0,
        likedByMe: false,
      });
      expect(
        unwrap(store.getOpinion({ opinionId: "op-001", viewerId: "lucia" }))
          .likedByMe,
      ).toBe(false);
      expect(unwrap(store.listLikes({ opinionId: "op-001" })).likes).toEqual([]);
    });

    it("responde 404 si la opinión no existe y no notifica a nadie", () => {
      const listener = newListener();
      unwrap(store.subscribeContent("demo", listener));

      expectFailure(
        store.toggleLike({ opinionId: "op-999", authorId: "demo" }),
        404,
      );

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("addComment", () => {
    it("crea el comentario con 201 y sube el contador de la opinión", () => {
      const created = store.addComment({
        opinionId: "op-002",
        authorId: "demo",
        text: "  Coincido con la parte del viaje largo.  ",
      });

      expect(created.ok).toBe(true);
      if (!created.ok) {
        return;
      }
      expect(created.code).toBe(201);
      expect(created.value).toMatchObject({
        opinionId: "op-002",
        text: "Coincido con la parte del viaje largo.",
        author: { authorId: "demo", handle: "demo" },
        createdAt: "2026-11-12T09:00:00.001Z",
      });
      expect(created.value.commentId).toEqual(expect.any(String));

      const opinion = unwrap(
        store.getOpinion({ opinionId: "op-002", viewerId: "demo" }),
      );
      expect(opinion.commentCount).toBe(1);
      expect(
        unwrap(store.listComments({ opinionId: "op-002" })).map(
          (comment) => comment.text,
        ),
      ).toContain("Coincido con la parte del viaje largo.");
    });

    it("responde 422 con el texto vacío y 404 si la opinión no existe", () => {
      for (const text of ["", "   "]) {
        expectFailure(
          store.addComment({ opinionId: "op-002", authorId: "demo", text }),
          422,
        );
      }

      expectFailure(
        store.addComment({
          opinionId: "op-999",
          authorId: "demo",
          text: "Comentario a ninguna parte.",
        }),
        404,
      );
    });
  });

  describe("toggleFollow", () => {
    it("responde 409 contra uno mismo (BR4.8)", () => {
      expectFailure(
        store.toggleFollow({ authorId: "demo", followerId: "demo" }),
        409,
      );
    });

    it("pone y quita el seguimiento con los contadores correctos", () => {
      // `demo` ya sigue a Lucía: el primer toque la deja de seguir.
      const removed = unwrap(
        store.toggleFollow({ authorId: "lucia", followerId: "demo" }),
      );
      expect(removed).toEqual({
        authorId: "lucia",
        followedByMe: false,
        followerCount: 0,
        viewerFollowingCount: 1,
      });

      const followed = unwrap(
        store.toggleFollow({ authorId: "lucia", followerId: "demo" }),
      );
      expect(followed).toEqual({
        authorId: "lucia",
        followedByMe: true,
        followerCount: 1,
        viewerFollowingCount: 2,
      });
      expect(
        unwrap(store.getAuthor({ authorId: "demo", viewerId: "demo" }))
          .followingCount,
      ).toBe(2);
    });

    it("actualiza el «N siguiendo» de quien actúa al seguir a alguien nuevo", () => {
      const followed = unwrap(
        store.toggleFollow({ authorId: "bruno", followerId: "demo" }),
      );

      expect(followed.followedByMe).toBe(true);
      expect(followed.followerCount).toBe(1);
      expect(followed.viewerFollowingCount).toBe(3);
      expect(
        unwrap(store.getAuthor({ authorId: "demo", viewerId: "demo" }))
          .followingCount,
      ).toBe(3);
      expect(
        unwrap(store.listFollowing({ authorId: "demo", viewerId: "demo" }))
          .following.map((author) => author.handle),
      ).toContain("bruno");
    });

    it("responde 404 si el autor o quien sigue no existen", () => {
      expectFailure(
        store.toggleFollow({ authorId: "nadie", followerId: "demo" }),
        404,
      );
      expectFailure(
        store.toggleFollow({ authorId: "lucia", followerId: "fantasma" }),
        404,
      );
    });
  });

  it("ninguna escritura altera la emisión que un oyente ya recibió", () => {
    const listener = newListener();
    unwrap(store.subscribeContent("demo", listener));
    const first = snapshotAt(listener, 0);
    const before = JSON.stringify(first);

    unwrap(
      store.createOpinion({
        authorId: "demo",
        workId: AS_IT_WAS,
        workTitle: "As It Was",
        workArtist: "Harry Styles",
        text: "Escritura de la prueba de inmutabilidad.",
        rating: 4,
      }),
    );
    unwrap(
      store.updateOpinion({
        opinionId: "op-004",
        authorId: "demo",
        viewerId: "demo",
        text: "Texto editado en la prueba de inmutabilidad.",
        rating: 2,
      }),
    );
    unwrap(store.toggleLike({ opinionId: "op-008", authorId: "demo" }));
    unwrap(
      store.addComment({
        opinionId: "op-002",
        authorId: "demo",
        text: "Comentario de la prueba de inmutabilidad.",
      }),
    );
    unwrap(store.toggleFollow({ authorId: "bruno", followerId: "demo" }));

    // La emisión previa es una foto inmutable del estado que se leyó (BR4.7).
    expect(JSON.stringify(first)).toBe(before);
    expect(first.revision).toBe(0);
    expect(first.opinions).toHaveLength(10);
    expect(opinionOf(first.opinions, "op-004").rating).toBe(5);
    expect(opinionOf(first.opinions, "op-008").likeCount).toBe(0);
  });

  it("cada escritura notifica una sola vez y sube la revisión en uno", () => {
    const listener = newListener();
    unwrap(store.subscribeContent("demo", listener));

    unwrap(
      store.createOpinion({
        authorId: "demo",
        workId: AS_IT_WAS,
        workTitle: "As It Was",
        workArtist: "Harry Styles",
        text: "Primera escritura.",
        rating: 4,
      }),
    );
    unwrap(
      store.updateOpinion({
        opinionId: "op-001",
        authorId: "demo",
        viewerId: "demo",
        text: "Segunda escritura.",
        rating: 3,
      }),
    );
    unwrap(store.toggleLike({ opinionId: "op-008", authorId: "demo" }));
    unwrap(
      store.addComment({
        opinionId: "op-002",
        authorId: "demo",
        text: "Cuarta escritura.",
      }),
    );
    unwrap(store.toggleFollow({ authorId: "bruno", followerId: "demo" }));

    // Una emisión al suscribirse más una por escritura, sin duplicados.
    expect(listener).toHaveBeenCalledTimes(6);
    expect(listener.mock.calls.map((call) => call[0].revision)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
    expect(opinionOf(feed(), "op-008").likeCount).toBe(1);
    expect(store.countOpinions(AS_IT_WAS)).toBe(1);
    // La obra de la prueba sigue existiendo aunque nadie la haya tocado.
    expect(store.countOpinions(SMELLS_LIKE_TEEN_SPIRIT)).toBe(1);
  });
});
