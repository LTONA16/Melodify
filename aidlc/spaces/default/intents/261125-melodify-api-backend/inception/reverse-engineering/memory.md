<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

## Interpretations
- 2026-11-28T01:44:21Z — Interpreté el intento sin `repos` registrados como un único repositorio raíz y apliqué full rescan; el guard devolvió NO_STORE, por lo que no hubo pregunta de reutilización.

## Deviations
- 2026-11-28T01:44:21Z — Sin desviaciones: el desarrollador trabajó solo porque `collaborators: off` dejó un único enlace en el pipeline.

## Tradeoffs
- 2026-11-28T01:44:21Z — Elegí publicar con `codekb-publish` y no con escritura directa para conservar el intercambio atómico; el bloque quedó `kind partial` con 18 rutas profundas y 19 superficiales acorde con lo realmente abierto.

## Open questions
- 2026-11-28T01:44:21Z — I-04 queda resuelto: `apps/api` y `packages/contracts` existen; la ausencia del adaptador HTTP y de rutas sociales se traslada a Requirements Analysis.
