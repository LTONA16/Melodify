/**
 * Orden, desempate y agrupación (pasos 7 y 8 del plan). El caso de la siembra es
 * el mismo que el ejemplo de la especificación: dos pares de eventos comparten
 * instante y solo `eventId` produce el orden esperado. Los días se leen en el
 * calendario local fijado en `jest.setup.js`.
 */
import { deriveActivityEvents } from "../derive";
import { groupActivityEvents } from "../grouping";
import type { ActivityEventView } from "../types";
import { createFixtureContentStore } from "./activity-fixture";

const NOW = "2026-11-19T12:00:00.000Z";

function seededEvents(): { events: ActivityEventView[]; now: number } {
  const store = createFixtureContentStore({ now: NOW });
  const derived = deriveActivityEvents({
    viewerId: "demo",
    now: NOW,
    listOpinions: (input) => store.listOpinions(input),
    listLikes: (input) => store.listLikes(input),
    listComments: (input) => store.listComments(input),
  });

  if (!derived.ok) {
    throw new Error("La derivación de la siembra falló.");
  }
  return { events: derived.events, now: derived.now };
}

function event(
  eventId: string,
  kind: ActivityEventView["kind"],
  createdAt: string,
): ActivityEventView {
  return {
    eventId,
    kind,
    opinionId: "op-001",
    workTitle: "Bohemian Rhapsody",
    createdAt,
  };
}

describe("groupActivityEvents", () => {
  it("ordena los ocho eventos de la siembra con los dos empates del ejemplo", () => {
    const { events, now } = seededEvents();

    const grouped = groupActivityEvents(events, now);
    const flat = grouped.flatMap((group) =>
      group.events.map((item) => item.eventId),
    );

    expect(flat).toEqual([
      "comment:cm-002",
      "like:op-004:ana",
      "comment:cm-001",
      "own:op-004",
      "like:op-001:lucia",
      "comment:cm-003",
      "own:op-001",
      "own:op-008",
    ]);
  });

  it("agrupa en cinco días con las etiquetas del ejemplo trabajado", () => {
    const { events, now } = seededEvents();

    const groups = groupActivityEvents(events, now);

    // La tabla funcional enumera cinco días y el plan ya lo refleja.
    expect(groups).toHaveLength(5);
    expect(groups.map((group) => group.label)).toEqual([
      "Hoy",
      "Ayer",
      "17 nov 2026",
      "16 nov 2026",
      "15 nov 2026",
    ]);
    expect(groups.map((group) => group.day)).toEqual([
      "today",
      "yesterday",
      "date",
      "date",
      "date",
    ]);
    expect(groups.map((group) => group.events)).toEqual([
      [
        expect.objectContaining({ eventId: "comment:cm-002" }),
        expect.objectContaining({ eventId: "like:op-004:ana" }),
      ],
      [
        expect.objectContaining({ eventId: "comment:cm-001" }),
        expect.objectContaining({ eventId: "own:op-004" }),
      ],
      [expect.objectContaining({ eventId: "like:op-001:lucia" })],
      [
        expect.objectContaining({ eventId: "comment:cm-003" }),
        expect.objectContaining({ eventId: "own:op-001" }),
      ],
      [expect.objectContaining({ eventId: "own:op-008" })],
    ]);
  });

  it("usa el calendario local cerca de la medianoche", () => {
    const now = Date.parse("2026-11-19T00:30:00.000Z");
    const events = [
      event("comment:cm-tarde", "commentReceived", "2026-11-18T23:30:00.000Z"),
      event("own:op-nueva", "ownOpinion", "2026-11-19T00:10:00.000Z"),
    ];

    const groups = groupActivityEvents(events, now);

    // Ambos instantes son el mismo día natural en la zona de la prueba.
    expect(groups.map((group) => group.label)).toEqual(["Hoy"]);
    expect(groups[0]?.events.map((item) => item.eventId)).toEqual([
      "own:op-nueva",
      "comment:cm-tarde",
    ]);
  });

  it("calcula «ayer» como día calendario aunque haya cambio de horario", () => {
    const now = Date.parse("2026-10-25T22:30:00.000Z");
    const events = [
      event("own:op-hoy", "ownOpinion", "2026-10-25T22:30:00.000Z"),
      event("comment:cm-ayer", "commentReceived", "2026-10-24T21:30:00.000Z"),
    ];

    const groups = groupActivityEvents(events, now);

    expect(groups.map((group) => group.label)).toEqual(["Hoy", "Ayer"]);
    expect(groups[1]?.events[0]?.eventId).toBe("comment:cm-ayer");
  });

  it("desempata por eventId cuando coinciden la fecha y el tipo", () => {
    const now = Date.parse(NOW);
    const events = [
      event("own:op-b", "ownOpinion", NOW),
      event("own:op-a", "ownOpinion", NOW),
    ];

    const groups = groupActivityEvents(events, now);

    expect(groups[0]?.events.map((item) => item.eventId)).toEqual([
      "own:op-a",
      "own:op-b",
    ]);
  });

  it("usa eventId ascendente a igual instante, sin importar el tipo de evento", () => {
    const now = Date.parse(NOW);
    const events = [
      event("comment:cm-001", "commentReceived", NOW),
      event("like:op-001:ana", "likeReceived", NOW),
      event("own:op-001", "ownOpinion", NOW),
    ];

    const groups = groupActivityEvents(events, now);

    expect(groups[0]?.events.map((item) => item.eventId)).toEqual([
      "comment:cm-001",
      "like:op-001:ana",
      "own:op-001",
    ]);
  });

  it("no muta la lista que recibe", () => {
    const now = Date.parse(NOW);
    const events = [
      event("own:op-b", "ownOpinion", NOW),
      event("own:op-a", "ownOpinion", NOW),
    ];
    const original = events.map((item) => item.eventId);

    groupActivityEvents(events, now);

    expect(events.map((item) => item.eventId)).toEqual(original);
  });
});
