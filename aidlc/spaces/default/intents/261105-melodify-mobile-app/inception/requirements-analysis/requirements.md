# Requirements — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, `ideation/rough-mockups/wireframes.md` (que reabre la frontera de producto el 2026-11-06), las prácticas afirmadas en `inception/practices-discovery/team-practices.md` y las respuestas de `requirements-analysis-questions.md` (Q1–Q11).
> Fecha: 2026-11-06. Etapa: Requirements Analysis. Agente: aidlc-product-agent. Profundidad: Standard.

## Intent Analysis

Melodify es una app móvil de opinión musical: la persona entra, ve opiniones sobre obras, descubre obras en el catálogo real de Spotify, publica su propia opinión y comprueba que aparece en su actividad y en su perfil. El objetivo de esta primera versión no es operar un servicio, sino **demostrar el recorrido completo de las seis pantallas en un teléfono Android real**, con el catálogo de Spotify como fuente de obras y portadas y con todo lo social simulado en local.

Tres cosas definen el valor y, a la vez, el límite del trabajo:

- **El recorrido manda**: se prefiere una pantalla menos ambiciosa pero recorrible antes que una pantalla rica que rompe el recorrido.
- **Lo real es el catálogo; lo simulado es la comunidad**: obras, portadas y metadatos vienen de Spotify; opiniones, autores, me gusta, comentarios y seguidores son inventados y viven en memoria.
- **Sin Spotify la app sigue sirviendo**: entrar, leer, comentar y publicar sobre obras del catálogo de ejemplo no requiere cuenta.

## Functional Requirements

### FR1 — Login simulado y sesión de la app

- **FR1.1**: La app abre en una pantalla de Login con los campos «Usuario» y «Contraseña», el botón «Entrar», el nombre «Melodify» y una pista visible con las credenciales de demostración («Demo: usuario y contraseña: `demo`»), para que quien abre la app sepa cómo entrar.
- **FR1.2**: Solo las credenciales `demo` / `demo` permiten entrar; cualquier otro valor muestra un error en línea bajo el campo y no abandona la pantalla.
- **FR1.3**: Al entrar, la app navega a Inicio.
- **FR1.4**: La app recuerda que la persona ya entró: al reiniciarla se abre directamente en Inicio, sin volver a pedir credenciales.
- **FR1.5**: Perfil ofrece «Cerrar sesión», que borra ese recuerdo y vuelve al Login.
- **FR1.6**: Login no muestra barra inferior y no se puede abandonar sin entrar.

### FR2 — Navegación y estructura

- **FR2.1**: Una barra inferior persistente ofrece cinco destinos: Inicio, Explorar, Crear, Actividad y Perfil.
- **FR2.2**: Las cinco pestañas son hermanas; Inicio es la que recibe a la persona al entrar.
- **FR2.3**: El detalle de una obra o de una opinión se abre dentro de la pestaña de origen, con «Volver», y no es un sexto destino de la barra.
- **FR2.4**: La app sigue el tema claro u oscuro del sistema.

### FR3 — Inicio

- **FR3.1**: Inicio muestra un feed vertical de 8 a 10 opiniones de ejemplo de 4 a 5 autores, cada una con autor, obra, valoración y texto de dos o tres líneas como máximo en la tarjeta.
- **FR3.2**: Cada opinión de ejemplo referencia una obra real de Spotify por su identificador y guarda en local el título y el artista de esa obra.
- **FR3.3**: La cabecera de Inicio muestra el estado de Spotify: «Conectado» o «Conectar».
- **FR3.4**: Con sesión de Spotify, las tarjetas muestran portada y metadatos reales; sin sesión, muestran un bloque con la inicial de la obra.
- **FR3.5**: Inicio cubre los estados de carga (esqueletos), vacío, error de metadatos con «Reintentar» (la lista local sigue visible con portadas de bloque) y sin conexión (se conserva lo cargado y se avisa en la cabecera).
- **FR3.6**: Al publicar una opinión, esta aparece en la parte superior de Inicio.
- **FR3.7**: El contenido de ejemplo se reparte así: 8 a 10 opiniones de 4 a 5 autores sobre 6 a 8 obras. La cuenta demo es autora de 3 de esas opiniones —aparecen en el feed y se listan en Perfil— y sigue a 2 de los autores de ejemplo desde el primer arranque. Actividad precarga los eventos que les corresponden: las 3 publicaciones propias, 2 «me gustó» recibidos y 3 comentarios recibidos sobre esas opiniones.
- **FR3.8**: Tocar una tarjeta de Inicio abre el detalle de esa opinión, con el texto completo sin recortar.

### FR4 — Explorar

- **FR4.1**: Explorar busca en el catálogo real de Spotify y devuelve obras.
- **FR4.2**: La búsqueda se dispara desde 2 caracteres, espera 400 ms de pausa antes de pedir y guarda los resultados en memoria mientras dure la app.
- **FR4.3**: Cada resultado muestra portada, título, artista y el número de opiniones que esa obra tiene en Melodify; si no tiene ninguna, invita a ser el primero.
- **FR4.4**: Tocar un resultado abre el detalle de la obra, desde donde se puede opinar.
- **FR4.5**: Sin sesión de Spotify, Explorar muestra una tarjeta que explica que la búsqueda en el catálogo real requiere conectar, con el botón «Conectar con Spotify», y debajo las obras del catálogo de ejemplo como sugerencia, abribles y opinables con portada de bloque.
- **FR4.6**: Explorar cubre los estados sin conectar, inicial (sin texto), cargando, vacío («Sin resultados para …»), error con «Reintentar» y sin conexión a internet.

### FR5 — Crear

- **FR5.1**: Crear ofrece un formulario con obra (buscador en el catálogo de Spotify), texto de la opinión y valoración.
- **FR5.2**: «Publicar» se habilita solo cuando hay obra seleccionada, texto no vacío y valoración. La obligatoriedad de la valoración es provisional: Functional Design la cierra (A1, OQ1) y este requisito se ajusta entonces a lo que se decida.
- **FR5.3**: Al publicar, la app vuelve a Inicio y la opinión aparece arriba.
- **FR5.4**: «Cancelar» vuelve a la pantalla anterior sin publicar.
- **FR5.5**: Crear puede abrirse con la obra ya seleccionada desde Explorar o desde el detalle; en ese caso el buscador aparece plegado y se puede desplegar para cambiarla.
- **FR5.6**: Sin sesión de Spotify, el buscador se sustituye por un selector del catálogo de ejemplo encabezado por una tarjeta de conexión; se puede elegir una obra de ejemplo, escribir, valorar y publicar, y la opinión se guarda con portada de bloque.
- **FR5.7**: Crear cubre los estados formulario vacío, buscando obra, sin resultados, error al publicar (conserva lo escrito), publicación correcta y sin Spotify.

### FR6 — Opinión única, edición y detalle

- **FR6.1**: Una persona publica como máximo una opinión por obra.
- **FR6.2**: Si la obra ya tiene la opinión de la persona, el detalle la muestra primero y destacada, con la acción «Editar», y no ofrece publicar otra.
- **FR6.3**: «Editar» abre el mismo formulario de Crear en modo edición, dentro del detalle: la obra queda fija y no se puede cambiar, el texto y la valoración llegan rellenos, y «Guardar» actualiza esa misma opinión —no crea otra— y vuelve al detalle.
- **FR6.4**: Toda opinión guarda fecha de creación y fecha de modificación. La de modificación se muestra como «Editada el …» cuando es posterior a la de creación; tras editar, el detalle muestra la fecha de creación y, si cambió, la de modificación.
- **FR6.5**: El detalle muestra la portada, el título, el artista, la valoración con estrellas y número, el texto completo sin recortar, el autor y el tiempo transcurrido.
- **FR6.6**: Cuando la obra no tiene opiniones, el detalle muestra solo su identidad y el botón «Opinar sobre esta obra», que abre Crear con la obra preseleccionada.
- **FR6.7**: Cuando la obra tiene opiniones de otros autores y ninguna de la persona, el detalle muestra su identidad, la lista de esas opiniones —autor, valoración, texto completo y tiempo transcurrido— y el botón «Opinar sobre esta obra», que abre Crear con la obra preseleccionada.
- **FR6.8**: Cuando la obra tiene la opinión de la persona y también de otros autores, la propia aparece primero con «Editar» y debajo se listan las de los demás; en ese caso no aparece «Opinar sobre esta obra».
- **FR6.9**: El detalle cubre los estados de carga de portada, portada fallida (bloque con inicial), error de red del resto del contenido y obra sin opiniones.

### FR7 — Interacción social simulada

- **FR7.1**: La tarjeta de opinión muestra `♡` con un contador; tocarlo lo convierte en `♥`, sube el contador y volver a tocarlo lo deshace.
- **FR7.2**: La tarjeta muestra `💬` con un contador; tocarlo abre la hoja de comentarios de esa opinión sobre la pantalla actual, sin cambiar de pestaña.
- **FR7.3**: La hoja de comentarios lista los comentarios existentes y ofrece un campo «Escribe un comentario…» para añadir uno; los comentarios se guardan en memoria.
- **FR7.4**: «Seguir autor» alterna a «Siguiendo» y actualiza el contador de seguidos del Perfil.
- **FR7.5**: La hoja de comentarios cubre los estados vacío («Sé el primero en comentar»), con comentarios y error al enviar (conserva el texto).
- **FR7.6**: Ninguna interacción social sale del dispositivo.

### FR8 — Actividad

- **FR8.1**: Actividad muestra una lista cronológica agrupada por día con publicaciones propias, me gusta recibidos y comentarios recibidos.
- **FR8.2**: La lista llega precargada con eventos de ejemplo y se amplía en vivo cuando la persona publica.
- **FR8.3**: Tocar un evento abre la opinión correspondiente en su vista de detalle.
- **FR8.4**: Actividad cubre los estados de carga, vacío («Todavía no hay actividad») y error con «Reintentar».

### FR9 — Perfil

- **FR9.1**: Perfil muestra la identidad simulada (usuario demo, `@demo`), el número de opiniones propias y el número de autores seguidos.
- **FR9.2**: Perfil ofrece la acción de conectar Spotify o, si ya hay sesión, la de desconectar.
- **FR9.3**: Perfil ofrece «Cerrar sesión», que vuelve al Login.
- **FR9.4**: Perfil lista las opiniones propias.
- **FR9.5**: Perfil cubre los estados conectado, desconectado, conectando (indicador), error de conexión con «Reintentar», token inválido (vuelve a «Conectar» con aviso) y vacío de opiniones.
- **FR9.6**: Tocar una opinión de Perfil abre su detalle, con el texto completo y la acción «Editar».

### FR10 — Autenticación y sesión de Spotify

- **FR10.1**: La autorización con Spotify usa PKCE desde la app; no hay client secret en ninguna parte del cliente ni del repositorio.
- **FR10.2**: El client ID se lee de la variable de entorno `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`.
- **FR10.3**: El token se guarda en el almacenamiento seguro del dispositivo (`expo-secure-store`) y se borra al desconectar.
- **FR10.4**: La conexión persiste entre reinicios de la app: al reabrir, la sesión sigue activa y las portadas se resuelven sin volver a autorizar.
- **FR10.5**: Un token inválido o caducado devuelve la interfaz a «Conectar» con un aviso en lenguaje llano.
- **FR10.6**: La app no pide permisos de usuario de Spotify; solo usa el catálogo público para búsqueda, metadatos y portadas.
- **FR10.7**: Un fallo de autorización, de intercambio de código o de lectura del token se muestra con mensaje y acción, nunca en silencio.
- **FR10.8**: Si `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` falta o no es válida, la app no intenta autorizar: arranca sin sesión de Spotify, funciona con el catálogo de ejemplo y, al tocar «Conectar», muestra el aviso «La conexión con Spotify no está configurada en esta instalación» junto a «Reintentar», sin bloquear el resto de la app.

### FR11 — Estados, errores y degradación

- **FR11.1**: Todas las pantallas salvo Login cubren los estados de vacío, carga y error.
- **FR11.2**: Los errores se muestran en lenguaje llano con una acción «Reintentar»; nunca un código técnico ni un mensaje en inglés.
- **FR11.3**: Si falla una portada, la tarjeta queda con el bloque de la inicial y no deja un hueco roto.
- **FR11.4**: Sin conexión, la app conserva lo ya cargado, usa portadas de bloque y avisa en la cabecera.
- **FR11.5**: Todo texto visible para quien usa la app está en español.
- **FR11.6**: Los estados vacíos de Inicio, Actividad y Perfil existen como estado de interfaz definido y se ejercitan en las pruebas con un almacén sin contenido; en la app aparecen cuando la lista correspondiente no tiene elementos.

### FR12 — Recorrido completo

- **FR12.1**: El recorrido de las seis pantallas se completa sin errores en Expo Go sobre un teléfono Android físico.
- **FR12.2**: El recorrido se demuestra dos veces: sin sesión de Spotify y con sesión de Spotify. La segunda depende de RC-09 y A6 (app de Spotify registrada y redirect URI acordado); sin ese prerrequisito, se demuestra solo la primera y se dice por qué.

## Non-Functional Requirements

- **NFR1 — Fiabilidad**: el recorrido completo de las seis pantallas termina sin cierres inesperados ni pantallas en blanco; es el criterio de terminado acordado.
- **NFR2 — Usabilidad**: cada pantalla se alcanza con un toque desde la barra inferior y cada acción principal se completa en dos toques o menos desde su pantalla; todo error dice qué pasó y ofrece «Reintentar», y ninguna tarea del recorrido exige leer una explicación previa. Se comprueba a mano en el teléfono, pantalla por pantalla.
- **NFR3 — Seguridad**: no hay client secret ni credenciales en el repositorio; el token de Spotify vive solo en almacenamiento seguro y se borra al desconectar.
- **NFR4 — Privacidad**: no se recogen datos de terceros ni se envían a un servidor propio; el token pertenece a la cuenta de Spotify de la propia persona. El registro de restricciones CR-03 debe reescribirse antes de que haya usuarios reales.
- **NFR5 — Mantenibilidad**: TypeScript en `strict`, Prettier y ESLint en CI, y la cobertura del 80 % de líneas sobre `app/src/**` que fija la práctica del equipo.
- **NFR6 — Accesibilidad**: contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande e iconos, en tema claro y oscuro; áreas táctiles de al menos 44×44 en la barra inferior, los botones principales y los iconos de la tarjeta. Las etiquetas de lector de pantalla quedan fuera de esta versión. El contraste se comprueba sobre los colores definidos en los mockups refinados.
- **NFR7 — Compatibilidad**: la app corre dentro de Expo Go en Android; iOS no se verifica en esta versión.
- **NFR8 — Rendimiento**: no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores.
- **NFR9 — Observabilidad**: no hay panel ni telemetría; la única superficie de diagnóstico es lo que la propia app muestra a la persona.

## Constraints

- **RC-01**: Solo APIs y módulos disponibles en Expo Go; ningún módulo nativo que exija compilación propia.
- **RC-02**: Sin backend propio, sin base de datos y sin autenticación real de la app; el login es simulado.
- **RC-03**: El contenido creado vive en memoria y se pierde al recargar.
- **RC-04**: Una sola persona construye y prueba; costo cero.
- **RC-05**: La verificación se hace en un teléfono Android físico con Expo Go, no en emulador.
- **RC-06**: La interfaz va solo en español, sin infraestructura de internacionalización.
- **RC-07**: Sin reproducción de audio, sin notificaciones push y sin publicación en tiendas.
- **RC-08**: La búsqueda depende de la red y de los límites de peticiones de la API de Spotify.
- **RC-09**: Para el recorrido con sesión de Spotify hace falta un prerrequisito externo: una app registrada en el portal de desarrolladores de Spotify, con su client ID entregado por entorno y un redirect URI registrado que PKCE usa para volver a la app. Registrar esa app y elegir el redirect URI es trabajo previo a la demostración, no de la app; sin ello, el recorrido se demuestra solo sin sesión.

> Los identificadores `RC-01`…`RC-09` son propios de este documento. Las restricciones del registro de la ideación se citan por su identificador de origen (`constraint-register` `CT-*` / `CR-*`) y no se renumeran aquí.

## Assumptions

- **A1**: Los límites exactos del texto de la opinión y la obligatoriedad de la valoración se fijan en Functional Design, tal como se respondió en Q5; hasta entonces, «Publicar» exige obra, texto no vacío y valoración, y FR5.2 queda marcado como provisional hasta esa decisión.
- **A2**: El catálogo de ejemplo es un conjunto fijo y local de 6 a 8 obras reales de Spotify, con 4 a 5 autores de ejemplo; de cada obra se guardan identificador, título y artista.
- **A3**: Las versiones mínimas de sistema operativo se fijan al crear el proyecto Expo.
- **A4**: El nombre y la identidad visual se limitan a «Melodify»; el detalle de color y tipografía se resuelve en los mockups refinados.
- **A5**: CR-03 se reescribe antes de que la app tenga usuarios reales; en esta versión la app no se distribuye.
- **A6**: El redirect URI que PKCE usa para volver a la app se decide en el diseño funcional y debe coincidir con el registrado en el portal de Spotify (RC-09); hasta entonces, el recorrido con sesión no se puede demostrar.

## Out of Scope

- Backend, API propia, base de datos y autenticación real de la app.
- Reproducción de audio.
- Notificaciones push y notificaciones locales dentro de la app.
- Publicación en Google Play o App Store.
- Persistencia del contenido creado entre sesiones.
- Internacionalización; la interfaz va solo en español.
- Integración con Apple Music, Last.fm u otros servicios musicales distintos de Spotify.
- Permisos de usuario de Spotify (perfil, biblioteca, reproducción).
- Fase de operación: observabilidad, despliegue, incidentes y rendimiento medido.

## Open Questions

- **OQ1**: Límite máximo del texto de la opinión y obligatoriedad de la valoración; se resuelven en Functional Design (A1).
- **OQ2**: Límites de peticiones de la API de Spotify; si aprietan, se resuelve con la caché local ya prevista en FR4.2 y se decide en el diseño técnico.
- **OQ3**: Comando de verificación de Construction del primer tramo; se elige al entrar a Construction.
- **OQ4**: El README del repositorio describe React Native con `npm run android` y queda desactualizado frente a Expo Go hasta que exista `app/`.

## Sources

- `[desc]` Descripción inicial del pedido.
- `[scope]` Alcance de workflow: `mvp`.
- `[Q1]`–`[Q11]` Respuestas de esta etapa (`requirements-analysis-questions.md`).
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.
- `scope-document` — `ideation/scope-definition/scope-document.md`.
- `wireframes` — `ideation/rough-mockups/wireframes.md` (cambio de alcance del 2026-11-06 y mapa de estados).
- `team-practices` — `inception/practices-discovery/team-practices.md`.
- `aidlc/spaces/default/memory/project.md` — reglas duras afirmadas.
