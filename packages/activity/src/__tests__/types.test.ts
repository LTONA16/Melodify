/**
 * Los modelos de C8 y el de presentación de C1 1.5.0 (paso 4). Lo que se comprueba
 * es la forma que cruza los contratos: estados, clases, `groups` opcional y un
 * `actorHandle` que viaja pero no se pinta. No hay lógica aquí; una prueba de un
 * tipo solo puede fallar si el tipo deja de aceptar lo que la unidad necesita.
 */
import type {
  ActivityEventKind,
  ActivityEventView,
  ActivityGroupView,
  ActivityStatus,
  ActivityView,
} from "../types";
/**
 * La forma de presentación que C8 entrega a la app. Se declara aquí, sin importar
 * C1, para que la frontera BR24.4 siga siendo una sola dirección.
 */
interface ActivityEventSummary {
  eventId: string;
  kind: "ownOpinion" | "likeReceived" | "commentReceived";
  opinionId: string;
  workTitle: string;
  createdAt: string;
  actorHandle?: string;
}

const NOW = "2026-11-19T12:00:00.000Z";

describe("modelos de actividad", () => {
  it("los cuatro estados de ActivityStatus son los de la máquina de C8", () => {
    const estados: ActivityStatus[] = ["loading", "ready", "empty", "error"];

    expect(estados).toHaveLength(4);
    expect(estados).toContain("loading");
    expect(estados).toContain("ready");
    expect(estados).toContain("empty");
    expect(estados).toContain("error");
  });

  it("las tres clases de ActivityEventKind son las de BR21", () => {
    const clases: ActivityEventKind[] = [
      "ownOpinion",
      "likeReceived",
      "commentReceived",
    ];

    expect(clases).toEqual(["ownOpinion", "likeReceived", "commentReceived"]);
  });

  it("una vista lista con grupos acepta actorHandle solo en eventos ajenos", () => {
    const grupo: ActivityGroupView = {
      day: "today",
      label: "Hoy",
      events: [
        {
          eventId: "own-op-004",
          kind: "ownOpinion",
          opinionId: "op-004",
          workTitle: "Blinding Lights",
          createdAt: NOW,
        },
        {
          eventId: "like-op-004-ana",
          kind: "likeReceived",
          opinionId: "op-004",
          workTitle: "Blinding Lights",
          createdAt: NOW,
          actorHandle: "ana",
        },
      ],
    };
    const vista: ActivityView = { status: "ready", groups: [grupo] };

    expect(vista.status).toBe("ready");
    expect(vista.groups?.[0]?.events[1]?.actorHandle).toBe("ana");
    expect(vista.groups?.[0]?.events[0]).toEqual({
      eventId: "own-op-004",
      kind: "ownOpinion",
      opinionId: "op-004",
      workTitle: "Blinding Lights",
      createdAt: NOW,
    });
  });

  it("loading, empty y error pueden omitir groups", () => {
    const estados: ActivityStatus[] = ["loading", "empty", "error"];

    for (const status of estados) {
      const vista: ActivityView = { status };

      expect(vista.groups).toBeUndefined();
    }
  });

  it("ActivityEventSummary de C1 conserva el eventId y hace opcional actorHandle", () => {
    const conActor: ActivityEventSummary = {
      eventId: "comment-cm-001",
      kind: "commentReceived",
      opinionId: "op-001",
      workTitle: "Bohemian Rhapsody",
      createdAt: NOW,
      actorHandle: "ana",
    };
    const sinActor: ActivityEventSummary = {
      eventId: "own-op-001",
      kind: "ownOpinion",
      opinionId: "op-001",
      workTitle: "Bohemian Rhapsody",
      createdAt: NOW,
    };

    expect(conActor.actorHandle).toBe("ana");
    expect(sinActor.actorHandle).toBeUndefined();
    expect(sinActor).not.toHaveProperty("authorId");
    expect(sinActor).not.toHaveProperty("workId");
    expect(sinActor).not.toHaveProperty("text");
  });

  it("ActivityEventView no arrastra portada ni texto del comentario", () => {
    const evento: ActivityEventView = {
      eventId: "comment-cm-001",
      kind: "commentReceived",
      opinionId: "op-001",
      workTitle: "Bohemian Rhapsody",
      createdAt: NOW,
      actorHandle: "ana",
    };

    expect(Object.keys(evento).sort()).toEqual([
      "actorHandle",
      "createdAt",
      "eventId",
      "kind",
      "opinionId",
      "workTitle",
    ]);
  });
});
