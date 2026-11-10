# Wireframes — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`), de `ideation/scope-definition/scope-document.md` (`scope-document`) y de `ideation/scope-definition/intent-backlog.md` (`intent-backlog`), más las respuestas de `rough-mockups-questions.md` (Q1–Q8) y las dos decisiones tomadas en la puerta de aprobación de esta etapa.
> Fecha: 2026-11-06. Etapa: Rough Mockups. Agente: aidlc-design-agent.
> Fidelidad: **baja**. Cajas, jerarquía y comportamiento; sin color ni tipografía final.

## Cambio de alcance registrado en esta etapa

Esta etapa **reabrió la frontera de producto**, y lo hizo en dos momentos: las preguntas y la puerta de aprobación.

| Cuándo | Qué se decidió | Origen |
|---|---|---|
| Preguntas | Se integra la API de Spotify para portadas y metadatos | Q7 = B |
| Preguntas | La autenticación es PKCE: cada persona usa su propia cuenta | Q8 = B |
| Puerta de aprobación | Explorar y Crear buscan en el **catálogo real** de Spotify, no solo en el de ejemplo | Decisión del 2026-11-06 |
| Puerta de aprobación | La conexión con Spotify **sobrevive al reinicio** de la app | Decisión del 2026-11-06 |

**Afirmaciones que quedan superadas** en los artefactos aprobados de etapas anteriores:

| Documento | Afirmación superada | Qué la sustituye |
|---|---|---|
| `intent-statement` | «Frontera de producto confirmada: sin integración con servicios musicales como Spotify, Apple Music o Last.fm» | Integración con la API de Spotify para portadas, metadatos y búsqueda en el catálogo |
| `intent-statement` | «Nivel de acabado acordado: contenido de ejemplo (placeholders), sin datos reales ni servicios externos» | El contenido —opiniones, autores, interacciones— sigue siendo de ejemplo; la identidad de las obras y el catálogo vienen de Spotify |
| `scope-document` | Fila «Integración con Spotify, Apple Music, Last.fm o cualquier servicio musical» en *Fuera de alcance* | Pasa a estar dentro: portadas, metadatos y búsqueda de catálogo |
| `scope-document` | Fila «Persistencia local entre sesiones» en *Fuera de alcance* | Sigue fuera para el contenido; **la sesión de Spotify sí se persiste** |
| `constraint-register` | CT-04 «No hay integración con servicios musicales» | Se sustituye por PKCE, por no guardar secretos en el cliente y por guardar el token en almacenamiento seguro |
| `constraint-register` | CT-05 «Solo se usan APIs incluidas en Expo Go» | **Parcialmente superada**: todo sigue dentro de Expo Go, pero la búsqueda añade una dependencia de red permanente en Explorar |
| `constraint-register` | CT-02 «No hay backend ni autenticación real: el login simula el ingreso» | **Parcialmente superada**: el login de la app sigue simulado; la autenticación con Spotify sí es real (PKCE) |
| `constraint-register` | CT-03 «Todo el contenido es de ejemplo y local; no hay datos reales de usuarios» | **Parcialmente superada**: las opiniones y sus autores siguen siendo de ejemplo; el catálogo y las portadas son reales |
| `constraint-register` | CR-01..CR-04 «Requisitos formales de protección de datos sobre una app sin datos reales» | **Necesita revisión de cumplimiento**: la app guarda un token de la cuenta de Spotify de la propia persona. No es un dato de terceros ni se envía a ningún servidor propio, pero deja de ser cierto que «no se recoge ningún dato real» y CR-03 debe reescribirse antes de que haya usuarios reales |

**Qué sigue igual**: el login de la app es simulado (`demo` / `demo`), no hay backend propio, no hay reproducción de audio, no hay notificaciones push, no hay publicación en tiendas y las opiniones, autores e interacciones siguen siendo inventados y locales.

## Consecuencias del cambio

1. **Prerrequisito nuevo**: hay que registrar una app en el portal de desarrolladores de Spotify y obtener un client ID con su redirect URI. Sin eso no hay portadas, ni metadatos, ni búsqueda.
2. **Qué significa «terminado» ahora**: se parte en dos. El recorrido completo **sin conexión ni cuenta** sigue siendo obligatorio, pero Explorar pierde su función principal en ese modo: sin Spotify solo muestra sugerencias de ejemplo. El recorrido completo **con Spotify conectado** es el camino que define la app.
3. **Qué queda de «solo placeholders»**: las opiniones, los autores y las interacciones son inventados y locales. El catálogo, la identidad de cada obra y sus portadas son reales y vienen de Spotify.
4. **Dependencia de la red**: Explorar ya no funciona sin conexión, porque la búsqueda vive en el catálogo real. Crear puede publicar sobre obras de ejemplo sin red, pero las portadas y los metadatos reales tampoco llegan. La app debe decirlo con claridad en lugar de fallar en silencio.
5. **El token se guarda en el dispositivo**: en almacenamiento seguro del sistema (`expo-secure-store`), nunca en texto plano ni en el almacenamiento común. Al desconectar, se borra.
6. **Deja de ser cierto que no se recoge ningún dato real**: el token pertenece a la cuenta de Spotify de la propia persona. No viaja a ningún servidor propio y no hay datos de terceros, pero el registro de restricciones (CR-03) debe reescribirse antes de que haya usuarios reales.

## Principios de estos bocetos

1. **Una acción primaria por pantalla.** Si una pantalla tiene dos botones igual de prominentes, uno está mal.
2. **El contenido manda.** La tarjeta de opinión es el componente que se repite; todo lo demás la enmarca.
3. **Tema del sistema.** Claro u oscuro según el teléfono; los bocetos no distinguen, el color se define en la etapa de mockups refinados. [Q2]
4. **Cinco destinos, siempre visibles.** La barra inferior es la única navegación principal. [Q1]
5. **Sin Spotify se puede entrar, leer, comentar y publicar sobre las obras de ejemplo; para descubrir obras nuevas en el catálogo real, hace falta conectar.**

## Estructura de navegación

```
Login (fuera de la barra)
   │
   └──> [ Inicio | Explorar | Crear | Actividad | Perfil ]
                  barra inferior persistente
```

`Login` no tiene barra: es una pantalla de entrada que no se puede abandonar sin entrar. Las cinco pestañas son hermanas; ninguna es «la principal» en la estructura, aunque `Inicio` sea la que recibe al usuario.

## Componente compartido: tarjeta de opinión

```
┌──────────────────────────────────┐
│ ┌──────┐  Título de la obra       │
│ │portada│  Artista                │
│ │  1:1  │  ★★★★☆  · 4/5          │
│ └──────┘                          │
│  Texto de la opinión, dos o tres  │
│  líneas como máximo.              │
│                                   │
│  ♡ 12   💬 3        Seguir autor  │
└──────────────────────────────────┘
```

- La portada viene de Spotify cuando hay cuenta conectada; si no, es un bloque con la inicial de la obra. Mientras carga ocupa el mismo espacio con un bloque neutro. [Q3]
- Si la portada falla, el bloque queda con la inicial en lugar de un hueco roto. [Q6]
- La valoración usa estrellas **y** un número (`4/5`), para no depender solo del color.

### Superficies de interacción social (U8)

La interacción social es parte del alcance (Q2 = B: seguir y comentar simulados con datos locales). Su superficie mínima:

| Elemento | Acción | Resultado visible |
|---|---|---|
| `♡ 12` | Tocar | Pasa a `♥ 13` y el contador sube; volver a tocar lo deshace |
| `💬 3` | Tocar | Abre la hoja de comentarios de esa opinión |
| `Seguir autor` | Tocar | Pasa a `Siguiendo`; el contador de Perfil sube |

**Hoja de comentarios** (se abre sobre la pantalla actual, sin cambiar de pestaña):

```
┌──────────────────────────────────┐
│ Comentarios                   ✕  │
├──────────────────────────────────┤
│ ☺ @ana                           │
│ «Totalmente de acuerdo»          │
│                                  │
│ ☺ @luis                          │
│ «Yo prefiero el lado B»          │
│                                  │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ Escribe un comentario…       │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- **Estados**: vacío («Sé el primero en comentar»), con comentarios, error al enviar (conserva el texto).
- Los comentarios son locales: no viajan a ningún servicio.

## Pantalla 1 — Login

```
┌──────────────────────────────────┐
│                                  │
│                                  │
│           Melodify               │
│     Opiniones sobre música       │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Usuario                    │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Contraseña                 │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │          Entrar            │  │
│  └────────────────────────────┘  │
│                                  │
│  Demo: usuario y contraseña      │
│  «demo»                          │
│                                  │
└──────────────────────────────────┘
```

- **Comportamiento**: solo `demo` / `demo` entra (credenciales fijas acordadas en el alcance). Cualquier otro valor muestra un error en línea bajo el campo, sin salir de la pantalla.
- **Estados**: solo el estado por defecto y el error de credenciales. **Es una excepción deliberada a Q6 = C**, con su razón: no hay nada que cargar, nada que vaciar y nada que reintentar antes de entrar.
- **Accesibilidad**: `h1` = «Melodify»; región `main`; el foco inicial va al campo «Usuario».

## Pantalla 2 — Inicio

```
┌──────────────────────────────────┐
│ Inicio                 ⚙ Spotify │
├──────────────────────────────────┤
│ Para ti                           │
│ ┌──────────────────────────────┐ │
│ │ [tarjeta de opinión]         │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ [tarjeta de opinión]         │ │
│ └──────────────────────────────┘ │
│                                   │
├──────────────────────────────────┤
│  ⌂      ⌕      +      ♡      ☺   │
│ Inicio Explor Crear Activ Perfil  │
└──────────────────────────────────┘
```

- **Comportamiento**: lista vertical de opiniones de ejemplo. Cada opinión de ejemplo apunta a una **obra real de Spotify por su identificador**, pero guarda en local su título y su artista: sin sesión se leen con portada de bloque y con sesión la misma opinión muestra portada y metadatos reales. La cabecera muestra el estado de Spotify: «Conectado» o «Conectar».
- **Estados**: carga (esqueletos mientras se resuelven portadas), vacío («Aún no hay opiniones. Sé el primero»), error de metadatos («No pudimos actualizar las portadas» + «Reintentar»; la lista local sigue visible con portadas de bloque), sin conexión (se conserva lo ya cargado y se avisa en la cabecera). [Q6]
- **Accesibilidad**: `h1` = «Inicio»; `main` = lista; `nav` = barra inferior; el foco entra en la primera tarjeta.

## Pantalla 3 — Explorar

```
┌──────────────────────────────────┐
│ Explorar                          │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ ⌕  Buscar en Spotify         │ │
│ └──────────────────────────────┘ │
│                                   │
│ Resultados                        │
│ ┌──────────────────────────────┐ │
│ │ [obra: portada, título,      │ │
│ │  artista, nº de opiniones]   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ [obra]                       │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  ⌂      ⌕      +      ♡      ☺   │
└──────────────────────────────────┘
```

- **Comportamiento**: busca en el **catálogo real de Spotify** y devuelve obras. Cada resultado muestra cuántas opiniones tiene en Melodify; si no tiene ninguna, invita a ser el primero. Tocar una obra abre su detalle, desde donde se puede opinar.
- **Sin Spotify conectado**: en lugar de resultados, la pantalla muestra una tarjeta que explica que la búsqueda en el catálogo real necesita conectar la cuenta, con el botón «Conectar con Spotify». Debajo, las obras del catálogo de ejemplo como sugerencia: se pueden abrir y desde su detalle se puede opinar de ellas, con portada de bloque (ver Pantalla 4).
- **Estados**: sin conectar, inicial (sin texto), cargando, vacío («Sin resultados para …»), error («La búsqueda no está disponible» + «Reintentar»), sin conexión a internet. [Q6]
- **Accesibilidad**: `h1` = «Explorar»; `main` = resultados; el foco entra en el campo de búsqueda.

## Pantalla 4 — Crear

```
┌──────────────────────────────────┐
│ Crear                    Cancelar │
├──────────────────────────────────┤
│ Obra                              │
│ ┌──────────────────────────────┐ │
│ │ Buscar en Spotify…           │ │
│ └──────────────────────────────┘ │
│ ┌──────┐  Título · Artista       │
│ │portada│  (obra seleccionada)   │
│ └──────┘                          │
│                                   │
│ Tu opinión                        │
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                   │
│ Valoración   ☆ ☆ ☆ ☆ ☆          │
│                                   │
│  ┌────────────────────────────┐  │
│  │         Publicar           │  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│  ⌂      ⌕      +      ♡      ☺   │
└──────────────────────────────────┘
```

- **Comportamiento**: elegir una obra buscándola en el **catálogo de Spotify**, escribir texto y valorar. «Publicar» se habilita solo con obra, texto y valoración. Al publicar vuelve a `Inicio` y la opinión aparece arriba. «Cancelar» vuelve a la pantalla anterior.
- **Entrada desde Explorar o desde el detalle**: la pantalla puede abrirse con la obra ya seleccionada; en ese caso el buscador aparece plegado y se puede desplegar para cambiarla.
- **Sin Spotify conectado**: el buscador del catálogo real se sustituye por un **selector del catálogo de ejemplo**, encabezado por una tarjeta «Conecta Spotify para buscar en el catálogo completo» con su botón. Se puede elegir una obra de ejemplo, escribir, valorar y **publicar**; la opinión se guarda con portada de bloque. Conectar no es requisito para publicar sobre una obra de ejemplo, solo para descubrir obras que no están en él.
- **Estados**: formulario vacío, buscando obra, sin resultados, error al publicar (conserva lo escrito), publicación correcta, sin Spotify. [Q6]
- **Accesibilidad**: `h1` = «Crear»; `main` = formulario; el foco entra en el buscador de obra.

## Pantalla 5 — Actividad

```
┌──────────────────────────────────┐
│ Actividad                         │
├──────────────────────────────────┤
│ Hoy                               │
│ ┌──────────────────────────────┐ │
│ │ ★ Publicaste tu opinión de   │ │
│ │   «…»                        │ │
│ │   hace 1 h                   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ♡ A alguien le gustó tu      │ │
│ │   opinión de «…»             │ │
│ │   hace 2 h                   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 💬 Comentaron tu opinión     │ │
│ │   de «…»                     │ │
│ │   hace 5 h                   │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  ⌂      ⌕      +      ♡      ☺   │
└──────────────────────────────────┘
```

- **Comportamiento**: lista cronológica de eventos: **publicaciones propias**, me gusta recibidos y comentarios recibidos. Tocar un evento abre la opinión correspondiente en su vista de detalle.
- **Estados**: carga, vacío («Todavía no hay actividad»), error + «Reintentar». [Q6]
- **Accesibilidad**: `h1` = «Actividad»; `main` = lista; el foco entra en el primer evento.

## Pantalla 6 — Perfil

```
┌──────────────────────────────────┐
│ Perfil                            │
├──────────────────────────────────┤
│      ┌────┐                       │
│      │ ☺  │  Usuario demo         │
│      └────┘  @demo                │
│                                   │
│  12 opiniones · 8 siguiendo       │
│                                   │
│  ┌────────────────────────────┐  │
│  │ Conectar con Spotify       │  │
│  └────────────────────────────┘  │
│                                   │
│ Mis opiniones                     │
│ ┌──────────────────────────────┐ │
│ │ [tarjeta de opinión]         │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  ⌂      ⌕      +      ♡      ☺   │
└──────────────────────────────────┘
```

- **Comportamiento**: cabecera con identidad, contadores y la acción de conectar Spotify. Debajo, las opiniones propias. «8 siguiendo» refleja los autores seguidos desde la tarjeta.
- **La conexión persiste**: al reiniciar la app, el botón sigue en «Desconectar» y las portadas se resuelven sin volver a autorizar. El token vive en almacenamiento seguro del dispositivo y se borra al desconectar.
- **Estados**: conectado, desconectado, conectando (indicador), error de conexión («No pudimos conectar con Spotify» + «Reintentar»), token inválido (vuelve a «Conectar» con aviso), vacío de opiniones. [Q6]
- **Accesibilidad**: `h1` = «Perfil»; `main` = contenido; el foco entra en el nombre del usuario.

## Vista de detalle de obra y de opinión

Se abre **dentro de la pestaña** desde la que se llega; no es una séptima pantalla ni un destino de la barra.

```
┌──────────────────────────────────┐
│ ← Volver                          │
├──────────────────────────────────┤
│ ┌──────────────┐                  │
│ │   portada    │  Título          │
│ │              │  Artista         │
│ └──────────────┘  ★★★★★ · 5/5     │
│                                   │
│ Texto completo de la opinión,     │
│ sin recortar.                     │
│                                   │
│ ☺ @ana · hace 2 h                 │
│ ♡ 12   💬 3      Seguir autor     │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │   Opinar sobre esta obra   │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

- Cuando la obra no tiene opiniones todavía, la vista muestra solo su identidad y el botón «Opinar sobre esta obra», que abre Crear con la obra preseleccionada.
- **Estados**: carga de la portada, portada fallida (bloque con inicial), error de red del resto del contenido, obra sin opiniones. [Q6]

## Mapa de estados

| Estado | Dónde aparece | Cómo se ve |
|---|---|---|
| Vacío | Inicio, Explorar, Actividad, Perfil, Crear, comentarios | Texto breve + acción sugerida; nunca una pantalla en blanco |
| Carga | Inicio, Explorar, Actividad, Crear, Perfil, detalle | Esqueletos o indicador que ocupan el espacio del contenido |
| Error | Todas menos Login | Mensaje en lenguaje llano + «Reintentar»; nunca un código técnico |
| Sin Spotify | Explorar, Crear | Tarjeta de conexión con su botón; en Crear, además, el selector del catálogo de ejemplo; el resto de la pantalla sigue usable |
| Sin conexión | Inicio, Explorar, Crear, Perfil, detalle | Se mantiene lo ya cargado, portadas de bloque y aviso en la cabecera |

**Login es la única excepción** al mapa: no hay contenido que cargar ni lista que vaciar.

## Notas de accesibilidad

La accesibilidad **no es prioridad en esta versión** (Q4 = C). Aun así se respetan dos mínimos que no cuestan trabajo: contraste legible en el tema claro y oscuro, y áreas táctiles de al menos 44×44 en la barra inferior, en los botones principales y en los iconos de la tarjeta. Las etiquetas de lector de pantalla y la navegación por teclado quedan para una etapa posterior.

## Assumptions & Open Questions

- El comportamiento **sin Spotify conectado** está decidido en estos bocetos: la app se recorre igual, Inicio y Actividad funcionan completos, y Explorar y Crear ofrecen conectar para buscar en el catálogo real, sin impedir opinar sobre las obras del catálogo de ejemplo.
- El **catálogo de ejemplo** es un conjunto fijo y local de obras reales de Spotify: de cada una se guardan identificador, título y artista. Es el respaldo sin sesión y el contenido en el que se apoyan las opiniones de ejemplo.
- La búsqueda en el catálogo real se añadió en la puerta de aprobación, después de Q7. Queda registrada como decisión propia, no como algo que Q7 autorizara.
- Los límites de peticiones de la API de Spotify no se han medido; si aprietan, se resuelve con caché local de resultados. Se decide en el diseño técnico.
- Los campos exactos de una opinión (obra, texto, valoración, fecha) se confirman en el diseño funcional.
- El nombre de las pestañas y los iconos concretos se ajustan en los mockups refinados.

## Sources

- `[desc]` Descripción inicial del pedido.
- `[Q1]`–`[Q8]` Respuestas de `rough-mockups-questions.md`.
- Decisiones de la puerta de aprobación del 2026-11-06 (catálogo real y sesión persistente).
- `intent-statement` — `ideation/intent-capture/intent-statement.md` (frontera de producto superada).
- `scope-document` — `ideation/scope-definition/scope-document.md` (exclusiones de Spotify y de persistencia superadas).
- `intent-backlog` — `ideation/scope-definition/intent-backlog.md` (unidades U1, U3, U4, U5 y U10 desfasadas, más U11 nueva; ver `user-flow.md`).
- `constraint-register` — `ideation/feasibility/constraint-register.md` (CT-02, CT-03, CT-04 y parte de CT-05 superadas; CR-03 pendiente de reescritura).
