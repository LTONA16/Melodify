<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-10T01:10:00Z — «contratos REST» (Q1 = B) se entiende como la forma de petición y respuesta —operación, entrada, salida, códigos—, no como un servidor: la etapa pide fijar fronteras entre unidades, y estas corren dentro de la misma app Expo, donde no hay proceso servidor. La respuesta de F1 = A confirma la lectura; el contrato se lee como HTTP y las pruebas usan el mismo doble.
- 2026-11-10T01:10:00Z — lo que cruza cada frontera es el componente del Domain Design con su paquete: `DesignSystem`, `AppShell`, `AppSession`, `ContentStore`, `Catalog`, `Connectivity`, `Spotify` y `ActivityFeed`. Las pantallas de U3 no cruzan frontera porque viven en `@melodify/app`; por eso no exponen contrato.
- 2026-11-10T01:10:00Z — «estados observables» (Q2 = A) incluye vacío, carga y error en todas las fronteras, también en `ActivityFeed` (loading/ready/empty/error de ADR-012) y en `Catalog` (ok/empty/offline/error del mapa de estados).
- 2026-11-10T01:10:00Z — la única frontera que se invierte es `SpotifySessionPort`: la declara U2 porque `Catalog` necesita saber si hay sesión y la implementa U4, que es quien tiene el token. Así ninguna unidad mira hacia arriba en el grafo.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-10T01:10:00Z — dos preguntas de seguimiento (F1, F2) fuera del cuestionario original: las respuestas Q1 = B y Q4 = B chocaban con el alcance («sin backend») y con la estructura de un solo `package.json`. Se resolvieron antes de escribir el resumen, con F1 = A y F2 = B.
- 2026-11-10T01:10:00Z — no hubo colaboración de `aidlc-aws-platform-agent`: los colaboradores están apagados en este alcance y no hay nube que diseñar; la única infraestructura es el teléfono con Expo Go.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-10T01:10:00Z — se acepta el monorepo con espacios de trabajo (F2 = B) para que el semver sea real: cada unidad publica su paquete con su versión, y el CI resuelve las dependencias internas. Se paga con configuración de espacios de trabajo y con seis `package.json` en lugar de uno.
- 2026-11-10T01:10:00Z — cada contrato se escribe como `openapi`/`shared-schema` en el documento aunque se ejecute en proceso: se gana que la forma de entrada, salida y códigos sea legible e independiente de TypeScript, y que el doble de pruebas comparta la misma forma. Se paga con un documento más largo y con la disciplina de mantener el YAML y los tipos alineados.
- 2026-11-10T01:10:00Z — sin reintento automático en las llamadas a Spotify: se prefiere que la persona decida reintentar antes que repetir peticiones y gastar cuota; el coste es que un fallo transitorio obliga a un toque, y se acepta porque el estado de error siempre trae «Reintentar».
- 2026-11-10T01:10:00Z — el catálogo de ejemplo entra en el mismo contrato C5 que el catálogo real (`origin: sample | spotify`) en lugar de tener contrato aparte: una sola forma para la interfaz y para las pruebas, sin una segunda vía de datos que mantener.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-10T01:10:00Z — el redirect URI exacto de PKCE (A6) y el esquema de enlaces que usará React Navigation: afecta a la conexión real de U4, no a la forma de C7/C9. Queda para Functional Design del paquete de Spotify.
- 2026-11-10T01:10:00Z — el límite de texto de la opinión y la obligatoriedad de la valoración (OQ1, A1): C4 declara el código 422 pero no el número; lo fija Functional Design y lo implementa U3.
- 2026-11-10T01:10:00Z — el tamaño de página de la búsqueda en C10: hoy se pide una página de 20 y no se pagina; si Functional Design quiere paginar, cambia el contrato de `searchSpotify`, no el de `Catalog`.
