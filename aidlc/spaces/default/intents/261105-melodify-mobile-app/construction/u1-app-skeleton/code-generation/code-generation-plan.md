# Plan de generación de código — U1 `u1-app-skeleton`

> **Provenance**: deriva de `construction/u1-app-skeleton/functional-design/functional-spec.md` (F1–F6, BR1–BR3, textos exactos), `nfr-requirements/` (NFR1–NFR9, TS-01–TS-15), `nfr-design/` (performance-design, security-design, logical-components, NFR4.3), `inception/contract-design/contract-summary.md` (C1 v1.0.0, C2 v1.0.0, C3 v1.1.0, estructura del monorepo, cobertura por árbol), `inception/units-generation/unit-of-work.md` (§ U1) e `inception/requirements-analysis/requirements.md`.
> Fecha: 2026-11-11. Etapa: Code Generation · Unidad: `u1-app-skeleton` · Agente: aidlc-developer-agent · Profundidad: Standard · Estrategia de prueba: Standard · Postura: test-after (equipo, `team.md`).

## Summary

- Builds: el esqueleto de Melodify — monorepo Expo, tema, cáscara de cinco pestañas, login simulado con sesión recordada e Inicio con una tarjeta sembrada.
- Touches: `package.json`, `jest.config.js`, `tsconfig.json`, `eslint.config.js`, `.npmrc`, `app/` (`app.json`, `index.ts`, `src/bootstrap/`, `src/screens/`) y `packages/design-system`, `packages/app-shell`, `packages/app-session`.
- Tests: unos 120–140, en Jest con `jest-expo` y Testing Library: guarda del registro, adaptador del almacenamiento, lógica de sesión, logger y servicios por defecto, tokens y contraste, los doce componentes de C1, la navegación de la cáscara y el arranque; más cuatro pruebas de integración de los límites arranque→Login/Inicio y Login→Inicio.

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

La capa se implementa y **después** se escriben y ejecutan sus pruebas, antes de pasar a la siguiente. El perfil del contrato nombra cinco capas; en esta unidad la de «API/endpoint» es la superficie en proceso de C3 (`packages/app-session/src/index.ts`), que se implementa junto con la lógica de negocio y se prueba con ella: no hay HTTP, ni rutas, ni capa de transporte que probar aparte. Se deja anotado para no inventar una capa que no existe.

Cada paso de prueba ejecuta el comando de la unidad y no pasa al siguiente si queda rojo.

## Pasos

### Paso 1 — Estructura del monorepo y esqueleto de configuración

- [x] Crear la raíz del monorepo de espacios de trabajo: `package.json` con `workspaces: ["app", "packages/*"]` y los tres scripts del CI (`test` → `jest --coverage`, `typecheck` → `tsc -b`, `lint` → `eslint .`), más `@melodify/app` enlazado con `npm install`.

- [x] `tsconfig.json` de raíz con `strict: true` y `references` a cada paquete; un `tsconfig.json` por paquete con `composite: true` y su `rootDir`/`outDir`.

- [x] `app/package.json` privado (`0.0.0`), con `expo`, `react`, `react-native` y los módulos de Expo **exactos** del SDK 57 (`npx expo install`, sin `^` ni `~`), y `.npmrc` en la raíz con `save-exact=true`.

- [x] `app/app.json` con `name`, `slug`, `scheme: "melodify"` (A6, punto de integración de U4), `newArchEnabled` según el SDK y `userInterfaceStyle: "automatic"` (NFR6.3).

- [x] `app/index.ts` como punto de entrada del runtime: registra la app y llama a `SplashScreen.preventAutoHideAsync()` (NFR8.2, security-design § arranque).

- [x] `app/babel.config.js` (`babel-preset-expo`) y las entradas de `.gitignore` para `.env`, `.env.*` (con la excepción de `.env.example`) y los artefactos de compilación.

- [x] `.env.example` con `EXPO_PUBLIC_SPOTIFY_CLIENT_ID=` **vacía** y ningún client secret (NFR3.1, security-design § NFR3.1).

**Historias**: ninguna todavía (andamiaje).

### Paso 2 — Arnés de pruebas mínimo (antes de la primera prueba ejecutable)

- [x] `jest.config.js` de raíz con `preset: "jest-expo"`, un solo proyecto que incluye `app/` y `packages/*`, `collectCoverageFrom` explícito (`app/src/**/*.{ts,tsx}`, `packages/*/src/**/*.{ts,tsx}`), exclusiones de TS-10 (`**/*.d.ts`, `**/__tests__/**`, `**/*.test.{ts,tsx}`, `**/jest.setup.*`, `app/index.ts`) y `coverageThreshold` **por árbol** al 80 % de líneas para `./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**` y `./packages/app-session/src/**` (las cuatro que esta unidad crea; las demás se añaden cuando su unidad las cree).

- [x] `jest.setup.js` con `@testing-library/react-native` y los dobles globales mínimos (`expo-splash-screen`, `expo-secure-store`).

- [x] Verificar que el comando de la unidad corre en verde en vacío y dejarlo escrito en `unit-test-instructions.md`.

**Historias**: ninguna (arnés).

### Paso 3 — Modelo: el registro de sesión y su guarda (`@melodify/app-session`)

- [x] `SessionRecord` (`authorId: "demo"`, `startedAt: string`) y `parseSessionRecord(raw: string | null): SessionRecord | null`, función pura y sin dependencias: `null` en vacío, JSON ilegible, objeto que no es objeto, `authorId` distinto de `demo` y `startedAt` que no sea ISO 8601 con zona; construye un objeto nuevo y descarta campos extra (NFR3.5, security-design § La guarda).

- [x] `storage-keys.ts` con `SESSION_STORAGE_KEY = "melodify.session"` y nada más (NFR3.3, una clave por dueño).

**Historias**: US1.2 (AC1.2.1, AC1.2.3).

### Paso 4 — Pruebas del modelo

- [x] `packages/app-session/src/__tests__/parse-session-record.test.ts`, 6–8 pruebas: `null`, cadena vacía (pruebas 1–2), JSON roto, objeto sin `authorId`, `authorId` distinto de `demo`, `startedAt` ilegible, registro válido (devuelve el objeto), registro con campos extra (los descarta) (pruebas 3–8). Ejecutar y dejar en verde.

**Historias**: US1.2 (AC1.2.1, AC1.2.3).

### Paso 5 — Acceso a datos: adaptador del almacenamiento seguro

- [x] `secure-store-adapter.ts`, **único archivo que importa `expo-secure-store`**: `SecureStorePort` (`getItemAsync`, `setItemAsync`, `deleteItemAsync`) y el adaptador real con la clave de la sesión; `expo-secure-store` declarado en `packages/app-session/package.json` (NFR3.3, R-02 de la revisión de NFR Design).

- [x] Traducir los rechazos del módulo nativo a los códigos de `getSession`/`signIn`/`signOut` sin lanzar hacia arriba.

**Historias**: US1.1 (AC1.1.3), US1.2 (AC1.2.2).

### Paso 6 — Pruebas del acceso a datos

- [x] `packages/app-session/src/__tests__/secure-store-adapter.test.ts` con `jest.mock("expo-secure-store")`: lee, escribe y borra **solo** `melodify.session` (pruebas 1–3); propaga el rechazo como código de fallo, no como excepción (pruebas 4–5); no toca ninguna otra clave (prueba 6). Ejecutar y dejar en verde.

**Historias**: US1.1 (AC1.1.3), US1.2 (AC1.2.2).

### Paso 7 — Lógica de negocio: sesión, logger y servicios por defecto

- [x] `createAppSession({ store?, logger? })` en `packages/app-session/src/`: `getSession` (`200` con `SessionView`, `503` si la lectura falla), `signIn` (`200` solo si la escritura terminó bien, `401` con credenciales distintas tras recortar espacios, `503` si el guardado falla y **sin** entrar), `signOut` (`204`, borra la clave; si el borrado falla responde `204` igualmente y lo registra) y `subscribeSession` (emite el valor actual al suscribirse y tras cada cambio) — C3 v1.1.0.

- [x] `SessionLogCode` y `SessionLogger` exportados por el paquete; logger silencioso por defecto, de modo que `createAppSession()` sin argumentos es válido y las pruebas no construyen uno.

- [x] `packages/app-session/src/index.ts` con la superficie pública de C3 1.1.0 (`getSession`, `signIn`, `signOut`, `subscribeSession`, `createAppSession`, `SessionLogger`, `SessionLogCode`, `SecureStorePort`, `parseSessionRecord`, `SESSION_STORAGE_KEY`).

- [x] `app/src/bootstrap/logger.ts`: implementa `SessionLogger` con `warn` (bajo `__DEV__`) y `error` (siempre), prefijo `[melodify]` y firma cerrada a dos cadenas (NFR9.1).

- [x] `app/src/bootstrap/shell-services.ts`: los valores por defecto de C2 — red `online: true` con `subscribe` nula, Spotify `disconnected` con acciones nulas y hoja de comentarios vacía (`opinionId: null`, `status: "empty"`) (C2, NFR1).

**Historias**: US1.1 (AC1.1.2, AC1.1.3), US1.2 (AC1.2.2), US1.3 (AC1.3.2, AC1.3.4).

### Paso 8 — Pruebas de la lógica de negocio

- [x] `packages/app-session/src/__tests__/app-session.test.ts`, contra un doble en memoria del almacenamiento: `getSession` con registro válido → `200`/`signedIn`; con vacío → `200`/`signedOut`; con registro inválido → `200`/`signedOut` y `SESSION_RECORD_INVALID`; con `503` → `503` y `SESSION_READ_FAILED` (pruebas 1–8).

- [x] `signIn` correcto → `200`, escribe `melodify.session` y no guarda la contraseña; credenciales malas → `401` sin escribir (pruebas 9–11); `signIn` con `503` → `503`, no entra y registra `SESSION_SAVE_FAILED` (prueba 12); `signOut` → `204`, borra la clave y no toca ninguna otra (pruebas 13–14); `signOut` con borrado fallido → `204` y `SESSION_DELETE_FAILED` (prueba 15); `subscribeSession` emite al suscribirse y tras cada cambio, y la baja deja de emitir (pruebas 16–17).

- [x] `app/src/bootstrap/__tests__/logger.test.ts`: con `__DEV__` verdadero registra `warn` y `error`; con `__DEV__` falso solo `error` (NFR9.1, pruebas 18–19).

- [x] `app/src/bootstrap/__tests__/shell-services.test.ts`: los tres servicios tienen la forma de C2 y sus acciones no lanzan; la hoja arranca vacía (pruebas 20–21).

- [x] `packages/app-session/src/__tests__/index.test.ts`: la superficie pública expone exactamente los símbolos de C3 1.1.0 y `createAppSession()` sin argumentos construye una sesión usable (pruebas 22–23). Ejecutar todo y dejar en verde.

**Historias**: US1.1 (AC1.1.2, AC1.1.3, AC1.1.4), US1.2 (AC1.2.1–AC1.2.3), US1.3 (AC1.3.2, AC1.3.4).

### Paso 9 — Frontend (1): tokens, tema y contraste (`@melodify/design-system`)

- [x] `tokens.ts` con `color`, `type`, `space`, `radius` y `size` completos, con los valores de `design-system-mapping.md` y los roles semánticos de C1 (claro y oscuro); `size.touch = 44` como mínimo (NFR6.2).

- [x] `ThemeProvider` y `useTheme()`: `useColorScheme()` del sistema, `null` tratado como claro, sin selector ni persistencia (NFR6.3).

- [x] `contrast.ts`: utilidad de ratio de contraste por la fórmula de luminancia relativa de WCAG (NFR6.1, Q4 = A), exportada para razonar sobre pares nuevos.

**Historias**: ninguna funcional (transversal a US1.1–US1.3).

### Paso 10 — Pruebas del sistema de diseño (1)

- [x] `packages/design-system/src/__tests__/contrast.test.ts`: cuatro pares de token por tema (texto normal y texto grande/icono) por encima de 4.5:1 y 3:1, claro y oscuro; un par insuficiente falla el cálculo (pruebas 1–5).

- [x] `packages/design-system/src/__tests__/theme.test.tsx`: `null` → claro; claro y oscuro devuelven los roles correctos; `useTheme` fuera del proveedor falla con un mensaje en español (pruebas 6–9). Ejecutar y dejar en verde.

**Historias**: ninguna funcional (NFR6.1, NFR6.3).

### Paso 11 — Frontend (2): los doce componentes de C1 1.0.0

- [x] `AppHeader` (`title`, `rightSlot`), `BottomTabBar` (`items`, `activeIndex`, `onSelect`; 44×44 por destino, etiqueta siempre visible, activo por color **e** icono relleno — NFR6.2, NFR6.4), `OpinionCard` (`variant`, `isOwn`, acciones opcionales; texto a tres líneas con elipsis), `CoverArt` (`title`, `coverUrl: null` → bloque con la inicial, nunca hueco roto — FR11.3), `RatingStars`, `Avatar`, `SocialActionBar`.

- [x] `TextField` (etiqueta, valor, error en línea, `secureTextEntry` cuando se pida, controles de 44×44), `PrimaryButton` (`disabled`, `label` que cambia a «Reintentar»), `EmptyState`, `Banner`, `Skeleton`, y el tipo `TabItem` y los modelos de presentación de C1 (`OpinionCardModel`, `AuthorSummary`, `WorkSummary`, `CommentModel`).

- [x] `data-testid` en cada elemento interactivo (botón, campo, pestaña, control de ojo, estrella) para la automatización.

**Historias**: US1.1 (formulario), US1.2/US1.3 (barra y tarjeta).

### Paso 12 — Pruebas del sistema de diseño (2)

- [x] `BottomTabBar`: cinco destinos en orden, activo por color e icono relleno, etiqueta siempre visible, `onSelect` recibe el índice y cada área táctil mide ≥ 44 (pruebas 1–6).

- [x] `OpinionCard`: variante `feed` pinta portada con inicial, título, artista, estrellas, autor y contadores; `isOwn: false` no muestra «Editar»; sin `onLike`/`onComment` las acciones no responden (pruebas 7–11).

- [x] `CoverArt` con `coverUrl: null` pinta la inicial (prueba 12); `TextField` pinta el error en línea y oculta la contraseña (pruebas 13–14); `PrimaryButton` deshabilitado no dispara `onPress` y pinta la etiqueta recibida (pruebas 15–16); `EmptyState`, `Banner`, `AppHeader`, `RatingStars`, `Avatar`, `SocialActionBar` y `Skeleton` pintan el texto y los contadores que reciben (pruebas 17–23). Ejecutar y dejar en verde.

**Historias**: US1.1, US1.2, US1.3 (piezas compartidas).

### Paso 13 — Frontend (3): la cáscara (`@melodify/app-shell`)

- [x] `AppShell({ screens, initialRoute, services })`: un `NavigationContainer`, cinco pestañas hermanas en el orden recibido, una pila por pestaña, `GlobalServices` (snackbar, `setHeader`, `openWorkDetail`, `openOpinionDetail`, `openCreate`, `openEdit`, `closeCreate`, `goToTab`), `useShellServices()` y `useGlobalServices()` (C2).

- [x] Login vive **fuera** de la barra: la cáscara expone la rama de sesión y no monta la barra en Login (BR1.5, NFR2.1).

- [x] `CreateEntry` y `useCreateEntry()` con el valor por defecto vacío; el tipo `DetailScreen` y la operación que apila el detalle dentro de la pestaña de origen, sin pantalla de detalle (C2, BR2.3).

- [x] Los dos puntos de montaje condicionales (aviso y hoja) declarados y sin contenido en U1 (functional-spec § Cómo monta la cáscara).

**Historias**: US1.2 (AC1.2.2), US1.3 (AC1.3.3).

### Paso 14 — Pruebas de la cáscara

- [x] `AppShell` pinta cinco pestañas hermanas en orden y ninguna más; la pestaña activa se distingue por color e icono; tocar un destino cambia de pestaña (pruebas 1–5).

- [x] Cada pestaña conserva su pila: apilar un detalle, cambiar de pestaña y volver devuelve a esa pantalla (pruebas 6–8).

- [x] `goToTab({ name: 'inicio' })` desapila y limpia `CreateEntry`; `useCreateEntry` devuelve el valor por defecto (pruebas 9–11).

- [x] Integración de límite: con `services` por defecto, la cáscara se monta sin red ni Spotify y muestra el chip en «Conectar» (pruebas 12–13). Ejecutar y dejar en verde.

**Historias**: US1.2 (AC1.2.2), US1.3 (AC1.3.3).

### Paso 15 — Frontend (4): pantallas y semilla

- [x] `app/src/screens/login/LoginScreen.tsx`: marca «Melodify», lema «Opiniones sobre música», campos «Usuario» (marcador «demo», sin autocapitalización) y «Contraseña» (oculta, ojo de 44×44), botón «Entrar» deshabilitado con un campo vacío, pista «Demo: usuario y contraseña: demo» y **nada más**; estados de error exactos de F2 — «Usuario o contraseña incorrectos» bajo Contraseña y «No pudimos guardar tu sesión. Inténtalo de nuevo.» bajo el botón, que pasa a «Reintentar»; el control se deshabilita mientras resuelve.

- [x] `app/src/screens/inicio/InicioScreen.tsx` con la semilla mínima en un módulo de presentación: cabecera «Inicio» con el chip «Conectar», sección «Para ti» y una tarjeta `feed` de lectura de un autor distinto de `demo`; estado vacío «Aún no hay opiniones. Sé el primero.» sin acción (F6, BR3.1–BR3.3).

- [x] `app/src/screens/placeholders/` con Explorar, Crear, Actividad y Perfil: solo su título en la cabecera.

- [x] `app/src/bootstrap/ports.ts` con `SpotifySessionPort`, `SpotifySearchPort` y `SpotifyResolvePort` **declarados y sin implementación** (C5, NFR3.2).

- [x] `app/src/bootstrap/App.tsx`: la máquina de estados `"arranque" | "login" | "inicio"`, `ThemeProvider`, `AppShell` con las cinco pestañas, Login fuera de la barra, y `SplashScreen.hideAsync()` en `finally` (NFR8.2, NFR1.1, F1).

**Historias**: US1.1 (AC1.1.1–AC1.1.4), US1.2 (AC1.2.2), US1.3 (AC1.3.3, AC1.3.4).

### Paso 16 — Pruebas de las pantallas y del arranque

- [x] `LoginScreen`: botón deshabilitado con un campo vacío; credenciales correctas navegan a Inicio; credenciales incorrectas pintan el mensaje exacto sin limpiar campos; «Reintentar» tras fallo de guardado repite con los mismos valores y el mensaje se limpia antes del siguiente intento; los textos exactos de F2 están en pantalla y la barra inferior no (pruebas 1–8).

- [x] `InicioScreen`: pinta «Para ti» y una sola tarjeta con título, artista y contador en cero; tocar la tarjeta y sus acciones no cambia nada; sin semilla pinta el vacío sin botón; el chip dice «Conectar» (pruebas 9–14).

- [x] Integración de límite del arranque: sesión recordada válida → Inicio con Inicio activo; almacenamiento vacío, registro inválido y `503` → Login sin aviso; el splash se oculta en los tres casos (pruebas 15–20).

- [x] Ejecutar el comando de la unidad **con** `--coverage` y dejar las cuatro rutas en verde al 80 %. Si la ejecución solo falla por el umbral con todas las pruebas en verde, se registra tal cual (Build and Test mide el suelo sobre la suite completa).

**Historias**: US1.1 (AC1.1.1–AC1.1.4), US1.2 (AC1.2.1–AC1.2.3), US1.3 (AC1.3.3, AC1.3.4).

### Paso 17 — Configuración de entorno y build

- [x] `eslint.config.js` con `eslint-config-expo`, `no-console` en `error` con la excepción declarada solo para `app/src/bootstrap/logger.ts`, y las tres reglas `no-restricted-imports`: `expo-secure-store` fuera de su adaptador, `packages/*` hacia `app/`, y `@react-native-async-storage/async-storage` en todo el árbol (NFR3.2, R-03 de NFR Design).

- [x] `.prettierrc` y `npm run typecheck` / `npm run lint` en verde sobre el árbol completo; `.gitignore` revisado (`.env*`, `node_modules`, `coverage`, `.expo`).

- [ ] Comprobar que el `.github/workflows/ci.yml` existente corre sin cambios: detecta `app/package.json`, instala y ejecuta los tres comandos.

**Historias**: ninguna funcional (NFR5, NFR3.2).

### Paso 18 — Documentación y trazabilidad

- [x] `code-summary.md` con archivos creados, decisiones de implementación, cobertura obtenida y pruebas escritas pero no ejecutadas (con su razón).

- [x] `source-manifest.json` con **todas** las rutas de código que esta unidad crea o modifica.

- [x] `traceability.json` generado con `sensor-traceability --write-upstream` y cada `ACx.y.z`, `NFRx.y` y `BRx.y` con su archivo real; `AC1.3.1` queda `Deferred` con la razón de la especificación (el botón de Perfil llega con U2).

- [x] Pasar `sensor-traceability` y `sensor-required-sections` en verde antes de la revisión.

**Historias**: US1.1–US1.3 (traza).

## Trazabilidad historia → pasos

| Historia | Criterios | Pasos del plan |
|---|---|---|
| US1.1 — Entrar con la cuenta de demostración | AC1.1.1–AC1.1.4 | 5–8, 11–16 |
| US1.2 — Volver a la app y caer en Inicio | AC1.2.1–AC1.2.3 | 3–8, 13–16 |
| US1.3 — Cerrar sesión y volver al Login | AC1.3.1 (`Deferred`), AC1.3.2–AC1.3.4 | 7–8, 13–16, 18 |

## Riesgos y notas de ejecución

- **SDK 57 exacto**: si `npx expo install` escribe un rango, se reescribe a exacto antes del commit (TS-01). El Expo Go del teléfono es la única referencia válida.
- **Cobertura por árbol**: `app/src/bootstrap/` **no** se excluye (TS-10). El logger, los servicios por defecto y `ports.ts` se prueban como cualquier módulo; `ports.ts` se prueba por su forma de tipos (que los tres puertos existan y no tengan implementación registrada) sin provocar una prueba vacía.
- **`expo-splash-screen`** debe venir con el SDK 57; si no estuviera, se anota como desviación y se acepta el fondo del tema durante la lectura, sin ocultar nada a mano.
- **Ninguna prueba sale a la red**: el almacenamiento y cualquier módulo nativo se sustituyen por dobles.
- **Textos exactos**: los de F2 y F6 se copian literalmente de la especificación; una errata en una prueba se corrige en ambos sitios.
