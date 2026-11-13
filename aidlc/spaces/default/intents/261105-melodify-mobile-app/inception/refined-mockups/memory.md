<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-09T10:05:00Z — un mockup por pantalla, no por historia: las 24 historias se solapan en siete pantallas y repetir la misma pantalla por historia habría producido siete versiones incompatibles del mismo bloque.
- 2026-11-09T10:05:00Z — la tarjeta de opinión tiene tres variantes (feed, compacta, detalle) y una cuarta propia para la opinión de la persona; es el único componente que se repite en cuatro pantallas y por eso el más especificado.
- 2026-11-09T10:05:00Z — el detalle de obra y el de opinión comparten cabecera y se distinguen por el contenido; no son dos pantallas, son dos variantes de la misma vista apilada dentro de la pestaña.
- 2026-11-09T10:05:00Z — el chip de Spotify de Inicio solo distingue «Conectado» y «Conectar»; los cinco estados viven en Perfil, que es donde FR9.2 y FR9.5 los sitúan y donde la persona va a desconectar.
- 2026-11-09T10:05:00Z — el estado inicial de Explorar (sin texto) muestra el catálogo de ejemplo como sugerencia: cubre FR4.6 sin inventar una pantalla de bienvenida y le da salida a quien no sabe qué buscar.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-09T10:05:00Z — no hubo ronda de mob: el interruptor de colaboradores está apagado en este alcance y el agente de diseño trabajó solo.
- 2026-11-09T10:05:00Z — la fidelidad es media-alta **en texto**, sin archivo de diseño gráfico ni prototipo interactivo; el proyecto no tiene herramienta de diseño y el contrato con Construction es de tokens, medidas y estados, no de píxeles.
- 2026-11-09T10:05:00Z — Q6 = C (teléfono y tablet) se atiende con tres anchos especificados y una consecuencia explícita: solo el teléfono se verifica en esta versión (RC-05), así que la tablet queda como contrato de diseño y no como criterio de terminado.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-09T10:05:00Z — sistema propio sobre React Native puro en lugar de React Native Paper: se pierde velocidad inicial y componentes probados, se gana control del contraste, del tema y de la superficie que corre en Expo Go.
- 2026-11-09T10:05:00Z — sin librería de componentes, la hoja de comentarios y la barra inferior se construyen a mano; se acepta porque son dos piezas y una dependencia menos es una cosa menos que puede exigir compilación propia (RC-01).
- 2026-11-09T10:05:00Z — el sistema es plano (bordes en lugar de sombras): pierde algo de profundidad visual y gana legibilidad en tema oscuro y menos repintados en listas largas.
- 2026-11-09T10:05:00Z — los glifos `♡`, `♥`, `💬`, `★`, `☆` se quedan como texto en lugar de iconos vectoriales: los requisitos los nombran literalmente y las pruebas los buscan; el coste es una alineación menos fina en la fila social.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-09T10:05:00Z — el límite de texto de la opinión y la obligatoriedad de la valoración siguen abiertos (OQ1, A1); el diseño reserva el hueco del contador y no fija cifras.
- 2026-11-09T10:05:00Z — el redirect URI de PKCE (A6) no se decide aquí; el flujo de conexión está dibujado con sus estados, pero la vuelta a la app depende de Functional Design y de RC-09.
- 2026-11-09T10:05:00Z — la tablet no se puede verificar en esta versión; si el proyecto crece, el ancho expandido exige una historia y una prueba propias.
