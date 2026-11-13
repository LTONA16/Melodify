# Units Generation — preguntas

> Etapa: Units Generation (10 de 19). Agente: aidlc-architect-agent. Profundidad: Standard.
> Responde con la letra de cada pregunta. Si eliges «X», escribe tu respuesta.

## Q1 — Estrategia de fronteras entre unidades

¿Cómo se cortan las unidades de trabajo?

- A. **Por tramo del recorrido**: cada unidad es un tramo que la persona puede recorrer de punta a punta —esqueleto que corre, contenido con Inicio/Detalle/Perfil, crear y editar, Spotify y Explorar, actividad, recorrido final—. El corte lo marca lo que la persona puede usar, no la estructura del código.
- B. **Por componente de dominio**: una unidad por cada uno de los nueve componentes de Domain Design.
- C. **Por capa técnica**: una unidad de datos y estado, otra de interfaz y otra de integración con Spotify.
- D. **Una sola unidad**: toda la app se construye de una vez.
- X. Other (please specify)

[Answer]: A

## Q2 — Granularidad

¿Cuántas unidades quieres?

- A. **Seis**: esqueleto, contenido (Inicio, detalle y Perfil), crear y editar, Spotify y Explorar, actividad, y recorrido final. Es la granularidad que un equipo pequeño puede construir y revisar sin ahogarse.
- B. **Cuatro gruesas**: esqueleto y contenido, creación, Spotify, y actividad con recorrido final.
- C. **Nueve**: una por componente del catálogo.
- X. Other (please specify)

[Answer]: A

## Q3 — Dependencias y paralelismo

¿Qué forma tiene el grafo de dependencias?

- A. **Con paralelismo donde se pueda**: el esqueleto primero; contenido después; crear/editar y Spotify pueden construirse en paralelo sobre el contenido; actividad depende del contenido; el recorrido final depende de todas.
- B. **Cadena estrictamente lineal**: cada unidad depende solo de la anterior, una detrás de otra.
- C. **Todo cuelga del esqueleto**: cada unidad es independiente entre sí y solo depende de la primera.
- X. Other (please specify)

[Answer]: A

## Q4 — Puntos de integración entre unidades

¿Cómo se cruzan las unidades?

- A. **Las fronteras ya definidas son el contrato**: cada unidad consume las interfaces de los componentes del Domain Design y no se inventan contratos nuevos entre unidades; Contract Design solo verifica las que cruzan de una unidad a otra.
- B. **Contratos formales por unidad**: cada unidad publica tipos y firmas propias antes de construir, aunque la app sea una sola.
- C. **Sin contratos**: se ajusta sobre la marcha al construir.
- X. Other (please specify)

[Answer]: A

## Q5 — Modelo de despliegue por unidad

¿Cómo se entrega cada unidad?

- A. **Una sola app**: todas las unidades se empaquetan juntas; «desplegar» es abrir la app en Expo Go con Metro levantado. Ninguna unidad se despliega por separado.
- B. **Híbrido**: el contenido y la interfaz viajan juntos, pero Spotify se entrega como pieza aparte.
- C. **Independiente**: cada unidad se publica por su cuenta.
- X. Other (please specify)

[Answer]: A

## Q6 — Qué demuestra el esqueleto (primera unidad)

La práctica del equipo activa el walking skeleton en este alcance. ¿Qué incluye exactamente ese primer tramo?

- A. **Login demo, navegación completa entre las cinco pestañas —con las otras cuatro como pantallas vacías—, tema montado e Inicio con una sola tarjeta de opinión de ejemplo**. Se recorre en el teléfono Android físico y se aprueba antes de seguir.
- B. **Solo el proyecto Expo, el tema y la navegación**: sin login ni tarjeta; la primera opinión llega en la unidad siguiente.
- C. **Login, navegación e Inicio con el feed completo de ejemplo**: el esqueleto ya trae el contenido sembrado entero.
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- **Estrategia**: unidades cortadas por tramo del recorrido, no por componente ni por capa. Cada unidad entrega algo que se puede usar de punta a punta.
- **Cuántas**: seis — `u1-app-skeleton`, `u2-content-core`, `u3-create-react`, `u4-spotify-explore`, `u5-activity` y `u6-walkthrough`—, todas de tipo `ui` y empaquetadas en la misma app.
- **Dependencias**: esqueleto → contenido → tres ramas en paralelo (crear/reaccionar, Spotify/Explorar, actividad) → recorrido final. Sin ciclos.
- **Integración**: las interfaces de componente del Domain Design son el contrato; no se inventan contratos nuevos entre unidades.
- **Despliegue**: una sola app; «desplegar» es abrirla en Expo Go con Metro levantado.
- **Esqueleto (U1)**: proyecto Expo, tema, navegación de cinco pestañas con cuatro vacías, login demo con sesión recordada e Inicio con una tarjeta de opinión de ejemplo. Se recorre y se aprueba en el teléfono Android físico antes de seguir.
- **Historias**: las 24 quedan asignadas — U1 tres, U2 seis, U3 siete, U4 cuatro (con US2.2 compartida con U2), U5 una, U6 dos.

Does this all look correct before I generate the artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
