<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-19T00:00:00Z — `NFR8.16` pide «primer fotograma con el mismo número de filas que el estado final»; lo interpreto como *misma estructura de secciones y mismo número de filas*, no mismos datos: el esqueleto pinta cabecera de día + tarjetas de 96 pt con la misma cuenta que el estado final, y el contenido llega después sin reflow de alturas.
- 2026-11-19T00:00:00Z — `NFR3.23` (sin `Linking`/`WebView`/`fetch` en la unidad) lo aplico al paquete `@melodify/activity` **y** a la pantalla Actividad; el resto de la app ya usa `fetch` en la capa de Spotify y esta regla no la reabre.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-19T00:00:00Z — el stage sugiere describir los componentes lógicos de toda la unidad; `logical-components.md` reenumera LC-1…LC-16 heredados de U4 y solo diseña en detalle LC-17…LC-19. Sin la reenumeración el grafo de dependencias quedaba sin raíces y no se podía mostrar el aislamiento de fallos.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-19T00:00:00Z — `@melodify/activity` sin dependencias de runtime (solo `import type`) frente a reutilizar `@melodify/design-system`: gano que el paquete no arrastre React ni React Native y se pueda probar con dobles planos; pierdo la posibilidad de compartir tokens de color en la derivación, que de todos modos no los necesita porque no pinta nada.
- 2026-11-19T00:00:00Z — suscripción perezosa a C4 en `createActivity` frente a suscribirse en el constructor: gano que cinco llamadas de lectura en frío no abran un canal vivo que nadie escucha; pierdo que el primer `observe` paga la suscripción, aceptable porque coincide con el primer render y no con el arranque de la app.
- 2026-11-19T00:00:00Z — `SectionList` frente a `FlatList` con cabeceras manuales: gano agrupación por día gestionada por la lista y `stickySectionHeadersEnabled` gratuitas; pierdo el control fino del reciclado, que aquí no hace falta con 8 eventos sembrados.
- 2026-11-19T00:00:00Z — prohibir `fetch` en `packages/activity/src/**` por linter y no confiar en la revisión: el coste es una regla más en `eslint.config.js`; el beneficio es que BR21.6 deja de ser una convención y pasa a ser un fallo de CI reproducible.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-19T00:00:00Z — la agrupación por día usa días UTC para coincidir con `formatCalendarDate` de C1; si producto pide días locales, cambia también C1 y no solo U5. Confirmar antes de que U6 consuma la salida.
- 2026-11-19T00:00:00Z — el esqueleto de carga fija 3 filas por grupo y 2 grupos (96 pt cada fila); con más de 8 eventos sembrados el primer fotograma dejaría de coincidir con el estado final. Confirmar si la siembra crece en un intento posterior.
