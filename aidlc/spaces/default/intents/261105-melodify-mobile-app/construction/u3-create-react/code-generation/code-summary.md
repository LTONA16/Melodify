# Resumen de código — U3 `u3-create-react`

> **Provenance**: deriva de `code-generation-plan.md` (plan aprobado, 27 pasos), `unit-test-instructions.md`, los seis commits de la unidad en `develop` (`c3724d5`, `7a2d1df`, `4ddddbb`, `e7dc9fc`, `ad46172`, `4fd399b`) más el tramo de cableado y composición cerrado en el árbol de trabajo, y la verificación de la suite completa al cerrar la unidad.
> Fecha: 2026-11-17. Etapa: Code Generation · Unidad: `u3-create-react` · Agente: aidlc-developer-agent · Profundidad: Standard · Estrategia de prueba: Standard · Postura: test-after.

## Qué se construyó

Crear y editar opinión de punta a punta, con sus piezas compartidas: el buscador de obras contra C5 con su retardo y sus dos caracteres mínimos, el formulario con valoración, texto y modos (publicar, editar, ya opinada), la hoja de comentarios con su controlador, las acciones de tarjeta —me gusta, comentar, seguir y editar— resueltas una sola vez para las cuatro pantallas de U2, y los avisos de la cáscara. La app sigue siendo recorrible sin Spotify: el login simulado entra, Inicio y Perfil leen la siembra de C4 y Crear opera con el catálogo de ejemplo.

**Pasos del plan**: 27 de 27 completos y marcados. Los pasos 1–21 llegaron en los cinco commits de la unidad; los pasos 22–26 se cerraron en el árbol de trabajo y el 27 es este documento, `source-manifest.json`, `traceability.json` y las entradas de `memory.md`.

**Commits de la unidad en `develop`**:

| Commit | Contenido |
|---|---|
| `c3724d5` | Pasos 3–4: los dos topes de C4 1.2.0 y sus pruebas, con la inversión del caso de `writes.test.ts`. |
| `7a2d1df` | Pasos 5–8: C1 1.3.0 con las ocho piezas nuevas y sus pruebas. |
| `4ddddbb` | Pasos 9–11: C2 1.3.0 —`formKey`, cierre de Crear, hoja y snackbar en la cáscara— con sus pruebas. |
| `e7dc9fc` | Pasos 14–17: `useWorkSearch` y `useCardActions` con sus pruebas. |
| `ad46172` | Pasos 12–13 y 18–21: el controlador de comentarios, la validación y el estado del formulario, y la pantalla de Crear con sus pruebas. |
| `4fd399b` | Avance de registro AI-DLC de la unidad. |

Los pasos 1–2 (andamiaje y banco de pruebas) no llevan commit propio: quedaron dentro de `c3724d5`. Los pasos 22–26 van en el mismo tramo que este cierre.

## Archivos

### `packages/content-store/` — C4 v1.2.0

- `src/store.ts` — `MAX_OPINION_LENGTH = 500` y `MAX_COMMENT_LENGTH = 300`; `createOpinion`, `updateOpinion` y `addComment` recortan antes de medir y rechazan con `422` el texto vacío o por encima del tope. Ninguna firma ni vista cambia.
- `src/index.ts` — las dos constantes como superficie aditiva de la 1.2.0; cabecera actualizada.
- `src/__tests__/limits.test.ts` — **nuevo**: 500 acepta y 501 rechaza, 300 acepta y 301 rechaza, los tres rechazos devuelven `422` sin subir la revisión, y el recorte ocurre antes de medir.
- `src/__tests__/writes.test.ts` — el caso que aceptaba más de 500 caracteres pasa a esperar `422` (hallazgo Minor de la revisión de Functional Design).
- `package.json` — versión 1.2.0.

### `packages/design-system/` — C1 v1.3.0

- Nuevos: `components/SearchField.tsx`, `RatingInput.tsx`, `MultilineField.tsx`, `SecondaryButton.tsx`, `ConnectionCard.tsx`, `WorkResultRow.tsx`, `CommentSheet.tsx`, `Snackbar.tsx`.
- Enmendados: `components/OpinionCard.tsx` (pasa `showLike={!isOwn}`, «Seguir autor»/«Siguiendo» y los dos `accessibilityLabel` exactos), `components/SocialActionBar.tsx` (`showLike?: boolean`, con `false` el glifo y el contador son texto sin rol), `models.ts` (`RatingValue` y las props de resultado de búsqueda), `index.ts` (las ocho piezas y sus tipos; `SpotifyCard` queda libre para U4).
- Pruebas nuevas: `search-field`, `rating-input`, `multiline-field`, `secondary-button`, `connection-card`, `work-result-row`, `snackbar`, `comment-sheet`, `social-action-bar`; ampliada `own-opinion`.
- `package.json` — versión 1.3.0.

### `packages/app-shell/` — C2 v1.3.0

- `src/types.ts` — `CreateEntry.formKey`, `CommentSheetState.failed`, `maxLength`, `counterFrom`, y `comments.submit` devolviendo `boolean`.
- `src/AppShell.tsx` — `formKey` sube en las tres entradas; `closeCreate` vuelve a `returnTo` sin tocar su pila; `openEdit` desde Crear conserva el `returnTo`; el atrás del sistema dentro de Crear consume el evento; la cáscara se suscribe a `services.comments`, monta `CommentSheet` con `opinionId` y pinta `Snackbar`, con el aviso dentro del modal cuando la hoja está abierta y limpiándolo al cambiar de pestaña.
- Pruebas: `create-entry`, `create-close`, `sheet-snackbar-mount` (**nuevas**), `app-shell` y `stack` (ampliadas).

### `app/src/comments/` — superficie nueva

- `createCommentsController.ts` — `subscribe` que emite el estado vigente al establecerse, `open`, `close`, `retry` y `submit`; seis estados; `maxLength` desde `MAX_COMMENT_LENGTH` y `counterFrom` en 250; sin estado «enviando» y sin conocer aviso ni navegación.
- `toCommentModel.ts` — el único mapeo de `CommentView` a `CommentModel`.
- `index.ts` — superficie del módulo.
- `__tests__/comments-controller.test.ts` y `to-comment-model.test.ts` — **nuevas**.

### `app/src/screens/crear/` — pantalla nueva

- `CrearHeader.tsx` — «Crear» / «Editar opinión» y «Cancelar» en la ranura derecha.
- `CrearView.tsx` — vista pura: buscador o selector de ejemplo, `loading`, `loadError`, `submitError` sobre el botón, `OfflineBanner` con el texto de cada modo y sin acción; ninguna lectura de C4, C5 ni la sesión.
- `CrearScreen.tsx` — contenedor que monta `useCrear` y `useWorkSearch`, cablea navegación y snackbar y reacciona a `entry.formKey`.
- `useCrear.ts` — obra, texto, valoración, `alreadyOpined`, error de envío, carga de la edición, validación y las dos escrituras; el `409` pasa a `YaOpinada`, el `422` y cualquier otro fallo de publicación conservan todo, y el `404` al guardar pasa a `ErrorCarga`.
- `validateOpinionDraft.ts` — función pura que dice qué falta (`work`, `text`, `rating`).
- Pruebas: `crear-screen`, `crear-view`, `use-crear`, `validate-opinion-draft` — **nuevas**.

### `app/src/state/` — hooks nuevos

- `useWorkSearch.ts` — 2 caracteres y 400 ms, cancelación del temporizador anterior, descarte de respuestas tardías, traducción a `idle`/`short`/`searching`/`results`/`empty`/`error`, y `enabled: false` sin temporizadores ni llamadas.
- `useCardActions.ts` — el paquete de acciones por tarjeta, atado a la identidad y al almacén: me gusta, comentar, seguir y editar, con los textos exactos de confirmación y de fallo; la propia solo recibe comentar y editar, y sin `viewerId` el paquete llega vacío.
- Pruebas: `use-work-search.test.ts` y `use-card-actions.test.tsx` — **nuevas**.

### Cuatro pantallas de U2 — cableadas

- `screens/inicio/` (`InicioScreen`, `InicioView`), `screens/detalle-obra/` (`DetalleObraScreen`, `DetalleObraView`, `useDetalleObra`), `screens/detalle-opinion/` (`DetalleOpinionScreen`, `DetalleOpinionView`) y `screens/perfil/` (`PerfilScreen`, `PerfilView`) resuelven con `useCardActions` el paquete de cada tarjeta y se lo pasan a `OpinionCard`. La variante y la composición de cada pantalla no cambian.
- Pruebas ampliadas: `inicio-screen`, `inicio-view`, `detalle-obra-screen`, `detalle-obra-view`, `detalle-opinion`, `perfil-screen`, `perfil-view`.

### Composición y componentes compartidos

- `app/src/bootstrap/comments.ts` — **nuevo**: construye una sola vez el controlador con `contentStore` y `appSession`.
- `app/src/bootstrap/shell-services.ts` — la cáscara recibe ese controlador; Spotify sigue con su valor de U1 hasta U4.
- `app/src/bootstrap/App.tsx` — la pestaña Crear monta `CrearScreen` con `session`, `content` y `catalog`.
- `app/src/bootstrap/logger.ts` — el único código nuevo de la unidad: `SEARCH_PORT_UNAVAILABLE`.
- `app/src/components/OfflineBanner.tsx` — gana `message?` y `onRetry?`; el texto de U2 queda por defecto y en Crear se pinta sin acción.
- `app/src/bootstrap/__tests__/comments-instance.test.ts` — **nuevo**: una sola instancia por arranque y la misma que ve la cáscara.
- `app/src/bootstrap/__tests__/app-bootstrap.test.tsx` y `shell-services.test.ts` — ampliadas: Crear monta el formulario real, la hoja y el snackbar se pintan desde la cáscara.
- `app/src/components/__tests__/offline-banner.test.tsx` — ampliada.

### Eliminados

- `app/src/screens/placeholders/CrearScreen.tsx` — sustituido por la pantalla real (paso 1).
- `app/src/state/__tests__/use-card-actions.test.ts` — intento paralelo con la API antigua de dependencias; lo sustituye `use-card-actions.test.tsx`.

## Pruebas y puertas

Ejecutado en esta etapa con el comando acotado de la unidad y la suite completa:

```
npx jest packages/content-store/src packages/design-system/src packages/app-shell/src app/src
  → 62 suites, 550 pruebas, todas en verde
npm run typecheck   → verde (tsc -b)
npm run lint        → 0 errores, 0 avisos
```

Cobertura de líneas del mismo comando con `--coverage`, por árbol tocado:

| Árbol | Líneas | Umbral |
|---|---|---|
| `app/src/**` | 96,17 % (652/678) | 80 % |
| `packages/content-store/src/**` | 98,24 % (223/227) | 80 % |
| `packages/design-system/src/**` | 98,55 % (204/207) | 80 % |
| `packages/app-shell/src/**` | 94,33 % (133/141) | 80 % |

`jest --coverage` sale con código 1 en este comando acotado por tres archivos de árboles que la unidad no toca y que el comando no ejecuta: `packages/app-session/src/session-record.ts` (75 %), `packages/catalog/src/catalog.ts` (38,77 %) y `packages/connectivity/src/expo-network-adapter.ts` (72,72 %). No es una regresión de U3 y no se arregla bajando el umbral: el suelo de cobertura se juzga en Build and Test sobre la suite completa, tal y como advierte `unit-test-instructions.md` § «El suelo de cobertura no se juzga aquí». Ningún umbral se modificó.

Ninguna prueba sale a la red ni necesita credenciales ni cuenta de Spotify: la API de Spotify se sustituye por dobles.

**Lo que ninguna prueba automática demuestra** y sigue siendo verificación manual en Expo Go sobre el teléfono Android físico: el recorrido real de las seis pantallas, publicar y editar una opinión con el teclado y la valoración, comentar con la hoja abierta y ver el aviso dentro de ella, y el comportamiento del buscador con datos reales de Spotify cuando U4 conecte la sesión.

## Desviaciones del plan

1. **`useCardActions` lee los servicios de los contextos de la cáscara.** El plan lo describía recibiendo las dependencias por argumento. Se resolvió con `useGlobalServices()` y `useShellServices()` (C2 1.3.0) porque la hoja de comentarios y el snackbar los provee `AppShell`, y bajarlos a mano por props hasta cuatro pantallas habría duplicado el cableado y permitido construir una segunda hoja. La firma queda `useCardActions(content, viewerId)` y devuelve `actionsFor(opinion)`.
2. **El fallo de reacción pide snackbar sin acción.** Desviación registrada de FR11.2, ya decidida en el diseño: el control que falló sigue en pantalla, así que el aviso solo informa y no ofrece «Reintentar». Los textos son los exactos de la especificación.
3. **El temporizador de 4 s vive en `Snackbar`.** Lo fija TS-29 y el plan lo dejaba abierto («el temporizador del que lo monta»); la pieza es dueña de su `setTimeout` y lo cancela al desmontar, de modo que la cáscara y la hoja comparten la misma franja sin duplicar temporizadores.
4. **Un solo código de log nuevo: `SEARCH_PORT_UNAVAILABLE`.** Se registra `warn` **solo** en el defecto interno del puerto de búsqueda —puerto ausente o consulta que falla sin ser `offline`—, nunca en el `offline` previsto y nunca con el texto de la consulta (NFR9.6 corregido). No se añadió ningún otro código.
5. **`use-card-actions.test.tsx` en lugar de `.test.ts`.** El plan pedía `.test.ts`; el hook consume los contextos de la cáscara, así que la prueba lo monta con `renderHook` dentro de los dos proveedores y necesita TSX. El archivo `.test.ts` que había dejado un intento paralelo con la API antigua se borró para no dejar dos pruebas del mismo hook.
6. **El detalle de obra resuelve las acciones en el contenedor.** `useDetalleObra` devuelve además `ownView` y `otherViews` (las `OpinionView` de C4) porque `OpinionCardModel` no lleva `isOwn` ni el autor que pide seguir. La vista sigue recibiendo `actionsFor(opinionId)` y no conoce C4.
7. **Se corrigieron tres errores de tipos en `crear-screen.test.tsx`.** El genérico de `ok()` no aceptaba el `201`, y dos `invocationCallOrder[0]` podían ser `undefined`. `npm run typecheck` tiene que quedar verde, y la corrección no cambia ninguna aserción.
8. **AC2.2.1 y AC9.1.8 quedan fuera de esta unidad.** La portada real y la tarjeta de Spotify de Perfil necesitan la sesión de Spotify y `SpotifyResolvePort`, que llegan con U4; por eso no son objetivos asignados a U3 y no tienen fila en `traceability.json`. Los sigue la unidad que los construye.

## Avisos conocidos

- **Ruido de `VirtualizedList` en las pruebas.** `inicio-screen.test.tsx` y `app-bootstrap.test.tsx` imprimen avisos de `act` al montar el `FlatList` del feed. Es ruido del entorno, no un fallo: las 550 pruebas pasan y ninguna aserción depende de esos avisos.
- **Explorar y Actividad siguen siendo contenedoras.** `screens/placeholders/ExplorarScreen.tsx` y `ActividadScreen.tsx` se retiran en U4 y U5; Crear ya es la pantalla real.
- **La verificación en el teléfono queda pendiente del cierre de la unidad**: levantar Metro, recorrer Crear y la hoja de comentarios, y confirmar el esqueleto aprobado en el checkpoint.
