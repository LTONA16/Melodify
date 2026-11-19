# Functional Design — Preguntas de `u5-activity`

> **Unidad**: `u5-activity` (Actividad) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U5), `unit-of-work-story-map.md` (US8.1), `stories.md` (AC8.1.1–AC8.1.7, con la nota de AC7.1.3), `requirements.md` (FR3.7, FR8.1–FR8.4, FR11.6, NFR1, NFR2, NFR8), `components.md` (`ActivityFeed`, `AppShell`, `ContentStore`, `AppSession`), `contract-summary.md` (C3, C4, C8), `decisions.md` (ADR-005, ADR-006, ADR-012), `mockups.md` (Pantalla 5 — Actividad y su matriz de estados), `interaction-spec.md` (`ActivityRow`, `DayHeader`, copy de referencia) y `design-system-mapping.md`.

Estas preguntas cierran lo que el diseño de U5 todavía no dice con precisión: cómo se cortan los días y cómo se rotulan, qué se pinta en cada fila, qué hace el estado vacío, si la pantalla muestra el aviso de sin conexión, cuántos esqueletos hay mientras carga y qué ocurre al reintentar tras un error. La estructura ya está decidida en inception —la actividad se deriva del contenido (ADR-005), solo con eventos recibidos (ADR-006) y con contrato de estados explícito (ADR-012)— y no se vuelve a preguntar.

## Q1. [Producto] ¿Cómo se corta el día y cómo se rotula?

El mockup fija tres rótulos —«Hoy», «Ayer», «6 nov 2026»— y `DayHeader` los pinta pegajosos mientras dura el grupo. Falta decidir dos cosas que cambian el resultado de la agrupación: con qué reloj se corta el día y qué rótulo lleva un evento de hace más de dos días.

- A. **Día natural del dispositivo y fecha larga en español** (Recommended): «Hoy» y «Ayer» comparan la fecha del calendario del teléfono (zona horaria local, no la UTC del `createdAt`); de anteayer en adelante se pinta el día y el mes con el año, como el mockup: «6 nov 2026». Un evento de esta mañana es «Hoy» aunque en UTC sea otro día, que es lo que espera quien mira el teléfono.
- B. **Día natural en UTC**: el corte no depende de dónde esté la persona y las pruebas son idénticas en cualquier máquina, pero un evento de las 23:30 en España aparece como del día siguiente, y eso se nota.
- C. **Ventanas móviles de 24 horas**: «Hoy» son las últimas 24 h y «Ayer» las 24 anteriores, sin fecha en ningún caso. Evita la zona horaria, pero «Ayer» deja de significar el día de ayer y la lista se reordena sola con el paso del tiempo.
- X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿Qué dice el texto de cada fila: «A alguien» o el nombre de quien interactuó?

`ActivityRow` fija tres textos exactos: «Publicaste tu opinión de «…»», «A alguien le gustó tu opinión de «…»» y «Comentaron tu opinión de «…»». El contrato C8, en cambio, lleva `actorHandle` en los eventos de me gusta y de comentario, y C4 entrega el autor de cada me gusta y de cada comentario. Hay que decidir si ese dato se pinta o no.

- A. **El texto del mockup, sin nombre** (Recommended): la fila dice exactamente lo que fija `interaction-spec.md`; `actorHandle` viaja en el evento y queda disponible, pero no se pinta. Es el copy ya aprobado, no promete nada que la pantalla no cumpla y evita decidir qué se hace cuando el mismo autor interactúa tres veces.
- B. **Pintar el nombre: «A @ana le gustó tu opinión de «…»» y «@ana comentó tu opinión de «…»»**: la fila da más información y aprovecha `actorHandle`. Se paga con copy nuevo que no está en los mockups, con el plural («Comentaron») que deja de tener sentido cuando hay un solo nombre y con una prueba más por variante.
- C. **Nombre cuando hay uno y «Alguien» cuando no**: mezcla las dos anteriores y obliga a decidir el caso de varios comentarios del mismo autor en la misma opinión.
- X. Other (please specify)

[Answer]: A

## Q3. [Producto] ¿Qué hace la acción del estado vacío?

`AC8.1.5` pide «Todavía no hay actividad» **con una acción**; el mockup la concreta en «Crear opinión». Falta decir qué hace esa acción, porque Actividad no escribe y la pantalla de Crear ya existe en la pestaña de al lado.

- A. **Lleva a la pestaña Crear** (Recommended): el botón cambia de pestaña, igual que el botón del estado vacío de Inicio; la persona publica y el evento aparece al volver, sin recargar (AC8.1.3). Cero estado nuevo.
- B. **Lleva a Explorar**: sirve para descubrir obras, pero el estado vacío de Actividad habla de publicar, no de buscar, y el botón prometería otra cosa.
- C. **No hace nada y es solo texto**: cumple la letra de AC8.1.5 sin construir una acción, a costa de una pantalla sin salida.
- X. Other (please specify)

[Answer]: A

## Q4. [Producto] ¿Actividad avisa cuando no hay conexión?

La matriz de estados del mockup incluye una fila «Sin conexión | Se conserva lo cargado y se avisa en la cabecera | «Sin conexión. Estás viendo lo último que cargamos.»», pero FR8.4 no la menciona y la actividad se calcula en memoria: no hay nada que pedir a la red. Inicio ya muestra ese banner (U2) con el mismo texto.

- A. **Sí, el mismo banner y el mismo texto que Inicio** (Recommended): la pantalla se comporta como las demás; el banner no oculta la lista y no añade estados al contrato de C8, que sigue siendo `loading`/`ready`/`empty`/`error`. Se paga con una prueba de la vista con red caída, que ya existe como patrón.
- B. **No: Actividad no depende de la red y no avisa**: menos ruido en una pantalla que funciona igual, a costa de que la matriz de estados del mockup quede con una fila sin implementar.
- C. **Sí, pero solo si la lista está vacía**: avisa justo cuando el silencio puede confundirse con un fallo; en cambio, deja sin aviso la lista ya cargada, que es el caso que el mockup describe.
- X. Other (please specify)

[Answer]: A

## Q5. [Producto] ¿Cómo son los esqueletos de carga?

`AC8.1.7` pide «esqueletos de evento agrupados por día ocupando el espacio de la lista» y el mockup dibuja «2 grupos de esqueleto con su encabezado de día», sin decir cuántas filas lleva cada grupo. El estado de carga dura lo que tarda la siembra del contenido, que es un instante.

- A. **Dos grupos con encabezado y tres filas cada uno** (Recommended): es la forma del mockup y la que hace que la pantalla no salte al llegar los datos; dos grupos × tres filas es el mínimo que se lee como «lista con días» sin inventar más contenido del que hay.
- B. **Un grupo con encabezado y tres filas**: más discreto y más rápido de pintar, pero deja de leerse como una lista agrupada por día.
- C. **Solo filas, sin encabezado**: ahorra el rótulo de día, a costa de contradecir el mockup y de que la lista cambie de forma al cargar.
- X. Other (please specify)

[Answer]: A

## Q6. [Producto] ¿Qué hace «Reintentar» cuando la derivación falla?

ADR-012 deja el error como ruta real: si la derivación no puede completarse o la siembra falla, se pinta «No pudimos cargar tu actividad.» con «Reintentar». Falta decidir qué se ve entre la pulsación y el resultado.

- A. **Vuelve a `loading` y deriva de nuevo** (Recommended): el botón pasa por el mismo camino que la primera carga, así que la persona ve que algo está pasando y el contrato no gana un quinto estado. Si vuelve a fallar, se pinta otra vez el bloque de error con el mismo texto.
- B. **Se queda en `error` mientras derivar y cambia a `ready` o `empty` al terminar**: evita el parpadeo, pero el botón no da señal de haber sido pulsado.
- C. **Deshabilita el botón sin cambiar de estado hasta el final**: parecido a B con un indicador en el propio botón, y añade un estado visual que ninguna otra pantalla tiene.
- X. Other (please specify)

[Answer]: A

## Q7. [Producto] ¿Cómo se ordenan los eventos del mismo día?

El orden es «de más reciente a más antiguo» (FR8.1, `then` de AC8.1.1). La siembra crea varios eventos con instantes distintos, pero una misma acción puede generar dos eventos en el mismo milisegundo —por ejemplo, dos me gusta de la misma opinión—, y eso deja el orden a merced del recorrido del almacén.

- A. **Más reciente primero y, a igual instante, por identificador de evento** (Recommended): el desempate es estable y reproducible, así que la lista no cambia de orden entre dos aperturas ni entre dos máquinas, y la prueba puede afirmar el orden exacto. Un evento con fecha futura (reloj del teléfono atrasado) se ordena arriba, en «Hoy».
- B. **Más reciente primero y, a igual instante, el orden en que el almacén los devuelve**: no hay criterio que explicar, pero el orden depende de la implementación y no se puede afirmar en una prueba sin fijarlo.
- C. **Más reciente primero y, a igual instante, publicaciones antes que reacciones**: agrupa por tipo dentro del segundo, lo que da una lista que no es estrictamente cronológica.
- X. Other (please specify)

[Answer]: A
