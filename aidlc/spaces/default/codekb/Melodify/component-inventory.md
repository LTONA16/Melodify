# Component Inventory

## Servicio REST (apps/api)

Servicio Fastify 5 modular con arranque en `src/server.ts` y fábrica pura en `src/app.ts`. Plugins: JWT (`src/plugins/auth.ts`), errores, OpenAPI y Prisma. Módulos actuales: `health`, `auth`, `me`; Prisma y PostgreSQL 16 son la única persistencia. Las reglas de negocio viven en `src/modules/auth/service.ts` y los errores designados en `src/lib/errors.ts`.

## Contratos compartidos (packages/contracts)

Biblioteca TypeScript sin React ni red. Publica tipos desde `.` y esquemas Zod desde `./schemas` para mantener el runtime fuera del bundle móvil. Define `SessionView`, `UserView`, vistas sociales, `ApiErrorBody`, `HealthResponse` y paginación; es la única dependencia workspace de la API.

## Sesión de la app (packages/app-session)

Guarda una `AppSession` con `authorId="demo"`, `handle="demo"` y `signedIn`. Persiste en `expo-secure-store` mediante `createSecureStoreAdapter` y expone `signIn`/`signOut` con errores en español. Sustituir esta sesión por la real es el punto de integración con el backend.

## Almacén de contenido (packages/content-store)

Reductor inmutable y determinista de obras, opiniones, autores, likes, follows y comentarios, con `subscribe()` y snapshots. Deriva `isOwn`, `likedByMe` y `followedByMe` a partir de `viewerId`; no persiste en disco. Es la fuente de las pantallas y del feed local.

## Catálogo musical (packages/catalog)

Puerto `CatalogPort` con búsqueda por texto y catálogo de ejemplo. `createCatalog()` decorona el puerto de Spotify y degrada al respaldo local cuando no hay sesión. En la app se inyecta desde `createSpotifyCatalog` en `app/src/bootstrap/ports.ts`.

## Adaptador de Spotify (packages/spotify)

Implementa PKCE y Web API desde el dispositivo: genera `code_verifier`/`code_challenge`, abre el navegador con `expo-web-browser`, intercambia el código y guarda/borra el token con `expo-secure-store`. Lee `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. Ningún token ni client secret viaja al servidor.

## Cáscara y sistema de diseño

`app-shell` aporta navegación, `AppHeader`, `BottomTabs`, tarjetas de opinión compartidas y estados de carga/error. `design-system` aporta el tema, tipografía, botones y primitivas visuales. Las pantallas consumen la tarjeta compartida en lugar de reimplementarla.

## Actividad y conectividad

`activity` agrupa opiniones, me gusta, comentarios y follows en `ActivityGroup` legibles, derivados del estado de `content-store`. `connectivity` expone `isConnected`, `refresh()` y `subscribe()` sobre `expo-network`; la app ajusta los mensajes de error según este estado.

## Aplicación Expo (app)

Seis pantallas (Inicio, Explorar, Crear, Actividad, Perfil y detalle) con hooks de estado en `src/state/`. `src/bootstrap/` es la raíz de composición: crea las instancias únicas, decide entre red real y simulación y provee `AppDependencies` a las pantallas.

## Calidad y CI

Jest con `jest-expo` y cobertura del 80 % sobre el móvil; Vitest con Postgres para la API; ESLint plano con fronteras de importación; Prettier; commitlint; workflow `.github/workflows/ci.yml` con cuatro comprobaciones. La suite Vitest del API aún no está en el workflow.
