# Plan de generación de código — U5 `u5-activity`

> **Provenance**: deriva de `construction/u5-activity/functional-design/functional-spec.md`, `rules.md` (BR21–BR24) y `frontend-components.md`; de `construction/u5-activity/nfr-requirements/tech-stack-decisions.md` (TS-39…TS-43), `security-requirements.md` (NFR9.8) y `performance-requirements.md`; de `construction/u5-activity/nfr-design/security-design.md`, `performance-design.md` y `logical-components.md`; de `construction/u5-activity/infrastructure-design/infrastructure-specification.md`, `cicd-pipeline.md` y `monitoring-design.md`; de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0 por enmienda funcional); de `inception/units-generation/unit-of-work.md` § U5 y `unit-of-work-story-map.md`; y de `inception/user-stories/stories.md` (US8.1, AC8.1.1–AC8.1.7).
> Fecha: 2026-11-19. Etapa: Code Generation · Unidad: `u5-activity` · Agente: `aidlc-developer-agent` · Profundidad: Standard.

## Summary

- Builds: paquete `@melodify/activity` que deriva la actividad desde C4, C1 1.5.0 con fila y encabezado de día, y la pantalla Actividad con sus cuatro estados y apertura de detalle.
- Touches: `packages/activity`, `packages/design-system`, `app/src/{bootstrap,state,screens/actividad}` y configuración de workspace (`package.json`, `tsconfig.json`, `jest.config.js`, `eslint.config.js`).
- Tests: 10 archivos nuevos, unas 60 pruebas unitarias y de integración; el suelo de 80 % por árbol lo mide Build and Test sobre la suite completa.

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

La metodología es **test-after**: cada capa se implementa y después se escriben y ejecutan sus pruebas, antes de pasar a la siguiente. El runner ya existe en el monorepo; el paso 2 verifica su configuración, añade el mapeo y el umbral nuevos y registra el comando acotado antes de crear la primera prueba.

| Capa del perfil | En esta unidad | Dónde vive |
|---|---|---|
| Data model / database behavior | **Sí** — modelos de C8 y modelo de presentación `ActivityEventSummary` de C1 | `packages/activity/src/types.ts`, `packages/design-system/src/models.ts` |
| Repository / data access | **Sí** — lecturas de C4 y suscripción a C3/C4, sin guardar nada | `packages/activity/src/derive.ts`, `packages/activity/src/activity.ts` |
| Business logic | **Sí** — derivación, orden, desempate, agrupación por día local y estados | `packages/activity/src/derive.ts`, `packages/activity/src/grouping.ts`, `packages/activity/src/activity.ts` |
| API / endpoint | **Sí, como superficie de paquete** — C8 expone `createActivity`, `getActivity`, `retryActivity` y `subscribeActivity` | `packages/activity/src/index.ts` |
| Frontend behavior | **Sí** — C1 1.5.0, mapper, hook, vista y contenedor de Actividad | `packages/design-system`, `app/src/state`, `app/src/screens/actividad` |

No hay base de datos, migraciones, backend, red ni despliegue: C8 deriva de C4 en memoria. El aviso de sin conexión se reutiliza de C6/C2 y no convierte la falta de red en error (BR23.4). El CI existente no se toca.

## Decisiones y desviaciones registradas

- `@melodify/activity` se publica en **1.1.0**: `contract-summary.md` § C8 ya declara esa versión y `functional-spec.md` § C8 y `frontend-components.md` § `@melodify/activity` recogen la misma enmienda aditiva que añade `subscribeActivity` (AC8.1.3, NFR8.17). No hay desviación de versión entre contrato y diseño funcional.
- `ActivityFeed` **no recibe logger ni almacén** (TS-43, NFR9.8). Su constructor sigue siendo `{ content, session }`. El único código nuevo, `ACTIVITY_LOAD_FAILED`, lo emite `useActividad` con el logger inyectado; el paquete no importa `app/src/bootstrap/logger.ts` y no llama a `console`.
- Para cumplir NFR9.8, `useActividad` recibe el logger como segundo argumento (`useActividad(activity, log?)`) aunque `frontend-components.md` resuma la firma con un solo parámetro. Es una adición local, no un cambio en C8.
- `ActivityRow` calcula el tiempo con `formatRelativeTime` de C1; `grouping.ts` lee el calendario local del dispositivo para «Hoy», «Ayer» y las etiquetas de fecha, sin importar C1 porque C8 no puede depender del sistema de diseño. `jest.setup.js` fija `Europe/Madrid` para que esas fechas sean deterministas.
- A igual `createdAt`, manda `eventId` ascendente, cualquiera que sea el tipo de evento: no hay prioridad entre publicaciones, me gusta y comentarios (BR22.1).
- La carga usa `Skeleton` con `shape="header"` y `shape="card"`; no se añade una forma `activityRow` a C1 (TS-42, BR23.1).
- `actorHandle` viaja en `ActivityEventSummary` pero no se pinta; los tres textos de BR24.2 no nombran a quien interactuó.
- La identidad se resuelve por `subscribeSession`, que emite la vista vigente o dispara su primera lectura en C3. No se crea una segunda sesión ni se guarda `viewerId` entre reinicios.
- Los fallos de C4 se representan como `status: "error"`; no se lanzan hacia la vista. Los listeners que lanzan se aíslan y no cambian el estado de C8.
- La siembra de C4 no se toca (BR21.5). LaActividad lee `OpinionView.workTitle`; no importa `@melodify/catalog` ni `@melodify/spotify`.

## Trazabilidad historia → paso

| Historia / criterio | Qué lo cumple | Pasos |
|---|---|---|
| US8.1 / AC8.1.1 — tres tipos de evento, orden y agrupación por día | Derivación, desempate por `eventId`, grupos por día local, mapper, lista agrupada | 3–8, 11, 13, 17 |
| AC8.1.2 — 3 publicaciones, 2 me gusta y 3 comentarios de la siembra | Lectura de C4 sin semilla nueva e integración con la siembra real | 3, 5, 9, 10, 21 |
| AC8.1.3 — publicar aparece sin recargar | `subscribeActivity`, `subscribeContent`, recálculo y hook | 9, 10, 15, 16, 19, 21 |
| AC8.1.4 — tocar una fila abre el detalle | `ActivityRow.onPress`, `onOpenOpinion`, `openOpinionDetail` y ruta de detalle | 11, 17, 19, 20, 21 |
| AC8.1.5 — vacío con «Crear opinión» | `EmptyState` y `goToTab({ name: "crear" })` | 13, 15, 17, 18, 19 |
| AC8.1.6 — error con «Reintentar» | `ErrorState`, `retryActivity` y diagnóstico acotado | 9, 10, 15–18 |
| AC8.1.7 — carga con dos grupos de esqueleto | `Skeleton` de cabecera/card y estado inicial `loading` | 9, 11, 15, 17, 18 |
| BR21.1–BR21.6 — solo eventos recibidos, sin escritura | Derivación pura y fronteras del paquete | 1, 3, 5, 6, 20, 21 |
| BR22.1–BR22.4 — orden, grupos, `eventId`, cabecera pegajosa | `grouping.ts`, mapper y `SectionList` | 7, 8, 13, 14, 17, 18 |
| BR23.1–BR23.5 — estados, red y recálculo | C8, hook, vista y cableado | 9, 10, 15–19, 21 |
| BR24.1–BR24.4 — navegación, textos, instancia única y C1 1.5.0 | C1, contenedor, arranque y pruebas de integración | 11, 17, 19–21 |
| NFR9.8 — diagnóstico sin contenido | `ACTIVITY_LOAD_FAILED` en `useActividad` | 15, 16, 20, 21 |
| TS-39…TS-43 — Expo Go, sin backend y sin logger en C8 | Fronteras, configuración y pruebas de ausencia de imports | 1, 2, 20, 21 |

## Pasos

### Paso 1 — Estructura de la unidad y fronteras de importación

- [x] Crear `packages/activity/` con `package.json`, `tsconfig.json`, `src/index.ts`, `src/types.ts`, `src/derive.ts`, `src/grouping.ts`, `src/activity.ts` y `src/__tests__/`.
- [x] Crear `app/src/screens/actividad/` con `ActividadScreen.tsx`, `ActividadView.tsx`, `activityModel.ts` y `__tests__/`.
- [x] Crear `app/src/state/useActividad.ts` y su carpeta `__tests__`.
- [x] Mantener las fronteras: C8 no importa React, C1, C5, C7 ni la app; C3 y C4 llegan como `import type` y sus implementaciones por constructor; ningún paquete importa `app/`.
- [x] No tocar README, licencia, workflow de CI ni archivos personales del proyecto salvo los configurados explícitamente en este plan.
- [x] Sin pruebas en este paso: es andamiaje.

### Paso 2 — Banco de pruebas listo y comando de la unidad registrado

- [x] Verificar que `jest.config.js` acepta las rutas nuevas; añadir `"^@melodify/activity$": "<rootDir>/packages/activity/src"` a `moduleNameMapper`.
- [x] Añadir `"./packages/activity/src/**": { "lines": 80 }` a `coverageThreshold`; no bajar ni quitar ningún umbral existente.
- [x] Verificar que `jest.setup.js` fija la zona de la agrupación y que `npm run typecheck` y `npm run lint` ven las rutas nuevas sin dobles globales nuevos.
- [x] Registrar en `unit-test-instructions.md` el comando de descubrimiento y el comando acotado por rutas exactas; comprobar que el de descubrimiento corre antes de crear pruebas.
- [x] Sin pruebas ejecutables todavía: el contrato pide el banco listo antes de la primera prueba.

### Paso 3 — Modelos de C8 y de presentación (implementar)

- [x] En `packages/activity/src/types.ts`, declarar `ActivityStatus`, `ActivityEventKind`, `ActivityEventView`, `ActivityGroupView`, `ActivityView` y `ActivityFeed`, con `groups` opcional y `actorHandle?`.
- [x] En `packages/design-system/src/models.ts`, declarar `ActivityEventSummary` con `eventId`, `kind`, `opinionId`, `workTitle`, `createdAt` y `actorHandle?`.
- [x] No redeclarar `authorId`, `workId`, texto del comentario ni portada: no viajan en la vista de actividad.

### Paso 4 — Modelos: pruebas (escribir y ejecutar)

- [x] Afirmar los cuatro estados de `ActivityStatus` y los tres valores de `ActivityEventKind`.
- [x] Construir una `ActivityView` de ejemplo con el reloj fijo y comprobar que `groups` puede omitirse en `loading`, `empty` y `error`.
- [x] Comprobar que `ActivityEventSummary` acepta y omite `actorHandle` según el tipo de evento.
- [x] Ejecutar el archivo `packages/activity/src/__tests__/types.test.ts` y dejarlo en verde.

### Paso 5 — Derivación pura desde C4 (implementar)

- [x] Crear `packages/activity/src/derive.ts` con una función pura que reciba `viewerId`, un `now` explícito y las lecturas `listOpinions`, `listLikes` y `listComments`.
- [x] Emitir `own:<opinionId>` por cada opinión propia, con `createdAt` de creación, no de edición (BR21.2).
- [x] Leer `listLikes({ opinionId })` solo cuando `likeCount > 0`, descartar el me gusta propio y emitir `like:<opinionId>:<authorId>` con handle y fecha (BR21.3).
- [x] Leer `listComments({ opinionId })` solo cuando `commentCount > 0`, descartar el comentario propio y emitir `comment:<commentId>` con handle y fecha (BR21.4).
- [x] Copiar `OpinionView.workTitle` al evento; no pedir nada a C5 ni incluir el texto del comentario.

### Paso 6 — Derivación: pruebas (escribir y ejecutar)

- [x] Con la semilla y el reloj fijos, derivar exactamente ocho eventos: tres publicaciones, dos me gusta y tres comentarios.
- [x] Comprobar que los me gusta de `bruno` y `marcos` sobre opiniones ajenas no aparecen.
- [x] Comprobar que un me gusta o comentario propio no genera evento y que `updatedAt` no cambia la fecha del evento.
- [x] Comprobar que un `ContentResult` con `ok: false` en cualquiera de las tres lecturas se traduce a fallo de derivación sin lanzar.
- [x] Verificar que no se llama a `listLikes` ni `listComments` cuando el contador correspondiente es cero.
- [x] Ejecutar `packages/activity/src/__tests__/derive.test.ts` y dejarlo en verde.

### Paso 7 — Orden, desempate y agrupación por día local (implementar)

- [x] Crear `packages/activity/src/grouping.ts` con orden `createdAt` descendente y desempate por `eventId` ascendente, sin prioridad entre tipos de evento (BR22.1).
- [x] Agrupar por día natural local con `day: "today" | "yesterday" | "date"` y etiquetas «Hoy», «Ayer» y fecha «16 nov 2026», restando un día calendario para respetar los cambios de horario (BR22.2).
- [x] Emitir grupos del más reciente al más antiguo, conservando el orden interno y sin partirlos en columnas.
- [x] Usar un formateador de fecha del calendario local, sin importar `@melodify/design-system`.

### Paso 8 — Orden y agrupación: pruebas (escribir y ejecutar)

- [x] Afirmar el orden exacto de los ocho eventos de la siembra, incluidos los dos empates del ejemplo trabajado.
- [x] Afirmar los cinco grupos del ejemplo y sus etiquetas con `2026-11-19T12:00:00Z`.
- [x] Afirmar que un evento cerca de la medianoche pertenece al día natural local y que «ayer» sobrevive a un cambio de horario.
- [x] Afirmar que dos eventos con el mismo instante se desempatan por `eventId`, cualquiera que sea su tipo.
- [x] Ejecutar `packages/activity/src/__tests__/grouping.test.ts` y dejarlo en verde.

### Paso 9 — Máquina `ActivityFeed` y superficie C8 (implementar)

- [x] Crear `packages/activity/src/activity.ts` con `createActivity({ content, session })`; arranca en `loading` sin leer nada hasta la primera petición.
- [x] Exponer `getActivity`, `retryActivity` y `subscribeActivity`; la suscripción emite la vista vigente en el acto y devuelve la baja (C8 1.1.0).
- [x] Suscribirse a `subscribeSession`; con `signedOut` emitir `empty`, con identidad desconocida conservar `loading`.
- [x] Suscribirse a `subscribeContent(viewerId, listener)` una sola vez por identidad; la emisión inmediata dispara la primera derivación y cada escritura dispara otra (BR23.5).
- [x] Traducir fallo de lectura, fallo de suscripción o excepción de derivación a `status: "error"` y `groups: []`, sin lanzar.
- [x] Hacer que `retryActivity()` vuelva a `loading` y repita sobre la misma instancia sin duplicar suscripciones.
- [x] Aislar listeners que lanzan, sin cambiar el estado ni registrar desde el paquete.
- [x] Exportar `createActivity` y los tipos desde `packages/activity/src/index.ts`; publicar `1.1.0` en `package.json`.

### Paso 10 — `ActivityFeed`: pruebas (escribir y ejecutar)

- [x] `getActivity` devuelve `loading` antes de la primera emisión y la suscripción recibe ese estado en el acto.
- [x] Con sesión `demo`, la primera emisión de C4 produce `ready` con los ocho eventos; sin eventos produce `empty`; sin sesión produce `empty`.
- [x] Una escritura posterior de C4 emite una nueva vista con el evento añadido y los `eventId` existentes intactos.
- [x] `listOpinions` con `ok: false`, `subscribeContent` con `ok: false` y una derivación que lanza producen `error` sin excepción hacia la prueba.
- [x] `retryActivity()` pasa por `loading`, vuelve a derivar y no duplica las bajas ni las suscripciones.
- [x] Cambiar de cuenta cancela la suscripción de contenido anterior y vuelve a derivar con el nuevo `viewerId`.
- [x] Un listener que lanza no impide que los demás reciban la vista ni rompe el estado.
- [x] Ejecutar `packages/activity/src/__tests__/activity.test.ts` y dejarlo en verde.

### Paso 11 — C1 1.5.0: `ActivityRow` y `DayHeader` (implementar)

- [x] Crear `packages/design-system/src/components/ActivityRow.tsx` con `{ event, onPress }`, tres textos literales por `kind`, icono decorativo (`★`, `♡`, `💬`), tiempo relativo y chevron.
- [x] Hacer que toda la fila sea `Pressable`, con etiqueta accesible igual al texto completo, estado pulsado con `surfaceSunken` y alto táctil del tema.
- [x] Crear `packages/design-system/src/components/DayHeader.tsx` con `{ label }`, `type.label`, `color.textSecondary`, fondo `color.bg` y alto 32.
- [x] Añadir `data-testid` estable a fila, texto, tiempo, icono y cabecera.
- [x] Exportar ambas piezas y `ActivityEventSummary` desde `index.ts`; subir `packages/design-system/package.json` a `1.5.0`.
- [x] No cambiar props ni alturas de piezas existentes.

### Paso 12 — C1 1.5.0: pruebas (escribir y ejecutar)

- [x] Comprobar los tres textos completos, incluidas las comillas angulares del título.
- [x] Comprobar el icono por clase y que no lleva etiqueta de accesibilidad propia.
- [x] Comprobar el tiempo relativo con una fecha fija y que al tocar la fila se llama a `onPress` una vez.
- [x] Comprobar `DayHeader` con «Hoy», «Ayer» y una fecha larga.
- [x] Ejecutar `packages/design-system/src/__tests__/activity-row.test.tsx` y `day-header.test.tsx`, y dejarlos en verde.

### Paso 13 — Mapa de presentación (implementar)

- [x] Crear `app/src/screens/actividad/activityModel.ts` con `ActividadSection` y `toActividadSections(groups)`.
- [x] Copiar `day`, `label`, `eventId`, `kind`, `opinionId`, `workTitle`, `createdAt` y `actorHandle?` sin reordenar ni reagrupar.
- [x] Definir el modelo de secciones de la pantalla sin importar C8 desde `ActividadView`.

### Paso 14 — Mapa de presentación: pruebas (escribir y ejecutar)

- [x] Convertir los cinco grupos del ejemplo y comprobar etiquetas, orden de secciones y orden de eventos.
- [x] Comprobar que el mapper es total con `groups` vacío y con `actorHandle` ausente.
- [x] Comprobar que `eventId` y `opinionId` no se alteran.
- [x] Ejecutar `app/src/screens/actividad/__tests__/activity-model.test.ts` y dejarlo en verde.

### Paso 15 — Hook de estado y diagnóstico (implementar)

- [x] Crear `app/src/state/useActividad.ts` con estado inicial `{ status: "loading", groups: [] }`.
- [x] Suscribirse a `activity.subscribeActivity` en un efecto y darse de baja al desmontar.
- [x] Exponer `retry()` que llama a `activity.retryActivity()`; la emisión resultante actualiza el estado.
- [x] Recibir `log?: AppLogger` y, al ver `status: "error"`, emitir exactamente `error("ACTIVITY_LOAD_FAILED", "No se pudo derivar la actividad")` una vez por intento fallido.
- [x] No registrar en `loading`, `ready` ni `empty`; no interpolar títulos, identificadores ni códigos en el mensaje.
- [x] Añadir `"ACTIVITY_LOAD_FAILED"` a `AppLogCode` en `app/src/bootstrap/logger.ts`.

### Paso 16 — Hook: pruebas (escribir y ejecutar)

- [x] El doble de C8 emite `loading`, `ready`, `empty` y `error`; el hook refleja cada estado y expone los grupos recibidos.
- [x] La primera emisión al suscribirse se refleja sin esperas artificiales y la baja se llama al desmontar.
- [x] `retry()` llama una vez a `retryActivity()` y el estado vuelve a `loading`.
- [x] `error` produce una sola llamada al logger con el código y mensaje fijos; `ready` y `empty` no producen ninguna.
- [x] Un segundo error tras un reintento produce una segunda llamada, una por intento.
- [x] Ejecutar `app/src/state/__tests__/use-actividad.test.tsx` y dejarlo en verde.

### Paso 17 — Vista pura de Actividad (implementar)

- [x] Crear `app/src/screens/actividad/ActividadView.tsx` con props `status`, `sections`, `online`, `onRetry`, `onOpenOpinion` y `onCreate`.
- [x] Pintar `AppHeader title="Actividad"` fuera de la lista.
- [x] Pintar `Banner` de sin conexión bajo la cabecera con el texto exacto y «Reintentar» cuando `online` sea `false`; la lista sigue visible.
- [x] En `loading`, pintar dos grupos de esqueleto con `Skeleton shape="header" count={1}` y `Skeleton shape="card" count={3}`.
- [x] En `empty`, pintar `EmptyState` con «Todavía no hay actividad.» y acción «Crear opinión».
- [x] En `error`, pintar `ErrorState` con «No pudimos cargar tu actividad.» y «Reintentar».
- [x] En `ready`, pintar `SectionList` con `stickySectionHeadersEnabled`, `DayHeader`, `ActivityRow`, clave por `event.eventId` y ancho máximo 720 centrado.
- [x] No leer C8, C3 ni C4; no pintar la barra inferior ni mensajes técnicos.

### Paso 18 — Vista: pruebas (escribir y ejecutar)

- [x] Los cuatro estados se comprueban por texto completo y `data-testid`, no sólo por montaje.
- [x] `loading` pinta dos encabezados y seis bloques de fila, sin días inventados.
- [x] `ready` pinta las secciones en orden, usa `eventId` como clave y conserva la lista cuando `online` es `false`.
- [x] Tocar una fila llama a `onOpenOpinion` con el `opinionId` correcto.
- [x] «Crear opinión» y «Reintentar» llaman a sus callbacks una vez.
- [x] Ejecutar `app/src/screens/actividad/__tests__/actividad-view.test.tsx` y dejarlo en verde.

### Paso 19 — Contenedor `ActividadScreen` (implementar)

- [x] Crear `app/src/screens/actividad/ActividadScreen.tsx` leyendo `activity`, `log` y servicios de red/globales por las dependencias y contextos existentes.
- [x] Si falta la actividad, quedarse en `loading` en vez de construir una segunda instancia.
- [x] Usar `useActividad(activity, log)`, mapear grupos con `toActividadSections` y pasar todo a `ActividadView`.
- [x] Cablear `onRetry` a `retry`, `onOpenOpinion` a `openOpinionDetail({ opinionId })` y `onCreate` a `goToTab({ name: "crear" })`.
- [x] Tomar `online` de `useShellServices().network`, sin importar módulos de red ni Spotify.

### Paso 20 — Contenedor y cableado: pruebas (escribir y ejecutar)

- [x] Sin actividad, la pantalla pinta esqueletos y no construye un feed propio.
- [x] Con actividad doble, carga, lista, vacío y error llegan a la vista con las secciones mapeadas.
- [x] Tocar una fila llama a `openOpinionDetail` con el identificador de la opinión.
- [x] «Crear opinión» llama a `goToTab({ name: "crear" })` y «Reintentar» a `retryActivity`.
- [x] `online: false` pinta el aviso sin borrar la lista.
- [x] Ejecutar `app/src/screens/actividad/__tests__/actividad-screen.test.tsx` y dejarlo en verde.

### Paso 21 — Composición, configuración e integración (implementar y probar)

- [x] `app/src/bootstrap/instances.ts`: construir y exportar una sola vez `activityFeed = createActivity({ content: contentStore, session: appSession })`.
- [x] `app/src/screens/dependencies.ts`: añadir `activity?: ActivityFeed`.
- [x] `app/src/bootstrap/App.tsx`: importar la pantalla real, crear `ActividadRoute` con `activity={activityFeed}`, registrar `details: [{ kind: "opinion", component: DetalleOpinionRoute }]` en la pestaña Actividad y retirar el placeholder de la ruta real.
- [x] `app/package.json`: subir `@melodify/design-system` a `1.5.0` y añadir `@melodify/activity: "1.1.0"`. No tocar la declaración de `@melodify/design-system` en `packages/app-shell/package.json`.
- [x] `tsconfig.json` y `app/tsconfig.json`: añadir la referencia a `packages/activity`.
- [x] `jest.config.js` y `eslint.config.js`: aplicar lo del paso 2 y añadir la regla que prohíbe a `packages/activity/src/**` importar React, C1, C5, C7, la app o valores de C3/C4; `allowTypeImports: true` para C3/C4.
- [x] `package-lock.json` queda coherente con las versiones nuevas; no se instala nada fuera del workspace.
- [x] Prueba de integración: arranque → feed con la semilla real → ocho eventos → publicar en C4 → evento nuevo sin reiniciar → abrir detalle → sin conexión conserva la lista.
- [x] Comprobar que `packages/activity/src/**` no contiene `console`, imports de React, C1, C5, C7 ni de la app.
- [x] Ejecutar `app/src/bootstrap/__tests__/activity-wiring.test.tsx` y dejarlo en verde.

### Paso 22 — Puertas finales y documentación

- [x] Sin cambios en `.github/workflows/ci.yml`: `npm test`, `npm run typecheck` y `npm run lint` siguen siendo la puerta.
- [x] Ejecutar el comando acotado con cobertura de esta unidad; si sale distinto de cero sólo por un umbral global con todas las pruebas en verde, registrarlo en `code-summary.md` sin tocar el umbral.
- [x] Ejecutar `npm run typecheck` y `npm run lint`; corregir hallazgos reales, nunca relajar reglas.
- [x] Preparar la descripción de archivos creados/modificados, decisiones y desviaciones para `code-summary.md`, y el manifiesto de fuentes para el paso posterior a la generación.
- [x] Registrar la verificación manual pendente en Expo Go sobre Android físico: entrada `demo`/`demo`, Actividad con ocho filas, encabezados pegajosos, apertura y vuelta del detalle, publicación nueva y aviso sin conexión.
