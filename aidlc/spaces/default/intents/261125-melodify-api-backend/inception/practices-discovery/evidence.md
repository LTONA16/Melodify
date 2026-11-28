# Evidencia — Practices Discovery

## Participación y contexto

- Participante único: `aidlc-pipeline-deploy-agent` (lead). `collaborators: off` dejó `support_agents` vacío: no hay ficheros de contribución, no hubo revisión ciega de spokes y el lead redacta los cuatro artefactos declarados.
- Intento `261125-melodify-api-backend`, brownfield, alcance `feature`, depth `Standard`, test strategy `Minimal`, active space `default`, rama `feat/backend-api`, etapa `practices-discovery`.
- Es una **re-ejecución**: `aidlc/spaces/default/memory/team.md` ya tiene prácticas afirmadas y se usa como línea base sin editarla. `aidlc/spaces/default/memory/project.md` se usa como contexto y correcciones previas, no como fuente de reglas nuevas.
- Momento de la integración final: `2026-11-28T01:54:48Z`; HEAD: `82d887b32961e27d002fc19fa4e42ff30a7cffb9` (`chore(aidlc): guardar estado y avance de intent antes de corte de creditos`). Árbol de trabajo sin modificar por esta etapa fuera de los cuatro artefactos del registro.
- La integración se limitó a los cuatro artefactos declarados. No se ejecutaron comandos de estado de AI-DLC ni promoción a memoria: el orquestador emite `PRACTICES_DISCOVERED` y gestiona la promoción y el gate.

## Fuentes inspeccionadas (rutas exactas)

### Seis artefactos upstream declarados por la etapa

- `aidlc/spaces/default/codekb/Melodify/code-structure.md`: layout del monorepo (`app/`, `apps/api/`, `packages/*`), puntos de entrada (`buildApp()`, `app.inject()`), convenciones de nombres, fronteras de importación y directorios de pruebas. De aquí salió la organización por dominio adaptada al servicio y la existencia de `@melodify/data-access` como costura todavía no creada.
- `aidlc/spaces/default/codekb/Melodify/technology-stack.md`: TypeScript 5.9.3 estricto, Node 20+/22, npm workspaces, Fastify 5.12.8, Prisma 6.19.3, PostgreSQL 16, Zod, Argon2id/JWT, Vitest 5.1.2, Expo 58 + Jest; sin EAS, sin Actions de despliegue. También la desviación de versiones entre `README.md` y los manifiestos.
- `aidlc/spaces/default/codekb/Melodify/dependencies.md`: `@melodify/api` solo depende de `@melodify/contracts` en producción; la app depende de ocho paquetes móviles; `packages/contracts` publica tipos en `.` y esquemas en `./schemas`; variables de entorno de app y API; dependencias de CI.
- `aidlc/spaces/default/codekb/Melodify/code-quality-assessment.md`: puertas actuales (commitlint, typecheck, lint, `npm test`), umbrales de cobertura móvil y de API, y el riesgo principal: la suite Vitest del API no está en CI.
- `aidlc/spaces/default/codekb/Melodify/architecture.md`: modular monolith de Fastify, `buildApp()` como fábrica pura, Prisma como único acceso a PostgreSQL, OpenAPI generado desde los esquemas Zod, frontera app↔servidor y mejoras pendientes (adaptador HTTP, paginación por cursor, request id, Vitest en CI).
- `aidlc/spaces/default/codekb/Melodify/business-overview.md`: dominio, capacidades implementadas y pendientes, reglas de negocio (unicidad de opinión, rango de rating, no seguirse a uno mismo, rotación de refresh, errores en español, Swagger solo fuera de producción) y frontera de alcance.

### Línea base y contexto del intento

- `aidlc/spaces/default/memory/org.md`: defaults del framework para las cinco secciones y cadena de resolución `org → team → project → phase → stage`. Solo se consultó como referencia de fallback; no sustituye a la línea base afirmada.
- `aidlc/spaces/default/memory/team.md`: **línea base afirmada** de `## Way of Working`, `## Walking Skeleton`, `## Testing Posture`, `## Deployment` y `## Code Style`. De aquí se tomaron las dos ramas de larga vida, el PR obligatorio, Conventional Commits, el CI en push/PR, la cadencia test-after con su orden por capas, el 80 % sobre `app/src/**`, la ausencia de despliegue y las convenciones de estilo.
- `aidlc/spaces/default/memory/project.md`: reglas afirmadas y correcciones previas. Se tomó como contexto: client secret prohibido, PKCE y token en el dispositivo, texto en español, degradación con «Reintentar», never commitear `.env`. La corrección de 2026-11-25 permite backend, autenticación real y persistencia en servidor **solo en este intento**, dentro de su `scope-document`; por eso la regla «NEVER añadir backend…» no se reproduce en `discovered-rules.md`, aunque sigue vigente fuera de este trabajo.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/aidlc-state.md`: tipo brownfield, scope/depth/strategy, guard_policy `off`, sensors/learnings `on`, summary confirmation `off`, plan approval `on`, collaborators `off`, rama actual y etapa en curso.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/project-description.json`: descripción literal del backend (REST `/api/v1`, Fastify, TypeScript, PostgreSQL, Prisma, cuentas reales, contratos compartidos, Spotify intacto en la app).
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/scope-definition/scope-document.md`: capacidades SC-01 a SC-10, fuera de alcance (sin servidor remoto, staging, nube, túneles ni tiendas), secuencia por dependencias y verificación con dos dispositivos en la misma red local.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/feasibility/constraint-register.md`: CT-01 a CT-09, en especial CT-01 (solo portátil), CT-04 (Spotify en la app), CT-05 (sin audio, push, moderación ni tiendas), CT-07 (sin login simulado en el servicio) y CT-09 (datos personales desde el primer usuario).
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/reverse-engineering/developer-scan.md`: inventario de paquetes, frameworks, cobertura configurada, CI real y señales de deuda; confirma que la API ya tiene autenticación y base operativa y que faltan rutas sociales y adaptador HTTP.
- `.aidlc/scopes/aidlc-feature.md`: el alcance `feature` declara `skeleton: on`, de donde sale el checkpoint de esqueleto.
- `.aidlc/aidlc-common/stages/inception/practices-discovery.md`: contrato de la etapa (cuatro artefactos, secciones exactas, campos estructurados de Testing Posture, solo reglas humanas en `discovered-rules.md`).
- Preflight de conocimiento: los directorios `.aidlc/knowledge/aidlc-shared/`, `.aidlc/knowledge/aidlc-pipeline-deploy-agent/`, `aidlc/spaces/default/knowledge/aidlc-shared/` y `aidlc/spaces/default/knowledge/aidlc-pipeline-deploy-agent/` no contienen ficheros Markdown legibles en este checkout; no hubo material adicional que integrar de ellos.

## Inspección directa del repositorio

- **Historial y ramas** (`git log`, `git branch -a`, `git branch -vv`, `git tag -l`): ramas locales `develop`, `main` y `feat/backend-api`, con sus correspondientes `origin/*`; `develop` en `498ab97`, `feat/backend-api` en `82d887b`, `main` local en `040a758` y `origin/main` en `b24a126 Develop (#6)`. El patrón de commits es Conventional Commits (`feat(api):`, `fix(spotify):`, `chore(aidlc):`, `docs(u6):`), con merges de PR (`Merge pull request #4 …`, `Develop (#6)`) y squash visible en entregas. No hay tags. De aquí se infiere la cadencia: integración continua en `develop`, entrega a `main` por PR/squash.
- **CI** (`.github/workflows/ci.yml`): dispara en `push` y `pull_request` sobre `main` y `develop`; jobs `commit-lint` (historial completo, `.commitlintrc.json`) y `code-quality` (Node 22, `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, más validación del título del PR con commitlint). No hay job de build, firma, release ni despliegue, y todavía no hay job de Vitest: la decisión Q1 lo añade como puerta afirmada, pero su implementación es trabajo posterior de este intento.
- **Plantilla de PR** (`.github/pull_request_template.md`): tipo de cambio alineado a Conventional Commits, plataformas verificadas, capturas, variables de entorno y checklist de calidad (typecheck, lint, test, sin `console.log`, sin credenciales). Es la base de la regla de PR como registro de verificación.
- **Scripts** (`package.json`): `test: jest --coverage`, `typecheck: tsc -b`, `lint: eslint .`; workspaces `app`, `apps/*`, `packages/*`. No hay script root que ejecute la suite de la API.
- **No ejecutado**: no se corrieron Jest, Vitest, ESLint, typecheck ni migraciones. Todo lo aquí afirmado sobre pruebas y cobertura procede de configuración y documentación leídas, no de una ejecución.

## Decisiones de la línea base

- `team.md` manda sobre `org.md` allí donde hay una práctica afirmada (ramas, PR, CI, test-after, estilo). `org.md` solo se usa como referencia de fallback y para el contrato de resolución por capas.
- `project.md` aporta contexto y una corrección que **desactiva** para este intento su regla de no backend; por eso `discovered-rules.md` no la incluye, pero mantiene intactas las de Spotify, idioma y secretos.
- `Methodology: test-after` se toma de `team.md` y la entrevista (Q3) lo confirma para todo el repo, incluido `apps/api`.
- El esqueleto queda activado porque el alcance `feature` declara `skeleton: on`, coherente con la práctica afirmada de que es el alcance quien lo decide; la entrevista (Q2) confirmó qué demuestra el primer tramo.
- La sección de despliegue de `team.md` describe la versión móvil sin backend; se conserva su núcleo (sin entornos remotos, CI que valida y nunca publica, rollback por `git revert`) y se añaden el servicio local y los dos dispositivos desde `scope-document.md`/CT-01. La entrevista (Q4) elevó esa ausencia de entornos a regla permanente y fijó el rollback de esquema.
- Las reglas duras integradas son las afirmadas por personas en `team.md`/`project.md` y en la entrevista; lo que solo procede de código, CI o documentación se queda aquí como evidencia o incertidumbre, no en `discovered-rules.md`.

## Decisiones de la entrevista

El usuario eligió la opción A en las cinco preguntas; `practices-discovery-questions.md` conserva los `[Answer]: A` y las opciones íntegras.

- **Q1 — Way of Working**: añadir un job de Vitest con PostgreSQL de servicio y `TEST_DATABASE_URL` antes de autorizar el merge. Pasa a ser práctica afirmada y puerta de CI, junto a commitlint, typecheck, lint y `npm test`.
- **Q2 — Walking Skeleton**: confirmar el recorrido propuesto — crear cuenta real, publicar una opinión desde un dispositivo y verla en el segundo dispositivo en la misma red local, con servicio y PostgreSQL levantados en el portátil. El comando exacto de verificación se registrará en Construction.
- **Q3 — Testing Posture**: mantener `test-after` para todo el repo y elevar los umbrales de Vitest de `apps/api` — 80 % de líneas/sentencias/funciones y 70 % de ramas sobre `apps/api/src/**` sin `server.ts` — a puerta de equipo, junto al 80 % afirmado sobre `app/src/**`.
- **Q4 — Deployment**: mantener como regla permanente la ausencia de entornos remotos, staging, nube y túneles; ante un cambio de esquema en PostgreSQL, revertir el squash y aplicar una migración de reversión revisada, autorizada por quien aprueba el PR.
- **Q5 — Code Style**: la tarjeta de opinión compartida vive en `app/src/components/`; Swagger UI servido solo fuera de producción es comportamiento estable.

## Incertidumbre residual

1. **Comando exacto de verificación del esqueleto**: la demostración y la aprobación humana del checkpoint quedan fijadas (Q2), pero la orden concreta se registrará en Construction, no en esta etapa.
2. **Implementación del job de Vitest**: la puerta está afirmada (Q1), pero hoy `npm test` solo lanza Jest y `.github/workflows/ci.yml` no ejecuta la suite de la API. Falta añadir el job con PostgreSQL de servicio y `TEST_DATABASE_URL`; la decisión de práctica no presupone que ya esté implementado.
3. **Estrategia de pruebas y umbrales**: la test strategy `Minimal` de este intento determina volumen y tipos de prueba; los umbrales afirmados (Q3) son un suelo aditivo que esa estrategia no reduce. Cómo se reparten los casos requeridos por `Minimal` entre app y servicio se resuelve en las etapas de construcción.
4. **Procedimiento de reversión de esquema**: Q4 fija el principio (revertir el squash, migración de reversión revisada y autorizada por quien aprueba el PR), pero el contenido concreto de esa migración y su revisión se definirán cuando aparezca el primer cambio de esquema real.
5. **Tarjeta de opinión compartida**: la regla afirmada la sitúa en `app/src/components/` (Q5), mientras `dependencies.md` y `code-structure.md` describen la tarjeta compartida en los paquetes de UI (`design-system`/`app-shell`). La regla prevalece; queda pendiente alinear código o documentación en otro cambio, sin reinterpretarla aquí.
6. **Frontera de datos sensibles**: CT-04, `dependencies.md` y `architecture.md` sostienen que la única dependencia app↔API es `@melodify/contracts` y que el servicio no recibe, almacena ni envía tokens de Spotify. No se elevó a regla dura en la entrevista de prácticas; sigue siendo una restricción de alcance y arquitectura del intento.
7. **Desviaciones documentales**: `dependencies.md` cita `actions/checkout@v6` y `actions/setup-node@v6`, pero `ci.yml` usa `@v4`; `README.md` cita React Native 0.87.1/React 19.2.3 frente a los manifiestos 0.88.1/19.3.0; `docs/04-arquitectura.md` y `docs/03-ia-agentes-mcp.md` plantean Spotify server-side, Redis, colas y OpenAI, sin corresponder a la frontera real. Manifiestos y workflow real se trataron como autoritativos; corregir la documentación queda para otro cambio.
