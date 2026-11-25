/**
 * Fecha de calendario de la opinión propia (C1 1.2.0): «4 nov 2026». Es lo que la
 * tarjeta pinta en el estado `own`, donde el tiempo transcurrido no sirve porque la
 * persona necesita reconocer el día en que escribió y, si editó, el de la última
 * edición (AC4.2.4).
 *
 * Los nombres van en español y escritos aquí, no tomados del locale del
 * dispositivo: la interfaz es solo en español (CT-08) y el formato no puede cambiar
 * porque el teléfono esté en otro idioma.
 *
 * Los campos se leen en UTC a propósito: la siembra y las escrituras guardan
 * instantes ISO en UTC, y leerlos en hora local mostraría el día anterior o el
 * siguiente según la zona donde se abra la app.
 */
const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function formatCalendarDate(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return "";
  }

  const date = new Date(parsed);
  const month = MONTHS[date.getUTCMonth()] ?? "";

  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}`;
}
