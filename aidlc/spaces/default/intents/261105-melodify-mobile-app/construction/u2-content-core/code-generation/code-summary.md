# Resumen de código — U2 `u2-content-core`

> **Provenance**: deriva de `code-generation-plan.md` (plan aprobado, 32 pasos), `unit-test-instructions.md`, el informe del agente de desarrollo que ejecutó los pasos 1–20 y 25–32, la construcción paralela del compañero de equipo que aportó los pasos 21–24 (commit `199b1ad`), y la verificación de la suite completa al cerrar la unidad.
> Fecha: 2026-11-13. Etapa: Code Generation · Unidad: `u2-content-core` · Agente: aidlc-developer-agent · Profundidad: Standard · Estrategia de prueba: Standard · Postura: test-after.

## Qué se construyó

El corazón de Melodify sin Spotify: el contenido de ejemplo en memoria, el catálogo con su decisión de portada, la conectividad real del dispositivo y las cuatro pantallas que lo recorren —Inicio, Detalle de obra, Detalle de opinión y Perfil— con sus estados de carga, vacío, error y sin conexión. La app sigue siendo recorrible sin sesión de Spotify: el login simulado sigue entrando, Inicio y Perfil leen la siembra de C4, y los detalles se apilan dentro de la pestaña conservando la raíz montada.

**Pasos del plan**: 32 de 32 completos y marcados. Los pasos 1–24 vienen de los commits `8503add` y `199b1ad`; los pasos 25–32 se completaron en `cab14c3`. La única casilla que se cerró sin código nuevo es la 32, que es este documento, `source-manifest.json`, `traceability.json` y las dos comprobaciones.

**Commits de la unidad en `develop`**:

| Commit | Contenido |
|---|---|
| `8503add` | Pasos 1–20: los tres paquetes nuevos, C1 1.2.0, C2 1.2.0, hooks de estado, componentes compartidos y el arnés. |
| `199b1ad` | Pasos 21–24: Inicio completo y Detalle de obra, con el patrón de dependencias inyectadas (`screens/dependencies.ts`). |
| `cab14c3` | Pasos 25–32: Detalle de opinión, Perfil, composición e instancias, pruebas de integración, commitlint/CI y este cierre documental. |

## Archivos

### Raíz del monorepo

| Archivo | Qué es |
|---|---|
| `package.json` / `package-lock.json` | `@commitlint/cli` y `@commitlint/config-conventional` 21.2.4 exactos; el resto del árbol de dependencias solo gana `expo-network` 57.0.3. |
| `.commitlintrc.json` | `{ "extends": ["@commitlint/config-conventional"] }`. |
| `.github/workflows/ci.yml` | Validación del **título del PR** con commitlint; se retira `--passWithNoTests` para que la cobertura y los umbrales se evalúen siempre. Sin paso de build, firma, publicación ni despliegue. |
| `tsconfig.json` | Referencias a los tres paquetes nuevos en orden de dependencia. |
| `jest.config.js` | `moduleNameMapper` de los tres paquetes nuevos y `coverageThreshold` al 80 % de líneas por árbol. |
| `jest.setup.js` | Doble de `expo-network` (en línea por defecto) junto a los dobles de U1. |
| `eslint.config.js` | `expo-network` restringido a `packages/connectivity/src/expo-network-adapter.ts`; `@melodify/spotify` prohibido en `packages/catalog/src/**` y `@melodify/catalog` permitido solo como `import type` en `packages/spotify/src/**` (NFR3.11). |

### `packages/content-store/` — C4 v1.0.0

- `src/views.ts` — vistas `OpinionView`, `AuthorView`, `AuthorDetailView`, `CommentView`, `LikeView` y los resultados con código.
- `src/seed.ts` — la siembra literal de `functional-spec.md` § Semilla: 5 autores, 8 obras, 10 opiniones, 4 me gusta, 3 comentarios y 2 seguimientos, con edades relativas a un `now` inyectado.
- `src/store.ts` — estado inmutable, reductor puro, lecturas, escrituras, suscripción con revisión y cálculo de `isOwn`/`likedByMe`/`followedByMe` contra `viewerId`.
- `src/index.ts` — superficie pública sin React.

### `packages/catalog/` — C5 v1.1.0

- `src/sample.ts` — las 8 obras de ejemplo con `origin: "sample"` y `coverUrl: null`.
- `src/ports.ts` — `SpotifySessionPort`, `SpotifySearchPort`, `SpotifyResolvePort` y `CatalogPorts`.
- `src/catalog.ts` — `getWork`, `listSampleWorks`, `countOpinions`, `coverFor`, `searchWorks`, `subscribe`, `getCoverFailure` y `retryCovers`.
- `src/index.ts` — `createCatalog`, los tres puertos, `WorkView` y los tipos de resultado.

### `packages/connectivity/` — C6 v1.0.0

- `src/connectivity.ts` — `getNetworkState` y `subscribeNetwork`, arranque en línea con `NETWORK_STATE_UNAVAILABLE` si el adaptador falla.
- `src/expo-network-adapter.ts` — **único** archivo que importa `expo-network`; traduce `isConnected`/`isInternetReachable` a un solo booleano.
- `src/index.ts` — `createConnectivity`, el adaptador y `NetworkAdapter` para las pruebas.

### `packages/design-system/` — C1 v1.2.0

- Nuevos: `components/ErrorState.tsx`, `components/TextButton.tsx`, `calendar-date.ts` (`formatCalendarDate`, «d mmm aaaa»).
- Enmendados: `AppHeader` (`leftSlot`), `EmptyState` (`body`), `OpinionCard` (estado `own` con «Tu opinión», «Editar» y línea de fechas) e `index.ts`.

### `packages/app-shell/` — C2 v1.2.0

- `AppShell.tsx` — pinta toda la pila de la pestaña y oculta con `display: none` lo que queda debajo, de modo que la raíz sigue montada; la cabecera del detalle es un `AppHeader` con `TextButton` «‹ Volver»; `popDetail` se memoiza con `useCallback` para que el efecto de atrás del sistema no se vuelva a suscribir en cada render.
- `index.ts` — sin cambios de superficie.

### `app/src` — `@melodify/app`

- **Composición**: `bootstrap/instances.ts` (una sola instancia de `contentStore`, `catalog` y `connectivity`), `bootstrap/shell-services.ts` (la red sale de C6 con un getter para no devolver una instantánea vieja), `bootstrap/App.tsx` (registra Inicio y Perfil como raíces y los detalles `work`/`opinion` con envoltorios de una línea porque la cáscara monta `component` sin props), `bootstrap/ports.ts` (los tres puertos siguen en `null`) y `bootstrap/logger.ts` (`AppLogCode` con los tres códigos nuevos).
- **Contrato de pantalla**: `screens/dependencies.ts` — `ScreenDependencies` con `content`, `catalog`, `online`, `session`, `log` y las acciones de navegación; cada contenedor lo recibe y no construye instancias.
- **Estado**: `state/useViewerId.ts`, `useContent.ts`, `useCatalog.ts`, `useNetwork.ts`, `opinionCardModel.ts`, `ratings.ts` (`averageRating`, compartido por los dos detalles).
- **Componentes**: `components/OfflineBanner.tsx`, `components/WorkHeader.tsx`.
- **Pantallas**: `screens/inicio/` (`InicioHeader`, `InicioView`, `InicioScreen`, `useContent` vía `ScreenDependencies`), `screens/detalle-obra/` (`View`, `Screen`, `useDetalleObra`), `screens/detalle-opinion/` (`View`, `Screen`, `useDetalleOpinion`) y `screens/perfil/` (`View`, `Screen`, `usePerfil`).
- **Eliminados**: `screens/inicio/seed.ts` (la siembra vive en C4) y `screens/placeholders/PerfilScreen.tsx` (sustituido por la pantalla real).

### Pruebas

49 suites y 414 pruebas, todas en verde. Las nuevas o ampliadas por esta unidad:

| Árbol | Suites y pruebas |
|---|---|
| `packages/content-store/src/__tests__/` | `seed` (10), `store` (6), `reads` (14), `subscribe` (6), `writes` (21), `index` (2) |
| `packages/catalog/src/__tests__/` | `catalog` (20), `index` (2) |
| `packages/connectivity/src/__tests__/` | `connectivity` (9), `expo-network-adapter` (4), `index` (3) |
| `packages/design-system/src/__tests__/` | `error-state` (4), `text-button` (5), `own-opinion` (6), `format-calendar-date` (4), `components` (24, ampliado) |
| `packages/app-shell/src/__tests__/` | `stack` (7) |
| `app/src/bootstrap/__tests__/` | `instances` (5), `app-bootstrap` (10, ampliado), `shell-services` (6, ampliado), `logger` (4, ampliado), `ports` (1) |
| `app/src/components/__tests__/` | `offline-banner` (4), `work-header` (6) |
| `app/src/state/__tests__/` | `use-viewer-id` (4), `use-content` (9), `use-catalog` (3), `use-network` (3), `opinion-card-model` (5) |
| `app/src/screens/inicio/__tests__/` | `inicio-view` (11), `inicio-screen` (7, reescrito) |
| `app/src/screens/detalle-obra/__tests__/` | `detalle-obra-view` (11), `detalle-obra-screen` (7) |
| `app/src/screens/detalle-opinion/__tests__/` | `detalle-opinion` (13) |
| `app/src/screens/perfil/__tests__/` | `perfil-view` (10), `perfil-screen` (12) |

Las suites de `packages/app-session/src` siguen corriendo en `npm test` y siguen verdes sin haber sido reescritas.

## Decisiones de implementación

- **Un solo proyecto de Jest en la raíz**, como U1; los tres paquetes nuevos se resuelven por `moduleNameMapper` hacia su `src` y llevan umbral de cobertura propio.
- **Una instancia por dominio en el punto de composición.** `bootstrap/instances.ts` construye `contentStore`, `catalog` y `connectivity` una sola vez, siguiendo el patrón que U1 fijó para `appSession`. Ninguna pantalla construye su propio almacén ni hay `createContext` en `app/src/state/` (NFR1.8).
- **Dependencias inyectadas por pantalla.** `ScreenDependencies` es el contrato que reciben los contenedores; los hooks viven junto a su pantalla (`screens/<pantalla>/useAlgo.ts`) y reciben `content`, `catalog`, `online` y `log` como argumentos. Esto hace que las pruebas monten la pantalla con dobles sin tocar módulos globales y que el registro de `App.tsx` sea el único sitio que conoce las instancias reales.
- **Envoltorios de ruta de una línea en `App.tsx`.** La cáscara monta `component` sin props, así que `InicioRoute`, `DetalleObraRoute`, `DetalleOpinionRoute` y `PerfilRoute` inyectan las dependencias y delegan en la pantalla. Las instancias se crean en `bootstrap/instances.ts`, no en el render.
- **La red se lee con un getter.** `defaultShellServices.network.online` pasó de valor fijo a getter sobre la instancia de C6: los consumidores que pregunten en cualquier momento ven el estado actual y no una instantánea del arranque (BR6.4).
- **`averageRating` centralizado.** `state/ratings.ts` calcula la media una sola vez para `useDetalleObra` y `useDetalleOpinion`; ninguna de las dos pantallas redondea por su cuenta.
- **La pila de C2 conserva la raíz.** Abrir un detalle ya no desmonta la raíz: se pintan todas las entradas y se oculta la de debajo, con el título de la cabecera limpiado al desapilar. Es lo que hace observable AC2.3.2 en el teléfono y lo que impide que el feed vuelva al principio.
- **Textos literales de la especificación**, comparados completos en las pruebas; ningún texto visible en inglés.

## Cobertura y puertas

Ejecutado en esta etapa sobre el árbol tal como quedó, con el comando de la unidad y la suite completa:

```
npm test            → 49 suites, 414 pruebas, todas en verde
npm run typecheck   → verde (tsc -b)
npm run lint        → 0 errores, 0 avisos
```

| Árbol | Líneas | Umbral |
|---|---|---|
| `app/src/**` | 94,96 % (358/377) | 80 % |
| `packages/content-store/src/**` | 98,17 % (215/219) | 80 % |
| `packages/catalog/src/**` | 93,00 % (93/100) | 80 % |
| `packages/connectivity/src/**` | 97,30 % (36/37) | 80 % |
| `packages/design-system/src/**` | 99,28 % (138/139) | 80 % |
| `packages/app-shell/src/**` | 93,55 % (116/124) | 80 % |
| `packages/app-session/src/**` | 100,00 % (90/90) | 80 % |
| **Total** | **96,32 % (1046/1086)** | — |

No se bajó ningún umbral. `coverage/` y los artefactos de compilación siguen ignorados por git.

## Pruebas escritas pero no ejecutadas en esta etapa

Ninguna: las 414 pruebas se ejecutaron aquí y quedaron en verde.

**Lo que ninguna prueba automática demuestra** y sigue siendo verificación manual en Expo Go sobre el teléfono Android físico: el recorrido de las seis pantallas, que la posición del feed se conserve al abrir y cerrar un detalle, que el aviso de sin conexión responda al modo avión y que el arranque en frío siga por debajo de 2 s. Ninguna prueba mide milisegundos; las que podrían hacerlo cuentan llamadas (NFR8).

## Desviaciones del plan

1. **C4 se implementa sin React, contra la letra de ADR-010.** El plan ya lo registraba en el paso 3: `@melodify/content-store` no importa React ni publica hooks; la suscripción se expone como función y los hooks viven en `app/src/state/`. La decisión mantiene el paquete ejecutable y probable sin renderizador y deja la integración de React en la app, que es donde se compone. ADR-010 se lee como «C4 no depende del renderizador», no como «C4 publica hooks».
2. **El detalle de opinión se entrega en U2.** `unit-of-work.md` lo asignaba a U3 y el mapa de historias lo necesita para US2.3 y AC9.1.4. Se implementó, se registró en las dos pestañas y se probó; U3 solo cablea «Editar» a su formulario. La divergencia quedó elevada en el gate de revisión para que el mapa y `unit-of-work.md` se alineen.
3. **Se adoptó el commit del compañero `199b1ad` en lugar de la implementación local paralela de los pasos 21–24.** El patrón de dependencias inyectadas de `screens/dependencies.ts` es más simple de probar y de componer que el que estaba en curso; los pasos 25–28 se refactorizaron a ese patrón y se descartaron los archivos locales que lo duplicaban (`Inicio*`, `detalle-obra/**`, `useDetalleObra`, los refactors locales de `useContent`/`useNetwork`). Los `eslint-disable-next-line` justificados del compañero se conservan con su razón.
4. **`App.tsx` necesita envoltorios de ruta.** La cáscara monta `component` sin props y las pantallas nuevas dependen de `ScreenDependencies`; los envoltorios de una línea son el punto de inyección y no cambian la superficie de C2.
5. **`defaultShellServices.network.online` es un getter.** Sin él, el valor se capturaba al construir los servicios y las pantallas veían siempre el estado del arranque. Es un cambio de implementación, no de contrato.
6. **`popDetail` memoizado.** El efecto que atiende el botón «atrás» del sistema dependía de una función recreada en cada render y volvía a suscribirse; `useCallback` lo deja estable sin cambiar el comportamiento.
7. **El detalle de obra no tiene entrada visible todavía.** Se registra y se prueba, pero ninguna pantalla lo abre hasta U4 (Q3 = A). No es un defecto del recorrido del teléfono.
8. **AC2.2.1 y AC9.1.8 quedan `Deferred`.** La portada real y la tarjeta de Spotify de Perfil necesitan la sesión de Spotify y la resolución por `SpotifyResolvePort`, que llegan con U4; la razón está escrita en `traceability.json`.

## Avisos conocidos

- **Ruido de `VirtualizedList` en las pruebas.** `inicio-screen.test.tsx` y `app-bootstrap.test.tsx` imprimen avisos de `act` al montar el `FlatList` del feed. Son ruido del entorno de pruebas, no fallos: las 414 pruebas pasan y ninguna aserción depende de esos avisos. Se deja anotado para no confundirlo con una regresión al leer la salida.
- **El repositorio remoto redirige.** `git push` funciona, pero GitHub avisa de que el repositorio se movió; conviene actualizar el remoto cuando se pueda.
- **Pendiente de U4**: el panel de Spotify debe aceptar `melodify://spotify-callback` como URI de redirección.
