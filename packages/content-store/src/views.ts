/**
 * Las vistas de C4 1.0.0 y los resultados con código (contrato `ContentStore`).
 *
 * Las vistas son lo único que cruza el contrato: el estado interno del almacén no
 * sale del paquete. Los campos derivados —`isOwn`, `likedByMe`, `followedByMe`— se
 * calculan contra quien mira en cada lectura y no se guardan (BR4.6); por eso todas
 * las lecturas que los devuelven exigen `viewerId` y responden `422` sin él.
 *
 * Los errores son códigos con la forma del contrato y un mensaje en español, llano,
 * que ninguna pantalla pinta tal cual: las pantallas tienen sus textos exactos
 * (BR10.4). El mensaje existe para el diagnóstico y para las pruebas.
 */

export interface AuthorView {
  authorId: string;
  displayName: string;
  handle: string;
  followedByMe: boolean;
}

export interface AuthorDetailView extends AuthorView {
  /** Opiniones del autor: es el «N opiniones» de Perfil (BR4.8). */
  opinionCount: number;
  /** Autores que sigue: es el «N siguiendo» de Perfil (BR4.8). */
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
  /** La portada no viaja aquí: la decide `Catalog` (BR7.10). */
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

/** `GET /opinions/{opinionId}/likes`: alimenta la Actividad de U5. */
export interface LikeList {
  opinionId: string;
  likeCount: number;
  likes: LikeView[];
}

/** `GET /authors/{authorId}/following`: el «N siguiendo» de Perfil. */
export interface FollowingList {
  authorId: string;
  followingCount: number;
  following: AuthorView[];
}

/** `POST /opinions/{opinionId}/likes`. */
export interface ToggleLikeResult {
  opinionId: string;
  likeCount: number;
  likedByMe: boolean;
}

/** `POST /authors/{authorId}/follow`. */
export interface ToggleFollowResult {
  authorId: string;
  followedByMe: boolean;
  followerCount: number;
  viewerFollowingCount: number;
}

/** Lo que emite `subscribeContent`: contenido completo más la revisión (BR4.7). */
export interface ContentSnapshot {
  revision: number;
  opinions: OpinionView[];
}

/**
 * Códigos de fallo de C4. `403` solo lo produce `updateOpinion` (editar la ajena),
 * `409` la unicidad de opinión y el seguirse a uno mismo, `404` lo que no existe y
 * `422` lo que no se puede calcular ni validar.
 */
export type ContentErrorCode = 403 | 404 | 409 | 422;

export type ContentSuccessCode = 200 | 201;

export interface ContentSuccess<T, C extends ContentSuccessCode = 200> {
  ok: true;
  code: C;
  value: T;
}

export interface ContentFailure {
  ok: false;
  code: ContentErrorCode;
  message: string;
}

export type ContentResult<
  T,
  C extends ContentSuccessCode = 200,
> = ContentSuccess<T, C> | ContentFailure;
