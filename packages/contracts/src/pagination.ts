/**
 * Paginación por cursor, compartida por todas las listas.
 *
 * Por qué cursor y no `page`: con contenido que se publica mientras alguien
 * desplaza, `OFFSET` repite y salta elementos. El cursor es opaco para quien
 * llama (base64 de la posición) y el servidor decide qué significa.
 */

export interface PaginationQuery {
  cursor?: string;
  /** Cuántos elementos pedir; por defecto 20 y nunca más de 50. */
  limit?: number;
}

export interface Paginated<T> {
  items: T[];
  /** `null` cuando no quedan más páginas. */
  nextCursor: string | null;
}

/** El límite por defecto y el máximo que el servidor acepta. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
