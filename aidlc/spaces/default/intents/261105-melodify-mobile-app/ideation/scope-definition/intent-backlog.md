# Intent Backlog — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`), de `ideation/feasibility/feasibility-assessment.md` (`feasibility-assessment`) y de `ideation/feasibility/constraint-register.md` (`constraint-register`), más las respuestas de `scope-definition-questions.md` (Q1–Q8).
> Fecha: 2026-11-05. Etapa: Scope Definition. Agente: aidlc-product-agent.

## Cómo leer este backlog

Cada fila es un **proto-Unit**: un bloque de trabajo que se entregará junto, no una tarea suelta. La prioridad usa **MoSCoW** — `Must` sin él no hay producto, `Should` importante pero recortable, `Could` si sobra tiempo. El orden refleja la secuenciación **riesgo primero** acordada: la navegación y los componentes compartidos van antes que el contenido de cada pantalla. [Q5]

## Backlog priorizado

| # | Proto-Unit | Qué entrega | Prioridad | Depende de | Valor que habilita |
|---|---|---|---|---|---|
| U1 | Fundación de la app | Proyecto Expo inicializado, navegación entre las seis pantallas, tema visual y componentes compartidos (tarjeta de opinión, encabezado, botón) | Must | — | Sin esto ninguna pantalla existe; concentra el riesgo del stack nuevo. |
| U2 | Login simulado | Pantalla de entrada con credenciales fijas `demo` / `demo` que lleva al inicio | Must | U1 | El usuario puede entrar al recorrido. |
| U3 | Inicio | Feed de opiniones de ejemplo con autor, obra y texto | Must | U1, U2 | El usuario ve de qué trata la app. |
| U4 | Explorar | Descubrimiento sobre el mismo conjunto de datos de ejemplo: búsqueda o filtro simple | Must | U1, U3 | El usuario encuentra contenido sin depender del feed. |
| U5 | Crear | Formulario para publicar una opinión (obra, texto, valoración) que se añade a la lista en memoria | Must | U1, U3 | El usuario deja de ser solo espectador. |
| U6 | Actividad | Historial de lo publicado y de las reacciones de ejemplo | Must | U1, U5 | El usuario comprueba que su acción tuvo efecto. |
| U7 | Perfil | Usuario de ejemplo, sus opiniones y los usuarios que sigue | Must | U1, U5 | El usuario ve su identidad dentro de la app. |
| U8 | Interacción social simulada | Seguir y comentar sobre datos locales, integrado en Inicio, Actividad y Perfil | Should | U3, U6, U7 | La app se siente como una comunidad, no como un catálogo. |
| U9 | Notificaciones locales | Avisos simulados dentro de la app, sin servicio de push | Could | U6 | El usuario percibe que hay actividad nueva. |
| U10 | Recorrido completo verificado | Recorrido de las seis pantallas de punta a punta en Expo Go sobre el teléfono Android, sin errores | Must | U2–U7 | Es el criterio de terminado de la versión. |

## Criterio de terminado por unidad

| Unidad | Terminada cuando |
|---|---|
| U1 | La app arranca en Expo Go y se navega entre seis pantallas vacías sin errores. |
| U2 | Con `demo` / `demo` se entra al inicio; con otros valores no se entra o se avisa. |
| U3 | Inicio muestra una o dos opiniones de ejemplo con todos sus campos visibles. |
| U4 | Explorar permite encontrar una opinión concreta del conjunto de ejemplo. |
| U5 | Una opinión creada aparece de inmediato en Inicio y en Actividad. |
| U6 | Actividad lista lo publicado en esta sesión con su marca de tiempo. |
| U7 | Perfil muestra el usuario demo, sus opiniones y a quién sigue. |
| U8 | Seguir y comentar cambian el estado visible sin backend y sin recargar la app. |
| U9 | El aviso local aparece dentro de la app sin requerir permisos de push. |
| U10 | Las seis pantallas se recorren de punta a punta en el teléfono Android sin errores ni pantallas en blanco. |

## Camino crítico

```
U1 ──> U2 ──> U3 ──> U5 ──> U6 ──> U10
                │      │
                │      └──> U7 ──> U8
                └──> U4
```

`U1` es el cuello de botella: todo lo demás depende de la navegación y de los componentes compartidos. Por eso va primero aunque no entregue valor visible al usuario. [Q5]

## Recortes si el tiempo aprieta

En este orden, de menos a más doloroso:

1. `U9` — notificaciones locales: no afecta al criterio de terminado.
2. `U8` — interacción social simulada: la app sigue siendo recorrible sin ella, aunque pierde parte de su carácter de comunidad.
3. `U4` — Explorar: se puede sustituir por una pantalla simple que reutilice el feed de Inicio.

`U1`, `U2`, `U3`, `U5`, `U6`, `U7` y `U10` no se recortan: sin cualquiera de ellos el pedido original queda incompleto.

## Assumptions & Open Questions

- No se definió la forma concreta de «Explorar» (búsqueda por texto, filtro por género o ambos); se decide en el diseño funcional. [assumption]
- No se definió qué campos exactos lleva una opinión (obra, texto, valoración, fecha); se deciden en el diseño funcional. [assumption]
- La identidad visual (colores, tipografía, logotipo) no está definida; se resuelve en la etapa de mockups. [assumption]

## Sources

- `[desc]` Descripción inicial del pedido.
- `[scope]` Alcance de workflow: `mvp`.
- `[Q1]`–`[Q8]` Respuestas de `scope-definition-questions.md`.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.
- `feasibility-assessment` — `ideation/feasibility/feasibility-assessment.md`.
- `constraint-register` — `ideation/feasibility/constraint-register.md`.
