# Requisitos de rendimiento, usabilidad y fiabilidad — U3 `u3-create-react`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR11, RC-02, RC-03), de `inception/units-generation/unit-of-work.md` (U3), de `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C3, C4 1.2.0, C5 y § Revisión 15), de `construction/u3-create-react/functional-design/functional-spec.md` (máquina de estados del formulario, hoja de comentarios, F13–F20, § Textos exactos), de `construction/u3-create-react/functional-design/rules.md` (BR11.3, BR11.5, BR11.7, BR11.11, BR12.3, BR12.5, BR13.1, BR13.2, BR13.4, BR14.5–BR14.9, BR15.1–BR15.3) y de `construction/u3-create-react/functional-design/frontend-components.md` (§ Capa de estado, § Flujos de interacción).
> Fecha: 2026-11-15. Etapa: NFR Requirements · Unidad: `u3-create-react` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite tres artefactos para esta unidad: este, `security-requirements.md` y `tech-stack-decisions.md`, más `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.8`). El identificador es estable y **la numeración continúa la de U1 y U2**: U2 terminó en `NFR8.7` y `NFR2.6`, así que esta unidad empieza en `NFR8.8` y `NFR2.7`. Un identificador no se repite entre unidades.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tiene nada que absorber**: `requirements.md` no fija ningún objetivo de escalabilidad y esta unidad tampoco los introduce —el contenido vive en memoria, no hay servidor y la app la usa una persona (RC-02, RC-03)—.

**Qué cambia respecto a U2 en la naturaleza de los datos.** U2 pintaba lo que el almacén ya tenía. U3 **escribe**: introduce un borrador que la persona teclea, cuatro operaciones que mutan C4 y la primera pieza que se abre por encima de la pantalla (la hoja modal). Los requisitos de abajo no suben ningún número aprobado; fijan las condiciones que hacen que esa escritura no introduzca una espera, no pierda lo escrito y no deje la pantalla en un estado sin salida.

## NFR8 — Rendimiento

NFR8 sigue diciendo: «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». U3 **no abre ninguna excepción**: todas sus escrituras son locales y síncronas, y su única espera —la búsqueda en Spotify— no es alcanzable en el teléfono hasta U4 y ya está acotada por un temporizador. Lo que sí fija esta unidad son las condiciones que evitan que aparezcan esperas artificiales.

### NFR8.8 — Escribir no espera: ninguna acción muestra un estado «enviando»

- `createOpinion`, `updateOpinion`, `addComment`, `toggleLike` y `toggleFollow` son llamadas **síncronas** a C4, que trabaja en memoria (RC-03). La operación termina en el mismo gesto que la inicia, así que no se pinta un estado «enviando», «publicando» ni «guardando», ni un esqueleto sobre el botón (BR11.5, `functional-spec.md` § Assumptions).
- El botón se deshabilita **por formulario incompleto**, no por una escritura en curso: `ConObra` sin obra, sin texto o con valoración 0 deja «Publicar» deshabilitado (BR11.2, BR11.4), y ese es el único motivo por el que el botón no responde.
- La hoja de comentarios no tiene estado «enviando»: al tocar «Enviar», el comentario ya está en la lista cuando la promesa —resuelta en el mismo tick— continúa (BR14.5, BR14.6).
- La confirmación llega **después** de la navegación, no antes: al publicar, la cáscara cambia a Inicio y solo entonces pinta el snackbar; al guardar, cierra Crear y solo entonces lo pinta (BR11.5, BR12.3). Invertir el orden borraría el aviso (BR15.1).

**Cómo se verifica**: pruebas de `CrearScreen` y `CommentSheet` que comprueban que, tras tocar el botón, el estado es el de éxito y **no existe** un estado intermedio que se pueda observar; ninguna prueba necesita `jest.useFakeTimers` para ver el resultado de una escritura. Revisión del código: ninguna de las cinco acciones devuelve una promesa que la pantalla espere.

### NFR8.9 — La búsqueda hace una petición por pausa, no por pulsación

- El hook `useWorkSearch` no llama a `catalog.searchWorks` hasta que la consulta tiene **2 caracteres o más** y han pasado **400 ms** desde la última pulsación; cada pulsación nueva cancela el temporizador anterior (BR13.1).
- Una respuesta que llega tarde para una consulta ya superada **se descarta**: el hook compara la consulta con la vigente antes de pintar (BR13.4). El resultado no puede «saltar» de una búsqueda a otra.
- La misma consulta repetida la resuelve la caché de C5 y no produce una petición nueva ni un indicador de carga (BR13.1 último inciso).
- Con el puerto en `null` el buscador ni se monta y `searchWorks` no se llama (BR13.5), así que en el teléfono no se ve un error de búsqueda hasta que U4 conecte la sesión. El hook, por su parte, **sí** sabe responder a un puerto ausente o a un `offline` si se le monta con uno: devuelve ese estado en vez de una lista vacía, y esa es una prueba de unidad del hook, no el estado que se pinta en el dispositivo en esta unidad (BR13.2).
- El temporizador **se limpia al desmontar** el hook: cambiar de pestaña con una consulta en vuelo no deja un `setTimeout` vivo.

**Cómo se verifica**: prueba de `useWorkSearch` con temporizadores falsos que escribe «a», «ab», «abc» y comprueba **una sola** llamada a `searchWorks` tras avanzar 400 ms; prueba de respuesta tardía que resuelve primero la consulta vieja y comprueba que no se pinta; prueba con puerto `null` que comprueba `error` y no `empty`.

### NFR8.10 — Un solo snackbar, cuatro segundos, sin bloquear nada

- La cáscara mantiene **un mensaje pendiente como máximo**: un `showSnackbar` nuevo sustituye al anterior en vez de encolarse (BR15.1).
- El aviso se retira a los **4 s** o al tocarlo, y su temporizador no impide ninguna acción: el botón de debajo sigue siendo pulsable mientras el snackbar está visible.
- Cualquier cambio de pestaña **limpia** el mensaje pendiente (BR15.1), y por eso las confirmaciones se piden después de navegar (NFR8.8).
- Con la hoja de comentarios abierta, el aviso se pinta **dentro del modal** y no detrás del velo (BR14.6, C2 1.3.0).

**Cómo se verifica**: prueba de la cáscara que pide dos mensajes seguidos y comprueba que solo hay uno visible; prueba con temporizadores falsos que avanza 4 s y comprueba que desaparece; prueba de la hoja que comprueba que «Comentario publicado» se lee dentro del modal.

### NFR8.11 — El resto del recorrido sigue sin número

Abrir Crear, escribir 500 caracteres, tocar estrellas, repetir el gesto, abrir la hoja y desplazarla se juzgan con NFR8 tal como está aprobado: **no se percibe una congelación** al recorrerlo en el teléfono. No se fija mediana, ni percentil, ni umbral en milisegundos, y ninguna prueba automática falla por tiempo.

## NFR2 — Usabilidad

### NFR2.7 — Las acciones de esta unidad, en dos toques o menos

| Acción | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Abrir Crear | 1 toque en la barra | F13, paso 1 |
| Elegir una obra de ejemplo | 1 toque en la fila | F13, paso 4 |
| Publicar | 1 toque en «Publicar», con el formulario completo | F13, paso 7 |
| Editar mi propia opinión | 2 toques: «Editar» y «Guardar» | F17 |
| Publicar desde el detalle con la obra puesta | 2 toques: «Opinar sobre esta obra» y «Publicar» | F15 |
| Cancelar y volver al detalle | 1 toque en «Cancelar» (o atrás del sistema) | F15, paso 5 |
| Comentar | 2 toques: «💬» y «Enviar» | F18 |
| Dar o quitar me gusta | 1 toque | F19 |
| Seguir o dejar de seguir | 1 toque | F20 |
| Reintentar una publicación o un guardado fallido | 1 toque en «Reintentar» | F13, F17 |

Ninguna acción del recorrido exige leer una explicación previa (NFR2).

### NFR2.8 — Todo error visible dice qué pasó y ofrece acción

Con la misma regla que NFR2.5 de U2, aplicada a los estados que introduce U3:

- **Se muestra con «Reintentar»** → error al publicar, al guardar, al cargar la edición, al buscar, al cargar los comentarios y al enviar un comentario (BR11.7, BR12.5, BR13.2, BR14.7, BR14.9).
- **Desviación registrada, sin acción** → los fallos de me gusta y de seguimiento: se avisan con un snackbar que no admite botones y **el propio control sigue en pantalla** y se puede volver a tocar (BR14.1, BR14.8, BR15.3). Es la única excepción a FR11.2 y está declarada en `functional-spec.md` § Assumptions.
- **No se muestra** → un fallo interno se registra en el logger y no se inventa un aviso (NFR9.6, en `security-requirements.md`).
- **Sin conexión no es un error**: en Crear es un aviso informativo sin acción, porque el catálogo de ejemplo es local y el formulario funciona (BR11.11); en Editar es el aviso único de U2 con su «Reintentar» de portadas (BR15.4).

### NFR2.9 — El estado se dice con palabras, no con un icono mudo

- El botón de seguir dice **«Seguir autor»** o **«Siguiendo»** según `followedByMe`; no es un icono que cambia de color (BR14.10).
- La valoración dice **«Sin valorar»** o **«n de 5»** debajo de las estrellas, y la acción de quitar es un texto, «Quitar valoración» (BR11.4).
- «Ya opinaste sobre esta obra.» es una frase, no un estado deshabilitado sin explicación (BR11.6).
- El contador del campo es numérico y visible desde 400 de 500 o 250 de 300, para que el tope no llegue por sorpresa (BR11.3, BR14.4).
- Los siete textos de confirmación y error son los de `functional-spec.md` § Textos exactos; ninguno muestra un código técnico ni una palabra en inglés.

## NFR1 — Fiabilidad

### NFR1.9 — Ninguna pantalla se queda en un estado sin salida

- `CrearScreen` nace en `Cargando` y **siempre** sale: a `Vacio` con la identidad resuelta, a `Editando` con la opinión cargada o a `ErrorCarga` con «Reintentar», que vuelve a `Cargando` (BR12.1, `functional-spec.md` § Máquina de estados). Nunca se queda cargando tras resolver la identidad y, en edición, la opinión.
- Cada estado del formulario tiene al menos una salida: `ErrorEnvio` vuelve a `ConObra` al reintentar, `ErrorGuardado` a `Editando`, `YaOpinada` a `Editando` o a `Buscando` con «Cambiar» (BR11.6, BR12.5, BR13.3).
- La hoja de comentarios tiene sus seis estados y todos salen: `Error de carga` vuelve a `Cargando` con «Reintentar», `Error de envío` vuelve a la lista al reintentar con éxito, y cualquier estado se cierra con ✕, arrastre o velo (BR14.3, BR14.9).
- Un fallo de red **no** lleva a `ErrorEnvio`: la publicación es local y el aviso de sin conexión es informativo (BR11.11).
- Las cuatro pantallas que U3 cablea conservan sus estados de U2: U3 no sustituye ninguna vista ni deja un error sin «Reintentar» en las tarjetas (NFR1.4 sigue vigente).

**Cómo se verifica**: pruebas de `CrearScreen` que recorren cada estado del formulario y comprueban su salida; pruebas de `CommentSheet` para los seis estados; prueba de publicación en modo avión que comprueba éxito y no error.

### NFR1.10 — Un fallo de escritura no pierde lo escrito

- Si `createOpinion` falla, el texto, la obra y la valoración siguen en el formulario: `ErrorEnvio` pinta el aviso «sobre el botón» y conserva todo (BR11.7).
- Si `updateOpinion` falla, `ErrorGuardado` conserva el texto y la valoración editados y «Reintentar» repite el envío con los mismos valores (BR12.5).
- Si `addComment` falla, el texto sigue escrito en la hoja y «Reintentar» lo reenvía; la lista ya cargada no se borra (BR14.7, BR14.9).
- Cerrar la hoja **sí** descarta el borrador del comentario, y eso está dicho: es un descarte por decisión de la persona, no una pérdida por error (BR14.3).
- Cambiar de pestaña y volver a Crear abre un formulario limpio por `formKey`; no es una pérdida silenciosa, es una visita nueva (BR11.1, C2 1.3.0).

**Cómo se verifica**: pruebas que provocan `422` al publicar, un fallo al guardar y un fallo al comentar, y comprueban que el texto sigue en el campo y que el reintento envía exactamente lo mismo.

### NFR1.11 — Volver de Crear no pierde el estado del detalle

- `closeCreate()` vuelve a `returnTo` **conservando su pila**, así que el detalle de origen mantiene su contenido, su desplazamiento y su estado (BR12.3, AC6.1.3, AC5.3.3; C2 1.3.0).
- «Cancelar» y el atrás del sistema se comportan igual y no escriben nada (BR12.6).
- Al guardar con cambios, la persona vuelve al detalle y **ve** la versión nueva con «Editada el …»; la confirmación no se pide antes de navegar (NFR8.8, BR12.3).
- Editar desde el estado `YaOpinada` conserva el `returnTo` de la entrada vigente, de modo que «Guardar» vuelve al detalle y no a la pestaña Crear (BR11.6, C2 1.3.0).

**Cómo se verifica**: prueba de la cáscara que abre Crear desde el detalle, guarda y comprueba que la pila de origen sigue con el detalle arriba; prueba del camino `YaOpinada` → `Editando` que comprueba el destino del cierre.

## Presupuesto de rendimiento en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Publicar, guardar, comentar, me gusta y seguir | Sin número; sin espera artificial: la escritura es síncrona y no hay estado intermedio | Pruebas de éxito y revisión del código. |
| Búsqueda de obra | Sin número; una petición por pausa de 400 ms y ninguna por pulsación | Prueba del hook con temporizadores falsos. |
| Snackbar | 4 s, uno solo, sin bloquear | Prueba de la cáscara con temporizadores falsos. |
| Abrir Crear, escribir 500 caracteres, abrir la hoja | Sin número; sin congelación perceptible | Recorrido en el teléfono. |
| Arranque en frío | Se mantiene el ≤ 2 s de NFR8.1; U3 no añade lectura al arranque | Cronómetro, si se vuelve a medir al cerrar el Bolt. |

## Assumptions & Open Questions

- `[assumption]` Las cinco escrituras de C4 resuelven en el mismo tick; si alguna se volviera asíncrona, NFR8.8 dejaría de cumplirse y habría que añadir un estado «enviando» con su texto —decisión de esa etapa, no de un detalle de implementación—.
- `[assumption]` El arranque no empeora: U3 añade piezas al sistema de diseño y un controlador de comentarios que se construye con el resto de servicios, sin lectura de disco ni petición de red. Si se notara, se construye de forma perezosa al abrir la hoja, no se sube el presupuesto de 2 s.
- `[assumption]` Las pruebas no miden tiempo: el criterio de NFR8 sigue sin número y ninguna prueba automática falla por duración. Los dos temporizadores que existen —400 ms y 4 s— se prueban con temporizadores falsos.
- **Open question para U4**: la búsqueda real añadirá una espera de red que hoy no existe; si U4 quiere un presupuesto para ella, lo decide en su etapa de NFR y no se hereda de aquí. Los 2 caracteres y los 400 ms ya son de esta pantalla y no cambian.
- **Open question para U5**: la Actividad confirmará con el mismo snackbar de U3; si necesitara más de un aviso a la vez, es un cambio de BR15.1.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR11, RC-02, RC-03).
- `unit-of-work` — `inception/units-generation/unit-of-work.md` (§ U3).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C4 1.2.0, C5, § Revisión 15).
- `functional-spec` — `construction/u3-create-react/functional-design/functional-spec.md` (máquina de estados del formulario, hoja de comentarios, F13–F20, § Textos exactos, § Assumptions).
- `rules` — `construction/u3-create-react/functional-design/rules.md` (BR11.1–BR11.11, BR12.1–BR12.7, BR13.1–BR13.5, BR14.3–BR14.10, BR15.1–BR15.4).
- `frontend-components` — `construction/u3-create-react/functional-design/frontend-components.md` (§ Capa de estado, § `app/src/comments/`, § Flujos de interacción de la interfaz).
