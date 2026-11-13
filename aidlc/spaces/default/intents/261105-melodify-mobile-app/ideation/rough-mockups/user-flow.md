# User Flow — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`), de `ideation/scope-definition/scope-document.md` (`scope-document`) y de `ideation/scope-definition/intent-backlog.md` (`intent-backlog`), más las respuestas de `rough-mockups-questions.md` y las dos decisiones de la puerta de aprobación.
> Fecha: 2026-11-06. Etapa: Rough Mockups. Agente: aidlc-design-agent.

## Cambio de alcance registrado en esta etapa

La frontera de producto se reabrió en dos momentos: **Q7 = B** integra la API de Spotify para portadas y metadatos y **Q8 = B** fija PKCE; después, en la **puerta de aprobación del 2026-11-06**, se amplió a **búsqueda en el catálogo real** y a **sesión persistente**.

Afirmaciones superadas: la frontera «sin integración con servicios musicales» del `intent-statement`; las filas de exclusión de Spotify y de persistencia entre sesiones del `scope-document`; CT-04 y parte de CT-05 del registro, y parcialmente CT-02 y CT-03 (el login de la app sigue simulado, pero la autenticación con Spotify es real y el catálogo deja de ser local). **CR-03 necesita reescritura antes de que haya usuarios reales**: la app guarda el token de la cuenta de Spotify de la propia persona, así que deja de ser cierto que no se recoge ningún dato real. Lo que las sustituye: integración con la API de Spotify para portadas, metadatos y búsqueda, autenticada con PKCE, con el token guardado en almacenamiento seguro del dispositivo. Todo lo demás sigue fuera: backend propio, autenticación real de la app, reproducción de audio, push y tiendas.

## Flujo principal (camino feliz)

Recorre las seis pantallas en orden, tal como se acordó en Q5. [Q5]

**Camino feliz, paso a paso** (primer arranque, sin sesión guardada):

1. **Login** — entra con `demo` / `demo`.
2. **Inicio** — ve las opiniones de ejemplo; sin sesión, sus portadas son bloques de color.
3. **Explorar** — sin cuenta conectada no puede buscar: la pantalla ofrece «Conectar con Spotify». La persona conecta en el navegador del sistema (PKCE) y vuelve a Explorar ya con sesión.
4. **Explorar** — busca una obra en el catálogo real y abre su detalle.
5. **Crear** — llega con la obra preseleccionada, escribe su opinión y la publica; vuelve a Inicio y la ve arriba.
6. **Actividad** — comprueba que su publicación aparece como evento «Publicaste tu opinión de …».
7. **Perfil** — ve sus opiniones y su cuenta de Spotify conectada; el botón dice «Desconectar».

Si la sesión ya estaba guardada de un arranque anterior, el paso 3 se salta: Explorar busca directamente y el resto del recorrido es igual.

**Mapa de navegación** (las cinco pestañas y sus salidas; el subflujo de conexión tiene su propia sección más abajo):

```
         ┌─────────┐
         │  Login  │
         └────┬────┘
              │ demo / demo
              ▼
         ┌─────────┐
    ┌───►│ Inicio  │◄─────────────┐
    │    └────┬────┘              │
    │         │                   │
    │  ┌──────┼───────┬───────────┴──┐
    │  ▼      ▼       ▼              ▼
    │ ┌──────┐┌─────┐┌─────────┐┌─────────┐
    │ │Explo.││Crear││Actividad││ Perfil  │
    │ └──┬───┘└──┬──┘└────┬────┘└────┬────┘
    │    │       │        │          │
    │    │  publicar      │      conectar
    │    │       ▼        │          ▼
    │    │  ┌─────────┐   │     ┌─────────┐
    │    └─►│ Inicio  │◄──┘     │ Spotify │
    │       └─────────┘         └─────────┘
    │
    └─── detalle de obra / opinión (vista dentro de la pestaña)
              │
              ├─► comentar (hoja sobre la pantalla)
              ├─► seguir autor
              └─► «Opinar sobre esta obra» ──► Crear
```

**Narración del camino feliz**: la persona entra con `demo` / `demo`, ve opiniones en Inicio, llega a Explorar, conecta su cuenta de Spotify desde la tarjeta de conexión, busca una obra en el catálogo real, publica su opinión en Crear, comprueba en Actividad que quedó registrada, abre el detalle de una obra para comentarla o seguir a su autor, y en Perfil ve sus opiniones y su cuenta de Spotify conectada.

**Transiciones que el diagrama no dibuja**, para que coincida con los pasos y con la tabla de pantallas:

```
Explorar ──► conectar con Spotify (subflujo PKCE) ──► vuelve a Explorar con sesión
Explorar ──► Crear (con la obra ya seleccionada)
Crear    ──► pantalla anterior (al cancelar, no a Inicio)
Inicio / Explorar / Actividad / Perfil ──► detalle ──► «Volver» a su pestaña
```

**Vista de detalle**: se abre desde Inicio, Explorar, Actividad y Perfil, siempre **dentro de la pestaña de origen** y con «Volver» a ella. No es una séptima pantalla ni un destino de la barra.

## Flujo de conexión con Spotify

Es un subflujo, no un destino: no tiene pestaña propia. Se dispara desde Perfil, desde la cabecera de Inicio y desde la tarjeta de conexión de Explorar o Crear. [Q8]

```
Inicio / Explorar / Crear / Perfil ──► «Conectar con Spotify»
                                            │
                                            ▼
                                  Navegador del sistema (PKCE)
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                         Autoriza                   Cancela / error
                             │                             │
                             ▼                             ▼
                   vuelve a la app con            vuelve a la pantalla
                   sesión activa: portadas        de origen con aviso
                   y metadatos reales             neutro y «Reintentar»
```

- La autorización ocurre fuera de la app, en el navegador del sistema. Al volver, la app recibe el código y lo canjea por un token.
- **La sesión persiste**: el token se guarda en el almacenamiento seguro del dispositivo, así que al reiniciar la app la persona sigue conectada y no vuelve a autorizar. «Desconectar» lo borra.
- **Si la persona cancela**, la app sigue funcionando: Inicio, Actividad y Perfil completos, Explorar con las sugerencias de ejemplo, y Crear con el selector de ejemplo para publicar sobre una obra conocida.
- **El token nunca se guarda en texto plano** ni se envía a ningún servidor propio: no hay servidor propio.

## Qué puede hacer la app sin Spotify conectado

Esta es la respuesta que `wireframes.md` también fija; no queda diferida al diseño funcional.

| Pantalla | Sin Spotify | Con Spotify |
|---|---|---|
| Login | Igual: `demo` / `demo` | Igual |
| Inicio | Opiniones de ejemplo con portadas de bloque; aviso «Conecta Spotify» | Las mismas opiniones, resueltas contra Spotify por el identificador de cada obra: portada y metadatos reales |
| Explorar | No puede buscar en el catálogo real: muestra la tarjeta de conexión y, debajo, obras de ejemplo que se pueden abrir y opinar | Busca en el catálogo real de Spotify |
| Crear | Elige una obra del catálogo de ejemplo y publica con portada de bloque; conectar solo hace falta para buscar fuera de él | Busca la obra en el catálogo real y publica con portada real |
| Actividad | Completa: es local | Igual |
| Perfil | Completa; botón «Conectar con Spotify» | Botón pasa a «Desconectar» y se mantiene tras reiniciar |

**Ninguna pantalla de lectura se bloquea por falta de cuenta.** Lo que sí exige conexión es descubrir obras nuevas: sin Spotify, la app se recorre, se lee, se comenta y se publica sobre las obras del catálogo de ejemplo; no se busca en el catálogo real.

## Puntos de decisión y ramas

| Punto | Camino A | Camino B | Camino C |
|---|---|---|---|
| Credenciales del login | `demo` / `demo` → entra a Inicio | Cualquier otro valor → error en línea, se queda en Login | Campo vacío → «Entrar» deshabilitado |
| Estado de Spotify al abrir la app | Conectado (token guardado) → portadas reales desde el primer segundo | Sin conectar → portadas de bloque y avisos de conexión | Token inválido o revocado → se borra, vuelve al camino B con aviso |
| Búsqueda en Explorar | Con Spotify y texto → resultados del catálogo real | Sin Spotify → tarjeta de conexión y sugerencias de ejemplo | Sin texto → estado inicial, sin resultados |
| Crear sin Spotify | Elige una obra del catálogo de ejemplo y publica con portada de bloque | El buscador del catálogo real muestra la tarjeta de conexión; al conectar se busca y se publica sin perder lo escrito | Sin obra elegida → «Publicar» deshabilitado, con la razón visible |
| Publicar en Crear | Obra + texto + valoración → se publica y vuelve a Inicio | Falta algún campo → botón deshabilitado, con la razón visible | Error al publicar → conserva lo escrito y ofrece «Reintentar» |
| Desconectar en Perfil | Se borra el token | Las portadas vuelven a bloque de color | Las opiniones no se pierden: son locales |

## Recuperación de errores

| Fallo | Qué ve la persona | Cómo se recupera |
|---|---|---|
| Sin conexión a internet | Aviso en la cabecera; lo ya cargado permanece | Se reintenta solo al volver la conexión; «Reintentar» en la pantalla afectada |
| Spotify no responde | Mensaje en lenguaje llano, nunca un código técnico | «Reintentar»; mientras tanto se usan portadas de bloque |
| Límite de peticiones alcanzado | Aviso discreto; los resultados ya vistos se mantienen | Se reintenta con espera; el diseño técnico decide la caché |
| Autorización cancelada | Vuelve a la pantalla de origen con un aviso neutro | «Conectar con Spotify» sigue disponible |
| Token revocado desde Spotify | Aviso en Perfil y vuelta a «Conectar» | Se borra el token guardado y se pide autorización de nuevo |
| Portada que no carga | Bloque con la inicial de la obra | Se reintenta al volver a la tarjeta |

Ningún fallo deja a la persona en una pantalla en blanco ni la expulsa del flujo: siempre hay un camino de vuelta. [Q6]

## Pantallas y su papel en el flujo

| Pantalla | Entra desde | Sale hacia |
|---|---|---|
| Login | Inicio de la app | Inicio |
| Inicio | Login, barra inferior, tras publicar, «Volver» del detalle | Explorar, Crear, Actividad, Perfil, detalle |
| Explorar | Barra inferior, «Volver» del detalle | Detalle de obra, Crear con la obra preseleccionada |
| Crear | Barra inferior, Explorar, detalle | Inicio tras publicar; a la pantalla anterior al cancelar |
| Actividad | Barra inferior, «Volver» del detalle | Detalle de la opinión que originó el evento |
| Perfil | Barra inferior, «Volver» del detalle | Conexión con Spotify, detalle de opinión propia |

## Efecto sobre el backlog

El cambio de Spotify **desfasa cinco proto-Units** del `intent-backlog` y **añade uno nuevo**. `units-generation` no debe tomar el backlog anterior como válido tal cual.

| Unidad | Qué cambia |
|---|---|
| U1 — Fundación | Suma la configuración de la app en el portal de Spotify (client ID, redirect URI) y la capa de acceso a datos con caché |
| U3 — Inicio | Las tarjetas resuelven portada y metadatos contra Spotify; caen a bloque de color si no hay sesión |
| U4 — Explorar | Ya no busca sobre datos de ejemplo: busca en el catálogo real de Spotify y necesita sesión |
| U5 — Crear | La selección de obra pasa a ser una búsqueda en Spotify; sin sesión, el selector cae al catálogo de ejemplo y la publicación sigue permitida con portada de bloque |
| U10 — Recorrido verificado | Se parte en dos: recorrido **sin** Spotify (lectura, comentario y publicación sobre obras de ejemplo con portada de bloque) y recorrido **con** Spotify conectado |
| **U11 — Autenticación PKCE y acceso a Spotify** | **Nueva**: autorización, canje del código, guardado del token en almacenamiento seguro, renovación, borrado al desconectar y degradación a portadas de bloque |

## Assumptions & Open Questions

- El almacenamiento del token se resuelve con `expo-secure-store`; si no está disponible en el entorno de Expo Go elegido, se decide en el diseño técnico antes de construir.
- Los límites de peticiones de Spotify no se han medido. Si aprietan, se resuelve con caché local de resultados.
- Los campos exactos de una opinión se confirman en el diseño funcional.
- El detalle de obra y de opinión se asume como vista dentro de su pestaña, no como séptima pantalla.
- El **catálogo de ejemplo** es un conjunto fijo y local de obras reales de Spotify (identificador, título y artista). Es el respaldo sin sesión y el contenido en el que se apoyan las opiniones de ejemplo.

## Sources

- `[Q1]`–`[Q8]` Respuestas de `rough-mockups-questions.md`.
- Decisiones de la puerta de aprobación del 2026-11-06 (catálogo real y sesión persistente).
- `intent-statement` — `ideation/intent-capture/intent-statement.md` (frontera superada).
- `scope-document` — `ideation/scope-definition/scope-document.md` (exclusiones de Spotify y de persistencia superadas).
- `intent-backlog` — `ideation/scope-definition/intent-backlog.md` (U1, U3, U4, U5 y U10 desfasadas; ver «Efecto sobre el backlog»).
- `constraint-register` — `ideation/feasibility/constraint-register.md` (CT-02, CT-03, CT-04 y parte de CT-05 superadas; CR-03 pendiente de reescritura).
