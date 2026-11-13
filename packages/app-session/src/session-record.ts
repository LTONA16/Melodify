/**
 * El registro que se guarda en el almacenamiento seguro y su guarda.
 *
 * El registro es lo único que el arranque lee y lo único que entra como dato no
 * confiable en esta unidad: cualquiera puede escribir en esa clave, así que todo
 * lo que llega se valida antes de usarse (NFR3.5).
 */

/** Autor único de esta versión: la cuenta de demostración. */
export const DEMO_AUTHOR_ID = "demo";

export interface SessionRecord {
  authorId: typeof DEMO_AUTHOR_ID;
  /** Momento de la entrada, ISO 8601 con zona. */
  startedAt: string;
}

const ISO_8601_WITH_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * La fecha se valida como ISO con zona y no con `Date.parse` suelto: `Date.parse`
 * acepta «demo» y convertiría la comprobación en un trámite.
 */
function isIsoTimestampWithZone(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_8601_WITH_ZONE.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

/**
 * Devuelve el registro válido o `null`, sin lanzar: para el arranque, «no hay
 * sesión» y «hay una sesión rota» significan lo mismo y ninguna merece una
 * pantalla propia (BR1.3).
 *
 * Construye un objeto nuevo a propósito: si el JSON trae campos extra, no se
 * propagan al resto de la app.
 */
export function parseSessionRecord(raw: string | null): SessionRecord | null {
  if (raw === null || raw === "") {
    return null;
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isPlainObject(value)) {
    return null;
  }
  if (value.authorId !== DEMO_AUTHOR_ID) {
    return null;
  }
  if (!isIsoTimestampWithZone(value.startedAt)) {
    return null;
  }

  return { authorId: DEMO_AUTHOR_ID, startedAt: value.startedAt };
}

export function createSessionRecord(startedAt: string): SessionRecord {
  return { authorId: DEMO_AUTHOR_ID, startedAt };
}

export function serializeSessionRecord(record: SessionRecord): string {
  return JSON.stringify(record);
}
