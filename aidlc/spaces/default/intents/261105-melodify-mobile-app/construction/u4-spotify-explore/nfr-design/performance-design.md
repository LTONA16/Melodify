# Diseño de rendimiento, usabilidad y fiabilidad — U4 `u4-spotify-explore`

> **Provenance**: deriva de `nfr-requirements/performance-requirements.md` (NFR8.12–8.15, NFR2.10–2.12, NFR1.12–1.15 y los heredados NFR8.11, NFR8.1, NFR2.9, NFR2.5, NFR2.8, NFR1.11), de `nfr-requirements/security-requirements.md` (NFR9.7, para los fallos que se registran y los que no), de `nfr-requirements/tech-stack-decisions.md` (TS-31 a TS-38, más los heredados TS-01, TS-05, TS-13, TS-18, TS-20, TS-21, TS-29), de `functional-design/functional-spec.md` (máquinas de conexión y de Explorar, F21–F27, § Textos exactos, § Assumptions), de `functional-design/rules.md` (BR16.3–BR16.10, BR17.1–BR17.10, BR18.1–BR18.6, BR19.1–BR19.5, BR20.1–BR20.2), de `functional-design/frontend-components.md` (§ Paquetes, § `app/src/screens/explorar/`, § `app/src/state/`, § `app/src/bootstrap/`, § Flujos de interacción) y de `inception/contract-design/contract-summary.md` (C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0, C9, C10, § Fallos, tiempos y reintentos).
> Fecha: 2026-11-17. Etapa: NFR Design · Unidad: `u4-spotify-explore` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Qué resuelve este diseño

Los requisitos dicen **qué** hay que cumplir; este archivo dice **cómo**, con las decisiones que Code Generation no debe tener que tomar por su cuenta:

1. **Que la primera espera de red de la app tenga forma**: un solo cliente, un tiempo límite, ningún reintento escondido y un esqueleto en lugar de un hueco (NFR8.12, NFR8.14).
2. **Que abrir la app no dependa de Spotify**: el arranque no espera al token, `connecting` no se pinta al arrancar y el primer fotograma no espera a una portada (NFR8.13, NFR8.1).
3. **Que la conexión no se quede en un estado sin salida**: seis estados, cada uno con su salida, y `connecting` que termina por construcción y no por temporizador (NFR1.12).
4. **Que una sesión caída no borre lo que la persona está leyendo**: `tokenCaido` como capa, no como estado que sustituye la lista (NFR1.13).
5. **Que ningún fallo asíncrono se escape a una pantalla** y que la app siga siendo recorrible sin client ID, sin sesión y sin red (NFR1.14, NFR1.15).
6. **Que cada acción siga costando dos toques o menos** y que cada estado se diga con palabras y ofrezca su salida (NFR2.10–NFR2.12).

**Lo que no se diseña aquí**: la escalabilidad (la unidad es de tipo `ui` y `requirements.md` no fija ningún objetivo: una persona, sin servidor, RC-02), y la fiabilidad y la observabilidad de servicio, filtradas por `produces_kinds`; sus objetivos viven en este archivo (§ NFR1) y en `security-design.md` § NFR9. El detalle de por qué su ausencia es una decisión está en `logical-components.md` § Alcance.

## NFR8.12 — Una sola puerta de red, diez segundos y ningún reintento escondido

### El cliente

Todo lo que sale hacia Spotify pasa por una única función del paquete, `requestJson`, en `packages/spotify/src/catalog/`. No hay una segunda copia en `auth` para el intercambio: el intercambio usa la misma función con `auth: false`, porque la llamada a `/api/token` va sin `Bearer` (TS-34, NFR3.20).

```text
// Ilustrativo, no implementación. packages/spotify/src/catalog/http.ts
async function requestJson(url, init, deps) {
  const controller = new AbortController();          // uno por petición
  const handle = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await deps.fetch(url, { ...init, signal: controller.signal });
    return mapResponse(response);                     // ok | unauthorized | rateLimited | error
  } catch (error) {
    return controller.signal.aborted ? { kind: "timeout" } : { kind: "network" };
  } finally {
    clearTimeout(handle);                             // el temporizador no sobrevive a la petición
  }
}
```

Seis decisiones:

- **El `AbortController` es uno por petición y el temporizador se limpia en `finally`.** Un temporizador por cliente —o peor, uno de módulo— cancelaría la petición siguiente con el reloj de la anterior; y un `setTimeout` sin limpiar deja el proceso de Jest vivo y grita en una prueba que corre en modo abierto.
- **El aborto se distingue de un fallo de red.** Después del `catch` se mira `controller.signal.aborted`: eso separa `timeout` de `network`. La distinción importa porque un `timeout` y un `network` se pintan igual pero no se diagnostican igual (NFR9.7), y porque sin ella cualquier `TypeError` del runtime se leería como «sin conexión», que es una promesa falsa sobre la red de la persona.
- **Sin reintento.** Ni `retry` en el cliente, ni un bucle, ni un `catch` que vuelve a llamar. Un `429`, un `5xx` y un tiempo agotado se devuelven como `failure` y quien decide es la persona con «Reintentar» (BR17.9, OQ2). Reintentar por detrás multiplicaría peticiones contra un límite ajeno y taparía el fallo que la pantalla debe enseñar.
- **El tiempo límite es del cliente, no de la pantalla.** Ninguna vista ni ningún hook abre un temporizador de espera; el único temporizador propio de la unidad sigue siendo el `debounce` de 400 ms (TS-29). Si la pantalla pusiera su propio reloj, habría dos tiempos límite que se pueden contradecir y un estado `error` que podría llegar antes o después del aborto real.
- **`response.ok` no basta.** Un `401` no es un fallo de la petición: se mapea a `unauthorized` y `catalog` llama a `auth.markInvalid()` en el mismo gesto (BR18.6, NFR3.20). Un `200` con un cuerpo que no es JSON es `error`, no `ok`: la respuesta se desconfía (NFR3.20).
- **La espera visible no es un indicador, son cinco filas.** `ExplorarView` pinta cinco `Skeleton` con la altura de `WorkResultRow` y el mismo espaciado, de modo que la lista no salta al llegar los resultados (BR17.7). No hay `ActivityIndicator` de pantalla completa: un giro infinito no dice cuándo termina y tapa el campo, que sigue siendo editable mientras se busca.

### Qué se descarta y qué se aborta

| Situación | Qué ocurre | Por qué |
|---|---|---|
| La persona cambia la consulta mientras hay una petición en vuelo | La petición termina y su resultado se tira al llegar (BR17.8) | El puerto `SpotifySearchPort.search(query)` no tiene señal de cancelación: ampliarlo sería un cambio de C5 y de C7 |
| La persona sale de Explorar con una petición en vuelo | La petición termina y el resultado se tira: el efecto se limpió | Misma razón; el descarte por desmontaje lo cierra el hook |
| La petición supera los 10 s | Se aborta y se resuelve `timeout` | Es el único aborto de socket que existe |
| Llega un `429` | Se resuelve `rateLimited` y la pantalla ofrece «Reintentar» | Sin reintento automático (OQ2) |

**La consecuencia se dice en voz alta**: cambiar de consulta rápido puede dejar una petición por consulta en vuelo. No se añade una cola ni un límite de concurrencia porque el disparo ya está a 400 ms de la última pulsación (BR17.1) y el tiempo límite de 10 s garantiza que ninguna se quede colgada. Añadir un `AbortSignal` al puerto ahorraría cuota a costa de una revisión de C5 que el contrato no declara: se deja como pregunta abierta y no como decisión de esta etapa.

## NFR8.13 — El arranque no espera al token, al navegador ni a una portada

### La lectura del token es asíncrona, y su resultado es lo primero que se publica

`createSpotifyAuth` resuelve dos cosas antes de publicar ningún estado: si hay client ID —dato de construcción, síncrono— y qué hay en el almacén —lectura asíncrona—. **Publica una sola vez, ya resuelto**, y ninguna pantalla pinta un estado que no sea ese.

```text
// Ilustrativo, no implementación. packages/spotify/src/auth/spotify-auth.ts
let status: SpotifyConnectionStatus =
  clientId === null ? "notConfigured" : "disconnected";   // valor síncrono, NO publicado
let hydrated = false;                                     // bandera interna, no un estado

async function hydrate(): Promise<void> {
  if (clientId === null) { hydrated = true; emit(); return; }  // sin client ID no hay nada que leer
  let token = null;
  try {
    token = await readStoredToken();
  } catch {
    status = "disconnected";                        // el fallo NO borra la credencial
    log("SPOTIFY_TOKEN_READ_FAILED");
    hydrated = true; emit(); return;
  }
  if (token === null) { status = "disconnected"; hydrated = true; emit(); return; }
  if (isValid(token)) { status = "connected"; hydrated = true; emit(); return; }
  try {
    const renewed = await renew(token.refreshToken);       // una sola renovación, silenciosa
    await secureStore.set(TOKEN_KEY, serialize(renewed));  // el token nuevo se persiste
    status = "connected";
  } catch {
    await deleteToken().catch(() => log("SPOTIFY_TOKEN_DELETE_FAILED"));
    status = "invalidToken";                              // solo aquí se borra
    log("SPOTIFY_REFRESH_FAILED");
  } finally {
    hydrated = true; emit();
  }
}
```

- **Sin client ID se arranca en `notConfigured`, y no se toca el almacén.** El client ID es un dato de construcción: cuando falta, el estado se decide de forma síncrona y la lectura del almacén ni se intenta (`functional-spec.md` § Máquina de estados de la conexión, BR16.8). Un token guardado de una instalación anterior **no se borra**: queda ahí para cuando el client ID vuelva tras reiniciar.
- **Un token caducado con `refreshToken` se renueva en el arranque, no se descarta.** Es lo que exige `contract-summary.md` § C7 `x-token-lifecycle.persistence` («si caducó, se renueva antes de la primera búsqueda») y lo que sostiene la persistencia de la conexión entre reinicios (`project.md` § Corrections). La renovación es una sola, silenciosa y no publica `connecting` (BR16.6).
- **`invalidToken` y el borrado quedan solo para la renovación fallida.** Si el `refreshToken` ya no vale, la credencial no sirve para nada: se borra la clave entera y se pasa a `invalidToken`, cuya salida es «Volver a conectar». Un fallo de *lectura* no borra nada, porque un llavero que falla una vez no invalida la credencial (ver `security-design.md` § NFR4.9, `x-token-storage.cleared_on`).
- **`hydrated` no es un séptimo estado ni se publica.** Es una bandera interna de la instancia. La primera emisión de la instancia es el estado resuelto y es la única que una pantalla puede pintar.
- **Mientras no hay emisión, la pantalla pinta un marcador neutro, nunca «Sin conectar».** `useSpotifyConnection` —hook de `app/src/state/`, no del paquete— expone `status: SpotifyStatus | null`, con `null` mientras no ha llegado la primera emisión; las pantallas, con `null`, no pintan chip de conexión, ni tarjeta de conexión, ni buscador: pintan el esqueleto de su bloque de conexión. Así la app no afirma «Sin conectar» durante el arranque y **la máquina no gana ninguna arista**: el arco inicial `[*] → <estado resuelto>` se completa al publicar, y `disconnected` nunca llega a publicarse antes de saberse.
- **La lectura que falla no rompe el arranque**: se registra `SPOTIFY_TOKEN_READ_FAILED` y se publica `disconnected` (NFR1.15, NFR9.7).
- **`connect()` durante la hidratación espera a que resuelva.** Si la persona toca «Conectar» antes de la primera emisión, `connect()` espera a `hydrated` y, si la lectura dejó la sesión en `connected`, no abre el navegador: ya hay sesión. Sin esa espera, dos verdades sobre el mismo token podrían pisarse.
- **`connecting` no se pinta al arrancar.** Renovar es silencioso (BR16.6): la renovación por los 60 s ocurre dentro de `getAccessToken()` y el estado sigue `connected`. Ninguna pantalla ve un `connecting` que la persona no haya provocado.

### Las portadas no bloquean el primer pintado

- `InicioScreen` y el detalle pintan sus tarjetas con el bloque de la inicial y piden `coverFor(workId)` por obra. Cuando la portada llega, la tarjeta repinta **sin volver a montarse** (BR18.4): la clave del elemento es el `workId`, no el `coverUrl`, y el `CoverArt` recibe la nueva fuente.
- Ni la cabecera, ni el recuento de opiniones, ni la lista esperan a Spotify. Sin sesión, `coverFor` devuelve `initialBlock` en el acto (BR18.1, BR19.5).
- Al pasar a `connected` o al volver la red, las portadas cambian en su sitio: se conserva el desplazamiento y el contenido (BR18.4, BR18.6).

### Salir al navegador no congela la app

Mientras `connecting`, el botón de la tarjeta y el chip quedan deshabilitados con «Conectando…» y el resto de la app responde (BR16.3, BR19.2). El navegador es del sistema: Expo Go sigue vivo y las demás pestañas se pueden recorrer. La espera no se compensa con ningún temporizador de interfaz (ver NFR1.12).

## NFR8.14 — Una petición por consulta, una por obra y ninguna sin sesión

| Regla | Dónde se materializa | Qué evita |
|---|---|---|
| Consulta ya buscada: cero peticiones y cero esqueletos | Caché de C5 por consulta normalizada; el hook pasa a `results` sin llamar al puerto (BR17.2, BR17.7) | Repetir una búsqueda coste |
| Portada: una petición por obra, compartiendo la promesa en vuelo | `coverFor(workId)` memoiza y guarda la promesa pendiente en un `Map` por `workId` (C5) | Dos tarjetas de la misma obra pidiendo dos veces |
| Obra que ya trae `coverUrl`: ninguna petición | C5 devuelve `url` sin tocar `SpotifyResolvePort` (BR18.1) | Resolver lo que ya se sabe |
| Sin sesión o sin red: ninguna petición | C5 responde `offline`/`initialBlock` sin llamar al puerto (BR19.5); y `catalog` no llama a `fetch` si `getAccessToken()` devuelve `null` | Una petición con un token que no existe |
| Sin sondeo ni refresco en segundo plano | No hay ningún temporizador que repita una petición: ni en el paquete, ni en el hook, ni en la pantalla | Peticiones que la persona no puede explicar |
| Sin paginación | `limit=10` por clase y ninguna segunda petición al llegar al final (C10, OQ2) | Scroll infinito y presupuesto sin techo |

**La segunda fila es la que se prueba de verdad.** La memoización sola no basta: dos tarjetas montadas en el mismo tick piden `coverFor` antes de que la primera respuesta llegue, así que lo que evita la segunda petición es **compartir la promesa en vuelo**, no leer el resultado ya resuelto. La prueba pide la misma obra dos veces sin resolver la primera y comprueba una sola llamada a `resolve`.

**La cuarta fila es defensa en profundidad, no la primera puerta.** Quien decide no llamar es C5; `catalog` añade la comprobación porque una llamada a `fetch` sin token gastaría cuota y devolvería `401`, y porque así la regla se puede afirmar con puertos reales y sin red.

**Enmienda del 2026-11-24 — el presupuesto baja a 30 filas.** Spotify acotó `limit` de `/search` a 0–10 por tipo; el `20` de este diseño devolvía `400` y la búsqueda no llegaba a ejecutarse. El presupuesto de la tabla y de NFR8.15 queda en **10 por clase** —hasta treinta filas: diez canciones, diez álbumes y diez artistas—, sin paginación y con la misma petición única por consulta. La lista sigue siendo `FlatList`; solo cambia cuántas filas puede llegar a haber.

## NFR8.15, NFR8.11 y NFR8.1 — Lo que sigue sin número

- **Escribir una consulta, desplazar 30 resultados, abrir el detalle, publicar, desconectar y ver las portadas caer a bloque** se juzgan con NFR8 tal como está aprobado: no se percibe una congelación al recorrerlo en el teléfono. No se fija mediana, ni percentil, ni umbral en milisegundos, y ninguna prueba automática falla por tiempo (NFR8.15).
- **Los únicos números de la unidad son los ya aprobados o los del contrato**, y ninguno se negocia aquí: 400 ms de espera tras la última pulsación, 2 caracteres de umbral, 10 s de tiempo límite, 60 s de margen de renovación, 10 resultados por clase, 5 esqueletos, 2 s de arranque en frío y 4 s de snackbar.
- **La lista de resultados usa `FlatList`** (TS-22, heredado de U2): 30 filas no se montan de golpe. El desplazamiento conserva su posición al volver del detalle porque la lista no se desmonta: el detalle se apila encima (BR20.1).
- **El arranque en frío se mantiene en ≤ 2 s (NFR8.1)**: U4 añade la lectura del almacén seguro, que es la misma que C3 ya hacía, y ninguna lectura bloqueante nueva. Si la lectura del almacén tardara de forma perceptible en el teléfono, se documenta y **se mantiene asíncrona**: nunca se convierte en bloqueante para cumplir el arranque.

## NFR2.10 — Las acciones de esta unidad, en dos toques o menos

El diseño no añade ningún paso intermedio: los diez caminos de la tabla de requisitos se recorren con los toques que ya fija el flujo funcional. Las tres decisiones de diseño son:

- **El campo de Explorar tiene el foco al entrar** (BR19.1, invariante 1), para que el primer carácter no cueste un toque previo. Es la única acción que no está a dos toques, porque buscar es escribir.
- **La tarjeta de conexión y el buscador no se pintan a la vez.** Sin sesión se ve la tarjeta con su acción; con sesión se ve el campo con el foco. La persona nunca tiene que descartar una pieza para llegar a la otra (BR19.1).
- **«Opinar sobre esta obra» llega con la obra puesta.** El detalle pasa `openCreate({ workId, data })` con la `WorkView` que ya usó para pintar, así que Crear abre en modo publicar con la fila fija y solo faltan texto y valoración (F23 pasos 5–6, BR20.4). Sin ese dato, Crear tendría que resolver la obra otra vez y el camino pasaría de dos toques a tres con una espera.

## NFR2.11 — La conexión y cada rama se dicen con palabras

| Dónde | Cómo se dice el estado | Lo que **no** se usa |
|---|---|---|
| Chip de Inicio | «Conectado» o «Conectar» en texto (BR19.4) | Solo un punto de color |
| Tarjeta de Perfil | Título, explicación y nombre de la acción: «Sin conectar» / «Conecta para ver portadas…» / «Conectar con Spotify» | Un icono de advertencia |
| Tarjeta de Explorar | Los mismos seis textos, con «Conectando…» acompañado de indicador | Un giro sin texto |
| Aviso de token caído | Una frase con su botón, sobre la lista conservada (BR18.6) | Un icono que haya que interpretar |
| Resultado de artista | «Artista» bajo el nombre (BR17.3) | Un color que distinga la clase |
| Fila de obra | «Canción» / «Álbum» en `type.caption`, presente solo en obras de Spotify | Un icono distinto por clase |

- **Cada estado nombra su salida**: «Conectar con Spotify», «Desconectar», «Reintentar», «Volver a conectar». No hay un estado que solo informe (BR16.7, BR18.6).
- **Los textos son los exactos de `functional-spec.md` § Textos exactos**, todos en español, ninguno con un código HTTP ni una palabra en inglés (FR11.5, `project.md` § Mandated). Un `401`, un `429` y un tiempo agotado se leen como «Tu sesión de Spotify caducó…» o «No pudimos buscar en Spotify.», nunca como su código.
- **«Conectando…» es una palabra y un botón deshabilitado**, no un giro infinito que la pantalla no sabe cuándo apagar (BR16.3).

## NFR2.12 — Todo error de Spotify se dice con acción, y lo que estaba en pantalla se conserva

| Situación | Qué ve la persona | Qué se conserva | Por qué se conserva |
|---|---|---|---|
| Búsqueda fallida, `429` o tiempo agotado (BR17.9) | «No pudimos buscar en Spotify.» + «Reintentar» | El texto escrito y el foco | `error` es un estado con la consulta vigente, no un vaciado |
| Sin red con sesión (BR17.10) | Banner de sin conexión + «Reintentar» | Los resultados en caché, con portadas de bloque | La caché de C5 no se invalida al caer la red |
| Token caído con resultados (BR18.6) | Aviso + «Volver a conectar» | La lista, la consulta y el desplazamiento | `tokenCaido` es una capa sobre el estado vigente (NFR1.13) |
| Fallo de autorización o de intercambio (BR16.3) | «No pudimos conectar con Spotify.» + «Reintentar» | Las sugerencias y el resto de la pantalla | `connectionError` solo cambia el estado de la tarjeta |
| Instalación sin client ID (BR16.8) | «La conexión con Spotify no está configurada en esta instalación.» + «Reintentar» | Toda la app | `notConfigured` no toca contenido ni navegación |
| Fallo al resolver portadas (BR18.5) | «No pudimos actualizar las portadas.» + «Reintentar» bajo la cabecera | El feed entero, con bloques | El aviso de C5 no sustituye la lista |
| Una portada concreta que no carga (BR18.3) | El bloque con la inicial, sin aviso | La fila, con su altura | La portada es un adorno y su ausencia ya está representada |
| Sin sesión de Spotify (BR19.5) | La tarjeta de conexión y las sugerencias | Nada que conservar: no se ha perdido nada | No es un error |

- **La única situación sin acción es una portada rota**, y es una desviación declarada: no se muestra como error, su ausencia ya está representada por el bloque y no hay nada que la persona pueda hacer (BR18.3, `functional-spec.md` § Assumptions). FR11.2 pide «Reintentar» para los errores **que se muestran como error**.
- **«Sin sesión» no es un error**: se representa con la tarjeta de conexión y los bloques, nunca con un mensaje de fallo (BR19.5, `project.md` § Mandated).
- **Ningún fallo deja la pantalla vacía.** Cada rama de la tabla de `functional-spec.md` § La máquina de Explorar —`idle`, `short`, `searching`, `results`, `empty`, `error`, `offline`, `sinSesion` y la capa `tokenCaido`— y los seis estados de la conexión tienen texto y contenido propio (BR17.7, BR16.7, BR18.6).

## NFR2.5 y NFR2.8 — Lo que U2 y U3 fijaron y U4 no debilita

- **NFR2.5 — todo error visible dice qué pasó y ofrece acción.** U4 no retira ninguna salida de las cuatro pantallas de U2 ni de Crear: los `ErrorState` con «Reintentar» siguen, el banner de portadas sigue y la hoja de comentarios sigue con los suyos. La única excepción sigue siendo la que U2 y U3 declararon y U4 no amplía: un fallo de me gusta o de seguimiento se avisa con un snackbar sin acción porque el propio control sigue en pantalla. **U4 añade una segunda excepción, ya declarada en NFR2.12**: una portada concreta que no carga no se muestra como error.
- **NFR2.8 — el error que se pinta y el que no se pinta.** La regla de U3 se aplica ahora a los estados de Spotify: lo que el contrato devuelve como `failure` previsto se pinta y **no** se registra; solo los defectos internos llegan al logger (NFR9.7). Un `offline`, un `empty`, un `401` y un `notConfigured` son estados previstos, no defectos.

**Regla de diseño que se lee de los dos**: U4 no reabre la forma de las pantallas existentes; añade estados a la tarjeta de Perfil, al chip de Inicio y a Explorar. Si alguna tuviera que cambiar de estructura para sostener un estado nuevo, sería un cambio de C1 o de C2 y no un ajuste de esta unidad.

## NFR1.12 — La conexión nunca queda en un estado sin salida

### Las seis salidas, y por qué cada una existe

| Estado | Transición de salida | Qué la produce | Qué la garantiza |
|---|---|---|---|
| `disconnected` | → `connecting` | «Conectar con Spotify» | `connect()` es el único camino a `connecting` |
| `connecting` | → `connected` \| `connectionError` | El resultado del flujo de autorización | Ver abajo: la función que entra es la que sale |
| `connectionError` | → `connecting` | «Reintentar» | `retry()` vuelve a abrir la autorización |
| `invalidToken` | → `connecting` | «Volver a conectar» / «Conectar con Spotify» | El token ya se borró; conectar es un flujo nuevo |
| `connected` | → `disconnected` \| `invalidToken` | «Desconectar» / renovación fallida | El borrado y el `401` son los dos únicos caminos |
| `notConfigured` | → `connecting` (tras reiniciar con el client ID) | «Reintentar» | Reintenta y vuelve a decir lo mismo; no es un control muerto |

### El arranque entra en la máquina por su arco inicial, y se publica ya resuelto

`functional-spec.md` § Máquina de estados de la conexión dibuja dos arcos de entrada: `[*] --> connected: token guardado vigente` y `[*] --> disconnected: sin token` (más `[*] --> notConfigured: sin client ID`). Este diseño **no añade ninguna arista entre estados**; lo que hace es decidir *cuándo* se completa ese arco inicial:

- **La hidratación no publica `disconnected`.** Durante la lectura del almacén no hay estado publicado: `useSpotifyConnection` devuelve `null` y las pantallas pintan un marcador neutro (sin chip, sin tarjeta, sin buscador). El primer estado que se publica es el que el arranque resolvió —`connected`, `invalidToken`, `disconnected` o `notConfigured`—, y a partir de ahí la tabla de arriba manda.
- **Por qué no se pinta `disconnected` «de mentira»**: afirmaría en pantalla que no hay sesión cuando sí puede haberla, y para salir de ahí tendría que existir una arista `disconnected → connected` que ninguna acción de la persona produce. Con la publicación diferida, esa arista no existe ni hace falta.
- **Sin client ID la resolución es síncrona** (`notConfigured` desde la construcción), así que en ese caso no hay ventana neutra: el primer fotograma ya dice lo que pasa y ofrece «Reintentar» (BR16.8).
- **`invalidToken` solo aparece tras una renovación fallida**, no por un token caducado con `refreshToken` vivo: el arranque lo renueva una vez y pasa a `connected` (ver § NFR8.13).

### `connecting` termina por construcción

Este es el punto que el requisito deja abierto y que el diseño cierra: **`connecting` no puede quedarse puesto porque no lo pone un temporizador, lo pone una función que también lo quita.**

```text
// Ilustrativo, no implementación. packages/spotify/src/auth/spotify-auth.ts
async function connect(): Promise<void> {
  if (clientId === null) { setStatus("notConfigured"); return; }   // sale por la rama sin navegador
  setStatus("connecting");
  let saved = false;
  try {
    const verifier = await crypto.randomVerifier();
    const challenge = await crypto.challenge(verifier);
    const state = await crypto.randomVerifier();
    const outcome = await browser.open(authorizeUrl(challenge, state), redirectUri);
    if (outcome === "cancelled" || outcome.state !== state) return;   // el finally pone connectionError
    const token = await exchangeCode(outcome.code, verifier);
    await secureStore.set(TOKEN_KEY, serialize(token));
    saved = true;
    setStatus("connected");
  } catch {
    // el finally pone connectionError; el detalle se registra con su código
  } finally {
    if (!saved && getStatus() === "connecting") setStatus("connectionError");
  }
}
```

- **`openAuthSessionAsync` siempre resuelve.** Devuelve `{ code, state }` si la persona autoriza, `cancelled` si cierra la pestaña, y un rechazo si el navegador no puede abrirse. Los tres casos pasan por el `finally`, y el `finally` es el que deja `connectionError` si no se guardó token. No hay un camino que salga de `connect()` con el estado todavía en `connecting`.
- **Abandonar el navegador, no volver a la app o cerrarlo sin autorizar acaban en `connectionError`** con «Reintentar» (BR16.3). No se espera un retorno que puede no llegar: el resultado lo da la promesa del navegador.
- **El `state` que no coincide no llega al intercambio y sale por el mismo `finally`.** No se lanza una excepción a la pantalla: `connect()` devuelve `Promise<void>` y comunica el fallo por el estado (NFR1.14).
- **`notConfigured` es el único estado que no sale sin reiniciar, y está declarado.** El client ID se recibe una sola vez al construir `auth`, así que solo cambia tras reiniciar la app con la variable puesta (BR16.8, `functional-spec.md` § Invariantes de la máquina). Mientras tanto, la app entera funciona y el botón reintenta y vuelve a decir lo mismo: es la salida honesta de un estado que no depende de la persona.
- **No hay dos verdades sobre la sesión**: una sola instancia de `SpotifyAuth` construida en `app/src/bootstrap/ports.ts`, un solo estado vigente y una sola emisión por cambio (BR16.12, TS-35).
- **La máquina no se queda atrás de la realidad**: `disconnect()` deja el estado en `disconnected` aunque el borrado del token haya fallado, porque la sesión visible ya no debe usarse (BR16.4).

**Cómo se verifica**: prueba que recorre los seis estados y comprueba que cada uno tiene al menos una salida; prueba con un navegador doble que devuelve `cancelled` y comprueba `connectionError` **y que nunca se observa `connecting` después de que la promesa resuelva**; prueba con un navegador doble que rechaza y la misma aserción; prueba con un `state` distinto que comprueba que no se llamó a `/api/token`; prueba que construye `auth` sin client ID y comprueba `notConfigured` y que `connect()` no lanza; prueba de arranque con token vigente que comprueba que la **primera** emisión es `connected`, que `useSpotifyConnection` devuelve `null` antes de ella y que en ningún momento se pinta «Sin conectar»; prueba de arranque con token caducado y `refreshToken` válido que comprueba `connected`, una sola renovación y **cero aperturas del navegador**; prueba de arranque con `refreshToken` inválido que comprueba `invalidToken` y que la clave se borró; prueba de lectura fallida que comprueba `disconnected` y que **la clave no se borró**.

## NFR1.13 — La sesión que se cae no borra lo que la persona está leyendo

- **`tokenCaido` es una capa, no un estado.** `useExplorar` expone `tokenCaido: boolean` **junto al** estado de búsqueda, no en lugar de él: `searchStatus` sigue siendo `results` y `results` sigue siendo la misma lista. Un `401` no entra en `error`, no entra en `empty` y no sustituye la lista (BR18.6, BR17.7).
- **La consulta y el texto del campo sobreviven.** El campo sigue visible y editable; escribir no lanza petición mientras la capa está puesta (BR19.5, F25 paso 5). Al volver a `connected`, la capa desaparece y una búsqueda nueva vuelve a pedir; los resultados anteriores no se revalidan solos (BR18.6).
- **Si el `401` llega en la primera búsqueda**, no hay lista: la capa se pinta sobre una zona de resultados vacía, sin bloque de error y sin esqueletos (invariante 2 de la pantalla).
- **Las portadas de esa lista pasan a bloque** porque ya no hay sesión (BR18.1), pero el contenido local no se toca: opiniones, me gusta, comentarios y seguimientos son de C4 (BR16.9).
- **Desconectar tampoco borra nada**: la confirmación es «Spotify desconectado», el chip vuelve a «Conectar» y las tarjetas conservan sus bloques (BR16.9).
- **Volver de un detalle no pierde la búsqueda**: el detalle se apila sobre la pestaña Explorar, así que al volver el texto y los resultados siguen ahí (BR20.1, F23 paso 7, NFR1.11).

**Cómo se verifica**: prueba de `ExplorarScreen` que obtiene resultados, provoca un `401` y comprueba que la lista y la consulta siguen en el árbol y que el estado no es `error` ni `empty`; prueba que comprueba que la capa se pinta sin lista cuando el `401` llega en la primera búsqueda; prueba del detalle abierto desde un resultado que vuelve y comprueba que la consulta sigue escrita y el desplazamiento se conserva.

## NFR1.14 — Ninguna promesa rechazada se escapa a una pantalla

U4 introduce cuatro fronteras asíncronas que antes no existían y una quinta que ya existía:

| Frontera | Si rechaza | Qué ve la persona | Quién lo absorbe |
|---|---|---|---|
| Lectura del token al arrancar | `disconnected` | Nada: la app arranca sin sesión, igual que C3 con su `503` | `auth`, con `SPOTIFY_TOKEN_READ_FAILED` |
| Guardado del token tras el intercambio | `connectionError` | «No pudimos conectar con Spotify.» + «Reintentar» | `connect()` y su `finally` |
| Borrado del token al desconectar | `disconnected` igualmente | «Spotify desconectado» (BR16.4) | `disconnect()`, con `SPOTIFY_TOKEN_DELETE_FAILED` |
| Renovación del token | `invalidToken` | «Tu sesión de Spotify caducó. Vuelve a conectar.» | `getAccessToken()`, con `SPOTIFY_REFRESH_FAILED` |
| Apertura del navegador | `connectionError` | «No pudimos conectar con Spotify.» + «Reintentar» | `connect()` |
| Petición de búsqueda o de resolución | El `failure` del contrato | El estado de BR17.7 o el bloque de portada | `requestJson` y `catalog` |
| Suscripción (`subscribe`, `onConnectionChange`) | Un `listener` que lanza | Nada | La emisión: se registra y se sigue notificando al resto |

- **`connect()`, `disconnect()` y `retry()` nunca lanzan**: devuelven `Promise<void>` y comunican el fallo por el estado (C7 § `/auth/connect`). Ninguna pantalla necesita un `try`/`catch`, y ninguna lo tendrá: un `catch` en la pantalla sería la señal de que la frontera se rompió.
- **La suscripción no puede tumbar a quien la escucha.** El emisor recorre los `listener` con `try`/`catch` por cada uno, registra el fallo y continúa; es la misma regla que C4 y C6 (NFR1 de U2). Una pantalla no puede impedir que otra se entere de un cambio de estado.
- **Ningún fallo se queda en silencio**: el que no se muestra se registra (BR16.10, NFR9.7).

**Cómo se verifica**: una prueba por frontera con su doble devolviendo un rechazo, comprobando el estado resultante **y que la promesa pública resuelve**; prueba de la suscripción con un `listener` que lanza y comprobando que el segundo recibe la emisión.

## NFR1.15 — La app arranca y se recorre sin client ID, sin sesión y sin red

| Escenario | Qué se ve | Qué sigue funcionando | Cómo se comprueba |
|---|---|---|---|
| Sin `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | Arranca en `notConfigured` de forma síncrona —sin leer el almacén y sin ventana neutra—; solo al tocar «Conectar» aparece el aviso con «Reintentar» (BR16.8) | Inicio, Explorar con sugerencias, Crear, Actividad y Perfil completos | Recorrido en el teléfono, primer paso de la tabla de `functional-spec.md`; pruebas de montaje con `notConfigured` |
| Sin sesión | Explorar muestra tarjeta y sugerencias, sin buscador y sin peticiones (BR19.1); Inicio y detalle pintan bloques (BR18.1) | Publicar desde Crear o desde una sugerencia (BR20.4) | Pruebas de montaje con `disconnected`; prueba con puertos reales que comprueba cero llamadas a `fetch` |
| Sin red | Banner en la cabecera, lo cargado se conserva y las portadas caen a bloque (BR17.10, BR19.3) | Toda la navegación y el contenido en memoria | Pruebas de montaje con `online: false`; recorrido con modo avión |
| Con sesión y sin red | Los resultados en caché siguen con bloques y «Reintentar» | Lo ya leído | Prueba de `ExplorarScreen` con caché previa y `offline` |

- **Ninguna pantalla se bloquea esperando a la red.** No hay un `loading` de red que no tenga salida: `searching` tiene esqueletos y termina por resultado, error, vacío u offline; todos con su texto.
- **El contenido local es independiente de Spotify**: desconectar, caducar el token o no tenerlo nunca toca C4 (BR16.9, BR16.11).

## Presupuesto en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Petición de búsqueda o de resolución | Sin objetivo de latencia (es de Spotify); **10 s** de tiempo límite y sin reintento automático | Prueba del cliente con un `fetch` que no resuelve y reloj falso |
| Disparo de la búsqueda | **400 ms** desde la última pulsación, **2 caracteres** de umbral, sin petición por debajo | Prueba de `useWorkSearch` con temporizadores falsos, heredada de U3 y ampliada con artistas |
| Espera visible | **5** esqueletos desde que sale la petición; nunca un hueco en blanco | Prueba de `ExplorarView` en `searching` |
| Repetición de una consulta | Sin número; **cero** peticiones y cero esqueletos | Prueba de `Catalog` con dos búsquedas iguales |
| Resolución de portada | Sin número; **una** petición por obra, ninguna con `coverUrl`, sin sesión o sin red | Prueba de `coverFor` con dos lecturas en el mismo tick |
| Arranque en frío | ≤ 2 s, sin lectura bloqueante | Cronómetro, si se vuelve a medir al cerrar la unidad |
| Renovación del token | **60 s** antes de caducar, una sola a la vez, invisible | Prueba con reloj falso y con dos llamadas concurrentes |
| Recorrido completo con y sin sesión | Sin número; sin congelación perceptible | Recorrido en Expo Go sobre el teléfono |

## Assumptions & Open Questions

- `[assumption]` El tiempo de Spotify no se mide ni se promete. La única cifra propia de la unidad sigue siendo el `debounce` de 400 ms; los 10 s son del contrato y no un objetivo de calidad.
- `[assumption]` La resolución de portada de las obras de ejemplo es la única petición por obra que existe: una obra buscada llega con `coverUrl` y no se resuelve. Si el catálogo de ejemplo creciera a decenas de obras, habría que decidir si se resuelven todas o solo las visibles.
- `[assumption]` La caché de C5 no caduca mientras la app viva: es contenido de lectura y la persona puede repetir una búsqueda sin coste.
- `[assumption]` «Reintentar» de la búsqueda respeta los mismos 400 ms; no se convierte en una petición inmediata, para no introducir un camino que la persona no puede explicar (BR17.9).
- `[assumption]` La lectura asíncrona del token es la que sostiene el arranque de 2 s. Si en el teléfono el almacén seguro tardara un segundo en frío, se documenta y se mantiene asíncrona; nunca se convierte en bloqueante.
- **Open question para U5**: Actividad no depende de Spotify; si mostrara portadas reales, pasaría por C5 y heredaría este presupuesto (una por obra, ninguna sin sesión).
- **Open question para U6**: el recorrido con sesión añade la espera real de la autorización. Si en el teléfono el retorno del navegador tardara de forma perceptible, se documenta; no se compensa con un temporizador de interfaz.

## Sources

- `performance-requirements` — `construction/u4-spotify-explore/nfr-requirements/performance-requirements.md` (NFR8.12–8.15, NFR2.10–2.12, NFR1.12–1.15 y los heredados).
- `security-requirements` — `construction/u4-spotify-explore/nfr-requirements/security-requirements.md` (NFR9.7).
- `tech-stack-decisions` — `construction/u4-spotify-explore/nfr-requirements/tech-stack-decisions.md` (TS-31 a TS-38).
- `functional-spec` — `construction/u4-spotify-explore/functional-design/functional-spec.md` (máquinas de conexión y de Explorar, F21–F27, § Textos exactos, § Assumptions).
- `rules` — `construction/u4-spotify-explore/functional-design/rules.md` (BR16–BR20).
- `frontend-components` — `construction/u4-spotify-explore/functional-design/frontend-components.md` (§ `app/src/screens/explorar/`, § `app/src/state/`, § `app/src/bootstrap/`, § Flujos de interacción).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0, C9, C10, § Fallos, tiempos y reintentos).
- `performance-design (U3)` — `construction/u3-create-react/nfr-design/performance-design.md` (NFR8.11, NFR2.9, NFR1.11 heredados; disparo y descarte de la búsqueda).
