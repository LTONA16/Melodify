# Infraestructura de `u3-create-react`

> U3 no provisiona nada, y esta vez la frase lleva un matiz que conviene leer: la unidad que más
> código mueve del intento —ocho piezas nuevas en C1, tres hooks, un controlador y cuatro pantallas
> cableadas— no añade **ninguna** pieza de infraestructura, **ninguna** dependencia y **ninguna**
> línea a la tubería. Lo que cambia es el contenido que la tubería ya comprueba. Este documento
> escribe esa ausencia para que nadie la lea como un olvido y para que U4 no herede una tarea
> pendiente que aquí no existe.

## Qué decide esta etapa

`team.md` § Deployment lo dice sin rodeos: en esta versión no hay entornos, no hay backend y
«desplegar» significa abrir la app en el teléfono con Metro levantado. La respuesta a Q1 fue la
misma que en U2: **no se provisiona infraestructura**. Por tanto esta etapa no diseña una topología
de nube: diseña el **borde de lo que sí existe** —el ejecutor del CI, el servidor de desarrollo, el
runtime del teléfono y el almacenamiento que ya trae el dispositivo— y declara el resto como fuera
de alcance con su razón.

U3 no aporta una respuesta nueva a esa pregunta, pero sí una comprobación que U2 no podía hacer:
que el peso del código nuevo no mueve el borde. Las ocho piezas son React Native con los tokens de
C1, los tres hooks son estado en memoria, el controlador de comentarios vive en el proceso y las
cinco escrituras van a C4 (NFR7.6, NFR4.8, TS-23 a TS-30). **Ni una línea nueva necesita servidor,
compilación ni permiso del sistema operativo**, y por eso nada de lo que sigue cambia respecto a la
unidad anterior.

| No se diseña | Por qué |
|---|---|
| Clúster, contenedores o funciones | No hay nada que ejecutar en un servidor: no hay backend (CT-02, CT-03) |
| Base de datos, caché, cola o búsqueda | El contenido vive en memoria del proceso (C4 1.2.0) y el catálogo se resuelve en el cliente (C5) |
| CDN, DNS propio, balanceador o VPC | El cliente habla con la Web API de Spotify directamente desde el teléfono, y en U3 ni siquiera la llama: los tres puertos siguen en `null` (NFR3.15) |
| Entornos staging/producción | `team.md` § Deployment: no existen; el rollback es el del repositorio |
| APM, agregación de logs, alertas, SLIs | No hay servicio que observar; lo único que hay es el logger del dispositivo (Q5, `monitoring-design.md`) |
| EAS Build, EAS Update, firma, tiendas | La entrega se demuestra en Expo Go; nada se compila ni se publica (CT-05, Q3) |
| Paso de build en la tubería | Las ocho piezas son JavaScript sobre React Native: no hay módulo nativo que compilar ni `prebuild` que ejecutar (NFR7.6) |

## Despliegue

| Facet | Choice | Rationale |
|---|---|---|
| **Modelo de cómputo** | Ninguno propio: el código corre en el teléfono dentro de **Expo Go**; el ordenador solo ejecuta **Metro** | No hay servidor que alojar ni proceso que escalar; el runtime del cliente lo aporta Expo Go, sin compilación propia (NFR7.6, CT-05) |
| **Red e ingress** | Sin ingress, sin VPC, sin subredes. La única salida es la que ya usa el cliente: HTTPS hacia la Web API de Spotify, y en U3 ninguna | Una app de Expo Go no escucha conexiones; el sentido de la red es siempre saliente y lo decide el dispositivo (NFR4.8) |
| **Almacenamiento** | Nada provisionado. `expo-secure-store` es del dispositivo y sigue con una sola clave, `melodify.session`, de U1 | U3 **no añade ninguna escritura en disco**: ni el borrador, ni el texto publicado, ni el comentario (NFR3.16, NFR4.7) |
| **Entornos** | Uno: el teléfono con Metro. Sin staging ni producción | `team.md` § Deployment; dos entornos sin backend solo añadirían configuración que nadie usa |
| **Infraestructura como código** | Ninguna. El único artefacto de automatización es `.github/workflows/ci.yml`, que ya existe y **no se toca en esta unidad** | No hay recursos que declarar; el CI de U2 ya quedó completo y U3 no le añade ni un paso (`cicd-pipeline.md`) |
| **Dimensionamiento** | No aplica: no hay servidor que dimensionar. El presupuesto real es el de NFR8 (una petición de búsqueda por pausa de 400 ms, una hoja con su lista, un aviso de cuatro segundos) | Sin recurso remoto no hay CPU ni memoria que aprovisionar; el límite es el teléfono y ya está presupuestado en `performance-design.md` |
| **Dependencias** | **Ninguna nueva.** El lockfile no se mueve | La hoja es `Modal` + `KeyboardAvoidingView`, los temporizadores son `setTimeout` y las piezas son React Native con tokens: todo viene ya en el árbol (NFR7.6, TS-23 a TS-29) |

## Servicios de infraestructura

| Service | Role | Configuration | Notes |
|---|---|---|---|
| **GitHub Actions** (`ubuntu-latest`) | Ejecutor de la tubería de validación | Dos jobs, `commit-lint` y `code-quality`; Node 22 con caché de `npm`; permisos `contents: read` y `pull-requests: read`; sin cambios en U3 | No publica artefactos ni despliega nada; válida y termina (`cicd-pipeline.md`) |
| **Metro** (ordenador de desarrollo) | Servidor de desarrollo del bundle | `npx expo start`; el teléfono se conecta por la red local o por túnel | No forma parte del producto: es la herramienta con la que se recorre. U3 lo exige para probar la hoja con el teclado abierto |
| **Expo Go** (teléfono Android) | Runtime del cliente | Cliente de Expo instalado a mano en el dispositivo | Sin build propio ni firma; es la restricción CT-05 y la compuerta de NFR7.6 |
| **`expo-secure-store`** (dispositivo) | Almacenamiento seguro del sistema operativo | Una clave, `melodify.session`, con el `authorId` y el `startedAt` | Heredado de U1; U3 no añade claves ni escribe (NFR3.16) |
| **Registro del dispositivo** | Sumidero de diagnóstico | Consola del teléfono, visible en Metro | Efímero y sin agregación; U3 amplía su vocabulario con un solo código (`monitoring-design.md`) |

## Infraestructura compartida

**No hay recursos compartidos que provisionar.** Las seis unidades siguen siendo paquetes del mismo
monorepo y el mismo binario de Expo Go: lo que comparten es el árbol de código, el `package-lock.json`
y la tubería de CI, no un recurso con dueño y consumidores.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| — | — | — | No existe ninguno: cada unidad es un paquete; el único punto común es el repositorio y su CI |

**Lo que U3 sí comparte, y no es infraestructura.** Esta unidad crea por primera vez estado que
varias pantallas leen a la vez, y conviene que quede escrito aquí precisamente para no confundirlo
con un recurso que haya que aprovisionar. Los tres viven en el proceso del teléfono y mueren al
recargar:

| Lo compartido | Cuántas instancias | Quién lo crea | Si se duplicara |
|---|---|---|---|
| `commentsController` | **Una** | `app/src/bootstrap/comments.ts` | Dos listas de comentarios para la misma opinión según desde qué pestaña se abra la hoja (TS-27) |
| Mensaje del snackbar | Uno (uno pendiente) | LC-1 (`showSnackbar`) | Dos avisos a la vez, o uno que viaja de una pestaña a otra (BR15.1) |
| `MAX_OPINION_LENGTH` (500) y `MAX_COMMENT_LENGTH` (300) | Una definición, en C4 1.2.0 | `@melodify/content-store` | Dos topes distintos entre el campo y el almacén, y un `422` que la persona no entiende (TS-28) |

**Consecuencia para las unidades siguientes**: U4, U5 y U6 tampoco heredan de aquí ninguna pieza que
provisionar. U4 añadirá una dependencia (el cliente de autorización) y un flujo PKCE, y **será la
primera unidad que mueva el lockfile desde U2**; eso es código y configuración de la app, no
infraestructura, pero sí tendrá que justificar su `npm ci` y su tipo de paquete en esta misma etapa.

## Lo que U3 no mueve

La tabla que un revisor de infraestructura pide primero en una unidad de este tamaño: qué archivo de
plataforma cambia y cuál no.

| Artefacto | Estado en U3 | Por qué |
|---|---|---|
| `.github/workflows/ci.yml` | **No cambia** | Ningún paso nuevo, ningún umbral nuevo, ningún secreto nuevo (`cicd-pipeline.md` § Lo que esta unidad no cambia) |
| `package.json` / `package-lock.json` | **No cambian** | Ninguna dependencia nueva (NFR7.6, TS-23 a TS-29); `npm ci` instala exactamente lo de U2 |
| `jest.config.js` | **No cambia** | Las siete entradas de `coverageThreshold` y los siete `moduleNameMapper` ya existen a 80 desde U1 y U2; U3 solo las alimenta con pruebas (NFR5.8) |
| `eslint.config.js` | **Dos reglas nuevas** | C1 y C2 no importan C4: el tope llega como prop (TS-28). Es la única compuerta nueva, y es de lint, no de infraestructura |
| `.commitlintrc.json` | **No cambia** | U2 lo creó; U3 solo escribe asuntos que lo cumplen |
| `.env`, `.env.example` | **No cambian** | U3 no lee ninguna variable de entorno; el client ID es de U4 y sigue documentado sin valor (NFR3.15) |

## Qué queda escrito en el teléfono

Nada nuevo, y conviene que esté aquí además de en `security-design.md` § NFR4.7, porque es la
pregunta que un revisor de infraestructura hace primero:

| Dato | Dónde vive | Lo crea | Lo borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | `expo-secure-store`, clave `melodify.session` | U1 | «Cerrar sesión» |
| Opiniones, autores, me gusta, comentarios y seguimientos | Memoria del proceso | C4 | Recargar la app |
| **Texto de la opinión que escribe la persona** | Memoria del proceso (C4) | U3 | Recargar la app |
| **Texto del comentario** | Memoria del proceso (C4) | U3 | Recargar la app |
| **Borrador del formulario y de la hoja** | Memoria del proceso | U3 (`useCrear`, `CommentSheet`) | Cerrar la hoja, cambiar de entrada o recargar |
| Obras de ejemplo y decisión de portada | Memoria del proceso | C5 | Recargar la app |
| Token de Spotify | `expo-secure-store`, clave propia | **U4**, no esta unidad | Desconectar (U4) |

**La fila que importa es la de en medio.** U3 es la primera unidad en la que lo escrito es de una
persona y no de ejemplo, y las tres filas nuevas son **volátiles a propósito**: no hay borrador en
disco «para no perder lo escrito» (RC-03, NFR3.16). Si alguien lo añadiera, esta tabla dejaría de ser
cierta y la decisión tendría que tomarla una etapa, no un PR.

## Assumptions & Open Questions

- `[assumption]` GitHub Actions sigue disponible en el plan gratuito del repositorio con los minutos
  que estos dos jobs consumen. U3 sí añade suites —ocho piezas, tres hooks y el controlador—, pero
  todas caen dentro de árboles que ya tienen umbral, así que el job crece en tiempo de ejecución y no
  en configuración: el runner sigue siendo `ubuntu-latest` sin servicios ni contenedores.
- **Pregunta abierta para U4**: el lockfile se mueve por primera vez desde U2 cuando entre la
  dependencia de autorización. Esa unidad tendrá que decir si el paquete es público y si `npm ci` en
  el CI sigue sin necesitar credenciales; aquí no se decide por adelantado.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe, el lockfile vive en la raíz, y
  `Ratetify/package.json` es de otro proyecto—, así que resuelve `.` y funciona. U3 no lo toca: es un
  cambio de tubería ajeno a esta unidad y meterlo aquí mezclaría dos cosas en un mismo PR.

## Sources

- `performance-design.md` y `security-design.md` — presupuesto de NFR8.8–8.11, inventario de lo que
  se escribe (NFR4.7), superficie de diagnóstico (NFR9.6) y por qué no hay persistencia nueva (NFR3.16).
- `logical-components.md` — LC-1 a LC-11, los tres recursos compartidos del proceso y las reglas de
  importación que U3 convierte en compuerta de lint.
- `tech-stack-decisions.md` — TS-23 a TS-29: ninguna dependencia nueva y ningún módulo nativo (NFR7.6).
- `inception/domain-design/components.md` — dependencias externas: `expo-secure-store`, el estado de
  red del sistema y las dos APIs de Spotify.
- `functional-spec.md` — las seis pantallas que se recorren y las cinco acciones que se demuestran.
- `inception/contract-design/contract-summary.md` — C1 1.3.0, C2 1.3.0 y C4 1.2.0: ninguna dependencia
  de infraestructura, todo en el proceso del cliente.
- `team.md` § Deployment — no hay entornos, no hay despliegue, el rollback es del repositorio.
- Answers file: `infrastructure-design-questions.md` (Q1 A, Q3 A, Q4 A, Q5 A).
