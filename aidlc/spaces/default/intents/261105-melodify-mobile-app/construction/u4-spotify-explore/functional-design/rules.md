# Reglas de negocio — U4 `u4-spotify-explore`

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (U4), `inception/units-generation/unit-of-work-story-map.md` (US2.2, US3.1, US3.2, US10.1, US10.2), `inception/user-stories/stories.md` (AC2.2.1–AC2.2.4, AC3.1.1–AC3.1.8, AC3.2.1–AC3.2.4, AC10.1.1–AC10.1.6, AC10.2.1–AC10.2.5), `inception/requirements-analysis/requirements.md` (FR3.3–FR3.5, FR4.1–FR4.6, FR9.2, FR10.1–FR10.8, FR11.2–FR11.4, FR12.2, RC-05, RC-08, RC-09, A6, OQ2), `inception/domain-design/components.md` (SpotifyAuth, SpotifyCatalog, Catalog, AppShell), `inception/contract-design/contract-summary.md` (C1, C2, C5, C7, C9, C10), `inception/refined-mockups/mockups.md` (Explorar, Perfil, matriz de estados), `inception/refined-mockups/interaction-spec.md` y las respuestas de `functional-design-questions.md` (Q1 = B, Q2 = A, Q3 = B, Q4 = A, Q5 = A).
> Fecha: 2026-11-17. Etapa: Functional Design · Unidad: `u4-spotify-explore`.

El bloque `yaml` es la fuente de verdad; la tabla del final es la misma información puesta para leerla. Los grupos son: **BR16** la conexión con Spotify, **BR17** la búsqueda de Explorar, **BR18** las portadas y su degradación, **BR19** Explorar sin sesión y sin red, y **BR20** la obra en el detalle y en Crear. La numeración continúa la de U3 (que cierra en BR15) para que la traza de la unidad no colisione con reglas ya publicadas.

```yaml
rules:
  - id: BR16.1
    statement: >
      «Conectar con Spotify» inicia una autorización PKCE S256 construida en la app
      con el client ID de `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`; no viaja ningún client
      secret y no se piden permisos de usuario.
    category: constraint
    applies_to: "SpotifyAuth (C7), ConnectionCard y SpotifyCard"
    trigger: "La persona toca «Conectar con Spotify» estando desconectada."
    logic: >
      El paquete `@melodify/spotify/auth` genera un verificador aleatorio, calcula su
      desafío S256, arma la URL de C9 (`response_type=code`, `code_challenge_method=S256`,
      `state`) y la abre en el navegador del sistema. El alcance es público: solo
      catálogo (búsqueda, metadatos y portadas). Nunca se lee ni se envía un client
      secret, ni desde el código ni desde una variable `EXPO_PUBLIC_*` (CT-04).
    violation: >
      Un secreto en el cliente es público por definición y rompe FR10.1 y NFR3; pedir
      permisos de usuario convierte una app sin cuenta en una app que pide una cuenta.
    source: "FR10.1, FR10.2, FR10.6, NFR3, CT-04, AC10.1.1"

  - id: BR16.2
    statement: >
      El redirect URI se resuelve de `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` cuando está
      definido y, si no, con `makeRedirectUri()` de Expo; se intenta registrar en el
      panel de Spotify y, si el panel lo rechaza, se anota el motivo y el recorrido se
      demuestra sin sesión.
    category: policy
    applies_to: "SpotifyAuth (C7) y el punto de composición"
    trigger: "Se construye la URL de autorización o se prepara la entrega."
    logic: >
      IF `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` tiene valor THEN se usa tal cual. ELSE se
      usa `makeRedirectUri({ path: 'spotify-callback' })`, que en Expo Go devuelve
      `exp://<ip>:8081/--/spotify-callback`. El valor exacto se pega en el panel de
      Spotify (Q1 = B). IF el panel lo acepta THEN la conexión real puede probarse en
      el teléfono. IF lo rechaza THEN no se inventa otro esquema, se registra el motivo
      en `external-dependency-map.md` y la unidad se cierra con el recorrido sin sesión
      (FR12.2). El código queda completo y probado con dobles en ambos casos.
    violation: >
      Inventar `melodify://` o dar por hecho un redirect que el panel no acepta produce
      una conexión que nunca vuelve a la app y una entrega que dice haber probado lo
      que no probó.
    source: "A6, RC-09, FR12.2, Q1 = B; external-dependency-map.md § Redirect URI de PKCE"

  - id: BR16.3
    statement: >
      Mientras la autorización está en curso el estado es `connecting` y las acciones
      de conexión quedan deshabilitadas con «Conectando…»; abandonar el navegador o no
      volver a la app termina en `connectionError`, nunca en un estado colgado.
    category: policy
    applies_to: "SpotifyAuth (C7), SpotifyCard y ConnectionCard"
    trigger: "Se abre la autorización y se espera el retorno."
    logic: >
      Al abrir el navegador el estado pasa a `connecting` y emite por `subscribe`. La
      tarjeta de Perfil pinta «Conectando…» con indicador y el botón deshabilitado; la
      tarjeta de Explorar hace lo mismo en versión compacta. IF la persona cierra el
      navegador, el sistema devuelve `cancel` o el intercambio no llega THEN el estado
      pasa a `connectionError` con «No pudimos conectar con Spotify.» y «Reintentar».
      No se usa un temporizador de UI: el resultado lo da el flujo de autorización.
    violation: >
      Un `connecting` eterno deja la app sin saber si hay sesión y convierte el botón
      en un control muerto que la persona vuelve a tocar sin efecto.
    source: "FR10.7, AC10.2.5, C7 § /auth/connect (504)"

  - id: BR16.4
    statement: >
      El token se guarda en el almacenamiento seguro del dispositivo con
      `expo-secure-store` y se borra al desconectar; ninguna lectura en texto plano lo
      devuelve.
    category: constraint
    applies_to: "SpotifyAuth (C7)"
    trigger: "Termina el intercambio de código o la persona toca «Desconectar»."
    logic: >
      Con el intercambio correcto se guarda un único valor JSON bajo la clave
      `melodify.spotify.token` con `accessToken`, `refreshToken` y `expiresAt`. La
      lectura usa `SecureStore.getItemAsync`; no hay AsyncStorage, ni archivo, ni
      variable de módulo con el token en claro. Al desconectar se llama a
      `SecureStore.deleteItemAsync` y el estado pasa a `disconnected` aunque el borrado
      fallara, porque la sesión visible ya no debe usarse.
    violation: >
      Guardar el token en AsyncStorage o en memoria persistente incumple FR10.3 y NFR3,
      y deja una credencial legible por cualquiera con acceso al almacén.
    source: "FR10.3, NFR3, AC10.1.4, C7 § x-token-storage"

  - id: BR16.5
    statement: >
      La conexión persiste entre reinicios: al arrancar se lee el token guardado y, si
      sigue vigente, el estado es `connected` sin volver a autorizar.
    category: policy
    applies_to: "SpotifyAuth (C7) y el arranque de la app"
    trigger: "La app arranca o vuelve de segundo plano."
    logic: >
      Al construir `SpotifyAuth` se lee el token de forma asíncrona. IF existe y
      `expiresAt` es futuro THEN se emite `connected`; las pantallas que ya estaban
      montadas reciben la emisión y repintan. IF existe pero caducó THEN se intenta
      renovar antes de la primera llamada (BR16.6) y no se pinta `connecting`, porque
      renovar no es autorizar. IF no existe THEN `disconnected`.
    violation: >
      Pedir autorización en cada arranque incumple FR10.4 y AC10.1.3, y convierte una
      app que recuerda la sesión en una que la pierde.
    source: "FR10.4, AC10.1.3, C7 § x-token-lifecycle (persistence)"

  - id: BR16.6
    statement: >
      El token se renueva en silencio 60 s antes de caducar, con una sola renovación a
      la vez; si la renovación falla, el estado pasa a `invalidToken` y la interfaz
      vuelve a «Conectar» con aviso.
    category: policy
    applies_to: "SpotifyAuth (C7) y SpotifyCatalog (C7)"
    trigger: "Una llamada a C10 está a punto de salir y al token le quedan menos de 60 s."
    logic: >
      Antes de cada petición, IF `expiresAt - ahora < 60 s` THEN se renueva con el
      `refresh_token`. Las llamadas en vuelo comparten la misma promesa: no hay dos
      renovaciones simultáneas. Mientras se renueva, el estado visible sigue siendo
      `connected` y la persona sigue viendo «Conectado». Con éxito se guarda el token
      nuevo y todo sigue igual. Con fallo se borra el token, se emite `invalidToken` y
      no se reintenta la petición original.
    violation: >
      Renovar en cada llamada multiplica peticiones (OQ2); no renovar nunca convierte
      cualquier caducidad en un fallo de búsqueda que la persona no puede explicar.
    source: "C7 § x-token-lifecycle, FR10.5, AC10.2.3, OQ2"

  - id: BR16.7
    statement: >
      La conexión tiene seis estados observables —`disconnected`, `connecting`,
      `connected`, `connectionError`, `invalidToken` y `notConfigured`— y cada uno tiene
      un texto y una acción en Perfil.
    category: policy
    applies_to: "SpotifyAuth (C7), ShellServices.spotify (C2) y SpotifyCard (C1)"
    trigger: "Cambia el estado de la conexión."
    logic: >
      `disconnected`: «Sin conectar» + «Conectar con Spotify». `connecting`:
      «Conectando…» + indicador, botón deshabilitado. `connected`: «Conectado» +
      «Desconectar». `connectionError`: «No pudimos conectar con Spotify.» +
      «Reintentar». `invalidToken`: «Tu sesión de Spotify caducó. Vuelve a conectar.» +
      «Conectar con Spotify». `notConfigured`: «La conexión con Spotify no está
      configurada en esta instalación.» + «Reintentar». La tarjeta de Explorar solo usa
      los estados que puede provocar su botón (`disconnected`, `connecting`,
      `connectionError`, `notConfigured`); `connected` la hace desaparecer e
      `invalidToken` se muestra con el aviso de resultados (BR18.6).
    violation: >
      Un estado sin texto ni acción deja a la persona mirando un punto muerto; juntar
      `invalidToken` y `connectionError` impide saber si hay que reconectar o reintentar.
    source: "FR9.5, AC10.1.6, interaction-spec.md § SpotifyCard, mockups.md § Perfil"

  - id: BR16.8
    statement: >
      Si falta `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` o no es válida, la app arranca sin sesión,
      sigue operativa con el catálogo de ejemplo y, al tocar «Conectar», muestra el aviso
      de instalación no configurada con «Reintentar».
    category: validation
    applies_to: "SpotifyAuth (C7), ConnectionCard y SpotifyCard"
    trigger: "La app arranca sin client ID o la persona toca conectar."
    logic: >
      Al construir el paquete, IF el client ID está vacío o no tiene forma de
      identificador THEN el estado inicial es `notConfigured` y no se abre ninguna URL.
      El client ID se recibe una sola vez al construir `auth` y no se relee con la app en
      marcha: por eso `notConfigured` solo sale de sí mismo tras reiniciar la app con la
      variable puesta (o al recompilar la instancia en desarrollo). El resto de la app
      funciona igual: Inicio, Explorar con sugerencias, Crear, Actividad y Perfil leen el
      contenido local. Tocar «Conectar» o «Reintentar» reintenta el flujo completo y, si
      la variable sigue faltando, se queda en `notConfigured`. No se bloquea ninguna
      pantalla ni se muestra un error técnico.
    violation: >
      Una instalación sin configurar debe seguir sirviendo; si la falta de una variable
      rompe Explorar o Crear, la app deja de cumplir el recorrido sin sesión (FR12.2).
    source: "FR10.8, AC10.1.5, C7 § /auth/connect (400)"

  - id: BR16.9
    statement: >
      «Desconectar» borra el token, deja el estado en `disconnected`, confirma con
      «Spotify desconectado» y devuelve las portadas al bloque con la inicial sin tocar
      el contenido local.
    category: policy
    applies_to: "SpotifyCard, ShellServices.spotify, Catalog (C5) y AppShell"
    trigger: "La persona toca «Desconectar» en Perfil estando conectada."
    logic: >
      Se llama a `disconnect()`, que borra el token y emite `disconnected`. La cáscara
      no cambia de pestaña y muestra el snackbar «Spotify desconectado». C5 recalcula
      cada portada en su siguiente lectura: sin sesión devuelve `initialBlock`, así que
      Inicio, el detalle y los resultados repintan bloques con la inicial. Las opiniones,
      me gusta, comentarios y seguimientos no se tocan: son locales y no dependen de
      Spotify.
    violation: >
      Borrar el token sin avisar deja la pantalla sin explicación; tocar el contenido
      local al desconectar convertiría una integración de lectura en una pérdida de datos.
    source: "FR9.2, AC10.2.1, AC10.2.2, FR3.4; C5 § /cover (bloque de la inicial)"

  - id: BR16.10
    statement: >
      Ningún fallo de autorización, intercambio, lectura o borrado del token queda en
      silencio: siempre hay un texto en lenguaje llano y una acción.
    category: policy
    applies_to: "SpotifyAuth (C7), SpotifyCard y ConnectionCard"
    trigger: "Cualquier operación de la conexión falla."
    logic: >
      El fallo se normaliza al estado que le corresponde (`connectionError`,
      `invalidToken` o `notConfigured`) y se registra con el logger del proyecto sin
      exponer el mensaje técnico. La interfaz muestra el texto del estado y su acción;
      nunca un código HTTP, un mensaje en inglés ni un estado vacío. Un fallo al borrar
      el token no impide el paso a `disconnected`: se registra y la sesión visible se
      descarta igual.
    violation: >
      Un fallo silencioso deja a la persona creyendo que sigue conectada cuando ya no
      puede buscar, y contradice FR10.7 y FR11.2.
    source: "FR10.7, FR11.2, AC10.2.4, NFR9.4"

  - id: BR16.11
    statement: >
      La sesión de Spotify y la sesión de la app son independientes: cerrar sesión en
      Melodify no desconecta Spotify, y desconectar Spotify no cierra la app.
    category: constraint
    applies_to: "AppSession (C3), SpotifyAuth (C7) y AppShell"
    trigger: "La persona cierra sesión en Perfil o desconecta Spotify."
    logic: >
      «Cerrar sesión» borra el recuerdo de C3 y vuelve a Login; no toca el token de
      Spotify. «Desconectar» borra el token de Spotify y no toca C3. Al volver a entrar
      con la cuenta demo, si el token de Spotify sigue guardado, el estado vuelve a
      `connected`.
    violation: >
      Acoplar las dos sesiones hace que cerrar sesión en la app borre una autorización
      que la persona no pidió borrar, y que desconectar Spotify la expulse de Melodify.
    source: "C3 § components.md § AppSession; unit-of-work.md § U1 (invariante)"

  - id: BR16.12
    statement: >
      El token y el almacenamiento seguro viven solo en `@melodify/spotify/auth`; las
      pantallas y la cáscara conocen estados y acciones, nunca el token.
    category: constraint
    applies_to: "C7, C2 y todas las pantallas"
    trigger: "Cualquier lectura o escritura relacionada con Spotify."
    logic: >
      `@melodify/spotify/catalog` pide el token a `auth` y nunca lo lee ni lo guarda.
      `ShellServices.spotify` expone `status`, `subscribe`, `connect`, `disconnect` y
      `retry`; no expone el token. Ninguna pantalla importa `expo-secure-store` ni
      `@melodify/spotify/auth` directamente. La instancia se crea una sola vez en el
      punto de composición.
    violation: >
      Un token que circula por props o contextos acaba en un log, en una prueba o en
      una captura; y dos instancias de auth darían dos verdades sobre la sesión.
    source: "C7 § x-modules, NFR3.11, ADR-004, TS-18"

  - id: BR17.1
    statement: >
      La búsqueda de Explorar se dispara desde 2 caracteres, espera 400 ms desde la
      última pulsación y no lanza ninguna petición por debajo de ese umbral.
    category: validation
    applies_to: "ExplorarScreen, useWorkSearch y Catalog (C5)"
    trigger: "La persona escribe o borra en el campo de búsqueda."
    logic: >
      Cada cambio cancela el temporizador anterior y programa uno nuevo de 400 ms sobre
      la consulta normalizada (`trim` y espacios colapsados). IF la consulta normalizada
      tiene menos de 2 caracteres THEN no se pide nada y se pinta «Escribe al menos 2
      caracteres.» (o el estado inicial si está vacía). IF llega a 2 THEN se pide una
      sola vez a C5. El texto del campo conserva lo que la persona escribió, con sus
      espacios.
    violation: >
      Pedir por cada pulsación multiplica llamadas a Spotify (OQ2) y hace que la lista
      parpadee con resultados de prefijos que ya no interesan.
    source: "FR4.2, AC3.1.1, Q3 = B"

  - id: BR17.2
    statement: >
      Las búsquedas correctas se guardan en memoria por consulta normalizada; repetir
      una búsqueda devuelve los mismos resultados sin petición y sin indicador de carga.
    category: policy
    applies_to: "Catalog (C5) y useWorkSearch"
    trigger: "Se repite una consulta ya resuelta."
    logic: >
      C5 guarda en su caché solo las respuestas `ok`; un `offline` o un `error` no se
      guarda, para que la persona pueda reintentar. Las respuestas con artistas se
      cachean junto con las obras. IF la consulta normalizada ya está en caché THEN se
      devuelve sin tocar la red y el hook pasa directamente a `results`, sin esqueletos.
      La caché vive mientras dure la app y se pierde al cerrarla.
    violation: >
      Cachear un fallo condena la consulta hasta reiniciar; no cachear nada repite
      peticiones que la persona ya pagó y hace que volver atrás parezca una búsqueda nueva.
    source: "FR4.2, AC3.1.6, OQ2, C5 § /works (caché)"

  - id: BR17.3
    statement: >
      La búsqueda devuelve tres clases de resultado: canciones y álbumes son obras
      opinables y los artistas son atajos de búsqueda; la lista se ordena canciones,
      álbumes y artistas.
    category: policy
    applies_to: "SpotifyCatalog (C7), Catalog (C5), ExplorarScreen y ArtistResultRow"
    trigger: "Llega una respuesta de búsqueda."
    logic: >
      C10 se pide con `type=track,album,artist`. Las canciones y los álbumes se mapean a
      `WorkView` con `workKind: 'track' | 'album'`; los artistas se mapean a `ArtistHit`
      (`artistId`, `name`) sin inventar título, portada ni recuento. La lista pinta
      primero las obras y después las filas de artista, cada clase con su componente.
      IF una clase viene vacía THEN no se pinta su encabezado ni un hueco.
    violation: >
      Meter un artista en una fila de obra le inventa un título y un recuento de
      opiniones que no existen; descartar los artistas deja la promesa del campo a medias.
    source: "FR4.1, Q3 = B, Q5 = A; C10"

  - id: BR17.4
    statement: >
      C10 se consulta con `type=track,album,artist`, hasta 10 resultados por clase, y la
      respuesta se normaliza a `works` y `artists` antes de cruzar C5.
    category: constraint
    applies_to: "SpotifyCatalog (C7) y C10"
    trigger: "Se ejecuta una búsqueda con sesión."
    logic: >
      La petición es `GET /search?q=<consulta>&type=track,album,artist&limit=10`. La
      canción toma `name`, el primer artista y la primera imagen de su álbum; el álbum
      toma `name`, su primer artista y su primera imagen; el artista toma `id` y `name`.
      Los elementos sin `id` o sin `name` se descartan en vez de pintarse a medias. Los
      fallos se mapean a `unauthorized`, `rateLimited`, `timeout`, `network` o `error`.
    violation: >
      Pedir solo canciones contradice Q3 = B; aceptar elementos incompletos pinta filas
      sin título o sin identificador que no se pueden abrir ni opinar.
    source: "Q3 = B, Q5 = A; C10 § /search; C7 § /search"

  - id: BR17.5
    statement: >
      Cada resultado opinable muestra portada, título, artista, una etiqueta de clase
      («Canción» o «Álbum») y «N opiniones» o «Sé el primero en opinar».
    category: policy
    applies_to: "WorkResultRow (C1) y ExplorarScreen"
    trigger: "Se pintan resultados."
    logic: >
      La fila usa `WorkResultRow` con `work` y `opinionCount` de C5. `kind` añade la
      etiqueta de clase en `type.caption`; sin `kind` no se pinta etiqueta (obras de
      ejemplo). El recuento se escribe con palabras y en singular cuando toca; sin
      opiniones se pinta la invitación, nunca un «0 opiniones». La fila entera es el
      objetivo táctil.
    violation: >
      Sin etiqueta, un álbum y una canción con el mismo nombre son indistinguibles; con
      «0 opiniones» una obra nueva parece un error de datos.
    source: "FR4.3, AC3.1.2, AC3.1.3, Q3 = B; mockups.md § Explorar"

  - id: BR17.6
    statement: >
      Tocar la fila de un artista no abre ninguna pantalla: rellena el campo con su
      nombre y relanza la búsqueda con ese texto.
    category: policy
    applies_to: "ArtistResultRow (C1) y ExplorarScreen"
    trigger: "La persona toca una fila de artista."
    logic: >
      El campo pasa a contener el nombre del artista y se dispara la misma búsqueda
      normalizada que si se hubiera escrito, con sus 400 ms y su caché. El foco se
      mantiene en el campo. No se abre el detalle de obra ni Crear, porque un artista no
      es una obra (BR20.6) y no hay pantalla de artista en esta versión.
    violation: >
      Abrir el detalle de una obra con los datos de un artista pinta una obra falsa;
      no hacer nada al tocar una fila visible parece un control roto.
    source: "Q5 = A, AC3.1.8"

  - id: BR17.7
    statement: >
      Explorar cubre siete estados de búsqueda —inicial, corto, buscando, resultados,
      vacío, error y sin conexión— con su texto exacto y sin pantallas en blanco.
    category: policy
    applies_to: "ExplorarScreen y ExplorarView"
    trigger: "Cambia la consulta, la respuesta o la conexión."
    logic: >
      `idle`: título «Encuentra tu próxima opinión», explicación «Busca en el catálogo
      completo de Spotify o empieza por una de estas.» y «Sugerencias para empezar» con
      el catálogo de ejemplo. `short`: «Escribe al menos 2 caracteres.». `searching`: 5
      filas de esqueleto ocupando el espacio de los resultados. `results`: la lista.
      `empty`: «Sin resultados para «…»» + «Prueba con otra grafía o con el nombre del
      artista.». `error`: «No pudimos buscar en Spotify.» + «Reintentar». `offline`:
      banner de sin conexión y, si hay caché de la consulta, sus resultados; si no, «Sin
      conexión. No podemos buscar en Spotify ahora mismo.» + «Reintentar». Un `401` no es
      un fallo de búsqueda: no entra en `error` (BR17.9) y levanta la capa `token caído`
      de BR18.6, que conserva la lista y la consulta que ya estuvieran en pantalla.
    violation: >
      Un estado sin forma deja la pantalla vacía justo cuando la persona necesita saber
      si escribió mal, si no hay red o si Spotify falló.
    source: "FR4.6, FR11.1, AC3.1.4, AC3.1.5, AC3.1.7; mockups.md § Explorar"

  - id: BR17.8
    statement: >
      Cambiar el texto cancela la espera y la petición pendientes, y una respuesta que
      llega tarde se descarta aunque sea correcta.
    category: policy
    applies_to: "useWorkSearch"
    trigger: "La persona sigue escribiendo mientras una búsqueda está en curso."
    logic: >
      Cada cambio invalida el número de petición vigente antes de que el efecto vuelva
      a correr. Al resolver, IF el número no es el vigente THEN no se toca el estado. La
      respuesta tardía no se cachea por su cuenta: la caché la decide C5 con la consulta
      que realmente se pidió.
    violation: >
      Sin descarte, una consulta lenta pisa los resultados de la consulta nueva y la
      lista muestra obras que ya no corresponden al texto del campo.
    source: "interaction-spec.md § Buscar en Spotify; misma regla de descarte que U3"

  - id: BR17.9
    statement: >
      Un fallo de búsqueda conserva el texto escrito y ofrece «Reintentar»; el reintento
      repite la misma consulta con el mismo disparo.
    category: policy
    applies_to: "ExplorarScreen y useWorkSearch"
    trigger: "La búsqueda responde `error` o el puerto falla."
    logic: >
      El estado pasa a `error` con «No pudimos buscar en Spotify.» y «Reintentar», sin
      borrar la consulta. «Reintentar» incrementa el intento y repite la consulta
      vigente tras los mismos 400 ms, sin cambiar el campo. Un `429` y un tiempo de
      espera agotado caen en este mismo estado: la persona reintenta, la app no reintenta
      sola ni introduce una espera que no puede explicar (OQ2). Un `401` no cae aquí: no
      es un fallo de la búsqueda sino de la sesión, y levanta la capa `token caído`
      (BR18.6) sin sustituir la lista.
    violation: >
      Borrar el texto obliga a reescribir lo que ya se había escrito; reintentar solo
      sin decirlo deja el mismo error sin explicación.
    source: "AC3.1.5, FR11.2, C7 § /search (429, 504)"

  - id: BR17.10
    statement: >
      Sin conexión y con sesión, Explorar avisa en la cabecera, conserva los resultados
      en caché si existen y no lanza la petición; sin caché, muestra el error de red.
    category: policy
    applies_to: "ExplorarScreen, ExplorarView, Catalog (C5) y Connectivity (C6)"
    trigger: "La red pasa a desconectada con sesión de Spotify."
    logic: >
      El banner de sin conexión aparece bajo la cabecera con «Sin conexión. No podemos
      buscar en Spotify ahora mismo.» y «Reintentar». IF la consulta vigente ya está en
      caché THEN sus resultados siguen en pantalla con portadas de bloque. IF no hay
      caché THEN se pinta el bloque de error con el mismo texto y la acción. Mientras no
      haya red no se pide a Spotify; al volver la red, «Reintentar» o una nueva
      búsqueda vuelven a pedir.
    violation: >
      Pedir sin red garantiza un fallo que la persona no puede distinguir de un catálogo
      vacío, y tirar la caché borra lo último que sí se pudo leer.
    source: "FR4.6, FR11.4, AC3.2.4; mockups.md § Explorar (sin conexión)"

  - id: BR17.11
    statement: >
      Vaciar el campo vuelve al estado inicial, cancela lo pendiente y no pide nada.
    category: policy
    applies_to: "ExplorarScreen y useWorkSearch"
    trigger: "La persona toca la ✕ del campo o borra todo el texto."
    logic: >
      La consulta queda vacía, se invalida la petición vigente, se limpian los
      resultados y el estado pasa a `idle` con las sugerencias del catálogo de ejemplo.
      No se conserva la lista anterior ni se muestra un esqueleto.
    violation: >
      Dejar resultados de una consulta borrada hace que el campo y la lista digan cosas
      distintas; pedir con la consulta vacía es una petición que no puede acertar.
    source: "FR4.2, interaction-spec.md § Buscar en Spotify"

  - id: BR18.1
    statement: >
      Una portada es una imagen real cuando hay sesión conectada, hay red y C5 consigue
      una URL para la obra —porque la obra ya tiene `coverUrl` o porque la resolución se
      la da—; en cualquier otro caso es el bloque con la inicial.
    category: policy
    applies_to: "Catalog.coverFor (C5), CoverArt (C1), Inicio, detalle y Explorar"
    trigger: "Se pinta una portada o cambia la sesión o la red."
    logic: >
      La decisión la toma C5 en cada llamada, no la pantalla:
      `coverFor(workId)` consulta `session.isConnected()` —el miembro de
      `SpotifySessionPort` que implementa `SpotifyAuth`— y la conectividad. IF no hay
      sesión o no hay red THEN `initialBlock`, sin pedir nada a Spotify. IF hay sesión y
      red y la obra ya trae `coverUrl` THEN devuelve esa `url`. IF hay sesión y red y la
      obra no trae `coverUrl` THEN pide la resolución a `SpotifyResolvePort` y devuelve
      la portada que devuelva; es el camino normal de las obras del catálogo de ejemplo,
      que se siembran con `coverUrl: null`. Un fallo de resolución no cambia la portada a
      imagen: deja `initialBlock` y enciende `getCoverFailure()` (BR18.5). Las pantallas
      no leen el token ni deciden por su cuenta.
    violation: >
      Decidir la portada en la pantalla duplica la regla en cinco sitios y produce
      imágenes rotas cuando la sesión cae entre el render y la carga.
    source: "FR3.4, FR11.3, AC2.2.1, AC2.2.2; C5 § /cover"

  - id: BR18.2
    statement: >
      Cuando no hay portada real se pinta el bloque con la inicial de la obra; nunca un
      hueco roto, un icono de imagen ni un espacio vacío.
    category: policy
    applies_to: "CoverArt (C1) y todas las pantallas con obra"
    trigger: "No hay URL, la URL falla o no hay sesión."
    logic: >
      El bloque usa `surfaceSunken`, la inicial del título en mayúscula y el tamaño que
      le corresponde en cada sitio (56 en fila, 96 en cabecera de detalle, tamaño de la
      tarjeta en el feed). El bloque ocupa siempre el mismo espacio que la imagen, así
      que la lista no salta al cambiar de estado.
    violation: >
      Un hueco sin bloque rompe la altura de la fila y hace que la lista se mueva cada
      vez que una portada falla.
    source: "FR11.3, AC2.2.2, AC2.2.3, interaction-spec.md § CoverArt"

  - id: BR18.3
    statement: >
      Si una portada real no carga, la tarjeta se queda con el bloque de la inicial y no
      se muestra ningún error adicional.
    category: policy
    applies_to: "CoverArt (C1)"
    trigger: "La imagen responde con error o no termina de cargar."
    logic: >
      `CoverArt` escucha el fallo de carga y sustituye la imagen por el mismo bloque con
      la inicial, sin cambiar el tamaño ni desmontar la fila. No se muestra snackbar ni
      banner: la portada es un adorno y su ausencia ya está representada por el bloque.
      El fallo no se reintenta solo; la próxima lectura de C5 puede devolver otra URL.
    violation: >
      Un icono de imagen rota o un aviso por cada portada caída convierte un detalle
      estético en un error que la persona no puede resolver.
    source: "AC2.2.3, FR11.3, interaction-spec.md § CoverArt (fallback)"

  - id: BR18.4
    statement: >
      La decisión de portada se recalcula al cambiar la sesión o la red y la pantalla
      repinta sin volver a montarse.
    category: policy
    applies_to: "Catalog (C5), useCatalog y las pantallas"
    trigger: "Se conecta o desconecta Spotify, o cambia la conectividad."
    logic: >
      C5 emite su catálogo al suscribirse y tras cada cambio de resultado de portada;
      las pantallas se suscriben con `useCatalog` y vuelven a preguntar `coverFor`. La
      sesión entra en la clave de la decisión (C5 pregunta `session.isConnected()` en
      cada llamada) y `SpotifyAuth` notifica el cambio por
      `SpotifySessionPort.onConnectionChange`, que es el mismo par de miembros que C5
      declara en su puerto; `online` entra en la clave del hook del detalle. Al conectar,
      las portadas reales aparecen; al desconectar o perder la red, vuelven los bloques.
    violation: >
      Una foto tomada al montar deja la pantalla con portadas de bloque después de
      conectar, o con portadas reales después de desconectar.
    source: "FR3.4, FR11.4, C5 § /catalog/changes, AC10.2.1"

  - id: BR18.5
    statement: >
      Si falla la resolución de metadatos, Inicio muestra el aviso «No pudimos actualizar
      las portadas.» con «Reintentar» y conserva la lista local con bloques.
    category: policy
    applies_to: "InicioScreen, InicioView y Catalog (C5)"
    trigger: "`getCoverFailure()` es verdadero tras un intento de resolución."
    logic: >
      El aviso se pinta como banner bajo la cabecera y no sustituye la lista: las
      tarjetas siguen visibles con portadas de bloque. «Reintentar» llama a
      `retryCovers()`, que sin puerto de resolución no hace nada y con puerto reintenta
      solo las pendientes. El aviso desaparece cuando la resolución vuelve a funcionar.
    violation: >
      Sustituir el feed por un error convierte un fallo de portadas en la pérdida de las
      opiniones, que sí se pueden leer; y un aviso sin acción no ofrece salida.
    source: "FR3.5; C5 § /catalog/cover-failure"

  - id: BR18.6
    statement: >
      Si la sesión se cae con resultados en pantalla, se conservan la lista y el texto
      buscado con portadas de bloque, y aparece un aviso con «Volver a conectar». Un `401`
      nunca se trata como fallo de búsqueda: no sustituye la lista por el bloque de error.
    category: policy
    applies_to: "ExplorarScreen, ExplorarView y ShellServices.spotify"
    trigger: "El estado de Spotify pasa a `invalidToken` mientras hay resultados, o una búsqueda nueva recibe `401`."
    logic: >
      El `401` de C10 no entra en el estado `error` de BR17.7/BR17.9: `SpotifyAuth` marca
      el token inválido y Explorar levanta la capa `token caído` sobre el estado de
      búsqueda vigente. IF había una lista en pantalla THEN se conservan la lista y la
      consulta tal como estaban —las portadas pasan a bloque porque ya no hay sesión— y
      el resultado de la petición que devolvió `401` se descarta por BR17.8. IF era la
      primera búsqueda y no había lista THEN se ve la capa con el aviso y la zona de
      resultados vacía, sin bloque de error y sin esqueletos: la persona ve el aviso, no
      un fallo de su consulta. En los dos casos la cabecera vuelve a «Conectar», Perfil
      pinta el estado `invalidToken`, y sobre la zona de resultados aparece «Tu sesión de
      Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.» con la
      acción «Volver a conectar», que relanza el flujo PKCE. El campo de búsqueda sigue
      visible y editable mientras la capa está puesta; escribir con la capa puesta no
      lanza petición (BR19.5). Tras reconectar, la capa desaparece, el campo vuelve a
      buscar y los resultados anteriores no se revalidan solos. Es FR11.4 aplicado
      también al token caído.
    violation: >
      Sustituir la lista por la tarjeta de conexión borra lo que la persona estaba
      leyendo y su consulta, y la obliga a empezar de cero justo cuando el fallo no es suyo.
    source: "Q4 = A, FR10.5, AC10.2.3, FR11.4"

  - id: BR19.1
    statement: >
      Sin sesión de Spotify, Explorar muestra la tarjeta de conexión y, debajo, las obras
      del catálogo de ejemplo como sugerencia, sin buscador y sin ninguna petición.
    category: policy
    applies_to: "ExplorarScreen, ExplorarView y ConnectionCard (C1)"
    trigger: "Se abre Explorar con el estado `disconnected`, `connectionError` o `notConfigured`."
    logic: >
      La vista pinta la `ConnectionCard` con título «Busca en todo Spotify», cuerpo
      «Conecta tu cuenta para buscar en el catálogo completo. Mientras tanto, estas obras
      del catálogo de ejemplo también se pueden opinar.» y acción «Conectar con Spotify»;
      debajo, «Sugerencias para empezar» con las obras de `listSampleWorks()`. El campo de
      búsqueda no se pinta: sin sesión no hay catálogo que consultar y un campo que no
      busca es una promesa falsa. Las sugerencias se abren y se pueden opinar como
      cualquier obra (BR20).
    violation: >
      Un buscador que siempre falla sin sesión es peor que su ausencia; ocultar las
      sugerencias deja la pantalla sin nada que hacer y rompe US3.2.
    source: "FR4.5, AC3.2.1, AC3.2.2, Q1 = B"

  - id: BR19.2
    statement: >
      El botón «Conectar con Spotify» de Explorar inicia PKCE y muestra en la propia
      tarjeta los estados `connecting`, `connectionError` y `notConfigured` con su acción.
    category: policy
    applies_to: "ConnectionCard (C1) y ExplorarScreen"
    trigger: "La persona toca la acción de la tarjeta o la conexión cambia."
    logic: >
      La tarjeta recibe el estado vigente de `services.spotify`. En `connecting` el
      botón queda deshabilitado con «Conectando…» y un indicador; en `connectionError`,
      «No pudimos conectar con Spotify.» y «Reintentar»; en `notConfigured`, «La conexión
      con Spotify no está configurada en esta instalación.» y «Reintentar»; en
      `notConfigured` la acción reintenta el flujo completo, que vuelve a leer el client
      ID con el que se construyó `auth` (BR16.8) y, si sigue faltando, deja otra vez el
      mismo estado. Las sugerencias siguen visibles en los cuatro estados.
    violation: >
      Una tarjeta que no refleja el estado deja a la persona tocando un botón que ya
      está trabajando o que ya falló, sin saberlo.
    source: "FR4.5, FR10.7, AC10.1.5, AC10.2.4, interaction-spec.md § ConnectionCard"

  - id: BR19.3
    statement: >
      Sin sesión y sin conexión, Explorar muestra la tarjeta de conexión, las sugerencias
      y el aviso de sin conexión en la cabecera, sin ningún error adicional.
    category: policy
    applies_to: "ExplorarScreen, ExplorarView y OfflineBanner"
    trigger: "La red está desconectada y no hay sesión de Spotify."
    logic: >
      El banner de sin conexión se pinta bajo la cabecera con el texto de la app
      («Sin conexión. Estás viendo lo último que cargamos.»). La tarjeta de conexión y las
      sugerencias siguen visibles y operativas: las obras de ejemplo se leen de memoria y
      se pueden opinar. No se muestra el bloque de error de búsqueda, porque no hay
      ninguna búsqueda en curso.
    violation: >
      Un error de búsqueda sin búsqueda confunde; ocultar las sugerencias sin red quita
      la única parte de Explorar que sí funciona.
    source: "AC3.2.4, FR11.4, mockups.md § Matriz de estados"

  - id: BR19.4
    statement: >
      El chip de Spotify de Inicio dice «Conectado» solo con sesión conectada; en
      cualquier otro estado dice «Conectar» y abre el flujo de conexión, mientras que
      «Conectado» lleva a Perfil.
    category: policy
    applies_to: "InicioHeader, InicioScreen y ShellServices.spotify"
    trigger: "La persona toca el chip o cambia el estado de Spotify."
    logic: >
      IF `status === 'connected'` THEN el texto es «Conectado», con su punto verde y
      `accessibilityLabel` «Conectado»; al tocar se llama a `goToTab({ name: 'perfil' })`.
      ELSE el texto es «Conectar» y al tocar se llama a `services.spotify.connect()`.
      `connecting`, `connectionError`, `invalidToken` y `notConfigured` se leen como
      «Conectar»: el chip distingue dos estados, no seis, como fija el mockup.
    violation: >
      Un chip que dice «Conectado» con el token caducado miente sobre la sesión; uno que
      no responde obliga a buscar la conexión en otra pantalla.
    source: "FR3.3, AC10.1.2, AC10.2.3, mockups.md § Inicio (chip)"

  - id: BR19.5
    statement: >
      Sin sesión de Spotify no se lanza ninguna petición de red ni se muestra un error
      por su ausencia; la app entera funciona con el catálogo de ejemplo.
    category: constraint
    applies_to: "Explorar, Crear, Inicio, detalle y Perfil"
    trigger: "Cualquier pantalla se abre sin sesión."
    logic: >
      Con `session === null` o sin conexión, C5 responde `offline` a `searchWorks` sin
      tocar la red y `initialBlock` a `coverFor`. Las pantallas no llaman a C7
      directamente. La ausencia de Spotify se representa con la tarjeta de conexión y los
      bloques con la inicial, nunca con un mensaje de error.
    violation: >
      Tratar «sin sesión» como un fallo convierte el recorrido sin Spotify (FR12.2,
      US11.1) en una sucesión de errores.
    source: "FR4.5, FR10.8, FR12.2, C5 § /works (offline), CT-02"

  - id: BR20.1
    statement: >
      Tocar un resultado opinable abre el detalle de esa obra dentro de la pestaña
      Explorar, con la `WorkView` completa viajando por la ruta además del `workId`.
    category: policy
    applies_to: "ExplorarScreen, GlobalServices.openWorkDetail (C2) y DetalleObraScreen"
    trigger: "La persona toca un `WorkResultRow` de resultados o de sugerencias."
    logic: >
      La fila llama a `openWorkDetail({ workId, data })`, donde `data` es la `WorkView`
      del resultado. La cáscara apila el detalle de obra de la pestaña activa y le pasa
      `work: { workId, data }`. El detalle se abre encima de Explorar; volver devuelve a
      la lista con su texto y sus resultados intactos.
    violation: >
      Pasar solo el `workId` deja el detalle sin metadatos para una obra que el catálogo
      local no conoce y lo pinta como «no encontrada» (AC3.1.8).
    source: "FR4.4, AC3.1.8, Q2 = A"

  - id: BR20.2
    statement: >
      Al abrir una obra, el catálogo local manda si la conoce; si no, se usan los datos
      que llegan por la ruta; las opiniones se leen siempre por `workId`.
    category: policy
    applies_to: "useDetalleObra, useCrear, Catalog (C5) y C2"
    trigger: "Se abre el detalle o Crear con una obra."
    logic: >
      IF `catalog.getWork(workId)` responde `ok` THEN se usan título, artista, portada y
      `workKind` del catálogo (es la obra ya registrada o de ejemplo). ELSE IF la ruta
      trae `data` THEN se usa tal cual. ELSE la obra no se puede pintar (BR20.7). Las
      opiniones se piden a C4 por `workId`, sin importar de dónde salieron los metadatos.
    violation: >
      Preferir la ruta pisaría la identidad ya guardada de una obra de ejemplo; preferir
      solo el catálogo deja fuera toda obra de Spotify que no se haya buscado antes.
    source: "Q2 = A, AC3.1.8, FR4.4"

  - id: BR20.3
    statement: >
      Una obra que llega por la ruta y no tiene opiniones se pinta con su identidad y la
      invitación «Sé el primero en opinar» / «Opinar sobre esta obra».
    category: policy
    applies_to: "DetalleObraView y useDetalleObra"
    trigger: "Se abre el detalle de una obra sin opiniones."
    logic: >
      La vista pinta la cabecera con portada (real o bloque), título, artista y
      «0 opiniones» o el texto vacío que ya usa U2, más el botón «Opinar sobre esta
      obra». El estado vacío no es un error: la obra existe y el detalle ofrece la acción
      que la historia pide.
    violation: >
      Tratar una obra nueva como un error impide el camino «buscar → abrir → opinar» que
      es el objetivo de Explorar.
    source: "FR6.6, AC4.3.1, AC3.1.8, AC3.1.3"

  - id: BR20.4
    statement: >
      «Opinar sobre esta obra» abre Crear con la obra preseleccionada por ruta, sin
      buscador y con la fila fija; publicar sobre una obra de Spotify funciona igual que
      sobre una de ejemplo.
    category: policy
    applies_to: "DetalleObraScreen, GlobalServices.openCreate (C2) y useCrear"
    trigger: "La persona toca «Opinar sobre esta obra»."
    logic: >
      La llamada es `openCreate({ workId, data })`. La cáscara guarda
      `preselectedWorkId` y `preselectedWork` en `CreateEntry`, y Crear resuelve la obra
      con la precedencia de BR20.2. La pantalla abre en modo publicar, con la obra fija,
      el buscador plegado y «Cambiar» disponible; el texto y la valoración se piden como
      en U3 y la publicación guarda la opinión con el título y el artista de la obra.
    violation: >
      Abrir Crear vacío obliga a buscar otra vez la obra que ya se estaba mirando y
      pierde el camino de un toque que AC5.3.1 exige.
    source: "FR6.6, FR5.5, AC5.3.1, Q2 = A"

  - id: BR20.5
    statement: >
      Un álbum es una obra opinable: su título es el nombre del álbum, su artista es el
      artista principal y su `workKind` es `album`; el detalle, Crear y las opiniones se
      comportan igual que con una canción.
    category: policy
    applies_to: "SpotifyCatalog (C7), Catalog (C5), WorkView y DetalleObraView"
    trigger: "Se busca o se abre un álbum."
    logic: >
      C7 mapea el álbum a `WorkView` con `workKind: 'album'` y lo resuelve con
      `GET /albums/{id}` cuando `GET /tracks/{id}` responde `404`. C5 lo registra y lo
      cuenta como cualquier obra; el detalle pinta su identidad y sus opiniones. Un
      álbum y una canción pueden compartir título: la etiqueta de clase de BR17.5 los
      distingue en la lista, no un identificador visible.
    violation: >
      Tratar el álbum como un resultado de segunda clase deja sin opinión una obra que la
      búsqueda sí devuelve y que el modelo admite.
    source: "Q3 = B, Q5 = A, FR4.1, FR4.4; C7 § /tracks/{workId}"

  - id: BR20.6
    statement: >
      Un artista no es una obra: no abre detalle, no abre Crear y no tiene recuento de
      opiniones.
    category: constraint
    applies_to: "ArtistResultRow (C1), ExplorarScreen y C5"
    trigger: "La persona toca una fila de artista."
    logic: >
      La única acción de la fila es BR17.6: rellenar el campo con su nombre y relanzar la
      búsqueda. No se llama a `openWorkDetail` ni a `openCreate`, no se pide
      `countOpinions` y no se le asigna portada de obra. Si en el futuro se quiere una
      pantalla de artista, es una historia nueva, no una reutilización de esta fila.
    violation: >
      Inventar una obra con el nombre del artista permite publicar una opinión sobre algo
      que no existe como obra y ensucia el catálogo local.
    source: "Q5 = A, C5 § WorkView, C10 § /search (artists)"

  - id: BR20.7
    statement: >
      Si una obra no está en el catálogo local ni llega con datos por la ruta, el detalle
      muestra «No pudimos cargar esta obra.» con «Reintentar» y no inventa metadatos.
    category: validation
    applies_to: "useDetalleObra y DetalleObraView"
    trigger: "Se abre un detalle con un `workId` sin `data` y `getWork` responde `404`."
    logic: >
      La vista pinta el bloque de error con el texto y la acción, sin cabecera de obra ni
      botón de opinar. «Reintentar» repite la lectura por si el catálogo se pobló
      mientras tanto. Es una ruta defensiva: el camino normal siempre trae `data`.
    violation: >
      Pintar una obra con título vacío o con el identificador como título convierte un
      enlace roto en una obra falsa opinable.
    source: "FR11.1, FR11.2, Q2 = A"

  - id: BR20.8
    statement: >
      Toda obra que llega por una búsqueda queda registrada en el catálogo local para que
      su recuento, su portada y su detalle se resuelvan después sin volver a buscar.
    category: policy
    applies_to: "Catalog.searchWorks (C5)"
    trigger: "Una búsqueda devuelve obras."
    logic: >
      C5 registra cada `WorkView` nueva antes de emitir el catálogo (comportamiento ya
      entregado en U2). Con la búsqueda de canciones y álbumes, el registro cubre las dos
      clases. El detalle y Crear leen de ahí cuando la obra ya está; la ruta solo cubre el
      hueco de una obra que llegara sin pasar por la caché. No se añade una escritura
      nueva a C5 ni se fusionan obras con el mismo `workId`.
    violation: >
      Sin registro, el recuento de una obra buscada sería siempre cero y su portada no se
      podría resolver al volver a abrirla.
    source: "C5 § searchWorks, Q2 = A"

  - id: BR20.9
    statement: >
      `workKind` es opcional: sin él, una obra se trata como canción; las obras de ejemplo
      y cualquier consumidor anterior siguen compilando sin cambios.
    category: constraint
    applies_to: "WorkView (C5), WorkResultRow (C1) y C7"
    trigger: "Se lee o se pinta una obra sin `workKind`."
    logic: >
      IF `workKind` está ausente THEN se asume `track` para la resolución y no se pinta
      etiqueta de clase en la fila. C7 siempre lo rellena al buscar o resolver; las obras
      de ejemplo de U2 no lo llevan y no cambian de aspecto.
    violation: >
      Hacer obligatorio el campo rompe el contrato de C5 y obliga a tocar la siembra de
      U2 para un dato que solo la búsqueda necesita.
    source: "C5 1.2.0, Q3 = B, Q5 = A"
```

## Resumen de reglas

| Regla | Categoría | Qué fija | Fuente |
|---|---|---|---|
| **BR16.1** | constraint | PKCE S256, client ID por entorno y sin secret. | FR10.1, FR10.2, FR10.6 |
| **BR16.2** | policy | Redirect por entorno o `makeRedirectUri()`; si el panel lo rechaza, se anota. | A6, RC-09, Q1 = B |
| **BR16.3** | policy | `connecting` con acción deshabilitada; abandono → `connectionError`. | FR10.7, AC10.2.5 |
| **BR16.4** | constraint | Token en `expo-secure-store`, borrado al desconectar. | FR10.3, AC10.1.4 |
| **BR16.5** | policy | La conexión persiste entre reinicios. | FR10.4, AC10.1.3 |
| **BR16.6** | policy | Renovación a 60 s, una sola a la vez; fallo → `invalidToken`. | C7, FR10.5, OQ2 |
| **BR16.7** | policy | Seis estados con texto y acción. | FR9.5, AC10.1.6 |
| **BR16.8** | validation | Sin client ID: `notConfigured` y la app sigue operativa. | FR10.8, AC10.1.5 |
| **BR16.9** | policy | Desconectar borra token, confirma y devuelve bloques. | FR9.2, AC10.2.1, AC10.2.2 |
| **BR16.10** | policy | Ningún fallo de conexión en silencio. | FR10.7, FR11.2 |
| **BR16.11** | constraint | Sesión de Spotify y sesión de la app son independientes. | C3, U1 |
| **BR16.12** | constraint | El token solo vive en `spotify/auth`; nadie más lo ve. | C7, NFR3.11 |
| **BR17.1** | validation | 2 caracteres y 400 ms; nada por debajo. | FR4.2, AC3.1.1 |
| **BR17.2** | policy | Caché por consulta normalizada; repetir no pide. | FR4.2, AC3.1.6, OQ2 |
| **BR17.3** | policy | Canciones y álbumes son obras; artistas son atajos; orden por clase. | Q3 = B, Q5 = A |
| **BR17.4** | constraint | `type=track,album,artist`, 10 por clase y normalización. | Q3 = B, C10 |
| **BR17.5** | policy | Portada, título, artista, etiqueta de clase y recuento o invitación. | FR4.3, AC3.1.2, AC3.1.3 |
| **BR17.6** | policy | Tocar artista rellena el campo y relanza la búsqueda. | Q5 = A |
| **BR17.7** | policy | Siete estados de búsqueda con texto exacto. | FR4.6, AC3.1.4, AC3.1.5, AC3.1.7 |
| **BR17.8** | policy | Se cancela lo pendiente y se descartan respuestas tardías. | interaction-spec |
| **BR17.9** | policy | Error con «Reintentar» conservando el texto. | AC3.1.5, FR11.2 |
| **BR17.10** | policy | Sin red: banner, caché si existe y ninguna petición. | FR4.6, FR11.4, AC3.2.4 |
| **BR17.11** | policy | Vaciar el campo vuelve al estado inicial. | FR4.2 |
| **BR18.1** | policy | Portada real con sesión, red y URL —propia o resuelta—. | FR3.4, AC2.2.1; C5 § /cover |
| **BR18.2** | policy | Sin portada, bloque con la inicial; nunca un hueco. | FR11.3, AC2.2.2 |
| **BR18.3** | policy | Portada que falla → bloque, sin aviso adicional. | AC2.2.3, FR11.3 |
| **BR18.4** | policy | La decisión se recalcula al cambiar sesión o red. | FR3.4, C5 § /catalog/changes |
| **BR18.5** | policy | Fallo de metadatos: banner con «Reintentar» y lista visible. | FR3.5; C5 § /catalog/cover-failure |
| **BR18.6** | policy | Token caído: ni error ni lista borrada; aviso «Volver a conectar». | Q4 = A, AC10.2.3, FR11.4 |
| **BR19.1** | policy | Sin sesión: tarjeta de conexión y sugerencias, sin buscador. | FR4.5, AC3.2.1, AC3.2.2 |
| **BR19.2** | policy | La tarjeta refleja `connecting`, `connectionError` y `notConfigured`. | FR10.7, AC10.1.5, AC10.2.4 |
| **BR19.3** | policy | Sin sesión y sin red: tarjeta, sugerencias y banner. | AC3.2.4, FR11.4 |
| **BR19.4** | policy | El chip dice «Conectado» solo con sesión; «Conectar» abre PKCE. | FR3.3, AC10.1.2, AC10.2.3 |
| **BR19.5** | constraint | Sin sesión no hay peticiones ni errores por su ausencia. | FR4.5, FR10.8, FR12.2 |
| **BR20.1** | policy | Tocar un resultado abre el detalle con la `WorkView` por ruta. | FR4.4, AC3.1.8, Q2 = A |
| **BR20.2** | policy | Precedencia catálogo local → ruta; opiniones por `workId`. | Q2 = A, AC3.1.8 |
| **BR20.3** | policy | Obra sin opiniones: identidad e invitación a opinar. | FR6.6, AC4.3.1 |
| **BR20.4** | policy | «Opinar» abre Crear con la obra preseleccionada. | FR5.5, AC5.3.1 |
| **BR20.5** | policy | El álbum es una obra opinable con `workKind: album`. | Q3 = B, Q5 = A, C7 |
| **BR20.6** | constraint | Un artista no es una obra ni abre detalle ni Crear. | Q5 = A |
| **BR20.7** | validation | Obra desconocida sin datos: error con «Reintentar». | FR11.1, FR11.2 |
| **BR20.8** | policy | La obra buscada queda registrada en C5 para su recuento y portada. | C5 § searchWorks |
| **BR20.9** | constraint | `workKind` opcional; sin él se asume canción. | C5 1.2.0 |

## Enmienda del 2026-11-24 — el `limit` de BR17.4 baja a 10

La referencia de Spotify para `/search` acota `limit` a **0–10 por tipo**; el `20` con el que nació BR17.4 devolvía `400` y la búsqueda no llegaba a ejecutarse. BR17.4 queda en **10 por clase** (hasta treinta filas) y sin paginación, igual que su fuente en `contract-summary.md` § C10, § «Enmienda del 2026-11-24» (revisión 18). El resto de la regla —normalización a `works` y `artists`, descarte de elementos incompletos y mapeo de fallos— no cambia.

## Assumptions & Open Questions

- `[assumption]` **Q1 = B deja la conexión real a expensas del panel.** Si Spotify rechaza `exp://<ip>:8081/--/spotify-callback`, esta unidad entrega PKCE completo y probado con dobles, y el recorrido en el teléfono se demuestra sin sesión (FR12.2). El motivo se anota en `external-dependency-map.md` y en `memory.md` de la etapa. No se cambia a `expo-dev-client` ni a `melodify://` porque CT-05 y `team.md` § Deployment lo prohíben.
- `[assumption]` **La renovación del token no se ve.** Ocurre dentro de la llamada que la persona ya está haciendo; un indicador duraría un fotograma y añadiría un estado que nadie aprende. Solo su fallo se ve, como `invalidToken`.
- `[assumption]` **El artista no tiene imagen.** La fila de artista usa el bloque circular con la inicial, como el resto de portadas sin imagen; pedir `images` de artista añadiría una URL que no se usa en ninguna historia. Si U6 quiere la imagen, es un cambio de C1 y de la fila, no de C7.
- `[assumption]` **La etiqueta «Canción»/«Álbum» no está en el mockup.** Es una adición de esta etapa para que dos obras con el mismo título no se confundan; se pinta en `type.caption`, no cambia la altura de la fila y no sustituye al recuento.
- `[assumption]` **Explorar sin sesión no pinta el buscador.** El mockup dibuja el campo siempre, pero FR4.5 y AC3.2.1 describen la pantalla sin sesión como tarjeta + sugerencias. Un campo que no puede buscar se consideraría una promesa falsa; se aparta del dibujo y se registra en `functional-spec.md` § Assumptions.
- `[assumption]` **El aviso de token caído vive en Explorar, no en la cáscara.** Es la pantalla la que conserva resultados y consulta (Q4 = A); la cáscara solo publica el estado. Perfil muestra el estado `invalidToken` de la tarjeta y la cabecera de Inicio vuelve a «Conectar».
- `[assumption]` **La caché de C5 se conserva al caer la sesión.** No se invalida al pasar a `invalidToken`: son datos ya leídos que la persona está mirando. Al reconectar, una nueva búsqueda vuelve a pedir y actualiza la caché.
- **Ninguna pregunta abierta bloquea la construcción.** La única dependencia externa es el registro del redirect en el panel de Spotify, y su desenlace ya está previsto en FR12.2.
