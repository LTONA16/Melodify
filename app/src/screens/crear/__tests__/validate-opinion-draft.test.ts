import {
  validateOpinionDraft,
  type OpinionDraft,
  type SelectedWork,
} from "../validateOpinionDraft";

/**
 * La validación compartida por «Publicar» y «Guardar» (BR11.2, BR11.4, BR12.7):
 * qué falta, campo por campo, sin almacén ni React.
 */
const WORK: SelectedWork = {
  workId: "work-1",
  title: "Bad Guy",
  artist: "Billie Eilish",
  coverUrl: null,
};

function draft(overrides: Partial<OpinionDraft> = {}): OpinionDraft {
  return {
    work: WORK,
    text: "Un temazo.",
    rating: 4,
    ...overrides,
  };
}

describe("validateOpinionDraft — lo que falta", () => {
  it("sin obra no vale, y solo señala la obra", () => {
    const result = validateOpinionDraft(draft({ work: null }));

    expect(result.valid).toBe(false);
    expect(result.problems).toEqual({
      work: true,
      text: false,
      rating: false,
    });
  });

  it("una obra sin identificador tampoco vale", () => {
    const result = validateOpinionDraft(draft({ work: { ...WORK, workId: " " } }));

    expect(result.problems.work).toBe(true);
  });

  it("sin texto no vale", () => {
    const result = validateOpinionDraft(draft({ text: "" }));

    expect(result.valid).toBe(false);
    expect(result.problems.text).toBe(true);
    expect(result.problems.work).toBe(false);
    expect(result.problems.rating).toBe(false);
  });

  it("un texto de solo espacios no cuenta como texto", () => {
    const result = validateOpinionDraft(draft({ text: "   \n\t  " }));

    expect(result.valid).toBe(false);
    expect(result.problems.text).toBe(true);
  });

  it("sin valoración no vale", () => {
    const result = validateOpinionDraft(draft({ rating: 0 }));

    expect(result.valid).toBe(false);
    expect(result.problems.rating).toBe(true);
    expect(result.problems.work).toBe(false);
    expect(result.problems.text).toBe(false);
  });

  it.each([-1, 6, 2.5, Number.NaN])(
    "una valoración de %p no vale: C4 solo acepta enteros de 1 a 5",
    (rating) => {
      expect(validateOpinionDraft(draft({ rating })).problems.rating).toBe(true);
    },
  );

  it.each([1, 3, 5])("una valoración de %p sí vale", (rating) => {
    expect(validateOpinionDraft(draft({ rating })).problems.rating).toBe(false);
  });

  it("el borrador completo vale y no señala nada", () => {
    const result = validateOpinionDraft(draft());

    expect(result).toEqual({
      valid: true,
      problems: { work: false, text: false, rating: false },
    });
  });

  it("señala a la vez todo lo que falta", () => {
    const result = validateOpinionDraft({
      work: null,
      text: "  ",
      rating: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.problems).toEqual({
      work: true,
      text: true,
      rating: true,
    });
  });

  it("texto por encima del tope de 500 no vale: C4 lo rechazaría con 422", () => {
    const result = validateOpinionDraft(draft({ text: "a".repeat(501) }));

    expect(result.valid).toBe(false);
    expect(result.problems.text).toBe(true);
  });
});
