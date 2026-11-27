<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-27T03:09:00Z — El trabajo es brownfield sobre un servicio que ya existe: `apps/api` tiene Fastify, Prisma, autenticación Argon2id y JWT, y pruebas; `packages/contracts` ya existe. Pregunté explícitamente si se extiende, se rehace o solo se documenta, porque de eso depende qué se conserva y qué se rediseña.
- 2026-11-27T03:09:00Z — El registro de fuentes se limitó a la descripción inicial, el alcance elegido (`feature`) y tres reglas de `project.md` (backend permitido, client secret prohibido, PKCE vigente); no registré la regla de despliegue del equipo porque dice «no hay backend» y este intento la sustituye.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-27T07:24:00Z — Se acordó extender el servicio existente de `apps/api` en lugar de rehacerlo, así que el trabajo de diseño partirá de lo ya construido (Fastify, Prisma, Argon2id, JWT) y no de un lienzo en blanco.
- 2026-11-27T07:24:00Z — El límite de producto se apoya en la regla del proyecto que mantiene Spotify en la app con PKCE y prohíbe el client secret; el backend no toca tokens de Spotify ni reproduce audio.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-27T07:24:00Z — Queda abierto qué pasa con el contenido creado localmente en los teléfonos antes del backend (migrar, descartar o dejar solo en el dispositivo); se aceptó como supuesto en esta etapa y conviene cerrarlo en Requirements Analysis.
- 2026-11-27T07:24:00Z — La moderación queda fuera de la primera versión por decisión explícita; con contenido público es un riesgo a revisar en Scope Definition o Requirements.
