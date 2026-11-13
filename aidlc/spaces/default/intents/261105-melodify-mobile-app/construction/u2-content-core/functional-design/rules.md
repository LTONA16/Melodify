# Reglas de negocio — U2 `u2-content-core`

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (U2), `inception/units-generation/unit-of-work-story-map.md` (US2.1–US2.3, US4.1–US4.3, US9.1), `inception/user-stories/stories.md` (AC2.1.1–AC2.3.3, AC4.1.1–AC4.3.3, AC9.1.1–AC9.1.8), `inception/requirements-analysis/requirements.md` (FR3, FR6, FR9, FR11, FR2.3), `inception/domain-design/components.md` (ContentStore, Catalog, Connectivity), `inception/contract-design/contract-summary.md` (C4, C5, C6, C1 1.2.0 y C2) y las respuestas de `functional-design-questions.md` (Q1 = A, Q2 = A, Q3 = A).
> Fecha: 2026-11-12. Etapa: Functional Design · Unidad: `u2-content-core`.

El bloque `yaml` es la fuente de verdad; la tabla de después es la misma información puesta para leerla. Los grupos son: **BR4** contenido en memoria (`ContentStore`), **BR5** catálogo y portadas (`Catalog`), **BR6** conectividad (`Connectivity`), **BR7** Inicio, **BR8** detalle de obra y de opinión, **BR9** Perfil y **BR10** navegación y estados comunes. La numeración continúa la de U1 para que la traza de la unidad no colisione con las reglas ya publicadas.

```yaml
rules:
  - id: BR4.1
    statement: >
      Todo el contenido de la app vive en un solo ContentStore, en memoria, y es la
      única fuente de opiniones, autores, me gusta, comentarios y seguimientos.
    category: constraint
    applies_to: "ContentStore (C4) y las pantallas de U2"
    trigger: "Cualquier lectura o escritura de contenido."
    logic: >
      IF una pantalla necesita opiniones, autores, contadores o seguimientos
      THEN pedirlos a ContentStore con el identificador de quien mira (`viewerId`),
      y no guardar copias propias del contenido ni leer la semilla por su cuenta.
      El contenido se pierde al cerrar la app y la interfaz no promete lo contrario.
    violation: >
      Una copia local del contenido se desincroniza en cuanto U3 escribe y deja dos
      verdades sobre la misma opinión.
    source: "FR3.1, FR3.7; components.md § ContentStore"

  - id: BR4.2
    statement: >
      ContentStore siembra al arrancar 10 opiniones de 5 autores sobre 8 obras, con
      3 opiniones de la cuenta demo, 2 autores seguidos, 2 me gusta recibidos,
      2 me gusta de otros autores sobre opiniones ajenas y 3 comentarios recibidos,
      todos con fecha.
    category: policy
    applies_to: "ContentStore y la siembra de ejemplo"
    trigger: "La app se abre o se construye el almacén."
    logic: >
      IF el almacén se construye sin semilla propia
      THEN sembrar exactamente: autores `demo`, `lucia`, `ana`, `bruno` y `marcos`;
      las 8 obras reales del catálogo de ejemplo; las 10 opiniones de la tabla de
      `functional-spec.md` § Semilla; los seguimientos `demo → lucia` y `demo → ana`;
      los 2 me gusta recibidos sobre opiniones de `demo` (`lucia → op-001`,
      `ana → op-004`); los 2 me gusta de otros autores que no son de `demo`
      (`bruno → op-002`, `marcos → op-009`), que solo existen para que los contadores
      del feed no estén todos a cero y no generan actividad para `demo`; y los
      3 comentarios recibidos sobre opiniones de `demo`. Las fechas se calculan como
      desfase respecto al instante de arranque, no como constantes del calendario.
    violation: >
      Menos de 10 opiniones, menos de 5 autores, menos de 8 obras, otro número de
      opiniones propias (3), de seguidos (2) o de comentarios recibidos (3) incumple
      AC2.1.1, AC9.1.2 y FR3.7, y deja sin datos la Actividad de U5. Cuatro me gusta
      contados como recibidos por `demo` inflarían la Actividad de U5 con eventos que
      no le pasaron a la cuenta.
    source: "FR3.1, FR3.7, AC2.1.1, AC9.1.2, AC8.1.2"

  - id: BR4.3
    statement: >
      Una persona publica como máximo una opinión por obra; el intento de publicar
      otra responde `409` sin escribir nada.
    category: validation
    applies_to: "ContentStore (createOpinion)"
    trigger: "Se intenta crear una opinión."
    logic: >
      IF ya existe una opinión de ese `authorId` sobre ese `workId`
      THEN responder `409` y no crear ni modificar nada.
      ELSE crear con `createdAt` y `updatedAt` iguales al instante de la escritura.
    violation: >
      Dos opiniones de la misma persona sobre la misma obra rompen FR6.1 y el
      «mi opinión primero» del detalle (BR8.4).
    source: "FR6.1, FR6.2"

  - id: BR4.4
    statement: >
      Editar actualiza la misma opinión y sella la fecha de modificación; la de
      creación no cambia nunca.
    category: policy
    applies_to: "ContentStore (updateOpinion)"
    trigger: "La persona guarda cambios sobre su propia opinión."
    logic: >
      IF quien edita es el autor THEN actualizar texto y valoración en esa misma
      opinión, dejar `createdAt` intacto y poner `updatedAt` en el instante de la
      escritura. IF no es el autor THEN `403`; IF la opinión no existe THEN `404`.
    violation: >
      Crear una segunda opinión al editar duplica el contenido; tocar `createdAt`
      hace que «Editada el …» mienta sobre cuándo se publicó.
    source: "FR6.3, FR6.4, AC4.2.4"

  - id: BR4.5
    statement: >
      Las listas de opiniones se ordenan de la más reciente a la más antigua por
      fecha de creación, con desempate estable por identificador.
    category: policy
    applies_to: "ContentStore (listOpinions, subscribeContent) e Inicio"
    trigger: "Se lee una lista de opiniones."
    logic: >
      IF se piden opiniones THEN devolverlas ordenadas por `createdAt` descendente
      y, a igualdad de fecha, por `opinionId` ascendente. Publicar una opinión nueva
      la deja la primera del feed.
    violation: >
      Un orden distinto hace que la opinión recién publicada no aparezca arriba
      (AC2.1.3) y cambia el feed entre lecturas.
    source: "FR3.6, AC2.1.3"

  - id: BR4.6
    statement: >
      Los campos derivados de la vista —`isOwn`, `likedByMe` y `followedByMe`— se
      calculan contra quien mira y no se guardan.
    category: policy
    applies_to: "ContentStore (todas las lecturas con viewerId)"
    trigger: "Se lee una opinión, un autor o un seguimiento."
    logic: >
      IF llega `viewerId` THEN `isOwn` es verdadero solo cuando el autor de la
      opinión es ese `viewerId`; `likedByMe`, cuando existe un me gusta de ese
      `viewerId` sobre la opinión; `followedByMe`, cuando ese `viewerId` sigue al
      autor. IF falta `viewerId` THEN responder `422` y no inventar los campos.
    violation: >
      Guardar esos campos en la opinión hace que el mismo contenido se vea distinto
      según quién lo escribió y se rompe al cambiar de cuenta.
    source: "C4 § x-identity; contract-summary.md § Revisión 12 (422 de lectura); AC4.2.1, AC9.1.4"

  - id: BR4.7
    statement: >
      ContentStore emite el contenido actual nada más suscribirse y el contenido
      completo tras cada escritura, con una revisión que crece.
    category: policy
    applies_to: "ContentStore (subscribeContent) y las pantallas de U2"
    trigger: "Una pantalla se suscribe o el contenido cambia."
    logic: >
      IF alguien se suscribe THEN llamar al oyente de inmediato con
      `{ revision, opinions }` del estado actual; después, tras cada escritura,
      emitir el estado completo con `revision + 1`. La suscripción devuelve una
      función para darse de baja.
    violation: >
      Sin emisión inmediata la pantalla se queda en esqueletos para siempre; sin
      emisión tras escribir, el feed y el Perfil no reflejan publicar ni editar.
    source: "C4 § /changes; AC2.1.3, AC9.1.1"

  - id: BR4.8
    statement: >
      Los contadores de Perfil salen de ContentStore: `opinionCount` y
      `followingCount` de `getAuthor`, y la lista de seguidos de `listFollowing`.
    category: policy
    applies_to: "ContentStore (getAuthor, listFollowing) y Perfil"
    trigger: "Se pinta Perfil o cambia el contenido."
    logic: >
      IF se piden los contadores THEN devolver el número de opiniones del autor y
      el número de autores que sigue, contados sobre el estado actual. `followerCount`
      existe pero no se pinta en Perfil.
    violation: >
      Contar en la pantalla duplica la regla y deja los contadores desfasados en
      cuanto U3 publica o sigue a alguien.
    source: "C4 § counters; AC9.1.1, AC9.1.2"

  - id: BR4.9
    statement: >
      Las obras de la siembra son obras reales identificadas por su `workId` de
      Spotify y todos los textos de ejemplo están en español.
    category: constraint
    applies_to: "Siembra de ContentStore y catálogo de ejemplo"
    trigger: "Se construye la siembra o se pinta su contenido."
    logic: >
      IF se siembra una obra THEN usar un identificador de Spotify real y guardar
      su título y su artista en local; IF se escribe un texto de ejemplo THEN
      escribirlo en español, sin datos personales reales.
    violation: >
      Un identificador inventado rompe FR3.2 y deja la obra sin portada real cuando
      U4 conecte; un texto en otro idioma incumple FR11.5.
    source: "FR3.2, FR11.5"

  - id: BR5.1
    statement: >
      El catálogo de ejemplo de 8 obras reales está siempre disponible, con o sin
      sesión de Spotify, y no depende de la red.
    category: constraint
    applies_to: "Catalog (listSampleWorks) y las pantallas de U2"
    trigger: "Se resuelve una obra del contenido."
    logic: >
      IF se piden las obras de ejemplo THEN devolver las 8 obras sembradas, en un
      orden estable, sin petición de red ni credencial. IF no hay sesión ni red
      THEN el catálogo sigue devolviéndolas.
    violation: >
      Un catálogo que exige sesión deja Inicio y el detalle sin identidad de obra
      en el recorrido sin Spotify (US11.1).
    source: "FR3.2, FR4.5, AC2.2.2"

  - id: BR5.2
    statement: >
      Una obra se resuelve por su `workId`; si no está en el catálogo, la pantalla
      conserva el título y el artista que trae la opinión.
    category: policy
    applies_to: "Catalog (getWork) y los mapeos de pantalla"
    trigger: "Se pinta la identidad de una obra."
    logic: >
      IF `getWork(workId)` devuelve la obra THEN usar su título, artista y portada.
      IF devuelve `404` THEN usar `workTitle` y `workArtist` de la opinión y pintar
      el bloque con la inicial; nunca dejar la cabecera vacía ni un hueco roto.
    violation: >
      Una cabecera sin título o un error por una obra ausente deja el detalle roto
      por un dato que la opinión ya traía.
    source: "FR3.2, FR6.5, FR11.3"

  - id: BR5.3
    statement: >
      La portada de una obra es la real solo cuando hay sesión de Spotify, hay red y
      la obra tiene `coverUrl` resuelta; en cualquier otro caso es el bloque con la
      inicial.
    category: policy
    applies_to: "Catalog (coverFor) y todos los mapeos a OpinionCardModel"
    trigger: "Se pinta la portada de una obra o de una opinión."
    logic: >
      IF hay sesión de Spotify AND hay conexión AND la obra tiene `coverUrl`
      THEN devolver `{ kind: "url", value: coverUrl }`.
      IF no hay sesión, no hay red o la resolución falla o aún no ha llegado
      THEN devolver `{ kind: "initialBlock", value: null }` y registrar el fallo de
      metadatos para que la pantalla pueda ofrecer «Reintentar» (BR7.5).
    violation: >
      Una portada rota o un hueco vacío incumple FR11.3 y AC2.2.3; intentar la
      portada real sin sesión pinta una petición que no puede funcionar.
    source: "FR3.4, FR11.3, FR11.4, AC2.2.2, AC2.2.3, AC4.1.4, AC4.3.3"

  - id: BR5.4
    statement: >
      El «N opiniones» de una obra se cuenta sobre ContentStore y no se guarda en la
      obra.
    category: policy
    applies_to: "Catalog (countOpinions) y la cabecera del detalle"
    trigger: "Se pinta el recuento de opiniones de una obra."
    logic: >
      IF se pide el recuento THEN contar las opiniones de esa obra en el instante de
      la llamada y devolver `{ workId, count }`; en singular, la pantalla escribe
      «1 opinión»; en plural, «N opiniones».
    violation: >
      Un contador guardado en la obra se desfasa al publicar y muestra un número
      que no coincide con la lista de debajo.
    source: "C5 § /works/{workId}/opinion-count; FR6.5"

  - id: BR5.5
    statement: >
      La caché de búsquedas vive en memoria y se vacía al reiniciar; sin puerto de
      búsqueda, buscar responde `offline` sin tocar la red.
    category: policy
    applies_to: "Catalog (searchWorks) y U4"
    trigger: "Se busca una obra."
    logic: >
      IF no hay implementación de `SpotifySearchPort` THEN devolver
      `{ status: "offline", works: [] }` y no lanzar ninguna petición.
      IF la hay (U4) THEN guardar el resultado por consulta normalizada mientras dure
      la app y no repetir la petición.
    violation: >
      Una búsqueda que intenta la red sin sesión pinta un error de servidor donde
      el diseño pide la invitación a conectar; una caché persistida promete datos
      que esta versión no guarda.
    source: "C5 § /works; Q2 = A"

  - id: BR5.6
    statement: >
      U2 declara los tres puertos de Spotify del catálogo y los deja sin
      implementación; el catálogo funciona solo con ellos en `null`.
    category: constraint
    applies_to: "Catalog y app/src/bootstrap/ports.ts"
    trigger: "Se construye el catálogo en el punto de composición."
    logic: >
      IF no hay implementación registrada THEN construir el catálogo con
      `{ session: null, search: null, resolve: null }`, resolver todas las portadas
      como bloque y no fallar. U2 no importa `@melodify/spotify` en tiempo de
      ejecución.
    violation: >
      Implementar Spotify en U2 adelanta U4 y mete credenciales y red en la unidad
      que debe poder probarse sin ninguna de las dos.
    source: "C5 § x-ports y x-composition; unit-of-work.md § U2"

  - id: BR6.1
    statement: >
      El estado de red sale del sistema operativo a través de `expo-network`, no de
      los fallos de las peticiones.
    category: policy
    applies_to: "Connectivity (C6) y ShellServices.network"
    trigger: "La app arranca o cambia la conectividad del dispositivo."
    logic: >
      IF el dispositivo informa conexión THEN `online` es verdadero; IF informa que
      no hay conexión THEN `online` es falso. Se lee con
      `getNetworkStateAsync()` al construir y se escucha con
      `addNetworkStateListener` para cada cambio.
    violation: >
      Deducir la red de un error de Spotify confunde «sin conexión» con «la petición
      falló» y pinta el banner equivocado.
    source: "FR11.4, AC2.2.4; Q1 = A"

  - id: BR6.2
    statement: >
      Connectivity emite el estado actual nada más suscribirse y el estado completo
      tras cada cambio.
    category: policy
    applies_to: "Connectivity (subscribeNetwork) y las pantallas que lo leen"
    trigger: "Una pantalla se suscribe al estado de red."
    logic: >
      IF alguien se suscribe THEN llamar al oyente de inmediato con el último estado
      conocido y después en cada cambio; la suscripción devuelve una función para
      darse de baja y no deja oyentes vivos al desmontar.
    violation: >
      Sin emisión inmediata la pantalla arranca con un estado de red inventado; sin
      baja, cada montaje deja un oyente que actualiza una pantalla cerrada.
    source: "C6 § /network/changes"

  - id: BR6.3
    statement: >
      Si el módulo de red no está disponible o falla al leer, Connectivity informa
      «en línea» y no bloquea la app.
    category: policy
    applies_to: "Connectivity y el arranque"
    trigger: "Falla la lectura del estado de red."
    logic: >
      IF la lectura inicial falla o el módulo no responde THEN arrancar en `online:
      true`, dejar de escuchar sin lanzar y no pintar el banner de sin conexión.
    violation: >
      Un fallo del módulo de red no puede impedir leer el contenido local ni pintar
      un aviso que la persona no puede resolver.
    source: "C6; components.md § Connectivity; FR11.1"

  - id: BR6.4
    statement: >
      Connectivity alimenta `ShellServices.network` en el punto de composición, con
      su valor actual y su suscripción.
    category: constraint
    applies_to: "app/src/bootstrap/ y AppShell"
    trigger: "Se construyen los servicios de la cáscara."
    logic: >
      IF se construye `shell-services` THEN `network.online` es el último estado de
      Connectivity y `network.subscribe` reenvía sus cambios; la cáscara y las
      pantallas no importan `@melodify/connectivity`.
    violation: >
      Construir una segunda fuente de red en la cáscara deja dos estados distintos
      para el mismo dispositivo.
    source: "C2 § ShellServices; C6; components.md § Connectivity"

  - id: BR6.5
    statement: >
      Connectivity no hace peticiones propias ni guarda datos.
    category: constraint
    applies_to: "Connectivity"
    trigger: "Cualquier lectura de red."
    logic: >
      IF se consulta el estado THEN preguntar al sistema operativo o devolver el
      último estado escuchado; no abrir sockets, no pedir a Spotify y no escribir en
      almacenamiento.
    violation: >
      Una petición propia convierte al vigilante de red en un consumidor de red y
      duplica los fallos que intenta explicar.
    source: "components.md § Connectivity"

  - id: BR7.1
    statement: >
      Inicio pinta el feed completo bajo el encabezado «Para ti»: entre 8 y 10
      opiniones leídas de ContentStore, cada una con autor, obra, valoración y texto
      de hasta tres líneas.
    category: policy
    applies_to: "Pantalla Inicio"
    trigger: "La persona llega a Inicio con contenido."
    logic: >
      IF ContentStore tiene opiniones THEN pintar la lista ordenada por BR4.5 bajo
      «Para ti», cada tarjeta en variante `feed` con portada, título, artista,
      estrellas con número, texto recortado a 3 líneas, autor, tiempo transcurrido y
      contadores de me gusta y comentarios.
    violation: >
      Menos tarjetas o tarjetas sin alguno de esos datos incumplen AC2.1.1 y FR3.1.
    source: "FR3.1, AC2.1.1, AC2.1.3"

  - id: BR7.2
    statement: >
      Mientras Inicio espera la primera emisión del contenido pinta 3 esqueletos de
      tarjeta con la altura real y el encabezado «Para ti» ya visible.
    category: policy
    applies_to: "Pantalla Inicio"
    trigger: "Inicio monta y el contenido aún no ha emitido."
    logic: >
      IF el estado es `loading` THEN pintar el encabezado «Para ti» y 3 esqueletos
      de tarjeta que ocupen el espacio de las tarjetas reales; nunca una pantalla en
      blanco ni un indicador suelto.
    violation: >
      Una pantalla en blanco durante la carga incumple AC2.1.4 y FR11.1.
    source: "FR11.1, AC2.1.4"

  - id: BR7.3
    statement: >
      Sin opiniones, Inicio muestra «Aún no hay opiniones. Sé el primero.» y la
      acción «Crear opinión», que abre la pestaña Crear.
    category: policy
    applies_to: "Pantalla Inicio"
    trigger: "El contenido emite una lista vacía."
    logic: >
      IF la lista está vacía THEN pintar el estado vacío con ese mensaje y esa acción;
      IF se toca la acción THEN cambiar a la pestaña Crear con formulario vacío
      (`goToTab({ name: "crear" })`).
    violation: >
      Un vacío sin acción deja a la persona sin salida y contradece AC2.1.5.
    source: "AC2.1.5, FR11.1, FR11.6"

  - id: BR7.4
    statement: >
      Si falla la lectura del contenido, Inicio muestra en el lugar de la lista
      «No pudimos cargar las opiniones.» con «Reintentar».
    category: policy
    applies_to: "Pantalla Inicio"
    trigger: "La suscripción al contenido falla o el almacén responde error."
    logic: >
      IF el estado es `error` THEN pintar `ErrorState` con ese mensaje y
      «Reintentar»; IF se toca «Reintentar» THEN volver a suscribirse y releer, y
      pasar por `loading` mientras se resuelve.
    violation: >
      Un fallo silencioso o un código técnico incumple FR11.2 y deja el feed vacío
      sin explicación.
    source: "FR3.5, FR11.1, FR11.2"

  - id: BR7.5
    statement: >
      Si fallan los metadatos de Spotify, Inicio mantiene la lista local con portadas
      de bloque y ofrece «No pudimos actualizar las portadas.» con «Reintentar» en un
      aviso bajo la cabecera.
    category: policy
    applies_to: "Pantalla Inicio y Catalog"
    trigger: "La resolución de metadatos o portadas falla."
    logic: >
      IF Catalog registra un fallo de metadatos THEN pintar el `Banner` bajo la
      cabecera con ese texto y «Reintentar», y seguir pintando la lista con bloques
      de inicial. IF se toca «Reintentar» THEN pedir a Catalog que reintente las
      portadas y retirar el aviso si la resolución termina bien.
    violation: >
      Sustituir la lista por un error de servidor cuando solo fallaron las portadas
      incumple AC2.1.6 y esconde contenido que ya estaba cargado.
    source: "FR3.5, AC2.1.6"

  - id: BR7.6
    statement: >
      Sin conexión, Inicio conserva lo ya cargado, pasa las portadas a bloque y avisa
      bajo la cabecera con «Sin conexión. Estás viendo lo último que cargamos.» y
      «Reintentar».
    category: policy
    applies_to: "Pantalla Inicio y Connectivity"
    trigger: "Connectivity informa que no hay red."
    logic: >
      IF `online` es falso THEN no vaciar la lista, mapear todas las portadas a
      bloque de inicial y pintar el `Banner` con ese texto y «Reintentar»; IF vuelve
      la conexión THEN retirar el aviso y volver a resolver portadas.
    violation: >
      Vaciar el feed o pintar un error de servidor por falta de red incumple FR11.4
      y AC2.2.4.
    source: "FR11.4, AC2.2.4"

  - id: BR7.7
    statement: >
      Tocar una tarjeta de Inicio abre el detalle de esa opinión dentro de la pestaña
      de Inicio.
    category: policy
    applies_to: "Pantalla Inicio y AppShell"
    trigger: "La persona toca una tarjeta."
    logic: >
      IF se toca la tarjeta —fuera de sus acciones sociales— THEN llamar a
      `openOpinionDetail({ opinionId })`, que apila el detalle sobre Inicio sin
      cambiar de pestaña.
    violation: >
      Navegar a otra pestaña o abrir un detalle a pantalla completa rompe FR2.3 y
      AC2.3.1.
    source: "FR3.8, FR2.3, AC2.3.1"

  - id: BR7.8
    statement: >
      En U2 las tarjetas de Inicio son de lectura: no dan me gusta, no comentan, no
      siguen autores y no muestran «Editar».
    category: constraint
    applies_to: "Pantalla Inicio y OpinionCard"
    trigger: "La persona toca el corazón, el bocadillo o la zona de seguir."
    logic: >
      IF la tarjeta se pinta en Inicio durante U2 THEN pasar `onPress` y ningún otro
      callback; `isOwn` solo es verdadero si la opinión es de la cuenta demo, y
      `onEdit` no se pasa porque editar llega en U3.
    violation: >
      Una acción que cambia contadores sin la escritura de U3 deja estado que la
      unidad siguiente no puede reconciliar.
    source: "unit-of-work.md § U2 («las acciones sociales llegan en U3»)"

  - id: BR7.9
    statement: >
      El chip de la cabecera de Inicio muestra «Conectado» con punto verde o
      «Conectar» según el estado de Spotify de la cáscara; en U2 «Conectar» no inicia
      nada.
    category: policy
    applies_to: "Pantalla Inicio y ShellServices.spotify"
    trigger: "Se pinta la cabecera de Inicio."
    logic: >
      IF `spotify.status` es `connected` THEN pintar «Conectado»; en cualquier otro
      estado pintar «Conectar». En U2 el estado siempre es `disconnected`, así que el
      chip muestra «Conectar» y no responde al toque; U4 cablea la acción.
    violation: >
      Inventar un tercer estado o un texto distinto incumple AC2.1.2 y adelanta el
      trabajo de U4.
    source: "FR3.3, AC2.1.2; Q2 = A"

  - id: BR7.10
    statement: >
      Cada tarjeta muestra la portada que decide Catalog para su obra: sin sesión de
      Spotify, el bloque con la inicial de la obra.
    category: policy
    applies_to: "Pantalla Inicio y el mapeo a OpinionCardModel"
    trigger: "Se pinta una tarjeta."
    logic: >
      IF se mapea una opinión THEN pedir `coverFor(workId)` y poner en `coverUrl` la
      URL solo cuando la decisión es `url`; en cualquier otro caso `null`, que la
      tarjeta pinta como bloque con la inicial.
    violation: >
      Usar el `coverUrl` crudo de la obra salta la decisión de sesión y red de BR5.3
      y deja una portada que no carga cuando no hay conexión.
    source: "FR3.4, AC2.2.2, AC2.2.3"

  - id: BR8.1
    statement: >
      El detalle de obra muestra la identidad de la obra —portada, título, artista,
      valoración media con número y recuento de opiniones— y la lista de sus
      opiniones.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "Se abre el detalle de una obra con opiniones."
    logic: >
      IF hay opiniones THEN pintar la cabecera de obra con `CoverArt` de 96, título,
      artista, estrellas con la media redondeada y «N opiniones»; debajo, la tarjeta
      propia si existe y, debajo, «Otras opiniones» con las ajenas.
    violation: >
      Una cabecera sin identidad o sin recuento incumple FR6.5 y AC4.1.1.
    source: "FR6.5, AC4.1.1"

  - id: BR8.2
    statement: >
      Las opiniones de otros se listan con autor, valoración con estrellas y número,
      texto completo sin recortar y tiempo transcurrido.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "Se pintan opiniones ajenas."
    logic: >
      IF una opinión no es de quien mira THEN pintarla en variante `detail`, con el
      texto completo (sin `numberOfLines`), autor, estrellas con número y tiempo
      transcurrido, en el orden de BR4.5.
    violation: >
      Recortar el texto en el detalle incumple AC4.1.2 y AC2.3.3, que existen para
      leer la opinión entera.
    source: "FR6.5, AC4.1.2, AC2.3.3"

  - id: BR8.3
    statement: >
      «Opinar sobre esta obra» aparece solo cuando la obra no tiene opinión de quien
      mira, y abre Crear con la obra preseleccionada.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "Se pinta el detalle y la persona toca la acción."
    logic: >
      IF no hay opinión propia THEN mostrar el botón «Opinar sobre esta obra» al
      final del contenido; IF se toca THEN `openCreate({ workId })`, que abre Crear
      con esa obra ya elegida. IF hay opinión propia THEN no mostrar el botón.
    violation: >
      Ofrecer publicar cuando ya hay opinión propia lleva a un `409` (BR4.3) y
      contradice AC4.2.3 y FR6.2.
    source: "FR6.6, FR6.7, FR6.8, AC4.1.3, AC4.3.2"

  - id: BR8.4
    statement: >
      La opinión propia va primera y destacada, en el estado `own` de la tarjeta, con
      «Editar» y sus fechas; debajo se listan las demás bajo «Otras opiniones» y no se
      ofrece publicar otra.
    category: policy
    applies_to: "Pantalla Detalle de obra y OpinionCard"
    trigger: "La obra tiene una opinión de quien mira."
    logic: >
      IF hay opinión propia THEN pintarla antes que las demás, en variante `detail` con
      `isOwn` verdadero, que es lo que le da el estado `own` del `interaction-spec.md`:
      fondo `color.primaryContainer`, la etiqueta «Tu opinión» dentro de la tarjeta,
      la acción «Editar» y la línea de fechas («Creada el …» y, si `updatedAt` es
      posterior, «Editada el …»). «Editar» se pinta con `isOwn`, no con la llegada de
      `onEdit`; en U2 la acción todavía no tiene efecto y U3 le pasa `onEdit`. Debajo,
      el encabezado «Otras opiniones» con las
      ajenas; IF no hay ajenas THEN «Nadie más ha opinado todavía.». El encabezado
      «Tu opinión» **no** se pinta aparte: la etiqueta vive en la tarjeta, como en el
      mockup. No mostrar «Opinar sobre esta obra».
    violation: >
      Mezclar la opinión propia con las demás o repetir la acción de publicar
      incumple FR6.2, FR6.8 y AC4.2.1–AC4.2.4; una opinión propia sin marca visual deja
      «destacada» sin punto de observación y dos implementaciones se ven distintas.
    source: "FR6.2, FR6.8, AC4.2.1–AC4.2.4; interaction-spec.md § OpinionCard (estado own); mockups.md § Vista de detalle de obra"

  - id: BR8.5
    statement: >
      Una obra sin opiniones muestra solo su identidad, «Todavía nadie ha opinado
      sobre esta obra.» y «Opinar sobre esta obra»; sin Spotify la portada es bloque
      y la acción sigue disponible.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "La obra no tiene ninguna opinión."
    logic: >
      IF no hay opiniones THEN pintar la cabecera de obra, el mensaje «Todavía nadie
      ha opinado sobre esta obra.» y el botón «Opinar sobre esta obra», sin listas.
      La portada sigue la decisión de BR5.3 y el botón no depende de la sesión de
      Spotify.
    violation: >
      Un detalle vacío sin acción incumple FR6.6 y AC4.3.1; esconder el botón sin
      Spotify incumple AC4.3.3.
    source: "FR6.6, AC4.3.1, AC4.3.3"

  - id: BR8.6
    statement: >
      Mientras el detalle de obra espera sus datos pinta esqueletos de cabecera
      (96×96) y de dos opiniones, ocupando el espacio final.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "El detalle monta y aún no tiene datos."
    logic: >
      IF el estado es `loading` THEN pintar un esqueleto de cabecera con el hueco de
      la portada y dos esqueletos de opinión; nunca una pantalla en blanco.
    violation: >
      Un detalle en blanco durante la carga incumple AC4.1.6 y FR11.1.
    source: "FR11.1, AC4.1.6"

  - id: BR8.7
    statement: >
      Si la portada falla, el detalle deja el bloque con la inicial en el mismo
      hueco de 96×96 y el resto del contenido se sigue viendo.
    category: policy
    applies_to: "Pantalla Detalle de obra y detalle de opinión"
    trigger: "La portada real no carga o no está disponible."
    logic: >
      IF `coverFor` devuelve `initialBlock` o la imagen falla THEN pintar el bloque
      con la inicial de la obra en el hueco de la portada y mantener título, artista,
      valoración y opiniones.
    violation: >
      Un hueco roto o un detalle sustituido por un error incumple FR11.3 y AC4.1.4.
    source: "FR11.3, AC4.1.4"

  - id: BR8.8
    statement: >
      Si falla la carga del resto del contenido, el detalle de obra muestra
      «No pudimos cargar esta obra.» con «Reintentar» y conserva la identidad si ya
      se había pintado.
    category: policy
    applies_to: "Pantalla Detalle de obra"
    trigger: "La lectura de la obra o de sus opiniones falla."
    logic: >
      IF el estado es `error` THEN pintar `ErrorState` con ese mensaje y
      «Reintentar» en el lugar del contenido; IF la identidad ya estaba cargada THEN
      mantenerla sobre el error. «Reintentar» vuelve a leer y pasa por `loading`.
    violation: >
      Un fallo silencioso o un mensaje técnico incumple FR11.2 y AC4.1.5.
    source: "FR11.2, AC4.1.5"

  - id: BR8.9
    statement: >
      El detalle se titula «Detalle de obra» en la cabecera de la cáscara y
      «‹ Volver» devuelve a la pestaña de origen en la misma posición del contenido.
    category: policy
    applies_to: "Pantalla Detalle de obra y AppShell"
    trigger: "El detalle se monta o se toca «‹ Volver»."
    logic: >
      IF se monta el detalle THEN `setHeader({ title: "Detalle de obra" })`; IF se
      toca «‹ Volver» o el atrás del sistema THEN desapilar el detalle, limpiar el
      título de la cabecera y devolver la pantalla anterior con el desplazamiento que
      tenía, que se conserva porque la cáscara mantiene montada la raíz de la pestaña
      mientras hay un detalle encima (C2 1.2.0, BR10.1).
    violation: >
      Un detalle sin título o un «Volver» que reinicia el feed incumple AC2.3.2 y
      FR2.3.
    source: "FR2.3, AC2.3.2; mockups.md § Vista de detalle de obra; contract-summary.md § Revisión 12 (C2 1.2.0)"

  - id: BR8.10
    statement: >
      El detalle de opinión muestra una sola opinión a pantalla completa —autor,
      tiempo, valoración, texto completo y acciones sociales— y, si es propia, con
      «Editar» y sus fechas.
    category: policy
    applies_to: "Pantalla Detalle de opinión"
    trigger: "Se abre el detalle de una opinión."
    logic: >
      IF se abre una opinión THEN pintarla en variante `detail` con el texto sin
      recortar, su autor, su tiempo transcurrido, sus estrellas con número y sus
      contadores; IF es de quien mira THEN `isOwn` verdadero, «Editar» y la línea de
      fechas de BR8.4.
    violation: >
      Recortar el texto o perder las fechas incumple AC2.3.3, AC9.1.4 y AC4.2.4.
    source: "AC2.3.3, AC9.1.4, AC4.2.4; FR9.6"

  - id: BR8.11
    statement: >
      El detalle de opinión repite la identidad de la obra sobre la opinión y se
      titula «Detalle de opinión».
    category: policy
    applies_to: "Pantalla Detalle de opinión"
    trigger: "Se monta el detalle de opinión."
    logic: >
      IF se monta THEN pintar la misma cabecera de obra que BR8.1 (portada, título,
      artista, valoración media y recuento) y llamar a
      `setHeader({ title: "Detalle de opinión" })`.
    violation: >
      Una opinión sin decir a qué obra pertenece deja la pantalla sin contexto y
      contradice los mockups (§ Detalle de opinión).
    source: "mockups.md § Vista de detalle de obra; FR6.5"

  - id: BR8.12
    statement: >
      El detalle de opinión cubre carga con esqueletos de cabecera y texto, error con
      «No pudimos cargar esta opinión.» y «Reintentar», y portada fallida como BR8.7.
    category: policy
    applies_to: "Pantalla Detalle de opinión"
    trigger: "El detalle de opinión carga o falla."
    logic: >
      IF `loading` THEN esqueletos de cabecera y de texto; IF `error` THEN
      `ErrorState` con ese mensaje y «Reintentar»; IF la portada falla THEN bloque
      con la inicial y el resto visible.
    violation: >
      Cualquiera de los tres huecos incumple FR11.1 y la matriz de estados de los
      mockups.
    source: "FR11.1, FR11.2, FR11.3; mockups.md § Matriz de estados"

  - id: BR9.1
    statement: >
      Perfil muestra la identidad simulada: avatar de 72 con la inicial «D»,
      «Usuario demo» y «@demo», y los contadores de opiniones y de autores seguidos.
    category: constraint
    applies_to: "Pantalla Perfil"
    trigger: "La persona abre Perfil."
    logic: >
      IF se pinta Perfil THEN mostrar `Avatar` grande con el nombre de la cuenta,
      «Usuario demo» como título y «@demo» debajo, y la línea de contadores; el nombre
      de la cuenta es el `h1` de la pantalla.
    violation: >
      Otra identidad o unos contadores ausentes incumplen FR9.1 y AC9.1.1.
    source: "FR9.1, AC9.1.1"

  - id: BR9.2
    statement: >
      Los contadores de Perfil se leen de ContentStore y dicen «N opiniones ·
      N siguiendo», en singular cuando el número es 1.
    category: policy
    applies_to: "Pantalla Perfil"
    trigger: "Se pinta Perfil o cambia el contenido."
    logic: >
      IF hay 3 opiniones y 2 seguidos THEN «3 opiniones · 2 siguiendo»; IF el número
      es 1 THEN «1 opinión» / «1 siguiendo»; los números salen de `getAuthor` y
      `listFollowing` y se recalculan al cambiar el contenido.
    violation: >
      Contadores fijos o desfasados incumplen AC9.1.1 y AC9.1.2 y mienten al
      publicar.
    source: "FR9.1, AC9.1.1, AC9.1.2"

  - id: BR9.3
    statement: >
      Perfil lista las opiniones propias bajo «Mis opiniones», en variante compact,
      de la más reciente a la más antigua.
    category: policy
    applies_to: "Pantalla Perfil"
    trigger: "Perfil tiene opiniones propias."
    logic: >
      IF hay opiniones propias THEN pintar la sección «Mis opiniones» con una tarjeta
      `compact` por opinión, ordenadas por BR4.5, con portada, obra, artista,
      valoración, texto recortado a 2 líneas y tiempo transcurrido.
    violation: >
      Omitir la lista o mezclar opiniones ajenas incumple FR9.4 y AC9.1.3.
    source: "FR9.4, AC9.1.3"

  - id: BR9.4
    statement: >
      Tocar una opinión de Perfil abre su detalle de opinión, con el texto completo y
      «Editar».
    category: policy
    applies_to: "Pantalla Perfil y AppShell"
    trigger: "La persona toca una opinión propia."
    logic: >
      IF se toca la tarjeta THEN `openOpinionDetail({ opinionId })`, que apila el
      detalle dentro de la pestaña Perfil con el texto completo y, al ser propia,
      «Editar».
    violation: >
      No navegar o abrir una vista recortada incumple FR9.6 y AC9.1.4.
    source: "FR9.6, AC9.1.4"

  - id: BR9.5
    statement: >
      Sin opiniones propias, Perfil muestra «Todavía no has publicado opiniones.» y
      la acción «Crear opinión».
    category: policy
    applies_to: "Pantalla Perfil"
    trigger: "El autor no tiene opiniones."
    logic: >
      IF la lista propia está vacía THEN pintar el estado vacío con ese mensaje y la
      acción «Crear opinión», que abre la pestaña Crear con formulario vacío.
    violation: >
      Un Perfil vacío sin acción incumple FR9.5, AC9.1.5 y FR11.6.
    source: "FR9.5, AC9.1.5, FR11.6"

  - id: BR9.6
    statement: >
      Mientras Perfil espera sus datos pinta esqueletos de identidad y de lista.
    category: policy
    applies_to: "Pantalla Perfil"
    trigger: "Perfil monta y aún no tiene datos."
    logic: >
      IF el estado es `loading` THEN pintar un esqueleto de cabecera con el hueco del
      avatar y de la línea de contadores, y dos esqueletos de opinión.
    violation: >
      Una pantalla en blanco durante la carga incumple AC9.1.6 y FR11.1.
    source: "FR11.1, AC9.1.6"

  - id: BR9.7
    statement: >
      Si falla la carga de Perfil, se muestra «No pudimos cargar tu perfil.» con
      «Reintentar».
    category: policy
    applies_to: "Pantalla Perfil"
    trigger: "La lectura del autor o del contenido falla."
    logic: >
      IF el estado es `error` THEN pintar `ErrorState` con ese mensaje y
      «Reintentar»; «Reintentar» vuelve a leer y pasa por `loading`.
    violation: >
      Un fallo silencioso incumple FR11.2 y AC9.1.7.
    source: "FR11.2, AC9.1.7"

  - id: BR9.8
    statement: >
      «Cerrar sesión» llama a la instancia única de la sesión de la app y vuelve a
      Login sin tocar Spotify ni el contenido.
    category: policy
    applies_to: "Pantalla Perfil y app/src/bootstrap/session.ts"
    trigger: "La persona toca «Cerrar sesión»."
    logic: >
      IF se toca la acción THEN `appSession.signOut()`; la suscripción del arranque
      devuelve la app a Login con Inicio como pestaña activa. No se borra el
      contenido ni el estado de Spotify.
    violation: >
      Construir otra instancia de sesión deja la app dentro después de cerrar sesión;
      borrar el contenido rompe AC1.3.4.
    source: "FR1.5, FR9.3; R-01"

  - id: BR9.9
    statement: >
      En U2 Perfil no pinta la tarjeta de Spotify; llega en U4 con sus cinco estados.
    category: constraint
    applies_to: "Pantalla Perfil"
    trigger: "Se pinta Perfil durante U2."
    logic: >
      IF se pinta Perfil THEN no incluir ninguna tarjeta ni acción de Spotify; el
      estado de la conexión y sus acciones son de U4 (AC9.1.8 queda diferido).
    violation: >
      Adelantar la pieza rompe el reparto de C1 (1.3.0) y deja un botón que promete
      una conexión que U2 no implementa.
    source: "Q2 = A; unit-of-work.md § U4"

  - id: BR10.1
    statement: >
      Los detalles se apilan dentro de la pestaña activa, mantienen la barra inferior,
      nunca son un sexto destino y no desmontan la pantalla que los abre.
    category: constraint
    applies_to: "AppShell y las pantallas de detalle"
    trigger: "Se abre o se cierra un detalle."
    logic: >
      IF se abre un detalle THEN apilarlo sobre la pantalla actual de esa pestaña, con
      la barra inferior visible y el destino activo sin cambiar, y mantener montada la
      entrada de debajo oculta con `display: none`, igual que la cáscara hace entre
      pestañas. IF se cierra THEN desapilar y mostrar la entrada de debajo tal y como
      estaba.
    violation: >
      Un detalle como destino propio rompe FR2.3 y AC2.3.1; desmontar la raíz al
      apilar pierde el desplazamiento del feed y rompe AC2.3.2.
    source: "FR2.3, AC2.3.1, AC2.3.2; contract-summary.md § Revisión 12 (C2 1.2.0)"

  - id: BR10.2
    statement: >
      «‹ Volver» y el atrás del sistema desapilan una pantalla y devuelven a la
      anterior en su misma posición.
    category: policy
    applies_to: "AppShell y las pantallas de detalle"
    trigger: "La persona toca «‹ Volver» o usa el atrás de Android."
    logic: >
      IF hay algo apilado THEN desapilar la última entrada, limpiar el título de la
      cabecera y mostrar la pantalla anterior con el desplazamiento que tenía —la
      entrada de debajo no se desmontó (BR10.1)—. IF se está en la raíz de una pestaña
      THEN devolver `false` y dejar que Android cierre la app, como hace hoy
      `packages/app-shell/src/AppShell.tsx`; es la lectura que se conserva del
      esqueleto aprobado en el teléfono, frente al «sin efecto» de
      `interaction-spec.md` § Navegación y atrás, y la divergencia se eleva a la
      persona en el gate.
    violation: >
      Volver a la raíz o perder la posición del feed incumple AC2.3.2.
    source: "AC2.3.2; interaction-spec.md § AppHeader; contract-summary.md § Revisión 12 (C2 1.2.0)"

  - id: BR10.3
    statement: >
      Toda carga se representa con esqueletos que ocupan el espacio del contenido
      final; nunca con una pantalla en blanco.
    category: policy
    applies_to: "Inicio, detalle de obra, detalle de opinión y Perfil"
    trigger: "Una pantalla está en `loading`."
    logic: >
      IF el estado es `loading` THEN pintar esqueletos con la forma del contenido que
      va a llegar, y mantener visibles la cabecera y los encabezados fijos.
    violation: >
      Una pantalla en blanco o un indicador suelto incumple FR11.1 y las cuatro
      AC de carga de la unidad.
    source: "FR11.1, AC2.1.4, AC4.1.6, AC9.1.6"

  - id: BR10.4
    statement: >
      Todo error visible va en español, en lenguaje llano y con «Reintentar» cuando
      hay algo que reintentar.
    category: constraint
    applies_to: "Todas las pantallas de U2"
    trigger: "Se pinta un error."
    logic: >
      IF una pantalla muestra un error THEN usar el texto de la tabla de
      `functional-spec.md` § Textos exactos, sin códigos técnicos ni inglés, y
      ofrecer «Reintentar» como acción que repite la carga.
    violation: >
      Un mensaje en inglés o un código técnico incumple FR11.2 y NFR2.
    source: "FR11.2, FR11.5"

  - id: BR10.5
    statement: >
      Sin conexión no se borra lo cargado ni se pintan errores de servidor: se
      conserva el contenido y se avisa con el banner.
    category: policy
    applies_to: "Todas las pantallas de U2"
    trigger: "Connectivity informa que no hay red."
    logic: >
      IF no hay red THEN mantener las listas y la identidad ya cargadas, pasar las
      portadas a bloque y pintar el banner de sin conexión; no cambiar el estado de
      la pantalla a `error`.
    violation: >
      Convertir la falta de red en un error de contenido incumple FR11.4 y la
      distinción de C6 entre «sin conexión» y «la petición falló».
    source: "FR11.4, AC2.2.4"

  - id: BR10.6
    statement: >
      Todo texto visible para quien usa la app está en español y en lenguaje llano.
    category: constraint
    applies_to: "Todas las pantallas de U2"
    trigger: "Se escribe cualquier texto de interfaz."
    logic: >
      IF se pinta un texto THEN escribirlo en español, sin códigos técnicos ni
      mensajes en inglés, y con las fechas en el formato de la app («4 nov 2026»).
    violation: >
      Un texto en otro idioma incumple FR11.5 y NFR2.
    source: "FR11.5, NFR2"
```

## Resumen de reglas

| Regla | Categoría | Enunciado corto | Origen |
|---|---|---|---|
| **BR4.1** | constraint | Un solo `ContentStore` en memoria es la única fuente del contenido. | FR3.1, FR3.7 |
| **BR4.2** | policy | La siembra tiene 10 opiniones, 5 autores, 8 obras, 3 propias, 2 seguidos, 2 me gusta recibidos, 2 de otros autores y 3 comentarios. | FR3.7, AC9.1.2 |
| **BR4.3** | validation | Una opinión por persona y obra; la segunda responde `409`. | FR6.1 |
| **BR4.4** | policy | Editar actualiza la misma opinión y sella `updatedAt`; `createdAt` no cambia. | FR6.3, FR6.4 |
| **BR4.5** | policy | Las listas van de la más reciente a la más antigua. | FR3.6, AC2.1.3 |
| **BR4.6** | policy | `isOwn`, `likedByMe` y `followedByMe` se calculan contra `viewerId`. | C4, AC4.2.1 |
| **BR4.7** | policy | `subscribeContent` emite al suscribirse y tras cada escritura, con revisión. | C4, AC2.1.3 |
| **BR4.8** | policy | Los contadores de Perfil salen de `getAuthor` y `listFollowing`. | AC9.1.1, AC9.1.2 |
| **BR4.9** | constraint | Obras reales por `workId` y textos de ejemplo en español. | FR3.2, FR11.5 |
| **BR5.1** | constraint | El catálogo de ejemplo (8 obras) está siempre disponible, sin red. | FR3.2, AC2.2.2 |
| **BR5.2** | policy | La obra se resuelve por `workId`; si falta, manda el título de la opinión. | FR6.5, FR11.3 |
| **BR5.3** | policy | Portada real solo con sesión, red y `coverUrl`; si no, bloque con la inicial. | FR3.4, FR11.3 |
| **BR5.4** | policy | El «N opiniones» se cuenta sobre el contenido y no se guarda. | FR6.5 |
| **BR5.5** | policy | Caché de búsqueda en memoria; sin puerto, buscar responde `offline`. | C5, Q2 = A |
| **BR5.6** | constraint | Los tres puertos de Spotify se declaran vacíos y el catálogo funciona solo. | C5 |
| **BR6.1** | policy | El estado de red sale de `expo-network`, no de los fallos de peticiones. | FR11.4, Q1 = A |
| **BR6.2** | policy | Connectivity emite el estado actual al suscribirse y en cada cambio. | C6 |
| **BR6.3** | policy | Si el módulo de red falla, se asume «en línea» y no se bloquea la app. | C6; components.md § Connectivity; FR11.1 |
| **BR6.4** | constraint | Connectivity alimenta `ShellServices.network` en el punto de composición. | C2, C6 |
| **BR6.5** | constraint | Connectivity no hace peticiones ni guarda datos. | components.md |
| **BR7.1** | policy | Inicio pinta el feed completo bajo «Para ti». | FR3.1, AC2.1.1 |
| **BR7.2** | policy | Carga con 3 esqueletos y «Para ti» visible. | AC2.1.4 |
| **BR7.3** | policy | Vacío con «Aún no hay opiniones. Sé el primero.» y «Crear opinión». | AC2.1.5 |
| **BR7.4** | policy | Error de contenido con «No pudimos cargar las opiniones.» y «Reintentar». | FR3.5, FR11.2 |
| **BR7.5** | policy | Error de metadatos: banner «No pudimos actualizar las portadas.» y lista con bloques. | AC2.1.6 |
| **BR7.6** | policy | Sin conexión: se conserva lo cargado, portadas a bloque y banner. | FR11.4, AC2.2.4 |
| **BR7.7** | policy | Tocar una tarjeta abre el detalle de la opinión dentro de Inicio. | FR3.8, AC2.3.1 |
| **BR7.8** | constraint | En U2 las tarjetas de Inicio son de lectura. | unit-of-work.md § U2 |
| **BR7.9** | policy | El chip muestra «Conectado» o «Conectar»; en U2 «Conectar» no responde. | FR3.3, AC2.1.2 |
| **BR7.10** | policy | La portada de cada tarjeta la decide Catalog; sin sesión, bloque. | FR3.4, AC2.2.2 |
| **BR8.1** | policy | El detalle de obra muestra identidad, media, recuento y opiniones. | FR6.5, AC4.1.1 |
| **BR8.2** | policy | Las opiniones ajenas van con autor, estrellas, texto completo y tiempo. | AC4.1.2, AC2.3.3 |
| **BR8.3** | policy | «Opinar sobre esta obra» solo sin opinión propia y abre Crear con la obra. | FR6.6–FR6.8 |
| **BR8.4** | policy | La opinión propia va primero, en estado `own` (fondo destacado y «Tu opinión» en la tarjeta), con «Editar» y fechas; sin botón de publicar. | AC4.2.1–AC4.2.4 |
| **BR8.5** | policy | Obra sin opiniones: identidad, mensaje y botón; sin Spotify también. | AC4.3.1, AC4.3.3 |
| **BR8.6** | policy | Carga del detalle con esqueletos de cabecera y dos opiniones. | AC4.1.6 |
| **BR8.7** | policy | Portada fallida: bloque con la inicial y el resto visible. | FR11.3, AC4.1.4 |
| **BR8.8** | policy | Error del detalle: «No pudimos cargar esta obra.» y «Reintentar». | AC4.1.5 |
| **BR8.9** | policy | Título «Detalle de obra» y «‹ Volver» a la misma posición. | FR2.3, AC2.3.2 |
| **BR8.10** | policy | El detalle de opinión muestra una opinión completa; propia con «Editar» y fechas. | AC2.3.3, AC9.1.4 |
| **BR8.11** | policy | El detalle de opinión repite la identidad de la obra y se titula «Detalle de opinión». | mockups.md |
| **BR8.12** | policy | Carga, error y portada fallida del detalle de opinión. | FR11.1–FR11.3 |
| **BR9.1** | constraint | Perfil muestra avatar, «Usuario demo», «@demo» y contadores. | FR9.1, AC9.1.1 |
| **BR9.2** | policy | Contadores «N opiniones · N siguiendo», en vivo y en singular cuando toca. | AC9.1.1, AC9.1.2 |
| **BR9.3** | policy | «Mis opiniones» en variante compact, de la más reciente a la más antigua. | FR9.4, AC9.1.3 |
| **BR9.4** | policy | Tocar una opinión propia abre su detalle completo con «Editar». | FR9.6, AC9.1.4 |
| **BR9.5** | policy | Sin opiniones propias: «Todavía no has publicado opiniones.» y «Crear opinión». | AC9.1.5 |
| **BR9.6** | policy | Carga de Perfil con esqueletos de identidad y lista. | AC9.1.6 |
| **BR9.7** | policy | Error de Perfil: «No pudimos cargar tu perfil.» y «Reintentar». | AC9.1.7 |
| **BR9.8** | policy | «Cerrar sesión» usa `appSession` y vuelve a Login sin tocar Spotify ni contenido. | FR1.5, FR9.3 |
| **BR9.9** | constraint | En U2 Perfil no pinta la tarjeta de Spotify. | Q2 = A |
| **BR10.1** | constraint | Los detalles se apilan dentro de la pestaña, con barra visible y la raíz montada debajo. | FR2.3, AC2.3.1 |
| **BR10.2** | policy | «‹ Volver» y atrás desapilan y devuelven a la posición anterior. | AC2.3.2 |
| **BR10.3** | policy | Toda carga usa esqueletos con la forma del contenido. | FR11.1 |
| **BR10.4** | constraint | Todo error va en español, llano y con «Reintentar» cuando aplica. | FR11.2 |
| **BR10.5** | policy | Sin conexión se conserva lo cargado y no se pinta error de servidor. | FR11.4 |
| **BR10.6** | constraint | Todo texto visible está en español. | FR11.5 |

## Assumptions & Open Questions

- `[assumption]` El contenido vive en memoria y se pierde al cerrar la app; la interfaz no promete persistencia (CT-02, CT-03 y `components.md` § ContentStore).
- `[assumption]` Las fechas de la siembra se calculan como desfase respecto al arranque (2 h, 5 h, 1 d…), no como constantes del calendario, para que «hace 2 h» siga siendo cierto en cada ejecución y las pruebas puedan fijar el reloj.
- `[assumption]` El estado `error` de las cuatro pantallas es defensivo —el contenido es local— pero es una ruta real y comprobable con un doble que falle; FR11.1 lo exige y los mockups fijan sus textos.
- `[assumption]` El error de metadatos de AC2.1.6 (banner «No pudimos actualizar las portadas.») se implementa y se prueba con un doble del catálogo; en U2 no hay resolución real de portadas porque no hay sesión de Spotify. La ruta real la ejercita U4.
- `[assumption]` Los `workId` de la siembra son identificadores de Spotify reales, pero no se verifican contra la API en esta unidad porque U2 no hace red; U4 comprueba cada uno al resolver metadatos y, si alguno no existe, la app conserva el título y el artista sembrados y la portada en bloque (BR5.2).
- `[assumption]` «‹ Volver» se pinta en la cabecera que posee la cáscara para los detalles; la cabecera raíz la pinta cada pantalla. Es la única lectura posible sin reasignar todas las cabeceras a la cáscara (ver `functional-spec.md` § Enmiendas a C1 y C2).
- **Open question para U3**: la etiqueta de seguir que pinta `OpinionCard` es «Seguir», mientras los mockups escriben «Seguir autor» en la tarjeta y en el detalle. U2 no la usa (tarjetas de lectura); U3 decide si cambia la etiqueta o los mockups.
- **Reparto corregido aquí**: `unit-of-work.md` § U2 lista Inicio, Detalle de obra y Perfil, y C2 dice que «U2 aporta el detalle de obra y U3 el de opinión»; el mapa de historias, en cambio, asigna US2.3 (abrir el detalle desde una tarjeta) a U2, y AC2.3.3 se verifica sobre la opinión completa. Esta unidad entrega y registra también el **detalle de opinión** porque sin él US2.3 y AC9.1.4 no se pueden cumplir; U3 no lo rehace y solo cablea «Editar» a su formulario (R-44). La divergencia se eleva a la persona en el gate de revisión para que el mapa y `unit-of-work.md` se alineen.
- **«Destacada» se lee como el estado `own` de la tarjeta**: fondo `color.primaryContainer`, etiqueta «Tu opinión» dentro de la tarjeta, «Editar» y fechas (`interaction-spec.md` § OpinionCard). No es solo el orden: AC4.2.1 pide una marca visual y así tiene token y punto de observación.
- `[assumption]` El cambio de la cáscara (montar toda la pila de la pestaña) es de esta unidad porque lo exige una AC suya; se publica como C2 1.2.0 y no cambia ninguna prop ni exportación.
- **Open question para U4**: el chip «Conectar» de Inicio y la tarjeta de Spotify de Perfil quedan sin acción en U2; U4 los cablea a `ShellServices.spotify` sin cambiar la cáscara.
