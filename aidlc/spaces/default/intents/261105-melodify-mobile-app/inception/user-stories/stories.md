# User Stories — Melodify

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9), `ideation/rough-mockups/wireframes.md`, `inception/practices-discovery/team-practices.md` y las respuestas de `user-stories-questions.md` (Q1–Q5).
> Fecha: 2026-11-06. Etapa: User Stories. Agente: aidlc-product-agent. Persona única: P1 — Luis, el oyente que opina (`personas.md`).

## Formato y convenciones

- **Historia**: «Como [persona], quiero [objetivo], para [beneficio]». Identificador `US{grupo}.{secuencia}`.
- **Criterios**: Given/When/Then. Identificador `AC{grupo}.{secuencia}.{criterio}`.
- **Prioridad**: MoSCoW. Todo lo escrito es **Must Have**: el alcance `mvp` ya recortó el producto y nada de lo que queda es opcional para recorrer las seis pantallas.
- **Criterios por historia**: la mayoría lleva entre 3 y 5; unas pocas llevan 6 cuando los estados (carga, vacío, error, sin conexión) no caben en menos.
- **Idioma**: todos los textos visibles citados van en español, tal como los verá la persona.

## Mapa de historias

| Tramo del recorrido | Historias | Prioridad |
|---|---|---|
| Entrar y sesión de la app | US1.1, US1.2, US1.3 | Must Have |
| Inicio | US2.1, US2.2, US2.3 | Must Have |
| Explorar | US3.1, US3.2 | Must Have |
| Detalle de obra | US4.1, US4.2, US4.3 | Must Have |
| Crear | US5.1, US5.2, US5.3 | Must Have |
| Editar | US6.1 | Must Have |
| Reaccionar | US7.1, US7.2, US7.3 | Must Have |
| Actividad | US8.1 | Must Have |
| Perfil | US9.1 | Must Have |
| Conectar Spotify | US10.1, US10.2 | Must Have |
| Recorrido completo | US11.1, US11.2 | Must Have |

---

## US1 — Entrar y sesión de la app

### US1.1 — Entrar con la cuenta de demostración

**Como** Luis, el oyente que opina, **quiero** entrar con la cuenta de demostración, **para** usar la app sin registrarme.

- **Prioridad**: Must Have
- **Depende de**: nada
- **Traza**: FR1.1, FR1.2, FR1.3, FR1.6
- **INVEST**: independiente (solo necesita la pantalla de Login); valiosa (es la puerta de la app); pequeña (una pantalla y una validación); testeable (credenciales y mensaje son observables).

**Criterios de aceptación**

- **AC1.1.1** — Given la app abierta sin sesión de la app iniciada, When miro la pantalla de Login, Then veo los campos «Usuario» y «Contraseña», el botón «Entrar», el nombre «Melodify» y la pista «Demo: usuario y contraseña: demo», y no veo barra inferior.
- **AC1.1.2** — Given estoy en Login, When escribo `demo` en los dos campos y toco «Entrar», Then la app abre Inicio con el feed.
- **AC1.1.3** — Given estoy en Login, When escribo unas credenciales distintas de `demo` / `demo` y toco «Entrar», Then veo un mensaje en línea bajo el campo, sigo en Login y lo escrito se conserva.
- **AC1.1.4** — Given estoy en Login, When intento volver atrás o cambiar de pestaña, Then no hay forma de salir de Login sin entrar.

### US1.2 — Volver a la app y caer en Inicio

**Como** Luis, el oyente que opina, **quiero** que la app recuerde que ya entré, **para** no repetir las credenciales cada vez que abro.

- **Prioridad**: Must Have
- **Depende de**: US1.1
- **Traza**: FR1.4, FR2.1, FR2.2
- **INVEST**: independiente de las historias de contenido; valiosa (ahorra el primer paso en cada uso); pequeña (una comprobación al arrancar); testeable (la pantalla inicial es observable).

**Criterios de aceptación**

- **AC1.2.1** — Given entré antes y no he cerrado sesión, When cierro y vuelvo a abrir la app, Then se abre directamente en Inicio sin pedir credenciales.
- **AC1.2.2** — Given la app se abre directo en Inicio, When miro la barra inferior, Then sus cinco destinos están disponibles y nombrados: Inicio, Explorar, Crear, Actividad y Perfil.
- **AC1.2.3** — Given he cerrado sesión, When vuelvo a abrir la app, Then se abre en Login.

### US1.3 — Cerrar sesión y volver al Login

**Como** Luis, el oyente que opina, **quiero** cerrar sesión desde Perfil, **para** dejar la app como recién instalada.

- **Prioridad**: Must Have
- **Depende de**: US1.1, US9.1
- **Traza**: FR1.5, FR9.3
- **INVEST**: independiente; valiosa (devuelve el control del acceso); pequeña (una acción); testeable (pantalla inicial y recuerdo de sesión son observables).

**Criterios de aceptación**

- **AC1.3.1** — Given estoy en Perfil con la sesión de la app iniciada, When toco «Cerrar sesión», Then vuelvo al Login.
- **AC1.3.2** — Given he cerrado sesión, When vuelvo a abrir la app, Then se abre en Login y pide `demo` / `demo`.
- **AC1.3.3** — Given he cerrado sesión, When miro la app, Then no recuerda que había entrado.
- **AC1.3.4** — Given estoy en Login tras cerrar sesión, When entro de nuevo con `demo` / `demo`, Then llego a Inicio y el contenido de ejemplo sigue ahí.

---

## US2 — Inicio

### US2.1 — Ver el feed de opiniones

**Como** Luis, el oyente que opina, **quiero** ver un feed de opiniones al entrar, **para** saber qué se está diciendo de la música que me interesa.

- **Prioridad**: Must Have
- **Depende de**: US1.1
- **Traza**: FR3.1, FR3.2, FR3.5, FR3.6, FR3.7, FR11.1, FR11.6
- **INVEST**: independiente; valiosa (es la pantalla de llegada); pequeña (una lista con estados); testeable (número de tarjetas, contenido y estados son observables).

**Criterios de aceptación**

- **AC2.1.1** — Given entro en la app, When Inicio termina de cargar, Then veo entre 8 y 10 opiniones de 4 a 5 autores sobre 6 a 8 obras distintas, cada tarjeta con autor, obra, valoración y texto de dos o tres líneas como máximo.
- **AC2.1.2** — Given estoy en Inicio, When miro la cabecera, Then veo el estado de Spotify: «Conectado» o «Conectar».
- **AC2.1.3** — Given estoy en Inicio, When publico una opinión, Then aparece en la parte superior del feed.
- **AC2.1.4** — Given Inicio está cargando, When miro la pantalla, Then veo esqueletos de tarjeta y no una pantalla en blanco.
- **AC2.1.5** — Given Inicio no tiene contenido, When termina de cargar, Then veo un estado vacío con un mensaje y una acción, no una lista rota.
- **AC2.1.6** — Given fallan los metadatos de Spotify, When Inicio termina de cargar, Then la lista local sigue visible con portadas de bloque y la cabecera ofrece «Reintentar».

### US2.2 — Ver portadas y metadatos según la sesión de Spotify

**Como** Luis, el oyente que opina, **quiero** ver las portadas reales cuando tengo Spotify y un bloque con la inicial cuando no, **para** reconocer las obras sin que la app dependa de la cuenta.

- **Prioridad**: Must Have
- **Depende de**: US2.1, US10.1
- **Traza**: FR3.3, FR3.4, FR11.3, FR11.4
- **INVEST**: independiente del resto del contenido; valiosa (reconocer la obra de un vistazo); pequeña (una regla de presentación); testeable (portada o bloque son observables).

**Criterios de aceptación**

- **AC2.2.1** — Given tengo sesión de Spotify, When miro las tarjetas de Inicio, Then cada una muestra la portada real y los metadatos de su obra.
- **AC2.2.2** — Given no tengo sesión de Spotify, When miro las tarjetas de Inicio, Then cada una muestra un bloque con la inicial de la obra en lugar de una portada.
- **AC2.2.3** — Given una portada no carga, When miro su tarjeta, Then queda el bloque con la inicial y no un hueco roto.
- **AC2.2.4** — Given no hay conexión a internet, When miro Inicio, Then se conserva lo ya cargado, las portadas pasan a bloque y la cabecera avisa.

### US2.3 — Abrir el detalle desde una tarjeta

**Como** Luis, el oyente que opina, **quiero** tocar una tarjeta y leer la opinión completa, **para** no quedarme en el texto recortado del feed.

- **Prioridad**: Must Have
- **Depende de**: US2.1
- **Traza**: FR3.8, FR2.3
- **INVEST**: independiente; valiosa (da acceso al texto completo); pequeña (una navegación); testeable (pantalla de destino y texto visible).

**Criterios de aceptación**

- **AC2.3.1** — Given estoy en Inicio, When toco una tarjeta, Then se abre el detalle de esa opinión dentro de la pestaña de Inicio.
- **AC2.3.2** — Given estoy en el detalle abierto desde Inicio, When toco «Volver», Then vuelvo a Inicio en la misma posición del feed.
- **AC2.3.3** — Given el texto de la tarjeta está recortado, When abro el detalle, Then veo el texto completo sin recortar.

---

## US3 — Explorar

### US3.1 — Buscar obras en el catálogo de Spotify

**Como** Luis, el oyente que opina, **quiero** buscar obras en el catálogo real de Spotify, **para** encontrar música que todavía no está en mi feed.

- **Prioridad**: Must Have
- **Depende de**: US10.1 (sesión de Spotify)
- **Traza**: FR4.1, FR4.2, FR4.3, FR4.4, FR4.6, FR11.1
- **INVEST**: independiente; valiosa (abre el catálogo entero); pequeña (una búsqueda con estados); testeable (pausa, resultados y mensajes son observables).

**Criterios de aceptación**

- **AC3.1.1** — Given tengo sesión de Spotify y estoy en Explorar, When escribo 2 caracteres, Then la búsqueda espera 400 ms antes de pedir y consulta el catálogo real de Spotify.
- **AC3.1.2** — Given hay resultados, When miro la lista, Then cada uno muestra portada, título, artista y el número de opiniones que esa obra tiene en Melodify.
- **AC3.1.3** — Given una obra no tiene opiniones, When miro su resultado, Then invita a ser el primero en opinar.
- **AC3.1.4** — Given una búsqueda no devuelve nada, When termina, Then veo «Sin resultados para …» con el texto que escribí.
- **AC3.1.5** — Given una búsqueda falla, When termina, Then veo un mensaje en lenguaje llano con «Reintentar» y conservo el texto escrito.
- **AC3.1.6** — Given repito una búsqueda ya hecha, When escribo los mismos caracteres, Then los resultados salen de la caché en memoria sin una nueva petición.
- **AC3.1.7** — Given la búsqueda está en curso, When miro la pantalla, Then veo un indicador de búsqueda ocupando el espacio de los resultados y no una pantalla en blanco.
- **AC3.1.8** — Given veo resultados del catálogo real, When toco uno, Then se abre el detalle de esa obra dentro de la pestaña Explorar y desde ahí puedo opinar.

### US3.2 — Explorar sin sesión de Spotify

**Como** Luis, el oyente que opina, **quiero** explorar y opinar sin conectar Spotify, **para** usar la app aunque no quiera dar mi cuenta.

- **Prioridad**: Must Have
- **Depende de**: US2.2 (portadas de bloque y metadatos del catálogo de ejemplo)
- **Traza**: FR4.5, FR11.4
- **INVEST**: independiente; valiosa (sostiene la promesa «la app sirve sin cuenta»); pequeña (una pantalla con dos bloques); testeable (tarjeta de conexión y sugerencias son observables).

**Criterios de aceptación**

- **AC3.2.1** — Given no tengo sesión de Spotify, When abro Explorar, Then veo una tarjeta que explica que buscar en el catálogo real requiere conectar, con el botón «Conectar con Spotify».
- **AC3.2.2** — Given no tengo sesión de Spotify, When miro debajo de la tarjeta, Then veo las obras del catálogo de ejemplo como sugerencia, con portada de bloque.
- **AC3.2.3** — Given no tengo sesión de Spotify, When toco una obra de ejemplo, Then se abre su detalle y puedo opinar sobre ella.
- **AC3.2.4** — Given no tengo sesión y no hay conexión, When abro Explorar, Then veo la tarjeta de conexión y las obras de ejemplo, con el aviso de sin conexión en la cabecera.

---

## US4 — Detalle de obra

### US4.1 — Ver una obra con opiniones de otros

**Como** Luis, el oyente que opina, **quiero** abrir una obra y leer lo que otros han dicho, **para** decidir si quiero opinar yo también.

- **Prioridad**: Must Have
- **Depende de**: US2.3, US3.1
- **Traza**: FR6.5, FR6.7, FR6.9, FR2.3, FR11.1
- **INVEST**: independiente; valiosa (es donde se lee la comunidad); pequeña (una pantalla con lista y estados); testeable (identidad, lista y botón son observables).

**Criterios de aceptación**

- **AC4.1.1** — Given abro el detalle de una obra que tiene opiniones de otros autores y ninguna mía, When termina de cargar, Then veo la identidad de la obra —portada, título y artista— y la lista de esas opiniones.
- **AC4.1.2** — Given la lista de opiniones ajenas, When miro cada una, Then veo autor, valoración con estrellas y número, texto completo y tiempo transcurrido.
- **AC4.1.3** — Given la obra tiene opiniones de otros y ninguna mía, When miro el detalle, Then aparece «Opinar sobre esta obra».
- **AC4.1.4** — Given la portada falla, When miro la cabecera, Then queda el bloque con la inicial y el resto del contenido se ve.
- **AC4.1.5** — Given falla la red del resto del contenido, When miro el detalle, Then veo un mensaje con «Reintentar».
- **AC4.1.6** — Given abro el detalle de una obra, When los datos están cargando, Then veo esqueletos de la identidad y de la lista de opiniones ocupando su espacio, y no una pantalla en blanco.

### US4.2 — Ver mi opinión junto a las de otros

**Como** Luis, el oyente que opina, **quiero** encontrar mi opinión destacada y las de los demás debajo, **para** comprobar qué dije sin buscarla en el feed.

- **Prioridad**: Must Have
- **Depende de**: US5.1, US4.1
- **Traza**: FR6.2, FR6.5, FR6.8, FR6.4
- **INVEST**: independiente; valiosa (recupera lo escrito); pequeña (una regla de orden); testeable (orden, botón y fechas son observables).

**Criterios de aceptación**

- **AC4.2.1** — Given ya publiqué una opinión sobre esta obra, When abro su detalle, Then mi opinión aparece primero y destacada, con la acción «Editar».
- **AC4.2.2** — Given mi opinión está destacada, When miro debajo, Then se listan las opiniones de los demás autores.
- **AC4.2.3** — Given ya tengo opinión sobre la obra, When miro el detalle, Then no aparece «Opinar sobre esta obra».
- **AC4.2.4** — Given mi opinión se editó después de crearse, When miro sus fechas, Then veo la de creación y la de modificación con la etiqueta «Editada el …».

### US4.3 — Ver una obra sin opiniones

**Como** Luis, el oyente que opina, **quiero** ver una obra sin opiniones y poder ser el primero, **para** estrenarla con la mía.

- **Prioridad**: Must Have
- **Depende de**: US2.3 (navegación a un detalle)
- **Traza**: FR6.6, FR6.9
- **INVEST**: independiente; valiosa (abre obras nuevas); pequeña (un estado y un botón); testeable (contenido y acción son observables).

**Criterios de aceptación**

- **AC4.3.1** — Given abro el detalle de una obra sin opiniones, When termina de cargar, Then veo solo su identidad y el botón «Opinar sobre esta obra».
- **AC4.3.2** — Given estoy en una obra sin opiniones, When toco «Opinar sobre esta obra», Then Crear se abre con esa obra ya seleccionada.
- **AC4.3.3** — Given la obra no tiene opiniones y no tengo sesión de Spotify, When abro su detalle, Then la identidad se ve con portada de bloque y el botón sigue disponible.

---

## US5 — Crear

### US5.1 — Publicar desde Crear con una obra de Spotify

**Como** Luis, el oyente que opina, **quiero** buscar una obra, escribir mi opinión y publicarla, **para** dejar constancia de lo que pienso.

- **Prioridad**: Must Have
- **Depende de**: US10.1
- **Traza**: FR5.1, FR5.2, FR5.3, FR5.7, FR6.1
- **INVEST**: independiente; valiosa (es la acción central del producto); pequeña (un formulario con estados); testeable (habilitación del botón y resultado son observables).

**Criterios de aceptación**

- **AC5.1.1** — Given tengo sesión de Spotify y estoy en Crear, When busco y elijo una obra, Then la obra queda seleccionada y el buscador se pliega.
- **AC5.1.2** — Given tengo obra, texto y valoración, When miro «Publicar», Then está habilitado.
- **AC5.1.3** — Given me falta obra, texto o valoración, When miro «Publicar», Then está deshabilitado.
- **AC5.1.4** — Given tengo los tres campos, When toco «Publicar», Then vuelvo a Inicio y mi opinión aparece arriba.
- **AC5.1.5** — Given estoy buscando la obra, When miro la pantalla, Then veo el estado de búsqueda en curso y, si no hay coincidencias, el de sin resultados.
- **AC5.1.6** — Given elijo una obra sobre la que ya publiqué una opinión, When la selecciono, Then Crear avisa «Ya opinaste sobre esta obra» y ofrece «Editar mi opinión» en lugar de dejar publicar una segunda.

### US5.2 — Publicar sin sesión desde el catálogo de ejemplo

**Como** Luis, el oyente que opina, **quiero** publicar sobre una obra del catálogo de ejemplo sin conectar Spotify, **para** opinar aunque no tenga cuenta conectada.

- **Prioridad**: Must Have
- **Depende de**: US3.2
- **Traza**: FR5.6, FR5.3, FR11.4
- **INVEST**: independiente; valiosa (mantiene la app usable sin cuenta); pequeña (un selector en lugar de un buscador); testeable (selector, publicación y portada son observables).

**Criterios de aceptación**

- **AC5.2.1** — Given no tengo sesión de Spotify, When abro Crear, Then el buscador se sustituye por un selector del catálogo de ejemplo encabezado por una tarjeta de conexión.
- **AC5.2.2** — Given elijo una obra de ejemplo, escribo y valoro, When toco «Publicar», Then la opinión se guarda con portada de bloque y aparece arriba en Inicio.
- **AC5.2.3** — Given no tengo sesión y no hay conexión, When abro Crear, Then puedo elegir una obra de ejemplo y publicar igualmente.
- **AC5.2.4** — Given publiqué sin sesión, When abro el detalle de esa obra, Then mi opinión aparece con portada de bloque.

### US5.3 — Publicar desde el detalle sin perder lo escrito

**Como** Luis, el oyente que opina, **quiero** opinar desde el detalle de una obra y no perder lo que escribí si algo falla, **para** no reescribir mi opinión.

- **Prioridad**: Must Have
- **Depende de**: US4.1, US5.1
- **Traza**: FR5.4, FR5.5, FR5.7
- **INVEST**: independiente; valiosa (atajo y red de seguridad); pequeña (preselección y conservación de texto); testeable (obra preseleccionada y texto conservado son observables).

**Criterios de aceptación**

- **AC5.3.1** — Given estoy en el detalle de una obra, When toco «Opinar sobre esta obra», Then Crear se abre con la obra preseleccionada y el buscador plegado.
- **AC5.3.2** — Given Crear se abrió con la obra preseleccionada, When despliego el buscador, Then puedo cambiarla por otra.
- **AC5.3.3** — Given estoy escribiendo una opinión, When toco «Cancelar», Then vuelvo a la pantalla anterior sin publicar.
- **AC5.3.4** — Given falla la publicación, When miro la pantalla, Then veo un mensaje en lenguaje llano con «Reintentar» y conservo todo lo escrito.

---

## US6 — Editar

### US6.1 — Editar mi opinión y ver la fecha

**Como** Luis, el oyente que opina, **quiero** editar mi opinión y ver cuándo la cambié, **para** corregirla sin publicar otra y sin que parezca que la escribí hoy.

- **Prioridad**: Must Have
- **Depende de**: US4.2
- **Traza**: FR6.1, FR6.3, FR6.4, FR6.2
- **INVEST**: independiente; valiosa (corrige sin duplicar); pequeña (un formulario en modo edición); testeable (misma opinión, obra fija y fechas son observables).

**Criterios de aceptación**

- **AC6.1.1** — Given mi opinión está en el detalle, When toco «Editar», Then se abre el formulario en modo edición con el texto y la valoración rellenos.
- **AC6.1.2** — Given estoy editando, When miro la obra del formulario, Then está fija y no se puede cambiar.
- **AC6.1.3** — Given cambio el texto y guardo, When vuelvo al detalle, Then la misma opinión aparece actualizada y no se ha creado otra.
- **AC6.1.4** — Given guardé una edición, When miro las fechas del detalle, Then veo la fecha de creación y «Editada el …» con la de modificación.
- **AC6.1.5** — Given abro el formulario de edición y no cambio nada, When toco «Guardar», Then la opinión queda como estaba y no se marca como editada.

---

## US7 — Reaccionar

### US7.1 — Dar y quitar me gusta

**Como** Luis, el oyente que opina, **quiero** marcar que una opinión me gusta, **para** reaccionar sin escribir nada.

- **Prioridad**: Must Have
- **Depende de**: US2.1
- **Traza**: FR7.1, FR7.6, FR8.1
- **INVEST**: independiente; valiosa (reacción de un toque); pequeña (un icono y un contador); testeable (icono y contador son observables).

**Criterios de aceptación**

- **AC7.1.1** — Given una tarjeta de opinión, When toco `♡`, Then se convierte en `♥` y el contador sube en uno.
- **AC7.1.2** — Given ya di me gusta, When vuelvo a tocar `♥`, Then vuelve a `♡` y el contador baja en uno.
- **AC7.1.3** — Given doy me gusta a la opinión de otra persona, When miro Actividad, Then no aparece ningún evento por ese me gusta: Actividad muestra solo publicaciones propias, me gusta recibidos y comentarios recibidos. *(Corregido el 2026-11-09 en Domain Design, ADR-006: el criterio anterior pedía un evento de me gusta dado, que contradice FR8.1.)*
- **AC7.1.4** — Given doy me gusta, When cierro y vuelvo a abrir la app, Then el me gusta se ha perdido, porque el contenido vive en memoria.

### US7.2 — Comentar una opinión

**Como** Luis, el oyente que opina, **quiero** comentar una opinión, **para** responder a lo que otro dijo sin salir de la pantalla.

- **Prioridad**: Must Have
- **Depende de**: US2.1
- **Traza**: FR7.2, FR7.3, FR7.5, FR7.6
- **INVEST**: independiente; valiosa (conversación en contexto); pequeña (una hoja con lista y campo); testeable (hoja, lista y contador son observables).

**Criterios de aceptación**

- **AC7.2.1** — Given una tarjeta con `💬` y contador, When toco el icono, Then se abre la hoja de comentarios sobre la pantalla actual, sin cambiar de pestaña.
- **AC7.2.2** — Given la hoja de comentarios está abierta, When miro la lista, Then veo los comentarios existentes de esa opinión.
- **AC7.2.3** — Given una opinión sin comentarios, When abro su hoja, Then veo «Sé el primero en comentar».
- **AC7.2.4** — Given escribo en «Escribe un comentario…» y lo envío, When vuelvo a la tarjeta, Then el contador de `💬` sube y mi comentario aparece en la hoja.
- **AC7.2.5** — Given falla el envío del comentario, When miro la hoja, Then veo un mensaje con «Reintentar» y conservo el texto escrito.
- **AC7.2.6** — Given no hay conexión a internet, When comento una opinión, Then el comentario se guarda en el dispositivo sin ninguna petición de red y se pierde al reiniciar la app.

### US7.3 — Seguir a un autor

**Como** Luis, el oyente que opina, **quiero** seguir a un autor que me interesa, **para** que su nombre quede en mi Perfil.

- **Prioridad**: Must Have
- **Depende de**: US2.1, US9.1
- **Traza**: FR7.4, FR9.1, FR7.6
- **INVEST**: independiente; valiosa (deja rastro de mis intereses); pequeña (un botón de dos estados); testeable (botón y contador son observables).

**Criterios de aceptación**

- **AC7.3.1** — Given una opinión de otro autor, When toco «Seguir autor», Then el botón pasa a «Siguiendo» y el contador de seguidos del Perfil sube en uno.
- **AC7.3.2** — Given sigo a un autor, When vuelvo a tocar «Siguiendo», Then el botón vuelve a «Seguir autor» y el contador baja en uno.
- **AC7.3.3** — Given la cuenta demo arranca, When abro Perfil, Then el contador de seguidos muestra 2.
- **AC7.3.4** — Given no hay conexión a internet, When sigo a un autor, Then el seguimiento se guarda en el dispositivo sin ninguna petición de red y se pierde al reiniciar la app.

---

## US8 — Actividad

### US8.1 — Ver mi actividad y abrir una opinión

**Como** Luis, el oyente que opina, **quiero** ver mi actividad agrupada por día y abrir la opinión de cada evento, **para** saber qué ha pasado con lo que publiqué.

- **Prioridad**: Must Have
- **Depende de**: US5.1, US7.1, US7.2
- **Traza**: FR8.1, FR8.2, FR8.3, FR8.4, FR11.6
- **INVEST**: independiente; valiosa (devuelve la respuesta social); pequeña (una lista agrupada); testeable (eventos, agrupación y navegación son observables).

**Criterios de aceptación**

- **AC8.1.1** — Given abro Actividad, When termina de cargar, Then veo una lista cronológica agrupada por día con publicaciones propias, me gusta recibidos y comentarios recibidos.
- **AC8.1.2** — Given la cuenta demo arranca, When abro Actividad, Then ya hay eventos de ejemplo: 3 publicaciones propias, 2 me gusta recibidos y 3 comentarios recibidos.
- **AC8.1.3** — Given publico una opinión nueva, When vuelvo a Actividad, Then aparece el evento de publicación correspondiente sin recargar la app.
- **AC8.1.4** — Given toco un evento, When se abre, Then veo la opinión correspondiente en su detalle.
- **AC8.1.5** — Given Actividad no tiene eventos, When termina de cargar, Then veo «Todavía no hay actividad» con una acción.
- **AC8.1.6** — Given falla la carga de Actividad, When termina, Then veo un mensaje con «Reintentar».
- **AC8.1.7** — Given abro Actividad, When la lista está cargando, Then veo esqueletos de evento agrupados por día ocupando el espacio de la lista, y no una pantalla en blanco.

---

## US9 — Perfil

### US9.1 — Ver mi identidad, contadores y opiniones

**Como** Luis, el oyente que opina, **quiero** ver mi identidad, cuántas opiniones tengo y cuántos autores sigo, y abrir mis opiniones, **para** tener mi propio rincón en la app.

- **Prioridad**: Must Have
- **Depende de**: US5.1
- **Traza**: FR9.1, FR9.4, FR9.6, FR9.5, FR9.2, FR11.1, FR11.6
- **INVEST**: independiente; valiosa (identidad y memoria de lo escrito); pequeña (una pantalla con lista); testeable (contadores, lista y navegación son observables).

**Criterios de aceptación**

- **AC9.1.1** — Given abro Perfil, When termina de cargar, Then veo el usuario demo, `@demo`, el número de opiniones propias y el número de autores seguidos.
- **AC9.1.2** — Given la cuenta demo arranca, When abro Perfil, Then veo 3 opiniones propias y 2 autores seguidos.
- **AC9.1.3** — Given estoy en Perfil, When miro la lista de opiniones propias, Then veo mis 3 opiniones de ejemplo.
- **AC9.1.4** — Given toco una opinión de Perfil, When se abre, Then veo su detalle con el texto completo y «Editar».
- **AC9.1.5** — Given no tengo opiniones propias, When abro Perfil, Then veo un estado vacío de opiniones con una acción para crear la primera.
- **AC9.1.6** — Given abro Perfil, When la pantalla está cargando, Then veo esqueletos de la identidad y de la lista de opiniones ocupando su espacio, y no una pantalla en blanco.
- **AC9.1.7** — Given falla la carga de Perfil, When termina, Then veo un mensaje en lenguaje llano con «Reintentar».
- **AC9.1.8** — Given estoy en Perfil, When miro la tarjeta de Spotify, Then muestra el estado de la conexión y la acción que toca: «Conectar con Spotify» si no hay sesión, o «Conectado» con «Desconectar» si la hay.

---

## US10 — Conectar Spotify

### US10.1 — Conectar Spotify y mantener la conexión

**Como** Luis, el oyente que opina, **quiero** conectar mi cuenta de Spotify una vez y que la app la recuerde, **para** ver portadas reales y buscar en el catálogo sin repetir la autorización.

- **Prioridad**: Must Have
- **Depende de**: US2.1
- **Traza**: FR10.1, FR10.2, FR10.3, FR10.4, FR10.6, FR10.8, FR9.2
- **INVEST**: independiente; valiosa (abre el catálogo real); pequeña (un flujo de autorización y su persistencia); testeable (estado, portadas y token guardado son observables).

**Criterios de aceptación**

- **AC10.1.1** — Given no tengo sesión de Spotify, When toco «Conectar con Spotify», Then la app abre la autorización de Spotify con PKCE y sin pedir permisos de usuario.
- **AC10.1.2** — Given autorizo en Spotify, When vuelvo a la app, Then la cabecera muestra «Conectado» y las portadas se resuelven.
- **AC10.1.3** — Given la conexión se completó, When cierro y vuelvo a abrir la app, Then sigo conectado sin volver a autorizar.
- **AC10.1.4** — Given conecté Spotify, When la app guarda el token, Then lo hace con `expo-secure-store` y ninguna lectura en texto plano lo devuelve; lo comprueba el doble de `expo-secure-store` en la prueba.
- **AC10.1.5** — Given `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` falta o no es válida, When toco «Conectar», Then veo «La conexión con Spotify no está configurada en esta instalación» con «Reintentar», y el resto de la app sigue funcionando.
- **AC10.1.6** — Given estoy en Perfil, When miro la tarjeta de Spotify, Then veo uno de sus cinco estados —conectado, desconectado, conexión en curso, error de conexión con «Reintentar» o token inválido con aviso— y la acción que corresponde a cada uno.

### US10.2 — Desconectar y recuperarme de un fallo

**Como** Luis, el oyente que opina, **quiero** desconectar Spotify y entender qué pasa cuando algo falla, **para** no quedarme con una sesión que no quiero o con una pantalla muda.

- **Prioridad**: Must Have
- **Depende de**: US10.1
- **Traza**: FR9.2, FR10.3, FR10.5, FR10.7, FR9.5
- **INVEST**: independiente; valiosa (control y transparencia); pequeña (una acción y tres fallos con mensaje); testeable (estado y mensajes son observables).

**Criterios de aceptación**

- **AC10.2.1** — Given tengo sesión de Spotify, When toco «Desconectar», Then el token se borra del almacenamiento seguro y la cabecera vuelve a «Conectar».
- **AC10.2.2** — Given desconecté, When cierro y vuelvo a abrir la app, Then sigo sin sesión de Spotify.
- **AC10.2.3** — Given el token caducó o no es válido, When la app lo detecta, Then vuelve a «Conectar» con un aviso en lenguaje llano.
- **AC10.2.4** — Given falla la autorización o el intercambio de código, When vuelvo a la app, Then veo un mensaje con «Reintentar» y sigo pudiendo usar el catálogo de ejemplo.
- **AC10.2.5** — Given estoy conectando, When miro Perfil, Then veo un indicador de que la conexión está en curso.

---

## US11 — Recorrido completo

### US11.1 — Recorrer las seis pantallas sin sesión de Spotify

**Como** Luis, el oyente que opina, **quiero** recorrer las seis pantallas sin conectar Spotify, **para** comprobar que la app sirve entera sin cuenta.

- **Prioridad**: Must Have
- **Depende de**: todas las historias de pantalla
- **Traza**: FR12.1, FR12.2, FR11.1, FR11.2, FR11.5, FR2.4
- **INVEST**: independiente como demostración; valiosa (es el criterio de terminado); estimable (un recorrido guionizado); testeable (se recorre en el teléfono).

**Criterios de aceptación**

- **AC11.1.1** — Given la app está abierta sin sesión de Spotify, When recorro Login, Inicio, Explorar, Crear, Actividad y Perfil, Then cada pantalla carga sin cierres inesperados ni pantallas en blanco.
- **AC11.1.2** — Given estoy en el recorrido, When publico una opinión desde el catálogo de ejemplo, Then la veo en Inicio, en Actividad y en Perfil.
- **AC11.1.3** — Given estoy en el recorrido, When abro cualquier pantalla, Then todo el texto visible está en español.
- **AC11.1.4** — Given una pantalla falla, When miro el error, Then está en lenguaje llano con «Reintentar» y el recorrido puede continuar.
- **AC11.1.5** — Given el sistema está en tema claro u oscuro, When recorro las seis pantallas, Then todas siguen el tema del sistema, sin perder legibilidad ni los bloques con inicial.

### US11.2 — Recorrer las seis pantallas con sesión de Spotify

**Como** Luis, el oyente que opina, **quiero** recorrer las seis pantallas con Spotify conectado, **para** comprobar que el catálogo real y las portadas funcionan de punta a punta.

- **Prioridad**: Must Have
- **Depende de**: US10.1, US11.1
- **Traza**: FR12.1, FR12.2, FR10.4
- **INVEST**: independiente como demostración; valiosa (prueba la integración real); estimable (un recorrido guionizado); testeable (se recorre en el teléfono).

**Criterios de aceptación**

- **AC11.2.1** — Given tengo sesión de Spotify y el prerrequisito RC-09/A6 resuelto, When recorro las seis pantallas, Then cada una carga sin cierres inesperados y las portadas son reales.
- **AC11.2.2** — Given estoy en el recorrido con sesión, When busco en Explorar y publico sobre una obra real, Then la opinión aparece en Inicio, Actividad y Perfil con su portada.
- **AC11.2.3** — Given el prerrequisito de Spotify no está resuelto, When intento el recorrido con sesión, Then la app me lo dice en lenguaje llano y el recorrido sin sesión sigue disponible.
