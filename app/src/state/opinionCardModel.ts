/**
 * El único mapeo de la vista de C4 a la tarjeta de C1 (BR7.10).
 *
 * Vive fuera de las pantallas para que las cuatro mapeen igual —una tarjeta del
 * feed y la misma tarjeta en el detalle no pueden discrepar— y para que ninguna
 * tarjeta pregunte por la portada: `cover` llega ya decidido por C5.
 *
 * `coverUrl` solo se rellena cuando la decisión es una URL; en cualquier otro caso
 * queda `null` y la tarjeta pinta el bloque con la inicial, que es lo que evita una
 * portada que no carga sin red o sin sesión (BR5.3).
 */
import type { CoverDecision } from "@melodify/catalog";
import type { OpinionView } from "@melodify/content-store";
import type { OpinionCardModel } from "@melodify/design-system";

export function toOpinionCardModel({
  opinion,
  cover,
}: {
  opinion: OpinionView;
  cover: CoverDecision;
}): OpinionCardModel {
  return {
    opinionId: opinion.opinionId,
    authorId: opinion.author.authorId,
    authorName: opinion.author.displayName,
    authorHandle: opinion.author.handle,
    followedByMe: opinion.author.followedByMe,
    workId: opinion.workId,
    workTitle: opinion.workTitle,
    workArtist: opinion.workArtist,
    coverUrl: cover.kind === "url" ? cover.value : null,
    text: opinion.text,
    rating: opinion.rating,
    createdAt: opinion.createdAt,
    updatedAt: opinion.updatedAt,
    likeCount: opinion.likeCount,
    commentCount: opinion.commentCount,
    likedByMe: opinion.likedByMe,
  };
}
