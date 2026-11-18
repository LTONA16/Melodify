# Requisitos de rendimiento, usabilidad y fiabilidad — U4 `u4-spotify-explore`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR10, FR11, FR12.2, RC-01, RC-02, RC-05, RC-08), de `inception/units-generation/unit-of-work.md` (U4), de `inception/contract-design/contract-summary.md` (C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0, C9, C10, § Fallos, tiempos y reintentos), de `construction/u4-spotify-explore/functional-design/functional-spec.md` (máquinas de conexión y de Explorar, F21–F27, § Textos exactos, § Assumptions), de `construction/u4-spotify-explore/functional-design/rules.md` (BR16.3, BR16.5, BR16.6, BR16.7, BR16.10, BR17.1, BR17.2, BR17.7–BR17.10, BR18.1, BR18.4–BR18.6, BR19.2–BR19.5) y de `construction/u4-spotify-explore/functional-design/frontend-components.md` (§ `app/src/screens/explorar/`, § `app/src/state/`, § Flujos de interacción).
> Fecha: 2026-11-17. Etapa: NFR Requirements · Unidad: `u4-spotify-explore` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite tres artefactos para esta unidad: este, `security-requirements.md` y `tech-stack-decisions.md`, más `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.12`). **La numeración continúa la de U1, U2 y U3**: U3 terminó en `NFR8.11`, `NFR2.9` y `NFR1.11`, así que esta unidad empieza en `NFR8.12`, `NFR2.10` y `NFR1.12`. Un identificador no se repite entre unidades.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tiene nada que absorber**: `requirements.md` no fija ningún objetivo de escalabilidad, la app la usa una persona y no hay servidor (RC-02, RC-04).

**Qué cambia respecto a U3 en la naturaleza de la espera.** Hasta ahora toda la app resolvía en el mismo tick: el contenido vive en memoria y la única búsqueda posible no tenía puerto que la atendiera. **U4 es la primera unidad que espera a un tercero.** Introduce la primera petición de red real, la primera credencial guardada en el dispositivo y el primer flujo que depende de que alguien autorice en un navegador. Los requisitos de abajo no suben ningún número aprobado; fijan qué parte de esa espera es nuestra —y por tanto tiene presupuesto— y qué parte es de Spotify y solo se puede acotar con un tiempo límite y una salida.

## NFR8 — Rendimiento

NFR8 sigue diciendo: «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». U4 **tampoco abre la puerta a una mediana ni a un percentil**, y esta etapa no inventa ninguno. Lo que sí hace es separar dos cosas que hasta ahora eran la misma: la espera **nuestra** —lo que la app añade por su cuenta— y la espera **ajena**, que se acota con el tiempo límite que el contrato ya fijó.

### NFR8.12 — La espera de red está acotada en 10 s y siempre tiene salida visible

- **Toda petición a Spotify lleva tiempo límite de 10 s** (`contract-summary.md` § C10 `x-timeouts`, C7 § `/search` y `/tracks/{workId}` `504`). Se implementa con un `AbortController` en el cliente HTTP único del paquete, no con un temporizador de pantalla (TS-34).
- **No hay reintento automático** (OQ2, `contract-summary.md` § C10). Un `429`, un tiempo agotado o un `5xx` no relanzan la petición: se convierten en el estado `error` con «Reintentar» y es la persona quien decide (BR17.9). La app no introduce una espera que no puede explicar.
- **La espera nunca es un hueco en blanco.** Desde que la petición sale hasta que se resuelve se pintan **5 filas de esqueleto** que ocupan el espacio de los resultados (BR17.7, `functional-spec.md` § Estados y textos). El esqueleto es la forma de decir «esto está en marcha» sin un indicador que la pantalla no sabe cuándo apagar.
- **La espera se compone de dos tramos, y solo uno es nuestro.** El tramo propio es el `debounce` de 400 ms (BR17.1), que no es una espera sino una decisión: no se pide hasta que la persona deja de escribir. El tramo ajeno es el tiempo de Spotify. **No se fija ningún objetivo para el segundo**; lo que se exige es que la app no añada nada encima: ni una petición previa, ni una segunda vuelta, ni un `setTimeout` de cortesía antes de pintar.
- **Una respuesta que llega tarde se descarta, no se aborta.** El puerto no recibe señal de cancelación: cuando la consulta cambia, la petición en vuelo termina y su resultado se tira al llegar (BR17.8). Es deliberado y se dice aquí porque tiene una consecuencia de rendimiento: **cambiar de consulta rápidamente puede dejar hasta una petición por consulta en vuelo**, y el tiempo límite de 10 s garantiza que ninguna se quede colgada. Abortar el socket ahorraría cuota, pero exigiría ampliar `SpotifySearchPort` con una señal, y el contrato no lo declara.

**Cómo se verifica**: prueba del cliente HTTP con un `fetch` doble que nunca resuelve y un reloj falso que comprueba que a los 10 s se resuelve `timeout`; prueba de `useWorkSearch` que resuelve primero la consulta vieja y comprueba que no se pinta ni se declara `results`; prueba de `ExplorarView` que comprueba las 5 filas de esqueleto en `searching`; prueba que comprueba que un `429` no dispara una segunda llamada.

### NFR8.13 — El arranque no espera al token ni al navegador

- **El arranque en frío sigue en ≤ 2 s (NFR8.1)**: U4 no añade ninguna lectura bloqueante. `createSpotifyAuth` empieza a leer el token **de forma asíncrona** y la app pinta su primer fotograma sin esperarlo (BR16.5). Mientras la lectura está en curso el estado es `disconnected`; si el token aparece y sigue vigente, la emisión lo cambia a `connected` y las pantallas ya montadas repintan.
- **`connecting` no se pinta nunca al arrancar** (BR16.5, invariante 3). Renovar es silencioso: la renovación de 60 s (BR16.6) ocurre dentro de la llamada en curso y la persona sigue viendo «Conectado».
- **Las portadas no bloquean el primer pintado del feed.** Inicio pinta sus tarjetas con el bloque de la inicial y pide `coverFor` por obra; cuando la portada real llega, la tarjeta repinta sin volver a montarse (BR18.4). Ni la cabecera, ni el recuento de opiniones, ni la lista esperan a Spotify.
- **Reconectar no remonta la pantalla.** Al pasar a `connected`, y al volver la red, las portadas cambian en su sitio: la lista conserva su desplazamiento y su contenido (BR18.4, BR18.6).
- **El flujo de autorización no bloquea la app**: mientras `connecting`, el botón de la tarjeta y el chip quedan deshabilitados con «Conectando…» y el resto de la app sigue respondiendo (BR16.3, BR19.2). Salir al navegador del sistema no congela Expo Go.

**Cómo se verifica**: prueba de `SpotifyAuth` que comprueba que `getState()` devuelve `disconnected` antes de que la lectura del almacén resuelva y `connected` después; prueba de `InicioScreen` que comprueba que las tarjetas se pintan con bloque antes de que `coverFor` resuelva y con imagen después, sin desmontar; cronómetro del arranque en el teléfono si se vuelve a medir al cerrar la unidad.

### NFR8.14 — Una petición por consulta y una por obra, y ninguna sin sesión

- **Una consulta ya buscada no vuelve a pedir**: C5 cachea las respuestas `ok` por consulta normalizada y el hook pasa a `results` sin esqueletos y sin llamar al puerto (BR17.2, BR17.7). La caché vive mientras dure la app.
- **Una portada se pide una vez por obra**: `coverFor(workId)` memoiza el resultado y **comparte la promesa en vuelo** de la misma obra, de modo que dos tarjetas que pidan la misma obra a la vez no producen dos peticiones. Una obra buscada ya trae `coverUrl` y no necesita resolución; las obras del catálogo de ejemplo se siembran con `coverUrl: null` y esa es la única petición de portada que existe (BR18.1, `contract-summary.md` § Assumptions).
- **Sin sesión o sin red no sale ninguna petición.** C5 responde `offline` a `searchWorks` e `initialBlock` a `coverFor` sin tocar la red (BR19.5), y Explorar no monta siquiera el campo de búsqueda sin sesión (BR19.1).
- **No hay sondeo ni refresco en segundo plano**: nada repite una petición por temporizador. La única repetición es la que pide la persona con «Reintentar» o con una consulta nueva.
- **La búsqueda pide 20 resultados por clase y no pagina** (`contract-summary.md` § C10, OQ2 cerrada): una pantalla de 60 filas como máximo, sin scroll infinito y sin una segunda petición al llegar al final.

**Cómo se verifica**: prueba de `Catalog` que busca dos veces la misma consulta y comprueba una sola llamada al puerto; prueba de `coverFor` que pide la misma obra dos veces en el mismo tick y comprueba una sola llamada a `resolve`; prueba con puertos reales y sin sesión que comprueba cero llamadas a `fetch`; prueba de `useWorkSearch` que comprueba que no existe ningún temporizador de refresco tras resolver.

### NFR8.15 — El resto del recorrido sigue sin número

Escribir una consulta, desplazar 60 resultados, abrir el detalle de una obra, publicar sobre ella, desconectar y ver las portadas caer a bloque se juzgan con NFR8 tal como está aprobado: **no se percibe una congelación** al recorrerlo en el teléfono. No se fija mediana, ni percentil, ni umbral en milisegundos, y ninguna prueba automática falla por tiempo.

Los únicos números de esta unidad son los que ya estaban aprobados o los que el contrato fija, y ninguno se negocia aquí: **400 ms** de espera tras la última pulsación, **2 caracteres** de umbral, **10 s** de tiempo límite, **60 s** de margen de renovación, **20** resultados por clase, **5** esqueletos, **2 s** de arranque en frío y **4 s** de snackbar.

## NFR2 — Usabilidad

### NFR2.10 — Las acciones de esta unidad, en dos toques o menos

| Acción | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Abrir Explorar | 1 toque en la barra | F21, paso 1 |
| Conectar desde Explorar | 1 toque en «Conectar con Spotify» | F21, paso 2 |
| Conectar desde Inicio | 1 toque en el chip | BR19.4 |
| Desconectar | 1 toque en «Desconectar» | F26, paso 1 |
| Abrir una obra de un resultado o de una sugerencia | 1 toque en la fila | F23, paso 1 |
| Opinar sobre una obra buscada | 2 toques: «Opinar sobre esta obra» y «Publicar» | F23, pasos 5–6 |
| Volver a conectar tras el token caído | 1 toque en «Volver a conectar» | F25, paso 6 |
| Reintentar una búsqueda, una conexión o las portadas | 1 toque en «Reintentar» | F22, F26, F27 |
| Volver del detalle a la lista, con su texto y sus resultados | 1 toque en «‹ Volver» o atrás del sistema | F23, paso 7 |
| Rellenar el campo con el nombre de un artista | 1 toque en la fila de artista | F24 |

Ninguna acción del recorrido exige leer una explicación previa (NFR2). La única acción que **no** está a dos toques es buscar, porque buscar es escribir: el campo tiene el foco al entrar (BR19.1, invariante 1) para que el primer carácter no necesite un toque previo.

### NFR2.11 — La conexión y cada rama de Explorar se dicen con palabras, nunca solo con un color

- **Ningún estado se distingue solo por color.** El chip de Inicio dice «Conectado» o «Conectar» y no solo enciende un punto verde (BR19.4); la tarjeta de Perfil escribe el estado, su explicación y el nombre de su acción (BR16.7); el aviso de token caído es una frase con su botón, no un icono de advertencia (BR18.6).
- **Cada estado nombra su salida**: «Conectar con Spotify», «Desconectar», «Reintentar», «Volver a conectar». No hay un estado que solo informe (BR16.7, BR18.6).
- **Los textos son los exactos de `functional-spec.md` § Textos exactos**, todos en español, ninguno con un código HTTP ni una palabra en inglés (FR11.5, `project.md` § Mandated). Un `401`, un `429` y un tiempo agotado se leen como «Tu sesión de Spotify caducó…» o «No pudimos buscar en Spotify.», nunca como su código.
- **«Conectando…» es una palabra, no un giro infinito**: va con indicador y con el botón deshabilitado, y el texto cambia cuando el flujo termina (BR16.3).

### NFR2.12 — Todo error de Spotify dice qué pasó y ofrece acción, y lo que estaba en pantalla se conserva

Con la misma regla que NFR2.5 de U2 y NFR2.8 de U3, aplicada a los estados que introduce U4:

| Situación | Qué ve la persona | Qué se conserva |
|---|---|---|
| Búsqueda fallida, `429` o tiempo agotado (BR17.9) | «No pudimos buscar en Spotify.» + «Reintentar» | El texto escrito y el foco |
| Sin red con sesión (BR17.10) | Banner de sin conexión + «Reintentar» | Los resultados en caché, con portadas de bloque |
| Token caído con resultados (BR18.6) | «Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.» + «Volver a conectar» | La lista, la consulta y el desplazamiento |
| Fallo de autorización o de intercambio (BR16.3) | «No pudimos conectar con Spotify.» + «Reintentar» | Las sugerencias y el resto de la pantalla |
| Instalación sin client ID (BR16.8) | «La conexión con Spotify no está configurada en esta instalación.» + «Reintentar» | Toda la app, que sigue operativa |
| Fallo al resolver portadas (BR18.5) | «No pudimos actualizar las portadas.» + «Reintentar» bajo la cabecera | El feed entero, con bloques |
| Una portada concreta que no carga (BR18.3) | El bloque con la inicial, sin aviso | La fila, con su altura |
| Sin sesión de Spotify (BR19.5) | La tarjeta de conexión y las sugerencias | Nada que conservar: no se ha perdido nada |

- **La única situación sin acción es una portada rota**, y es una desviación declarada: la portada es un adorno, su ausencia ya está representada por el bloque y no hay nada que la persona pueda hacer (BR18.3, `functional-spec.md` § Assumptions). FR11.2 pide «Reintentar» para los errores **que se muestran como error**; esto no se muestra como error.
- **«Sin sesión» no es un error**: se representa con la tarjeta de conexión y los bloques, nunca con un mensaje de fallo (BR19.5, `project.md` § Mandated).
- **Un fallo nunca deja la pantalla vacía**: cada rama de Explorar que fija la tabla de `functional-spec.md` § La máquina de Explorar —`idle`, `short`, `searching`, `results`, `empty`, `error`, `offline`, `sinSesion` y la capa `tokenCaido`— y los seis estados de la conexión tienen texto y contenido propio (BR17.7, BR16.7, BR18.6). Son siete estados de búsqueda más las dos ramas de sesión: el número no se da aquí, se toma de esa tabla, que es la que U6 recorre estado por estado.

## NFR1 — Fiabilidad

### NFR1.12 — La conexión nunca queda en un estado sin salida

- Los **seis** estados tienen al menos una transición de salida (BR16.7, `functional-spec.md` § Máquina de estados de la conexión): `disconnected → connecting`, `connecting → connected | connectionError`, `connectionError → connecting`, `invalidToken → connecting`, `connected → disconnected | invalidToken`, `notConfigured → connecting`.
- **`connecting` siempre termina.** El resultado lo da el flujo de autorización —`success` guarda el token, `cancel` o un fallo del intercambio llevan a `connectionError`—, no un temporizador de interfaz (BR16.3). Abandonar el navegador, no volver a la app o cerrarlo sin autorizar acaban en `connectionError` con «Reintentar».
- **`notConfigured` es el único estado que no sale sin reiniciar**, y está declarado: el client ID se recibe una sola vez al construir `auth`, así que solo cambia tras reiniciar la app con la variable puesta (BR16.8, `functional-spec.md` § Invariantes de la máquina). Mientras tanto, la app entera sigue funcionando y el botón no es un control muerto: reintenta y vuelve a decir lo mismo.
- **No hay dos verdades sobre la sesión**: una sola instancia de `SpotifyAuth` construida en `app/src/bootstrap/ports.ts`, un solo estado vigente y una sola emisión por cambio (BR16.12, `contract-summary.md` § Reglas de propiedad, TS-35).
- **La máquina no se puede quedar atrás de la realidad**: `disconnect()` deja el estado en `disconnected` aunque el borrado del token haya fallado, porque la sesión visible ya no debe usarse (BR16.4).

**Cómo se verifica**: prueba de `SpotifyAuth` que recorre cada estado y comprueba su salida; prueba que simula un navegador que devuelve `cancel` y comprueba `connectionError` (nunca `connecting`); prueba que construye `auth` sin client ID y comprueba `notConfigured` y que `connect()` no lanza; prueba que comprueba que `getState()` no cambia de valor entre dos lecturas seguidas sin un cambio real.

### NFR1.13 — La sesión que se cae no borra lo que la persona está leyendo

- Un `401` **no es un fallo de búsqueda**: no entra en `error`, no entra en `empty` y **no sustituye la lista** (BR18.6, BR17.7, BR17.9). Levanta la capa `token caído` sobre el estado vigente y conserva lista, consulta y texto del campo.
- Las portadas de esa lista pasan a bloque porque ya no hay sesión (BR18.1), pero el contenido local no se toca: opiniones, me gusta, comentarios y seguimientos son de C4 y no dependen de Spotify (BR16.9).
- **Desconectar tampoco borra nada**: la confirmación es «Spotify desconectado», el chip vuelve a «Conectar» y las tarjetas conservan sus bloques (BR16.9).
- **Volver de un detalle no pierde la búsqueda**: el detalle se apila sobre la pestaña Explorar, así que al volver el texto y los resultados siguen ahí (BR20.1, F23 paso 7).
- **Reconectar no revalida en silencio**: al volver a `connected`, la capa desaparece y una búsqueda nueva vuelve a pedir; los resultados anteriores no se refrescan solos (BR18.6, `functional-spec.md` § Assumptions sobre la caché).

**Cómo se verifica**: prueba de `ExplorarScreen` que obtiene resultados, provoca un `401` y comprueba que la lista y la consulta siguen en el árbol; prueba que comprueba que el estado de la pantalla no es `error` ni `empty` en ese caso; prueba del detalle abierto desde un resultado que vuelve y comprueba que la consulta sigue escrita.

### NFR1.14 — Ninguna promesa rechazada se escapa a una pantalla

U4 introduce cuatro fronteras asíncronas que antes no existían —almacén seguro, navegador de autorización, criptografía y `fetch`— y una quinta que ya existía, la suscripción. Cada una tiene su salida declarada:

| Frontera | Si rechaza | Qué ve la persona |
|---|---|---|
| Lectura del token al arrancar | `disconnected` | Nada: la app arranca sin sesión, igual que C3 con su `503` (`contract-summary.md` § Revisión 9) |
| Guardado del token tras el intercambio | `connectionError` | «No pudimos conectar con Spotify.» + «Reintentar» |
| Borrado del token al desconectar | `disconnected` igualmente | «Spotify desconectado» (BR16.4) |
| Renovación del token | `invalidToken` | «Tu sesión de Spotify caducó. Vuelve a conectar.» |
| Apertura del navegador | `connectionError` | «No pudimos conectar con Spotify.» + «Reintentar» |
| Petición de búsqueda o de resolución | El `failure` del contrato | El estado de BR17.7 o el bloque de portada |

- **`connect()`, `disconnect()` y `retry()` nunca lanzan**: devuelven `Promise<void>` y comunican el fallo por el estado (C7 § `/auth/connect`, `504`). Ninguna pantalla necesita un `try`/`catch`.
- **La suscripción no puede tumbar a quien la escucha**: un error de un `listener` se registra y no impide notificar a los demás (misma regla que C4 y C6, NFR1 de U2).
- **Ningún fallo se queda en silencio**: el que no se muestra se registra (BR16.10, NFR9.7 en `security-requirements.md`).

**Cómo se verifica**: pruebas con cada doble devolviendo un rechazo y comprobando el estado resultante y que la promesa pública resuelve; prueba de la suscripción con un `listener` que lanza y comprobando que el segundo recibe la emisión.

### NFR1.15 — La app arranca y se recorre sin client ID, sin sesión y sin red

- **Sin `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`**: la app arranca en `notConfigured`, Inicio, Explorar con sugerencias, Crear, Actividad y Perfil funcionan completos, y solo al tocar «Conectar» aparece el aviso con «Reintentar» (BR16.8). **Esto es literalmente el recorrido sin sesión que FR12.2 exige** y la única forma en que la unidad se puede cerrar si el panel de Spotify rechaza el redirect (Q1 = B).
- **Sin sesión**: Explorar muestra tarjeta y sugerencias, sin buscador y sin peticiones (BR19.1); Inicio y el detalle pintan bloques (BR18.1); publicar desde Crear o desde una sugerencia funciona igual (BR20.4).
- **Sin red**: la app conserva lo cargado, avisa en la cabecera y usa bloques (FR11.4, BR17.10, BR19.3). Ninguna pantalla se bloquea esperando a la red.
- **El contenido local es independiente de Spotify**: desconectar, caducar el token o no tenerlo nunca toca C4 (BR16.9, BR16.11).

**Cómo se verifica**: recorrido en el teléfono sin la variable (el primer paso de la tabla de `functional-spec.md` § Recorrido en el teléfono); pruebas de montaje de Explorar, Inicio, detalle y Perfil con `spotifyStatus: 'notConfigured'`, `'disconnected'` y `online: false` que comprueban que cada pantalla pinta su estado y no un error.

## Presupuesto de rendimiento en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Petición de búsqueda o de resolución | Sin objetivo de latencia (es de Spotify); **10 s** de tiempo límite y sin reintento automático | Prueba del cliente HTTP con `fetch` que no resuelve y reloj falso. |
| Disparo de la búsqueda | **400 ms** desde la última pulsación, **2 caracteres** de umbral, sin petición por debajo | Prueba de `useWorkSearch` con temporizadores falsos (heredada de U3 y ampliada con artistas). |
| Espera visible | **5** esqueletos desde que sale la petición; nunca un hueco en blanco | Prueba de `ExplorarView` en `searching`. |
| Repetición de una consulta | Sin número; **cero** peticiones y cero esqueletos | Prueba de `Catalog` con dos búsquedas iguales. |
| Resolución de portada | Sin número; **una** petición por obra y ninguna con `coverUrl`, sin sesión o sin red | Prueba de `coverFor` con dos lecturas en el mismo tick. |
| Arranque en frío | Se mantiene el **≤ 2 s** de NFR8.1; la lectura del token no lo bloquea | Cronómetro, si se vuelve a medir al cerrar la unidad. |
| Renovación del token | **60 s** antes de caducar, una sola a la vez, invisible | Prueba con reloj falso y con dos llamadas concurrentes. |
| Buscar, desplazar 60 filas, abrir el detalle, conectar y desconectar | Sin número; sin congelación perceptible | Recorrido en el teléfono. |

## Assumptions & Open Questions

- `[assumption]` El tiempo de Spotify no se mide ni se promete. La única cifra propia de esta unidad es el `debounce` de 400 ms, que ya existía en U3 y no cambia; los 10 s son del contrato y no un objetivo de calidad.
- `[assumption]` La resolución de portada de las obras de ejemplo es la única petición por obra que existe: una obra buscada llega con `coverUrl` y no se resuelve. Si el catálogo de ejemplo creciera a decenas de obras, habría que decidir si se resuelven todas o solo las visibles —decisión de esa etapa, no de un detalle de implementación—.
- `[assumption]` La caché de C5 no caduca mientras la app viva: es contenido de lectura y la persona puede repetir una búsqueda sin coste. Si se quisiera frescura, sería un cambio de BR17.2.
- `[assumption]` «Reintentar» de la búsqueda respeta los mismos 400 ms; no se convierte en una petición inmediata, para no introducir un camino que la persona no puede explicar (BR17.9).
- **Open question para U5**: Actividad no depende de Spotify; si mostrara portadas reales, pasaría por C5 y heredaría el presupuesto de NFR8.14 (una por obra, ninguna sin sesión).
- **Open question para U6**: el recorrido con sesión añade la espera real de la autorización. Si en el teléfono el retorno del navegador tardara de forma perceptible, se documenta; no se compensa con un temporizador de interfaz, porque el resultado lo da el flujo (BR16.3).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR10, FR11, FR12.2, RC-01, RC-02, RC-05, RC-08).
- `unit-of-work` — `inception/units-generation/unit-of-work.md` (§ U4).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0, C9, C10, § Fallos, tiempos y reintentos).
- `functional-spec` — `construction/u4-spotify-explore/functional-design/functional-spec.md` (máquinas de conexión y de Explorar, F21–F27, § Textos exactos, § Assumptions).
- `rules` — `construction/u4-spotify-explore/functional-design/rules.md` (BR16.3–BR16.10, BR17.1–BR17.10, BR18.1–BR18.6, BR19.1–BR19.5).
- `frontend-components` — `construction/u4-spotify-explore/functional-design/frontend-components.md` (§ `app/src/screens/explorar/`, § `app/src/state/`, § `app/src/bootstrap/`, § Flujos de interacción).
