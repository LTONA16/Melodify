<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
2026-11-20T06:52:00Z — NFR4.12 y NFR3.24 piden el redirect literal «con la misma fecha» en registro y mapa, mientras BR26.7 y BR28.2 lo ligan a R2 condicionada y el mapa no tiene columna para valor y fecha: lo leo como igualdad condicional y fijo el punto exacto (una línea bajo la tabla del mapa, solo si R2 se condiciona).
2026-11-20T06:56:00Z — NFR1.20 habla de «siete datos» y enumera ocho campos de cabecera; el diseño fija ocho, que es lo que BR27.1 y el functional-spec ya escriben, y corrige el recuento en el presupuesto.
2026-11-20T06:57:00Z — El contraste de NFR6.11 se obtiene con `contrastRatio` sobre los tokens del tema activo desde el repositorio y en el commit de la cabecera; es la misma función y los mismos valores que pinta la pantalla, y no añade código a la app.
2026-11-20T06:58:00Z — Las capturas de R2 son doce cuando R2 se ejecuta (seis en P3 y seis en P4) y una sola cuando se condiciona: el total es 24 o 13, nunca «doce o trece» a secas.
2026-11-20T07:24:00Z — Corregido tras la revisión: el contraste se mide como rol de texto sobre el fondo del contenedor que lo pinta (`surface`, `surfaceSunken`, `surfaceRaised`, `primaryContainer`), no sobre `bg`; dos pares del tema claro (4.48 en la fila pulsada y 4.31 en la fecha del detalle propio) quedan como pendiente de C1, porque corregirlos exige un token y no cabe como arreglo (BR27.4).
2026-11-20T07:25:00Z — El mapa de trazabilidad añade NFR5.13, NFR6.11 y NFR7.9, que el sensor no recogía porque viven en `tech-stack-decisions.md`; la fila condicionada conserva sus ocho pasos (52 filas presentes, 36 observadas y 16 en N/A) y la constancia del redirect lleva valor, mensaje y fecha.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
2026-11-20T06:53:00Z — No se escribió `nfr-design-questions.md`: no queda ninguna elección de producto abierta (la unidad verifica, no construye) y las decisiones de diseño se resuelven desde el functional-spec y los NFR ya aprobados, igual que en U5.
2026-11-20T07:26:00Z — Los artefactos se corrigieron después del veredicto READY (Guard Policy `off`): el veredicto se registró sobre una versión y las correcciones aplican sus hallazgos por escrito, sin cambiar el alcance ni rehacer el diseño.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
2026-11-20T06:54:00Z — La evidencia vive fuera de `app/` y las capturas en el PR: el bundle no crece y el repositorio no acumula binarios, a cambio de que la retención de las capturas sea la del PR.
2026-11-20T06:55:00Z — La unidad no mide latencia: se pierde un número que ninguna AC pide y se evita un instrumento que solo existiría para la demo (Q2 = A).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
2026-11-20T06:59:00Z — Si R2 se condiciona, el cierre debe decir qué mitad no se demostró y enlazar la línea del redirect; queda para el veredicto de la unidad, no para esta etapa.
