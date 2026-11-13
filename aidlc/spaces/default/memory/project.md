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

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- Explorar y Crear buscan en el catálogo real de Spotify; el catálogo de ejemplo queda como respaldo sin sesión. (learned 2026-11-06) <!-- cid:261105-melodify-mobile-app:rough-mockups:ba079ec15c2888ad7980bd2ae5bdd3ea6425f0ecf089b51f35e4e309937ee2de -->
- La conexión con Spotify persiste entre reinicios de la app: el token se guarda en almacenamiento seguro del dispositivo y se borra al desconectar. (learned 2026-11-06) <!-- cid:261105-melodify-mobile-app:rough-mockups:6fd5b02edd6e5320b0a3bd1f83cb194c7f181d99e85afd6e42797a72769f46d6 -->
