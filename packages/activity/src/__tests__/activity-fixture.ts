/**
 * Doble local de C4 para las pruebas de C8 (TS-39…TS-43, BR24.4).
 *
 * C8 no importa la implementación de C4: la recibe por constructor. Traer
 * `createContentStore` aquí convertiría una frontera de arquitectura en una
 * dependencia de prueba y rompería la regla de lint. Este doble solo nombra sus
 * tipos y reproduce la siembra con horas fijas, que es todo lo que la derivación
 * necesita observar.
 */
import type {
  AuthorDetailView,
  AuthorView,
  CommentView,
  ContentResult,
  ContentStore,
  ContentSuccessCode,
  FollowingList,
  LikeList,
  LikeView,
  OpinionView,
} from "@melodify/content-store";

export const FIXTURE_NOW = "2026-11-19T12:00:00.000Z";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function at(ageMs: number): string {
  return new Date(Date.parse(FIXTURE_NOW) - ageMs).toISOString();
}

const AUTHORS: Record<string, AuthorView> = {
  demo: { authorId: "demo", displayName: "Usuario demo", handle: "demo", followedByMe: false },
  lucia: { authorId: "lucia", displayName: "Lucía Ferrer", handle: "lucia", followedByMe: true },
  ana: { authorId: "ana", displayName: "Ana Ríos", handle: "ana", followedByMe: true },
  bruno: { authorId: "bruno", displayName: "Bruno Salas", handle: "bruno", followedByMe: false },
  marcos: { authorId: "marcos", displayName: "Marcos Vega", handle: "marcos", followedByMe: false },
};

function author(authorId: string): AuthorView {
  return AUTHORS[authorId] ?? {
    authorId,
    displayName: authorId,
    handle: authorId,
    followedByMe: false,
  };
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

const OPINION_RECORDS: OpinionRecord[] = [
  {
    opinionId: "op-001",
    authorId: "demo",
    workId: "7tFiyTwD0nx5a1eklYtX2J",
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    text: "Seis minutos que no se sienten como seis minutos.",
    rating: 5,
    createdAt: at(3 * DAY),
    updatedAt: at(3 * DAY),
  },
  {
    opinionId: "op-002",
    authorId: "lucia",
    workId: "7tFiyTwD0nx5a1eklYtX2J",
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    text: "Mi canción de carretera.",
    rating: 4,
    createdAt: at(2 * HOUR),
    updatedAt: at(2 * HOUR),
  },
  {
    opinionId: "op-003",
    authorId: "ana",
    workId: "0VjIjW4GlUZAMYd2vXMi3b",
    workTitle: "Blinding Lights",
    workArtist: "The Weeknd",
    text: "Suena a noche de viernes.",
    rating: 4,
    createdAt: at(5 * HOUR),
    updatedAt: at(5 * HOUR),
  },
  {
    opinionId: "op-004",
    authorId: "demo",
    workId: "0VjIjW4GlUZAMYd2vXMi3b",
    workTitle: "Blinding Lights",
    workArtist: "The Weeknd",
    text: "La producción es una clase de cómo hacer mucho con poco.",
    rating: 5,
    createdAt: at(1 * DAY),
    updatedAt: at(4 * HOUR),
  },
  {
    opinionId: "op-005",
    authorId: "bruno",
    workId: "2Fxmhks0bxGSBdJ92vM42m",
    workTitle: "bad guy",
    workArtist: "Billie Eilish",
    text: "Me gusta la actitud.",
    rating: 3,
    createdAt: at(1 * DAY),
    updatedAt: at(1 * DAY),
  },
  {
    opinionId: "op-006",
    authorId: "marcos",
    workId: "7qiZfU4dY1lWllzX7mPBI3",
    workTitle: "Shape of You",
    workArtist: "Ed Sheeran",
    text: "Pegadiza hasta el cansancio.",
    rating: 2,
    createdAt: at(2 * DAY),
    updatedAt: at(2 * DAY),
  },
  {
    opinionId: "op-007",
    authorId: "lucia",
    workId: "4OSBTYWVwsQhGLF9NHvIbR",
    workTitle: "Rolling in the Deep",
    workArtist: "Adele",
    text: "Una voz que llena la habitación.",
    rating: 5,
    createdAt: at(3 * DAY),
    updatedAt: at(3 * DAY),
  },
  {
    opinionId: "op-008",
    authorId: "demo",
    workId: "5ghIJDpPoe3CfHMGu71E6T",
    workTitle: "Smells Like Teen Spirit",
    workArtist: "Nirvana",
    text: "Ese riff no envejece.",
    rating: 4,
    createdAt: at(4 * DAY),
    updatedAt: at(4 * DAY),
  },
  {
    opinionId: "op-009",
    authorId: "ana",
    workId: "0yLdNVWF3Srea0uzk55zFn",
    workTitle: "Flowers",
    workArtist: "Miley Cyrus",
    text: "La melodía se queda.",
    rating: 3,
    createdAt: at(6 * HOUR),
    updatedAt: at(6 * HOUR),
  },
  {
    opinionId: "op-010",
    authorId: "bruno",
    workId: "0yLdNVWF3Srea0uzk55zFn",
    workTitle: "Flowers",
    workArtist: "Miley Cyrus",
    text: "Para bailar en la cocina.",
    rating: 4,
    createdAt: at(2 * DAY),
    updatedAt: at(2 * DAY),
  },
];

const LIKE_RECORDS: LikeRecord[] = [
  { opinionId: "op-001", authorId: "lucia", createdAt: at(2 * DAY) },
  { opinionId: "op-004", authorId: "ana", createdAt: at(3 * HOUR) },
  { opinionId: "op-002", authorId: "bruno", createdAt: at(1 * HOUR) },
  { opinionId: "op-009", authorId: "marcos", createdAt: at(5 * HOUR) },
];

const COMMENT_RECORDS: CommentRecord[] = [
  { commentId: "cm-001", opinionId: "op-001", authorId: "ana", text: "Totalmente de acuerdo.", createdAt: at(1 * DAY) },
  { commentId: "cm-002", opinionId: "op-004", authorId: "bruno", text: "El puente es lo mejor.", createdAt: at(2 * HOUR) },
  { commentId: "cm-003", opinionId: "op-008", authorId: "lucia", text: "Ese riff no envejece.", createdAt: at(3 * DAY) },
];

function failure<T, C extends ContentSuccessCode = 200>(
  message: string,
): ContentResult<T, C> {
  return { ok: false, code: 422, message };
}

/**
 * Crea un almacén aislado. `seed: "empty"` reproduce el caso sin opiniones sin
 * importar la semilla de C4.
 */
export function createFixtureContentStore(
  options: { seed?: "default" | "empty"; now?: string } = {},
): ContentStore {
  const now = options.now ?? FIXTURE_NOW;
  const opinions = options.seed === "empty" ? [] : OPINION_RECORDS.map((item) => ({ ...item }));
  const likes = options.seed === "empty" ? [] : LIKE_RECORDS.map((item) => ({ ...item }));
  const comments = options.seed === "empty" ? [] : COMMENT_RECORDS.map((item) => ({ ...item }));
  let revision = 0;

  const likeCount = (opinionId: string): number =>
    likes.filter((like) => like.opinionId === opinionId).length;
  const commentCount = (opinionId: string): number =>
    comments.filter((comment) => comment.opinionId === opinionId).length;

  const toView = (record: OpinionRecord, viewerId: string): OpinionView => ({
    opinionId: record.opinionId,
    workId: record.workId,
    workTitle: record.workTitle,
    workArtist: record.workArtist,
    author: author(record.authorId),
    text: record.text,
    rating: record.rating,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    likeCount: likeCount(record.opinionId),
    commentCount: commentCount(record.opinionId),
    likedByMe: likes.some(
      (like) => like.opinionId === record.opinionId && like.authorId === viewerId,
    ),
    isOwn: record.authorId === viewerId,
  });

  return {
    listOpinions(input) {
      if (!input.viewerId) {
        return failure("Falta la identidad de quien mira.");
      }
      const filtered = opinions.filter(
        (record) =>
          (!input.workId || record.workId === input.workId) &&
          (!input.authorId || record.authorId === input.authorId),
      );
      return { ok: true, code: 200, value: filtered.map((record) => toView(record, input.viewerId!)) };
    },
    getOpinion(input) {
      const record = opinions.find((item) => item.opinionId === input.opinionId);
      if (!record || !input.viewerId) {
        return failure("No se pudo leer la opinión.");
      }
      return { ok: true, code: 200, value: toView(record, input.viewerId) };
    },
    createOpinion(input) {
      const opinionId = `op-${String(opinions.length + 1).padStart(3, "0")}`;
      const record: OpinionRecord = {
        opinionId,
        authorId: input.authorId,
        workId: input.workId,
        workTitle: input.workTitle,
        workArtist: input.workArtist,
        text: input.text,
        rating: input.rating,
        createdAt: now,
        updatedAt: now,
      };
      opinions.push(record);
      revision += 1;
      return { ok: true, code: 201, value: toView(record, input.authorId) };
    },
    updateOpinion() {
      return failure("El doble no necesita editar opiniones.");
    },
    toggleLike() {
      return failure("El doble no necesita alternar me gusta.");
    },
    listLikes(input) {
      const found = likes
        .filter((like) => like.opinionId === input.opinionId)
        .map<LikeView>((like) => ({
          opinionId: like.opinionId,
          author: author(like.authorId),
          createdAt: like.createdAt,
        }));
      return {
        ok: true,
        code: 200,
        value: { opinionId: input.opinionId, likeCount: found.length, likes: found } satisfies LikeList,
      };
    },
    addComment() {
      return failure("El doble no necesita añadir comentarios.");
    },
    listComments(input) {
      const found: CommentView[] = comments
        .filter((comment) => comment.opinionId === input.opinionId)
        .map((comment) => ({
          commentId: comment.commentId,
          opinionId: comment.opinionId,
          author: author(comment.authorId),
          text: comment.text,
          createdAt: comment.createdAt,
        }));
      return { ok: true, code: 200, value: found };
    },
    toggleFollow() {
      return failure("El doble no necesita seguir autores.");
    },
    listFollowing(input) {
      return {
        ok: true,
        code: 200,
        value: { authorId: input.authorId, followingCount: 0, following: [] } satisfies FollowingList,
      };
    },
    getAuthor(input) {
      return {
        ok: true,
        code: 200,
        value: {
          ...author(input.authorId),
          opinionCount: opinions.filter((record) => record.authorId === input.authorId).length,
          followingCount: 0,
        } satisfies AuthorDetailView,
      };
    },
    countOpinions() {
      return opinions.length;
    },
    subscribeContent(_viewerId, listener) {
      listener({ revision, opinions: [] });
      return { ok: true, code: 200, value: () => undefined };
    },
  };
}
