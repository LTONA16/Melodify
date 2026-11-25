# Monitoring de `u5-activity`

> U5 no añade plataforma que observar, y este documento sigue siendo corto a propósito. Lo que cambia
> es **qué significa un fallo mudo**: hasta U4 los códigos del logger describían cosas que ocurrían
> dentro de un paquete y que la pantalla no dejaba ver; en U5 el único fallo posible —no poder derivar
> la actividad— **sí se ve en pantalla**, con su mensaje y su «Reintentar». El código que se registra
> no existe para informar a la persona, sino para que quien depure sepa que el estado `error` que
> alguien vio era una lectura de C4 y no una pantalla vacía mal pintada.

## Métricas y KPI

Lo que produce señal en esta unidad es la tubería y el recorrido en el teléfono; ninguno de los dos es
telemetría del producto.

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Estado de los jobs `commit-lint` y `code-quality` | GitHub Actions | **Verde obligatorio** para mergear en `develop` y para entregar a `main` | Es la única puerta automática del proyecto (NFR5.8, `team.md` § Way of Working) |
| Cobertura de líneas **por árbol** | `npm test` (`jest --coverage`), job `code-quality` | **≥ 80 %** en los árboles que U5 toca, **incluido el nuevo**: `app/src/**`, `packages/activity/src/**`, `packages/design-system/src/**` y `packages/app-shell/src/**` | El paquete nuevo no se compensa con el resto: si `packages/activity` baja del 80 %, `npm test` se pone rojo (NFR5.12) |
| Errores de `typecheck` | `npm run typecheck` (`tsc -b`) | **Cero**, con `strict: true` | Dos referencias nuevas y un paquete con dos `import type`: es donde se rompe una versión desalineada de C3 o C4 (TS-39) |
| Avisos del linter | `npm run lint` | **Cero**, incluido el **bloque nuevo** del paquete: catálogo, Spotify, `react`, `react-native` y `fetch` | Es la compuerta que convierte «la Actividad no pide red» en una regla comprobable en CI (NFR3.21, TS-39) |
| Violaciones de Conventional Commits | `commit-lint` y el título del PR | **Cero** | El historial de `main` es la historia de lo entregado (`team.md`) |
| Llamadas a C4 por derivación | Recorrido en el teléfono; dobles en las pruebas | **Cero** antes de la primera observación; **cuatro** con la siembra; **una** por cada emisión posterior | Es el presupuesto de NFR8.17 y la prueba de que la derivación no lee una lista por opinión |
| Peticiones a Spotify desde la Actividad | Dobles y revisión de imports de `packages/activity/src/**` | **Cero, siempre**: el paquete no tiene red, no importa C7 y `fetch` le está prohibido | Una petición aquí reabriría una superficie que BR21.6 cierra, y la Actividad no la necesita (NFR8.14) |
| Lecturas del almacén seguro al abrir Actividad | Pruebas con dobles del almacén | **Cero**: la pantalla no toca el llavero | Una lectura de más significaría que la Actividad empezó a persistir algo (NFR4.11, NFR3.18) |
| Registro de la app (`warn`/`error`) | Consola del teléfono, vía Metro | **Sin umbral**: se lee cuando algo se investiga | Diagnóstico manual: **quince** códigos, uno nuevo en esta unidad (NFR9.8) |
| Recorrido de la unidad | Persona, en el teléfono | Abrir Actividad con y sin Spotify, **con la red del teléfono desactivada** (el banner de sin conexión y las filas intactas), tocar una fila, volver con la posición conservada, publicar desde Crear y ver la fila nueva arriba, y comprobar el estado vacío con el almacén limpio | Es el criterio de terminado (CT-05, `team.md` § Deployment): el CI no puede ver el desplazamiento ni la sensación del esqueleto |

## Alertas

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Check rojo en el PR | Cualquiera de los dos jobs falla | Bloqueante para el merge | Autor del PR, en la página del PR |
| `develop` roto | Un push a `develop` deja el job en rojo | Bloqueante para el siguiente PR | Quien tenga el siguiente cambio: se arregla o se revierte antes de seguir |
| Árbol `packages/activity` por debajo del 80 % | La línea de cobertura del árbol nuevo no alcanza el umbral | Bloqueante para el merge | Autor del PR: se prueban las ramas que faltan, no se baja el umbral (`team.md` § Testing Posture) |
| Un `import` prohibido en el paquete | `npm run lint` marca `@melodify/catalog`, `@melodify/spotify`, `react`, `react-native` o `fetch` dentro de `packages/activity/src/**` | Bloqueante para el merge | Autor del PR: el import no se exime, se elimina (NFR3.21) |
| La Actividad no deriva | Aparece un `error` de `ACTIVITY_LOAD_FAILED` en la consola | Informativo | Quien esté recorriendo la app, en el momento: la pantalla ya muestra el mensaje y el botón, así que el registro aporta la causa, no la existencia del fallo |

**Ninguna de estas alertas despierta a nadie, y se dice sin rodeos.** No hay servicio en producción ni
personas de guardia; la alerta real es un check rojo y su destinatario es quien abrió el PR. La fila
del teléfono existe porque, aunque el fallo **sí** se ve en pantalla, la pantalla no dice qué se rompió
—solo que la actividad no cargó—, y esa diferencia es justo lo que el registro resuelve.

## SLI / SLO

**No se definen.** Un SLI mide un servicio en funcionamiento —disponibilidad, latencia, tasa de
error— y aquí no hay servicio que medir: la app se ejecuta cuando alguien la abre y la actividad se
deriva de memoria en el mismo proceso. Lo más cercano a un objetivo de fiabilidad es el recorrido en el
teléfono, que se comprueba a mano y no se mide en porcentaje. Fijar aquí un «99,9 %» sería copiar una
cifra de otro proyecto y prometer algo que la app no puede sostener.

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | No aplica: no hay servicio desplegado ni dependencia remota en esta pantalla |

## Logs y trazas

| Pieza | Qué hace | Dónde se ve | Qué **no** hace |
|---|---|---|---|
| `app/src/bootstrap/logger.ts` (LC-5) | Escribe `(code, message)` en la consola del runtime | Terminal de Metro y consola del teléfono | No envía nada a la red; no agrega; no persiste |
| `app/src/state/useActividad.ts` (LC-18) | Es el **único** emisor del código nuevo: ve `status: 'error'` y traduce | Igual, a través del logger del proyecto | No registra en `loading`, `ready` ni `empty` |
| Códigos | Los **quince**: cuatro de sesión (`SessionLogCode`, de C3), tres de U2 (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE`), uno de U3 (`SEARCH_PORT_UNAVAILABLE`), seis de U4 (Spotify) y **uno de U5** (`ACTIVITY_LOAD_FAILED`) | Igual | No se reabre `SessionLogCode` ni `SpotifyLogCode`; la unión solo crece (NFR9.8) |
| Niveles | `error` para `ACTIVITY_LOAD_FAILED`: es un defecto interno, no una degradación prevista | Igual | No hay `info`/`debug` de producto, y `warn` no se usa en esta unidad |
| Quién emite | Solo `useActividad`, **en la app**. `@melodify/activity` **no tiene logger** y no lo recibe por constructor | Igual | Ninguna pantalla emite un código de C8, y el paquete no emite ninguno |
| Contenido del mensaje | Frase fija: `"No se pudo derivar la actividad"`, sin interpolar el título, el `eventId`, el `ContentErrorCode` ni el texto de la excepción | Igual | **Nunca** el contenido de una opinión, un handle, un `authorId` ni el `mensaje` del contrato (NFR4.6, NFR4.11) |
| Trazas distribuidas | No existen | — | No hay dos servicios propios que correlacionar, y esta pantalla ni siquiera habla con uno |

**Por qué U5 no tiene un puerto de diagnóstico, a diferencia de U4.** `SpotifyLogPort` existe porque un
fallo de guardado o de borrado del token **no cambia lo que se ve**: el registro era la única señal. En
U5 ocurre lo contrario: el fallo cruza el contrato como `status: 'error'`, la pantalla lo pinta y la
persona puede reintentar. Un puerto por un solo código sería una dependencia sin comprador; el hook ya
tiene el logger de la composición (LC-18, NFR9.8).

**La firma cerrada a dos cadenas (`code`, `message`) sigue siendo lo que sostiene lo anterior**: no hay
sobrecarga que acepte un objeto, así que nadie puede «pasar el contexto por si acaso» y arrastrar el
contenido de una opinión o un handle al registro (NFR9.1).

**Qué no llega al logger, y es la lista que importa en esta unidad** (NFR4.6, NFR4.11, NFR9.8):

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| La vista entra en `error` | «No pudimos cargar tu actividad.» + «Reintentar» | **Sí**, `error`, `ACTIVITY_LOAD_FAILED` |
| El reintento vuelve a fallar | Lo mismo | **Sí**, un código por intento |
| Un `listener` de `subscribeActivity` lanza | Nada: se aísla y se sigue notificando a los demás | **No**: es un defecto del consumidor y lo delata la prueba |
| La lista se recalcula tras publicar | Nada; la fila nueva aparece arriba | **No**: es el camino feliz |
| La lista queda vacía | «Todavía no hay actividad.» + «Crear opinión» | **No** |
| Sin conexión | El banner sobre la lista, con las filas intactas | **No**: es un estado previsto (BR23.4) |
| Sesión `signedOut` | `empty` | **No** |
| Se toca una fila | Nada visible hasta el detalle | **No** |
| Una lectura de C4 devuelve `ok: false` | El estado `error` | **Sí**, a través del hook: el motivo concreto **no** se registra |

**Rotación, retención y agregación: ninguna.** El registro vive en la memoria del proceso que pinta la
consola y desaparece al cerrar la app; eso basta para diagnosticar un fallo que se acaba de reproducir
y es, además, lo que evita que el contenido de una opinión o un handle terminen en un fichero.

## Paneles

No hay paneles. El panel útil hoy es la pestaña **Actions** del repositorio, que ya existe y no se
configura aquí: un vistazo por PR dice si el cambio entra o no. Nada de esta unidad se puede ver en un
panel —ni la derivación, ni su coste en lecturas, ni su fallo—, y añadir uno exigiría antes un servicio
que reciba los datos, que es justo lo que `project.md` § Forbidden y NFR4.11 descartan.

## Si el proyecto creciera

No se deja preparado ningún punto de enganche, porque un punto de enganche sin uso es deuda con
interés: cuando exista una razón —publicación en tienda, backend, usuarios reales—, esta etapa se
reabre y se decide con datos. Lo que sí queda escrito es la condición: un servicio de errores o de
analítica **no** puede llevarse el contenido de las opiniones, ni los handles de quien interactuó, ni el
`eventId`, ni el texto de los comentarios (NFR4.6, NFR4.11 y NFR3.22 son absolutos), ni el token de
Spotify, que U5 ni siquiera nombra (NFR3.18).

## Assumptions & Open Questions

- `[assumption]` La consola de Metro sigue siendo accesible durante el recorrido en el teléfono; si no
  lo fuera, el diagnóstico se haría con la app en modo desarrollo y `adb logcat`, sin cambiar el diseño.
- `[assumption]` El mensaje fijo es suficiente para diagnosticar: dice qué falló y de qué unidad, no
  qué evento. Si hiciera falta distinguir la causa, el contrato tendría que publicar el motivo y
  entonces sí habría un código por causa (R-06 del diseño de NFR).
- **Pregunta abierta heredada del diseño de NFR (R-07 de U4)**: durante la ventana neutra del arranque
  no se pinta chip, ni tarjeta, ni buscador. No es un asunto de monitoring —no se registra nada en esa
  ventana—, pero sí de qué se ve antes de la primera emisión de C8.
- **Pregunta abierta para U6**: si el recorrido revela que `ACTIVITY_LOAD_FAILED` aparece en
  situaciones que el contrato considera previstas, se corrige el mapeo antes que el vocabulario: un
  código que se emite de más es ruido, y uno que falta es un fallo mudo.

## Sources

- `security-design.md` § NFR9.8 — el catálogo exacto del código nuevo, su emisor, su nivel, el contenido
  permitido del mensaje y por qué esta unidad no recibe un puerto de diagnóstico.
- `security-design.md` § NFR9.1 / NFR9.6 y § NFR4.6 / NFR4.11 — un solo logger, la firma de dos cadenas,
  el vocabulario heredado y lo que no puede llevarse el registro.
- `performance-design.md` § NFR8.17 y § NFR1.17 — cuatro lecturas, cero trabajo al arrancar, y el
  `listener` que lanza y se aísla.
- `logical-components.md` — LC-5 (diagnóstico), LC-17 (el paquete que no tiene logger) y LC-18 (el hook
  que sí registra).
- `infrastructure-specification.md` § Servicios de infraestructura y § Qué queda escrito en el teléfono.
- `nfr-requirements/tech-stack-decisions.md` § TS-43 — por qué el paquete no recibe logger ni almacén.
- `jest.config.js` — los nueve umbrales a 80 que el paso de pruebas evalúa (el noveno es el nuevo).
- `team.md` § Deployment y § Testing Posture — «desplegar» es abrir la app en el teléfono, y el
  recorrido real no se prueba automáticamente.
