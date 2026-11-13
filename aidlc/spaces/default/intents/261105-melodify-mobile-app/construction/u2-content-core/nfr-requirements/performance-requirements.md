# Requisitos de rendimiento, usabilidad y fiabilidad — U2 `u2-content-core`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR6, NFR8, FR11, RC-02, RC-03, RC-05), de `construction/u2-content-core/functional-design/functional-spec.md` (F7–F12, § Semilla, § Máquina de estados, § Precisión a C2), de `construction/u2-content-core/functional-design/rules.md` (BR4.2, BR5.3, BR5.4, BR7.5, BR8.4, BR9.x, BR10.x) y de `inception/contract-design/contract-summary.md` (C1, C2, C4, C5, C6 y § Revisiones 12 y 13).
> Fecha: 2026-11-12. Etapa: NFR Requirements · Unidad: `u2-content-core` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

La etapa emite tres artefactos para esta unidad: este, `security-requirements.md` y `tech-stack-decisions.md`, más `traceability.json`.

Cada requisito hereda su NFR de origen y añade un subnúmero (`NFR8.4`). El identificador es estable: Code Generation y Build and Test se refieren a él por ese nombre. La numeración continúa la de U1, así que un `NFR8.4` no se repite entre unidades.

**Qué pasa con cada artefacto filtrado.** `scalability-requirements.md`, `reliability-requirements.md` y `observability-requirements.md` **no se producen aquí**: la unidad es de tipo `ui` y el motor los filtra por `produces_kinds`. Sus objetivos no se pierden: la fiabilidad de NFR1 queda en este archivo y la observabilidad de NFR9, en `security-requirements.md` § Diagnóstico. **La escalabilidad no tiene nada que absorber**: `requirements.md` no fija ningún objetivo de escalabilidad y esta unidad tampoco los introduce —el contenido vive en memoria, no hay servidor y la app la usa una persona (RC-02, RC-03)—.

**Qué cambia respecto a U1 en la naturaleza de los datos.** U1 pintaba una constante. U2 pinta datos que se **leen, se suscriben y cambian**: el feed se reemite cuando cambia el contenido, la portada se decide con la sesión y la conectividad, y el detalle resuelve una obra. Eso es lo que introducen los requisitos de abajo; ninguno añade un número que NFR8 no tenga ya aprobado.

## NFR8 — Rendimiento

NFR8 dice: «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». U1 abrió una sola excepción —el arranque en frío— porque era la única ruta con una lectura nueva antes de pintar. **U2 no abre ninguna**: sus lecturas son de memoria y su única espera es la resolución del `viewerId`, que ya ocurre en el arranque de U1. Lo que sí fija esta unidad son las condiciones que hacen que la espera no exista por diseño.

### NFR8.4 — El feed no espera a nadie: la siembra se pinta desde memoria

- La primera emisión de `contentStore.subscribeContent(viewerId)` llega **en el mismo tick** en que el hook se suscribe, con la siembra ya construida; no hay promesa que resuelva, ni red, ni credencial (F7, paso 3; BR4.2).
- El esqueleto cubre **el primer render**, hasta la primera emisión: el hook arranca en `loading` y la suscripción se establece en el efecto, así que hay un fotograma sin datos aunque el `viewerId` ya esté resuelto (F7, paso 2; `functional-spec.md` § Máquina de estados de una pantalla). Lo único que puede **prolongar** esa espera más allá de ese fotograma es que el `viewerId` no haya llegado todavía (`appSession.getSession()`), y mientras tanto se sigue en `loading` (BR10.3). Cuando llega, la pantalla pasa a `ready` en la misma emisión.
- **No se construye** una espera de cortesía para que el esqueleto «se vea»: el esqueleto es un estado real, no una animación (misma regla que NFR8.2).

**Cómo se verifica**: prueba de `InicioScreen` con el `viewerId` ya resuelto y **sin avanzar ningún temporizador**: tras el primer efecto, el feed está en `ready` con la siembra; ninguna prueba necesita `jest.useFakeTimers` para verlo, y una revisión del hook no encuentra `setTimeout` ni `setInterval`.

### NFR8.5 — Las consultas al catálogo no se multiplican

- `useCatalog` se suscribe **una vez** a `catalog.subscribe` y guarda en estado el catálogo junto con **un contador de versión que incrementa en cada emisión** (C5 no publica revisión; el contador es del hook y es lo que hace repintar las portadas) (BR7.10).
- Cada pantalla construye el `OpinionCardModel` de sus opiniones con **una consulta a `coverFor(workId)` por opinión** —es lo que fija F12, paso 1— y ese mapeo se **memoiza por revisión de contenido y contador de versión del catálogo**: al repintar sin que ninguno de los dos cambie no se añaden llamadas. La tarjeta recibe el modelo ya resuelto y nunca llama a `coverFor` por su cuenta. **Esta frase sustituye la lectura literal de F7, paso 3** («cada tarjeta pide su portada a `Catalog`»): la petición la hace el mapeo de la pantalla con `toOpinionCardModel`, una vez por opinión, y la tarjeta solo pinta el modelo.
- `coverFor` no toca la red en U2: sin `SpotifyResolvePort` la decisión es local (bloque de inicial o la `coverUrl` ya sembrada) (BR5.3, C5 1.1.0). En U4, cuando la decisión sí consulte a Spotify, sigue habiendo una consulta por opinión y ninguna por repintado.
- `countOpinions` y `listOpinions` son de memoria; el detalle de obra los pide **una vez** al abrirse, no por cada tarjeta (F9, paso 3).

**Cómo se verifica**: con un `catalog` doble que cuenta llamadas, y la siembra de 10 opiniones: **una** suscripción, **diez** llamadas a `coverFor` al construir el feed y **ninguna más** al repintar sin cambio de revisión de contenido ni de contador de versión; cero llamadas a `coverFor` desde dentro de `OpinionCard`. Prueba del detalle que comprueba que el hook no vuelve a leer al cambiar la revisión del feed salvo que cambie la obra.

### NFR8.6 — El resto del recorrido sigue sin número

Abrir un detalle, volver y cambiar de pestaña se juzgan con NFR8 tal como está aprobado: **no se percibe una congelación** al recorrerlo en el teléfono. No se fija mediana, ni percentil, ni umbral en milisegundos, y ninguna prueba automática falla por tiempo.

### NFR8.7 — El feed se pinta con `FlatList`

El feed de Inicio usa `FlatList` de React Native, que virtualiza por defecto y no añade dependencia; ninguna pantalla de la unidad implementa su propia lista para el feed (TS-22). Con 8–10 tarjetas no cambia nada perceptible, pero fija la pieza antes de que U4 (resultados de búsqueda) y U5 (Actividad) inventen cada una la suya. Las consultas al catálogo no se cubren aquí: están en NFR8.5.

**Cómo se verifica**: revisión de `InicioView` (un `FlatList` con su `keyExtractor` y su `ListEmptyComponent`) y prueba de render con la siembra.

## NFR2 — Usabilidad

### NFR2.4 — Las acciones de esta unidad, en dos toques o menos

| Acción | Toques desde que se ve la pantalla | Dónde |
|---|---|---|
| Abrir una opinión del feed | 1 toque en la tarjeta | Inicio, F8 |
| Volver del detalle a la misma posición del feed | 1 toque en «‹ Volver» (o atrás del sistema) | F8, paso 6 |
| Abrir el detalle de una obra | 1 toque, cuando U4 le dé entrada; en U2 solo desde prueba | F9 |
| Ver Perfil | 1 toque en la barra | F10 |
| Reintentar el feed o una portada fallida | 1 toque en «Reintentar» | F7 paso 6 (fallo de lectura) y paso 7 con F12 (metadatos) |
| Cerrar sesión | 2 toques: Perfil → «Cerrar sesión» | F10, paso 7 |

### NFR2.5 — Todo error visible dice qué pasó y ofrece acción

Con la misma regla que NFR2.3, aplicada a las cuatro pantallas de U2:

- **Se muestra** → lenguaje llano y «Reintentar»: fallo de lectura del feed, del detalle o de Perfil (F7, F9, F10) y banner de metadatos «No pudimos actualizar las portadas.» con «Reintentar» (F12).
- **No se muestra** → se registra en el logger y no se inventa un aviso (NFR9.4, en `security-requirements.md`).
- **Sin conexión** no es un error de la app: es un aviso informativo bajo la cabecera de cada pantalla, sin acción propia, porque lo que hay que hacer no está en la pantalla (FR11.4, F11; NFR1.6).

### NFR2.6 — El estado se dice con palabras, no con un icono mudo

El chip de la cabecera de Inicio dice «Conectado» o «Conectar» en texto (BR7.9); es el único sitio que pinta el estado de Spotify, y la tarjeta **no** lleva chip. En la tarjeta, lo que no depende del color es la etiqueta «Tu opinión» (NFR6.6) y la portada caída, que se resuelve con el bloque de inicial y no con un icono de advertencia (NFR1.5). Es la lectura de NFR2 aplicada a los estados que esta unidad introduce.

## NFR1 — Fiabilidad

### NFR1.4 — Ninguna pantalla se queda en blanco

Cada una de las cuatro pantallas nace en `loading`, pasa a `ready` o a `error`, y `empty` es una variante de `ready` (F7–F10; BR10.4). Formas concretas que cuentan como fallo en esta unidad:

- Un feed vacío sin su `EmptyState` y su acción «Crear opinión».
- Un detalle que se queda cargando porque la obra no está en el catálogo: `getWork` con `404` cae al título y artista de la opinión y pinta el bloque con la inicial (BR5.2).
- Un Perfil que se queda cargando porque `getAuthor` devuelve `422` por falta de `viewerId`: con `viewerId` nulo el hook no llama y la pantalla está en `loading` hasta que llega (C4 § Revisión 12).
- Un error pintado sin su «Reintentar» o con un código técnico.

### NFR1.5 — Una portada caída no deja hueco roto

Si la decisión de portada es `initialBlock`, la tarjeta y la cabecera de obra pintan el bloque con la inicial **con el mismo tamaño que la portada** y el resto de la tarjeta se ve completo (FR11.3; BR5.4, BR8.7). Ningún estado de U2 deja un cuadrado gris, un icono de imagen rota ni un espacio reservado vacío.

**Cómo se verifica**: prueba de `OpinionCard` y de `WorkHeader` con `coverFor` en `initialBlock`; recorrido en modo avión (F11).

### NFR1.6 — Sin conexión se conserva lo cargado

Al perder la red, la app **no** vacía el feed ni el detalle: se conserva lo último emitido por el almacén, las portadas caen a bloque y el aviso aparece bajo la cabecera (FR11.4; BR7.6, BR6.2). **El aviso lo pinta cada pantalla bajo su propia cabecera**, con la pieza `Banner` y el texto único; la cáscara no lo pinta —las raíces de pestaña llevan su `AppHeader` dentro de la pantalla y un banner de la cáscara quedaría encima de la cabecera— y por eso no hay duplicado aunque cuatro pantallas lean `useNetwork` (C2, § Revisión 13; `functional-spec.md` § Precisión a C2). Al recuperar la red, el aviso desaparece y las portadas vuelven si la decisión lo permite; no hace falta reintentar a mano.

### NFR1.7 — La navegación no pierde el estado de la pantalla de abajo

Abrir un detalle y volver devuelve a la pestaña de origen con su desplazamiento, porque la cáscara mantiene montada la raíz y oculta la entrada de debajo (AC2.3.2; BR10.1, C2 1.2.0). Un fallo de esta regla se ve como feed reiniciado arriba del todo y cuenta como incumplimiento de NFR1, no solo de AC2.3.2.

### NFR1.8 — Una sola fuente por dominio, sin contexto intermedio

El almacén (C4), el catálogo (C5), la conectividad (C6) y la sesión (C3) son la única fuente de su dominio; **no se copian a un contexto de React ni a un segundo almacén** (TS-18). Cada hook de `app/src/state/` mantiene en su propio estado lo último que emitió la fuente —una copia de lectura, no una segunda verdad— y se da de baja al desmontarse, así que dos pantallas que lean el mismo dominio ven la misma emisión. La consecuencia comprobable es que no hay `createContext` en `app/src/state/` y que ninguna pantalla construye su propio almacén.

**Cómo se verifica**: revisión de `app/src/state/` (sin `createContext`, sin `createContentStore`/`createCatalog`/`createConnectivity` fuera de `bootstrap/instances.ts`) y prueba de dos pantallas montadas a la vez que reciben la misma emisión.

## NFR6 — Accesibilidad

NFR6.1–NFR6.3 (contraste, áreas táctiles y tema del sistema) se cumplen con los tokens y la configuración ya decididos en U1 (`tech-stack-decisions.md` de la unidad anterior, TS-14 y TS-15); esta unidad **no añade colores ni tipografías**. Lo que se comprueba aquí es el renderizado de las piezas nuevas.

### NFR6.5 — «‹ Volver» es un objetivo táctil completo, no un carácter

El botón de volver de la cabecera de detalle mide al menos **44×44** de área táctil y su texto visible es «‹ Volver». El glifo «‹» por sí solo no es el objetivo: si el `TextButton` no llegara a 44 de alto, se amplía su área de toque, no su texto. **No se añade etiqueta de lector de pantalla**: `requirements.md` NFR6 cierra la accesibilidad en esta versión con «Las etiquetas de lector de pantalla quedan fuera de esta versión», y esta unidad no abre esa excepción.

### NFR6.6 — El estado nunca se comunica solo por color

- La tarjeta propia se distingue por fondo **y** por la etiqueta «Tu opinión» dentro de la tarjeta (BR8.4), no solo por el `primaryContainer`.
- El aviso de sin conexión lleva texto; la portada caída lleva su inicial; el chip de Spotify lleva su palabra.
- En los dos temas, el contraste de la etiqueta «Tu opinión» sobre `primaryContainer` y de la línea de fechas sobre el mismo fondo cumple 4.5:1 (NFR6.1); «Editar» cumple como texto de acción.

**Cómo se verifica**: prueba de render de la tarjeta `own` que comprueba la etiqueta, no solo el color; recorrido con el teléfono en claro y en oscuro.

## Presupuesto de rendimiento en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Feed (Inicio) | Sin número; sin espera artificial: la siembra llega en la misma suscripción | Prueba de la primera emisión y recorrido en el teléfono. |
| Portadas | Sin número; ninguna consulta por tarjeta | Prueba con doble que cuenta llamadas. |
| Detalles, Perfil y cambio de pestaña | Sin número; sin congelación perceptible | Recorrido en el teléfono. |
| Arranque en frío | Se mantiene el ≤ 2 s de NFR8.1; U2 no añade lectura nueva al arranque | Cronómetro, si se vuelve a medir al cerrar el Bolt. |

## Assumptions & Open Questions

- `[assumption]` El arranque no empeora: U2 construye `contentStore`, `connectivity` y `catalog` al cargar el módulo de instancias, sin lectura de disco ni petición de red. Si la construcción del almacén se notara en el arranque, se difiere a la primera pantalla que lo use, no se sube el presupuesto de 2 s.
- `[assumption]` Las pruebas no miden tiempo: el criterio de NFR8 sigue sin número y ninguna prueba automática falla por duración.
- **Open question para U4**: la primera resolución real de portadas sí tocará la red y tendrá su propia espera; si U4 quiere un presupuesto para ella, lo decide en su etapa de NFR y no se hereda de aquí.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR6, NFR8, FR11, RC-02, RC-03, RC-05).
- `functional-spec` — `construction/u2-content-core/functional-design/functional-spec.md` (F7–F12, § Semilla, § Máquina de estados de una pantalla).
- `rules` — `construction/u2-content-core/functional-design/rules.md` (BR4.2, BR5.2–BR5.4, BR6.2, BR7.4–BR7.6, BR7.10, BR8.4, BR8.7, BR8.9, BR10.1, BR10.3, BR10.4).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.2.0, C2 1.2.0 con la invariante del aviso corregida en la revisión 13, C4, C5 1.1.0, C6 1.0.0, § Revisiones 12 y 13).
