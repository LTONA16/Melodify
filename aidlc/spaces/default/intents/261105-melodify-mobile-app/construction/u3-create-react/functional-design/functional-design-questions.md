# Functional Design — Preguntas de `u3-create-react`

> **Unidad**: `u3-create-react` (Crear, editar y reaccionar) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U3), `unit-of-work-story-map.md` (US5.1–US5.3, US6.1, US7.1–US7.3), `stories.md` (AC5.1.1–AC5.3.4, AC6.1.1–AC6.1.5, AC7.1.1–AC7.3.4), `requirements.md` (FR5, FR6, FR7, FR11, FR12, A1, OQ1), `components.md` (ContentStore, Catalog, AppShell, DesignSystem), `contract-summary.md` (C1, C2, C4, C5, C8), `mockups.md` (Crear, hoja de comentarios, matriz de estados), `interaction-spec.md` (flujos de publicar, editar, comentar, me gusta y seguir; copy de referencia) y `design-system-mapping.md`.

Estas tres preguntas cierran lo que quedó abierto para esta unidad y que cambia el contrato entre unidades, no solo el contenido de esta especificación: las reglas del texto y de la valoración (OQ1/A1, que Requirements aplazó a esta etapa), el tope de un comentario y qué pasa cuando el me gusta recae sobre la propia opinión.

## Q1. [Producto] ¿Qué reglas tiene el texto de una opinión y la valoración?

`OQ1` y `A1` dejan abiertas dos cosas que `FR5.2` marca como provisionales: el **límite máximo del texto** y si la **valoración es obligatoria**. `US5.1` y `US5.2` dan por hecho que «Publicar» exige obra, texto y valoración; el contrato de C4 declara `422` para «texto o valoración fuera de las reglas del formulario», pero hoy `createOpinion` solo rechaza texto vacío y valoración fuera de 1–5, porque U2 retiró el tope de 500 que la implementación había fijado en silencio. `interaction-spec.md` § Assumptions recuerda que la decisión no altera ningún flujo: solo cambia la habilitación de «Publicar» y, si hay máximo, el contador del campo.

- A. **Sin tope de caracteres y valoración obligatoria (Recommended)**: la regla es «texto no vacío» y valoración de 1 a 5. No hay contador. Es exactamente lo que C4 ya implementa, así que no hay enmienda de contrato y `OQ1`/`A1` se cierran con la menor superficie. Un texto largo se acepta: el detalle lo muestra completo (`FR6.5`) y la tarjeta del feed ya lo recorta visualmente.
- B. **Tope de 500 caracteres y valoración obligatoria**: contador visible a partir de 400. C4 sube de versión para rechazar con `422` el texto que pase de 500 y el campo no deja escribir más. Protege la altura del feed, pero añade una enmienda de C4 y un elemento de interfaz que hoy no existe.
- C. **Tope de 280 caracteres y valoración obligatoria**: la misma enmienda que B, más restrictiva. Encaja con la idea de «opinión breve», pero recorta textos que ninguna historia limita y obliga a más ediciones al escribir.
- D. **Sin tope de texto y valoración opcional**: `createOpinion` tendría que aceptar valoración 0 —hoy `rating` es obligatorio— y «Publicar» se habilitaría con obra y texto. Cambia el contrato y contradice el criterio provisional de `FR5.2`; a cambio, se puede opinar sin puntuar.
- X. Other (please specify)

[Answer]: B

## Q2. [Producto] ¿Cuánto puede medir un comentario?

`C4` declara `422` para el comentario con «texto vacío o fuera de límite», así que el límite existe en el contrato pero no tiene número: lo fija esta etapa. La hoja de comentarios es una conversación en contexto (`US7.2`), no un ensayo, y su lista se lee de un vistazo.

- A. **300 caracteres (Recommended)**: suficiente para responder y mantener la hoja legible. C4 implementa el límite declarado (1–300) y la hoja no deja escribir más, con contador a partir de 250.
- B. **500 caracteres**: más margen para respuestas largas, a costa de filas de comentario que ocupan media pantalla.
- C. **Sin tope, solo texto no vacío**: lo más simple, pero deja el «fuera de límite» del contrato sin número y sin prueba que lo sostenga.
- D. **El mismo límite que el texto de la opinión**: si Q1 elige A, el comentario queda sin tope; si elige B o C, hereda 500 o 280. Una sola regla que recordar, pero ata dos campos que se usan distinto.
- X. Other (please specify)

[Answer]: A

## Q3. [Producto] ¿Se puede dar me gusta a la propia opinión?

`interaction-spec.md` pinta el me gusta en todas las tarjetas y solo oculta «Seguir autor» en la opinión propia; `toggleFollow` devuelve `409` al intentar seguirse a uno mismo, pero `toggleLike` no prohíbe el me gusta propio. `Actividad` (U5) deriva «me gusta recibidos» (`FR8.1`, `AC8.1.2`), y un me gusta propio aparecería ahí como recibido, que se lee raro. `AC7.1.3` solo dice que dar me gusta a la opinión de otra persona no genera evento.

- A. **No: en la opinión propia se oculta el me gusta, como ya se oculta «Seguir autor» (Recommended)**: coherente con que no se puede seguir a uno mismo, y evita un evento de Actividad que parecería recibido de otra persona. Es una divergencia pequeña con `interaction-spec.md` y se registra como decisión de esta unidad.
- B. **Sí, y aparece en Actividad como me gusta recibido**: es lo más literal al contrato y a la tarjeta actual; deja en Actividad un evento que la persona se ha dado a sí misma.
- C. **Sí, pero U5 excluye los me gusta propios de Actividad**: el botón funciona en la tarjeta y Actividad no lo pinta; exige una regla de derivación en U5 y una prueba que la sostenga.
- X. Other (please specify)

[Answer]: A
