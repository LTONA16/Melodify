<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
2026-11-15T23:40:00Z — Los tres artefactos de la etapa son `performance-design.md`, `security-design.md` y `logical-components.md`; los tres filtrados por `produces_kinds` (`scalability`, `reliability`, `observability`) no se emiten porque la unidad es de tipo `ui`, y su contenido se absorbe en los dos primeros, como en U2. Se deja escrito en `logical-components.md` § Alcance para que la ausencia no se lea como olvido.
2026-11-15T23:41:00Z — Los NFR heredados que el sensor de trazabilidad trae (`NFR8.7`, `NFR8.1`, `NFR2.6`, `NFR2.5`, `NFR1.4`, `NFR3.7`, `NFR3.9`, `NFR3.1`, `NFR3.10`, `NFR3.2`, `NFR4.6`, `NFR9.1`, `NFR9.5`) se mapean a secciones propias de estos artefactos, no a los de U1/U2: la etapa responde de su unidad y el diseño tiene que decir qué protege U3 de cada uno.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
2026-11-15T23:42:00Z — El paso 2 del escenario (fichero de preguntas) no se ejecuta: el Functional Design ya cerró Q1 = B, Q2 = A y Q3 = A, y la etapa se invoca en modo artefacto; las decisiones abiertas se registran como `[assumption]` y como preguntas para U4/U5.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
2026-11-15T23:43:00Z — El `403` de `updateOpinion` no tiene texto propio en la interfaz: se pinta como el error genérico de guardado, porque el flujo no lo alcanza y un texto específico sugeriría un fallo de la persona. La prueba de `OpinionCard` con `isOwn: false` es lo que impide llegar.
2026-11-15T23:44:00Z — Para NFR3.16 se declara explícitamente que la prueba de remontaje no detecta una persistencia asíncrona en disco: esa mitad la cierra la regla de lint de imports y la revisión del PR, en vez de escribir una prueba que pasaría siempre (lo prohíbe `team.md` § Testing Posture).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
2026-11-15T23:45:00Z — U4: el puerto de búsqueda solo debe recibir la consulta de obra; si necesitara más datos, es un cambio de contrato y no un detalle de implementación.
2026-11-15T23:46:00Z — U5: la Actividad pide `useCardActions` y el mismo `Snackbar`; no cablea `toggleLike` por su cuenta ni pinta el me gusta propio.
