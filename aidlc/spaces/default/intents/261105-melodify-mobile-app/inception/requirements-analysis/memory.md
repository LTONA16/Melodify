<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-07T00:47:10Z — el detalle de una obra con opiniones de otros se resolvió como lista de opiniones ajenas más «Opinar sobre esta obra», y no como una opinión concreta; es lo único que permite leer varias opiniones de la misma obra sin inventar un criterio de cuál destacar.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-07T00:47:10Z — las restricciones de este documento se renumeraron a `RC-01…RC-09` en vez de mantener `CT-*`; el registro de la ideación ya usa `CT-*`/`CR-*` con otro significado y la misma etiqueta habría significado dos cosas.
- 2026-11-07T00:47:10Z — el estado inicial de la cuenta demo se fijó en 3 opiniones propias, 2 autores seguidos, 2 «me gustó» y 3 comentarios; da contenido a Actividad y a los contadores de Perfil sin inventar más datos que los 8–10 del feed.
- 2026-11-07T00:47:10Z — los estados vacíos se declaran estado de interfaz ejercitado en pruebas con almacén vacío, no estado alcanzable del recorrido; con contenido precargado no había otra forma honesta de sostenerlos.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-07T00:47:10Z — registrar la app en el portal de Spotify y acordar el redirect URI (RC-09, A6) es trabajo previo a la demostración con sesión; conviene confirmarlo antes de Construction.
