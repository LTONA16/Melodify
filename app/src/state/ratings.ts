/**
 * La media de las valoraciones de una obra, redondeada al entero más cercano y con
 * `.5` hacia arriba (F9). Vive aparte de las pantallas para que el detalle de obra y
 * el de opinión redondeen igual: dos copias del mismo redondeo acaban discrepando en
 * el borde exacto.
 */
export function averageRating(ratings: readonly number[]): number {
  if (ratings.length === 0) {
    return 0;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return Math.floor(total / ratings.length + 0.5);
}
