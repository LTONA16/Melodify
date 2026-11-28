<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-28T03:18:42Z — Q1-Q4 cerraron la retención a 30 días, la obra musical como tipo + ID externo opaco, la reseña editable de 1 a 2000 caracteres con valoración 0.5-5 y el feed global con actividad pública. I-03 queda resuelto y no se arrastra como pregunta abierta a los requisitos.

- 2026-11-28T02:44:25Z — convertí las reglas ya presentes en CodeKB y en el alcance en opciones concretas para siete decisiones pendientes; no reabrí decisiones ya aprobadas en ideación ni en practices-discovery. Las opciones recomendadas conservan el backend local, el feed global, la paginación por cursor y el respaldo local de solo lectura.

<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
- 2026-11-28T03:27:01Z — la revisión advisory devolvió READY con cuatro hallazgos: semántica del `handle`, concurrencia en ediciones, origen de la versión del aviso y umbral de timeout. Como la clase es advisory no se modificaron los artefactos revisados; los hallazgos se entregan al gate para que la persona decida si importan antes de aprobar.

<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
- 2026-11-28T02:44:25Z — sigue abierto I-03: plazos concretos de consentimiento, borrado y retención bajo LFPDPPP; las preguntas Q1 y Q6 proponen valores verificables para cerrarlo antes de escribir `requirements.md`.

<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
