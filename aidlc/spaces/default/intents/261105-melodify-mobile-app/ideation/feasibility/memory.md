<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-05T00:52:10Z — la respuesta de cumplimiento (Q2 = C) se leyó como «estructura preparada, no certificación» porque Q8 la aclaró explícitamente; no se convirtió en un trabajo de cumplimiento completo.
- 2026-11-05T00:52:10Z — «sin cuentas de pago» (Q6 = A) se interpretó como prohibición de EAS Build y de publicación en tiendas, no solo como ausencia de suscripciones.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-05T00:52:10Z — el guion de la etapa sugiere preguntar por servicios y cuentas AWS; se omitió porque el alcance mvp no tiene nube y la pregunta de cuentas (Q6) ya cubre el equivalente práctico.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-05T00:52:10Z — los hallazgos aceptados como riesgo en intent-capture se registraron en el RAID log en lugar de corregir los artefactos aprobados, para no reabrir una etapa ya cerrada.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-05T00:52:10Z — funciones sociales avanzadas y notificaciones push siguen sin decisión; afectan el alcance de inicio, actividad y perfil.
- 2026-11-05T00:52:10Z — versiones mínimas de sistema operativo sin definir; se fijan al crear el proyecto Expo.
