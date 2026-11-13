<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-11T08:40:00Z — el motor filtra `scalability-design`, `reliability-design` y `observability-design` porque la unidad es de tipo `ui`; sus objetivos se absorben en `performance-design.md` (NFR1) y `security-design.md` (NFR9), igual que en los requisitos.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-11T08:41:00Z — NFR6.4 (estado no solo por color) se diseña en `logical-components.md` § Sistema de diseño y no en `performance-design.md`: no se resuelve eligiendo un token sino comprobando el renderizado de la barra, y el sistema de diseño es un componente lógico de esta unidad.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-11T08:42:00Z — la guarda del registro devuelve `null` en vez de lanzar: el arranque no tiene que distinguir «sin sesión» de «sesión rota», a costa de no poder registrar la causa concreta sin mirar el código.
- 2026-11-11T08:43:00Z — el logger recibe dos cadenas y un código en unión de tipos, no un objeto: pierde comodidad (no se puede pasar contexto estructurado) y gana la garantía de que una credencial no acaba en un registro.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-11T08:44:00Z — confirmar que `expo-splash-screen` viene incluido con el SDK 57 en Expo Go; si no, la alternativa es aceptar el fondo del tema durante la lectura.
