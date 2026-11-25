/**
 * Las vistas que la app ya consume, declaradas una sola vez para los dos lados.
 *
 * Por qué están duplicadas respecto a `@melodify/content-store` y no se importan
 * de allí: ese paquete es del móvil y el servidor no puede depender de él (la
 * frontera va en un solo sentido). La forma es deliberadamente idéntica, y una
 * prueba de tipos de `@melodify/data-access` comprueba que ambas declaraciones
 * siguen siendo asignables; si una se desvía, esa prueba falla.
 *
 * Los campos derivados —`followedByMe`, `likedByMe`, `isOwn`— los calcula el
 * servidor contra quien mira y no se guardan en ninguna tabla.
 */

export interface AuthorView {
  authorId: string;
  displayName: string;
  handle: string;
  followedByMe: boolean;
}

export interface AuthorDetailView extends AuthorView {
  /** Opiniones del autor: es el «N opiniones» de Perfil. */
  opinionCount: number;
  /** Autores que sigue: es el «N siguiendo» de Perfil. */
  followingCount: number;
}

export interface OpinionView {
  opinionId: string;
  workId: string;
  workTitle: string;
  workArtist: string;
  author: AuthorView;
  text: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  /** La portada no viaja aquí: la decide el catálogo de la app. */
}

export interface CommentView {
  commentId: string;
  opinionId: string;
  author: AuthorView;
  text: string;
  createdAt: string;
}

export interface LikeView {
  opinionId: string;
  author: AuthorView;
  createdAt: string;
}

export interface LikeList {
  opinionId: string;
  likeCount: number;
  likes: LikeView[];
}

export interface FollowingList {
  authorId: string;
  followingCount: number;
  following: AuthorView[];
}

export interface ToggleLikeResult {
  opinionId: string;
  likeCount: number;
  likedByMe: boolean;
}

export interface ToggleFollowResult {
  authorId: string;
  followedByMe: boolean;
  followerCount: number;
  viewerFollowingCount: number;
}
