# Functional Design — Preguntas de `u6-walkthrough`

> **Unidad**: `u6-walkthrough` (Recorrido completo) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U6), `unit-of-work-story-map.md` (US11.1, US11.2), `stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3), `requirements.md` (FR11.1–FR11.6, FR12.1, FR12.2, RC-05, RC-09, NFR7, A6), `components.md` (`AppShell`, `DesignSystem`, `Connectivity`, `AppSession`), `mockups.md` (§ Matriz de estados, § Responsive), `interaction-spec.md`, `decisions.md` (ADR-012), `delivery-planning` (Bolt 6, preguntas Q6 = C, Q7 = A, Q8 = D), `team.md` (§ Deployment) y `project.md` (§ Mandated).

> **Nota de registro**: la persona pidió continuar sin responder a este cuestionario. Se adoptan las seis opciones marcadas «Recommended» (Q1 = A, Q2 = A, Q3 = A, Q4 = A, Q5 = A, Q6 = A) como decisión de esta etapa, no como respuesta escrita por ella, y quedan sujetas a cambio en la puerta de aprobación.

U6 no añade funciones: comprueba en el teléfono Android físico, con Metro y Expo Go, que las seis pantallas se recorren enteras sin sesión de Spotify y con sesión conectada. Estas preguntas cierran lo que el diseño todavía no dice: cómo se registra la evidencia, qué estados se provocan a mano, qué se hace cuando un paso falla, qué arreglos entran en la unidad, cómo cierra si el panel de Spotify rechaza el redirect y cómo se cubren los dos temas. El qué se comprueba ya está fijado por US11.1, US11.2 y la matriz de estados, y no se vuelve a preguntar.

## Q1. [Entrega] ¿Dónde y cómo se registra la evidencia del recorrido?

`US11.1` y `US11.2` se demuestran en el teléfono, y la práctica del equipo dice que el PR es el registro de lo verificado: plataformas probadas, capturas y checklist. Falta decidir qué forma tiene ese registro y dónde vive dentro del intento.

- A. **Tabla paso a paso más capturas de las seis pantallas** (Recommended): un `walkthrough-log.md` con una fila por paso (pantalla, acción, resultado esperado, resultado obtenido, ✅/❌, nota), fechado y con el dispositivo usado, acompañado de una captura de cada pantalla en cada tema; el registro y las capturas viajan en el PR del Bolt. Permite afirmar qué se comprobó sin depender de la memoria y cumple la plantilla del repositorio.
- B. **Solo capturas, sin tabla**: más rápido de producir, pero una captura no dice qué se tocó antes ni qué se esperaba, así que no sirve como evidencia de las AC.
- C. **Solo tabla de resultados, sin capturas**: el texto basta para la trazabilidad, a costa de que nadie pueda ver el estado real de una pantalla en el PR.
- X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿Qué estados se provocan a mano durante el recorrido?

La matriz de estados del mockup tiene carga, vacío, error, sin Spotify y sin conexión por pantalla, pero no todos se pueden provocar desde el propio teléfono: el vacío exige un almacén sin contenido, la carga dura un instante y los errores de contenido local no tienen una causa natural. `FR11.6` y `ADR-012` ya cubren vacío, carga y error con pruebas automáticas.

- A. **Camino principal más los estados que se provocan desde el teléfono** (Recommended): se recorre el camino principal de cada pantalla y se provocan credenciales erróneas, modo avión, falta de sesión de Spotify y cambio de tema; vacío, carga y error de contenido se dan por cubiertos con las pruebas de `FR11.6` y `ADR-012`, y se anota así en el registro.
- B. **Matriz completa en el teléfono**: se añade un conmutador de depuración para vaciar el almacén y se fuerzan carga y error en cada pantalla. Es la cobertura máxima, pagada con código que solo existe para la demo y que ninguna AC pide.
- C. **Solo el camino feliz**: se recorre cada pantalla con contenido y sin tocar ningún estado de fallo; es el recorrido más corto, pero deja sin comprobar `AC11.1.4` y la mitad de estados de la matriz.
- X. Other (please specify)

[Answer]: A

## Q3. [Entrega] ¿Qué se hace cuando un paso falla?

`AC11.1.4` pide que, si una pantalla falla, el error esté en lenguaje llano con «Reintentar» y el recorrido pueda continuar. Eso deja abierto cómo se trabaja: si se corrige sobre la marcha o se anota todo y se arregla al final.

- A. **Corregir en el momento y repetir ese tramo** (Recommended): si el fallo entra en el alcance de Q4, se corrige ahí mismo, se repite solo el tramo afectado y se anota en el registro; al terminar se hace una pasada completa con CI verde. El recorrido no se pierde y la pasada final demuestra que el arreglo no rompió nada.
- B. **Anotar todo y corregir al final**: el recorrido se hace de una sentada y los arreglos se agrupan después; se paga con que los fallos tempranos contaminan todos los pasos siguientes y con una sola pasada final que puede destapar otro fallo tarde.
- C. **Corregir solo lo que impide continuar**: el recorrido llega al final sí o sí, pero los fallos que no bloquean se quedan sin arreglar y el registro no distingue «no lo vi» de «lo vi y lo dejé».
- X. Other (please specify)

[Answer]: A

## Q4. [Entrega] ¿Qué entra como arreglo en U6 y qué queda registrado?

`unit-of-work.md` dice que U6 entrega «los ajustes que ese recorrido destape» y deja fuera las funciones nuevas; también pide decidir si una función que falta entra aquí o se registra como pendiente. Sin un límite, el recorrido se convierte en una unidad de mejoras sin final.

- A. **Solo lo que incumple una AC, la matriz de estados o una prohibición del proyecto** (Recommended): se corrige lo que rompe `US11.1`/`US11.2`, un estado declarado o una regla vigente (texto en inglés, error sin «Reintentar», hueco roto, tema ignorado). Una mejora de estilo o una función nueva se registra como pendiente y no entra.
- B. **Todo lo que se vea mejorable**: el resultado pulido es mayor, a costa de que la unidad no tenga criterio de cierre y de mezclar verificación con rediseño.
- C. **Nada se corrige en U6**: la unidad solo documenta lo encontrado y los arreglos se hacen después; cumple la letra de «verificación», pero deja la versión sin el criterio de terminado que el alcance exige.
- X. Other (please specify)

[Answer]: A

## Q5. [Entrega] Si el panel de Spotify rechaza el redirect de Expo Go, ¿cómo cierra U6?

`Q8 = D` de Delivery Planning decidió registrar la app de Spotify y demostrar el recorrido con sesión, pero `RC-09` sigue siendo un prerrequisito externo: el panel debe aceptar el redirect exacto que devuelve `makeRedirectUri()` en el teléfono (`exp://<ip>:8081/--/spotify-callback`). `AC11.2.3` y `FR12.2` ya prevén que ese prerrequisito no esté resuelto.

- A. **Cerrar con el recorrido sin sesión y dejar constancia exacta** (Recommended): se demuestra la mitad sin sesión, se anota el valor literal del redirect y el motivo del rechazo, y se registra el pendiente con su dependencia externa. `FR12.2` se cumple por su vía condicional y la unidad no queda bloqueada por algo que no se arregla desde el código.
- B. **No cerrar hasta demostrar con sesión**: se mantiene el criterio completo, a costa de bloquear la entrega por una decisión del panel y de que la alternativa real sería un build propio, prohibido por `CT-05` y por `team.md` § Deployment.
- C. **Cerrar dando por demostrada la mitad con sesión**: se apoya en los dobles de U4, pero un doble no demuestra la integración real que pide `US11.2`.
- X. Other (please specify)

[Answer]: A

## Q6. [Producto] ¿Cómo se cubren tema claro y oscuro?

`AC11.1.5` pide que las seis pantallas sigan el tema del sistema sin perder legibilidad ni los bloques con inicial. El teléfono puede cambiar de tema cuando se quiera, así que falta decidir cuántas pasadas se hacen y cómo se capturan.

- A. **Dos pasadas completas, una por tema** (Recommended): el recorrido se hace entero en claro y entero en oscuro, con captura de cada pantalla en cada tema; es la única forma de afirmar `AC11.1.5` pantalla por pantalla y de comparar el mismo estado en los dos temas.
- B. **Una pasada en claro y confiar en los tokens**: el tema oscuro queda cubierto por las pruebas de `DesignSystem`, a costa de no ver ninguna pantalla real en oscuro en el teléfono.
- C. **Una pasada alternando el tema por pantalla**: la mitad de capturas, pero ninguna pantalla se ve en los dos temas, así que una diferencia de contraste se escapa.
- X. Other (please specify)

[Answer]: A
