# Mockups refinados — Melodify

> **Provenance**: deriva de `ideation/rough-mockups/wireframes.md` (`wireframes`), `ideation/rough-mockups/user-flow.md` (`user-flow`), `inception/user-stories/stories.md` (`stories`), `inception/requirements-analysis/requirements.md` (`requirements`) y `inception/practices-discovery/team-practices.md` (`team-practices`), más las respuestas de `refined-mockups-questions.md` (Q1–Q6).
> Fecha: 2026-11-09. Etapa: Refined Mockups. Agente: aidlc-design-agent.
> Fidelidad: **media-alta en texto**. Jerarquía, textos, medidas y tokens definidos; sin archivo de diseño gráfico. Los diagramas son de bloques, no pixel-perfect.

## Principios

1. **El recorrido manda.** Ninguna pantalla gana expresividad a costa de romper el camino entre las seis. Si una idea no cabe sin un estado nuevo que la persona tenga que aprender, no entra.
2. **Una pantalla, una tarea.** Cada pestaña responde a una sola pregunta: qué se dice (Inicio), qué existe (Explorar), qué pienso (Crear), qué pasó (Actividad), quién soy (Perfil).
3. **Se ve lo real y lo simulado.** Las portadas y metadatos vienen de Spotify; las opiniones, autores e interacciones son locales. La interfaz no finge que hay una comunidad detrás: los textos hablan de lo que la app hace, no de lo que no puede hacer.
4. **La app sirve sin cuenta.** Sin sesión de Spotify no hay pantalla rota ni callejón sin salida: hay portadas de bloque, catálogo de ejemplo y las mismas acciones.
5. **Ningún estado es una pantalla en blanco.** Carga, vacío, error y sin conexión tienen forma, texto y —cuando toca— una acción.
6. **Español y lenguaje llano.** Todo lo visible está en español; los errores dicen qué pasó y ofrecen «Reintentar», nunca un código.
7. **Densidad de teléfono.** Se diseña para el pulgar y para sesiones de uno a tres minutos: una columna, tarjetas altas, acciones al alcance del pulgar.

## Cómo leer estos mockups

- Los diagramas usan bloque de texto: `[ ]` es un contenedor, `▢` una imagen o su bloque de respaldo, `★`/`☆` la valoración, `♡`/`♥` y `💬` los glifos que exigen FR7.1 y FR7.2.
- Cada elemento se describe con su **contenido real**, su **token** (`color.*`, `type.*`, `space.*`) y su **comportamiento**. Los valores de los tokens viven en `design-system-mapping.md`.
- Los estados se especifican en `## Matriz de estados`; el detalle de cada componente y sus transiciones, en `interaction-spec.md`.
- Las medidas están en **dp** (píxeles independientes de densidad). `safe.top` y `safe.bottom` son las inserciones del sistema.

## Sistema de navegación

```
                         ┌─────────────┐
                         │   Arranque   │
                         └──────┬───────┘
                    ¿sesión de app recordada?
                     no │               │ sí
                 ┌──────▼──────┐   ┌────▼─────┐
                 │    Login    │   │  Inicio  │
                 └──────┬──────┘   └────┬─────┘
                        │ demo/demo      │
                        └───────────────►│
        ┌──────────┬──────────┬──────────┼──────────┬──────────┐
        │  Inicio  │ Explorar │  Crear   │ Actividad│  Perfil  │
        └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
             │          │          │          │          │
      ┌──────▼───┐ ┌────▼─────┐    │    ┌─────▼────┐ ┌───▼──────┐
      │ Detalle  │ │ Detalle  │    │    │ Detalle  │ │ Detalle  │
      │ de obra  │ │ de obra  │    │    │ de opinión│ │ de opinión│
      └──────┬───┘ └────┬─────┘    │    └──────────┘ └───┬──────┘
             │          │          │                     │
             └──────────┴──────────┴─────────────────────┘
                        (dentro de la pestaña de origen)
```

**Reglas**

| Regla | Comportamiento |
|---|---|
| Barra inferior | Persistente en las cinco pestañas. Cinco destinos: Inicio, Explorar, Crear, Actividad, Perfil. Activo en color primario con icono relleno; inactivo en `color.textMuted` con icono de contorno. |
| Login sin barra | Login no muestra barra ni permite volver atrás; es la única pantalla sin salida (FR1.6). |
| Detalle dentro de la pestaña | El detalle de obra o de opinión se apila **dentro** de la pestaña de origen, con «← Volver». No es un sexto destino (FR2.3). |
| Volver | «← Volver» y el gesto/botón atrás de Android hacen lo mismo: desapilan y devuelven a la pestaña en la posición de scroll en que estaba. |
| Hojas | La hoja de comentarios se abre sobre la pantalla actual, sin cambiar de pestaña (FR7.2). Se cierra con ✕, con el gesto de arrastre hacia abajo o tocando fuera. |
| Snackbar | Se muestra sobre la barra inferior, nunca tapa la acción principal; desaparece a los 4 s o al cambiar de pantalla. |
| Profundidad máxima | Dos niveles por pestaña: pestaña → detalle. Desde el detalle se abre Crear (preseleccionado) o el formulario de edición, que se apilan como tercer nivel y vuelven al detalle. |

---

## Pantalla 0 — Arranque

No es una pantalla visible: es la decisión de entrada (FR1.4). Mientras se lee la sesión recordada se mantiene el **splash** del sistema con el fondo `color.bg`; dura lo que tarde la lectura y nunca muestra un formulario intermedio. Si la lectura falla, se trata como «sin sesión» y se abre Login.

---

## Pantalla 1 — Login

**Tarea**: entrar con la cuenta de demostración. **No tiene barra inferior.**

```
┌────────────────────────────────────────┐
│ safe.top                               │
│                                        │
│                                        │
│                 Melodify               │  type.display
│           Opiniones sobre música       │  type.body · textSecondary
│                                        │
│   ┌────────────────────────────────┐   │
│   │ Usuario                        │   │  TextField · 48 dp
│   └────────────────────────────────┘   │
│   ┌────────────────────────────────┐   │
│   │ Contraseña                 (ojo)│   │  TextField · secure
│   └────────────────────────────────┘   │
│   ⚠ Usuario o contraseña incorrectos   │  type.caption · error
│                                        │
│   ┌────────────────────────────────┐   │
│   │             Entrar             │   │  PrimaryButton · 48 dp
│   └────────────────────────────────┘   │
│                                        │
│   ┌────────────────────────────────┐   │
│   │ Demo: usuario y contraseña     │   │  surfaceSunken · radius.md
│   │ «demo»                         │   │  type.caption
│   └────────────────────────────────┘   │
│                                        │
│ safe.bottom                            │
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Marca | «Melodify» | `type.display`, `color.text` | Estática. Es el `h1` de la pantalla. |
| Lema | «Opiniones sobre música» | `type.body`, `color.textSecondary` | Estático. |
| Campo Usuario | Etiqueta «Usuario», placeholder «demo» | `type.body`, `color.text` | Autocapitalización desactivada, `autoComplete="username"`. Foco inicial al abrir. |
| Campo Contraseña | Etiqueta «Contraseña» | igual | `secureTextEntry`; el icono de ojo alterna visibilidad, 44×44. |
| Error de credenciales | «Usuario o contraseña incorrectos» | `type.caption`, `color.error` | Aparece bajo el campo de contraseña, en línea, sin mover el botón; lo escrito se conserva (FR1.2). |
| Entrar | «Entrar» | `PrimaryButton` | Habilitado cuando ambos campos tienen texto. Al tocar, valida: solo `demo`/`demo` entra; si no, error. Sin estado de carga visible (la comprobación es local). |
| Pista demo | «Demo: usuario y contraseña: demo» | `surfaceSunken`, `type.caption` | Estática, legible, no interactiva. |

**Estados**: por defecto y error de credenciales. **No aplica** carga, vacío ni sin conexión: no hay nada que traer de la red antes de entrar, y es la excepción deliberada del mapa de estados.

**Teclado**: `KeyboardAvoidingView`; los campos y el botón se desplazan para quedar visibles; «Entrar» cierra el teclado.

**Responsive**: en compacto, márgenes laterales de 24; en medio y expandido, el bloque se limita a 420 dp y se centra.

**Historias**: US1.1. **Requisitos**: FR1.1, FR1.2, FR1.3, FR1.6.

---

## Pantalla 2 — Inicio

**Tarea**: ver qué se está diciendo. Es la pantalla de llegada.

```
┌────────────────────────────────────────┐
│ Inicio                    ● Conectado  │  AppHeader · 56 dp
├────────────────────────────────────────┤
│ ⚠ Sin conexión. Estás viendo lo último │  Banner (solo sin conexión)
│   que cargamos.            Reintentar  │
├────────────────────────────────────────┤
│ Para ti                                │  type.title2
│ ┌────────────────────────────────────┐ │
│ │ ▢   Título de la obra              │ │
│ │     Artista                        │ │  OpinionCard
│ │     ★★★★☆ · 4/5                    │ │
│ │                                    │ │
│ │ Texto de la opinión, dos o tres    │ │
│ │ líneas como máximo.                │ │
│ │                                    │ │
│ │ ♡ 12   💬 3        [Seguir autor]  │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ▢   …                              │ │
│ └────────────────────────────────────┘ │
│                     … (8–10 tarjetas)  │
├────────────────────────────────────────┤
│  ⌂       ⌕       +       ♡       ☺    │  BottomTabBar
│ Inicio  Explorar Crear  Actividad Perfil│
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Cabecera | «Inicio» + chip de Spotify | `AppHeader` | El título es el `h1`. El chip muestra «Conectado» (punto verde + texto) o «Conectar» (botón). «Conectar» inicia el flujo de PKCE; «Conectado» abre Perfil. |
| Banner sin conexión | «Sin conexión. Estás viendo lo último que cargamos.» + «Reintentar» | `color.warningContainer`, `type.bodySmall` | Solo sin conexión. Empuja el contenido, no lo tapa. |
| Encabezado de sección | «Para ti» | `type.title2` | Fijo sobre la lista. |
| Tarjeta de opinión | `OpinionCard` variante `feed` | ver `interaction-spec.md` | Toda la tarjeta es tocable hacia el detalle de la opinión; los iconos y «Seguir autor» tienen su propia acción y no disparan la navegación. |
| Barra inferior | Cinco destinos | `BottomTabBar` | — |

**Estados**

| Estado | Qué se ve | Texto exacto |
|---|---|---|
| Carga | 3 esqueletos de tarjeta con la altura real de una tarjeta y el encabezado «Para ti» ya visible | — |
| Vacío | Bloque centrado con icono, mensaje y acción | «Aún no hay opiniones. Sé el primero.» + «Crear opinión» |
| Error de metadatos | Banner bajo la cabecera; la lista local sigue visible con portadas de bloque | «No pudimos actualizar las portadas.» + «Reintentar» |
| Error de contenido | Bloque de error en el lugar de la lista | «No pudimos cargar las opiniones.» + «Reintentar» |
| Sin conexión | Se conserva lo cargado, las portadas pasan a bloque y aparece el banner | «Sin conexión. Estás viendo lo último que cargamos.» + «Reintentar» |
| Sin Spotify | Tarjetas con bloque de inicial; el chip pasa a «Conectar» | — |

**Detalles de diseño**: la tarjeta no tiene sombra; se separa por `color.border` de 1 dp y `space.3` entre tarjetas. El texto de la opinión se limita a 3 líneas con elipsis (`numberOfLines={3}`); el detalle lo muestra completo. La valoración siempre lleva número al lado de las estrellas (no depende del color).

**Responsive**: compacto, una columna. Medio, dos columnas de tarjetas (`gap` 16). Expandido, contenido centrado a 960 dp con dos columnas.

**Historias**: US2.1, US2.2, US2.3, US7.1, US7.2, US7.3. **Requisitos**: FR3.1–FR3.8, FR11.1, FR11.3, FR11.4, FR11.6.

---

## Pantalla 3 — Explorar

**Tarea**: encontrar una obra que no está en el feed.

```
┌────────────────────────────────────────┐
│ Explorar                               │  AppHeader
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ ⌕  Busca artistas, álbumes…     ✕  │ │  SearchField · 48 dp
│ └────────────────────────────────────┘ │
│                                        │
│ Encuentra tu próxima opinión           │  type.title2  (estado inicial)
│ Busca en el catálogo completo de       │  type.body · textSecondary
│ Spotify o empieza por una de estas.    │
│                                        │
│ Sugerencias para empezar               │  type.label
│ ┌────────────────────────────────────┐ │
│ │ ▢  Obra de ejemplo                 │ │  WorkResultRow
│ │    Autor · 2 opiniones             │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ▢  Obra de ejemplo                 │ │
│ │    Autor · Sé el primero en opinar │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│  ⌂       ⌕       +       ♡       ☺    │
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Campo de búsqueda | Placeholder «Busca artistas, álbumes…»; icono de lupa; ✕ para limpiar | `SearchField` | Foco al entrar. Dispara a partir de 2 caracteres, con 400 ms de pausa (FR4.2). |
| Estado inicial | Título + explicación + «Sugerencias para empezar» con el catálogo de ejemplo | `type.title2`, `type.body`, lista | Sin texto escrito no se lanza ninguna petición. Las sugerencias son locales y abribles. |
| Resultado | Portada 56, título, artista y «N opiniones» o «Sé el primero en opinar» | `WorkResultRow` | Abre el detalle de obra dentro de Explorar (FR4.4). |
| Sin sesión | Tarjeta de conexión y, debajo, las sugerencias | `ConnectionCard` | El botón «Conectar con Spotify» inicia PKCE; las sugerencias siguen abribles y opinables (FR4.5). |

**Estados**

| Estado | Qué se ve | Texto exacto |
|---|---|---|
| Sin sesión | Tarjeta de conexión + sugerencias | «Busca en todo Spotify» / «Conecta tu cuenta para buscar en el catálogo completo. Mientras tanto, estas obras del catálogo de ejemplo también se pueden opinar.» + «Conectar con Spotify» |
| Inicial (con sesión, sin texto) | Título, explicación y sugerencias; ninguna petición | «Encuentra tu próxima opinión» |
| Menos de 2 caracteres | Ayuda bajo el campo | «Escribe al menos 2 caracteres.» |
| Cargando | 5 filas de esqueleto ocupando el espacio de los resultados | — |
| Resultados | Lista de `WorkResultRow` | — |
| Vacío | Bloque centrado con el texto buscado | «Sin resultados para «…»» + «Prueba con otra grafía o con el nombre del artista.» |
| Error | Bloque de error con el texto conservado | «No pudimos buscar en Spotify.» + «Reintentar» |
| Sin conexión (con sesión) | Banner + últimos resultados en caché si existen; si no, bloque de error | «Sin conexión. No podemos buscar en Spotify ahora mismo.» + «Reintentar» |

**Decisiones**: la caché en memoria no cambia nada visible: repetir una búsqueda muestra los mismos resultados sin indicador de carga (FR4.2, AC3.1.6). El contador de opiniones se calcula sobre el contenido local; una obra sin opiniones lo dice con la invitación, no con un «0».

**Responsive**: compacto, una columna. Medio y expandido, resultados en dos columnas con el buscador a ancho completo (máx. 640 dp).

**Historias**: US3.1, US3.2. **Requisitos**: FR4.1–FR4.6, FR11.1, FR11.4.

---

## Pantalla 4 — Crear

**Tarea**: publicar una opinión. También es el formulario de edición (modo edición, ver más abajo).

```
┌────────────────────────────────────────┐
│ Crear                        Cancelar  │  AppHeader + acción de texto
├────────────────────────────────────────┤
│ Obra                                   │  type.title2
│ ┌────────────────────────────────────┐ │
│ │ ⌕  Busca en Spotify…            ✕  │ │  SearchField
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ▢  Título · Artista        Cambiar │ │  obra seleccionada
│ └────────────────────────────────────┘ │
│                                        │
│ Tu opinión                             │  type.title2
│ ┌────────────────────────────────────┐ │
│ │ Escribe lo que piensas…            │ │  MultilineField
│ │                                    │ │  min 120 dp
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Valoración            ★ ★ ★ ★ ☆   4/5  │  RatingInput · 44×44
│                                        │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │             Publicar               │ │  PrimaryButton fija al pie
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│  ⌂       ⌕       +       ♡       ☺    │
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Cabecera | «Crear» + «Cancelar» | `AppHeader` | «Cancelar» vuelve a la pantalla anterior sin publicar (FR5.4). En modo edición el título es «Editar opinión». |
| Buscador de obra | Igual que Explorar, sin salir de Crear | `SearchField` | Resultados en línea, máximo 5 filas visibles con scroll interno. Al elegir, se pliega y aparece la fila de obra seleccionada. |
| Obra seleccionada | Portada 48, «Título · Artista», acción «Cambiar» | fila `surface` | «Cambiar» despliega otra vez el buscador (FR5.5). En modo edición no hay «Cambiar». |
| Texto | Placeholder «Escribe lo que piensas…» | `MultilineField` | Altura mínima 120 dp, crece hasta 240 y hace scroll. Sin contador visible en esta versión: el límite lo fija Functional Design (OQ1). |
| Valoración | 5 estrellas de 44×44 + texto «N/5» | `RatingInput` | Tocar una estrella fija el valor; volver a tocar la misma no lo borra (para borrar existe «Quitar valoración», ver abajo). |
| Publicar | «Publicar» / «Guardar» en edición | `PrimaryButton` | Habilitado solo con obra, texto no vacío y valoración (FR5.2). Al publicar vuelve a Inicio con snackbar; al guardar, vuelve al detalle (FR6.3). |

**Detalle de la valoración**: bajo las estrellas, en `type.caption`, «4 de 5». Si hay valoración elegida, aparece «Quitar valoración» como acción de texto, para poder volver a cero sin adivinar el gesto.

**Estados**

| Estado | Qué se ve | Texto exacto |
|---|---|---|
| Formulario vacío | Buscador abierto, texto vacío, estrellas vacías, «Publicar» deshabilitado | — |
| Buscando obra | Esqueleto de 3 filas bajo el buscador | — |
| Sin resultados | Fila informativa bajo el buscador | «No encontramos esa obra. Prueba con otro nombre.» |
| Obra seleccionada | Buscador plegado, fila de obra, resto del formulario | — |
| Obra ya opinada | Aviso bajo la fila de obra; «Publicar» se sustituye por «Editar mi opinión» | «Ya opinaste sobre esta obra.» + «Editar mi opinión» |
| Publicando | Botón con indicador y texto «Publicando…»; campos deshabilitados | «Publicando…» |
| Error al publicar | Bloque de error sobre el botón; todo lo escrito se conserva | «No pudimos publicar tu opinión.» + «Reintentar» |
| Publicado | Navegación a Inicio + snackbar | «Opinión publicada» |
| Sin Spotify | Tarjeta de conexión compacta + selector de obras de ejemplo en lugar del buscador | «Conecta Spotify para buscar en el catálogo completo.» + «Conectar con Spotify» |
| Sin conexión | Se puede elegir obra de ejemplo y publicar; banner de sin conexión en la cabecera | «Sin conexión. Puedes opinar sobre las obras de ejemplo.» |

**Modo edición** (US6.1): mismo formulario con estas diferencias — título «Editar opinión», la obra queda fija (sin «Cambiar», sin buscador), texto y valoración llegan rellenos, el botón dice «Guardar», y «Cancelar» vuelve al detalle sin guardar. No se añade diálogo de confirmación de descartes: no está en las historias y añadiría un estado que la persona tiene que aprender.

**Responsive**: compacto, una columna con el botón fijo al pie. Medio y expandido, formulario a 640 dp centrado; el botón pasa a ancho del formulario (no de la pantalla).

**Historias**: US5.1, US5.2, US5.3, US6.1. **Requisitos**: FR5.1–FR5.7, FR6.1, FR6.3, FR6.4.

---

## Pantalla 5 — Actividad

**Tarea**: saber qué pasó con lo publicado.

```
┌────────────────────────────────────────┐
│ Actividad                              │  AppHeader
├────────────────────────────────────────┤
│ Hoy                                    │  DayHeader · sticky
│ ┌────────────────────────────────────┐ │
│ │ ★  Publicaste tu opinión de         │ │  ActivityRow
│ │    «Título de la obra»              │ │
│ │    hace 1 h                    ›   │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ ♡  A alguien le gustó tu opinión de │ │
│ │    «…»                              │ │
│ │    hace 2 h                    ›   │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 💬 Comentaron tu opinión de «…»     │ │
│ │    hace 5 h                    ›   │ │
│ └────────────────────────────────────┘ │
│ Ayer                                   │
│ ┌────────────────────────────────────┐ │
│ │ …                                  │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│  ⌂       ⌕       +       ♡       ☺    │
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Encabezado de día | «Hoy», «Ayer», «6 nov 2026» | `type.label`, `color.textSecondary` | Se queda pegado arriba mientras dura el grupo (`stickyHeaderIndices`). |
| Fila de evento | Icono según tipo + texto + tiempo relativo + chevron | `ActivityRow` | Abre el detalle de la opinión correspondiente (FR8.3). |
| Iconos | `★` publicación, `♡` me gusta recibido, `💬` comentario recibido | 20 dp, `color.primary` / `color.accentStar` / `color.textSecondary` | Decorativos: el texto de la fila ya dice qué pasó. |

**Estados**

| Estado | Qué se ve | Texto exacto |
|---|---|---|
| Carga | 2 grupos de esqueleto con su encabezado de día | — |
| Vacío | Bloque centrado con acción | «Todavía no hay actividad.» + «Crear opinión» |
| Error | Bloque de error | «No pudimos cargar tu actividad.» + «Reintentar» |
| Sin conexión | Se conserva lo cargado y se avisa en la cabecera | «Sin conexión. Estás viendo lo último que cargamos.» |
| Precargado | 3 publicaciones, 2 me gusta recibidos y 3 comentarios recibidos de la cuenta demo (FR3.7) | — |

**Responsive**: compacto, una columna. Medio y expandido, la lista se limita a 720 dp centrada; no se parten los grupos de día en dos columnas para no romper la lectura cronológica.

**Historias**: US8.1. **Requisitos**: FR8.1–FR8.4, FR11.6.

---

## Pantalla 6 — Perfil

**Tarea**: mi identidad, mis números, mis opiniones y el control de Spotify.

```
┌────────────────────────────────────────┐
│ Perfil                                 │  AppHeader
├────────────────────────────────────────┤
│              ┌──────┐                  │
│              │  D   │                  │  Avatar 72
│              └──────┘                  │
│            Usuario demo                │  type.title1
│               @demo                    │  type.body · textSecondary
│                                        │
│      3 opiniones   ·   2 siguiendo     │  type.label
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Spotify               ✓ Conectado  │ │  SpotifyCard
│ │ Conectado con tu cuenta.           │ │
│ │                        Desconectar │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Mis opiniones                          │  type.title2
│ ┌────────────────────────────────────┐ │
│ │ ▢  Título · Artista                │ │  OpinionCard `compact`
│ │    ★★★★☆ · 4/5                     │ │
│ │    Texto recortado a 2 líneas…     │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ …                                  │ │
│ └────────────────────────────────────┘ │
│                                        │
│              Cerrar sesión             │  TextButton · error
├────────────────────────────────────────┤
│  ⌂       ⌕       +       ♡       ☺    │
└────────────────────────────────────────┘
```

| Elemento | Contenido | Token | Comportamiento |
|---|---|---|---|
| Identidad | Avatar 72 con la inicial «D», «Usuario demo», «@demo» | `Avatar`, `type.title1`, `type.body` | Estática. El nombre es el `h1`. |
| Contadores | «3 opiniones · 2 siguiendo» | `type.label` | Se actualizan en vivo al publicar o seguir. |
| Tarjeta de Spotify | Título «Spotify», estado y acción | `SpotifyCard` | Cinco estados (abajo). Es el único lugar con «Desconectar». |
| Mis opiniones | Lista de `OpinionCard` `compact` | — | Tocar abre el detalle de opinión con «Editar» (FR9.6). |
| Cerrar sesión | Acción de texto en color de error | `TextButton` | Borra el recuerdo de sesión y vuelve a Login (FR1.5). Única acción destructiva de la pantalla, separada del resto. |

**Estados de la tarjeta de Spotify** (FR9.5, AC9.1.8, AC10.1.6)

| Estado | Texto | Acción |
|---|---|---|
| Desconectado | «Sin conectar» / «Conecta para ver portadas y buscar en el catálogo completo.» | «Conectar con Spotify» |
| Conectando | «Conectando…» + indicador | Botón deshabilitado |
| Conectado | «Conectado» / «Conectado con tu cuenta.» | «Desconectar» (texto, color de error) |
| Error de conexión | «No pudimos conectar con Spotify.» | «Reintentar» |
| Token inválido | «Tu sesión de Spotify caducó. Vuelve a conectar.» | «Conectar con Spotify» |

**Otros estados**: carga (esqueletos de identidad y de lista), vacío de opiniones («Todavía no has publicado opiniones.» + «Crear opinión»), error de carga («No pudimos cargar tu perfil.» + «Reintentar»), sin conexión (se conserva lo cargado; el avatar y los contadores siguen visibles).

**Responsive**: compacto, una columna. Medio, identidad y tarjeta de Spotify a la izquierda (320 dp) y opiniones a la derecha. Expandido, misma disposición con margen mayor y lista a 2 columnas.

**Historias**: US9.1, US10.1, US10.2, US1.3, US7.3. **Requisitos**: FR1.5, FR9.1–FR9.6, FR10.3, FR10.5, FR11.6.

---

## Vista de detalle de obra

Se abre desde Inicio (a la opinión), Explorar (a la obra), Crear y Actividad (a la opinión). Vive dentro de la pestaña de origen.

```
┌────────────────────────────────────────┐
│ ‹ Volver                               │  AppHeader con volver
├────────────────────────────────────────┤
│ ┌──────────┐  Título de la obra        │  WorkHeader
│ │          │  Artista                  │
│ │ portada  │  ★★★★☆ · 4/5 · 3 opiniones│
│ │  96×96   │                           │
│ └──────────┘                           │
├────────────────────────────────────────┤
│ Tu opinión                    Editar   │  OpinionCard `own`
│ ★★★★☆ · 4/5                            │
│ Texto completo de mi opinión…          │
│ Creada el 4 nov 2026 · Editada el 6 nov│
├────────────────────────────────────────┤
│ Otras opiniones                        │  type.title2
│ ☺ @ana · hace 2 h                      │  OpinionCard `detail`
│ Texto completo de la opinión, sin      │
│ recortar.                              │
│ ♡ 12   💬 3        Seguir autor        │
│ ─────────────────────────────────────  │
│ ☺ @bruno · hace 1 d                    │
│ …                                      │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │      Opinar sobre esta obra        │ │  solo si no hay opinión propia
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Variantes**

| Variante | Cuándo | Qué muestra |
|---|---|---|
| Obra con opiniones de otros y ninguna propia | US4.1 | Identidad + lista de opiniones ajenas + botón «Opinar sobre esta obra». |
| Obra con mi opinión y otras | US4.2 | Mi opinión primero, destacada y con «Editar»; debajo las ajenas; sin botón de opinar. |
| Obra con mi opinión y ninguna otra | US4.2 | Mi opinión primero con «Editar»; debajo, «Nadie más ha opinado todavía». |
| Obra sin opiniones | US4.3 | Identidad + «Todavía nadie ha opinado sobre esta obra.» + botón «Opinar sobre esta obra». |

**Detalle de opinión** (desde una tarjeta de Inicio, Actividad o Perfil): misma cabecera de obra, y en lugar de la lista se muestra **una** opinión a pantalla completa con su autor, tiempo, valoración, texto completo y acciones sociales. Si es propia, lleva «Editar» y las fechas.

**Estados**

| Estado | Qué se ve | Texto exacto |
|---|---|---|
| Carga | Esqueletos de cabecera (96×96) y de dos opiniones | — |
| Portada fallida | Bloque con la inicial en el mismo hueco de 96×96; el resto se ve | — |
| Error de red | Bloque de error en el lugar del contenido, conservando la identidad si ya se cargó | «No pudimos cargar esta obra.» + «Reintentar» |
| Sin opiniones | Variante de obra sin opiniones | «Todavía nadie ha opinado sobre esta obra.» |

**Responsive**: compacto, una columna y botón al final del contenido (no fijo, para no tapar la última opinión). Medio, cabecera a 640 dp. Expandido, dos paneles: identidad y acción a la izquierda (fija), opiniones con scroll a la derecha.

**Historias**: US2.3, US3.1, US4.1, US4.2, US4.3, US6.1, US7.1, US7.2, US7.3, US8.1, US9.1, US10.1. **Requisitos**: FR2.3, FR6.2–FR6.9.

---

## Hojas y avisos

### Hoja de comentarios

```
┌────────────────────────────────────────┐
│              ▬▬▬▬                      │  asa de arrastre
│ Comentarios                        ✕   │  type.title2
├────────────────────────────────────────┤
│ ☺ @ana · hace 1 h                      │
│ «Totalmente de acuerdo»                │
│                                        │
│ ☺ @luis · hace 20 min                  │
│ «Yo prefiero el lado B»                │
│                                        │
├────────────────────────────────────────┤
│ ┌──────────────────────────┐  ┌─────┐  │
│ │ Escribe un comentario…   │  │  ➤  │  │  input + enviar 44×44
│ └──────────────────────────┘  └─────┘  │
└────────────────────────────────────────┘
```

Alto máximo 70 % de la pantalla, con scroll interno en la lista. El campo queda siempre visible por encima del teclado. Estados: vacío («Sé el primero en comentar»), con comentarios, enviando (indicador en el botón), error al enviar («No pudimos enviar tu comentario.» + «Reintentar», conservando el texto).

### Snackbar

Franja de una línea sobre la barra inferior, fondo `color.inverseSurface`, texto `color.inverseText`, 4 s. Mensajes: «Opinión publicada», «Opinión actualizada», «Comentario publicado», «Ahora sigues a @ana», «Ya no sigues a @ana», «Spotify desconectado». Sin acciones: no hay «Deshacer» en esta versión.

### Banner de sin conexión

Franja bajo la cabecera, fondo `color.warningContainer`, texto `color.onWarningContainer`, con «Reintentar» cuando hay algo que reintentar. No bloquea la pantalla: se puede seguir leyendo lo cargado.

---

## Matriz de estados

`—` significa que el estado no existe en esa pantalla, con la razón anotada.

| Pantalla | Carga | Vacío | Error | Sin Spotify | Sin conexión |
|---|---|---|---|---|---|
| Login | — (nada que traer) | — (nada que vaciar) | Error de credenciales en línea | — (no aplica a la entrada) | — (la validación es local) |
| Inicio | Esqueletos de tarjeta | «Aún no hay opiniones. Sé el primero.» + «Crear opinión» | Banner de metadatos + lista con bloques; error de contenido con «Reintentar» | Portadas de bloque y chip «Conectar» | Banner, lo cargado se conserva, portadas de bloque |
| Explorar | Esqueletos de fila (5) | «Sin resultados para «…»» | «No pudimos buscar en Spotify.» + «Reintentar» | Tarjeta de conexión + sugerencias | Banner + caché si existe; si no, error con «Reintentar» |
| Detalle de obra | Esqueletos de cabecera y opiniones | «Todavía nadie ha opinado sobre esta obra.» + botón | «No pudimos cargar esta obra.» + «Reintentar» | Portada de bloque, resto intacto | Contenido cargado + banner |
| Detalle de opinión | Esqueletos de cabecera y texto | — (siempre hay una opinión) | «No pudimos cargar esta opinión.» + «Reintentar» | Portada de bloque | Contenido cargado + banner |
| Crear | Esqueletos de resultado de búsqueda | Sin resultados: «No encontramos esa obra.» | «No pudimos publicar tu opinión.» + «Reintentar» | Tarjeta de conexión + selector de ejemplo | Banner; se puede publicar sobre el catálogo de ejemplo |
| Editar | — (los datos llegan del detalle) | — (siempre hay texto previo) | «No pudimos guardar los cambios.» + «Reintentar» | Portada de bloque en la obra fija | Banner; se puede guardar |
| Actividad | Esqueletos agrupados por día | «Todavía no hay actividad.» + «Crear opinión» | «No pudimos cargar tu actividad.» + «Reintentar» | — (no depende de Spotify) | Banner + lo cargado |
| Perfil | Esqueletos de identidad y lista | «Todavía no has publicado opiniones.» + «Crear opinión» | «No pudimos cargar tu perfil.» + «Reintentar» | Tarjeta «Sin conectar» | Banner + identidad y contadores |
| Hoja de comentarios | Indicador al abrir si hay que cargar | «Sé el primero en comentar» | «No pudimos enviar tu comentario.» + «Reintentar» | — (los comentarios son locales) | Los comentarios son locales: se puede comentar sin red |

**Login es la única excepción deliberada** al mapa de estados de la práctica: no hay contenido remoto que cargar, lista que vaciar ni reintento posible antes de entrar. Se documenta aquí y en `accessibility-checklist.md` para que la prueba de estados no la cuente como hueco.

---

## Responsive

Tres anchos, medidos en dp sobre el ancho de la ventana:

| Ancho | Rango | Rejilla | Navegación | Notas |
|---|---|---|---|---|
| Compacto | < 600 | 1 columna, márgenes 16 | Barra inferior | Teléfono en vertical y en horizontal. Es el ancho verificado en el teléfono físico. |
| Medio | 600–839 | 2 columnas en listas (Inicio, Explorar, Perfil), márgenes 24 | Barra inferior | Formularios limitados a 640 dp centrados. |
| Expandido | ≥ 840 | 2 columnas, contenido hasta 960 dp | Barra lateral de navegación a la izquierda (72 dp en iconos, 240 dp con etiquetas) | Detalle de obra a dos paneles: identidad fija a la izquierda, opiniones con scroll a la derecha. |

**Consecuencia**: el diseño de tablet queda especificado como contrato para Construction, pero **esta versión solo se verifica en el teléfono Android físico** (RC-05, NFR7). No hay tablet disponible y el recorrido de aceptación se hace en un teléfono. La tabla existe para que el código no se escriba con medidas rígidas de teléfono y para no rehacer el diseño si el proyecto crece.

---

## Mapa de historias a bloques

| Historia | Pantalla o vista | Bloques principales |
|---|---|---|
| US1.1 Entrar con la cuenta demo | Login | Marca, dos campos, «Entrar», pista demo, error en línea |
| US1.2 Volver y caer en Inicio | Arranque, Inicio | Splash, cabecera, barra inferior con cinco destinos |
| US1.3 Cerrar sesión | Perfil | Acción «Cerrar sesión» |
| US2.1 Ver el feed | Inicio | `AppHeader`, «Para ti», `OpinionCard` ×8–10, estados |
| US2.2 Portadas según sesión | Inicio, tarjeta | `CoverArt` (portada o bloque de inicial), chip de Spotify |
| US2.3 Abrir el detalle desde una tarjeta | Inicio → detalle de opinión | Tarjeta tocable, «← Volver», texto completo |
| US3.1 Buscar en Spotify | Explorar | `SearchField`, `WorkResultRow`, estados y caché |
| US3.2 Explorar sin sesión | Explorar | `ConnectionCard`, sugerencias del catálogo de ejemplo |
| US4.1 Obra con opiniones de otros | Detalle de obra | `WorkHeader`, lista de `OpinionCard` `detail`, botón |
| US4.2 Mi opinión junto a las de otros | Detalle de obra | `OpinionCard` `own` con «Editar», orden y fechas |
| US4.3 Obra sin opiniones | Detalle de obra | Identidad, mensaje vacío, botón «Opinar sobre esta obra» |
| US5.1 Publicar desde Crear | Crear | Buscador, obra seleccionada, texto, `RatingInput`, «Publicar», aviso de obra ya opinada |
| US5.2 Publicar sin sesión | Crear | `ConnectionCard` compacta, selector de ejemplo, publicación con bloque |
| US5.3 Publicar desde el detalle | Detalle → Crear | Obra preseleccionada, buscador plegado, «Cancelar», error que conserva |
| US6.1 Editar mi opinión y ver la fecha | Detalle → Editar | «Editar», formulario en modo edición, obra fija, «Guardar», «Editada el …» |
| US7.1 Dar y quitar me gusta | Tarjeta de opinión | `SocialActionBar` `♡`/`♥` + contador |
| US7.2 Comentar una opinión | Hoja de comentarios | Hoja, lista, campo, botón de enviar, estados |
| US7.3 Seguir a un autor | Tarjeta y detalle | «Seguir autor» / «Siguiendo», contador de Perfil |
| US8.1 Ver actividad y abrir una opinión | Actividad | `DayHeader`, `ActivityRow`, navegación al detalle |
| US9.1 Identidad, contadores y opiniones | Perfil | Avatar, nombre, contadores, `SpotifyCard`, lista, «Cerrar sesión» |
| US10.1 Conectar Spotify y mantener la conexión | Perfil, Explorar, Crear, Inicio | `SpotifyCard` (5 estados), `ConnectionCard`, chip de cabecera |
| US10.2 Desconectar y recuperarme de un fallo | Perfil | «Desconectar», aviso de token inválido, error con «Reintentar» |
| US11.1 Recorrido sin sesión | Todas | Las seis pantallas y sus estados sin sesión |
| US11.2 Recorrido con sesión | Todas | Las seis pantallas con portadas reales y búsqueda en el catálogo |

Ninguna historia queda sin bloque visible; las 24 aparecen al menos una vez y las de estado (US2.1, US3.1, US4.1, US8.1, US9.1) aparecen además en la matriz de estados.

## Assumptions & Open Questions

- `[assumption]` El texto de la opinión no tiene límite visible ni contador en esta versión; el límite y la obligatoriedad de la valoración se cierran en Functional Design (A1, OQ1). El diseño reserva el hueco del contador bajo el campo para no rehacer la pantalla cuando se fije.
- `[assumption]` Los cinco estados de la tarjeta de Spotify se dibujan en Perfil; el chip de Inicio solo distingue «Conectado» y «Conectar», porque duplicar los cinco en la cabecera convertiría una cabecera en un panel de control.
- `[assumption]` El detalle de obra y el de opinión comparten cabecera y se distinguen por el contenido: lista de opiniones frente a una sola opinión. No se crean dos pantallas distintas.
- `[assumption]` La tablet y el ancho expandido quedan especificados pero no verificados en esta versión (RC-05). Si la tablet pasa a criterio de terminado, exige una historia y una verificación propias.
- **Ninguna pregunta abierta bloquea la construcción.** Las tres decisiones que faltan —límite de texto, obligatoriedad de la valoración y redirect URI— pertenecen a Functional Design y no cambian la estructura de ninguna pantalla.

## Sources

- `wireframes` — `ideation/rough-mockups/wireframes.md` (estructura de las seis pantallas, tarjeta compartida, mapa de estados).
- `user-flow` — `ideation/rough-mockups/user-flow.md` (camino feliz, subflujo de Spotify, recuperación de errores).
- `stories` — `inception/user-stories/stories.md` (24 historias, 112 criterios).
- `requirements` — `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9, RC-01–RC-09).
- `team-practices` — `inception/practices-discovery/team-practices.md` (cobertura de estados, español, errores con acción).
- `refined-mockups-questions` — `inception/refined-mockups/refined-mockups-questions.md` (Q1–Q6 y su confirmación).
- `design-system-mapping` — `inception/refined-mockups/design-system-mapping.md` (valores de los tokens citados aquí).
- `interaction-spec` — `inception/refined-mockups/interaction-spec.md` (comportamiento de cada componente).
