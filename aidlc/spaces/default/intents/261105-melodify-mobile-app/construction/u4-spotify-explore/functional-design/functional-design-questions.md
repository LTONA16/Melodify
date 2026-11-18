# Functional Design — Preguntas de `u4-spotify-explore`

> **Unidad**: `u4-spotify-explore` (Spotify y Explorar) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U4), `unit-of-work-story-map.md` (US2.2, US3.1, US3.2, US10.1, US10.2), `stories.md` (AC2.2.1–AC2.2.2, AC3.1.1–AC3.1.8, AC3.2.1–AC3.2.4, AC10.1.1–AC10.1.6, AC10.2.1–AC10.2.5), `requirements.md` (FR3.3–3.4, FR4.1–4.6, FR9.2, FR10.1–10.8, FR11.3–11.4, FR12.2, RC-05, RC-08, RC-09, A6, OQ2), `contract-summary.md` (C2, C5, C7, C9, C10), `mockups.md` (Explorar y matriz de estados), `interaction-spec.md` y `external-dependency-map.md`.

Estas cinco preguntas cierran lo que quedó abierto al empezar U4: el redirect de PKCE que U1 dejó confirmado a medias (A6), el hueco entre un resultado real de Spotify y el catálogo local, qué significa «obra» en la búsqueda, qué se conserva cuando la sesión se cae con resultados en pantalla y qué hace un artista entre resultados.

## Q1. [Alcance] ¿Qué hacemos con la conexión real de Spotify en esta entrega?

`U1 Q6` eligió `melodify://spotify-callback` y dejó escrito que la forma exacta se confirma contra el panel real en U4; `external-dependency-map.md` añade que el URI no se inventa: se calcula con `makeRedirectUri()` de Expo Go y se registra, y si no está cargado se deja la conexión real pendiente con el motivo. Ese momento es ahora, y lo que se sabe no es alentador:

- El panel de Spotify exige un valor **exacto** y estable, y acepta `https://` o loopback (`http://127.0.0.1:puerto`); un esquema propio como `melodify://` o el `exp://` de Expo Go no encaja en esas reglas.
- En Expo Go el retorno de `makeRedirectUri()` es `exp://<ip-de-la-lan>:8081/--/…`, que cambia con la red y que el panel probablemente rechaza.
- El loopback no sirve en un teléfono físico (RC-05): `127.0.0.1` es el propio teléfono, donde no escucha nada.
- `melodify://` solo lo puede recibir un build propio, no Expo Go, y CT-05 prohíbe un módulo o build que exija compilación propia.

`FR12.2` ya contempla el desenlace: si RC-09/A6 no se cumple, se demuestra el recorrido sin sesión y se dice por qué.

- A. **Implementar PKCE completo con redirect configurable y aceptar que la conexión real queda pendiente** (Recommended): `@melodify/spotify/auth` construye la URL con `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y un redirect que se lee de entorno (`EXPO_PUBLIC_SPOTIFY_REDIRECT_URI`, por defecto `melodify://spotify-callback`), hace S256, intercambia el código y guarda el token. Se intenta registrar `melodify://spotify-callback` en el panel; si lo rechaza, se anota el motivo y el recorrido se demuestra sin sesión (FR12.2). El código queda correcto y probado con dobles; lo que no se puede enseñar en el teléfono es el retorno real.
- B. **Probar el redirect de Expo Go**: se pega en el panel exactamente lo que devuelva `makeRedirectUri()` en el teléfono (`exp://<ip>:8081/--/spotify-callback`). Si el panel lo aceptara, la conexión real funcionaría sin build propio. A cambio, el valor depende de la IP y de la red, así que cualquier cambio de red lo invalida, y las reglas del panel apuntan a que será rechazado: es un intento con poca probabilidad, no una solución.
- C. **Migrar a un build de desarrollo (`expo-dev-client`)**: es la única vía técnica para que `melodify://` vuelva a la app en el teléfono. Rompe CT-05 (solo Expo Go), cambia el criterio de terminado del alcance y añade compilación local o en la nube, justo lo que `team.md` § Deployment dice que esta versión no hace.
- D. **Dejar la conexión real fuera de U4**: Explorar y los estados de sesión se construyen solo contra dobles y la autenticación pasa a otra entrega. Deja sin construir US10.1 y US10.2, que son Must Have y están asignadas a esta unidad.
- X. Other (please specify)

[Answer]: B

## Q2. [Arquitectura] ¿Cómo abre el detalle una obra de Spotify que el catálogo local no conoce?

`AC3.1.8` exige que tocar un resultado real abra el detalle de esa obra dentro de Explorar y que desde ahí se pueda opinar. Hoy `DetalleObraScreen` recibe solo `work: { workId }` y `useDetalleObra` lo busca con `catalog.getWork(workId)`; una obra que solo existe en los resultados de Spotify no está en el catálogo local y devuelve `404`, así que el detalle no se puede pintar. Lo mismo le pasa a Crear cuando U3 recibe `openCreate({ workId })` con una obra que no está en el catálogo. C5 no tiene hoy ninguna operación para añadir una obra.

- A. **La navegación lleva la `WorkView` completa** (Recommended): el detalle y Crear aceptan la obra como parámetro además del `workId`; si el catálogo local la conoce, mandan sus datos, y si no, usan la que llega. Las opiniones se leen por `workId` (ninguna → «Sé el primero en opinar»). C2 gana un parámetro de ruta opcional (cambio aditivo) y C5 no cambia. Se paga con un dato más en la navegación y una regla de precedencia que hay que probar.
- B. **El catálogo local recuerda la obra al abrirla**: una operación nueva `remember(work)` en C5 (U2) la añade al catálogo y avisa por `subscribe`, y el detalle y Crear no cambian. C5 gana una escritura y hay que decidir qué pasa cuando la obra ya existe como `sample` con `coverUrl: null` y llega la misma obra desde Spotify: si se sustituye, si se conserva el origen o si se fusiona la portada.
- C. **El detalle resuelve la obra con `SpotifyResolvePort` al abrirse**: solo viaja el `workId`, y el detalle pide los metadatos a Spotify con un estado de carga y otro de error. Funciona, pero añade una petición por cada apertura, un estado de pantalla que hoy no existe y no resuelve Crear, que también necesita la obra para pintar la fila fija.
- D. **Tocar un resultado abre Crear directamente**, sin detalle: evita el problema, pero contradice FR4.4 y AC3.1.8 y quita el paso donde se leen las opiniones de la obra.
- X. Other (please specify)

[Answer]: A

## Q3. [Producto] ¿Qué busca Explorar y qué promete el campo?

El mockup y `interaction-spec.md` ponen de placeholder «Busca artistas, álbumes…», pero C10 declara la búsqueda con `type: track` y cada resultado se pinta como una obra con título, artista y portada. La búsqueda de canciones de Spotify ya encuentra por nombre de artista dentro de las canciones, así que el texto promete más de lo que devuelve. `FR4.1` habla de «obras», y las opiniones se escriben sobre obras: el modelo no tiene hoy álbumes ni artistas como entidades opinables.

- A. **Solo canciones y placeholder «Busca canciones o artistas…»** (Recommended): C10 se queda con `type=track`, la búsqueda encuentra canciones por título o por artista, y se corrige el texto del mockup y de `interaction-spec.md` como decisión de esta etapa. Cero cambios de contrato; se paga con una enmienda de copy que hay que registrar.
- B. **Canciones, álbumes y artistas** (`type=track,album,artist`): resultados heterogéneos con tarjetas distintas. Habría que definir qué es una «obra» opinable, cómo se abre el detalle de un artista que no es una obra y qué pasa con las opiniones sobre un álbum. Cambia C10 y el modelo de contenido, no solo la pantalla.
- C. **Dejar el placeholder «Busca artistas, álbumes…» y buscar solo canciones**: no se toca nada, pero la interfaz promete artistas y álbumes que nunca aparecen como tales.
- X. Other (please specify)

[Answer]: B

## Q4. [Producto] ¿Qué se conserva cuando la sesión se cae con resultados en pantalla?

`AC10.2.3` y `FR10.5` dicen que un token inválido devuelve la interfaz a «Conectar» con un aviso, y `FR11.4` dice que sin conexión se conserva lo cargado y se avisa en la cabecera. Con una búsqueda ya hecha, las dos reglas se cruzan: el estado de sesión cambia a «Conectar», pero no está dicho qué pasa con la lista de resultados que la persona está mirando. La matriz de estados solo cubre «sin conexión» con «caché si existe».

- A. **Conservar los resultados con portadas de bloque y un aviso con «Volver a conectar»** (Recommended): la cabecera vuelve a «Conectar» y Perfil muestra el token inválido, pero la lista y el texto buscado siguen en pantalla para no perder lo que se estaba leyendo. Al reconectar, una nueva búsqueda vuelve a pedir a Spotify. Es la lectura de FR11.4 aplicada también al token caído.
- B. **Sustituir la lista por la tarjeta de conexión y las sugerencias de ejemplo**: pantalla coherente con el estado «sin sesión» y sin avisos mezclados, pero borra de golpe lo que la persona estaba mirando y la consulta escrita.
- C. **Conservar la lista, vaciar el campo y volver al estado inicial**: deja la pantalla limpia y consistente, a costa de borrar la consulta y obligar a reescribirla cuando se reconecte.
- X. Other (please specify)

[Answer]: A

## Q5. [Producto] Con canciones, álbumes y artistas en la búsqueda, ¿qué es una obra opinable y qué hace tocar un artista?

La respuesta B de Q3 mete tres tipos de resultado en la misma búsqueda, pero el contenido y el detalle solo conocen «obras»: título, artista, portada y un `workId` sobre el que se escribe una opinión. Una canción encaja tal cual. Un álbum también (identificador, nombre, artista y portada) y se puede opinar sobre él como obra. Un artista no: no tiene título ni artista, y su detalle no sería el de una obra. Sin esta decisión, el diseño no puede decir qué hace tocar una fila de artista ni si un álbum abre el mismo detalle que una canción.

- A. **Álbumes y canciones son obras opinables; un artista no es una obra: tocarlo rellena el campo con su nombre y relanza la búsqueda** (Recommended): el detalle, Crear y las opiniones funcionan igual sobre canciones y álbumes, y el artista actúa como atajo de búsqueda sin una pantalla nueva. Se paga con que la lista mezcla filas de dos clases y con que tocar un artista cambia el texto del campo.
- B. **Álbumes y canciones opinables; tocar un artista abre una pantalla de artista con sus canciones**: más completo para explorar, pero añade una pantalla, una petición más (`artists/{id}/top-tracks` o una búsqueda por `artist:`) y sus estados de carga y error.
- C. **Solo las canciones son obras; álbumes y artistas son atajos que relanzan la búsqueda por su nombre**: el modelo no cambia en nada y no hay que decidir qué es un álbum como obra; a cambio, un álbum nunca se puede opinar aunque aparezca como resultado.
- D. **Solo canciones y álbumes; los artistas se piden a Spotify pero no se muestran**: la lista se queda en lo opinable, pero se descarta un tercio de lo que la búsqueda trae y Q3=B queda a medias.
- X. Other (please specify)

[Answer]: A
