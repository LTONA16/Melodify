<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-21T05:10:00Z — «Unverified» no se convierte en «Met»: los cinco objetivos que solo se miden en un Android físico se registran como no demostrados, aunque la etapa no tenga una excepción para móvil como la tiene para navegador.
- 2026-11-21T05:12:00Z — La obligación de CI del Testing Contract se registra `N/A` con `ci-pipeline` como etapa dueña: está `[ ]` y es la siguiente del plan, así que no es un fallo de esta etapa.
- 2026-11-21T05:14:00Z — Los comandos acotados de U1–U6 no se re-ejecutan: son subconjuntos de la suite completa que sí se ejecutó aquí, y sus resultados ya viven en el `code-summary.md` de cada unidad.
- 2026-11-21T06:05:00Z — Ante los cinco objetivos de dispositivo sin demostrar, la persona eligió «Aceptar el fallo»: se registran como limitación declarada y la etapa pasa a la compuerta. El criterio de terminado de la versión sigue pendiente y así queda escrito; no se abre loop-back porque no hay causa raíz en el código.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-21T05:16:00Z — La matriz agrupa por comprobación (41 filas) en lugar de una fila por NFR (unas 120): cada identificador aparece en la celda `Target ID` de la fila que lo mide, pero la lectura se hace por comprobación y no por requisito.
- 2026-11-21T05:18:00Z — Se ejecutó `npm install` antes de la primera compuerta para restaurar los enlaces del workspace; sin cambios versionados. Es preparación de entorno, no un arreglo de la etapa.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-21T05:20:00Z — La cobertura se agregó desde `coverage/lcov.info` por árbol de umbral en lugar de leer la tabla de Jest: la tabla lista directorios y no el agregado de `app/src` ni de `packages/spotify/src` con sus subdirectorios.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-21T05:22:00Z — ¿Se cierra Build and Test con el recorrido manual pendiente, o se ejecutan P1–P4 en el teléfono antes del PR? Sin ese recorrido, el criterio de terminado de la versión no se cumple.
- 2026-11-21T05:24:00Z — AC1.3.1 y AC9.1.8 están construidos y probados pero ninguna unidad los reclama en su `traceability.json`; arrastran 10 FR. ¿Se corrige el registro en una revisión de las unidades?
