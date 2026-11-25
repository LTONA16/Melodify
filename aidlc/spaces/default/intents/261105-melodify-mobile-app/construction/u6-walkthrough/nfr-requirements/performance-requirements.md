# Requisitos de rendimiento, usabilidad y fiabilidad — U6 `u6-walkthrough`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR11.1–FR11.6, FR12.1, FR12.2, RC-05, RC-09, A6), de `inception/units-generation/unit-of-work.md` (U6) y `unit-of-work-story-map.md` (US11.1, US11.2), de `inception/user-stories/stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3), de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0, C8 1.1.0), de `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § El registro de la pasada, § Máquina de estados de la pasada, § Criterio de cierre), de `construction/u6-walkthrough/functional-design/rules.md` (BR25.2, BR25.3, BR26.1–BR26.7, BR27.1–BR27.5, BR28.1–BR28.3) y de `construction/u6-walkthrough/functional-design/frontend-components.md` (§ Comprobaciones transversales, § Estados por pantalla en el recorrido).
> Fecha: 2026-11-20. Etapa: NFR Requirements · Unidad: `u6-walkthrough` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite tres artefactos para esta unidad: este, `security-requirements.md` y `tech-stack-decisions.md`, más `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.19`). **La numeración continúa la de U1–U5**: U5 terminó en `NFR8.18`, `NFR2.14` y `NFR1.18`, así que esta unidad empieza en `NFR8.19`, `NFR2.15` y `NFR1.19`. Un identificador no se repite entre unidades.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tiene nada que absorber**: la app la usa una persona, no hay servidor y U6 no añade carga (RC-02, RC-04).

**Qué cambia respecto a U5, y es el cambio más grande del proyecto.** U1 construyó, U2 escribió contenido, U3 escribió formularios, U4 abrió red y credencial, U5 compuso. **U6 no construye nada: verifica lo construido en el teléfono.** Su presupuesto no es de latencia ni de lecturas, porque no ejecuta una ruta nueva. Su presupuesto es de **coste de la demostración y honestidad de lo observado**: cuántos pasos cuesta afirmar el criterio de terminado, cuánto tarda una pasada en poder repetirse y qué evidencia queda cuando termina. Un rendimiento malo de U6 no es una pantalla lenta: es una unidad que no puede decir qué comprobó.

**No se abre `nfr-requirements-questions.md`.** Las seis áreas que el diseño dejaba abiertas ya se cerraron con Q1–Q6 en Functional Design (registro de evidencia, estados que se provocan, bucle de corrección, alcance del arreglo, cierre condicionado de R2 y los dos temas), y los objetivos cuantitativos son los que U1–U5 ya fijaron. No queda un objetivo sin número que preguntar, y presentar una pregunta cuya respuesta ya está en `functional-design-questions.md` sería reabrir una decisión tomada.

## NFR8 — Rendimiento

NFR8 sigue diciendo: «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». U6 **no abre un percentil ni una mediana**, y tampoco puede: el recorrido es la demostración, no la medición. Lo que sí hace es acotar **cuánto cuesta la demostración** y **qué significa una espera que no termina**.

### NFR8.19 — Ningún paso se queda esperando para siempre, y U6 no estrena una medición

- **U6 no fija un objetivo nuevo.** Los presupuestos vigentes son los de U1–U5 (`NFR8.1`–`NFR8.18`), y el recorrido los confirma **cualitativamente** en el teléfono: cada pantalla sale de `loading` sola —a contenido, a vacío o a error con acción—, y ninguna se queda en esqueleto. Los dos que más se notan en el recorrido son la espera de búsqueda de U4 (`debounce` de 400 ms y tope de petición) y la carga de una pantalla de U5, que dura un fotograma cuando la sesión ya está resuelta; U6 no los vuelve a fijar, comprueba que se cumplen en el dispositivo.
- **Una espera que no termina es un defecto en alcance, no una observación.** Un esqueleto que sigue a los pocos segundos sin cambiar, o una pantalla que se queda en blanco, entra en BR27.2 como defecto en alcance (`AC11.1.1`) y se corrige en el momento (BR27.3). El registro no admite «tardó mucho» como resultado: o el estado llegó, o es ❌.
- **No se mide con un instrumento que la unidad no puede añadir.** Medir latencia exigiría un conmutador de depuración, un reloj en pantalla o una instrumentación que solo existe para la demo; Q2 = A lo descarta y BR27.4 prohíbe añadir código que no arregle una AC. La nota de una fila puede decir «salió del esqueleto al instante» o «tardó y salió», pero no se convierte en un número inventado.
- **El coste propio del recorrido está acotado y escrito.** Una pasada de R1 son **18 filas** (W01–W14 más W05b, W06b, W12b y W12c) y una de R2 son **8** (S01–S08); entre las cuatro pasadas son **52 filas** y **24 capturas** —12 de R1 y 12 de R2—, o **13** si R2 queda condicionada (BR27.1, BR28.2). Saber de antemano cuántas filas y capturas cuesta la demostración evita que la unidad crezca mientras se recorre.
- **Cómo se comprueba**: el registro de cada pasada tiene exactamente las filas de su catálogo, sin añadidos ni huecos (BR27.5); una pantalla que no sale de `loading` aparece en la tabla de defectos con su commit; la revisión del diff confirma que no se añadió ningún temporizador, reloj visible ni instrumentación.

### NFR8.20 — La pasada se prepara en un arranque limpio y no arrastra el trabajo de la anterior

- **Cada pasada empieza con recarga completa y sesión cerrada** (BR25.3). El contenido vive en memoria (ADR-010), así que la recarga devuelve la siembra y hace comparables dos pasadas; la sesión de la app, que sí persiste en almacenamiento seguro, se cierra desde Perfil antes de empezar. Sin ese arranque, la pasada mide el estado de la anterior.
- **Entre pasadas no se reinstala la app ni se borran datos del dispositivo**: el coste de preparar P2, P3 y P4 es el de cambiar el tema y, en R2, conectar la cuenta. Un cambio de tema del sistema no necesita recargar; un cambio de estado de Spotify sí se comprueba reabriendo, y eso es parte de S06 y S08.
- **La preparación tiene siete comprobaciones y una salida por cada una**: teléfono, Metro, commit, sesión cerrada, tema, client ID y redirect (functional-spec § Precondiciones). Una que falle no se salta: se registra el bloqueo y la pasada no arranca (BR25.2), salvo las de Spotify, que ejecutan S01 y condicionan (BR25.4, BR26.7).
- **Cómo se comprueba**: la cabecera de cada `walkthrough-pN.md` identifica dispositivo, Android, Expo Go, commit, tema, estado de Spotify y si el client ID está configurado (BR27.1); el paso W13 demuestra que la sesión se cerró y que al reabrir se vuelve a Login; una pasada que empieza con contenido ya modificado se repite.

## NFR2 — Usabilidad

### NFR2.15 — Cada paso del recorrido se alcanza en los toques que la AC promete, y cada estado se lee en español

| Acción del recorrido | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Abrir cada pestaña (Inicio, Explorar, Crear, Actividad, Perfil) | 1 toque en la barra | W03, W06, W07, W10, W11 |
| Entrar con `demo` / `demo` | 1 toque en «Entrar» tras escribir | W03 |
| Abrir el detalle de una opinión (y volver) | 1 toque en la tarjeta / 1 en «‹ Volver» | W05 |
| Abrir la hoja de comentarios y enviar | 1 toque en el icono / 1 en el envío | W05b |
| Abrir una obra desde Explorar (y volver) | 1 toque en la sugerencia / 1 en «‹ Volver» | W06b |
| Publicar una opinión | 1 toque en «Publicar» tras elegir, escribir y valorar | W07 |
| Recorrer un evento de Actividad | 1 toque en la fila | W10 |
| Conectar Spotify | 1 toque en «Conectar con Spotify» + la autorización externa | S01 |
| Reintentar un aviso o un error | 1 toque en «Reintentar» | W12b, S07 |
| Desconectar Spotify | 1 toque en «Desconectar» | S08 |

- **Ningún paso exige leer una explicación previa** (NFR2): el registro dice qué se toca, no interpreta la pantalla por la persona. Un paso que necesitara un tercer toque para llegar a la acción principal es un hallazgo contra `NFR2`, y se anota en la fila.
- **Todo estado que se provoca se dice con palabras y ofrece su salida**: el error de credenciales en línea (W02), la validación de Crear (W08), la búsqueda sin coincidencias (W06), el aviso de sin conexión con «Reintentar» en Inicio (W12, W12b) y **sin** acción en Crear porque no hay nada que reintentar (W12c), y el error de búsqueda de Spotify con «Reintentar» (S07). Una diferencia de acción entre dos pantallas con el mismo aviso no es una inconsistencia: es la decisión de BR26.4 y el recorrido la comprueba como tal.
- **Los textos son los de la app construida, no los del diseño**: si una pantalla dice algo distinto de `interaction-spec.md` pero en español, llano y con acción, se anota; si dice un código técnico, una palabra en inglés o un mensaje sin acción habiendo algo que reintentar, es ❌ de `AC11.1.3`/`FR11.5` y `project.md` § Mandated (BR26.3).
- **El registro es usable por quien no recorrió**: una fila por paso con pantalla, acción, esperado, obtenido, resultado y nota; el veredicto se lee sin abrir el teléfono (BR27.1, BR27.5).
- **Cómo se comprueba**: cada fila del catálogo del functional-spec existe en su pasada y tiene acción y esperado; el recuento de filas es el de NFR8.19; la revisión de los textos de la pasada busca inglés, códigos y mensajes sin acción en W14 y en cada estado provocado.

## NFR1 — Fiabilidad

### NFR1.19 — Ningún paso deja la pasada sin salida ni convierte un fallo en una pasada fallida

- **La máquina de estados de la pasada no tiene un estado mudo** (functional-spec § Máquina de estados): `Preparada → EnCurso → Defecto → Corrigiendo → ReVerificando → EnCurso`, con `Completada`, `Condicionada` y `Abortada` como únicos terminales. Un ❌ lleva a `Defecto`, no al final de la pasada; un pendiente la devuelve a `EnCurso`; un defecto en alcance se corrige y se repite el tramo hasta que vuelve a `EnCurso` o se vuelve a `Defecto` con lo que falta escrito.
- **Solo se aborta por falta de entorno**: sin teléfono físico o sin Metro no hay pasada (BR25.2), y el bloqueo se registra. Un fallo de la app no aborta: se clasifica. Es la diferencia entre «no pude demostrar» y «demostré que falla», y la unidad solo puede cerrar sobre la segunda.
- **La app no se queda cerrada ni en blanco como forma de continuar**: si un paso la cierra, ese cierre es el ❌ del paso y después se recarga y se repite el tramo (BR26.1, BR27.3). El recorrido no continúa con la app en un estado que nadie pidió.
- **Una pasada condicionada es un terminal legítimo, no una pasada a medias**: R2 sin prerrequisito ejecuta S01, anota el estado exacto de la tarjeta y marca S02–S08 como N/A con su motivo (BR26.7). R1 sigue cerrando la unidad (BR28.1, BR28.2), y la unidad dice qué mitad no se demostró.
- **Los pendientes no se confunden con defectos**: un pendiente se registra con qué falta y de qué depende, y no bloquea la pasada; un defecto que rompe una AC se corrige antes de seguir (BR27.2, BR28.3). Mezclarlos es lo que deja una unidad sin criterio de cierre.
- **Cómo se comprueba**: cada transición del registro tiene su resultado; la tabla de defectos cierra cada ❌ con decisión y commit; una pasada condicionada conserva el ❌ de S01 con su nota y no aparece contada como completa; la revisión del functional-spec contra las filas registradas confirma que no falta ningún paso.

### NFR1.20 — La pasada se puede repetir mañana y su evidencia se sostiene sola

- **La cabecera hace la pasada reproducible**: fecha, modelo de dispositivo, versión de Android, versión de Expo Go, commit corto, tema, estado de Spotify y si el client ID estaba configurado (BR27.1). Con esos siete datos, otra persona puede llegar al mismo commit, levantar Metro y repetir la pasada.
- **El contenido de partida es el mismo para todos**: recarga completa → siembra (ocho a diez opiniones, cuatro o cinco autores, tres opiniones propias, dos seguidos, dos me gusta y tres comentarios recibidos). U6 no siembra nada nuevo y no conserva datos entre pasadas.
- **La evidencia está completa o no hay veredicto**: no quedan celdas vacías, no hay ❌ sin clasificar y cada N/A explica su motivo (BR27.5); las capturas obligatorias son doce de R1 y doce de R2 —o una de la tarjeta en S01 si R2 se condiciona— y se referencian por nombre en el registro (BR27.1).
- **La unidad cierra con el estado del repositorio en verde**: `npm run typecheck`, `npm run lint` y `npm test` con el suelo del 80 % de líneas sobre `app/src/**` intacto (BR28.1). Un arreglo hecho durante el recorrido no puede bajar el suelo ni dejar la suite en rojo «para arreglar luego» (`team.md` § Testing Posture, § Way of Working).
- **Cómo se comprueba**: releer cada registro contra las siete precondiciones y el criterio de cierre de ocho puntos (functional-spec § Criterio de cierre); ejecutar los tres comandos del CI al final de la última pasada; revisar que el `diff` de cada defecto tocó solo la pantalla que falló.

## Presupuesto del recorrido en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Preparar una pasada | Arranque limpio: recarga + sesión cerrada, siete precondiciones satisfechas o bloqueo escrito | Cabecera del registro + W13 |
| P1 y P2 (R1) | **18 filas** por pasada y **12 capturas** entre las dos (seis pantallas por tema) | Registro `walkthrough-p1.md` y `walkthrough-p2.md` |
| P3 y P4 (R2) | **8 filas** por pasada y **12 capturas** si se ejecutan; **una** captura y S01 observada si se condicionan | Registro `walkthrough-p3.md` y `walkthrough-p4.md` |
| Coste total | **52 filas** y **24 capturas** (o **13** con R2 condicionada) | Recuento de las cuatro tablas |
| Repetir una pasada | Los siete datos de cabecera bastan para volver al mismo estado | Relectura del registro por otra persona |
| Medir el rendimiento | **No se mide**: se juzga que cada estado llega y que ninguna pantalla queda en carga | Filas ✅/❌ y tabla de defectos |

## Assumptions & Open Questions

- `[assumption]` Cuatro pasadas completas son el coste mínimo de `AC11.1.5` y `AC11.2.1`–`AC11.2.3`: dos temas por cada mitad de Spotify. Si R2 se condiciona, el coste baja a dos pasadas y una captura, y la unidad lo dice en su veredicto.
- `[assumption]` No se mide latencia en el teléfono. Hacerlo exigiría un instrumento que la unidad no puede añadir (BR27.4) y produciría un número que ninguna AC pide; el criterio de NFR8 es el recorrido sin errores y el recorrido solo puede decir si el estado llegó.
- `[assumption]` El tiempo de una pasada no es un objetivo. Una pasada lenta pero completa demuestra más que una rápida a medias; lo que se acota es el número de filas y capturas, no los minutos.
- `[assumption]` Las filas del catálogo no cambian durante la unidad. Si un defecto obligara a añadir un paso, sería una función nueva y un pendiente (BR25.1), no una fila más.
- **Open question para el cierre del workflow**: si R2 queda condicionada, la mitad con sesión deja de estar demostrada y pasa a ser deuda con dependencia externa; el registro y el mapa de dependencias externas deben llevar el mismo valor de redirect y la misma fecha (BR26.7, BR28.2). El veredicto de U6 no puede afirmar «con sesión demostrada» sin una fila que lo respalde.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, FR11.1–FR11.6, FR12.1, FR12.2, RC-05).
- `unit-of-work` — `inception/units-generation/unit-of-work.md` (§ U6) y `unit-of-work-story-map.md` (US11.1, US11.2).
- `stories` — `inception/user-stories/stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0, C8 1.1.0).
- `functional-spec` — `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § El registro de la pasada, § Máquina de estados, § Criterio de cierre).
- `rules` — `construction/u6-walkthrough/functional-design/rules.md` (BR25.2–BR25.4, BR26.1–BR26.7, BR27.1–BR27.5, BR28.1–BR28.3).
- `frontend-components` — `construction/u6-walkthrough/functional-design/frontend-components.md` (§ Comprobaciones transversales, § Estados por pantalla en el recorrido).
