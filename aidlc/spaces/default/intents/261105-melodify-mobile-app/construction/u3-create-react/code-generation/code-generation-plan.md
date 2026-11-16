# Plan de generación de código — U3 `u3-create-react`

> **Provenance**: deriva de `construction/u3-create-react/functional-design/functional-spec.md` y `frontend-components.md`, de `construction/u3-create-react/nfr-design/logical-components.md` (LC-1…LC-11), `performance-design.md` y `security-design.md`, de `construction/u3-create-react/nfr-requirements/tech-stack-decisions.md` (TS-23…TS-30) y `security-requirements.md` (NFR3.12–3.16, NFR4.7–4.8, NFR9.6), de `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C4 1.2.0, § Revisiones 15 y 16), de `inception/units-generation/unit-of-work.md` § U3 y de `inception/user-stories/stories.md` (US5, US6, US7).
> Fecha: 2026-11-16. Etapa: Code Generation · Unidad: `u3-create-react` · Agente: aidlc-developer-agent · Profundidad: Standard.

## Summary

- Builds: Crear y editar opinión (buscador, formulario, modos), la hoja de comentarios con su controlador, me gusta, seguir y los avisos, sobre C1 1.3.0, C2 1.3.0 y C4 1.2.0.
- Touches: `packages/content-store`, `packages/design-system`, `packages/app-shell` y `app/src/{comments,state,screens/crear,screens/*,bootstrap}`.
- Tests: unos 25 archivos de prueba nuevos (alrededor de 150 pruebas de unidad y de integración de pantalla) y el umbral de 80 % de líneas, que Build and Test mide sobre la suite completa.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "implementamos cada capa (utilidad, hook, pantalla), y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.",
  "scope": "mvp",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: implementamos cada capa (utilidad, hook, pantalla), y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.\n- **Herramientas**: Jest con `jest-expo` y `@testing-library/react-native`; los tres comandos que ya invoca el CI son la puerta: `npm test`, `npm run typecheck` y `npm run lint`.\n- **Cobertura**: umbral del **80 % de líneas sobre `app/src/**`**, medido con `--coverage` y excluyendo configuración generada, assets y ficheros de arranque. No se baja el umbral para hacer pasar una etapa.\n- **Qué se prueba**: la lógica de estado (opiniones en memoria, publicar, me gusta, seguir, comentar), las utilidades de Spotify (construcción de la URL de autorización PKCE, intercambio de código, lectura y borrado del token, parseo de resultados de búsqueda y de portadas) y el render de cada pantalla en sus estados: vacío, carga, error, sin Spotify y sin conexión.\n- **Qué no se prueba automáticamente**: el recorrido real en el teléfono. Eso es verificación manual en Expo Go y sigue siendo el criterio de terminado de la versión.\n- **Dobles de prueba**: las llamadas a la API de Spotify se sustituyen por dobles. Ninguna prueba sale a la red ni necesita credenciales, cuenta de Spotify ni un client ID real.\n- **Pruebas que no valen**: nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:7b9c0cd94fbb4321ea082bafcfd9b27828b26b5cc39a10b1f579a6c77cfea746",
  "contract_sha256": "sha256:c6f2307e77daeec95951a4f46c0c4ca676e462a781537060331c7a19c4dde0c9"
}
```

## Cómo se ordena este plan

La metodología es **test-after** y el orden lo fija el contrato: cada capa se implementa y después se escriben y ejecutan sus pruebas, antes de pasar a la siguiente. La unidad es brownfield sobre un monorepo que ya existe, así que el paso de estructura es pequeño (las carpetas nuevas de la unidad) y el de banco de pruebas es de verificación, no de arranque.

De las cinco capas del perfil, tres aplican y dos no, y conviene decir por qué:

| Capa del perfil | En esta unidad | Dónde vive |
|---|---|---|
| Data model / database behavior | **Sí** — las dos validaciones de C4 (topes y valoración) son el comportamiento de datos | `packages/content-store` |
| Repository / data access | **No** — C4 es un almacén en memoria sin capa de repositorio ni migraciones | — |
| Business logic | **Sí** — controlador de comentarios, búsqueda con temporizador, acciones de tarjeta y validación del borrador | `app/src/comments/`, `app/src/state/`, `app/src/screens/crear/` |
| API / endpoint | **Sí, como superficie de componentes** — C1 y C2 publican props y tipos que son el contrato de la interfaz | `packages/design-system`, `packages/app-shell` |
| Frontend behavior | **Sí** — Crear, la hoja, el snackbar y el cableado de las cuatro pantallas de U2 | `app/src/screens/`, `app/src/bootstrap/` |

**Environment/build configuration** no produce cambio: NFR7.6 dice que U3 no añade dependencias, y `.github/workflows/ci.yml` sigue igual porque `npm test` ya es `jest --coverage` con umbrales por árbol que cubren `app/src` y los seis paquetes. Queda registrado como paso verificado, no como paso de escritura.

## Trazabilidad historia → paso

| Historia / criterio | Qué lo cumple | Pasos |
|---|---|---|
| US5.1 — Publicar desde Crear con una obra de Spotify | Buscador con 2 caracteres y 400 ms sobre el puerto, fila de resultado, formulario y `createOpinion` | 15, 16, 19–22, 25 |
| US5.2 — Publicar sin sesión desde el catálogo de ejemplo | Selector de ejemplo con `opinionCount`, modo sin Spotify y publicación desde el formulario | 5–8, 19–22 |
| US5.3 — Publicar desde el detalle sin perder lo escrito | `openCreate({ workId })` y la entrada de Crear que no reinicia al volver | 10–12, 19–22, 25 |
| US6.1 — Editar mi opinión y ver la fecha | Carga de la edición, «Guardar» con y sin cambios, `closeCreate` que conserva la pila y fecha de modificación | 3, 4, 10–12, 19–22, 25 |
| US7.1 — Dar y quitar me gusta | `toggleLike` en `useCardActions`, `showLike` en la barra y la tarjeta propia sin me gusta | 5–9, 17, 18, 23, 24 |
| US7.2 — Comentar una opinión | `CommentSheet`, `createCommentsController`, montaje en la cáscara y `comentario publicado` dentro del modal | 5–9, 10–14, 23–25 |
| US7.3 — Seguir a un autor (AC7.3.1, AC7.3.2) | Etiqueta «Seguir autor» / «Siguiendo», `accessibilityLabel` y `toggleFollow` | 5–9, 17, 18, 23, 24 |
| FR11 / BR15 — Snackbar único y textos en llano | `Snackbar` en C1, montaje y limpieza por pestaña en C2, `showSnackbar` desde los hooks | 5–9, 10–12, 17–25 |
| NFR3.12–3.16 — fronteras de confianza | `403` de C4 en la edición ajena, «Editar» oculto en la vista, sin secretos ni red | 1, 3, 4, 19–22 |
| NFR9.6 — diagnóstico acotado | Solo `SEARCH_PORT_UNAVAILABLE`, sin telemetría | 15, 16 |
| NFR8.8–8.11 — temporizadores y montajes | `setTimeout` propio (400 ms / 4 s), orden de montaje de hoja y snackbar | 10–12, 15–18 |

## Pasos

### Paso 1 — Estructura de la unidad y fronteras de importación

- [ ] Crear `app/src/comments/` (`createCommentsController.ts`, `toCommentModel.ts`, `index.ts`) y `app/src/screens/crear/` (`CrearScreen.tsx`, `CrearView.tsx`, `CrearHeader.tsx`, `useCrear.ts`, `validateOpinionDraft.ts`).
- [ ] Respetar las fronteras de LC-1…LC-11: `app/src/comments/` no importa navegación ni la pestaña activa; ningún paquete importa `app/`; C1 no importa C4, C5 ni C8.
- [ ] Borrar el marcador `app/src/screens/placeholders/CrearScreen.tsx` cuando `CrearScreen` real esté registrada (Paso 25).
- [ ] Sin pruebas en este paso: es andamiaje.

### Paso 2 — Banco de pruebas listo y comando de la unidad registrado

- [ ] Verificar que `jest.config.js` (preset `jest-expo`, `testMatch`, `moduleNameMapper` de los seis paquetes, `collectCoverageFrom`) y `jest.setup.js` cubren las rutas nuevas sin cambios: las pruebas nuevas caen en `app/src/**/*.test.{ts,tsx}` y `packages/*/src/**/*.test.{ts,tsx}`.
- [ ] Verificar que `npm run typecheck` y `npm run lint` ya miran las rutas nuevas.
- [ ] Registrar en `unit-test-instructions.md` los comandos acotados por área (nunca `npm test` suelto) y comprobar que el primero corre hoy.
- [ ] Sin archivos de prueba todavía: el contrato pide el banco listo antes de la primera prueba ejecutable.

### Paso 3 — C4 1.2.0: los dos topes (implementar)

- [ ] En `packages/content-store/src/store.ts`, definir `MAX_OPINION_LENGTH = 500` y `MAX_COMMENT_LENGTH = 300`.
- [ ] `createOpinion` y `updateOpinion`: recortar primero y rechazar con `422` el texto vacío o de más de `MAX_OPINION_LENGTH`; mantener `422` para la valoración fuera de 1–5 y el `409` de la opinión duplicada.
- [ ] `addComment`: recortar primero y rechazar con `422` el texto vacío o de más de `MAX_COMMENT_LENGTH`.
- [ ] Exportar ambas constantes desde `packages/content-store/src/index.ts` como superficie aditiva de la 1.2.0; actualizar el comentario de cabecera a `C4 1.2.0`.
- [ ] No cambiar ninguna firma ni el esquema de las vistas.

### Paso 4 — C4: pruebas de los topes (escribir y ejecutar)

- [ ] `packages/content-store/src/__tests__/limits.test.ts`: 500 acepta y 501 rechaza en `createOpinion`; 300 acepta y 301 rechaza en `addComment`; los tres rechazos devuelven `422` y no escriben (la revisión no sube); el texto se recorta antes de medir.
- [ ] **Invertir** el caso de `writes.test.ts` que hoy afirma que se acepta más de 500 caracteres (hallazgo Minor de la revisión de Functional Design): pasa a esperar `422`.
- [ ] Ejecutar solo esta área y dejarla en verde.

### Paso 5 — C1 1.3.0: modelos y superficie (implementar)

- [ ] En `packages/design-system/src/models.ts`, añadir lo que necesitan las piezas (`RatingValue`, props de resultado de búsqueda) sin tocar `OpinionCardModel` más allá de lo ya previsto.
- [ ] En `packages/design-system/src/index.ts`, publicar las ocho piezas nuevas y los tipos; actualizar la cabecera a `C1 1.3.0` y dejar `SpotifyCard` libre para U4.
- [ ] La 1.3.0 es aditiva: ninguna forma de la 1.2.0 deja de compilar.

### Paso 6 — C1: las ocho piezas nuevas (implementar)

- [ ] `SearchField` — `value`, `onChangeText`, `placeholder?`, `autoFocus?`, `disabled?`, `loading?`, `onClear?`. No temporiza; el disparo es del contenedor.
- [ ] `RatingInput` — `value` 0–5, `onChange`, `disabled?`; «n de 5» y «Sin valorar»; repetir el toque no borra.
- [ ] `MultilineField` — `label`, `value`, `onChangeText`, `placeholder?`, `error?`, `maxLength?`, `counterFrom?`, `editable?`, `minHeight?`, `testID?`; altura 120–240 con scroll y contador que aparece desde `counterFrom`.
- [ ] `SecondaryButton` — `label`, `onPress`, `disabled?`; borde sin fondo.
- [ ] `ConnectionCard` — `title`, `body`, `actionLabel`, `onAction`.
- [ ] `WorkResultRow` — `work`, `opinionCount`, `onPress`; «N opiniones» / «1 opinión» / «Sé el primero en opinar».
- [ ] `CommentSheet` — `opinionId`, `comments`, `status`, `failed?`, `maxLength?`, `counterFrom?`, `snackbar?`, `onSubmit`, `onRetry`, `onClose`; guarda su borrador, no lo pierde en el error de envío y pinta el snackbar dentro del modal.
- [ ] `Snackbar` — `message`, `visible`, `onDismiss`; 4 s y sin acciones, con el temporizador del que lo monta.
- [ ] `OpinionCard` pasa `showLike={!isOwn}` a la barra y usa «Seguir autor» / «Siguiendo» con `accessibilityLabel` «Seguir a {autor}» / «Dejar de seguir a {autor}»; sigue ocultándose en la propia.
- [ ] `SocialActionBar` gana `showLike?: boolean` (por defecto `true`): con `false`, glifo y contador son texto sin `Pressable` ni rol.
- [ ] `OfflineBanner` gana `message?: string` y `onRetry?`: el texto de U2 queda por defecto y en Crear se pinta sin acción.

### Paso 7 — C1: pruebas de las piezas nuevas (escribir y ejecutar)

- [ ] `packages/design-system/src/__tests__/search-field.test.tsx` — valor, cambio, limpiar, cargando y deshabilitado.
- [ ] `packages/design-system/src/__tests__/rating-input.test.tsx` — sin valorar, «4 de 5», repetir el toque, deshabilitado.
- [ ] `packages/design-system/src/__tests__/multiline-field.test.tsx` — normal, error con texto e icono, contador desde el umbral, tope de longitud, deshabilitado.
- [ ] `packages/design-system/src/__tests__/secondary-button.test.tsx` y `connection-card.test.tsx` — acción, deshabilitado y textos.
- [ ] `packages/design-system/src/__tests__/work-result-row.test.tsx` — con opiniones, singular, «Sé el primero en opinar» y pulsación.
- [ ] `packages/design-system/src/__tests__/snackbar.test.tsx` — oculto, visible y salida a los 4 s con temporizadores falsos.
- [ ] `packages/design-system/src/__tests__/social-action-bar.test.tsx` (ampliar) — con `showLike: false` no hay control pulsable ni rol, y el número sigue visible.
- [ ] `packages/design-system/src/__tests__/own-opinion.test.tsx` (ampliar) — la propia no da me gusta; la etiqueta de seguir cambia con `followedByMe`; los `accessibilityLabel` son los dos exactos.
- [ ] Ejecutar el área de C1 y dejarla en verde.

### Paso 8 — C1: pruebas de la hoja de comentarios (escribir y ejecutar)

- [ ] `packages/design-system/src/__tests__/comment-sheet.test.tsx`: cargando, vacía, con lista, error de carga con «Reintentar», error de envío conservando texto y lista, envío correcto, contador desde 250, tope 300 y snackbar pintado dentro del modal.
- [ ] Afirmar el estado que cada prueba describe, no solo el montaje (regla de `team.md`).
- [ ] Ejecutar el área de C1 y dejarla en verde.

### Paso 9 — C2 1.3.0: tipos y contrato de la cáscara (implementar)

- [ ] En `packages/app-shell/src/types.ts`: `CreateEntry.formKey: number`, `CommentSheetState.failed: boolean`, `maxLength: number` y `counterFrom: number`; `comments.submit` devuelve `boolean` en lugar de `void`.
- [ ] El marcador vacío de U1 usa `0`/`0` en `maxLength`/`counterFrom`, porque en el esqueleto la hoja nunca se pinta.
- [ ] Actualizar la cabecera del paquete a `C2 1.3.0`; ninguna exportación cambia de forma.

### Paso 10 — C2: los cinco cambios de comportamiento (implementar)

- [ ] `formKey` sube en `openCreate`, `openEdit` y al tocar la pestaña Crear.
- [ ] `closeCreate()` vuelve a `returnTo` **sin tocar su pila** y deja Crear limpio.
- [ ] `openEdit` desde Crear conserva el `returnTo` de la entrada vigente y solo emite un `formKey` nuevo.
- [ ] El atrás del sistema dentro de Crear llama a `closeCreate()` y consume el evento.
- [ ] La cáscara se suscribe a `services.comments`, pinta `CommentSheet` cuando hay `opinionId` y `Snackbar` con el mensaje vigente; con la hoja abierta le pasa el snackbar a la hoja, porque el `Modal` queda por encima y un aviso pintado fuera quedaría detrás del velo (NFR8.10); cualquier cambio de pestaña limpia el mensaje.

### Paso 11 — C2: pruebas de la cáscara (escribir y ejecutar)

- [ ] `packages/app-shell/src/__tests__/create-entry.test.tsx`: `formKey` sube en las tres entradas; `openEdit` desde Crear conserva `returnTo`.
- [ ] `packages/app-shell/src/__tests__/create-close.test.tsx`: «Cancelar», atrás del sistema y «Guardar» vuelven a `returnTo` con su pila y su posición; atrás consume el evento.
- [ ] `packages/app-shell/src/__tests__/sheet-snackbar-mount.test.tsx`: la hoja se monta con `opinionId` y no antes; el snackbar se pinta 4 s y el cambio de pestaña lo limpia; con la hoja abierta el aviso se pinta dentro.
- [ ] Ejecutar el área de C2 y dejarla en verde.

### Paso 12 — Controlador de comentarios (implementar)

- [ ] `app/src/comments/createCommentsController.ts`: `subscribe` que emite el estado vigente al establecerse, `open`, `close`, `retry` y `submit`, con las reglas de `frontend-components.md` § `app/src/comments/`; rellena `maxLength` con `MAX_COMMENT_LENGTH` y `counterFrom` con 250.
- [ ] `app/src/comments/toCommentModel.ts`: único mapeo de `CommentView` a `CommentModel`.
- [ ] `app/src/comments/index.ts`: superficie del módulo.
- [ ] Sin estado «enviando»; el almacén es síncrono. El controlador no conoce el aviso ni la navegación.

### Paso 13 — Controlador de comentarios: pruebas (escribir y ejecutar)

- [ ] `app/src/comments/__tests__/comments-controller.test.ts`: los seis estados (cerrada, cargando, vacía, con lista, error de carga y error de envío), `open` con lista vacía vs. con comentarios, `retry` solo con la hoja abierta, `close` que descarta el borrador, `submit` vacío que devuelve `false` y no escribe, `submit` correcto que añade al final y devuelve `true`, `submit` fallido que pone `failed` sin tocar la lista, y dos reintentos distintos (lista vs. envío).
- [ ] `app/src/comments/__tests__/to-comment-model.test.ts`: nombre y handle del autor, texto y fecha.
- [ ] Ejecutar el área y dejarla en verde.

### Paso 14 — `useWorkSearch` (implementar)

- [ ] `app/src/state/useWorkSearch.ts` con `useWorkSearch(catalog, enabled)` → `{ query, status, results, setQuery, clear, retry }`.
- [ ] Aplica los 2 caracteres y los 400 ms, cancela el temporizador anterior, descarta respuestas tardías y traduce `SearchResult` a `idle`, `short`, `searching`, `results`, `empty` o `error`.
- [ ] `offline` y `error` de C5 caen los dos en `error` con el texto de BR13.2 y «Reintentar»; con `enabled` falso no monta temporizadores ni llamadas.
- [ ] Registrar `SEARCH_PORT_UNAVAILABLE` con `warn` **solo** en el defecto interno (puerto ausente o consulta que falla sin ser `offline`), según NFR9.6 corregido.

### Paso 15 — `useWorkSearch`: pruebas (escribir y ejecutar)

- [ ] `app/src/state/__tests__/use-work-search.test.ts`, con temporizadores falsos: por debajo de 2 caracteres no llama; a los 400 ms llama una vez; escribir de nuevo cancela el anterior; una respuesta tardía se descarta; `results`, `empty`, `error` y el reintento; `enabled: false` no llama ni registra; el caso de puerto ausente registra el código y devuelve `error`.
- [ ] Ejecutar el área y dejarla en verde.

### Paso 16 — `useCardActions` (implementar)

- [ ] `app/src/state/useCardActions.ts`: `actionsFor(opinion)` devuelve `{ onLike?, onComment?, onFollow?, onEdit? }` cableados a `toggleLike`, `toggleFollow`, `comments.open` y `openEdit`, con los textos exactos de confirmación y de fallo.
- [ ] En una opinión propia devuelve solo `onComment` y `onEdit`; sin `viewerId` devuelve objetos vacíos y los controles quedan sin efecto.
- [ ] El fallo de reacción pide snackbar **sin** acción (desviación registrada de FR11.2) y no cambia el estado.

### Paso 17 — `useCardActions`: pruebas (escribir y ejecutar)

- [ ] `app/src/state/__tests__/use-card-actions.test.ts`: me gusta y quitarlo con su confirmación; fallo que deja el estado igual y pide el texto exacto; seguir con «Ahora sigues a @ana» y «Ya no sigues a @ana»; opinión propia sin `onLike` ni `onFollow`; sin `viewerId` todo vacío; «Editar» abre `openEdit` con la opinión.
- [ ] Ejecutar el área y dejarla en verde.

### Paso 18 — Formulario: validación y estado (implementar)

- [ ] `app/src/screens/crear/validateOpinionDraft.ts`: función pura que dice qué falta (`work`, `text`, `rating`), usada por «Publicar» y «Guardar».
- [ ] `app/src/screens/crear/useCrear.ts`: obra, texto, valoración, `alreadyOpined`, error de envío, carga de la edición, validación y las dos escrituras; devuelve `{ state, actions }` y reacciona a `formKey` descartando el borrador.
- [ ] El `409` pasa a `YaOpinada`; el `422` y cualquier otro error de publicación se tratan como «No pudimos publicar tu opinión.» con «Reintentar», conservando todo; el `404` al guardar pasa a `ErrorCarga`.

### Paso 19 — Formulario: pruebas de la lógica (escribir y ejecutar)

- [ ] `app/src/screens/crear/__tests__/validate-opinion-draft.test.ts`: sin obra, sin texto, sin valoración, texto de solo espacios y borrador completo.
- [ ] `app/src/screens/crear/__tests__/use-crear.test.ts`: `alreadyOpined`, las dos escrituras con sus respuestas (`201`, `409`, `422`, `200`, `404`), «Guardar» sin cambios que no escribe, y el borrador que se descarta al cambiar `formKey`.
- [ ] Ejecutar el área y dejarla en verde.

### Paso 20 — Crear: vista, cabecera y contenedor (implementar)

- [ ] `app/src/screens/crear/CrearHeader.tsx`: `AppHeader` con «Crear» / «Editar opinión» y «Cancelar» en la ranura derecha.
- [ ] `app/src/screens/crear/CrearView.tsx`: vista pura con los grupos de props de `frontend-components.md`, las dos ramas (buscador o selector de ejemplo), `loading`, `loadError`, `submitError` sobre el botón, `OfflineBanner` con el texto de cada modo y sin acción, y ninguna lectura de C4, C5 ni la sesión.
- [ ] `app/src/screens/crear/CrearScreen.tsx`: contenedor que monta `useCrear` y `useWorkSearch`, cablea navegación y snackbar, y reacciona a `entry.formKey`.
- [ ] El botón dice «Publicar» o «Guardar» y se sustituye por «Editar mi opinión» en `YaOpinada`; en edición no hay buscador ni «Cambiar».

### Paso 21 — Crear: pruebas de pantalla (escribir y ejecutar)

- [ ] `app/src/screens/crear/__tests__/crear-screen.test.tsx`, montando el árbol con dobles de sesión, contenido y catálogo: vacío, buscando, con obra, ya opinada, editando, error de carga, error de envío y sin conexión.
- [ ] Afirmar el estado que se declara: la obra elegida, el botón habilitado o no, el texto conservado tras el fallo y el aviso de «Reintentar».
- [ ] `app/src/screens/crear/__tests__/crear-view.test.tsx`: cada rama de la vista pura sin almacén ni catálogo.
- [ ] Montar el árbol **una sola vez** y cambiar `formKey` sin desmontarlo: se afirma que el campo está vacío y que no hay obra seleccionada (receta de NFR3.16).
- [ ] Ejecutar el área y dejarla en verde.

### Paso 22 — Cableado de las cuatro pantallas de U2 (implementar)

- [ ] Inicio, Detalle de obra, Detalle de opinión y Perfil usan `useCardActions` y pasan el paquete a la tarjeta; no cambian su variante ni su composición.
- [ ] La tarjeta propia recibe `onEdit` y `onComment`; las ajenas además `onLike` y `onFollow`; en Perfil ninguna recibe me gusta ni seguir.
- [ ] `opened` desde la hoja no cambia de pestaña: la hoja se abre sobre la pantalla actual.

### Paso 23 — Cableado: pruebas (escribir y ejecutar)

- [ ] Ampliar las pruebas de Inicio, los dos detalles y Perfil: cada tarjeta recibe las acciones que le tocan, la propia no ofrece me gusta ni seguir, y tocar «Editar» abre la entrada de edición.
- [ ] Ejecutar las cuatro áreas y dejarlas en verde.

### Paso 24 — Composición (implementar)

- [ ] `app/src/bootstrap/comments.ts` **(nuevo)**: construye una sola vez `createCommentsController({ content: contentStore, session: appSession })`.
- [ ] `app/src/bootstrap/shell-services.ts`: sustituye el controlador vacío de comentarios por el de `comments.ts`; Spotify sigue con su valor de U1 hasta U4.
- [ ] `app/src/bootstrap/App.tsx`: la pestaña Crear pasa a `CrearScreen` con `session`, `content` y `catalog`; el resto del registro no cambia.
- [ ] `app/src/screens/dependencies.ts`: la forma sigue sirviendo a las cinco pantallas; si el contenedor de Crear necesita la entrada de la cáscara, se resuelve con los hooks de contexto, no con una segunda instancia.

### Paso 25 — Composición: pruebas (escribir y ejecutar)

- [ ] `app/src/bootstrap/__tests__/comments-instance.test.ts`: una sola instancia por arranque y la misma que ve la cáscara.
- [ ] Ampliar `app/src/bootstrap/__tests__/app-bootstrap.test.tsx`: Crear monta el formulario real y no el marcador; la hoja y el snackbar se pintan desde la cáscara.
- [ ] Ejecutar el área y dejarla en verde.

### Paso 26 — Configuración de entorno y build (verificar, sin escribir)

- [ ] Confirmar que U3 no añade dependencias a `package.json` ni a ningún paquete (NFR7.6).
- [ ] Confirmar que `.github/workflows/ci.yml` no cambia: `npm test` ya corre `jest --coverage` y los umbrales por árbol ya cubren todas las rutas nuevas.
- [ ] Confirmar que no hay variable de entorno, secreto ni artefacto desplegable nuevo.
- [ ] Si algo de esto dejara de ser cierto, parar y volver a Plan Approval antes de escribirlo.

### Paso 27 — Documentación y trazabilidad

- [ ] `code-summary.md` con lo construido, las desviaciones registradas (snackbar de fallo de reacción sin acción, `setTimeout` propio, único código de log `SEARCH_PORT_UNAVAILABLE`) y el comando de la unidad.
- [ ] `source-manifest.json` con **todas** las rutas tocadas, incluidas las de prueba.
- [ ] `traceability.json` generado con `aidlc engine sensor-traceability --stage code-generation --output-path … --write-upstream`, con todos los objetivos en `OK` y existiendo en disco.
- [ ] Entradas de `memory.md` de la etapa al cerrar cada tramo.

## Notas de ejecución

- **Cada paso se cierra en verde antes del siguiente**; no se acumulan pruebas para el final.
- **Los comandos de prueba van acotados por ruta** (ver `unit-test-instructions.md`); un `npm test` suelto no se usa en esta unidad.
- **El umbral de 80 % no se toca**: si el comando acotado falla solo por el umbral con todas sus pruebas en verde, se registra como resultado y lo juzga Build and Test sobre la suite completa.
- **Nada de `console.log` de depuración**: solo el logger del proyecto y solo el código nuevo acordado.
