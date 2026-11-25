# Decisiones de pila técnica — U3 `u3-create-react`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7, RC-01, RC-03, RC-05), de `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.3.0, C2 1.3.0, C4 1.2.0, C5 y § Revisión 15), de `construction/u3-create-react/functional-design/functional-spec.md` (§ Contratos, § Enmienda a C2, § Enmienda a C4) y de `construction/u3-create-react/functional-design/frontend-components.md` (§ Paquetes, § `app/src/state/`, § `app/src/comments/`, § `app/src/bootstrap/`).
> Fecha: 2026-11-15. Etapa: NFR Requirements · Unidad: `u3-create-react` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-23`…, continuando la numeración de U2, que terminó en `TS-22`), el objetivo no funcional que sirve y las alternativas que se descartaron. Lo que U1 y U2 ya decidieron no se repite: **TS-01 (Expo SDK 57 exacto), TS-02 (`strict`), TS-03 (monorepo), TS-07 (StyleSheet y tokens), TS-10 (Jest y `jest-expo`), TS-11 (ESLint, Prettier y CI), TS-13 (solo Expo Go), TS-14 (tokens con contraste), TS-15 (tema del sistema), TS-16 (`expo-network` aislado), TS-17 (paquetes con `src/index.ts`), TS-18 (fábricas y una sola instancia), TS-19 (`useEffect` + `useState` sobre suscripciones), TS-20 (reloj inyectable), TS-21 (puertos en `@melodify/catalog`) y TS-22 (`FlatList`) siguen vigentes y esta unidad los hereda sin reabrirlos.**

**La regla que gobierna el resto**: todo lo que entre aquí tiene que correr dentro de **Expo Go** en un teléfono Android **sin compilación propia** (RC-01, NFR7). Un módulo que exija `prebuild` queda fuera, por bueno que sea. U3 **no añade ninguna dependencia nueva**: sus ocho piezas de interfaz se construyen con React Native y los tokens que ya existen.

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-23 | La hoja de comentarios usa `Modal` + `KeyboardAvoidingView` de React Native, sin librería de hojas | NFR7, NFR6 |
| TS-24 | Las ocho piezas nuevas viven en `@melodify/design-system` (C1 1.3.0); `OfflineBanner` se queda en la app | NFR5, NFR2 |
| TS-25 | El borrador vive en `CrearScreen`; `formKey` lo reinicia y la cáscara no guarda texto | NFR5, NFR3 |
| TS-26 | `useCardActions` centraliza las cuatro acciones de tarjeta con el `viewerId` de la sesión | NFR3, NFR5 |
| TS-27 | `createCommentsController` inyectado en los servicios de la cáscara; `submit` devuelve `boolean` | NFR5, NFR1 |
| TS-28 | Los dos topes (500 y 300) son constantes exportadas por C4, no literales repetidos | NFR3, NFR5 |
| TS-29 | Temporizadores propios (`setTimeout` con limpieza) para los 400 ms y los 4 s; sin librería de debounce | NFR8, NFR7 |
| TS-30 | La validación del formulario es una función pura compartida por publicar y editar | NFR5, NFR1 |

## Requisitos derivados de esta unidad

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR2.7 | Las acciones de escritura se alcanzan en dos toques o menos desde su pantalla | TS-23, TS-26 |
| NFR2.9 | El estado se dice con palabras: «Seguir autor»/«Siguiendo», «n de 5», «Ya opinaste sobre esta obra.» | TS-24 |
| NFR1.10 | Un fallo de escritura conserva el texto y el reintento envía lo mismo | TS-25, TS-27, TS-30 |
| NFR3.12 | El `authorId` de toda escritura sale de la sesión, no del formulario | TS-26 |
| NFR3.14 | El texto se pinta como texto y los topes se validan en el campo y en C4 | TS-28, TS-30 |
| NFR4.7 | El borrador, la opinión y el comentario viven en memoria y se pierden al recargar | TS-25, TS-27 |
| NFR5.8 | La cobertura se mide por árbol a 80 % de líneas, incluidos los paquetes que U3 modifica | TS-24, TS-27 |
| NFR5.9 | Cada pieza y cada hook nuevos llegan con su prueba en esta misma unidad | TS-24, TS-27 |
| NFR6.7 | Estrellas, ✕, «Enviar» y acciones de tarjeta con área táctil de 44×44 | TS-24 |
| NFR6.8 | El foco entra en el campo al abrir la hoja y vuelve a «💬» al cerrar | TS-23 |
| NFR7.6 | La hoja y el formulario corren en Expo Go sin módulo nativo | TS-23, TS-29 |
| NFR8.9 | Una petición de búsqueda por pausa de 400 ms, con cancelación y descarte de respuestas tardías | TS-29 |

## NFR7 — Compatibilidad: Expo Go en Android

### NFR7.6 — La hoja y el formulario corren en Expo Go sin módulo nativo

- **Ninguna dependencia nueva.** U3 no añade una sola entrada a los `package.json` de la app ni de los cuatro paquetes que toca; las ocho piezas y los tres hooks se escriben con React Native y con los tokens de C1 (TS-24, TS-29).
- **Solo API del framework.** La hoja usa `Modal`, `Pressable` y `KeyboardAvoidingView`, los tres dentro de React Native; el arrastre, si se implementa, usa `PanResponder` (TS-23). Nada de `react-native-reanimated`, `react-native-gesture-handler`, `@gorhom/bottom-sheet` ni `react-native-modal`: son módulos que atan la app a una versión del SDK y que RC-01 deja fuera del alcance.
- **Los temporizadores son del entorno.** Los 400 ms de la búsqueda y los 4 s del snackbar usan `setTimeout` del propio runtime (TS-29), que existe igual en Expo Go y en Node para las pruebas.
- **Cómo se comprueba**: `npm run typecheck`, `npm run lint` y `npm test` en verde, y el recorrido en Expo Go sobre el teléfono Android con `npx expo start`: abrir Crear, escribir, tocar estrellas, abrir la hoja y enviar un comentario. Si algo exigiera `prebuild`, el recorrido no arrancaría en Expo Go y la unidad no se cierra.

### TS-23 — La hoja con el `Modal` de React Native

| Aspecto | Decisión |
|---|---|
| **Pieza** | `Modal` de React Native con `transparent`, `animationType="slide"` y `onRequestClose` para el atrás de Android. El velo es un `Pressable` que cierra, y el contenido va dentro de un `KeyboardAvoidingView`. |
| **Alto** | Máximo **70 %** de la pantalla, con la lista en scroll interno y el campo siempre visible por encima del teclado (`functional-spec.md` § La hoja de comentarios). |
| **Foco** | `autoFocus` en el campo al abrir; al cerrar, el foco vuelve al «💬» que la abrió, que es quien lo recibe de nuevo al desmontarse el modal. |
| **Dónde se pinta** | Una sola vez, en la cáscara, a partir de `services.comments`; ninguna pantalla monta su propia hoja (BR14.3). |
| **Cómo se prueba** | `@testing-library/react-native` monta el `Modal` en el árbol de prueba; las pruebas comprueban estados y textos, no la animación. |

**Por qué no una librería de hojas** (`@gorhom/bottom-sheet`, `react-native-modal`): las dos añaden dependencia y la primera exige `react-native-reanimated` y `react-native-gesture-handler`, que en Expo Go funcionan pero atan la hoja a una versión concreta del SDK. Lo que piden los mockups —velo, cierre por velo, arrastre, alto del 70 %— se consigue con `Modal` y `PanResponder` si el arrastre se implementa; el arrastre es opcional y no bloquea ninguna AC.

**Alternativas descartadas**: una pantalla apilada en lugar de una hoja (rompe AC7.2.1: la hoja se abre **sobre** la pantalla sin cambiarla); un `View` absoluto dentro de la pantalla (quedaría por debajo de la barra y no cubriría el resto de la app).

## NFR5 — Mantenibilidad

### NFR5.8 — El suelo de cobertura se mantiene por árbol, no se reparte

- `contract-summary.md` § Estructura del monorepo fija un 80 % de líneas **por árbol**, con una entrada de `coverageThreshold` por ruta. U3 toca cuatro: `./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**` y `./packages/content-store/src/**`. Las cuatro siguen a 80 y **ninguna se baja** para hacer pasar la etapa.
- Un paquete no se compensa con otro ni con el total del monorepo: las ocho piezas nuevas de C1 y el controlador de comentarios de la app tienen que cubrirse por sí mismos (TS-24, TS-27).
- **Cómo se comprueba**: `npm test -- --coverage` y lectura del resumen por ruta; un árbol por debajo de 80 hace fallar la puerta de CI (`.github/workflows/ci.yml`), no un aviso.

### NFR5.9 — Cada pieza y cada hook nuevos llegan con su prueba en la misma unidad

- Cada una de las ocho piezas de C1 llega con una prueba de render en `packages/design-system/src/**`; cada hook nuevo (`useCrear`, `useWorkSearch`, `useCardActions`) con la suya en `app/src/**`; el controlador de comentarios con las de sus seis estados en `app/src/comments/**`; y C4 con las dos validaciones de `422` (TS-28).
- `team.md` § Testing Posture prohíbe las aserciones que siempre pasan: las pruebas de pantalla afirman el estado que describen —«el botón está deshabilitado», «el texto sigue en el campo»— y no solo que el componente monta.
- **Cómo se comprueba**: revisión del árbol de pruebas junto a cada pieza, y `npm test` sin `--passWithNoTests` en ninguna ruta nueva.

### TS-24 — Las ocho piezas nuevas en C1, la app solo compone

- `SearchField`, `ConnectionCard`, `WorkResultRow`, `RatingInput`, `MultilineField`, `SecondaryButton`, `CommentSheet` y `Snackbar` se publican en `@melodify/design-system` (C1 1.3.0). `CrearView` las usa y **no** construye estilos de formulario por su cuenta; `OpinionCard` y `SocialActionBar` ganan las props opcionales de la revisión 15 y siguen siendo las únicas que pintan una opinión.
- `OfflineBanner` **no** sube a C1: su texto es de esta versión y su acción pide reintentar portadas, dos cosas que el sistema de diseño no tiene por qué conocer. Se queda en `app/src/components/` y gana `message?: string` y `onRetry?: () => void`, con el texto de U2 como valor por defecto.
- **El suelo de cobertura se respeta tal como lo mide el contrato**: 80 % de líneas **por árbol**, con una entrada de `coverageThreshold` por ruta. U3 toca `./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**` y `./packages/content-store/src/**`; las cuatro entradas siguen a 80 y **no se baja ninguna** para hacer pasar la etapa.
- Cada pieza nueva llega con su prueba de render en el paquete, y cada hook nuevo (`useCardActions`, `useWorkSearch`, `useCrear`) con la suya en `app/src/**`. `team.md` § Testing Posture prohíbe las aserciones que siempre pasan: las pruebas de pantalla comprueban el estado que afirman, no solo que el componente monta.

**Alternativas descartadas**: dejar las ocho piezas en `app/src/components/` (la app no podría probarlas sin montar una pantalla y U4/U5 las reimplementarían); publicarlas en un paquete nuevo `@melodify/forms` (una frontera más para ocho piezas que ya caben en el sistema de diseño).

### TS-25 — El borrador vive en `CrearScreen`, no en la cáscara

| Aspecto | Decisión |
|---|---|
| **Dónde vive** | En `CrearScreen`, dentro del hook `useCrear`. Guarda obra, texto y valoración; el texto de la hoja lo guarda la propia hoja. |
| **Cómo se reinicia** | `entry.formKey` cambia en cada `openCreate`, `openEdit` y visita a la pestaña. El contenedor compara la clave y, si cambió, descarta el borrador y recarga el modo. |
| **Qué no guarda la cáscara** | Ningún texto. La cáscara solo escribe `CreateEntry` (modo, obra, opinión, `returnTo`, `formKey`) y monta la pantalla. |
| **Por qué** | El borrador es estado de una pantalla que se desmonta; subirlo a la cáscara obligaría a limpiarlo a mano en cada salida y a sincronizarlo con el atrás. `formKey` es una marca, no un almacén. |

**Alternativas descartadas**: guardar el borrador en C4 como «opinión en curso» (el almacén dejaría de ser el contenido publicado y habría que inventar un estado que ninguna operación declara); guardarlo en un contexto de React (ADR-005 lo usó para el estado local de la app, pero aquí basta el estado de la pantalla, y un contexto daría una segunda verdad sobre lo escrito).

### TS-26 — `useCardActions`: una sola copia del cableado de las acciones

- `useCardActions()` devuelve `actionsFor(opinion: OpinionView)`: `onLike`, `onComment`, `onFollow`, `onEdit`. Las cuatro pantallas que U3 cablea (Inicio, Detalle de obra, Detalle de opinión y Perfil) piden el paquete y se lo pasan a la tarjeta; ninguna vuelve a cablear `toggleLike` ni `toggleFollow`.
- En la opinión propia devuelve solo `onComment` y `onEdit`; el me gusta no se ofrece (Q3 = A) y el seguimiento tampoco, porque no se sigue a uno mismo.
- El `viewerId` sale de `useViewerId`; sin identidad resuelta devuelve objetos vacíos y los controles quedan sin efecto, en lugar de enviar una escritura sin autor (NFR3.12).
- Las confirmaciones y los avisos de fallo los pide este hook con `showSnackbar({ message })`, con los textos exactos de `functional-spec.md` § Textos exactos. La pantalla no pinta el snackbar.

**Alternativas descartadas**: repetir el cableado en las cuatro pantallas (cuatro copias del mismo error y del mismo texto); poner las acciones en `OpinionCard` (la tarjeta recibiría servicios y dejaría de ser una pieza de C1).

### TS-27 — `createCommentsController` en `app/src/comments/`

- Una fábrica `createCommentsController({ content, session })` que devuelve la forma de `ShellServices.comments`: `state`, `subscribe`, `open`, `close`, `retry` y `submit`.
- `submit(text)` recorta, valida el tope, llama a `content.addComment` con el `authorId` de `appSession.getSession()`, actualiza la lista y **devuelve `boolean`**; no conoce el snackbar ni la navegación. La cáscara pide `showSnackbar({ message: 'Comentario publicado' })` cuando el resultado es `true` (C2 1.3.0).
- Se construye **una sola vez** en `app/src/bootstrap/comments.ts`, junto al resto de instancias (TS-18), y se inyecta en la cáscara como un servicio más.
- El controlador es quien conoce el tope: rellena `CommentSheetState.maxLength` con `MAX_COMMENT_LENGTH` y `CommentSheetState.counterFrom` con el umbral de BR14.5 (250), de modo que la hoja recibe las dos cifras como props y ni el sistema de diseño ni la cáscara importan el almacén (TS-28).
- `retry()` relee la lista; es el reintento de lectura, distinto del reenvío con `submit(texto)` que ofrece la hoja cuando `failed` está activo.

**Alternativas descartadas**: dejar la lógica de la hoja en `AppShell` (la cáscara crecería con reglas de negocio y no podría probarse sin montar toda la app); inyectar `showSnackbar` en el controlador (el controlador pasaría a conocer la interfaz y la navegación).

### TS-28 — Los dos topes son constantes de C4, y llegan a la hoja por el controlador

- `@melodify/content-store` exporta `MAX_OPINION_LENGTH = 500` y `MAX_COMMENT_LENGTH = 300` en su superficie (`src/index.ts`), y **valida con ellos** en `createOpinion`, `updateOpinion` y `addComment`: por encima, `422` (C4 1.2.0). Las dos constantes quedan registradas en el contrato, porque son superficie nueva de C4.
- `CrearView` los importa para `maxLength` y `counterFrom` de su `MultilineField` (contador desde 400 de 500). Es la app quien los lee; C1 no los conoce.
- **La hoja no importa C4.** `CommentSheet` es una pieza de C1 y C1 no depende de C4 en ninguna dirección. El número le llega como prop: la pieza gana `counterFrom?: number` junto al `maxLength?` que ya declara el contrato, y quien se los pasa es la cáscara, leyéndolos de `CommentSheetState`. Ese estado gana `maxLength` y `counterFrom`, que rellena `createCommentsController` con las dos reglas que ya existen: el tope, de `MAX_COMMENT_LENGTH` (300), y el umbral visible, el de BR14.5 (250). Así el número se escribe una sola vez —el tope en C4— y ni C1 ni C2 lo repiten ni lo importan.
- El campo protege a la persona (no acepta el carácter 501 ni el 301) y el almacén protege al contrato (`422` si una llamada directa los supera); ninguna de las dos capas decide el número por su cuenta.

**Alternativas descartadas**: declarar el 500 y el 300 en la app y en el paquete por separado (dos literales que se desincronizan en la primera revisión); poner el tope solo en el campo (una llamada directa a C4 guardaría lo que el formulario prohíbe, que es lo que Q1 = B y Q2 = A cerraron); que `CommentSheet` importe las constantes de C4 (crearía una arista C1 → C4 que el contrato no declara y metería el almacén dentro del sistema de diseño); que C1 repita el 300 como valor por defecto de `maxLength` (el mismo número en dos sitios).

### TS-30 — Una función pura de validación, compartida por publicar y editar

`validateOpinionDraft({ workId, text, rating })` es una función pura en `app/src/screens/crear/` que devuelve qué falta (`work`, `text`, `rating`). La usan «Publicar» y «Guardar», de modo que las dos rutas comprueban lo mismo (BR12.7). Se prueba sola, sin montar la pantalla, y la vista solo lee su resultado para habilitar el botón.

**Alternativas descartadas**: duplicar la condición en cada botón (dos verdades sobre cuándo se puede enviar); validar solo al enviar (el botón quedaría habilitado con el formulario incompleto y el error llegaría después de tocar).

## NFR8 — Los dos temporizadores

### TS-29 — `setTimeout` propio, con limpieza, sin librería

- **Búsqueda**: `useWorkSearch` guarda el identificador del temporizador, cancela el anterior en cada pulsación, dispara a los 400 ms y limpia en el `return` del efecto y al desmontar. Una respuesta tardía se descarta comparando la consulta con la vigente.
- **Snackbar**: la cáscara guarda el mensaje y arranca un temporizador de 4 s que se cancela si llega otro mensaje, si cambia la pestaña o si la cáscara se desmonta.
- Los dos se prueban con `jest.useFakeTimers()` **dentro de la prueba que los mide**, nunca global: TS-20 sigue vigente y el reloj del almacén es inyectable por su cuenta.

**Alternativas descartadas**: `lodash.debounce` o `use-debounce` (dependencia nueva para veinte líneas); animar el snackbar con `Animated` (no aporta y complica la prueba).

## NFR6 — Accesibilidad

No hay decisión nueva de tokens: se usan los de TS-14.

### NFR6.7 — Todo control nuevo tiene 44×44 y su estado se dice con palabras

- Las cinco estrellas de `RatingInput` son cinco objetivos de **44×44**; el grupo no estrena roles ni etiquetas de lector de pantalla, porque **NFR6 aprobado deja las etiquetas accesibles fuera de esta versión**.
- La ✕ de la hoja, el botón «Enviar» y la ✕ que limpia la búsqueda son de **44×44**, igual que las acciones de la tarjeta (NFR6.2 de U1).
- La valoración y el seguimiento no dependen solo del color: debajo de las estrellas se lee «Sin valorar» o «n de 5», y el botón de seguir dice «Seguir autor» o «Siguiendo» (NFR2.9).
- Las etiquetas accesibles que U1 y U2 ya declararon en la tarjeta —incluida la de seguir de `OpinionCard`— se conservan tal cual, porque no son nuevas: esta unidad no añade ninguna ni cambia las existentes.
- Si el contraste de las estrellas seleccionadas o del texto de error no llega a 4.5:1, se corrige el par de tokens en C1 y se anota en el contrato; no se elige un color a ojo en la pantalla (misma regla que U2).
- **Cómo se comprueba**: prueba de `RatingInput` que comprueba el área táctil declarada de cada estrella y el texto de valoración visible; revisión de contraste con los pares de tokens de TS-14.

### NFR6.8 — El foco entra en el campo y vuelve a donde estaba

- Al abrir la hoja, el foco entra en el campo de comentario (`autoFocus`, TS-23), de modo que la persona escribe sin un toque extra.
- Al cerrarla —por ✕, por velo o por atrás de Android—, el foco vuelve al «💬» que la abrió, que lo recupera al desmontarse el modal y sigue en pantalla.
- El orden de lectura de `CrearView` es el del flujo: búsqueda, obra elegida, texto, valoración, «Publicar»; el aviso de error se anuncia en el punto donde está el botón.
- Las etiquetas de lector de pantalla siguen fuera de esta versión (NFR6 aprobado), salvo las etiquetas de acción que ya existen en la tarjeta.
- **Cómo se comprueba**: prueba de `CommentSheet` que comprueba que el campo recibe el foco al montarse; recorrido en el teléfono que comprueba que el teclado no tapa el campo ni el botón.

## Versiones y fijación

| Paquete | Versión que publica U3 | Por qué |
|---|---|---|
| `@melodify/design-system` | **1.3.0** | Ocho piezas nuevas y cuatro adiciones opcionales: las tres que declara el diseño (`SocialActionBar.showLike?`, la etiqueta de seguir de `OpinionCard`, `CommentSheet.failed?`/`snackbar?`) más `CommentSheet.counterFrom?`, que añade esta etapa para que el umbral del contador de la hoja llegue como prop y C1 no importe C4. |
| `@melodify/app-shell` | **1.3.0** | `CreateEntry.formKey`, `CommentSheetState.failed` y `CommentSheetState.maxLength`/`counterFrom` (las dos cifras que la hoja pinta, rellenas por el controlador), el cierre de Crear que conserva la pila, el atrás que cancela, `submit` devolviendo `boolean` y los dos montajes reales. |
| `@melodify/content-store` | **1.2.0** | Los dos topes con su `422`, las constantes exportadas y sus pruebas. |
| `@melodify/app-session` | 1.1.0 (sin cambios) | Se consume `getSession`; U3 no la modifica. |
| `@melodify/catalog` | 1.1.0 (sin cambios) | Se consume `listSampleWorks`, `getWork`, `countOpinions`, `searchWorks`; U3 no la modifica. |
| `@melodify/connectivity` | 1.0.0 (sin cambios) | Se consume a través de `useNetwork`; U3 no la modifica. |

Todas las versiones se escriben exactas (`.npmrc` con `save-exact=true`, TS-01). U3 **no añade ninguna dependencia nueva** al `package.json` de la app ni al de ningún paquete.

## Assumptions & Open Questions

- `[assumption]` `Modal` y `KeyboardAvoidingView` de React Native se comportan en Expo Go como en un build propio; son parte del framework y no exigen módulo nativo. Si el teclado tapara el campo en el teléfono, se ajusta el `KeyboardAvoidingView` y no se cambia de librería.
- `[assumption]` El `PanResponder` para el arrastre de la hoja es opcional: el cierre por ✕ y por velo ya cumple AC7.2.3 y BR14.3, así que un arrastre imperfecto no bloquea la unidad.
- `[assumption]` Los cuatro `coverageThreshold` que U3 toca siguen a 80 % de líneas; ninguna pieza nueva se compensa con el total del monorepo (NFR5.8).
- **Open question para U4**: `SearchField`, `ConnectionCard` y `WorkResultRow` se publican en la 1.3.0 de C1 porque U3 llega antes; U4 solo añade `SpotifyCard` en la 1.4.0 y no cambia las tres.
- **Open question para U5**: `useCardActions` ya resuelve las cuatro acciones; Actividad solo pide el paquete y no cablea `toggleLike` por su cuenta.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7, RC-01, RC-03, RC-05).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.3.0, C2 1.3.0, C4 1.2.0, C5, § Revisión 15).
- `functional-spec` — `construction/u3-create-react/functional-design/functional-spec.md` (§ Contratos que U3 posee y consume, § Enmienda a C2, § Enmienda a C4, § La hoja de comentarios).
- `frontend-components` — `construction/u3-create-react/functional-design/frontend-components.md` (§ Jerarquía, § Paquetes, § `app/src/state/`, § `app/src/comments/`, § `app/src/bootstrap/`, § Flujos de interacción).
