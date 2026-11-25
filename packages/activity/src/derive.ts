/**
 * Derivación pura de eventos desde C4 (BR21.1…BR21.4).
 *
 * `viewerId` y `now` entran explícitos: el primero evita adivinar la cuenta y el
 * segundo fija el día de «Hoy/Ayer» sin leer el reloj de la máquina (NFR5.7).
 * Solo se consultan las tres lecturas del contrato de C4; no hay escrituras,
 * portadas, texto de comentario ni dependencia de C1/C5/C7. Los contadores
 * `likeCount` y `commentCount` abren la lectura de la lista, nunca se convierten
 * en eventos: no traen autor ni fecha.
 */
import type {
  CommentView,
  ContentResult,
  LikeList,
  OpinionView,
} from "@melodify/content-store";
import type { ActivityEventView } from "./types";

export interface ActivityDerivationSource {
  viewerId: string;
  now: string | number | Date;
  listOpinions(input: { viewerId: string }): ContentResult<OpinionView[]>;
  listLikes(input: { opinionId: string }): ContentResult<LikeList>;
  listComments(input: { opinionId: string }): ContentResult<CommentView[]>;
}

export type ActivityDerivationResult =
  | { ok: true; events: ActivityEventView[]; now: number }
  | { ok: false };

function parseNow(now: ActivityDerivationSource["now"]): number {
  if (now instanceof Date) {
    return now.getTime();
  }
  if (typeof now === "number") {
    return now;
  }
  const parsed = Date.parse(now);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export function deriveActivityEvents(
  source: ActivityDerivationSource,
): ActivityDerivationResult {
  const now = parseNow(source.now);
  const listed = source.listOpinions({ viewerId: source.viewerId });
  if (!listed.ok) {
    return { ok: false };
  }

  const events: ActivityEventView[] = [];

  for (const opinion of listed.value) {
    if (opinion.author.authorId !== source.viewerId) {
      continue;
    }

    events.push({
      eventId: `own:${opinion.opinionId}`,
      kind: "ownOpinion",
      opinionId: opinion.opinionId,
      workTitle: opinion.workTitle,
      createdAt: opinion.createdAt,
    });

    // Un contador a cero no convierte una lectura fallida en un error de pantalla.
    if (opinion.likeCount > 0) {
      const likes = source.listLikes({ opinionId: opinion.opinionId });
      if (!likes.ok) {
        return { ok: false };
      }

      for (const like of likes.value.likes) {
        if (like.author.authorId === source.viewerId) {
          continue;
        }

        events.push({
          eventId: `like:${opinion.opinionId}:${like.author.authorId}`,
          kind: "likeReceived",
          opinionId: opinion.opinionId,
          workTitle: opinion.workTitle,
          createdAt: like.createdAt,
          actorHandle: like.author.handle,
        });
      }
    }

    if (opinion.commentCount > 0) {
      const comments = source.listComments({ opinionId: opinion.opinionId });
      if (!comments.ok) {
        return { ok: false };
      }

      for (const comment of comments.value) {
        if (comment.author.authorId === source.viewerId) {
          continue;
        }

        events.push({
          eventId: `comment:${comment.commentId}`,
          kind: "commentReceived",
          opinionId: opinion.opinionId,
          workTitle: opinion.workTitle,
          createdAt: comment.createdAt,
          actorHandle: comment.author.handle,
        });
      }
    }
  }

  return { ok: true, events, now };
}
