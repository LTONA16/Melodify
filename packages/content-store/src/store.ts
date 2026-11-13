/**
 * El almacén de contenido de C4: un reductor puro sobre estado inmutable, **sin
 * React** (desviación registrada frente a ADR-010).
 *
 * Por qué sin React: C4 publica una fuente externa con suscripción, no un hook ni
 * un contexto. Varias pantallas leen el mismo contenido a la vez, y probar un
 * reductor no debería exigir montar componentes. Lo que ADR-010 conserva aquí es lo
 * de fondo: acciones explícitas, reductor puro, ninguna librería de estado y el
 * reductor probado directamente.
 *
 * Reglas que se ven en el código:
 * - Toda escritura produce un estado **nuevo** y sube `revision`; nunca muta el
 *   anterior, así un oyente que guardó la emisión previa sigue viendo lo que leyó.
 * - Una escritura notifica **una sola vez**, después de reducir (BR4.7).
 * - `isOwn`, `likedByMe` y `followedByMe` se calculan en cada lectura contra
 *   `viewerId`; el estado no los guarda (BR4.6).
 * - El reloj entra por `now`. Con un reloj fijo, cada escritura se sella un
 *   milisegundo después de la anterior: así `updatedAt` es posterior a `createdAt`
 *   y la prueba es determinista sin leer el reloj de la máquina (NFR5.7).
 */
import {
  defaultSeed,
  type ContentSeed,
  type SeedAuthor,
  type SeedComment,
  type SeedFollow,
  type SeedLike,
  type SeedOpinion,
  type SeedWork,
} from "./seed";
import type {
  AuthorDetailView,
  AuthorView,
  CommentView,
  ContentErrorCode,
  ContentFailure,
  ContentResult,
  ContentSnapshot,
  ContentSuccess,
  ContentSuccessCode,
  FollowingList,
  LikeList,
  LikeView,
  OpinionView,
  ToggleFollowResult,
  ToggleLikeResult,
} from "./views";

/** Lo que viaja con una obra: título y artista se guardan en local (BR4.9). */
interface AuthorRecord {
  authorId: string;
  displayName: string;
  handle: string;
}

interface WorkRecord {
  workId: string;
  title: string;
  artist: string;
}

interface OpinionRecord {
  opinionId: string;
  authorId: string;
  workId: string;
  workTitle: string;
  workArtist: string;
  text: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

interface LikeRecord {
  opinionId: string;
  authorId: string;
  createdAt: string;
}

interface CommentRecord {
  commentId: string;
  opinionId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface FollowRecord {
  followerId: string;
  authorId: string;
  createdAt: string;
}

/** El estado interno: no cruza el contrato salvo por las vistas. */
interface State {
  authors: AuthorRecord[];
  works: WorkRecord[];
  opinions: OpinionRecord[];
  likes: LikeRecord[];
  comments: CommentRecord[];
  follows: FollowRecord[];
  revision: number;
}

type Action =
  | { type: "opinion/create"; record: OpinionRecord }
  | { type: "opinion/update"; opinionId: string; text: string; rating: number; updatedAt: string }
  | { type: "like/add"; record: LikeRecord }
  | { type: "like/remove"; opinionId: string; authorId: string }
  | { type: "comment/add"; record: CommentRecord }
  | { type: "follow/add"; record: FollowRecord }
  | { type: "follow/remove"; followerId: string; authorId: string };

export interface CreateOpinionInput {
  authorId: string;
  workId: string;
  workTitle: string;
  workArtist: string;
  text: string;
  rating: number;
}

export interface UpdateOpinionInput {
  opinionId: string;
  authorId: string;
  viewerId?: string | null;
  text?: string;
  rating?: number;
}

export interface ContentStore {
  listOpinions(input: {
    viewerId?: string | null;
    workId?: string;
    authorId?: string;
  }): ContentResult<OpinionView[]>;
  getOpinion(input: {
    opinionId: string;
    viewerId?: string | null;
  }): ContentResult<OpinionView>;
  createOpinion(input: CreateOpinionInput): ContentResult<OpinionView, 201>;
  updateOpinion(input: UpdateOpinionInput): ContentResult<OpinionView>;
  toggleLike(input: {
    opinionId: string;
    authorId: string;
  }): ContentResult<ToggleLikeResult>;
  listLikes(input: { opinionId: string }): ContentResult<LikeList>;
  addComment(input: {
    opinionId: string;
    authorId: string;
    text: string;
  }): ContentResult<CommentView, 201>;
  listComments(input: { opinionId: string }): ContentResult<CommentView[]>;
  toggleFollow(input: {
    authorId: string;
    followerId: string;
  }): ContentResult<ToggleFollowResult>;
  listFollowing(input: {
    authorId: string;
    viewerId?: string | null;
  }): ContentResult<FollowingList>;
  getAuthor(input: {
    authorId: string;
    viewerId?: string | null;
  }): ContentResult<AuthorDetailView>;
  /**
   * Recuento de opiniones de una obra, sin `viewerId`: lo consume C5 para el
   * «N opiniones» (BR5.4). Es la única lectura sin identidad porque solo cuenta y
   * no devuelve ningún campo derivado.
   */
  countOpinions(workId: string): number;
  subscribeContent(
    viewerId: string | null | undefined,
    listener: (snapshot: ContentSnapshot) => void,
  ): ContentResult<() => void>;
}

export interface CreateContentStoreOptions {
  /** Instante desde el que se calculan las edades de la siembra (ISO o epoch). */
  now?: string | number | Date;
  /** Sustituye la siembra de ejemplo por una mínima. */
  seed?: ContentSeed;
}

/** Guardas de validación de C4; la validación fina del formulario es de U3. */
const MAX_TEXT_LENGTH = 500;

function success<T, C extends ContentSuccessCode = 200>(
  code: C,
  value: T,
): ContentSuccess<T, C> {
  return { ok: true, code, value };
}

function failure(code: ContentErrorCode, message: string): ContentFailure {
  return { ok: false, code, message };
}

function hasViewer(viewerId: string | null | undefined): viewerId is string {
  return typeof viewerId === "string" && viewerId !== "";
}

function isValidText(text: unknown): text is string {
  return (
    typeof text === "string" &&
    text.trim().length > 0 &&
    text.trim().length <= MAX_TEXT_LENGTH
  );
}

function isValidRating(rating: unknown): rating is number {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

function parseNow(now: CreateContentStoreOptions["now"]): number {
  if (now === undefined) {
    return Date.now();
  }
  if (now instanceof Date) {
    return now.getTime();
  }
  if (typeof now === "number") {
    return now;
  }
  const parsed = Date.parse(now);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function isoAt(baseMs: number, ageMs: number): string {
  return new Date(baseMs - ageMs).toISOString();
}

function buildState(seed: ContentSeed, baseMs: number): State {
  const authors: AuthorRecord[] = (seed.authors ?? []).map((author: SeedAuthor) => ({
    authorId: author.authorId,
    displayName: author.displayName,
    handle: author.handle,
  }));
  const works: WorkRecord[] = (seed.works ?? []).map((work: SeedWork) => ({
    workId: work.workId,
    title: work.title,
    artist: work.artist,
  }));

  const opinions: OpinionRecord[] = (seed.opinions ?? []).map(
    (opinion: SeedOpinion) => {
      const work = works.find((candidate) => candidate.workId === opinion.workId);
      const createdAt = isoAt(baseMs, opinion.ageMs);

      return {
        opinionId: opinion.opinionId,
        authorId: opinion.authorId,
        workId: opinion.workId,
        workTitle: work?.title ?? "",
        workArtist: work?.artist ?? "",
        text: opinion.text,
        rating: opinion.rating,
        createdAt,
        updatedAt:
          opinion.editedAgeMs === undefined
            ? createdAt
            : isoAt(baseMs, opinion.editedAgeMs),
      };
    },
  );

  const likes: LikeRecord[] = (seed.likes ?? []).map((like: SeedLike) => ({
    opinionId: like.opinionId,
    authorId: like.authorId,
    createdAt: isoAt(baseMs, like.ageMs),
  }));
  const comments: CommentRecord[] = (seed.comments ?? []).map(
    (comment: SeedComment) => ({
      commentId: comment.commentId,
      opinionId: comment.opinionId,
      authorId: comment.authorId,
      text: comment.text,
      createdAt: isoAt(baseMs, comment.ageMs),
    }),
  );
  const follows: FollowRecord[] = (seed.follows ?? []).map((follow: SeedFollow) => ({
    followerId: follow.followerId,
    authorId: follow.authorId,
    createdAt: isoAt(baseMs, follow.ageMs),
  }));

  return { authors, works, opinions, likes, comments, follows, revision: 0 };
}

/**
 * El reductor: recibe el estado y una acción y devuelve **siempre** un estado nuevo
 * con `revision` incrementada. No emite ni lee el reloj; eso lo hace el almacén.
 */
function reduce(state: State, action: Action): State {
  const revision = state.revision + 1;

  switch (action.type) {
    case "opinion/create":
      return {
        ...state,
        works: upsertWork(state.works, action.record),
        opinions: [...state.opinions, action.record],
        revision,
      };

    case "opinion/update":
      return {
        ...state,
        opinions: state.opinions.map((opinion) =>
          opinion.opinionId === action.opinionId
            ? {
                ...opinion,
                text: action.text,
                rating: action.rating,
                // `createdAt` no se toca nunca: «Editada el …» miente si se mueve.
                updatedAt: action.updatedAt,
              }
            : opinion,
        ),
        revision,
      };

    case "like/add":
      return { ...state, likes: [...state.likes, action.record], revision };

    case "like/remove":
      return {
        ...state,
        likes: state.likes.filter(
          (like) =>
            !(
              like.opinionId === action.opinionId &&
              like.authorId === action.authorId
            ),
        ),
        revision,
      };

    case "comment/add":
      return { ...state, comments: [...state.comments, action.record], revision };

    case "follow/add":
      return { ...state, follows: [...state.follows, action.record], revision };

    case "follow/remove":
      return {
        ...state,
        follows: state.follows.filter(
          (follow) =>
            !(
              follow.followerId === action.followerId &&
              follow.authorId === action.authorId
            ),
        ),
        revision,
      };
  }
}

function upsertWork(works: WorkRecord[], record: OpinionRecord): WorkRecord[] {
  if (works.some((work) => work.workId === record.workId)) {
    return works;
  }
  return [
    ...works,
    {
      workId: record.workId,
      title: record.workTitle,
      artist: record.workArtist,
    },
  ];
}

function byCreatedAtDescending(
  left: { createdAt: string; opinionId?: string; commentId?: string },
  right: { createdAt: string; opinionId?: string; commentId?: string },
): number {
  const delta = Date.parse(right.createdAt) - Date.parse(left.createdAt);
  if (delta !== 0) {
    return delta;
  }
  // Desempate estable por identificador (BR4.5).
  const leftId = left.opinionId ?? left.commentId ?? "";
  const rightId = right.opinionId ?? right.commentId ?? "";
  return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
}

export function createContentStore(
  options: CreateContentStoreOptions = {},
): ContentStore {
  const baseMs = parseNow(options.now);
  let state = buildState(options.seed ?? defaultSeed, baseMs);

  // Sellos monotónicos: con un reloj fijo, dos escrituras nunca comparten instante.
  let lastStampMs = baseMs;
  const nextStamp = (): string => {
    lastStampMs += 1;
    return new Date(lastStampMs).toISOString();
  };

  let opinionSequence = 0;
  let commentSequence = 0;
  const nextOpinionId = (): string => {
    opinionSequence += 1;
    return `op-${String(opinionSequence).padStart(3, "0")}`;
  };
  const nextCommentId = (): string => {
    commentSequence += 1;
    return `cm-${String(commentSequence + 100).padStart(3, "0")}`;
  };

  const listeners = new Set<{
    viewerId: string;
    listener: (snapshot: ContentSnapshot) => void;
  }>();

  const findOpinion = (opinionId: string): OpinionRecord | undefined =>
    state.opinions.find((opinion) => opinion.opinionId === opinionId);

  const findAuthor = (authorId: string): AuthorRecord | undefined =>
    state.authors.find((author) => author.authorId === authorId);

  const likeCountOf = (opinionId: string): number =>
    state.likes.filter((like) => like.opinionId === opinionId).length;

  const commentCountOf = (opinionId: string): number =>
    state.comments.filter((comment) => comment.opinionId === opinionId).length;

  const authorView = (authorId: string, viewerId: string): AuthorView => {
    const author = findAuthor(authorId);
    return {
      authorId,
      displayName: author?.displayName ?? "",
      handle: author?.handle ?? "",
      followedByMe: state.follows.some(
        (follow) => follow.followerId === viewerId && follow.authorId === authorId,
      ),
    };
  };

  const opinionView = (record: OpinionRecord, viewerId: string): OpinionView => ({
    opinionId: record.opinionId,
    workId: record.workId,
    workTitle: record.workTitle,
    workArtist: record.workArtist,
    author: authorView(record.authorId, viewerId),
    text: record.text,
    rating: record.rating,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    likeCount: likeCountOf(record.opinionId),
    commentCount: commentCountOf(record.opinionId),
    likedByMe: state.likes.some(
      (like) => like.opinionId === record.opinionId && like.authorId === viewerId,
    ),
    isOwn: record.authorId === viewerId,
  });

  const commentView = (record: CommentRecord, viewerId: string): CommentView => ({
    commentId: record.commentId,
    opinionId: record.opinionId,
    author: authorView(record.authorId, viewerId),
    text: record.text,
    createdAt: record.createdAt,
  });

  const snapshotFor = (viewerId: string): ContentSnapshot => ({
    revision: state.revision,
    opinions: [...state.opinions]
      .sort(byCreatedAtDescending)
      .map((opinion) => opinionView(opinion, viewerId)),
  });

  const notify = (): void => {
    for (const entry of [...listeners]) {
      entry.listener(snapshotFor(entry.viewerId));
    }
  };

  /** Reduce, cambia el estado y notifica **una sola vez**. */
  const commit = (action: Action): void => {
    state = reduce(state, action);
    notify();
  };

  return {
    listOpinions({ viewerId, workId, authorId }) {
      if (!hasViewer(viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }

      const opinions = state.opinions
        .filter((opinion) => workId === undefined || opinion.workId === workId)
        .filter(
          (opinion) => authorId === undefined || opinion.authorId === authorId,
        )
        .sort(byCreatedAtDescending)
        .map((opinion) => opinionView(opinion, viewerId));

      return success(200, opinions);
    },

    getOpinion({ opinionId, viewerId }) {
      if (!hasViewer(viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }

      const record = findOpinion(opinionId);
      if (record === undefined) {
        return failure(404, "La opinión no existe.");
      }

      return success(200, opinionView(record, viewerId));
    },

    createOpinion(input) {
      if (!hasViewer(input.authorId)) {
        return failure(422, "Falta quién publica la opinión.");
      }
      if (findAuthor(input.authorId) === undefined) {
        return failure(422, "El autor de la opinión no existe.");
      }
      if (!isValidText(input.text)) {
        return failure(422, "El texto de la opinión no es válido.");
      }
      if (!isValidRating(input.rating)) {
        return failure(422, "La valoración debe ser un entero de 1 a 5.");
      }

      // Una persona publica como máximo una opinión por obra (BR4.3).
      const duplicated = state.opinions.some(
        (opinion) =>
          opinion.authorId === input.authorId && opinion.workId === input.workId,
      );
      if (duplicated) {
        return failure(409, "Ya has publicado una opinión sobre esta obra.");
      }

      const createdAt = nextStamp();
      const record: OpinionRecord = {
        opinionId: nextOpinionId(),
        authorId: input.authorId,
        workId: input.workId,
        workTitle: input.workTitle,
        workArtist: input.workArtist,
        text: input.text.trim(),
        rating: input.rating,
        createdAt,
        updatedAt: createdAt,
      };

      commit({ type: "opinion/create", record });

      return success(201, opinionView(record, input.authorId));
    },

    updateOpinion(input) {
      if (!hasViewer(input.viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }

      const record = findOpinion(input.opinionId);
      if (record === undefined) {
        return failure(404, "La opinión no existe.");
      }
      if (record.authorId !== input.authorId) {
        return failure(403, "Solo se puede editar la opinión propia.");
      }

      const text = input.text === undefined ? record.text : input.text;
      const rating = input.rating === undefined ? record.rating : input.rating;

      if (!isValidText(text)) {
        return failure(422, "El texto de la opinión no es válido.");
      }
      if (!isValidRating(rating)) {
        return failure(422, "La valoración debe ser un entero de 1 a 5.");
      }

      commit({
        type: "opinion/update",
        opinionId: input.opinionId,
        text: text.trim(),
        rating,
        updatedAt: nextStamp(),
      });

      return success(200, opinionView(findOpinion(input.opinionId) ?? record, input.viewerId));
    },

    toggleLike({ opinionId, authorId }) {
      if (findOpinion(opinionId) === undefined) {
        return failure(404, "La opinión no existe.");
      }
      if (!hasViewer(authorId)) {
        return failure(422, "Falta quién da el me gusta.");
      }

      const existing = state.likes.find(
        (like) => like.opinionId === opinionId && like.authorId === authorId,
      );

      if (existing === undefined) {
        commit({
          type: "like/add",
          record: { opinionId, authorId, createdAt: nextStamp() },
        });
      } else {
        commit({ type: "like/remove", opinionId, authorId });
      }

      return success(200, {
        opinionId,
        likeCount: likeCountOf(opinionId),
        likedByMe: existing === undefined,
      });
    },

    listLikes({ opinionId }) {
      if (findOpinion(opinionId) === undefined) {
        return failure(404, "La opinión no existe.");
      }

      const likes: LikeView[] = state.likes
        .filter((like) => like.opinionId === opinionId)
        .sort(byCreatedAtDescending)
        .map((like) => ({
          opinionId: like.opinionId,
          author: authorView(like.authorId, like.authorId),
          createdAt: like.createdAt,
        }));

      return success(200, {
        opinionId,
        likeCount: likes.length,
        likes,
      });
    },

    addComment({ opinionId, authorId, text }) {
      if (!hasViewer(authorId)) {
        return failure(422, "Falta quién comenta.");
      }
      if (findOpinion(opinionId) === undefined) {
        return failure(404, "La opinión no existe.");
      }
      if (!isValidText(text)) {
        return failure(422, "El comentario no puede estar vacío.");
      }

      const record: CommentRecord = {
        commentId: nextCommentId(),
        opinionId,
        authorId,
        text: text.trim(),
        createdAt: nextStamp(),
      };

      commit({ type: "comment/add", record });

      return success(201, commentView(record, authorId));
    },

    listComments({ opinionId }) {
      if (findOpinion(opinionId) === undefined) {
        return failure(404, "La opinión no existe.");
      }

      const comments = state.comments
        .filter((comment) => comment.opinionId === opinionId)
        .sort(byCreatedAtDescending)
        .reverse()
        .map((comment) => commentView(comment, comment.authorId));

      return success(200, comments);
    },

    toggleFollow({ authorId, followerId }) {
      if (!hasViewer(followerId)) {
        return failure(422, "Falta quién sigue.");
      }
      if (authorId === followerId) {
        return failure(409, "No puedes seguirte a ti mismo.");
      }
      if (findAuthor(authorId) === undefined || findAuthor(followerId) === undefined) {
        return failure(404, "El autor no existe.");
      }

      const existing = state.follows.find(
        (follow) =>
          follow.followerId === followerId && follow.authorId === authorId,
      );

      if (existing === undefined) {
        commit({
          type: "follow/add",
          record: { followerId, authorId, createdAt: nextStamp() },
        });
      } else {
        commit({ type: "follow/remove", followerId, authorId });
      }

      return success(200, {
        authorId,
        followedByMe: existing === undefined,
        followerCount: state.follows.filter(
          (follow) => follow.authorId === authorId,
        ).length,
        viewerFollowingCount: state.follows.filter(
          (follow) => follow.followerId === followerId,
        ).length,
      });
    },

    listFollowing({ authorId, viewerId }) {
      if (!hasViewer(viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }
      if (findAuthor(authorId) === undefined) {
        return failure(404, "El autor no existe.");
      }

      const following = state.follows
        .filter((follow) => follow.followerId === authorId)
        .sort(byCreatedAtDescending)
        .map((follow) => authorView(follow.authorId, viewerId));

      return success(200, {
        authorId,
        followingCount: following.length,
        following,
      });
    },

    getAuthor({ authorId, viewerId }) {
      if (!hasViewer(viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }

      const author = findAuthor(authorId);
      if (author === undefined) {
        return failure(404, "El autor no existe.");
      }

      return success(200, {
        ...authorView(authorId, viewerId),
        opinionCount: state.opinions.filter(
          (opinion) => opinion.authorId === authorId,
        ).length,
        followingCount: state.follows.filter(
          (follow) => follow.followerId === authorId,
        ).length,
      });
    },

    countOpinions(workId) {
      return state.opinions.filter((opinion) => opinion.workId === workId).length;
    },

    subscribeContent(viewerId, listener) {
      if (!hasViewer(viewerId)) {
        return failure(
          422,
          "Falta quién mira: no se pueden calcular los campos de la vista.",
        );
      }

      const entry = { viewerId, listener };
      listeners.add(entry);
      // Emisión inmediata: sin ella la pantalla se queda en esqueletos (BR4.7).
      listener(snapshotFor(viewerId));

      return success(200, () => {
        listeners.delete(entry);
      });
    },
  };
}
