# Componentes lógicos — U2 `u2-content-core`

> **Provenance**: deriva de `inception/domain-design/components.md` (ContentStore, Catalog, Connectivity, AppShell), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.2.0, C2 1.2.0, C3, C4, C5 1.1.0, C6 1.0.0, § Revisiones 12 y 13), de `nfr-requirements/tech-stack-decisions.md` (TS-16 a TS-22), de `nfr-requirements/performance-requirements.md` (NFR1.4–1.8, NFR6.1–6.6), de `nfr-requirements/security-requirements.md` (NFR3.6, NFR3.11, NFR9.4), de `functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `app/src/state/`, § `app/src/bootstrap/`), de `construction/u1-app-skeleton/nfr-design/logical-components.md` (LC-1 a LC-5, inventario heredado) y de `performance-design.md` / `security-design.md` de esta misma etapa.
> Fecha: 2026-11-12. Etapa: NFR Design · Unidad: `u2-content-core` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Qué describe este archivo

`logical-components.md` pide un inventario de componentes, dominios de fallo y radio de impacto. Esta unidad sigue sin servidor: no hay servicios que aislar ni réplicas que repartir. Lo que sí hay son **áreas de ejecución con un fallo propio y distinguible**, y aquí se declaran, se numeran y se les asigna un radio. El inventario continúa la numeración de U1 para que las dos unidades se puedan leer juntas.

## Alcance: qué se diseña y qué no

- **Escalabilidad** (`scalability-design`): no se diseña. `requirements.md` no fija ningún objetivo de escalabilidad y esta unidad no introduce ninguno: el contenido vive en memoria, no hay servidor y la app la usa una persona (RC-02, RC-03). Su ausencia es una decisión, no un olvido.
- **Fiabilidad** (`reliability-design`): filtrada por `produces_kinds`; se diseña en `performance-design.md` § NFR1 (estados de pantalla, sin conexión, pila que conserva la raíz, fuente única). El artefacto `reliability-requirements` tampoco se produjo: sus objetivos (NFR1) viven en `performance-requirements`.
- **Observabilidad** (`observability-design`): filtrada igual; se diseña en `security-design.md` § NFR9 (un solo logger, catálogo de eventos, sin telemetría). El artefacto `observability-requirements` no se produjo: sus objetivos (NFR9) viven en `security-requirements`.
- **Rendimiento y usabilidad**: `performance-design.md`; **seguridad, privacidad y diagnóstico**: `security-design.md`.

## Inventario

| ID | Componente lógico | Dónde vive | Responsabilidad | Dueño |
|---|---|---|---|---|
| **LC-1** | Cáscara y navegación | `packages/app-shell/` (`@melodify/app-shell` 1.2.0) | `AppShell`, barra de cinco pestañas, pila de cada pestaña **con todas las entradas montadas** (las de debajo con `display: none`), cabecera de detalle con «‹ Volver», `ShellServices` | U1; U2 publica el cambio de comportamiento de la pila |
| **LC-2** | Sistema de diseño | `packages/design-system/` (`@melodify/design-system` 1.2.0) | Tokens, temas, `ThemeProvider`, `useTheme` y las piezas de la versión 1.2.0: `ErrorState`, `TextButton`, `AppHeader.leftSlot`, `EmptyState.body`, estado `own` de `OpinionCard` | U1; U2 publica la 1.2.0 |
| **LC-3** | Sesión de la app | `packages/app-session/` (`@melodify/app-session` 1.1.0, sin cambios) | `getSession`, `signIn`, `signOut`, `subscribeSession`, la guarda del registro y el adaptador de `expo-secure-store`; declara `SessionLogger` y `SessionLogCode` | U1 |
| **LC-4** | Arranque y composición | `app/src/bootstrap/` | `session.ts` (la única instancia de sesión), **`instances.ts`** (la única de contenido, catálogo y conectividad), `shell-services.ts` con la red real, `ports.ts` con los tres en `null`, `logger.ts`, `App.tsx` | U1 y U2 |
| **LC-5** | Diagnóstico | `app/src/bootstrap/logger.ts` | El logger del proyecto: implementa `SessionLogger` y declara `AppLogger`/`AppLogCode` (asignable al primero); único sitio que llama a `console` | U1; U2 amplía el vocabulario |
| **LC-6** | Contenido | `packages/content-store/` (`@melodify/content-store` 1.0.0) | Estado de opiniones, autores, me gustos, comentarios y seguimientos; siembra; reducer propio **sin React**; `subscribeContent` que emite al establecerse | U2 |
| **LC-7** | Catálogo | `packages/catalog/` (`@melodify/catalog` 1.1.0) | Obras de ejemplo, `getWork`, `countOpinions`, decisión de portada (`coverFor`), `subscribe`, aviso de portadas (`getCoverFailure`, `retryCovers`); tipos de los tres puertos | U2 |
| **LC-8** | Conectividad | `packages/connectivity/` (`@melodify/connectivity` 1.0.0) | `createConnectivity({ network })`, estado «en línea / sin conexión», `subscribeNetwork`; el único adaptador de `expo-network` | U2 |
| **LC-9** | Estado y mapeo de la interfaz | `app/src/state/` | `useViewerId`, `useContent`, `useCatalog`, `useNetwork`, `useDetalleObra`, `useDetalleOpinion`, `usePerfil`, `toOpinionCardModel`; suscripción, baja al desmontar y clave de memoización | U2 |

**Lo que no es un componente propio**: las cuatro pantallas y sus vistas. No tienen estado que sobreviva a su montaje ni un fallo que aísle a las demás —toda pantalla que falla lo hace a través de LC-6, LC-7, LC-8 o LC-9—, así que se describen en `frontend-components.md` y no aquí.

## Dependencias entre componentes

```mermaid
graph TD
    App["@melodify/app (LC-4)<br/>composición + pantallas"] --> Shell["LC-1 cáscara"]
    App --> DS["LC-2 sistema de diseño"]
    App --> State["LC-9 estado y mapeo"]
    App --> Store["LC-6 contenido"]
    App --> Catalog["LC-7 catálogo"]
    App --> Conn["LC-8 conectividad"]
    App --> Session["LC-3 sesión"]
    State --> Store
    State --> Catalog
    State --> Session
    State -->|lee el estado de red: online| Conn
    Catalog --> Store
    Catalog --> Conn
    Shell --> DS
    App -.->|import type de los tres puertos| Ports["@melodify/catalog/src/ports.ts"]
    Log["LC-5 diagnóstico"] -.->|se inyecta en la sesión (implementa SessionLogger y AppLogger)| Session
    State -.->|registra fallos por el puerto| Log
    Conn --> ExpoNet["expo-network"]
```

**Respaldo en texto**: la app conoce a todos y es el único punto que los conecta. La cáscara depende del sistema de diseño y nada más. El catálogo depende del contenido (para el recuento de opiniones) y de la conectividad (para decidir la portada); **no depende de la sesión de Spotify**, solo de sus tipos. La capa de estado depende de las cuatro fuentes y del logger, siempre por inyección o por el puerto de registro. La conectividad es el único camino a `expo-network`. **Ninguna flecha del grafo va de un paquete a la app**: los tipos de los tres puertos viven en `@melodify/catalog/src/ports.ts` y es la app quien los importa con `import type` (TS-21); el logger lo inyecta la app en la sesión, no al revés.

### Por qué el catálogo depende del contenido y no al revés

C5 necesita `countOpinions` para el «N opiniones» y para la media del detalle, y ese número sale de C4; C4 no necesita nada del catálogo. La dirección de la dependencia es la que impone el dato, y construirla al revés obligaría a C4 a conocer las obras. Con `createCatalog({ content, connectivity, ... })` (C5, § Revisión 12) la arista es explícita y sustituible en las pruebas.

## Reglas de importación y su compuerta

| Regla | Qué la hace cumplir | Por qué |
|---|---|---|
| `packages/*` no importa `@melodify/app` ni `app/` | **ESLint** (`no-restricted-imports`, patrón `**/app/**`) y type-check | El type-check no ve un import relativo si la ruta existe; la regla sí |
| Nadie importa `expo-secure-store` salvo el adaptador de LC-3 | **ESLint** (`no-restricted-imports`) | Es una dependencia externa: cualquiera puede importarla y compilar |
| Nadie importa `@react-native-async-storage/async-storage` | **ESLint** (`no-restricted-imports`) | Lo que ADR-011 decidió no añadir no puede reaparecer como atajo |
| Solo `packages/connectivity/src/expo-network-adapter.ts` importa `expo-network` | **ESLint** (`no-restricted-imports`, regla nueva de U2) | Sin ella, una pantalla podría leer el sistema operativo por su cuenta y multiplicar lecturas (TS-16) |
| `@melodify/catalog` no importa `@melodify/spotify` **en ninguna forma** y `@melodify/spotify` no importa `@melodify/catalog` salvo con `import type` | **ESLint** con `@typescript-eslint/no-restricted-imports`: en el catálogo **sin** `allowTypeImports`, en Spotify **con** `allowTypeImports: true` | `no-restricted-imports` no distingue tipos de valores; la variante con tipos sí, y usarla solo en la dirección de Spotify es lo que hace comprobable NFR3.11 sin abrir el catálogo a los tipos de un paquete que maneja el token |
| Los tres paquetes nuevos no declaran dependencias de almacenamiento, red ni React (salvo `connectivity` con `expo-network`) | Revisión del PR y de los `package.json` | Es lo que sostiene NFR3.6 y NFR3.7: una dependencia declarada es una puerta abierta |
| Solo `app/src/bootstrap/` construye instancias | Revisión del PR y el propio diseño | Una segunda instancia daría dos verdades (TS-18, R-01) |
| `app/src/state/` no usa `createContext` | Revisión del PR | Un contexto de contenido sería una segunda fuente (NFR1.8, ADR-005 se refería al estado propio de la interfaz) |

**Cada regla tiene una compuerta real, y no todas son la misma.** El type-check cierra las aristas entre paquetes internos porque las referencias de proyecto no compilan si aparecen. No cierra las dependencias externas ni las rutas relativas hacia `app/`: para eso están las reglas de lint que el CI ya ejecuta con `npm run lint`. La regla de tipos de TS-21 se añade en U2 porque es la única que distingue `import type` de un import de ejecución.

## Superficie, cobertura y compatibilidad de los paquetes nuevos

`tech-stack-decisions.md` § Requisitos derivados de esta unidad declara cinco requisitos que nacen de las decisiones de pila, no de `requirements.md`: NFR5.5–5.7 y NFR7.4–7.5. Se diseñan aquí, porque son propiedades de la estructura de paquetes de esta unidad y no de ninguna pantalla.

| Requisito | Qué exige | Cómo lo cumple el diseño | Compuerta que lo demuestra |
|---|---|---|---|
| **NFR5.5** | Cada paquete nuevo publica su superficie en `src/index.ts`, trae sus pruebas y su referencia de proyecto de TypeScript | LC-6, LC-7 y LC-8 exponen **solo** lo que su `packages/<paquete>/src/index.ts` nombra; el resto de sus archivos es interno. Sus pruebas viven bajo `packages/<paquete>/src/**/*.test.ts`, que es lo que ya recoge el `testMatch` de la raíz, y cada paquete declara su `references` en `tsconfig` para que la app lo consuma sin `dist` construido (TS-17) | `npm test` (los tres árboles entran en la cobertura y en el mapeo de módulos), `npm run typecheck` (las referencias de proyecto fallan si la superficie no compila) y revisión del PR |
| **NFR5.6** | Cobertura por árbol: 80 % de líneas en `app/src/**` **y** en cada `packages/*/src/**` | Code Generation añade tres entradas a `coverageThreshold` en `jest.config.js` —`./packages/content-store/src/**`, `./packages/catalog/src/**` y `./packages/connectivity/src/**`—, con el mismo 80 % que ya tienen `design-system`, `app-shell` y `app-session`. Ningún paquete nuevo queda fuera del umbral ni se compensa con el total del monorepo | `npm test -- --coverage`: Jest falla si cualquiera de los árboles baja del umbral |
| **NFR5.7** | Fechas deterministas en pruebas: nada depende del reloj de la máquina | `createContentStore({ now })` recibe el reloj (TS-20) y la siembra lo usa para `createdAt` y `updatedAt`; las pruebas inyectan un `now` fijo y `formatCalendarDate` (C1) formatea ese valor, no el del sistema. Ninguna prueba de U2 llama a `new Date()` sin argumento ni usa `Date.now()` | Revisión del PR (ninguna lectura del reloj fuera del valor inyectado) y las pruebas de la siembra, que fijan la fecha esperada |
| **NFR7.4** | `expo-network` corre en Expo Go sin `prebuild` ni permiso declarado por la app | Un solo import, en `packages/connectivity/src/expo-network-adapter.ts` (LC-8, TS-16); no se edita ningún manifiesto porque no hay proyecto nativo, y Expo Go ya declara `ACCESS_NETWORK_STATE` (`security-design.md` § NFR4.5). Si el módulo faltara, BR6.3 arranca en línea | Recorrido en Expo Go sobre el teléfono Android: la app abre y el aviso de sin conexión responde al modo avión |
| **NFR7.5** | Ninguna dependencia nueva fuera de las APIs de Expo y React Native | Inventario cerrado: `expo-network` es la **única** dependencia nueva (TS-16); `FlatList` es de React Native (TS-22); no se añade librería de fechas (C1 ya publica `formatCalendarDate`), ni de estado (C4 con reducer propio), ni de listas | Revisión de los `package.json` de `app` y de los tres paquetes nuevos: solo `expo-network` aparece de más |

**Por qué estos cinco viven aquí y no en `performance-design.md` o `security-design.md`**: describen la forma del monorepo —superficie, umbral de cobertura, reloj inyectado, compatibilidad con Expo Go y cierre de dependencias—, y su compuerta natural es `npm test`, `npm run typecheck` y el recorrido en el teléfono, no una pantalla concreta. NFR7.4 se apoya en el adaptador que diseña `security-design.md` § NFR4.5 y NFR7.5 en el inventario de esta misma página; ninguna de las dos cosas cambia por ello.

## Dominios de fallo y radio de impacto

| ID | Qué falla | Qué se degrada | Qué sigue funcionando | Radio |
|---|---|---|---|---|
| **LC-1** | La pila de la pestaña no monta o desmonta la raíz | Se pierde el estado de la pantalla de abajo al abrir un detalle | El resto de la app | Una pestaña |
| **LC-2** | Una pieza del sistema de diseño falla al pintar | La pantalla se pinta sin esa pieza; el tema cae al claro si `useColorScheme` no responde | Las demás pantallas | Una pantalla |
| **LC-3** | La lectura de la sesión falla (`503`) | La app abre en Login en lugar de Inicio | Login completo | Una decisión de arranque |
| **LC-4** | La composición no construye una instancia | La app no llega a Inicio: es el fallo que la unidad no puede permitirse | — | Todo el tramo |
| **LC-5** | El logger falla | Los fallos no registrados se pierden | Todo lo demás | Diagnóstico |
| **LC-6** | `subscribeContent` lanza al establecerse | Esa pantalla pasa a `error` con «Reintentar» | Las demás pantallas siguen leyendo del mismo almacén | Una pantalla |
| **LC-6** | Una lectura (`getOpinion`, `getAuthor`) devuelve un código de error | Esa pantalla pasa a `error` con «Reintentar» | Inicio y las demás lecturas | Una pantalla |
| **LC-7** | `subscribe` no avisa de una portada | Las portadas se quedan como estaban (bloque o última `coverUrl`) | El feed, los textos y las acciones | Las portadas |
| **LC-7** | `coverFor` no resuelve un metadato | Esa tarjeta cae al bloque de inicial y, si toca, se enciende el banner de portadas | La tarjeta completa y el recorrido | Una portada |
| **LC-8** | El adaptador de red falla o falta | Se arranca **en línea**, sin aviso, y se registra `warn` | Todo el recorrido | El aviso de sin conexión |
| **LC-9** | Un hook no emite (suscripción mal cableada) | Su pantalla se queda en `loading` sin salida | Nada de esa pantalla | Una pantalla, pero sin salida |

**La regla que se lee de esta tabla**: casi todo degrada a una pantalla o a un aviso, y los dos fallos que no degradan —LC-4 y LC-9— son los que se prueban primero. Un fallo del almacén no tumba el catálogo ni la red; un fallo de red no tumba el contenido ya emitido.

### Los dos fallos que la unidad trata como intolerables

- **LC-9 sin emisión**: una pantalla en `loading` para siempre es el peor resultado visible de esta unidad, porque no hay «Reintentar» que la salve (el esqueleto no es un error). Por eso las tres suscripciones emiten al establecerse y cada paquete lo prueba: si esa condición se rompe, la pantalla se queda muda y ninguna prueba de pantalla lo detectaría por sí sola. Es la razón por la que el contrato de cada paquete incluye la prueba de «emite al suscribirse».
- **LC-4 con dos instancias**: si `instances.ts` se construyera dos veces (por ejemplo, una por pantalla), la suscripción del feed y la del detalle verían estados distintos y una escritura de U3 no se reflejaría en la otra pantalla. Se evita con un único módulo de instancias (TS-18) y se comprueba con una prueba de dos pantallas montadas a la vez que reciben la misma emisión.

## Recursos compartidos y quién los posee

| Recurso | Cuántas instancias | Quién lo crea | Regla |
|---|---|---|---|
| `contentStore` | **Una** | `app/src/bootstrap/instances.ts` | Es la fuente única del contenido; dos instancias serían dos verdades (TS-18) |
| `catalog` | **Una** | `instances.ts`, con `content` y `connectivity` | El aviso de portadas de una pantalla tiene que ser el mismo que ve la otra |
| `connectivity` | **Una** | `instances.ts`; se inyecta en `ShellServices` | La cáscara y las pantallas tienen que leer el mismo booleano (C6, BR6.4) |
| `appSession` | **Una** | `app/src/bootstrap/session.ts` (R-01) | Cerrar sesión desde Perfil tiene que devolver la app a Login |
| `logger` | Un módulo | Importado donde haga falta | Sin estado, sin red; único sitio que llama a `console` |
| Contador de versiones del catálogo | **Uno por hook**, no compartido | `useCatalog` | Es un detalle de repintado, no un dato del dominio: compartirlo obligaría a un contexto y a una segunda verdad |
| Clave de memoización de tarjetas | Una por pantalla | La pantalla | Se deriva de `(opinions, revision, catalogVersion, online)`, como fija `performance-design.md` § NFR8.5 —la conexión entra porque la decisión de portada depende de C6—; no se guarda en ningún sitio |
| Siembra | Un valor dentro de LC-6 | `content-store/src/seed.ts` | No se exporta un objeto mutable: dos almacenes parten de la misma siembra sin compartir estado (prueba de NFR3.6) |
| Almacenamiento seguro | Uno, con **dos claves y dos dueños** | LC-3 (sesión); U4 (token) | U2 no escribe en él; solo cierra sesión, que borra (NFR3.6, NFR4.4) |

## Sistema de diseño: dónde se cumple NFR6

| Requisito | Cómo lo cumple LC-2 | Quién lo comprueba |
|---|---|---|
| **NFR6.1 — Contraste** | «Tu opinión» y la línea de fechas usan `onPrimaryContainer` sobre `primaryContainer`; los pares ya están verificados en claro y oscuro por la utilidad de contraste de U1 | Prueba de ratio de U1 + revisión de que las piezas nuevas usan roles semánticos |
| **NFR6.3 — Tema del sistema** | Las piezas nuevas usan `color.*`, nunca valores crudos; el tema oscuro las cubre sin trabajo propio | Revisión de estilos + recorrido con el teléfono en claro y oscuro |
| **NFR6.5 — Área táctil** | «‹ Volver» toma su altura de `size.touch` (44); el texto visible es «‹ Volver» | Prueba de la cabecera de detalle |
| **NFR6.6 — No solo color** | «Tu opinión» (texto), el aviso con frase, el bloque con inicial y el chip con palabra | Pruebas de render de `OpinionCard` `own` y de `OfflineBanner`; recorrido en el teléfono |

**Por qué las piezas nuevas viven en LC-2 y no en la app**: `ErrorState`, `TextButton`, `AppHeader.leftSlot`, `EmptyState.body` y el estado `own` de `OpinionCard` los usan las cuatro pantallas y los volverá a usar U3/U4/U5. Si vivieran en `app/src/components/`, la segunda unidad que los necesitara los copiaría. Lo que sí vive en la app es lo que solo usan los dos detalles (`WorkHeader`) y el envoltorio del banner (`OfflineBanner`).

## Frontera con las unidades siguientes

| Punto que U2 deja listo | Quién lo usa | Qué contrato lo fija |
|---|---|---|
| `instances.ts` con contenido, catálogo y conectividad | U3, U4, U5 | TS-18, C4/C5/C6 |
| `useViewerId`, `useContent` y el patrón de suscripción | U3, U5 | TS-19 |
| `useCatalog` con su contador y la clave de memoización | U4 | NFR8.5 |
| `OfflineBanner` bajo cualquier cabecera | U4, U5 | C2 1.2.0 |
| `WorkHeader` reutilizable en Explorar | U4 | `frontend-components.md` |
| Detalle de opinión entregado y registrado | U3 (solo cablea «Editar») | C2 |
| Los tres puertos en `null` y sus tipos en `ports.ts` | U4 | C5, TS-21 |
| Cierre de sesión por `appSession` | U4 (al desconectar Spotify) | C3, R-01 |
| `AppLogCode` abierto a nuevos códigos | U3, U5 | NFR9.4 |

**Lo que este archivo no decide**: la topología de despliegue (no aplica: no hay despliegue, `team.md` § Deployment) ni el reparto de unidades (fijado en `unit-of-work.md`). Describe dónde vive cada cosa y qué se rompe si falla.

## Assumptions & Open Questions

- `[assumption]` Las cuatro áreas nuevas (LC-6 a LC-9) son las que tienen fallo propio en esta unidad; si U3 o U4 introducen una quinta —por ejemplo el paquete de Spotify—, la declaran en su propio `logical-components.md` y actualizan esta frontera.
- `[assumption]` La construcción de LC-6, LC-7 y LC-8 en `instances.ts` es síncrona y sin E/S; la única lectura asíncrona es la primera de LC-8, que no bloquea el primer fotograma.
- `[assumption]` El contador de `useCatalog` y la clave de memoización son detalles de la capa de estado y no cruzan ningún contrato: si U3 o U5 necesitan otro criterio de repintado, se decide en su diseño sin cambiar C5.
- **Open question para U3**: las escrituras amplían LC-6 con acciones nuevas; el mecanismo de emisión y la baja al desmontar no cambian.
- **Open question para U4**: `@melodify/spotify` será un componente propio (LC-10 de esa unidad) que implementa los tres puertos y es el dueño de su clave de almacenamiento; la regla de importación de tipos ya está puesta aquí.

## Sources

- `components` — `inception/domain-design/components.md` (ContentStore, Catalog, Connectivity, AppShell).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.2.0, C2 1.2.0, C3, C4, C5 1.1.0, C6 1.0.0, § Revisiones 12 y 13).
- `tech-stack-decisions` — `construction/u2-content-core/nfr-requirements/tech-stack-decisions.md` (TS-16 a TS-22).
- `performance-requirements` — `construction/u2-content-core/nfr-requirements/performance-requirements.md` (NFR1.4–1.8, NFR6.5–6.6).
- `security-requirements` — `construction/u2-content-core/nfr-requirements/security-requirements.md` (NFR3.6, NFR3.11, NFR9.4).
- `functional-spec` — `construction/u2-content-core/functional-design/functional-spec.md` (§ Contratos que U2 posee y consume, § Precisión a C2).
- `frontend-components` — `construction/u2-content-core/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `app/src/state/`, § `app/src/bootstrap/`).
- `logical-components (U1)` — `construction/u1-app-skeleton/nfr-design/logical-components.md` (LC-1 a LC-5).
