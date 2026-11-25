# Tubería de `u5-activity`

> La diferencia con U4 se dice en una línea: **el YAML no cambia y diez archivos de configuración y de
> proyecto sí**, y uno de ellos —`eslint.config.js`— gana una regla que el repositorio no tenía. U5 es la primera
> unidad cuyo paquete **no puede pedir red, ni pintar nada, ni guardar nada**, y esa garantía no la
> sostiene una promesa en un documento: la sostiene un bloque de lint que pone el CI en rojo. Por eso
> este archivo, que es el artefacto de revisión de la etapa, va al detalle de qué regla se escribe, con
> qué forma, en qué orden y qué queda en rojo si falta.

## Lo que corre hoy

Nada de esto cambia en U5; se escribe tal como está en `.github/workflows/ci.yml` al empezar la unidad,
para que la revisión pueda comprobarlo. La última columna es lo que U5 le añade que juzgar.

| # | Paso | Job | Qué ejecuta | Qué lo hace fallar | Qué estrena U5 en este paso |
|---|---|---|---|---|---|
| 1 | Validar commits | `commit-lint` | `wagoid/commitlint-github-action@v6` sobre todos los commits (clona con `fetch-depth: 0`), con `configFile: .commitlintrc.json` | Un asunto que no es Conventional Commits | Nada: los asuntos de la unidad siguen la convención (`team.md`) |
| 2 | Detectar directorio | `code-quality` | Un `run` de shell con dos ramas que no se cumplen; resuelve `.` | Nada: siempre `.` | Nada: el lockfile sigue en la raíz |
| 3 | Instalar | `code-quality` | `actions/setup-node@v4` (Node 22, caché de `npm`) y `npm ci` desde el lockfile de la raíz | Que el lockfile no cuadre con `package.json` | **Un paquete de workspace más** y cuatro declaraciones de versión; **ninguna dependencia de terceros**, así que no hay descarga nueva |
| 4 | Tipos | `code-quality` | `npm run typecheck` (`tsc -b`, con las referencias de proyecto) | Un error de tipos en cualquier paquete o en la app | **Dos referencias nuevas** (raíz y app) y un paquete que solo usa `import type` de C3 y C4 |
| 5 | Lint | `code-quality` | `npm run lint` (`eslint .`) con `eslint.config.js` | Un aviso o error de ESLint, incluidas las prohibiciones de importación | **Un bloque nuevo** que prohíbe `@melodify/catalog`, `@melodify/spotify`, `react`, `react-native` y el global `fetch` dentro de `packages/activity/src/**` |
| 6 | Pruebas | `code-quality` | `npm test`; el script de la raíz es **`jest --coverage`** y `coverageThreshold` se evalúa | Una prueba roja o un árbol por debajo de su umbral | **Un árbol nuevo** (`packages/activity/src/**`) con su 80 % y un `moduleNameMapper`; la suite no sale a la red porque no hay red que salga |
| 7 | Título del PR | `code-quality`, solo en `pull_request` | `printf '%s\n' "$PR_TITLE" \| npx --no-install commitlint` | Un título que no es Conventional Commits | Nada |

**Disparadores**: `push` y `pull_request` sobre `main` y `develop`. **Permisos**: `contents: read` y
`pull-requests: read`. Ese mínimo sigue siendo deliberado: la tubería no comenta, no etiqueta y no
publica.

## Los diez archivos que cambian, y por qué

**Cinco son `package.json`, tres son `tsconfig` y dos son configuración de herramientas.** El recuento
se fija aquí y no vuelve a cambiar en el resto del documento.

| Archivo | Cambio | Qué se rompe si falta |
|---|---|---|
| `tsconfig.json` (raíz) | `{ "path": "./packages/activity" }` en `references` | `tsc -b` no construye el paquete: `typecheck` falla con «referenced project has not been built» en cuanto `app/` lo importe |
| `app/tsconfig.json` | `{ "path": "../packages/activity" }` en `references` | `tsc -b` mete los fuentes del paquete en el proyecto de `app`, cuyo `rootDir` es `./src`, y `npm run typecheck` falla (TS-39) |
| `packages/activity/tsconfig.json` | **Nuevo**: extiende `tsconfig.base.json`, `rootDir: "./src"`, **`outDir: "./dist"`, `tsBuildInfoFile: "./dist/.tsbuildinfo"`**, `include: ["src/**/*"]` y referencias a `../app-session` y `../content-store` | Sin `outDir` —que `tsconfig.base.json` no fija— `tsc -b` emite junto a los fuentes, `app/` no encuentra los tipos que el paquete declara en `dist` y `eslint .` empieza a revisar ficheros generados; sin las dos referencias, compila los fuentes de C3 y C4 dentro del proyecto |
| `jest.config.js` | Un `moduleNameMapper` y una entrada de `coverageThreshold` | Las pruebas no resuelven `@melodify/activity`; y el árbol nuevo no tiene suelo (NFR5.12) |
| `eslint.config.js` | Un bloque nuevo para `packages/activity/src/**` | El paquete nace sin su frontera: un `fetch` o un `react-native` entrarían sin que nada se queje (NFR3.21) |
| `packages/activity/package.json` | **Nuevo**: `version` 1.1.0, `private: true`, `main: "src/index.ts"`, `types: "dist/index.d.ts"` y las dos dependencias internas cuyos tipos nombra. **Sin `exports`** | Sin `private`, el paquete se publicaría por accidente; sin `types`, `tsc` no resuelve sus declaraciones; sin las dependencias, `npm ls` miente sobre sus tipos |
| `app/package.json` | Añade `"@melodify/activity": "1.1.0"` y sube `@melodify/design-system` a `1.5.0` | La app no resuelve C8, y sigue declarando un C1 que ya no es el que se publica |
| `packages/design-system/package.json` | `version` a **1.5.0** | C1 no cambia de versión y las adiciones de `ActivityRow`, `DayHeader` y `ActivityEventSummary` viajan sin número que las distinga |
| `packages/spotify/package.json` | Sube su dependencia de C1 a `1.5.0` | Su rango exacto deja de satisfacerse y el lockfile queda con dos versiones del mismo paquete interno (TS-42) |
| `packages/app-shell/package.json` | Sube su dependencia de C1 a `1.5.0` | **Es el mismo caso que `spotify`, y es el que rompe la instalación**: `app-shell` declara hoy `@melodify/design-system: 1.4.0`, así que npm intenta resolver C1 contra el registro —un paquete privado, `E404`— o el lockfile acaba con dos versiones de C1 |

Más el `package-lock.json`, que es la consecuencia de los cinco `package.json` y no una decisión.
**El `package.json` de la raíz no cambia**: `workspaces` ya incluye `packages/*`.

**Las dos fichas que el `revert` no puede separar**: el `tsconfig` y el `package.json` del paquete
nuevo se describen completos arriba porque el resto del documento no los repite. Quien implemente no
tiene que deducir sus campos, y quien revise puede comprobarlos campo por campo.

### `jest.config.js`

```js
// Ilustrativo, no implementación. jest.config.js — las dos líneas que añade U5.
moduleNameMapper: {
  "^@melodify/activity$": "<rootDir>/packages/activity/src",
},
coverageThreshold: {
  "./packages/activity/src/**": { lines: 80 },
},
```

- **El `$` del patrón solo evita que la entrada capture un subcamino que hoy no existe.** El paquete
  **no tiene mapa `exports`** —TS-39 lo decide así: una sola entrada, sin dos superficies que separar—,
  de modo que el `$` es una precaución, no una frontera: la frontera real es que no hay subcaminos
  publicables.
- **La entrada de cobertura se escribe ahora, no antes.** U4 dejó la nota explícita: un umbral sobre un
  árbol que no existe hace fallar la medición sin cubrir nada, con un mensaje engañoso.
- **`testMatch` y `collectCoverageFrom` no se tocan**: sus patrones (`packages/*/src/**`) ya cubren un
  paquete nuevo, y `app/index.ts` sigue excluido. Añadir una entrada por paquete sería duplicar el glob.

### `eslint.config.js`

La forma sigue la de los bloques de `catalog` y `spotify`, con **dos** diferencias que hay que
declarar: se usa la regla de TypeScript **y** una regla de globals en el mismo bloque, y las rutas
prohibidas incluyen dos paquetes de terceros (`react`, `react-native`) por primera vez en el repo.

| Regla | Ámbito | Qué declara | Por qué |
|---|---|---|---|
| `@typescript-eslint/no-restricted-imports` | `packages/activity/src/**` | `@melodify/catalog` y `@melodify/spotify` con `allowTypeImports: false`; `react` y `react-native` con `allowTypeImports: false` | El paquete es lógica pura: no pinta, no busca en Spotify y no tiene hooks. Ni siquiera como tipo (BR21.6, TS-39) |
| `no-restricted-globals` | `packages/activity/src/**` | El global `fetch`, con un mensaje que apunta a C4 | Es la puerta por la que se colaría una petición sin importar nada: `fetch` es global, no un módulo (NFR3.21) |

```js
// Ilustrativo, no implementación. eslint.config.js
{
  files: ["packages/activity/src/**"],
  rules: {
    "@typescript-eslint/no-restricted-imports": ["error", { paths: [
      { name: "@melodify/catalog", allowTypeImports: false, message: "C8 se deriva de C4 (BR21.6)." },
      { name: "@melodify/spotify", allowTypeImports: false, message: "C8 no toca Spotify (BR21.6)." },
      { name: "react", allowTypeImports: false, message: "Lógica pura; el render es de la app (TS-42)." },
      { name: "react-native", allowTypeImports: false, message: "Lógica pura; SectionList vive en la app (TS-42)." },
    ] }],
    "no-restricted-globals": ["error", { name: "fetch", message: "C8 lee de C4, en memoria (BR21.6)." }],
  },
}
```

**Por qué `react-native` también está prohibido, y no solo `react`.** La tentación concreta de esta
unidad es meter `SectionList` o `FlatList` en el paquete «porque está cerca de los datos». No lo está:
`SectionList` organiza filas en pantalla, y el paquete no tiene filas ni pantalla. Grupos y eventos
salen como datos, y el mapeo a secciones ocurre en `app/src/screens/actividad/activityModel.ts`
(LC-19). Si esta prohibición no existiera, la discusión volvería en cada revisión de PR.

**El orden de los bloques no rompe nada aquí, y conviene decirlo porque en U4 sí importaba.** El bloque
de `packages/activity/src/**` no se solapa con el de `packages/catalog/src/**` ni con el de
`packages/spotify/src/**`: cada uno nombra una carpeta distinta. Lo que sí hay que comprobar es que
este bloque **no** se declare antes del bloque global de `no-restricted-imports`, porque el global es
el que mantiene las prohibiciones de `expo-secure-store`, `expo-network` y `AsyncStorage` para todo el
repositorio, y este bloque no las repite: las hereda.

**Lo que estas reglas no cubren, y se dice para que nadie lo suponga**: `no-restricted-globals` detecta
`fetch(...)` como identificador suelto, no `globalThis.fetch` ni `window.fetch`. **El import por ruta
relativa a otro paquete sí está cubierto, y no por el linter**: `tsconfig.base.json` fija
`composite: true` y cada paquete declara `rootDir: "./src"` e `include: ["src/**/*"]`, así que un
`../../catalog/src/index` entra en el programa, queda fuera del `rootDir` y del listado del proyecto, y
`tsc -b` lo rechaza. La compuerta del paso 4 cierra lo que la del paso 5 no ve, y por eso el hueco real
es más pequeño que el que la intuición sugiere. Lo que sí queda solo en la revisión del PR es el
`globalThis.fetch` (§ «La revisión del PR, y por qué no se convierte en regla»).

## La compuerta que nace con el árbol nuevo: `packages/activity` y el 80 %

`collectCoverageFrom` incluye **todos** los `packages/*/src/**/*.{ts,tsx}`, así que el árbol nuevo entra
en la medición desde el primer día. A diferencia de U4, aquí no hay un `device.ts` que no se pueda
ejecutar en pruebas: el paquete es lógica pura y **todo** su código es alcanzable con dobles. La
compuerta es, por tanto, fácil de cumplir y fácil de romper por un detalle.

| Archivo del paquete | Cómo se cubre | Trampa |
|---|---|---|
| `src/index.ts` | La barra solo re-exporta; se cubre **al importar el paquete por su nombre** | Si cada prueba importa `../derive` por ruta relativa, la barra queda a **0 %** y el árbol no llega al 80 % por mucho que el resto esté cubierto |
| `src/activity.ts` | Fábrica, suscripción perezosa, alta y baja de observadores, identidad | La rama de «último observador se va» necesita una prueba con **dos** suscriptores |
| `src/derive.ts` | Una opinión, me gusta, comentarios, contadores a cero, `ok: false` en cada lectura | La rama `likeCount === 0` y la de un me gusta propio (`authorId === viewerId`) son las que se olvidan |
| `src/grouping.ts` | Agrupación por día natural del dispositivo, desempate por `eventId` ascendente, un solo grupo, `empty` | Un evento cerca de la medianoche local es justo el caso que hay que fijar con reloj y zona artificiales |

**La regla práctica que se deriva de la primera fila**: las pruebas del paquete importan
`@melodify/activity`, nunca una ruta relativa a `src/`. Es la misma razón por la que el
`moduleNameMapper` lleva `$`: lo que se prueba es lo que se publica.

```js
// Ilustrativo, no implementación. Una prueba del paquete.
import { createActivity } from "@melodify/activity";   // sí: cubre la barra y la ruta real
// import { createActivity } from "../../src/activity"; // no: deja src/index.ts a 0 %
```

| Opción | ¿Se toma? | Consecuencia |
|---|---|---|
| Importar el paquete por su nombre en las pruebas | **Sí** | La barra se cubre y se prueba la misma ruta de resolución que usa la app (NFR5.12) |
| Excluir `src/index.ts` de `collectCoverageFrom` | **No** | Bajaría el suelo justo en el archivo que declara la superficie pública; `team.md` § Testing Posture prohíbe bajar el umbral para hacer pasar una etapa |
| Un `/* istanbul ignore */` en la fábrica | **No** | Esconde la rama que más importa —la de la suscripción perezosa— y no hay motivo: se prueba con un doble de C4 |

**Lo que esto no arregla**: el 80 % mide líneas ejecutadas, no comportamiento correcto. Que la lista no
se congele al desplazarse, que la posición se conserve al volver del detalle y que el esqueleto no dé un
salto molesto son cosas que el CI no puede ver, y `team.md` § Testing Posture ya declara que eso es
recorrido manual.

## Instalar: qué significa mover el lockfile por segunda vez

`npm ci` ya no es una novedad —U4 movió el lockfile por primera vez—, pero esta vez el movimiento es de
otra clase: **no entra nada de fuera**.

| Comprobación | Resultado esperado | Si falla |
|---|---|---|
| El lockfile cuadra con los diez archivos tocados | `npm ci` instala sin avisar | El job 3 se pone rojo antes de compilar: «lock file does not satisfy» |
| **No hay dependencias de terceros nuevas** | Ni una línea nueva de `node_modules` ajena al workspace | Un `E404` aquí significaría que alguien añadió un paquete que esta etapa no declaró: se revierte, no se documenta |
| El paquete de workspace resuelve a la carpeta local | `"@melodify/activity": "1.1.0"` casa con la `version` del paquete | npm intentaría bajarlo del registro y no lo encontraría |
| Las dos dependencias internas son `import type` | Se declaran para que `npm ls` diga la verdad y para que `tsc` resuelva los tipos | Si alguien las convirtiera en import de valor, habría una arista de ejecución que C8 no debe tener |
| Versiones exactas | `save-exact=true` sigue vigente; las cuatro versiones internas se escriben sin `^` (TS-01) | Un rango flotante rompería la reproducibilidad entre instalaciones |

**Nada de esto añade un paso al YAML.** Instalar un paquete más del workspace es el mismo `npm ci`; lo
que cambia es cuánto del lockfile se reescribe.

## Pruebas en la tubería: qué demuestra el CI y qué no

| Lo que el CI puede afirmar | Dónde | Lo que **no** puede afirmar |
|---|---|---|
| La lista blanca de C4 es exactamente `listOpinions`, `listLikes`, `listComments` y `subscribeContent` | Doble de C4 que registra cada llamada | Que un camino futuro no añada una quinta (lo cierra la revisión) |
| Cero lecturas y cero suscripciones antes de la primera observación, y **cuatro** lecturas con la siembra | Doble de C4 con contador | Que el teléfono tarde lo que dice el presupuesto |
| `op-008` no se lee porque su contador de me gusta es cero | Doble que anota los `opinionId` leídos | Que la siembra siga teniendo ocho eventos (es de C4, no de U5) |
| No se programa ningún temporizador | Reloj falso: la cola de temporizadores queda vacía | Que el esqueleto no se vea un instante y desaparezca |
| `loading` pinta dos encabezados y seis filas | Render de `ActividadView` que cuenta nodos | Que esa forma sea la que cabe en la pantalla del teléfono |
| Los cuatro estados dicen su texto exacto y ofrecen su acción | Render por estado | Que la persona entienda el mensaje |
| Ningún handle de la siembra ni texto de comentario aparece en el árbol | Render sobre la siembra | Que mañana un cambio de C1 no meta un `actorHandle` en un texto |
| Un título con `<b>` y `&` se pinta literal | Render de `ActivityRow` | Que ningún otro componente interprete marcado |
| Cada una de las cuatro operaciones fallando produce `error` y **ninguna** fila de la derivación anterior | Cuatro dobles que fallan | Que el reintento funcione contra un almacén real |
| `error` registra `ACTIVITY_LOAD_FAILED` una vez por intento y `ready`/`empty` no registran nada | Logger doble en `useActividad` | Que el registro llegue a algún sitio: no hay agregación |
| El paquete no importa catálogo, Spotify, `react`, `react-native` ni usa `fetch` | Paso 5, con el bloque nuevo | Que no lo haga por ruta relativa o por `globalThis.fetch` (lo cierra la revisión) |
| Publicar una opinión añade una fila al principio y conserva los `eventId` de las anteriores | Prueba de `ActivityFeed` sobre un almacén real | Que React no remonte la lista y conserve la posición al desplazarse |
| Una sola instancia de `activity` en composición | Prueba de `bootstrap/instances.ts` | Que dos pantallas no construyan otra por su cuenta (lo cierra la revisión) |

**La frontera de solo lectura no la prueba el CI por sí sola**, y se dice aquí porque es la tentación de
esta unidad: la regla de lint impide importar el catálogo o Spotify, pero no impide llamar a un método
de escritura de C4, porque C4 está tipado y `toggleLike` existe. Lo que la sostiene es la **prueba de
la lista blanca**, que enumera las llamadas hechas. Las dos son compuertas del paso 5 y del paso 6, no
una promesa.

## La revisión del PR, y por qué no se convierte en regla

Todo lo que el CI no puede afirmar acaba, en algún proyecto, en una promesa vaga («se revisa en el PR»).
Aquí se escribe qué se revisa, para que la afirmación sea comprobable por quien revisa y para que nadie
cuente con un linter que no existe.

| Comprobación | Cómo se hace | Por qué no es una regla |
|---|---|---|
| Ni `packages/activity` ni `ActivityRow`/`DayHeader` importan `Linking`, `WebView` ni un módulo de portapapeles | Grep de los imports en el PR | El linter de imports ya prohíbe cuatro nombres; añadir tres más por una pantalla que no los necesita convertiría el bloque en una lista que nadie lee (NFR3.22) |
| Nadie llama a `globalThis.fetch` ni a `window.fetch` | Grep en el PR | `no-restricted-globals` solo ve el identificador suelto; una regla para las tres formas existe, pero no se justifica por un paquete que no tiene cliente HTTP (NFR3.21) |
| Una sola instancia de `activity` en composición | Lectura de `app/src/bootstrap/instances.ts` | Una prueba afirma la que existe; que nadie construya otra en una pantalla es una decisión de composición, no de código (BR24.3) |
| El paquete no ganó un mapa `exports` ni un segundo subcamino | Lectura de `packages/activity/package.json` | TS-39 lo decide en el diseño; una regla de lint no puede comprobar la ausencia de una clave |

**Que una comprobación viva en la revisión no la hace opcional.** La plantilla del PR (`.github/pull_request_template.md`) tiene su checklist de calidad, y estas cuatro filas son lo que hay que marcar ahí;
lo que no se hace es inventar una regla para cada una y llamar «verde» a un lint que no las mira.

## Promoción entre ramas

| Rama | Qué es | Quién escribe en ella | Cómo se entra |
|---|---|---|---|
| `feat/<tema>` o `fix/<tema>` | Trabajo manual fuera de AI-DLC | Cualquiera, desde `develop` | PR con la plantilla del repositorio |
| Rama de Bolt (`bolt/<slug>`) | Un Bolt de Construction | AI-DLC, desde `develop` | Squash a `develop` cuando la unidad está terminada |
| `develop` | Integración: lo último construido y validado | Los PR de arriba | Es la base de todo lo demás |
| `main` | Entregas: lo que efectivamente se entregó | Nadie directamente | Squash desde `develop`, no un merge de trabajo en curso |

**No hay promoción de entornos** porque no hay entornos: la promoción aquí es de ramas, y una entrega a
`main` es un squash de `develop`. Los dos jobs corren en las dos ramas, así que `main` no puede recibir
algo que `develop` no haya visto en verde.

## Estrategia de despliegue

**Ninguna.** No hay azul/verde, ni canario, ni anillo, ni banderas de funcionalidad: no hay artefacto
desplegado sobre el que mover tráfico. La entrega de U5 se demuestra **en el teléfono** con Metro
levantado: abrir Actividad con Spotify conectado y sin él, comprobar los eventos de la siembra
agrupados por día, tocar una fila y volver con la posición conservada, publicar una opinión desde Crear
y ver la fila nueva arriba **sin que se remonte la lista**, y comprobar el estado vacío con el almacén
limpio (Q3 de U3, `team.md` § Deployment).

**Las dos consecuencias propias de U5**: la primera es que el esqueleto de carga solo se ve de verdad
en el teléfono, porque en las pruebas llega una emisión síncrona y el estado `loading` dura lo que dura
un `act()`; la segunda es que la conservación de la posición al volver del detalle depende de que la
pestaña no se desmonte, y eso es un comportamiento de la cáscara que ninguna prueba puede afirmar en
términos de sensación. El CI prueba que la lista se compone bien con dobles; que se sienta bien lo
demuestra la persona.

## Vuelta atrás

| Situación | Qué se hace | Qué **no** hay que deshacer |
|---|---|---|
| Un Bolt de U5 rompe `develop` | `git revert` del squash del Bolt en `develop` y recargar Metro | No hay artefacto desplegado, ni migración de datos, ni caché remota: el contenido vive en memoria |
| El cambio ya viajó en una entrega a `main` | El mismo `git revert` en `main`, además del de `develop` | Tampoco hay versión publicada que retirar |
| Una regla de lint resulta demasiado estricta | Se corrige la regla en el mismo PR, con la razón escrita | No se revierte la unidad: la regla es configuración, no comportamiento |
| El umbral del árbol nuevo no se alcanza | Se escriben las pruebas que faltan | **No** se baja el umbral ni se excluye un archivo (`team.md` § Testing Posture) |
| El `revert` deja `typecheck` en rojo | Se revierte el commit completo, no una parte | El squash incluye el paquete, los tres `tsconfig`, `jest.config.js`, `eslint.config.js` y los cinco `package.json` —los diez archivos—: partirlo dejaría el árbol incoherente |

**El matiz que U5 añade al rollback de U4**: aquí no hay dependencias de terceros que desinstalar, así que
el revert es más limpio que en U4 —el lockfile solo pierde el paquete nuevo y las versiones internas que
vuelven atrás—, pero **la atomicidad importa igual**: si el paquete se revierte y la referencia de
`app/tsconfig.json` se queda, `tsc -b` falla; si se revierte el bloque de `eslint.config.js` y el paquete
se queda, la frontera desaparece sin que nadie lo note; y si se revierte el paquete y `app-shell` se
queda declarando C1 1.5.0, `npm ci` no encuentra esa versión. El squash del Bolt garantiza que viajen
juntos.

## Secretos en CI

| Secreto | ¿Se configura? | Dónde aparece | Por qué |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | **No** | `.env.example` (documentado, sin valor) y el entorno local del teléfono | Es un identificador **público** de un cliente PKCE; U5 no lo usa y no lo toca (NFR3.17 de U4) |
| `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` | **No** | `.env.example` (documentado, sin valor) | También es público; U5 no lo usa (BR16.2) |
| Client secret de Spotify | **No existe** | — | PKCE no lo necesita; `project.md` § Forbidden lo prohíbe en términos absolutos |
| Token de Spotify o `refreshToken` | **No** | — | Vive solo en el llavero del teléfono. U5 no lo nombra: `SessionView` no lo lleva y el paquete no importa C3 en ejecución (NFR3.18) |
| Contenido de una opinión o un handle | **No es un secreto, y tampoco viaja** | — | Las pruebas usan la siembra ficticia de C4; no hay datos de personas reales (RC-02). Ninguna captura del PR debe mostrar un handle, porque la pantalla no lo pinta (NFR3.22) |
| `.env` | **Nunca** | — | `.gitignore` de U1 y `project.md` § Forbidden; U5 no toca `.env.example` |

Los permisos del flujo siguen siendo `contents: read` y `pull-requests: read`: aunque alguien añadiera
un paso que quisiera escribir, no podría sin cambiar el YAML a la vista de todos (NFR3.10). **U5 no
añade ni un secreto, ni una variable de entorno, y no necesita ninguno para pasar en verde**, que es la
prueba de que la tubería sigue siendo de validación y no de despliegue.

## Assumptions & Open Questions

- `[assumption]` La suite sigue corriendo en minutos con el árbol nuevo: las pruebas del paquete son
  dobles puros (sin red, sin llavero, sin temporizadores reales) y las de pantalla montan el árbol con
  el preset de Expo que ya se usa en U2–U4.
- `[assumption]` `eslint-config-expo` no marca como error el uso de `SectionList` en `app/src`: es un
  componente del núcleo de React Native, no un módulo nativo (NFR7.8).
- `[assumption]` El bloque de `no-restricted-globals` no produce un falso positivo en las pruebas del
  paquete: no hay ninguna referencia a `fetch` en `packages/activity/src/**`, ni en el código ni en los
  dobles.
- **Pregunta abierta heredada del diseño de NFR (R-07 de U4)**: la ventana neutra del arranque no tiene
  sitio todavía en la superficie de C2 y C7. No afecta a la tubería —ningún paso la mira—, pero sí a lo
  que se captura para el PR: durante esa ventana no hay chip, ni tarjeta, ni buscador que fotografiar.
- `[assumption]` La agrupación usa el día natural del teléfono en hora local, no el día que calcula
  `formatCalendarDate` de C1: C8 no importa C1 (TS-42) y el cambio no arrastra dos paquetes. Las pruebas
  fijan reloj y zona con un instante artificial cerca de la medianoche local.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe y `Ratetify/package.json` es de otro proyecto—, así
  que resuelve siempre `.`. Simplificarlo es un cambio de una línea, pero es ajeno a esta unidad.

## Sources

- `.github/workflows/ci.yml` — los siete pasos tal como están al empezar la unidad (U2 los dejó así).
- `jest.config.js` — los ocho umbrales a 80, los nueve `moduleNameMapper` y los globs de
  `testMatch`/`collectCoverageFrom` que ya cubren un paquete nuevo.
- `eslint.config.js` — las prohibiciones existentes, los bloques de `catalog` y `spotify` y la forma que
  U5 replica para `packages/activity/src/**`.
- `tsconfig.json` y `app/tsconfig.json` — las referencias de proyecto que `tsc -b` sigue.
- `nfr-requirements/tech-stack-decisions.md` § TS-39 a TS-43 — la lista cerrada de archivos a tocar, las
  versiones exactas, las dos reglas de linter y las tres declaraciones de versión.
- `logical-components.md` § Superficie, cobertura y compatibilidad — NFR5.12, NFR6.10 y NFR7.8.
- `security-design.md` § NFR3.21–3.23 — la lista blanca de lecturas, las cuatro compuertas y la
  contención del fallo.
- `performance-design.md` § NFR8.16–8.18 — por qué la unidad no necesita un paso de build, un servicio
  que medir ni un temporizador.
- `infrastructure-specification.md` — qué archivo de plataforma cambia y cuál no.
- `team.md` § Way of Working, § Testing Posture y § Deployment — ramas, PR, CI obligatorio, umbral por
  árbol y «desplegar» = abrir la app en el teléfono.
