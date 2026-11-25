<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-11-20T00:57:03Z — [unit u5-activity] la iteración 1 señaló tres defectos verificables; la reparación los cerró con evidencia de ejecución y la iteración 2 quedó sin hallazgos abiertos.
- 2026-11-11T09:40:00Z — el perfil test-after nombra cinco capas y esta unidad no tiene capa de transporte: la de «API/endpoint» se cubre con la superficie en proceso de C3 (`packages/app-session/src/index.ts`) dentro del paso de lógica de negocio, en vez de inventar un paso que no existe.
- 2026-11-11T09:40:00Z — el suelo de cobertura se configura aquí (`coverageThreshold`, cuatro árboles) pero no se juzga en esta etapa: Build and Test lo mide sobre la suite completa, así que un rojo solo por umbral se registrará tal cual.
- 2026-11-19T03:52:00Z — [unit u4-spotify-explore] la unidad llegó construida desde `develop` (`c34078d`): el paso de generación se resolvió como verificación paso a paso contra el código y las pruebas reales, no como una segunda implementación. El motor reinició las casillas del plan al preparar el handoff y el agente las restauró al comprobar cada paso (113 marcas).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

- 2026-11-20T00:57:03Z — [unit u5-activity] no se modificó el plan ni las instrucciones de prueba aprobadas: la contradicción de versiones se resolvió sin reescribir esos artefactos y sin tocar el CI.
- 2026-11-12T03:18:00Z — [unit u1-app-skeleton] la revisión adversarial devolvió NOT-READY en la iteración 1 (R-01 Crítico por dos instancias de sesión; R-02 y R-03 Mayores; R-04, R-05 y R-06 Menores); se repararon los seis y la iteración 2 dio READY con R-01 como «Still applies» re-graduado a Mayor, porque la instancia por defecto de C3 sigue publicada.
- 2026-11-12T03:18:00Z — [unit u1-app-skeleton] el CI del repositorio se editó pese a ser preexistente: la detección de subproyecto ahora exige su propio lockfile, así que el monorepo corre desde la raíz. La casilla del plan que pedía comprobar que corría «sin cambios» queda sin marcar para que la persona vea la decisión.
- 2026-11-19T03:52:00Z — [unit u4-spotify-explore] dos pruebas de integración válidas quedaron fuera del comando agregado del contrato: `app/src/bootstrap/__tests__/app-spotify-flow.test.tsx` (pasos 24.2 y 24.3) y `packages/app-shell/src/__tests__/work-data.test.tsx` (paso 14). Se ejecutaron aparte, en verde, y se declaran en `source-manifest.json`; el plan aprobado no se tocó.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-11-20T00:57:03Z — [unit u5-activity] se usó un `overrides` acotado en la raíz para que `app-shell` y `spotify` declaren `1.4.0` y el workspace resuelva `design-system` a `1.5.0`, preservando la restricción literal del plan.
- 2026-11-12T03:18:00Z — [unit u1-app-skeleton] la sesión se resolvió exponiendo una única instancia en `app/src/bootstrap/session.ts` en vez de hacer que la superficie publicada de C3 delegue en la instancia configurada: es la opción menos invasiva, no cambia el contrato de C3 y deja el punto de composición donde el logger se inyecta.
- 2026-11-12T03:18:00Z — [unit u1-app-skeleton] C1 y C2 suben a `1.1.0` y el reparto de versiones futuras se desplaza un escalón (`1.2.0` U2 … `1.5.0` U5) en lugar de retirar las props aditivas que las pantallas ya usan.
- 2026-11-19T03:52:00Z — [unit u4-spotify-explore] la corrida acotada con cobertura sale distinta de cero sólo por umbrales globales de archivos ajenos al alcance; se registra en `code-summary.md` y no se toca ningún umbral, tal como manda el contrato. Los árboles de la unidad quedan en 100 % (`packages/spotify/src`), 90,39 % (`auth`), 83,14 % (`catalog`) y 94,51 % (`design-system/src/components`).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

- 2026-11-11T09:40:00Z — el bloque `## Testing Contract` del plan no validaba su `contract_sha256`: la nota de `org.md` se había copiado como «…if the team commits to it.» cuando el render dice «…to one.». Se corrigió esa frase en el plan; el hash vuelve a coincidir (`c6f2307e…`) sin tocar el contrato ni recalcular nada a mano.
- 2026-11-19T03:52:00Z — [unit u4-spotify-explore] queda abierto el recorrido con sesión en el teléfono: depende de que el panel de Spotify acepte `exp://<ip>:8081/--/spotify-callback` como redirect (Q1 = B). Si lo rechaza, la demostración de la versión se hace sin sesión (FR12.2) y se anota el motivo.
