# Monitoring de `u3-create-react`

> U3 no añade plataforma que observar, así que este documento sigue siendo corto a propósito. Lo que
> sí añade es la **primera señal con datos de una persona**: hasta U2 todo lo que se registraba era de
> ejemplo; a partir de esta unidad el logger convive con texto que alguien escribió. Eso no crea
> telemetría nueva —lo prohíben NFR9.1 y NFR9.5—, pero cambia la consecuencia de un descuido, y por
> eso la parte de «qué **no** se registra» es la que más pesa aquí.

## Métricas y KPI

Lo que produce señal en esta unidad es la tubería y el recorrido en el teléfono; ninguno de los dos es
telemetría del producto.

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Estado de los jobs `commit-lint` y `code-quality` | GitHub Actions | **Verde obligatorio** para mergear en `develop` y para entregar a `main` | Es la única puerta automática que tiene el proyecto (NFR5.8, `team.md` § Way of Working) |
| Cobertura de líneas **por árbol** | `npm test` (el script de la raíz es `jest --coverage`), en el job `code-quality` | **≥ 80 %** en los cuatro árboles que U3 toca: `app/src/**`, `packages/design-system/src/**`, `packages/app-shell/src/**` y `packages/content-store/src/**` | Ocho piezas, tres hooks y un controlador nuevos no pueden colarse por el total del monorepo (NFR5.8, NFR5.9) |
| Errores de `typecheck` | `npm run typecheck` (`tsc -b`) | **Cero**, con `strict: true` | Las versiones nuevas de C1 (1.3.0), C2 (1.3.0) y C4 (1.2.0) tienen que cuadrar con las tres pantallas que las consumen (NFR5.5) |
| Avisos del linter | `npm run lint` | **Cero**, incluidas las dos prohibiciones nuevas de C1/C2 hacia C4 | Es la compuerta que hace comprobable TS-28: el tope llega como prop, no como importación |
| Violaciones de Conventional Commits | `commit-lint` y el título del PR | **Cero** | El historial de `main` es la historia de lo entregado (`team.md`) |
| Registro de la app (`warn`/`error`) | Consola del teléfono, vía Metro | **Sin umbral**: se lee cuando algo se investiga | Diagnóstico manual: los tres códigos de U2 más `SEARCH_PORT_UNAVAILABLE`, el único que añade U3 (NFR9.6) |
| Recorrido de la unidad | Persona, en el teléfono | Publicar, editar, me gusta, comentar, seguir y dejar de seguir; sin Spotify y con Spotify | Es el criterio de terminado (CT-05, `team.md` § Deployment): el CI no puede ver el teclado ni el velo |

## Alertas

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Check rojo en el PR | Cualquiera de los dos jobs falla | Bloqueante para el merge | Autor del PR, en la página del PR |
| `develop` roto | Un push a `develop` deja el job en rojo | Bloqueante para el siguiente PR | Quien tenga el siguiente cambio: se arregla o se revierte antes de seguir |
| Fallo del puerto de búsqueda en el teléfono | Aparece un `warn` de `SEARCH_PORT_UNAVAILABLE` en la consola | Informativo | Quien esté recorriendo la app, en el momento |

**`SEARCH_PORT_UNAVAILABLE` no es una alerta en U3, y conviene decirlo.** El buscador **ni se monta**
porque los tres puertos siguen en `null` (BR13.5), así que el código solo se dispara en la prueba de
unidad del hook, con un puerto que falta o que lanza. En el teléfono no se verá hasta U4. Se declara
ahora porque el vocabulario del logger se amplía en esta unidad, no porque haya algo que vigilar.

**No hay alertas con guardia, ni paginación, ni escalado.** Un aviso que exige a alguien despierto
sería mentira: no hay servicio en producción ni personas de guardia. La alerta real es un check rojo,
y su destinatario es quien abrió el PR.

## SLI / SLO

**No se definen.** Un SLI mide un servicio en funcionamiento —disponibilidad, latencia, tasa de
error— y aquí no hay servicio que medir: la app se ejecuta cuando alguien la abre y el catálogo y las
opiniones viven en memoria. Lo más cercano a un objetivo de fiabilidad es el recorrido en el teléfono,
que se comprueba a mano y no se mide en porcentaje. Fijar aquí un «99,9 %» sería copiar una cifra de
otro proyecto.

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | No aplica: no hay servicio desplegado (Q5 A) |

## Logs y trazas

| Pieza | Qué hace | Dónde se ve | Qué **no** hace |
|---|---|---|---|
| `app/src/bootstrap/logger.ts` (LC-5) | Escribe `(code, message)` en la consola del runtime | Terminal de Metro y consola del teléfono | No envía nada a la red; no agrega; no persiste |
| Códigos | Los cuatro de sesión (`SessionLogCode`, de C3), `CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE` (U2) y **`SEARCH_PORT_UNAVAILABLE`** (U3) | Igual | No se reabre `SessionLogCode` ni se añade un segundo logger (NFR9.1) |
| Niveles | `warn` para lo que se degrada (`NETWORK_STATE_UNAVAILABLE`, `SEARCH_PORT_UNAVAILABLE`), `error` para el defecto interno (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`) | Igual | No hay `info`/`debug` de producto |
| Contenido del mensaje | Texto fijo y, como mucho, el identificador de la operación | Igual | **Nunca** el texto de una opinión ni de un comentario, el borrador, el `viewerId` completo ni el título de la obra (NFR4.6, NFR4.8) |
| Trazas distribuidas | No existen | — | No hay dos servicios que correlacionar |

**La firma cerrada a dos cadenas (`code`, `message`) es lo que sostiene todo lo anterior.** No hay
sobrecarga que acepte un objeto, así que nadie puede «pasar el registro por si acaso» y arrastrar el
texto que la persona acaba de escribir. U3 no la cambia; lo que cambia es que ahora el dato existe.

**Qué no llega al logger, y es la lista que importa en esta unidad** (NFR9.6):

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| Error al publicar o al guardar | Sí, con «Reintentar» | **No**: C4 devuelve un resultado esperado |
| Error al cargar la edición (`404`) | Sí, con «Reintentar» | **No**: es un estado previsto del contrato |
| Error al cargar o enviar un comentario | Sí, con «Reintentar» | **No**: resultado esperado, y `failed: true` conserva el texto |
| Seguimiento correcto | Sí, «Ahora sigues a @ana» | **No**: el `handle` ya está a la vista en la tarjeta |
| Búsqueda fallida | Sí, con «Reintentar» | **Sí**, solo si el puerto falta o la consulta falla por un defecto interno; un `offline` previsto no se registra |
| Sin conexión en Crear | Sí, aviso informativo | **No**: es un estado, no un fallo |

**Rotación, retención y agregación: ninguna.** El registro vive en la memoria del proceso que pinta la
consola y desaparece al cerrar la app; eso basta para diagnosticar un fallo que se acaba de reproducir
y es, además, lo que evita que el texto de una opinión termine en un fichero.

## Paneles

No hay paneles. El panel útil hoy es la pestaña **Actions** del repositorio, que ya existe y no se
configura aquí: un vistazo por PR dice si el cambio entra o no.

## Si el proyecto creciera

No se deja preparado ningún punto de enganche, porque un punto de enganche sin uso es deuda con
interés: cuando exista una razón —publicación en tienda, backend, usuarios reales—, esta etapa se
reabre y se decide con datos. Lo que sí queda escrito es la condición, y U3 la vuelve más estricta:
un servicio de errores o de analítica **no** puede llevarse el contenido de las opiniones ni de los
comentarios (NFR4.8), ni datos del dispositivo más allá de lo que la persona consienta, ni el texto
del borrador que nunca llegó a publicarse (NFR3.16).

## Assumptions & Open Questions

- `[assumption]` La consola de Metro sigue siendo accesible durante el recorrido en el teléfono; si no
  lo fuera, el diagnóstico se haría con la app en modo desarrollo y `adb logcat`, sin cambiar el
  diseño.
- **Pregunta abierta para U4**: cuando el buscador se monte de verdad, `SEARCH_PORT_UNAVAILABLE`
  pasará de la prueba de unidad a la consola del teléfono. Si aparece un patrón que exija medir —por
  ejemplo, búsquedas que fallan siempre por el mismo motivo—, se decide entonces y con un motivo, no
  ahora: U3 no deja un panel ni un contador preparado.

## Sources

- `security-design.md` § NFR9.6 / NFR9.1 / NFR9.5 y § NFR4.6 / NFR4.8 — el catálogo de eventos, el
  único código nuevo y qué no puede llevarse el registro.
- `security-requirements.md` § NFR9.6 — la condición acotada de `SEARCH_PORT_UNAVAILABLE`.
- `performance-design.md` § NFR8.10 y § Presupuesto — el aviso de cuatro segundos y por qué el resto
  del recorrido se juzga sin número y en el teléfono.
- `logical-components.md` — LC-5 (diagnóstico), LC-10 y LC-11 (las dos áreas nuevas con fallo propio)
  y su frontera con el resto.
- `jest.config.js` — los siete umbrales a 80 que el paso de pruebas ya evalúa.
- `inception/domain-design/components.md` — no hay componente con servidor que observar.
- `inception/contract-design/contract-summary.md` — C1 1.3.0, C2 1.3.0 y C4 1.2.0 en el proceso del
  cliente, sin servicio remoto.
- Answers file: `infrastructure-design-questions.md` (Q5 A).
