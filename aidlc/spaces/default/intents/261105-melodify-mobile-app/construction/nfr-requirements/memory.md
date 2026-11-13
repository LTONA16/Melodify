<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-12T05:30:00Z — [unit u2-content-core] `useSyncExternalStore` se descarta para C4/C5 porque esos contratos no publican una instantánea sincrónica: se exige en su lugar una suscripción que emita al suscribirse, y los hooks leen con `useEffect` + `useState`. C3 sí puede emitir de inmediato porque siempre tiene un valor.
- 2026-11-12T05:30:00Z — [unit u2-content-core] El suelo de cobertura de esta unidad es por árbol (`app/src/**` más cada `packages/*/src/**`), no un porcentaje global: un paquete nuevo sin pruebas no se esconde detrás del total del monorepo.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-12T05:30:00Z — [unit u2-content-core] `@melodify/content-store` se declara libre de React (reducer propio sobre estado inmutable), lo que contradice ADR-010 tal como quedó escrito. Se registra la divergencia en `tech-stack-decisions.md` en vez de arrastrar una dependencia de React en un paquete de estado.
- 2026-11-12T05:30:00Z — [unit u2-content-core] `useCatalog` devuelve catálogo más un contador incrementado por emisión porque C5 no publica revisión; se prefiere eso a ensanchar C5 en esta unidad.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-12T05:30:00Z — [unit u2-content-core] `createConnectivity({ network })` queda como única firma de fábrica: se pierden las variantes con dobles inyectados desde el arranque, y se gana que la prueba sustituya un solo punto (`network`) en vez de la fábrica entera.
- 2026-11-12T05:30:00Z — [unit u2-content-core] Los códigos nuevos de registro (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE`) se declaran en `AppLogCode`/`AppLogger` y no en `SessionLogCode`, y se demuestra que siguen siendo asignables a `SessionLogger`: se evita ensanchar C3 a costa de un tipo local más.
- 2026-11-12T05:30:00Z — [unit u2-content-core] El aviso de sin conexión lo pinta cada pantalla bajo su propia cabecera y no la cáscara: se duplica el punto de montaje, y se gana que el aviso quede pegado a la cabecera correcta sin que la cáscara conozca qué pantalla está visible.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-12T05:30:00Z — [unit u2-content-core] `expo-network` 57.0.3 todavía no está en `app/package.json`; Code Generation lo instala junto con los paquetes nuevos de esta unidad.
