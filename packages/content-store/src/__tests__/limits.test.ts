/**
 * Los dos topes de C4 1.2.0 (TS-28): 500 caracteres en la opinión y 300 en el
 * comentario. Se comprueban en el almacén porque es el contrato: el campo de la
 * interfaz protege a la persona, y esto protege a quien llame directamente.
 *
 * Cada rechazo afirma también que **nada se escribió**: un `422` que deja la
 * escritura hecha sería peor que no validar.
 */
import { createContentStore, type ContentStore } from "../store";
import type {
  ContentErrorCode,
  ContentResult,
  ContentSuccessCode,
} from "../views";

const NOW = "2026-11-12T09:00:00.000Z";

const OPINION_OWN = "op-004";
const COMMENTED_OPINION = "op-001";

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

describe("los topes de longitud de C4", () => {
  let store: ContentStore;

  beforeEach(() => {
    store = createContentStore({ now: NOW });
  });

  function opinionCount(): number {
    return unwrap(store.listOpinions({ viewerId: "demo" })).length;
  }

  function commentCount(opinionId: string): number {
    return unwrap(store.listComments({ opinionId })).length;
  }

  describe("createOpinion", () => {
    it("acepta un texto de exactamente 500 caracteres", () => {
      const created = unwrap(
        store.createOpinion({
          authorId: "demo",
          workId: "4LRPiXqCikLlN15c3yImP7",
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: "a".repeat(500),
          rating: 4,
        }),
      );

      expect(created.text).toHaveLength(500);
    });

    it("rechaza con 422 un texto de 501 caracteres y no escribe", () => {
      const before = opinionCount();

      expectFailure(
        store.createOpinion({
          authorId: "demo",
          workId: "4LRPiXqCikLlN15c3yImP7",
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: "a".repeat(501),
          rating: 4,
        }),
        422,
      );

      expect(opinionCount()).toBe(before);
    });

    it("recorta antes de medir: los espacios de alrededor no cuentan", () => {
      const created = unwrap(
        store.createOpinion({
          authorId: "demo",
          workId: "4LRPiXqCikLlN15c3yImP7",
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: `   ${"a".repeat(500)}   `,
          rating: 4,
        }),
      );

      expect(created.text).toHaveLength(500);
    });

    it("sigue rechazando un texto de solo espacios", () => {
      expectFailure(
        store.createOpinion({
          authorId: "demo",
          workId: "4LRPiXqCikLlN15c3yImP7",
          workTitle: "As It Was",
          workArtist: "Harry Styles",
          text: "   ",
          rating: 4,
        }),
        422,
      );
    });
  });

  describe("updateOpinion", () => {
    it("acepta un texto de exactamente 500 caracteres", () => {
      const updated = unwrap(
        store.updateOpinion({
          opinionId: OPINION_OWN,
          authorId: "demo",
          viewerId: "demo",
          text: "b".repeat(500),
        }),
      );

      expect(updated.text).toHaveLength(500);
    });

    it("rechaza con 422 un texto de 501 caracteres y conserva el anterior", () => {
      const before = unwrap(
        store.getOpinion({ opinionId: OPINION_OWN, viewerId: "demo" }),
      );

      expectFailure(
        store.updateOpinion({
          opinionId: OPINION_OWN,
          authorId: "demo",
          viewerId: "demo",
          text: "b".repeat(501),
        }),
        422,
      );

      const after = unwrap(
        store.getOpinion({ opinionId: OPINION_OWN, viewerId: "demo" }),
      );
      expect(after.text).toBe(before.text);
      expect(after.updatedAt).toBe(before.updatedAt);
    });
  });

  describe("addComment", () => {
    it("acepta un comentario de exactamente 300 caracteres", () => {
      const created = unwrap(
        store.addComment({
          opinionId: COMMENTED_OPINION,
          authorId: "demo",
          text: "c".repeat(300),
        }),
      );

      expect(created.text).toHaveLength(300);
    });

    it("rechaza con 422 un comentario de 301 caracteres y no lo añade", () => {
      const before = commentCount(COMMENTED_OPINION);

      expectFailure(
        store.addComment({
          opinionId: COMMENTED_OPINION,
          authorId: "demo",
          text: "c".repeat(301),
        }),
        422,
      );

      expect(commentCount(COMMENTED_OPINION)).toBe(before);
    });

    it("recorta antes de medir en el comentario", () => {
      const created = unwrap(
        store.addComment({
          opinionId: COMMENTED_OPINION,
          authorId: "demo",
          text: `  ${"c".repeat(300)}  `,
        }),
      );

      expect(created.text).toHaveLength(300);
    });

    it("sigue rechazando un comentario de solo espacios", () => {
      expectFailure(
        store.addComment({
          opinionId: COMMENTED_OPINION,
          authorId: "demo",
          text: "   ",
        }),
        422,
      );
    });
  });
});
