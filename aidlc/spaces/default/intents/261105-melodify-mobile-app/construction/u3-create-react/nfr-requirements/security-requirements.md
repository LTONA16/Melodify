# Requisitos de seguridad, privacidad y diagnóstico — U3 `u3-create-react`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR11, RC-01, RC-02, RC-03, RC-07), de `aidlc/spaces/default/memory/project.md` (§Forbidden: client secret, backend, contenido local, `.env`; §Mandated: token en almacenamiento seguro, textos en español, degradar con mensaje y acción), de `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style), de `inception/domain-design/components.md` (ContentStore, Catalog, AppShell, DesignSystem), de `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C3, C4 1.2.0, C5 y § Revisión 15), de `construction/u3-create-react/functional-design/functional-spec.md` (F13–F20, § Textos exactos, § Assumptions) y de `construction/u3-create-react/functional-design/rules.md` (BR11.2–BR11.11, BR12.1–BR12.7, BR14.1–BR14.10, BR15.1–BR15.4).
> Fecha: 2026-11-15. Etapa: NFR Requirements · Unidad: `u3-create-react` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que esta unidad **sí** toca aunque el motor no emita un artefacto por cada uno:

- **NFR3 — Seguridad**: U3 es la primera unidad que **escribe** con identidad y la primera que pinta texto que no escribió el equipo. Hasta ahora todo lo que se veía era de la siembra.
- **NFR4 — Privacidad**: la unidad decide qué se guarda del borrador y del texto de la persona, y confirma que nada de eso sale del dispositivo ni sobrevive al cierre.
- **NFR9 — Observabilidad**: `observability-requirements.md` no se produce para unidades de tipo `ui`; el logger de U1 sigue siendo la única superficie y aquí se fija qué registra U3.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U3 | Quién lo usa después | Secreto |
|---|---|---|---|
| `authorId` de cada escritura (identidad de quien escribe) | Se lee de `appSession.getSession()`; **nunca** de un campo del formulario ni de un parámetro de ruta | C4 en `createOpinion`, `updateOpinion`, `addComment`, `toggleLike` y `toggleFollow` | No, pero identifica a la persona |
| Texto de la opinión (hasta 500) | Memoria del proceso: vive en el borrador y, al publicar, en C4 | U4, U5, U6 | No |
| Texto del comentario (hasta 300) | Memoria del proceso: vive en la hoja y, al enviar, en C4 | U5, U6 | No |
| Borrador del formulario y de la hoja | Memoria del proceso, en el contenedor y en la hoja | Nadie: muere al cerrar la pantalla o la hoja | No |
| Me gusta y seguimientos | Memoria, dentro de `@melodify/content-store` | U5 (actividad), U6 | No |
| Token de Spotify | **No existe en U3**: lo guarda U4 | U4 | Sí |
| Mensajes de diagnóstico | `app/src/bootstrap/logger.ts` (creado en U1, ampliado en U2) | Todo el proyecto | No |

**La frontera que esta unidad cruza**: hasta U2 la app solo **leía** contenido del equipo. U3 recibe texto de la persona y lo guarda en el mismo almacén que se pinta en todas las pantallas. Eso introduce dos preguntas que U2 no tenía: quién es el autor de lo que se escribe, y qué se hace con un texto que no escribió el equipo.

## NFR3 — Seguridad

### NFR3.12 — El autor de toda escritura sale de la sesión, no del formulario

- La identidad de cada una de las cinco escrituras sale de `appSession.getSession()`, igual que el `viewerId` de lectura de U2 (NFR3.7), y se pasa con el nombre que el contrato le da a cada operación: `createOpinion({ authorId })`, `updateOpinion({ authorId, viewerId })`, `addComment({ authorId })`, `toggleLike({ authorId })` y `toggleFollow({ followerId })` —en el seguimiento el contrato nombra `followerId` porque la ruta es `/authors/{authorId}/follow` y el que sigue es quien llama—. **No** se toma de un campo, de la obra elegida ni de un parámetro de navegación: no hay forma de escribir «como otra persona» desde la interfaz.
- `updateOpinion` recibe **también** el `viewerId`, porque C4 lo exige para recalcular las vistas derivadas; los dos valores son el mismo y salen del mismo sitio (`useViewerId`), no de dos lecturas distintas.
- El `authorId` que llega a C4 no puede quedar vacío: si la sesión no está resuelta, Crear sigue en `Cargando` y no envía nada (BR11.5, NFR1.9).

**Por qué se fija aquí y no en U2**: U2 era la primera unidad que leía con identidad; U3 es la primera que escribe con ella. Si la puerta quedara abierta, cinco operaciones de escritura aceptarían cualquier autor.

### NFR3.13 — Editar está autorizado en dos capas: la vista no lo ofrece y C4 lo rechaza

| Capa | Qué comprueba | Dónde | Qué pasaría si faltara |
|---|---|---|---|
| Vista | «Editar» solo se pinta en la opinión propia | `OpinionCard` con `isOwn` (BR12.1, BR14.2) | Se ofrecería una acción que no puede terminar bien |
| Contrato | `updateOpinion` responde `403` si el `authorId` no es el autor de la opinión | C4 1.2.0 (`packages/content-store/src/store.ts:605-607`) | Una llamada que no pase por la interfaz editaría la opinión de otra persona |

- **Las dos capas existen y se prueban.** C4 ya devuelve `failure(403, 'Solo se puede editar la opinión propia.')` cuando `record.authorId !== input.authorId`, y el contrato C4 1.2.0 lo declara. La vista, además, no ofrece la acción a una opinión ajena. Ninguna de las dos es la única puerta.
- El `authorId` que llega a C4 sale de la sesión (NFR3.12) y `updateOpinion` recibe también el `viewerId` para recalcular los campos derivados; son el mismo valor leído una sola vez.
- El formulario de edición recibe la opinión por `openEdit({ opinionId })` y trabaja siempre sobre el `opinionId` de la entrada vigente.

**Cómo se verifica**: prueba de `OpinionCard` que comprueba que la acción «Editar» no existe con `isOwn: false`; prueba de `content-store` que llama a `updateOpinion` con un `authorId` distinto del autor y comprueba `403` y que el texto de la opinión no cambió; prueba de `CrearScreen` en modo edición que comprueba que el `authorId` enviado es el de la sesión.

### NFR3.14 — El texto de la persona se pinta como texto y no se convierte en nada ejecutable

- Los textos de opinión y de comentario se pintan como `Text`; no hay `WebView`, ni `eval`, ni interpretación de marcado, ni enriquecido. Un texto que contenga `<script>` se lee tal cual (misma regla que NFR3.9 de U2, ahora con texto que escribe la persona y no el equipo).
- **Ninguna URL se construye a partir de un texto.** La portada de la opinión propia sigue decidiéndose con `coverFor(workId)` y, sin sesión de Spotify, cae al bloque con la inicial (BR5.3); el texto escrito no participa.
- Los topes de longitud se validan **dos veces**: el campo no acepta el carácter 501 ni el 301 (`maxLength`, BR11.3, BR14.4) y C4 responde `422` si una llamada directa los supera (BR11.3, BR14.4, C4 1.2.0). Una sola de las dos no basta: el campo protege a la persona, el almacén protege al contrato.
- El recorte precede a la comprobación: un texto de solo espacios no se envía y «Publicar» sigue deshabilitado (BR11.2, BR12.7).

**Cómo se verifica**: prueba de `MultilineField` que comprueba que no admite el carácter 501; prueba de `content-store` que comprueba `422` con 501 caracteres y con 301 en `addComment`; prueba de render con un texto que contiene `<script>` que comprueba que se lee literal.

### NFR3.15 — Sin secretos nuevos y sin sesión de Spotify

- U3 **no** lee `EXPO_PUBLIC_*`: el client ID de Spotify se usa en U4. `.env.example` sigue documentándolo sin valor (NFR3.1 de U1, NFR3.10 de U2).
- `@melodify/app-shell`, `@melodify/design-system` y `@melodify/content-store` **no** importan `@melodify/spotify`; en U3 no hay puerto de búsqueda, así que el buscador **ni se monta** y `searchWorks` no se llama (BR13.5): `catalog.searchWorks` solo se alcanza cuando U4 conecte la sesión y el puerto, y su respuesta `offline` no llega a pintarse en esta unidad.
- La `ConnectionCard` de Crear pinta «Conectar con Spotify» y **su acción no responde hasta U4** (BR11.9, `functional-spec.md` § Textos exactos): no abre una pantalla de autorización, ni pide un token, ni guarda nada.
- No hay cabecera de autorización, ni cliente HTTP propio, ni token en memoria en esta unidad; las cinco escrituras son locales.

**Cómo se verifica**: revisión de imports de los tres paquetes y de `app/src/` (la búsqueda de `EXPO_PUBLIC_` solo aparece donde U4 la use); prueba de la `ConnectionCard` que comprueba que su acción no cambia ningún estado observable.

### NFR3.16 — Nada nuevo se escribe en el teléfono

| Regla | Cómo se cumple en U3 |
|---|---|
| No se añade ningún mecanismo de persistencia. | `@melodify/content-store`, `@melodify/design-system` y `@melodify/app-shell` no importan `expo-secure-store`, `AsyncStorage` ni `expo-file-system` (RC-03). |
| El borrador vive en memoria. | Lo posee `CrearScreen` y, en la hoja, la propia hoja; no se escribe en ningún sitio hasta enviar (BR11.1, BR14.3). |
| El texto publicado vive en memoria. | C4 lo guarda en el proceso y se pierde al recargar (RC-03, BR11.5). |
| La única escritura en disco de la app sigue siendo el recuerdo de sesión de C3. | U3 no escribe: envía a C4 y pinta. «Cerrar sesión» **borra** por `appSession.signOut()`, no escribe. |

**Cómo se verifica**: revisión de los `package.json` (sin dependencias de almacenamiento) y de los imports de los tres paquetes y de `app/src/`: ni `expo-secure-store`, ni `AsyncStorage`, ni `expo-file-system` fuera de `@melodify/app-session`. Además, si en algún momento se introduce un puerto de almacenamiento, su doble de prueba comprueba que la escritura de una opinión no lo llama; hoy no existe tal puerto y no se propone una prueba que pasaría siempre, porque `team.md` § Testing Posture prohíbe las aserciones que no pueden fallar.

## NFR4 — Privacidad

### NFR4.7 — Inventario actualizado de lo que queda escrito en el teléfono

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | Sí (heredado de U1) | Almacenamiento seguro, clave de la sesión | Al cerrar sesión (F3) |
| Opiniones, autores, me gusta, comentarios y seguimientos de la siembra | **No** | Memoria del proceso | Al recargar (RC-03) |
| **Texto de la opinión que escribe la persona** | **No** | Memoria del proceso | Al recargar |
| **Texto del comentario** | **No** | Memoria del proceso | Al recargar |
| **Borrador del formulario y de la hoja** | **No** | Memoria del proceso; la hoja lo descarta al cerrarse | Al cerrar la hoja o al recargar |
| Obras de ejemplo y decisión de portada | **No** | Memoria del proceso | Al recargar |
| Estado de red | **No** | Memoria del proceso | Al recargar |
| Token de Spotify | Todavía no (U4) | Almacenamiento seguro, clave del token | Al desconectar |

**U3 no añade ninguna fila persistida.** Añade tres filas en memoria —opinión, comentario y borrador— y las tres desaparecen al recargar. Si en una revisión futura alguien introdujera un borrador en disco «para no perder lo escrito», esta tabla y RC-03 dejarían de ser ciertas: la decisión tendría que tomarla una etapa, no un detalle de implementación.

### NFR4.8 — Nada de lo que escribe la persona sale del dispositivo

- Las cinco escrituras de U3 van a C4, que vive en el proceso: no hay petición, ni socket, ni cola, ni fichero.
- El texto no viaja a Spotify, ni siquiera en U4: la búsqueda solo envía la **consulta de obra**, no la opinión ni el comentario (`functional-spec.md` § Alcance, BR13.5).
- El registro de diagnóstico no se lleva el texto (NFR9.6).
- La app no promete lo contrario en ningún texto: el recorrido del teléfono incluye cerrar la app y comprobar que todo se ha perdido (AC7.1.4, FR7.6).

## NFR9 — Diagnóstico y observabilidad

Se cumple con el logger que entregó U1 y que U2 amplió con `AppLogCode` (NFR9.1–NFR9.5). Esta unidad **no** añade otra superficie.

### NFR9.6 — Qué se registra y qué no en esta unidad

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| Error al publicar (F13, paso 7) | Sí, «No pudimos publicar tu opinión.» con «Reintentar» | No: C4 devuelve un resultado esperado, no un defecto interno |
| Error al guardar (F17, paso 9) | Sí, con «Reintentar» | No, misma razón |
| Error al cargar la edición (F17, paso 8) | Sí, «No pudimos cargar tu opinión.» con «Reintentar» | No: el `404` es un estado previsto del contrato |
| Búsqueda fallida (F14) | Sí, «No pudimos buscar en Spotify.» con «Reintentar» | Sí, con `warn`, código `SEARCH_PORT_UNAVAILABLE`, **solo** cuando el puerto falta o la consulta falla por un defecto interno; un `offline` previsto no se registra |
| Error al cargar o enviar un comentario (F18) | Sí, con «Reintentar» | No: son resultados esperados del contrato |
| Fallo de me gusta o de seguimiento (F19, F20) | Sí, snackbar sin acción (desviación registrada) | No |
| Sin conexión (F13, F18) | Sí, aviso informativo | No |

**Qué se añade a `AppLogCode`.** U2 declaró la unión de la app en `app/src/bootstrap/logger.ts` y dejó dicho que U3 y U5 la amplían cuando necesiten sus códigos. U3 añade **uno solo**:

```ts
export type AppLogCode =
  | SessionLogCode
  | "CONTENT_SUBSCRIBE_FAILED"
  | "CONTENT_READ_FAILED"
  | "NETWORK_STATE_UNAVAILABLE"
  | "SEARCH_PORT_UNAVAILABLE";
```

`SessionLogCode` no se reabre: los cuatro códigos de sesión siguen siendo de C3. `AppLogger` sigue siendo asignable a `SessionLogger`, y la línea de comprobación `const asSession: SessionLogger = logger;` de U2 sigue valiendo.

**Lo que nunca se registra**: el texto de una opinión, el de un comentario, el borrador, el `viewerId` completo, ni el identificador de obra de cada tarjeta. El logger registra **el fallo y su origen**, no el dato (NFR4.6 de U2, ahora con texto de la persona).

## Consideraciones de amenaza de esta unidad

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Escribir como otra persona | La identidad se deriva de `appSession` en el punto de llamada (NFR3.12); no hay campo ni ruta con la que cambiarlo |
| Editar la opinión ajena desde una llamada directa al almacén | C4 responde `403` cuando el `authorId` no es el autor (NFR3.13), y la vista además no ofrece la acción |
| Colar contenido ejecutable por el campo de texto | Todo se pinta como `Text`, ninguna URL sale de un texto, y el texto largo se rechaza en el campo y en C4 (NFR3.14) |
| Dejar el texto de la persona en disco sin decisión | Ningún paquete de U3 escribe; el inventario no crece (NFR3.16, NFR4.7) |
| Filtrar el texto por el registro de diagnóstico | El logger registra el fallo, no el dato (NFR9.6) |
| Publicar dos veces la misma obra | La comprobación `YaOpinada` y el `409` de C4 (BR11.6) |
| Que una escritura fallida borre lo escrito | `ErrorEnvio`, `ErrorGuardado` y el reintento del comentario conservan el texto (NFR1.10) |

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| `authorId` derivado, no recibido | `useCardActions` + `appSession.getSession()` | Escribir como otra persona |
| «Editar» solo con `isOwn`, y `403` en C4 si el autor no coincide | `OpinionCard` (BR12.1, BR14.2) + `content-store` `updateOpinion` | Abrir el formulario de una opinión ajena, o editarla sin pasar por la vista |
| Doble tope 500/300 | `MultilineField` + C4 1.2.0 (`422`) | Guardar lo que el formulario prohíbe |
| Todo se pinta como texto | `OpinionCard`, `CommentSheet` | Contenido ejecutable |
| Sin persistencia nueva | Los tres paquetes que toca U3 | Dejar texto en disco sin decisión |
| `SEARCH_PORT_UNAVAILABLE` acotado | `useWorkSearch` + `logger.ts` | Ruido de diagnóstico por un `offline` previsto |
| Un solo snackbar | Cáscara (BR15.1) | Avisos acumulados que tapen la barra |

## Assumptions & Open Questions

- `[assumption]` `updateOpinion` autoriza por `authorId`: acepta la edición solo si coincide con el autor de la opinión y responde `403` en caso contrario (NFR3.13). La vista, además, no ofrece la acción. La comprobación vive en el almacén y no en la tarjeta, que es donde tendría que estar si algún día hubiera cuentas reales o un servidor.
- `[assumption]` La `ConnectionCard` de Crear no pide nada a Spotify hasta U4; si U4 conectara la acción, la autorización seguiría siendo de PKCE y el token seguiría en almacenamiento seguro (NFR3.2 de U1, `project.md` § Mandated).
- `[assumption]` El texto de la persona no pasa por ninguna normalización que pudiera sorprender: se recorta en los extremos y se guarda tal cual; los saltos de línea se conservan porque `MultilineField` es multilínea.
- **Open question para U4**: cuando exista la sesión real, la búsqueda enviará a Spotify la consulta de obra. Aquí se fija que **nunca** se envía el texto de una opinión ni de un comentario; U4 no debe ampliar el puerto con ese dato.
- **Open question para U5**: la Actividad mostrará el me gusta recibido; el me gusta propio no se puede dar desde la interfaz (Q3 = A), y si eso cambiara, esta unidad tendría que revisar la regla de acciones de la opinión propia (TS-26).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR11, RC-01, RC-02, RC-03, RC-07).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§Forbidden: client secret, backend, contenido local, `.env`; §Mandated: token en almacenamiento seguro, textos en español, degradar con mensaje y acción).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§Testing Posture: nada de aserciones que siempre pasan; §Code Style: sin `console.log` de depuración).
- `components` — `inception/domain-design/components.md` (ContentStore, Catalog, AppShell, DesignSystem).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.3.0, C2 1.3.0, C3, C4 1.2.0 con los dos topes, C5, § Revisión 15).
- `functional-spec` — `construction/u3-create-react/functional-design/functional-spec.md` (F13–F20, § Textos exactos, § Assumptions).
- `rules` — `construction/u3-create-react/functional-design/rules.md` (BR11.2–BR11.11, BR12.1–BR12.7, BR14.1–BR14.10, BR15.1–BR15.4).
