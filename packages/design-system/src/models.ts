/**
 * Modelos de presentación de C1: la única forma de datos que el sistema de diseño
 * conoce. No importan C4, C5 ni C8; cada pantalla mapea desde su vista a estos
 * modelos (el mapeo vive en la pantalla, no aquí).
 */

export interface AuthorSummary {
  displayName: string;
  handle: string;
}

export interface WorkSummary {
  workId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
}

export interface CommentModel {
  commentId: string;
  authorName: string;
  authorHandle: string;
  text: string;
  createdAt: string;
}

export interface OpinionCardModel {
  opinionId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  followedByMe: boolean;
  workId: string;
  workTitle: string;
  workArtist: string;
  coverUrl: string | null;
  text: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

/** Los cinco destinos de la barra inferior, en el orden en que se pintan. */
export type TabIcon = "home" | "search" | "plus" | "activity" | "profile";

export interface TabItem {
  name: string;
  label: string;
  icon: TabIcon;
}

export type OpinionVariant = "feed" | "compact" | "detail";
export type CoverSize = "card" | "result" | "detail";
export type AvatarSize = "small" | "medium" | "large";
export type SkeletonShape = "card" | "row" | "header";
