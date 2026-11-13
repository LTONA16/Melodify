# Requisitos de seguridad, privacidad y diagnóstico — U1 `u1-app-skeleton`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, RC-01, RC-02, RC-04, RC-09), de `aidlc/spaces/default/memory/project.md` (§Forbidden y §Mandated sobre el client secret, el token y `.env`), de `inception/domain-design/components.md` (AppSession, SpotifyAuth), de `inception/domain-design/decisions.md` (ADR-011), de `inception/contract-design/contract-summary.md` (C3, C5) y de las respuestas de `nfr-requirements-questions.md` (Q3 = A, Q4 = A).
> Fecha: 2026-11-11. Etapa: NFR Requirements · Unidad: `u1-app-skeleton` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que esta unidad **sí** toca aunque el motor no emita un artefacto por cada uno:

- **NFR3 — Seguridad**: la unidad no maneja el token de Spotify (eso es U4), pero crea el andamiaje donde ese token vivirá y donde vive el recuerdo de sesión.
- **NFR4 — Privacidad**: la unidad decide qué se guarda en el teléfono y qué sale de él.
- **NFR9 — Observabilidad**: `observability-requirements.md` no se produce para unidades de tipo `ui`; el objetivo no se pierde, se cumple con la decisión Q3 = A y se especifica aquí.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U1 | Quién lo usa después | Secreto |
|---|---|---|---|
| Recuerdo de la sesión de la app (`authorId`, `startedAt`) | Almacenamiento seguro, clave propia de la sesión | U1 (lo lee en el arranque, lo borra al cerrar sesión) | No es secreto, pero no se escribe en claro fuera del almacenamiento seguro |
| Credenciales escritas en Login | Solo estado en memoria de la pantalla | Nadie: no se persisten | Sí (la contraseña) |
| Token de Spotify | **No existe en U1**: lo guarda U4 en su propia clave | U4 | Sí |
| Client ID de Spotify | `.env.example` documentado y vacío; `.env` ignorado por git | U4 al registrar la app | No (es público por diseño de PKCE) |
| Client secret de Spotify | **No existe en ninguna parte del proyecto** | Nadie | — |
| Mensajes de diagnóstico | Módulo `app/src/bootstrap/logger.ts` | Todo el proyecto | No |

## NFR3 — Seguridad

### NFR3.1 — Ningún secreto en el repositorio ni en el entorno público

| Regla | Cómo se cumple en U1 |
|---|---|
| El **client secret** de Spotify no existe en el proyecto, ni en código, ni en el repositorio, ni en una variable `EXPO_PUBLIC_*`. | No se declara ninguna variable de ese tipo para él. PKCE no lo necesita (RC-09, `project.md` §Forbidden). |
| Solo el **client ID** viaja por entorno, en `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. | `.env.example` lo documenta **sin valor** (Q4 = A) y `.env` entra en `.gitignore` desde el primer commit. |
| Ningún otro secreto se añade sin pasar por una etapa que lo decida. | `.gitignore` cubre `.env` y `.env.*` salvo `.env.example`. |

**Por qué lo crea U1 y no U4**: el andamiaje del repositorio es de esta unidad; si `.gitignore` llegara después, habría una ventana en la que un `.env` local con el client ID podría commitearse por descuido.

**Cómo se verifica**: revisión del árbol (ningún `.env` versionado, ninguna cadena con aspecto de secreto en `app/`, `packages/` ni la raíz) y la prueba de que el CI corre sin `.env`, porque las pruebas usan dobles y nunca necesitan credenciales.

### NFR3.2 — El token de Spotify vive solo en el almacenamiento seguro

El token **no lo toca U1**, y esta unidad no debe abrir ninguna ruta alternativa por la que acabe en claro:

- Ningún otro módulo ni unidad lee `expo-secure-store` para el token: cuando exista, `@melodify/spotify` será su única superficie (C7).
- U1 no crea almacenamiento en claro para nada: no se añade `AsyncStorage` (ADR-011).
- `app/src/bootstrap/ports.ts` declara `SpotifySessionPort`, `SpotifySearchPort` y `SpotifyResolvePort` **sin implementación** (C5: `created_by: U1`, `filled_by: U4`). Sin implementación registrada no hay ninguna ruta activa hacia el token.

**Requisito heredado y verificado en U4**: el token se guarda con `expo-secure-store` bajo su propia clave y se borra al desconectar (FR10.3, NFR3). La demostración con doble de `expo-secure-store` (AC10.1.4) se construye allí; aquí solo se garantiza que el andamiaje no tiene una segunda puerta.

### NFR3.3 — El recuerdo de la sesión se guarda y se borra correctamente

| Aspecto | Definición |
|---|---|
| **Dónde** | `expo-secure-store`, en una **clave propia** distinta de la del token de Spotify (ADR-011). No se añade otro mecanismo de persistencia. |
| **Qué** | `authorId` (constante `demo`) y `startedAt` (ISO 8601 con zona), en JSON. Nada más: ni la contraseña, ni el nombre escrito en el campo, ni la hora de cada intento. |
| **Tamaño** | Decenas de bytes; muy por debajo del límite de valor del almacenamiento seguro, que se respeta por diseño. |
| **Borrado** | Al cerrar sesión se borra la clave (F3, paso 2). Un valor inválido se intenta borrar al detectarlo en el arranque (F1, paso 4). |
| **Valor inválido** | JSON ilegible, `authorId` distinto de `demo`, o `startedAt` ausente o ilegible → se trata como «sin sesión» y se intenta borrar (BR1.3). |

**Por qué el recuerdo está en el almacenamiento seguro aunque no sea un secreto**: una sola dependencia y un solo mecanismo de persistencia a cambio de una lectura algo más lenta en el arranque, que el presupuesto de NFR8.1 absorbe. La decisión es ADR-011 y esta unidad no la reabre.

### NFR3.4 — Las credenciales no salen de la memoria de la pantalla

- La contraseña **nunca** se persiste, ni se registra, ni se incluye en un mensaje de error. Vive en el estado de la pantalla mientras se escribe y se descarta al salir.
- La comparación con `demo`/`demo` se hace en `signIn` de `AppSession` (C3), después de recortar espacios al principio y al final. Es la **única** normalización aplicada.
- El mensaje de credenciales incorrectas es genérico («Usuario o contraseña incorrectos»): no dice cuál de los dos campos falló, y no hay forma de enumerar usuarios porque solo existe uno.
- No se cuentan intentos, no se bloquea la cuenta y no hay retardo progresivo: con una sola credencial conocida y publicada en la propia pantalla, esas medidas solo molestarían (F2, casos límite).

### NFR3.5 — Los datos leídos se validan antes de usarse

El arranque trata todo lo que devuelve el almacenamiento como **entrada no confiable**: se parsea dentro de un `try`, se comprueban el tipo y el valor de cada campo, y cualquier desviación desemboca en «sin sesión». Ningún campo leído se interpola en una consulta, en una ruta ni en una URL.

## NFR4 — Privacidad

### NFR4.1 — No se recogen datos ni se envían a ningún servidor propio

- No hay backend, ni base de datos, ni autenticación real (RC-02). U1 no abre ninguna conexión de red: el arranque, Login e Inicio funcionan sin red (F6, paso 8).
- No hay analítica, ni identificadores de dispositivo, ni huella del cliente, ni publicidad.
- El único dato que abandona el teléfono en toda la app es el que la persona pida a la API de Spotify cuando conecte su cuenta (U4), y va a Spotify, no a un servidor propio. **El token pertenece a la cuenta de Spotify de la propia persona** y no se comparte entre cuentas porque solo hay una.

### NFR4.2 — Inventario de lo que queda escrito en el teléfono

| Dato | Persistido | Dónde | Se borra |
|---|---|---|---|
| `authorId` = `demo` | Sí | Almacenamiento seguro, clave de la sesión | Al cerrar sesión (F3). |
| `startedAt` | Sí | Almacenamiento seguro, clave de la sesión | Al cerrar sesión (F3). |
| Contraseña | **No** | — | — |
| Contenido de ejemplo y semilla | Solo en memoria | — | Al recargar (RC-03). |
| Token de Spotify | Todavía no (U4) | Almacenamiento seguro, clave del token | Al desconectar (FR10.3). |

Nada de esta tabla se envía a ningún sitio. La app no tiene a quién enviarlo.

### NFR4.3 — El registro de restricciones se reescribe antes de tener usuarios reales

NFR4 lo exige explícitamente: el registro de restricciones (CR-03) debe reescribirse antes de que haya usuarios reales. **Esta versión no se distribuye** (RC-07: sin tiendas) y la app se demuestra en un teléfono con Expo Go, así que la condición no se cumple todavía. Queda anotado aquí para que no se pierda: si el proyecto crece hasta publicarse, esa reescritura es trabajo previo, junto con la decisión de publicación que `team.md` § Deployment deja fuera de esta versión.

## NFR9 — Diagnóstico y observabilidad

### NFR9.1 — Un solo logger, propio y mínimo

| Aspecto | Definición |
|---|---|
| **Qué existe** | `app/src/bootstrap/logger.ts`, con dos funciones: `warn` y `error`. |
| **Qué hace en desarrollo** | Escribe por consola, con un prefijo que identifica el origen. |
| **Qué hace en release** | Solo registra errores; los avisos se descartan. |
| **Qué no hace** | No envía nada por red, no escribe en fichero, no añade dependencias, no lleva identificadores de dispositivo y no incluye datos personales. |
| **Quién lo usa** | Es el **único** sitio del proyecto que llama a `console`. `npm run lint` falla ante un `console.*` fuera de él. |
| **Qué lo hace cumplir** | La regla `no-console` en `error` en `eslint.config.js`, más un bloque de excepción declarado para `app/src/bootstrap/logger.ts` (`files: ['app/src/bootstrap/logger.ts'], rules: { 'no-console': 'off' }`). U1 entrega esa configuración con el logger: sin ella, la práctica del equipo se queda sin puerta y cada desarrollador inventa la suya. |

**Por qué existe** (Q3 = A): la práctica del equipo prohíbe `console.log` de depuración y pide «el logger del proyecto», y el flujo F3 deja un fallo de borrado que no se puede mostrar a la persona: si nada lo registra, se pierde sin rastro. Sin logger, NFR9 se cumpliría al pie de la letra y la app quedaría peor diagnosticada.

### NFR9.2 — Lo que no se muestra, se registra

| Fallo | Se muestra a la persona | Se registra |
|---|---|---|
| Borrado del recuerdo que falla al cerrar sesión (F3, caso límite) | No | Sí, con `error`, sin datos personales |
| Borrado del valor inválido en el arranque (F1, paso 4) | No | Sí, con `warn` |
| Lectura con `503` al arrancar (F1, paso 4) | No: desemboca en Login | Sí, con `warn` |
| Credenciales incorrectas (F2, paso 6) | Sí, en pantalla | No: es el comportamiento esperado de la pantalla, no un fallo del sistema |
| Guardado con `503` (F2, paso 5) | Sí, con «Reintentar» | Sí, con `error` |

Regla general: **si la persona no lo ve, el logger lo registra; si la persona lo ve, el logger no duplica el aviso salvo que sea un fallo del sistema**. Nunca se registran la contraseña, el token ni el contenido de la sesión.

### NFR9.3 — Sin telemetría, paneles ni alertas

- No hay panel de control, ni servicio de errores, ni trazas distribuidas, ni alertas: la única superficie de diagnóstico es el logger local y lo que la app muestra en pantalla (NFR9 aprobado).
- Se descarta expresamente un servicio externo de errores (Sentry u otro): añade dependencia, cuenta y envío de datos, y choca con NFR4 y con RC-04 (coste cero).
- No se define SLI, SLO ni umbral de alerta porque no hay servicio que observar: la app corre en el teléfono de quien la usa y no tiene servidor.

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| `.env` ignorado y `.env.example` sin valor | Raíz del monorepo, `.gitignore` | Commitear una credencial local |
| Sin `EXPO_PUBLIC_*` para secretos | Revisión en el PR | Exponer un secreto en el paquete de JavaScript |
| Recuerdo de sesión en almacenamiento seguro | `@melodify/app-session` (C3) | Dejar la sesión en claro en el dispositivo |
| Validación de lo leído antes de usarlo | Arranque (F1) | Aceptar un registro manipulado o corrupto |
| Un solo logger | `app/src/bootstrap/logger.ts` | `console.log` disperso y datos sensibles en los registros |
| Puertos de Spotify sin implementación | `app/src/bootstrap/ports.ts` (C5) | Abrir una segunda ruta hacia el token |

## Assumptions & Open Questions

- `[assumption]` `expo-secure-store` cifra el valor en reposo en Android y sobrevive al reinicio de la app, que es lo que NFR3.3 necesita; no se añade capa de cifrado propia por encima.
- `[assumption]` El almacenamiento seguro de Android tiene un límite de tamaño por valor; el registro de sesión (decenas de bytes) está muy por debajo y no se acerca al límite.
- `[assumption]` El registro de restricciones (CR-03) se reescribe antes de cualquier distribución real; mientras la app se demuestre en Expo Go no hay usuarios reales (NFR4.3).
- **Open question para U4**: la clave del token y el alcance de `@melodify/spotify` como única superficie de `expo-secure-store` se confirman allí; aquí solo se garantiza que U1 no abre otra ruta.
- **Open question para U6**: si el recorrido final añade alguna comprobación de seguridad en la demostración (por ejemplo, que no hay secretos en el árbol), se formaliza en esa unidad.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, RC-01, RC-02, RC-04, RC-07, RC-09).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§Forbidden: client secret, backend, `.env`; §Mandated: token en almacenamiento seguro, client ID por entorno).
- `components` — `inception/domain-design/components.md` (AppSession, SpotifyAuth).
- `decisions` — `inception/domain-design/decisions.md` (ADR-011).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C3, C5, C7).
- `functional-spec` — `construction/u1-app-skeleton/functional-design/functional-spec.md` (F1, F2, F3, F6 y sus casos límite).
- `rules` — `construction/u1-app-skeleton/functional-design/rules.md` (BR1.1, BR1.2, BR1.3, BR1.4).
- `nfr-requirements-questions` — `construction/u1-app-skeleton/nfr-requirements/nfr-requirements-questions.md` (Q3 = A, Q4 = A, confirmadas).
