<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-12T04:20:00Z — [unit u2-content-core] «Destacada» (AC4.2.1) se lee como el estado `own` del `interaction-spec.md`, no como el simple orden de la tarjeta: fondo `primaryContainer`, etiqueta «Tu opinión» dentro de la tarjeta, «Editar» y fechas. Es el único punto de observación que no depende de una captura.
- 2026-11-12T04:20:00Z — [unit u2-content-core] El `422` de lectura sin `viewerId` se declara en C4 porque `x-identity` ya lo exigía sin decir la respuesta; sin él las cuatro pantallas leerían con un `viewerId` nulo y C4 inventaría los campos derivados.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-12T04:20:00Z — [unit u2-content-core] Esta unidad entrega y registra el detalle de opinión aunque `unit-of-work.md` y C2 lo asignan a U3; sin él US2.3 y AC9.1.4 no se cumplen. La divergencia queda en `functional-spec.md` § Assumptions y se eleva a la persona.
- 2026-11-12T04:20:00Z — [unit u2-content-core] El atrás del sistema en la raíz de una pestaña conserva el `false` de U1 (Android cierra la app) frente al «sin efecto» de `interaction-spec.md` § Navegación y atrás. Se conserva lo aprobado en el teléfono y la divergencia se eleva.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-12T04:20:00Z — [unit u2-content-core] AC2.3.2 obliga a que `AppShell` monte toda la pila de la pestaña y oculte las entradas de debajo con `display: none`: es la técnica que la cáscara ya usa entre pestañas y evita inventar una restauración de desplazamiento a mano. Se publica como C2 1.2.0 por comportamiento, sin cambio de props.
- 2026-11-12T04:20:00Z — [unit u2-content-core] C5 se publica en 1.1.0 y no en 1.0.0 porque es su primera publicación y le faltaban `subscribe`, `getCoverFailure` y `retryCovers`, que son lo que sostiene el banner de portadas con «Reintentar».

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-12T04:20:00Z — [unit u2-content-core] Para U3: «Seguir» (lo que pinta `OpinionCard`) frente a «Seguir autor» (lo que escriben los mockups). U2 no usa la acción.
- 2026-11-12T04:20:00Z — [unit u2-content-core] Para la persona, en el gate: alinear `unit-of-work.md`/C2 con el reparto del detalle de opinión y decidir si el atrás en la raíz debe pasar a «sin efecto» como dice la spec de interacción.
