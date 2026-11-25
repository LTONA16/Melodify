/**
 * Orden y agrupación de BR22.1/BR22.2. `now` llega desde la derivación, así que
 * la prueba puede fijar el día sin tocar el reloj global. Los días se leen en el
 * calendario local del dispositivo: «Hoy» y «Ayer» son fechas naturales, no
 * ventanas de 24 horas sobre el instante. C8 no importa C1 (TS-39…TS-43).
 */
import type {
  ActivityDay,
  ActivityEventView,
  ActivityGroupView,
} from "./types";

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

function localDayKey(ms: number): string {
  const date = new Date(ms);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function localYesterdayKey(now: number): string {
  const yesterday = new Date(now);
  // Restar un día calendario evita cambiar de fecha en un cambio de horario.
  yesterday.setDate(yesterday.getDate() - 1);
  return localDayKey(yesterday.getTime());
}

function formatLocalDate(ms: number): string {
  const date = new Date(ms);
  return `${date.getDate()} ${MONTHS[date.getMonth()] ?? ""} ${date.getFullYear()}`;
}

function compareEvents(
  left: ActivityEventView,
  right: ActivityEventView,
): number {
  const byDate = Date.parse(right.createdAt) - Date.parse(left.createdAt);
  if (byDate !== 0) {
    return byDate;
  }

  return left.eventId < right.eventId
    ? -1
    : left.eventId > right.eventId
      ? 1
      : 0;
}

export function groupActivityEvents(
  events: ActivityEventView[],
  now: number,
): ActivityGroupView[] {
  for (const event of events) {
    if (Number.isNaN(Date.parse(event.createdAt))) {
      throw new Error("Instante de actividad no válido.");
    }
  }

  const sorted = [...events].sort(compareEvents);
  const todayKey = localDayKey(now);
  const yesterdayKey = localYesterdayKey(now);
  const groups: ActivityGroupView[] = [];
  const byDay = new Map<string, ActivityGroupView>();

  for (const event of sorted) {
    const key = localDayKey(Date.parse(event.createdAt));
    let group = byDay.get(key);

    if (group === undefined) {
      const day: ActivityDay =
        key === todayKey
          ? "today"
          : key === yesterdayKey
            ? "yesterday"
            : "date";
      const label =
        day === "today"
          ? "Hoy"
          : day === "yesterday"
            ? "Ayer"
            : formatLocalDate(Date.parse(event.createdAt));

      group = { day, label, events: [] };
      byDay.set(key, group);
      groups.push(group);
    }

    group.events.push(event);
  }

  return groups;
}
