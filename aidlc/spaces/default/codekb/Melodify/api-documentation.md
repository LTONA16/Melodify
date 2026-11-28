# API Documentation

## Base URL and Conventions

- Base: `/api/v1`. Cuerpo y respuesta en JSON; `Content-Type: application/json`.
- Tiempos en ISO-8601 (`isoTimestampSchema`), identificadores `cuid` de Prisma, paginación por cursor (`cursor`, `limit`, `DEFAULT_PAGE_SIZE=20`, `MAX_PAGE_SIZE=50`).
- Autenticación: `Authorization: Bearer <accessToken>` solo en rutas protegidas; el refresh viaja en el cuerpo.
- Validación con Zod antes del handler; un cuerpo inválido responde `422` con `apiErrorBodySchema`.
- OpenAPI 3.0.3 generado desde los esquemas: Swagger UI en `GET /api/v1/docs` y JSON en `GET /api/v1/docs/json`; `SWAGGER_ENABLED=false` en producción.

## Endpoint Inventory

| Method | Path | Auth | Success | Purpose |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/health` | No | `200` / `503` | Comprueba el proceso y `SELECT 1` en PostgreSQL |
| `POST` | `/api/v1/auth/register` | No | `201` | Crea cuenta y abre sesión |
| `POST` | `/api/v1/auth/login` | No | `200` | Inicia sesión con handle y contraseña |
| `POST` | `/api/v1/auth/refresh` | Refresh token | `200` | Rota el par de tokens |
| `POST` | `/api/v1/auth/logout` | Refresh token | `204` | Revoca el refresh actual |
| `GET` | `/api/v1/me` | Access token | `200` | Devuelve el perfil del usuario autenticado |
| `GET` | `/api/v1/docs` | No | `200` | Swagger UI (fuera de producción) |
| `GET` | `/api/v1/docs/json` | No | `200` | Documento OpenAPI (fuera de producción) |

## Schemas

- `registerBodySchema`: `handle`, `displayName`, `email?`, `password` (`passwordSchema`, mínimo 8 caracteres con mayúscula, minúscula y dígito).
- `loginBodySchema`: `handle` y `password`.
- `refreshBodySchema`: `refreshToken`.
- `sessionViewSchema`: `accessToken`, `refreshToken`, `expiresAt` y `user` (`userViewSchema`).
- `userViewSchema`: `id`, `handle`, `displayName`, `bio?`, `avatarUrl?`, `createdAt`.
- `healthResponseSchema`: `status` (`ok` | `degraded`), `uptime`, `timestamp`, `checks.database.status`.
- `paginationQuerySchema`: `limit` (1–50) y `cursor`; el sobre de lista es `Paginated<T>`.
- Vistas listas para recursos no expuestos aún: `AuthorView`, `AuthorDetailView`, `OpinionView`, `CommentView`, `LikeView`, `LikeList`.

## Error Model

- Sobres uniforme: `{ "error": { "code", "message", "details?" } }`; mensajes en español y accionables.
- Códigos declarados: `not_found`, `validation_failed`, `handle_taken`, `invalid_credentials`, `token_expired`, `refresh_reused`, `not_opinion_owner`, `opinion_already_exists`, `cannot_follow_self`, `rate_limited`, `internal_error`.
- `details[]` contiene `path` y `message` por campo inválido.
- Errores inesperados se registran con logger y se responden como `500 internal_error`; nunca se filtra la traza.

## Rate Limits

- Credenciales (`register`, `login`): 20 peticiones/minuto por IP.
- Sesión (`refresh`, `logout`): 60 peticiones/minuto por IP.
- Exceso: `429` con el mismo sobre de error; el límite global del plugin está desactivado (`global: false`).

## Security

- Contraseñas con Argon2id (`@node-rs/argon2`); solo se guarda el hash.
- Access JWT con `sub`; TTL por defecto 15 minutos. Refresh opaco con TTL 30 días, guardado como SHA-256 en `refresh_sessions`.
- Reutilizar un refresh revocado revoca toda la familia (`refresh_reused`, `401`).
- Helmet y CORS con orígenes desde `CORS_ORIGINS`; hostname y trust proxy configurables.

## Not Yet Implemented

No hay rutas de obras, opiniones, me gusta, comentarios, seguidores, feed ni actividad. Sus tipos y reglas ya están en `packages/contracts/src/views.ts` y en la migración de Prisma, pero las pantallas móviles siguen usando el almacén local en memoria.
