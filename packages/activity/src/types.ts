/**
 * Modelos de C8 1.1.0: la actividad es un derivado de C4, no una entidad guardada.
 *
 * `ActivityView.groups` es opcional en el contrato: `loading`, `empty` y `error`
 * viajan sin grupos para que la vista no tenga que distinguir entre «todavía no»
 * y «no hay nada» mirando una lista vacía. `actorHandle?` existe porque C1 lo
 * declara, aunque los textos de esta versión no nombren a quien interactuó.
 */
export type ActivityStatus = "loading" | "ready" | "empty" | "error";

export type ActivityEventKind =
  | "ownOpinion"
  | "likeReceived"
  | "commentReceived";

export interface ActivityEventView {
  eventId: string;
  kind: ActivityEventKind;
  opinionId: string;
  workTitle: string;
  createdAt: string;
  actorHandle?: string;
}

export type ActivityDay = "today" | "yesterday" | "date";

export interface ActivityGroupView {
  day: ActivityDay;
  label: string;
  events: ActivityEventView[];
}

export interface ActivityView {
  status: ActivityStatus;
  groups?: ActivityGroupView[];
}

export interface ActivityFeed {
  getActivity(): ActivityView;
  retryActivity(): ActivityView;
  subscribeActivity(listener: (view: ActivityView) => void): () => void;
}
