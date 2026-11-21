# Resumen de Build and Test — Melodify

> Etapa: Build and Test · Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Profundidad: Standard · Estrategia de prueba: **Standard** · Postura: test-after
> Fecha: 2026-11-21 · Rama: `develop` · Commit de partida: `90e003f` · Agente: `aidlc-quality-agent`
> Insumos: `code-generation-plan.md`, `unit-test-instructions.md` y `code-summary.md` de `u1-app-skeleton`, `u2-content-core`, `u3-create-react`, `u4-spotify-explore`, `u5-activity` y `u6-walkthrough`; todos los artefactos de `nfr-requirements/` y `nfr-design/` de las seis unidades.

## Estado general

**La construcción y la suite pasan.** El workspace se resuelve, `tsc -b` compila los nueve paquetes, ESLint no encuentra nada y la suite completa termina con **97 suites y 826 pruebas en verde**, con los nueve suelos de cobertura por encima del 80 %.

Lo que **no** está demostrado son cuatro objetivos que solo se pueden medir en un Android físico con Expo Go: el arranque en frío de 2 s y el recorrido manual de la versión (seis pantallas en claro y oscuro, y la mitad con Spotify). Se registran como `Unverified` y se explican en § Lo que queda sin demostrar.

### Prerrequisitos verificados

| Prerrequisito | Estado |
|---|---|
| Node 24.x / npm 11.x | ✅ `v24.21.0` / `11.19.0` |
| Workspace resuelto (nueve paquetes enlazados) | ✅ tras `npm install` (8 paquetes añadidos, sin cambios versionados) |
| Lockfile coherente | ✅ `npm install` no modificó `package-lock.json` |
| Configuración de Jest intacta | ✅ `jest.config.js` y `jest.setup.js` sin cambios; nueve umbrales de 80 % |
| Sin secretos ni `.env` versionados | ✅ `git ls-files` sin `.env`; 0 coincidencias de `client_secret` |
| Android físico + Expo Go | ⛔ **No disponible en este entorno** — bloquea los cuatro objetivos manuales |

## Inventario de tipos de prueba

| Tipo | ¿Generado / presente? | Dónde |
|---|---|---|
| Pruebas de unidad (lógica de estado, utilidades, componentes) | Sí, por unidad | `app/src/**/__tests__/`, `packages/*/src/**/__tests__/` |
| Pruebas de integración de frontera | Sí — instrucciones propias en esta etapa | `integration-test-instructions.md`; 10 suites, 49 pruebas |
| Pruebas de pantalla (render por estado) | Sí, por unidad | `app/src/screens/*/__tests__/*-{view,screen}.test.tsx` |
| Cobertura por árbol | Sí | `jest.config.js` § `coverageThreshold` |
| Pruebas de rendimiento instrumentadas | **No** — y no deben existir: NFR8 no fija números salvo el arranque, que se mide a mano | — |
| Pruebas de seguridad automatizadas (SAST/DAST) | **No** — la estrategia es Standard, no Comprehensive; la superficie de seguridad se cubre con pruebas de comportamiento (token, PKCE, fronteras) y con lint | — |
| Pruebas E2E / de navegador | **No aplica**: la app es nativa; no hay navegador ni motor que lanzar | — |
| Verificación manual en dispositivo | **Sí, preparada y pendiente de ejecución** | `construction/u6-walkthrough/code-generation/walkthrough-p{1..4}.md` |

## Expectativas de cobertura

| Ámbito | Objetivo | Medido |
|---|---|---|
| `app/src/**` | ≥ 80 % líneas | **96,44 %** (840/871) |
| `packages/design-system/src/**` | ≥ 80 % líneas | **98,74 %** (236/239) |
| `packages/activity/src/**` | ≥ 80 % líneas | **93,33 %** (154/165) |
| `packages/app-shell/src/**` | ≥ 80 % líneas | **94,33 %** (133/141) |
| `packages/app-session/src/**` | ≥ 80 % líneas | **100,00 %** (90/90) |
| `packages/content-store/src/**` | ≥ 80 % líneas | **98,24 %** (223/227) |
| `packages/catalog/src/**` | ≥ 80 % líneas | **90,98 %** (121/133) |
| `packages/connectivity/src/**` | ≥ 80 % líneas | **97,50 %** (39/40) |
| `packages/spotify/src/**` | ≥ 80 % líneas | **89,28 %** (308/345) |
| **Proyecto** | — | **95,24 %** (2144/2251) |

Ningún umbral se bajó ni se añadieron exclusiones. El detalle por comando está en `test-results.md`.

## Target Verification Matrix

Una fila por objetivo medible del inventario. `Met` = ejecutado aquí y en verde; `N/A` = el plan lo hace inaplicable en esta etapa; `Unverified` = no ejecutable en este entorno y sin etapa posterior que lo posea.

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| BT-01 | TS-02; NFR5.1–NFR5.4; `package.json` script `typecheck` | `tsc -b` exit 0, sin errores | Exit 0, sin salida de error | `npm run typecheck` (2026-11-21) | build-and-test | **Met** |
| BT-02 | TS-11; NFR3.11; `package.json` script `lint` | `eslint .` exit 0, 0 problemas | Exit 0, `0 problems` | `npm run lint` (2026-11-21) | build-and-test | **Met** |
| BT-03 | `team.md` § Testing Posture; Testing Contract `standard` | Suite completa en verde | 97/97 suites, 826/826 pruebas, 58,9 s | `npm test -- --coverage` (exit 0) | build-and-test | **Met** |
| BT-04 | `jest.config.js` `./app/src/**` | ≥ 80 % líneas | 96,44 % (840/871) | `coverage/lcov.info` de la suite completa | build-and-test | **Met** |
| BT-05 | `jest.config.js` `./packages/design-system/src/**` | ≥ 80 % líneas | 98,74 % (236/239) | Ídem | build-and-test | **Met** |
| BT-06 | `jest.config.js` `./packages/activity/src/**` | ≥ 80 % líneas | 93,33 % (154/165) | Ídem | build-and-test | **Met** |
| BT-07 | `jest.config.js` `./packages/app-shell/src/**` | ≥ 80 % líneas | 94,33 % (133/141) | Ídem | build-and-test | **Met** |
| BT-08 | `jest.config.js` `./packages/app-session/src/**` | ≥ 80 % líneas | 100,00 % (90/90) | Ídem | build-and-test | **Met** |
| BT-09 | `jest.config.js` `./packages/content-store/src/**` | ≥ 80 % líneas | 98,24 % (223/227) | Ídem | build-and-test | **Met** |
| BT-10 | `jest.config.js` `./packages/catalog/src/**` | ≥ 80 % líneas | 90,98 % (121/133) | Ídem | build-and-test | **Met** |
| BT-11 | `jest.config.js` `./packages/connectivity/src/**` | ≥ 80 % líneas | 97,50 % (39/40) | Ídem | build-and-test | **Met** |
| BT-12 | `jest.config.js` `./packages/spotify/src/**` | ≥ 80 % líneas | 89,28 % (308/345) | Ídem | build-and-test | **Met** |
| BT-13 | Testing Contract § `scope_floor`: «Run the selected tests in CI before merge» | Las pruebas se ejecutan en CI antes del merge | No hay corrida de CI todavía: `ci-pipeline` está `[ ]` y es la etapa siguiente del plan | `aidlc-state.md` § Stage Progress | ci-pipeline | **N/A** — la etapa `ci-pipeline`, posterior en este plan, configura el CI que las ejecuta antes del merge |
| BT-14 | Testing Contract § `obligations.strategy_volume` | 5–8 pruebas por componente; unidad **e** integración en fronteras clave | 826 pruebas en 97 suites; 10 suites de frontera con 49 pruebas | `integration-test-instructions.md`; `code-summary.md` de U1–U6 | build-and-test | **Met** |
| BT-15 | NFR6.1; TS-14 (`contrast.test.ts`) | Texto normal ≥ 4,5:1 y grande/iconos ≥ 3:1 en ambos temas | 4,5:1 en `text`, `textSecondary`, `textMuted`, `primary`; 3:1 en `accentStar`, `success`, `error`, `borderStrong`; `onPrimary`, banner y contenedor primario ≥ 4,5:1; 2 temas | `packages/design-system/src/__tests__/contrast.test.ts` (verde en la suite completa) | build-and-test | **Met** |
| BT-16 | NFR6.2; NFR6.7; NFR6.9; NFR6.10 | Todo control nuevo con 44×44 asertado | Aserciones de 44 en `bottom-tab-bar`, `error-state`, `rating-input`, `secondary-button`, `text-button` y `theme` | Suites de `packages/design-system/src/__tests__/` | build-and-test | **Met** |
| BT-17 | NFR6.2; NFR6.7; NFR6.9; NFR6.10 | Toda la superficie táctil a 44×44 **al dedo** | No medido: el tamaño real al dedo se comprueba en el teléfono | `walkthrough-p1.md` § áreas táctiles | — (manual) | **Unverified** |
| BT-18 | NFR6.4; NFR6.6; NFR2.6; NFR2.9; NFR2.11; NFR2.14 | El estado nunca se comunica solo por color; cada estado se dice con palabras | Pestaña activa con icono relleno **y** etiqueta; `EmptyState`/`ErrorState`/`ConnectionCard` con texto literal; los cuatro estados de Actividad con su frase y su salida | `bottom-tab-bar.test.tsx`, `error-state.test.tsx`, `connection-card.test.tsx`, `actividad-view.test.tsx` | build-and-test | **Met** |
| BT-19 | NFR6.3; TS-15 | La app sigue el tema del sistema, sin selector propio | `ThemeProvider` con `useColorScheme()`; prueba de ambos temas | `packages/design-system/src/__tests__/theme.test.tsx` | build-and-test | **Met** |
| BT-20 | NFR3.1; NFR3.10; NFR3.15; NFR3.24 | Ningún secreto en el repositorio ni en el entorno público | `git ls-files` sin `.env`; 0 coincidencias de `client_secret` en archivos versionados; `.env.example` solo declara `EXPO_PUBLIC_SPOTIFY_CLIENT_ID=` | `git ls-files` + búsqueda en archivos versionados | build-and-test | **Met** |
| BT-21 | NFR3.2; NFR3.18; NFR3.19; TS-06; TS-33 | El token vive solo en almacenamiento seguro y nunca aparece en un log | Un solo archivo importa `expo-secure-store` (regla de lint); pruebas de token y de logger afirman que ni token, ni código, ni verifier, ni `state` se registran | `packages/spotify/src/auth/__tests__/{token,spotify-auth}.test.ts`; `eslint.config.js` | build-and-test | **Met** |
| BT-22 | NFR3.17 | PKCE S256 sin secreto, con `state` comprobado antes del intercambio | Pruebas de `pkce` y `spotify-auth` | `packages/spotify/src/auth/__tests__/{pkce,spotify-auth}.test.ts` | build-and-test | **Met** |
| BT-23 | NFR3.11; TS-21 | Catálogo y Spotify comparten solo tipos, nunca una arista de ejecución | Reglas `no-restricted-imports` en `eslint.config.js`; lint verde | `npm run lint`; `eslint.config.js` | build-and-test | **Met** |
| BT-24 | NFR5.11; TS-37; `team.md` § Testing Posture | Ninguna prueba sale a la red ni necesita credenciales o dispositivo | 826 pruebas verdes con dobles de `expo-secure-store`, `expo-network`, `expo-web-browser`, `expo-crypto` y HTTP | Suite completa; `jest.setup.js` | build-and-test | **Met** |
| BT-25 | NFR4.1; NFR4.5; NFR4.9; NFR4.10 | Nada se envía a un servidor propio; la red solo habla con Spotify | Un único cliente HTTP en `packages/spotify/src/http.ts`; sin endpoint propio en el código | `packages/spotify/src/__tests__/http.test.ts`; revisión de `http.ts` | build-and-test | **Met** |
| BT-26 | NFR9.1–NFR9.9 | Un solo logger propio y mínimo; sin telemetría, paneles ni alertas | `app/src/bootstrap/logger.ts` con firma cerrada; `no-console` en ESLint salvo ese archivo; pruebas de logger por unidad | `app/src/bootstrap/__tests__/logger.test.ts`; `eslint.config.js` | build-and-test | **Met** |
| BT-27 | NFR8.1 | Arranque en frío ≤ 2 s, mediana de tres, con y sin sesión | No medido: exige Expo Go abierto, el paquete cargado y cronómetro de mano en el teléfono | `walkthrough-p1.md` (pendiente) | — (manual) | **Unverified** |
| BT-28 | NFR8.2 | Ninguna espera artificial en el arranque | 0 coincidencias de `setTimeout`/`InteractionManager` en `app/src/bootstrap/`; el splash termina al resolver el recuerdo de sesión | Revisión de `app/src/bootstrap/*` | build-and-test | **Met** |
| BT-29 | NFR8.4; NFR8.5; NFR8.7 | La siembra se pinta desde memoria; las consultas no se multiplican; el feed usa `FlatList` | Suites de `content-store` (siembra y lecturas), `catalog` (consultas) e `inicio` (feed) | `packages/content-store/src/__tests__/*`, `packages/catalog/src/__tests__/catalog.test.ts` | build-and-test | **Met** |
| BT-30 | NFR8.9; NFR8.10 | Una petición por pausa (400 ms, 2 caracteres); un solo snackbar de 4 s | Pruebas del hook de búsqueda (temporizador, cancelación, respuestas tardías) y del snackbar (4 s, uno solo) | `app/src/state/__tests__/use-work-search.test.ts`; `snackbar.test.tsx` | build-and-test | **Met** |
| BT-31 | NFR8.12; TS-34 | La espera de red está acotada en 10 s y siempre tiene salida | `AbortController` con 10 s y sin reintento automático; pruebas de timeout | `packages/spotify/src/__tests__/http.test.ts` | build-and-test | **Met** |
| BT-32 | NFR8.14 | Una petición por consulta y una por obra; ninguna sin sesión ni sin red | Pruebas de caché y de resolución única de portada | `packages/catalog/src/__tests__/catalog.test.ts`; `packages/spotify/src/catalog/__tests__/spotify-catalog.test.ts` | build-and-test | **Met** |
| BT-33 | NFR8.16; NFR8.17; NFR8.18 | La Actividad deriva sin red ni temporizador, no paga el coste al arrancar y recalcular no remonta la lista | Derivación pura perezosa con reloj por parámetro; pruebas de `derive`, `grouping` y `activity` | `packages/activity/src/__tests__/*`; `actividad-screen.test.tsx` | build-and-test | **Met** |
| BT-34 | NFR1.2; NFR1.3; NFR1.5; NFR1.6; NFR1.7; NFR1.10; NFR1.13; NFR1.14; NFR1.15; NFR1.17; NFR1.18 | Ningún fallo deja a la persona sin salida, ni pierde lo cargado, ni deja la lista vieja como nueva | Suites de sesión, portada rota, sin conexión, escritura fallida, token caído y Actividad | `app-session.test.ts`, `cover-art.test.tsx`, `use-network.test.tsx`, `crear-screen.test.tsx`, `use-spotify-connection.test.tsx`, `use-actividad.test.tsx` | build-and-test | **Met** |
| BT-35 | NFR1.1; NFR1.4; NFR1.9; NFR1.16; NFR1.19; NFR1.20 | Recorrer la app no produce cierres ni pantallas en blanco | No medido: es el criterio de terminado de la versión y se demuestra recorriendo el teléfono | `walkthrough-p1.md`…`walkthrough-p4.md` (pendientes) | — (manual) | **Unverified** |
| BT-36 | NFR7.1–NFR7.9 | Solo APIs disponibles en Expo Go; ningún módulo nativo propio | Sin `android/` ni `ios/`; todas las dependencias son del SDK 57, React Native o React Navigation | `app/package.json`; estructura del repositorio | build-and-test | **Met** |
| BT-37 | NFR5.8; NFR5.9; NFR5.10; NFR5.12; NFR5.13 | El suelo se mide por árbol; cada pieza nueva llega con su prueba; ningún árbol se reparte la cobertura | Nueve umbrales independientes de 80 %, todos superados; ninguna exclusión nueva | `jest.config.js`; `test-results.md` § Cobertura | build-and-test | **Met** |
| BT-38 | US11.1; AC11.1.1–AC11.1.5; FR11.1; FR11.2; FR11.5; FR12.1; NFR2.15 | Seis pantallas recorridas sin sesión, en claro y en oscuro, sin cierres ni blancos, todo en español | No medido: los cuatro registros de pasada existen como plantilla y no se ejecutaron | `walkthrough-p1.md`, `walkthrough-p2.md` (veredicto `Pendiente de ejecución manual`) | — (manual) | **Unverified** |
| BT-39 | US11.2; AC11.2.1–AC11.2.3; FR10.4; FR12.2 | PKCE, conexión y búsqueda real; publicación y portadas reales; salida condicionada si falta el prerrequisito | No medido: exige client ID configurado y el panel de Spotify aceptando el redirect de Expo Go | `walkthrough-p3.md`, `walkthrough-p4.md` (pendientes) | — (manual) | **Unverified** |
| BT-40 | AC1.3.1 | «Cerrar sesión» desde Perfil devuelve la app a Login | Construido y probado: Perfil cierra sesión sobre la instancia única y `App` vuelve a Login | `app/src/screens/perfil/__tests__/perfil-screen.test.tsx`; `app-session-wiring.test.tsx` | build-and-test | **Met** |
| BT-41 | AC9.1.8 | La tarjeta de Spotify de Perfil conecta y desconecta | Construido y probado: `SpotifyCard` de seis estados en Perfil, con `connecting`/`connected`/`invalidToken` y desconexión | `packages/design-system/src/__tests__/spotify-card.test.tsx`; `perfil-view.test.tsx`; `use-spotify-connection.test.tsx` | build-and-test | **Met** |

**Recuento: 41 filas — 35 `Met`, 1 `N/A`, 5 `Unverified`, 0 `Not Met`.** Las cinco `Unverified` (BT-17, BT-27, BT-35, BT-38, BT-39) son tres actividades que exigen el teléfono: el recorrido manual, el arranque en frío y las áreas táctiles al dedo. BT-40 y BT-41 son `Met` por comportamiento construido y probado; su hueco es de **trazabilidad**, no de código, y se detalla en `cross-unit-traceability.md`.

## Evaluación de preparación

| Dimensión | Estado | Qué lo sostiene |
|---|---|---|
| **Listo para construir** | ✅ Sí | `npm install` + `npm run typecheck` + `npm run lint` reproducen el árbol desde cero; el lockfile no cambia |
| **Listo para probar** | ✅ Sí, con un límite | 97 suites / 826 pruebas verdes y los nueve suelos de cobertura superados. El límite: la suite no toca el dispositivo, así que no demuestra el recorrido ni el arranque en frío |
| **Listo para desplegar** | **N/A** | Esta versión no se despliega: no hay entornos, ni build, ni tienda. «Desplegar» es abrir la app en Expo Go con Metro levantado (`team.md` § Deployment) |
| **Listo para cerrar la versión** | ⛔ **Todavía no** | Falta la verificación manual en Android físico (U6, P1–P4) y, con ella, el arranque en frío de 2 s. Sin ese recorrido, el criterio de terminado de la versión no se cumple |

## Lo que queda sin demostrar

1. **El recorrido manual de las seis pantallas** (P1 y P2: claro y oscuro, sin sesión) y **la mitad con Spotify** (P3 y P4). Los cuatro registros de `construction/u6-walkthrough/code-generation/` están escritos con sus 52 filas y sus capturas previstas, pero **no ejecutados**: no hay ✅/❌ reales, ni capturas, ni veredicto `Completada` o `Condicionada`.
2. **El arranque en frío de 2 s** (NFR8.1). No se mide en la suite a propósito: `jest.config.js` documenta que el presupuesto se mide en el teléfono.
3. **Las áreas táctiles al dedo** (NFR6.2 y sus variantes). Los componentes con aserción automática están cubiertos; el resto se juzga en el dispositivo.

Ninguno de estos huecos se puede cerrar desde este entorno ni con un cambio de código: hacen falta el teléfono, Metro y —para P3/P4— el client ID y el panel de Spotify.

## Trazabilidad entre unidades

El sensor de trazabilidad de la etapa (`aidlc engine sensor-traceability --stage build-and-test`) devolvió **`pass: false`** con **32 identificadores sin cubrir**. El desglose y su causa están en `cross-unit-traceability.md`; en resumen:

- **20 identificadores** dependen del recorrido manual de U6, que está pendiente de ejecución: los 8 criterios AC11.1.x/AC11.2.x, los 6 FR que cuelgan de ellos (FR2.4, FR10.4, FR11.2, FR11.5, FR12.1, FR12.2) y las 6 filas de grupo NFR1, NFR2, NFR3, NFR4, NFR8 y NFR9, que el sensor cierra a través de las entradas `Deferred` de U6. No es un hueco de código.
- **8 FR** cuelgan de **AC9.1.8** (FR3.7, FR9.1, FR9.2, FR9.4, FR9.5, FR9.6, FR11.1, FR11.6) y **2 FR** de **AC1.3.1** (FR1.5, FR9.3). Ambos criterios están construidos y probados (BT-40 y BT-41), pero **ninguna unidad los reclama** en su `traceability.json`: U1 difirió AC1.3.1 a U2 sin que U2 lo recogiera, y U2 difirió AC9.1.8 a U4 sin que U4 lo recogiera. Es un hueco de **registro de trazabilidad**, no de comportamiento.

## Avisos para quien revise

- **No se tocó ningún umbral, `jest.config.js`, `jest.setup.js` ni `.github/workflows/ci.yml`.** El único cambio de entorno fue `npm install` para restaurar los enlaces del workspace, sin cambios versionados.
- **No se ejecutaron los comandos acotados de U1–U6** en esta etapa: son subconjuntos de la suite completa que sí se ejecutó. Sus resultados viven en el `code-summary.md` de cada unidad.
- **`npm install` reporta 8 vulnerabilidades moderadas** en dependencias de desarrollo. No se aplicó `npm audit fix`: cambiar versiones del árbol no es un arreglo de esta etapa.
- **Ruido de consola conocido** en `inicio-screen.test.tsx` y `app-bootstrap.test.tsx` (`act`/`VirtualizedList`). No afecta a ninguna aserción.
