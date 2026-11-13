/**
 * Tiempo transcurrido en lenguaje llano para la tarjeta de opinión (F6.4). Una
 * sola función, sin dependencias: recibe el instante y devuelve el texto que se
 * pinta como pista secundaria.
 *
 * Los cortes son deliberadamente gruesos —minutos, horas, días— porque la tarjeta
 * no necesita precisión y el texto se lee de un vistazo.
 */
export function formatRelativeTime(
  iso: string,
  now: number = Date.now(),
): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) {
    return "";
  }

  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) {
    return "ahora";
  }
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }

  return `hace ${Math.floor(hours / 24)} d`;
}
