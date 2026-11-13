# Reglas Descubiertas — Melodify

> **Provenance**: reglas **confirmadas** de la etapa Practices Discovery (`inception/practices-discovery/`), escritas por `aidlc-pipeline-deploy-agent` para el intento `261105-melodify-mobile-app` y **confirmadas por la persona el 2026-11-06** en la entrevista de la etapa (las diez, sin cambios).
> Solo contiene **restricciones duras que el proyecto ya sostiene con evidencia**, no preferencias de estilo (esas viven en `team-practices.md`). La promoción las añade a `aidlc/spaces/default/memory/project.md` bajo `## Mandated` y `## Forbidden`.
> Fecha: 2026-11-06.

## Mandated

- ALWAYS mantener la app recorrible sin sesión de Spotify: el login simulado (`demo` / `demo`) entra, Inicio y Actividad funcionan completos, y Explorar y Crear operan con el catálogo de ejemplo sin impedir publicar una opinión. (`wireframes` §Consecuencias; `project.md` §Corrections)
- ALWAYS guardar el token de Spotify en el almacenamiento seguro del dispositivo (`expo-secure-store`) y borrarlo al desconectar. (`project.md` §Corrections; `wireframes` §Consecuencias punto 5)
- ALWAYS obtener el client ID de Spotify desde una variable de entorno (`EXPO_PUBLIC_SPOTIFY_CLIENT_ID`) y autorizar con PKCE. (`wireframes` §Cambio de alcance; `constraint-register` CT-04 sustituida)
- ALWAYS mantenerse dentro de las APIs disponibles en Expo Go: ningún módulo nativo que exija compilación propia. (`constraint-register` CT-05)
- ALWAYS escribir en español todo texto visible para quien usa la app. (`constraint-register` CT-08)
- ALWAYS degradar con un mensaje en lenguaje llano y una acción («Reintentar») cuando falle una portada, la búsqueda o el token; nunca fallar en silencio. (`wireframes` §Mapa de estados)

## Forbidden

- NEVER incluir el client secret de Spotify en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*`: es un cliente público y PKCE no lo necesita. (`wireframes` §Cambio de alcance; `constraint-register` CT-04)
- NEVER añadir backend, autenticación real de la app ni persistencia del contenido creado: las opiniones, autores e interacciones son locales, simulados y viven en memoria. (`constraint-register` CT-02, CT-03; `scope-document` §Fuera de alcance)
- NEVER añadir reproducción de audio, notificaciones push ni publicación en Google Play o App Store en esta versión. (`scope-document` §Fuera de alcance)
- NEVER commitear `.env` ni tokens de sesión; `.env.example` documenta las variables y nada más. (`.github/pull_request_template.md` checklist de calidad)
