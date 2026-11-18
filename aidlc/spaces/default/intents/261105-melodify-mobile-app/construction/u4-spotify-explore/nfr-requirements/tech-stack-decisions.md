# Decisiones de pila técnica — U4 `u4-spotify-explore`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR5, NFR6, NFR7, NFR9, RC-01, RC-05, RC-08), de `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C7 1.0.0, C1 1.4.0, C5 1.2.0, § Fallos, tiempos y reintentos), de `construction/u4-spotify-explore/functional-design/functional-spec.md` (§ Contratos que U4 posee, § Enmienda al contrato, § Assumptions) y de `construction/u4-spotify-explore/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `@melodify/spotify` — la forma del paquete, § `app/src/bootstrap/`).
> Fecha: 2026-11-17. Etapa: NFR Requirements · Unidad: `u4-spotify-explore` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-31`…`TS-38`, continuando la numeración de U3, que terminó en `TS-30`), el objetivo no funcional que sirve y las alternativas que se descartaron. Lo que U1, U2 y U3 ya decidieron no se repite: **TS-01 (versiones exactas), TS-02 (`strict`), TS-03 (monorepo), TS-05 (una sola instancia y fábricas), TS-10 (Jest y `jest-expo` con cobertura por árbol), TS-11 (ESLint, Prettier y CI), TS-13 (solo Expo Go), TS-16 (`expo-network` aislado tras un adaptador), TS-17 (paquetes con `src/index.ts`), TS-18 (fábricas y una sola instancia), TS-20 (reloj inyectable), TS-21 (puertos en `@melodify/catalog`) y TS-29 (temporizadores propios) siguen vigentes y esta unidad los hereda sin reabrirlos.**

**La regla que gobierna el resto**: todo lo que entre aquí tiene que correr dentro de **Expo Go** en un teléfono Android **sin compilación propia** (RC-01, NFR7). U4 **sí añade dependencias** —es la primera unidad desde U2 que mueve el lockfile—, pero las tres que añade son módulos de Expo que ya vienen en el cliente de Expo Go; ninguna exige `prebuild`.

**Qué cambia respecto a U1–U3.** Hasta ahora el repositorio tenía siete árboles, un solo proyecto de Jest y ningún paquete con más de una entrada. U4 estrena **el primer paquete con dos superficies públicas separadas** (`auth` y `catalog`) y **la primera credencial de terceros**. Las ocho decisiones de abajo resuelven esas dos novedades y nada más: dónde vive el código, con qué se firma y se guarda, cómo se pide, cómo se diagnostica y cómo se prueba sin red.

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-31 | `@melodify/spotify` 1.0.0 es un paquete nuevo con tres entradas (`exports`), referenciado desde `tsconfig.json`, mapeado en Jest y con su propio `coverageThreshold` | NFR5, NFR6, NFR3 |
| TS-32 | PKCE con `expo-crypto` + `expo-web-browser`, y `expo-auth-session` solo por `makeRedirectUri` (nunca `AuthRequest`) | NFR7, NFR3 |
| TS-33 | El token vive en `expo-secure-store` detrás de un adaptador inyectable (`SecureStoreAdapter`), con dos claves propias | NFR3, NFR4 |
| TS-34 | Un solo cliente `fetch` con `AbortController` y 10 s; sin `axios` y sin reintento automático | NFR7, NFR8, NFR1 |
| TS-35 | Cinco adaptadores inyectables con valores por defecto del dispositivo, cableados en `bootstrap/ports.ts` (única instancia) | NFR5, NFR3, NFR9 |
| TS-36 | La caché y el registro de obras siguen en C5: el paquete de Spotify no guarda estado de catálogo | NFR3, NFR5, NFR1 |
| TS-37 | Pruebas con dobles de navegador, criptografía, almacén, `fetch`, reloj y logger; ninguna sale a la red ni toca el dispositivo | NFR5, NFR7 |
| TS-38 | El diagnóstico entra en el paquete por un `SpotifyLogPort` inyectado en las dos fábricas; es una enmienda aditiva a C7 1.0.0 | NFR9, NFR1 |

## Requisitos derivados de esta unidad

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR7.7 | Los tres módulos de Expo nuevos corren en Expo Go sin `prebuild` | TS-32, TS-33, TS-34 |
| NFR5.10 | El paquete nuevo cumple el 80 % de líneas por árbol, sin compensarse con el resto | TS-31, TS-37 |
| NFR5.11 | Ninguna prueba sale a la red, abre el navegador ni toca el almacén del teléfono | TS-35, TS-37 |
| NFR6.9 | Las piezas nuevas de interfaz tienen 44×44 y su estado se dice con palabras | TS-31 |

## NFR7 — Compatibilidad: Expo Go en Android

### NFR7.7 — Los tres módulos nuevos corren en Expo Go sin compilación propia

- **Las tres dependencias nuevas son de Expo, no de la comunidad.** `expo-crypto`, `expo-web-browser` y `expo-auth-session` son módulos del SDK 57 y viajan dentro del cliente de Expo Go; ninguna exige `prebuild`, firma ni build propio (RC-01, CT-05). Es la misma comprobación que U2 hizo con `expo-network` (TS-16).
- **Nada de `react-native-app-auth`, `react-native-inappbrowser-reborn` ni `@react-native-async-storage/async-storage`.** Los tres resuelven el mismo problema y los tres atan la app a una compilación: el primero y el segundo son módulos nativos de la comunidad, y el tercero guardaría el token en texto plano, que NFR3 prohíbe.
- **La versión la fija `npx expo install`.** Se instalan con `npx expo install expo-crypto expo-web-browser expo-auth-session`, que resuelve la que corresponde al SDK 57 y la escribe exacta con `save-exact=true` (TS-01). Hoy el árbol no las tiene, así que el número de parche concreto se escribe en Code Generation al instalarlas, no aquí; la regla que no se negocia es que sea la del SDK 57 y quede exacta.
- **Cómo se comprueba**: `npx expo start` levanta Metro sin aviso de módulo nativo ausente, y el recorrido del teléfono abre la pantalla de autorización de Spotify en el navegador del sistema y vuelve a la app. Si algo pidiera `prebuild`, Metro lo diría al arrancar y la unidad no se cierra.

### TS-31 — Un paquete nuevo con tres entradas, y ningún árbol más

`@melodify/spotify` 1.0.0 vive en `packages/spotify/` y es el octavo árbol del monorepo que fija `contract-summary.md` § Estructura del monorepo. Su forma:

```json
{
  "name": "@melodify/spotify",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./src/index.ts",
    "./auth": "./src/auth/index.ts",
    "./catalog": "./src/catalog/index.ts"
  },
  "dependencies": {
    "@melodify/design-system": "1.4.0",
    "expo-auth-session": "<la del SDK 57, exacta>",
    "expo-crypto": "<la del SDK 57, exacta>",
    "expo-secure-store": "57.0.4",
    "expo-web-browser": "<la del SDK 57, exacta>"
  }
}
```

- **El mapa `exports` es el corazón de la decisión.** Es el único paquete del repositorio con más de una superficie pública, y `@melodify/spotify/auth` y `@melodify/spotify/catalog` son entradas distintas, no dos archivos del mismo índice: quien importa `catalog` no puede alcanzar `expo-secure-store` ni siquiera por accidente, porque el mapa no le da esa ruta. `main` se conserva por convención del repositorio (TS-17), pero quien resuelve de verdad es `exports`.
- **Metro lo lee sin configuración.** No hay `metro.config.js` en el repositorio: manda el valor por defecto de Expo SDK 57 sobre React Native 0.86, que resuelve `exports`. Si al levantar Metro el subcamino no resolviera, el plan B es un `metro.config.js` que active `unstable_enablePackageExports` — **no** partir el paquete en dos, que duplicaría la frontera del token.
- **Solo este paquete lleva `exports`.** Añadirlo a los siete existentes no cambiaría nada y sí abriría una puerta a un cambio de resolución sin beneficio; el contrato no lo pide.
- **`@melodify/design-system` se declara como dependencia y se importa solo como tipo.** `AuthorizationStateView.status` es `SpotifyConnectionStatus`, la unión de seis cadenas que posee C1 (revisión 17). Se importa con `import type` en un solo archivo, `src/types.ts`, y de ahí lo toman las dos entradas: **ni `auth` ni `catalog` nombran C1**, y el import se borra al compilar, así que no hay arista de ejecución desde el paquete de Spotify hacia el sistema de diseño. La alternativa —redeclarar la unión dentro del paquete— daría dos verdades sobre los mismos seis estados y es justo lo que `frontend-components.md` prohíbe.
- **Lo que hay que tocar fuera del paquete, y nada más**:
  - `tsconfig.json` (raíz): `{ "path": "./packages/spotify" }` en `references`.
  - `packages/spotify/tsconfig.json`: extiende `tsconfig.base.json`, `rootDir: "./src"`, `include: ["src/**/*"]` y una referencia a `../design-system` por el tipo de arriba.
  - **`app/tsconfig.json`**: `{ "path": "../packages/spotify" }` en `references`. Sin esa línea, `tsc -b` mete los fuentes del paquete en el proyecto de `app` —cuyo `rootDir` es `./src`— y `npm run typecheck` falla; es la razón por la que la lista de `references` de la app se toca junto con la del paquete.
  - `jest.config.js` → `moduleNameMapper`: `^@melodify/spotify$`, `^@melodify/spotify/auth$` y `^@melodify/spotify/catalog$`, las tres apuntando a su carpeta de `src`. El `$` de cada patrón evita que la entrada desnuda capture los subcaminos.
  - `jest.config.js` → `coverageThreshold`: `"./packages/spotify/src/**": { lines: 80 }`. El contrato ya la nombra en su lista; la entrada se escribe ahora, que es cuando el árbol existe. `"./packages/activity/src/**"` sigue esperando a U5.
  - **`eslint.config.js`**: hoy la regla `no-restricted-imports` solo autoriza `expo-secure-store` en `packages/app-session/src/secure-store-adapter.ts` (`SECURE_STORE_ADAPTER`, líneas 18 y 104). Se añade `SECURE_STORE_SPOTIFY_ADAPTER = "packages/spotify/src/auth/device.ts"` y un bloque `files:` gemelo del de `app-session` que deja ese archivo importar `expo-secure-store`; y en el bloque que ya existe para `packages/spotify/src/**` se restringen además `expo-web-browser` y `expo-crypto` a ese mismo archivo, para que las tres dependencias de dispositivo tengan un solo punto de entrada y la frontera de NFR3.18 sea una regla del linter y no una convención. Sin ese bloque, el primer archivo de `auth` pone `npm run lint` en rojo.
  - **Las cuatro declaraciones de versión** que la unidad mueve: `app/package.json` sube `@melodify/design-system` a 1.4.0, `@melodify/app-shell` a 1.4.0 y `@melodify/catalog` a 1.2.0, y añade `"@melodify/spotify": "1.0.0"`; `packages/app-shell/package.json` sube su dependencia de `@melodify/design-system` a 1.4.0; y los `version` de `packages/design-system`, `packages/app-shell` y `packages/catalog` pasan a 1.4.0, 1.4.0 y 1.2.0. Sin las cuatro, las versiones que la unidad publica no las consume nadie y el lockfile queda desalineado.
  - **`collectCoverageFrom` y `testMatch` no cambian**: sus patrones (`packages/*/src/**`) ya cubren un paquete nuevo, y `app/index.ts` sigue excluido.
  - **`package.json` de la raíz no cambia**: `workspaces` ya incluye `packages/*`.
- **Las tres piezas nuevas de interfaz no estrenan paquete.** `SpotifyCard`, `ArtistResultRow` y la prop `kind` de `WorkResultRow` se publican en `@melodify/design-system` 1.4.0; la app solo compone. Un paquete `@melodify/spotify-ui` sería una frontera más para tres piezas que ya caben en C1, y dejaría a C1 sin la única tarjeta de conexión que la app necesita en Perfil y en Explorar. De ahí sale NFR6.9: las tres piezas heredan los tokens de TS-14 y se prueban en C1, con 44×44 en sus botones y el estado escrito con palabras («Conectando…», «Conectado», «Sin conectar»).

**Alternativas descartadas**: un paquete `@melodify/spotify` con una sola entrada y dos carpetas internas (el import de `expo-secure-store` quedaría a un `import` de distancia de la pantalla, y la frontera de BR16.12 dejaría de ser comprobable); dos paquetes (`@melodify/spotify-auth` y `@melodify/spotify-catalog`) para que la frontera la imponga el resolvedor (dos `package.json`, dos referencias de TS y dos entradas de cobertura para separar dos módulos que comparten un contrato, C7); registrar el paquete con `paths` en vez de referencias de proyecto (rompería `tsc -b`, que es el comando de CI).

### TS-32 — PKCE con `expo-crypto` y `expo-web-browser`; `expo-auth-session` solo por el redirect

| Pieza | Módulo | Para qué |
|---|---|---|
| Verificador y desafío | `expo-crypto` | `getRandomBytesAsync(32)` para el `code_verifier` y `digestStringAsync(CryptoDigestAlgorithm.SHA256, …)` codificado en base64url para el `code_challenge` (S256). |
| Navegador | `expo-web-browser` | `openAuthSessionAsync(url, redirectUri)`: abre la página de Spotify en el navegador del sistema y devuelve el `code` y el `state` cuando vuelve a la app. |
| Redirect | `expo-auth-session` | **Solo** `makeRedirectUri({ path: 'spotify-callback' })`, que es lo que el contrato fija como respaldo de `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` (BR16.2). |

- **Por qué no se usa `AuthRequest` de `expo-auth-session`**, que haría el PKCE por su cuenta: su flujo esconde el `state`, el verificador y el momento del intercambio dentro de un hook de React y de una promesa que no se puede inspeccionar. NFR3.17 exige comprobar el `state` **antes** de cambiar el código por un token y NFR3.19 exige poder afirmar en una prueba que el verificador, el código y el token no aparecen en un log: las dos cosas se prueban con las cuatro llamadas explícitas de arriba y no con un hook opaco. Tampoco se usa `AuthSession.startAsync`, que está pensado para el proxy de Expo y mete un intermediario que este proyecto no necesita.
- **El `state` se genera con `expo-crypto` y se compara en igualdad exacta** antes de tocar `/api/token`; si no coincide, se descarta el `code` y el estado queda en `connectionError` con «No pudimos conectar con Spotify.» (BR16.3, NFR3.17).
- **`openAuthSessionAsync` y no `openBrowserAsync`**: el primero cierra la pestaña solo cuando la URL de retorno coincide y devuelve el resultado; el segundo deja a la persona en el navegador y no hay forma fiable de saber si autorizó.
- **Todo va detrás de un adaptador** (`BrowserAdapter` con `open(url, redirectUri)`, `CryptoAdapter` con `randomVerifier()` y `challenge(verifier)`), de modo que la prueba del flujo completo se escribe sin navegador ni criptografía real (TS-35, TS-37).

**Alternativas descartadas**: `expo-auth-session` completo (opacidad del `state` y del intercambio, y una API pensada para el proxy de Expo); `react-native-app-auth` (módulo nativo, exige `prebuild`: CT-05); generar el verificador con `Math.random` o con el reloj (no es criptográficamente aleatorio; el desafío dejaría de proteger nada).

### TS-33 — El token en `expo-secure-store`, detrás de un adaptador y con dos claves

- **`expo-secure-store` ya está en el árbol** (`app/package.json`, 57.0.4) y es la única pieza que toca el dispositivo: `setItemAsync`, `getItemAsync` y `deleteItemAsync` sobre el llavero de Android. No hay dependencia nueva para esto.
- **Dos claves, un solo dueño**: `melodify.spotify.token` guarda el par `accessToken`/`refreshToken` con su `expiresAt` y su `obtainedAt` serializado, y no hay una tercera para el estado. `@melodify/spotify/auth` es el único módulo **nuevo** que nombra `expo-secure-store` —el otro es `packages/app-session/src/secure-store-adapter.ts`, que ya existía desde U1— (BR16.12, NFR3.18); `catalog` pide el token a `auth` y no lee el almacén.
- **El adaptador es la superficie de prueba**: `SecureStoreAdapter` con `get(key)`, `set(key, value)` y `delete(key)`. `createSpotifyAuth` recibe el adaptador; ninguna prueba necesita el llavero del teléfono (TS-37). La implementación por defecto vive en `packages/spotify/src/auth/device.ts`, el único archivo del paquete que importa `expo-secure-store`, `expo-web-browser` y `expo-crypto` —y el único que el linter autoriza a hacerlo (TS-31)—.
- **Qué se borra al desconectar**: la clave entera, no solo el `accessToken`. Un `refreshToken` huérfano volvería a conectar sin que la persona lo pidiera, que es lo contrario de BR16.9 y NFR3.
- **Qué no se guarda nunca**: el verificador, el `state` y el `code` viven en memoria durante el intercambio y se descartan; el almacén solo ve el par y su caducidad (NFR3.19).
- **Un almacén ilegible no rompe el arranque**: si `get` lanza, se registra `SPOTIFY_TOKEN_READ_FAILED` y la app arranca sin sesión, que es la misma degradación que C3 ya aplica a su propia lectura (NFR1.15, NFR9.7).

**Alternativas descartadas**: `@react-native-async-storage/async-storage` (texto plano: incumple NFR3); guardar el token en el estado de React o en C3 (se perdería al recargar, contra BR16.5, y C3 no es dueño de una credencial de terceros); una sola clave por campo (`…token`, `…refresh`, `…expires`) (tres escrituras para un dato que se lee y se escribe entero, y tres claves que se pueden desincronizar).

### TS-34 — Un cliente `fetch`, un `AbortController`, diez segundos, ningún reintento automático

- **`fetch` del runtime, sin `axios` ni `ky`.** React Native 0.86 ya trae `fetch`, `AbortController` y `AbortSignal.timeout`; una librería HTTP añadiría dependencia, su propia semántica de reintentos y un interceptor que habría que desactivar.
- **Tiempo límite de 10 s con `AbortController`**, uno por petición, cancelado en un `finally`. El contrato lo fija en `x-timeouts` y en § Fallos, tiempos y reintentos; no es un número de esta etapa.
- **Sin reintento automático** (OQ2): un `429` se ofrece a la persona con «Reintentar», y un tiempo agotado también. Reintentar por detrás multiplicaría las peticiones contra el límite de Spotify y taparía el fallo (RC-08, NFR8.14).
- **El mapeo de resultados es una función pura**, compartida por `search` y `resolve`: `ok`, `empty`, `unauthorized`, `rateLimited`, `timeout`, `network`, `error`. Un `401` **no** es un fallo de la petición: sube la capa `tokenCaido` y no sustituye la lista (BR18.6, BR17.7). Un `fetch` que lanza por red es `network`; un aborto por tiempo es `timeout`; un cuerpo que no es JSON es `error`.
- **Una respuesta tardía se descarta arriba, no aquí.** El puerto de búsqueda no tiene señal de cancelación (`SpotifySearchPort.search(query)`), así que el cliente no puede abortar el socket de una consulta que la persona ya cambió; lo que se aborta son los 10 s. El descarte por consulta vigente es de `useWorkSearch` (TS-29 de U3, BR17.8). Se dice aquí para que nadie lea «cancelación» donde hay «descarte».
- **La URL se arma, nunca se concatena a ojo**: `https://api.spotify.com/v1/search?type=track,album,artist&limit=20&q=…` con `encodeURIComponent`, y `https://api.spotify.com/v1/tracks/{id}` / `/albums/{id}` con el identificador validado contra `^[A-Za-z0-9]+$` antes de entrar en la ruta (NFR3.20).
- **El `Authorization: Bearer` lo pone `catalog` al llamar**, con el token que pidió a `auth` en ese momento; el cliente HTTP no conoce el token ni lo guarda (NFR3.18).

**Alternativas descartadas**: `axios` (dependencia y su propio `timeout` que no aborta el `fetch` subyacente); `AbortSignal.timeout` sin `AbortController` explícito (no permite distinguir «abortado por nosotros» de «abortado por el sistema» en todas las versiones del runtime, y la distinción es justo la que separa `timeout` de `error`); reintento con espera exponencial (tapa el `429` y alarga la espera que NFR8.12 acota).

## NFR5 — Mantenibilidad

### NFR5.10 — El árbol nuevo cumple el 80 % por su cuenta

- `contract-summary.md` § Estructura del monorepo fija 80 % de líneas **por árbol**, y ya nombra `./packages/spotify/src/**`. U4 escribe esa entrada en `jest.config.js` cuando el árbol existe; **`./packages/activity/src/**` llega con U5**.
- Un paquete no se compensa con otro ni con el total: si `packages/spotify` baja del 80 %, `npm test` se pone rojo y el PR no entra (`.github/workflows/ci.yml`). El suelo no se baja para hacer pasar la etapa (TS-11, `team.md` § Testing Posture).
- **De dónde sale la cobertura**: la lógica que se prueba es el mapeo de resultados, el armado de la URL, la comparación del `state`, el cálculo del desafío, la renovación a los 60 s, el borrado al desconectar y los seis estados. Lo que no se mide con una prueba de líneas —que Spotify responda— se demuestra en el teléfono (FR12.2).
- **Cómo se comprueba**: `npm test -- --coverage` y lectura del resumen por ruta; la entrada nueva aparece con su propio porcentaje, no agregada a `app/src`.

### NFR5.11 — Ninguna prueba sale a la red ni toca el dispositivo

- Los adaptadores del paquete se inyectan (TS-35), así que cada prueba decide qué devuelve el navegador, la criptografía, el almacén, la red, el reloj y el logger. `team.md` § Testing Posture ya lo exige: «las llamadas a la API de Spotify se sustituyen por dobles; ninguna prueba sale a la red ni necesita credenciales, cuenta de Spotify ni un client ID real».
- **`jest.setup.js` no gana un mock global de `fetch`**: un mock global escondería una llamada real en cualquier prueba futura y convertiría el suelo de cobertura en una ilusión. El doble se pasa por parámetro en la prueba que lo mide.
- **El doble global de `expo-secure-store` que ya existe no prueba la frontera, y no se usa para eso.** `jest.setup.js` lo declara desde U1 para que la app arranque entera en Jest; precisamente por eso no puede delatar un import indebido: lo taparía. Lo que impide que `catalog` alcance el almacén es el mapa `exports` del paquete —`./catalog` no da esa ruta— y la regla de `eslint.config.js` que solo autoriza los tres módulos de dispositivo en `packages/spotify/src/auth/device.ts` (TS-31). La prueba comprueba la frontera por donde se puede comprobar: ningún archivo de `packages/spotify/src/catalog/` importa `device.ts` ni un módulo de Expo.
- **Los valores por defecto del dispositivo viven en el paquete**, en `packages/spotify/src/auth/device.ts`; `bootstrap/ports.ts` solo pasa `clientId`, `redirectUri` y `log`, y deja que el paquete complete el resto. Así el paquete es portable y ninguna prueba de la app necesita montar un adaptador.
- **Cómo se comprueba**: `npm test` en verde sin red (modo avión o una máquina sin salida), y una prueba del flujo completo de conexión con los seis dobles —navegador, criptografía, almacén, `fetch`, reloj y logger— que afirma `connected`, `connectionError` e `invalidToken` sin abrir nada.

### TS-35 — Cinco adaptadores con valor por defecto, un logger obligatorio y una sola instancia

| Adaptador | Valor por defecto | Qué entrega |
|---|---|---|
| `SecureStoreAdapter` | `expo-secure-store` | `get`, `set`, `delete` |
| `BrowserAdapter` | `expo-web-browser` | `open(url, redirectUri)` → `{ code, state } \| 'cancelled'` |
| `CryptoAdapter` | `expo-crypto` | `randomVerifier()`, `challenge(verifier)` |
| `fetch` | `globalThis.fetch` | la petición HTTP |
| `Clock` | `Date.now` | la caducidad y el margen de renovación |
| `log` | **ninguno**: se exige | `warn`/`error` con los seis códigos de NFR9.7 (TS-38) |

- **`createSpotifyAuth` recibe los cinco adaptadores, `clientId`, `redirectUri` y `log`**; **`createSpotifyCatalog` recibe `auth`, `fetch`, reloj y `log`**: el catálogo no necesita navegador, criptografía ni almacén, y su firma lo dice. La forma exacta de `log` está en TS-38.
- **Cinco adaptadores tienen valor por defecto y `log` no.** Los cinco se resuelven en `packages/spotify/src/auth/device.ts` cuando no se pasan, porque el paquete tiene que poder correr solo; el logger no tiene un valor por defecto razonable —uno que descarte los avisos convertiría NFR9.7 en letra muerta— y su obligatoriedad es lo que impide que una fábrica se construya sin diagnóstico.
- **Una sola instancia de cada uno, construida en `app/src/bootstrap/ports.ts`**, en este orden: `spotifyAuth` primero, `spotifyCatalog` después (le pide el token a `auth`), y las dos antes de que `instances.ts` las importe (TS-18, NFR3.11). El ciclo `auth → catalog → catalog(C5) → instances` es de importación, no de ejecución.
- **`ports.ts` deja de exportar los tres puertos en `null`** y publica los reales; `shell-services.ts` sustituye los cinco campos inertes de `spotify` por los de `spotifyAuth` (TS-05).
- **El redirect se registra una sola vez, con `warn`**: `SPOTIFY_REDIRECT_RESOLVED` con el valor exacto, porque es el dato que hay que pegar en el panel de Spotify y `warn` solo existe en `__DEV__`. Nunca el token, ni el `state`, ni la URL de retorno con su cadena de consulta (NFR9.7).
- **`AppLogCode` gana seis códigos** y no se reabre `SessionLogCode`: `SPOTIFY_REDIRECT_RESOLVED`, `SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED`, `SPOTIFY_REFRESH_FAILED` y `SPOTIFY_SEARCH_FAILED`. La unión sigue siendo más amplia que `SessionLogCode`, así que el logger se entrega a C3 y C6 sin conversión.
- **Sin `client ID` no hay excepción**: `process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? null` entra como `null`, `auth` arranca en `notConfigured` y la pantalla lo dice (BR16.8, NFR1.15). El paquete no lee `process.env` por su cuenta.

**Alternativas descartadas**: que cada fábrica importe sus módulos de Expo directamente (las pruebas pasarían por el llavero y el navegador del entorno de pruebas, y NFR5.11 dejaría de poder afirmarse); un único objeto «dependencias del dispositivo» con las cinco juntas (el catálogo recibiría navegador y almacén que no usa, y su firma mentiría sobre lo que necesita); un contenedor de inyección (TS-18 ya fijó fábricas explícitas).

### TS-36 — La caché y el registro no se mudan

- **`@melodify/spotify` no cachea.** Devuelve lo que Spotify contestó; la caché por consulta y el registro de obras buscadas son de C5 (`searchWorks` los cachea junto con las obras, BR17.2). Duplicar la caché en el paquete daría dos verdades sobre la misma consulta y dos caducidades que nadie coordina.
- **El paquete tampoco registra obras en C4.** Una obra buscada se puede abrir en el detalle porque C5 la registra (BR20.8); si el paquete lo hiciera, tendría una arista hacia el almacén de contenido que C7 no declara.
- **Por qué importa para NFR5**: la frontera deja al paquete con una sola responsabilidad —hablar con Spotify— y hace que su cobertura mida traducción y no estado compartido. También evita el bucle `content-store → catalog → spotify → content-store`.

**Alternativas descartadas**: cachear en el paquete con un `Map` por consulta (dos cachés, dos políticas de frescura, y `useWorkSearch` ya descarta respuestas tardías por su cuenta); mover el registro a C5 desde `spotify` (sería C5 llamándose a sí mismo a través de un puerto que existe para lo contrario).

### TS-37 — Pruebas con dobles, sin red y sin dispositivo

- **Qué se prueba en `packages/spotify/src/**`**: el verificador y el desafío con un doble determinista; el `state` que no coincide; el intercambio que devuelve `400`; el guardado que falla; el borrado que falla; la renovación a los 60 s y la que dos llamadas concurrentes comparten; el mapeo de `200`/`401`/`429`/`404`/cuerpo inválido; el armado de la URL con una consulta con espacios y acentos; el identificador que no pasa la validación; y un `SpotifyLogPort` doble que comprueba que los cinco códigos del paquete se emiten en su situación y que ningún mensaje contiene el token ni el verificador (TS-38, NFR3.19).
- **Qué se prueba en `app/src/**`**: que `ports.ts` construye una sola instancia, no importa `instances.ts` y emite `SPOTIFY_REDIRECT_RESOLVED` una sola vez con el valor exacto; que `shell-services.ts` publica los cinco campos de `spotifyAuth`; y los estados de `ExplorarView` con datos dobles (TS-31 de U3 le dejó la vista pura, así que no hace falta montar C7).
- **Qué no se prueba automáticamente**: que Spotify acepte el redirect. Eso es el recorrido en el teléfono (FR12.2) y, si el panel lo rechaza, se anota en `external-dependency-map.md` y se recorre sin sesión.
- **`jest.useFakeTimers()` solo dentro de la prueba que mide el tiempo**, nunca global (TS-20, TS-29); el reloj del paquete es inyectable por su cuenta, así que la renovación se prueba sin temporizadores reales.
- **Cómo se comprueba**: `npm test`, `npm run typecheck` y `npm run lint` en verde, y la revisión de que ninguna prueba nueva importa `expo-secure-store`, `expo-web-browser` ni `expo-crypto`.

## NFR9 — Diagnóstico

### TS-38 — El diagnóstico entra por un `SpotifyLogPort`, y es una enmienda aditiva a C7 1.0.0

- **El tipo vive en `packages/spotify/src/types.ts`**, junto al import de tipo de C1: `SpotifyLogCode` es la unión de los seis códigos de NFR9.7 y `SpotifyLogPort` declara `warn(code, message)` y `error(code, message)`. No es un tipo nuevo de la app: es lo que el paquete necesita y todo lo que necesita.
- **`createSpotifyAuth` y `createSpotifyCatalog` reciben `log: SpotifyLogPort` como parámetro obligatorio.** El punto de composición pasa `logger` y compila sin conversión: `AppLogCode` contiene los seis códigos, así que `AppLogger` es asignable a `SpotifyLogPort` por estructura, con la misma regla que ya hace `const asSession: SessionLogger = logger;` de U2.
- **Quién emite qué**: `auth` emite `SPOTIFY_TOKEN_READ_FAILED`, `SPOTIFY_TOKEN_SAVE_FAILED`, `SPOTIFY_TOKEN_DELETE_FAILED` y `SPOTIFY_REFRESH_FAILED`; `catalog` emite `SPOTIFY_SEARCH_FAILED`; `SPOTIFY_REDIRECT_RESOLVED` lo emite `app/src/bootstrap/ports.ts` con el logger del proyecto, porque allí se resuelve el redirect y es el único sitio que tiene el valor. Los seis quedan, por tanto, con emisor y con sitio donde probarlos (NFR9.7, NFR3.19).
- **Esto es una enmienda aditiva a C7 1.0.0**: las dos fábricas ganan un parámetro, y **ninguna operación, ningún esquema ni ninguna firma publicada cambia** (`AuthorizationStateView`, `search`, `resolve`, `connect`, `disconnect` siguen igual). Se registra aquí, en un solo sitio, y se asienta como fila de revisión en `contract-summary.md` cuando la etapa que posee el contrato lo toque; el contrato no se edita desde NFR Requirements. `frontend-components.md` § `app/src/bootstrap/` muestra la llamada de `createSpotifyAuth` sin `log`: el parámetro se añade en esta etapa y el punto de composición pasa `logger`.
- **Sin logger no se construye la fábrica**, y eso es deliberado: un `log` opcional con un no-op por defecto dejaría cinco códigos de NFR9.7 sin emitir en silencio y convertiría la prueba de NFR3.19 en una prueba de algo que nunca se llama. La app siempre tiene `logger`; la prueba siempre tiene su doble.

**Alternativas descartadas**: un valor por defecto que descarte los avisos (NFR9.7 se cumpliría en el papel y no en la ejecución); que el paquete importe `app/src/bootstrap/logger.ts` (arista paquete → app, que `eslint.config.js` ya prohíbe y que rompería la portabilidad del paquete); un `onDiagnostic(event: { code, message, level })` (una segunda forma de decir lo mismo que `AppLogger`, y cada consumidor tendría que traducirla); emitir los cinco códigos desde la app observando los estados (un fallo de guardado o de borrado no cambia el estado visible, así que desde fuera no se puede ver).

## NFR6 — Accesibilidad

### NFR6.9 — Los controles nuevos, 44×44, y el estado con palabras

- `SpotifyCard` tiene dos botones como mucho —«Conectar con Spotify» y «Desconectar», o «Reintentar»— y los dos son de **44×44**; en `connecting` el botón está deshabilitado y dice «Conectando…», de modo que el estado no se lee solo por el color del punto.
- `ArtistResultRow` es una fila entera tocable: el bloque circular de 56 ya supera el mínimo y la fila completa es el objetivo, igual que `WorkResultRow` en U3.
- **No se estrenan etiquetas de lector de pantalla**: NFR6 aprobado las deja fuera de esta versión. Se conservan las que ya existen en la tarjeta de opinión y en la barra inferior.
- El contraste de los seis estados sale de los pares de tokens de TS-14; si el par de `error` sobre `surface` no llegara a 4.5:1, se corrige en C1 y se anota en el contrato, no se elige un color a ojo en la pantalla (misma regla que U2 y U3).
- **Cómo se comprueba**: pruebas de `SpotifyCard` por estado que afirman el texto visible y el área táctil declarada, y revisión de contraste con los pares de tokens.

## Versiones y fijación

| Paquete | Versión que publica U4 | Por qué |
|---|---|---|
| `@melodify/spotify` | **1.0.0** | Paquete nuevo (C7): dos entradas, PKCE, token, búsqueda y resolución. |
| `@melodify/design-system` | **1.4.0** | `SpotifyCard`, `ArtistResultRow`, `WorkResultRow.kind?`, el fallback de `CoverArt` y los dos modelos nuevos. |
| `@melodify/app-shell` | **1.4.0** | `WorkView` por la ruta, `openWorkDetail`/`openCreate` con `data?` y `CreateEntry.preselectedWork`. |
| `@melodify/catalog` | **1.2.0** | `WorkView.workKind?`, `ArtistHit`, `artists` en el resultado y su caché. |
| `@melodify/app-session` | 1.1.0 (sin cambios) | Se consume la identidad; U4 no la toca (BR16.11). |
| `@melodify/content-store` | 1.2.0 (sin cambios) | Se consume para las opiniones por `workId`. |
| `@melodify/connectivity` | 1.0.0 (sin cambios) | `online` entra en la decisión de portada y en el aviso. |

Todas las versiones se escriben exactas (`.npmrc` con `save-exact=true`, TS-01).

## Dependencias nuevas

| Paquete | Versión | Dónde entra | Para qué |
|---|---|---|---|
| `expo-crypto` | la del SDK 57, exacta | `packages/spotify` | Bytes aleatorios del verificador y digest SHA-256 del desafío |
| `expo-web-browser` | la del SDK 57, exacta | `packages/spotify` | Abrir la autorización en el navegador del sistema y recoger el retorno |
| `expo-auth-session` | la del SDK 57, exacta | `packages/spotify` | Solo `makeRedirectUri({ path: 'spotify-callback' })` |

Las tres las resuelve `npx expo install` para el SDK 57 y quedan exactas. **`expo-secure-store` no es nueva**: ya está en `app/package.json` (57.0.4) desde U1 y U4 la declara también en el paquete de Spotify, que es quien la usa.

## Assumptions & Open Questions

- `[assumption]` Los tres módulos de Expo del SDK 57 están incluidos en el cliente de Expo Go y no exigen `prebuild`; es la misma comprobación que U2 hizo con `expo-network`. Si alguno no estuviera, el arranque en Expo Go lo delataría antes del recorrido y la unidad no se cerraría.
- `[assumption]` Metro de Expo SDK 57 resuelve el mapa `exports` de un paquete del workspace sin `metro.config.js`. Si no lo hiciera, se añade la configuración que active `unstable_enablePackageExports`; no se parte el paquete.
- `[assumption]` Las versiones de parche exactas de `expo-crypto`, `expo-web-browser` y `expo-auth-session` se escriben al instalarlas, no aquí: el árbol no las tiene todavía y un número inventado sería peor que la regla «la del SDK 57, exacta».
- `[assumption]` `expo-web-browser` devuelve el `code` y el `state` en el retorno de `openAuthSessionAsync` incluso cuando el redirect es `exp://…`; si en el teléfono no volviera, el flujo termina en `connectionError` y el recorrido se demuestra sin sesión (FR12.2, Q1 = B).
- **Open question para U5**: `./packages/activity/src/**` se añade a `coverageThreshold` cuando U5 cree el paquete; U4 no lo adelanta con un umbral sobre un árbol que no existe.
- **Open question para U6**: el registro del redirect en el panel de Spotify sigue siendo el único paso manual. Si el panel acepta el valor de `makeRedirectUri()`, la conexión se demuestra sin cambios de código; si no, se documenta y se recorre sin sesión.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR5, NFR6, NFR7, NFR9, RC-01, RC-05, RC-08).
- `team` — `aidlc/spaces/default/memory/team.md` (§Testing Posture, §Code Style, §Way of Working).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C7 1.0.0, C1 1.4.0, C5 1.2.0, § Fallos, tiempos y reintentos).
- `functional-spec` — `construction/u4-spotify-explore/functional-design/functional-spec.md` (§ Contratos que U4 posee, § Enmienda al contrato, § Assumptions).
- `frontend-components` — `construction/u4-spotify-explore/functional-design/frontend-components.md` (§ Paquetes y responsabilidad, § `@melodify/spotify` — la forma del paquete, § `app/src/bootstrap/`, § `app/src/screens/explorar/`).
- `security-requirements` — `construction/u4-spotify-explore/nfr-requirements/security-requirements.md` (NFR3.17–NFR3.20, NFR9.7).
- `performance-requirements` — `construction/u4-spotify-explore/nfr-requirements/performance-requirements.md` (NFR8.12–NFR8.15).
