# Plan de generación de código — U2 `u2-content-core`

> **Provenance**: deriva de `construction/u2-content-core/functional-design/` (`functional-spec.md` F7–F12, § Semilla, § Textos exactos, § Máquina de estados; `frontend-components.md` § Paquetes, § `app/src/state/`, § Registro y navegación; `rules.md`), de `nfr-requirements/` (NFR1–NFR9, TS-16–TS-22) y de `nfr-design/` (`performance-design.md` NFR8.4–NFR8.7, `security-design.md` NFR3.11/NFR4.5/NFR9.4, `logical-components.md` LC-6…LC-9 y § Superficie), de `infrastructure-design/cicd-pipeline.md` (conjunto de cambios del CI), de `inception/contract-design/contract-summary.md` (C1 1.2.0, C2 1.2.0 con § Revisión 12 y 13, C4 1.0.0, C5 1.1.0, C6 1.0.0), de `inception/units-generation/unit-of-work.md` (§ U2) y `unit-of-work-story-map.md` (US2.1–US2.3, US4.1–US4.3, US9.1) y de `inception/requirements-analysis/requirements.md`.
> Fecha: 2026-11-12. Etapa: Code Generation · Unidad: `u2-content-core` · Agente: aidlc-developer-agent · Profundidad: Standard · Estrategia de prueba: Standard · Postura: test-after (equipo, `team.md`).

## Summary

- Builds: el corazón de Melodify sin Spotify — `ContentStore` con el contenido de ejemplo, `Catalog` con la decisión de portada, `Connectivity` real, y las pantallas Inicio, Detalle de obra, Detalle de opinión y Perfil con sus estados de carga, vacío, error y sin conexión.
- Touches: `packages/content-store`, `packages/catalog`, `packages/connectivity` (nuevos), `packages/design-system` y `packages/app-shell` (1.2.0), `app/src/bootstrap/`, `app/src/state/`, `app/src/components/`, `app/src/screens/`, `jest.config.js`, `tsconfig.json`, `eslint.config.js`, `app/package.json`, `.github/workflows/ci.yml`, `.commitlintrc.json`.
- Tests: unas 190–210 pruebas nuevas, en Jest con `jest-expo` y Testing Library: siembra y reductor de C4, sus lecturas y escrituras, catálogo y decisión de portada, conectividad con doble de `expo-network`, las piezas nuevas de C1, la pila de C2, los hooks de estado, las cuatro pantallas en todos sus estados y la integración de composición.

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

## Cómo se aplica la postura test-after aquí

El perfil del contrato nombra cinco capas. En esta unidad se leen así, sin inventar capas que no existen:

| Capa del contrato | Qué es en U2 |
|---|---|
| Modelo de datos | La forma del estado de C4, sus vistas y la siembra (`views.ts`, `seed.ts`, `store.ts`). |
| Acceso a datos | Las operaciones de lectura y la suscripción de C4 sobre ese estado. |
| Lógica de negocio | Las escrituras y reglas de C4, la decisión de portada y el estado de red de C5 y C6. |
| API/endpoint | La superficie en proceso que cada paquete publica en su `src/index.ts` (no hay HTTP ni rutas). |
| Comportamiento de interfaz | C1 1.2.0, C2 1.2.0, los hooks de `app/src/state/`, los componentes de la app y las cuatro pantallas. |

Cada capa se implementa y **después** se escriben y ejecutan sus pruebas, antes de pasar a la siguiente. Cada paso de prueba ejecuta el comando de la unidad y no pasa al siguiente si queda rojo.

## Pasos

### Paso 1 — Estructura de los tres paquetes nuevos y del monorepo

- [x] Crear `packages/content-store`, `packages/catalog` y `packages/connectivity` con su `package.json` privado (`@melodify/content-store` 1.0.0, `@melodify/catalog` 1.1.0, `@melodify/connectivity` 1.0.0), su `tsconfig.json` con `extends: "../../tsconfig.base.json"`, `rootDir: "./src"`, `outDir: "./dist"` y su `src/index.ts` vacío todavía (NFR5.5).
- [x] Añadir las tres referencias nuevas a `tsconfig.json` de la raíz, junto a las cuatro existentes, en el orden de dependencia: `design-system`, `app-session`, `connectivity`, `content-store`, `catalog`, `app-shell`, `app`.
- [x] En `packages/content-store/package.json` no declarar ninguna dependencia; en `packages/catalog/package.json`, solo `@melodify/content-store` y `@melodify/connectivity`; en `packages/connectivity/package.json`, `expo-network` 57.0.3 (NFR3.6, NFR7.5).
- [x] En `packages/design-system/package.json` y `packages/app-shell/package.json`, subir `version` a `1.2.0` y actualizar la dependencia cruzada `@melodify/design-system` de `app-shell` a `1.2.0`; en `app/package.json`, subir `@melodify/design-system` y `@melodify/app-shell` a `1.2.0` y añadir los tres paquetes nuevos y `expo-network` 57.0.3, todo exacto (TS-01, C1 § Enmienda 9, C2 1.2.0).
- [x] `npm install` en la raíz y comprobar que el lockfile queda al día; anotar en `code-summary.md` que el árbol de dependencias solo gana `expo-network`.

**Historias**: ninguna todavía (andamiaje).

### Paso 2 — Arnés de pruebas: mapeos, umbrales y comando exacto de la unidad

- [x] En `jest.config.js`, añadir las tres entradas de `moduleNameMapper` —`^@melodify/content-store$`, `^@melodify/catalog$` y `^@melodify/connectivity$` hacia su `src`— y las tres entradas de `coverageThreshold` al 80 % de líneas para `./packages/content-store/src/**`, `./packages/catalog/src/**` y `./packages/connectivity/src/**` (NFR5.6; `logical-components.md` § Superficie).
- [x] Confirmar que `testMatch` ya recoge `packages/*/src/**/*.test.{ts,tsx}` y que `collectCoverageFrom` ya cubre `packages/*/src/**`; no hace falta tocarlos.
- [x] Verificar que el comando de la unidad corre en verde con una prueba de humo por paquete (una por cada `src/__tests__/` nuevo) y dejar escrito el comando exacto en `unit-test-instructions.md`.

**Historias**: ninguna (arnés).

### Paso 3 — Modelo de datos de C4: vistas, siembra y estado

- [x] `packages/content-store/src/views.ts` con `OpinionView`, `AuthorView`, `AuthorDetailView`, `CommentView`, `LikeView` y los tipos de resultado con código de C4 (§ C4 `components.schemas`).
- [x] `packages/content-store/src/seed.ts` con la siembra exacta de `functional-spec.md` § Semilla: 5 autores, 8 obras, 10 opiniones, 4 me gusta, 3 comentarios y 2 seguimientos, con edades relativas a `now` y los textos literales de la tabla (BR4.2).
- [x] `packages/content-store/src/store.ts` con la forma del estado (`authors`, `opinions`, `likes`, `comments`, `follows`, `revision`), el reductor puro y la construcción `createContentStore({ now?, seed? })`; el estado no guarda `isOwn`, `likedByMe` ni `followedByMe` (BR4.6).
- [x] `packages/content-store/src/index.ts` publica solo `createContentStore` y los tipos de `views.ts`; nada de React dentro del paquete (desviación registrada de ADR-010).

**Historias**: US2.1 (AC2.1.1), US4.1–US4.3 (datos de obra), US9.1 (AC9.1.2, AC9.1.3).

### Paso 4 — Pruebas del modelo de datos de C4

- [x] `packages/content-store/src/__tests__/seed.test.ts`, 8–10 pruebas: la siembra tiene 10 opiniones, 5 autores, 8 obras, 3 opiniones de `demo`, 2 seguidos, 4 me gusta y 3 comentarios (AC2.1.1, AC9.1.2); las edades se calculan contra un `now` fijo y no contra el reloj de la máquina (NFR5.7); `As It Was` no tiene opiniones y las ocho obras tienen `coverUrl: null`; el orden del feed por `createdAt` descendente coincide con la lista literal (BR4.5); `op-004` trae `updatedAt` posterior y es la única editada.
- [x] `packages/content-store/src/__tests__/store.test.ts`, 4–6 pruebas: dos almacenes construidos desde la misma siembra no comparten estado (NFR3.6); `seed` sustituye la siembra por una mínima de lista vacía y por una de una sola opinión; `revision` arranca en cero. Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.1), US4.2 (AC4.2.4), US9.1 (AC9.1.2, AC9.1.3).

### Paso 5 — Acceso a datos de C4: lecturas y suscripción

- [x] `listOpinions({ viewerId, workId?, authorId? })` con `200` y `422` sin `viewerId`, ordenada por `createdAt` descendente (BR4.5, C4 § `x-read-errors`).
- [x] `getOpinion({ opinionId, viewerId })` con `200`/`404`/`422`; `getAuthor({ authorId, viewerId })` con `200`/`404`/`422` y sus contadores `opinionCount`/`followingCount` (BR4.8, AC9.1.1).
- [x] `listFollowing({ authorId, viewerId })` con `200`/`404`/`422`; `listLikes({ opinionId })` y `listComments({ opinionId })` con `200`/`404` (alimentan U5 y U3, U2 solo los deja listos).
- [x] `subscribeContent(viewerId, listener)` que emite al establecerse, vuelve a emitir tras cada escritura con `{ revision, opinions }` y devuelve la baja; sin `viewerId` responde `422` (BR4.7, C4 `/changes`).
- [x] Calcular `isOwn`, `likedByMe` y `followedByMe` contra el `viewerId` en cada lectura, sin guardarlos en el estado (BR4.6).

**Historias**: US2.1 (AC2.1.3), US4.1–US4.3, US9.1 (AC9.1.1–AC9.1.3).

### Paso 6 — Pruebas del acceso a datos de C4

- [x] `packages/content-store/src/__tests__/reads.test.ts`, 12–14 pruebas: las tres lecturas de lista con y sin filtro y su orden; `422` sin `viewerId` en `listOpinions`, `getOpinion`, `getAuthor`, `listFollowing` y `subscribeContent`; `404` de una opinión y de un autor inexistentes; `getAuthor` devuelve los contadores de `demo` (3 opiniones, 2 siguiendo); `isOwn` es verdadero solo en las tres de `demo`; `likedByMe` refleja los me gusta de la cuenta (AC9.1.1–AC9.1.3, BR4.6).
- [x] `packages/content-store/src/__tests__/subscribe.test.ts`, 5–6 pruebas: la primera emisión llega al suscribirse y trae la siembra; una escritura emite con `revision` incrementada; la baja detiene las emisiones; dos suscriptores ven la misma revisión. Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.3), US4.1–US4.3, US9.1 (AC9.1.1–AC9.1.3).

### Paso 7 — Lógica de negocio de C4: escrituras y reglas

- [x] `createOpinion({ authorId, workId, workTitle, workArtist, text, rating })` con `201`, `409` si ya existe una opinión de esa persona sobre esa obra y `422` fuera de rango (BR4.3; la validación fina del formulario es de U3).
- [x] `updateOpinion({ opinionId, authorId, viewerId, text?, rating? })` con `200`, `403` si no es el autor, `404` si no existe y `422` fuera de rango; actualiza `updatedAt` (BR4.4, AC4.2.4).
- [x] `toggleLike({ opinionId, authorId })` con `200` y `{ opinionId, likeCount, likedByMe }`; `addComment({ opinionId, authorId, text })` con `201` y `422` con texto vacío (U3 los usará; la siembra ya trae los recibidos).
- [x] `toggleFollow({ authorId, followerId })` con `200` y `{ authorId, followedByMe, followerCount, viewerFollowingCount }`, `409` contra uno mismo (BR4.8).
- [x] Toda escritura sube `revision` y notifica a los suscriptores una sola vez; ninguna muta el estado anterior (estado inmutable).

**Historias**: US2.1 (AC2.1.3), US4.2 (AC4.2.4), US9.1 (AC9.1.1, AC9.1.2).

### Paso 8 — Pruebas de las escrituras de C4

- [x] `packages/content-store/src/__tests__/writes.test.ts`, 18–22 pruebas: `createOpinion` correcto (`201`, aparece la primera en el feed, `revision` sube), duplicado (`409`), valoración y texto fuera de rango (`422`); `updateOpinion` propio (`200`, `updatedAt` posterior y `createdAt` intacto), ajeno (`403`), inexistente (`404`); `toggleLike` pone y quita con el contador correcto (AC2.1.3, AC4.2.4, US7.1 en su base); `addComment` con texto válido y vacío; `toggleFollow` contra uno mismo (`409`) y el `viewerFollowingCount` de `demo` (BR4.8); ninguna escritura altera el objeto de estado anterior.
- [x] Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.3), US4.2 (AC4.2.4), US9.1 (AC9.1.1, AC9.1.2).

### Paso 9 — Lógica de negocio de C5: catálogo y decisión de portada

- [x] `packages/catalog/src/sample.ts` con las 8 obras de `functional-spec.md` § Obras, `origin: "sample"`, `coverUrl: null` y orden estable (BR5.1).
- [x] `packages/catalog/src/ports.ts` con `SpotifySessionPort`, `SpotifySearchPort`, `SpotifyResolvePort`, sus resultados y el agregado `CatalogPorts` (C5 § `x-ports`).
- [x] `packages/catalog/src/catalog.ts` con `createCatalog({ content, connectivity, session, search, resolve })`: `listSampleWorks`, `getWork` (`200`/`404`), `countOpinions` desde C4, `coverFor` (`url` solo con sesión conectada, conexión y `coverUrl`; si no, `initialBlock`), `searchWorks` (`{ status: "offline", works: [] }` sin puerto), `subscribe` con emisión inmediata y tras cada cambio, `getCoverFailure` y `retryCovers` (C5, BR5.3–BR5.5).
- [x] Sin puertos, `retryCovers` no hace nada y `getCoverFailure` es falso salvo que un doble fuerce el fallo (NFR3.11, `security-design.md` § NFR3.11).

**Historias**: US2.2 (AC2.2.2, AC2.2.3), US4.1 (AC4.1.1, AC4.1.4), US4.3 (AC4.3.3).

### Paso 10 — Pruebas del catálogo

- [x] `packages/catalog/src/__tests__/catalog.test.ts`, 16–20 pruebas: las 8 obras de ejemplo en orden y con `coverUrl` nulo (BR5.1); `getWork` con identificador válido e inválido (BR5.2); `countOpinions` coincide con C4 para `Bohemian Rhapsody` (2), `As It Was` (0) (BR5.4); `coverFor` con `session: null` → `initialBlock`, con sesión conectada y `coverUrl` → `url`, con sesión desconectada → `initialBlock`, con `online: false` → `initialBlock` (BR5.3); `searchWorks` sin puerto → `offline` sin tocar la red (BR5.5); `subscribe` emite al suscribirse y al forzar un cambio de portada; `getCoverFailure` y `retryCovers` sin puerto (NFR3.11).
- [x] Ejecutar y dejar en verde.

**Historias**: US2.2 (AC2.2.2–AC2.2.4), US4.1 (AC4.1.4), US4.3 (AC4.3.3).

### Paso 11 — Lógica de negocio de C6: conectividad y adaptador de `expo-network`

- [x] `packages/connectivity/src/connectivity.ts` con `createConnectivity({ network })`: `getNetworkState()` con `{ online, measuredAt }`, `subscribeNetwork(listener)` con emisión inmediata y tras cada cambio, y baja al desuscribirse (C6, BR6.1, BR6.2).
- [x] Si el adaptador falla o falta, la instancia arranca **en línea**, sin aviso, y registra `NETWORK_STATE_UNAVAILABLE` por el logger inyectado (BR6.3, NFR9.4).
- [x] `packages/connectivity/src/expo-network-adapter.ts`, **único archivo que importa `expo-network`**: `getState()` y `addListener()` traducen `isConnected`/`isInternetReachable` a un solo booleano; no leen SSID, IP ni tipo de red (NFR4.5).
- [x] `packages/connectivity/src/index.ts` publica `createConnectivity`, el adaptador y el tipo `NetworkAdapter` para las pruebas.

**Historias**: US2.2 (AC2.2.4) — el aviso de sin conexión que alimenta.

### Paso 12 — Pruebas de conectividad

- [x] `packages/connectivity/src/__tests__/connectivity.test.ts`, 8–10 pruebas: estado inicial emitido al suscribirse; un cambio del adaptador emite el nuevo estado; la baja deja de emitir; `measuredAt` es una fecha ISO; el adaptador que rechaza arranca en línea y registra `NETWORK_STATE_UNAVAILABLE` con el mensaje literal y sin datos de la persona (NFR4.6).
- [x] `packages/connectivity/src/__tests__/expo-network-adapter.test.ts`, 3–4 pruebas con `jest.mock("expo-network")`: `isConnected: true` y `isInternetReachable` distinto de `false` → en línea; `isConnected: false` → sin conexión; solo se leen esos dos campos (NFR4.5); `addListener` devuelve una baja que llama a `remove`. Ejecutar y dejar en verde.

**Historias**: US2.2 (AC2.2.4).

### Paso 13 — Superficie de los tres paquetes y vocabulario del logger

- [x] Completar los tres `src/index.ts` con su superficie exacta: C4 (`createContentStore` y sus tipos), C5 (`createCatalog`, `CatalogPorts` y los tres puertos, `WorkView`) y C6 (`createConnectivity`, `expo-network-adapter`, `NetworkAdapter`, `NetworkView`).
- [x] `app/src/bootstrap/logger.ts`: declarar `AppLogCode` (`SessionLogCode` más `CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE`) y `AppLogger`, manteniendo el objeto `logger` exportado y su implementación actual (NFR9.4, `security-design.md` § NFR9.4).
- [x] `app/src/bootstrap/ports.ts`: conservar los nombres que U1 publica —`CatalogPorts` y `catalogPorts` con los tres en `null`— e importar los tipos de `@melodify/catalog` con `import type` (TS-21, NFR3.11).

**Historias**: US2.1–US2.3, US4.1–US4.3, US9.1 (superficie que las hace posibles).

### Paso 14 — Pruebas de superficie y del logger

- [x] `packages/content-store/src/__tests__/index.test.ts`, `packages/catalog/src/__tests__/index.test.ts` y `packages/connectivity/src/__tests__/index.test.ts`: cada paquete expone exactamente lo que su contrato nombra y una construcción sin argumentos —o con los colaboradores mínimos— es usable.
- [x] `app/src/bootstrap/__tests__/logger.test.ts`: añadir que `const asSession: SessionLogger = logger;` compila, que los tres códigos nuevos se aceptan y que `warn` bajo `__DEV__` falso no llama a `console` (NFR9.4).
- [x] `app/src/bootstrap/__tests__/ports.test.ts`: sigue pasando sin cambios de aserción; los tres puertos siguen en `null` (NFR3.10, NFR3.11). Ejecutar y dejar en verde.

**Historias**: US2.1–US2.3, US4.1–US4.3, US9.1 (superficie y diagnóstico).

### Paso 15 — Interfaz (1): C1 1.2.0

- [x] `ErrorState` (`message`, `retryLabel`, `onRetry`) con el `TextButton` de reintento y área táctil de 44 (FR11.2).
- [x] `TextButton` (`label`, `onPress`, `tone?: "default" | "danger"`, `disabled?`), único botón de texto de la versión.
- [x] Enmiendas aditivas: `AppHeader.leftSlot?`, `EmptyState.body?`, y el estado `own` de `OpinionCard` en variante `detail` —fondo `primaryContainer`, etiqueta «Tu opinión» dentro de la tarjeta, «Editar» pintado desde `isOwn` (inerte sin `onEdit`) y línea de fechas— más `formatCalendarDate` exportado con el formato «d mmm aaaa» (AC4.2.1, AC4.2.4, AC9.1.5, AC2.3.2).
- [x] Exportar las tres piezas y `formatCalendarDate` desde `packages/design-system/src/index.ts` y subir la cabecera del archivo a 1.2.0; `data-testid` en cada botón nuevo.

**Historias**: US2.3 (AC2.3.2), US4.2 (AC4.2.1, AC4.2.4), US9.1 (AC9.1.5).

### Paso 16 — Pruebas de C1 1.2.0

- [x] `packages/design-system/src/__tests__/error-state.test.tsx` y `text-button.test.tsx`, 6–8 pruebas: `ErrorState` pinta el mensaje y «Reintentar», llama a `onRetry`; `TextButton` en tono `danger` y deshabilitado no dispara (FR11.2).
- [x] `own-opinion.test.tsx`, 5–6 pruebas: `isOwn` pinta «Tu opinión», «Editar» y la línea de fechas; sin `onEdit` la acción existe y no responde; `isOwn: false` no pinta ni etiqueta ni «Editar» (AC4.2.1, AC4.2.4); una opinión editada muestra «Creada el …» y «Editada el …» separadas por « · ».
- [x] `format-calendar-date.test.ts`, 3–4 pruebas con fechas fijas; `AppHeader.leftSlot` y `EmptyState.body` en las pruebas de esos componentes. Ejecutar y dejar en verde.

**Historias**: US2.3 (AC2.3.2), US4.2 (AC4.2.1, AC4.2.4), US9.1 (AC9.1.5).

### Paso 17 — Interfaz (2): C2 1.2.0, la pila que conserva la raíz

- [x] En `packages/app-shell/src/AppShell.tsx`, pintar **todas** las entradas de la pila de la pestaña y ocultar con `display: none` las de debajo, en lugar de pintar solo la última; la raíz sigue montada (AC2.3.2, C2 § Revisión 12).
- [x] La cabecera de detalle pasa a `AppHeader` con `leftSlot` «‹ Volver» y el título que fija `setHeader`; al desapilar, el título vuelve a vaciarse.
- [x] Subir la cabecera del paquete a 1.2.0 en el comentario del archivo; ninguna prop ni exportación cambia (C2 1.2.0).

**Historias**: US2.3 (AC2.3.1, AC2.3.2), US4.1 (AC4.1.6).

### Paso 18 — Pruebas de C2 1.2.0

- [x] `packages/app-shell/src/__tests__/stack.test.tsx`, 6–8 pruebas: abrir un detalle mantiene montada la raíz (su estado sobrevive), la raíz queda oculta, «‹ Volver» desapila y devuelve a la raíz con su estado, y el título de la cabecera se limpia al volver (AC2.3.2).
- [x] Ejecutar y dejar en verde; las pruebas existentes de la cáscara siguen pasando sin cambios.

**Historias**: US2.3 (AC2.3.1, AC2.3.2).

### Paso 19 — Interfaz (3): estado, mapeo y componentes compartidos

- [x] `app/src/state/useViewerId.ts` (lee `appSession.getSession()` y se refresca con `subscribeSession`; `null` hasta que llega) y `useContent.ts` (`useEffect` + `useState`, `loading` inicial, `attempt` para «Reintentar», `error` solo si la suscripción lanza, `CONTENT_SUBSCRIBE_FAILED`) (NFR8.4).
- [x] `app/src/state/useCatalog.ts` devuelve solo el contador de cambios (la primera emisión no cuenta) y lee la instancia estable; `useNetwork.ts` se suscribe a `shellServices.network` (NFR8.5, BR6.4).
- [x] `app/src/state/opinionCardModel.ts` con `toOpinionCardModel({ opinion, cover })`, único mapeo, `coverUrl` solo si la decisión es `url` (BR7.10).
- [x] `app/src/components/OfflineBanner.tsx` (texto único + «Reintentar» → `retryCovers`) y `WorkHeader.tsx` (`CoverArt` 96, título, artista, `RatingStars` con la media y «N opiniones», singular incluido).

**Historias**: US2.1 (AC2.1.1, AC2.1.4), US2.2 (AC2.2.2–AC2.2.4), US4.1 (AC4.1.1, AC4.1.2, AC4.1.4), US9.1 (AC9.1.1, AC9.1.6).

### Paso 20 — Pruebas de hooks, mapeo y componentes compartidos

- [x] `app/src/state/__tests__/use-content.test.tsx`, 6–8 pruebas: `loading` inicial y `ready` sin avanzar temporizadores con el `viewerId` resuelto (NFR8.4); sin `viewerId` no se suscribe; «Reintentar» vuelve a pasar por `loading`; una suscripción que lanza deja `error` y registra `CONTENT_SUBSCRIBE_FAILED`; desmontar deja la baja.
- [x] `use-catalog.test.tsx`, 3–4 pruebas: la primera emisión no incrementa y cada cambio sí; `use-network.test.tsx`, 3 pruebas: valor inicial y cambio.
- [x] `opinion-card-model.test.ts`, 4–5 pruebas: un `cover` de tipo `url` pone la URL y `initialBlock` deja `null`; los campos derivados se copian sin recalcular (BR7.10); `offline-banner.test.tsx` y `work-header.test.tsx`, 4–5 pruebas cada uno (singular y plural de «opinión»). Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.4), US2.2 (AC2.2.2–AC2.2.4), US4.1 (AC4.1.1, AC4.1.2), US9.1 (AC9.1.6).

### Paso 21 — Interfaz (4): Inicio completo

- [ ] `app/src/screens/inicio/InicioHeader.tsx` con `AppHeader` «Inicio» y el chip «Conectado»/«Conectar», sin acción en U2 (BR7.9).
- [ ] `InicioView.tsx` puro con `{ status, cards, online, metadataError, spotifyStatus, onOpenOpinion, onRetry, onRetryCovers, onCreate }`: `FlatList` con `keyExtractor` por `opinionId`, `ListHeaderComponent` con los banners de metadatos y sin conexión en ese orden, `ListEmptyComponent` con el vacío, 3 esqueletos en `loading` y `ErrorState` en `error` (NFR8.7, BR7.1–BR7.6).
- [ ] `InicioScreen.tsx` contenedor: `useViewerId`, `useContent`, `useNetwork`, `useCatalog`, memo con clave `(opinions, revision, catalogVersion, online)`, `openOpinionDetail` y `goToTab({ name: "crear" })` (NFR8.5).
- [ ] Eliminar `app/src/screens/inicio/seed.ts` y su importación; la siembra vive en C4 (BR4.1).

**Historias**: US2.1 (AC2.1.1–AC2.1.6), US2.2 (AC2.2.2–AC2.2.4), US2.3 (AC2.3.1).

### Paso 22 — Pruebas de Inicio

- [ ] `inicio-view.test.tsx`, 10–12 pruebas: `loading` pinta 3 esqueletos y «Para ti»; `ready` pinta las 10 tarjetas con autor, obra, valoración y texto; vacío con «Crear opinión» que llama a `onCreate`; error con el texto exacto y «Reintentar»; banners de metadatos y de sin conexión en orden y sin tapar la lista; «Conectar» en el chip (AC2.1.1–AC2.1.6, AC2.2.4).
- [ ] `inicio-screen.test.tsx`, 6–8 pruebas de integración con un C4 y un C5 reales sembrados: 10 tarjetas, `coverFor` llamado una vez por opinión y no desde la tarjeta, 10 llamadas al cambiar la red y ninguna al repintar sin cambio; tocar una tarjeta llama a `openOpinionDetail` con su `opinionId` (AC2.1.3, AC2.3.1, NFR8.5). Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.1–AC2.1.6), US2.2 (AC2.2.2–AC2.2.4), US2.3 (AC2.3.1).

### Paso 23 — Interfaz (5): Detalle de obra

- [ ] `useDetalleObra.ts` con `(workId, viewerId)`: `getWork`, `listOpinions({ workId, viewerId })`, `countOpinions`, portada y media; relee solo al cambiar la obra o la revisión; portada una vez por `(workId, catalogVersion, online)` (NFR8.5).
- [ ] `DetalleObraView.tsx` puro con las cuatro variantes —mía + ajenas, mía sola, ajenas sin mía, sin opiniones—, la propia primero en estado `own`, «Otras opiniones», «Nadie más ha opinado todavía.», «Todavía nadie ha opinado sobre esta obra.», «Opinar sobre esta obra» solo sin opinión propia, esqueletos y `ErrorState` (BR8.1–BR8.8).
- [ ] `DetalleObraScreen.tsx` contenedor: `setHeader({ title: "Detalle de obra" })`, `useNetwork`, `openCreate({ workId })` y «Reintentar».

**Historias**: US4.1 (AC4.1.1–AC4.1.6), US4.2 (AC4.2.1–AC4.2.4), US4.3 (AC4.3.1–AC4.3.3).

### Paso 24 — Pruebas del detalle de obra

- [ ] `detalle-obra-view.test.tsx`, 10–12 pruebas con las cinco variantes de la siembra: `Bohemian Rhapsody` (propia + ajena, media 5), `Blinding Lights` (propia con «Creada el …» y «Editada el …»), `bad guy` (ajena sin propia y botón), `Smells Like Teen Spirit` (propia sin ajenas), `As It Was` (sin opiniones y botón); esqueletos y error con «Reintentar» (AC4.1.1, AC4.1.3, AC4.1.6, AC4.2.1–AC4.2.4, AC4.3.1).
- [ ] `detalle-obra-screen.test.tsx`, 5–6 pruebas de integración: «Opinar sobre esta obra» llama a `openCreate` con el `workId`; sin conexión se pinta el banner y la identidad sigue; `coverFor` se llama una vez; «Editar» existe y no navega (AC4.3.2, AC4.3.3, AC2.2.4). Ejecutar y dejar en verde.

**Historias**: US4.1, US4.2, US4.3.

### Paso 25 — Interfaz (6): Detalle de opinión

- [ ] `useDetalleOpinion.ts` con `(opinionId, viewerId)`: `getOpinion`, `getWork` con degradación al título y artista de la opinión si da `404`, `countOpinions` y media; sin `CONTENT_READ_FAILED` por un `404` (BR5.2, NFR9.4).
- [ ] `DetalleOpinionView.tsx` puro: `WorkHeader`, tarjeta `detail` completa sin recortar, estados de carga y error, `OfflineBanner`.
- [ ] `DetalleOpinionScreen.tsx` contenedor con `setHeader({ title: "Detalle de opinión" })`, `useNetwork` y «Reintentar».

**Historias**: US2.3 (AC2.3.1–AC2.3.3), US4.1 (AC4.1.2, AC4.1.4), US9.1 (AC9.1.4).

### Paso 26 — Pruebas del detalle de opinión

- [ ] `detalle-opinion.test.tsx`, 10–12 pruebas: el texto completo se pinta sin recortar (AC2.3.3); una opinión ajena no pinta «Editar»; una propia pinta «Editar» y las fechas (AC9.1.4); una obra fuera del catálogo usa el título y artista de la opinión y el bloque con la inicial (BR5.2); un `404` pinta «No pudimos cargar esta opinión.» con «Reintentar» y **no** registra `CONTENT_READ_FAILED`; un almacén que lanza sí lo registra; esqueletos y banner sin conexión. Ejecutar y dejar en verde.

**Historias**: US2.3 (AC2.3.1–AC2.3.3), US4.1 (AC4.1.2), US9.1 (AC9.1.4).

### Paso 27 — Interfaz (7): Perfil

- [ ] `usePerfil.ts` con `viewerId`: `getAuthor`, `listFollowing` y las opiniones propias ordenadas de la más reciente a la más antigua.
- [ ] `PerfilView.tsx` puro: avatar de 72 con la inicial, nombre y `@demo`, «3 opiniones · 2 siguiendo» con singular correcto, «Mis opiniones» en variante `compact`, vacío con «Crear opinión», `ErrorState`, esqueletos, «Cerrar sesión» como `TextButton` en tono de error; **sin** tarjeta de Spotify (BR9.1–BR9.9).
- [ ] `PerfilScreen.tsx` contenedor: `useViewerId`, `usePerfil`, `useNetwork`, `openOpinionDetail`, `goToTab({ name: "crear" })` y `appSession.signOut()` (R-01: la instancia única de `session.ts`).

**Historias**: US9.1 (AC9.1.1–AC9.1.7).

### Paso 28 — Pruebas de Perfil

- [ ] `perfil-view.test.tsx`, 8–10 pruebas: identidad y contadores exactos (AC9.1.1, AC9.1.2); «3 opiniones» y «2 siguiendo» con las tres tarjetas en `compact` (AC9.1.3); vacío con acción (AC9.1.5); esqueletos (AC9.1.6); error con «Reintentar» (AC9.1.7); no hay tarjeta de Spotify (AC9.1.8 sigue `Deferred`).
- [ ] `perfil-screen.test.tsx`, 4–5 pruebas: tocar una opinión llama a `openOpinionDetail` (AC9.1.4); «Cerrar sesión» llama a `signOut` de la sesión inyectada y no borra contenido; sin conexión se pinta el banner y la identidad sigue. Ejecutar y dejar en verde.

**Historias**: US9.1 (AC9.1.1–AC9.1.7).

### Paso 29 — Composición: instancias, servicios, registro y arranque

- [ ] `app/src/bootstrap/instances.ts` (nuevo): construye **una sola vez** `contentStore`, `connectivity` y `catalog` —con los tres puertos en `null` y el adaptador real de `expo-network`— y los exporta, siguiendo el patrón de `session.ts` (TS-18, R-01).
- [ ] `app/src/bootstrap/shell-services.ts`: `network.online` y `network.subscribe` salen de la instancia de conectividad; Spotify y comentarios siguen con sus valores por defecto (BR6.4, C2 `default_by_owner`).
- [ ] `app/src/bootstrap/App.tsx`: registra Inicio completo y Perfil como raíces, y los dos detalles `{ kind: "work" }` y `{ kind: "opinion" }` en Inicio y `{ kind: "opinion" }` en Perfil (tabla de registro de `frontend-components.md`).
- [ ] Mantener Login fuera de la barra y la decisión Login/Inicio con `appSession` sin cambios.

**Historias**: US2.1–US2.3, US4.1–US4.3, US9.1 (integración).

### Paso 30 — Pruebas de composición e integración de límites

- [ ] `app/src/bootstrap/__tests__/instances.test.ts`, 4–5 pruebas: una sola instancia por dominio, el catálogo recibe la misma de contenido y de conectividad, y los puertos siguen en `null` (NFR1.8, NFR3.10).
- [ ] `shell-services.test.ts` ampliado: la red responde al cambio del adaptador y deja de ser el valor fijo de U1 (BR6.4).
- [ ] `app-bootstrap.test.tsx` ampliado, 5–6 pruebas de integración: sesión válida → Inicio con 10 tarjetas; abrir un detalle desde Inicio mantiene la raíz y «‹ Volver» devuelve al feed; sin conexión aparece el banner en Inicio, el detalle y Perfil; Perfil → detalle de opinión → «Editar» visible. Ejecutar y dejar en verde.

**Historias**: US2.1 (AC2.1.1), US2.3 (AC2.3.1, AC2.3.2), US4.1–US4.3, US9.1 (AC9.1.4).

### Paso 31 — Configuración de entorno y build

- [ ] `eslint.config.js`: añadir `expo-network` restringido a `packages/connectivity/src/expo-network-adapter.ts`; `@typescript-eslint/no-restricted-imports` con `@melodify/spotify` prohibido en `packages/catalog/src/**` **sin** `allowTypeImports` y `@melodify/catalog` prohibido en `packages/spotify/src/**` **con** `allowTypeImports: true` (NFR3.11; la segunda regla solo morderá cuando U4 cree el paquete).
- [ ] Crear `.commitlintrc.json` en la raíz con `{ "extends": ["@commitlint/config-conventional"] }` y añadir `@commitlint/cli` y `@commitlint/config-conventional` como `devDependencies` exactas de la raíz, con el lockfile (infrastructure-design § Lo que esta unidad cambia).
- [ ] `.github/workflows/ci.yml`: retirar `--passWithNoTests` del paso de pruebas (el script ya es `jest --coverage`, así que la cobertura y los umbrales se evalúan hoy) y añadir al job `code-quality` —que ya ejecuta `npm ci`— el paso que valida el **título del PR** con `commitlint` (npx con el binario instalado) sobre `${{ github.event.pull_request.title }}`; ningún paso de build, firma, publicación ni despliegue (Q1–Q6 = A).
- [ ] `README.md`: comprobar que el enlace a `.commitlintrc.json` deja de estar roto; no se toca nada más del archivo del proyecto.
- [ ] `npm run typecheck`, `npm run lint` y `npm test` en verde sobre el árbol completo; anotar cualquier aviso y su causa.

**Historias**: ninguna funcional (NFR3.11, NFR5.5–5.7, CI).

### Paso 32 — Documentación y trazabilidad

- [ ] `code-summary.md` con archivos creados y modificados, decisiones de implementación, desviaciones registradas (C4 sin React frente a ADR-010, detalle de opinión en U2, `backAtRoot` de la cáscara), cobertura obtenida por árbol y pruebas escritas pero no ejecutadas, con su razón.
- [ ] `source-manifest.json` con **todas** las rutas de código que esta unidad crea, modifica o elimina, incluidas las de configuración.
- [ ] `traceability.json` generado con `sensor-traceability --stage code-generation --unit u2-content-core --write-upstream`; cada `ACx.y.z`, `NFRx.y` y `BRx.y` con su archivo real; `AC2.2.1` y `AC9.1.8` quedan `Deferred` con la razón de la especificación (la portada real y la tarjeta de Spotify llegan en U4).
- [ ] Pasar `sensor-traceability` y `sensor-required-sections` en verde antes de la revisión, y comprobar que las pruebas de U1 siguen verdes sin haber sido reescritas.

**Historias**: US2.1–US2.3, US4.1–US4.3, US9.1 (traza).

## Trazabilidad historia → pasos

| Historia | Criterios | Pasos del plan |
|---|---|---|
| US2.1 — Ver el feed de opiniones | AC2.1.1–AC2.1.6 | 3–6, 15–16, 19–22, 29–30, 32 |
| US2.2 — Portadas y metadatos según la sesión | AC2.2.1 (`Deferred`), AC2.2.2–AC2.2.4 | 9–12, 19–24, 30, 32 |
| US2.3 — Abrir el detalle desde una tarjeta | AC2.3.1–AC2.3.3 | 15–18, 21–22, 25–26, 29–30, 32 |
| US4.1 — Ver una obra con opiniones de otros | AC4.1.1–AC4.1.6 | 3–6, 9–10, 15–16, 19–24, 29–30, 32 |
| US4.2 — Ver mi opinión junto a las de otros | AC4.2.1–AC4.2.4 | 3–8, 15–16, 23–24, 29–30, 32 |
| US4.3 — Ver una obra sin opiniones | AC4.3.1–AC4.3.3 | 3–6, 9–10, 23–24, 29–30, 32 |
| US9.1 — Identidad, contadores y opiniones | AC9.1.1–AC9.1.7 (AC9.1.8 `Deferred`) | 3–8, 15–16, 19–20, 27–30, 32 |

## Riesgos y notas de ejecución

- **`expo-network` 57.0.3 es la única dependencia nueva** y corre en Expo Go sin `prebuild` (CT-05, NFR7.4). Si `npx expo install` escribiera un rango, se reescribe a exacto antes del commit (TS-01).
- **La pila de C2 es el cambio de mayor riesgo**: si se pinta solo la última entrada, AC2.3.2 se pierde sin que ninguna prueba de pantalla lo note. El Paso 18 comprueba el montaje de la raíz y su estado, no solo que se vea el detalle.
- **Cobertura por árbol**: `app/src/bootstrap/` **no** se excluye, y los tres paquetes nuevos llevan umbral propio. El comando de la unidad con `--coverage` puede salir distinto de cero solo por el umbral mientras falten árboles; se registra en `code-summary.md` y no se toca el umbral, porque Build and Test mide el suelo sobre la suite completa.
- **Ninguna prueba sale a la red ni toca el sistema operativo**: `expo-network` se dobla con `jest.mock`, y las llamadas a Spotify no existen en esta unidad.
- **El detalle de obra no tiene entrada visible**: se registra y se prueba, pero ninguna pantalla lo abre hasta U4 (Q3 = A). No es un defecto que no aparezca en el recorrido del teléfono.
- **Textos exactos**: los de `functional-spec.md` § Textos exactos se copian literalmente; una errata se corrige en la especificación y en la prueba a la vez.
- **`.commitlintrc.json` y las dependencias entran en el mismo PR** que el resto, porque el paso del título se ejecuta en ese PR y necesita el binario ya instalado.
