# Team-Level Rules

> This team's affirmed practices and corrections. Loaded after `org.md` as
> strict-additive guidance; contradictions with broader policy are rejected.
> Populated by the practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working

Trabajamos con **dos ramas de larga vida**: `develop` es la rama de integración y `main` recibe solo entregas.

- **`develop` es la rama de integración.** Todo el trabajo aterriza ahí primero: los Bolts de Construction y el trabajo manual. Es la rama que siempre representa lo último construido y validado por el CI.
- **`main` recibe solo entregas.** `main` no se toca en el día a día: una entrega es un **squash desde `develop`** hacia `main`. Así `main` se lee como la historia de lo que efectivamente se entregó, no como un diario de trabajo en curso.
- **Los Bolts de Construction nacen de `develop` y se integran a `develop`.** La base de la rama de cada Bolt es `develop` y su destino de merge es `develop`, con **squash**: un commit por Bolt nombrado con el slug. El plan de entrega y la configuración de worktree/merge siguen esta regla; `main` no es el destino de ningún Bolt.
- **Todo cambio entra por Pull Request**, con la plantilla que ya vive en el repositorio (`.github/pull_request_template.md`). Aunque la misma persona abra y mergee el PR, el PR es el registro de qué se verificó: plataformas probadas, capturas, checklist de calidad y variables de entorno. Un cambio pequeño tampoco se salta el PR.
- **Conventional Commits** en el título del PR y en los commits, validado con `commitlint` en CI. El tipo (`feat`, `fix`, `chore`, `docs`, `ci`…) y el alcance no son negociables; el idioma del asunto es indiferente.
- **CI en cada push y cada PR**: `.github/workflows/ci.yml` corre commitlint, `npm run typecheck`, `npm run lint` y `npm test`. Un rojo bloquea el merge; no se mergea «y luego se arregla».
- **Trabajo manual fuera de AI-DLC** (arreglos sueltos, dependencias, documentación) va en una rama `feat/<tema>` o `fix/<tema>` **desde `develop`**, también squash-mergeada a `develop` y con el mismo CI.

## Walking Skeleton

**No adoptamos el walking skeleton como práctica permanente del equipo.** Un walking skeleton es la versión mínima que recorre todo el camino de punta a punta, hecha antes que las funciones reales para comprobar que las piezas encajan; el equipo no se obliga a construirlo en cada trabajo.

- **La regla permanente es la del alcance, no la del equipo.** El esqueleto se activa o se desactiva según lo que declare el alcance de cada intento. Un alcance que no lo declara entra directo a su primera unidad, sin ceremonia previa.
- **En este trabajo (`261105-melodify-mobile-app`, alcance `mvp`) el esqueleto queda activado**, porque así lo declara el alcance. En consecuencia, su **primera unidad pasa por el checkpoint de esqueleto**: se construye y se aprueba como tramo que corre de verdad antes de seguir con el resto.
- **Qué demuestra ese tramo aquí**: proyecto Expo, navegación entre pantallas, login simulado (`demo` / `demo`) y llegada a Inicio con una sola tarjeta de opinión de ejemplo, ejecutándose en **Expo Go sobre el teléfono Android físico**.
- **Verificación del tramo**: el comando de verificación de Construction que se registre en el intento (levantar Metro y recorrer el tramo en el teléfono) más la aprobación humana del checkpoint. Una revisión de diseño no demuestra un esqueleto; solo el teléfono lo demuestra.
- **Después del tramo** se construyen Inicio completo, Explorar, Crear, Actividad y Perfil sobre la base ya probada, y se cierra con el recorrido de las seis pantallas.

## Testing Posture

- **Methodology**: test-after
- **Ordering**: implementamos cada capa (utilidad, hook, pantalla), y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.
- **Herramientas**: Jest con `jest-expo` y `@testing-library/react-native`; los tres comandos que ya invoca el CI son la puerta: `npm test`, `npm run typecheck` y `npm run lint`.
- **Cobertura**: umbral del **80 % de líneas sobre `app/src/**`**, medido con `--coverage` y excluyendo configuración generada, assets y ficheros de arranque. No se baja el umbral para hacer pasar una etapa.
- **Qué se prueba**: la lógica de estado (opiniones en memoria, publicar, me gusta, seguir, comentar), las utilidades de Spotify (construcción de la URL de autorización PKCE, intercambio de código, lectura y borrado del token, parseo de resultados de búsqueda y de portadas) y el render de cada pantalla en sus estados: vacío, carga, error, sin Spotify y sin conexión.
- **Qué no se prueba automáticamente**: el recorrido real en el teléfono. Eso es verificación manual en Expo Go y sigue siendo el criterio de terminado de la versión.
- **Dobles de prueba**: las llamadas a la API de Spotify se sustituyen por dobles. Ninguna prueba sale a la red ni necesita credenciales, cuenta de Spotify ni un client ID real.
- **Pruebas que no valen**: nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma.

## Guard Policy

<!-- Affirmed by the team. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless project.md or the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

**En esta versión no hay despliegue**, y conviene decirlo sin rodeos para que nadie lo busque.

- **No hay entornos**: no hay staging, ni producción, ni backend. La app se ejecuta en local: Metro en el ordenador, Expo Go en el teléfono Android.
- **«Desplegar» significa abrir la app en el teléfono** con el servidor de desarrollo levantado. La entrega de un Bolt se demuestra recorriendo las seis pantallas en el dispositivo, **sin Spotify conectado y con Spotify conectado**.
- **El CI valida, nunca publica.** `.github/workflows/ci.yml` no tiene paso de build, de firma ni de release. No se configura EAS Build, ni EAS Update, ni compilación en la nube, ni cuentas de desarrollador.
- **Nada de tiendas**: no hay publicación en Google Play ni en App Store en esta versión, y por tanto no hay aprobación de release que dar.
- **Rollback** es volver atrás el commit del Bolt: `git revert` del squash del Bolt en `develop` — y también en `main` si ese commit ya viajó en una entrega — y recargar Metro. No hay artefacto desplegado que deshacer ni migración de datos que revertir, porque el contenido vive en memoria.
- **Configuración por entorno**: la única variable es el client ID de Spotify, que llega por entorno (`EXPO_PUBLIC_SPOTIFY_CLIENT_ID`) y se documenta en `.env.example`. No hay secretos de servidor que repartir.
- **Si el proyecto crece** hasta publicar, eso exige su propia decisión: compilación en la nube, firma, cuentas de tienda y una puerta de aprobación manual antes de cada publicación. No se improvisa desde aquí.

## Code Style

- **Formateador único: Prettier**, con la configuración del repositorio cuando exista `app/`. Nadie discute formato en un PR: lo resuelve la herramienta.
- **Linter: ESLint** con la configuración de Expo (`eslint-config-expo`). `npm run lint` en CI es una puerta, no un aviso: si falla, el PR no entra.
- **TypeScript en `strict: true`.** Sin `any` implícito; un `any` explícito lleva un comentario que explica por qué. Sin `// @ts-ignore` sin justificar.
- **Nombres idiomáticos de TypeScript**: `camelCase` para variables y funciones, `PascalCase` para componentes y tipos, `SCREAMING_SNAKE_CASE` para constantes de módulo. Componentes en archivos `PascalCase.tsx`; hooks en `useAlgo.ts`.
- **Organización por dominio, no por tipo de archivo**: `app/src/screens/<pantalla>/`, `app/src/components/`, `app/src/state/`, `app/src/spotify/`, `app/src/data/` (catálogo de ejemplo y opiniones de ejemplo). Una pantalla nueva es una carpeta nueva, no un archivo más en una carpeta de veinte.
- **La tarjeta de opinión es el componente compartido** y vive en `app/src/components/`; ninguna pantalla la reimplementa.
- **Textos de interfaz en español**, escritos en el mismo archivo que los usa. No se introduce infraestructura de internacionalización: la interfaz va solo en español.
- **Errores en lenguaje llano y con acción**: mensaje comprensible más «Reintentar», nunca un código técnico ni un mensaje en inglés. Un fallo de portada deja el bloque con la inicial; no deja un hueco roto.
- **Sin `console.log` de depuración** en lo que llega a `main`; para diagnosticar se usa el logger del proyecto o se quita antes del PR.
- **Comentarios en español y sobre el porqué**, no sobre el qué. El código dice qué hace; el comentario dice por qué se eligió así.
## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
