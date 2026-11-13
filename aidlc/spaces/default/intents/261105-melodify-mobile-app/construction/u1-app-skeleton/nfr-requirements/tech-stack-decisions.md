# Decisiones de pila técnica — U1 `u1-app-skeleton`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7, RC-01, RC-05, RC-06), de `inception/domain-design/decisions.md` (ADR-009 navegación, ADR-010 estado, ADR-011 almacenamiento), de `inception/refined-mockups/design-system-mapping.md` (tokens, contraste, inventario), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1, C2, C3), de `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style) y de las respuestas de `nfr-requirements-questions.md` (Q1 = A, Q4 = A, Q5 = C).
> Fecha: 2026-11-11. Etapa: NFR Requirements · Unidad: `u1-app-skeleton` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-01`…), el objetivo no funcional que sirve y las alternativas que se descartaron. Este archivo **fija la versión y el porqué**; no sustituye a los contratos, que siguen siendo la fuente de verdad de qué exporta cada paquete.

**La regla que gobierna el resto**: todo lo que entre aquí tiene que correr dentro de **Expo Go** en un teléfono Android **sin compilación propia** (RC-01, NFR7). Un módulo que exija prebuild queda fuera, por bueno que sea.

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-01 | Expo SDK **57**, fijado exactamente en `package.json` | NFR7, RC-05 |
| TS-02 | TypeScript en `strict: true`, sin `any` implícito | NFR5 |
| TS-03 | Monorepo con espacios de trabajo de npm y referencias de proyecto de TypeScript | NFR5 |
| TS-04 | React Navigation (native, bottom-tabs, native-stack) | NFR7, NFR2 |
| TS-05 | Estado con Context y `useReducer`, sin librería externa | NFR5, NFR7 |
| TS-06 | `expo-secure-store` como único mecanismo de persistencia | NFR3, NFR7 |
| TS-07 | Estilos con `StyleSheet` y tokens propios; sin librería de componentes | NFR6, NFR5, RC-01 |
| TS-08 | Iconos con `@expo/vector-icons` (Ionicons) y barra de estado con `expo-status-bar` | NFR6, RC-01 |
| TS-09 | Tema por `useColorScheme()`, sin selector manual ni persistencia | NFR6 |
| TS-10 | Pruebas con Jest, `jest-expo` y `@testing-library/react-native`; cobertura del 80 % por árbol | NFR5 |
| TS-11 | ESLint con `eslint-config-expo` y Prettier; los tres comandos son la puerta del CI | NFR5 |
| TS-12 | Cliente público de Spotify con PKCE y client ID por entorno | NFR3, NFR4, RC-09 |

## Requisitos derivados de esta unidad

Estos son los identificadores con los que Code Generation y Build and Test citan lo que este archivo exige; la columna derecha dice qué decisión lo cumple.

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR5.1 | TypeScript en `strict: true`, sin `any` implícito, comprobado con `tsc -b` | TS-02 |
| NFR5.2 | Monorepo con espacios de trabajo, un `package.json` por paquete y referencias de proyecto | TS-03 |
| NFR5.3 | Jest con `jest-expo` y Testing Library, cobertura del 80 % de líneas por árbol | TS-10 |
| NFR5.4 | ESLint con `eslint-config-expo`, Prettier y los tres comandos como puerta del CI | TS-11 |
| NFR6.1 | Contraste ≥ 4.5:1 en texto normal y ≥ 3:1 en texto grande e iconos, en ambos temas | TS-07, TS-14 |
| NFR6.2 | Áreas táctiles ≥ 44×44 en barra inferior, botones principales e iconos de la tarjeta | TS-14 |
| NFR6.3 | Tema claro u oscuro del sistema, sin selector manual; `null` se trata como claro | TS-09, TS-15 |
| NFR6.4 | El estado nunca se comunica solo por color: la pestaña activa cambia de color **y** de icono, y su etiqueta siempre está visible | TS-07, TS-14 |
| NFR7.1 | Expo SDK 57 fijado exactamente; el tramo corre en Expo Go sobre Android físico | TS-01 |
| NFR7.2 | Ningún módulo que exija compilación propia; solo APIs disponibles en Expo Go | TS-13 |
| NFR7.3 | Android es la única plataforma verificada; iOS no se prueba en esta versión | TS-13 |

## NFR7 — Compatibilidad: Expo Go en Android

### TS-01 — Expo SDK 57, fijado exactamente

| Aspecto | Decisión |
|---|---|
| **Versión** | **SDK 57**, la que el Expo Go instalado en el teléfono reporta (Q1 = A, Q5 = C). |
| **Cómo se fija** | `app/package.json` declara la versión **exacta** del SDK y de sus paquetes (`expo`, `react`, `react-native` y los módulos de Expo), sin rango `^` ni `~`. Es la versión que el SDK 57 fija; la resuelve `npx expo install`, no se elige a mano. |
| **Cómo se garantiza la exactitud** | Un `.npmrc` en la raíz del monorepo con `save-exact=true`: npm escribe `"1.2.3"` y no `"^1.2.3"`. `npx expo install` delega en npm, así que hereda la misma opción; si alguna vez escribiera un rango igualmente, el paso es reescribirlo a exacto antes del commit, y el PR lo deja ver en el diff del `package.json`. |
| **Por qué exacta** | El Expo Go del teléfono solo abre proyectos del SDK que soporta. Un rango abierto deja que una instalación futura suba de SDK y rompa la primera prueba del esqueleto (RC-05). |
| **Cómo se comprueba** | Abrir el proyecto en Expo Go en el teléfono físico y recorrer el tramo. Es la verificación de terminado de U1. |

**Alternativas descartadas**: el último SDK estable (obligaría a actualizar Expo Go antes de la primera prueba y añadiría una variable que no controlamos); no fijar versión (reproducible solo mientras el registro no cambie).

**Consecuencia**: al añadir una dependencia de Expo se usa `npx expo install`, que elige la versión compatible con el SDK 57, y no `npm install` a secas. El `.npmrc` de la raíz con `save-exact=true` hace que la escriba exacta; si aun así apareciera un rango, se reescribe antes del commit. Queda anotado como regla de la unidad.

### TS-13 — Solo lo que corre en Expo Go; nada de módulos nativos propios

Ninguna dependencia puede exigir `expo prebuild`, firma ni compilación nativa (RC-01, CT-05, `project.md` §Mandated). Esto incluye la tentación de un cliente HTTP nativo o de un almacenamiento con módulo propio: se usan las APIs que ya trae Expo.

**Android es la única plataforma verificada** en esta versión; iOS no se prueba (NFR7). El código no se escribe de forma deliberadamente incompatible, pero nadie lo verifica y ninguna decisión se toma por iOS.

## NFR5 — Mantenibilidad

### TS-02 — TypeScript en `strict: true`

- `strict: true` en la raíz y heredado por cada paquete; sin `any` implícito.
- Un `any` explícito lleva un comentario que explica por qué; nada de `// @ts-ignore` sin justificar (Code Style del equipo).
- `npm run typecheck` ejecuta `tsc -b` sobre las referencias de proyecto: cada paquete se comprueba y los consumidores ven sus tipos.

**Por qué `tsc -b` y no un `tsc --noEmit` suelto**: con ocho paquetes y sus dependencias, las referencias de proyecto comprueban cada uno en su contexto y detectan el error en el paquete que lo introduce, no en el consumidor.

### TS-03 — Monorepo con espacios de trabajo de npm

La estructura la fija `contract-summary.md` § Estructura del monorepo y esta etapa no la reabre. Lo que se decide aquí es con qué se sostiene:

| Pieza | Decisión |
|---|---|
| Gestor | **npm**, con `workspaces` en el `package.json` de la raíz. Ya está en la máquina, no añade herramienta ni configuración, y el CI no instala nada más. |
| Paquetes | `app/` (`@melodify/app`, privado, `0.0.0`) y `packages/*` (contratos versionados). |
| Resolución | Los paquetes internos no se publican: los resuelve el espacio de trabajo. |
| TypeScript | Un `tsconfig.json` raíz con referencias a cada paquete. |
| Pruebas | Un solo proyecto de Jest en la raíz que incluye `app/` y `packages/*`; ningún paquete tiene script propio. |

**Alternativas descartadas**: pnpm o yarn (gestor y fichero de bloqueo extra para un beneficio que este proyecto no aprovecha); un único `package.json` sin paquetes internos (era la suposición de `unit-of-work.md`, sustituida por F2 = B en Contract Design, porque los contratos se versionan y se miden por paquete).

### TS-04 — React Navigation

`@react-navigation/native`, `@react-navigation/bottom-tabs` y `@react-navigation/native-stack`, en la versión que `npx expo install` resuelva para el SDK 57 (ADR-009).

- **Qué resuelve**: cinco pestañas persistentes, una pila por pestaña, el detalle apilado dentro de la pestaña de origen, el gesto de atrás de Android y la conservación de scroll al volver.
- **Configuración de enlaces**: el esquema `melodify` (`melodify://spotify-callback`) se declara en `app.json` desde U1; U4 lo usa para volver de PKCE.
- **Alternativas descartadas**: `expo-router` (impone una estructura de rutas distinta de `app/src/screens/`); navegación propia con estado (reimplementar pestañas, pilas y atrás de Android es más código y más superficie de error).

### TS-05 — Estado con Context y `useReducer`

`AppSession` y la cáscara usan Context con `useReducer`, sin librería de estado (ADR-010). El estado de esta app es pequeño y local: una sesión, unos servicios y un controlador de presentación. Redux, Zustand o similar añadirían una dependencia y una convención que nadie necesita.

### TS-06 — `expo-secure-store` como único mecanismo de persistencia

Se usa para el recuerdo de la sesión de la app (clave propia) y, en U4, para el token de Spotify (clave propia). **No se añade `AsyncStorage`** (ADR-011): una dependencia menos y un solo mecanismo que doblar en las pruebas.

**Coste asumido**: la lectura es algo más lenta que `AsyncStorage`; el presupuesto de arranque de NFR8.1 lo absorbe.

### TS-07 — Estilos con `StyleSheet` y tokens propios

Ninguna librería de componentes (ni Paper, ni NativeBase, ni Tamagui). El sistema propio mínimo vive en `packages/design-system` con tokens (`color`, `type`, `space`, `radius`, `size`), temas claro y oscuro, `ThemeProvider` y `useTheme`.

- **Regla**: los componentes usan roles semánticos (`color.text`, `color.surface`), nunca valores crudos. Ningún componente importa `tokens.ts` directamente.
- **Por qué**: seis pantallas y una decena de componentes; una librería añadiría más superficie de la que ahorra y cada dependencia extra es una cosa más que puede pedir compilación propia (RC-01).

### TS-08 — Iconos y barra de estado

`@expo/vector-icons` (Ionicons) para la barra inferior y las acciones; viene con Expo, no requiere instalación aparte ni compilación. `expo-status-bar` ajusta el contraste de los iconos del sistema al tema activo.

### TS-09 — Tema por `useColorScheme()`

La app sigue el tema claro u oscuro del sistema, sin selector manual y sin persistir la elección (FR2.4, BR2.5). `useColorScheme()` devuelve `null` cuando el sistema no informa: se trata como claro.

### TS-10 — Pruebas con Jest, `jest-expo` y Testing Library

| Aspecto | Decisión |
|---|---|
| Runner | Jest con el preset `jest-expo`. |
| Render | `@testing-library/react-native`, consultando por texto y por rol accesible, no por estructura interna. |
| Proyecto | Uno solo en la raíz, con `app/` y `packages/*`. |
| Cobertura | `--coverage` con umbral del **80 % de líneas por árbol**: una entrada de `coverageThreshold` por ruta (`./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**`, `./packages/app-session/src/**`, …). Una ruta de paquete se añade cuando la unidad que lo crea lo crea. |
| Qué se mide | `collectCoverageFrom` explícito sobre `app/src/**/*.{ts,tsx}` y `packages/*/src/**/*.{ts,tsx}`. Sin él, `--coverage` solo cuenta lo que alguna prueba importa y un módulo sin probar no baja el porcentaje. |
| Qué se excluye | Solo tres cosas, las que fija la práctica del equipo: ficheros de declaración (`**/*.d.ts`), el propio arnés de pruebas (`**/__tests__/**`, `**/*.test.{ts,tsx}`, `**/jest.setup.*`) y el punto de entrada del runtime (`app/index.js`/`app/index.ts`, que solo registra la app). **No** se excluye `app/src/bootstrap/`: el logger, los servicios por defecto y los puertos se prueban como cualquier otro módulo, porque son código con ramas. Assets y configuración generada no entran porque no son `src/**`. |
| Dobles | Las llamadas a Spotify y el almacenamiento seguro se sustituyen por dobles. Ninguna prueba sale a la red ni necesita credenciales, cuenta ni client ID real. |
| Orden | **Test-after**: se implementa cada capa (utilidad, hook, pantalla) y se escriben y ejecutan sus pruebas antes de pasar a la siguiente (Testing Posture del equipo). |

**Por qué el umbral va por árbol y no global**: con un umbral global, un paquete bien probado compensa a otro que no lo está; por árbol, cada uno cumple o el CI se pone rojo.

**Qué no se prueba automáticamente**: el recorrido real en el teléfono. Eso es verificación manual en Expo Go y sigue siendo el criterio de terminado.

### TS-11 — ESLint, Prettier y los tres comandos del CI

| Comando | Qué ejecuta | Qué bloquea |
|---|---|---|
| `npm test` | `jest --coverage` | Un árbol por debajo del 80 % o una prueba rota |
| `npm run typecheck` | `tsc -b` | Un error de tipos |
| `npm run lint` | `eslint .` con `eslint-config-expo` | Una regla incumplida, incluido un `console.*` fuera del logger (`no-console` en `error`, con la excepción declarada de `app/src/bootstrap/logger.ts`) |

Prettier resuelve el formato: nadie discute formato en un PR. El CI corre en cada push y cada PR; un rojo bloquea el merge (`team.md` §Way of Working).

**Convención de nombres**: `camelCase` para variables y funciones, `PascalCase` para componentes y tipos, `SCREAMING_SNAKE_CASE` para constantes de módulo; componentes en `PascalCase.tsx` y hooks en `useAlgo.ts`.

## NFR6 — Accesibilidad

### TS-14 — Tokens con contraste verificado en ambos temas

| Requisito | Valor | Dónde se comprueba |
|---|---|---|
| Texto normal | ≥ 4.5:1 | Tabla de contraste de `design-system-mapping.md`, sobre los pares de token usados en cada pantalla |
| Texto grande e iconos | ≥ 3:1 | Igual |
| Áreas táctiles | ≥ 44×44 | Barra inferior, botones principales e iconos de la tarjeta |

Los valores salen de `design-system-mapping.md` y no se reinterpretan aquí: la unidad **hereda** los tokens y su tabla de contraste. Lo que esta unidad garantiza es que el sistema de diseño los expone como roles semánticos y que el tema oscuro no se resuelve con opacidades improvisadas.

**Fuera de alcance**: las etiquetas de lector de pantalla no entran en esta versión (NFR6). Aun así, los elementos interactivos se declaran con su rol y su texto visible, porque sale gratis y no empeora nada.

### TS-15 — El tema no se elige, se sigue

Sin selector manual, sin persistencia de la preferencia y sin `Appearance.setColorScheme`. Si el sistema no informa (`null`), se usa el tema claro. Es lo que pide FR2.4 y lo que evita una pantalla que no coincide con el resto del teléfono.

## NFR3 / NFR4 — Seguridad de la configuración

### TS-12 — Cliente público de Spotify con PKCE

| Aspecto | Decisión |
|---|---|
| Tipo de cliente | Público: **sin client secret** en ninguna forma (`project.md` §Forbidden). |
| Autorización | PKCE (Authorization Code + code verifier), en U4. |
| Client ID | `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`, documentada vacía en `.env.example` y fuera del repositorio en `.env` (Q4 = A). |
| Redirect | `melodify://spotify-callback`, declarado en el esquema `melodify` de `app.json` desde U1 (A6). |
| Token | Almacenamiento seguro, clave propia; borrado al desconectar (U4). |

**Por qué U1 lo decide aunque no lo implemente**: el esquema y la variable de entorno son parte del andamiaje. Cambiarlos después obliga a tocar `app.json`, el `.env.example` y el registro de la app en el portal de Spotify a la vez.

**Prerrequisito externo (RC-09)**: registrar la app en el portal de Spotify y aceptar `melodify://spotify-callback` es trabajo previo a la demostración con sesión, no de la app. Si el portal rechazara ese redirect, U4 decide entre un proxy local y demostrar solo el recorrido sin sesión.

## Versiones y fijación

| Pieza | Cómo se fija | Nota |
|---|---|---|
| Expo SDK y módulos de Expo | Versión exacta (SDK 57), con `npx expo install` | TS-01 |
| React y React Native | Versión exacta que fija el SDK 57 | No se eligen a mano |
| React Navigation | Exacta, la que `npx expo install` resuelve para el SDK 57, escrita sin rango | TS-04; no se deja como «compatible con el SDK» |
| TypeScript, Jest, `jest-expo`, Testing Library, ESLint, Prettier | Versiones fijadas en el `package.json` de la raíz | Herramientas de desarrollo, no de ejecución |

Todo lo anterior se escribe sin `^` ni `~` gracias a `save-exact=true` en el `.npmrc` de la raíz; un rango que aparezca en un diff de `package.json` es un defecto del PR, no una preferencia.

Se commitea el fichero de bloqueo (`package-lock.json`): sin él, «fijado exactamente» solo vale para el primer `npm install`.

## Assumptions & Open Questions

- `[assumption]` El Expo Go del teléfono soporta el SDK 57 y lo seguirá soportando durante la construcción de las seis unidades; si el teléfono actualizara Expo Go a un SDK mayor, la app seguiría abriéndose solo si el SDK 57 sigue soportado y se anotaría entonces.
- `[assumption]` La versión exacta de React Native y de React la dicta el SDK 57; este documento no la escribe a mano para no quedar desfasado respecto de lo que `npx expo install` resuelve.
- `[assumption]` `@expo/vector-icons` y `expo-status-bar` vienen incluidos con el SDK y no requieren instalación ni compilación aparte.
- **Open question para U2**: al crear `packages/content-store`, `packages/catalog` y `packages/connectivity` se añaden sus entradas a `coverageThreshold` y sus referencias de proyecto.
- **Open question para U4**: la versión de la API de Spotify y el alcance de los permisos se confirman allí; aquí solo se fija el tipo de cliente y el transporte del client ID.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR5, NFR6, NFR7, RC-01, RC-05, RC-06, RC-09).
- `decisions` — `inception/domain-design/decisions.md` (ADR-009, ADR-010, ADR-011).
- `design-system-mapping` — `inception/refined-mockups/design-system-mapping.md` (tokens, tabla de contraste, inventario).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1, C2, C3, C5).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§Forbidden, §Mandated).
- `functional-spec` — `construction/u1-app-skeleton/functional-design/functional-spec.md` (F1, F4, F6; § Puntos de integración).
- `nfr-requirements-questions` — `construction/u1-app-skeleton/nfr-requirements/nfr-requirements-questions.md` (Q1 = A, Q4 = A, Q5 = C, confirmadas).
