# Tubería de `u3-create-react`

> La diferencia con U2 se puede decir en una línea: **U3 no cambia la tubería, y esa es la
> decisión.** U2 tuvo que construirla —`.commitlintrc.json`, el título del PR, los umbrales de
> cobertura, los mapeos de módulo, las prohibiciones de importación—. U3 llega con todo eso hecho y
> lo único que aporta es **contenido nuevo que las mismas compuertas tienen que juzgar**. Un archivo
> de «CI/CD» para una unidad así podría ser una página en blanco; esta no lo es porque hay que
> escribir *por qué* no se toca nada, y porque hay una compuerta nueva que no vive en el YAML.

## Lo que corre hoy

Nada de esto cambia en U3; se escribe tal como está en `.github/workflows/ci.yml` al empezar la
unidad, para que la revisión pueda comprobarlo.

| # | Paso | Job | Qué ejecuta | Qué lo hace fallar |
|---|---|---|---|---|
| 1 | Validar commits | `commit-lint` | `wagoid/commitlint-github-action@v6` sobre todos los commits (clona con `fetch-depth: 0`), con `configFile: .commitlintrc.json` | Un asunto que no es Conventional Commits |
| 2 | Detectar directorio | `code-quality` | Un `run` de shell con dos ramas que no se cumplen; resuelve `.` | Nada: siempre `.` |
| 3 | Instalar | `code-quality` | `actions/setup-node@v4` (Node 22, caché de `npm`) y `npm ci` desde el lockfile de la raíz | Que el lockfile no cuadre con `package.json` |
| 4 | Tipos | `code-quality` | `npm run typecheck` (el script es `tsc -b`, con las referencias de proyecto de los siete paquetes) | Un error de tipos en cualquier paquete o en la app |
| 5 | Lint | `code-quality` | `npm run lint` (`eslint .`) con `eslint.config.js` | Un aviso o error de ESLint, incluidas las prohibiciones de importación |
| 6 | Pruebas | `code-quality` | `npm test`; el script de la raíz es **`jest --coverage`** y `coverageThreshold` ya se evalúa | Una prueba roja o un árbol por debajo de su umbral |
| 7 | Título del PR | `code-quality`, solo en `pull_request` | `printf '%s\n' "$PR_TITLE" \| npx --no-install commitlint` | Un título que no es Conventional Commits |

**Disparadores**: `push` y `pull_request` sobre `main` y `develop`. **Permisos**: `contents: read` y
`pull-requests: read`. Ese mínimo sigue siendo deliberado: la tubería no comenta, no etiqueta y no
publica.

## Lo que esta unidad no cambia

Tabla de candidatos y su resolución, porque «no se toca» sin decir qué se evaluó es una omisión
disfrazada de decisión:

| Cambio que se consideró | ¿Se hace? | Por qué no |
|---|---|---|
| Umbral de cobertura para los árboles que U3 toca | **No** | Las siete entradas de `coverageThreshold` ya existen a 80 desde U1 y U2, incluidas las cuatro de U3 (`app/src/**`, `design-system`, `app-shell`, `content-store`). Añadir otra entrada sería duplicar la misma cifra (NFR5.8) |
| `moduleNameMapper` para algún paquete | **No** | Los siete ya están mapeados a su `src`; U3 no crea paquetes |
| `--coverage` explícito en el paso de pruebas | **No** | El script de la raíz es `jest --coverage` y U2 quitó `--passWithNoTests`. Poner la bandera en el YAML sería decir dos veces lo mismo |
| Un paso de build (`expo export`) | **No** | Q3 A, y además no hay nada que compilar: las ocho piezas son JavaScript sobre React Native y U3 no añade módulo nativo ni `prebuild` (NFR7.6) |
| Instalar dependencias nuevas | **No** | NFR7.6 y TS-23 a TS-29: el lockfile no se mueve, así que `npm ci` instala lo mismo. Es la primera unidad desde U2 que no lo mueve |
| Un secreto o una variable del repositorio | **No** | Q4 A: sin `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`, `typecheck`, `lint` y las pruebas pasan. U3 ni lee la variable (NFR3.15) |
| Un job o un paso paralelo | **No** | La suite corre en minutos sin servicios; partirla no acorta nada y añade una configuración que hay que mantener |
| `--passWithNoTests` | **No se repone** | Se retiró en U2 justo para que una suite que desaparece rompa el job. U3 trae más suites, no menos |

## Lo que sí cambia, y no está en el YAML

La única compuerta nueva de U3 es de **lint**, y por eso no aparece en `.github/workflows/ci.yml`:
el paso 5 ya la ejecuta con `eslint .`. Lo que cambia es `eslint.config.js`.

| Regla | A qué se aplica | Por qué existe | Qué la hace fallar |
|---|---|---|---|
| **C1 no importa C4** | `packages/design-system/src/**` | El tope de la opinión (500) y el del comentario (300) llegan a la hoja y al campo **como props**; si C1 importara el almacén para leerlos, el sistema de diseño dejaría de poder probarse sin la app y el número viviría en dos sitios (TS-28) | Un `import` de `@melodify/content-store` en cualquier archivo de C1 |
| **C2 no importa C4** | `packages/app-shell/src/**` | La cáscara recibe el controlador y `CommentSheetState` con sus dos cifras; si importara C4 tendría dos formas de leer lo mismo (TS-28) | Un `import` de `@melodify/content-store` en cualquier archivo de C2 |

La forma es la de U2 para `catalog` y `spotify`: la regla del plugin de TypeScript, no la base, porque
la base no entiende `allowTypeImports` y aquí **tampoco se permite el import de tipo** —un
`import type { CommentModel }` desde C1 sería una arista que el contrato no declara—.

```js
// Ilustrativo, no implementación. eslint.config.js
{ files: ["packages/design-system/src/**", "packages/app-shell/src/**"],
  rules: { "@typescript-eslint/no-restricted-imports": ["error", { paths: [
    { name: "@melodify/content-store", allowTypeImports: false,
      message: "El tope llega como prop: C1 y C2 no importan el almacén (TS-28)." } ] }] } }
```

**Comprobado antes de escribirlo**: hoy `packages/design-system/src` y `packages/app-shell/src` no
importan `@melodify/content-store` en ningún archivo, así que añadir la regla deja el árbol en verde y
la regla solo morderá al código que U3 escriba. Una compuerta que nace en rojo se acaba desactivando;
una que nace en verde y protege lo que viene es la que sirve.

**Lo que esta regla no cubre, y se dice para que nadie lo suponga**: no impide que C1 importe el
almacén por una ruta relativa (`../../content-store/src`). El type-check tampoco, porque la ruta
compilaría. Lo que lo cierra es la revisión del PR y el hecho de que el paquete no lo declare en su
`package.json`; la regla cubre el camino realista, que es el nombre del paquete.

## Promoción entre ramas

| Rama | Qué es | Quién escribe en ella | Cómo se entra |
|---|---|---|---|
| `feat/<tema>` o `fix/<tema>` | Trabajo manual fuera de AI-DLC | Cualquiera, desde `develop` | PR con la plantilla del repositorio |
| Rama de Bolt (`bolt/<slug>`) | Un Bolt de Construction | AI-DLC, desde `develop` | Squash a `develop` cuando la unidad está terminada |
| `develop` | Integración: lo último construido y validado | Los PR de arriba | Es la base de todo lo demás |
| `main` | Entregas: lo que efectivamente se entregó | Nadie directamente | Squash desde `develop`, no un merge de trabajo en curso |

**No hay promoción de entornos** porque no hay entornos: la promoción aquí es de ramas, y una entrega
a `main` es un squash de `develop`. Los dos jobs corren en las dos ramas, así que `main` no puede
recibir algo que `develop` no haya visto en verde.

## Estrategia de despliegue

**Ninguna.** No hay azul/verde, ni canario, ni anillo, ni banderas de funcionalidad: no hay artefacto
desplegado sobre el que mover tráfico. La entrega de U3 se demuestra **en el teléfono** con Metro
levantado: publicar una opinión, editarla, dar me gusta, abrir la hoja y comentar, y seguir y dejar de
seguir a un autor, sin Spotify y con Spotify si hay app registrada (Q3 A, `team.md` § Deployment).

**Una consecuencia propia de U3**: dos de las cinco acciones —comentar y seguir— solo existen dentro
de componentes que el CI no puede mirar. El CI prueba que la hoja pinta sus seis estados y que el
controlador escribe; que el teclado no tape el campo y que el velo cierre la hoja se comprueba
recorriéndola. Eso no es una carencia de la tubería: es el límite que `team.md` § Testing Posture
declara al decir que el recorrido real no se prueba automáticamente.

## Vuelta atrás

| Situación | Qué se hace | Qué **no** hay que deshacer |
|---|---|---|
| Un Bolt de U3 rompe `develop` | `git revert` del squash del Bolt en `develop` y recargar Metro | No hay artefacto desplegado, ni migración de datos, ni caché remota: el contenido vive en memoria y desaparece al recargar |
| El cambio ya viajó en una entrega a `main` | El mismo `git revert` en `main`, además del de `develop` | Tampoco hay versión publicada que retirar |
| Una de las dos reglas de lint resulta demasiado estricta | Se corrige la regla en el mismo PR, con la razón escrita | No se revierte la unidad: la regla es una línea de configuración, no un comportamiento |
| El CI se cae por un cambio de la tubería | Se revierte ese commit; los jobs no dependen de estado externo | No hay estado del runner que limpiar: cada ejecución parte de un clon limpio |

El rollback es del repositorio, y por eso es verificable: el commit revertido es el mismo que se
squasheó. **U3 añade un matiz**: como no toca el YAML, el revert de la unidad **no puede dejar la
tubería rota**; lo único que puede dejar es el árbol de código anterior con las dos reglas de lint ya
en su sitio, y esas reglas se cumplen igual porque el código anterior tampoco importaba C4.

## Secretos en CI

| Secreto | ¿Se configura? | Dónde aparece | Por qué |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | **No** | `.env.example` (documentado, sin valor) y el entorno local del teléfono | Sin él, `typecheck`, `lint` y las pruebas pasan: U3 ni lee la variable. Un cliente público de PKCE no tiene secreto, y un valor en Actions sería una copia más que rotar (NFR3.15) |
| Client secret de Spotify | **No existe** | — | PKCE no lo necesita; su ausencia es una regla del proyecto, no un olvido |
| Token de sesión o de Spotify | **No** | — | El de sesión vive en el dispositivo (`expo-secure-store`); el de Spotify no existe hasta U4. Ninguno pasa por el CI |
| `.env` | **Nunca** | — | `.gitignore` de U1 y `project.md` § Forbidden; U3 ni lo crea |

Los permisos del flujo siguen siendo `contents: read` y `pull-requests: read`: aunque alguien
añadiera un paso que quisiera escribir, no podría sin cambiar el YAML a la vista de todos (NFR3.10).

## Assumptions & Open Questions

- `[assumption]` La suite sigue corriendo en minutos con las suites nuevas de U3 (ocho piezas, tres
  hooks, el controlador, las pruebas de `formKey` y las del `422`): todo son dobles, sin red, sin
  credenciales y sin temporizadores largos —los 400 ms de la búsqueda y los 4 s del aviso se simulan
  con temporizadores falsos—.
- **Pregunta abierta para U4**: cuando entre la dependencia de autorización, el `npm ci` del CI
  instalará un paquete más. Si ese paquete necesitara `prebuild` o un módulo nativo, la tubería
  dejaría de ser solo `typecheck`/`lint`/`test` y esta etapa se reabre; U3 no lo decide por
  adelantado ni deja preparado un paso que hoy no se usa.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe y `Ratetify/package.json` es de otro proyecto—, así
  que resuelve siempre `.`. Simplificarlo es un cambio de una línea, pero es ajeno a esta unidad y
  U3 no lo mezcla con su PR.

## Sources

- `infrastructure-specification.md` — no hay nada que desplegar y U3 no mueve ningún artefacto de
  plataforma salvo `eslint.config.js`.
- `.github/workflows/ci.yml` — los siete pasos tal como están al empezar la unidad (U2 los dejó así).
- `jest.config.js` — las siete entradas de `coverageThreshold` a 80 y los siete `moduleNameMapper`.
- `eslint.config.js` — las prohibiciones existentes y la forma de la regla que U3 añade.
- `logical-components.md` § Superficie, cobertura y compatibilidad — NFR5.8, NFR5.9 y NFR7.6, y por
  qué las dos reglas nuevas son de lint.
- `security-design.md` § NFR3.10 / NFR3.15 — sin secretos nuevos y sin sesión de Spotify.
- `performance-design.md` § Presupuesto — por qué el feed y la hoja no exigen un paso de build.
- `team.md` § Way of Working y § Deployment — ramas, PR, CI obligatorio y «desplegar» = abrir la app
  en el teléfono.
- Answers file: `infrastructure-design-questions.md` (Q2 A, Q3 A, Q4 A, Q6 A).
