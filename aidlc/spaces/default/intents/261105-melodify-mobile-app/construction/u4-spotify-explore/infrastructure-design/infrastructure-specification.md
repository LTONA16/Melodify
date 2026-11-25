# Infraestructura de `u4-spotify-explore`

> U4 sigue sin provisionar nada, y esta vez la frase necesita más explicación que en U3, no menos. Es
> la primera unidad desde U2 que **mueve el lockfile**, la primera que añade **tres dependencias**, la
> primera que guarda una **credencial** y la primera que **sale del dispositivo** hacia un servidor
> ajeno. Ninguna de esas cuatro cosas es infraestructura que se aprovisione, y precisamente por eso
> este documento existe: tiene que escribir el borde —qué sale, adónde, con qué credencial y con qué
> archivo de plataforma se comprueba— para que nadie lea «no hay infraestructura» como «no hay nada
> que decidir».

## Qué decide esta etapa

`team.md` § Deployment no ha cambiado desde U1: en esta versión no hay entornos, no hay backend y
«desplegar» significa abrir la app en el teléfono con Metro levantado. La respuesta a la pregunta de
infraestructura es la misma que en U2 y U3 —**no se provisiona nada**—, y esta etapa no abre un
fichero de preguntas nuevo: trabaja en modo **ARTIFACT-ONLY** sobre lo que el diseño de NFR ya
decidió. Lo que sí cambia respecto a U3 es el borde: U4 estrena **salida a dos hosts de Spotify** y
**una clave más en el llavero del sistema**.

| No se diseña | Por qué |
|---|---|
| Clúster, contenedores o funciones | No hay nada que ejecutar en un servidor: no hay backend (RC-02, `project.md` § Forbidden) |
| Base de datos, caché, cola o búsqueda | La caché de búsquedas y el registro de obras viven en memoria del proceso (C5, TS-36); el catálogo remoto es de Spotify y se lee por HTTP |
| **Backend propio, proxy o intermediario** | RC-02 y `project.md` § Forbidden lo prohíben; la app habla con Spotify directamente desde el teléfono (NFR4.10) |
| CDN propio, DNS, balanceador o VPC | El CDN que sirve las portadas es el de Spotify y no se configura aquí; no hay ingress porque ninguna app de Expo Go escucha conexiones |
| Entornos staging/producción | `team.md` § Deployment: no existen; el rollback es el del repositorio |
| APM, agregación de logs, alertas, SLIs | No hay servicio que observar; lo único que hay es el logger del dispositivo (`monitoring-design.md`) |
| EAS Build, EAS Update, firma, tiendas | Las tres dependencias nuevas viajan dentro de Expo Go (CT-05, NFR7.7); nada se compila ni se publica |
| Paso de build en la tubería | `expo-crypto`, `expo-web-browser` y `expo-auth-session` son módulos del SDK 57 incluidos en el cliente de Expo Go: no hay `prebuild` ni módulo nativo propio (NFR7.7) |
| Registro del redirect en el panel de Spotify | Es un paso **manual** en un panel ajeno, no un recurso que esta etapa aprovisione; se documenta y se demuestra en el recorrido (BR16.2) |

## Despliegue

| Facet | Choice | Rationale |
|---|---|---|
| **Modelo de cómputo** | Ninguno propio: el código corre en el teléfono dentro de **Expo Go**; el ordenador solo ejecuta **Metro** | No hay servidor que alojar ni proceso que escalar. U4 añade tres módulos del SDK 57 que ya viajan en el cliente: sigue sin haber compilación propia (NFR7.7, CT-05) |
| **Red e ingress** | Sin ingress, sin VPC, sin subredes. **Salida nueva y acotada**: HTTPS hacia `accounts.spotify.com` (autorización, C9) y `api.spotify.com` (catálogo, C10), más las portadas del CDN de Spotify | Una app de Expo Go no escucha conexiones; el sentido de la red es siempre saliente. U4 es la primera unidad con tráfico de salida, y su superficie son dos hosts fijos y un CDN, no una lista configurable (NFR3.20) |
| **Almacenamiento** | Nada provisionado. `expo-secure-store` es del dispositivo y pasa de **una** clave a **dos**: `melodify.session` (U1) y `melodify.spotify.token` (U4) | El llavero lo aporta el sistema operativo; U4 añade exactamente una fila persistida y es una credencial, no contenido (NFR4.9, NFR3.18) |
| **Entornos** | Uno: el teléfono con Metro. Sin staging ni producción | `team.md` § Deployment; dos entornos sin backend solo añadirían configuración que nadie usa |
| **Infraestructura como código** | Ninguna. Los artefactos de automatización son **configuración de repositorio**: `.github/workflows/ci.yml` (no cambia), `tsconfig.json`, `jest.config.js`, `eslint.config.js` y los `package.json` | No hay recursos que declarar. La validación de esos archivos es el propio CI, y su detalle está en `cicd-pipeline.md` |
| **Dimensionamiento** | No aplica: no hay servidor que dimensionar. El presupuesto real es el de NFR8 (400 ms de disparo, 10 s de tiempo límite, 5 esqueletos, 30 resultados, 10 por clase) | Sin recurso remoto no hay CPU ni memoria que aprovisionar; el límite es el teléfono y ya está presupuestado en `performance-design.md` |
| **Dependencias** | **Tres nuevas, todas de Expo y del SDK 57**: `expo-crypto`, `expo-web-browser` y `expo-auth-session`. **El lockfile se mueve por primera vez desde U2** | La versión la fija `npx expo install` y queda exacta (TS-01, TS-32). Las tres son públicas, se instalan sin credenciales y ninguna exige `prebuild` (NFR7.7) |
| **Servicios de terceros** | Dos hosts de Spotify y su CDN de imágenes, con **cliente público sin secreto** y PKCE S256 | No hay contrato, ni cuenta de servicio, ni clave que repartir: el client ID es público y el token pertenece a la persona que autoriza (NFR3.17, `project.md` § Forbidden) |

## Servicios de infraestructura

| Service | Role | Configuration | Notes |
|---|---|---|---|
| **GitHub Actions** (`ubuntu-latest`) | Ejecutor de la tubería de validación | Dos jobs, `commit-lint` y `code-quality`; Node 22 con caché de `npm`; permisos `contents: read` y `pull-requests: read`; **el YAML no cambia** | No publica artefactos ni despliega nada. Lo que cambia es lo que los mismos pasos juzgan: una dependencia más en `npm ci` y un árbol más con umbral (`cicd-pipeline.md`) |
| **Metro** (ordenador de desarrollo) | Servidor de desarrollo del bundle | `npx expo start`; el teléfono se conecta por la red local o por túnel | Es el único sitio donde se ve `SPOTIFY_REDIRECT_RESOLVED` con su valor, porque el `warn` solo existe en desarrollo (NFR9.7) |
| **Expo Go** (teléfono Android) | Runtime del cliente | Cliente de Expo instalado a mano en el dispositivo | Debe traer los tres módulos del SDK 57; si Metro avisara de un módulo ausente, la unidad no se cierra (NFR7.7) |
| **`expo-secure-store`** (dispositivo) | Almacenamiento seguro del sistema operativo | **Dos claves, dos dueños**: `melodify.session` (`authorId` y `startedAt`, de U1) y **`melodify.spotify.token`** (`accessToken`, `refreshToken`, `expiresAt`, `obtainedAt`) | La segunda es nueva y la escribe solo `packages/spotify/src/auth/device.ts`; se borra entera al desconectar, al fallar la renovación y ante un `401` (NFR3.18, NFR4.9) |
| **`accounts.spotify.com`** (C9) | Servicio de autorización de terceros | `GET /authorize` con `code_challenge_method=S256` y `state`; `POST /api/token` con `application/x-www-form-urlencoded` y **sin** `Authorization` ni `client_secret`; 10 s de tiempo límite | Única llamada sin `Bearer`; el intercambio sale por la misma puerta HTTP que el catálogo (TS-34, NFR3.17) |
| **`api.spotify.com`** (C10) | Catálogo de terceros | `GET /v1/search` (`type=track,album,artist`, `limit=10`), `GET /v1/tracks/{id}` y `GET /v1/albums/{id}`; `Authorization: Bearer`; 10 s; **sin reintento automático** | Solo lectura del catálogo público y solo con sesión: sin token no hay petición (NFR8.14, NFR8.12) |
| **CDN de imágenes de Spotify** | Origen de las portadas | La `coverUrl` que devuelve la API se pasa a `Image` como fuente | No se construye ninguna URL de imagen en el cliente ni se aprovisiona caché: es un dato de la respuesta (NFR3.20) |
| **Registro del dispositivo** | Sumidero de diagnóstico | Consola del teléfono, visible en Metro; **catorce códigos** desde esta unidad | Efímero y sin agregación; U4 añade seis códigos y ningún destino remoto (`monitoring-design.md`) |

## Infraestructura compartida

**No hay recursos compartidos que provisionar.** Las ocho unidades —la octava es `@melodify/spotify`—
siguen siendo paquetes del mismo monorepo y el mismo binario de Expo Go: lo que comparten es el árbol
de código, el `package-lock.json` y la tubería de CI, no un recurso con dueño y consumidores.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| — | — | — | No existe ninguno: cada unidad es un paquete; el único punto común es el repositorio y su CI |

**Lo que U4 sí comparte, y no es infraestructura.** Esta unidad estrena estado que varias pantallas y
dos paquetes leen a la vez, y es el sitio donde confundirlo con un recurso aprovisionable haría más
daño: dos instancias de `auth` serían dos tokens y dos verdades. Todo vive en el proceso del teléfono
y muere al recargar, salvo la clave del llavero.

| Lo compartido | Cuántas instancias | Quién lo crea | Si se duplicara |
|---|---|---|---|
| **`spotifyAuth`** | **Una** | `app/src/bootstrap/ports.ts` | Dos estados de sesión: el chip de Inicio diría «Conectado» y la tarjeta de Perfil «Conectar», y un `disconnect()` no borraría el token del otro (TS-35, NFR1.12) |
| **`spotifyCatalog`** (los dos puertos) | **Uno** | `app/src/bootstrap/ports.ts`, **después** de `auth` | Una segunda puerta HTTP con su propio tiempo límite, contra la «una sola puerta» de NFR3.20 y NFR8.12 |
| **`Catalog` (C5)** con su caché y su registro | **Uno** | `app/src/bootstrap/instances.ts` | Dos cachés de búsqueda y dos registros de obras: la misma consulta pedida dos veces (TS-36) |
| **Token de Spotify** | **Uno** | `auth`, en el llavero | Una copia en memoria de módulo, en una prop o en un log dejaría de ser una credencial (NFR3.18) |
| **Redirect resuelto** | **Uno** | `auth`, al construirse | Resolverlo dos veces (autorización e intercambio) rompería el canje cuando cambie la IP de la red local (BR16.2) |
| `contentStore` y `commentsController` | Una cada uno | `bootstrap/instances.ts` y `bootstrap/comments.ts` | Lo mismo que en U2 y U3: U4 no los toca (TS-18, TS-27) |

## Lo que U4 mueve

La tabla que un revisor de infraestructura pide primero en la unidad que estrena dependencias: qué
archivo de plataforma cambia y cuál no.

| Artefacto | Estado en U4 | Por qué |
|---|---|---|
| `.github/workflows/ci.yml` | **No cambia** | Los siete pasos siguen siendo `commitlint`, `npm ci`, `typecheck`, `lint`, `test` y el título del PR. Lo que cambia es lo que juzgan (`cicd-pipeline.md`) |
| `package-lock.json` | **Cambia** | Tres dependencias nuevas y cuatro declaraciones de versión. Es el primer movimiento del lockfile desde U2; `npm ci` lo exige cuadrado |
| `package.json` (raíz) | **No cambia** | `workspaces` ya incluye `packages/*`; el paquete nuevo entra sin tocar la raíz (TS-31) |
| `app/package.json` y tres `package.json` de paquete | **Cambian** | `app` sube C1 a 1.4.0, C2 a 1.4.0 y C5 a 1.2.0 y añade `@melodify/spotify` 1.0.0; `app-shell` sube su C1; y los `version` de `design-system`, `app-shell` y `catalog` cambian. Sin ellas, las versiones que la unidad publica no las consume nadie |
| `tsconfig.json` (raíz) y `app/tsconfig.json` | **Cambian** | `{ "path": "./packages/spotify" }` en la raíz y `{ "path": "../packages/spotify" }` en la app: sin la segunda, `tsc -b` mete los fuentes del paquete en el proyecto de la app y `npm run typecheck` falla (TS-31) |
| `jest.config.js` | **Cambia** | Tres `moduleNameMapper` y **una entrada de `coverageThreshold`** (`./packages/spotify/src/**`, 80 %). `testMatch` y `collectCoverageFrom` no se tocan: `packages/*/src/**` ya cubre un paquete nuevo (NFR5.10) |
| `eslint.config.js` | **Cambia** | Un archivo autorizado más para los tres módulos de dispositivo y dos prohibiciones nuevas. Es la compuerta que hace comprobable la frontera del token (NFR3.18, TS-31) |
| `.env.example` | **Cambia** | Gana `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` (ya estaba documentada desde U2) y **`EXPO_PUBLIC_SPOTIFY_REDIRECT_URI`**; solo nombres, ningún valor |
| `metro.config.js` | **No se crea**, salvo que haga falta | El valor por defecto de Expo SDK 57 resuelve el mapa `exports`. Si Metro no lo resolviera, se añade `unstable_enablePackageExports`; **no** se parte el paquete en dos (TS-31) |
| `jest.setup.js` | **No cambia** | No gana un mock global de `fetch`: escondería una llamada real y convertiría el suelo de cobertura en una ilusión (TS-37, NFR5.11) |

## Qué queda escrito en el teléfono

La pregunta que un revisor de infraestructura hace primero cuando entra una credencial:

| Dato | Dónde vive | Lo crea | Lo borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | `expo-secure-store`, clave `melodify.session` | U1 | «Cerrar sesión» |
| **Token de Spotify** (par + caducidad + obtención) | `expo-secure-store`, clave `melodify.spotify.token` | **U4** (`auth`) | Desconectar, renovación fallida (también la del arranque) y un `401` |
| Opiniones, autores, me gusta, comentarios y seguimientos | Memoria del proceso (C4) | U2/U3 | Recargar la app |
| Caché de búsquedas y registro de obras | Memoria del proceso (C5) | U2; U4 la alimenta | Recargar la app |
| Estado de la conexión y de la red | Memoria del proceso | U4 | Recargar la app |
| Verificador, `state` y `code` | Memoria de la llamada a `connect()` | U4 | Terminar el intercambio, coincida o no |
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` | Entorno de compilación, incrustadas en el bundle | U4 (`.env`) | No aplica: no son secretos y no se guardan en el llavero |

**La fila que importa es la del token.** U4 añade exactamente una fila persistida, está donde
`project.md` § Mandated manda y se borra en tres caminos declarados. Si alguien propusiera guardar
también la caché de búsquedas «para no repetir peticiones», esta tabla y RC-03 dejarían de ser
ciertas: la decisión tendría que tomarla una etapa, no un PR.

## Enmienda del 2026-11-24 — `limit` de C10

Spotify acotó `limit` de `/search` a **0–10 por tipo**; el `20` de esta especificación devolvía `400` y ninguna búsqueda llegaba a ejecutarse. La fila de `api.spotify.com` y el dimensionamiento quedan en **10 por clase** (hasta treinta filas, no sesenta), sin paginación. No cambia ningún recurso de infraestructura: la superficie sigue siendo un host fijo y el CDN de portadas.

## Assumptions & Open Questions

- `[assumption]` Las tres dependencias nuevas se resuelven desde el registro público de npm y `npm ci`
  en Actions instala sin credenciales, sin registro privado y sin `postinstall` que necesite red más
  allá del propio registro. Es la primera vez que el lockfile se mueve desde U2 y por eso se declara
  aquí y no se da por hecho.
- `[assumption]` GitHub Actions sigue disponible en el plan gratuito del repositorio: la suite crece
  con un árbol más y un paquete más que instalar, pero el runner sigue siendo `ubuntu-latest` sin
  servicios ni contenedores.
- **Pregunta abierta heredada del diseño de NFR (R-07)**: la ventana neutra del arranque —sin chip,
  sin tarjeta y sin buscador antes de la primera emisión— todavía no tiene sitio en la superficie que
  C2 y C7 contratan. No cambia nada de esta etapa (no hay recurso que provisionar ni paso que añadir),
  pero sí afecta a qué pinta la app durante los primeros milisegundos, y por eso se nombra.
- **Pregunta abierta heredada del diseño de NFR (R-06)**: la regla de borrado del token debe quedar
  igual en el requisito de origen, en el diseño y en `x-token-storage.cleared_on`. Este documento usa
  la del diseño —desconectar, renovación fallida y `401`— porque es la que sostiene la prueba de
  «lectura fallida sin borrado».
- **Pregunta abierta heredada del diseño de NFR (R-08)**: el cliente HTTP compartido vive hoy en
  `packages/spotify/src/catalog/` y `auth` lo necesita para el intercambio. Esta etapa no decide la
  ruta —no es infraestructura—, pero sí afirma que **hay una sola puerta HTTP** y ninguna segunda
  copia: el tiempo límite y el mapeo de resultados son los mismos para el intercambio y para el
  catálogo.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe, el lockfile vive en la raíz, y
  `Ratetify/package.json` es de otro proyecto—, así que resuelve `.` y funciona. U4 no lo toca: es un
  cambio de tubería ajeno a esta unidad.

## Sources

- `performance-design.md` § NFR8.12–8.15 y § Presupuesto — una sola puerta HTTP de 10 s sin reintento,
  el arranque que no espera al token, una petición por consulta y por obra, y los únicos números de la
  unidad.
- `security-design.md` § NFR3.17–3.20, § NFR4.9–4.10 y § NFR9.7 — PKCE S256 sin secreto, la frontera
  del token, el inventario de lo que cruza el borde, los seis códigos y los tres caminos de borrado.
- `logical-components.md` § Inventario (LC-12 a LC-16), § Dependencias, § Recursos compartidos y
  § Superficie, cobertura y compatibilidad — las cinco áreas nuevas con fallo propio, las instancias
  únicas y NFR5.10, NFR5.11, NFR6.9 y NFR7.7.
- `nfr-requirements/tech-stack-decisions.md` § TS-31 a TS-38 — las tres entradas del paquete, el mapa
  `exports`, los cinco adaptadores inyectables, el cliente único, la caché en C5, los dobles de prueba
  y el `SpotifyLogPort`; y la lista cerrada de archivos que hay que tocar fuera del paquete.
- `inception/domain-design/components.md` — dependencias externas: `expo-secure-store`,
  `expo-web-browser`, `expo-crypto`, `expo-auth-session`, el estado de red y las dos APIs de Spotify.
- `functional-spec.md` — F21–F27, las máquinas de conexión y de Explorar, y los textos exactos.
- `inception/contract-design/contract-summary.md` — C1 1.4.0, C2 1.4.0, C5 1.2.0, C7 1.0.0 (con
  `x-pkce`, `x-token-storage` y `x-token-lifecycle`), C9 y C10.
- `team.md` § Deployment y § Way of Working — no hay entornos, no hay despliegue, el rollback es del
  repositorio y todo entra por PR con CI en verde.
- `project.md` § Forbidden y § Mandated — sin client secret, sin backend, sin persistencia del
  contenido, y el token en el almacenamiento seguro.
