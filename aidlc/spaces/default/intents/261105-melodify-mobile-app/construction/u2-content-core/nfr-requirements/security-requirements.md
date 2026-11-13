# Requisitos de seguridad, privacidad y diagnóstico — U2 `u2-content-core`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR11, RC-01, RC-02, RC-03, RC-07), de `aidlc/spaces/default/memory/project.md` (§Forbidden y §Mandated sobre el client secret, el backend y el contenido local), de `inception/domain-design/components.md` (ContentStore, Catalog, Connectivity, AppShell), de `inception/contract-design/contract-summary.md` (C2, C3, C4, C5 1.1.0, C6 y § Revisiones 12 y 13), de `construction/u2-content-core/functional-design/functional-spec.md` (F7–F12, § Semilla) y de `construction/u2-content-core/functional-design/rules.md` (BR4.2, BR4.6, BR4.9, BR5.3, BR6.1–BR6.3, BR7.5, BR8.4).
> Fecha: 2026-11-12. Etapa: NFR Requirements · Unidad: `u2-content-core` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que esta unidad **sí** toca aunque el motor no emita un artefacto por cada uno:

- **NFR3 — Seguridad**: la unidad no maneja el token de Spotify (eso es U4), pero **introduce la identidad de quien lee** (`viewerId`), el contenido que se pinta y la primera dependencia que habla con el sistema operativo (`expo-network`).
- **NFR4 — Privacidad**: la unidad decide qué datos de ejemplo existen y confirma que no se escribe nada nuevo en el teléfono.
- **NFR9 — Observabilidad**: `observability-requirements.md` no se produce para unidades de tipo `ui`; el logger que creó U1 es la única superficie y aquí se fija qué registra esta unidad.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U2 | Quién lo usa después | Secreto |
|---|---|---|---|
| `viewerId` (identidad de lectura) | Se lee de `appSession.getSession()`; **nunca** de un parámetro de ruta ni de un campo de formulario | Todas las lecturas y suscripciones de C4 | No, pero identifica a la persona |
| Opiniones, autores, me gusta, comentarios y seguimientos de ejemplo | Memoria del proceso, dentro de `@melodify/content-store` | U3 (escrituras), U5 (actividad) | No |
| Obras de ejemplo (id de Spotify, título, artista, portada) | Memoria, dentro de `@melodify/catalog` | U3, U4, U5 | No (son datos públicos de Spotify) |
| Estado de red del dispositivo | Memoria, dentro de `@melodify/connectivity` (`expo-network`) | La cáscara y las cuatro pantallas | No |
| Textos escritos por la persona | **No existen en U2**: publicar y editar son de U3 | U3 | No |
| Token de Spotify | **No existe en U2**: lo guarda U4 | U4 | Sí |
| Mensajes de diagnóstico | `app/src/bootstrap/logger.ts` (creado en U1) | Todo el proyecto | No |

**La frontera que esta unidad cruza**: hasta U1 la app pintaba una constante y no tenía identidad. U2 introduce un `viewerId` que decide qué es «mío» (`isOwn`, `likedByMe`, `followedByMe`) y una dependencia que lee el estado del sistema operativo. Los requisitos de abajo son las dos cosas que hay que sostener para que eso no abra una puerta.

## NFR3 — Seguridad

### NFR3.6 — Nada nuevo se escribe en el teléfono

| Regla | Cómo se cumple en U2 |
|---|---|
| No se añade ningún mecanismo de persistencia. | `@melodify/content-store`, `@melodify/catalog` y `@melodify/connectivity` no importan `expo-secure-store`, `AsyncStorage` ni `expo-file-system` (RC-03; ADR-011). |
| La única escritura en disco de la app sigue siendo el recuerdo de sesión de C3. | Ninguna pantalla de U2 escribe: lee, se suscribe y pinta. «Cerrar sesión» **borra** por `appSession.signOut()`, no escribe (R-01, F10 paso 7). |
| El contenido creado se pierde al recargar, y eso está dicho. | Es una restricción aprobada (RC-03) y la app no promete lo contrario (`functional-spec.md` § Assumptions). |

**Cómo se verifica**: revisión de los `package.json` de los tres paquetes nuevos (sin dependencias de almacenamiento) y de sus imports; además, una prueba que **sí puede fallar**: construir el almacén, escribir nada y comprobar que las opiniones siguen en memoria; construir un segundo almacén desde la misma semilla y comprobar que el primero no comparte estado con el segundo (es decir, que no hay una caché fuera del proceso). No se propone una prueba de «no toca el almacenamiento», porque el paquete no declara esa dependencia y pasaría siempre, que es lo que `team.md` § Testing Posture prohíbe.

### NFR3.7 — La identidad no la elige el cliente

- El `viewerId` de toda lectura sale de `appSession.getSession()`, igual que en el arranque de U1. **No** se toma de un parámetro de ruta, de un campo de la pantalla ni de una variable de entorno, así que no hay forma de leer «como otro» cambiando una URL de la app.
- C4 responde **`422`** cuando falta `viewerId` en `listOpinions`, `getOpinion`, `updateOpinion`, `listFollowing`, `getAuthor` y `subscribeContent` (`contract-summary.md` § Revisión 12). No devuelve los campos derivados con un valor por defecto: inventar `isOwn: false` haría que la opinión propia se pintara como ajena y que apareciera «Opinar sobre esta obra» en una obra ya opinada (AC4.2.3).
- Los campos derivados (`isOwn`, `likedByMe`, `followedByMe`, `authorIsFollowed`) los calcula el almacén contra el `viewerId` recibido; la pantalla **no** los recalcula comparando nombres ni identificadores que vengan en la tarjeta (BR4.6).

**Por qué se fija aquí y no en U3**: U2 es la primera unidad que lee con identidad. Si la puerta quedara abierta, U3 construiría las escrituras sobre una lectura que acepta cualquier identidad.

### NFR3.8 — Los datos de ejemplo no son datos personales reales

- Los cinco autores son ficticios (`demo`, `lucia`, `ana`, `bruno`, `marcos`) y sus textos están escritos para el ejemplo (BR4.9). No se usan nombres de personas reales, ni cuentas de Spotify de terceros, ni opiniones copiadas de la API.
- Las obras son reales —identificador, título y artista son datos públicos de Spotify— y **no** se guarda de ellas nada más: ni audio, ni letra, ni metadatos de la cuenta de nadie (`functional-spec.md` § Obras).
- El catálogo de ejemplo es local: sin sesión de Spotify no se pide nada a Spotify (BR5.1).

**Cómo se verifica**: revisión de la tabla de § Semilla contra esta regla; las pruebas de pantalla usan los mismos dobles y no necesitan cuenta ni credencial.

### NFR3.9 — Todo lo que se pinta se pinta como texto, no como instrucción

- Los textos de opinión, títulos de obra y nombres de autor se pintan como `Text`; no hay `WebView`, ni `eval`, ni interpretación de marcado. Un texto de ejemplo que contenga `<script>` se lee tal cual y no ejecuta nada.
- La única URL que llega a `Image` es la que decide `coverFor`: una `coverUrl` del catálogo sembrado o, a partir de U4, la que devuelva `SpotifyResolvePort`. **Nunca** se construye una URL a partir de un texto de la persona, y no hay campo en U2 donde escriba una.
- Un `workId` que no esté en el catálogo no produce una ruta ni una consulta: `getWork` devuelve `404` y la pantalla cae al título y artista de la opinión (BR5.2).

### NFR3.10 — Sin secretos nuevos y sin credenciales

- U2 **no** lee `EXPO_PUBLIC_*`: el client ID de Spotify se usa en U4. `.env.example` sigue documentándolo sin valor (NFR3.1 de U1).
- Los tres puertos de Spotify viajan en `null` hasta U4 (C5 1.1.0) y `@melodify/catalog` no importa `@melodify/spotify`; el único vínculo son los tipos con `import type`, que no crea arista de ejecución.
- No hay cabecera de autorización, ni cliente HTTP propio, ni token en memoria en esta unidad: `searchWorks` sin puerto responde `{ status: "offline", works: [] }` y no toca la red.

**Cómo se verifica**: revisión de `app/src/bootstrap/ports.ts` (los tres en `null`) y de los imports de los tres paquetes; `npm run lint` no debe encontrar ninguna referencia a `EXPO_PUBLIC_` fuera de donde U4 la use.

### NFR3.11 — El catálogo y Spotify solo comparten tipos, nunca una arista de ejecución

- Los tres tipos de puerto (`SpotifySessionPort`, `SpotifySearchPort`, `SpotifyResolvePort`) viven en `@melodify/catalog/src/ports.ts`, porque el catálogo es quien los consume, y `app/src/bootstrap/ports.ts` los importa con `import type` (TS-21).
- `@melodify/catalog` **no** importa `@melodify/spotify` en ninguna forma, ni al revés más allá de esos tipos: un `import type` lo borra el compilador, así que U2 no alcanza el paquete que maneja el token ni aunque estuviera instalado.
- Los tres viajan en `null` hasta U4; sin puerto no hay credencial, ni llamada, ni URL que resolver.

**Cómo se verifica**: `npm run lint` con la regla de imports no encuentra una arista de ejecución entre los dos paquetes, y una búsqueda de `from "@melodify/spotify"` en `@melodify/catalog` y en `app/src/` solo devuelve `import type` (o nada). La prueba de que el catálogo construido sin puertos responde `{ status: "offline", works: [] }` cubre la mitad ejecutable.

## NFR4 — Privacidad

### NFR4.4 — Inventario actualizado de lo que queda escrito en el teléfono

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | Sí (heredado de U1) | Almacenamiento seguro, clave de la sesión | Al cerrar sesión (F3) |
| Opiniones, autores, me gusta, comentarios y seguimientos | **No** | Memoria del proceso | Al recargar (RC-03) |
| Obras de ejemplo y decisión de portada | **No** | Memoria del proceso | Al recargar |
| Estado de red | **No** | Memoria del proceso | Al recargar |
| Token de Spotify | Todavía no (U4) | Almacenamiento seguro, clave del token | Al desconectar |

**U2 no añade ninguna fila persistida a la tabla de U1.** Si en una revisión futura alguien introdujera caché en disco para el catálogo, esta tabla y RC-03 dejarían de ser ciertas: la decisión tendría que tomarla una etapa, no un detalle de implementación.

### NFR4.5 — El estado de red se lee, no se envía

- `expo-network` se consulta con `getNetworkStateAsync()` y se escucha con `addNetworkStateListener` (BR6.1). De la respuesta se usa **un solo booleano**: hay conexión o no la hay.
- No se leen SSID, dirección IP, tipo de red ni operador, y nada de eso se registra ni se envía. Connectivity no abre sockets propios ni pregunta a Spotify (BR6.5).
- La lectura es del sistema operativo y no requiere permiso adicional en Expo Go; la app no pide ningún permiso nuevo en esta unidad (RC-01).

**Cómo se verifica**: revisión del adaptador (`src/expo-network-adapter.ts`) confirmando que solo se leen `isConnected` e `isInternetReachable`; ninguna prueba sale a la red porque el adaptador se sustituye por un doble.

### NFR4.6 — El registro no se lleva el contenido

- El logger registra **el fallo y su origen**, no el dato: «suscripción al contenido fallida», «módulo de red no disponible», no el texto de una opinión ni el identificador de obra de cada tarjeta.
- En U2 el contenido es de ejemplo, pero la regla se fija ahora porque U3 publicará textos de la persona por los mismos caminos y sería tarde para cambiarla.
- Nunca se registran el `viewerId` completo, ni la sesión, ni el estado de red con marcas de tiempo que permitan reconstruir dónde estuvo la persona.

## NFR9 — Diagnóstico y observabilidad

Se cumple con el logger que entregó U1 (NFR9.1–NFR9.3): un solo módulo, sin red, sin ficheros, sin dependencias, y `no-console` en `error` en ESLint. Esta unidad **no** añade otra superficie.

### NFR9.4 — Qué se registra y qué no en esta unidad

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| Suscripción al contenido fallida (F7, paso 6) | Sí, `ErrorState` con «Reintentar» | Sí, con `error`, porque es un fallo del sistema y no un estado esperado; código `CONTENT_SUBSCRIBE_FAILED`. La condición es acotada: **solo** se registra si `subscribeContent` lanza al establecerse —un defecto interno del almacén—, porque C4 no publica ningún fallo de suscripción; el `422` sin `viewerId` no llega aquí, que el hook no se suscribe hasta tenerlo |
| Lectura de la obra o de la opinión fallida (F9, F8) | Sí, con «Reintentar» | Sí, con `error`, sin el texto de la opinión; código `CONTENT_READ_FAILED`. **Precisión de NFR Design (2026-11-12)**: solo se registra si la lectura **lanza** —un defecto interno del paquete—, porque C4 y C5 no publican un resultado de fallo para esas lecturas; el `404` de `getWork` es la degradación de BR5.2 (título y artista de la opinión más bloque de inicial) y el de `getOpinion` es un estado previsto del contrato (la opinión ya no está), así que ninguno de los dos se registra aunque la pantalla muestre su `ErrorState` |
| Módulo de red no disponible o lectura fallida (BR6.3) | No: se arranca en línea y no se pinta el aviso | Sí, con `warn`; código `NETWORK_STATE_UNAVAILABLE` |
| Resolución de portadas fallida (BR7.5) | Sí, banner con «Reintentar» | No se duplica el aviso; `getCoverFailure` ya lo expone a la interfaz |
| Sin conexión (BR7.6) | Sí, es un estado, no un fallo | No |
| Portada caída a bloque de inicial (BR5.4) | Se ve el bloque, sin aviso propio | No: es una degradación prevista |

**Dónde viven esos tres códigos.** El logger único del proyecto (`app/src/bootstrap/logger.ts`, de U1) está tipado `SessionLogger`, y su `code` es la unión cerrada `SessionLogCode` de C3 (`SESSION_READ_FAILED`, `SESSION_RECORD_INVALID`, `SESSION_SAVE_FAILED`, `SESSION_DELETE_FAILED`): no cabe un código nuevo sin decidir dónde vive. U2 **no amplía C3** —los cuatro códigos de sesión siguen siendo suyos— y declara en el mismo archivo de bootstrap la unión de la app:

```ts
export type AppLogCode =
  | SessionLogCode
  | "CONTENT_SUBSCRIBE_FAILED"
  | "CONTENT_READ_FAILED"
  | "NETWORK_STATE_UNAVAILABLE";

export interface AppLogger {
  warn(code: AppLogCode, message: string): void;
  error(code: AppLogCode, message: string): void;
}

export const logger: AppLogger = { /* implementación actual, sin cambios */ };
```

`AppLogger` es **asignable a `SessionLogger`** —acepta un superconjunto del código y la misma pareja `(code, message)`—, así que `createAppSession({ logger })` sigue recibiendo el mismo objeto y C3 no cambia. Una línea de comprobación en las pruebas lo fija: `const asSession: SessionLogger = logger;`. U3 y U5 amplían `AppLogCode` en ese archivo cuando necesiten sus propios códigos; nadie reabre `SessionLogCode`.

Regla general, la misma de U1: **si la persona no lo ve, el logger lo registra; si lo ve, no se duplica salvo que sea un fallo del sistema**. Nunca se registran textos de opinión, títulos ni identificadores de obra.

### NFR9.5 — Sin telemetría nueva ni métricas de producto

- No se añade ningún servicio de errores, ni analítica, ni contador de eventos de interfaz. `@melodify/content-store` no exporta métricas.
- No se define SLI, SLO ni alerta: no hay servicio que observar; la app corre en el teléfono (NFR9 aprobado).
- Queda anotado para U5: si la Actividad necesitara medir algo, se decide allí y con la misma restricción de no enviar nada fuera.

## Consideraciones de amenaza de esta unidad

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Leer el contenido con una identidad que no es la de la sesión | **Mitigado, no cerrado por autorización**: la identidad se deriva de `appSession` en el punto de llamada (`useViewerId`), así que no hay campo ni ruta con la que cambiarla, y C4 responde `422` sin `viewerId`. Pero **C4 no autoriza**: acepta cualquier identidad que reciba. En esta versión no hay cuentas reales ni datos de terceros, así que la frontera es una convención de quien llama; si algún día hubiera cuentas, la comprobación tendría que estar en el almacén o en un servidor, no en el punto de llamada. |
| Que la opinión propia se pinte como ajena (o al revés) y habilite publicar dos veces | Los campos derivados los calcula el almacén, no la tarjeta (NFR3.7; BR4.6, BR8.4) |
| Dejar contenido de la persona en disco sin que nadie lo haya decidido | Ningún paquete de U2 escribe; el inventario no crece (NFR3.6, NFR4.4) |
| Convertir un fallo de red en un bloqueo de la app | Connectivity informa «en línea» si el módulo falla y las pantallas no bloquean (BR6.3) |
| Filtrar contenido por el registro de diagnóstico | El logger registra el fallo, no el dato (NFR4.6, NFR9.4) |
| Que un texto de ejemplo se interprete como marcado | Todo se pinta como texto; ninguna URL sale de un texto (NFR3.9) |

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| `viewerId` derivado, no recibido | `useViewerId` + `appSession.getSession()` | Leer como otra persona |
| `422` sin `viewerId` en C4 | `@melodify/content-store` (§ Revisión 12) | Inventar campos derivados y habilitar una segunda opinión |
| Campos derivados calculados en el almacén | C4 `listOpinions`/`getOpinion` | Que dos pantallas decidan distinto quién es el autor |
| Sin persistencia nueva | Los tres paquetes nuevos, sin dependencias de almacenamiento | Dejar contenido en disco sin decisión |
| Un solo booleano de red | `src/expo-network-adapter.ts` | Recoger datos del dispositivo que no hacen falta |
| Logger sin contenido | `logger.ts` (U1) usado desde los hooks | Filtrar opiniones por el registro |
| Autores ficticios y obras públicas | Siembra de § Semilla | Usar datos de personas reales |

## Assumptions & Open Questions

- `[assumption]` `expo-network` en Expo Go expone el estado de red sin permiso adicional declarado por la app; si en el teléfono la lectura fallara, BR6.3 arranca en línea y la app sigue usable, así que el fallo degrada y no bloquea.
- `[assumption]` El contenedor de Expo Go ya declara `ACCESS_NETWORK_STATE`; U2 no edita el manifiesto de Android porque no hay proyecto nativo (RC-01).
- `[assumption]` Los identificadores de obra sembrados son plausibles pero no verificados contra la API; U4 los verifica y, si alguno no existe, se conserva el título y el artista (BR5.2). Un identificador inexistente no es un riesgo de seguridad: no se construye ninguna ruta con él.
- **Open question para U4**: la `coverUrl` real llegará de Spotify; allí se confirma que solo se aceptan URLs `https` de los dominios de Spotify y que una respuesta inesperada cae al bloque de inicial.
- **Open question para U3**: cuando se publique, el texto de la persona pasa a ser contenido no confiable que se pinta y se registra por los caminos de esta unidad; U3 no debe añadir un `console.log` con el texto (NFR4.6, NFR9.1).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR11, RC-01, RC-02, RC-03, RC-07).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§Forbidden: client secret, backend, contenido local; §Mandated: token en almacenamiento seguro, sin backend).
- `components` — `inception/domain-design/components.md` (ContentStore, Catalog, Connectivity, AppShell).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C2 1.2.0, C4 con `x-identity` y `x-read-errors`, C5 1.1.0, C6 1.0.0 con `x-construction`, § Revisiones 12 y 13).
- `functional-spec` — `construction/u2-content-core/functional-design/functional-spec.md` (F7–F12, § Semilla, § Assumptions).
- `rules` — `construction/u2-content-core/functional-design/rules.md` (BR4.2, BR4.6, BR4.9, BR5.1–BR5.4, BR6.1–BR6.5, BR7.5, BR8.4).
