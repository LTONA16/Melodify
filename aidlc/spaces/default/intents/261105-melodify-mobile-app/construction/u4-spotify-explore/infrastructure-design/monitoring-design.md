# Monitoring de `u4-spotify-explore`

> U4 no añade plataforma que observar, así que este documento sigue siendo corto a propósito. Lo que
> sí cambia es **qué significa un descuido**: hasta U3 lo único sensible que podía acabar en un log era
> el texto que alguien escribió; a partir de esta unidad hay además una **credencial** en el teléfono y
> **una consulta de búsqueda** que es de la persona. El vocabulario del logger crece con seis códigos y
> la lista de lo que **no** se registra se vuelve la parte que más pesa, porque es la única que puede
> convertir un diagnóstico útil en una fuga.

## Métricas y KPI

Lo que produce señal en esta unidad es la tubería y el recorrido en el teléfono; ninguno de los dos es
telemetría del producto.

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Estado de los jobs `commit-lint` y `code-quality` | GitHub Actions | **Verde obligatorio** para mergear en `develop` y para entregar a `main` | Es la única puerta automática del proyecto (NFR5.8, `team.md` § Way of Working) |
| Cobertura de líneas **por árbol** | `npm test` (`jest --coverage`), job `code-quality` | **≥ 80 %** en los árboles que U4 toca, **incluido el nuevo**: `app/src/**`, `packages/spotify/src/**`, `packages/design-system/src/**`, `packages/app-shell/src/**` y `packages/catalog/src/**` | El paquete nuevo no se compensa con el resto: si `packages/spotify` baja del 80 %, `npm test` se pone rojo y el PR no entra (NFR5.10) |
| Errores de `typecheck` | `npm run typecheck` (`tsc -b`) | **Cero**, con `strict: true` | Tres referencias nuevas de proyecto (raíz, paquete y app) y un paquete con tres entradas: es donde se rompe una versión desalineada (TS-31) |
| Avisos del linter | `npm run lint` | **Cero**, incluidas las tres nuevas prohibiciones de dispositivo y la ya existente entre `catalog` y `spotify` | Es la compuerta que hace comprobable la frontera del token: `expo-secure-store`, `expo-web-browser` y `expo-crypto` solo en `auth/device.ts` (NFR3.18) |
| Violaciones de Conventional Commits | `commit-lint` y el título del PR | **Cero** | El historial de `main` es la historia de lo entregado (`team.md`) |
| Peticiones a Spotify por búsqueda | Recorrido en el teléfono; dobles en las pruebas | **Cero** sin sesión, **una** con sesión, **cero** si la consulta ya está en caché | Es el presupuesto de NFR8.14 y, de paso, el consumo de cuota de una cuenta ajena |
| Registro de la app (`warn`/`error`) | Consola del teléfono, vía Metro | **Sin umbral**: se lee cuando algo se investiga | Diagnóstico manual: catorce códigos, seis nuevos en esta unidad (NFR9.7) |
| Recorrido de la unidad | Persona, en el teléfono | Conectar, buscar canciones, álbumes y artistas, abrir detalle, publicar con la obra puesta, desconectar y volver a conectar; **con y sin Spotify** | Es el criterio de terminado (CT-05, `team.md` § Deployment): el CI no puede ver el navegador del sistema ni el llavero |

## Alertas

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Check rojo en el PR | Cualquiera de los dos jobs falla | Bloqueante para el merge | Autor del PR, en la página del PR |
| `develop` roto | Un push a `develop` deja el job en rojo | Bloqueante para el siguiente PR | Quien tenga el siguiente cambio: se arregla o se revierte antes de seguir |
| Árbol `packages/spotify` por debajo del 80 % | La línea de cobertura del árbol nuevo no alcanza el umbral | Bloqueante para el merge | Autor del PR: se prueban las ramas que faltan, no se baja el umbral (`team.md` § Testing Posture) |
| Fallo al guardar o borrar el token en el teléfono | Aparece un `error` de `SPOTIFY_TOKEN_SAVE_FAILED` o `SPOTIFY_TOKEN_DELETE_FAILED` en la consola | Informativo | Quien esté recorriendo la app, en el momento: no cambia lo que se ve, así que el registro es la única señal |
| Renovación fallida | Aparece un `warn` de `SPOTIFY_REFRESH_FAILED` | Informativo | Quien esté recorriendo la app: la tarjeta pasa a «Tu sesión de Spotify caducó» |

**Ninguna de estas alertas despierta a nadie, y se dice sin rodeos.** No hay servicio en producción ni
personas de guardia; la alerta real es un check rojo y su destinatario es quien abrió el PR. Las dos
filas del teléfono existen porque son los únicos fallos de la unidad que **no cambian lo que se ve**
—un guardado o un borrado que falla deja el estado donde la persona lo esperaba—, y por eso el
diagnóstico es la única forma de enterarse.

## SLI / SLO

**No se definen.** Un SLI mide un servicio en funcionamiento —disponibilidad, latencia, tasa de
error— y aquí no hay servicio que medir: la app se ejecuta cuando alguien la abre y el catálogo remoto
es de Spotify, que no está bajo nuestro control. Lo más cercano a un objetivo de fiabilidad es el
recorrido en el teléfono, que se comprueba a mano y no se mide en porcentaje. Fijar aquí un «99,9 %»
sería copiar una cifra de otro proyecto y prometer algo que la app no puede sostener.

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | No aplica: no hay servicio desplegado y el catálogo es de un tercero |

## Logs y trazas

| Pieza | Qué hace | Dónde se ve | Qué **no** hace |
|---|---|---|---|
| `app/src/bootstrap/logger.ts` (LC-5) | Escribe `(code, message)` en la consola del runtime | Terminal de Metro y consola del teléfono | No envía nada a la red; no agrega; no persiste |
| `SpotifyLogPort` (LC-14) | Deja que el paquete emita sus seis códigos sin importar el logger de la app | Igual, a través del logger inyectado | No tiene valor por defecto: una fábrica sin diagnóstico no compila (TS-38) |
| Códigos | Los **catorce**: cuatro de sesión (`SessionLogCode`, de C3), tres de U2 (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE`), uno de U3 (`SEARCH_PORT_UNAVAILABLE`) y **seis de U4** (`SPOTIFY_REDIRECT_RESOLVED`, `SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED`, `SPOTIFY_REFRESH_FAILED`, `SPOTIFY_SEARCH_FAILED`) | Igual | No se reabre `SessionLogCode` ni se añade un segundo logger (NFR9.1, NFR9.4) |
| Niveles | `warn` para lo que se degrada sin cambiar la pantalla (`SPOTIFY_REFRESH_FAILED`, `SPOTIFY_REDIRECT_RESOLVED`), `error` para el defecto interno (`SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED`, `SPOTIFY_SEARCH_FAILED`) | Igual | No hay `info`/`debug` de producto |
| Quién emite | `auth` emite los cuatro de token; `catalog` emite `SPOTIFY_SEARCH_FAILED`; `bootstrap/ports.ts` emite `SPOTIFY_REDIRECT_RESOLVED`, porque es el único sitio que tiene el valor | Igual | Ninguna pantalla emite un código de Spotify |
| Contenido del mensaje | Texto fijo y, como mucho, el identificador de la operación. El redirect resuelto es el único valor que se registra a propósito | Igual | **Nunca** el token, el `refreshToken`, el verificador, el `state`, el `code`, una URL de retorno con su cadena de consulta, la consulta de búsqueda ni el texto de una opinión (NFR3.19, NFR4.6) |
| Trazas distribuidas | No existen | — | No hay dos servicios propios que correlacionar; Spotify no es nuestro |

**La firma cerrada a dos cadenas (`code`, `message`) es lo que sostiene todo lo anterior**, y en U4
vale por partida doble: no hay sobrecarga que acepte un objeto, así que nadie puede «pasar el contexto
por si acaso» y arrastrar el token o la consulta. `SpotifyLogPort` tiene exactamente la misma forma
(NFR9.4, TS-38).

**Qué no llega al logger, y es la lista que importa en esta unidad** (NFR3.19, NFR9.7):

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| Arranque: redirect resuelto | No | **Sí**, `warn`, con el valor exacto: es el dato que hay que pegar en el panel |
| Lectura del token fallida | Nada: se arranca sin sesión | **Sí**, `error`: la credencial **no** se borra |
| Guardado del token fallido | «No pudimos conectar con Spotify.» + «Reintentar» | **Sí**, `error` |
| Borrado del token fallido | «Spotify desconectado» (el estado pasa a `disconnected` igualmente) | **Sí**, `error` |
| Renovación fallida | «Tu sesión de Spotify caducó. Vuelve a conectar.» | **Sí**, `warn` |
| El puerto de búsqueda lanza en vez de devolver un `failure` | El estado `error` de Explorar | **Sí**, `error` |
| `401` de Spotify | Capa «token caído» con «Volver a conectar» | **No**: es un estado previsto |
| `429`, tiempo agotado, `network`, `5xx` | El estado `error` con «Reintentar» | **No**: son resultados previstos del contrato |
| Búsqueda sin resultados, sin sesión, sin red o sin client ID | `empty`, tarjeta o banner | **No** |
| Una portada que no carga | El bloque con la inicial, sin aviso | **No**: es una degradación prevista |

**Rotación, retención y agregación: ninguna.** El registro vive en la memoria del proceso que pinta la
consola y desaparece al cerrar la app; eso basta para diagnosticar un fallo que se acaba de reproducir
y es, además, lo que evita que una credencial o una consulta terminen en un fichero. **El redirect se
registra por `warn`, y `warn` solo existe en desarrollo**: en un binario de release no queda ni ese
rastro.

## Paneles

No hay paneles. El panel útil hoy es la pestaña **Actions** del repositorio, que ya existe y no se
configura aquí: un vistazo por PR dice si el cambio entra o no. Nada de esta unidad se puede ver en un
panel —ni la conexión, ni la búsqueda, ni sus fallos—, y añadir uno exigiría antes un servicio que
reciba los datos, que es justo lo que `project.md` § Forbidden y NFR4.10 prohíben.

## Si el proyecto creciera

No se deja preparado ningún punto de enganche, porque un punto de enganche sin uso es deuda con
interés: cuando exista una razón —publicación en tienda, backend, usuarios reales—, esta etapa se
reabre y se decide con datos. Lo que sí queda escrito es la condición, y U4 la vuelve más estricta que
U3: un servicio de errores o de analítica **no** puede llevarse el token ni el `refreshToken` (NFR3.19
es absoluto), ni la consulta de búsqueda, ni el contenido de las opiniones y comentarios (NFR4.6,
NFR4.8), ni el texto del borrador que nunca llegó a publicarse (NFR3.16).

## Assumptions & Open Questions

- `[assumption]` La consola de Metro sigue siendo accesible durante el recorrido en el teléfono; si no
  lo fuera, el diagnóstico se haría con la app en modo desarrollo y `adb logcat`, sin cambiar el
  diseño.
- `[assumption]` El `warn` de `SPOTIFY_REDIRECT_RESOLVED` está disponible en el arranque de Metro
  antes de la primera búsqueda, que es cuando hace falta para registrar el valor en el panel.
- **Pregunta abierta heredada del diseño de NFR (R-07)**: durante la ventana neutra del arranque no se
  pinta chip, ni tarjeta, ni buscador. No es un asunto de monitoring —no se registra nada en esa
  ventana—, pero sí de qué se ve antes de la primera emisión, y se nombra para que no se confunda con
  un estado que el logger debería estar contando.
- **Pregunta abierta para U6**: si el recorrido revela que `SPOTIFY_SEARCH_FAILED` aparece en
  situaciones que el contrato considera previstas, se corrige el mapeo antes que el vocabulario: un
  código que se emite de más es ruido, y uno que falta es un fallo mudo.

## Sources

- `security-design.md` § NFR9.7, § NFR3.19 y § NFR4.6 / NFR4.8 — el catálogo exacto de eventos, el
  emisor de cada código, y qué no puede llevarse el registro.
- `security-design.md` § NFR9.1 / NFR9.4 / NFR9.6 — un solo logger, la firma de dos cadenas y el
  vocabulario heredado que U4 no toca.
- `performance-design.md` § NFR8.12, § NFR8.14 y § Presupuesto — sin reintento automático, una
  petición por consulta y por obra, y por qué los fallos previstos no se registran.
- `logical-components.md` — LC-5 (diagnóstico), LC-12 a LC-14 (las áreas con fallo propio) y
  LC-15 (la pantalla que los pinta).
- `nfr-requirements/tech-stack-decisions.md` § TS-37 y TS-38 — dobles de logger y el puerto
  obligatorio que impide una fábrica sin diagnóstico.
- `jest.config.js` — los ocho umbrales a 80 que el paso de pruebas evalúa (el octavo es el nuevo).
- `inception/contract-design/contract-summary.md` — C7 1.0.0 y su enmienda aditiva `SpotifyLogPort`.
- `team.md` § Deployment y § Testing Posture — «desplegar» es abrir la app en el teléfono, y el
  recorrido real no se prueba automáticamente.
