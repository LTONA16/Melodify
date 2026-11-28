<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-28T00:58:10Z — Q1 y Q2 se leen juntos: el MVP incluye toda la métrica de éxito y la app conectada al servicio real; no se recorta a «solo publicar y leer» porque la medición pediría comentar, me gusta y seguir.
- 2026-11-28T00:58:10Z — Q4 cierra la contradicción entre «servicio solo en el portátil» y «segundo dispositivo»: se demuestra con dos dispositivos reales en la misma red, sin túnel ni despliegue.
- 2026-11-28T00:58:10Z — Q5 confirma una fecha de demostración sin recorte de capacidades; no se inventa una fecha concreta ni un efecto sobre el alcance.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-28T00:58:10Z — Sin desviaciones del alcance pedido: lo que se dejó fuera ya estaba excluido en `intent-statement.md`, `feasibility-assessment.md` o las restricciones.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-28T00:58:10Z — MoSCoW para la frontera y orden por dependencias (Q3 C) frente a orden por valor: se pierde una demo temprana completa, pero se evita construir interacciones sobre una base sin comprobar.
- 2026-11-28T00:58:10Z — Sin puntuaciones RICE ni WSJF: no hay datos reales de audiencia, esfuerzo ni impacto; inventarlos habría dado una precisión falsa.
- 2026-11-28T00:58:10Z — Mantener el MVP completo aunque haya fecha de demostración (Q5 B); la fecha no se usa para recortar capacidades.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-28T00:58:10Z — Plazos concretos de consentimiento, borrado y retención bajo LFPDPPP (I-03); se resuelven en Requirements Analysis.
- 2026-11-28T00:58:10Z — Estado real de `apps/api` y `packages/contracts` antes de convertir las proto-unidades en unidades (R-01, I-04).
- 2026-11-28T00:58:10Z — Dirección de acceso del portátil en la red local para la verificación con dos dispositivos; se resuelve al preparar la prueba, sin cambiar el alcance.
