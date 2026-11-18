/**
 * La validación del formulario de Crear (BR11.2, BR11.4, BR12.7): una función pura
 * que dice qué falta, usada por «Publicar» y por «Guardar».
 *
 * Por qué una función y no una condición dentro del contenedor: las dos escrituras
 * comparten la misma regla (BR12.7), y dos copias de «obra, texto y valoración»
 * acabarían aceptando cosas distintas según el modo. Aquí no hay almacén, ni red, ni
 * React: se puede probar entera sin montar nada.
 *
 * Decisiones:
 * - **El texto de solo espacios no cuenta**: se mide `trim()`, igual que C4 al
 *   guardar, así que la interfaz no habilita un envío que el almacén rechazaría con
 *   `422` (BR11.2).
 * - **La valoración es un entero de 1 a 5**: `0` es «sin valorar» y un decimal o un
 *   valor fuera de rango no habilitan el botón (BR11.4).
 * - **La obra es válida cuando tiene identificador**: el título y el artista son para
 *   pintar, no para decidir.
 */
import { MAX_OPINION_LENGTH } from "@melodify/content-store";

/** La valoración más baja que C4 acepta (BR11.4). */
export const MIN_RATING = 1;

/** La valoración más alta que C4 acepta (BR11.4). */
export const MAX_RATING = 5;

/**
 * La obra elegida, en la forma en que viaja por el formulario: lo que C4 necesita
 * para crear la opinión más la portada que la fila pinta.
 */
export interface SelectedWork {
  workId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  /** Canción o álbum cuando la obra lo trae; sin dato se trata como canción. */
  workKind?: "track" | "album";
}

/** Lo que se valida: el borrador, sin saber de dónde vino. */
export interface OpinionDraft {
  work: SelectedWork | null;
  text: string;
  rating: number;
}

/** Qué falta, campo por campo; `false` significa que ese campo está bien. */
export interface DraftProblems {
  work: boolean;
  text: boolean;
  rating: boolean;
}

export interface DraftValidation {
  valid: boolean;
  problems: DraftProblems;
}

/** Una valoración que C4 aceptaría: entero entre 1 y 5. */
export function isValidRating(rating: number): boolean {
  return (
    Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING
  );
}

/** Un texto que se puede guardar: no vacío después de recortar y dentro del tope. */
export function isValidOpinionText(text: string): boolean {
  const trimmed = text.trim();

  return trimmed.length > 0 && trimmed.length <= MAX_OPINION_LENGTH;
}

export function validateOpinionDraft(draft: OpinionDraft): DraftValidation {
  const problems: DraftProblems = {
    work: draft.work === null || draft.work.workId.trim() === "",
    text: !isValidOpinionText(draft.text),
    rating: !isValidRating(draft.rating),
  };

  return {
    valid: !problems.work && !problems.text && !problems.rating,
    problems,
  };
}
