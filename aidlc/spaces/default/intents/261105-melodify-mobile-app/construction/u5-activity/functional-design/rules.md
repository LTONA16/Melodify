# Reglas de negocio — U5 `u5-activity`

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (U5), `inception/units-generation/unit-of-work-story-map.md` (US8.1), `inception/user-stories/stories.md` (AC8.1.1–AC8.1.7), `inception/requirements-analysis/requirements.md` (FR8.1–FR8.4, FR11.2, FR11.4, FR11.6, NFR1, NFR5), `inception/domain-design/components.md` (ActivityFeed, AppShell, DesignSystem), `inception/domain-design/decisions.md` (ADR-006, ADR-012), `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0), `inception/refined-mockups/mockups.md` (Pantalla 5 — Actividad, matriz de estados, navegación) e `inception/refined-mockups/interaction-spec.md` (§ ActivityRow, § DayHeader).
> Fecha: 2026-11-19. Etapa: Functional Design · Unidad: `u5-activity`.

El bloque `yaml` es la fuente de verdad; la tabla del final es la misma información puesta para leerla. Los grupos son: **BR21** lo que la actividad deriva, **BR22** cómo se ordena y se agrupa, **BR23** los estados de la pantalla y el reintento, y **BR24** la pantalla, la navegación y la composición. La numeración continúa la de U4 (que cierra en BR20) para que la traza de la unidad no colisione con reglas ya publicadas.

```yaml
rules:
  - id: BR21.1
    statement: >
      Actividad solo muestra hechos que le ocurrieron a la cuenta: publicaciones
      propias, me gusta recibidos y comentarios recibidos. Lo que la persona hace sobre
      el contenido de otra persona no genera ningún evento.
    category: policy
    applies_to: "ActivityFeed (C8) y ActividadScreen"
    trigger: "Se abre Actividad o cambia el contenido."
    logic: >
      La lista se **deriva** del contenido en el momento de leerla; no hay registro de
      eventos que mantener y nada que se pueda desincronizar (ADR-006). Los tres
      orígenes son: las opiniones cuyo autor es la cuenta (`listOpinions({ viewerId })`),
      los me gusta que otras personas dieron a esas opiniones (`listLikes`) y los
      comentarios que otras personas escribieron en ellas (`listComments`). Un me gusta
      dado por la cuenta a una opinión ajena, un comentario propio en una opinión ajena,
      un seguimiento o una edición del texto no producen evento: la Actividad cuenta lo
      que le pasó a la cuenta, no lo que la cuenta hizo.
    violation: >
      Mezclar lo dado con lo recibido convierte la pantalla en un historial de la
      persona y contradice FR8.1 y ADR-006: la persona abriría Actividad para saber si
      alguien le respondió y encontraría sus propios toques.
    source: "FR8.1, AC8.1.1, ADR-006, unit-of-work.md § U5"

  - id: BR21.2
    statement: >
      Cada opinión propia produce exactamente un evento de publicación, con el título
      de la obra, la fecha en que se publicó y su identificador de opinión.
    category: calculation
    applies_to: "ActivityFeed (C8)"
    trigger: "Se deriva la actividad."
    logic: >
      Para cada `OpinionView` de `listOpinions({ viewerId })` cuyo `author.authorId` es
      la cuenta se emite
      `{ eventId: 'own:<opinionId>', kind: 'ownOpinion', opinionId, workTitle, createdAt: opinion.createdAt }`,
      sin `actorHandle` (no hay actor externo). El título viaja en `OpinionView.workTitle`,
      así que no se pide nada a C5 (C8 § `work_title`). La fecha es la de creación, no la
      de edición: una opinión editada no se convierte en una publicación nueva.
    violation: >
      Usar `updatedAt` reordenaría la lista cada vez que alguien corrige una coma y
      mostraría como «recién publicado» algo de hace días.
    source: "FR8.1, AC8.1.1, C8 § ActivityEventView, C8 § x-inputs (work_title)"

  - id: BR21.3
    statement: >
      Cada me gusta que otra persona dio a una opinión propia produce un evento de me
      gusta recibido, con el handle de quien lo dio y la fecha del me gusta; el me gusta
      de la propia cuenta sobre su propia opinión no produce evento.
    category: calculation
    applies_to: "ActivityFeed (C8)"
    trigger: "Se deriva la actividad y una opinión propia tiene `likeCount > 0`."
    logic: >
      Solo se leen las opiniones propias cuyo `likeCount` es mayor que cero —los
      contadores dicen si hay algo que leer, no cuántos eventos hay—. Para cada una se
      pide `listLikes({ opinionId })` y se emite un evento por cada `LikeView` cuyo
      `author.authorId` no es la cuenta:
      `{ eventId: 'like:<opinionId>:<authorId>', kind: 'likeReceived', opinionId, workTitle, createdAt: like.createdAt, actorHandle: like.author.handle }`.
      Un `LikeView` de la propia cuenta se descarta: no es un me gusta recibido.
    violation: >
      Leer solo los contadores deja los eventos sin autor ni fecha, y contar el me gusta
      propio hace que la persona se notifique a sí misma.
    source: "FR8.1, AC8.1.1, C4 § /opinions/{opinionId}/likes, C8 § x-inputs"

  - id: BR21.4
    statement: >
      Cada comentario que otra persona escribió en una opinión propia produce un evento
      de comentario recibido, con el handle de quien comentó y la fecha del comentario;
      un comentario de la propia cuenta no produce evento.
    category: calculation
    applies_to: "ActivityFeed (C8)"
    trigger: "Se deriva la actividad y una opinión propia tiene `commentCount > 0`."
    logic: >
      Solo se leen las opiniones propias con `commentCount` mayor que cero. Para cada una
      se pide `listComments({ opinionId })` y se emite un evento por cada `CommentView`
      cuyo `author.authorId` no es la cuenta:
      `{ eventId: 'comment:<commentId>', kind: 'commentReceived', opinionId, workTitle, createdAt: comment.createdAt, actorHandle: comment.author.handle }`.
      El texto del comentario no viaja al evento: la fila dice que comentaron, y el texto
      se lee en el detalle de la opinión.
    violation: >
      Incluir los comentarios propios convierte el hilo de la persona consigo misma en
      actividad recibida; llevar el texto a la fila duplicaría en la lista un contenido
      que ya vive en su detalle y que la fila no tiene espacio para mostrar.
    source: "FR8.1, AC8.1.1, C4 § /opinions/{opinionId}/comments, C8 § ActivityEventView"

  - id: BR21.5
    statement: >
      La siembra de C4 no se toca: las tres publicaciones, dos me gusta recibidos y tres
      comentarios recibidos de la cuenta demo ya están en el contenido de ejemplo, y la
      Actividad los deriva sin sembrar nada propio.
    category: constraint
    applies_to: "ActivityFeed (C8) y la siembra de C4"
    trigger: "La app arranca con la siembra de ejemplo."
    logic: >
      La siembra de U2 deja tres opiniones de `demo` (`op-001`, `op-004`, `op-008`), dos
      me gusta recibidos (`lucia` sobre `op-001`, `ana` sobre `op-004`) y tres comentarios
      recibidos (`ana` en `op-001`, `bruno` en `op-004`, `lucia` en `op-008`); los dos me
      gusta de otros autores sobre opiniones ajenas no generan actividad (BR21.1). La
      derivación produce por tanto ocho eventos sin que U5 escriba una línea de semilla.
      Si C4 cambia la siembra, la Actividad cambia con ella y ninguna prueba de U5 depende
      de un número que U5 haya fijado.
    violation: >
      Duplicar la semilla dentro de la Actividad crea dos fuentes de verdad del contenido
      de ejemplo y hace que un cambio en C4 deje la pantalla contando otra cosa.
    source: "FR8.2, AC8.1.2, FR3.7, C4 § x-construction (seed), u2-content-core § Semilla"

  - id: BR21.6
    statement: >
      La Actividad es de solo lectura: no escribe en el contenido, no guarda eventos, no
      pide red y no toca el catálogo.
    category: constraint
    applies_to: "ActivityFeed (C8) y ActividadScreen"
    trigger: "Cualquier lectura de la actividad."
    logic: >
      Las únicas operaciones que usa son de C4 —`listOpinions`, `listLikes`,
      `listComments` y `subscribeContent`— y de C3 (`subscribeSession`,
      `getSession`). No llama a `createOpinion`, `toggleLike`, `addComment` ni
      `toggleFollow`; no importa `@melodify/catalog` ni `@melodify/spotify`; no hace
      ninguna petición HTTP. El paquete importa los tipos de C4 y C3 con `import type`,
      y las implementaciones llegan por constructor (C8 § `rule`), así que no crea arista
      de ejecución hacia ellos.
    violation: >
      Escribir desde una pantalla de lectura rompe el modelo de permisos descrito en
      `components.md` y hace que abrir Actividad pueda alterar el contenido sin que la
      persona lo pidiera.
    source: "FR8.1, C8 § x-inputs (rule), components.md § ActivityFeed, NFR3.11"

  - id: BR22.1
    statement: >
      Los eventos se ordenan de más reciente a más antiguo con un desempate estable:
      publicación antes que me gusta antes que comentario, y a igualdad de todo,
      identificador ascendente.
    category: calculation
    applies_to: "ActivityFeed (C8)"
    trigger: "Se deriva la actividad."
    logic: >
      El criterio primario es `createdAt` descendente. A igual `createdAt` —la siembra usa
      desfases distintos, pero dos escrituras pueden caer en el mismo instante— se ordena
      por clase con la prioridad `ownOpinion` (0), `likeReceived` (1),
      `commentReceived` (2). Si aún empatan, `eventId` ascendente por comparación de
      cadenas. El resultado es determinista: la misma semilla y el mismo reloj pintan
      siempre la misma lista, y una prueba puede afirmar el orden exacto.
    violation: >
      Un orden que dependa del orden de inserción de un `Map` o de la lectura de las
      opiniones hace que la lista cambie entre ejecuciones y que dos eventos del mismo
      minuto aparezcan y desaparezcan de sitio al republicar.
    source: "FR8.1, AC8.1.1, components.md § ActivityFeed (orden cronológico)"

  - id: BR22.2
    statement: >
      Los eventos se agrupan por día de calendario en UTC con la etiqueta «Hoy», «Ayer» o
      la fecha del día («4 nov 2026»), y cada grupo conserva el orden de BR22.1.
    category: calculation
    applies_to: "ActivityFeed (C8) y DayHeader (C1)"
    trigger: "Se deriva la actividad y hay eventos."
    logic: >
      La clave del grupo es el día UTC de `createdAt` (`getUTCFullYear`,
      `getUTCMonth`, `getUTCDate`), el mismo criterio con el que
      `formatCalendarDate` de C1 pinta una fecha; así la etiqueta de un grupo y la fecha
      que se escribiría para cualquiera de sus filas nunca discrepan. El grupo del día
      actual lleva `day: 'today'` y la etiqueta «Hoy»; el del día anterior,
      `day: 'yesterday'` y «Ayer»; cualquier otro, `day: 'date'` y
      `formatCalendarDate(createdAt)`. Los grupos se emiten del más reciente al más
      antiguo y no se parten en columnas.
    violation: >
      Agrupar en hora local mientras la fecha se escribe en UTC produce grupos cuya
      etiqueta dice un día que no es el de sus filas; agrupar por «hace 24 h» mete en el
      mismo grupo dos días de calendario distintos.
    source: "FR8.1, AC8.1.1, mockups.md § Pantalla 5 (encabezado de día), C1 § formatCalendarDate"

  - id: BR22.3
    statement: >
      Cada evento lleva un identificador estable y único que no depende de su posición en
      la lista, y se usa como clave de la lista.
    category: constraint
    applies_to: "ActivityFeed (C8) y ActividadView"
    trigger: "Se deriva la actividad o se pinta la lista."
    logic: >
      `own:<opinionId>`, `like:<opinionId>:<authorId>` y `comment:<commentId>`. Son
      únicos por construcción —una opinión, un me gusta por autor y opinión, un
      comentario— y no cambian entre derivaciones del mismo contenido, así que la lista
      no se reordena ni se remonta al recalcular (AC8.1.3). La clave de la lista es el
      `eventId`, nunca el índice.
    violation: >
      Una clave por índice hace que publicar una opinión nueva remonte todas las filas y
      pierda la posición de scroll, justo lo que la suscripción a C4 debe permitir sin
      coste.
    source: "AC8.1.3, C8 § ActivityEventView (eventId)"

  - id: BR22.4
    statement: >
      El encabezado de cada grupo se queda pegado arriba mientras dura su día y el
      siguiente lo empuja.
    category: policy
    applies_to: "ActividadView y DayHeader (C1)"
    trigger: "La persona desplaza la lista."
    logic: >
      La lista se pinta con `SectionList` y `stickySectionHeadersEnabled`; cada sección es
      un grupo de BR22.2 y su cabecera es un `DayHeader` con la etiqueta del grupo. No hay
      cabecera duplicada al final de un grupo ni hueco entre grupos: el encabezado
      siguiente sustituye al anterior.
    violation: >
      Sin encabezado pegajoso, en una lista de varios días la persona deja de saber en qué
      día está; con dos mecanismos de cabecera a la vez, la lista muestra el día dos veces.
    source: "mockups.md § Pantalla 5 (stickyHeaderIndices), interaction-spec.md § DayHeader"

  - id: BR23.1
    statement: >
      Mientras la Actividad no tiene una lista que enseñar se ve la carga: dos grupos de
      esqueleto con su encabezado, ocupando el espacio de la lista. Nunca una pantalla en
      blanco.
    category: policy
    applies_to: "ActividadView y el estado `loading` de C8"
    trigger: "Se abre Actividad y todavía no hay derivación."
    logic: >
      El estado inicial es `loading` y dura mientras se resuelve la identidad de la sesión
      y se deriva la primera lista. Se pintan dos grupos de esqueleto: un bloque de
      encabezado (`Skeleton` forma `header`, alto 32) y tres bloques de fila por grupo
      (`Skeleton` forma `card`). Los encabezados son esqueletos y no «Hoy»/«Ayer» porque el
      día todavía no se conoce. La forma `card` (96) es algo más alta que una fila de
      actividad: se acepta porque `Skeleton` no publica una altura de fila de actividad y
      añadir una forma a C1 por esto sería una pieza nueva para un solo uso; la
      consecuencia es que la lista real puede ser algo más corta que su esqueleto, nunca
      más larga. No hay temporizador ni espera artificial: si la identidad ya está
      resuelta, la carga dura el fotograma del montaje.
    violation: >
      Una pantalla en blanco hace pensar que la app se colgó; pintar días inventados
      afirma un dato que aún no existe y luego se corrige a la vista de la persona.
    source: "FR8.4, AC8.1.7, mockups.md § Pantalla 5 (estado Carga)"

  - id: BR23.2
    statement: >
      Con eventos, la pantalla muestra la lista agrupada; sin ningún evento recibido
      muestra «Todavía no hay actividad.» con la acción «Crear opinión», que abre Crear.
    category: policy
    applies_to: "ActividadView, EmptyState (C1) y GlobalServices.goToTab (C2)"
    trigger: "Termina la derivación."
    logic: >
      IF hay al menos un evento THEN el estado es `ready` y se pintan los grupos de BR22.2.
      IF no hay ninguno THEN el estado es `empty` y se pinta `EmptyState` con el título
      «Todavía no hay actividad.» y la acción «Crear opinión», que llama a
      `goToTab({ name: 'crear' })`. La cabecera y la pestaña siguen visibles: el vacío es
      una variante de la pantalla, no otra pantalla. Un `ready` con cero grupos se trata
      igual que `empty`, para que una derivación incompleta no deje un hueco.
    violation: >
      Un vacío sin acción deja a la persona mirando una pantalla que no le ofrece nada que
      hacer, y es justo el momento en que la app puede pedirle que publique.
    source: "FR8.4, FR11.6, AC8.1.5, mockups.md § Pantalla 5 (estado Vacío)"

  - id: BR23.3
    statement: >
      Si la derivación no puede completarse, la pantalla muestra «No pudimos cargar tu
      actividad.» con «Reintentar»; reintentar vuelve a derivar desde la carga y nunca
      deja un mensaje técnico ni un fallo en silencio.
    category: policy
    applies_to: "ActivityFeed (C8), ActividadView y ErrorState (C1)"
    trigger: "Una lectura de C4 devuelve fallo, la suscripción no se establece o la derivación lanza."
    logic: >
      Cualquier `ContentResult` con `ok: false`, una excepción de la derivación o un fallo
      al suscribirse llevan el estado a `error` (ADR-012). La vista pinta `ErrorState` con
      el mensaje «No pudimos cargar tu actividad.» y la etiqueta «Reintentar»;
      `retryActivity()` vuelve a `loading` y repite la derivación sobre la misma
      instancia. El fallo se registra con el logger del proyecto y un código propio, sin
      el texto de la excepción en pantalla ni en inglés. Si el reintento vuelve a fallar,
      se queda en `error` con la misma acción.
      La ruta es defensiva —el contenido vive en memoria— pero es real: se recorre con un
      doble de C4 que falla.
    violation: >
      Un error sin acción deja la pantalla muerta; uno con el mensaje de la excepción
      muestra a la persona un texto que no puede usar y que el contrato prohíbe.
    source: "FR8.4, FR11.2, AC8.1.6, ADR-012, C8 § Fallos (C8 actividad)"

  - id: BR23.4
    statement: >
      Sin conexión, la Actividad conserva lo que ya derivó y avisa en la cabecera; la red
      no es un requisito para leerla y su ausencia no se convierte en un error.
    category: policy
    applies_to: "ActividadView, OfflineBanner y Connectivity (C6)"
    trigger: "La red pasa a desconectada con la pantalla abierta."
    logic: >
      Se pinta el aviso de sin conexión de la app bajo la cabecera con su texto —«Sin
      conexión. Estás viendo lo último que cargamos.»— y su «Reintentar», que vuelve a
      derivar. La lista sigue visible: todo lo que la Actividad lee está en memoria, así
      que la falta de red no impide derivar ni cambia el estado a `error`. Al volver la
      red, el aviso desaparece y nada más cambia.
    violation: >
      Sustituir la lista por un error de red cuando la pantalla no usa la red borra un
      contenido que sí se puede leer y le echa la culpa a un fallo que no existe.
    source: "FR11.4, mockups.md § Matriz de estados (Actividad)"

  - id: BR23.5
    statement: >
      La lista se recalcula tras cada escritura del contenido: publicar una opinión
      añade su evento sin recargar la app.
    category: policy
    applies_to: "ActivityFeed (C8) y ActividadView"
    trigger: "C4 emite un cambio de contenido."
    logic: >
      Al montar, `ActivityFeed` se suscribe a `subscribeContent({ viewerId })`, que emite
      el contenido vigente nada más suscribirse y el contenido completo tras cada
      escritura. Cada emisión vuelve a derivar y emite la nueva `ActivityView` por
      `subscribeActivity`, así que la pantalla repinta con los `eventId` de BR22.3 y
      conserva la posición. Publicar desde Crear y volver a Actividad muestra el evento
      nuevo sin reiniciar la app; también aparecen los me gusta y comentarios que se
      escriban mientras la pantalla está montada.
    violation: >
      Derivar solo al montar deja la pantalla con la foto del momento en que se abrió y
      obliga a cambiar de pestaña para ver lo que la persona acaba de publicar, que es
      exactamente lo que AC8.1.3 prohíbe.
    source: "FR8.2, AC8.1.3, C8 § x-inputs (recalculation), C4 § /changes"

  - id: BR24.1
    statement: >
      Tocar una fila abre el detalle de la opinión a la que se refiere, dentro de la
      pestaña Actividad, y volver devuelve a la lista en su posición.
    category: policy
    applies_to: "ActivityRow (C1), ActividadScreen y GlobalServices.openOpinionDetail (C2)"
    trigger: "La persona toca una fila de evento."
    logic: >
      La fila llama a `openOpinionDetail({ opinionId })` con el `opinionId` del evento; la
      cáscara apila el detalle de opinión de U2 sobre la pestaña Actividad, que por eso
      declara `details: [{ kind: 'opinion', component: DetalleOpinionRoute }]` en su
      `ScreenModule`. Actividad no conoce el componente del detalle ni le pasa datos: la
      ruta la fija C2. Volver desapila y la lista reaparece con su contenido y su
      posición, porque la pestaña no se desmonta.
    violation: >
      Navegar por identificador de obra a una pantalla nueva rompe la pestaña y pierde la
      posición de la lista; pasar el evento al detalle acopla dos unidades por un dato que
      el detalle ya sabe leer.
    source: "FR8.3, AC8.1.4, C2 § GlobalServices.openOpinionDetail, C2 § DetailScreen"

  - id: BR24.2
    statement: >
      Cada fila se lee como un hecho en pasado con el título de la obra entre comillas, el
      tiempo transcurrido y el chevron, con el icono de su clase; es una sola fila por
      evento, no una tarjeta.
    category: policy
    applies_to: "ActivityRow (C1) y ActividadView"
    trigger: "Se pinta una fila."
    logic: >
      Los tres textos, literales: `ownOpinion` → «Publicaste tu opinión de «{título}»» con
      `★`; `likeReceived` → «A alguien le gustó tu opinión de «{título}»» con `♡`;
      `commentReceived` → «Comentaron tu opinión de «{título}»» con `💬`. La pista
      secundaria es `formatRelativeTime(createdAt)` («hace 1 h», «hace 2 d»). El icono es
      decorativo: el texto ya dice qué pasó, así que el icono no lleva etiqueta de
      accesibilidad y la fila entera se anuncia con su texto. El chevron indica que la
      fila abre algo. `actorHandle` no se pinta (ver Interpretations de `memory.md`).
    violation: >
      Un texto por clase inventado en la pantalla hace que la prueba y el mockup hablen
      idiomas distintos; describir el evento con el texto del comentario convierte la fila
      en una tarjeta de opinión que la lista no puede pagar.
    source: "FR8.1, AC8.1.1, interaction-spec.md § ActivityRow, mockups.md § Pantalla 5"

  - id: BR24.3
    statement: >
      Hay una sola instancia de `ActivityFeed` en la app, la construye el punto de
      composición y la pantalla la recibe por sus dependencias; la pantalla se parte en
      contenedor y vista pura.
    category: constraint
    applies_to: "ActivityFeed (C8), app/src/bootstrap/instances.ts y ActividadScreen"
    trigger: "La app arranca o se monta Actividad."
    logic: >
      `app/src/bootstrap/instances.ts` construye
      `activityFeed = createActivity({ content: contentStore, session: appSession })` una
      sola vez, junto a las demás fuentes externas. `ActividadScreen` la recibe por
      `ScreenDependencies.activity` y se apoya en `useActividad(activity)`, que traduce
      `subscribeActivity` al estado de la vista y expone `retry`; `ActividadView` recibe
      `status`, `groups`, `online`, `onRetry` y `onOpenOpinion` y no pregunta nada a C8
      ni a C3. Una instancia por pantalla daría dos derivaciones de la misma sesión y una
      suscripción de más a C4.
    violation: >
      Construir la actividad dentro de la pantalla duplica la suscripción al contenido y
      hace que dos montajes del mismo tab deriven por separado; una vista que lee C8
      directamente no se puede recorrer en pruebas sin una sesión ni un almacén.
    source: "C8 § x-inputs (constructor), NFR1.8, TS-18, app/src/screens/dependencies.ts"

  - id: BR24.4
    statement: >
      U5 publica la 1.5.0 de `@melodify/design-system` con `ActivityRow` y `DayHeader`;
      ninguna pantalla reimplementa la fila ni el encabezado.
    category: constraint
    applies_to: "DesignSystem (C1) y ActividadView"
    trigger: "Se construye la pantalla de Actividad."
    logic: >
      Las dos piezas se añaden a C1 con las props ya declaradas —
      `ActivityRow { event: ActivityEventSummary, onPress: () => void }` y
      `DayHeader { label: string }`—, usan solo tokens del tema activo, y son un cambio
      aditivo: la 1.5.0 suma exportaciones y no toca props existentes. `ActivityRow` pinta
      el texto y el icono de BR24.2 y calcula el tiempo relativo con
      `formatRelativeTime`; `DayHeader` pinta la etiqueta de BR22.2 con
      `type.label` y `color.textSecondary`. La pantalla mapea la vista de C8
      (`ActivityEventView`) a `ActivityEventSummary` con una función explícita de
      presentación, como fija C1.
    violation: >
      Reimplementar la fila en la pantalla deja dos versiones de la altura, el icono y el
      tiempo relativo que se desincronizan; cambiar props de una pieza existente
      obligaría a subir la versión mayor y a tocar a todos sus consumidores.
    source: "C1 § Enmienda de la revisión 9 (1.5.0), C1 § view-models, interaction-spec.md § ActivityRow/DayHeader"
```

## Resumen de reglas

| Regla | Categoría | Qué fija | Fuente |
|---|---|---|---|
| **BR21.1** | policy | Solo eventos recibidos: publicación propia, me gusta y comentario recibidos. | FR8.1, ADR-006 |
| **BR21.2** | calculation | Una publicación por opinión propia, con fecha de creación. | FR8.1, AC8.1.1 |
| **BR21.3** | calculation | Un me gusta recibido por me gusta ajeno, con su autor y su fecha. | FR8.1, C4 § likes |
| **BR21.4** | calculation | Un comentario recibido por comentario ajeno, con su autor y su fecha. | FR8.1, C4 § comments |
| **BR21.5** | constraint | La siembra no se toca: 3/2/3 salen de C4. | AC8.1.2, FR8.2 |
| **BR21.6** | constraint | Solo lectura: no escribe, no guarda eventos, no pide red. | C8, NFR3.11 |
| **BR22.1** | calculation | Orden descendente con desempate por clase y por identificador. | FR8.1 |
| **BR22.2** | calculation | Grupos por día UTC: Hoy, Ayer, fecha. | FR8.1, mockups |
| **BR22.3** | constraint | `eventId` estable y único como clave de la lista. | AC8.1.3 |
| **BR22.4** | policy | Encabezado pegajoso por grupo. | mockups, interaction-spec |
| **BR23.1** | policy | Carga con dos grupos de esqueleto; nunca pantalla en blanco. | AC8.1.7, FR8.4 |
| **BR23.2** | policy | Vacío con «Todavía no hay actividad.» y «Crear opinión». | AC8.1.5, FR11.6 |
| **BR23.3** | policy | Error con «No pudimos cargar tu actividad.» y «Reintentar». | AC8.1.6, ADR-012 |
| **BR23.4** | policy | Sin red: aviso en la cabecera y lista conservada. | FR11.4 |
| **BR23.5** | policy | Recálculo tras cada escritura del contenido. | AC8.1.3, FR8.2 |
| **BR24.1** | policy | Tocar la fila abre el detalle de la opinión en la pestaña. | AC8.1.4, FR8.3 |
| **BR24.2** | policy | Textos literales por tipo, tiempo relativo y chevron. | interaction-spec |
| **BR24.3** | constraint | Instancia única en composición; contenedor y vista pura. | C8, TS-18 |
| **BR24.4** | constraint | C1 1.5.0 con `ActivityRow` y `DayHeader`; nada se reimplementa. | C1 § 1.5.0 |

## Sources

- `unit-of-work` — `inception/units-generation/unit-of-work.md` (U5).
- `unit-of-work-story-map` — `inception/units-generation/unit-of-work-story-map.md` (US8.1).
- `stories` — `inception/user-stories/stories.md` (US8.1, AC8.1.1–AC8.1.7).
- `requirements` — `inception/requirements-analysis/requirements.md` (FR8.1–FR8.4, FR11.2, FR11.4, FR11.6, NFR1, NFR5).
- `components` — `inception/domain-design/components.md` (ActivityFeed, AppShell, DesignSystem).
- `decisions` — `inception/domain-design/decisions.md` (ADR-006, ADR-012).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0).
- `mockups` — `inception/refined-mockups/mockups.md` (Pantalla 5 — Actividad, matriz de estados, navegación).
- `interaction-spec` — `inception/refined-mockups/interaction-spec.md` (§ ActivityRow, § DayHeader, § flujos).
