# Tubería de `u6-walkthrough`

> La diferencia con U5 se dice en una línea: **el YAML no cambia y ningún archivo de configuración cambia**. U6 no construye; recorre, anota y corrige dentro de unas compuertas ya cerradas. Este documento existe para dejar claro qué juzga la tubería, qué queda fuera de ella y por qué ese reparto es la única forma de cerrar el MVP sin convertir la verificación en una unidad de construcción encubierta.

## Lo que corre hoy

Nada de esto cambia en U6; se escribe tal como está en `.github/workflows/ci.yml` al empezar la unidad.

| # | Paso | Job | Qué ejecuta | Qué lo hace fallar | Qué estrena U6 en este paso |
|---|---|---|---|---|---|
| 1 | Validar commits | `commit-lint` | `wagoid/commitlint-github-action@v6` sobre todos los commits (clona con `fetch-depth: 0`), con `configFile: .commitlintrc.json` | Un asunto que no es Conventional Commits | Nada: los commits de la unidad siguen la convención (`team.md`) |
| 2 | Detectar directorio | `code-quality` | Un `run` de shell con dos ramas que no se cumplen; resuelve `.` | Nada: siempre `.` | Nada: el lockfile sigue en la raíz |
| 3 | Instalar | `code-quality` | `actions/setup-node@v4` (Node 22, caché de `npm`) y `npm ci` desde el lockfile de la raíz | Que el lockfile no cuadre con `package.json` | Nada: los nueve manifiestos y el lockfile quedan intactos |
| 4 | Tipos | `code-quality` | `npm run typecheck` (`tsc -b`, con las referencias de proyecto) | Un error de tipos en cualquier paquete o en la app | Un arreglo de pasada no puede mover una firma pública sin actualizar consumidores |
| 5 | Lint | `code-quality` | `npm run lint` (`eslint .`) con `eslint.config.js` | Un aviso o error de ESLint, incluidas las prohibiciones de importación | Ninguna frontera se relaja para arreglar un síntoma |
| 6 | Pruebas | `code-quality` | `npm test`; el script de la raíz es **`jest --coverage`** y `coverageThreshold` se evalúa | Una prueba roja o un árbol por debajo del 80 % | El suelo sigue siendo el de nueve árboles; U6 no añade uno ni lo baja |
| 7 | Título del PR | `code-quality`, solo en `pull_request` | `printf '%s\n' "$PR_TITLE" \| npx --no-install commitlint` | Un título que no es Conventional Commits | Nada |

**Disparadores**: `push` y `pull_request` sobre `main` y `develop`. **Permisos**: `contents: read` y `pull-requests: read`. Ese mínimo sigue siendo deliberado: la tubería no comenta, no etiqueta, no publica y no mira el teléfono.

## Los archivos que no cambian, y por qué

| Archivo | Estado en U6 | Qué pasaría si cambiara |
|---|---|---|
| `.github/workflows/ci.yml` | Intacto | Un paso nuevo para «medir» la pasada añadiría instrumentación prohibida por TS-44 |
| `package.json` (raíz, `app` y ocho paquetes) | Intactos | Una versión movida sería la señal de que U6 dejó de verificar y empezó a construir (NFR3.25) |
| `package-lock.json` | Intacto | `npm ci` dejaría de instalar exactamente el árbol que validaron U1–U5 |
| `jest.config.js` | Intacto | Un umbral más bajo haría trampas en el cierre; un árbol nuevo no existe |
| `eslint.config.js` | Intacto | Relajar una regla para pasar un arreglo rompería la frontera del token o de los paquetes |
| `tsconfig.json` y `app/tsconfig.json` | Intactos | No hay módulo nuevo que referenciar |
| `.env.example` | Intacto | U6 no añade variables; el client ID local no se documenta de nuevo |
| `app/src/bootstrap/logger.ts` | Intacto | `AppLogCode` cambiaría y el registro de pasada se convertiría en telemetría (NFR9.9) |
| `inception/delivery-planning/external-dependency-map.md` | Solo una línea condicional | Si R2 se condiciona, se añade `Redirect URI de PKCE — <valor> — <fecha>` **bajo** la tabla, sin tocar columnas |

**La comprobación ejecutable es directa**: `git diff --stat package.json app/package.json packages/*/package.json package-lock.json jest.config.js eslint.config.js tsconfig.json app/tsconfig.json .env.example app/src/bootstrap/logger.ts` debe quedar vacía, salvo la línea condicional del mapa cuando corresponda.

## Qué demuestra el CI y qué no

| Lo que el CI puede afirmar | Dónde | Lo que **no** puede afirmar |
|---|---|---|
| Tipos, lint, pruebas y cobertura en verde | Pasos 4, 5 y 6 | Que las seis pantallas se vean bien en el teléfono |
| Ninguna dependencia, versión o configuración se movió | `git diff --stat` de los archivos de arriba | Que un arreglo no cambió el comportamiento de una pantalla; eso lo repite la persona |
| El contenido sembrado sigue siendo el mismo en el código | Pruebas de C3, C4 y C8 | Que la recarga devolvió la siembra en el dispositivo |
| PKCE y el manejo de errores de Spotify siguen probados con dobles | Pruebas de `@melodify/spotify` | Que el panel de Spotify acepta el redirect que resolvió la app |
| `AppLogCode` no creció | `logger.ts` sin cambios en el `diff` | Que el registro de pasada no contiene contenido ajeno; eso se revisa a ojo y con búsquedas |
| El `diff` no trae `.env`, tokens ni binarios de captura | Revisión del PR y `git ls-files` | Que la IP del redirect es válida en la red de la persona |

**La frontera la cierra el PR, no el runner.** `jest.setup.js` y los dobles siguen siendo los de U1–U5; U6 no añade un doble global ni un conmutador para forzar estados. Si un paso del recorrido encuentra un fallo que solo se puede provocar con un interruptor nuevo, se anota como pendiente (FR11.6, ADR-012).

## Puerta del recorrido

| Puerta | Quién la ejecuta | Evidencia | Si falla |
|---|---|---|---|
| Preparación de P1/P2 | Persona, en Android físico con Metro | Cinco precondiciones bloqueantes + tema fijado | Pasada `Abortada` con bloqueo; se reanuda, no se sustituye por emulador |
| Cierre de R1 | Persona | P1 y P2 completas, 18 filas cada una y 12 capturas | Defecto en alcance: corrección mínima, recarga y repetición del tramo |
| Preparación de P3/P4 | Persona | Client ID y redirect comprobados en S01 | S01 se ejecuta igual; si falla el prerrequisito, R2 queda `Condicionada` |
| Cierre de R2 | Persona | P3 y P4 completas con 12 capturas, o condicionadas con S01 observada, 1 captura, redirect y fecha | No se afirma «con sesión demostrada» si falta alguna fila |
| Veredicto de la unidad | Persona | Cuatro registros sin celdas vacías + tabla de defectos cerrada | No se escribe el veredicto hasta que cada fila tiene resultado |
| Cierre técnico | CI | Tres comandos en verde y suelo del 80 % intacto | El PR no entra; no se mergea «y luego se arregla» |

**Un arreglo no termina la pasada.** Pasa de `Defecto` a `Corrigiendo`, luego a `ReVerificando` y vuelve a `EnCurso` cuando el tramo se repite en ✅. Si el arreglo no cabe en props y estados existentes o exige tocar C1–C8, se convierte en pendiente con qué falta y de qué depende (BR27.4); la última unidad no cambia contratos que cinco unidades ya consumieron.

## Paquete de evidencia del PR

| Pieza | Dónde vive | Forma | Regla |
|---|---|---|---|
| `walkthrough-p1.md` … `walkthrough-p4.md` | `<record>/construction/u6-walkthrough/code-generation/` | Cabecera de ocho datos, una fila por paso, tabla de defectos y veredicto | Un fichero por pasada; `Resultado` solo ✅, ❌ o N/A (BR27.5) |
| Capturas | Adjuntas al PR | `p{1..4}-{pantalla}-{claro\|oscuro}.png` | 24 si R2 se ejecuta; 13 si se condiciona; no se commitean al árbol |
| Tabla de defectos | Dentro de cada registro | ID, paso, síntoma, AC o regla, decisión y commit | Cada ❌ aparece aquí; cada pendiente lleva su dependencia |
| Línea de redirect condicional | `external-dependency-map.md` | `Redirect URI de PKCE — <valor literal> — <fecha>` | Solo si R2 se condiciona; mismo valor y fecha en el registro |
| Checklist de calidad | Plantilla `.github/pull_request_template.md` | Plataformas probadas, capturas y comprobaciones | Incluye que no viaja `.env`, tokens ni secretos (BR28.4) |
| Título del PR | PR a `develop` | Conventional Commits | Lo valida el paso 7 |

La evidencia no se importa desde la app: los registros están fuera de `app/` y de `packages/`, y ningún archivo fuente los referencia (TS-45). LC-20 es un artefacto de proceso, no un módulo.

## Promoción entre ramas

| Rama | Qué es | Quién escribe en ella | Cómo se entra |
|---|---|---|---|
| `feat/<tema>` o `fix/<tema>` | Trabajo manual fuera de AI-DLC | Cualquiera, desde `develop` | PR con la plantilla del repositorio |
| Rama de Bolt (`bolt/<slug>`) | Un Bolt de Construction | AI-DLC, desde `develop` | Squash a `develop` cuando la unidad está terminada |
| `develop` | Integración: lo último construido y validado | Los PR de arriba | Es la base de todo lo demás |
| `main` | Entregas: lo que efectivamente se entregó | Nadie directamente | Squash desde `develop`, no un merge de trabajo en curso |

**No hay promoción de entornos** porque no hay entornos: la promoción es de ramas, y una entrega a `main` es un squash de `develop`. Los dos jobs corren en las dos ramas, así que `main` no puede recibir algo que `develop` no haya visto en verde.

## Estrategia de despliegue

**Ninguna.** No hay azul/verde, canario, anillo ni banderas de funcionalidad: no hay artefacto desplegado sobre el que mover tráfico. La entrega de U6 se demuestra con Metro levantado y la app abierta en el teléfono:

| Pasada | Tema | Con Spotify | Cierre |
|---|---|---|---|
| P1 | Claro | No | 18 filas W01–W14 + variantes, 6 capturas |
| P2 | Oscuro | No | 18 filas, 6 capturas |
| P3 | Claro | Sí, o condicionada | 8 filas S01–S08, 6 capturas o 1 de tarjeta |
| P4 | Oscuro | Sí, o condicionada | 8 filas, 6 capturas o 1 de tarjeta |

R1 no es opcional: si falla, no tiene sentido conectar Spotify. R2 puede cerrarse como condicionada sin bloquear R1, pero el veredicto tiene que decir qué mitad quedó sin demostrar (BR28.1, BR28.2).

## Vuelta atrás

| Situación | Qué se hace | Qué **no** hay que deshacer |
|---|---|---|
| Un arreglo de U6 rompe `develop` | `git revert` del squash del Bolt en `develop` y recargar Metro | No hay artefacto desplegado, ni migración, ni caché remota: el contenido vive en memoria |
| El cambio ya viajó en una entrega a `main` | El mismo `git revert` en `main`, además del de `develop` | Tampoco hay versión publicada que retirar |
| Un defecto obligó a tocar un archivo de configuración | Se revierte ese cambio dentro del mismo PR; si no cabe en props y estados, pasa a pendiente | No se rebaja el umbral ni se relaja la regla para salir del paso |
| Une captura o un registro se adjuntó mal | Se corrige el PR y se repite la revisión de evidencia | No se recompila nada: la evidencia no está en el bundle |
| R2 quedó condicionada por el panel de Spotify | Se conserva la línea con redirect y fecha como deuda con dependencia externa | No se inventa un build propio ni `expo-dev-client` (CT-05) |

**El matiz de U6**: aquí el squash no debería mover configuración de plataforma. Si lo hiciera, el revert tendría que devolver varios archivos a la vez; por eso la revisión de `git diff --stat` es una compuerta antes del merge, no después.

## Secretos en CI

| Secreto | ¿Se configura? | Dónde aparece | Por qué |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | **No** | `.env` local del ordenador, nunca commiteado; `.env.example` documenta el nombre | Es público y solo hace falta en el teléfono para R2; las pruebas usan dobles |
| `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` | **No** | `.env` local y, si R2 se condiciona, el registro y el mapa | Es una URL de retorno, no una credencial; se anota una vez con fecha |
| Client secret de Spotify | **No existe** | — | PKCE no lo necesita; `project.md` § Forbidden lo prohíbe |
| Token o `refreshToken` | **No** | — | Vive en el llavero del teléfono y nunca viaja al CI, al log ni a una captura |
| `.env` | **Nunca** | — | Ignorado desde U1 y comprobado en el checklist del PR |
| Capturas con IP del redirect | No en CI; sí en el PR si R2 se condiciona | Nota de S01 y línea del mapa | Es una dirección de red local, no un secreto; se acota a una línea y una fecha |

Los permisos del flujo siguen siendo `contents: read` y `pull-requests: read`. **U6 no añade ni un secreto y no necesita ninguno para pasar en verde**, que es la prueba de que la tubería sigue siendo de validación y no de despliegue.

## Assumptions & Open Questions

- `[assumption]` Los tres comandos siguen corriendo en minutos; U6 no añade pruebas, dependencias ni instrumentación, y solo ejecuta la suite existente al cierre de la última pasada.
- `[assumption]` La persona que recorre puede fijar tema, red y sesión desde el dispositivo sin cambiar código; si no puede, la pasada se aborta o se condiciona según el caso.
- **Pregunta abierta para el cierre del workflow**: si R2 se condiciona, la deuda queda con el redirect literal y la fecha en el mapa y en el registro. El veredicto debe enlazarla y no puede cerrar AC11.2.1–AC11.2.3 como cumplidas.
- **Pregunta abierta de U2**: el paso «Detectar directorio del proyecto» sigue resolviendo `.`; U6 no lo simplifica porque mezclar un cambio de tubería con la verificación final rompería la regla de superficie de `security-design.md` § NFR3.25.

## Sources

- `performance-design.md` — NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20, NFR7.9 y NFR6.11: coste de las pasadas, cabecera de ocho datos, estados terminales y cierre en verde.
- `security-design.md` — NFR3.24, NFR3.25, NFR4.12 y NFR9.9: secretos en la evidencia, compuertas del arreglo, datos permitidos y registro que no es telemetría.
- `logical-components.md` — LC-1 a LC-20: sin componentes nuevos de producto, evidencia fuera del bundle y ninguna arista nueva de ejecución.
- `components.md` — dependencias externas existentes y contexto del dispositivo; U6 no añade módulos ni permisos.
- `functional-spec.md` — P1–P4, catálogo de pasos, salida condicionada de R2, forma del registro, bucle de defectos y criterio de cierre.
- `contract-summary.md` — C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0 y C8 1.1.0; U6 no publica contrato propio.
- `team.md` § Way of Working, § Testing Posture y § Deployment — ramas, PR, CI obligatorio y «desplegar» = abrir la app en el teléfono.
- `project.md` § Forbidden y § Mandated — sin backend, sin persistencia del contenido, sin client secret y app recorrible sin sesión de Spotify.
