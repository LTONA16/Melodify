<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-21T04:05:00Z — el entregable de la unidad son los cuatro registros de pasada, no código; el plan no abre capas de prueba nuevas porque la unidad no escribe una línea de producto (BR25.1, TS-44).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-21T04:05:00Z — el comando acotado de la unidad es el diff de superficie congelada en lugar de un filtro de Jest inventado: no hay archivos de prueba propios, y un filtro solo repetiría la suite de otras unidades (Build and Test mide el suelo una vez sobre la suite completa).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-21T04:05:00Z — el recorrido en el teléfono lo ejecuta la persona: el registro se rellena con lo que ocurre en el dispositivo, y ninguna pasada se marca cerrada sin sus 18 u 8 filas.
