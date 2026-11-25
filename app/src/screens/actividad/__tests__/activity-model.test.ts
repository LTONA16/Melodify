/**
 * Mapa de la Actividad (paso 14): una copia total y callada. Si aquí se ordenara,
 * se resumiera el texto o se cayera un `eventId`, la vista pintaría otra historia
 * que la que derivó C8.
 */
import type { ActivityEventView, ActivityGroupView } from "@melodify/activity";

import { toActividadSections } from "../activityModel";

const NOW = "2026-11-19T12:00:00.000Z";

function event(
  eventId: string,
  kind: ActivityEventView["kind"],
  opinionId: string,
  createdAt: string,
  actorHandle?: string,
): ActivityEventView {
  const base: ActivityEventView = {
    eventId,
    kind,
    opinionId,
    workTitle: "Blinding Lights",
    createdAt,
  };
  return actorHandle === undefined ? base : { ...base, actorHandle };
}

function groups(): ActivityGroupView[] {
  return [
    {
      day: "today",
      label: "Hoy",
      events: [
        event("comment:cm-002", "commentReceived", "op-004", "2026-11-19T10:00:00.000Z", "bruno"),
        event("like:op-004:ana", "likeReceived", "op-004", "2026-11-19T09:00:00.000Z", "ana"),
      ],
    },
    {
      day: "yesterday",
      label: "Ayer",
      events: [
        event("own:op-004", "ownOpinion", "op-004", "2026-11-18T12:00:00.000Z"),
        event("comment:cm-001", "commentReceived", "op-001", "2026-11-18T12:00:00.000Z", "ana"),
      ],
    },
    {
      day: "date",
      label: "17 nov 2026",
      events: [
        event("like:op-001:lucia", "likeReceived", "op-001", "2026-11-17T12:00:00.000Z", "lucia"),
      ],
    },
    {
      day: "date",
      label: "16 nov 2026",
      events: [
        event("own:op-001", "ownOpinion", "op-001", "2026-11-16T12:00:00.000Z"),
        event("comment:cm-003", "commentReceived", "op-008", "2026-11-16T12:00:00.000Z", "lucia"),
      ],
    },
    {
      day: "date",
      label: "15 nov 2026",
      events: [
        event("own:op-008", "ownOpinion", "op-008", "2026-11-15T12:00:00.000Z"),
      ],
    },
  ];
}

describe("toActividadSections", () => {
  it("copía los cinco grupos del ejemplo sin reordenarlos", () => {
    const sections = toActividadSections(groups());

    expect(sections.map((section) => section.label)).toEqual([
      "Hoy",
      "Ayer",
      "17 nov 2026",
      "16 nov 2026",
      "15 nov 2026",
    ]);
    expect(sections.map((section) => section.day)).toEqual([
      "today",
      "yesterday",
      "date",
      "date",
      "date",
    ]);
    expect(sections.map((section) => section.events.length)).toEqual([
      2, 2, 1, 2, 1,
    ]);
  });

  it("conserva eventId, opinionId y el resto de campos sin inventar texto", () => {
    const source = groups();
    const sections = toActividadSections(source);

    expect(sections[0]?.events[0]).toEqual({
      eventId: "comment:cm-002",
      kind: "commentReceived",
      opinionId: "op-004",
      workTitle: "Blinding Lights",
      createdAt: "2026-11-19T10:00:00.000Z",
      actorHandle: "bruno",
    });
    expect(sections[3]?.events.map((item) => item.eventId)).toEqual([
      "own:op-001",
      "comment:cm-003",
    ]);
    expect(sections[3]?.events[0]?.opinionId).toBe("op-001");
  });

  it("es total con groups vacío", () => {
    expect(toActividadSections([])).toEqual([]);
  });

  it("omite actorHandle cuando el evento no lo trae", () => {
    const sections = toActividadSections([
      {
        day: "today",
        label: "Hoy",
        events: [event("own:op-004", "ownOpinion", "op-004", NOW)],
      },
    ]);

    expect(sections[0]?.events[0]).not.toHaveProperty("actorHandle");
  });
});
