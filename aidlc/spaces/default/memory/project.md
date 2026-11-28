# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER incluir el client secret de Spotify en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*`: es un cliente público y PKCE no lo necesita. (`wireframes` §Cambio de alcance; `constraint-register` CT-04) (affirmed 2026-11-06)

- NEVER añadir backend, autenticación real de la app ni persistencia del contenido creado: las opiniones, autores e interacciones son locales, simulados y viven en memoria. (`constraint-register` CT-02, CT-03; `scope-document` §Fuera de alcance) (affirmed 2026-11-06)

- NEVER añadir reproducción de audio, notificaciones push ni publicación en Google Play o App Store en esta versión. (`scope-document` §Fuera de alcance) (affirmed 2026-11-06)

- NEVER commitear `.env` ni tokens de sesión; `.env.example` documenta las variables y nada más. (`.github/pull_request_template.md` checklist de calidad) (affirmed 2026-11-06)

- NEVER incluir el client secret de Spotify en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*`: es un cliente público y PKCE no lo necesita. (`project.md` §Forbidden, afirmado 2026-11-06; sigue vigente tras la corrección de 2026-11-25) (affirmed 2026-11-28)

- NEVER añadir reproducción de audio, notificaciones push ni publicación en Google Play o App Store en esta versión. (`project.md` §Forbidden, afirmado 2026-11-06) (affirmed 2026-11-28)

- NEVER commitear `.env` ni tokens de sesión; los ficheros `.env.example` documentan las variables y nada más. (`project.md` §Forbidden, afirmado 2026-11-06; checklist de `.github/pull_request_template.md`) (affirmed 2026-11-28)

- NEVER mergear un cambio con el CI en rojo —incluida la suite Vitest de `apps/api` con PostgreSQL de servicio y `TEST_DATABASE_URL`— ni dejar la corrección para después del merge. (`team.md` §Way of Working, afirmado; entrevista Q1, opción A, 2026-11-28) (affirmed 2026-11-28)

- NEVER desplegar a entornos remotos, staging, nube ni túneles: es regla permanente del equipo. (`team.md` §Deployment; entrevista Q4, opción A, 2026-11-28) (affirmed 2026-11-28)

- NEVER aplicar un cambio de esquema en PostgreSQL sin una migración de reversión revisada y sin la autorización de quien aprueba el PR. (entrevista Q4, opción A, 2026-11-28) (affirmed 2026-11-28)

- NEVER servir Swagger UI en producción. (entrevista Q5, opción A, 2026-11-28) (affirmed 2026-11-28)

- NEVER reimplementar la tarjeta de opinión en una pantalla ni situar la pieza compartida fuera de `app/src/components/`. (`team.md` §Code Style; entrevista Q5, opción A, 2026-11-28) (affirmed 2026-11-28)

- NEVER escribir aserciones que siempre pasan ni pruebas de pantalla que solo comprueben que el componente monta sin mirar el estado que se afirma. (`team.md` §Testing Posture, afirmado) (affirmed 2026-11-28)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS mantener la app recorrible sin sesión de Spotify: el login simulado (`demo` / `demo`) entra, Inicio y Actividad funcionan completos, y Explorar y Crear operan con el catálogo de ejemplo sin impedir publicar una opinión. (`wireframes` §Consecuencias; `project.md` §Corrections) (affirmed 2026-11-06)

- ALWAYS guardar el token de Spotify en el almacenamiento seguro del dispositivo (`expo-secure-store`) y borrarlo al desconectar. (`project.md` §Corrections; `wireframes` §Consecuencias punto 5) (affirmed 2026-11-06)

- ALWAYS obtener el client ID de Spotify desde una variable de entorno (`EXPO_PUBLIC_SPOTIFY_CLIENT_ID`) y autorizar con PKCE. (`wireframes` §Cambio de alcance; `constraint-register` CT-04 sustituida) (affirmed 2026-11-06)

- ALWAYS mantenerse dentro de las APIs disponibles en Expo Go: ningún módulo nativo que exija compilación propia. (`constraint-register` CT-05) (affirmed 2026-11-06)

- ALWAYS escribir en español todo texto visible para quien usa la app. (`constraint-register` CT-08) (affirmed 2026-11-06)

- ALWAYS degradar con un mensaje en lenguaje llano y una acción («Reintentar») cuando falle una portada, la búsqueda o el token; nunca fallar en silencio. (`wireframes` §Mapa de estados) (affirmed 2026-11-06)

- ALWAYS trabajar con `develop` como rama de integración y `main` como destino exclusivo de entregas mediante squash desde `develop`. (`team.md` §Way of Working, afirmado) (affirmed 2026-11-28)

- ALWAYS hacer nacer los Bolts de Construction de `develop` e integrarlos a `develop` con squash, un commit por Bolt nombrado con el slug; `main` no es destino de ningún Bolt. (`team.md` §Way of Working, afirmado) (affirmed 2026-11-28)

- ALWAYS abrir un Pull Request para todo cambio, incluso el pequeño, usando la plantilla `.github/pull_request_template.md` y registrando en él qué se verificó. (`team.md` §Way of Working, afirmado) (affirmed 2026-11-28)

- ALWAYS usar Conventional Commits en los commits y en el título del PR, con `commitlint` como validación en CI; el tipo y el alcance no son negociables. (`team.md` §Way of Working, afirmado) (affirmed 2026-11-28)

- ALWAYS ejecutar en cada push y cada PR, antes de autorizar el merge, `commitlint`, `npm run typecheck`, `npm run lint`, `npm test` y la suite Vitest de `apps/api` con PostgreSQL de servicio y `TEST_DATABASE_URL`; un rojo bloquea el merge. (`team.md` §Way of Working, afirmado; entrevista Q1, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS activar el checkpoint de esqueleto cuando el alcance lo declare y demostrar el primer tramo con el recorrido afirmado: crear cuenta real, publicar una opinión desde un dispositivo y verla en el segundo dispositivo en la misma red local, con el servicio y PostgreSQL levantados en el portátil; la verificación exige el comando que se registre en Construction y la aprobación humana. (`team.md` §Walking Skeleton; entrevista Q2, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS aplicar la cadencia `test-after` a todo el repositorio, incluido `apps/api`, y exigir como puerta de equipo el 80 % de líneas sobre `app/src/**` y el 80 % de líneas, sentencias y funciones con 70 % de ramas sobre `apps/api/src/**`, sin `server.ts`. (`team.md` §Testing Posture; entrevista Q3, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS mantener como práctica permanente la ausencia de entornos remotos, staging, nube y túneles: el servicio y PostgreSQL corren solo en el portátil. (`team.md` §Deployment; entrevista Q4, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS, ante un cambio de esquema en PostgreSQL, revertir el squash del Bolt y aplicar una migración de reversión revisada, autorizada por quien aprueba el PR. (entrevista Q4, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS mantener la tarjeta de opinión compartida en `app/src/components/`, sin reimplementarla en cada pantalla, y servir Swagger UI solo fuera de producción como comportamiento estable. (`team.md` §Code Style; entrevista Q5, opción A, 2026-11-28) (affirmed 2026-11-28)

- ALWAYS mantener la app recorrible sin sesión de Spotify: el login simulado (`demo` / `demo`) entra, Inicio y Actividad funcionan completos, y Explorar y Crear operan con el catálogo de ejemplo sin impedir publicar una opinión. (`project.md` §Mandated, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS guardar el token de Spotify en el almacenamiento seguro del dispositivo (`expo-secure-store`) y borrarlo al desconectar. (`project.md` §Mandated, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS obtener el client ID de Spotify desde la variable de entorno `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y autorizar con PKCE. (`project.md` §Mandated, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS mantenerse dentro de las APIs disponibles en Expo Go: ningún módulo nativo que exija compilación propia. (`project.md` §Mandated, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS escribir en español todo texto visible para quien usa la app, incluidos los mensajes de error del servicio que llegan a la pantalla. (`project.md` §Mandated y CT-08, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS degradar con un mensaje en lenguaje llano y una acción («Reintentar») cuando falle una portada, la búsqueda o el token; nunca fallar en silencio. (`project.md` §Mandated, afirmado 2026-11-06) (affirmed 2026-11-28)

- ALWAYS limitar el backend, la autenticación real y la persistencia en servidor de este proyecto a lo permitido por el alcance y los límites del `scope-document` del intento `261125-melodify-api-backend`. (`project.md` §Corrections, learned 2026-11-25) (affirmed 2026-11-28)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- Explorar y Crear buscan en el catálogo real de Spotify; el catálogo de ejemplo queda como respaldo sin sesión. (learned 2026-11-06) <!-- cid:261105-melodify-mobile-app:rough-mockups:ba079ec15c2888ad7980bd2ae5bdd3ea6425f0ecf089b51f35e4e309937ee2de -->
- La conexión con Spotify persiste entre reinicios de la app: el token se guarda en almacenamiento seguro del dispositivo y se borra al desconectar. (learned 2026-11-06) <!-- cid:261105-melodify-mobile-app:rough-mockups:6fd5b02edd6e5320b0a3bd1f83cb194c7f181d99e85afd6e42797a72769f46d6 -->
- El backend, la autenticación real y la persistencia en servidor están permitidos en este proyecto a partir del intento 261125-melodify-api-backend: quedan sustituidas para ese trabajo las reglas NEVER de §Forbidden que los prohibían, con su alcance y sus límites en el scope-document del intento (el client secret de Spotify sigue prohibido y PKCE sigue vigente en la app). (learned 2026-11-25) <!-- cid:261125-melodify-api-backend:intent-capture:a1d8eeec534b778d8c163c502a6eb7e0f01a248dcbce3af1db7fdd01ba9b70d3 -->
