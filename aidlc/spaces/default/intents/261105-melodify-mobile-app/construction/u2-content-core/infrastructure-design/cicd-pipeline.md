# Tubería de `u2-content-core`

> Lo que hay hoy en `.github/workflows/ci.yml`, lo que esta unidad cambia y lo que la tubería
> **no** hará nunca en esta versión: compilar, firmar, publicar o desplegar. «CI/CD» se llama así
> en el archivo, pero aquí solo hay CI, y esa es la decisión, no una carencia.

## Lo que corre hoy

| Etapa | Job | Qué ejecuta | Qué la hace fallar | Bloquea |
|---|---|---|---|---|
| 1 | `commit-lint` | `wagoid/commitlint-github-action@v6` sobre todos los commits del PR o del push (clona con `fetch-depth: 0`), con `configFile: .commitlintrc.json` | Un asunto que no es Conventional Commits | El merge a `develop` y la entrega a `main` |
| 2 | `code-quality` | `actions/checkout@v4`, detección de directorio, `actions/setup-node@v4` (Node 22, caché de `npm`), `npm ci` | Que el lockfile no cuadre con `package.json` | Todo lo siguiente |
| 3 | `code-quality` | `npm run typecheck` | Un error de tipos (incluye las referencias de proyecto de los paquetes) | El merge |
| 4 | `code-quality` | `npm run lint` con las reglas de `eslint.config.js` que existen hoy: `no-console` (con la excepción de `app/src/bootstrap/logger.ts`), `expo-secure-store` limitado al adaptador de sesión, un paquete no importa la app y `@react-native-async-storage/async-storage` prohibido. Las dos prohibiciones de importación de NFR3.11 se añaden en esta unidad (ver abajo) | Un aviso o error de ESLint | El merge |
| 5 | `code-quality` | `npm test -- --passWithNoTests`; el script de la raíz es **`jest --coverage`**, así que la cobertura y `coverageThreshold` ya se evalúan hoy | Una prueba roja o un árbol por debajo de su umbral | El merge |

**Disparadores**: `push` y `pull_request` sobre `main` y `develop`. **Permisos**: `contents: read`
y `pull-requests: read`, nada de escritura. Ese mínimo es deliberado: la tubería no comenta, no
etiqueta y no publica.

**Estado real de `commit-lint` hoy**: el workflow pasa `configFile: .commitlintrc.json` y ese archivo
**no existe** en el repositorio. La acción `wagoid/commitlint-github-action@v6` no falla por eso:
su documentación dice que, si el archivo no está, carga `@commitlint/config-conventional` como
respaldo, así que los commits se validan igual contra Conventional Commits. El archivo se crea en
esta unidad para que las reglas sean **explícitas** en el repositorio —hoy dependen del valor por
defecto de una acción—, para que el `configFile` del workflow apunte a una ruta que existe y para
que el enlace de `README.md` deje de estar roto. No se crea porque la puerta esté caída.

Lo que **sí** puede tener la puerta en rojo hoy es otra cosa, y conviene no confundirlas: el
último commit que tocó `ci.yml` (`493dc8c`, 2026-11-12) se titula «No more tokens :(», que no es
Conventional Commits. Si ese historial llega a `develop` o `main`, el job falla por el asunto del
commit, no por la configuración ausente.

**Un detalle que se lee mal si no se dice**: el paso «Detectar directorio del proyecto» tiene dos
ramas que no se cumplen —la de `app/package-lock.json`, que no existe porque el lockfile vive en
la raíz, y la de `Ratetify/package.json`, que es de otro proyecto y no está en este repositorio—,
así que resuelve `.` y todos los comandos corren en la raíz. Funciona, y por eso no se toca en
esta unidad; se anota abajo para que no se lea como un descuido.

## Lo que esta unidad cambia

| Cambio | Dónde | Por qué |
|---|---|---|
| **Crear `.commitlintrc.json`** con `{ "extends": ["@commitlint/config-conventional"] }` | Raíz del repositorio | Hoy el workflow lo pasa como `configFile` y el archivo no existe, así que la acción cae a su respaldo interno y las reglas viven fuera del repositorio; `README.md` enlaza además una ruta rota. El archivo hace explícitas las reglas y deja al workflow y al README diciendo la verdad |
| Añadir **`@commitlint/cli` y `@commitlint/config-conventional`** como dependencias de desarrollo fijadas | `package.json` y `package-lock.json` | El paso del título necesita un binario con versión. Una descarga sin fijar en tiempo de ejecución no es reproducible y puede romper un PR por una versión nueva |
| Validar el **título del PR** con commitlint | Job `code-quality`, paso nuevo condicionado a `github.event_name == 'pull_request'`, después de `npm ci` | `team.md` § Way of Working pide Conventional Commits en el título **y** en los commits; el job `commit-lint` solo mira los commits. Va en `code-quality` porque ese job ya instaló las dependencias; `commit-lint` no las instala y no debe pagar un `npm ci` para comprobar una línea |
| Retirar `--passWithNoTests` del paso de pruebas | Job `code-quality` | El script de la raíz ya es `jest --coverage`, así que la cobertura se evalúa sin añadir nada. La bandera solo servía para que una suite vacía pasara en verde; hoy hay 19 suites, así que se queda `npm test` a secas y una suite que desaparece falla |
| Tres entradas nuevas en `coverageThreshold` | `jest.config.js` | `./packages/content-store/src/**`, `./packages/catalog/src/**` y `./packages/connectivity/src/**`, con el mismo 80 % que ya tienen los otros tres paquetes. Sin ellas, el árbol nuevo no tiene umbral y el total del monorepo lo taparía (NFR5.6) |
| Tres entradas nuevas en `moduleNameMapper` | `jest.config.js` | `^@melodify/content-store$`, `^@melodify/catalog$` y `^@melodify/connectivity$` hacia su `src`, igual que los tres paquetes existentes. Sin el mapeo, el nombre se resuelve por el enlace de workspaces a un `.ts` que el preset `jest-expo` no transforma, y las pruebas nuevas no llegan a ejecutarse: la cobertura de NFR5.6 quedaría en cero y el job en rojo (NFR5.5, `logical-components.md` § Superficie) |
| **Dos prohibiciones de importación nuevas** en `no-restricted-imports` | `eslint.config.js` | NFR3.11: `@melodify/catalog` no importa `@melodify/spotify` (sin `allowTypeImports`) y `@melodify/spotify` no importa `@melodify/catalog` (con `allowTypeImports`), más `expo-network` restringido a `packages/connectivity/src/expo-network-adapter.ts`. Hoy ninguna de las dos existe, así que el lint solo las hará fallar cuando esta unidad las añada (`logical-components.md` § Reglas de importación y su compuerta) |

**Lo que no cambia**: el paso de pruebas **no** necesita `--coverage` añadido —el script ya lo
trae— y por eso tampoco se duplica la bandera en el YAML. Y no se añade ningún paso de build, ni
`expo export`, ni firma, ni EAS, ni publicación de artefactos (Q3 A). Las pruebas siguen doblando
la API de Spotify, así que el job no necesita red externa ni credenciales.

**El orden importa en un solo punto**: el archivo `.commitlintrc.json` y las dos dependencias
entran en el mismo PR que el resto, porque el paso del título se ejecuta en ese PR y necesita el
binario y las reglas ya instalados; si se dejaran para después, el propio PR no podría validar su
título. La configuración no arregla un rojo existente —la acción tiene respaldo—, pero sin ella el
README sigue enlazando una ruta que no existe y las reglas siguen fuera del repositorio.

## Promoción entre ramas

| Rama | Qué es | Quién escribe en ella | Cómo se entra |
|---|---|---|---|
| `feat/<tema>` o `fix/<tema>` | Trabajo manual fuera de AI-DLC | Cualquiera, desde `develop` | PR con la plantilla del repositorio |
| Rama de Bolt (`bolt/<slug>`) | Un Bolt de Construction | AI-DLC, desde `develop` | Squash a `develop` cuando la unidad está terminada |
| `develop` | Integración: lo último construido y validado | Los PR de arriba | Es la base de todo lo demás |
| `main` | Entregas: lo que efectivamente se entregó | Nadie directamente | Squash desde `develop`, no un merge de trabajo en curso |

**No hay promoción de entornos** porque no hay entornos: la promoción aquí es de ramas, y una
entrega a `main` es un squash de `develop`. Los dos jobs corren en las dos ramas, así que `main`
no puede recibir algo que `develop` no haya visto en verde.

## Estrategia de despliegue

**Ninguna.** No hay azul/verde, ni canario, ni anillo, ni banderas de funcionalidad: no hay
artefacto desplegado sobre el que mover tráfico. La entrega se demuestra **recorriendo las seis
pantallas en el teléfono** con Metro levantado, sin Spotify y con Spotify (Q3 A, `team.md` §
Deployment). Si algún día se publica, eso exige su propia decisión —compilación en la nube,
firma, cuentas de tienda y una puerta de aprobación manual antes de cada publicación— y este
documento se reabre.

## Vuelta atrás

| Situación | Qué se hace | Qué **no** hay que deshacer |
|---|---|---|
| Un Bolt de U2 rompe `develop` | `git revert` del squash del Bolt en `develop` y recargar Metro | No hay artefacto desplegado, ni migración de datos, ni caché remota: el contenido vive en memoria y desaparece al recargar |
| El cambio ya viajó en una entrega a `main` | El mismo `git revert` en `main`, además del de `develop` | Tampoco hay versión publicada que retirar |
| El CI se cae por un cambio de la tubería | Se revierte ese commit; los jobs no dependen de estado externo | No hay estado del runner que limpiar: cada ejecución parte de un clon limpio |

El rollback es del repositorio, y por eso es verificable: el commit revertido es el mismo que se
squasheó, y el registro de la unidad ya está en el árbol de `aidlc/` (Q6 A).

## Secretos en CI

| Secreto | ¿Se configura? | Dónde aparece | Por qué |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | **No** | `.env.example` (documentado, sin valor) y el entorno local del teléfono | Sin él, `typecheck`, `lint` y las pruebas pasan: las llamadas a Spotify están dobladas. Un cliente público de PKCE no tiene secreto, y un valor en Actions sería una copia más que rotar |
| Client secret de Spotify | **No existe** | — | PKCE no lo necesita; su ausencia es una regla del proyecto, no un olvido |
| Token de sesión o de Spotify | **No** | — | Vive en el dispositivo (`expo-secure-store`); nunca pasa por el CI |

Los permisos del flujo ya son `contents: read` y `pull-requests: read`: aunque alguien añadiera
un paso que quisiera escribir, no podría sin cambiar el YAML a la vista de todos (NFR3.10).

## Assumptions & Open Questions

- `[assumption]` El runner `ubuntu-latest` sigue siendo suficiente: la suite actual (19 suites y
  más de 170 pruebas) corre en minutos, sin servicios ni contenedores.
- **Decisión abierta, para que la veas antes del merge**: la validación del título del PR es el
  **único** hueco real entre `team.md` § Way of Working y la tubería actual, porque el job
  `commit-lint` solo mira los commits. Este diseño la incluye, junto con el `.commitlintrc.json`
  y las dependencias que necesita. Si prefieres dejarla para otra unidad, se dice en la puerta y se
  quita de la lista de cambios sin tocar nada más; el archivo de configuración se queda igualmente,
  porque hoy el workflow lo nombra y el README lo enlaza.
- **Pregunta abierta para el PR de U2**: el paso «Detectar directorio del proyecto» tiene dos
  ramas que no se cumplen —`app/package-lock.json`, que no existe porque el lockfile vive en la
  raíz, y `Ratetify/package.json`, que es de otro proyecto y no está en este repositorio—, así que
  resuelve siempre `.`. Simplificarlo es un cambio de una línea, pero es ajeno al contenido de
  esta unidad; se propone hacerlo en el mismo PR solo si no distrae de la revisión.
- **Riesgo asumido**: la cobertura ya se mide hoy, así que el coste de instrumentar no es nuevo;
  lo que añade esta unidad es el umbral de tres árboles más y su mapeo de módulos, que es el mismo
  coste que ya pagan los tres paquetes existentes.

## Sources

- `infrastructure-specification.md` — no hay nada que desplegar; el CI es el único ejecutor.
- `performance-design.md` § NFR8 y NFR5.6 (en `logical-components.md` § Superficie) — el umbral
  por árbol y por qué el feed no exige un paso de build.
- `security-design.md` § NFR3.10 — sin secretos nuevos y sin credenciales en la tubería.
- `logical-components.md` § Superficie, cobertura y compatibilidad — las tres entradas de
  `coverageThreshold`, el mapeo de módulos de cada paquete y la superficie por `src/index.ts`.
- `inception/domain-design/components.md` — no hay componente con servidor que desplegar.
- `functional-spec.md` — las seis pantallas que demuestran una entrega.
- `inception/contract-design/contract-summary.md` — C4/C5 en memoria; ninguna dependencia de
  infraestructura.
- `team.md` § Way of Working y § Deployment — ramas, PR, CI obligatorio y «desplegar» = abrir la
  app en el teléfono.
- Answers file: `infrastructure-design-questions.md` (Q2 A, Q3 A, Q4 A, Q6 A).
