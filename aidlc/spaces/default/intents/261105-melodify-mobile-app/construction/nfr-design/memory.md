<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-11T08:40:00Z — el motor filtra `scalability-design`, `reliability-design` y `observability-design` porque la unidad es de tipo `ui`; sus objetivos se absorben en `performance-design.md` (NFR1) y `security-design.md` (NFR9), igual que en los requisitos.
- 2026-11-12T05:55:00Z — [unit u2-content-core] El contador de `useCatalog` cuenta **cambios**: la emisión de siembra que C5 entrega al suscribirse es el catálogo con el que el hook ya arranca, y contarla haría mapear dos veces al montar. Es una precisión de NFR8.5, registrada en `performance-requirements.md` y en `frontend-components.md`, no una excepción silenciosa.
- 2026-11-12T05:55:00Z — [unit u2-content-core] La clave de memoización del feed incluye `online`: C5 no promete emitir cuando cambia la red —su `subscribe` avisa de catálogo o de resultado de portada—, y sin la conexión en la clave un cambio de red no repintaría las portadas hasta que alguien más emitiera. La tabla de presupuesto refleja las diez consultas de ese caso.
- 2026-11-12T05:55:00Z — [unit u2-content-core] `CONTENT_READ_FAILED` se emite solo si la lectura en proceso **lanza** (defecto interno): C4 y C5 no publican resultado de fallo para las lecturas, el `404` de `getWork` es degradación prevista y el `422` sin `viewerId` no llega porque sin identidad no se llama.
- 2026-11-12T05:55:00Z — [unit u2-content-core] NFR5.5–5.7 y NFR7.4–7.5 se diseñan en `logical-components.md` § Superficie, cobertura y compatibilidad: describen la forma del monorepo (superficie por `src/index.ts`, umbral por árbol, reloj inyectado, Expo Go, cierre de dependencias) y su compuerta es `npm test`, `typecheck` y el recorrido en el teléfono.
- 2026-11-12T06:30:00Z — [unit u2-content-core] La fila «imagen que falla al cargar» sale de NFR1.5: la siembra deja `coverUrl` en `null` en las ocho obras, así que en U2 ninguna portada llega como `url` y `CoverArt` (C1 1.2.0) no tiene ni necesita `onError`. El caso llega con las URLs reales de U4, que decidirá si C1 gana `onError` o si la pantalla resuelve antes de pintar.
- 2026-11-12T06:30:00Z — [unit u2-content-core] La compuerta de NFR3.11 no es simétrica: `@typescript-eslint/no-restricted-imports` sin `allowTypeImports` sobre el catálogo (no importa Spotify en ninguna forma, ni tipos) y con `allowTypeImports: true` sobre Spotify (implementar `SpotifySearchPort` exige nombrar el tipo).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-11T08:41:00Z — NFR6.4 (estado no solo por color) se diseña en `logical-components.md` § Sistema de diseño y no en `performance-design.md`: no se resuelve eligiendo un token sino comprobando el renderizado de la barra, y el sistema de diseño es un componente lógico de esta unidad.
- 2026-11-12T05:55:00Z — [unit u2-content-core] El aviso de sin conexión **sí** lleva «Reintentar» (→ `retryCovers`), como fijan `functional-spec.md` F7 paso 8, F11 paso 4 y § Textos, y se corrige la viñeta de NFR2.5 que decía «sin acción propia»: manda el Functional Design. El botón no arregla la red; solo reintenta portadas.
- 2026-11-12T05:55:00Z — [unit u2-content-core] El hook de catálogo no copia la instantánea a su estado y devuelve solo el contador: la instancia es la fuente única (NFR1.8) y guardar una segunda referencia abriría la puerta a dos verdades. Registrado como precisión en NFR8.5 y en `frontend-components.md`.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-11T08:42:00Z — la guarda del registro devuelve `null` en vez de lanzar: el arranque no tiene que distinguir «sin sesión» de «sesión rota», a costa de no poder registrar la causa concreta sin mirar el código.
- 2026-11-11T08:43:00Z — el logger recibe dos cadenas y un código en unión de tipos, no un objeto: pierde comodidad (no se puede pasar contexto estructurado) y gana la garantía de que una credencial no acaba en un registro.
- 2026-11-12T05:55:00Z — [unit u2-content-core] La prueba canaria de NFR3.6 escribe de verdad en un almacén y comprueba el otro: cuesta un `createOpinion` en la prueba y gana que un estado compartido (caché de módulo o singleton) haga fallar tres aserciones en vez de pasar inadvertido.
- 2026-11-12T05:55:00Z — [unit u2-content-core] La tarjeta no se envuelve en un `Pressable`: se le pasa `onPress` y su propio `Pressable` raíz —con rol de botón— captura el toque. Se evita un toque anidado sin accesibilidad a costa de que toda navegación desde la tarjeta pase por la prop de C1.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-11T08:44:00Z — confirmar que `expo-splash-screen` viene incluido con el SDK 57 en Expo Go; si no, la alternativa es aceptar el fondo del tema durante la lectura.
- 2026-11-12T05:55:00Z — [unit u2-content-core] Confirmar en el teléfono que el «Reintentar» del aviso de sin conexión no confunde: en U2 no hay puerto de resolución, así que el botón no produce cambio visible; si al recorrerlo se lee como un botón muerto, se replantea en U4 y no en esta unidad.
