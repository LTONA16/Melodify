<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-05T23:52:36Z — la persona reabrió la frontera de producto en Q7 (integrar la API de Spotify) y eligió PKCE en Q8; se trató como cambio de alcance autorizado, no como un error a corregir.
- 2026-11-05T23:52:36Z — «no es prioridad la accesibilidad» (Q4 = C) se interpretó como ausencia de trabajo de accesibilidad, no como permiso para diseñar interfaces ilegibles; se mantuvieron contraste y áreas táctiles como mínimo barato.
- 2026-11-06T00:17:52Z — las dos decisiones de la puerta (catálogo real y sesión persistente) se interpretaron como ampliación autorizada de la frontera, no como corrección de un error; el catálogo de ejemplo se conserva como respaldo sin sesión.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-05T23:52:36Z — se reescribió la pregunta Q6 a mitad de etapa porque la integración con Spotify introdujo red y la pregunta original ya no aplicaba.
- 2026-11-05T23:52:36Z — no se actualizaron `intent-statement`, `scope-document` ni `constraint-register`, que siguen prohibiendo Spotify; se dejaron intactos por ser artefactos aprobados en etapas cerradas.
- 2026-11-06T00:17:52Z — se decidió que sin sesión se puede publicar sobre obras del catálogo de ejemplo, en lugar de bloquear «Publicar»; evita que las sugerencias de Explorar lleven a un formulario que no puede completarse.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-05T23:52:36Z — se aceptó la dependencia de red a cambio de portadas reales; el criterio de terminado «sin errores» pasa a significar «sin errores con conexión», con modo de ejemplo como respaldo.
- 2026-11-06T00:17:52Z — se agotó la única pasada de revisión disponible; las observaciones de la revisión 03 se aplicaron y se presentan al humano en el resumen de aprobación en lugar de pedir otra pasada.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-05T23:52:36Z — la revisión señaló que el cambio de Spotify no se propaga a los artefactos que consumen las etapas siguientes; queda pendiente de decisión humana.
- 2026-11-05T23:52:36Z — falta decidir si Explorar busca en el catálogo completo de Spotify o solo entre obras ya opinadas.
- 2026-11-06T00:17:52Z — CR-03 («esta versión no recoge datos personales reales») debe reescribirse antes de que haya usuarios reales, porque la app guarda el token de la cuenta de Spotify; se traslada a la etapa de requisitos.
