# Diseño de rendimiento, usabilidad y fiabilidad — U3 `u3-create-react`

> **Provenance**: deriva de `nfr-requirements/performance-requirements.md` (NFR8.8–8.11, NFR2.7–2.9, NFR1.9–1.11 y los heredados NFR8.1, NFR8.7, NFR2.5, NFR2.6, NFR1.4), de `nfr-requirements/security-requirements.md` (NFR9.6, para los fallos que se registran), de `nfr-requirements/tech-stack-decisions.md` (TS-23 a TS-30), de `functional-design/functional-spec.md` (máquina de estados del formulario, la hoja de comentarios, F13–F20, § Textos exactos, § Assumptions), de `functional-design/rules.md` (BR11.1–BR11.11, BR12.1–BR12.7, BR13.1–BR13.5, BR14.3–BR14.10, BR15.1–BR15.4), de `functional-design/frontend-components.md` (§ Capa de estado, § `app/src/comments/`, § Flujos de interacción) y de `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C4 1.2.0, C5, § Revisiones 15 y 16).
> Fecha: 2026-11-15. Etapa: NFR Design · Unidad: `u3-create-react` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Qué resuelve este diseño

Los requisitos dicen **qué** hay que cumplir; este archivo dice **cómo**, con las decisiones que Code Generation no debe tener que tomar por su cuenta:

1. **Que escribir no parezca lento**: dónde vive el borrador, cuándo se habilita el botón y en qué orden se navega y se confirma (NFR8.8, NFR1.10).
2. **Que la búsqueda no dispare una petición por pulsación**: el temporizador del hook, la cancelación y el descarte de respuestas tardías (NFR8.9).
3. **Que un aviso no tape la app ni se acumule**: un solo snackbar de 4 s, y dentro del modal cuando la hoja está abierta (NFR8.10).
4. **Que ninguna pantalla nueva se quede sin salida**: los estados de Crear y de la hoja, cada uno con su salida, y el cierre que devuelve el detalle intacto (NFR1.9, NFR1.11, NFR2.7–2.9).

**Lo que no se diseña aquí**: la escalabilidad (`scalability-requirements` no se produjo para una unidad `ui` y no hay nada que escalar), y la fiabilidad y la observabilidad de servicio, filtradas por `produces_kinds`; sus objetivos viven en este archivo (§ NFR1) y en `security-design.md` § NFR9. El detalle de por qué su ausencia es una decisión está en `logical-components.md` § Alcance.

## NFR8.8 — Escribir no espera

### La forma del formulario

`CrearScreen` no espera a ninguna escritura porque no hay escritura que esperar: las cinco operaciones de C4 son síncronas y devuelven un `ContentResult`. El hook de la pantalla guarda el borrador y, al enviar, llama y actúa con el resultado en el mismo gesto.

```text
// Ilustrativo, no implementación. app/src/screens/crear/useCrear.ts
const submit = (): void => {
  const draft = { workId, text: text.trim(), rating };
  if (!isComplete(draft)) return;                     // el botón ya estaba deshabilitado
  const result = content.createOpinion({ ...draft, authorId, workTitle, workArtist });
  if (!result.ok) { setStatus({ kind: "errorEnvio", code: result.status }); return; }
  shell.goToTab({ name: "inicio" });                      // publicar vuelve a Inicio (BR11.5), no a returnTo
  shell.showSnackbar({ message: "Opinión publicada" });   // después del cambio, o se pierde el aviso
  // (BR15.1: un cambio de pestaña limpia el mensaje pendiente)
};
```

Cinco decisiones dentro de ese fragmento:

- **No hay estado «enviando».** Ninguno de los cinco caminos de escritura devuelve una promesa que la pantalla espere (NFR8.8), así que no se pinta un estado intermedio ni un esqueleto sobre el botón. Un estado «enviando» que nunca se ve sería código muerto.
- **El botón se deshabilita por formulario incompleto, no por escritura en curso.** `validateOpinionDraft` (TS-30) decide; el único motivo por el que «Publicar» no responde es que falte obra, texto o valoración (BR11.2, BR11.4).
- **La confirmación se pide después de navegar, y publicar no usa `closeCreate()`.** Publicar vuelve **a Inicio** con `goToTab({ name: "inicio" })` —la opinión queda arriba del feed, BR11.5, AC5.1.4—, aunque se haya abierto desde el detalle de una obra (F15: al publicar se va a Inicio, no al detalle). `closeCreate()` es el cierre de «Guardar» y «Cancelar», que sí vuelven a `returnTo` (BR12.3, BR12.6). En los dos casos el aviso se pide **después** del cambio de pantalla: al revés, el cambio de pestaña limpiaría el mensaje pendiente y la confirmación no se vería (BR15.1).
- **`errorEnvio` conserva todo el borrador.** El estado no guarda una copia: el borrador sigue en el hook y `errorEnvio` solo añade el aviso. «Reintentar» reenvía los mismos valores (NFR1.10, BR11.7).
- **El `authorId` se lee una vez, al enviar.** No se guarda en el borrador: si la sesión no está resuelta, Crear sigue en `Cargando` y no se envía nada (NFR3.12, BR11.5).

### Guardar y comentar siguen la misma regla

| Camino | Qué se llama | Qué pasa después |
|---|---|---|
| Publicar (F13) | `createOpinion` | Cáscara → Inicio; entonces snackbar «Opinión publicada» |
| Guardar (F17) | `updateOpinion` | Cáscara → detalle; entonces snackbar «Opinión actualizada» |
| Comentar (F18) | `comments.submit(text)` → `addComment` | La lista ya trae el comentario; la cáscara pide «Comentario publicado» con el `true` que devuelve `submit` |
| Me gusta y seguir (F19, F20) | `toggleLike`, `toggleFollow` | La tarjeta se repinta con la emisión de C4; `useCardActions` pide la confirmación de seguimiento («Ahora sigues a @ana» / «Ya no sigues a @ana») o el aviso de fallo, en el mismo gesto |

**Regla que se verifica en revisión**: ninguna de las cinco llamadas se envuelve en `await`, ni en `Promise.resolve`, ni en un `setTimeout` de cortesía. Una prueba que toca «Publicar» ve el resultado **sin avanzar temporizadores**, y eso incluye el snackbar: su temporizador empieza después, no antes.

## NFR8.9 — La búsqueda hace una petición por pausa

### El hook

```text
// Ilustrativo, no implementación. app/src/state/useWorkSearch.ts
useEffect(() => {
  const query = text.trim();
  latest.current = query;                             // la consulta vigente
  if (query.length < 2) { setResult({ kind: "idle" }); return; }
  let discarded = false;                              // el efecto se limpió: nadie pinta esto
  const handle = setTimeout(async () => {
    if (query !== latest.current) return;             // superada antes de llamar
    setResult({ kind: "searching" });
    const outcome = await search.searchWorks(query);  // C5 devuelve Promise<SearchResult>
    if (discarded || query !== latest.current) return; // superada mientras respondía
    setResult(toSearchResult(outcome));
  }, 400);
  return () => { discarded = true; clearTimeout(handle); };
}, [text, search]);
```

Cinco decisiones:

- **Dos caracteres y 400 ms antes de llamar** (BR13.1). Cada pulsación limpia el temporizador anterior por el `return` del efecto; no hay `debounce` de librería (TS-29).
- **`searchWorks` es asíncrona y se espera dentro del temporizador.** `catalog.searchWorks(query): Promise<SearchResult>` (`packages/catalog/src/catalog.ts:77`), así que el hook abre el estado `searching` —con sus esqueletos, F14 paso 4— antes de esperar y escribe el resultado cuando la promesa resuelve. No se pinta un resultado antes de tenerlo ni se finge una respuesta síncrona.
- **El descarte se decide por la consulta vigente, y se comprueba dos veces: antes de llamar y después de resolver.** La comparación que importa es la de **después** del `await`: si mientras C5 respondía la persona siguió escribiendo, `latest.current` ya es otra consulta y el resultado se tira sin pintarse (BR13.4). El `discarded` cierra el caso del desmontaje o del cambio de pantalla. Con el puerto de U3 en `null` este camino no se alcanza en el teléfono, pero es el que U4 va a usar tal cual (BR13.5).
- **La caché es de C5, no del hook.** Repetir la misma consulta no produce petición nueva ni indicador de carga (BR13.1); el hook no guarda resultados propios, para no tener dos verdades sobre lo buscado.
- **Sin puerto, el hook no se monta.** En U3 el buscador no existe si la sesión de Spotify no está conectada (BR13.5): se pinta la tarjeta de conexión y el selector de ejemplo. El hook sabe responder a un puerto ausente o a un `offline` —lo prueba su prueba de unidad—, pero ese estado no se alcanza en el teléfono hasta U4.

**La prueba que distingue este hook de un antirrebote**: un puerto doble cuya `searchWorks` devuelve promesas que la prueba resuelve **a mano y fuera de orden**. Se teclea «ab», se avanza 400 ms (la consulta sale, queda pendiente), se teclea «abc», se avanza 400 ms (sale la segunda), se resuelve primero la segunda y después la primera. La aserción es que la lista pintada es la de «abc» y que la resolución de «ab» **no la sustituye**; una prueba que solo avanzara temporizadores con un doble síncrono pasaría también con el defecto que NFR8.9 prohíbe.

## NFR8.10 — Un solo snackbar, cuatro segundos, sin bloquear nada

- **Un mensaje pendiente como máximo.** `showSnackbar` sustituye el anterior en lugar de encolar: la cáscara guarda `{ message, visible }` y reinicia el temporizador. Dos confirmaciones seguidas dejan un aviso, no dos (BR15.1).
- **4 s o un toque.** El temporizador se cancela si llega otro mensaje, si cambia la pestaña o si la cáscara se desmonta; el `onDismiss` del componente limpia el estado. Nada de eso bloquea: el botón de debajo sigue siendo pulsable mientras el aviso está visible.
- **Los cambios de pestaña limpian el mensaje.** Es la razón por la que las confirmaciones se piden después de navegar (NFR8.8) y por la que un aviso nunca sobrevive a un cambio de pestaña.
- **Con la hoja abierta, el aviso va dentro del modal.** La cáscara pasa su mensaje pendiente a `CommentSheet.snackbar`; el `Modal` de React Native queda por encima del cuerpo, así que un aviso pintado fuera quedaría detrás del velo (BR14.6, TS-23).

| Momento | Qué se pinta | Cuánto dura |
|---|---|---|
| Publicar o guardar con éxito | Snackbar en la cáscara, tras navegar | 4 s o un toque |
| Comentar con éxito | Snackbar **dentro** de la hoja | 4 s o un toque |
| Seguir con éxito | Snackbar en la cáscara: «Ahora sigues a @ana», con el `handle` del autor en lugar de `ana` | 4 s o un toque |
| Dejar de seguir con éxito | Snackbar en la cáscara: «Ya no sigues a @ana» | 4 s o un toque |
| Fallo de me gusta o de seguimiento | Snackbar sin acción; el control sigue en pantalla | 4 s o un toque |
| Cambio de pestaña | Nada: el mensaje pendiente se limpia | — |

- **Las dos confirmaciones de seguimiento se piden en el mismo gesto que la escritura.** `toggleFollow` es síncrona y devuelve el resultado; con `200`, `useCardActions` pide el aviso y la tarjeta se repinta con el `followedByMe` de C4 (F20 pasos 3 y 4, AC7.3.1 y AC7.3.2). Son los dos únicos avisos que interpolan un dato, y el dato es **solo el `handle` del autor**, que ya está a la vista en la tarjeta; el texto de la opinión y el del comentario no se interpolan en ninguno (NFR3.9). Con `409` —seguirse a uno mismo— no hay aviso de éxito: es el defecto que la vista ya impide, y su camino es el genérico de fallo.

## NFR2.7 — Las acciones de esta unidad, en dos toques

El diseño no añade ningún paso intermedio: los diez caminos de la tabla de requisitos se recorren con los toques que ya fija el flujo funcional. La única decisión de diseño es que **la obra elegida y el texto viven en el mismo formulario**, de modo que «Opinar sobre esta obra» desde el detalle llega con la obra puesta y solo falta texto y valoración (F15).

## NFR2.8 — El error que se pinta y el que no

| Situación | Qué se muestra | Acción |
|---|---|---|
| Publicar, guardar, cargar la edición, buscar, cargar comentarios, enviar un comentario | Mensaje en lenguaje llano junto al punto de fallo | «Reintentar» |
| Me gusta y seguir | Snackbar sin botones | El propio control, que sigue en pantalla |
| Fallo interno (defecto del almacén o del logger) | Nada inventado | Se registra (NFR9.6) |
| Sin conexión en Crear | Aviso informativo | Ninguna: el catálogo de ejemplo es local y el formulario funciona (BR11.11) |

La desviación de me gusta y seguir es deliberada y está declarada en `functional-spec.md` § Assumptions: son acciones de un toque sobre un control que permanece, así que el reintento es volver a tocar, no un botón que gaste un segundo toque de la misma acción.

## NFR2.9 — El estado se dice con palabras

- «Seguir autor» / «Siguiendo» es texto que cambia, no un icono que cambia de color (BR14.10).
- «Sin valorar» / «n de 5» debajo de las estrellas, y «Quitar valoración» como texto (BR11.4).
- «Ya opinaste sobre esta obra.» es una frase con su salida, no un botón deshabilitado sin explicación (BR11.6).
- El contador «N/500» y «N/300» aparece desde 400 y desde 250: el tope no llega por sorpresa (BR11.3, BR14.5).

## NFR1.9 — Ninguna pantalla se queda sin salida

| Estado | Cómo se llega | Salida |
|---|---|---|
| `Cargando` (Crear) | Montaje, visita a la pestaña, `openEdit` | A `Vacio` con identidad resuelta; a `Editando`; a `ErrorCarga` si la opinión no se pudo leer |
| `ErrorCarga` | `getOpinion` falla | «Reintentar» vuelve a `Cargando` |
| `Vacio` | Identidad resuelta, sin obra preseleccionada | Escribir, elegir obra, publicar |
| `ConObra` | Obra elegida | Publicar, cambiar de obra, cancelar |
| `Editando` | `openEdit({ opinionId })` | Guardar, cancelar |
| `ErrorEnvio` | `createOpinion` no `ok` | «Reintentar» vuelve a `ConObra` con el texto intacto |
| `ErrorGuardado` | `updateOpinion` no `ok` | «Reintentar» vuelve a `Editando` con el texto intacto |
| `YaOpinada` | `409`, o la comprobación previa | «Cambiar» va a `Buscando`; «Editar» va a `Editando` con el mismo `returnTo` |
| Hoja: `loading`, `ready`, `empty`, `error`, `failed`, cerrada | `open`, `listComments`, `submit` | ✕, arrastre o velo cierran desde cualquier estado; «Reintentar» en `error` y en `failed` |

**Regla de diseño**: cada estado se representa con un valor de estado, no con dos banderas que puedan contradecirse. `failed` es un booleano **junto a** `status`, no un estado más, porque un fallo de envío no borra la lista ya leída (C2 1.3.0).

## NFR1.10 — Un fallo de escritura no pierde lo escrito

El borrador es del hook, no del resultado. Por eso ningún camino de fallo lo toca:

- `errorEnvio` añade el aviso y deja `workId`, `text` y `rating` en el hook (BR11.7).
- `errorGuardado` hace lo mismo con el texto y la valoración editados; «Reintentar» reenvía los mismos valores (BR12.5).
- `failed` de la hoja deja el texto en el campo de la hoja y la lista cargada en `comments`; el reenvío lo manda tal cual (BR14.9).
- Cerrar la hoja **sí** descarta el borrador del comentario, y es una decisión de la persona, no una pérdida (BR14.3).
- Cambiar de pestaña y volver a Crear abre un formulario limpio porque `formKey` cambió; es una visita nueva, y está dicho (BR11.1, TS-25).

## NFR1.11 — Volver de Crear no pierde el detalle

`closeCreate()` devuelve a `returnTo` **sin reiniciar su pila**, así que el detalle de origen conserva contenido, desplazamiento y estado de suscripción (BR12.3, AC6.1.3, C2 1.3.0). «Cancelar» y el atrás del sistema hacen lo mismo y no escriben nada (BR12.6). Editar desde `YaOpinada` conserva el `returnTo` de la entrada vigente, de modo que «Guardar» vuelve al detalle y no a la pestaña Crear.

## NFR8.11, NFR8.7 y NFR8.1 — Lo heredado sigue sin número

- **Abrir Crear, escribir 500 caracteres, tocar estrellas, abrir la hoja y desplazarla** se juzgan con NFR8: no se percibe congelación en el teléfono. No se fija mediana ni percentil, y ninguna prueba automática falla por tiempo.
- **La lista de comentarios usa `FlatList`** (TS-22, heredado de U2): el scroll de la hoja no monta todos los elementos de golpe.
- **El arranque no empeora**: U3 añade piezas y un controlador que se construye con el resto de servicios, **sin E/S nueva ni petición de red**. La única dependencia del controlador al arrancar es su suscripción a C3, y si la sesión aún no tiene vista guardada lo único que ocurre es la primera lectura de sesión que el arranque ya hace (`packages/app-session/src/app-session.ts:174-180`). Si eso se notara, el controlador se construye de forma perezosa al abrir la hoja; no se sube el presupuesto de 2 s de NFR8.1.

## NFR2.6, NFR2.5 y NFR1.4 — Lo que U3 no cambia en las cuatro pantallas de U2

Estos tres requisitos son de U2 y U3 los hereda; se les asigna sección para que el mapeo de trazabilidad no quede en `GAP`, y para dejar dicho qué protege U3 de ellos al tocar las cuatro pantallas.

- **NFR2.6 — el estado se dice con palabras.** El chip de Inicio sigue diciendo «Conectado» o «Conectar» en texto y **sigue siendo el único sitio que pinta el estado de Spotify** (BR7.9): Crear no añade un segundo chip; cuando no hay sesión pinta la `ConnectionCard`, que es una invitación con su botón, no un indicador de estado. La etiqueta «Tu opinión» y la portada caída al bloque con inicial no cambian. Lo nuevo de U3 sigue la misma regla y se diseña en NFR2.9.
- **NFR2.5 — todo error visible dice qué pasó y ofrece acción.** Las cuatro pantallas conservan sus `ErrorState` con «Reintentar» y el banner de portadas de U2 conserva el suyo; U3 no sustituye ninguna vista ni retira ninguna salida. La única excepción sigue siendo la que U2 ya declaró y U3 no amplía: los fallos de me gusta y de seguimiento se avisan con un snackbar sin acción porque **el propio control sigue en pantalla** y se puede volver a tocar (desviación registrada en `functional-spec.md` § Assumptions).
- **NFR1.4 — ninguna pantalla se queda en blanco.** Las cuatro pantallas mantienen su máquina de estados de U2 (`loading` → `ready` con su variante `empty`, o `error` con «Reintentar»). U3 les añade acciones, no caminos de lectura, así que no puede dejarlas en `loading`: si una acción falla, la pantalla sigue pintada y el aviso va aparte. Los dos hooks nuevos que sí leen —`useWorkSearch` y el controlador de comentarios— siguen el patrón de U2: estado inicial explícito, emisión al establecerse y una salida por cada estado (NFR1.9).

**Regla de diseño que se lee de los tres**: U3 no reabre la máquina de estados de las pantallas de U2; lo que hace es **añadir escrituras** a pantallas que ya saben pintarse. Si alguna tuviera que cambiar de forma para sostener una acción nueva, sería un cambio de C2 y no un ajuste de esta unidad.

## Presupuesto en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Publicar, guardar, comentar, me gusta, seguir | Sin número; sin espera artificial y sin estado intermedio | Pruebas de éxito y revisión del código (NFR8.8) |
| Búsqueda de obra | Una petición por pausa de 400 ms, ninguna por pulsación; respuestas tardías descartadas **al resolver** | Prueba de `useWorkSearch` con temporizadores falsos y un puerto doble que resuelve dos consultas fuera de orden (NFR8.9) |
| Snackbar | 4 s, uno solo, sin bloquear; dentro del modal con la hoja abierta | Prueba de la cáscara y de la hoja con temporizadores falsos (NFR8.10) |
| Lista de comentarios | `FlatList` con scroll interno | Revisión del código y recorrido en el teléfono (NFR8.7) |
| Recorrido completo | Sin congelación perceptible | Recorrido en Expo Go sobre el teléfono (NFR8.11) |
| Arranque en frío | ≤ 2 s, sin lectura nueva | Cronómetro, si se vuelve a medir al cerrar el Bolt (NFR8.1) |

## Assumptions & Open Questions

- `[assumption]` Los temporizadores se prueban con `jest.useFakeTimers()` **dentro de la prueba que los mide**, nunca de forma global: TS-20 sigue vigente y el reloj del almacén es inyectable por su cuenta.
- `[assumption]` El snackbar no se anima: aparece y desaparece. Animar no aporta a NFR8.10 y complica la prueba sin ganar nada.
- **Open question para U4**: la búsqueda real añadirá una espera de red que hoy no existe; si U4 quiere un presupuesto para ella lo decide en su etapa. Los 2 caracteres y los 400 ms ya son de esta pantalla.
- **Open question para U5**: la Actividad confirmará con el mismo snackbar. Si necesitara dos avisos a la vez, es un cambio de BR15.1.

## Sources

- `performance-requirements` — `construction/u3-create-react/nfr-requirements/performance-requirements.md` (NFR8.8–8.11, NFR2.7–2.9, NFR1.9–1.11 y los heredados NFR8.1, NFR8.7, NFR2.5, NFR2.6, NFR1.4).
- `security-requirements` — `construction/u3-create-react/nfr-requirements/security-requirements.md` (NFR9.6).
- `tech-stack-decisions` — `construction/u3-create-react/nfr-requirements/tech-stack-decisions.md` (TS-23 a TS-30).
- `functional-spec` — `construction/u3-create-react/functional-design/functional-spec.md` (F13–F20, máquina de estados, § Textos exactos).
- `rules` — `construction/u3-create-react/functional-design/rules.md` (BR11–BR15).
- `frontend-components` — `construction/u3-create-react/functional-design/frontend-components.md` (§ Capa de estado, § `app/src/comments/`).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C4 1.2.0, C5, § Revisiones 15 y 16).
