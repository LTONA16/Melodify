# Decisiones de pila técnica — U2 `u2-content-core`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7, RC-01, RC-03, RC-05), de `inception/domain-design/decisions.md` (ADR-005 estado en memoria, ADR-011 almacenamiento), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.2.0, C2 1.2.0, C4, C5 1.1.0, C6 y § Revisión 12), de `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style), de `construction/u2-content-core/functional-design/frontend-components.md` (paquetes y hooks) y de las respuestas de `functional-design-questions.md` (Q1 = A).
> Fecha: 2026-11-12. Etapa: NFR Requirements · Unidad: `u2-content-core` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-16`…, continuando la numeración de U1), el objetivo no funcional que sirve y las alternativas que se descartaron. Lo que U1 ya decidió no se repite: **TS-01 (Expo SDK 57 exacto), TS-02 (`strict`), TS-03 (monorepo), TS-07 (StyleSheet y tokens), TS-10 (Jest y `jest-expo`), TS-11 (ESLint, Prettier y CI), TS-13 (solo Expo Go), TS-14 (tokens con contraste) y TS-15 (tema del sistema) siguen vigentes y esta unidad los hereda sin reabrirlos.**

**La regla que gobierna el resto**: todo lo que entre aquí tiene que correr dentro de **Expo Go** en un teléfono Android **sin compilación propia** (RC-01, NFR7). Un módulo que exija `prebuild` queda fuera, por bueno que sea.

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-16 | `expo-network` (57.0.3) como única dependencia nueva de plataforma, aislada tras un adaptador | NFR7, NFR4 |
| TS-17 | Tres paquetes nuevos del monorepo (`content-store`, `catalog`, `connectivity`), con superficie por `src/index.ts` | NFR5 |
| TS-18 | Construcción por fábricas con inyección explícita; una sola instancia en `app/src/bootstrap/instances.ts` | NFR5, NFR1 |
| TS-19 | Lectura de estado externo con `useEffect` + `useState` sobre las suscripciones de C3, C4, C5 y C6, que emiten al suscribirse | NFR1, NFR8 |
| TS-20 | Reloj inyectable (`createContentStore({ now })`) para que las fechas de la siembra sean deterministas | NFR5 |
| TS-21 | Los tres puertos de Spotify viven en `@melodify/catalog/src/ports.ts`, viajan `null` y se importan con `import type` | NFR3 |
| TS-22 | Lista del feed con `FlatList` de React Native, sin librería de virtualización nueva | NFR8, NFR7 |

## Requisitos derivados de esta unidad

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR5.5 | Los tres paquetes nuevos declaran su superficie en `src/index.ts`, sus pruebas y su referencia de proyecto de TypeScript | TS-17 |
| NFR5.6 | La cobertura se mide **por árbol** a 80 % de líneas, como fija `contract-summary.md` § Estructura del monorepo: `app/src/**` **y** `packages/content-store/src/**`, `packages/catalog/src/**` y `packages/connectivity/src/**`, cada uno con su entrada de `coverageThreshold` | TS-17 |
| NFR5.7 | Fechas deterministas en pruebas: nada depende del reloj de la máquina | TS-20 |
| NFR7.4 | `expo-network` corre en Expo Go sin `prebuild` ni permiso declarado por la app | TS-16 |
| NFR7.5 | Ninguna dependencia nueva fuera de las APIs de Expo y React Native | TS-16, TS-22 |
| NFR3.11 | `@melodify/catalog` no importa `@melodify/spotify` ni al revés; el vínculo son tipos | TS-21 |
| NFR1.8 | El estado de las pantallas se lee de una sola fuente por dominio y no se duplica en un contexto | TS-18, TS-19 |
| NFR8.7 | El feed se pinta con `FlatList`; ninguna pantalla implementa su propia lista para el feed | TS-22 |

## NFR7 — Compatibilidad: Expo Go en Android

### TS-16 — `expo-network` aislado tras un adaptador

| Aspecto | Decisión |
|---|---|
| **Paquete** | `expo-network`, versión **57.0.3**, la que corresponde al SDK 57. Se instala con `npx expo install expo-network`, que la fija exacta (TS-01). |
| **Dónde se declara** | Como dependencia de `@melodify/connectivity` (quien la usa) y de `app` (el árbol que Expo Go empaqueta). |
| **Dónde se importa** | En **un solo archivo**: `@melodify/connectivity/src/expo-network-adapter.ts`. Ningún otro archivo del proyecto importa `expo-network`. |
| **Qué API se usa** | `getNetworkStateAsync()` al construir y `addNetworkStateListener()` para los cambios (BR6.1). Del resultado se leen `isConnected` e `isInternetReachable` y se traducen a un booleano. |
| **Cómo se prueba** | Con el tipo `NetworkAdapter` que exporta el paquete —la forma que `createConnectivity({ network })` recibe (C6 § `x-construction`)— y un doble que emite estados; ninguna prueba importa `expo-network` ni toca la red. |

**Por qué no se usa `useNetworkState()`**: es un hook de la librería y ataría la fuente de red a React. C6 es un servicio que la cáscara inyecta en `ShellServices` (`network.online` / `network.subscribe`), así que el paquete expone suscripción y la app la consume con TS-19. Un hook dentro del paquete obligaría a las pruebas a montar React para comprobar una traducción de dos campos.

**Riesgo anotado**: si la versión del SDK 57 no expusiera `addNetworkStateListener`, `expo-network` sigue sirviendo con sondeo (`getNetworkStateAsync` al montar y en cada vuelta a primer plano). Se decide al instalar, y BR6.3 garantiza que un fallo del módulo no bloquea la app. No se adopta `@react-native-community/netinfo`, que sí exige módulo nativo y queda fuera de Expo Go (RC-01).

**Alternativas descartadas**: deducir la red de los fallos de las peticiones (confunde «sin conexión» con «la petición falló», BR6.1); `NetInfo` (módulo nativo); sondear cada segundo (gasta batería y no aporta nada a una app local).

## NFR5 — Mantenibilidad

### TS-17 — Tres paquetes nuevos con la misma forma que los de U1

- `@melodify/content-store` (1.0.0), `@melodify/catalog` (1.1.0) y `@melodify/connectivity` (1.0.0) viven bajo `packages/`, cada uno con su `package.json`, su `tsconfig.json` con referencia de proyecto y su `src/index.ts` como única superficie pública.
- Su forma copia la de `@melodify/app-session` y `@melodify/app-shell`: sin `default` exports, sin rutas internas importadas desde fuera del paquete y pruebas junto al código (`src/**/*.test.ts`).
- **El suelo de cobertura se respeta tal como lo mide el contrato**: `contract-summary.md` § Estructura del monorepo fija un 80 % de líneas **por árbol**, con una entrada de `coverageThreshold` por ruta. U2 añade tres entradas nuevas —`./packages/content-store/src/**`, `./packages/catalog/src/**` y `./packages/connectivity/src/**`—, cada una a 80, y mantiene la de `./app/src/**`. Eso significa que **los tres paquetes nuevos tienen que llegar al 80 por sí mismos**: no pueden compensarse con `app/src` ni entre ellos, y no se baja ninguna entrada para hacer pasar la etapa.
- El `package.json` de cada paquete **no** declara dependencias de almacenamiento, red ni React salvo `@melodify/connectivity`, que declara `expo-network`. Eso es lo que NFR3.6 comprueba.

**Alternativas descartadas**: meter los tres dominios en `app/src/` (la app no podría probarlos sin montar pantallas y U3/U5 los importarían por ruta relativa); un solo paquete `@melodify/core` (mezcla contenido, catálogo y red en una superficie y rompe el reparto de C4/C5/C6).

### TS-18 — Fábricas con inyección explícita y una sola instancia

| Aspecto | Decisión |
|---|---|
| **Qué exporta cada paquete** | Una función de construcción: `createContentStore({ now?, seed? })`, `createCatalog({ content, connectivity, session, search, resolve })` y `createConnectivity({ network })`. Las tres reciben un objeto de opciones, por coherencia con las otras dos y con la etapa anterior. Ninguna crea estado al importarse. |
| **Dónde se construye** | Una sola vez, en `app/src/bootstrap/instances.ts`, siguiendo el patrón de `session.ts`: un módulo que exporta las instancias y nada más. |
| **Por qué** | Una instancia por proceso es lo que hace que la suscripción del feed y la del detalle vean el mismo contenido; dos construcciones darían dos estados distintos (la misma razón por la que `AppSession` es única, R-01). |
| **Cómo se prueba** | Cada paquete se construye dentro de la prueba con su semilla o su doble; las pantallas reciben las instancias por importación del módulo de bootstrap, que las pruebas pueden sustituir con `jest.mock`. |

**Alternativas descartadas**: singletons globales dentro de cada paquete (impiden construir dos almacenes en la misma prueba y obligan a resetear módulos); un contenedor de inyección de dependencias (dependencia nueva para tres objetos).

### TS-19 — Suscripción + estado local en el hook (sin `useSyncExternalStore`)

Las suscripciones de C4 (`subscribeContent`), C5 (`subscribe`) y C6 (`subscribeNetwork`) son fuentes externas a React y **emiten el estado actual en el mismo momento de suscribirse** (BR4.7, BR6.2). C3 (`subscribeSession`) emite en cuanto tiene valor: si la sesión ya está cargada emite al suscribirse, y si no dispara su lectura y emite al publicarla, así que su hook está en `loading` hasta esa primera emisión. Los hooks de `app/src/state/` se escriben con **`useEffect` + `useState`**:

- el `useEffect` se suscribe, guarda en estado lo que llega en la emisión inmediata y se da de baja en la limpieza;
- `loading` es el estado inicial del hook —`null` para el `viewerId`, `null` para el contenido— y deja de serlo con la primera emisión, que ya viene en el mismo tick; no hay temporizador;
- el estado de React es una **copia** del valor emitido: el almacén sigue siendo la única fuente y el hook no lo reconstruye ni lo recalcula.

**Por qué no `useSyncExternalStore`**: esa API exige un `getSnapshot` **síncrono** que devuelva el valor vigente con la misma referencia mientras nada cambie, y ni C4 ni C5 lo declaran. C4 expone suscripción y lecturas que recalculan vistas contra el `viewerId` (`listOpinions`, `getOpinion`), y C5 expone `subscribe`, `listSampleWorks`, `getWork`, `coverFor`, `countOpinions`, `getCoverFailure` y `retryCovers`, pero ninguna devuelve el estado actual del catálogo. Un `getSnapshot` construido con `listOpinions` devolvería un array nuevo en cada llamada y React repintaría en bucle. Se elige la opción que sí se puede escribir con lo contratado, en lugar de ampliar C4 y C5 para acomodar la API de React.

**El único hueco que deja** —una emisión producida entre el render y la suscripción— no existe en C4, C5 ni C6: esas suscripciones emiten al establecerse, así que ese estado se recibe igual. En C3 el hueco es la primera lectura de la sesión, y es justo el `loading` que el hook ya declara. Es lo que hay que probar, y es lo que NFR8.4 verifica.

**Alternativas descartadas**: `useSyncExternalStore` (pide un snapshot que los contratos no publican, o una enmienda de C4/C5 que solo existe para servir a una API de React); Context con `useReducer` para el contenido (ADR-005 lo usó para el estado local de la app; aquí la fuente ya está fuera de React y duplicarla en un contexto crearía dos verdades); una librería de estado (dependencia nueva sin necesidad).

### TS-20 — Reloj inyectable para las fechas de la siembra

`createContentStore({ now })` fija el instante desde el que se calculan las edades de la siembra («hace 2 h», «Editada el …»). En la app, `now` no se pasa y se usa el reloj real al construir; en las pruebas se pasa un instante fijo y la etiqueta es determinista sin congelar temporizadores globales.

**Alternativas descartadas**: `jest.useFakeTimers()` con `Date` falso en todas las pruebas (global, se filtra entre suites y hace fallar a las que miden otra cosa); sembrar fechas absolutas en el código (envejecen: «hace 2 h» pasaría a «hace 3 meses» y las pruebas dejarían de ser ciertas).

## NFR3 — Los puertos siguen sin ser una dependencia

### TS-21 — Tipos de puerto en `@melodify/catalog/src/ports.ts`, sin arista de ejecución

- `SpotifySessionPort`, `SpotifySearchPort` y `SpotifyResolvePort` se declaran en `@melodify/catalog` porque el catálogo es quien los consume; U4 los implementa y los importa **solo con `import type`**, que TypeScript borra al compilar.
- **`app/src/bootstrap/ports.ts` deja de declararlos por su cuenta.** U1 declaró allí las tres formas (`SpotifySessionPort`, `SpotifySearchPort`, `SpotifyResolvePort`) junto con `SearchPortResult` y `ResolvePortResult` porque el paquete de catálogo no existía; U2 sustituye esas declaraciones por `import type` desde `@melodify/catalog` y deja en el archivo solo los tres valores en `null` y el tipo del objeto que los agrupa. Mantener las dos declaraciones daría dos fuentes del mismo tipo y una de ellas se quedaría atrás en cuanto C5 cambiara.
- `@melodify/catalog` **no** importa `@melodify/spotify` en ninguna forma; `@melodify/spotify` (U4) no importa `@melodify/catalog` más allá de esos tipos.
- Los tres viajan en `null` en `app/src/bootstrap/ports.ts` hasta U4. Sin puerto, `searchWorks` responde `{ status: "offline", works: [] }` y la decisión de portada es local (C5 1.1.0).

**Por qué importa para NFR3**: el paquete que más cerca está del token es `@melodify/spotify`, y esta decisión garantiza que nada de U2 lo alcanza. `npm run lint` con la regla de imports no debe encontrar una arista de ejecución entre los dos.

## NFR8 — Rendimiento de la lista

### TS-22 — `FlatList` para el feed

El feed de Inicio se pinta con `FlatList` de React Native: virtualiza por defecto, es parte del framework y no añade dependencia (NFR7.5). Con 8–10 tarjetas no cambia nada perceptible, pero evita que U5 (Actividad) y U4 (resultados de búsqueda) inventen cada uno su lista.

**Alternativas descartadas**: `ScrollView` con `map` (pinta todo y pierde la virtualización cuando la lista crezca); `FlashList` (dependencia nueva, sin necesidad con este volumen).

## NFR6 — Accesibilidad

No hay decisión nueva: se usan los tokens de TS-14 tal como están. `primaryContainer` ya existe en los dos temas y su contraste está verificado; la etiqueta «Tu opinión» va sobre ese fondo con el color de texto que TS-14 fija. Si el contraste de esa pareja no llegara a 4.5:1, se corrige el par de tokens en `@melodify/design-system` y se anota en el contrato de C1, no se elige un color a ojo en la pantalla (NFR6.5, NFR6.6).

## Versiones y fijación

| Paquete | Versión que publica U2 | Por qué |
|---|---|---|
| `expo-network` | 57.0.3 | La que corresponde al SDK 57 (TS-01); la resuelve `npx expo install`. |
| `@melodify/design-system` | 1.2.0 | `ErrorState` y `TextButton` más las tres adiciones opcionales de la revisión 12 (`AppHeader.leftSlot`, `EmptyState.body?`, estado `own` de `OpinionCard`). |
| `@melodify/app-shell` | 1.2.0 | Cambio de comportamiento de la pila (todas las entradas montadas, las de debajo con `display: none`), sin cambio de props ni exportaciones. |
| `@melodify/content-store` | 1.0.0 | Primera publicación (C4). |
| `@melodify/catalog` | 1.1.0 | Primera publicación, ya con `subscribe`, `getCoverFailure` y `retryCovers` (C5, revisión 12). |
| `@melodify/connectivity` | 1.0.0 | Primera publicación (C6). |
| `@melodify/app-session` | 1.1.0 (sin cambios) | Se consume `getSession`, `subscribeSession` y `signOut`; U2 no la modifica. |

Todas las versiones se escriben exactas (`.npmrc` con `save-exact=true`, TS-01).

## Assumptions & Open Questions

- `[assumption]` `expo-network` 57.0.3 expone `addNetworkStateListener`; si no, se cae al sondeo descrito en TS-16 sin cambiar la superficie de C6.
- `[assumption]` C4, C5 y C6 emiten al establecerse la suscripción, como fijan BR4.7 y BR6.2; C3 emite en cuanto tiene valor. Si C4, C5 o C6 no lo hicieran, su hook pasaría por `loading` hasta el primer cambio y NFR8.4 dejaría de cumplirse. Es una condición del contrato, no una suposición sobre el runtime: se comprueba en las pruebas de cada paquete.
- `[assumption]` `FlatList` no necesita `getItemLayout` con 8–10 tarjetas de altura variable; si el desplazamiento se notara, se añade después sin cambiar props.
- **Open question para U3**: las escrituras (`createOpinion`, `toggleLike`, `addComment`, `toggleFollow`) se leerán con el patrón de TS-19; U3 no debe introducir un segundo mecanismo de suscripción.
- **Open question para U4**: `@melodify/spotify` implementará los tres puertos; la arista de tipos de TS-21 se comprueba allí con el primer `import type` real.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR5, NFR6, NFR7, NFR8, RC-01, RC-03, RC-05).
- `decisions` — `inception/domain-design/decisions.md` (ADR-005, ADR-011).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.2.0, C2 1.2.0, C4, C5 1.1.0, C6 1.0.0 con `x-construction`, § Estructura del monorepo, § Revisión 12 y § Revisión 13).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working).
- `functional-spec` — `construction/u2-content-core/functional-design/functional-spec.md` (§ Contratos que U2 posee y consume, § Superficie de construcción de C4).
- `frontend-components` — `construction/u2-content-core/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `app/src/state/`, § `app/src/bootstrap/`).
- `functional-design-questions` — `construction/u2-content-core/functional-design/functional-design-questions.md` (Q1 = A, adaptador real con doble en pruebas).
