# Infraestructura de `u2-content-core`

> Qué se provisiona para esta unidad, quién lo ejecuta y qué no se provisiona a propósito.
> La respuesta corta es **nada**: la app corre en un teléfono dentro de Expo Go y no hay
> backend. Este documento existe para que esa ausencia esté escrita y nadie la lea como un
> olvido.

## Qué decide esta etapa

`team.md` § Deployment lo dice sin rodeos: en esta versión no hay entornos, no hay backend y
«desplegar» significa abrir la app en el teléfono con Metro levantado. La respuesta a Q1 fue
**no se provisiona infraestructura**. Por tanto esta etapa no diseña una topología de nube:
diseña el **borde de lo que sí existe** —el ejecutor del CI, el servidor de desarrollo, el
runtime del teléfono y el almacenamiento que ya trae el dispositivo— y declara el resto como
fuera de alcance con su razón.

Lo que esta etapa **no** hace, y por qué:

| No se diseña | Por qué |
|---|---|
| Clúster, contenedores o funciones | No hay nada que ejecutar en un servidor: no hay backend (CT-02, CT-03) |
| Base de datos, caché, cola o búsqueda | El contenido vive en memoria del proceso (C4) y el catálogo se resuelve en el cliente (C5) |
| CDN, DNS propio, balanceador o VPC | El cliente habla con la Web API de Spotify directamente desde el teléfono; en U2 ni siquiera la llama |
| Entornos staging/producción | `team.md` § Deployment: no existen; el rollback es el del repositorio |
| APM, agregación de logs, alertas, SLIs | No hay servicio que observar; lo único que hay es el logger del dispositivo (Q5, `monitoring-design.md`) |
| EAS Build, EAS Update, firma, tiendas | La entrega se demuestra en Expo Go; nada se compila ni se publica (CT-05, Q3) |

## Despliegue

| Facet | Choice | Rationale |
|---|---|---|
| **Modelo de cómputo** | Ninguno propio: el código corre en el teléfono dentro de **Expo Go**; el ordenador solo ejecuta **Metro** | No hay servidor que alojar ni proceso que escalar; el runtime del cliente lo aporta Expo Go, sin compilación propia (NFR7.4, CT-05) |
| **Red e ingress** | Sin ingress, sin VPC, sin subredes. La única salida es la que ya usa el cliente: HTTPS hacia la Web API de Spotify, y en U2 ninguna | Una app de Expo Go no escucha conexiones; el sentido de la red es siempre saliente y lo decide el dispositivo (NFR4.5) |
| **Almacenamiento** | Nada provisionado. `expo-secure-store` es del dispositivo y ya se usa desde U1 con la clave `melodify.session` | La persistencia es del cliente, no de la infraestructura; U2 no añade escrituras (NFR3.6, NFR4.4) |
| **Entornos** | Uno: el teléfono con Metro. Sin staging ni producción | `team.md` § Deployment; dos entornos sin backend solo añadirían configuración que nadie usa |
| **Infraestructura como código** | Ninguna. El único artefacto de automatización es `.github/workflows/ci.yml`, que ya existe | No hay recursos que declarar; escribir Terraform para cero recursos sería ceremonia, y CDK para una app de Expo Go no tiene sustrato |
| **Dimensionamiento** | No aplica: no hay servidor que dimensionar. El presupuesto real es el de NFR8 (diez opiniones en memoria del proceso, `FlatList` para el feed) | Sin recurso remoto no hay CPU ni memoria que aprovisionar; el límite es el teléfono y ya está presupuestado en `performance-design.md` |

## Servicios de infraestructura

| Service | Role | Configuration | Notes |
|---|---|---|---|
| **GitHub Actions** (`ubuntu-latest`) | Ejecutor de la tubería de validación | Dos jobs: `commit-lint` y `code-quality`; Node 22 con caché de `npm`; permisos `contents: read` y `pull-requests: read` | No publica artefactos ni despliega nada; válida y termina (`cicd-pipeline.md`) |
| **Metro** (ordenador de desarrollo) | Servidor de desarrollo del bundle | `npx expo start`; el teléfono se conecta por la red local o por túnel | No forma parte del producto: no es infraestructura del sistema, es la herramienta con la que se recorre |
| **Expo Go** (teléfono Android) | Runtime del cliente | Cliente de Expo instalado a mano en el dispositivo | Sin build propio ni firma; es la restricción CT-05 y el criterio de terminado (NFR7.4) |
| **`expo-secure-store`** (dispositivo) | Almacenamiento seguro del sistema operativo | Una clave, `melodify.session`, con el `authorId` y el `startedAt` | Heredado de U1; U2 no añade claves (NFR4.4) |
| **Registro del dispositivo** | Sumidero de diagnóstico | Consola del teléfono, visible en Metro | Efímero y sin agregación; no es un servicio que se aprovisione (`monitoring-design.md`) |

## Infraestructura compartida

**No hay recursos compartidos que provisionar.** Las seis unidades son paquetes del mismo
monorepo y el mismo binario de Expo Go: lo que comparten es el árbol de código, el
`package-lock.json` y la tubería de CI, no un recurso con dueño y consumidores. La tabla queda
vacía a propósito y no se rellena con filas decorativas:

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| — | — | — | No existe ninguno: cada unidad es un paquete; el único punto común es el repositorio y su CI |

**Consecuencia para las unidades siguientes**: U3, U4, U5 y U6 no heredan de aquí ninguna
pieza que provisionar. U4 añadirá una dependencia (`expo-auth-session` o equivalente) y un
flujo PKCE, que son código y configuración de la app, no infraestructura; si alguna vez
apareciera un servicio real, esta etapa se reabre con su propia decisión y no se improvisa
desde un PR.

## Qué queda escrito en el teléfono

Nada nuevo, y conviene que esté aquí además de en `security-design.md` § NFR4.4, porque es la
pregunta que un revisor de infraestructura hace primero:

| Dato | Dónde vive | Lo crea | Lo borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | `expo-secure-store`, clave `melodify.session` | U1 | «Cerrar sesión» (U2 lo usa, no lo cambia) |
| Opiniones, autores, me gusta, comentarios, seguimientos | Memoria del proceso | C4 | Recargar la app |
| Obras de ejemplo y decisión de portada | Memoria del proceso | C5 | Recargar la app |
| Token de Spotify | `expo-secure-store`, clave propia | **U4**, no esta unidad | Desconectar (U4) |

## Assumptions & Open Questions

- `[assumption]` GitHub Actions sigue disponible en el plan gratuito del repositorio con los
  minutos que estos dos jobs consumen; si el plan cambiara, la tubería seguiría siendo la misma
  y solo cambiaría dónde corre.
- **Pregunta abierta para Code Generation**: `.github/workflows/ci.yml` conserva un paso
  «Detectar directorio del proyecto» con dos ramas que no se cumplen: la de
  `app/package-lock.json` (el lockfile vive en la raíz, así que `app/` no tiene el suyo) y la de
  `Ratetify/package.json`, que es de otro proyecto y no existe en este repositorio. Por eso
  resuelve `.` y funciona. Se deja como está en el diseño y se decide en el PR de U2 si se
  simplifica, para no mezclar un cambio de CI con la unidad de contenido.
- **Pregunta abierta para U4**: cuando exista el flujo de Spotify, el CI seguirá sin necesitar
  el client ID; si alguna vez un paso de build lo pidiera, entra como variable del repositorio y
  nunca como secreto, porque un cliente público de PKCE no tiene secreto.

## Sources

- `performance-design.md` y `security-design.md` — presupuesto de NFR8, inventario de lo que se
  escribe (NFR4.4) y superficie de diagnóstico (NFR9).
- `logical-components.md` — LC-1…LC-9 y qué paquete posee cada cosa; el logger es LC-5.
- `inception/domain-design/components.md` — dependencias externas: `expo-secure-store`, el
  estado de red del sistema y las dos APIs de Spotify.
- `functional-spec.md` — qué pantallas se recorren y con qué datos; § Semilla fija que no hay
  portadas remotas en U2.
- `inception/contract-design/contract-summary.md` — C4 (memoria del proceso), C5 (catálogo en el
  cliente) y C1–C3, que confirman que no hay componente con servidor.
- `team.md` § Deployment — no hay entornos, no hay despliegue, el rollback es del repositorio.
- Answers file: `infrastructure-design-questions.md` (Q1 A, Q3 A, Q5 A, Q6 A).
