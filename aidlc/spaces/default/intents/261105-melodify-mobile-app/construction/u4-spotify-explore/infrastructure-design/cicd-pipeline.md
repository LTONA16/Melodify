# Tubería de `u4-spotify-explore`

> La diferencia con U3 se dice en una línea: **el YAML no cambia y cinco archivos de configuración sí.**
> U4 es la primera unidad desde U2 que mueve el `package-lock.json`, la primera que añade un árbol al
> monorepo y la primera cuyas pruebas tienen que demostrar una frontera —el token— que un doble global
> taparía. Nada de eso es un paso nuevo de la tubería; todo eso es **lo que los siete pasos existentes
> tienen que juzgar**. Este documento es el artefacto de revisión de la etapa, así que va al detalle:
> qué archivo se toca, con qué forma y qué queda en rojo si falta.

## Lo que corre hoy

Nada de esto cambia en U4; se escribe tal como está en `.github/workflows/ci.yml` al empezar la unidad,
para que la revisión pueda comprobarlo. La última columna es lo que U4 le añade que juzgar.

| # | Paso | Job | Qué ejecuta | Qué lo hace fallar | Qué estrena U4 en este paso |
|---|---|---|---|---|---|
| 1 | Validar commits | `commit-lint` | `wagoid/commitlint-github-action@v6` sobre todos los commits (clona con `fetch-depth: 0`), con `configFile: .commitlintrc.json` | Un asunto que no es Conventional Commits | Nada: los asuntos de la unidad siguen la convención (`team.md`) |
| 2 | Detectar directorio | `code-quality` | Un `run` de shell con dos ramas que no se cumplen; resuelve `.` | Nada: siempre `.` | Nada: el lockfile sigue en la raíz |
| 3 | Instalar | `code-quality` | `actions/setup-node@v4` (Node 22, caché de `npm`) y `npm ci` desde el lockfile de la raíz | Que el lockfile no cuadre con `package.json` | **Tres dependencias nuevas** y un paquete de workspace más: el primer movimiento del lockfile desde U2 |
| 4 | Tipos | `code-quality` | `npm run typecheck` (`tsc -b`, con las referencias de proyecto) | Un error de tipos en cualquier paquete o en la app | **Dos referencias nuevas** (raíz y app) y un paquete con tres entradas y un `import type` a C1 |
| 5 | Lint | `code-quality` | `npm run lint` (`eslint .`) con `eslint.config.js` | Un aviso o error de ESLint, incluidas las prohibiciones de importación | **Tres módulos de dispositivo restringidos a un solo archivo** y la prohibición ya existente entre `catalog` y `spotify` |
| 6 | Pruebas | `code-quality` | `npm test`; el script de la raíz es **`jest --coverage`** y `coverageThreshold` se evalúa | Una prueba roja o un árbol por debajo de su umbral | **Un árbol nuevo** (`packages/spotify/src/**`) con su 80 %, tres `moduleNameMapper` y una suite que no sale a la red |
| 7 | Título del PR | `code-quality`, solo en `pull_request` | `printf '%s\n' "$PR_TITLE" \| npx --no-install commitlint` | Un título que no es Conventional Commits | Nada |

**Disparadores**: `push` y `pull_request` sobre `main` y `develop`. **Permisos**: `contents: read` y
`pull-requests: read`. Ese mínimo sigue siendo deliberado: la tubería no comenta, no etiqueta y no
publica.

## Los cinco archivos que cambian, y por qué

| Archivo | Cambio | Qué se rompe si falta |
|---|---|---|
| `tsconfig.json` (raíz) | `{ "path": "./packages/spotify" }` en `references` | `tsc -b` no construye el paquete: `typecheck` falla con «referenced project has not been built» en cuanto `app/` lo importe |
| `app/tsconfig.json` | `{ "path": "../packages/spotify" }` en `references` | `tsc -b` mete los fuentes del paquete en el proyecto de `app`, cuyo `rootDir` es `./src`, y `npm run typecheck` falla (TS-31) |
| `packages/spotify/tsconfig.json` | **Nuevo**: extiende `tsconfig.base.json`, `rootDir: "./src"`, `include: ["src/**/*"]` y referencia a `../design-system` | El paquete no se puede construir y el `import type` de C1 no resuelve |
| `jest.config.js` | Tres `moduleNameMapper` y una entrada de `coverageThreshold` | Las pruebas no resuelven `@melodify/spotify`, `…/auth` ni `…/catalog`; y el árbol nuevo no tiene suelo (NFR5.10) |
| `eslint.config.js` | Un archivo autorizado más para los módulos de dispositivo y dos prohibiciones nuevas | El primer archivo de `auth` pone `npm run lint` en rojo, y la frontera del token deja de ser una regla (NFR3.18) |

Más los `package.json`: `app/package.json` sube C1 a 1.4.0, C2 a 1.4.0 y C5 a 1.2.0 y añade
`"@melodify/spotify": "1.0.0"`; `packages/app-shell/package.json` sube su dependencia de C1 y su
propia `version` a 1.4.0; y `version` de `packages/design-system` y `packages/catalog` pasa a 1.4.0 y
1.2.0. Sin esas cuatro declaraciones, las versiones que la unidad publica no las consume nadie y el
lockfile queda desalineado. **El `package.json` de la raíz no cambia**: `workspaces` ya incluye
`packages/*`.

### `jest.config.js`

```js
// Ilustrativo, no implementación. jest.config.js — el orden y el `$` importan.
moduleNameMapper: {
  "^@melodify/spotify$": "<rootDir>/packages/spotify/src",
  "^@melodify/spotify/auth$": "<rootDir>/packages/spotify/src/auth",
  "^@melodify/spotify/catalog$": "<rootDir>/packages/spotify/src/catalog",
},
coverageThreshold: {
  "./packages/spotify/src/**": { lines: 80 },
},
```

- **El `$` de cada patrón evita que la entrada desnuda capture los subcaminos.** Sin él,
  `@melodify/spotify/auth` resolvería al índice del paquete y la frontera que el mapa `exports` impone
  en Metro desaparecería en las pruebas: la suite probaría un import que en el teléfono no compila.
- **`testMatch` y `collectCoverageFrom` no se tocan**: sus patrones (`packages/*/src/**`) ya cubren un
  paquete nuevo, y `app/index.ts` sigue excluido. Añadir una entrada por paquete sería duplicar el
  mismo glob.
- **`"./packages/activity/src/**"` sigue sin entrada**: un umbral sobre un árbol que no existe hace
  fallar la medición sin cubrir nada, y ese árbol llega con U5.

### `eslint.config.js`

La forma sigue la que ya existe para `app-session`, con una diferencia que hay que declarar: son **dos
bloques** para el mismo archivo, porque son dos reglas distintas las que hay que abrir.

| Regla | Ámbito | Qué hace falta | Por qué |
|---|---|---|---|
| `no-restricted-imports` (base) | Todo el repositorio | Un bloque `files: [SECURE_STORE_SPOTIFY_ADAPTER]` que declare las otras dos restricciones (`expo-network` y `AsyncStorage`) y **deje fuera** `expo-secure-store` | La restricción global de `expo-secure-store` es la que hoy solo exime a `secure-store-adapter.ts`; sin este bloque, `auth/device.ts` no compila ni pasa el lint |
| `@typescript-eslint/no-restricted-imports` | `packages/spotify/src/**` | Añadir `expo-web-browser` y `expo-crypto` a las rutas prohibidas del bloque existente (**el que ya prohíbe `@melodify/catalog`**), y un bloque para `SECURE_STORE_SPOTIFY_ADAPTER` que conserve la prohibición de `@melodify/catalog` y no nombre los tres módulos | Es lo que convierte «el token solo lo toca un archivo» en una compuerta: los tres módulos de dispositivo tienen un único punto de entrada (TS-31, NFR3.18) |

```js
// Ilustrativo, no implementación. eslint.config.js
const SECURE_STORE_SPOTIFY_ADAPTER = "packages/spotify/src/auth/device.ts";
// 1) bloque base gemelo del de app-session: deja entrar expo-secure-store
{ files: [SECURE_STORE_SPOTIFY_ADAPTER],
  rules: { "no-restricted-imports": ["error", {
    paths: [EXPO_NETWORK_RESTRICTION, ASYNC_STORAGE_RESTRICTION],
    patterns: [PACKAGE_TO_APP_RESTRICTION] }] } },
// 2) bloque de la regla de TypeScript, declarado DESPUÉS del de packages/spotify/src/**
{ files: [SECURE_STORE_SPOTIFY_ADAPTER],
  rules: { "@typescript-eslint/no-restricted-imports": ["error", { paths: [
    { name: "@melodify/catalog", allowTypeImports: true,
      message: "Spotify no importa el catálogo, ni sus tipos (NFR3.11)." }] }] } },
```

**El orden de los bloques no es cosmético**: ESLint aplica los bloques en orden y el último que nombra
una regla la reemplaza entera. Si el bloque de `device.ts` se declarara **antes** del de
`packages/spotify/src/**`, la prohibición de los tres módulos volvería a aplicarse sobre el único
archivo que debe poder importarlos y el árbol nacería en rojo. Una compuerta que nace en rojo se acaba
desactivando.

**Lo que esta regla no cubre, y se dice para que nadie lo suponga**: no impide un import por ruta
relativa (`../auth/device`), que el type-check tampoco vería porque compila. Lo cierran la revisión del
PR, la prueba de «ningún archivo de `catalog/` importa `device.ts`» y el propio mapa `exports`.

## La compuerta que nace con el árbol nuevo: `device.ts` y el 80 %

Esta es la consecuencia de U4 que ningún documento anterior podía ver, y es la razón por la que este
archivo no es una página en blanco.

`collectCoverageFrom` incluye **todos** los `packages/*/src/**/*.{ts,tsx}`, así que
`packages/spotify/src/auth/device.ts` entra en la medición del árbol nuevo desde el primer día. Ese
archivo es, por diseño, el único que importa los tres módulos de dispositivo y •el que nunca se ejecuta
en las pruebas*: los adaptadores se inyectan (TS-35) y la prueba del flujo completo no lo toca. Un
archivo que nadie importa cuenta como **0 % de líneas**, y el árbol no llega al 80 % por mucho que el
resto esté cubierto.

| Opción | ¿Se toma? | Consecuencia |
|---|---|---|
| Añadir una prueba de `device.ts` con `jest.mock` de los tres módulos **en ese archivo** | **Sí** | El archivo se cubre afirmando que cada adaptador delega en su módulo con los argumentos correctos; no necesita dispositivo, ni red, ni credencial (NFR5.11) |
| Excluir `device.ts` de `collectCoverageFrom` | **No** | Bajaría el suelo del árbol justo en el archivo que maneja la credencial; `team.md` § Testing Posture prohíbe bajar el umbral para hacer pasar una etapa |
| Un mock global de los tres módulos en `jest.setup.js` | **No** | Taparía un import indebido en cualquier prueba futura, que es exactamente lo que TS-37 prohíbe |

La prueba nueva vive en `packages/spotify/src/auth/__tests__/device.test.ts`, que ya está excluida de
`collectCoverageFrom` por el patrón `**/__tests__/**`. **Los `jest.mock` son factories locales**, no un
doble global: si mañana alguien importara el módulo real desde otro sitio, la llamada se delata.

**Lo que esto no arregla**: el archivo sigue sin probarse «de verdad» contra el llavero ni contra el
navegador. La garantía de que la app abre la autorización y vuelve es el recorrido en el teléfono, y
`team.md` § Testing Posture ya declara que eso no se prueba automáticamente.

## Instalar: qué significa mover el lockfile

`npm ci` es el paso que más cambia de significado en esta unidad, porque hasta U3 el árbol no se movía
desde U2.

| Comprobación | Resultado esperado | Si falla |
|---|---|---|
| El lockfile cuadra con los cinco `package.json` | `npm ci` instala sin avisar | El job 3 se pone rojo antes de compilar: «lock file does not satisfy» |
| Las tres dependencias son públicas | Se resuelven desde el registro de npm, sin `.npmrc`, sin token y sin registro privado | El job 3 falla con un `E401` o `E404` y la unidad no puede continuar |
| Ninguna pide `prebuild` ni módulo nativo propio | Las tres son del SDK 57 y viajan en Expo Go; no hay paso de build | Si algo pidiera `prebuild`, Metro lo diría al arrancar y esta etapa se reabre (NFR7.7) |
| La versión queda exacta | `npx expo install` resuelve la del SDK 57 y `save-exact=true` la escribe sin `^` (TS-01) | Un rango flotante cambiaría el lockfile en cada instalación y rompería la reproducibilidad |
| El paquete de workspace resuelve a la carpeta local | `"@melodify/spotify": "1.0.0"` casa con la `version` del paquete | npm intentaría bajarlo del registro y no lo encontraría |

**Nada de esto añade un paso al YAML.** Instalar tres paquetes más es el mismo `npm ci`; lo que cambia
es cuánto tarda y qué tiene que cuadrar.

## Pruebas en la tubería: qué demuestra el CI y qué no

| Lo que el CI puede afirmar | Dónde | Lo que **no** puede afirmar |
|---|---|---|
| PKCE correcto: `toBase64Url` y el desafío contra el vector de RFC 7636 | `packages/spotify/src/auth/` | Que Spotify acepte el `redirect_uri` registrado |
| Un `state` distinto **no** canjea el código (cero llamadas a `/api/token`) | Prueba del flujo con navegador doble | Que el navegador del sistema vuelva a la app en el teléfono |
| El intercambio no lleva `Authorization` ni `client_secret` | Prueba del cuerpo de la petición | Que la cuenta autorice el alcance (va vacío) |
| Un registro con los cuatro campos tras conectar y borrado tras desconectar | Almacén doble (TS-33) | Que el llavero del teléfono persista entre reinicios |
| Renovación a los 60 s, una sola a la vez, y ninguna apertura del navegador | Reloj falso y dos llamadas concurrentes | Que el reloj del dispositivo no se desvíe |
| URL exacta, elemento sin `id` descartado, `workId` inválido rechazado, `500` → `failure` | `fetch` doble | Que la API responda con la forma que el contrato describe |
| Los catorce códigos se emiten en su situación y ningún mensaje lleva el token ni la consulta | `SpotifyLogPort` doble (TS-38) | Que el `warn` del redirect se lea en un release |
| Una sola instancia de `auth` y de los puertos | Prueba de `bootstrap/ports.ts` | Que dos pantallas no construyan otra por su cuenta (lo cierra la revisión) |

**La frontera del token no la prueba el CI por sí sola**, y se dice aquí porque es la tentación de esta
unidad: `jest.setup.js` declara un doble de `expo-secure-store` desde U1 y ese doble taparía un import
indebido. Lo que la sostiene es la regla de lint, el mapa `exports` y la prueba de imports de
`catalog/`. Las tres son compuertas del paso 5 y del paso 6, no una promesa.

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
desplegado sobre el que mover tráfico. La entrega de U4 se demuestra **en el teléfono** con Metro
levantado: conectar con Spotify, buscar una canción y un álbum y un artista, abrir el detalle, publicar
una opinión con la obra puesta, desconectar y comprobar que la app sigue recorrible sin sesión, y
reconectar (Q3 de U3, `team.md` § Deployment).

**Las dos consecuencias propias de U4**: la autorización ocurre en el navegador del sistema, donde
ninguna prueba puede mirar, y la persistencia del token entre reinicios solo se comprueba cerrando la
app del todo en el teléfono. El CI prueba que el flujo es correcto con dobles; que Spotify responda y
que el llavero sobreviva lo demuestra la persona.

## Vuelta atrás

| Situación | Qué se hace | Qué **no** hay que deshacer |
|---|---|---|
| Un Bolt de U4 rompe `develop` | `git revert` del squash del Bolt en `develop` y recargar Metro | No hay artefacto desplegado, ni migración de datos, ni caché remota: el contenido vive en memoria y el token se queda en el llavero hasta que se desconecta |
| El cambio ya viajó en una entrega a `main` | El mismo `git revert` en `main`, además del de `develop` | Tampoco hay versión publicada que retirar |
| Una regla de lint resulta demasiado estricta | Se corrige la regla en el mismo PR, con la razón escrita | No se revierte la unidad: la regla es configuración, no comportamiento |
| El CI se cae por una dependencia nueva | Se revierte el commit; el squash incluye lockfile, `package.json`, referencias, `jest.config.js` y `eslint.config.js`, así que el revert deja el árbol coherente | No hay estado del runner que limpiar: cada ejecución parte de un clon limpio |

**El matiz que U4 añade al rollback de U3**: aquí el revert **sí toca el lockfile y las referencias de
proyecto**, y por eso es importante que los cinco archivos de configuración viajen en **el mismo
commit** que el paquete. Si se partieran en dos, revertir uno solo dejaría `tsc -b` o `npm ci` en rojo.
El squash del Bolt garantiza esa atomicidad; el PR no debería separarlos.

## Secretos en CI

| Secreto | ¿Se configura? | Dónde aparece | Por qué |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | **No** | `.env.example` (documentado, sin valor) y el entorno local del teléfono | Es un identificador **público** de un cliente PKCE; sin él, `typecheck`, `lint` y las pruebas pasan, porque todas usan dobles. Un valor en Actions sería una copia más que rotar (NFR3.17) |
| `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` | **No** | `.env.example` (documentado, sin valor) | También es público: es la URL a la que el navegador vuelve. Sin él, `auth` usa `makeRedirectUri({ path: 'spotify-callback' })` (BR16.2) |
| Client secret de Spotify | **No existe** | — | PKCE no lo necesita; `project.md` § Forbidden lo prohíbe en términos absolutos |
| Token de Spotify o `refreshToken` | **No** | — | Vive solo en el llavero del teléfono y en memoria durante el intercambio. Nunca viaja al CI, ni a un log, ni a una captura (NFR3.19) |
| `.env` | **Nunca** | — | `.gitignore` de U1 y `project.md` § Forbidden; U4 solo toca `.env.example` |

Los permisos del flujo siguen siendo `contents: read` y `pull-requests: read`: aunque alguien añadiera
un paso que quisiera escribir, no podría sin cambiar el YAML a la vista de todos (NFR3.10). **U4 no
añade ni un secreto y no necesita ninguno para pasar en verde**, que es la prueba de que la tubería
sigue siendo de validación y no de despliegue.

## Assumptions & Open Questions

- `[assumption]` La suite sigue corriendo en minutos con el árbol nuevo: las pruebas del paquete son
  dobles puros (sin red, sin llavero, sin navegador, sin criptografía real) y los temporizadores —400 ms,
  10 s, 60 s— se simulan con reloj falso.
- `[assumption]` Expo SDK 57 resuelve el mapa `exports` en Metro sin `metro.config.js`. Si no lo
  hiciera, se añade el archivo con `unstable_enablePackageExports` **en el mismo PR**; el YAML no
  cambiaría y este documento seguiría siendo cierto salvo en esa fila.
- **Pregunta abierta heredada del diseño de NFR (R-07)**: la ventana neutra del arranque no tiene sitio
  todavía en la superficie de C2 y C7. No afecta a la tubería —ningún paso la mira—, pero sí a lo que
  se captura para el PR: durante esa ventana no hay chip, ni tarjeta, ni buscador que fotografiar.
- **Pregunta abierta heredada del diseño de NFR (R-06 y R-08)**: la regla de borrado del token debe
  quedar igual en los tres sitios donde se declara, y el cliente HTTP compartido entre `auth` y
  `catalog` debe tener una sola ubicación. Esta etapa afirma una sola puerta HTTP y **no** decide la
  ruta, porque una ruta no cambia ninguna compuerta del CI.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe y `Ratetify/package.json` es de otro proyecto—, así
  que resuelve siempre `.`. Simplificarlo es un cambio de una línea, pero es ajeno a esta unidad y U4
  no lo mezcla con su PR.

## Sources

- `.github/workflows/ci.yml` — los siete pasos tal como están al empezar la unidad (U2 los dejó así).
- `jest.config.js` — los siete umbrales a 80, los seis `moduleNameMapper` y los globs de
  `testMatch`/`collectCoverageFrom` que ya cubren un paquete nuevo.
- `eslint.config.js` — las prohibiciones existentes, la excepción de `secure-store-adapter.ts` y la
  forma del bloque que U4 replica para `auth/device.ts`.
- `tsconfig.json` y `app/tsconfig.json` — las referencias de proyecto que `tsc -b` sigue.
- `nfr-requirements/tech-stack-decisions.md` § TS-31 a TS-38 — la lista cerrada de archivos a tocar,
  las versiones exactas, los adaptadores y el `SpotifyLogPort`.
- `logical-components.md` § Superficie, cobertura y compatibilidad — NFR5.10, NFR5.11, NFR6.9 y NFR7.7.
- `security-design.md` § NFR3.10 / NFR3.17 / NFR3.18 / NFR3.19 — sin secretos nuevos, PKCE sin
  secreto, la frontera del token y qué no puede aparecer en un log.
- `performance-design.md` § NFR8.12 / NFR8.14 — por qué la unidad no necesita un paso de build ni un
  servicio que medir.
- `infrastructure-specification.md` — qué archivo de plataforma cambia y cuál no.
- `team.md` § Way of Working, § Testing Posture y § Deployment — ramas, PR, CI obligatorio y
  «desplegar» = abrir la app en el teléfono.
