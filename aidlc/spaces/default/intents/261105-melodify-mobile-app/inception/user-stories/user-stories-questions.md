# User Stories — Plan y preguntas

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9), `ideation/rough-mockups/wireframes.md` y `inception/practices-discovery/team-practices.md`.
> Fecha: 2026-11-06. Etapa: User Stories. Agente: aidlc-product-agent.

## Plan de historias

**Formato.** Cada historia sigue el formato estándar —«Como [persona], quiero [objetivo], para [beneficio]»— y se comprueba contra INVEST. El identificador es estable: `US{grupo}.{secuencia}`.

**Criterios de aceptación.** De 3 a 6 por historia, en formato Given/When/Then, con identificador `AC{grupo}.{secuencia}.{criterio}`. Cada historia incluye al menos un camino de error o borde, no solo el camino feliz.

**Prioridad.** MoSCoW (Must Have / Should Have / Could Have / Won't Have). La frontera del MVP se decide formalmente en Delivery Planning; aquí la prioridad solo la informa.

**Personas.** Se definen en `personas.md` con nombre, rol, objetivos, dolores, comodidad técnica y frecuencia de uso. Toda historia referencia una persona definida.

**Trazabilidad.** `traceability.json` cubre cada `FR` y `NFR` de Requirements Analysis con estado `OK` (y destino `USx.y`), `Deferred` (con la etapa que lo asume) o `N/A` (con justificación). Los `NFR` que se detallan en NFR Requirements se marcan `Deferred` a esa etapa.

**Fuera del alcance de esta etapa.** No se escriben historias de backend, autenticación real de la app, reproducción de audio, notificaciones ni publicación en tiendas: están excluidas en los requisitos.

## Q1. [Personas] ¿Cuántas personas definimos?

La app tiene un solo tipo de usuario real —quien entra, lee opiniones, publica la suya y reacciona—, pero el contenido de ejemplo tiene autores y el Perfil muestra a quién se sigue. El número de personas decide cuántas historias se repiten por actor.

- A. Una: la persona que usa Melodify (entra, explora, opina, comenta y sigue autores); los autores de ejemplo son contenido, no una persona del sistema (Recommended)
- B. Dos: quien publica opiniones y quien solo lee y reacciona
- C. Tres: las dos anteriores más el autor de las opiniones de ejemplo, como persona secundaria del contenido
- X. Other (please specify)

[Answer]: A

## Q2. [Desglose] ¿Cómo agrupamos las historias?

El desglose decide qué se puede construir y demostrar de una vez. El recorrido tiene seis pantallas y tres modos de contenido (sin sesión, con sesión y sin conexión).

- A. Por pantalla y tramo del recorrido: login, inicio, explorar, detalle de obra, crear, editar, actividad, perfil, conexión con Spotify y recorrido completo (Recommended)
- B. Por grupo funcional: una historia por cada grupo FR1–FR12
- C. Por persona y objetivo: agrupadas por lo que la persona quiere lograr, aunque crucen varias pantallas
- X. Other (please specify)

[Answer]: A

## Q3. [Granularidad] ¿Cuántas historias queremos?

El número decide el tamaño de `stories.md` y cuántos criterios de aceptación acaban siendo la fuente de las pruebas.

- A. Alrededor de 20–24 historias, cada una con 3–5 criterios: una por tramo recorrible, ni una por sub-requisito ni una por pantalla entera (Recommended)
- B. Alrededor de 12 historias, con criterios más largos: una por grupo funcional
- C. Alrededor de 35–40 historias, muy pequeñas: una por sub-requisito
- X. Other (please specify)

[Answer]: A

## Q4. [Prioridad] ¿Cómo repartimos MoSCoW?

El alcance `mvp` ya recortó el producto, así que casi todo lo escrito es necesario para el recorrido. La prioridad sirve sobre todo para ordenar la construcción y para decidir qué se cae primero si algo no cabe.

- A. Todo Must Have: el alcance ya está recortado y todo lo escrito hace falta para recorrer las seis pantallas (Recommended)
- B. Must Have el recorrido base; Should Have los estados degradados y el pulido (sin conexión, token inválido, seguir autor)
- C. Must / Should / Could / Won't con un reparto fino, incluidos los Won't Have explícitos
- X. Other (please specify)

[Answer]: A

## Q5. [Recorrido] ¿Escribimos una historia del recorrido completo?

FR12 pide demostrar las seis pantallas dos veces, sin sesión de Spotify y con sesión. Puede ser una historia propia o quedar como criterio dentro de las demás.

- A. Sí, una historia propia de recorrido completo, con criterios por pantalla y por modo (Recommended)
- B. No: el recorrido se cubre con las historias de cada pantalla y no se repite
- C. Sí, pero solo como criterio de aceptación dentro de la historia de inicio
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- **Personas**: una sola, la persona que usa Melodify (entra, explora, opina, comenta y sigue autores); los autores de ejemplo son contenido, no una persona del sistema.
- **Desglose**: por pantalla y tramo del recorrido — login, inicio, explorar, detalle de obra, crear, editar, actividad, perfil, conexión con Spotify y recorrido completo.
- **Granularidad**: alrededor de 20–24 historias, cada una con 3–5 criterios de aceptación.
- **Prioridad**: todo Must Have, porque el alcance ya está recortado y todo lo escrito hace falta para recorrer las seis pantallas.
- **Recorrido completo**: una historia propia, con criterios por pantalla y por modo (sin sesión de Spotify y con sesión).
- **Formato**: «Como [persona], quiero [objetivo], para [beneficio]», INVEST, criterios Given/When/Then con identificadores `USx.y` y `ACx.y.z`.
- **Trazabilidad**: cada `FR` y `NFR` queda cubierto con `OK`, `Deferred` (a la etapa que lo asume) o `N/A` con justificación.

Does this all look correct before I generate the artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
