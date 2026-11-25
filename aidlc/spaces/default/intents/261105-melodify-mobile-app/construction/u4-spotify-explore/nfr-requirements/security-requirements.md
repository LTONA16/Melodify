# Requisitos de seguridad, privacidad y diagnóstico — U4 `u4-spotify-explore`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR10.1–FR10.8, FR11, FR12.2, RC-01, RC-02, RC-05, RC-08, RC-09), de `aidlc/spaces/default/memory/project.md` (§ Forbidden: client secret, backend, contenido local, `.env` y tokens; § Mandated: token en almacenamiento seguro, PKCE, degradar con mensaje y acción, textos en español), de `aidlc/spaces/default/memory/team.md` (§ Testing Posture, § Code Style), de `inception/domain-design/components.md` (SpotifyAuth, SpotifyCatalog, Catalog, AppShell), de `inception/contract-design/contract-summary.md` (C1 1.4.0, C5 1.2.0, C7 1.0.0 con `x-pkce`, `x-token-storage` y `x-token-lifecycle`, C9, C10 y § Fallos, tiempos y reintentos), de `construction/u4-spotify-explore/functional-design/functional-spec.md` (F21–F27, § C7 1.0.0, § Textos exactos, § Assumptions) y de `construction/u4-spotify-explore/functional-design/rules.md` (BR16.1–BR16.12, BR17.4, BR18.6, BR19.5, BR20.6).
> Fecha: 2026-11-17. Etapa: NFR Requirements · Unidad: `u4-spotify-explore` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que esta unidad **sí** toca aunque el motor no emita un artefacto por cada uno:

- **NFR3 — Seguridad**: U4 es la primera unidad que guarda una **credencial** y la primera que habla con un tercero autenticado. Hasta ahora el peor fallo posible era pintar mal una tarjeta.
- **NFR4 — Privacidad**: la unidad decide qué sale del dispositivo hacia Spotify y qué se queda; es la primera vez que la app envía algo a un servidor ajeno.
- **NFR9 — Observabilidad**: `observability-requirements.md` no se produce para unidades de tipo `ui`; el logger de U1 sigue siendo la única superficie y aquí se fija qué registra U4 —y, sobre todo, qué no—.

**La frontera que esta unidad cruza**: hasta U3 la app era un proceso aislado con contenido en memoria y un recuerdo de sesión local. U4 abre una conexión de salida. Todo lo de abajo existe para que esa conexión sea la mínima posible: una credencial, dos verbos (`GET /search`, `GET /tracks|albums/{id}`) y nada más.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U4 | Quién lo usa después | Secreto |
|---|---|---|---|
| `accessToken`, `refreshToken`, `expiresAt` | Almacenamiento seguro, clave `melodify.spotify.token`, en un único registro JSON | Solo `@melodify/spotify/auth` | **Sí** |
| Verificador PKCE, desafío y `state` | Memoria del proceso, dentro de la llamada a `connect()`; el verificador muere al terminar el intercambio | Nadie | **Sí, mientras vive** |
| Código de autorización (`code`) | Viaja del navegador a `auth`; no se guarda ni se registra | Nadie | **Sí, mientras vive** |
| Client ID de Spotify | `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`, leída una vez al construir `auth` | Nadie más | No: es público por diseño |
| Redirect URI | `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` o `makeRedirectUri()`; se registra en el panel | Nadie más | No |
| Consulta de búsqueda | Sale del campo de Explorar hacia C10 | Nadie | No, pero es lo que la persona buscó |
| `workId` de una obra | Viaja por la ruta del detalle y de Crear (C2) | C4 y C5 | No |
| Token en `ShellServices.spotify` | **No existe**: la cáscara expone estado y acciones | Nadie | — |
| Mensajes de diagnóstico | `app/src/bootstrap/logger.ts` (U1, ampliado en U2 y U3) | Todo el proyecto | No |

## NFR3 — Seguridad

### NFR3.17 — PKCE S256 sin secreto, con el `state` comprobado antes de cambiar un código por un token

- **Se genera en el dispositivo, no se recibe.** `auth` produce **32 bytes aleatorios** para el verificador y otros 32 para el `state`, los codifica en base64url (43 caracteres de `[A-Za-z0-9-._~]`) y calcula el desafío como `base64url(SHA-256(verificador))`. La codificación base64url es una función pura del paquete (`toBase64Url`), porque `expo-crypto` devuelve hexadecimal y el recorte y la sustitución `+`→`-`, `/`→`_` y la eliminación del relleno son una fuente clásica de desafíos inválidos.
- **No hay client secret en ninguna parte** —ni en el código, ni en una variable `EXPO_PUBLIC_*`, ni en `.env.example`, ni en una prueba—. `project.md` § Forbidden lo prohíbe en términos absolutos y CT-04 lo cerró en la ideación. El cliente es público y PKCE no lo necesita.
- **El intercambio es de cliente público**: `POST https://accounts.spotify.com/api/token` con `application/x-www-form-urlencoded` y los campos `grant_type=authorization_code`, `client_id`, `code`, `redirect_uri` y `code_verifier`. **Sin cabecera `Authorization: Basic`** y sin secreto en el cuerpo.
- **El `state` se comprueba antes de cambiar el código.** Si el `state` que vuelve no coincide con el generado, **no se hace el intercambio**, el verificador se descarta y el estado pasa a `connectionError` con «No pudimos conectar con Spotify.» + «Reintentar». Un `state` ausente o vacío es un no-coincidente.
- **Sin permisos de usuario**: el alcance es vacío porque solo se usa el catálogo público (búsqueda, metadatos y portadas; FR10.6). No se piden `user-read-*` ni ningún permiso que convierta una app sin cuenta en una app que exige una.
- **El redirect se resuelve una sola vez al construir `auth`** y se expone en un log de diagnóstico sin token (NFR9.7), para poder pegarlo en el panel sin abrir una consola.

**Cómo se verifica**: prueba de `toBase64Url` y del desafío con el vector de `RFC 7636` Apéndice B —verificador `dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk` → desafío `E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`—; prueba con criptografía doble que comprueba que la URL de autorización lleva `code_challenge_method=S256`, `response_type=code` y un `state` no vacío; prueba con un navegador doble que devuelve un `state` distinto y comprueba que **no** se llamó a `/api/token` y que el estado es `connectionError`; prueba que recorre el cuerpo del intercambio y comprueba que no hay `Authorization` ni `client_secret`; prueba de longitud y alfabeto del verificador (43–128 caracteres del conjunto permitido).

### NFR3.18 — El token vive solo en `@melodify/spotify/auth` y solo en el almacenamiento seguro

| Regla | Cómo se cumple |
|---|---|
| Un solo dueño | `expo-secure-store` aparece en `packages/spotify/src/auth/**` y, desde U1, en `packages/app-session/src/secure-store-adapter.ts` (el recuerdo de sesión de C3). **Ningún otro módulo, paquete ni pantalla lo importa**; `eslint.config.js` lo hace cumplir con dos excepciones de archivo, una por cada adaptador (TS-31). |
| Una sola puerta de lectura | `getAccessToken()` es la única función que devuelve el token, y solo la llama `@melodify/spotify/catalog`. `catalog` no lee el almacén ni recibe el token por parámetro de construcción. |
| Nada fuera del paquete | `ShellServices.spotify` expone `status`, `subscribe`, `connect`, `disconnect` y `retry`; **no** expone el token (BR16.12). `SpotifyConnectionStatus` es el único dato que cruza. |
| Nada en claro | No hay `AsyncStorage`, ni archivo, ni `console`, ni una variable de módulo que guarde el token en claro más allá de la llamada en curso. El token se lee, se usa y se descarta. |
| Borrado al desconectar | `disconnect()` llama a `deleteItemAsync` y deja el estado en `disconnected` aunque el borrado falle (BR16.4): la sesión visible ya no se usa. |
| Sobrevive al cierre, y solo eso | La persistencia es la del almacén seguro del dispositivo (FR10.4, BR16.5); no se añade ningún otro mecanismo de persistencia. |
| Las dos sesiones no se tocan | Cerrar sesión en Melodify **no** borra el token de Spotify, y desconectar Spotify **no** cierra la sesión de la app (BR16.11). Son dos claves distintas del mismo almacén, con dos dueños distintos. |

**Cómo se verifica**: revisión de imports de `packages/*/src` y `app/src` (buscar `expo-secure-store`, `AsyncStorage`, `expo-file-system`), que debe devolver exactamente dos archivos autorizados: `packages/app-session/src/secure-store-adapter.ts` y el adaptador de `packages/spotify/src/auth/`; prueba de `auth` que comprueba que tras `connect()` el almacén doble recibió exactamente un registro bajo `melodify.spotify.token` con los cuatro campos de `SpotifyToken` —`accessToken`, `refreshToken`, `expiresAt` y `obtainedAt`—, porque guardar tres de los cuatro haría que el modelo de `components.md` y la prueba dijeran cosas distintas; prueba que comprueba que `disconnect()` lo borra; prueba de `catalog` que comprueba que pide el token a `auth` y no toca el almacén doble; prueba de tipos que comprueba que `ShellServices.spotify` no tiene ningún campo cuyo tipo sea el token.

### NFR3.19 — El token, el verificador y el código no aparecen en un log, en una prueba ni en una captura

- El registro de diagnóstico **nunca** recibe el token, el `refreshToken`, el verificador, el desafío, el `state` ni el `code`. Tampoco la URL de retorno con su cadena de consulta.
- **Tampoco la consulta de búsqueda ni el texto de una opinión** (NFR4.9, NFR9.7): lo que la persona escribió no entra en el registro, ni siquiera en desarrollo.
- El valor que **sí** se registra es el redirect resuelto (`exp://<ip>:8081/--/spotify-callback`), porque es un dato público, no lleva credencial y es el único que hay que pegar a mano en el panel de Spotify. Va por `warn`, que en un binario de release no se emite (`app/src/bootstrap/logger.ts`): en producción no queda ni ese rastro.
- **Las pruebas usan valores ficticios** (`token-de-prueba`, `refresh-de-prueba`); ningún fixture contiene una credencial real y ninguna prueba lee `.env`.
- **Ninguna pantalla pinta el token**, así que una captura de pantalla para el PR no lo revela. La tarjeta de Perfil muestra el estado, no la credencial.

**Cómo se verifica**: prueba con un `SpotifyLogPort` doble inyectado en las dos fábricas (TS-38) que recorre una conexión completa, una renovación fallida y una búsqueda fallida, y comprueba que **ningún** mensaje contiene el token, el `refreshToken`, el verificador, el `state` ni el `code`; revisión del código que confirma que el único sitio que llama al logger del proyecto con el redirect es `app/src/bootstrap/ports.ts`, que lo hace con `warn` y sin token (TS-35); revisión de `.env.example` (solo nombres de variable, sin valores).

### NFR3.20 — Una sola puerta HTTP, con sus URLs armadas, su autorización acotada y su respuesta desconfiada

| Aspecto | Regla |
|---|---|
| Una sola puerta | Toda petición sale por un único cliente del paquete (`requestJson`), construido sobre `fetch` con `AbortController` de 10 s (TS-34). No hay `XMLHttpRequest`, ni otro cliente, ni una segunda copia en las pantallas. |
| Autorización acotada | La cabecera `Authorization: Bearer` se añade **solo** a las peticiones a `api.spotify.com`. La llamada a `accounts.spotify.com/api/token` va sin ella. |
| URLs armadas, no concatenadas a mano | Las bases son constantes del paquete; la consulta entra con `encodeURIComponent` y el `workId` también en la ruta. Ningún texto de la app se interpola sin codificar. |
| Sin texto libre en la URL | Lo único que viaja en la consulta es la consulta de búsqueda normalizada —`trim`, espacios colapsados y comparación en minúsculas, BR17.4—, y esa misma forma normalizada es la clave de la caché de C5 (BR17.2). Nunca el texto de una opinión, ni un comentario, ni el `viewerId`. |
| Respuesta desconfiada | El JSON de Spotify se lee campo a campo: un elemento sin `id` o sin `name` se **descarta** (BR17.4, `contract-summary.md` § `x-search-mapping`). No se hace `eval`, ni `JSON.parse` de contenido ejecutable, ni se interpreta marcado. |
| La URL de una portada es un dato, no una orden | La `coverUrl` que devuelve Spotify se pasa a `Image` como fuente y no se usa para construir otra petición, ni un enlace, ni una ruta. Si viene vacía, es `null` y se pinta el bloque. |
| Errores mapeados, no propagados | Un `401` marca el token inválido; `429`, `5xx`, red y tiempo agotado se convierten en el `failure` del contrato. Un error HTTP nunca se pinta como código ni se relanza (BR16.10, BR17.9). |

**Cómo se verifica**: prueba del cliente con un `fetch` doble que registra las llamadas y comprueba la URL exacta, la cabecera y la ausencia de `Authorization` en el intercambio; prueba con una respuesta con un elemento sin `id` que comprueba que no llega a la lista; prueba de `resolve` que comprueba que el `workId` viaja codificado; prueba que comprueba que un `500` se convierte en `failure: 'error'` y no en una excepción.

## NFR4 — Privacidad

### NFR4.9 — Inventario de lo que cruza la frontera y de lo que se queda en el teléfono

**Lo que sale del dispositivo, y solo eso:**

| Dato | Destino | Cuándo | Por qué es necesario |
|---|---|---|---|
| Consulta de búsqueda (texto que la persona escribe en Explorar) | `api.spotify.com/v1/search` | Al buscar con sesión | Es la búsqueda; sin ella no hay resultado |
| `workId` de una obra | `api.spotify.com/v1/tracks|albums/{id}` | Al resolver una portada o abrir una obra que no llegó por búsqueda | Es el identificador que Spotify emitió |
| `accessToken` | `api.spotify.com` (cabecera) | En cada petición | Autoriza la lectura del catálogo público |
| `code`, `code_verifier`, `client_id`, `redirect_uri` | `accounts.spotify.com/api/token` | Una vez, al conectar | Es el intercambio PKCE |
| IP del dispositivo y agente de Expo Go | Los servidores de Spotify y su CDN de imágenes | En cada petición y al cargar una portada | Es inherente a una petición HTTP; no se puede evitar si se quieren portadas reales |

**Lo que no sale nunca:**

- El texto de una opinión y el de un comentario (NFR4.8 de U3 sigue vigente; U4 no amplía ningún puerto con ese dato).
- El `viewerId`, el `authorId` y cualquier identificador de la persona en Melodify. La app no tiene cuenta y Spotify no la recibe.
- Los me gusta, los seguimientos y el contenido local.
- Métricas, analítica o telemetría de ningún tipo: no existe el mecanismo.

**Lo que se guarda en el dispositivo:**

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` (U1) | Sí | Almacenamiento seguro, clave de sesión | Al cerrar sesión |
| **Token de Spotify** | **Sí (nuevo)** | Almacenamiento seguro, clave `melodify.spotify.token` | Al desconectar, al fallar la renovación y al fallar la lectura |
| Opiniones, comentarios, me gusta, seguimientos | No | Memoria del proceso | Al recargar (RC-03) |
| Caché de búsquedas y de resultados | No | Memoria del proceso (C5) | Al recargar |
| Estado de la conexión y de la red | No | Memoria del proceso | Al recargar |

**U4 añade exactamente una fila persistida**: el token. Es la primera credencial que la app guarda, está donde `project.md` manda y se borra en tres caminos distintos. Si alguien propusiera guardar también la caché de búsquedas «para no repetir peticiones», esta tabla y RC-03 dejarían de ser ciertas: la decisión tendría que tomarla una etapa, no un detalle de implementación.

### NFR4.10 — Nada se envía a un servidor propio, y la app no promete más de lo que hace

- **No hay backend** (RC-02, `project.md` § Forbidden): ni propio, ni función serverless, ni proxy. La única salida es Spotify, y solo para lo de la tabla de arriba.
- El contenido que la persona crea no viaja a Spotify: publicar una opinión sobre una obra de Spotify es una escritura **local** en C4 (BR20.4). Que la obra venga de Spotify no convierte la opinión en un dato de Spotify.
- La app **no pide cuenta de Spotify para funcionar**: sin sesión, el recorrido completo existe (BR19.5, FR12.2), y eso es también una decisión de privacidad: nadie tiene que entregar una credencial para usar Melodify.
- **El token pertenece a la cuenta de Spotify de la propia persona** y no se comparte, ni se envía a Melodify, ni se usa para nada que no sea leer el catálogo público (FR10.6, NFR4).
- Desconectar es un borrado real, no una pausa: el token se borra del almacén y no queda una copia en memoria (NFR3.18).

## NFR9 — Diagnóstico y observabilidad

Se cumple con el logger que entregó U1 y que U2 y U3 ampliaron. Esta unidad **no** añade otra superficie: ni panel, ni telemetría, ni un servicio de errores (NFR9 aprobado).

### NFR9.7 — Qué se registra y qué no en esta unidad

| Situación | Se muestra a la persona | Se registra |
|---|---|---|
| Arranque: redirect resuelto | No | Sí, con `warn` y el valor exacto: código `SPOTIFY_REDIRECT_RESOLVED`. Es el único dato que hay que pegar en el panel y `warn` solo existe en desarrollo |
| Lectura del token fallida (almacén ilegible) | No: se arranca sin sesión, igual que el `503` de C3 | Sí, con `error`; código `SPOTIFY_TOKEN_READ_FAILED` |
| Guardado del token fallido tras el intercambio | Sí, «No pudimos conectar con Spotify.» + «Reintentar» | Sí, con `error`; código `SPOTIFY_TOKEN_SAVE_FAILED` |
| Borrado del token fallido al desconectar | Sí, «Spotify desconectado» (el estado pasa a `disconnected` igualmente) | Sí, con `error`; código `SPOTIFY_TOKEN_DELETE_FAILED` |
| Renovación del token fallida | Sí, «Tu sesión de Spotify caducó. Vuelve a conectar.» | Sí, con `warn`; código `SPOTIFY_REFRESH_FAILED` |
| El puerto de búsqueda lanza en vez de devolver un `failure` | Sí, el estado `error` de BR17.7 | Sí, con `error`; código `SPOTIFY_SEARCH_FAILED`. Un `429`, un tiempo agotado o un `network` **no** se registran: son resultados previstos del contrato |
| `401` de C10 | Sí, como capa `token caído` con «Volver a conectar» | No: es un estado previsto, no un defecto |
| Búsqueda sin resultados | Sí, `empty` con la consulta | No |
| Resolución de portada fallida | Sí, banner con «Reintentar» | No se duplica: C5 ya lo expone con `getCoverFailure` (NFR9.4 de U2) |
| Una portada concreta que no carga | El bloque con la inicial, sin aviso | No: es una degradación prevista |
| Sin sesión o sin red | Sí, tarjeta o banner | No |

**Qué se añade a `AppLogCode`.** U2 declaró la unión en `app/src/bootstrap/logger.ts` y U3 le sumó un código. U4 añade **seis**:

```ts
export type AppLogCode =
  | SessionLogCode
  | "CONTENT_SUBSCRIBE_FAILED"
  | "CONTENT_READ_FAILED"
  | "NETWORK_STATE_UNAVAILABLE"
  | "SEARCH_PORT_UNAVAILABLE"
  | "SPOTIFY_REDIRECT_RESOLVED"
  | "SPOTIFY_TOKEN_READ_FAILED"
  | "SPOTIFY_TOKEN_SAVE_FAILED"
  | "SPOTIFY_TOKEN_DELETE_FAILED"
  | "SPOTIFY_REFRESH_FAILED"
  | "SPOTIFY_SEARCH_FAILED";
```

`SessionLogCode` no se reabre: los cuatro códigos de sesión siguen siendo de C3. `AppLogger` sigue siendo asignable a `SessionLogger`, y la comprobación `const asSession: SessionLogger = logger;` de U2 sigue valiendo.

**Quién emite cada uno.** `SPOTIFY_REDIRECT_RESOLVED` lo emite `app/src/bootstrap/ports.ts` con el logger del proyecto: el redirect se resuelve en el punto de composición y es allí donde el valor existe. Los otros cinco salen del paquete por un `SpotifyLogPort` —la unión de los seis códigos y los dos métodos de `AppLogger`— que se inyecta en las dos fábricas (TS-38): `auth` emite `SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED` y `SPOTIFY_REFRESH_FAILED`, y `catalog` emite `SPOTIFY_SEARCH_FAILED`. Sin ese puerto no habría por dónde emitirlos: el paquete no importa `app/src/bootstrap/logger.ts`, que es vocabulario de la app (TS-35).

**Lo que nunca se registra**: el token, el `refreshToken`, el verificador, el desafío, el `state`, el `code`, la URL de retorno con su cadena de consulta, la consulta de búsqueda, el texto de una opinión y el identificador de la persona. El logger registra **el fallo y su origen**, no el dato (NFR4.6 de U2 y NFR9.6 de U3, ahora con una credencial en juego).

## Consideraciones de amenaza de esta unidad

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Robo del token desde el dispositivo | Vive en el almacenamiento seguro del sistema, un único registro, y se borra al desconectar (NFR3.18, `project.md` § Mandated) |
| Interceptación del código de autorización | PKCE S256 impide canjearlo sin el verificador, que nunca sale del dispositivo, y el `state` se compara antes de cambiar el código (NFR3.17) |
| Fuga de un client secret | No existe: el cliente es público y no hay secreto en código, entorno ni pruebas (NFR3.17) |
| Fuga del token por el registro de diagnóstico | El logger nunca recibe la credencial; el único dato que registra es el redirect (NFR3.19, NFR9.7) |
| Suplantación: volver a la app con un `state` ajeno | El `state` se genera en el dispositivo y se compara; una discrepancia no intercambia el código (NFR3.17) |
| Enviar contenido de la persona a un tercero | Solo sale la consulta de búsqueda y el `workId`; nunca una opinión, un comentario ni una identidad (NFR4.9, NFR4.10) |
| Que una respuesta manipulada pinte una obra falsa u ejecute algo | Los elementos incompletos se descartan, todo se pinta como texto y la `coverUrl` solo se usa como fuente de imagen (NFR3.20) |
| Dos verdades sobre la sesión | Una sola instancia de `SpotifyAuth` en `bootstrap/ports.ts`, un solo estado y una sola emisión (BR16.12, BR16.7) |
| Que se pueda publicar una opinión sobre algo que no es una obra | Un artista no se convierte en `WorkView` y no abre detalle ni Crear (BR20.6) |
| Que un `401` se disfrace de fallo de búsqueda y oculte que hay que reconectar | El `401` levanta la capa `token caído`, no el estado `error` (BR18.6) |

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| PKCE S256 con verificador de 32 bytes y `state` comparado | `@melodify/spotify/auth` (BR16.1) | Canjear un código interceptado |
| Sin secreto en cliente, entorno ni pruebas | `auth`, `.env.example` (BR16.1, CT-04) | Una credencial pública que parece privada |
| Token en almacenamiento seguro, única llave | `auth` + `expo-secure-store` (BR16.4) | Una credencial legible en el dispositivo |
| El token no cruza ninguna frontera | `SpotifySessionPort` con dos miembros; `ShellServices.spotify` sin token (BR16.12) | Un token en una prop, en un contexto o en una captura |
| Cliente HTTP único, 10 s, sin reintento | `requestJson` (TS-34) | Peticiones duplicadas, colgadas o descontroladas |
| Respuesta desconfiada y sin `eval` | Mapeo de C7 § `x-search-mapping` (BR17.4) | Pintar u operar sobre datos incompletos o manipulados |
| Registro sin credencial y sin texto de la persona | `logger.ts` + NFR9.7 | Filtrar el token o lo que la persona buscó |
| Una sola instancia de `auth` | `app/src/bootstrap/ports.ts` (TS-35) | Dos estados de sesión distintos en la misma app |
| Inventario de lo que sale del dispositivo | NFR4.9 | Un envío que nadie decidió |

## Assumptions & Open Questions

- `[assumption]` El almacenamiento seguro del dispositivo es el límite de confianza: si el teléfono está comprometido, ninguna app puede proteger un token de portador. Lo que sí se garantiza es que no queda en claro, no se registra y se borra al desconectar.
- `[assumption]` Spotify exige el mismo `redirect_uri` en la autorización y en el intercambio. El valor se resuelve una sola vez al construir `auth` y se usa en los dos pasos; si se resolviera dos veces, un cambio de IP de la red local entre ambos podría hacer fallar el intercambio. Queda anotado para U6, que es quien lo prueba en el teléfono.
- `[assumption]` El alcance vacío es suficiente: búsqueda, metadatos y portadas del catálogo público no requieren permisos de usuario (FR10.6). Si algún día se quisiera leer la biblioteca de la persona, sería una historia nueva con su propio consentimiento.
- `[assumption]` La IP del dispositivo llega a Spotify y a su CDN al cargar portadas. No se puede evitar si se quieren portadas reales, y se declara aquí en lugar de dejarlo implícito; no se añade un proxy propio para ocultarlo, porque RC-02 prohíbe un backend.
- `[assumption]` Los seis códigos de diagnóstico nuevos son de la app y no de C7: el paquete no importa `logger.ts` y recibe la parte que necesita inyectada, igual que C3 y C6 (NFR9.1).
- **Open question para U5**: Actividad no habla con Spotify. Si alguna vez mostrara portadas reales, tendría que pasar por C5 y no por C7, y esta tabla de lo que sale del dispositivo no cambiaría.
- **Open question para U6**: la prueba en el teléfono puede revelar que el almacenamiento seguro tarda en frío más de lo esperado. Si es así, se documenta y se mantiene la lectura asíncrona: nunca se convierte en bloqueante para cumplir el arranque de 2 s.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR10.1–FR10.8, FR11, FR12.2, RC-01, RC-02, RC-05, RC-08, RC-09).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§ Forbidden: client secret, backend, contenido local, `.env` y tokens; § Mandated: token en almacenamiento seguro, PKCE, degradar con mensaje y acción, textos en español).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§ Testing Posture: nada de aserciones que siempre pasan; § Code Style: sin `console.log` de depuración).
- `components` — `inception/domain-design/components.md` (SpotifyAuth, SpotifyCatalog, Catalog, AppShell).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C7 1.0.0 con `x-pkce`, `x-token-storage`, `x-token-lifecycle`; C9; C10; § Fallos, tiempos y reintentos).
- `functional-spec` — `construction/u4-spotify-explore/functional-design/functional-spec.md` (F21–F27, § C7 1.0.0, § Textos exactos, § Assumptions).
- `rules` — `construction/u4-spotify-explore/functional-design/rules.md` (BR16.1–BR16.12, BR17.4, BR18.6, BR19.5, BR20.6).
