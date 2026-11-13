/**
 * La siembra de C4 es la tabla de `functional-spec.md` § Semilla, y estas pruebas
 * leen sus invariantes en lugar de duplicar los números de la especificación.
 *
 * El reloj es fijo (`NOW`): ninguna prueba depende del reloj de la máquina ni espera
 * (NFR5.7). Las edades de la siembra son desfases respecto a ese instante, así que
 * una fecha esperada se escribe como `NOW` menos el desfase, nunca como una constante
 * del calendario que caducaría.
 */
import { createContentStore } from "../store";
import {
  SEED_AUTHORS,
  SEED_COMMENTS,
  SEED_FOLLOWS,
  SEED_LIKES,
  SEED_OPINIONS,
  SEED_WORKS,
} from "../seed";
import type { OpinionView } from "../views";

const NOW = "2026-11-12T09:00:00.000Z";
const HOUR_MS = 60 * 60 * 1000;

const AS_IT_WAS = "4LRPiXqCikLlN15c3yImP7";
const BOHEMIAN_RHAPSODY = "4u7EnebtmKWzUH433Rbtpz";
const BLINDING_LIGHTS = "0VjIjW4GlUZAMYd2vXMi3b";
const BAD_GUY = "2Fxmhks0bxGSBdJ92vM42m";
const SHAPE_OF_YOU = "7qiZfU4dY1lWllzX7mPBI3";
const ROLLING_IN_THE_DEEP = "4OSBTYWVwsQhGLF9NHvIbR";
const SMELLS_LIKE_TEEN_SPIRIT = "5ghIJDpPoe3CfHMGu71E6T";
const FLOWERS = "0yLdNVWF3Srea0uzk55zFn";

/** Los identificadores que la siembra publica, en el orden de la tabla. */
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

function createStore(now: string = NOW) {
  return createContentStore({ now });
}

function feedOf(store: ReturnType<typeof createStore>): OpinionView[] {
  const result = store.listOpinions({ viewerId: "demo" });
  if (!result.ok) {
    throw new Error(`El feed no se pudo leer: ${result.code} ${result.message}`);
  }
  return result.value;
}

function opinionById(opinions: OpinionView[], opinionId: string): OpinionView {
  const found = opinions.find((opinion) => opinion.opinionId === opinionId);
  if (found === undefined) {
    throw new Error(`La siembra no tiene la opinión ${opinionId}`);
  }
  return found;
}

describe("la siembra de C4", () => {
  it("trae cinco cuentas, ocho obras, diez opiniones, cuatro me gusta, tres comentarios y dos seguimientos", () => {
    expect(SEED_AUTHORS).toHaveLength(5);
    expect(SEED_WORKS).toHaveLength(8);
    expect(SEED_OPINIONS).toHaveLength(10);
    expect(SEED_LIKES).toHaveLength(4);
    expect(SEED_COMMENTS).toHaveLength(3);
    expect(SEED_FOLLOWS).toHaveLength(2);
  });

  it("tres de las diez opiniones son de la cuenta demo", () => {
    const result = createStore().listOpinions({
      viewerId: "demo",
      authorId: "demo",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value).toHaveLength(3);
    expect(result.value.map((opinion) => opinion.opinionId).sort()).toEqual([
      "op-001",
      "op-004",
      "op-008",
    ]);
  });

  it("calcula las edades contra el reloj inyectado y no contra el de la máquina", () => {
    const opinions = feedOf(createStore());

    expect(opinionById(opinions, "op-002").createdAt).toBe(
      "2026-11-12T07:00:00.000Z",
    );
    expect(opinionById(opinions, "op-008").createdAt).toBe(
      "2026-11-08T09:00:00.000Z",
    );
  });

  it("desplaza la siembra entera cuando cambia el reloj de construcción", () => {
    const later = createStore("2026-11-13T09:00:00.000Z");
    const opinions = feedOf(later);

    expect(opinionById(opinions, "op-002").createdAt).toBe(
      "2026-11-13T07:00:00.000Z",
    );
    expect(opinionById(opinions, "op-008").createdAt).toBe(
      "2026-11-09T09:00:00.000Z",
    );
  });

  it("no deja ninguna opinión sobre «As It Was»", () => {
    const store = createStore();

    expect(store.countOpinions(AS_IT_WAS)).toBe(0);
    // Las otras siete obras sí tienen al menos una: la obra vacía es una variante
    // real del catálogo, no el estado por defecto (BR8.5).
    for (const workId of [
      BOHEMIAN_RHAPSODY,
      BLINDING_LIGHTS,
      BAD_GUY,
      SHAPE_OF_YOU,
      ROLLING_IN_THE_DEEP,
      SMELLS_LIKE_TEEN_SPIRIT,
      FLOWERS,
    ]) {
      expect(store.countOpinions(workId)).toBeGreaterThan(0);
    }
  });

  it("trae las ocho obras sin portada: la portada no la decide C4", () => {
    // C4 guarda título y artista; la portada la resuelve C5 (BR7.10). Que ninguna
    // obra de la siembra tenga `coverUrl` es la comprobación de que el almacén no
    // se está apropiando de una decisión que no le toca.
    for (const work of SEED_WORKS) {
      expect(work).not.toHaveProperty("coverUrl");
    }
    expect(SEED_WORKS.map((work) => work.title)).toContain("As It Was");
  });

  it("ordena el feed por creación descendente con el orden literal de la especificación", () => {
    const opinions = feedOf(createStore());

    expect(opinions.map((opinion) => opinion.opinionId)).toEqual(FEED_ORDER);
  });

  it("solo «op-004» está editada, y su edición es posterior a su creación", () => {
    const opinions = feedOf(createStore());
    const edited = opinionById(opinions, "op-004");

    expect(Date.parse(edited.updatedAt)).toBeGreaterThan(
      Date.parse(edited.createdAt),
    );
    expect(edited.updatedAt).toBe("2026-11-12T05:00:00.000Z");

    const untouched = opinions.filter(
      (opinion) => opinion.opinionId !== "op-004",
    );
    for (const opinion of untouched) {
      expect(opinion.updatedAt).toBe(opinion.createdAt);
    }
  });

  it("refleja los me gusta de la siembra en los contadores del feed", () => {
    const opinions = feedOf(createStore());

    expect(opinionById(opinions, "op-001").likeCount).toBe(1);
    expect(opinionById(opinions, "op-004").likeCount).toBe(1);
    expect(opinionById(opinions, "op-002").likeCount).toBe(1);
    expect(opinionById(opinions, "op-009").likeCount).toBe(1);
    expect(opinionById(opinions, "op-008").likeCount).toBe(0);
    // La cuenta demo no ha dado ningún me gusta en la siembra.
    expect(opinions.every((opinion) => !opinion.likedByMe)).toBe(true);
  });

  it("conserva la antigüedad relativa de cada desfase", () => {
    const opinions = feedOf(createStore());
    const created = (opinionId: string) =>
      Date.parse(opinionById(opinions, opinionId).createdAt);

    // La diferencia entre dos opiniones es exactamente la diferencia de sus edades:
    // `op-002` (2 h) es tres horas más reciente que `op-003` (5 h).
    expect(created("op-002") - created("op-003")).toBe(3 * HOUR_MS);
    expect(created("op-001") - created("op-008")).toBe(24 * HOUR_MS);
  });
});
