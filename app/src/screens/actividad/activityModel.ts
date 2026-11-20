/**
 * Mapa de presentación de la Actividad (BR24.4). C8 entrega grupos con su día,
 * su etiqueta y sus eventos; aquí solo se copian los campos que la vista pinta.
 * La vista no importa C8: conoce este modelo y las piezas de C1, y nada más.
 */
import type { ActivityGroupView } from "@melodify/activity";
import type { ActivityEventSummary } from "@melodify/design-system";

export interface ActividadEvent {
  eventId: string;
  kind: ActivityEventSummary["kind"];
  opinionId: string;
  workTitle: string;
  createdAt: string;
  actorHandle?: string;
}

export interface ActividadSection {
  day: ActivityGroupView["day"];
  label: string;
  events: ActividadEvent[];
}

function toEvent(event: ActivityGroupView["events"][number]): ActividadEvent {
  const mapped: ActividadEvent = {
    eventId: event.eventId,
    kind: event.kind,
    opinionId: event.opinionId,
    workTitle: event.workTitle,
    createdAt: event.createdAt,
  };

  // Solo se copia `actorHandle` cuando existe: las filas propias no lo esperan.
  if (event.actorHandle !== undefined) {
    mapped.actorHandle = event.actorHandle;
  }

  return mapped;
}

export function toActividadSections(
  groups: readonly ActivityGroupView[],
): ActividadSection[] {
  return groups.map((group) => ({
    day: group.day,
    label: group.label,
    events: group.events.map(toEvent),
  }));
}
