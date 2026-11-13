# Evidencia — Practices Discovery

> **Provenance**: evidencia de la etapa Practices Discovery (`inception/practices-discovery/`), escrita por `aidlc-pipeline-deploy-agent` para el intento `261105-melodify-mobile-app` y cerrada con la entrevista confirmada por la persona el 2026-11-06.
> Fecha: 2026-11-06. Alcance: `mvp`. Profundidad: Standard. Colaboradores: desactivados, así que no hay contribuciones de agentes de apoyo y este documento se sostiene solo en la evidencia que se lista aquí y en las respuestas de la entrevista.

## Naturaleza de este descubrimiento: greenfield

El proyecto es **greenfield** y `aidlc/spaces/default/memory/team.md` solo contenía comentarios de plantilla: no había ninguna práctica afirmada que heredar. En consecuencia:

- **Las cinco secciones de `team-practices.md` se construyeron desde cero y ahora son práctica afirmada**, tras la confirmación de la persona en la entrevista de esta etapa.
- **Las reglas de `discovered-rules.md` se apoyan en decisiones ya tomadas en etapas anteriores y en la configuración que el repositorio ya trae**, y las diez quedaron confirmadas tal como se propusieron.
- **No se inventa historia de equipo.** Donde el `org.md` ofrecía un valor por defecto plausible, se dijo que era un default y por qué encajaba o no; donde la persona eligió otra cosa, se registra la elección, no el default.

## Qué se inspeccionó

| Fuente | Qué se tomó de ella |
|---|---|
| `aidlc-state.md` | Proyecto greenfield, alcance `mvp`, profundidad Standard, estrategia de pruebas Standard, colaboradores desactivados, política de guardas `off`, fase de operación omitida. |
| `aidlc/spaces/default/memory/org.md` | Las cinco secciones de práctica por defecto: trunk-based con squash, walking skeleton condicionado al alcance, postura test-after con umbral del 80 % para `mvp`, despliegue al mergear a staging con aprobación manual a producción, Prettier/ESLint y convenciones idiomáticas. |
| `aidlc/spaces/default/memory/team.md` | Solo comentarios de plantilla: ninguna sección con contenido afirmado. |
| `aidlc/spaces/default/memory/project.md` | Dos correcciones registradas en rough-mockups: Explorar y Crear buscan en el catálogo real de Spotify con el catálogo de ejemplo como respaldo sin sesión; la conexión persiste y el token vive en almacenamiento seguro y se borra al desconectar. |
| `ideation/intent-capture/intent-statement.md` | Producto de opinión musical, seis pantallas, interfaz en español, éxito medido como recorrido sin errores en un dispositivo. |
| `ideation/scope-definition/scope-document.md` | Definición de terminado, capacidades incluidas, exclusiones (backend, tiendas, push, audio, i18n, persistencia del contenido) y secuenciación riesgo primero. |
| `ideation/feasibility/constraint-register.md` | Restricciones técnicas, organizativas y regulatorias: una sola persona, costo cero, Expo Go, experiencia en React web y no en React Native. |
| `ideation/rough-mockups/wireframes.md` | Cambio de alcance del 2026-11-06 (catálogo real y sesión persistente), consecuencias, mapa de estados, mínimos de accesibilidad y el reparto entre lo simulado y lo real. |
| `.github/workflows/ci.yml` | El repositorio **ya trae** un pipeline de GitHub Actions: commitlint con `.commitlintrc.json`, `npm run typecheck`, `npm run lint` y `npm test -- --passWithNoTests`, en push y PR hacia `main` y `develop`. |
| `.github/pull_request_template.md` | Plantilla de PR con tipo de cambio, plataformas verificadas, capturas, variables de entorno y checklist de calidad (typecheck, lint, test, sin credenciales). |
| `README.md` | Stack declarado: React Native 0.87.1, React 19.2.3, TypeScript, ESLint, Prettier, Jest, Conventional Commits con commitlint, CI en Actions; flujo de contribución que parte de `develop`. |
| `git log` y rama actual | Historial corto con dos merges de PR y trabajo sobre `main`; no hay código de aplicación todavía (no existe `app/` ni `package.json`). |

## Decisiones de la entrevista

Cada fila registra la respuesta confirmada por la persona y lo que cambia respecto del borrador previo.

| Pregunta | Respuesta confirmada | Efecto en los artefactos |
|---|---|---|
| Q1 — organización de ramas | **C**: `develop` como rama de integración y `main` solo para entregas | Sustituye el trunk-based sobre `main` del borrador. `## Way of Working` describe las dos ramas de larga vida. |
| Q9 — destino de los Bolts (seguimiento de Q1) | **A**: los Bolts se integran a `develop`; `main` recibe solo entregas, con un squash desde `develop` | La base de cada rama de Bolt es `develop` y el destino de merge es `develop`; una entrega es un squash de `develop` a `main`. Queda escrito para que Delivery Planning y la configuración de worktree/merge lo sigan. |
| Q2 — Pull Request siempre | **A**: todo cambio entra por PR con la plantilla del repositorio, aunque la misma persona lo abra y lo mergee | Se conserva la ceremonia de PR como registro de verificación; ni los cambios pequeños van directos. |
| Q3 — walking skeleton | **B**: no se adopta como práctica permanente del equipo | Sustituye el «sí, construimos un walking skeleton primero» del borrador. `## Walking Skeleton` deja de ser afirmativo a nivel de equipo. |
| Q10 — esqueleto en este trabajo (seguimiento de Q3) | **B**: se mantiene activado en este trabajo aunque no sea práctica permanente | Se registran los dos hechos juntos: sin práctica permanente, pero el alcance `mvp` de este intento conserva el esqueleto y su primera unidad pasa por el checkpoint. |
| Q4 — metodología de pruebas | **A**: `test-after` | Confirmado como estaba redactado; el orden es implementar cada capa y después escribir y ejecutar sus pruebas. |
| Q5 — umbral de cobertura | **A**: 80 % de líneas sobre `app/src/**` con `--coverage`, excluyendo configuración, assets y arranque | Confirmado; deja de ser una incertidumbre abierta. |
| Q6 — qué significa desplegar | **A**: no hay despliegue; Metro en el ordenador y Expo Go en el teléfono, y el CI valida sin publicar | Confirmado; se mantiene el descarte del default de `org.md` (staging y aprobación de producción). |
| Q7 — formato, tipado y organización | **A**: Prettier + ESLint (config de Expo) + TypeScript `strict`, organización por dominio (`screens/<pantalla>/`, `components/`, `state/`, `spotify/`, `data/`) | Confirmado; `## Code Style` conserva la especialización por dominio y los textos en español. |
| Q8 — restricciones duras | **A**: las diez reglas del borrador (seis `ALWAYS` y cuatro `NEVER`) tal como están | `discovered-rules.md` queda sin cambios de contenido; se promueven a `project.md` bajo `## Mandated` y `## Forbidden`. |

## Qué se infirió y cómo se resolvió

- **Dos ramas de larga vida y no trunk-based**: el borrador proponía retirar `develop`; la persona eligió lo contrario, conservarla como rama de integración y dejar `main` solo para entregas. La consecuencia práctica es que el destino de los Bolts es `develop`, no `main`.
- **La ceremonia de PR se conserva aunque no haya revisión de terceros**: la plantilla ya existe y obliga a declarar plataformas verificadas, variables de entorno y checklist. Es el registro de verificación más barato que el proyecto puede tener, y se aplica a todo cambio.
- **Walking skeleton: práctica por alcance, no por equipo**: el borrador lo daba por afirmado porque el alcance `mvp` lo declara; la persona separó las dos cosas. El equipo no lo adopta de forma permanente, pero este intento lo mantiene activo.
- **Despliegue inexistente**: el `org.md` describe entornos que este proyecto no tiene; la fase de operación está omitida en el alcance y el CI no tiene pasos de build ni de publicación. «Desplegar» se reduce a ejecutar en Expo Go.
- **Postura de pruebas test-after con umbral**: confirmada la metodología y el 80 % de líneas. Lo que se especializa es el objeto de la cobertura (lógica, estados y utilidades de Spotify), no el umbral.

## Defaults del `org.md` que se adoptaron, adaptaron o descartaron

| Sección | Default del `org.md` | Decisión confirmada |
|---|---|---|
| Way of Working | Trunk-based sobre `main`, squash por Bolt | **Sustituido**: `develop` es la rama de integración y `main` solo recibe entregas (squash desde `develop`); los Bolts nacen de `develop` y se integran a `develop`. El squash por Bolt se conserva. |
| Walking Skeleton | Solo cuando el alcance declara `skeleton: on` | **Adoptado en su forma condicional**, sin práctica permanente de equipo: este intento (`mvp`) lo mantiene activado y su primera unidad pasa por el checkpoint. |
| Testing Posture | test-after, 80 % de líneas, ejecución en CI antes del merge | **Adoptado en metodología y umbral**, especializado en qué se cubre y en qué queda como verificación manual. |
| Deployment | Despliegue al mergear a staging; producción con aprobación manual | **Descartado**: no hay entornos, ni artefacto desplegable, ni fase de operación. Se sustituye por ejecución local en Expo Go y verificación manual del recorrido. |
| Code Style | Prettier, ESLint en CI, convenciones idiomáticas | **Adoptado**, especializado con organización por dominio, reglas de TypeScript estricto y textos en español. |

## Incertidumbre sin resolver

1. **Discrepancia entre el README y el proyecto real.** El README describe React Native con `npm run android`, pods de iOS, JDK y Android Studio; el proyecto se ejecuta en **Expo Go**. Las dos cosas no son lo mismo y el README queda desactualizado hasta que exista `app/` con el proyecto Expo. No se corrige en esta etapa; se señala.
2. **Piezas referenciadas que todavía no existen.** El CI referencia `.commitlintrc.json` y `app/package.json`, y el README enlaza `.commitlintrc.json` y `.github/workflows/ci.yml`; ninguno de los dos primeros está en el repositorio. El pipeline no puede pasar en verde hasta que el andamiaje de Expo los cree.
3. **Comando de verificación de Construction.** El primer tramo exige un comando de verificación autorizado por la persona y registrado en el intento; todavía no está elegido. Debe demostrar el recorrido real en el teléfono, no solo que Metro arranca.
4. **Límites de peticiones de la API de Spotify** sin medir; si aprietan, se resuelve con caché local de resultados, y eso pertenece al diseño técnico, no a esta etapa.

## Sources

- `aidlc-state.md` — estado del intento `261105-melodify-mobile-app`.
- `org.md`, `team.md`, `project.md` — espacio activo `default`.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.
- `scope-document` — `ideation/scope-definition/scope-document.md`.
- `constraint-register` — `ideation/feasibility/constraint-register.md`.
- `wireframes` — `ideation/rough-mockups/wireframes.md`.
- `.github/workflows/ci.yml`, `.github/pull_request_template.md`, `README.md` — configuración y stack declarados en el repositorio.
- `practices-discovery-questions.md` — entrevista de esta etapa y respuestas confirmadas (Q1–Q10, resumen consolidado «Looks correct»).
