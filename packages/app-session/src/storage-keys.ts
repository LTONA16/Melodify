/**
 * Claves del almacenamiento seguro. Cada dueño declara la suya y ninguna unidad
 * importa la de otra (NFR3.3): la sesión de la app usa esta; U4 añadirá la suya
 * para el token de Spotify en su propio paquete.
 */
export const SESSION_STORAGE_KEY = "melodify.session";
