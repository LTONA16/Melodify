<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-28T00:30:35Z — Q1 y Q3 se tratan como restricciones de operación y alcance: servicio solo en el portátil y contenido simulado descartado. La métrica de «segundo dispositivo» se conserva como objetivo, con el supuesto de acceso por la misma red local; sin eso, Q1 y la métrica parecerían contradictorios.
- 2026-11-28T00:30:35Z — Q2 (LFPDPPP, México) sustituye el supuesto de RGPD de `market-trends.md`. El RGPD se deja como referencia prudente, no como norma rectora; el cambio se registra como I-01 para que llegue a Requirements Analysis.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-28T00:30:35Z — Mantener `apps/api` frente a un backend gestionado: se elige conservar lo construido y el control del dato, asumiendo mantenimiento propio. Es la conclusión de `build-vs-buy.md`, no una comparación de costes reales.
- 2026-11-28T00:30:35Z — Descartar el contenido local reduce la primera entrega, pero deja sin Migración la continuidad de quien ya publicó opiniones de prueba; se comunica como decisión de alcance (R-03).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-28T00:30:35Z — Confirmar en Requirements Analysis qué consentimiento, plazos de retención y borrado exige la LFPDPPP; no se fijan valores sin base (I-03, R-02).
- 2026-11-28T00:30:35Z — Comprobar el estado real del servicio existente antes de dividir el trabajo en unidades; `build-vs-buy.md` lo daba por supuesto (I-04, R-01).
- 2026-11-28T00:30:35Z — Definir en Scope Definition cómo se verifica el acceso desde un segundo dispositivo sin desplegar el servicio (R-04, A-03).
