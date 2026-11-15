# Reglas de negocio — U3 `u3-create-react`

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (U3), `inception/units-generation/unit-of-work-story-map.md` (US5.1–US5.3, US6.1, US7.1–US7.3), `inception/user-stories/stories.md` (AC5.1.1–AC5.3.4, AC6.1.1–AC6.1.5, AC7.1.1–AC7.3.4), `inception/requirements-analysis/requirements.md` (FR5, FR6, FR7, FR11, A1, OQ1), `inception/domain-design/components.md` (ContentStore, Catalog, AppShell), `inception/contract-design/contract-summary.md` (C1, C2, C4, C5), `inception/refined-mockups/mockups.md` (Crear, hoja de comentarios, matriz de estados), `inception/refined-mockups/interaction-spec.md` y las respuestas de `functional-design-questions.md` (Q1 = B, Q2 = A, Q3 = A).
> Fecha: 2026-11-14. Etapa: Functional Design · Unidad: `u3-create-react`.

El bloque `yaml` es la fuente de verdad; la tabla del final es la misma información puesta para leerla. Los grupos son: **BR11** el formulario de Crear y la publicación, **BR12** la edición de la propia opinión, **BR13** la búsqueda de obra dentro de Crear, **BR14** las tres reacciones (me gusta, comentar, seguir) y **BR15** los avisos y los estados comunes. La numeración continúa la de U2 (que cierra en BR10) para que la traza de la unidad no colisione con reglas ya publicadas.

```yaml
rules:
  - id: BR11.1
    statement: >
      Crear es la pestaña `crear` y tiene dos modos —publicar y editar— que se
      gobiernan por la entrada de C2 (`CreateEntry`); cada apertura empieza con el
      formulario limpio.
    category: policy
    applies_to: "CrearScreen y CreateEntry (C2)"
    trigger: "Se entra en la pestaña Crear o se llama a openCreate/openEdit."
    logic: >
      IF `CreateEntry.mode` es `create` THEN el título es «Crear», el botón «Publicar»
      y la obra se elige en la pantalla. IF es `edit` THEN el título es «Editar
      opinión», el botón «Guardar», la obra llega fija y el texto y la valoración se
      cargan de la opinión. Cada apertura trae un `formKey` distinto: al cambiar,
      el contenedor descarta el borrador anterior, de modo que una visita nueva nunca
      arrastra lo escrito ni la obra de la anterior.
    violation: >
      Reutilizar el borrador hace que publicar desde el detalle muestre el texto de la
      visita anterior y que AC5.3.3 («vuelvo sin publicar») parezca no limpiar nada.
    source: "FR5.1, FR5.4, FR6.3; C2 § CreateEntry"

  - id: BR11.2
    statement: >
      «Publicar» se habilita solo con obra seleccionada, texto no vacío y valoración
      de 1 a 5; con uno de los tres ausente, está deshabilitado.
    category: validation
    applies_to: "CrearScreen (modo publicar)"
    trigger: "Cambia cualquiera de los tres campos del formulario."
    logic: >
      IF hay obra AND `text.trim().length > 0` AND `rating` es un entero de 1 a 5
      THEN el botón responde; ELSE se pinta deshabilitado y no ejecuta nada. El
      espacio en blanco no cuenta como texto.
    violation: >
      Habilitar sin valoración o con solo espacios permite que C4 responda `422` a una
      acción que la interfaz presentó como posible (FR5.2, A1, OQ1).
    source: "FR5.2, A1, OQ1, AC5.1.2, AC5.1.3"

  - id: BR11.3
    statement: >
      El texto de una opinión admite hasta 500 caracteres; el campo no deja escribir
      más y el contador aparece a partir de 400.
    category: validation
    applies_to: "MultilineField de Crear, CrearScreen y ContentStore (C4)"
    trigger: "La persona escribe en el campo de texto."
    logic: >
      IF el texto llega a 400 caracteres THEN se pinta «N/500» bajo el campo en
      `type.caption`; IF el texto llega a 500 THEN el campo no acepta más entrada.
      El valor que se guarda es el texto recortado en los extremos y nunca supera 500
      caracteres. C4 rechaza con `422` el texto de más de 500.
    violation: >
      Sin tope, el feed y el detalle aceptan textos que rompen la altura de la tarjeta;
      con un tope solo en la interfaz, una llamada directa a C4 guardaría lo que el
      formulario prohíbe (Q1 = B).
    source: "FR5.1, OQ1, A1; Q1 = B"

  - id: BR11.4
    statement: >
      La valoración es obligatoria, de 1 a 5, y se puede quitar con una acción de
      texto; volver a tocar la estrella elegida no la borra.
    category: validation
    applies_to: "RatingInput de Crear y ContentStore (C4)"
    trigger: "La persona toca una estrella o «Quitar valoración»."
    logic: >
      IF se toca la estrella n THEN el valor pasa a n, aunque ya fuera n. IF se toca
      «Quitar valoración» THEN el valor pasa a 0, el texto «Sin valorar» sustituye a
      «n de 5» y «Publicar» se deshabilita. Sin valoración no se envía: C4 solo acepta
      enteros de 1 a 5.
    violation: >
      Borrar al repetir el toque hace que una persona que duda pierda lo elegido; sin
      acción de quitar, volver a cero exigiría adivinar el gesto (mockups § Pantalla 4).
    source: "FR5.2, A1, AC5.1.2, AC5.1.3; Q1 = B"

  - id: BR11.5
    statement: >
      Publicar crea la opinión con `createOpinion`, vuelve a Inicio y deja la opinión
      arriba del feed con la confirmación «Opinión publicada».
    category: policy
    applies_to: "CrearScreen, ContentStore (createOpinion) y AppShell"
    trigger: "La persona toca «Publicar» con los tres campos completos."
    logic: >
      IF C4 responde `201` THEN llamar a `goToTab({ name: 'inicio' })`, mostrar el
      snackbar «Opinión publicada» y no tocar `CreateEntry` más que para limpiarlo. La
      opinión aparece la primera porque el feed de Inicio, que U2 ya ordena de la más
      reciente a la más antigua, la coloca arriba en cuanto la suscripción emite el
      cambio.
    violation: >
      Quedarse en Crear o no avisar deja a la persona sin saber si publicó; ir a Inicio
      sin la opinión arriba incumple AC5.1.4.
    source: "FR5.3, AC5.1.4"

  - id: BR11.6
    statement: >
      Si la obra elegida ya tiene una opinión propia, Crear lo avisa y ofrece «Editar
      mi opinión» en lugar de «Publicar»; no se crea una segunda opinión.
    category: validation
    applies_to: "CrearScreen, ContentStore (createOpinion) y AppShell"
    trigger: "Se elige una obra o se llega con una preseleccionada."
    logic: >
      IF `listOpinions({ workId, viewerId })` ya trae una opinión propia sobre esa obra
      THEN pintar «Ya opinaste sobre esta obra.» bajo la fila de obra, sustituir
      «Publicar» por «Editar mi opinión» y no enviar nada. «Editar mi opinión» llama a
      `openEdit({ opinionId })` conservando el `returnTo` de la entrada vigente y con un
      `formKey` nuevo, de modo que al guardar o cancelar se vuelve al origen del que se
      abrió Crear. IF C4 respondiera `409` por una carrera, tratarlo como este mismo
      estado y no como error genérico.
    violation: >
      Dejar publicar una segunda opinión rompe FR6.1 y duplica la tarjeta propia que el
      detalle de obra ya pinta.
    source: "FR6.1, FR6.2, AC5.1.6"

  - id: BR11.7
    statement: >
      Un fallo al publicar se muestra en lenguaje llano con «Reintentar» y conserva
      obra, texto y valoración.
    category: policy
    applies_to: "CrearScreen (modo publicar)"
    trigger: "`createOpinion` responde un código distinto de `201`."
    logic: >
      IF el código es `409` THEN aplicar BR11.6. ELSE pintar «No pudimos publicar tu
      opinión.» sobre el botón con «Reintentar», que repite el envío con los mismos
      tres valores; los campos no se limpian ni se deshabilitan de forma permanente.
    violation: >
      Limpiar el formulario ante un error obliga a reescribir la opinión y rompe
      AC5.3.4; mostrar el código `422` incumple FR11.2.
    source: "FR5.7, FR11.2, AC5.3.4"

  - id: BR11.8
    statement: >
      «Cancelar», y el atrás del sistema en la pestaña Crear, vuelven a la pantalla de
      origen sin escribir nada.
    category: policy
    applies_to: "CrearScreen y AppShell"
    trigger: "La persona toca «Cancelar» o el atrás del sistema mientras está en Crear."
    logic: >
      IF hay algo escrito o elegido THEN se descarta sin confirmación y sin escribir en
      C4. La vuelta usa `closeCreate()`: vuelve a `CreateEntry.returnTo` conservando su
      pila —el detalle desde el que se abrió sigue ahí— y deja la pestaña Crear con el
      formulario limpio. Sin `returnTo`, se queda en la pestaña Crear con el formulario
      vacío.
    violation: >
      Volver a la raíz de la pestaña de origen en lugar de al detalle incumple AC5.3.3 y
      AC6.1.3 y hace perder la posición y el estado del detalle.
    source: "FR5.4, FR6.3, AC5.3.3; C2 § closeCreate"

  - id: BR11.9
    statement: >
      Sin sesión de Spotify, el buscador se sustituye por una tarjeta de conexión y el
      selector del catálogo de ejemplo, y se puede publicar igual.
    category: policy
    applies_to: "CrearScreen"
    trigger: "La cáscara informa `spotify.status = 'disconnected'`."
    logic: >
      IF no hay sesión de Spotify THEN pintar `ConnectionCard` («Conecta Spotify para
      buscar en el catálogo completo.» + «Conectar con Spotify», sin efecto hasta U4) y
      las 8 obras de `listSampleWorks()` en `WorkResultRow`, con su recuento de
      opiniones. Elegir, escribir, valorar y publicar funcionan igual; la portada de la
      opinión es el bloque con la inicial, como en el resto de la app sin sesión.
    violation: >
      Exigir sesión para opinar deja la app inservible sin cuenta y rompe AC5.2.1,
      AC5.2.2 y el mandato de «recorrible sin sesión de Spotify».
    source: "FR5.6, FR11.4, AC5.2.1, AC5.2.2"

  - id: BR11.10
    statement: >
      Crear puede abrirse con la obra ya elegida; entonces el buscador aparece plegado
      y «Cambiar» lo despliega.
    category: policy
    applies_to: "CrearScreen (modo publicar)"
    trigger: "`CreateEntry.preselectedWorkId` no es nulo."
    logic: >
      IF hay obra preseleccionada THEN resolverla con `getWork` y pintar la fila de obra
      con el buscador plegado; IF la persona toca «Cambiar» THEN el buscador vuelve a
      mostrarse con su texto vacío y elegir otra obra sustituye la anterior. IF la obra
      no está en el catálogo THEN conservar el título que trajo la navegación y no
      bloquear el formulario.
    violation: >
      Un formulario que exige volver a buscar la obra desde el detalle rompe AC5.3.1 y
      AC5.3.2.
    source: "FR5.5, AC5.3.1, AC5.3.2"

  - id: BR11.11
    statement: >
      La publicación no depende de la conexión: se puede elegir una obra de ejemplo,
      escribir, valorar y publicar sin red.
    category: constraint
    applies_to: "CrearScreen y ContentStore"
    trigger: "La app está sin conexión y la persona publica."
    logic: >
      IF no hay red THEN el aviso «Sin conexión. Puedes opinar sobre las obras de
      ejemplo.» aparece bajo la cabecera y el resto del formulario funciona igual,
      porque C4 es local y no hace ninguna petición.
    violation: >
      Bloquear la publicación sin red contradice FR7.6, AC5.2.3 y el aviso de la matriz
      de estados.
    source: "FR7.6, FR11.4, AC5.2.3"

  - id: BR12.1
    statement: >
      «Editar» abre el mismo formulario en modo edición con el texto y la valoración
      cargados y la obra fija.
    category: policy
    applies_to: "DetalleObraScreen, DetalleOpinionScreen, PerfilScreen y CrearScreen"
    trigger: "La persona toca «Editar» en su propia opinión."
    logic: >
      IF la tarjeta es propia THEN «Editar» llama a `openEdit({ opinionId })`; el
      contenedor carga la opinión con `getOpinion({ opinionId, viewerId })` y rellena
      texto, valoración y obra. IF la lectura falla o la opinión no es propia o no
      existe THEN pintar «No pudimos cargar tu opinión.» con «Reintentar».
    violation: >
      Abrir el formulario vacío obliga a reescribir la opinión entera y rompe AC6.1.1.
    source: "FR6.3, AC6.1.1"

  - id: BR12.2
    statement: >
      En modo edición la obra no se puede cambiar: no hay buscador, ni selector, ni
      «Cambiar».
    category: constraint
    applies_to: "CrearScreen (modo edición)"
    trigger: "La entrada de Crear llega con `mode: 'edit'`."
    logic: >
      La fila de obra se pinta como texto con su portada y sin acción. No se ofrece
      ninguna forma de sustituirla.
    violation: >
      Cambiar la obra al editar convertiría la edición en una segunda publicación
      encubierta y rompería la regla de una sola opinión por persona y obra que U2 ya
      aplica.
    source: "FR6.3, AC6.1.2"

  - id: BR12.3
    statement: >
      «Guardar» con cambios actualiza esa misma opinión, sella la fecha de modificación
      y vuelve al detalle con «Opinión actualizada».
    category: policy
    applies_to: "CrearScreen (modo edición) y ContentStore (updateOpinion)"
    trigger: "La persona toca «Guardar» y algún campo cambió."
    logic: >
      IF el texto recortado o la valoración difieren de los cargados THEN llamar a
      `updateOpinion({ opinionId, authorId, viewerId, text, rating })`. IF responde
      `200` THEN llamar primero a `closeCreate()` —que devuelve al detalle de origen— y
      después mostrar el snackbar «Opinión actualizada», en ese orden para que el cambio
      de pestaña no borre el aviso; el detalle ya muestra la versión nueva y «Editada el
      …», que U2 pinta cuando `updatedAt` es posterior a `createdAt`.
    violation: >
      Crear una opinión nueva al guardar duplica el contenido; no volver al detalle
      incumple AC6.1.3 y AC6.1.4.
    source: "FR6.3, FR6.4, AC6.1.3, AC6.1.4"

  - id: BR12.4
    statement: >
      «Guardar» sin cambios no escribe, no marca la opinión como editada y no muestra
      confirmación.
    category: policy
    applies_to: "CrearScreen (modo edición)"
    trigger: "La persona toca «Guardar» sin haber cambiado texto ni valoración."
    logic: >
      IF el texto recortado y la valoración son iguales a los cargados THEN no llamar a
      C4, no mover `updatedAt`, no mostrar snackbar y llamar a `closeCreate()`. La
      comparación es sobre el texto recortado, no sobre el valor crudo del campo.
    violation: >
      Escribir sin cambios sella `updatedAt` y hace aparecer «Editada el …» en una
      opinión que nadie editó (AC6.1.5).
    source: "FR6.4, AC6.1.5"

  - id: BR12.5
    statement: >
      Un fallo al guardar se muestra con «No pudimos guardar los cambios.» y
      «Reintentar», conservando lo escrito.
    category: policy
    applies_to: "CrearScreen (modo edición)"
    trigger: "`updateOpinion` responde un código distinto de `200`."
    logic: >
      IF el código es `404` THEN el error es el de carga («No pudimos cargar tu
      opinión.»). ELSE pintar «No pudimos guardar los cambios.» con «Reintentar», que
      repite el envío con los mismos valores, sin limpiar los campos y sin salir de la
      pantalla. Editar la opinión de otra persona no llega aquí: la acción «Editar» solo
      se pinta con `isOwn`.
    violation: >
      Salir de la pantalla ante un error pierde la edición; mostrar el código incumple
      FR11.2.
    source: "FR11.2, mockups § Matriz de estados (Editar)"

  - id: BR12.6
    statement: >
      «Cancelar» en modo edición vuelve al detalle sin guardar y el detalle sigue
      mostrando la versión anterior.
    category: policy
    applies_to: "CrearScreen (modo edición) y AppShell"
    trigger: "La persona toca «Cancelar» o el atrás del sistema mientras edita."
    logic: >
      Se llama a `closeCreate()` sin escribir en C4; el detalle de origen aparece con
      los valores que tenía porque su lectura se rehace al volver a estar visible.
    violation: >
      Guardar al cancelar contradice FR6.2 y AC5.3.3.
    source: "FR6.2, AC5.3.3; interaction-spec § Editar una opinión"

  - id: BR12.7
    statement: >
      Las reglas del texto y de la valoración son las mismas al publicar y al editar.
    category: constraint
    applies_to: "CrearScreen en los dos modos y ContentStore (createOpinion, updateOpinion)"
    trigger: "Se envía cualquiera de los dos formularios."
    logic: >
      Las dos operaciones comparten la validación de BR11.2, BR11.3 y BR11.4: texto no
      vacío de hasta 500 caracteres y valoración entera de 1 a 5. C4 rechaza con `422`
      lo que incumpla cualquiera de las dos.
    violation: >
      Dos validaciones distintas dejan editar opiniones que no se podrían publicar y
      hacen que la misma pantalla acepte cosas distintas según el modo.
    source: "FR5.2, FR6.3, OQ1, A1; Q1 = B"

  - id: BR13.1
    statement: >
      La búsqueda de obra dentro de Crear espera 2 caracteres y 400 ms desde la última
      pulsación, y no repite una consulta que ya esté en caché.
    category: policy
    applies_to: "CrearScreen (modo publicar) y Catalog (searchWorks)"
    trigger: "La persona escribe en el buscador con sesión de Spotify."
    logic: >
      IF el texto normalizado (sin espacios en los extremos) tiene menos de 2 caracteres
      THEN no se pide nada y se muestra «Escribe al menos 2 caracteres.». IF tiene 2 o
      más THEN se cancela el temporizador anterior, se esperan 400 ms y se hace una
      sola petición; una consulta repetida la resuelve la caché de C5 sin indicador.
    violation: >
      Buscar en cada pulsación multiplica las peticiones a Spotify y la lista parpadea.
    source: "FR5.1, FR5.7, AC5.1.5; interaction-spec § Buscar en Spotify"

  - id: BR13.2
    statement: >
      La búsqueda cubre sus estados: ayuda por consulta corta, esqueletos mientras
      busca, resultados, sin resultados y error con «Reintentar».
    category: policy
    applies_to: "CrearScreen"
    trigger: "Cambia el estado de la búsqueda."
    logic: >
      Consulta corta: «Escribe al menos 2 caracteres.»; en curso: 3 `Skeleton` de fila;
      resultados: hasta 5 `WorkResultRow` visibles con scroll interno; sin resultados:
      «No encontramos esa obra. Prueba con otro nombre.»; error: «No pudimos buscar en
      Spotify.» con «Reintentar», que repite la última consulta escrita y conserva el
      texto del campo. Los resultados `offline` y `error` de `searchWorks` se pintan los
      dos como error con «Reintentar»: un fallo de red no puede parecer una lista vacía.
    violation: >
      Una búsqueda sin estado de error deja la pantalla en blanco sin acción posible y
      rompe FR5.7 y AC5.1.5.
    source: "FR5.7, FR11.2, AC5.1.5"

  - id: BR13.3
    statement: >
      Elegir una obra la deja seleccionada, pliega el buscador y muestra la fila de
      obra con «Cambiar».
    category: policy
    applies_to: "CrearScreen (modo publicar)"
    trigger: "La persona toca una fila de resultado o de la lista de ejemplo."
    logic: >
      IF se elige una obra THEN guardar `workId`, título y artista, limpiar el texto del
      buscador, cerrar la lista de resultados y pintar la fila con la portada de 48, el
      título, el artista y «Cambiar». IF la obra ya tiene opinión propia THEN aplicar
      BR11.6.
    violation: >
      Sin plegado, el formulario no deja ver el texto y la valoración, y AC5.1.1 no se
      cumple.
    source: "FR5.1, FR5.5, AC5.1.1, AC5.3.2"

  - id: BR13.4
    statement: >
      Cambiar el texto cancela la petición pendiente y descarta respuestas tardías; la
      ✕ limpia el campo y vuelve al estado inicial.
    category: policy
    applies_to: "CrearScreen"
    trigger: "La persona sigue escribiendo o toca la ✕ del buscador."
    logic: >
      IF llega una respuesta para una consulta que ya no es la vigente THEN se descarta
      y no se pinta. IF se toca la ✕ THEN el campo queda vacío, desaparecen resultados,
      esqueletos y errores, y no se lanza ninguna petición.
    violation: >
      Una respuesta lenta pisa los resultados de lo último escrito y la búsqueda muestra
      obras que no corresponden al texto.
    source: "interaction-spec § SearchField y § Buscar en Spotify"

  - id: BR13.5
    statement: >
      Sin puerto de búsqueda no se pinta el buscador: en su lugar van la tarjeta de
      conexión y el selector de ejemplo.
    category: policy
    applies_to: "CrearScreen y Catalog (C5)"
    trigger: "No hay sesión de Spotify (U3; en U4 la sesión lo habilita)."
    logic: >
      IF `spotify.status` no es `connected` THEN no se monta el buscador ni se llama a
      `searchWorks`; se pinta BR11.9. Cuando U4 conecte la sesión y el puerto, el mismo
      componente pasa a buscar sin cambiar la pantalla.
    violation: >
      Pintar un buscador que responde `offline` ofrece una acción que no puede funcionar
      y contradice el estado «Sin Spotify» de la matriz de estados.
    source: "FR5.6, AC5.2.1; C5 § searchWorks sin puerto"

  - id: BR14.1
    statement: >
      El me gusta alterna con `toggleLike` y el contador y el glifo salen de la vista
      que emite C4; si la escritura falla, no cambia nada y se avisa.
    category: policy
    applies_to: "Inicio, Detalle de obra, Detalle de opinión y ContentStore (toggleLike)"
    trigger: "La persona toca el corazón de una tarjeta ajena."
    logic: >
      IF la tarjeta no es propia THEN llamar a `toggleLike({ opinionId, authorId:
      viewerId })`; el resultado `200` trae `likedByMe` y `likeCount`, C4 emite y la
      tarjeta se repinta (♡ → ♥ con el contador ±1). IF la escritura no es `ok` THEN no
      se modifica el estado y se muestra el snackbar «No pudimos guardar tu me gusta».
    violation: >
      Pintar el cambio antes de que C4 lo acepte deja un contador que no corresponde al
      contenido y que se corrige solo al cerrar la app.
    source: "FR7.1, AC7.1.1, AC7.1.2, AC7.1.4"

  - id: BR14.2
    statement: >
      En la opinión propia no se puede dar me gusta ni seguir al autor: el corazón se
      pinta como contador no pulsable y el botón de seguir no aparece.
    category: constraint
    applies_to: "OpinionCard, SocialActionBar y las cuatro pantallas"
    trigger: "La tarjeta se pinta con `isOwn` verdadero."
    logic: >
      IF `isOwn` THEN `SocialActionBar` recibe `showLike={false}`: el glifo y el número
      se pintan como texto, sin `Pressable` ni `accessibilityRole`; `OpinionCard` no
      pinta «Seguir autor» y no cablea `onLike` ni `onFollow`. El comentario sigue
      disponible.
    violation: >
      Permitir el me gusta propio mete en Actividad un «me gusta recibido» que la
      persona se dio a sí misma (FR8.1) y contradice el trato que ya recibe «Seguir
      autor» (Q3 = A).
    source: "AC7.1.3, FR7.4, AC8.1.2; Q3 = A"

  - id: BR14.3
    statement: >
      «Comentar» abre la hoja de comentarios de esa opinión sobre la pantalla actual,
      sin cambiar de pestaña ni desmontar lo de debajo.
    category: policy
    applies_to: "Las cuatro pantallas y ShellServices.comments (C2)"
    trigger: "La persona toca «💬» en cualquier tarjeta."
    logic: >
      La pantalla llama a `comments.open(opinionId)`; la cáscara monta la hoja como
      modal sobre la pestaña activa con el estado del controlador. La pestaña, el
      desplazamiento y el estado de la pantalla de debajo no cambian.
    violation: >
      Navegar a otra pantalla para comentar rompe FR7.2 y AC7.2.1 y pierde el contexto
      de la opinión.
    source: "FR7.2, AC7.2.1; C2 § invariante de la hoja"

  - id: BR14.4
    statement: >
      La hoja lista los comentarios de la opinión con autor, tiempo relativo y texto,
      del más antiguo al más reciente, y su estado vacío dice «Sé el primero en
      comentar».
    category: policy
    applies_to: "CommentSheet y createCommentsController"
    trigger: "La hoja se abre sobre una opinión."
    logic: >
      Al abrir se leen con `listComments({ opinionId })`, se mapean a `CommentModel` y
      se muestran en orden de creación ascendente. Sin comentarios, el cuerpo de la hoja
      es «Sé el primero en comentar». Si la lectura falla, la hoja muestra su error con
      «Reintentar».
    violation: >
      Una lista vacía sin texto parece un fallo de carga; el orden inverso hace que la
      conversación se lea al revés.
    source: "FR7.3, FR7.5, AC7.2.2, AC7.2.3"

  - id: BR14.5
    statement: >
      Un comentario no puede estar vacío ni pasar de 300 caracteres; el botón de enviar
      se deshabilita con el campo vacío y el contador aparece desde 250.
    category: validation
    applies_to: "CommentSheet, createCommentsController y ContentStore (addComment)"
    trigger: "La persona escribe en el campo de la hoja."
    logic: >
      IF `text.trim().length === 0` THEN el botón de enviar no responde. El campo no
      acepta más de 300 caracteres y pinta «N/300» desde 250. C4 rechaza con `422` el
      comentario vacío o de más de 300.
    violation: >
      Sin tope, un comentario ocupa la hoja entera; con un tope solo en la interfaz, una
      llamada directa guardaría lo prohibido (Q2 = A).
    source: "FR7.3, OQ1; Q2 = A"

  - id: BR14.6
    statement: >
      Enviar un comentario lo añade al final de la lista, sube el contador de la
      tarjeta y muestra «Comentario publicado».
    category: policy
    applies_to: "CommentSheet, createCommentsController y ContentStore (addComment)"
    trigger: "La persona envía un comentario con texto."
    logic: >
      IF `addComment` responde `201` THEN la hoja añade el comentario al final, limpia
      el campo, la tarjeta de la opinión sube su contador porque C4 emitió el cambio, y
      la cáscara muestra «Comentario publicado» **dentro de la propia hoja** —el aviso se
      monta en el modal mientras la hoja está abierta, porque fuera quedaría detrás del
      velo—. La hoja sigue abierta. El controlador devuelve si la escritura salió bien y
      es la cáscara quien pide `showSnackbar` con ese resultado.
    violation: >
      Cerrar la hoja al enviar impide ver el comentario publicado y rompe AC7.2.4.
    source: "FR7.3, AC7.2.4"

  - id: BR14.7
    statement: >
      Si el envío de un comentario falla, la hoja lo dice con «Reintentar» y conserva el
      texto; el contador de la tarjeta no cambia.
    category: policy
    applies_to: "CommentSheet y createCommentsController"
    trigger: "`addComment` responde un código distinto de `201`."
    logic: >
      Pintar «No pudimos enviar tu comentario.» sobre el campo con «Reintentar», que
      reenvía el texto que sigue escrito llamando otra vez a `submit(text)`. El
      «Reintentar» de la lectura (`retry()`) solo aparece cuando el estado de la lista es
      `error` y relee los comentarios; son dos acciones distintas. El comentario no
      aparece en la lista y el contador no sube.
    violation: >
      Perder el texto obliga a reescribirlo y rompe AC7.2.5; subir el contador sin
      comentario deja un número que no se puede explicar.
    source: "FR7.5, FR11.2, AC7.2.5"

  - id: BR14.8
    statement: >
      «Seguir autor» alterna con `toggleFollow` entre «Seguir autor» y «Siguiendo» y
      confirma con «Ahora sigues a @handle» o «Ya no sigues a @handle».
    category: policy
    applies_to: "OpinionCard, las cuatro pantallas y ContentStore (toggleFollow)"
    trigger: "La persona toca «Seguir autor» o «Siguiendo» en una opinión ajena."
    logic: >
      IF la tarjeta no es propia THEN llamar a `toggleFollow({ authorId, followerId:
      viewerId })`; la respuesta trae `followedByMe` y `viewerFollowingCount`, C4 emite
      y el botón cambia de etiqueta y el contador de Perfil cambia con él. El snackbar
      usa el handle del autor. IF la escritura no es `ok` THEN no cambia nada y se
      avisa con «No pudimos guardar tu seguimiento».
    violation: >
      Un botón que no alterna deja a la persona sin saber si sigue al autor y rompe
      AC7.3.1 y AC7.3.2.
    source: "FR7.4, AC7.3.1, AC7.3.2"

  - id: BR14.9
    statement: >
      Ninguna reacción social sale del dispositivo ni genera un evento de actividad.
    category: constraint
    applies_to: "toggleLike, toggleFollow, addComment y Actividad (U5)"
    trigger: "Se da me gusta, se comenta o se sigue."
    logic: >
      Las tres escrituras van a C4, que vive en memoria y no hace peticiones. Dar me
      gusta a la opinión de otra persona no genera ningún evento de Actividad (ADR-006);
      los que U5 deriva son solo publicaciones propias, me gusta recibidos y comentarios
      recibidos.
    violation: >
      Un evento de «me gusta dado» contradice FR8.1 y AC7.1.3, y una petición de red
      contradice FR7.6.
    source: "FR7.6, AC7.1.3, AC7.3.4, ADR-006"

  - id: BR14.10
    statement: >
      Comentar y seguir funcionan sin conexión y se pierden al cerrar la app.
    category: constraint
    applies_to: "CommentSheet, createCommentsController y toggleFollow"
    trigger: "La app está sin conexión y la persona comenta o sigue."
    logic: >
      IF no hay red THEN ambas acciones se guardan en C4 igual que con red, sin ninguna
      petición; la interfaz no promete que sobrevivan al cierre. Ningún texto de la
      pantalla sugiere que se hayan enviado a un servidor.
    violation: >
      Deshabilitar comentar sin red contradice AC7.2.6 y AC7.3.4.
    source: "AC7.2.6, AC7.3.4, FR7.6"

  - id: BR15.1
    statement: >
      El snackbar se pinta una sola vez en la cáscara, dura 4 segundos y desaparece al
      cambiar de pestaña.
    category: policy
    applies_to: "AppShell y Snackbar (C1)"
    trigger: "Una pantalla llama a `showSnackbar`."
    logic: >
      IF hay mensaje THEN la cáscara pinta `Snackbar` sobre la barra inferior; el
      componente se oculta solo a los 4 s y avisa con `onDismiss` para limpiar el
      mensaje. Cualquier cambio de pestaña limpia el mensaje pendiente. No hay acción ni
      «Deshacer».
    violation: >
      Un aviso por pantalla se duplica al cambiar de pestaña; uno que no caduca tapa la
      barra para siempre.
    source: "mockups § Snackbar; interaction-spec § Snackbar; C2 § invariante del snackbar"

  - id: BR15.2
    statement: >
      Las confirmaciones usan estos textos exactos: «Opinión publicada», «Opinión
      actualizada», «Comentario publicado», «Ahora sigues a @…» y «Ya no sigues a @…».
    category: policy
    applies_to: "CrearScreen, tarjetas y AppShell"
    trigger: "Se completa una escritura."
    logic: >
      Publicar → «Opinión publicada»; guardar con cambios → «Opinión actualizada»;
      comentar → «Comentario publicado»; seguir → «Ahora sigues a @handle»; dejar de
      seguir → «Ya no sigues a @handle». Guardar sin cambios no muestra ninguno
      (BR12.4). El handle se escribe con su arroba y sin traducir.
    violation: >
      Textos distintos para la misma acción hacen que las pruebas y la persona no
      reconozcan la confirmación.
    source: "interaction-spec § Copy de referencia"

  - id: BR15.3
    statement: >
      Todo error de Crear, de Editar y de la hoja se muestra en español, en lenguaje
      llano y con una acción; nunca un código técnico.
    category: constraint
    applies_to: "CrearScreen, CommentSheet y las cuatro pantallas"
    trigger: "Una lectura o escritura falla."
    logic: >
      Cada error tiene su texto de § Textos exactos de `functional-spec.md` y, cuando
      hay algo que repetir, «Reintentar»: también el error de carga de la opinión que se
      edita. Los fallos de me gusta y de seguimiento son la única excepción y llevan su
      desviación registrada: el snackbar no admite acciones y el propio control que falló
      sigue en pantalla y se puede volver a tocar.
    violation: >
      Mostrar `422` o un mensaje en inglés incumple FR11.2 y FR11.5.
    source: "FR11.2, FR11.5, NFR2"

  - id: BR15.4
    statement: >
      El aviso de sin conexión de Crear y de Editar es el de la matriz de estados.
    category: policy
    applies_to: "CrearScreen"
    trigger: "La red se pierde mientras se publica o se edita."
    logic: >
      En Crear, el aviso es «Sin conexión. Puedes opinar sobre las obras de ejemplo.» y
      se pinta **sin acción**, porque no hay nada que reintentar: el catálogo de ejemplo
      es local y el formulario funciona; desaparece cuando la red vuelve. En Editar, el
      aviso único de U2 («Sin conexión. Estás viendo lo último que cargamos.»), que
      conserva su «Reintentar» de portadas. En los dos casos se pinta bajo la cabecera de
      la pantalla, no en la cáscara, y no bloquea el formulario.
    violation: >
      Un aviso de la cáscara quedaría por encima de la cabecera de Crear y taparía el
      botón «Cancelar».
    source: "FR11.4, mockups § Matriz de estados; functional-spec.md § Precisión a C2 (U2)"
```

## Resumen de reglas

| Regla | Categoría | Enunciado corto | Origen |
|---|---|---|---|
| **BR11.1** | policy | Crear es la pestaña `crear` con dos modos y formulario limpio en cada apertura. | FR5.1, FR6.3 |
| **BR11.2** | validation | «Publicar» exige obra, texto no vacío y valoración 1–5. | FR5.2, AC5.1.2, AC5.1.3 |
| **BR11.3** | validation | Texto de hasta 500 caracteres; contador desde 400. | OQ1, A1; Q1 = B |
| **BR11.4** | validation | Valoración obligatoria 1–5, con «Quitar valoración». | FR5.2, A1; Q1 = B |
| **BR11.5** | policy | Publicar crea, vuelve a Inicio y confirma «Opinión publicada». | FR5.3, AC5.1.4 |
| **BR11.6** | validation | Obra ya opinada: aviso y «Editar mi opinión», sin segunda opinión. | FR6.1, AC5.1.6 |
| **BR11.7** | policy | Error al publicar: texto llano + «Reintentar», conservando todo. | FR5.7, AC5.3.4 |
| **BR11.8** | policy | «Cancelar» y atrás vuelven al origen sin escribir y conservan su pila. | FR5.4, AC5.3.3 |
| **BR11.9** | policy | Sin Spotify: tarjeta de conexión + selector de ejemplo, y se publica. | FR5.6, AC5.2.1, AC5.2.2 |
| **BR11.10** | policy | Obra preseleccionada con buscador plegado y «Cambiar». | FR5.5, AC5.3.1, AC5.3.2 |
| **BR11.11** | constraint | Se publica sin conexión. | FR7.6, AC5.2.3 |
| **BR12.1** | policy | «Editar» carga texto y valoración de la opinión propia. | FR6.3, AC6.1.1 |
| **BR12.2** | constraint | En edición la obra queda fija. | FR6.3, AC6.1.2 |
| **BR12.3** | policy | Guardar con cambios actualiza la misma opinión y sella `updatedAt`. | FR6.3, AC6.1.3, AC6.1.4 |
| **BR12.4** | policy | Guardar sin cambios no escribe ni confirma. | AC6.1.5 |
| **BR12.5** | policy | Error al guardar: «No pudimos guardar los cambios.» + «Reintentar». | FR11.2 |
| **BR12.6** | policy | «Cancelar» en edición vuelve al detalle sin guardar. | FR6.2, AC5.3.3 |
| **BR12.7** | constraint | Publicar y editar comparten las reglas de texto y valoración. | FR5.2, FR6.3 |
| **BR13.1** | policy | Búsqueda desde 2 caracteres y 400 ms, sin repetir caché. | FR5.1, AC5.1.5 |
| **BR13.2** | policy | Estados de búsqueda: ayuda, esqueletos, resultados, vacío y error. | FR5.7, AC5.1.5 |
| **BR13.3** | policy | Elegir obra la selecciona y pliega el buscador. | FR5.1, AC5.1.1 |
| **BR13.4** | policy | Se cancela lo pendiente y se descartan respuestas tardías. | interaction-spec |
| **BR13.5** | policy | Sin puerto de búsqueda no se pinta el buscador. | FR5.6, AC5.2.1 |
| **BR14.1** | policy | Me gusta alterna con C4; si falla, nada cambia y se avisa. | FR7.1, AC7.1.1, AC7.1.2 |
| **BR14.2** | constraint | En la opinión propia no hay me gusta ni seguir; el contador queda como texto. | Q3 = A, AC7.1.3 |
| **BR14.3** | policy | «Comentar» abre la hoja sobre la pantalla actual. | FR7.2, AC7.2.1 |
| **BR14.4** | policy | La hoja lista los comentarios y su vacío es «Sé el primero en comentar». | FR7.3, AC7.2.2, AC7.2.3 |
| **BR14.5** | validation | Comentario no vacío de hasta 300 caracteres; contador desde 250. | Q2 = A |
| **BR14.6** | policy | Enviar añade al final, sube el contador y confirma. | FR7.3, AC7.2.4 |
| **BR14.7** | policy | Error al comentar: «No pudimos enviar tu comentario.» + «Reintentar». | AC7.2.5 |
| **BR14.8** | policy | Seguir alterna «Seguir autor»/«Siguiendo» con confirmación. | FR7.4, AC7.3.1, AC7.3.2 |
| **BR14.9** | constraint | Ninguna reacción sale del dispositivo ni genera actividad. | FR7.6, AC7.1.3, ADR-006 |
| **BR14.10** | constraint | Comentar y seguir funcionan sin red y se pierden al cerrar. | AC7.2.6, AC7.3.4 |
| **BR15.1** | policy | Un solo snackbar en la cáscara, 4 s, se limpia al cambiar de pestaña. | mockups § Snackbar |
| **BR15.2** | policy | Textos exactos de las cinco confirmaciones. | interaction-spec § Copy |
| **BR15.3** | constraint | Todo error en español, llano y con acción; la reacción es la excepción registrada. | FR11.2, FR11.5 |
| **BR15.4** | policy | Aviso de sin conexión propio de Crear y Editar, bajo su cabecera. | FR11.4 |

## Assumptions & Open Questions

- `[assumption]` El formulario y la hoja no tienen estado «enviando» visible: C4 es síncrono y local, así que la escritura termina en el mismo gesto. El indicador de las piezas existe para el caso de U4 (Spotify), no para estas pantallas.
- `[assumption]` El seguimiento y el me gusta no se pintan en la opinión propia (Q3 = A), lo que se aparta de `interaction-spec.md` § SocialActionBar en el me gusta —allí se pintaba en todas las tarjetas—; la divergencia se registra en `functional-spec.md` § Assumptions.
- `[assumption]` Los topes de 500 y 300 caracteres se cumplen en dos sitios —el campo y C4— porque una prueba puede llamar a C4 sin pasar por la pantalla.
- **Ninguna pregunta abierta bloquea la construcción.**
