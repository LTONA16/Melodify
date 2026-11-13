/**
 * La siembra de ejemplo de C4 (BR4.2, `functional-spec.md` § Semilla).
 *
 * Las fechas no son constantes del calendario: son desfases respecto al instante
 * de construcción (`now`), de modo que «hace 2 h» siga siendo cierto en cada
 * arranque y una prueba pueda fijar el reloj (NFR5.7, BR4.2). El almacén resuelve
 * esos desfases una sola vez, al construirse.
 *
 * Los textos y los identificadores son los de la tabla de la especificación, sin
 * retoques: las pruebas de la unidad leen sus invariantes en lugar de duplicar los
 * números.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface SeedAuthor {
  authorId: string;
  displayName: string;
  handle: string;
}

export interface SeedWork {
  workId: string;
  title: string;
  artist: string;
}

export interface SeedOpinion {
  opinionId: string;
  authorId: string;
  workId: string;
  text: string;
  rating: number;
  /** Antigüedad de la creación respecto a `now`. */
  ageMs: number;
  /** Antigüedad de la última edición; ausente cuando nunca se editó. */
  editedAgeMs?: number;
}

export interface SeedLike {
  opinionId: string;
  authorId: string;
  ageMs: number;
}

export interface SeedComment {
  commentId: string;
  opinionId: string;
  authorId: string;
  text: string;
  ageMs: number;
}

export interface SeedFollow {
  followerId: string;
  authorId: string;
  ageMs: number;
}

export interface ContentSeed {
  authors?: SeedAuthor[];
  works?: SeedWork[];
  opinions?: SeedOpinion[];
  likes?: SeedLike[];
  comments?: SeedComment[];
  follows?: SeedFollow[];
}

/** Los cinco autores de la siembra; `demo` es la cuenta que usa la app. */
export const SEED_AUTHORS: SeedAuthor[] = [
  { authorId: "demo", displayName: "Usuario demo", handle: "demo" },
  { authorId: "lucia", displayName: "Lucía Ferrer", handle: "lucia" },
  { authorId: "ana", displayName: "Ana Ríos", handle: "ana" },
  { authorId: "bruno", displayName: "Bruno Salas", handle: "bruno" },
  { authorId: "marcos", displayName: "Marcos Vega", handle: "marcos" },
];

/**
 * Las ocho obras reales del catálogo de ejemplo (BR4.9). En U2 no hay sesión de
 * Spotify, así que ninguna tiene `coverUrl`: todas las portadas son bloque con la
 * inicial (BR5.3).
 */
export const SEED_WORKS: SeedWork[] = [
  { workId: "4u7EnebtmKWzUH433Rbtpz", title: "Bohemian Rhapsody", artist: "Queen" },
  { workId: "0VjIjW4GlUZAMYd2vXMi3b", title: "Blinding Lights", artist: "The Weeknd" },
  { workId: "2Fxmhks0bxGSBdJ92vM42m", title: "bad guy", artist: "Billie Eilish" },
  { workId: "7qiZfU4dY1lWllzX7mPBI3", title: "Shape of You", artist: "Ed Sheeran" },
  { workId: "4OSBTYWVwsQhGLF9NHvIbR", title: "Rolling in the Deep", artist: "Adele" },
  { workId: "5ghIJDpPoe3CfHMGu71E6T", title: "Smells Like Teen Spirit", artist: "Nirvana" },
  { workId: "4LRPiXqCikLlN15c3yImP7", title: "As It Was", artist: "Harry Styles" },
  { workId: "0yLdNVWF3Srea0uzk55zFn", title: "Flowers", artist: "Miley Cyrus" },
];

/**
 * Las diez opiniones. `op-004` es la única editada de la siembra y por eso el punto
 * de observación de «Creada el …» / «Editada el …» (AC4.2.4). `As It Was` (obra 7)
 * no tiene ninguna: es la variante de obra vacía con datos reales (BR8.5).
 */
export const SEED_OPINIONS: SeedOpinion[] = [
  {
    opinionId: "op-001",
    authorId: "demo",
    workId: "4u7EnebtmKWzUH433Rbtpz",
    rating: 5,
    ageMs: 3 * DAY,
    text: "Seis minutos que no se sienten como seis minutos. Cada vez que la pongo encuentro una capa nueva: el piano, las voces, ese silencio antes del final.",
  },
  {
    opinionId: "op-002",
    authorId: "lucia",
    workId: "4u7EnebtmKWzUH433Rbtpz",
    rating: 4,
    ageMs: 2 * HOUR,
    text: "La escuché por primera vez en un viaje largo y desde entonces es mi canción de carretera. La segunda mitad es otra canción y las dos funcionan.",
  },
  {
    opinionId: "op-003",
    authorId: "ana",
    workId: "0VjIjW4GlUZAMYd2vXMi3b",
    rating: 4,
    ageMs: 5 * HOUR,
    text: "Suena a noche de viernes. El sintetizador hace todo el trabajo y no me quejo: hay canciones que existen para eso.",
  },
  {
    opinionId: "op-004",
    authorId: "demo",
    workId: "0VjIjW4GlUZAMYd2vXMi3b",
    rating: 5,
    ageMs: 1 * DAY,
    editedAgeMs: 4 * HOUR,
    text: "Me costó entenderla hasta que la escuché con auriculares. La producción es una clase de cómo hacer mucho con poco.",
  },
  {
    opinionId: "op-005",
    authorId: "bruno",
    workId: "2Fxmhks0bxGSBdJ92vM42m",
    rating: 3,
    ageMs: 1 * DAY,
    text: "Me gusta la actitud más que la canción. El susurro funciona en el estribillo y se agota un poco antes del final.",
  },
  {
    opinionId: "op-006",
    authorId: "marcos",
    workId: "7qiZfU4dY1lWllzX7mPBI3",
    rating: 2,
    ageMs: 2 * DAY,
    text: "Pegadiza hasta el cansancio. La guitarra está bien, pero la letra no me dice nada nuevo.",
  },
  {
    opinionId: "op-007",
    authorId: "lucia",
    workId: "4OSBTYWVwsQhGLF9NHvIbR",
    rating: 5,
    ageMs: 3 * DAY,
    text: "Una voz que llena la habitación. La escucho cuando necesito cantar a gritos en el coche y no me importa quién mire.",
  },
  {
    opinionId: "op-008",
    authorId: "demo",
    workId: "5ghIJDpPoe3CfHMGu71E6T",
    rating: 4,
    ageMs: 4 * DAY,
    text: "Ese riff no envejece. La producción suena a garaje y eso es exactamente lo que la hace funcionar.",
  },
  {
    opinionId: "op-009",
    authorId: "ana",
    workId: "0yLdNVWF3Srea0uzk55zFn",
    rating: 3,
    ageMs: 6 * HOUR,
    text: "La melodía se queda, aunque siento que ya la había escuchado. Igual la pongo cuando necesito energía rápida.",
  },
  {
    opinionId: "op-010",
    authorId: "bruno",
    workId: "0yLdNVWF3Srea0uzk55zFn",
    rating: 4,
    ageMs: 2 * DAY,
    text: "Más directa que sus discos anteriores. La producción limpia y la letra corta; para bailar en la cocina.",
  },
];

/**
 * Cuatro me gusta: dos recibidos por `demo` (`lucia → op-001`, `ana → op-004`) y dos
 * de otros autores sobre opiniones ajenas (`bruno → op-002`, `marcos → op-009`), que
 * solo existen para que los contadores del feed no estén todos a cero y **no** son
 * actividad de la cuenta (BR4.2).
 */
export const SEED_LIKES: SeedLike[] = [
  { opinionId: "op-001", authorId: "lucia", ageMs: 2 * DAY },
  { opinionId: "op-004", authorId: "ana", ageMs: 3 * HOUR },
  { opinionId: "op-002", authorId: "bruno", ageMs: 1 * HOUR },
  { opinionId: "op-009", authorId: "marcos", ageMs: 5 * HOUR },
];

/** Tres comentarios recibidos sobre opiniones de `demo`. */
export const SEED_COMMENTS: SeedComment[] = [
  {
    commentId: "cm-001",
    opinionId: "op-001",
    authorId: "ana",
    text: "Totalmente de acuerdo.",
    ageMs: 1 * DAY,
  },
  {
    commentId: "cm-002",
    opinionId: "op-004",
    authorId: "bruno",
    text: "El puente es lo mejor.",
    ageMs: 2 * HOUR,
  },
  {
    commentId: "cm-003",
    opinionId: "op-008",
    authorId: "lucia",
    text: "Ese riff no envejece.",
    ageMs: 3 * DAY,
  },
];

/** `demo` sigue a las dos autoras de ejemplo (BR4.2). */
export const SEED_FOLLOWS: SeedFollow[] = [
  { followerId: "demo", authorId: "lucia", ageMs: 5 * DAY },
  { followerId: "demo", authorId: "ana", ageMs: 4 * DAY },
];

/** La siembra completa, en el orden de las tablas de la especificación. */
export const defaultSeed: ContentSeed = {
  authors: SEED_AUTHORS,
  works: SEED_WORKS,
  opinions: SEED_OPINIONS,
  likes: SEED_LIKES,
  comments: SEED_COMMENTS,
  follows: SEED_FOLLOWS,
};
