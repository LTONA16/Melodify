/**
 * Semilla mínima de Inicio (F6, BR3.1–BR3.3): una sola opinión de ejemplo y su
 * obra, en un módulo de presentación local que U2 sustituirá por `ContentStore` y
 * `Catalog` sin tocar la pantalla ni la cáscara.
 *
 * La obra es real y se identifica por su `workId` de Spotify, pero ni la semilla ni
 * la pantalla piden nada a la red: el título y el artista viajan con la opinión y la
 * portada es nula, así que se pinta el bloque con la inicial (FR11.3). El autor no
 * es `demo`: la tarjeta no se pinta como propia y no muestra «Editar» (F6.6).
 */
import type { OpinionCardModel } from "@melodify/design-system";

/** Instante fijo de la semilla: ninguna prueba ni pantalla depende del reloj real. */
const createdAt = "2026-11-11T09:00:00.000Z";

export const inicioSeed: OpinionCardModel[] = [
  {
    opinionId: "seed-opinion-1",
    authorId: "user-lucia",
    authorName: "Lucía Ferrer",
    authorHandle: "lucia",
    followedByMe: false,
    workId: "4u7EnebtmKWzUH433Rbtpz",
    workTitle: "Bohemian Rhapsody",
    workArtist: "Queen",
    coverUrl: null,
    text: "Seis minutos que no se sienten como seis minutos. Cada vez que la pongo encuentro una capa nueva: el piano, las voces, ese silencio antes del final.",
    rating: 5,
    createdAt,
    updatedAt: createdAt,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
  },
];
