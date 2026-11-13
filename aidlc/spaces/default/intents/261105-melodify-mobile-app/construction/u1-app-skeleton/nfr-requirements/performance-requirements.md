# Requisitos de rendimiento, usabilidad y fiabilidad — U1 `u1-app-skeleton`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, RC-01, RC-04, RC-05), de `inception/domain-design/decisions.md` (ADR-009 navegación, ADR-010 estado, ADR-011 almacenamiento de la sesión), de `construction/u1-app-skeleton/functional-design/functional-spec.md` (F1, F2, F4, F6) y de las respuestas de `nfr-requirements-questions.md` (Q1 = A, Q2 = C, Q5 = C).
> Fecha: 2026-11-11. Etapa: NFR Requirements · Unidad: `u1-app-skeleton` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite cuatro artefactos para esta unidad: este, `security-requirements.md`, `tech-stack-decisions.md` y `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.1`). El identificador es estable: Code Generation y Build and Test se refieren a él por ese nombre.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tenía nada que absorber**: `requirements.md` no fija ningún objetivo de escalabilidad y una app de una sola persona, sin servidor y con el contenido en memoria (RC-02, RC-03), no añade ninguno, así que no existe un requisito derivado detrás de ese artefacto. Si el proyecto creciera hasta tener backend o varios usuarios, la escalabilidad entraría como objetivo nuevo en la etapa que lo decida, no como hueco de esta.

**Lo que esta unidad no fija, y por qué.** NFR8 aprobado dice que «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». La respuesta Q2 = C abre **una sola excepción**: el arranque en frío. El resto del recorrido —cambio de pestaña, pintado de la tarjeta, respuesta a un toque— sigue sin número y se juzga con el criterio de NFR8: se recorre en el teléfono y no se percibe una congelación. Inventar milisegundos para esas rutas habría contradicho un objetivo ya aprobado.

## NFR8 — Rendimiento

### NFR8.1 — Arranque en frío ≤ 2 s

| Aspecto | Definición |
|---|---|
| **Objetivo** | **≤ 2 s** desde el toque que abre el proyecto Melodify hasta el primer fotograma completo de Login o de Inicio; **mediana de tres aperturas** por cada llegada. |
| **El toque de inicio** | Expo Go **ya abierto** en su lista de proyectos, Metro ya sirviendo y el paquete ya cargado al menos una vez. El toque se da sobre la entrada «Melodify» de esa lista. No se mide el arranque de Expo Go desde cero ni el primer arranque tras un cambio de código, que reconstruye el paquete. |
| **Qué se hace entre aperturas** | Volver a la lista de proyectos de Expo Go —ese gesto apaga el contexto de JavaScript de la app, que es lo que hace que la siguiente entrada sea un arranque en frío— y esperar a que la lista deje de mostrar actividad. **No** se fuerza la parada de Expo Go: eso arrastra el contenedor y mide otra cosa, la que este requisito excluye. |
| **Qué llegada se mide** | Las dos: **tres aperturas con la sesión cerrada** (la app llega a Login) y **tres con la sesión recordada** (llega a Inicio). Ambas deben caber en 2 s. Si una de las dos no se puede medir en ese momento, se anota cuál faltó y por qué; no se sustituye una por otra. |
| **Qué entra en la medida** | Todo lo que ocurre desde ese toque: el montaje de la cáscara, el tema, la navegación y la lectura del recuerdo de sesión en el almacenamiento seguro (ADR-011, que la asume algo más lenta que `AsyncStorage`). |
| **Qué no entra** | El arranque del contenedor Expo Go desde cero y la descarga o reconstrucción del paquete por Metro. Son tiempo de la herramienta de desarrollo, no de la app, y no existen en un binario propio. |
| **Dónde se mide** | Teléfono Android físico con Expo Go (RC-05), nunca en emulador. |
| **Quién y cuándo** | La persona que construye, al cerrar el Bolt de U1, con cronómetro de mano: es el último paso antes de dar el tramo por bueno. |
| **Si no se cumple** | Se investiga antes de dar la unidad por terminada: la causa esperable es una espera añadida al arranque, no la lectura del almacenamiento. |

**Por qué hay un número aquí y solo aquí**: es el único momento en que la persona espera sin haber tocado nada y la única ruta donde U1 introduce una lectura nueva antes de pintar. Un número comprobable en ese punto da una señal clara; en el resto del recorrido, la medición manual no aporta nada que el ojo no diga ya.

### NFR8.2 — Ninguna espera artificial en el arranque

- El splash del sistema es el **único** estado de espera. No se construye pantalla de carga propia, ni temporizador de cortesía, ni retardo mínimo.
- El splash termina cuando resuelve la lectura del recuerdo de sesión (F1, paso 2). Ni antes —dejaría ver un formulario a medio decidir— ni después con una espera añadida.
- Mientras el arranque no resuelve, no se pinta Login ni Inicio (F1, paso 5).

**Cómo se verifica**: revisión del código del arranque buscando `setTimeout`, `InteractionManager` o cualquier espera sin causa, y el recorrido en el teléfono: la primera pantalla aparece sin un parpadeo intermedio.

### NFR8.3 — El resto del recorrido sin objetivo numérico

El cambio entre pestañas (F4), el pintado de la tarjeta sembrada (F6) y la respuesta a un toque en Login se juzgan con NFR8 tal como está aprobado: **no se percibe una congelación** al recorrerlos en el teléfono. No se fija mediana, ni percentil, ni umbral en milisegundos, y ninguna prueba automática falla por tiempo.

**Qué sí es exigible sin número**:

- La semilla de Inicio es una constante en memoria: al llegar a Inicio no hay red, ni estado de carga, ni esqueleto (F6, paso 1).
- El cambio de pestaña no rehace la pila de la pestaña destino: cada una conserva su pila y su scroll (F4, paso 4; BR2.2).

## NFR2 — Usabilidad

### NFR2.1 — Cada pantalla, a un toque de la barra

Las cinco pestañas —Inicio, Explorar, Crear, Actividad y Perfil— se alcanzan con **un toque** desde la barra inferior, en el orden fijado y con su etiqueta visible (F4, pasos 1 y 2). Login no muestra barra inferior (BR1.5).

### NFR2.2 — La acción principal, en dos toques o menos

Desde la pantalla en que está, la persona completa la acción principal de U1 sin más de dos toques. En esta unidad las acciones principales son:

| Acción | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Entrar con `demo`/`demo` | Escribir y tocar «Entrar» (1 toque) | Login, F2 |
| Reintentar la entrada tras un fallo de guardado | 1 toque en «Reintentar» | Login, F2 paso 5 |
| Cambiar de pestaña | 1 toque | F4 |
| Ver la tarjeta sembrada | 0 toques: Inicio la pinta al llegar | F6 |

Ninguna tarea del recorrido exige leer una explicación previa ni abrir una pantalla intermedia.

### NFR2.3 — Todo error visible dice qué pasó y ofrece acción

- **Se muestra** → dice qué pasó en lenguaje llano y, si hay algo que reintentar, ofrece «Reintentar».
- **No se muestra** → se registra en la superficie de diagnóstico y no se inventa un aviso (NFR9.2, en `security-requirements.md`).

En U1 el único error visible **con acción** es el fallo de guardado de la sesión: «No pudimos guardar tu sesión. Inténtalo de nuevo.» con el botón en «Reintentar» (F2, paso 5). El error de credenciales no lleva acción propia porque lo que hay que corregir está en los campos y «Entrar» sigue ahí; el fallo de lectura del arranque no se pinta porque la salida es Login (F1, paso 4).

## NFR1 — Fiabilidad

### NFR1.1 — El recorrido termina sin cierres ni pantallas en blanco

Recorrer el tramo de U1 en el teléfono —arranque, Login, Inicio, las cuatro pestañas vacías y volver— **no produce ningún cierre inesperado ni pantalla en blanco**. Es el criterio de terminado que NFR1 fija y el que se demuestra al cerrar el Bolt.

Formas concretas que cuentan como fallo en esta unidad:

- Quedarse en el splash sin resolver (lectura que nunca termina o que no se espera).
- Mostrar Login e Inicio a la vez, o un formulario a medio pintar (invariante de la máquina de estados).
- Cerrar la app al tocar «Entrar» o al cambiar de pestaña.
- Pintar una pestaña vacía sin su título.

### NFR1.2 — Los fallos del almacenamiento no bloquean la app

Ningún fallo del almacenamiento seguro deja a la persona fuera:

| Fallo | Resultado exigido |
|---|---|
| Lectura con valor vacío, corrupto o con `authorId` distinto de `demo` | Login; se intenta borrar el valor inválido (F1, paso 4; BR1.3). |
| Lectura con `503` | Login, sin aviso y sin reintento (enmienda a C3). |
| Guardado con `503` | Se queda en Login con lo escrito y «Reintentar» visible (F2, paso 5). |
| Borrado del recuerdo que falla al cerrar sesión | La app vuelve a Login igualmente y el fallo se registra (F3, caso límite; NFR9.2). |

### NFR1.3 — La semilla no depende de nada

Inicio se pinta con una constante en memoria: sin red, sin credenciales y sin catálogo cargado (F6, paso 8). Si el identificador de la obra no estuviera en el catálogo local, la tarjeta se pinta igual con su título, su artista y el bloque con la inicial, y la portada nunca deja un hueco roto (FR11.3).

## NFR6 — Accesibilidad heredada en este artefacto

NFR6.1–NFR6.3 (contraste, áreas táctiles y tema del sistema) viven en `tech-stack-decisions.md`, donde se decide con qué tokens y con qué configuración se cumplen. Aquí queda el único criterio de accesibilidad que se comprueba recorriendo la navegación y no leyendo los tokens.

### NFR6.4 — El estado nunca se comunica solo por color

La pestaña activa se distingue por color primario **y** icono relleno, y su etiqueta siempre está visible; las inactivas, por `textMuted` e icono de contorno (F4, paso 2). Lo mismo vale para cualquier otro estado que se pinte en esta unidad —el chip de Spotify de Inicio—: si algo cambia de significado, cambia también de forma, de texto o de icono.

**Por qué está aquí y no con los otros NFR6**: no se resuelve eligiendo un token, sino comprobando el renderizado de la barra inferior en los dos temas, con el teléfono en claro y en oscuro. Es el criterio de WCAG que el contraste de NFR6.1 no cubre.

## Presupuesto de rendimiento en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Arranque en frío | ≤ 2 s (mediana de tres) | Cronómetro de mano en el teléfono, al cerrar el Bolt de U1. |
| Resto del recorrido | Sin número; sin congelación perceptible | Recorrido en el teléfono. |
| Semilla de Inicio | Sin espera: constante en memoria | Recorrido en el teléfono y revisión del código. |

## Assumptions & Open Questions

- `[assumption]` El presupuesto de 2 s se mide con Metro sirviendo y el paquete ya cacheado: el tiempo del contenedor Expo Go y de la descarga del paquete no forma parte del objetivo, porque no existe en un binario propio y no lo controla el código de la app.
- `[assumption]` La lectura del recuerdo de sesión en `expo-secure-store` cabe en el presupuesto; ADR-011 la asume algo más lenta que `AsyncStorage` sin cuantificarla. Si no cupiera, la corrección es quitar esperas del arranque, no cambiar de mecanismo.
- `[assumption]` El cronómetro de mano basta para un objetivo de 2 s; no se introduce instrumentación de arranque en esta versión (NFR9 no tiene panel ni telemetría).
- **Open question para U2–U5**: cuando lleguen los estados de carga reales (feed, búsqueda, portada), el criterio sigue siendo NFR8 sin número; si alguna unidad quisiera añadir un presupuesto, lo decide en su propia etapa de NFR.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR8, RC-01, RC-04, RC-05).
- `decisions` — `inception/domain-design/decisions.md` (ADR-009, ADR-010, ADR-011).
- `functional-spec` — `construction/u1-app-skeleton/functional-design/functional-spec.md` (F1, F2, F4, F6).
- `rules` — `construction/u1-app-skeleton/functional-design/rules.md` (BR1.2, BR1.3, BR1.5, BR2.1, BR2.2, BR3.1, BR3.3).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C2, C3 y § Revisión 9 de C3).
- `nfr-requirements-questions` — `construction/u1-app-skeleton/nfr-requirements/nfr-requirements-questions.md` (Q2 = C, confirmado).
