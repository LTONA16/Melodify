<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
2026-11-21T00:00:00Z — la etapa se ejecutó como auditoría y reparación del CI existente, no como rediseño: el YAML ya era correcto y los tres fallos eran de árbol limpio (CI-F0, CI-F1, CI-F2).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
2026-11-21T00:00:00Z — no se abrió la puerta de aprobación: el paso 5 (frontera Construction → Operation) no pasa, así que se presenta el bloqueo a la persona antes de cruzar la frontera.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
2026-11-21T00:00:00Z — `quality-gates.md` materializa en el CI los comandos que Build and Test ya declaró (BT-01…BT-13) en lugar de inventar puertas nuevas; QG-7 (PR con plantilla) es la única puerta de proceso añadida.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
2026-11-21T00:00:00Z — quedan dos bloqueos de frontera: el recorrido manual P1–P4 sin ejecutar (20 IDs) y `AC1.3.1`/`AC9.1.8` sin reclamar en la trazabilidad de U2/U4 (12 IDs).
