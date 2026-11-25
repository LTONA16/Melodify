# Requisitos de seguridad, privacidad y diagnóstico — U5 `u5-activity`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR8.1–FR8.4, FR11.2, FR11.4, FR11.5, FR12.1, RC-02, RC-03), de `aidlc/spaces/default/memory/project.md` (§ Forbidden: backend, autenticación real, persistencia del contenido, `.env` y tokens, reproducción y publicación; § Mandated: recorrido sin Spotify, textos en español, degradar con mensaje y acción), de `aidlc/spaces/default/memory/team.md` (§ Code Style: sin `console.log` de depuración, errores en lenguaje llano y con acción; § Testing Posture), de `inception/domain-design/components.md` (§ ActivityFeed) y `inception/domain-design/decisions.md` (ADR-006, ADR-012), de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0, § Fallos, tiempos y reintentos), de `construction/u5-activity/functional-design/functional-spec.md` (§ Máquina de estados, F13–F18, § Textos exactos, § Assumptions) y de `construction/u5-activity/functional-design/rules.md` (BR21.1, BR21.4, BR21.6, BR23.3, BR23.4, BR24.1–BR24.4).
> Fecha: 2026-11-19. Etapa: NFR Requirements · Unidad: `u5-activity` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que el motor no emite por separado para una unidad de tipo `ui`:

- **NFR3 — Seguridad**: la unidad no introduce credenciales, ni red, ni escritura. Su superficie de seguridad no es «proteger un secreto» sino **no abrir ninguna puerta nueva** en una app que ya tiene el token de Spotify guardado.
- **NFR4 — Privacidad**: la Actividad es la primera pantalla que **muestra lo que otras personas hicieron** con el contenido de la cuenta. La pregunta de esta unidad no es qué se envía —nada— sino **qué se pinta de quién**.
- **NFR9 — Diagnóstico**: `observability-requirements.md` no se produce para unidades `ui`; el logger de U1, ampliado en U2, U3 y U4, sigue siendo la única superficie. Aquí se fija qué registra U5 y qué no.

**La frontera que esta unidad NO cruza** es tan importante como la que cruza U4. U4 abrió una conexión de salida y guardó una credencial. **U5 es la unidad más cerrada del proyecto**: no importa `@melodify/spotify` ni `@melodify/catalog`, no hace una petición HTTP, no escribe en C4, no persiste nada y no añade una dependencia. Todo lo que pinta ya estaba en memoria del proceso antes de que la persona abriera la pestaña.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U5 | Quién lo usa después | Secreto |
|---|---|---|---|
| `viewerId` (la cuenta de la app) | Lo recibe C8 del constructor por `session.getSession()` | Nadie más | No: es `demo`, pero identifica la cuenta |
| Opiniones propias, me gusta recibidos, comentarios recibidos | Se **leen** de C4 al derivar; no se copian ni se guardan | Nadie | No |
| `authorId` / `actorHandle` de quien dio me gusta o comentó | Viajan en `ActivityEventView.actorHandle` y en `eventId` | Nadie: **no se pintan** (BR24.2) | No, pero es dato de otra persona |
| Texto de un comentario recibido | **No entra** en el evento (BR21.4) | Nadie | — |
| Título de la obra | `OpinionView.workTitle` → `ActivityEventView.workTitle` | La fila | No |
| `opinionId` de la fila tocada | Sale de la pantalla hacia `openOpinionDetail` (C2) | La cáscara | No |
| Estado de la conexión | `useNetwork` → aviso de BR23.4 | Nadie | No |
| Mensajes de diagnóstico | `app/src/bootstrap/logger.ts` (U1, ampliado en U2, U3 y U4) | Todo el proyecto | No |
| Token de Spotify | **No aparece**: U5 no importa C7 ni C5 (BR21.6) | — | — |

## NFR3 — Seguridad

### NFR3.21 — La Actividad es de solo lectura: no escribe, no persiste y no abre ninguna conexión

| Superficie | Regla de esta unidad |
|---|---|
| Escritura en C4 | **Ninguna.** Las únicas llamadas son `listOpinions`, `listLikes`, `listComments` y `subscribeContent`; no se nombran `createOpinion`, `toggleLike`, `addComment` ni `toggleFollow` (BR21.6). Un `import` de escritura en `packages/activity/src/**` es un fallo de revisión, no un detalle de estilo. |
| Red | **Ninguna.** No hay `fetch`, ni `XMLHttpRequest`, ni un cliente HTTP, ni una URL en el paquete. La Actividad se deriva de memoria. |
| Catálogo y Spotify | **Ninguno.** Ni `@melodify/catalog` ni `@melodify/spotify` figuran en las dependencias de `@melodify/activity`; el título de la obra llega dentro de `OpinionView.workTitle` (C8 § `work_title`), así que no hay nada que resolver. |
| Persistencia | **Ninguna nueva.** `expo-secure-store` y `AsyncStorage` siguen apareciendo solo en los dos adaptadores autorizados (NFR3.18 de U4). U5 no escribe ni lee el almacén del dispositivo. |
| Estado propio | **Solo memoria del proceso**: la vista derivada y el estado de la suscripción viven dentro de la instancia de C8 y mueren al recargar (RC-03). No hay caché en disco ni un registro de eventos que mantener (ADR-006). |
| Instancia | **Una sola**, construida en `app/src/bootstrap/instances.ts` y recibida por dependencias (BR24.3). Una segunda instancia duplicaría la suscripción a C4 sin abrir ninguna puerta nueva, pero rompe la regla de composición. |

**Por qué importa en una app sin backend.** El modelo de permisos de `components.md` dice que una pantalla de lectura no altera el contenido. Si la Actividad escribiera —por ejemplo, marcando como «leído» un evento— el contenido cambiaría solo con abrir una pestaña, y el estado de la app dejaría de ser el resultado de lo que la persona hizo. La comprobación es de revisión y de tipos, no de tiempo de ejecución.

**Cómo se verifica**: revisión de `packages/activity/src/**` que confirma que solo se importan tipos de C4 y C3 con `import type` y que no existe ninguna llamada de escritura; prueba con un doble de C4 que registra las llamadas y comprueba que la lista blanca es exactamente `listOpinions`, `listLikes`, `listComments` y `subscribeContent`; revisión de `packages/activity/package.json`, que no declara `@melodify/catalog` ni `@melodify/spotify` ni un módulo de red; prueba de montaje real que comprueba que tras abrir y recorrer Actividad el almacén de C4 no cambió de revisión.

### NFR3.22 — La pantalla no abre superficie nueva: sin enlaces, sin HTML y sin datos del actor en la vista

- **El único dato que sale de una fila es su `opinionId`**, y va a `openOpinionDetail` (C2), que ya sabe leerlo (BR24.1). La pantalla no construye una URL, no abre el navegador, no comparte nada por el sistema y no escribe en el portapapeles: no existe el mecanismo.
- **Nada de la lista se interpreta como marcado.** El título de la obra y el texto de la fila se pintan como `Text`; no hay `WebView`, ni `dangerouslySetInnerHTML`, ni un renderizador de HTML. Un título con `<` o `&` se ve tal cual, no se ejecuta ni se rompe.
- **El `actorHandle` no se pinta** (BR24.2). Viaja en el evento y se copia al modelo de presentación porque C1 lo declara opcional (R-38), pero la fila no lo muestra: el texto de las tres clases es fijo y está aprobado en `interaction-spec.md`. Es una decisión de privacidad además de una decisión de diseño: la lista cuenta **qué** le pasó a la cuenta, no **quién** lo hizo, y evita convertir la pantalla en un directorio de handles ajenos.
- **El texto de un comentario recibido no entra en el evento** (BR21.4). La fila dice que comentaron; lo que se escribió se lee en el detalle de la opinión, donde ya vive y donde la persona decidió abrirlo. El contenido de otra persona no se copia a otra superficie.
- **La vista es pura**: `ActividadView` recibe `status`, `groups`, `online`, `onRetry` y `onOpenOpinion`; no tiene acceso a C8, a C3 ni a C4, así que no puede pedir nada por su cuenta (BR24.3).
- **Sin identificadores de la cuenta en las props de presentación**: `ActivityEventSummary` de C1 no declara `authorId` ni `viewerId`; el único dato del actor que llega es el `actorHandle` opcional, y la fila no lo pinta.

**Cómo se verifica**: revisión de `packages/design-system/src/components/ActivityRow.tsx` y `DayHeader.tsx` que confirma que no hay `Linking`, `WebView` ni un `Image` de origen remoto; prueba de `ActivityRow` con un título que contiene `<b>` y `&` que comprueba que el texto visible es literal; prueba de tipos que comprueba que `ActivityEventSummary` no declara `authorId`; prueba que comprueba que `ActividadView` no importa C3, C4 ni C8.

### NFR3.23 — Un fallo se contiene: sin traza, sin código técnico y sin dejar la lista vieja como si fuera nueva

- **El mensaje de la excepción nunca llega a la pantalla.** La vista `error` pinta «No pudimos cargar tu actividad.» con «Reintentar»; el `ContentErrorCode` de C4, el `mensaje` del contrato y el texto de la excepción se quedan dentro de C8 (BR23.3, `project.md` § Mandated: errores en lenguaje llano y con acción).
- **Una lista parcial no se presenta como completa.** Si falla la lectura de me gusta o de comentarios de una opinión, la derivación va a `error` en lugar de pintar las publicaciones y omitir en silencio lo que no se pudo leer (ADR-012, BR23.3). El riesgo que se cierra no es de seguridad sino de veracidad, y es el mismo que NFR1.17 recoge desde el lado de la fiabilidad.
- **El reintento no amplía permisos ni estado**: `retryActivity()` vuelve a `loading` y repite la derivación sobre la misma instancia y la misma identidad; no hay un camino que reintente con otro `viewerId` ni que reutilice una suscripción de otra cuenta.
- **Sin conexión no es un fallo de seguridad ni un error**: el aviso de BR23.4 se pinta sobre la lista y no sustituye al contenido. La ausencia de red no se convierte en un estado del que haya que recuperarse.
- **La pantalla no captura para seguir**: no hay `try` alrededor de cada llamada en la vista ni en el hook; la contención vive en C8, que es donde se conoce el contrato de C4. Un `catch` en la pantalla taparía un fallo de composición.

**Cómo se verifica**: prueba con un doble de C4 que devuelve `ok: false` con un `ContentErrorCode` reconocible y comprueba que ese código **no** aparece en el árbol renderizado; prueba del caso `listLikes` fallido que comprueba `error` y la ausencia de filas parciales; prueba de `retryActivity` que comprueba que la segunda derivación usa el mismo `viewerId`.

## NFR4 — Privacidad

### NFR4.11 — Inventario de lo que se pinta, de lo que se guarda y de lo que no sale de la memoria

**Lo que la pantalla muestra, y a quién:**

| Dato | Se muestra | A quién | Por qué |
|---|---|---|---|
| Título de una opinión propia | Sí, entre comillas en la fila | A la persona dueña de la cuenta | Es el contenido que ella publicó |
| Fecha de la publicación propia | Sí, como tiempo relativo | A la persona | Contexto del evento |
| Que alguien dio me gusta a una opinión propia | Sí, sin decir quién (BR24.2) | A la persona | Es el hecho que la Actividad cuenta |
| Que alguien comentó una opinión propia | Sí, sin decir quién y sin el texto | A la persona | El texto se lee en el detalle |
| Handle de quien dio me gusta o comentó | **No** | — | BR24.2: la fila no nombra a terceros |
| Texto de un comentario recibido | **No** en la lista | — | BR21.4: no viaja al evento |
| Datos de otras cuentas | **Ninguno** más allá de los contadores que ya expone C4 | — | La derivación solo mira las opiniones propias (BR21.1) |

**Lo que se guarda en el dispositivo** — U5 **no añade ninguna fila** a la tabla de NFR4.9 de U4:

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` (U1) | Sí | Almacenamiento seguro | Al cerrar sesión |
| Token de Spotify (U4) | Sí | Almacenamiento seguro, `melodify.spotify.token` | Al desconectar o al fallar |
| Opiniones, comentarios, me gusta, seguimientos (U2/U3) | No | Memoria del proceso | Al recargar (RC-03) |
| **Actividad derivada** | **No** | Memoria del proceso, dentro de C8 | Al recargar |
| Estado de la conexión y de la red | No | Memoria del proceso | Al recargar |

**Lo que no sale del dispositivo: nada nuevo.** U5 no envía un byte. La Actividad no habla con Spotify, así que ni siquiera hereda la fila de la IP del dispositivo ni la del `workId` de NFR4.9 de U4.

**Tres consecuencias que conviene dejar escritas:**

- **La Actividad no es un registro y no hay que borrarla.** Como se deriva del contenido (ADR-006), cerrar sesión y volver a entrar con otra cuenta produce la actividad de la otra cuenta sin que quede rastro de la primera: no hay eventos almacenados que limpiar. Es una ventaja de privacidad del modelo de derivación, no un efecto colateral.
- **La cuenta demo es la única que existe** y su contenido es de ejemplo. Aun así, el inventario se escribe como si fueran datos reales, porque la primera vez que alguien añada cuentas el código ya tendrá la forma correcta.
- **La lista no se comparte ni se exporta.** No hay captura, ni compartir por el sistema, ni copiar al portapapeles: la privacidad de la pantalla se sostiene en que no hay una acción que saque su contenido de ella.

**Cómo se verifica**: prueba de `ActividadView` que recorre el árbol renderizado y comprueba que **no** aparece el `actorHandle` de la siembra (`lucia`, `ana`, `bruno`) ni el texto de un comentario sembrado; prueba que comprueba que la lista de claves de almacenamiento usadas por la app no gana ninguna entrada al abrir Actividad; revisión de `packages/activity/src/**` que confirma que no hay un módulo de persistencia.

## NFR9 — Diagnóstico y observabilidad

Se cumple con el logger que entregó U1 y que U2, U3 y U4 ampliaron. Esta unidad **no** añade una superficie: ni panel, ni telemetría, ni un servicio de errores (NFR9 aprobado). U5 **no añade un puerto de diagnóstico**: `ActivityFeed` se construye con `{ content, session }` y no recibe logger, porque no tiene nada que registrar que la pantalla no sepa ya.

### NFR9.8 — Qué se registra y qué no en esta unidad

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| La derivación falla y la vista entra en `error` | Sí: «No pudimos cargar tu actividad.» + «Reintentar» | Sí, con `error`; código `ACTIVITY_LOAD_FAILED`, emitido por `useActividad` |
| El reintento vuelve a fallar | Sí: el mismo mensaje y la misma acción | Sí, una vez por intento: cada `error` es un intento fallido, no un bucle |
| La suscripción a C4 no se establece | Sí: `error` con «Reintentar» | Se cubre con `ACTIVITY_LOAD_FAILED`: es el mismo defecto visto desde la pantalla |
| Un `listener` de `subscribeActivity` lanza | No | No en C8: se aísla y se sigue notificando a los demás (NFR1.17). El `listener` de la pantalla es el único de la app y no lanza |
| La lista se recalcula tras publicar | Nada: es lo esperado | No |
| La lista queda vacía | Sí: «Todavía no hay actividad.» + «Crear opinión» | No: es un estado previsto |
| Sin conexión | Sí: banner con «Reintentar» | No: es un estado previsto (BR23.4) |
| Una pantalla se abre con la sesión `signedOut` | Sí: `empty` | No |
| Se toca una fila y se abre el detalle | Nada | No |

**Qué se añade a `AppLogCode`.** U2 declaró la unión en `app/src/bootstrap/logger.ts`, U3 le sumó `SEARCH_PORT_UNAVAILABLE` y U4 la cerró con `SpotifyLogCode`. U5 añade **uno**:

```ts
export type AppLogCode =
  | SessionLogCode
  | "CONTENT_SUBSCRIBE_FAILED"
  | "CONTENT_READ_FAILED"
  | "NETWORK_STATE_UNAVAILABLE"
  | "SEARCH_PORT_UNAVAILABLE"
  | "ACTIVITY_LOAD_FAILED"
  | SpotifyLogCode;
```

`SessionLogCode` y `SpotifyLogCode` no se reabren. `AppLogger` sigue siendo asignable a `SessionLogger` y a `SpotifyLogPort`, y las comprobaciones `const asSession: SessionLogger = logger;` de U2 y `const asSpotify: SpotifyLogPort = logger;` de U4 siguen valiendo: la unión solo crece.

**Quién lo emite.** `ACTIVITY_LOAD_FAILED` lo emite `app/src/state/useActividad.ts`, no el paquete: el hook es quien ve el estado `error` de C8 y quien tiene el logger del proyecto a mano en la composición. `@melodify/activity` no importa `app/src/bootstrap/logger.ts` —es vocabulario de la app— y no necesita un puerto propio, porque el único hecho que merece un diagnóstico ya es visible en su contrato público (`status: 'error'`). Es la misma elección que U2 hizo con la vista de contenido y la contraria a la de U4, que sí necesitaba el puerto porque el fallo ocurría dentro del paquete y no cruzaba su frontera.

**Qué nunca se registra**: el texto de una opinión, el texto de un comentario, el título de la obra, el `authorId`, el `actorHandle`, el `eventId` ni el `ContentErrorCode`. Se registra **el fallo y su origen**, no el dato (NFR4.6 de U2, NFR9.6 de U3, NFR9.7 de U4). El mensaje del log es una frase fija —`"No se pudo derivar la actividad"`— sin interpolación de nada que venga del contenido.

**Cómo se verifica**: prueba de `useActividad` con un doble de C8 que emite `error` y un logger doble, que comprueba exactamente una llamada con `error` y el código `ACTIVITY_LOAD_FAILED` y que el mensaje no contiene ningún dato del evento; prueba de que la vista `ready` y el estado `empty` no producen ninguna llamada al logger; revisión de `packages/activity/src/**` que confirma que no hay `console` y que el paquete no importa el logger.

## Consideraciones de amenaza de esta unidad

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Abrir una pestaña altera el contenido | La Actividad solo llama a lecturas (NFR3.21, BR21.6) |
| Un evento inventado o una lista parcial se lee como verdad | Una lectura fallida produce `error`, no una lista recortada (NFR3.23, ADR-012) |
| La pantalla se convierte en un directorio de handles ajenos | El `actorHandle` viaja pero no se pinta (NFR3.22, BR24.2) |
| El texto de un comentario ajeno se copia a otra superficie | No viaja al evento; se lee en el detalle (NFR3.22, BR21.4) |
| Un título manipulado rompe la fila o ejecuta algo | Todo se pinta como `Text`, sin HTML ni `WebView` (NFR3.22) |
| Un fallo del contenido se disfraza de pantalla vacía | `error` y `empty` son estados distintos, con acciones distintas (BR23.2, BR23.3) |
| El diagnóstico filtra lo que la persona publicó | El logger recibe un código y una frase fija (NFR9.8) |
| Una segunda instancia deriva dos veces la misma sesión | Una sola instancia en composición (BR24.3) |
| Cambiar de cuenta deja la actividad de la anterior | La derivación se rehace con el nuevo `viewerId` (NFR1.16 de esta unidad) |
| Un `listener` defectuoso tumba la lista | Cada suscriptor se notifica por separado (NFR1.17) |

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| Lista blanca de operaciones de lectura | `packages/activity/src/` (BR21.6) | Una escritura desde una pantalla de lectura |
| Sin dependencia de red, catálogo ni Spotify | `packages/activity/package.json` (TS-39) | Que la Actividad herede la superficie de U4 |
| Contención del fallo en el contrato | `ActivityFeed` → `status: 'error'` (BR23.3, ADR-012) | Un fallo en silencio o una lista parcial |
| Vista pura sin acceso a las fuentes | `ActividadView` con props planas (BR24.3) | Que la interfaz pida datos por su cuenta |
| `actorHandle` fuera de la fila y de C1 | `ActivityEventSummary` sin `authorId` (BR24.2) | Exponer datos de terceros en la lista |
| Texto como texto | `Text` de React Native, sin HTML ni `WebView` (NFR3.22) | Interpretar contenido como marcado |
| Un solo código de diagnóstico, sin datos | `useActividad` + `AppLogCode` (NFR9.8) | Filtrar contenido por el registro |
| Una sola instancia de C8 | `app/src/bootstrap/instances.ts` (BR24.3) | Dos derivaciones de la misma sesión |
| Sin persistencia nueva | Memoria del proceso (NFR4.11, RC-03) | Dejar actividad en el dispositivo |

## Assumptions & Open Questions

- `[assumption]` La Actividad no necesita un puerto de diagnóstico. Si en el futuro la derivación tuviera que distinguir *por qué* falló —por ejemplo, para reintentar solo una lectura—, el contrato tendría que exponerlo y entonces sí haría falta un código por causa; hoy el contrato tiene un único estado `error` y un único código lo cubre.
- `[assumption]` El `actorHandle` se conserva en el evento aunque no se pinte. Quitarlo del modelo obligaría a cambiar C8 otra vez y a construir el `eventId` del me gusta sin el autor, que es justo lo que lo hace único. Se queda como dato no presentado y las pruebas afirman que no aparece en el árbol renderizado.
- `[assumption]` La app no tiene cuentas reales (RC-02): el `viewerId` es `demo` y el contenido es de ejemplo. El inventario de privacidad se escribe igual que si fueran datos reales, porque el día que existan cuentas el código ya tendrá la forma correcta y la revisión no tendrá que rehacerse.
- `[assumption]` La sesión cerrada produce `empty`, no `error` (NFR1.16): no hay un fallo de seguridad en no tener cuenta, y presentarlo como error enseñaría a la persona un problema que no existe.
- **Open question para U6**: la prueba en el teléfono confirma que la lista no revela nada que la persona no esperara ver, incluido el caso de cambiar de cuenta y volver a Actividad. Es una comprobación de recorrido, no de código; el inventario de NFR4.11 es lo que se puede afirmar antes de tener el teléfono.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR8.1–FR8.4, FR11.2, FR11.4, FR11.5, FR12.1, RC-02, RC-03).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§ Forbidden: backend, autenticación real, persistencia, `.env` y tokens; § Mandated: recorrido sin Spotify, textos en español, degradar con mensaje y acción).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§ Code Style: sin `console.log`, errores en lenguaje llano y con acción; § Testing Posture).
- `components` — `inception/domain-design/components.md` (§ ActivityFeed).
- `decisions` — `inception/domain-design/decisions.md` (ADR-006, ADR-012).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0, § Fallos).
- `functional-spec` — `construction/u5-activity/functional-design/functional-spec.md` (§ Máquina de estados, F13–F18, § Textos exactos, § Assumptions).
- `rules` — `construction/u5-activity/functional-design/rules.md` (BR21.1, BR21.4, BR21.6, BR23.3, BR23.4, BR24.1–BR24.4).
