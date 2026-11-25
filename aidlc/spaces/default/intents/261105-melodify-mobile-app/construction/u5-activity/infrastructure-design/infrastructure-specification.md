# Infraestructura de `u5-activity`

> U5 no provisiona nada, igual que las cuatro unidades anteriores, y sin embargo **mueve más
> configuración de plataforma que U3**: nace un paquete más —el octavo; el «noveno árbol» de TS-39
> cuenta también `app/`—, tres `tsconfig` cambian o nacen, `jest.config.js` gana un umbral y
> `eslint.config.js` gana un bloque que no existía en el repositorio —una regla que prohíbe `fetch` y
> `react` dentro de un paquete—. Ninguna de esas cosas es un recurso que aprovisionar, y por eso este
> documento existe: escribe el borde de un paquete que **solo lee**, para que «no hay infraestructura»
> no se lea como «no hay nada que declarar».

## Qué decide esta etapa

`team.md` § Deployment no ha cambiado desde U1: en esta versión no hay entornos, no hay backend y
«desplegar» significa abrir la app en el teléfono con Metro levantado. U5 trabaja en modo
**ARTIFACT-ONLY** sobre lo que el diseño de NFR ya decidió, y su novedad no es de red sino de
**frontera de código**: es la primera unidad que crea un paquete cuya garantía principal es una regla
de lint.

| No se diseña | Por qué |
|---|---|
| Clúster, contenedores o funciones | No hay nada que ejecutar en un servidor: no hay backend (RC-02, `project.md` § Forbidden) |
| Base de datos, caché, cola o búsqueda | La actividad **se deriva** en memoria del proceso (C8, ADR-006); no hay registro de eventos que almacenar |
| **Salida de red nueva** | U5 no añade ni un host: la pantalla no tiene `fetch`, ni cliente HTTP, ni URL (NFR3.21, BR21.6) |
| CDN, DNS, balanceador o VPC | No hay ingress porque ninguna app de Expo Go escucha conexiones, y U5 no sirve ni consume imágenes |
| Entornos staging/producción | `team.md` § Deployment: no existen; el rollback es el del repositorio |
| Persistencia de la actividad | `project.md` § Forbidden y ADR-006: derivar en lugar de guardar es una decisión de privacidad, no solo de arquitectura (NFR4.11) |
| APM, agregación de logs, alertas, SLIs | No hay servicio que observar; lo único que hay es el logger del dispositivo (`monitoring-design.md`) |
| EAS Build, EAS Update, firma, tiendas | No hay módulo nativo nuevo: `SectionList` es del núcleo de React Native (NFR7.8) |
| Un servicio de terceros nuevo | U5 no consume Spotify: el paquete tiene prohibido importarlo, y la pantalla tampoco lo toca (BR21.6) |
| Un `metro.config.js` | Las exportaciones del paquete nuevo son las de siempre: una entrada y ningún subcamino |

## Despliegue

| Facet | Choice | Rationale |
|---|---|---|
| **Modelo de cómputo** | Ninguno propio: el código corre en el teléfono dentro de **Expo Go**; el ordenador solo ejecuta **Metro** | No hay servidor que alojar. U5 añade lógica pura, que ni siquiera necesita un módulo del SDK (NFR7.8) |
| **Red e ingress** | Sin ingress, sin VPC, sin subredes. **Sin salida nueva**: U5 no añade ningún host a los de U4 | La pantalla se alimenta de C4, que es memoria del proceso. La salida a `accounts.spotify.com` y `api.spotify.com` sigue existiendo para otras pantallas y U5 no la toca (NFR3.21) |
| **Almacenamiento** | Nada provisionado y **ninguna fila nueva**: `expo-secure-store` sigue con **dos** claves, `melodify.session` (U1) y `melodify.spotify.token` (U4) | La actividad derivada vive en memoria y muere al recargar. Añadir una tercera clave sería persistir contenido, que `project.md` § Forbidden prohíbe (NFR4.11) |
| **Entornos** | Uno: el teléfono con Metro. Sin staging ni producción | `team.md` § Deployment; dos entornos sin backend solo añadirían configuración que nadie usa |
| **Infraestructura como código** | Ninguna. Los artefactos de automatización son **configuración de repositorio**: `.github/workflows/ci.yml` (no cambia), `tsconfig.json`, `app/tsconfig.json`, `jest.config.js`, `eslint.config.js` y los `package.json` | No hay recursos que declarar. Lo que se valida es la configuración, y su detalle está en `cicd-pipeline.md` |
| **Dimensionamiento** | No aplica: no hay servidor que dimensionar. El presupuesto real es el de NFR8 (un fotograma de carga, cuatro lecturas de C4, cero trabajo al arrancar) | Sin recurso remoto no hay CPU ni memoria que aprovisionar; el límite es el teléfono y ya está presupuestado en `performance-design.md` |
| **Dependencias** | **Ninguna nueva de terceros.** El paquete declara solo dos dependencias internas, `@melodify/app-session` y `@melodify/content-store`, y las importa con `import type` | No se ejecuta `npx expo install` en esta unidad. El lockfile se mueve **solo** por las versiones de los paquetes internos (TS-39, NFR7.8) |
| **Servicios de terceros** | Ninguno nuevo. Los dos hosts de Spotify siguen siendo de U4 y **U5 no los usa** | Un paquete de solo lectura sobre memoria no necesita red; el linter lo impone (NFR3.21) |

## Servicios de infraestructura

| Service | Role | Configuration | Notes |
|---|---|---|---|
| **GitHub Actions** (`ubuntu-latest`) | Ejecutor de la tubería de validación | Dos jobs, `commit-lint` y `code-quality`; Node 22 con caché de `npm`; permisos `contents: read` y `pull-requests: read`; **el YAML no cambia** | No publica artefactos ni despliega nada. Lo que cambia es lo que los mismos pasos juzgan: un árbol más con umbral y un bloque de lint más (`cicd-pipeline.md`) |
| **Metro** (ordenador de desarrollo) | Servidor de desarrollo del bundle | `npx expo start`; el teléfono se conecta por la red local o por túnel | Es donde se lee la consola del dispositivo, el único sitio donde aparece `ACTIVITY_LOAD_FAILED` (NFR9.8) |
| **Expo Go** (teléfono Android) | Runtime del cliente | Cliente de Expo instalado a mano en el dispositivo | U5 no añade módulos del SDK: lo único nuevo es `SectionList`, que ya viaja en React Native (NFR7.8) |
| **`expo-secure-store`** (dispositivo) | Almacenamiento seguro del sistema operativo | **Dos claves, dos dueños** y **ninguna nueva**: `melodify.session` (U1) y `melodify.spotify.token` (U4) | U5 no nombra el almacén ni el token; no hay un tercer adaptador ni una tercera clave (NFR3.18) |
| **Memoria del proceso (C8)** | Almacén de la actividad derivada | Una instancia, construida en `app/src/bootstrap/instances.ts`; deriva al observar y no guarda eventos | No es un servicio: es estado en RAM, sin persistencia, sin caché en disco y sin TTL (ADR-006, NFR8.17) |
| **`accounts.spotify.com`** y **`api.spotify.com`** (C9, C10) | Servicios de terceros **heredados** | Sin cambios desde U4 | **U5 no los usa**: el paquete tiene prohibido importar `@melodify/spotify` y no hay `fetch` en su código (NFR3.21, BR21.6) |
| **Registro del dispositivo** | Sumidero de diagnóstico | Consola del teléfono, visible en Metro; **quince códigos** desde esta unidad | Efímero y sin agregación; U5 añade un código y ningún destino remoto (`monitoring-design.md`) |

## Infraestructura compartida

**No hay recursos compartidos que provisionar.** Los ocho paquetes siguen siendo carpetas del mismo
monorepo y el mismo binario de Expo Go: lo que comparten es el árbol de código, el `package-lock.json`
y la tubería de CI, no un recurso con dueño y consumidores.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| — | — | — | No existe ninguno: cada unidad es un paquete; el único punto común es el repositorio y su CI |

**Lo que U5 sí comparte, y no es infraestructura.** La actividad es la primera pieza de la app que
**lee** estado que otras pantallas **escriben**, y es donde confundirla con un recurso aprovisionable
haría más daño: dos instancias derivarían dos veces la misma sesión y abrirían dos suscripciones a C4,
con dos listas que podrían discrepar un fotograma. Todo vive en el proceso del teléfono y muere al
recargar.

| Lo compartido | Cuántas instancias | Quién lo crea | Si se duplicara |
|---|---|---|---|
| **`activity`** (C8) | **Una** | `app/src/bootstrap/instances.ts`, tras `contentStore` | Dos derivaciones de la misma sesión y dos suscripciones a C4: la lista de una pestaña podría ir un fotograma por detrás de otra (BR24.3) |
| **`contentStore`** (C4) | **Una** | `app/src/bootstrap/instances.ts` | Lo mismo que en U2–U4: dos revisiones del mismo contenido. U5 no lo toca, solo lo lee (TS-18) |
| **Sesión** (C3) | **Una** | `app/src/bootstrap/session.ts` | Dos identidades: la Actividad de una cuenta y el Perfil de otra (TS-35, NFR1.16) |
| **Conectividad** (C6) | **Una** | `app/src/bootstrap/instances.ts` | Dos criterios de «sin conexión» y dos banners con textos distintos (BR23.4) |
| **Suscripción de C8 a C4** | **Una** | C8, en la primera observación | Dos canales vivos para el mismo dato y una baja que no cierra el otro (TS-40) |

## Lo que U5 mueve

La tabla que un revisor de infraestructura pide primero en la unidad que estrena un paquete: qué
archivo de plataforma cambia y cuál no.

| Artefacto | Estado en U5 | Por qué |
|---|---|---|
| `.github/workflows/ci.yml` | **No cambia** | Los siete pasos siguen siendo `commitlint`, `npm ci`, `typecheck`, `lint`, `test` y el título del PR. Lo que cambia es lo que juzgan (`cicd-pipeline.md`) |
| `package-lock.json` | **Cambia** | Cuatro declaraciones de versión interna y un paquete de workspace más. **Ninguna dependencia de terceros**: no hay descarga nueva desde el registro |
| `package.json` (raíz) | **No cambia** | `workspaces` ya incluye `packages/*`; el paquete nuevo entra sin tocar la raíz (TS-39) |
| `packages/activity/package.json` | **Nuevo** | `version` 1.1.0, `private: true`, `main: "src/index.ts"`, `types: "dist/index.d.ts"` y **solo** las dos dependencias internas cuyos tipos nombra. Sin `exports`, sin `react`, sin `react-native`, sin un módulo de red (NFR3.21, NFR7.8) |
| `packages/activity/tsconfig.json` | **Nuevo** | Extiende `tsconfig.base.json`, `rootDir: "./src"`, **`outDir: "./dist"`, `tsBuildInfoFile: "./dist/.tsbuildinfo"`**, `include: ["src/**/*"]` y referencias a `../app-session` y `../content-store`. Sin `outDir` —que la base no fija— la emisión cae dentro de `src/` y `app/` no ve los tipos de `dist` |
| `tsconfig.json` (raíz) | **Cambia** | `{ "path": "./packages/activity" }` en `references` |
| `app/tsconfig.json` | **Cambia** | `{ "path": "../packages/activity" }` en `references`; sin ella, `tsc -b` mete los fuentes del paquete en el proyecto de la app y `npm run typecheck` falla |
| `jest.config.js` | **Cambia** | Un `moduleNameMapper` (`^@melodify/activity$`) y **una entrada de `coverageThreshold`** (`./packages/activity/src/**`, 80 %). La entrada que U4 dejó pendiente, escrita ahora que el árbol existe (NFR5.12) |
| `eslint.config.js` | **Cambia** | Un bloque nuevo para `packages/activity/src/**`: catálogo y Spotify prohibidos, `react`/`react-native` prohibidos y `fetch` como global restringido (TS-39) |
| `app/package.json` | **Cambia** | Añade `"@melodify/activity": "1.1.0"` y sube `@melodify/design-system` a `1.5.0`; sin ellas, C1 1.5.0 y C8 no los consume nadie (TS-42) |
| `packages/design-system/package.json` | **Cambia** | `version` a **1.5.0**, por `ActivityRow`, `DayHeader` y `ActivityEventSummary` (C1 1.5.0) |
| `packages/spotify/package.json` | **Cambia** | Sube su dependencia de C1 a `1.5.0`; si no, el lockfile quedaría con dos versiones del mismo paquete interno (TS-42) |
| `packages/app-shell/package.json` | **Cambia** | Sube su dependencia de C1 a `1.5.0`. Es el mismo caso que `spotify` y el que **rompe la instalación** si se olvida: `app-shell` declara hoy C1 1.4.0 |
| `.env.example` | **No cambia** | U5 no introduce ninguna variable: no hay client ID, ni redirect, ni interruptor de función |
| `metro.config.js` | **No se crea** | El paquete no publica mapa `exports` ni añade un módulo nativo (TS-39): la resolución de workspace por `main` basta, y el valor por defecto de Expo SDK 57 la aplica |
| `jest.setup.js` | **No cambia** | Los dobles de U5 son locales a cada prueba: un doble global de C4 taparía justo la lista blanca que la prueba afirma (NFR3.21) |

## Qué queda escrito en el teléfono

La pregunta que un revisor hace primero cuando una pantalla estrena datos: **la respuesta es
«nada nuevo»**, y esa es la decisión.

| Dato | Dónde vive | Lo crea | Lo borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | `expo-secure-store`, clave `melodify.session` | U1 | «Cerrar sesión» |
| Token de Spotify (par + caducidad + obtención) | `expo-secure-store`, clave `melodify.spotify.token` | U4 | Desconectar, renovación fallida y un `401` |
| Opiniones, autores, me gusta, comentarios y seguimientos | Memoria del proceso (C4) | U2/U3 | Recargar la app |
| Caché de búsquedas y registro de obras | Memoria del proceso (C5) | U2; U4 la alimenta | Recargar la app |
| Estado de la conexión y de la red | Memoria del proceso | U4 | Recargar la app |
| **Actividad derivada (eventos y grupos)** | **Memoria del proceso (C8)** | **U5**, al observar | Recargar la app |
| **Posición de la lista y pestaña montada** | Memoria del proceso (C2) | U5, al desplazar | Recargar la app |

**La fila de la actividad es la que importa, y su valor es que no persiste.** No hay un registro de
eventos que pueda sobrevivir al cierre, así que cambiar de cuenta y volver a Actividad no arrastra
nada de la anterior: no hay nada que limpiar porque nunca se guardó (ADR-006, NFR4.11). Si alguien
propusiera «guardar la actividad para no recalcularla», esta tabla y `project.md` § Forbidden dejarían
de ser ciertas: la decisión tendría que tomarla una etapa, no un PR.

## Assumptions & Open Questions

- `[assumption]` `npm ci` en Actions resuelve el paquete nuevo como enlace de workspace: la unidad no
  añade ninguna dependencia de terceros, así que el registro de npm solo se consulta para lo que ya
  estaba en el lockfile.
- `[assumption]` `tsc -b` construye `packages/activity` antes que `app/` con las dos referencias
  declaradas; el orden lo resuelve el grafo de proyectos y no un script.
- **Pregunta abierta heredada del diseño de NFR (R-07 de U4)**: la ventana neutra del arranque sigue
  sin sitio en la superficie que C2 y C7 contratan. No cambia nada de esta etapa —no hay recurso que
  provisionar—, pero sí afecta a qué se ve antes de la primera emisión de C8, y por eso se nombra.
- `[assumption]` La agrupación usa el día natural del teléfono en hora local, no el día que calcula
  `formatCalendarDate` de C1: C8 no importa C1 (TS-42), así que la decisión no exige tocar dos paquetes.
  Las pruebas fijan reloj y zona en lugar de depender del entorno.
- **Sigue abierta la pregunta de U2 sobre el paso «Detectar directorio del proyecto»**: sus dos ramas
  no se cumplen —`app/package-lock.json` no existe, el lockfile vive en la raíz, y
  `Ratetify/package.json` es de otro proyecto—, así que resuelve `.` y funciona. U5 no lo toca.

## Sources

- `performance-design.md` § NFR8.16–8.18 y § Presupuesto — un fotograma de carga sin temporizador,
  cuatro lecturas de C4, suscripción perezosa y clave estable por evento.
- `security-design.md` § NFR3.21–3.23, § NFR4.11 y § NFR9.8 — la lista blanca de solo lectura, las
  cuatro compuertas, la ausencia de persistencia y el único código de diagnóstico.
- `logical-components.md` § Inventario (LC-17 a LC-19), § Dependencias, § Dominios de fallo y
  § Superficie, cobertura y compatibilidad — las tres piezas nuevas, las instancias únicas y NFR5.12,
  NFR6.10 y NFR7.8.
- `nfr-requirements/tech-stack-decisions.md` § TS-39 a TS-43 — la lista cerrada de archivos a tocar,
  las versiones exactas y las dos reglas de linter del paquete.
- `inception/domain-design/components.md` — dependencias externas: ninguna nueva; `SectionList` es del
  núcleo de React Native.
- `functional-spec.md` — F13–F18, la máquina de estados de la pantalla y los textos exactos.
- `inception/contract-design/contract-summary.md` — C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0 y C8 1.1.0.
- `team.md` § Deployment y § Way of Working — no hay entornos, no hay despliegue, el rollback es del
  repositorio y todo entra por PR con CI en verde.
- `project.md` § Forbidden y § Mandated — sin backend, sin persistencia del contenido, sin secretos y
  recorrido completo sin Spotify.
