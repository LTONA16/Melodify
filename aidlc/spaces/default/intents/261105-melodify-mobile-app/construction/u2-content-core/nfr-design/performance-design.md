# Diseño de rendimiento, usabilidad y fiabilidad — U2 `u2-content-core`

> **Provenance**: deriva de `nfr-requirements/performance-requirements.md` (NFR8.4–8.7, NFR2.4–2.6, NFR1.4–1.8, NFR6.5–6.6 y los heredados NFR8.1–8.3, NFR2.3, NFR6.1–6.3), de `nfr-requirements/tech-stack-decisions.md` (TS-17 a TS-22), de `nfr-requirements/security-requirements.md` (NFR9.4, para los fallos que se registran), de `functional-design/functional-spec.md` (F7–F12, § Máquina de estados de una pantalla, § Precisión a C2), de `functional-design/rules.md` (BR4.7, BR5.2–BR5.4, BR6.2–BR6.4, BR7.6, BR7.9, BR7.10, BR8.4, BR8.7, BR10.1–BR10.4) y de `inception/contract-design/contract-summary.md` (C1 1.2.0, C2 1.2.0 con la § Revisión 13, C4, C5 1.1.0, C6 1.0.0).
> Fecha: 2026-11-12. Etapa: NFR Design · Unidad: `u2-content-core` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Qué resuelve este diseño

Los requisitos dicen **qué** hay que cumplir; este archivo dice **cómo**, con las decisiones que Code Generation no debe tener que tomar por su cuenta. Cuatro cosas:

1. **Que el feed no espere a nadie**: cómo se lee una fuente externa a React sin temporizador de cortesía y sin quedarse en blanco (NFR8.4, NFR8.1–8.3).
2. **Que las consultas no se multipliquen**: cuántas veces se suscribe, cuántas se pregunta por una portada y qué invalida ese cálculo (NFR8.5, NFR8.7).
3. **Que cada pantalla se pueda recorrer y reintentar**: destinos en dos toques, un error que dice qué pasó, y un estado que se lee sin adivinar (NFR2.4–2.6).
4. **Que nada de lo cargado se pierda**: sin conexión, al volver de un detalle y al repintar (NFR1.4–1.8, NFR6.5–6.6).

**Lo que no se diseña aquí**: la escalabilidad (`scalability-requirements` no se produjo para una unidad `ui`, y no hay nada que escalar: contenido en memoria, sin servidor, una persona), la fiabilidad de servicio y la observabilidad de servicio (filtradas por `produces_kinds`; la observabilidad de esta unidad vive en `security-design.md` § NFR9). El detalle de por qué su ausencia es una decisión y no un olvido está en `logical-components.md` § Alcance.

## NFR8.4 — La suscripción que no espera

### La forma del hook

C4 emite el contenido **al establecerse la suscripción** (C4 `/changes`, BR4.7). El hook no pide nada, no resuelve ninguna promesa y no programa ninguna comprobación: se suscribe en el efecto y guarda lo que llega.

```text
// Ilustrativo, no implementación. app/src/state/useContent.ts
const [feed, setFeed] = useState<FeedState>({ status: "loading" });
useEffect(() => {
  if (!viewerId) return;                       // sin identidad no se suscribe: C4 responde 422
  let stop: (() => void) | undefined;
  try {
    stop = contentStore.subscribeContent(viewerId, (next) =>
      setFeed({ status: "ready", opinions: next.opinions, revision: next.revision }),
    );
  } catch {
    logger.error("CONTENT_SUBSCRIBE_FAILED", "suscripción al contenido fallida");
    setFeed({ status: "error" });
  }
  return stop;
}, [viewerId, attempt]);
```

Cinco decisiones dentro de ese fragmento:

- **`loading` es el estado inicial, no un componente.** El hook arranca en `loading` aunque la emisión llegue en el mismo tick; hay un fotograma de esqueleto y es un estado real (NFR8.4, NFR8.2). No se alarga con `setTimeout`, ni con un retardo mínimo, ni con una animación de entrada.
- **La única espera legítima es el `viewerId`.** Si `useViewerId` todavía devuelve `null`, el efecto no se suscribe y la pantalla sigue en `loading`; en cuanto llega, se suscribe y pasa a `ready` en la misma emisión. Es el caso que NFR1.4 nombra para Perfil y el que ninguna prueba debe confundir con una espera artificial.
- **`subscribeContent` recibe `(viewerId, listener)` y devuelve la baja**, la misma forma en proceso que `subscribeSession(listener)` de C3. La baja se devuelve desde el efecto: desmontar la pantalla no deja una suscripción viva.
- **`attempt` es la palanca de «Reintentar».** Sube en cada reintento y vuelve a ejecutar el efecto; el estado pasa por `loading` antes de `ready`, que es lo que NFR2.5 promete (no un refresco silencioso que deje datos viejos en pantalla).
- **El `catch` existe solo porque el almacén es código propio.** C4 no publica un fallo de suscripción; si `subscribeContent` lanza, es un defecto interno del almacén y se registra como `error` (NFR9.4). El `422` sin `viewerId` no llega aquí: sin identidad no se llama.

### Lo que el esqueleto cubre y lo que no

| Momento | Qué se ve | Cuánto dura |
|---|---|---|
| Montaje con `viewerId` ya resuelto | Esqueleto del feed (3 `Skeleton` + «Para ti») | Un fotograma: hasta el efecto de suscripción |
| Montaje sin `viewerId` | Esqueleto del feed | Hasta que C3 emite la sesión |
| Primer `ready` | Tarjetas con la siembra | — |
| «Reintentar» tras un fallo | Esqueleto otra vez | Hasta la nueva emisión |

**Regla que se verifica en revisión**: ninguna pantalla, hook ni paquete de esta unidad contiene `setTimeout`, `setInterval` ni `await` de cortesía. Una prueba de `InicioScreen` con el `viewerId` resuelto llega a `ready` **sin avanzar temporizadores**.

## NFR8.5 — Las consultas al catálogo, acotadas

### Una suscripción, un contador, un mapeo

C5 publica `subscribe` pero **no publica una revisión**: emite «el catálogo vigente» y no dice si cambió. Por eso el hook añade lo único que falta, un contador, y el mapeo de la pantalla se invalida con dos claves: la revisión del contenido y ese contador.

```text
// Ilustrativo, no implementación. app/src/state/useCatalog.ts
export function useCatalog(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let emissions = 0;
    return catalog.subscribe(() => {
      emissions += 1;
      if (emissions > 1) setVersion((v) => v + 1);   // la 1.ª emisión ES la siembra que ya se pintó
    });
  }, []);
  return version;
}
```

```text
// Ilustrativo, no implementación. app/src/screens/inicio/InicioScreen.tsx
const revision = useContent().revision;
const catalogVersion = useCatalog();
const cards = useMemo(
  () => opinions.map((o) => toOpinionCardModel({ opinion: o, cover: catalog.coverFor(o.workId) })),
  [opinions, revision, catalogVersion],
);
```

- **La primera emisión no incrementa el contador.** La instantánea que `catalog.subscribe` entrega al suscribirse es exactamente el catálogo con el que el hook ya arranca; contarla haría mapear dos veces al montar sin que nada haya cambiado, y la comprobación de NFR8.5 («diez llamadas al construir el feed, ninguna más al repintar») dejaría de ser cierta. El contador cuenta **cambios**, que es lo que C5 no publica; es una precisión del requisito, no una excepción.
- **Una consulta por opinión y ninguna desde la tarjeta.** El mapeo es de la pantalla: `toOpinionCardModel` llama a `coverFor(workId)` una vez por opinión (F12 paso 1) y la tarjeta recibe el modelo resuelto. `OpinionCard` no importa `Catalog` ni recibe la instancia, así que no hay forma de que pregunte por su cuenta.
- **La clave de invalidación es `(opinions, revision, catalogVersion)`.** `opinions` solo cambia cuando cambia `revision`; `catalogVersion` cambia cuando C5 avisa de una portada o de un metadato. Volver a pintar por otra razón —un cambio de red, una tecla, un estado local— no recalcula nada.
- **El detalle de obra no mapea tarjetas**: lee la obra, sus opiniones y el recuento **una vez por obra abierta**, no por tarjeta (F9 paso 3). Su hook solo vuelve a leer cuando cambia la revisión del contenido o cuando cambia la obra; la portada se resuelve una vez por `(workId, catalogVersion, online)`.
- **Sin `useSyncExternalStore`.** Esa API pide un `getSnapshot` síncrono que devuelva el valor vigente con la misma referencia, y ni C4 ni C5 lo publican (TS-19). La suscripción que emite al establecerse cubre el mismo hueco sin inventar un snapshot: la emisión entre render y suscripción **no existe** en C4, C5 ni C6 porque la propia suscripción la entrega.

### El presupuesto de consultas, en números

| Escenario | Suscripciones | `coverFor` | `listOpinions` |
|---|---|---|---|
| Montar Inicio con 10 opiniones | 1 a C4 + 1 a C5 + 1 a C6 | 10 | 1 (la del feed) |
| Repintar tras un cambio de red | 0 | 0 | 0 |
| Repintar tras una emisión de catálogo | 0 | 10 (las tarjetas se reconstruyen) | 0 |
| Abrir y cerrar un detalle de obra | 1 a C4 (la del detalle) | 1 (la de la cabecera) | 1 (la de la obra) |
| Cambiar de pestaña y volver | 0 (la raíz sigue montada, NFR1.7) | 0 | 0 |

`coverFor` no toca la red en U2: sin `SpotifyResolvePort` la decisión es local (bloque de inicial o la `coverUrl` sembrada). En U4 la decisión sí consultará a Spotify, y el número de consultas por repintado seguirá siendo cero porque la invalidación no cambia: la resolución la sigue disparando el aviso de C5.

## NFR8.6 — El resto del recorrido sigue sin número

Abrir un detalle, volver y cambiar de pestaña se juzgan como NFR8 está aprobado: **no se percibe una congelación** al recorrerlo en el teléfono. Este diseño no fija mediana, ni percentil, ni umbral, y **ninguna prueba automática falla por tiempo** (las dos que podrían medir algo —la primera emisión y el mapeo— cuentan llamadas, no milisegundos). Se demuestra en el paso manual de F13/§ Recorrido en el teléfono, que ya existe.

## NFR8.7 — El feed con `FlatList`

`InicioView` pinta el feed con un `FlatList` de React Native, con `keyExtractor` por `opinionId`, `ListEmptyComponent` con el `EmptyState` y `ListHeaderComponent` con el banner de metadatos y el de sin conexión (en ese orden). Sin `getItemLayout`: con 8–10 tarjetas de altura variable no aporta, y fijarlo obligaría a conocer una altura que el texto de una opinión no garantiza. Ninguna pantalla de la unidad implementa su propia lista para el feed; U4 y U5 reutilizan la pieza en sus listas en vez de inventar otra (TS-22).

## NFR8.1 a NFR8.3 — El arranque no empeora

| Paso del arranque | Qué añade U2 | Coste |
|---|---|---|
| Construir `connectivity` | `createConnectivity({ network })`; la lectura inicial es asíncrona y **no bloquea** el primer fotograma | Una llamada al adaptador, resuelta después de pintar |
| Construir `contentStore` | Siembra en memoria: 5 autores, 8 obras, 10 opiniones, 4 me gustos, 3 comentarios y 2 seguimientos | Microsegundos, sin lectura de disco |
| Construir `catalog` | Referencias a las otras dos instancias y los tres puertos en `null` | Nada: no lee ni resuelve |
| Registrar las pantallas | Dos pantallas nuevas y dos detalles ya registrados | Lo mismo que U1 |

- **La siembra se construye al importar `instances.ts`**, no en el primer render: el feed no paga la construcción, la paga el arranque, que es exactamente el presupuesto de 2 s de NFR8.1. Si en el teléfono esa construcción se notara, se difiere a la primera pantalla que la use, sin subir el presupuesto (es la suposición de `performance-requirements.md`).
- **La red no retrasa nada.** `createConnectivity` arranca en línea y emite el estado del sistema cuando la lectura resuelve (BR6.3); el aviso de sin conexión aparece cuando ya se sabe, nunca bloquea la pantalla.
- **No se añade un `hideAsync` nuevo ni una pantalla de carga propia**: el splash y la decisión Login/Inicio siguen siendo los de U1.

## NFR2.4 — Todo lo de esta unidad, en dos toques

| Acción | Camino diseñado | Toques |
|---|---|---|
| Abrir una opinión del feed | Toda la tarjeta es el objetivo táctil; no hay un icono «ver» aparte | 1 |
| Volver del detalle a la misma posición | «‹ Volver» fijo en la cabecera del detalle, o atrás del sistema | 1 |
| Abrir el detalle de una obra | Solo cuando U4 le dé entrada desde Explorar (en U2, desde prueba) | 1 |
| Ver Perfil | Barra inferior siempre visible | 1 |
| Reintentar el feed, el detalle o Perfil | «Reintentar» en el `ErrorState`, en la misma pantalla | 1 |
| Reintentar las portadas | «Reintentar» en el banner de metadatos, bajo la cabecera de Inicio | 1 |
| Cerrar sesión | Perfil → «Cerrar sesión» | 2 |

**Lo que hace posible el «1 toque»**: la tarjeta entera es pulsable (`Pressable` que envuelve a `OpinionCard`, no un botón diminuto dentro); el error no navega a otra pantalla; y el detalle de obra no gana una entrada provisional que luego haya que quitar.

## NFR2.5 — El error que se pinta y el que no

La regla es la de U1, aplicada a cuatro pantallas: **se pinta solo lo que la persona puede arreglar desde donde está; lo demás se registra**.

| Fallo | ¿Se pinta? | Qué se pinta | Qué se registra |
|---|---|---|---|
| Suscripción al contenido lanza | Sí | `ErrorState` + «Reintentar» | `error`, `CONTENT_SUBSCRIBE_FAILED` |
| Lectura de la obra, la opinión o el autor falla | Sí | `ErrorState` + «Reintentar» | `error`, `CONTENT_READ_FAILED` |
| Obra no encontrada (`404`) | No es un error de pantalla | Cabecera con el título y artista de la opinión + bloque de inicial | Nada: es la degradación prevista |
| Portadas sin resolver | Sí | Banner «No pudimos actualizar las portadas.» + «Reintentar» | No se duplica: `getCoverFailure` ya lo expone |
| Sin conexión | Sí, pero no es un error | `OfflineBanner` informativo, **sin acción** | Nada |
| Módulo de red no disponible | No | Se arranca en línea, sin aviso | `warn`, `NETWORK_STATE_UNAVAILABLE` |

- **El `ErrorState` es el único portador de «Reintentar»** en un fallo de lectura; el banner de portadas tiene el suyo porque su acción es otra (`retryCovers`, no volver a leer el feed). Dos acciones distintas no comparten botón.
- **Ningún mensaje lleva un código técnico**: el texto es llano y en español («No pudimos cargar las opiniones.»), y el código viaja al logger, no a la pantalla.
- **Un fallo de portada nunca es un error de pantalla**: deja la tarjeta completa con el bloque de inicial (NFR1.5) y, como mucho, enciende el banner de metadatos.

## NFR2.6 — El estado se dice con palabras

| Estado | Cómo se dice | Dónde |
|---|---|---|
| Spotify conectado / no | Texto «Conectado» / «Conectar» | Chip de la cabecera de Inicio, único sitio que lo pinta |
| Opinión propia | Etiqueta «Tu opinión» dentro de la tarjeta, además del fondo | Tarjeta `own` |
| Portada caída | Bloque con la inicial de la obra | Tarjeta y cabecera de obra |
| Sin conexión | Frase del banner | Bajo la cabecera de cada pantalla |
| Cargando | Esqueleto con la forma del contenido | Cada pantalla |
| Vacío | Frase + acción («Crear opinión») | `EmptyState` |

Ningún estado de esta unidad se comunica solo con un color o un icono mudo; la etiqueta y el texto son parte del diseño, no un extra.

## NFR1.4 — Ninguna pantalla se queda en blanco

Cada pantalla tiene **un solo valor de estado**, no dos banderas: `loading | ready | error`, con `empty` como variante de `ready` (una lista vacía con su `EmptyState`). Con dos banderas existe el estado imposible «cargando y con datos», y es el que produce una pantalla en blanco.

| Pantalla | `ready` | `empty` | `error` |
|---|---|---|---|
| Inicio | Feed con tarjetas | `EmptyState` + «Crear opinión» | `ErrorState` + «Reintentar» |
| Detalle de obra | Cabecera + tarjeta propia + «Otras opiniones» | «Nadie ha opinado todavía.» + «Opinar sobre esta obra» | `ErrorState` + «Reintentar» |
| Detalle de opinión | Cabecera + tarjeta `detail` | No aplica (una opinión siempre tiene contenido) | `ErrorState` + «Reintentar» |
| Perfil | Identidad + contadores + «Mis opiniones» | «Todavía no has escrito ninguna opinión.» + acción | `ErrorState` + «Reintentar» |

Dos casos límite que el diseño resuelve explícitamente:

- **Detalle con una obra que no está en el catálogo** (`getWork` responde `404`): no se queda cargando. La cabecera usa `workTitle` y `workArtist` de la opinión y el bloque de inicial (BR5.2).
- **Perfil sin `viewerId`**: no se llama a `getAuthor`; la pantalla sigue en `loading` hasta que C3 emite. No se pinta un error por algo que se resuelve solo.

## NFR1.5 — Una portada caída no deja hueco roto

La decisión de portada se toma **una vez por opinión, en el mapeo**, y el componente de portada pinta una de dos cosas con **el mismo tamaño**: la imagen (`kind: "url"`) o el bloque con la inicial (`kind: "initialBlock"`). Nunca hay un contenedor vacío esperando, ni un icono de imagen rota, ni un cuadrado gris: el bloque ocupa el sitio de la imagen desde el primer render.

| Estado de la portada | Qué se pinta | Qué no se pinta |
|---|---|---|
| `url` con valor | Imagen de la portada | Nada más |
| `initialBlock` (sin sesión, sin red o sin `coverUrl`) | Bloque de color con la inicial de la obra | Ningún icono de advertencia |
| Imagen que falla al cargar | Bloque con la inicial (`onError` del componente de portada) | Ningún hueco ni borde roto |

## NFR1.6 — Sin conexión se conserva lo cargado

- **Nada se vacía.** El hook guarda la última emisión; perder la red no emite contenido vacío, así que el feed y el detalle siguen pintando lo que había. Las portadas caen a bloque porque la decisión de C5 consulta C6, y eso se recalcula con la misma clave de invalidación de NFR8.5.
- **El aviso lo pinta cada pantalla bajo su propia cabecera**, con `OfflineBanner` (un `Banner` con el texto único, sin acción). La cáscara **no** lo pinta (C2 1.2.0, § Revisión 13): las raíces de pestaña llevan su `AppHeader` dentro de la pantalla, y un banner de la cáscara quedaría por encima de la cabecera o duplicado. Cuatro pantallas leen `useNetwork`, pero solo la visible pinta el suyo.
- **Al recuperar la red** el aviso desaparece y las portadas vuelven si la decisión lo permite; no hay que reintentar a mano. El estado de red no se guarda: se vuelve a leer.
- **El estado inicial es «en línea»** (BR6.3): mientras la primera lectura no resuelve, no se pinta un aviso que todavía no se sabe si es cierto.

## NFR1.7 — La navegación no pierde lo de abajo

Abrir un detalle y volver devuelve a la pestaña de origen con su desplazamiento porque **la raíz nunca se desmonta**: C2 1.2.0 monta todas las entradas de la pila de la pestaña y oculta las de debajo con `display: none`. El diseño de U2 no añade una restauración de desplazamiento, ni guarda posiciones, ni reinicia el feed al volver: si algo de eso hiciera falta, sería señal de que la raíz se desmontó y el fallo estaría en la cáscara, no en la pantalla.

## NFR1.8 — Una sola fuente por dominio

| Dominio | Fuente única | Hook | Lo que el hook guarda |
|---|---|---|---|
| Sesión | `appSession` (`app/src/bootstrap/session.ts`, R-01) | `useViewerId` | El `authorId` de la última emisión, o `null` |
| Contenido | `contentStore` (`instances.ts`) | `useContent`, `useDetalleObra`, `useDetalleOpinion`, `usePerfil` | La última emisión de C4 |
| Catálogo | `catalog` (`instances.ts`) | `useCatalog` | El contador de versiones |
| Red | `connectivity` (`instances.ts`, inyectada en `ShellServices`) | `useNetwork` | El último booleano |

- **No hay `createContext` en `app/src/state/`** y ninguna pantalla construye su propio almacén: se importa la instancia del punto de composición (TS-18) y las pruebas la sustituyen con `jest.mock`. Un contexto de contenido sería una segunda verdad (ADR-005 se refería al estado propio de la interfaz, que la cáscara ya resuelve).
- **El estado de React es una copia de lectura**, no un segundo almacén: el hook no recalcula `isOwn` ni `likeCount`, ni filtra la lista; pinta lo que C4 emitió.
- **Cada hook se da de baja al desmontarse** devolviendo la función que entrega la suscripción, así que dos pantallas que lean el mismo dominio ven la misma emisión y no queda ninguna suscripción huérfana.

## NFR6.5 / NFR6.6 — Accesibilidad de las piezas nuevas

| Requisito | Cómo se cumple |
|---|---|
| **NFR6.5 — «‹ Volver» táctil** | El botón de la cabecera de detalle toma su altura de `size.touch` (44) y su texto visible es «‹ Volver»; el glifo no es el objetivo. No se añade etiqueta de lector de pantalla: NFR6 la deja fuera de esta versión. |
| **NFR6.6 — No solo color** | La tarjeta propia lleva «Tu opinión» además del `primaryContainer`; el aviso de sin conexión lleva texto; la portada caída lleva su inicial; el chip lleva su palabra. |
| **NFR6.1 — Contraste** | «Tu opinión» y la línea de fechas usan `onPrimaryContainer` sobre `primaryContainer`, el par que TS-14 ya verificó en ambos temas; si un par no llegara a 4.5:1 se corrige en el sistema de diseño, no en la pantalla. |
| **NFR6.3 — Tema del sistema** | Las piezas nuevas usan roles semánticos (`color.primaryContainer`, `color.text`), nunca valores crudos, así que el tema oscuro las cubre sin trabajo propio. |

## Presupuesto en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Feed | Sin número; la siembra llega en la misma suscripción | Prueba de la primera emisión, sin temporizadores |
| Portadas | Sin número; una consulta por opinión y ninguna por repintado | Prueba con un catálogo doble que cuenta llamadas |
| Detalles, Perfil y cambio de pestaña | Sin número; sin congelación perceptible | Recorrido en el teléfono |
| Arranque en frío | ≤ 2 s de NFR8.1, sin lectura nueva | Cronómetro, si se vuelve a medir al cerrar el Bolt |

## Assumptions & Open Questions

- `[assumption]` C4, C5 y C6 emiten la instantánea vigente en el mismo tick en que se suscriben (BR4.7, BR6.2), y C3 emite en cuanto tiene valor. Si alguna no lo hiciera, su hook se quedaría en `loading` hasta el primer cambio; es una condición del contrato y se comprueba en las pruebas de cada paquete, no una suposición sobre el runtime.
- `[assumption]` Construir la siembra (5 autores, 8 obras, 10 opiniones) al importar `instances.ts` no se nota en el arranque de 2 s; si se notara, se difiere a la primera pantalla que la use, sin subir el presupuesto.
- `[assumption]` `FlatList` con 8–10 tarjetas de altura variable no necesita `getItemLayout`; si el desplazamiento se notara, se añade después sin cambiar props.
- **Open question para U4**: la primera resolución real de portadas tocará la red y tendrá su propia espera; si U4 quiere un presupuesto para ella, lo decide en su etapa de NFR y no se hereda de aquí.
- **Open question para U3**: las escrituras (`createOpinion`, `toggleLike`, `addComment`, `toggleFollow`) se leerán con el patrón de TS-19; U3 no debe introducir un segundo mecanismo de suscripción ni un temporizador para «refrescar».

## Sources

- `performance-requirements` — `construction/u2-content-core/nfr-requirements/performance-requirements.md` (NFR8.1–8.7, NFR2.3–2.6, NFR1.4–1.8, NFR6.1–6.6).
- `security-requirements` — `construction/u2-content-core/nfr-requirements/security-requirements.md` (NFR9.4, para la tabla de fallos que se registran).
- `tech-stack-decisions` — `construction/u2-content-core/nfr-requirements/tech-stack-decisions.md` (TS-17 a TS-22).
- `functional-spec` — `construction/u2-content-core/functional-design/functional-spec.md` (F7–F12, § Máquina de estados de una pantalla, § Precisión a C2).
- `rules` — `construction/u2-content-core/functional-design/rules.md` (BR4.7, BR5.2–BR5.4, BR6.2–BR6.4, BR7.6, BR7.9, BR7.10, BR8.4, BR8.7, BR10.1–BR10.4).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.2.0, C2 1.2.0 con § Revisión 13, C4, C5 1.1.0, C6 1.0.0 con `x-construction`).
