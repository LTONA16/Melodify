# Plan de generación de código — U4 `u4-spotify-explore`

> **Provenance**: deriva de `construction/u4-spotify-explore/functional-design/functional-spec.md`, `frontend-components.md`, `rules.md` y `functional-design-questions.md`; de `construction/u4-spotify-explore/nfr-requirements/tech-stack-decisions.md` (TS-31…TS-38), `security-requirements.md` y `performance-requirements.md`; de `construction/u4-spotify-explore/nfr-design/security-design.md`, `performance-design.md` y `logical-components.md`; de `construction/u4-spotify-explore/infrastructure-design/infrastructure-specification.md` y `monitoring-design.md`; de `inception/contract-design/contract-summary.md` (C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0, C9, C10); de `inception/units-generation/unit-of-work.md` § U4 y `unit-of-work-story-map.md`; y de `inception/user-stories/stories.md` (US2.2, US3.1, US3.2, US10.1, US10.2).
> Fecha: 2026-11-18. Etapa: Code Generation · Unidad: `u4-spotify-explore` · Agente: `aidlc-developer-agent` · Profundidad: Standard.

## Summary

- Builds: Cliente Spotify con PKCE y token seguro, búsqueda real con artistas y portadas, y Explorar/Perfil/Inicio/Detalle/Crear conectados.
- Touches: `packages/spotify`, `packages/catalog`, `packages/design-system`, `packages/app-shell`, `app/src/{bootstrap,state,screens}` y configuración de workspace.
- Tests: unos 28 archivos de prueba nuevos o ajustados (unas 170 pruebas unitarias y de integración), con el umbral de 80 % por árbol medido por Build and Test.

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

La metodología es **test-after**: cada capa se implementa y después se escriben y ejecutan sus pruebas, antes de pasar a la siguiente. La unidad es brownfield sobre un monorepo existente: el paso de estructura crea el paquete nuevo y el de banco de pruebas verifica y amplía la configuración existente, sin arrancar un runner nuevo.

| Capa del perfil | En esta unidad | Dónde vive |
|---|---|---|
| Data model / database behavior | **Sí** — modelo de token persistido (cuatro campos) y modelo de estado de conexión de seis valores | `packages/spotify/src/auth/token.ts`, `packages/spotify/src/types.ts`, `packages/design-system/src/models.ts` |
| Repository / data access | **Sí** — secure store, navegador, crypto, reloj y cliente HTTP con timeout | `packages/spotify/src/auth/device.ts`, `packages/spotify/src/http.ts` |
| Business logic | **Sí** — PKCE, intercambio de código, renovación, invalidación, búsqueda y hook de conexión | `packages/spotify/src/auth/`, `packages/spotify/src/catalog/`, `app/src/state/` |
| API / endpoint | **Sí, como superficie de paquetes** — C1, C2, C5 y C7 publican tipos, props y puertos | `packages/design-system`, `packages/app-shell`, `packages/catalog`, `packages/spotify` |
| Frontend behavior | **Sí** — Explorar, Perfil, Inicio, Detalle de obra y Crear | `app/src/screens/`, `app/src/bootstrap/` |

No hay base de datos, migraciones, backend, proxy ni despliegue. El paso de configuración cubre dependencias, `tsconfig`, `jest`, `eslint`, `.env.example` y `package-lock.json`; el CI existente queda intacto.

## Decisiones y desviaciones registradas

- `SpotifyConnectionStatus` es propiedad de C1 y C2 lo aliasna; no se redeclara en `@melodify/spotify`.
- `ShellServices.spotify.status` sigue siendo no nulo por compatibilidad con C2, pero la interfaz usa `useSpotifyConnection()` con `SpotifyStatus | null` para no pintar `disconnected` ni `connecting` durante la hidratación. Ésta es la desviación R-07 resuelta.
- El cliente HTTP compartido vive en `packages/spotify/src/http.ts` y lo usan autorización y catálogo; es la desviación R-08 resuelta.
- El token se borra al desconectar, al fallar la renovación y al recibir `401`; un fallo de lectura sólo registra y arranca desconectado; un fallo de guardado tras renovación exitosa mantiene `connected` en memoria. Es la desviación R-09 resuelta.
- `SpotifyCard.onRetry` es obligatorio, aunque la tabla de componentes lo mostrara opcional: manda la revision 17 de C1.
- Ambos factories de `@melodify/spotify` exigen `log: SpotifyLogPort`; no hay logger por defecto.
- Sólo `packages/spotify/src/auth/device.ts` importa `expo-secure-store`, `expo-web-browser`, `expo-crypto` y `makeRedirectUri`.
- Sin `client_secret`, sin `EXPO_PUBLIC_*` que lo contenga, sin telemetría y sin registro de tokens, códigos, `state`, verifiers ni texto de búsqueda.

## Trazabilidad historia → paso

| Historia / criterio | Qué lo cumple | Pasos |
|---|---|---|
| US2.2 — Ver El Álbum deayero desde Explorar sin sesión | Catálogo de ejemplo, tarjetas de sugerencias y apertura de detalle con `data` | 19, 20, 22, 24 |
| US3.1 — Conectar Spotify desde Perfil y desde Inicio | `SpotifyCard` en C1, chip de Inicio, `useSpotifyConnection`, `connect/retry/disconnect` | 11, 12, 13, 14, 17, 18, 21, 22, 24 |
| US3.2 — Buscar canciones, álbumes y artistas y abrir el detalle | `@melodify/spotify` catálogo, artistas en C5, `useWorkSearch`, Explorar, ruta de detalle con `data` | 9, 10, 15, 16, 17, 18, 19, 20, 22, 24 |
| US10.1 — Portada de Spotify con respaldo | `CoverArt.onError`, `resolve` en C5, cableado en bootstrap y detalle | 9, 10, 11, 12, 15, 16, 21, 22, 23, 24 |
| US10.2 — Mensajes claros y reintento | Seis estados de `SpotifyCard`, `invalidToken`, sin conexión, `sinSesion`, `notConfigured` y «Reintentar» | 11, 12, 17, 18, 19, 20, 21, 22, 24 |
| NFR3.17–3.20 — PKCE, almacenamiento seguro y expiración | `pkce.ts`, `token.ts`, `spotify-auth.ts`, `device.ts` y sus pruebas | 3–8 |
| NFR4.9–4.10, NFR2.10–2.12 — red, timeout, latencia y descartes | `http.ts`, `search.ts`, `resolve.ts`, `useWorkSearch` y sus pruebas | 5, 6, 9, 10, 17, 18 |
| NFR8.12–8.15 — hidratación neutral, reintento y estados | hook nullable, `tokenCaido`, `notConfigured`, skeletons y pruebas de estado | 11, 12, 17–22 |
| NFR9.7 — diagnóstico acotado | seis códigos `SPOTIFY_*` en `logger.ts` y `SpotifyLogPort` | 3, 4, 23, 24 |
| BR16–BR20 — reglas de conexión y búsqueda | toda la cadena, con énfasis en 3–10, 17–22 |
| C1 / C2 / C5 / C7 — contratos | superficies de paquetes, versiones y pruebas de frontera | 11–16, 23, 24 |

## Pasos

### Paso 1 — Estructura de la unidad y fronteras de importación

- [x] Crear `packages/spotify/` con `package.json`, `tsconfig.json`, `src/index.ts`, `src/types.ts`, `src/http.ts`, `src/auth/`, `src/catalog/` y sus carpetas `__tests__`.
- [x] Crear `app/src/screens/explorar/` con `ExplorarScreen.tsx`, `ExplorarView.tsx`, `useExplorar.ts` y `__tests__/`.
- [x] Crear `app/src/state/useSpotifyConnection.ts` y su prueba.
- [x] Mantener las fronteras: ningún paquete importa `app/`; `packages/spotify/src/catalog/` no importa módulos de dispositivo; sólo `auth/device.ts` importa Expo; `C1` no importa `C5`, `C7` ni navegación.
- [x] No tocar README, licencia, workflow de CI ni archivos personales del proyecto salvo los configurados explícitamente en este plan.
- [x] Sin pruebas en este paso: es andamiaje.

### Paso 2 — Banco de pruebas listo y comando de la unidad registrado

- [x] Verificar que `jest.config.js` acepta las rutas nuevas y añadir los tres `moduleNameMapper` de `@melodify/spotify`, `@melodify/spotify/auth` y `@melodify/spotify/catalog`.
- [x] Añadir `"./packages/spotify/src/**": { "lines": 80 }` a `coverageThreshold`; no bajar ni quitar ningún umbral existente.
- [x] Verificar que `jest.setup.js` cubre los dobles de Expo ya presentes y que `npm run typecheck` y `npm run lint` verán las rutas nuevas.
- [x] Registrar en `unit-test-instructions.md` el comando de descubrimiento y los comandos acotados por capa; comprobar que el de descubrimiento corre antes de crear pruebas.
- [x] Sin pruebas ejecutables todavía: el contrato pide el banco listo antes de la primera prueba.

### Paso 3 — Modelo de token y estado de conexión (implementar)

- [x] En `packages/spotify/src/types.ts`, definir `AuthorizationStateView`, `SpotifyLogCode`, `SpotifyLogPort` y los adaptadores `SecureStoreAdapter`, `BrowserAdapter` y `CryptoAdapter`; importar `SpotifyConnectionStatus` como tipo desde `@melodify/design-system`.
- [x] En `packages/spotify/src/auth/token.ts`, definir la forma persistida `{ accessToken, refreshToken, expiresAt, obtainedAt }` y la clave `melodify.spotify.token`, con serialización, validación y borrado.
- [x] En `packages/design-system/src/models.ts`, declarar `SpotifyConnectionStatus` y `ArtistSummary` como superficie aditiva de C1 1.4.0.
- [x] No incluir `client_secret`, token en logs ni campos opcionales no previstos.

### Paso 4 — Modelo de token y estado: pruebas (escribir y ejecutar)

- [x] Probar los seis estados y que `AuthorizationStateView.status` no acepte valores fuera de la unión.
- [x] Probar serialización/parseo del token con los cuatro campos, expiración, rechazo de forma inválida y que la clave sea exactamente `melodify.spotify.token`.
- [x] Probar que `SpotifyLogPort` expone `warn(code, message)` y `error(code, message)` y que no hay logger implícito.
- [x] Ejecutar sólo el árbol de `packages/spotify/src` y dejarlo en verde.

### Paso 5 — Repositorio y acceso a dispositivo/red (implementar)

- [x] Crear `packages/spotify/src/http.ts` con un único `requestJson`, `AbortController`, timeout de 10 s, sin reintento, hosts fijos, `encodeURIComponent` y validación de `workId` con `^[A-Za-z0-9]+$`.
- [x] Crear `packages/spotify/src/auth/device.ts` como único adaptador de `expo-secure-store`, `expo-web-browser`, `expo-crypto` y `makeRedirectUri`.
- [x] Resolver redirect con `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` si existe; si no, `makeRedirectUri({ path: "spotify-callback" })`; sin esquema propio ni dev client.
- [x] Inyectar `fetch` y `clock` en los factories para que ninguna prueba salga a la red ni use `Date` real.

### Paso 6 — Repositorio y acceso: pruebas (escribir y ejecutar)

- [x] Probar que el HTTP construye URLs exactas, codifica parámetros, corta a los 10 s, no reintenta y rechaza un `workId` inválido.
- [x] Probar mapeo de `401`, `429`, `timeout`, red caída y `5xx` sin filtrar bodies ni tokens.
- [x] Probar que `device.ts` es el único módulo con imports de Expo y que el redirect por entorno gana sobre el calculado.
- [x] Ejecutar sólo `packages/spotify/src` y dejarlo en verde.

### Paso 7 — Lógica de autorización (implementar)

- [x] Crear `packages/spotify/src/auth/pkce.ts`: verifier de 32 bytes en base64url sin padding (43–128 caracteres), challenge S256 con SHA-256, `state` de 32 bytes y scopes vacíos.
- [x] Crear `packages/spotify/src/auth/spotify-auth.ts` con `createSpotifyAuth({ clientId, redirectUri, secureStore, browser, crypto, fetch, clock, log })`.
- [x] Exponer `getState`, `subscribe`, `connect`, `disconnect`, `retry`, `getAccessToken`, `markInvalid`, `isConnected` y `onConnectionChange`.
- [x] Publicar los seis estados; la hidratación no emite `disconnected` falso ni `connecting`; `connecting` siempre termina en `connected`, `connectionError`, `invalidToken` o `disconnected`.
- [x] Verificar `state` antes del intercambio; guardar y leer token; renovar una sola vez en vuelo 60 s antes de expirar; borrar al desconectar, al fallar renovación y al recibir `401`.
- [x] Registrar `SPOTIFY_REDIRECT_RESOLVED`, `SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED` y `SPOTIFY_REFRESH_FAILED`, sin datos sensibles.

### Paso 8 — Lógica de autorización: pruebas (escribir y ejecutar)

- [x] RFC 7636 vector conocido de PKCE; longitud y alfabeto del verifier; challenge S256; `state` distinto en cada arranque.
- [x] `state` devuelto distinto produce cero llamadas a `/api/token` y termina en `connectionError`.
- [x] El body de intercambio no lleva `Authorization`, `client_secret` ni datos del usuario; `redirectUri` y `clientId` son los esperados.
- [x] Lectura fallida no borra token; guardado fallido tras renovación mantiene `connected` en memoria; renovación fallida borra y emite `invalidToken`; `401` borra.
- [x] `retry` reintenta la última operación; `notConfigured` no arma navegador; `connecting` siempre sale del estado.
- [x] Ejecutar los tres archivos de `auth/__tests__` y dejarlos en verde.

### Paso 9 — Superficie de catálogo Spotify C7/C10 (implementar)

- [x] Crear `packages/spotify/src/catalog/spotify-catalog.ts` con `createSpotifyCatalog({ auth, fetch, clock, log })` y exponer `search` y `resolve`.
- [x] Pedir `auth.getAccessToken()` en cada llamada; nunca importar storage ni módulos de dispositivo.
- [x] Mapear resultados a `WorkView`/`ArtistHit`, descartar los que falten `id` o `name`, ordenar canciones → álbumes → artistas y conservar `workKind`.
- [x] `resolve` probar `/tracks/{id}` y, sólo con `404`, `/albums/{id}`; validar `workId`.
- [x] Registrar `SPOTIFY_SEARCH_FAILED` sin query ni tokens.

### Paso 10 — Catálogo Spotify: pruebas (escribir y ejecutar)

- [x] URL de búsqueda exacta, parámetros codificados, `Bearer` del token actual y `markInvalid()` en `401`.
- [x] Mapa completo de canciones, álbumes y artistas; orden; descarte de entradas incompletas; `workKind` correcto.
- [x] `resolve` con track, con álbum tras `404`, con `workId` inválido y con JSON inválido.
- [x] Ninguna prueba importa `device.ts` ni sale a la red; ejecutar `catalog/__tests__` y dejarlo en verde.

### Paso 11 — Superficie visual C1 1.4.0 (implementar)

- [x] En `packages/design-system/src/index.ts`, publicar `SpotifyConnectionStatus`, `ArtistSummary`, `SpotifyCard` y `ArtistResultRow`; actualizar cabecera a C1 1.4.0.
- [x] Crear `SpotifyCard.tsx` con `status`, `onConnect`, `onDisconnect` y `onRetry` obligatorios; seis estados y textos exactos; controles de 44×44; «Desconectar» en tono de peligro.
- [x] Crear `ArtistResultRow.tsx` con imagen circular de 56 y rótulo «Artista».
- [x] Ampliar `WorkResultRow` con `kind?: "track" | "album"` y rótulos «Canción»/«Álbum» sin cambiar altura.
- [x] Ampliar `CoverArt` con `onError` que sustituya la imagen por el bloque de inicial del mismo tamaño.
- [x] Añadir `data-testid` a cada control interactivo.

### Paso 12 — C1: pruebas (escribir y ejecutar)

- [x] Los seis estados de `SpotifyCard` con sus textos completos; «Conectando…» deshabilitado; acción de reintento en `connectionError`, `invalidToken` y `notConfigured`.
- [x] `ArtistResultRow` con rótulo y tamaño; `WorkResultRow` con y sin `kind`.
- [x] `CoverArt` con imagen rota deja el bloque de inicial y no un hueco; ejecutar el árbol de `packages/design-system/src` y dejarlo en verde.

### Paso 13 — Superficie de navegación C2 1.4.0 (implementar)

- [x] En `packages/app-shell/src/types.ts`, aliasnar `SpotifyStatus = SpotifyConnectionStatus`, ampliar `WorkDetailScreen` y `openWorkDetail` con `data?: WorkView`, y `openCreate` con `data?: WorkView`.
- [x] Añadir `CreateEntry.preselectedWork: WorkView | null` con valor por defecto `null` en `DEFAULT_CREATE_ENTRY`.
- [x] Hacer que `AppShell.tsx` conserve `data` al abrir el detalle y al volver a Crear, sin romper llamadas antiguas con sólo `workId`.
- [x] Exportar los tipos nuevos desde `index.ts` y actualizar la cabecera a C2 1.4.0.

### Paso 14 — C2: pruebas (escribir y ejecutar)

- [x] `openWorkDetail({ workId, data })` y `openCreate({ workId, data })` conservan `data` en la ruta y en la entrada de Crear.
- [x] Llamadas sin `data` siguen funcionando; `preselectedWork` gana sobre `preselectedWorkId`.
- [x] Ejecutar los archivos de `packages/app-shell/src/__tests__` y dejarlos en verde.

### Paso 15 — Catálogo de ejemplo C5 1.2.0 (implementar)

- [x] En `packages/catalog/src/ports.ts`, añadir `WorkView.workKind?: "track" | "album"`, `ArtistHit` y los campos `artists?` en `SearchPortResult` y `SearchResult`.
- [x] En `packages/catalog/src/catalog.ts`, propagar y cachear artistas junto a las obras; registrar sólo obras en el detalle; conservar `workKind`.
- [x] Hacer que `coverFor` devuelva `initialBlock` de inmediato y dispare una única resolución en segundo plano para portadas nulas cuando haya sesión y red; al fallo, avisar para el mensaje de portadas.
- [x] Con sesión desconectada o sin red, no pedir resolución; exportar los tipos nuevos desde `index.ts` y actualizar la cabecera a C5 1.2.0.

### Paso 16 — C5: pruebas (escribir y ejecutar)

- [x] Búsqueda con artistas; caché de artistas; `workKind` presente en sugerencias y resultados.
- [x] Dos llamadas `coverFor` en el mismo tick producen una sola resolución; desconectar u offline produce cero resoluciones.
- [x] Fallo de portada deja `initialBlock` y permite «Reintentar»; ejecutar `packages/catalog/src/__tests__` y dejarlo en verde.

### Paso 17 — Hooks de estado (implementar)

- [x] Crear `app/src/state/useSpotifyConnection.ts`: lee `ShellServices.spotify`, devuelve `status: SpotifyStatus | null` y expone `connect`, `disconnect` y `retry`.
- [x] Ampliar `app/src/state/useWorkSearch.ts` con firma `useWorkSearch(catalog, enabled, log?, { includeArtists? })`, estado `{ query, status, results, artists, setQuery, clear, retry }`, `offline`, mínimo 2 caracteres, debounce 400 ms, request-id que descarta respuestas tardías y `includeArtists: false` por defecto.
- [x] `empty` en Explorar exige que no haya obras ni artistas; `clear` vuelve a idle sin llamadas; `enabled: false` no registra ni llama.

### Paso 18 — Hooks: pruebas (escribir y ejecutar)

- [x] `useSpotifyConnection` devuelve `null` antes de la primera emisión y nunca pinta `connecting` al hidratar.
- [x] `useWorkSearch`: 2 caracteres, 400 ms, cancelación del timer anterior, descartes tardíos, `offline`, `error`, `empty`, artistas y reintento.
- [x] Incluir una integración ligera del hook con un puerto de catálogo doblado; ejecutar `app/src/state/__tests__` y dejarlo en verde.

### Paso 19 — Explorar (implementar)

- [x] Crear `ExplorarScreen.tsx`, `ExplorarView.tsx` y `useExplorar.ts`.
- [x] Sin sesión: `ConnectionCard` con «Busca en todo Spotify», el texto de ejemplo completo y «Conectar con Spotify»; no mostrar campo de búsqueda.
- [x] `connecting`: tarjeta compacta con botón deshabilitado; `notConfigured` y `connectionError`: mensaje en llano y «Reintentar».
- [x] `invalidToken`: campo editable visible, aviso «Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.», «Volver a conectar», conservar consulta y resultados y no lanzar búsquedas mientras esté activo.
- [x] Offline: «Sin conexión. No podemos buscar en Spotify ahora mismo.» y «Reintentar»; mientras busca, cinco skeletons; usar `FlatList` para resultados y añadir `data-testid` a controles.
- [x] Fila de artista rellena la consulta y busca sin navegar; fila de obra abre `global.openWorkDetail({ workId, data })`.

### Paso 20 — Explorar: pruebas (escribir y ejecutar)

- [x] Render de `disconnected`, `connecting`, `connected` vacío/cargando/resultados, `connectionError`, `invalidToken`, `notConfigured` y `offline`, comparando textos completos y elementos con `data-testid`.
- [x] `invalidToken` conserva consulta y lista, no pinta sugerencias y no dispara búsqueda; «Volver a conectar» relanza el flujo PKCE con `connect` (frontend-components.md § Acciones), no con `retry`.
- [x] Artista rellena y busca; obra abre detalle con `data`; ejecutar `app/src/screens/explorar/__tests__` y dejarlo en verde.

### Paso 21 — Inicio, Perfil, Detalle y Crear (implementar)

- [x] `InicioHeader.tsx` acepta `onPress`; `InicioScreen.tsx` lleva a Perfil si está `connected` y si no llama a `spotify.connect()`; chip «Conectado»/«Conectar».
- [x] `PerfilView.tsx` coloca `SpotifyCard` tras contadores y antes de «Mis opiniones», con los textos exactos de los seis estados; «Desconectar» muestra «Spotify desconectado».
- [x] `useDetalleObra.ts` prioriza `catalog.getWork(workId)`, luego `work.data`, y si falla «No pudimos cargar esta obra.»; conserva `workKind` y «Opinar sobre esta obra» abre Crear con `data`.
- [x] `useCrear.ts` prioriza `entry.preselectedWork` y cae a `preselectedWorkId`; `CrearView` usa el rótulo `workKind` cuando exista; Crear ignora artistas.
- [x] Añadir `data-testid` a controles nuevos.

### Paso 22 — Pantallas restantes: pruebas (escribir y ejecutar)

- [x] Inicio: chip conectado navega y chip desconectado conecta.
- [x] Perfil: los seis estados, desconectar y snackbar, reintento y `notConfigured`.
- [x] Detalle de obra: precedencia de catálogo sobre `data`, fallback a `data`, error y apertura de Crear con datos.
- [x] Crear: `preselectedWork` gana, fallback por id y rótulo de canción/álbum.
- [x] Ejecutar los archivos de las cuatro carpetas de pantallas y dejarlos en verde.

### Paso 23 — Cableado de arranque y configuración (implementar)

- [x] `app/src/bootstrap/logger.ts`: añadir los seis códigos `SPOTIFY_*` sin cambiar la firma del logger.
- [x] `app/src/bootstrap/ports.ts`: construir una sola instancia de `spotifyAuth` y una de `spotifyCatalog`, pasar el logger, asignar los puertos reales de sesión/búsqueda/resolución y registrar el redirect resuelto una vez.
- [x] `app/src/bootstrap/shell-services.ts`: sustituir el servicio Spotify no-op por los adaptadores reales, manteniendo la forma C2.
- [x] `app/src/bootstrap/App.tsx`: importar `ExplorarScreen` real, registrar detalle de obra bajo la pestaña Explorar y pasar `data`.
- [x] `package.json` de los paquetes: versiones C1 1.4.0, C2 1.4.0, C5 1.2.0 y nuevo `@melodify/spotify` 1.0.0; `app/package.json` depende de ellos.
- [x] `tsconfig.json` y `app/tsconfig.json`: referencias al paquete Spotify; `jest.config.js` y `eslint.config.js` según Paso 2; `.env.example` documenta `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` sin valores secretos; `package-lock.json` queda coherente.
- [x] Instalar dependencias con versiones exactas compatibles con Expo SDK 57: `expo-auth-session@57.0.16`, `expo-crypto@57.0.4`, `expo-web-browser@57.0.3`; `expo-secure-store@57.0.4` ya existe. No tocar drift no relacionado (`@types/react`, TypeScript).

### Paso 24 — Arranque e integración: pruebas (escribir y ejecutar)

- [x] Arranque → `ports.ts` construye un solo auth y un solo catálogo; logger registra el redirect sin query ni token.
- [x] Arranque → Explorar real → búsqueda con doble → apertura de detalle con `data` → «Opinar sobre esta obra» lleva el `data` a Crear.
- [x] Arranque → Perfil conecta/desconecta y Inicio actualiza el chip sin duplicar suscripciones.
- [x] Adaptar las pruebas existentes que asumían puertos nulos, servicio no-op, tarjetas sin portada real o rutas sin `data`, sin debilitar aserciones.
- [x] Ejecutar los archivos de `app/src/bootstrap/__tests__` y las pruebas de integración anteriores; dejarlos en verde.

### Paso 25 — Puertas finales y documentación

- [x] Sin cambios en `.github/workflows/ci.yml`: `npm test`, `npm run typecheck` y `npm run lint` siguen siendo la puerta.
- [x] Ejecutar el comando acotado con cobertura de esta unidad; si falla sólo por umbral global con todas las pruebas en verde, registrarlo en `code-summary.md` sin tocar el umbral.
- [x] Ejecutar `npm run typecheck` y `npm run lint`; corregir hallazgos reales, nunca relajar reglas.
- [ ] Preparar la descripción de archivos creados/modificados, decisiones y desviaciones para `code-summary.md`, y el manifiesto de fuentes para el paso posterior a la generación.
- [ ] Registrar la verificación manual pendiente en Expo Go sobre Android físico: seis pantallas sin sesión y con sesión, persistencia tras reinicio, portadas rotas y búsqueda real.
