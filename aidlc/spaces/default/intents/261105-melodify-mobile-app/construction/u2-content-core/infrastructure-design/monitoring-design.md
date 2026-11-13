# Monitoring de `u2-content-core`

> No hay plataforma que observar, así que este documento es corto a propósito: dice qué señal
> existe, quién la mira y qué **no** se va a montar. Montar un APM para una app que corre en un
> teléfono prestado, sin backend, sería el tipo de infraestructura que se paga y no se usa.

## Métricas y KPI

Lo que produce señal en esta unidad es la tubería y el recorrido en el teléfono; ninguno de los
dos es telemetría del producto.

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Estado de los jobs `commit-lint` y `code-quality` | GitHub Actions | **Verde obligatorio** para mergear en `develop` y para entregar a `main` | Es la única puerta automática que tiene el proyecto (NFR5.6, `team.md` § Way of Working) |
| Cobertura de líneas **por árbol** | `npm test` (el script de la raíz es `jest --coverage`), en el job `code-quality` | **≥ 80 %** en `app/src/**` y en cada `packages/*/src/**` | Un árbol nuevo sin pruebas no puede colarse por el total del monorepo (NFR5.6) |
| Errores de `typecheck` | `npm run typecheck` | **Cero**, con `strict: true` | Un tipo roto en un paquete nuevo rompe a la app que lo importa (NFR5.5) |
| Avisos del linter | `npm run lint` | **Cero**, incluidas las dos reglas de importación de NFR3.11 que añade esta unidad | Es la compuerta que hace comprobable NFR3.11 y el único import de `expo-network` |
| Violaciones de Conventional Commits | `commit-lint` | **Cero** | El historial de `main` es la historia de lo entregado (`team.md`) |
| Registro de la app (`warn`/`error`) | Consola del teléfono, vía Metro | **Sin umbral**: se lee cuando algo se investiga | Diagnóstico manual: `CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE` (NFR9.4) |
| Recorrido de las pantallas | Persona, en el teléfono | Las seis pantallas, sin Spotify y con Spotify | Es el criterio de terminado de la versión (CT-05, `team.md` § Deployment) |

## Alertas

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Check rojo en el PR | Cualquiera de los dos jobs falla | Bloqueante para el merge | Autor del PR, en la página del PR |
| `develop` roto | Un push a `develop` deja el job en rojo | Bloqueante para el siguiente PR | Quien tenga el siguiente cambio: se arregla o se revierte antes de seguir |
| Fallo de lectura o de suscripción en el teléfono | Aparece un `error` de los tres códigos en la consola | Informativo | Quien esté recorriendo la app, en el momento |

**No hay alertas con guardia, ni paginación, ni escalado.** Un aviso que exige a alguien
despierto sería mentira: no hay servicio en producción ni personas de guardia. La alerta real es
un check rojo, y su destinatario es quien abrió el PR.

## SLI / SLO

**No se definen.** Un SLI mide un servicio en funcionamiento —disponibilidad, latencia, tasa de
error— y aquí no hay servicio que medir: la app se ejecuta cuando alguien la abre y el catálogo
vive en memoria. Lo más cercano a un objetivo de fiabilidad es el recorrido en el teléfono, que
se comprueba a mano y no se mide en porcentaje. Fijar aquí un «99,9 %» sería copiar una cifra
de otro proyecto.

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | No aplica: no hay servicio desplegado (Q5 A) |

## Logs y trazas

| Pieza | Qué hace | Dónde se ve | Qué **no** hace |
|---|---|---|---|
| `app/src/bootstrap/logger.ts` (LC-5) | Escribe `(code, message)` en la consola del runtime | Terminal de Metro y consola del teléfono | No envía nada a la red; no agrega; no persiste |
| Niveles | `warn` para lo que se degrada (`NETWORK_STATE_UNAVAILABLE`), `error` para el defecto interno (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`) | Igual | No hay `info`/`debug` de producto |
| Contenido del mensaje | Texto fijo y el identificador de la operación | Igual | **Nunca** el texto de una opinión, un autor ni un token (NFR4.6) |
| Trazas distribuidas | No existen | — | No hay dos servicios que correlacionar |

**Rotación, retención y agregación: ninguna.** El registro vive en la memoria del proceso que
pinta la consola y desaparece al cerrar la app; eso es suficiente para diagnosticar un fallo que
se acaba de reproducir y es, además, lo que evita que el contenido de una opinión termine en un
fichero.

## Paneles

No hay paneles. El panel útil hoy es la pestaña **Actions** del repositorio, que ya existe y no
se configura aquí: un vistazo por PR dice si el cambio entra o no.

## Si el proyecto creciera

No se deja preparado ningún punto de enganche, porque un punto de enganche sin uso es deuda con
interés: cuando exista una razón —publicación en tienda, backend, usuarios reales—, esta etapa
se reabre y se decide con datos. Lo que sí queda escrito es la condición: un servicio de errores
o de analítica **no** puede llevarse el contenido de las opiniones (NFR4.6) ni datos del
dispositivo más allá de lo que el usuario consienta (NFR4.5).

## Assumptions & Open Questions

- `[assumption]` La consola de Metro sigue siendo accesible durante el recorrido en el teléfono;
  si no lo fuera, el diagnóstico se haría con la app en modo desarrollo y `adb logcat`, sin
  cambiar el diseño.
- **Pregunta abierta para U4**: cuando la app llame a Spotify, `NETWORK_STATE_UNAVAILABLE` y los
  fallos de búsqueda seguirán siendo registro local; si apareciera un patrón que exija medir,
  se decide entonces y con un motivo, no ahora.

## Sources

- `security-design.md` § NFR9.4 / NFR9.1 / NFR9.5 — qué se registra, qué no y por qué no hay
  telemetría nueva.
- `security-requirements.md` § NFR9.4, § NFR9.5 — los tres códigos y la prohibición de métricas
  de producto.
- `performance-design.md` § NFR8.6 — por qué el resto del recorrido se juzga sin número y en el
  teléfono.
- `logical-components.md` — LC-5 (diagnóstico) y su frontera con el resto.
- `inception/domain-design/components.md` — no hay componente con servidor que observar.
- `functional-spec.md` — las seis pantallas que se recorren.
- `inception/contract-design/contract-summary.md` — C4/C5 en memoria, sin servicio remoto.
- Answers file: `infrastructure-design-questions.md` (Q5 A).
