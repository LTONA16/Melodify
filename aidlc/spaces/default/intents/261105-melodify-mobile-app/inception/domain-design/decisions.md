# Decisiones de arquitectura — Melodify

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (`requirements`), `inception/user-stories/stories.md` (`stories`), `inception/practices-discovery/team-practices.md` (`team-practices`), del diseño aprobado en `inception/refined-mockups/` (`mockups`, `interaction-spec`, `design-system-mapping`), de `inception/domain-design/components.md` y de las respuestas de `domain-design-questions.md` (Q1–Q7).
> Fecha: 2026-11-09. Etapa: Domain Design. Agente: aidlc-architect-agent.

Cada decisión que cambia la forma del código y que costaría revertir tiene su registro. Las decisiones rutinarias —nombres de archivo, formato, estilo— no están aquí: las resuelve la práctica del equipo.

---

## ADR-001: Nueve componentes para una sola app Expo

### Status

Accepted

### Date

2026-11-09

### Context

Melodify es una app Expo que corre en Expo Go, sin backend y sin base de datos (RC-01, RC-02). Todo el contenido creado vive en memoria (RC-03). Hay seis pantallas, dos vistas de detalle y un inventario de componentes visuales compartidos (`design-system-mapping.md`), más dos integraciones externas —Spotify y el estado de red—, una sesión de app simulada y una sesión de Spotify real que persiste en el dispositivo. Hay que decidir qué es un bloque de software y qué no, sabiendo que todo se despliega junto y que Units Generation agrupará después estas piezas en unidades de trabajo.

### Decision

El sistema se compone de nueve bloques: `AppShell`, `DesignSystem`, `AppSession`, `SpotifyAuth`, `SpotifyCatalog`, `Catalog`, `ContentStore`, `ActivityFeed` y `Connectivity`. Las pantallas no son componentes: son contenedores dentro de `AppShell`. Las dependencias externas —Spotify Accounts API, Spotify Web API, almacenamiento del dispositivo, almacenamiento seguro y estado de red— son dependencias, no componentes.

### Consequences

**Positivas**
- Cada bloque tiene una responsabilidad nombrable, un dueño de datos claro y se puede probar con dobles sin red ni credenciales.
- La cadena de Spotify queda unidireccional y aislada: solo `SpotifyCatalog` conoce la forma de la API.
- El catálogo sirve de base directa a Units Generation y a Contract Design sin tener que inventar piezas después.

**Negativas**
- Nueve piezas para una app pequeña es más estructura de la estrictamente mínima; el coste se paga en unos pocos archivos de más, no en ceremonia.
- `AppShell` conoce a siete componentes y es el punto con más aristas del grafo; si crece sin control, se convierte en el contenedor de todo.

**Neutras**
- El reparto es reversible: `ContentStore` se puede partir o `SpotifyCatalog` se puede absorber sin cambiar las pantallas, porque las fronteras ya están marcadas.

### Alternatives Rejected

- **Un único módulo con todo**: menos archivos y menos indirección, pero mezcla seguridad, persistencia, catálogo y contenido; no se puede probar la lógica social sin montar la app entera.
- **Una componente por pantalla más navegación y sistema de diseño**: refleja la estructura de carpetas, pero produce seis piezas sin entidades ni reglas propias que siempre cambian juntas.
- **Un componente por dominio desplegable (servicios)**: no aplica; no hay despliegue independiente ni backend, y crearía fronteras de red donde no hay red.

---

## ADR-002: Un único `ContentStore` para el contenido y el estado social

### Status

Accepted

### Date

2026-11-09

### Context

Opiniones, me gusta, comentarios y seguimientos se pierden al recargar (RC-03, FR7.6). Los contadores de me gusta y de comentarios se pintan en la tarjeta de opinión, junto al texto, y el contador de seguidos en Perfil. La invariante central —una opinión por obra y persona (FR6.1)— afecta a la creación, a la edición y a la propia tarjeta. Había que decidir si ese estado se reparte por preocupación o se mantiene junto.

### Decision

Un solo `ContentStore` posee `Author`, `Opinion`, `Comment`, `Like` y `Follow`, impone la regla de una opinión por obra y persona, sella las fechas de creación y modificación y notifica los cambios a quien escucha. Las pantallas no guardan copia del estado: leen y escriben a través de él.

### Consequences

**Positivas**
- Una sola copia de la verdad: el contador de la tarjeta, el de Actividad y el de Perfil no pueden discrepar.
- La invariante de una opinión por obra se comprueba en un sitio, no en cada pantalla.
- El contenido de ejemplo se siembra una vez y todas las pantallas lo ven.

**Negativas**
- Es el componente con más entidades (cinco) y más superficie de escritura; un cambio en su forma toca a `AppShell` y a `ActivityFeed`.
- Si el contenido creciera hasta necesitar persistencia, este es el punto que habría que sustituir; por eso el resto no lo conoce por dentro.

**Neutras**
- Partirlo más adelante es posible sin tocar las pantallas si se conserva la interfaz de lectura y escritura.

### Alternatives Rejected

- **Dos almacenes (opiniones por un lado, social por otro)**: cada me gusta escribiría en dos sitios y los contadores vivirían en el almacén social mientras la tarjeta los pinta junto a la opinión; sincronización manual a cambio de nada.
- **Tres almacenes (contenido, interacciones, actividad)**: añade una pieza que en esta versión no tiene ciclo de vida propio, porque la actividad es derivada (ADR-005).
- **Estado dentro de cada pantalla**: la opinión publicada en Crear tiene que aparecer en Inicio, Actividad y Perfil; sin un almacén común habría que pasarla a mano por tres caminos.

---

## ADR-003: `Catalog` es el dueño de la obra musical

### Status

Accepted

### Date

2026-11-09

### Context

La obra tiene dos procedencias: el catálogo de ejemplo, que es local y existe siempre (FR4.5, A2), y la búsqueda en Spotify, que solo existe con sesión y red (FR4.1). Cada opinión debe referenciar una obra por su identificador de Spotify y guardar en local el título y el artista (FR3.2). Con dos orígenes y una sola app, era fácil acabar con dos entidades «obra» o con metadatos duplicados.

### Decision

`Catalog` posee la entidad `Work` —`workId`, `title`, `artist`, `coverUrl`, `origin`—, mantiene el catálogo de ejemplo, incorpora los resultados de Spotify y resuelve una obra por identificador. `workId` **es** el identificador de Spotify de la obra, también para las obras del catálogo de ejemplo (son reales, A2), así que la referencia de la opinión es literalmente la que pide FR3.2 y no hay dos campos que puedan discrepar. Las opiniones referencian la obra por `workId` y guardan un resumen de `workTitle` y `workArtist` en el momento de escribir. Para decidir la portada, `Catalog` declara sus tres entradas: `SpotifyAuth` le dice si hay sesión, `Connectivity` si hay red y `ContentStore` cuántas opiniones tiene la obra.

### Consequences

**Positivas**
- Una sola entidad «obra» para las dos procedencias; la interfaz no distingue una obra de ejemplo de una real.
- Las opiniones se pintan sin sesión, sin red y sin consultar el catálogo, porque llevan su resumen de metadatos.
- La caché de búsqueda y la decisión de portada tienen un sitio natural y no contaminan el adaptador de Spotify.

**Negativas**
- El resumen de título y artista puede quedar desfasado si Spotify cambia el metadato; se acepta porque la app no edita obras y el dato es de presentación.
- `Catalog` mezcla dos fuentes y dos ritmos —catálogo local inmutable y búsqueda remota—, así que es el componente con más lógica de composición, y es el segundo punto con más aristas del grafo: depende de `SpotifyCatalog`, `ContentStore`, `SpotifyAuth` y `Connectivity` para decidir la portada y contar opiniones.
- Al ser `workId` el identificador de Spotify, una obra de ejemplo que no exista en Spotify tendría que inventarse un identificador; el catálogo de ejemplo solo admite obras reales (A2), así que hoy no ocurre.

**Neutras**
- Si el catálogo de ejemplo desapareciera, `Catalog` seguiría teniendo sentido como dueño de la obra y caché.

### Alternatives Rejected

- **La obra nace con la primera opinión en `ContentStore`**: duplica metadatos y deja obras sin opiniones fuera del modelo, justo cuando el detalle de una obra vacía es una pantalla (US4.3).
- **La obra pertenece a `SpotifyCatalog`**: deja fuera el catálogo de ejemplo y obliga a tener una segunda lista de obras «de mentira» que la interfaz tendría que distinguir.
- **La obra compartida por `Catalog` y `ContentStore`**: dos dueños es exactamente el olor que esta etapa tiene que resolver, no crear.

---

## ADR-004: `SpotifyAuth` y `SpotifyCatalog` son dos componentes

### Status

Accepted

### Date

2026-11-09

### Context

La conexión con Spotify tiene dos mitades con fuerzas distintas. La autorización PKCE y el token (FR10.1–FR10.4) tocan la seguridad: client ID por entorno, sin client secret, token en almacenamiento seguro, caducidad, borrado al desconectar. La búsqueda y los metadatos (FR4.1–FR4.3) son consumidores de ese token que fallan por red, por límite de peticiones o por resultados vacíos. NFR3 se verifica con un doble de `expo-secure-store`, y el adaptador se verifica sustituyendo la API.

### Decision

Dos componentes. `SpotifyAuth` construye la autorización PKCE con S256, intercambia el código, guarda y recupera el token en el almacenamiento seguro, lo borra al desconectar y expone el estado de la conexión —incluidos el error, el token inválido y la instalación sin configurar—. `SpotifyCatalog` usa el token de `SpotifyAuth` para buscar y resolver metadatos y portadas, y normaliza la respuesta al modelo interno.

### Consequences

**Positivas**
- El token no lo toca nadie más: una sola frontera que auditar y un solo doble que sustituir para NFR3.
- La búsqueda se puede probar sin credenciales ni flujo de autorización, y la autorización sin red.
- Los estados de conexión de FR10.8 y FR9.5 tienen un único origen, que cualquier superficie puede pintar.

**Negativas**
- Una indirección más: `SpotifyCatalog` depende de `SpotifyAuth` para cada llamada.
- El estado de conexión viaja por `AppShell` hasta las pantallas; si aparece una superficie nueva, hay que decidir dónde se muestra (ver R-01 en `components.md`).

**Neutras**
- `SpotifyCatalog` podría absorber `SpotifyAuth` más adelante si la conexión dejara de ser interactiva, pero hoy no lo es.

### Alternatives Rejected

- **Un único `SpotifyClient`**: menos piezas, pero mezcla el flujo de autorización con la búsqueda y obliga a montar un doble que finja el navegador del sistema para probar un resultado de búsqueda.
- **Tres piezas con un `SpotifyTokenStore` aparte**: separa el almacenamiento del flujo, pero deja dos componentes hablando del mismo token y una frontera que no aporta nada mientras solo haya una cuenta y un token.

---

## ADR-005: La actividad se deriva del contenido, no se registra

### Status

Accepted

### Date

2026-11-09

### Context

FR8.1 pide una lista cronológica con publicaciones propias, me gusta recibidos y comentarios recibidos, agrupada por día, que se amplía en vivo al publicar (FR8.2, AC8.1.3). Todos esos hechos ya existen en el contenido: la fecha de creación de la opinión, los me gusta recibidos y los comentarios recibidos. La alternativa era un registro de eventos escrito en cada acción y sembrado al arrancar.

### Decision

`ActivityFeed` es un componente de solo lectura que calcula la lista al abrirse a partir de `ContentStore`: publicaciones propias por fecha de creación, me gusta recibidos y comentarios recibidos; ordena, agrupa por día y se recalcula cuando el contenido cambia. No hay almacén de eventos.

### Consequences

**Positivas**
- No hay segunda copia de la verdad: es imposible que Actividad y el contenido discrepen.
- Publicar añade el evento sin escribir dos veces ni recargar la app.
- `ActivityFeed` no tiene estado propio que sembrar, migrar o limpiar.

**Negativas**
- Cada apertura recalcula la lista; con el volumen de esta versión (una decena de opiniones) es irrelevante, y si creciera habría que memoizar.
- Solo puede mostrar hechos que el contenido guarda: un evento sin dato de origen —por ejemplo, un me gusta dado— no aparecería aunque se quisiera (ver ADR-006).

**Neutras**
- La derivación es reversible: si en el futuro hace falta historial completo, se introduce un registro y `ActivityFeed` pasa a leerlo sin cambiar la pantalla.

### Alternatives Rejected

- **Registro propio de eventos escrito en cada acción**: da historial explícito, pero hay que escribirlo en cada ruta —publicar, comentar, recibir— y sembrarlo, y puede desincronizarse del contenido.
- **Registro solo para lo recibido y publicaciones leídas del contenido**: dos mecanismos para una sola lista, sin ventaja frente a derivarlo todo.

---

## ADR-006: Actividad muestra solo eventos recibidos

### Status

Accepted

### Date

2026-11-09

### Context

FR8.1 enumera publicaciones propias, me gusta recibidos y comentarios recibidos. El criterio AC7.1.3 de US7.1 dice que al dar me gusta «aparece el evento de me gusta correspondiente» en Actividad. Requisito y criterio no dicen lo mismo, y la revisión de los mockups refinados lo dejó como R-03, aceptado como riesgo. Con el modelo derivado de ADR-005, un me gusta dado no tiene por qué convertirse en evento, pero el criterio seguía pidiéndolo.

### Decision

Actividad muestra exclusivamente eventos recibidos: publicaciones propias, me gusta recibidos y comentarios recibidos. Dar me gusta o comentar la opinión de otra persona no genera evento. El criterio AC7.1.3 se corrige en la historia como error de redacción —edición fechada del 2026-11-09—, no se implementa.

### Consequences

**Positivas**
- Requisito y criterio vuelven a decir lo mismo y la contradicción queda cerrada antes de construir.
- No se añade un cuarto tipo de evento con su icono, su texto y su caso de prueba.
- La lista responde a la pregunta que la pantalla promete: «qué pasó con lo que publiqué».

**Negativas**
- Quien dé me gusta no verá reflejo de esa acción en Actividad; es coherente con la pantalla, pero es una decisión de producto que conviene recordar.
- La corrección viaja a `stories.md` como edición fechada de AC7.1.3: quien lea solo la historia verá la nota, y la historia y el diseño coinciden desde esta etapa.

**Neutras**
- Si más adelante se quisiera mostrar lo dado, basta con ampliar el modelo derivado y el copy, sin tocar la estructura de la pantalla.

### Alternatives Rejected

- **Añadir el me gusta dado**: un cuarto evento con su icono y su texto, que además necesitaría un dato de origen que hoy no existe en el modelo; contradice FR8.1.
- **Mostrar todo lo dado y lo recibido**: duplica la lista con acciones de poco valor para la persona y convierte Actividad en un registro de auditoría.

---

## ADR-007: La interfaz se compone con `AppShell` y `DesignSystem`

### Status

Accepted

### Date

2026-11-09

### Context

El diseño aprobado tiene cinco pestañas y seis pantallas, dos vistas de detalle dentro de la pestaña, una hoja de comentarios, un banner de sin conexión, un snackbar y el inventario de componentes compartidos de `design-system-mapping.md`. La práctica del equipo organiza por dominio (`app/src/screens/<pantalla>/`, `app/src/components/`) y exige que la tarjeta de opinión sea única. Había que decidir si cada pantalla era un componente del catálogo.

### Decision

`AppShell` contiene la navegación y las seis pantallas como contenedores finos, y presenta los elementos globales —banner, snackbar, hoja—. `DesignSystem` contiene el tema y todos los componentes visuales compartidos, con la tarjeta de opinión como pieza única y la marca de opinión propia como propiedad (`isOwn`), no como una variante más. El inventario de `design-system-mapping.md` es la lista autoritativa y `DesignSystem` lo implementa entero: incluye `ConnectionCard`, `SpotifyCard`, `WorkResultRow`, `ActivityRow`, `DayHeader`, `RatingInput` y `SocialActionBar`, que no pertenecen a una sola pantalla. El `Snackbar` se pinta en `DesignSystem` y lo presenta `AppShell`, que decide cuándo hay algo que confirmar. Las pantallas se documentan en la tabla de responsabilidades de `AppShell`, no como componentes.

### Consequences

**Positivas**
- El catálogo no se llena de piezas sin entidades ni reglas propias.
- La tarjeta de opinión tiene un solo dueño, que es lo que impide que cuatro pantallas la reimplementen.
- `DesignSystem` cambia por motivos de diseño y `AppShell` por motivos de navegación: dos ritmos separados.

**Negativas**
- `AppShell` es un componente grande; su tabla de responsabilidades es más larga que la de los demás y hay que vigilar que no acumule reglas de negocio.
- La marca `isOwn` resuelve R-10 sin reabrir el diseño, pero no sustituye a una revisión de los mockups.

**Neutras**
- Extraer una pantalla a componente propio más adelante no rompe nada si mantiene las props que `AppShell` ya usa.

### Alternatives Rejected

- **`AppShell` + `Screens` + `DesignSystem`**: separa navegación de pantallas, pero las dos piezas siempre cambian juntas y la frontera no aísla ningún riesgo.
- **Una componente por pantalla**: más piezas, ninguna con datos ni reglas propias; el catálogo parecería más completo y diría menos.

---

## ADR-008: `Connectivity` es la única fuente de «sin conexión»

### Status

Accepted

### Date

2026-11-09

### Context

FR11.4 pide que sin conexión se conserve lo cargado, las portadas pasen a bloque y la cabecera avise. Inicio, Explorar y Crear tienen estados de sin conexión (FR3.5, FR4.6, FR5.7). Un fallo de red y un fallo de Spotify pueden producir el mismo error visible, pero significan cosas distintas: uno se resuelve solo al volver la red y el otro necesita «Reintentar» o reconectar.

### Decision

`Connectivity` escucha el estado de red del dispositivo y lo expone como una sola señal, con aviso de cambios. Las pantallas y la cabecera lo consumen; `Catalog` lo consulta para decidir entre portada real y bloque de inicial, y `SpotifyCatalog` informa de los fallos de sus propias peticiones. La interfaz usa `Connectivity` para decidir entre «sin conexión» y «error con Reintentar».

### Consequences

**Positivas**
- El aviso es el mismo en todas las pantallas y no depende de qué petición falló primero.
- El estado se puede sustituir por un doble en las pruebas, así que los estados de sin conexión son verificables sin apagar la red.
- Separa dos causas que la persona percibe distinto: sin red frente a un servicio que falla.

**Negativas**
- Una dependencia más sobre el sistema operativo, con su propio comportamiento en Expo Go.
- «Conectado» no garantiza que Spotify responda: siguen haciendo falta los estados de error de cada petición.

**Neutras**
- Si el sistema no informa con fiabilidad, el error de la petición sigue siendo la red de seguridad; `Connectivity` no lo sustituye.

### Alternatives Rejected

- **Sin componente, deducir el aviso del último fallo**: barato, pero confunde «sin red» con «Spotify no responde» y hace que el aviso aparezca y desaparezca según la última llamada.
- **Consultar solo al arrancar**: no reacciona a que la red se caiga o vuelva mientras la app está abierta, que es justo el caso de FR11.4.

---

## ADR-009: Navegación con React Navigation, pila dentro de la pestaña

### Status

Accepted

### Date

2026-11-09

### Context

El diseño exige cinco pestañas persistentes, un detalle apilado dentro de la pestaña de origen con «Volver» (FR2.3), una hoja de comentarios que no cambia de pestaña (FR7.2) y conservar la posición del feed al volver (AC2.3.2). La app corre en Expo Go (RC-01), así que la librería tiene que estar soportada allí sin compilación propia. Los mockups dejaron la elección de navegador a esta etapa.

### Decision

Se usa React Navigation con `@react-navigation/native`, `@react-navigation/bottom-tabs` y `@react-navigation/native-stack`. Cada pestaña tiene su propia pila; el detalle se apila dentro de la pestaña de origen y «Volver» desapila conservando el estado de la lista. La hoja de comentarios es un modal sobre la pantalla actual. El prefijo de enlace que PKCE necesite para volver a la app se configura en el contenedor de navegación cuando Functional Design fije el redirect URI (A6); esta etapa no lo elige.

### Consequences

**Positivas**
- Cubre pestañas, pilas anidadas, conservación de estado y gesto de atrás de Android sin código propio.
- Está soportada en Expo Go y es la opción con más documentación y ejemplos del ecosistema.
- La hoja como modal no cambia de pestaña ni desmonta la pantalla de debajo, que es lo que pide FR7.2.

**Negativas**
- Tres dependencias más y una configuración de enlaces que hay que mantener.
- Añade un nivel de indirección entre la app y las pantallas, con su propia curva de aprendizaje.

**Neutras**
- Si el proyecto migrara a `expo-router`, la estructura de pantallas cambiaría, pero las pantallas y su lógica no.

### Alternatives Rejected

- **`expo-router`**: navegación por archivos, atractiva en proyectos nuevos, pero impone una estructura de rutas distinta de `app/src/screens/` y una configuración de enlaces que aquí no aporta frente al coste de adopción.
- **Navegación propia con estado**: control total, pero reimplementar pestañas, pilas, atrás de Android y conservación de estado es más código del que la app necesita y más superficie de error.

---

## ADR-010: Estado con Context y `useReducer`, sin librería externa

### Status

Accepted

### Date

2026-11-09

### Context

`ContentStore` tiene cinco entidades y unas pocas operaciones —publicar, editar, dar y quitar me gusta, comentar, seguir—, y `ActivityFeed` deriva de él. El equipo exige cobertura del 80 % de líneas y pruebas de la lógica de estado sin red (team-practices). La app es pequeña y no tiene estado asíncrono propio más allá de las llamadas a Spotify.

### Decision

El estado se implementa con React Context y `useReducer`: un reductor puro por dominio de estado, acciones explícitas y un proveedor que monta `AppShell`. No se añade Zustand, Redux ni MobX. Los reductores se prueban directamente, sin montar la interfaz.

### Consequences

**Positivas**
- Cero dependencias nuevas y un modelo de estado que se lee en un archivo.
- Los reductores puros son la unidad más fácil de cubrir al 80 % y de probar sin dobles.
- La forma de las acciones documenta qué se puede hacer con el contenido.

**Negativas**
- Context rerenderiza a los consumidores; con listas largas habría que partir contextos o memoizar, algo que aquí no hace falta por el volumen.
- No hay herramientas de depuración de estado de terceros; el reductor y sus acciones son el rastro.

**Neutras**
- Cambiar a una librería externa después es local a los proveedores; los componentes no saben cómo se guarda el estado.

### Alternatives Rejected

- **Zustand**: menos repintados y muy cómodo, pero una dependencia más y un modelo de suscripción que esta app no necesita.
- **Redux Toolkit**: robusto y con herramientas, desproporcionado para cinco entidades que viven en memoria y se pierden al recargar.
- **Estado local por pantalla**: rompe la aparición inmediata de la opinión publicada en Inicio, Actividad y Perfil.

---

## ADR-011: El recuerdo de la sesión de la app usa `expo-secure-store`

### Status

Accepted

### Date

2026-11-09

### Context

FR1.4 pide recordar que la persona entró y abrir Inicio al reiniciar; FR1.5 pide borrar ese recuerdo al cerrar sesión. El proyecto ya necesita `expo-secure-store` para el token de Spotify (FR10.3). Había que decidir dónde vive un dato que no es secreto pero sí tiene que sobrevivir al reinicio.

### Decision

La sesión de la app se guarda en `expo-secure-store`, en una clave propia distinta de la del token de Spotify, y se borra al cerrar sesión. No se añade `AsyncStorage`.

### Consequences

**Positivas**
- Una dependencia menos que instalar y que mantener compatible con Expo Go.
- Un solo mecanismo de persistencia en toda la app, con las mismas garantías y el mismo doble en pruebas.
- Cerrar sesión de la app y desconectar Spotify quedan como dos claves distintas y dos acciones distintas.

**Negativas**
- `expo-secure-store` está pensado para secretos y tiene un límite de tamaño recomendado pequeño; aquí se guarda un identificador y una marca, así que sobra capacidad.
- La lectura es algo más lenta que la de un almacén no seguro; el arranque ya espera a esa lectura, como describe la Pantalla 0 de los mockups.

**Neutras**
- Si el proyecto necesitara guardar contenido local más adelante, `AsyncStorage` entraría entonces y solo para eso.

### Alternatives Rejected

- **`AsyncStorage`**: es el sitio natural para un dato no sensible, pero añade una dependencia nueva para guardar dos valores cuando ya hay un almacén en uso.
- **Solo memoria**: no cumple FR1.4; al reiniciar se volvería a pedir credenciales.
- **Guardar la sesión dentro del token de Spotify**: mezcla dos sesiones que FR1.5 y FR9.2 mantienen separadas.

---

## ADR-012: Actividad y Perfil exponen un contrato de estados, aunque su cálculo sea local

### Status

Accepted

### Date

2026-11-09

### Context

ADR-005 hace que la actividad se derive del contenido en memoria, y el perfil se lee del mismo sitio. FR8.4 pide que Actividad cubra los estados de carga, vacío («Todavía no hay actividad») y error con «Reintentar»; los mockups los dibujan con esqueletos agrupados por día y con «No pudimos cargar tu actividad.», y hacen lo mismo con Perfil («No pudimos cargar tu perfil.»). Un cálculo síncrono en memoria, tal como estaba escrito, no tiene nada que esperar ni que falle, así que esos criterios no tenían punto de observación. Es la misma clase de contradicción que AC7.1.3, y había que elegir entre corregir los criterios o darles un contrato.

### Decision

Se mantienen FR8.4 y los estados de los mockups, y `ActivityFeed` expone un contrato explícito —`loading`, `ready`, `empty`, `error`—; `AppShell` aplica el mismo contrato a la vista de Perfil. `loading` es real: es el primer montaje, mientras el contenido termina de sembrarse. `error` es defensivo —el contenido vive en memoria—, pero es una ruta de primera clase: si la derivación no puede completarse o la siembra falla, se pinta el bloque de error con el texto de los mockups y una acción de reintento que vuelve a derivar, y las pruebas la ejercitan con un doble que falla. No se corrigen FR8.4, AC8.1.6 ni AC8.1.7.

### Consequences

**Positivas**
- Los criterios de Actividad y Perfil tienen dónde observarse, y la interfaz usa los mismos textos y la misma acción de reintento que el resto de errores.
- El contrato hace explícito lo que antes era una suposición: que la lista siempre está lista al pintar.
- Es coherente con la práctica del equipo de probar los estados de cada pantalla (vacío, carga, error) sin red ni credenciales.

**Negativas**
- El estado de error describe un fallo que en producción no debería ocurrir; se acepta porque el coste es un bloque y una prueba, y porque quitar el estado obligaría a reabrir FR8.4 y los mockups.
- Añade una responsabilidad a `AppShell`, que ya era el componente más cargado.

**Neutras**
- Si algún día la actividad viniera de un backend, el contrato ya está y solo cambia de dónde salen los datos.

### Alternatives Rejected

- **Corregir FR8.4, AC8.1.6 y AC8.1.7 como se corrige AC7.1.3**: deja el diseño más limpio, pero borra tres estados que la persona ya aprobó en los mockups y deja la pantalla sin respuesta cuando algo falla.
- **Simular una espera artificial para que el esqueleto se vea**: hace visible el estado a costa de mentir sobre el comportamiento; el esqueleto debe durar lo que dura la siembra, ni más ni menos.
- **Dar por hecho que la lista siempre está lista y no pintar ningún estado**: contradice lo aprobado y deja sin cubrir el caso de siembra fallida.

---

## Decisiones que esta etapa deja abiertas

| Tema | Dónde se cierra | Por qué no bloquea |
|---|---|---|
| Redirect URI de PKCE | Functional Design (A6, RC-09) | `SpotifyAuth` y la navegación aceptan el prefijo que se fije; no cambia qué componentes existen. |
| Límite del texto y obligatoriedad de la valoración | Functional Design (OQ1, A1) | Afecta a la validación del formulario, no al catálogo de componentes. |
| Superficie del error de conexión fuera de Perfil (R-01) | Functional Design o revisión de diseño | `SpotifyAuth` ya expone el estado; falta decidir dónde se pinta. |
| Estado «sin sesión + sin conexión» de Explorar (R-02) | Functional Design o revisión de diseño | `Catalog` tiene el catálogo de ejemplo local, así que el estado es posible. |
| Token de portada de 48 dp, barra lateral, `own` y rol del chip (R-07, R-08, R-10, R-11) | Ajuste de los mockups o Code Generation | R-10 queda atendido con `isOwn`; el resto es presentación. |

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9, RC-01–RC-09, A1–A6, OQ1–OQ4).
- `stories` — `inception/user-stories/stories.md` (US1.1–US11.2 y sus criterios).
- `team-practices` — `inception/practices-discovery/team-practices.md` (cobertura, CI, organización por dominio).
- `mockups` — `inception/refined-mockups/mockups.md`; `interaction-spec` — `inception/refined-mockups/interaction-spec.md`; `design-system-mapping` — `inception/refined-mockups/design-system-mapping.md`.
- `components` — `inception/domain-design/components.md` (catálogo al que estas decisiones dan forma).
- `domain-design-questions` — `inception/domain-design/domain-design-questions.md` (Q1–Q7 y confirmación).
