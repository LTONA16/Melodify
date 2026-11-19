# Decisiones de pila técnica — U5 `u5-activity`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR5, NFR6, NFR7, NFR9, RC-01, RC-03), de `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Testing Posture, § Code Style), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0), de `construction/u5-activity/functional-design/functional-spec.md` (§ Contratos que U5 posee, § Enmienda al contrato, § Assumptions) y de `construction/u5-activity/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `@melodify/activity` — la forma del paquete, § `app/src/screens/actividad/`, § `app/src/state/`, § `app/src/bootstrap/`).
> Fecha: 2026-11-19. Etapa: NFR Requirements · Unidad: `u5-activity` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-39`…`TS-43`, continuando la numeración de U4, que terminó en `TS-38`), el objetivo no funcional que sirve y las alternativas que se descartaron. Lo que U1–U4 ya decidieron no se repite: **TS-01 (versiones exactas), TS-02 (`strict`), TS-03 (monorepo), TS-05 (una sola instancia y fábricas), TS-10 (Jest y `jest-expo` con cobertura por árbol), TS-11 (ESLint, Prettier y CI), TS-13 (solo Expo Go), TS-14 (tokens), TS-17 (paquetes con `src/index.ts`), TS-18 (fábricas explícitas, sin contenedor), TS-20 (reloj inyectable) y TS-29 (temporizadores propios) siguen vigentes y esta unidad los hereda sin reabrirlos.**

**La regla que gobierna el resto**: U5 **no añade ninguna dependencia**. Ni un módulo de Expo, ni una librería, ni un paquete de fechas. La unidad entera se construye con lo que ya está en el árbol —`react`, `react-native`, `jest`— y con un paquete interno nuevo que solo declara tipos de otros dos. En una unidad cuyo trabajo es *leer lo que ya está en memoria y pintarlo*, una dependencia nueva sería una señal de que se está resolviendo un problema que no existe.

**Qué cambia respecto a U1–U4.** Hasta ahora cada unidad añadía algo al inventario: U1 la cáscara, U2 el contenido, U3 las pantallas de escritura, U4 la red y una credencial. **U5 es la primera unidad que solo compone**: un paquete nuevo, dos piezas nuevas en C1 y dos archivos nuevos en la app. Su dificultad no está en las herramientas sino en tres decisiones que sí son estructurales:

1. **Dónde se deriva** la actividad (en un paquete, no en la pantalla).
2. **Cuándo se suscribe** (no al construirse).
3. **Qué cruza a C1** (un modelo de presentación, no el modelo del contrato).

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-39 | `@melodify/activity` 1.1.0 es un paquete nuevo con una entrada, sin dependencias de ejecución, referenciado desde los dos `tsconfig`, mapeado en Jest, con su `coverageThreshold` y con dos reglas de linter que hacen cumplir BR21.6 | NFR5, NFR3, NFR7 |
| TS-40 | `createActivity` no trabaja al construirse: abre la suscripción a C4 en la primera observación y la cierra cuando se va el último observador | NFR8, NFR1 |
| TS-41 | La derivación es una función pura sobre el contenido vigente, sin registro de eventos ni caché propia; el reloj entra por parámetro para que la agrupación sea afirmable | NFR5, NFR1, NFR8 |
| TS-42 | `@melodify/design-system` 1.5.0 añade `ActivityRow` y `DayHeader`; el mapeo `ActivityEventView` → `ActivityEventSummary` vive en la pantalla y no se añade ninguna forma a `Skeleton` | NFR6, NFR5, NFR3 |
| TS-43 | Pruebas con dobles de C4 y C3, sin React dentro del paquete, con reloj fijo y sin ningún caso que dependa de la hora real | NFR5, NFR1 |

## Requisitos derivados de esta unidad

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR5.12 | El paquete nuevo cumple el 80 % de líneas por árbol, con su entrada propia en `coverageThreshold` | TS-39, TS-43 |
| NFR6.10 | La fila y el encabezado nuevos cumplen 44×44 y contraste, y el estado se dice con palabras | TS-42 |
| NFR7.8 | La unidad no estrena ningún módulo nativo: `SectionList` es del núcleo de React Native | TS-39, TS-42 |
| NFR3.21 (seguridad) | La Actividad no escribe, no pide red y no toca el catálogo | TS-39 |

## NFR7 — Compatibilidad: nada nuevo que instalar

### NFR7.8 — La unidad no estrena un solo módulo, y por tanto no puede romper Expo Go

- **`SectionList` es del núcleo de React Native 0.86**, no de `@react-native-community`. No hay `FlatList` con librería de cabeceras pegajosas, ni un paquete de fechas (`date-fns`, `dayjs`) para agrupar por día: `getUTCFullYear`/`getUTCMonth`/`getUTCDate` y `formatCalendarDate` de C1 ya lo resuelven (BR22.2).
- **Ninguna dependencia nueva en ningún `package.json`.** Ni `app/`, ni `packages/activity/`, ni la raíz. `npx expo install` no se ejecuta en esta unidad y el lockfile solo cambia por las versiones de los paquetes internos.
- **Lo único que se instala es un workspace nuevo**, y un workspace no es un módulo nativo: Metro lo resuelve como una carpeta más del monorepo (TS-03). Si el paquete no resolviera, el síntoma sería un error de importación al arrancar, no un aviso de `prebuild`.
- **Cómo se comprueba**: `npx expo start` levanta Metro sin aviso de módulo ausente, y la pestaña Actividad se abre en Expo Go con la siembra. `git diff --stat package-lock.json` no debe mostrar una dependencia externa nueva; solo las versiones internas que mueve TS-42.

### TS-39 — `@melodify/activity` 1.1.0: un paquete pequeño, sin dependencias de ejecución y con la frontera en el linter

`@melodify/activity` vive en `packages/activity/` y es el noveno árbol del monorepo que fija `contract-summary.md` § Estructura del monorepo. Su forma:

```json
{
  "name": "@melodify/activity",
  "version": "1.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@melodify/app-session": "1.1.0",
    "@melodify/content-store": "1.2.0"
  }
}
```

- **Una sola entrada, sin mapa `exports`.** A diferencia de C7, C8 no tiene dos superficies: quien consume la actividad consume `createActivity` y sus tipos. Añadir `exports` sería copiar la forma de U4 sin la razón que la justificaba (dos entradas con una credencial detrás de una de ellas).
- **Las dos dependencias se importan solo como tipo.** `packages/activity/src/` nombra `ContentStore`, `ContentResult`, `OpinionView`, `LikeView`, `CommentView` y `AppSession`, `SessionView` con `import type` (C8 § `rule`); las implementaciones llegan por el constructor. Se declaran en `package.json` igual que C5 declara `@melodify/connectivity` y `@melodify/content-store`: un tipo público que se nombra tiene que poder resolverse desde fuera, y la declaración es lo que hace que `npm ls` diga la verdad. **No hay arista de ejecución** hacia C3 ni C4, y el import se borra al compilar.
- **No depende de `@melodify/design-system`.** El mapeo a `ActivityEventSummary` vive en la pantalla (`app/src/screens/actividad/toActividadSections.ts`), que es donde C1 y C8 se encuentran (TS-42). Consecuencia directa: **el paquete no importa React ni React Native** y se prueba como lógica pura, sin montar un árbol (TS-43). Es la diferencia con `@melodify/spotify`, que sí declara C1 porque su modelo de estado publica una unión de C1.
- **Lo que hay que tocar fuera del paquete, y nada más**:
  - `tsconfig.json` (raíz): `{ "path": "./packages/activity" }` en `references`.
  - `packages/activity/tsconfig.json`: extiende `tsconfig.base.json`, `rootDir: "./src"`, `outDir: "./dist"`, `tsBuildInfoFile: "./dist/.tsbuildinfo"`, `include: ["src/**/*"]` y `references` a `../app-session` y `../content-store`. Sin las dos referencias, `tsc -b` compila los fuentes de esos paquetes dentro de `activity` —cuyo `rootDir` es `./src`— y `npm run typecheck` falla; es la razón por la que C5 declara las suyas.
  - **`app/tsconfig.json`**: `{ "path": "../packages/activity" }` en `references`, por la misma razón y con el mismo síntoma.
  - `jest.config.js` → `moduleNameMapper`: `"^@melodify/activity$": "<rootDir>/packages/activity/src"`. El `$` evita que el patrón capture un subcamino que hoy no existe.
  - `jest.config.js` → `coverageThreshold`: `"./packages/activity/src/**": { lines: 80 }`. U4 dejó esta entrada explícitamente para U5 (`tech-stack-decisions.md` § Open question); se escribe ahora, que es cuando el árbol existe. `collectCoverageFrom` y `testMatch` no cambian: `packages/*/src/**` ya cubre un paquete nuevo.
  - `app/package.json`: añade `"@melodify/activity": "1.1.0"` y sube `"@melodify/design-system"` a `"1.5.0"` (TS-42).
  - **`package.json` de la raíz no cambia**: `workspaces` ya incluye `packages/*`.
- **La frontera de BR21.6 se vuelve una regla del linter**, no una convención de revisión. `eslint.config.js` gana un bloque para `packages/activity/src/**`:

  ```js
  {
    files: ["packages/activity/src/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": ["error", {
        paths: [
          { name: "@melodify/catalog",
            message: "La Actividad no toca el catálogo (BR21.6).",
            allowTypeImports: false },
          { name: "@melodify/spotify",
            message: "La Actividad no habla con Spotify (BR21.6).",
            allowTypeImports: false },
          { name: "react", message: "La Actividad es lógica pura; la interfaz vive en la app (TS-42)." },
          { name: "react-native", message: "La Actividad es lógica pura; la interfaz vive en la app (TS-42)." },
        ],
      }],
      "no-restricted-globals": ["error",
        { name: "fetch", message: "La Actividad se deriva de memoria: no pide red (BR21.6)." }],
    },
  }
  ```

  Las dos prohibiciones de importación cierran la puerta que BR21.6 nombra; la de `react`/`react-native` protege la decisión de TS-42 —un `useState` dentro del paquete convertiría la lógica en un hook y obligaría a montar React para probarla—; y `no-restricted-globals` con `fetch` hace comprobable la frase «no hace ninguna petición HTTP», que si no sería solo una promesa. El bloque global de `no-restricted-imports` sigue aplicando: `expo-secure-store`, `expo-network` y `AsyncStorage` ya están prohibidos en todo el repositorio, y `@melodify/app` también.
- **El sufijo de versión es 1.1.0 y no 1.0.0** porque C8 nace en 1.0.0 en el contrato y la enmienda aditiva de esta unidad —`GET /activity/changes` (`subscribeActivity`), registrada en `functional-spec.md` § C8 1.1.0— la sube a 1.1.0 antes de que el paquete exista. Publicar 1.0.0 y luego 1.1.0 en el mismo PR daría dos versiones de un paquete que nadie ha consumido nunca.

**Alternativas descartadas**: derivar la actividad dentro de `ActividadScreen` sin paquete (la lógica quedaría fuera del suelo de cobertura por árbol y no habría dónde probar la agrupación sin montar la pantalla); colocar C8 en `@melodify/content-store` (mezclaría el almacén con una vista derivada y daría a C4 una responsabilidad de presentación); declarar el paquete con `paths` en vez de referencias de proyecto (rompería `tsc -b`, que es el comando de CI); añadir `exports` copiando la forma de C7 (una puerta nueva sin una segunda entrada detrás).

### TS-40 — `createActivity` no trabaja al construirse y cierra lo que abre

| Momento | Qué pasa con la suscripción a C4 | Por qué |
|---|---|---|
| `createActivity({ content, session })` en `bootstrap/instances.ts` | **Nada**: guarda las dos dependencias y devuelve la instancia | El arranque de la app no deriva ni se suscribe por una pantalla que quizá no se abra (NFR8.17) |
| `getActivity()` | Deriva una vez y devuelve la vista | Es una lectura puntual; no necesita quedarse escuchando |
| Primera llamada a `subscribeActivity(listener)` | Resuelve la identidad, deriva, emite y **abre** `subscribeContent({ viewerId })` | Es la primera vez que hay alguien a quien avisar |
| Cada emisión de C4 | Deriva una vez y notifica a todos los suscriptores | BR23.5: una derivación por cambio (NFR8.17) |
| La función de baja del último `listener` | **Cierra** la suscripción a C4 | Una pestaña que nadie mira no debe retener el almacén ni derivar en balde |
| `retryActivity()` | Vuelve a `loading`, deriva y emite | No abre una segunda suscripción: reutiliza la que ya hay o la abre si no existía |

- **Por qué importa y no es una optimización prematura.** La app tiene seis pestañas y el contenido puede cambiar desde Crear mientras Actividad nunca se ha abierto. Si `createActivity` se suscribiera al construirse, cada escritura dispararía una derivación que nadie observa; y como `instances.ts` construye todas las fuentes al arrancar, sería una derivación por cada opinión publicada durante toda la sesión. La regla es simple y se puede afirmar en una prueba: **cero lecturas y cero suscripciones antes de la primera observación**.
- **La cuenta de suscripciones es de C8, no de la pantalla.** La pantalla se suscribe una vez al montar y se da de baja al desmontar; la pestaña no se desmonta al navegar (BR24.1), así que en el uso normal hay exactamente una suscripción a C8 y una a C4. Si algún día dos consumidores observaran la actividad —por ejemplo, un contador en otra pantalla—, C8 seguiría abriendo **una** suscripción a C4 y notificando a los dos.
- **Un fallo al suscribirse no deja la instancia inservible**: el estado pasa a `error`, no se guarda una suscripción a medias, y el siguiente `retryActivity()` o el siguiente `subscribeActivity` lo vuelven a intentar. Una suscripción que se abre y falla se cierra con el cierre que devolvió C4, para no dejar dos.
- **Cómo se comprueba**: prueba con un doble de C4 que cuenta llamadas y comprueba cero tras `createActivity`; prueba que comprueba una suscripción tras el primer `subscribeActivity` y ninguna adicional tras el segundo; prueba que comprueba que la baja del último `listener` llama a la función de baja de C4; prueba de `retryActivity` que comprueba que la cuenta de suscripciones no sube.

## NFR5 — Mantenibilidad

### NFR5.12 — El árbol nuevo cumple el 80 % por su cuenta

- `contract-summary.md` § Estructura del monorepo fija 80 % de líneas **por árbol**, y ya nombra `./packages/activity/src/**`. U5 escribe esa entrada en `jest.config.js` cuando el árbol existe (TS-39).
- Un paquete no se compensa con otro ni con el total: si `packages/activity` baja del 80 %, `npm test` se pone rojo y el PR no entra (`.github/workflows/ci.yml`). El suelo no se baja para hacer pasar la etapa (TS-11, `team.md` § Testing Posture).
- **De dónde sale la cobertura**: la derivación de los tres tipos de evento, la exclusión de lo propio, la lectura solo de las opiniones con contador, el orden con desempate, la agrupación por día UTC con sus tres etiquetas, el identificador estable, las cuatro transiciones de estado, el reintento, la contención del fallo, la baja del último observador y la notificación que aísla a un `listener` defectuoso. Es lógica pura: se cubre sin montar un componente.
- **Lo que no se mide con líneas**: que la lista no se congele al desplazarse con la siembra. Eso es el recorrido en el teléfono (U6, FR12.1).
- **Cómo se comprueba**: `npm test -- --coverage` y lectura del resumen por ruta; la entrada de `packages/activity` aparece con su propio porcentaje, no agregada a `app/src`.

### TS-41 — La derivación es una función pura sobre el contenido vigente, con el reloj por parámetro

- **Sin registro de eventos.** ADR-006 ya lo decidió y esta etapa lo refuerza: no hay una colección de eventos que mantener, ni un `addEvent`, ni una migración. La lista es una **función** del contenido: mismas opiniones, mismos me gusta, mismos comentarios y mismo reloj producen la misma `ActivityView`. No hay estado que se pueda desincronizar (BR21.1, NFR8.17).
- **La forma de dentro del paquete** separa tres cosas que se prueban por separado:

  | Pieza | Qué es | Se prueba |
  |---|---|---|
  | `deriveActivity(content, viewerId, now)` | Función pura: recibe el contenido ya leído, el autor y el instante; devuelve los eventos ordenados y agrupados | Sin dobles: se le pasa un objeto y se afirma el resultado |
  | `toActivityView(events, now)` | Agrupa por día UTC y calcula `day`/`label` | Con fechas fijas alrededor de la medianoche UTC |
  | `createActivity({ content, session })` | La fábrica: resuelve identidad, lee C4, ordena las emisiones, gestiona la suscripción (TS-40) | Con dobles de C4 y C3 |

- **El reloj entra por parámetro y no se lee dentro.** `formatRelativeTime` de C1 calcula el «hace 2 h» en el momento de pintar, así que la fila no necesita un reloj propio; pero la etiqueta del grupo («Hoy», «Ayer») sí depende del instante, y una prueba que leyera `Date.now()` pasaría o fallaría según la hora a la que se ejecutara. `toActivityView(events, now)` recibe el instante; la fábrica pasa `Date.now` por defecto. Es la misma regla que TS-20 aplicó a C4: **el tiempo es una entrada, no una lectura escondida**.
- **Sin caché propia.** El contenido vive en memoria y ya se invalida con su revisión; una caché de la derivación sería una segunda verdad que caducar y la primera cosa que se desincroniza. Una pasada por las opiniones propias es más barata que invalidar (NFR8.16).
- **Un solo sitio para la decisión de «leer o no leer»**: `likeCount > 0` y `commentCount > 0` se comprueban antes de pedir la lista, en la misma función que emite el evento de publicación, para que el número de lecturas sea consecuencia del contenido y no de un `if` disperso (BR21.3, BR21.4, NFR8.17).
- **Cómo se comprueba**: prueba de `deriveActivity` con un contenido de tres opiniones propias y dos ajenas que afirma los ocho eventos de la siembra y la ausencia de los ajenos; prueba con un me gusta propio sobre una opinión propia que afirma que no emite evento; prueba con `now` a las 23:59:30 UTC y un evento a las 00:00:10 UTC del día siguiente que afirma dos grupos distintos; prueba que compara dos derivaciones del mismo contenido y afirma el mismo orden y los mismos `eventId`.

### TS-42 — `@melodify/design-system` 1.5.0 con dos piezas, y el mapeo en la pantalla

`@melodify/design-system` pasa de 1.4.0 a **1.5.0** con dos exportaciones nuevas y ningún cambio en las existentes:

| Pieza | Props | De dónde salen sus datos |
|---|---|---|
| `ActivityRow` | `{ event: ActivityEventSummary, onPress: () => void }` | `ActivityEventSummary` de C1, mapeado por la pantalla |
| `DayHeader` | `{ label: string }` | La etiqueta del grupo de C8, copiada tal cual |

- **`ActivityEventSummary` es un modelo de C1 y no el `ActivityEventView` de C8.** C1 no importa modelos de C4, C5 ni C8 (R-22 del contrato): la pantalla mapea. Esa frontera es lo que permite que U1 compilara el inventario de C1 sin esperar a U5, y lo que hace que `ActivityRow` se pueda probar con un objeto literal de cinco campos.
- **El mapeo es una función explícita**, `toActividadSections(groups): ActividadSection[]`, en `app/src/screens/actividad/`, y es la única que conoce los dos modelos. No hay conversión implícita, ni un `as`, ni un tipo que herede del otro. Se prueba con la siembra y con un grupo vacío.
- **No se añade una forma a `Skeleton`.** La carga usa `Skeleton` forma `header` (32) para los encabezados y forma `card` (96) para las filas (BR23.1). La forma `card` es algo más alta que una fila de actividad —la lista real puede ser más corta que su esqueleto, nunca más larga— y se acepta antes que publicar `SkeletonShape = 'activityRow'` para un solo uso en una pieza que ya tiene nueve formas. Si U6 encontrara el salto molesto en el teléfono, sería una decisión de C1 con su propio consumidor, no un cambio de esta etapa.
- **`ActivityRow` no lleva imagen.** No recibe `coverUrl`, no importa `CoverArt` y no toca C5 ni C7: la fila es texto, icono y chevron (BR24.2, NFR3.22). Es lo que mantiene a U5 libre de la superficie de U4.
- **Las dos piezas usan solo tokens del tema activo** (`type.label`, `color.textSecondary`, `color.border`): ni un color literal ni una altura mágica. El contraste se hereda de los pares de TS-14 y se comprueba en C1, no en la pantalla.
- **Versionado**: `packages/design-system/package.json` pasa a `1.5.0`; `app/package.json` sube su dependencia a `1.5.0`; `packages/spotify/package.json` **también** sube su dependencia a `1.5.0`, porque declara C1 y el lockfile quedaría con dos versiones del mismo paquete interno. `packages/app-shell` y `packages/catalog` no declaran C1 y no se tocan.
- **Cómo se comprueba**: pruebas de `ActivityRow` por los tres tipos (texto literal, icono, tiempo relativo, `onPress`) y de `DayHeader` (etiqueta y estilo), más una prueba de `toActividadSections` que afirma que un `ActivityEventView` se convierte en el `ActivityEventSummary` esperado —incluido el `actorHandle` opcional, que el contrato declara— y que `ActivityRow` no lo pinta.

### NFR6.10 — 44×44, contraste heredado y el estado con palabras

- **La fila entera es el objetivo táctil**: la altura mínima de `ActivityRow` es **56** (por encima de 44), y `onPress` cubre toda la fila, no solo el chevron. El chevron es un indicador, no un botón aparte.
- **El icono es decorativo y no se anuncia**: el texto de la fila ya dice qué pasó, así que el icono no lleva etiqueta de accesibilidad y la fila se anuncia con su texto completo (BR24.2). No se estrenan etiquetas de lector de pantalla: NFR6 aprobado las deja fuera de esta versión.
- **El estado nunca se distingue solo por color**: la carga son esqueletos con su forma, el vacío y el error llevan texto y acción, y el aviso de sin conexión lleva su frase y su «Reintentar» (NFR2.14).
- **El contraste de `DayHeader` y de la fila sale de los pares de tokens de TS-14.** Si `textSecondary` sobre `surface` no llegara a 4.5:1 para el tiempo relativo, se corrige en C1 y se anota en el contrato, no se elige un color a ojo en la pantalla (misma regla que U2, U3 y U4).
- **Cómo se comprueba**: pruebas de `ActivityRow` que afirman la altura declarada y el texto visible; revisión de contraste con los pares de tokens; prueba de `ActividadView` por estado que afirma el texto y la acción de cada uno.

## NFR1 — Fiabilidad: una sola verdad sobre el estado

### TS-43 — Pruebas con dobles, sin React y sin reloj real

- **Qué se prueba en `packages/activity/src/**`**: la derivación de los tres tipos; la exclusión de lo propio; la lectura solo de las opiniones con contador; el orden con desempate por clase y por identificador; la agrupación por día UTC con las tres etiquetas y el caso de medianoche; los `eventId` estables; las transiciones `loading → ready | empty | error`, `ready → ready | empty | error`, `empty → ready | error` y `error → loading → …`; el fallo de `listOpinions`, de `listLikes`, de `listComments` y de `subscribeContent`; el `listener` que lanza; la baja del último observador; y que `retryActivity` no abre una segunda suscripción.
- **Qué se prueba en `app/src/**`**: `useActividad` (traduce C8 a estado de vista, expone `retry`, emite `ACTIVITY_LOAD_FAILED` una vez por fallo); `toActividadSections`; `ActividadView` por los cuatro estados más el aviso de sin conexión; `ActivityRow` y `DayHeader` en C1; y que `instances.ts` construye una sola instancia y no deriva al arrancar.
- **Ninguna prueba importa `@melodify/spotify` ni hace red.** El doble de C4 es un objeto literal que implementa las cuatro operaciones y cuenta llamadas; el de C3, un objeto con `getSession` y `subscribeSession`. `team.md` § Testing Posture ya lo exige, y aquí es trivial porque el paquete no tiene otra fuente.
- **`jest.useFakeTimers()` solo si una prueba necesita el reloj**, y aquí no lo necesita: la agrupación recibe el instante por parámetro (TS-41). Una prueba que dependiera de la hora real sería la primera en fallar a medianoche.
- **Nada de aserciones que siempre pasan.** Cada prueba de estado afirma el texto visible o el valor exacto del contrato; una prueba de `ActivityRow` que solo compruebe que monta no vale (`team.md` § Testing Posture).
- **Cómo se comprueba**: `npm test`, `npm run typecheck` y `npm run lint` en verde, y la revisión de que ninguna prueba nueva importa un módulo de Expo ni un paquete de Spotify.

## Versiones y fijación

| Paquete | Versión que publica U5 | Por qué |
|---|---|---|
| `@melodify/activity` | **1.1.0** | Paquete nuevo (C8 1.1.0): derivación de eventos, estados y suscripción. |
| `@melodify/design-system` | **1.5.0** | `ActivityRow`, `DayHeader` y el modelo `ActivityEventSummary`. |
| `@melodify/app` | 0.0.0 (sin cambios) | Consume `@melodify/activity` 1.1.0 y C1 1.5.0; no publica. |
| `@melodify/app-session` | 1.1.0 (sin cambios) | Se consume la identidad; U5 no la toca. |
| `@melodify/content-store` | 1.2.0 (sin cambios) | Se consume para derivar; U5 no escribe (BR21.6). |
| `@melodify/app-shell` | 1.4.0 (sin cambios) | Se consume `openOpinionDetail` y la pestaña. |
| `@melodify/connectivity` | 1.0.0 (sin cambios) | Se consume `online` para el aviso. |
| `@melodify/catalog` | 1.2.0 (sin cambios) | **No se consume**: la Actividad no lo toca. |
| `@melodify/spotify` | 1.0.0 (sin cambios de versión) | **No se consume**; solo su `package.json` sube la dependencia de C1 a 1.5.0. |

Todas las versiones se escriben exactas (`.npmrc` con `save-exact=true`, TS-01).

## Dependencias nuevas

**Ninguna.** Esta es la primera unidad del proyecto que no añade un módulo externo. La tabla se deja explícita para que la ausencia se lea como decisión y no como olvido:

| Paquete | Versión | Dónde entra | Para qué |
|---|---|---|---|
| — | — | — | — |

Lo que sí aparece es un **workspace nuevo** (`packages/activity`, TS-39) y dos versiones internas que se mueven (TS-42). Ninguno de los dos cambia el conjunto de módulos nativos que la app necesita para arrancar en Expo Go.

## Assumptions & Open Questions

- `[assumption]` El paquete no necesita React. Toda la lógica de la Actividad es derivación y gestión de suscripción; el estado de la vista lo lleva `useActividad` en la app. Si alguna vez C8 tuviera que exponer un hook propio, dejaría de ser una fuente de datos y pasaría a ser una pieza de interfaz, y esa decisión no se toma aquí.
- `[assumption]` `toActividadSections` puede recibir grupos vacíos sin romper: el estado `empty` de C8 evita pintar una lista vacía, pero la función no depende de esa garantía. Se prueban las dos cosas por separado para que un cambio en una no oculte un fallo en la otra.
- `[assumption]` El reloj por parámetro no se expone en la superficie pública de C8: `createActivity` usa `Date.now` y solo `toActivityView` —interno— lo recibe. Si una prueba de la app necesitara fijar el instante, lo haría por el reloj de C4 (TS-20), que es quien fecha las opiniones, los me gusta y los comentarios.
- `[assumption]` La entrada de cobertura se escribe con el árbol, no antes. U4 dejó la nota; un `coverageThreshold` sobre una ruta que no existe hace fallar `npm test` con un mensaje engañoso.
- **Open question para U6**: el salto entre el esqueleto de fila (96) y la fila real (56) se ve en el teléfono al abrir la pestaña. Si resultara molesto, la corrección es una forma nueva en C1 con su propio consumidor, no un número cambiado a ojo en la pantalla (BR23.1).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR5, NFR6, NFR7, NFR9, RC-01, RC-03).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Testing Posture, § Code Style).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0).
- `functional-spec` — `construction/u5-activity/functional-design/functional-spec.md` (§ Contratos que U5 posee, § Enmienda al contrato, § Assumptions).
- `frontend-components` — `construction/u5-activity/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `@melodify/activity`, § `app/src/screens/actividad/`, § `app/src/state/`, § `app/src/bootstrap/`).
- `security-requirements` — `construction/u5-activity/nfr-requirements/security-requirements.md` (NFR3.21–NFR3.23, NFR9.8).
- `performance-requirements` — `construction/u5-activity/nfr-requirements/performance-requirements.md` (NFR8.16–NFR8.18, NFR1.16–NFR1.18).
