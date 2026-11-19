# Requisitos de rendimiento, usabilidad y fiabilidad — U5 `u5-activity`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR8.1–FR8.4, FR11.2, FR11.4, FR11.6, FR12.1), de `inception/units-generation/unit-of-work.md` (U5), de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0), de `construction/u5-activity/functional-design/functional-spec.md` (máquina de estados, F13–F18, § Textos exactos, § Assumptions), de `construction/u5-activity/functional-design/rules.md` (BR21.5, BR21.6, BR22.1–BR22.4, BR23.1–BR23.5, BR24.1, BR24.3) y de `construction/u5-activity/functional-design/frontend-components.md` (§ `app/src/screens/actividad/`, § `app/src/state/`, § Flujos de interacción).
> Fecha: 2026-11-19. Etapa: NFR Requirements · Unidad: `u5-activity` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite tres artefactos para esta unidad: este, `security-requirements.md` y `tech-stack-decisions.md`, más `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.16`). **La numeración continúa la de U1–U4**: U4 terminó en `NFR8.15`, `NFR2.12` y `NFR1.15`, así que esta unidad empieza en `NFR8.16`, `NFR2.13` y `NFR1.16`. Un identificador no se repite entre unidades.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tiene nada que absorber**: la app la usa una persona y no hay servidor (RC-02, RC-04).

**Qué cambia respecto a U4 en la naturaleza de la espera.** U4 introdujo la primera espera a un tercero. **U5 vuelve a un mundo sin espera ajena**: la Actividad no pide red, no toca Spotify y no lee el catálogo; todo lo que necesita está en memoria y se deriva en el acto. Lo que sí estrena es una lista que **se recalcula sola** tras cada escritura del contenido y que debe conservar su posición al hacerlo. El presupuesto de esta unidad no es de latencia: es de **ausencia de trabajo innecesario**.

## NFR8 — Rendimiento

NFR8 sigue diciendo: «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». U5 **no abre un percentil ni una mediana**. Lo que hace es acotar el coste de una pantalla que se deriva del contenido: cuántas lecturas hace, cuánto dura la carga visible y qué se evita al recalcular.

### NFR8.16 — La espera es de un fotograma: no hay red, ni temporizador, ni segunda derivación

- **La Actividad no tiene espera ajena.** La derivación recorre C4 en memoria y no sale del proceso (BR21.6). El estado `loading` dura lo que tarda la primera resolución de identidad de C3 y la primera emisión de `subscribeContent`, que son síncronas en el caso normal; no hay `setTimeout`, ni `debounce`, ni reintento automático, ni una petición HTTP (BR23.1).
- **No hay una segunda fuente de espera.** La pantalla no pide portadas —sus filas no llevan imagen— ni resuelve obras: el título viaja en `OpinionView.workTitle` (C8 § `work_title`). Por tanto la pantalla no hereda el presupuesto de NFR8.14 de U4 ni el de portadas de U3.
- **La carga visible es honesta y acotada**: dos grupos de esqueleto con su encabezado, sin temporizador de cortesía (BR23.1). Si la identidad ya está resuelta, el esqueleto se ve un fotograma; si C3 tarda, se ve hasta que emita. Nunca se alarga para «que se note».
- **Qué se mide**: que `ActividadView` en `loading` pinta exactamente dos encabezados de esqueleto y seis filas de esqueleto (3 por grupo), y que no existe ningún temporizador vivo al montar la pantalla con la sesión resuelta. No se fija un umbral en milisegundos.

**Cómo se verifica**: prueba de `ActividadView` por estado que cuenta los bloques de esqueleto; prueba de `useActividad` con temporizadores falsos que comprueba que no se programa ninguno; prueba de `ActivityFeed` que comprueba que no llama a `fetch` ni a C5 (no los tiene).

### NFR8.17 — El coste de derivar es proporcional a lo que la cuenta publicó, y no se paga al arrancar

- **Una lectura de opiniones, y una de me gusta y otra de comentarios solo por opinión propia con contador mayor que cero** (BR21.3, BR21.4). Con la siembra son **cuatro** lecturas: `listOpinions` más `listLikes` y `listComments` de las tres opiniones propias con interacción. No se leen las que están a cero y no se lee nada de C5.
- **`createActivity` no trabaja al construirse**: guarda sus dependencias y no se suscribe hasta que alguien pregunta (`getActivity`) o se suscribe (`subscribeActivity`). El arranque de la app no paga la derivación ni abre una suscripción a C4 que nadie escucha (TS-40).
- **La derivación es síncrona y de una sola pasada**: recorre las opiniones propias una vez, lee las dos listas por opinión con interacción, ordena con una comparación total (BR22.1) y agrupa en una pasada (BR22.2). No hay ordenaciones repetidas ni búsquedas lineales dentro de un bucle.
- **El recálculo no se amortigua ni se acumula**: cada emisión de C4 produce exactamente una derivación y una emisión por `subscribeActivity` (BR23.5). No se encola, no se descarta por «demasiado pronto» y no se ejecuta dos veces por una misma revisión.
- **Cómo se comprueba**: prueba de `ActivityFeed` con un doble de C4 que cuenta llamadas y comprueba una lectura de opiniones y una por lista de cada opinión con contador; prueba de `createActivity` que comprueba cero lecturas y cero suscripciones antes de la primera observación; prueba de recálculo que comprueba una derivación por emisión.

### NFR8.18 — Recalcular no remonta la lista ni pierde la posición

- **Cada evento conserva su `eventId` entre derivaciones** (`own:<opinionId>`, `like:<opinionId>:<authorId>`, `comment:<commentId>`), y la lista lo usa como clave (BR22.3). Publicar una opinión nueva añade una fila al principio del grupo de hoy sin volver a montar las demás ni perder el desplazamiento.
- **La lista es una `SectionList`**, no un `ScrollView` con todas las filas: solo pinta lo que cabe y conserva la posición al volver de un detalle, porque la pestaña no se desmonta (BR22.4, BR24.1, AC2.3.2 de U2).
- **El mapeo a presentación es lineal y estable**: `toActividadSections` recorre los grupos una vez y copia campos; no reordena, no reagrupa y no crea objetos nuevos para eventos que no cambiaron de forma significativa. La vista no vuelve a derivar.
- **No hay refresco en segundo plano**: la lista solo se recalcula cuando C4 emite; no hay sondeo, ni `setInterval`, ni un temporizador de «actualizar cada minuto».
- **Cómo se comprueba**: prueba de `ActivityFeed` que publica una opinión sobre un almacén real y comprueba que los `eventId` anteriores siguen presentes; prueba de `ActividadView` que comprueba que la clave de la lista es `eventId` y no el índice; prueba que comprueba que no hay temporizadores de refresco.

## NFR2 — Usabilidad

### NFR2.13 — La Actividad se abre en un toque y cada acción del recorrido está a dos o menos

| Acción | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Abrir Actividad | 1 toque en la barra | F13, paso 1 |
| Abrir la opinión de un evento | 1 toque en la fila | F15, paso 1 |
| Volver del detalle a la lista, con su posición | 1 toque en «‹ Volver» o atrás del sistema | F15, paso 4 |
| Crear una opinión desde el vacío | 1 toque en «Crear opinión» | F16, paso 3 |
| Reintentar una carga fallida | 1 toque en «Reintentar» | F17, paso 4 |
| Reintentar con el aviso de sin conexión | 1 toque en «Reintentar» | F18, paso 2 |

Ninguna acción del recorrido exige leer una explicación previa (NFR2). El desplazamiento por la lista no cuenta como acción: la persona ya está en la pantalla.

### NFR2.14 — Los cuatro estados se dicen con palabras y cada uno nombra su salida

- **Ningún estado se distingue solo por color ni por un icono.** La carga se representa con esqueletos; el vacío, con «Todavía no hay actividad.» y «Crear opinión»; el error, con «No pudimos cargar tu actividad.» y «Reintentar»; la lista, con sus encabezados de día y sus textos en pasado (BR23.1–BR23.3, BR24.2).
- **Cada estado que puede fallar ofrece una acción**: reintentar la derivación, reintentar el aviso de red o crear una opinión. El único estado sin acción es la lista, porque no hay nada que arreglar.
- **Los textos son los exactos de `functional-spec.md` § Textos exactos**, todos en español y ninguno con un código técnico ni una palabra en inglés (FR11.5, `project.md` § Mandated). Un fallo de C4 se lee como «No pudimos cargar tu actividad.», nunca como su `ContentErrorCode`.
- **El aviso de sin conexión no disfraza la pantalla de error**: es un banner sobre la lista, no un estado que la sustituya (BR23.4).
- **Cómo se comprueba**: prueba de `ActividadView` por estado que afirma el texto visible y la acción; prueba que comprueba que `online: false` mantiene las filas y añade el banner.

## NFR1 — Fiabilidad

### NFR1.16 — Ningún estado de la pantalla queda sin salida

- Los cuatro estados de C8 tienen salida (BR23.1–BR23.3): `loading → ready | empty | error`, `ready → ready | empty | error`, `empty → ready | error`, `error → loading` al reintentar. Un reintento que vuelve a fallar se queda en `error` con la misma acción, no en un estado mudo.
- **`error` siempre se puede repetir**: `retryActivity()` vuelve a `loading` y repite la derivación sobre la misma instancia; no hay que reiniciar la app ni cambiar de pestaña (F17).
- **Una sesión cerrada no es un error**: `signedOut` produce `empty` (la cuenta no tiene actividad), no `error`. La pantalla no inventa un fallo donde solo falta una cuenta.
- **Un cambio de cuenta vuelve a derivar**: `subscribeSession` mueve la identidad y la derivación se rehace con el nuevo `viewerId`; no se queda una lista de la cuenta anterior.
- **Cómo se comprueba**: prueba de `ActivityFeed` que recorre cada transición, incluida `error → error`; prueba con sesión `signedOut` que comprueba `empty`; prueba con dos identidades que comprueba que la segunda emisión no contiene eventos de la primera.

### NFR1.17 — Ningún fallo se escapa a la pantalla ni deja la lista vieja como si fuera nueva

- **`ActivityFeed` no lanza**: cualquier `ContentResult` con `ok: false`, una excepción en la derivación o un fallo al suscribirse terminan en `status: 'error'` (ADR-012, BR23.3). La pantalla no envuelve cada llamada en un `try`.
- **Una suscripción que no se establece no deja la vista congelada**: el estado pasa a `error`, y el reintento la vuelve a intentar. Si C4 emite después de un fallo, la vista se recupera con la nueva derivación.
- **Un fallo de un `listener` no tumba a los demás**: `subscribeActivity` notifica a cada suscriptor por separado y aísla el que lanza, con la misma regla que C4 y C6 (NFR1 de U2). No lo registra: C8 no recibe puerto de diagnóstico —su constructor sigue siendo `{ content, session }`— y una excepción de un `listener` es un defecto de quien se suscribe, no de la derivación.
- **Un evento no se inventa para tapar un fallo**: si la lectura de me gusta de una opinión falla, no se pinta la publicación y se omite el me gusta: se pinta `error`, porque una lista parcial se leería como una lista completa (ADR-012).
- **Cómo se comprueba**: prueba con un doble de C4 que devuelve `ok: false` en `listOpinions`, en `listLikes`, en `listComments` y en `subscribeContent`, y comprueba `error` en los cuatro casos; prueba de suscripción con un `listener` que lanza y un segundo que recibe la emisión.

### NFR1.18 — La Actividad funciona sin red, sin Spotify y con la siembra de ejemplo

- **Sin red**: la lista se deriva igual, el aviso aparece en la cabecera y las filas siguen visibles y tocables (BR23.4, F18). La red no es un requisito de esta pantalla.
- **Sin sesión de Spotify**: la Actividad no cambia, porque no usa Spotify (BR21.6). Su mitad del recorrido de U6 funciona con la conexión desconectada.
- **Con la siembra de C4**: la derivación produce los ocho eventos de BR21.5 (3 publicaciones, 2 me gusta y 3 comentarios recibidos) sin que U5 escriba semilla. La pantalla se ve llena en el primer arranque.
- **Sin contenido**: el vacío es un estado propio con su acción, no una pantalla en blanco ni un error (BR23.2).
- **Cómo se comprueba**: prueba con `online: false` que conserva las filas; prueba de montaje con la siembra real que obtiene los ocho eventos y los tres tipos; prueba con un almacén sin contenido que obtiene `empty`.

## Presupuesto de rendimiento en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Abrir Actividad | Sin espera ajena; la carga dura un fotograma cuando la sesión ya está resuelta | Prueba de `useActividad` con temporizadores falsos. |
| Derivar la siembra | **Cuatro** lecturas de C4 (opiniones + 2 listas de las 3 opiniones con interacción), una pasada de orden y una de agrupación | Prueba con un doble de C4 que cuenta llamadas. |
| Arranque de la app | **Cero** derivaciones y **cero** suscripciones hasta que Actividad se observa | Prueba de `createActivity` antes de `getActivity`. |
| Recalcular tras publicar | **Una** derivación y **una** emisión por cambio de C4; sin temporizador | Prueba de `ActivityFeed` con dos emisiones. |
| Volver del detalle | Sin recarga: la pestaña conserva lista y posición | Prueba de la cáscara con la pestaña montada. |
| Desplazar la lista | Sin número; sin congelación perceptible | Recorrido en el teléfono (U6). |

## Assumptions & Open Questions

- `[assumption]` La derivación es tan barata que no necesita caché propia: el contenido vive en memoria y una pasada por las opiniones propias es más simple que invalidar una caché que C4 ya invalida con su revisión. Si la cuenta creciera a cientos de opiniones, la decisión sería de esa etapa.
- `[assumption]` `createActivity` no se suscribe hasta que hay un observador. Es una decisión de rendimiento y también de corrección: una suscripción abierta al arrancar sin nadie escuchando retendría el almacén y derivaría en balde.
- `[assumption]` El esqueleto de fila usa `Skeleton shape="card"` (96) y es algo más alto que una fila real; la lista real puede ser más corta que su esqueleto, nunca más larga. Se acepta antes que añadir una forma a C1 por un solo uso (BR23.1).
- `[assumption]` La sesión de la app es la única que mira en esta versión, y su resolución es local; por eso el estado `loading` no tiene un tiempo límite. Si alguna vez la identidad viniera de la red, ese tiempo lo fijaría C3, no esta pantalla.
- **Open question para U6**: el recorrido en el teléfono es la única verificación de que la lista no se congela al desplazarse con la siembra; los estados vacío y error se demuestran con dobles en las pruebas (FR11.6, ADR-012).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR8.1–FR8.4, FR11.2, FR11.4, FR11.6, FR12.1).
- `unit-of-work` — `inception/units-generation/unit-of-work.md` (§ U5).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0).
- `functional-spec` — `construction/u5-activity/functional-design/functional-spec.md` (§ Máquina de estados, F13–F18, § Textos exactos, § Assumptions).
- `rules` — `construction/u5-activity/functional-design/rules.md` (BR21.5, BR21.6, BR22.1–BR22.4, BR23.1–BR23.5, BR24.1, BR24.3).
- `frontend-components` — `construction/u5-activity/functional-design/frontend-components.md` (§ `app/src/screens/actividad/`, § `app/src/state/`, § Flujos de interacción).
