/**
 * El catálogo de ejemplo de C5 (BR5.1): las 8 obras reales de
 * `functional-spec.md` § Obras, en el orden de la tabla.
 *
 * Estas obras están siempre disponibles, con o sin sesión de Spotify y sin tocar la
 * red: son las que dan identidad a las opiniones sembradas y las que sostienen el
 * recorrido sin Spotify. Su `coverUrl` nace en `null` en las ocho, porque en U2 no
 * hay sesión que la resuelva; la portada que se pinta es el bloque con la inicial
 * (BR5.3).
 *
 * El orden es parte de la vista: `listSampleWorks` lo devuelve tal cual para que dos
 * lecturas seguidas no cambien la lista (BR5.1).
 */
import type { WorkView } from "./ports";

/** Las obras de ejemplo, ya en su orden estable. */
export const SAMPLE_WORKS: readonly WorkView[] = Object.freeze([
  {
    workId: "4u7EnebtmKWzUH433Rbtpz",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "0VjIjW4GlUZAMYd2vXMi3b",
    title: "Blinding Lights",
    artist: "The Weeknd",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "2Fxmhks0bxGSBdJ92vM42m",
    title: "bad guy",
    artist: "Billie Eilish",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "7qiZfU4dY1lWllzX7mPBI3",
    title: "Shape of You",
    artist: "Ed Sheeran",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "4OSBTYWVwsQhGLF9NHvIbR",
    title: "Rolling in the Deep",
    artist: "Adele",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "5ghIJDpPoe3CfHMGu71E6T",
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "4LRPiXqCikLlN15c3yImP7",
    title: "As It Was",
    artist: "Harry Styles",
    coverUrl: null,
    origin: "sample",
  },
  {
    workId: "0yLdNVWF3Srea0uzk55zFn",
    title: "Flowers",
    artist: "Miley Cyrus",
    coverUrl: null,
    origin: "sample",
  },
]);

/**
 * Copia de las obras de ejemplo. Cada catálogo recibe la suya: una resolución de
 * portada no puede tocar la constante compartida ni la del catálogo de otra prueba
 * (NFR3.6).
 */
export function cloneSampleWorks(): WorkView[] {
  return SAMPLE_WORKS.map((work) => ({ ...work }));
}
