# Prácticas del equipo

> Prácticas afirmadas para el intent `261125-melodify-api-backend` tras la integración de la entrevista de `practices-discovery`. La línea base es `aidlc/spaces/default/memory/team.md`, ampliada con las decisiones Q1-Q5; `aidlc/spaces/default/memory/project.md` aporta contexto y correcciones vigentes.

## Way of Working

Trabajamos con **dos ramas de larga vida**: `develop` es la rama de integración y `main` recibe solo entregas.

- **`develop` es la rama de integración.** Todo el trabajo aterriza ahí primero: los Bolts de Construction y el trabajo manual. Es la rama que siempre representa lo último construido y validado por el CI.
- **`main` recibe solo entregas.** `main` no se toca en el día a día: una entrega es un **squash desde `develop`** hacia `main`. Así `main` se lee como la historia de lo que efectivamente se entregó, no como un diario de trabajo en curso.
- **Los Bolts de Construction nacen de `develop` y se integran a `develop`.** La base de la rama de cada Bolt es `develop` y su destino de merge es `develop`, con **squash**: un commit por Bolt nombrado con el slug. El plan de entrega y la configuración de worktree/merge siguen esta regla; `main` no es el destino de ningún Bolt.
- **Todo cambio entra por Pull Request**, con la plantilla que ya vive en el repositorio (`.github/pull_request_template.md`). Aunque la misma persona abra y mergee el PR, el PR es el registro de qué se verificó: plataformas probadas, capturas, checklist de calidad y variables de entorno. Un cambio pequeño tampoco se salta el PR.
- **Conventional Commits** en el título del PR y en los commits, validado con `commitlint` en CI. El tipo (`feat`, `fix`, `chore`, `docs`, `ci`…) y el alcance no son negociables; el idioma del asunto es indiferente.
- **CI en cada push y cada PR** a `main` y `develop`: `.github/workflows/ci.yml` corre commitlint, `npm run typecheck`, `npm run lint` y `npm test`, y añade un job de Vitest para `apps/api` con PostgreSQL de servicio y `TEST_DATABASE_URL`. Solo se autoriza el merge con esas puertas en verde; no se mergea «y luego se arregla».
- **Trabajo manual fuera de AI-DLC** (arreglos sueltos, dependencias, documentación) va en una rama `feat/<tema>` o `fix/<tema>` **desde `develop`**, también squash-mergeada a `develop` y con el mismo CI. En este intento trabajamos en `feat/backend-api`.

## Walking Skeleton

**No adoptamos el walking skeleton como práctica permanente del equipo.** Un walking skeleton es la versión mínima que recorre todo el camino de punta a punta, hecha antes que las funciones reales para comprobar que las piezas encajan; el equipo no se obliga a construirlo en cada trabajo.

- **La regla permanente es la del alcance, no la del equipo.** El esqueleto se activa o se desactiva según lo que declare el alcance de cada intento. Un alcance que no lo declara entra directo a su primera unidad, sin ceremonia previa.
- **En este trabajo (`261125-melodify-api-backend`, alcance `feature`) el esqueleto queda activado**, porque así lo declara el alcance. En consecuencia, su **primera unidad pasa por el checkpoint de esqueleto**: se construye y se aprueba como tramo que corre de verdad antes de seguir con el resto.
- **Qué demuestra el tramo**: crear cuenta real, publicar una opinión desde un dispositivo y verla en el segundo dispositivo en la misma red local, con el servicio y PostgreSQL levantados en el portátil.
- **Verificación del tramo**: el comando de verificación de Construction que se registre en el intento más la aprobación humana del checkpoint. El comando exacto se registrará en Construction; una revisión de diseño no demuestra un esqueleto, solo el recorrido real lo demuestra.
- **Después del tramo** se construyen el resto de las capacidades del alcance sobre la base ya probada y se cierra con el recorrido completo desde los dos dispositivos.

## Testing Posture

- **Methodology**: test-after
- **Methodology evidence**: el equipo afirmó en la entrevista de este intento (Q3, opción A) mantener `test-after` para todo el repositorio, incluido `apps/api`. La línea base de `team.md` ya fijaba esa cadencia y el barrido de código no mostró una cadencia contradictoria: Jest con `jest-expo` en la app y Vitest en el servicio son herramientas, no un cambio de metodología.
- **Ordering**: implementamos cada capa (configuración, utilidad, módulo, ruta o pantalla) y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.
- **Herramientas**: Jest con `jest-expo` y `@testing-library/react-native` para la app y los paquetes móviles; Vitest con cobertura v8 para `apps/api`. Son puertas de CI `npm run typecheck`, `npm run lint`, `npm test` y el job de Vitest con PostgreSQL de servicio y `TEST_DATABASE_URL`.
- **Cobertura**: umbral afirmado del **80 % de líneas sobre `app/src/**`**, medido con `--coverage` y excluyendo configuración generada, assets y ficheros de arranque. Para `apps/api` se afirma como puerta de equipo el **80 % de líneas, sentencias y funciones y 70 % de ramas sobre `apps/api/src/**`, sin `server.ts`**. No se baja ningún umbral para hacer pasar una etapa.
- **Qué se prueba**: la lógica de estado y las pantallas en sus estados (vacío, carga, error, sin Spotify y sin conexión); en el servicio, salud, registro y acceso, renovación de sesión y las reglas de contenido sobre la base de prueba local. Ninguna prueba de la app sale a la red ni necesita credenciales de Spotify reales.
- **Dobles de prueba**: las llamadas a la API de Spotify se sustituyen por dobles; las pruebas del servicio usan `TEST_DATABASE_URL`, una base PostgreSQL local de prueba, sin servicios externos.
- **Qué no se prueba automáticamente**: el recorrido real en los dos dispositivos de la misma red local. Eso es verificación manual y sigue siendo el criterio de terminado de esta entrega.
- **Pruebas que no valen**: nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueben que el componente monta sin mirar el estado que se afirma.

## Deployment

**Mantenemos como regla permanente la ausencia de entornos remotos.** Conviene decirlo sin rodeos para que nadie lo busque.

- **No hay entornos remotos**: no hay staging, ni producción, ni nube, ni túnel. El servicio y su base de datos corren solo en el portátil con Docker (`postgres:16-alpine`); la app se ejecuta en Expo Go sobre el teléfono Android.
- **«Desplegar» significa arrancar el servicio local y abrir la app en el dispositivo.** La entrega de un Bolt se demuestra con el recorrido real: publicar, comentar, dar me gusta y seguir desde un dispositivo, y ver el contenido en el segundo dispositivo de la misma red local.
- **El CI valida, nunca publica.** `.github/workflows/ci.yml` no tiene paso de build, de firma, de release ni de despliegue. No se configura EAS Build, EAS Update, compilación en la nube ni cuentas de desarrollador.
- **Nada de tiendas**: no hay publicación en Google Play ni en App Store, y por tanto no hay aprobación de release que dar.
- **Rollback del código** es volver atrás el commit del Bolt: `git revert` del squash del Bolt en `develop` — y también en `main` si ese commit ya viajó en una entrega — y reiniciar el servicio local.
- **Rollback de esquema**: ante un cambio de esquema en PostgreSQL, revertir el squash y aplicar una migración de reversión revisada, autorizada por quien aprueba el PR. No se restaura una copia ad hoc ni se deja la base en un estado sin reversión documentada.
- **Configuración por entorno**: el client ID de Spotify llega por `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`; el servicio usa `DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_ACCESS_SECRET`, `PORT`, `HOST`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL_DAYS`, `CORS_ORIGINS`, `TRUST_PROXY`, `SWAGGER_ENABLED`, `LOG_LEVEL` y `SEED_DEMO`, documentados en los ficheros `.env.example` y validados en `apps/api/src/config/env.ts`. Nunca se commitea `.env` ni un token de sesión.

## Code Style

- **Formateador único: Prettier**, con la configuración del repositorio. Nadie discute formato en un PR: lo resuelve la herramienta.
- **Linter: ESLint** con la configuración de Expo (`eslint-config-expo`), incluidas las reglas de frontera por directorio. `npm run lint` en CI es una puerta, no un aviso: si falla, el PR no entra.
- **TypeScript en `strict: true`.** Sin `any` implícito; un `any` explícito lleva un comentario que explica por qué. Sin `// @ts-ignore` sin justificar.
- **Nombres idiomáticos de TypeScript**: `camelCase` para variables y funciones, `PascalCase` para componentes y tipos, `SCREAMING_SNAKE_CASE` para constantes de módulo. Componentes en archivos `PascalCase.tsx`; hooks en `useAlgo.ts`.
- **Organización por dominio, no por tipo de archivo**: la app en `app/src/screens/<pantalla>/`, `app/src/components/`, `app/src/state/`, `app/src/spotify/`, `app/src/data/`; el servicio en `apps/api/src/{config,lib,modules,plugins}/` y los paquetes compartidos en `packages/<dominio>/src/`. Una pantalla nueva es una carpeta nueva, no un archivo más en una carpeta de veinte.
- **La tarjeta de opinión es el componente compartido** y vive en `app/src/components/`; ninguna pantalla la reimplementa.
- **Swagger UI se sirve solo fuera de producción**: es comportamiento estable del servicio, no un detalle a decidir en cada cambio.
- **Textos de interfaz en español**, escritos en el mismo archivo que los usa. No se introduce infraestructura de internacionalización: la interfaz va solo en español. Los mensajes de error del servicio que llegan a la pantalla se escriben también en español.
- **Errores en lenguaje llano y con acción**: mensaje comprensible más «Reintentar», nunca un código técnico ni un mensaje en inglés. Un fallo de portada deja el bloque con la inicial; no deja un hueco roto.
- **Sin `console.log` de depuración** en lo que llega a `main`; para diagnosticar se usa el logger del proyecto o se quita antes del PR.
- **Comentarios en español y sobre el porqué**, no sobre el qué. El código dice qué hace; el comentario dice por qué se eligió así.
