<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
2026-11-17T10:20:00Z — Q3 = B se leyó como «la búsqueda devuelve tres clases» y no como «tres listas separadas»: una sola petición a C10 con `type=track,album,artist`, una sola caché por consulta y una lista con dos componentes de fila. Cachear por clase habría triplicado las peticiones que OQ2 pide contener.
2026-11-17T10:22:00Z — Q5 = A se leyó como «tocar un artista rellena el campo y relanza la búsqueda», no como «filtra los resultados ya cargados». La segunda opción habría dejado al artista sin sus canciones y álbumes, que es justo lo que la persona busca al tocarlo.
2026-11-17T10:24:00Z — Q4 = A se leyó como «el estado `invalidToken` no destruye el estado de Explorar»: la lista y la consulta viven en el contenedor y solo las portadas cambian a bloque. Convertir el aviso en un estado de búsqueda habría exigido guardar la lista anterior aparte para poder volver a ella.
2026-11-17T10:26:00Z — El redirect se resuelve al construir `auth` y no en cada conexión: el panel de Spotify exige un valor estable y cambiarlo entre intentos haría imposible registrar uno. Se lee de entorno para poder fijarlo sin tocar código.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
2026-11-17T10:28:00Z — Explorar sin sesión no pinta el buscador aunque el mockup lo dibuje. FR4.5 y AC3.2.1 describen tarjeta + sugerencias; un campo que no puede buscar sería una promesa falsa. Queda registrado en `functional-spec.md` § Assumptions y en `contract-summary.md` § Revisión 17.
2026-11-17T10:30:00Z — La etiqueta «Canción»/«Álbum» no está en el mockup. Se añade para que dos obras con el mismo título no se confundan; va en `type.caption`, no cambia la altura de la fila y no sustituye al recuento.
2026-11-17T10:32:00Z — `CoverArt` gana comportamiento (cae al bloque cuando la imagen falla) sin cambiar props. El mockup ya lo pedía en AC2.2.3, pero la pieza de U1 no lo tenía; se corrige aquí en vez de dejar una portada rota hasta U6.
2026-11-17T10:34:00Z — El paquete `@melodify/spotify` se parte en dos entradas (`auth` y `catalog`) dentro de un solo paquete, como fija ADR-004, en vez de un módulo único con el token escondido. La frontera de importación es lo que hace verificable que nadie más toca `expo-secure-store`.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
2026-11-17T10:36:00Z — Se prefiere la `WorkView` por la ruta (`openWorkDetail({ workId, data })`) a resolver la obra en el detalle contra C7: la ruta no añade una petición de red al abrir un resultado y deja el detalle igual para las obras de ejemplo. El coste es un campo opcional más en C2.
2026-11-17T10:38:00Z — Se prefiere `useWorkSearch(..., { includeArtists })` a un segundo hook para artistas: el disparo, la cancelación, el debounce y la caché son idénticos, y dos copias se desincronizarían con el primer cambio. El coste es una opción más y un filtro en la vista de Crear.
2026-11-17T10:40:00Z — La resolución de una obra prueba `/tracks/{id}` y, si responde `404`, `/albums/{id}`, en vez de resolver la clase desde `workKind`: una obra de ejemplo (canción) no lleva `workKind` y no se puede asumir que el dato esté siempre. El coste es una petición extra solo cuando la obra es un álbum.
2026-11-17T10:42:00Z — Los artistas no piden imagen: añadir `images` de artista daría una URL que ninguna historia usa y que habría que degradar a bloque igual. El coste es que la fila de artista es siempre un bloque circular con la inicial.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
2026-11-17T10:44:00Z — Queda por comprobar en el panel de Spotify si acepta `exp://<ip>:8081/--/spotify-callback`. Si lo rechaza, AC10.1.2, AC10.1.3, AC10.2.1, AC10.2.2 y AC10.2.3 se quedan `Deferred` y el recorrido se demuestra sin sesión (FR12.2); el motivo se anota en `external-dependency-map.md`.
2026-11-17T10:46:00Z — Si U6 necesita paginar resultados, es un cambio de C5 y de C10, no de la vista: la lista ya separa obras y artistas por componente y solo habría que añadir la carga de la página siguiente.
