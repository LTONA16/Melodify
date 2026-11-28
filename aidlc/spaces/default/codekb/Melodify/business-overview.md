# Business Overview

## Domain and Purpose

Melodify es una red social de descubrimiento, calificación y reseña de música, inspirada en Letterboxd/Goodreads. No es un reproductor de streaming: el catálogo de Spotify se consulta para metadatos y enlaces externos. La app móvil sirve para descubrir obras, publicar opiniones, reaccionar, comentar, seguir autores y ver actividad; el backend en construcción centraliza identidad, datos sociales y sesiones.

## Key Functionality

- **Perfil musical**: handle único, nombre, biografía y avatar opcional; vitrina de reseñas, valoraciones y obras destacadas.
- **Catálogo y descubrimiento**: búsqueda de canciones, álbumes, artistas y géneros con portadas y metadatos; hoy se resuelve en la app con el catálogo de ejemplo y Spotify.
- **Opiniones**: valoración de 1 a 5 estrellas (media estrella), reseña de texto y registro de escucha; una opinión por obra y autor en el modelo relacional.
- **Comunidad**: me gusta, comentarios, seguimientos y feed de actividad.
- **Sesión**: registro, inicio de sesión, cuenta actual, refresh rotatorio y logout ya implementados en el API; la app aún usa el usuario simulado `demo`/`demo`.

## Current Implementation Boundary

- Implementado: servicio Fastify con salud, OpenAPI, CORS/helmet, rate limiting y autenticación con Argon2id + JWT; base Prisma/PostgreSQL con tablas de sociales; app Expo recorrible sin Spotify, con catálogo de ejemplo.
- No implementado en el servidor: endpoints de obras, opiniones, me gusta, comentarios, seguidores, feed y actividad; seed del usuario demo pese a existir `SEED_DEMO`.
- No implementado en la app: adaptador HTTP al backend, sesión real, persistencia en servidor y consumo server-side de Spotify (PKCE permanece en el dispositivo).
- Fuera de alcance por decisiones previas: backend/autenticación real quedaron permitidos solo para este intent; siguen prohibidos el client secret de Spotify, reproducir audio, notificaciones push y publicación en tiendas.

## Business Rules

- Una opinión es única por `(authorId, workId)` (`@@unique` en `apps/api/prisma/schema.prisma`); el rating debe estar entre 0.5 y 5 (`opinions_rating_range`).
- Un usuario no puede seguirse a sí mismo (`follows_no_self`); un me gusta se identifica por `(opinionId, userId)`.
- El token de refresco se guarda hasheado en `refresh_sessions`; si se reutiliza un token ya revocado se revoca toda su familia.
- Las respuestas de error son en español y con acción; la documentación se sirve solo fuera de producción; los permisos y el token de Spotify no viajan al backend.

## Improvement Opportunities

- Conectar la sesión real de la app sin perder la instancia única de `app/src/bootstrap/session.ts`.
- Añadir los recursos sociales sobre el esquema existente con paginación por cursor y contratos Zod compartidos.
- Alinear `docs/04-arquitectura.md` y `docs/03-ia-agentes-mcp.md` con la frontera actual antes de usarlos como guía de diseño.
