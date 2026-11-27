# API de Melodify

El servicio REST de Melodify: cuentas con `handle` y contraseña, perfiles,
opiniones, me gusta, comentarios, seguimientos, feed y actividad. Corre en
Node con Fastify, TypeScript, PostgreSQL y Prisma, y habla el vocabulario de
`@melodify/contracts`.

**Spotify no pasa por aquí.** La app sigue siendo dueña de su PKCE y de su
token; el servidor no ve un token de Spotify ni conoce su client secret.

## Estado

La base del servicio está terminada: arranque, configuración validada,
manejadores de error, sonda de salud, documentación OpenAPI, esquema de datos
con sus migraciones y la suite de pruebas contra Postgres real.

Lo siguiente es la autenticación y las sesiones (registro, inicio de sesión,
JWT de acceso corto y refresh rotatorio) y, después, los recursos sociales.

## Requisitos

- Node.js 20 o posterior.
- Docker Desktop con el motor levantado (para el Postgres de desarrollo y de
  pruebas).
- `npm` desde la raíz del monorepo. Este paquete es un workspace
  (`@melodify/api`).

## Puesta en marcha

Todos los comandos se lanzan desde la raíz del repositorio salvo que se diga lo
contrario.

```bash
# 1. Dependencias del monorepo (incluye las de este paquete).
npm install

# 2. Configuración local.
cp apps/api/.env.example apps/api/.env
#    Rellena JWT_ACCESS_SECRET con un secreto de 32 caracteres como mínimo.

# 3. Postgres en Docker (escucha en el puerto 55432).
cd apps/api
docker compose up -d
cd ../..

# 4. Cliente de Prisma y migraciones.
npm run -w @melodify/api db:generate
npm run -w @melodify/api db:deploy

# 5. Servidor en modo desarrollo (recarga al guardar).
npm run -w @melodify/api dev
```

Con el servidor arriba:

- `GET http://localhost:3000/api/v1/health` — sonda de vida y de base de datos.
- `http://localhost:3000/api/v1/docs` — Swagger UI con la superficie publicada
  (solo fuera de producción).

### Por qué el puerto 55432

`5432` y `5433` suelen estar ocupados por Postgres instalados en la máquina. El
contenedor mapea `55432:5432` para no competir con ellos ni con otro contenedor
del proyecto. Si ese puerto también estuviera ocupado, cambia el mapeo en
`docker-compose.yml` y las dos URL de `.env`.

El contenedor se llama `melodify-postgres`, guarda los datos en el volumen
`melodify-pgdata` y crea dos bases al inicializarse:

- `melodify` — desarrollo.
- `melodify_test` — pruebas. Vive en la misma instancia para aplicar las mismas
  migraciones, pero es una base distinta para que la suite no borre nada de
  desarrollo.

Comprueba el estado con `docker compose ps` (desde `apps/api`) o la salud con
`docker inspect --format "{{.State.Health.Status}}" melodify-postgres`.

## Variables de entorno

Están documentadas en `.env.example`. El proceso falla al arrancar si falta algo
obligatorio o está mal, y el mensaje nombra la variable, nunca su valor.

| Variable                  | Obligatoria | Por defecto     | Para qué                                         |
| ------------------------- | ----------- | --------------- | ------------------------------------------------ |
| `NODE_ENV`                | no          | `development`   | `development`, `test` o `production`             |
| `HOST`                    | no          | `0.0.0.0`       | Dirección en la que escucha el proceso           |
| `PORT`                    | no          | `3000`          | Puerto del servidor                              |
| `DATABASE_URL`            | **sí**      | —               | Postgres de desarrollo                           |
| `TEST_DATABASE_URL`       | no          | puerto `55432`  | Postgres de pruebas (la lee la suite)            |
| `JWT_ACCESS_SECRET`       | **sí**      | —               | Secreto del JWT de acceso (32 caracteres o más)  |
| `ACCESS_TOKEN_TTL`        | no          | `15m`           | Vida del access token                            |
| `REFRESH_TOKEN_TTL_DAYS`  | no          | `30`            | Vida del refresh token, en días                  |
| `CORS_ORIGINS`            | no          | vacío           | Orígenes permitidos, separados por comas         |
| `SEED_DEMO`               | no          | `false`         | Siembra el usuario `demo`/`demo` en desarrollo   |

`.env` no se commitea: contiene el secreto del JWT. `.env.example` documenta las
variables y nada más.

## Scripts

Desde la raíz, con el filtro del workspace:

| Comando                                  | Qué hace                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| `npm run -w @melodify/api dev`           | Servidor con recarga (`tsx watch`)                    |
| `npm run -w @melodify/api typecheck`     | TypeScript en modo proyecto (`tsc -b`)                |
| `npm run -w @melodify/api test`          | Vitest con cobertura contra el Postgres de pruebas    |
| `npm run -w @melodify/api db:generate`   | Genera el cliente de Prisma                           |
| `npm run -w @melodify/api db:migrate`    | Crea y aplica una migración en desarrollo             |
| `npm run -w @melodify/api db:deploy`     | Aplica las migraciones existentes                     |

Las compuertas del repositorio se lanzan desde la raíz: `npm test` (la suite de
la app móvil), `npm run typecheck` y `npm run lint`. Las tres tienen que estar en
verde antes de un pull request.

## Endpoints

| Método | Ruta                 | Qué devuelve                                                    |
| ------ | -------------------- | --------------------------------------------------------------- |
| `GET`  | `/api/v1/health`     | `200` con `{ status, version, database }`, o `503` si la base no responde |
| `GET`  | `/api/v1/docs`       | Swagger UI (fuera de producción)                                |
| `GET`  | `/api/v1/docs/json`  | La especificación OpenAPI 3.0.3                                 |

Los esquemas de petición y respuesta son los mismos Zod que validan en tiempo de
ejecución: la documentación no se escribe dos veces.

## Modelo de datos

El esquema vive en `prisma/schema.prisma` y las migraciones en
`prisma/migrations/`. Siete tablas:

- `users` — `handle` único (en minúsculas), nombre visible y `passwordHash`.
- `works` — la obra sobre la que se opina, identificada por su id de Spotify.
- `opinions` — una opinión por persona y obra (`@@unique([authorId, workId])`).
- `likes` — clave primaria `(opinionId, userId)`: un me gusta no se duplica.
- `comments` — comentarios de una opinión.
- `follows` — quién sigue a quién, con clave primaria `(followerId, followeeId)`.
- `refresh_tokens` — refresh rotatorio por familia, con hash y revocación.

Dos reglas que Prisma no modela viven en la migración inicial como `CHECK`:

- `opinions_rating_range` — la valoración es un entero de 1 a 5.
- `follows_no_self` — nadie se sigue a sí mismo.

Lo que **no** hay, y es deliberado en esta versión: tabla de actividad (se
deriva), `email` y recuperación de contraseña (minimización de datos),
`deletedAt` (no se borra contenido) y cualquier cosa de Spotify.

## Pruebas

La suite usa **Vitest**, no Jest: el preset de la app es `jest-expo` y
arrastrarlo al servidor metería módulos nativos donde no hay pantalla. Cada
prueba monta un Fastify real con `inject` (sin abrir puerto) y las que tocan
datos hablan con el Postgres de pruebas.

Antes de la primera prueba, `test/helpers/global-setup.ts` aplica
`prisma migrate deploy` sobre `melodify_test`: no hay un esquema paralelo, así
que una migración rota se ve aquí y no en producción.

Umbrales de cobertura sobre `src/**` (sin `src/server.ts`, que es cableado de
arranque): 80 % en líneas, sentencias y funciones; 70 % en ramas.

## Estructura

```text
apps/api/
├── prisma/
│   ├── schema.prisma          # modelo de datos
│   └── migrations/            # SQL versionado (incluye los CHECK)
├── src/
│   ├── app.ts                 # composición del servidor, sin abrir puerto
│   ├── server.ts              # arranque: carga el entorno y hace listen
│   ├── config/env.ts          # validación de la configuración
│   ├── lib/                   # errores y logger
│   ├── modules/               # una carpeta por recurso (hoy: health)
│   ├── plugins/               # errores, OpenAPI y Prisma
│   └── version.ts             # versión leída de package.json
├── test/                      # pruebas y helpers (base de pruebas, app de prueba)
├── docker/init-test-db.sql    # crea melodify_test al inicializar el volumen
├── docker-compose.yml         # Postgres 16 en 55432
└── vitest.config.mts          # configuración de la suite y cobertura
```

## Fronteras del proyecto

- El API solo importa `@melodify/contracts` del resto del monorepo. No depende
  de la app móvil ni de sus paquetes.
- `@melodify/spotify` y `@melodify/content-store` no se tocan desde aquí.
- Nada de credenciales en el código: todo secreto llega por entorno.
