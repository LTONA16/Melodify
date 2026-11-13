/**
 * La construcción de C4: cada almacén nace con su propio estado y su propia
 * revisión, y `seed` permite sustituir la siembra de ejemplo por una mínima.
 *
 * Estas pruebas no leen el reloj de la máquina: `NOW` fija el instante y las fechas
 * esperadas se escriben a partir de él (NFR5.7).
 */
import { createContentStore, type ContentStore } from "../store";
import { SEED_OPINIONS } from "../seed";

const NOW = "2026-11-12T09:00:00.000Z";

function feedOf(store: ContentStore) {
  const result = store.listOpinions({ viewerId: "demo" });
  if (!result.ok) {
    throw new Error(`El feed no se pudo leer: ${result.code} ${result.message}`);
  }
  return result.value;
}

describe("createContentStore", () => {
  it("da a cada almacén su propio estado: escribir en uno no toca al otro", () => {
    const first = createContentStore({ now: NOW });
    const second = createContentStore({ now: NOW });

    const created = first.createOpinion({
      authorId: "marcos",
      workId: "4LRPiXqCikLlN15c3yImP7",
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "Una sola escucha y ya la tengo pegada.",
      rating: 4,
    });

    expect(created.ok).toBe(true);
    expect(feedOf(first)).toHaveLength(11);
    expect(feedOf(second)).toHaveLength(10);
    expect(second.countOpinions("4LRPiXqCikLlN15c3yImP7")).toBe(0);
  });

  it("sustituye la siembra por una lista vacía cuando se pide", () => {
    const store = createContentStore({ now: NOW, seed: {} });

    expect(feedOf(store)).toEqual([]);
    expect(store.countOpinions("4u7EnebtmKWzUH433Rbtpz")).toBe(0);
  });

  it("acepta una siembra mínima de una sola opinión", () => {
    const store = createContentStore({
      now: NOW,
      seed: {
        authors: [{ authorId: "demo", displayName: "Usuario demo", handle: "demo" }],
        works: [
          {
            workId: "work-1",
            title: "Obra de prueba",
            artist: "Artista de prueba",
          },
        ],
        opinions: [
          {
            opinionId: "opinion-1",
            authorId: "demo",
            workId: "work-1",
            text: "Texto de la única opinión.",
            rating: 4,
            ageMs: 0,
          },
        ],
      },
    });

    const opinions = feedOf(store);

    expect(opinions).toHaveLength(1);
    expect(opinions[0]).toMatchObject({
      opinionId: "opinion-1",
      workId: "work-1",
      workTitle: "Obra de prueba",
      workArtist: "Artista de prueba",
      text: "Texto de la única opinión.",
      rating: 4,
      createdAt: NOW,
      updatedAt: NOW,
      isOwn: true,
      likeCount: 0,
      commentCount: 0,
    });
  });

  it("arranca en la revisión cero y la primera suscripción la trae entera", () => {
    const store = createContentStore({ now: NOW });
    const listener = jest.fn();

    const subscription = store.subscribeContent("demo", listener);

    expect(subscription.ok).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        revision: 0,
        opinions: expect.any(Array),
      }),
    );
  });

  it("usa el mismo instante tanto si `now` llega como cadena, como epoch o como Date", () => {
    const asString = feedOf(createContentStore({ now: NOW }))[0];
    const asEpoch = feedOf(
      createContentStore({ now: Date.parse(NOW) }),
    )[0];
    const asDate = feedOf(createContentStore({ now: new Date(NOW) }))[0];

    expect(asEpoch?.createdAt).toBe(asString?.createdAt);
    expect(asDate?.createdAt).toBe(asString?.createdAt);
  });

  it("no comparte los objetos de la siembra con el estado del almacén", () => {
    const before = JSON.stringify(SEED_OPINIONS);
    const store = createContentStore({ now: NOW });

    store.createOpinion({
      authorId: "lucia",
      workId: "4LRPiXqCikLlN15c3yImP7",
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "La pongo en bucle desde ayer.",
      rating: 5,
    });

    expect(JSON.stringify(SEED_OPINIONS)).toBe(before);
  });
});
