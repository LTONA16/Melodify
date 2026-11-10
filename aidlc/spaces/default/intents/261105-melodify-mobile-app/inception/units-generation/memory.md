<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-09T23:45:00Z — las unidades se cortan por tramo recorrible y no por componente: una unidad por componente habría dado nueve piezas que no se pueden usar por separado, porque todas viven dentro de la misma app y de la misma navegación.
- 2026-11-09T23:45:00Z — «crear y editar» y «reaccionar» van juntos porque son la misma escritura sobre `ContentStore` y comparten validación, fechas y contadores; separarlos habría duplicado el trabajo de probar las reglas de escritura.
- 2026-11-09T23:45:00Z — US2.2 se reparte entre U2 y U4: la portada de bloque cuando no hay sesión nace en U2 y la portada real en U4. La traza apunta a U4 porque la historia existe por la sesión de Spotify.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-09T23:45:00Z — no hubo ronda de mob: los colaboradores están apagados en este alcance y el arquitecto trabajó solo.
- 2026-11-09T23:45:00Z — U6 no aporta código propio más allá de ajustes: es la unidad de verificación del recorrido completo, que es el criterio de terminado del alcance. Se prefiere eso a repartir la verificación entre las demás y quedarse sin un punto donde se mire la app entera.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-09T23:45:00Z — U2 es la unidad más grande (L) y concentra el contenido, el catálogo, la conectividad y tres pantallas; se acepta porque todo eso es el sustrato del que dependen las demás y partirlo crearía dependencias artificiales entre piezas que siempre se construyen juntas.
- 2026-11-09T23:45:00Z — todas las unidades son `ui`: no hay servicio, ni paquete publicable, ni contrato consumido en sitio. Etiquetarlas de otra forma habría hecho que Construction pidiera documentos que no aplican a una app Expo sin backend.
- 2026-11-09T23:45:00Z — el grafo deja tres ramas en paralelo después de U2 (U3, U4, U5); se gana velocidad si hay más de una persona o más de un Bolt a la vez, y se paga con más cuidado al integrar porque las tres tocan `AppShell` y `ContentStore` en puntos distintos.
- 2026-11-09T23:45:00Z — el esqueleto incluye login y una tarjeta, no solo navegación: se construye un poco más antes del primer checkpoint y se gana que el tramo demuestre algo real en el teléfono.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-09T23:45:00Z — el límite de texto y la obligatoriedad de la valoración (OQ1, A1) los fija Functional Design; U3 implementa lo que esa etapa decida y no cambia el corte.
- 2026-11-09T23:45:00Z — el registro de la app en Spotify (RC-09, A6) es trabajo externo previo al recorrido con sesión de U6; si no está hecho, U6 solo puede recorrer la mitad sin Spotify.
