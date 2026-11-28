# Reglas descubiertas

> Reglas duras afirmadas por personas: secciones afirmadas de `aidlc/spaces/default/memory/team.md` y `aidlc/spaces/default/memory/project.md`, más las decisiones de la entrevista de `practices-discovery` del intento `261125-melodify-api-backend` (opción A en Q1-Q5, 2026-11-28). Lo que solo procede de código, CI o documentación no se convierte en regla; los hallazgos y la incertidumbre residual están en `evidence.md`.

## Mandated

- ALWAYS trabajar con `develop` como rama de integración y `main` como destino exclusivo de entregas mediante squash desde `develop`. (`team.md` §Way of Working, afirmado)
- ALWAYS hacer nacer los Bolts de Construction de `develop` e integrarlos a `develop` con squash, un commit por Bolt nombrado con el slug; `main` no es destino de ningún Bolt. (`team.md` §Way of Working, afirmado)
- ALWAYS abrir un Pull Request para todo cambio, incluso el pequeño, usando la plantilla `.github/pull_request_template.md` y registrando en él qué se verificó. (`team.md` §Way of Working, afirmado)
- ALWAYS usar Conventional Commits en los commits y en el título del PR, con `commitlint` como validación en CI; el tipo y el alcance no son negociables. (`team.md` §Way of Working, afirmado)
- ALWAYS ejecutar en cada push y cada PR, antes de autorizar el merge, `commitlint`, `npm run typecheck`, `npm run lint`, `npm test` y la suite Vitest de `apps/api` con PostgreSQL de servicio y `TEST_DATABASE_URL`; un rojo bloquea el merge. (`team.md` §Way of Working, afirmado; entrevista Q1, opción A, 2026-11-28)
- ALWAYS activar el checkpoint de esqueleto cuando el alcance lo declare y demostrar el primer tramo con el recorrido afirmado: crear cuenta real, publicar una opinión desde un dispositivo y verla en el segundo dispositivo en la misma red local, con el servicio y PostgreSQL levantados en el portátil; la verificación exige el comando que se registre en Construction y la aprobación humana. (`team.md` §Walking Skeleton; entrevista Q2, opción A, 2026-11-28)
- ALWAYS aplicar la cadencia `test-after` a todo el repositorio, incluido `apps/api`, y exigir como puerta de equipo el 80 % de líneas sobre `app/src/**` y el 80 % de líneas, sentencias y funciones con 70 % de ramas sobre `apps/api/src/**`, sin `server.ts`. (`team.md` §Testing Posture; entrevista Q3, opción A, 2026-11-28)
- ALWAYS mantener como práctica permanente la ausencia de entornos remotos, staging, nube y túneles: el servicio y PostgreSQL corren solo en el portátil. (`team.md` §Deployment; entrevista Q4, opción A, 2026-11-28)
- ALWAYS, ante un cambio de esquema en PostgreSQL, revertir el squash del Bolt y aplicar una migración de reversión revisada, autorizada por quien aprueba el PR. (entrevista Q4, opción A, 2026-11-28)
- ALWAYS mantener la tarjeta de opinión compartida en `app/src/components/`, sin reimplementarla en cada pantalla, y servir Swagger UI solo fuera de producción como comportamiento estable. (`team.md` §Code Style; entrevista Q5, opción A, 2026-11-28)
- ALWAYS mantener la app recorrible sin sesión de Spotify: el login simulado (`demo` / `demo`) entra, Inicio y Actividad funcionan completos, y Explorar y Crear operan con el catálogo de ejemplo sin impedir publicar una opinión. (`project.md` §Mandated, afirmado 2026-11-06)
- ALWAYS guardar el token de Spotify en el almacenamiento seguro del dispositivo (`expo-secure-store`) y borrarlo al desconectar. (`project.md` §Mandated, afirmado 2026-11-06)
- ALWAYS obtener el client ID de Spotify desde la variable de entorno `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y autorizar con PKCE. (`project.md` §Mandated, afirmado 2026-11-06)
- ALWAYS mantenerse dentro de las APIs disponibles en Expo Go: ningún módulo nativo que exija compilación propia. (`project.md` §Mandated, afirmado 2026-11-06)
- ALWAYS escribir en español todo texto visible para quien usa la app, incluidos los mensajes de error del servicio que llegan a la pantalla. (`project.md` §Mandated y CT-08, afirmado 2026-11-06)
- ALWAYS degradar con un mensaje en lenguaje llano y una acción («Reintentar») cuando falle una portada, la búsqueda o el token; nunca fallar en silencio. (`project.md` §Mandated, afirmado 2026-11-06)
- ALWAYS limitar el backend, la autenticación real y la persistencia en servidor de este proyecto a lo permitido por el alcance y los límites del `scope-document` del intento `261125-melodify-api-backend`. (`project.md` §Corrections, learned 2026-11-25)

## Forbidden

- NEVER incluir el client secret de Spotify en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*`: es un cliente público y PKCE no lo necesita. (`project.md` §Forbidden, afirmado 2026-11-06; sigue vigente tras la corrección de 2026-11-25)
- NEVER añadir reproducción de audio, notificaciones push ni publicación en Google Play o App Store en esta versión. (`project.md` §Forbidden, afirmado 2026-11-06)
- NEVER commitear `.env` ni tokens de sesión; los ficheros `.env.example` documentan las variables y nada más. (`project.md` §Forbidden, afirmado 2026-11-06; checklist de `.github/pull_request_template.md`)
- NEVER mergear un cambio con el CI en rojo —incluida la suite Vitest de `apps/api` con PostgreSQL de servicio y `TEST_DATABASE_URL`— ni dejar la corrección para después del merge. (`team.md` §Way of Working, afirmado; entrevista Q1, opción A, 2026-11-28)
- NEVER desplegar a entornos remotos, staging, nube ni túneles: es regla permanente del equipo. (`team.md` §Deployment; entrevista Q4, opción A, 2026-11-28)
- NEVER aplicar un cambio de esquema en PostgreSQL sin una migración de reversión revisada y sin la autorización de quien aprueba el PR. (entrevista Q4, opción A, 2026-11-28)
- NEVER servir Swagger UI en producción. (entrevista Q5, opción A, 2026-11-28)
- NEVER reimplementar la tarjeta de opinión en una pantalla ni situar la pieza compartida fuera de `app/src/components/`. (`team.md` §Code Style; entrevista Q5, opción A, 2026-11-28)
- NEVER escribir aserciones que siempre pasan ni pruebas de pantalla que solo comprueben que el componente monta sin mirar el estado que se afirma. (`team.md` §Testing Posture, afirmado)
