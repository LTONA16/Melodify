# Diseño de seguridad, privacidad y diagnóstico — U5 `u5-activity`

> **Provenance**: deriva de `nfr-requirements/security-requirements.md` (NFR3.21–3.23, NFR4.11, NFR9.8 y los heredados NFR3.18, NFR4.9, NFR4.6, NFR9.1, NFR9.6, NFR9.7), de `nfr-requirements/performance-requirements.md` (NFR1.16–1.18, para la contención del fallo desde el lado de la fiabilidad), de `nfr-requirements/tech-stack-decisions.md` (TS-39–TS-43), de `aidlc/spaces/default/memory/project.md` (§ Forbidden: backend, autenticación real, persistencia, `.env` y tokens; § Mandated: recorrido sin Spotify, textos en español, degradar con mensaje y acción) y `team.md` (§ Code Style: sin `console.log`, errores en lenguaje llano y con acción), de `functional-design/functional-spec.md` (§ Textos exactos, § Assumptions) y `functional-design/rules.md` (BR21.1, BR21.4, BR21.6, BR23.3, BR23.4, BR24.1–BR24.4), y de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0).
> Fecha: 2026-11-19. Etapa: NFR Design · Unidad: `u5-activity` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Fronteras de confianza de esta unidad

U5 **no cruza ninguna frontera nueva hacia fuera**. La frontera que sí mueve es interna: por primera vez una pantalla muestra **lo que otras personas hicieron** con el contenido de la cuenta. Eso cambia la pregunta de seguridad de la unidad, no su superficie de red.

| Frontera | Qué la cruza | Dirección | Garantía |
|---|---|---|---|
| Proceso → red | **Nada** | — | No hay cliente HTTP, ni URL, ni un `fetch` en el paquete (TS-39) |
| C8 → C4 | Lecturas: `listOpinions`, `listLikes`, `listComments`, `subscribeContent` | Entrada | Solo lectura; ninguna escritura (NFR3.21) |
| C8 → C3 | `getSession`, `subscribeSession` | Entrada | Solo la identidad; el token de Spotify no pasa por aquí |
| C8 → pantalla | `ActivityView` con eventos y grupos | Salida | Sin `authorId`, sin `viewerId`, sin el token (NFR3.22) |
| pantalla → C1 | `ActivityEventSummary` | Salida | Tres campos de presentación, sin identidad del actor |
| pantalla → C2 | `openOpinionDetail({ opinionId })` | Salida | El identificador de la opinión, nada más |
| app → logger | Un código y una frase fija | Salida | Sin contenido, sin identidades, sin códigos técnicos (NFR9.8) |
| proceso → almacenamiento | **Nada** | — | La actividad no se persiste: se deriva (NFR4.11) |

**La consecuencia se dice en voz alta**: la superficie de seguridad de U5 es más pequeña que la de cualquier unidad anterior y su superficie de **privacidad** es más grande. Lo que hay que demostrar no es que no se escape un secreto —no hay ninguno en juego— sino que la pantalla no exponga más de lo que debe y que un fallo no invente datos.

## NFR3.21 — La Actividad es de solo lectura, y la frontera se hace cumplir en cuatro sitios

### La lista blanca, operación por operación

| Operación | ¿Se usa? | Dónde | Por qué |
|---|---|---|---|
| `listOpinions({ viewerId })` | **Sí** | `derive.ts` | Es el punto de partida de la derivación (BR21.2) |
| `listLikes({ opinionId })` | **Sí** | `derive.ts` | Los me gusta recibidos necesitan autor y fecha (BR21.3) |
| `listComments({ opinionId })` | **Sí** | `derive.ts` | Los comentarios recibidos, igual (BR21.4) |
| `subscribeContent({ viewerId }, listener)` | **Sí** | `activity.ts` | Es el aviso de recálculo (BR23.5) |
| `createOpinion` | **No** | — | Publicar es de U3; una pantalla de lectura no escribe |
| `toggleLike`, `addComment`, `toggleFollow` | **No** | — | La Actividad cuenta lo que le pasó a la cuenta, no lo que la cuenta hizo (BR21.1) |
| `getSession`, `subscribeSession` | **Sí** | `activity.ts` | La identidad, y solo la identidad |
| Cualquier miembro de C5 o C7 | **No** | — | No hay portada, no hay búsqueda, no hay catálogo (BR21.6) |

### Las cuatro compuertas que lo sostienen

| Compuerta | Dónde | Qué detecta | Qué no detecta |
|---|---|---|---|
| **Tipos** | `import type` de C4 y C3; las implementaciones llegan por constructor | Una firma que no existe | Una llamada de escritura con una firma válida |
| **Linter** | Bloque de `eslint.config.js` para `packages/activity/src/**`: `@melodify/catalog` y `@melodify/spotify` prohibidos, `react`/`react-native` prohibidos, `fetch` como global restringido (TS-39) | Un import de catálogo o Spotify, un hook escondido, una petición HTTP | Una llamada de escritura dentro de C4 |
| **Prueba** | Doble de C4 que registra cada llamada | Que la lista blanca real sea exactamente la de la tabla | Un camino que solo se ejecute en producción |
| **Revisión** | Lectura de `packages/activity/src/**` en el PR | Una llamada de escritura que las tres anteriores dejan pasar | — |

- **La compuerta que importa es la de la prueba**: no afirma «no se escribe» en abstracto, afirma que **las llamadas hechas** son exactamente cuatro nombres. Un `toggleLike` colado en el futuro pondría esa prueba en rojo aunque el linter no lo viera.
- **El paquete no recibe logger ni almacén.** Su constructor es `{ content, session }` y no crece: sin almacén no puede persistir, y sin logger no puede filtrar contenido por el registro (NFR9.8, TS-43). Dos dependencias menos son dos caminos menos.
- **Una sola instancia, y por una razón de corrección**: dos instancias derivarían dos veces la misma sesión y abrirían dos suscripciones a C4, con dos listas que podrían discrepar un fotograma. La construye `app/src/bootstrap/instances.ts` y la pantalla la recibe por `ScreenDependencies.activity` (BR24.3).
- **Por qué el estado no vive en un hook del paquete**: un `useState` dentro de `packages/activity` convertiría la lógica en una pieza de interfaz, obligaría a montar React para probarla y la ataría al ciclo de render. La lógica es una función; el estado del render lo lleva `useActividad` en la app (TS-42). El linter lo prohíbe para que no se descubra tarde.

### Lo que esta unidad no puede hacer ni aunque quisiera

| Intento | Qué lo impide |
|---|---|
| Escribir en el contenido | No hay una operación de escritura en la lista blanca; la prueba la enumera |
| Pedir red | `fetch` está restringido por el linter en el paquete y no hay cliente HTTP |
| Leer el catálogo o Spotify | Los dos paquetes están prohibidos como import, incluso como tipo |
| Guardar eventos | No hay almacén, ni `AsyncStorage`, ni `expo-secure-store` (prohibidos en todo el repo) |
| Tocar el token de Spotify | El token no cruza por C3 hacia C8: `SessionView` no lo lleva |

## NFR3.22 — La pantalla no abre superficie nueva, y no expone a quien interactuó

### Qué viaja y qué se pinta, campo por campo

| Dato | Viaja en el contrato | Llega a C1 | Se pinta | Por qué |
|---|---|---|---|---|
| `eventId` | Sí | **No** | No | Es la clave de la lista, no un texto |
| `kind` | Sí | Sí (elige el texto) | Indirecto | Determina la frase y el icono |
| `opinionId` | Sí | Sí | No | Es lo que se envía a C2 al tocar |
| `workTitle` | Sí | Sí | **Sí**, entre comillas | Es el contenido de la persona |
| `createdAt` | Sí | Sí | **Sí**, como tiempo relativo | Contexto del hecho |
| `actorHandle` | Sí (opcional) | Sí (opcional, R-38) | **No** | Identifica a otra persona y la fila no la nombra (BR24.2) |
| `authorId` / `viewerId` | **No** | No | No | Ni C8 ni C1 los declaran en estos modelos |

- **El `actorHandle` viaja y no se pinta, y las dos cosas son deliberadas.** Viaja porque es parte de lo que C4 devuelve y porque el `eventId` del me gusta lo usa para ser único (`like:<opinionId>:<authorId>`); no se pinta porque el texto de las tres clases está fijado en `interaction-spec.md` y porque nombrar a terceros en una lista convierte la pantalla en un directorio de handles ajenos. La decisión de privacidad y la de diseño coinciden, que es la mejor clase de coincidencia.
- **`ActivityEventSummary` de C1 declara `actorHandle?` y no declara `authorId` ni `viewerId`.** El handle llega al modelo de presentación porque el contrato lo declara opcional (R-38) y la pantalla lo copia; lo que no ocurre es que `ActivityRow` lo pinte. La prueba lo afirma sobre el árbol renderizado, que es donde importa, no sobre el tipo.
- **El texto de un comentario no entra en el evento** (BR21.4). La fila dice que comentaron; lo que se escribió se lee en el detalle, donde ya vive y donde la persona decide abrirlo. Copiarlo a la lista sería duplicar contenido ajeno en otra superficie sin que nadie lo pidiera.
- **Todo se pinta como `Text`.** No hay `WebView`, ni un renderizador de HTML, ni un componente que interprete marcado: un título con `<b>` o `&` se ve tal cual. La fila no recibe una `coverUrl`, así que tampoco hay una URL remota en el árbol.
- **No hay acciones que saquen la lista de la app**: ni `Linking`, ni compartir por el sistema, ni copiar al portapapeles, ni una captura. La privacidad de la pantalla se sostiene, en parte, en que no existe una acción que la exporte.
- **La fila entera navega con un solo dato**: `onPress` llama a `openOpinionDetail({ opinionId })` y no pasa el evento, ni el handle, ni la fecha. C2 apila el detalle y el detalle lee lo que necesita por su cuenta (BR24.1).

**Cómo se comprueba**: prueba de `ActividadView` que recorre el árbol y afirma que los handles de la siembra (`lucia`, `ana`, `bruno`) **no aparecen** y que el texto de un comentario sembrado tampoco; prueba de `ActivityRow` con un título que contiene `<b>` y `&` que afirma el texto literal; prueba de tipos que afirma que `ActivityEventSummary` no declara `authorId`; revisión de que `packages/activity` y las dos piezas de C1 no importan `Linking`, `WebView` ni un módulo de portapapeles.

## NFR3.23 — Un fallo se contiene, y no se presenta una lista parcial como completa

| Situación | Estado | Qué ve la persona | Qué se registra |
|---|---|---|---|
| `listOpinions` falla | `error` | «No pudimos cargar tu actividad.» + «Reintentar» | `ACTIVITY_LOAD_FAILED` una vez |
| `listLikes` de una opinión falla | `error` | El mismo mensaje | `ACTIVITY_LOAD_FAILED` una vez |
| `listComments` de una opinión falla | `error` | El mismo mensaje | `ACTIVITY_LOAD_FAILED` una vez |
| `subscribeContent` falla o lanza | `error` | El mismo mensaje | `ACTIVITY_LOAD_FAILED` una vez |
| La derivación lanza | `error` | El mismo mensaje | `ACTIVITY_LOAD_FAILED` una vez |
| El reintento vuelve a fallar | `error` | El mismo mensaje y la misma acción | Un código por intento |
| Sin conexión | `ready` | La lista y el banner de BR23.4 | Nada: es un estado previsto |
| Sin contenido | `empty` | «Todavía no hay actividad.» + «Crear opinión» | Nada |

- **No se pinta una lista parcial.** Si se pintaran las publicaciones y se omitieran los me gusta que no se pudieron leer, la pantalla afirmaría que nadie dio me gusta. Ese es el fallo que la contención evita, y es de veracidad antes que de seguridad (ADR-012).
- **El mensaje técnico no sale del paquete.** El `ContentErrorCode` de C4, su `mensaje` y el texto de la excepción se quedan dentro de C8; la vista pinta la frase aprobada. Lo único que cruza hacia el diagnóstico es un código de la app y una frase fija (NFR9.8).
- **El reintento no amplía nada**: repite la derivación con la identidad vigente, sobre la misma instancia, sin abrir una segunda suscripción y sin cambiar de `viewerId`. No hay un camino de reintento con otros permisos porque no hay permisos que ampliar.
- **La ausencia de red no se convierte en error.** Como la pantalla no usa la red, culpar a la red de un fallo inexistente sería el peor mensaje posible (BR23.4).
- **La pantalla no captura para seguir.** No hay `try` alrededor de cada llamada en `useActividad` ni en la vista: la contención está en el contrato, que es donde se conoce C4. Un `catch` en la pantalla taparía un fallo de composición y lo convertiría en un estado silencioso.

## NFR4.11 — Lo que se pinta, de quién es y qué se guarda

### Lo que la pantalla muestra

| Dato | Se muestra | Por qué es aceptable |
|---|---|---|
| Título de una opinión propia | Sí, entre comillas | Es contenido que la persona publicó |
| Fecha de su publicación | Sí, como tiempo relativo | Contexto del hecho, sin hora exacta |
| «Alguien dio me gusta a tu opinión de «…»» | Sí, sin decir quién | Es el hecho que la Actividad cuenta |
| «Comentaron tu opinión de «…»» | Sí, sin decir quién y sin el texto | El texto se lee en el detalle |
| Handle, identificador o inicial de quien interactuó | **No** | BR24.2: la fila no nombra a terceros |
| Datos de otras cuentas | **Ninguno** más allá de los contadores que ya expone C4 | La derivación solo mira las opiniones propias (BR21.1) |
| El token de Spotify o el estado de la conexión | **No** | U5 no importa C7 y C3 no publica el token |

### Lo que se guarda en el dispositivo — ninguna fila nueva

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` (U1) | Sí | Almacenamiento seguro | Al cerrar sesión |
| Token de Spotify (U4) | Sí | Almacenamiento seguro, `melodify.spotify.token` | Al desconectar o al fallar |
| Opiniones, comentarios, me gusta, seguimientos (U2/U3) | No | Memoria del proceso | Al recargar (RC-03) |
| **Actividad derivada** | **No** | Memoria del proceso, dentro de C8 | Al recargar |
| Estado de la conexión y de la red | No | Memoria del proceso | Al recargar |

- **Derivar en lugar de almacenar es una propiedad de privacidad, no solo de arquitectura.** Al no haber un registro de eventos, cerrar sesión y entrar con otra cuenta produce la actividad de la otra cuenta sin que quede rastro de la primera: no hay nada que limpiar porque nunca se guardó nada (ADR-006).
- **El texto de la persona no se copia a ninguna otra superficie.** La actividad no escribe en C4, no alimenta el catálogo y no viaja a Spotify: ningún texto de una opinión se duplica fuera de su detalle (NFR4.9 de U4 sigue vigente).
- **La cuenta demo es la única que existe** (RC-02) y su contenido es de ejemplo. El inventario se escribe como si fueran datos reales porque el día que existan cuentas el código ya tendrá la forma correcta y la revisión no habrá que rehacerla.

**Cómo se comprueba**: prueba que abre Actividad sobre la siembra y afirma que no aparece ningún handle ni el texto de un comentario; prueba que afirma que el conjunto de claves de almacenamiento usadas por la app no gana ninguna entrada al abrir, recorrer y volver de la pantalla; revisión de que `packages/activity` no tiene un módulo de persistencia.

## NFR9.8 — Qué se registra y qué no

### El vocabulario crece en uno

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

- **`SessionLogCode` y `SpotifyLogCode` no se reabren.** La unión solo crece, así que `AppLogger` sigue siendo asignable a `SessionLogger` (la comprobación de U2) y a `SpotifyLogPort` (la de U4) sin conversión y sin redeclarar vocabulario ajeno.
- **Lo emite `app/src/state/useActividad.ts`**, no el paquete. El hook es quien ve `status: 'error'` y quien tiene el logger del proyecto en la composición.
- **El mensaje es una frase fija**, `"No se pudo derivar la actividad"`, sin interpolar nada que venga del contenido: ni el título, ni el `eventId`, ni el `ContentErrorCode`. El logger registra el fallo y su origen, no el dato (NFR4.6 de U2, NFR9.6 de U3, NFR9.7 de U4).

### Por qué esta unidad **no** recibe un puerto de diagnóstico, a diferencia de U4

| Criterio | U4 | U5 |
|---|---|---|
| ¿Dónde ocurre el fallo? | Dentro del paquete (token, renovación, búsqueda) | En la derivación, y su resultado **cruza** el contrato como `status: 'error'` |
| ¿La app puede verlo sin puerto? | No: un fallo de guardado o de borrado no cambia el estado visible | Sí: `error` es un estado público de C8 |
| ¿Cuántos códigos necesita? | Seis | Uno |
| Decisión | `SpotifyLogPort` obligatorio inyectado en las dos fábricas (TS-38) | **Ninguno**: el hook registra al ver el estado |

- **Añadir un puerto por un solo código abriría una dependencia sin comprador.** El paquete ya dice lo que hay que saber; traducirlo a diagnóstico es trabajo de la app, que es quien tiene el logger.
- **Un `listener` que lanza no se registra**, y no es un olvido: C8 lo aísla para que no tumbe a los demás, y el único `listener` de la app es el de `useActividad`, que no lanza. Si lo hiciera, el defecto sería del consumidor y lo delataría la prueba, no un log en producción.

### La tabla completa de la unidad

| Situación | Se muestra | Se registra |
|---|---|---|
| La vista entra en `error` | Sí: mensaje y «Reintentar» | Sí, `error`, `ACTIVITY_LOAD_FAILED` |
| El reintento vuelve a fallar | Sí, igual | Sí, un código por intento |
| La suscripción a C4 no se establece | Sí, `error` | Se cubre con `ACTIVITY_LOAD_FAILED` |
| Un `listener` lanza | No | No (se aísla) |
| La lista se recalcula tras publicar | Nada | No |
| La lista queda vacía | Sí, el vacío con su acción | No |
| Sin conexión | Sí, el banner | No |
| Sesión `signedOut` | Sí, `empty` | No |
| Se toca una fila | Nada visible hasta el detalle | No |

**Cómo se comprueba**: prueba de `useActividad` con un doble de C8 que emite `error` y un logger doble, que afirma exactamente una llamada con `error` y `ACTIVITY_LOAD_FAILED` y que el mensaje no contiene ningún campo del evento; prueba que afirma que `ready` y `empty` no producen ninguna llamada al logger; revisión de que el paquete no importa el logger y no contiene `console`.

## Lo heredado sigue valiendo

| Requisito heredado | Qué fijó | Cómo lo respeta U5 |
|---|---|---|
| **NFR4.9** (U4) | Inventario de lo que cruza la frontera | No añade ninguna fila: la Actividad no envía nada |
| **NFR4.6** (U2) | El texto de la persona no entra en el registro | El mensaje del log es fijo y no interpola contenido |
| **NFR9.1** (U1) | Un solo logger, único sitio que llama a `console` | El paquete no importa el logger; el hook usa el del proyecto |
| **NFR9.6** (U3) | El catálogo de eventos de Crear no se reabre | Se añade un código; los de U2 y U3 quedan intactos |
| **NFR9.7** (U4) | Los seis códigos de Spotify y su puerto | El logger sigue siendo asignable a `SpotifyLogPort` porque la unión crece |
| **NFR3.18** (U4) | El token solo en el almacén seguro y solo en `auth` | U5 no nombra el almacén ni el token; no hay un tercer adaptador |
| **NFR1.17 de esta unidad** | Un `listener` que lanza no tumba a los demás | C8 notifica por separado y aísla; no registra |

## Amenazas de la unidad y qué las cierra

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Abrir una pestaña altera el contenido | Solo lectura en cuatro nombres; el linter, la prueba y el constructor lo sostienen (NFR3.21) |
| Una escritura se cuela en la pantalla de lectura | Lista blanca de operaciones, prohibición de C5/C7 y `fetch` en el paquete (TS-39) |
| La pantalla se convierte en un directorio de handles ajenos | `actorHandle` viaja pero no llega a C1 ni al árbol (NFR3.22) |
| El texto de un comentario ajeno se copia a otra superficie | No viaja al evento; se lee en el detalle (NFR3.22, BR21.4) |
| Un título manipulado rompe la fila o ejecuta algo | Todo se pinta como `Text`, sin HTML ni `WebView` |
| Una lista parcial se lee como completa | Una lectura fallida produce `error`, no una lista recortada (NFR3.23) |
| Un fallo del contenido se disfraza de pantalla vacía | `error` y `empty` son estados distintos con acciones distintas |
| El diagnóstico filtra lo que la persona publicó | Código y frase fija; el paquete no tiene logger (NFR9.8) |
| Cambiar de cuenta deja la actividad de la anterior | La derivación se rehace con el nuevo `viewerId`; no hay eventos guardados |
| Una segunda instancia deriva dos veces la misma sesión | Una sola instancia en composición (BR24.3) |
| Un `listener` defectuoso tumba la lista | Cada suscriptor se notifica por separado (NFR1.17) |

## Cómo se demuestra cada requisito

| Requisito | Prueba o revisión |
|---|---|
| NFR3.21 | Doble de C4 que enumera las llamadas; revisión de imports; `npm run lint` con el bloque del paquete |
| NFR3.22 | Render que afirma la ausencia de handles y de texto de comentario; título con `<b>`; tipos de `ActivityEventSummary`; revisión de `Linking`/`WebView` |
| NFR3.23 | Cuatro dobles que fallan en cada operación; vista `error` sin eventos de la derivación anterior; reintento con el mismo `viewerId` |
| NFR4.11 | Render sobre la siembra; claves de almacenamiento sin cambios; revisión de un módulo de persistencia |
| NFR9.8 | `useActividad` con logger doble; `ready`/`empty` sin llamadas; revisión de `console` en el paquete |
| NFR1.16–1.18 | Pruebas de transición por estado; `signedOut`; dos identidades; `online: false`; siembra y almacén vacío |

## Riesgos asumidos y su porqué

| Riesgo | Por qué se acepta | Qué lo vigilaría |
|---|---|---|
| El `eventId` del me gusta lleva el `authorId` en una cadena | Es lo que lo hace único por autor y opinión, y no sale del proceso ni se pinta; la alternativa —un contador de posición— rompería BR22.3 | Que alguien pinte o registre el `eventId` |
| Una derivación por emisión de C4 aunque no cambie la actividad | El coste es una pasada sobre tres opiniones; comparar revisiones añadiría estado que desincronizar | Que la cuenta crezca a cientos de opiniones: entonces sería una decisión de esa etapa |
| El esqueleto muestra más alto de lo real | Se prefiere a publicar una forma nueva en C1 para un solo consumidor (TS-42) | El recorrido en el teléfono (U6) |
| El paquete importa tipos de C3 y C4 | Es cómo el contrato fija la frontera (C8 § `rule`); el import se borra al compilar | Que alguien lo convierta en un import de valor |

## Assumptions & Open Questions

- `[assumption]` La pantalla no necesita una política de retención porque no retiene nada: el contenido vive en memoria y la actividad se deriva. Si alguna vez se persistiera actividad, esta unidad tendría que declarar su borrado y su plazo, y no lo hace.
- `[assumption]` El mensaje fijo del registro es suficiente para diagnosticar: dice qué falló y de qué unidad, no qué evento. Si hiciera falta distinguir la causa, el contrato tendría que publicar el motivo y entonces sí habría un código por causa.
- `[assumption]` El límite de confianza es el proceso y la memoria del teléfono: si el dispositivo está comprometido, la actividad derivada es legible como cualquier otra pantalla. Lo que se garantiza es que no hay una copia persistida que sobreviva al cierre.
- **Open question para U6**: el recorrido confirma que cambiar de cuenta y volver a Actividad no muestra nada de la cuenta anterior; es una comprobación de comportamiento observable, no de código.

## Sources

- `security-requirements` — `construction/u5-activity/nfr-requirements/security-requirements.md` (NFR3.21–3.23, NFR4.11, NFR9.8).
- `performance-requirements` — `construction/u5-activity/nfr-requirements/performance-requirements.md` (NFR1.16–1.18).
- `tech-stack-decisions` — `construction/u5-activity/nfr-requirements/tech-stack-decisions.md` (TS-39–TS-43).
- `performance-design` — `construction/u5-activity/nfr-design/performance-design.md` (NFR8.16–8.18, NFR2.13–2.14, NFR1.16–1.18).
- `functional-spec` — `construction/u5-activity/functional-design/functional-spec.md` (§ Textos exactos, § Assumptions).
- `rules` — `construction/u5-activity/functional-design/rules.md` (BR21.1, BR21.4, BR21.6, BR23.3, BR23.4, BR24.1–BR24.4).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C8 1.1.0).
