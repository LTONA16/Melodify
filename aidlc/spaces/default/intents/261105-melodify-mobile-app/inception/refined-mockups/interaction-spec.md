# Interaction Specification — Melodify

> **Provenance**: deriva de `inception/refined-mockups/mockups.md`, de `inception/user-stories/stories.md` (criterios de aceptación), de `inception/requirements-analysis/requirements.md` (FR1–FR12) y de las respuestas de `refined-mockups-questions.md` (Q2 = A, Q3 = A). El formato de cada componente sigue `.aidlc/knowledge/aidlc-design-agent/component-spec-template.md`, adaptado a React Native.
> Fecha: 2026-11-09. Etapa: Refined Mockups. Agente: aidlc-design-agent.

## Cómo leer esta especificación

Cada componente declara sus estados, sus entradas, su comportamiento responsive y su accesibilidad. Los valores de los tokens están en `design-system-mapping.md`; la posición de cada componente en pantalla, en `mockups.md`.

Convención de nombres: `on<Evento>` para callbacks, `variant` para la forma visual, `state` para el estado de datos. Ningún componente pinta un color literal: todos reciben el tema activo.

## Componentes compartidos

### AppHeader

| Field | Value |
|---|---|
| Component | `AppHeader` |
| Description | Cabecera fija de pantalla: título, acción de vuelta o acción de texto. |
| Category | navigation |

**States**

| State | Description | Trigger |
|---|---|---|
| default | Título centrado/izquierdo + hueco de acción vacío | pantalla raíz |
| back | «‹ Volver» a la izquierda y título a la derecha | pantalla apilada en una pestaña |
| action | Título + acción de texto a la derecha («Cancelar») | Crear y Editar |
| scrolled | Borde inferior visible | la lista deja de estar en el tope |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | yes | — | Texto del `h1`. |
| `onBack` | function | no | — | Si existe, muestra «‹ Volver» y ocupa el hueco izquierdo. |
| `action` | object | no | — | `{ label, onPress, tone }`; `tone` es `primary` o `destructive`. |
| `showBorder` | boolean | no | `false` | Borde inferior al hacer scroll. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto (< 600) | Título a la izquierda, acción a la derecha; altura 56. |
| medio (600–839) | Igual, con padding lateral de 24. |
| expandido (≥ 840) | La barra inferior pasa a lateral; la cabecera se mantiene y el título se alinea con el contenido. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `header`; el título es el `h1` de la pantalla. |
| Keyboard interaction | No aplica (táctil). |
| Label | «Volver» visible con chevron; la acción lleva su texto visible. |
| Contrast ratio | `color.text` sobre `color.bg`: 17.2:1 claro, 16.6:1 oscuro. |
| Screen reader | Fuera de alcance en esta versión (NFR6, Q5 = A). El rol de cabecera lo expone la plataforma sin trabajo adicional. |
| Focus management | Al abrir una pantalla apilada, el foco lógico entra en el título. |

### BottomTabBar

| Field | Value |
|---|---|
| Component | `BottomTabBar` |
| Description | Barra persistente con los cinco destinos de la app. |
| Category | navigation |

**States**

| State | Description | Trigger |
|---|---|---|
| default | Cinco destinos, icono de contorno y etiqueta | pantalla raíz de una pestaña |
| active | Destino actual: icono relleno, etiqueta y color primario | pestaña seleccionada |
| pressed | Fondo `color.primaryContainer` a 12 % durante 120 ms | toque |
| hidden | No se renderiza | Login y hojas modales |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `active` | string | yes | — | `inicio`, `explorar`, `crear`, `actividad`, `perfil`. |
| `onSelect` | function | yes | — | Recibe el destino tocado. |
| `badges` | object | no | `{}` | Contadores futuros; vacío en esta versión. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Barra inferior, altura 56 + `safe.bottom`, cinco destinos a partes iguales. Etiquetas de 12 dp siempre visibles. |
| medio | Igual, con etiquetas de 14 dp. |
| expandido | Barra **lateral** de 72 dp (solo iconos) o 240 dp con etiquetas; el contenido ocupa el resto. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `tablist`; cada destino `tab` con estado `selected`. |
| Keyboard interaction | No aplica. |
| Label | Etiqueta visible bajo el icono: «Inicio», «Explorar», «Crear», «Actividad», «Perfil». |
| Contrast ratio | Activo `color.primary` sobre `bg` 8.1:1; inactivo `color.textMuted` 5.3:1 (claro). |
| Screen reader | Fuera de alcance en esta versión. |
| Focus management | Al cambiar de pestaña, el foco lógico entra en el `h1` de la nueva pantalla. |

**Área táctil**: cada destino ocupa al menos 44×44 (alto 56, ancho = ventana/5 ≥ 72 en un teléfono de 360).

### SpotifyStatusChip

| Field | Value |
|---|---|
| Component | `SpotifyStatusChip` |
| Description | Píldora de la cabecera de Inicio que muestra el estado de Spotify y abre la conexión. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| connected | Punto verde + «Conectado» | hay token válido |
| disconnected | Botón «Conectar» con borde | no hay token |
| pressed | Fondo `primaryContainer` | toque |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | `'connected' \| 'disconnected'` | yes | — | Estado de la sesión de Spotify. |
| `onConnect` | function | yes | — | Inicia PKCE. |
| `onOpenProfile` | function | yes | — | «Conectado» lleva a Perfil para desconectar. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Visible en la cabecera; texto de 12 dp. |
| medio y expandido | Igual, con más padding. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `button` cuando dice «Conectar»; `text` cuando dice «Conectado» (no hay acción destructiva desde aquí). |
| Label | El texto visible es la etiqueta. |
| Contrast ratio | `success` sobre `bg` 6.5:1; `primary` sobre `bg` 8.1:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### OpinionCard

| Field | Value |
|---|---|
| Component | `OpinionCard` |
| Description | Tarjeta única y compartida para mostrar una opinión en el feed, el perfil y el detalle. Ninguna pantalla la reimplementa. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| feed | Portada 56, obra, artista, valoración, texto a 3 líneas, acciones sociales | Inicio |
| compact | Portada 48, obra, artista, valoración y texto a 2 líneas; sin acciones sociales | Perfil |
| detail | Sin recorte de texto; autor y tiempo; acciones sociales | Detalle de obra y de opinión |
| own | Fondo `primaryContainer`, etiqueta «Tu opinión», acción «Editar», fechas | opinión de la persona |
| loading | Esqueleto con la altura del contenido | mientras carga |
| pressed | Elevación 0 → borde `primary` durante el toque | toque |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `opinion` | object | yes | — | `{ id, workId, workTitle, artist, coverUrl, rating, text, author, isOwn, likes, comments, createdAt, updatedAt, following }`. |
| `variant` | `'feed' \| 'compact' \| 'detail'` | no | `'feed'` | Forma visual. |
| `onPress` | function | no | — | Abre el detalle. |
| `onToggleLike` | function | no | — | Alterna me gusta. |
| `onOpenComments` | function | no | — | Abre la hoja. |
| `onToggleFollow` | function | no | — | Alterna seguimiento (solo si `author` no es la persona). |
| `onEdit` | function | no | — | Presente solo en `own`. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo, padding 16, texto a 3 líneas (2 en `compact`). |
| medio | Dos columnas en Inicio y Perfil; en detalle, ancho máximo 640. |
| expandido | Dos columnas; en el panel de detalle, ancho completo del panel derecho. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `button` en la tarjeta entera; los iconos sociales son `button` independientes. |
| Keyboard interaction | No aplica. |
| Label | La tarjeta se anuncia con «Opinión de {autor} sobre {obra}, {n} de 5». |
| Contrast ratio | Texto 17.2:1; valoración 6.1:1; borde decorativo 1.5:1 (no informativo). |
| Screen reader | Fuera de alcance; la etiqueta queda escrita para cuando se active. |
| Focus management | El toque en la tarjeta no mueve el foco de los iconos: cada acción detiene la propagación. |

**Regla de oro**: los iconos sociales y «Seguir autor» **no** disparan la navegación de la tarjeta. Un toque en el corazón cambia el corazón; uno en el texto abre el detalle.

### CoverArt

| Field | Value |
|---|---|
| Component | `CoverArt` |
| Description | Portada de una obra con tres estados: imagen, carga y bloque de inicial. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| loading | Bloque `color.skeleton` del tamaño final | la URL aún no resolvió |
| image | Imagen recortada a cuadrado | la URL cargó |
| fallback | Bloque `surfaceSunken` con la inicial de la obra | no hay URL, falla o no hay sesión de Spotify |
| error | Igual que `fallback`; nunca deja hueco roto | error de red de la imagen |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `uri` | string \| null | yes | — | URL de la portada; `null` fuerza `fallback`. |
| `title` | string | yes | — | Fuente de la inicial del bloque. |
| `size` | number | yes | — | 56, 48 o 96 según contexto. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto, medio, expandido | Tamaño fijo por contexto; no escala con el ancho. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `image` cuando hay imagen; el bloque de inicial es decorativo. |
| Label | «Portada de {título}». |
| Contrast ratio | Inicial `type.title2` `color.text` sobre `surfaceSunken`: ≥ 12:1 en ambos temas. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

**Regla**: la inicial es la primera letra del título, en mayúscula, sin tildes convertidas (`Á` → `Á`, no `A`); si el título empieza por artículo, se usa la primera letra del título tal cual, no la de la palabra significativa.

### RatingStars

| Field | Value |
|---|---|
| Component | `RatingStars` |
| Description | Valoración de solo lectura: cinco estrellas y el número. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| rated | `★★★☆☆` + «3/5» | hay valoración |
| empty | `☆☆☆☆☆` + «Sin valorar» | valoración 0 (solo en datos heredados) |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | number | yes | — | 0–5, entero. |
| `showNumber` | boolean | no | `true` | Añade «N/5». |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Tamaño 16 dp por estrella; no cambia. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `text`. |
| Label | «{n} de 5 estrellas». |
| Contrast ratio | `accentStar` 6.1:1 claro, 12.0:1 oscuro. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### RatingInput

| Field | Value |
|---|---|
| Component | `RatingInput` |
| Description | Selector de valoración de 1 a 5 con estrellas tocables. |
| Category | input |

**States**

| State | Description | Trigger |
|---|---|---|
| empty | Cinco estrellas vacías; «Sin valorar» | formulario nuevo |
| hovered | Estrella bajo el dedo, previsualización del valor | `onPressIn` |
| selected | Estrellas rellenas hasta el valor; «4 de 5» | toque |
| disabled | Sin interacción, opacidad 0.5 | publicando o guardando |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | number | yes | `0` | Valor actual. |
| `onChange` | function | yes | — | Recibe 1–5 o 0 al quitar. |
| `disabled` | boolean | no | `false` | Bloquea la interacción. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Cinco objetivos de 44×44 en fila; el grupo ocupa 220 dp y cabe en un teléfono de 360. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | Cada estrella es `button`; el grupo es `radiogroup` lógico. |
| Label | «{n} de 5 estrellas» por estrella; el grupo, «Valoración». |
| Contrast ratio | Estrella rellena `accentStar` 6.1:1; vacía `borderStrong` 5.3:1. |
| Screen reader | Fuera de alcance. |
| Focus management | Al tocar, el foco lógico permanece en la estrella elegida. |

**Regla**: volver a tocar la estrella ya elegida **no** borra la valoración (una persona que repite el toque por duda no pierde lo elegido). Para volver a cero existe la acción de texto «Quitar valoración».

### SocialActionBar

| Field | Value |
|---|---|
| Component | `SocialActionBar` |
| Description | Fila de acciones de una opinión: me gusta, comentar y seguir autor. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| idle | `♡ 12` · `💬 3` · «Seguir autor» | estado inicial |
| liked | `♥ 13` en `color.error` | me gusta dado |
| following | «Siguiendo» con borde primario | autor seguido |
| pressed | Escala 1.2 del corazón durante 120 ms | toque |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `likes` | number | yes | — | Contador actual. |
| `liked` | boolean | yes | — | Si la persona ya dio me gusta. |
| `comments` | number | yes | — | Número de comentarios. |
| `following` | boolean | yes | — | Si sigue al autor. |
| `showFollow` | boolean | no | `true` | `false` en la opinión propia. |
| `onToggleLike` | function | yes | — | Alterna. |
| `onOpenComments` | function | yes | — | Abre la hoja. |
| `onToggleFollow` | function | yes | — | Alterna. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Me gusta y comentario a la izquierda; «Seguir autor» a la derecha. |
| medio y expandido | Igual, con más separación. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | Tres `button` independientes. |
| Label | «Me gusta, {n}», «Comentarios, {n}», «Seguir a {autor}» / «Dejar de seguir a {autor}». |
| Contrast ratio | `textSecondary` 6.8:1; corazón activo `error` 6.5:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### ConnectionCard

| Field | Value |
|---|---|
| Component | `ConnectionCard` |
| Description | Tarjeta que explica que buscar en el catálogo real requiere Spotify y ofrece conectarlo. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| default | Título, explicación y botón | sin sesión de Spotify |
| connecting | Botón con indicador y texto «Conectando…» | PKCE en curso |
| error | Mensaje y «Reintentar» | fallo de autorización o de configuración |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | `'default' \| 'connecting' \| 'error'` | yes | — | Estado. |
| `errorMessage` | string | no | — | Texto del error cuando aplica. |
| `onConnect` | function | yes | — | Inicia PKCE. |
| `compact` | boolean | no | `false` | Versión de Crear, sin ilustración. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo, padding 16. |
| medio y expandido | Máximo 640 dp, centrada. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `summary` + `button`. |
| Label | El texto visible es la etiqueta del botón. |
| Contrast ratio | `onPrimaryContainer` sobre `primaryContainer` 13.0:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### SpotifyCard

| Field | Value |
|---|---|
| Component | `SpotifyCard` |
| Description | Tarjeta de Perfil con los cinco estados de la conexión de Spotify y su acción. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| disconnected | «Sin conectar» + «Conectar con Spotify» | sin token |
| connecting | «Conectando…» + indicador; botón deshabilitado | PKCE en curso |
| connected | «Conectado» + «Desconectar» | token válido |
| connectionError | «No pudimos conectar con Spotify.» + «Reintentar» | fallo de autorización o intercambio |
| invalidToken | «Tu sesión de Spotify caducó. Vuelve a conectar.» + «Conectar con Spotify» | 401 al usar el token |
| misconfigured | «La conexión con Spotify no está configurada en esta instalación.» + «Reintentar» | falta `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `status` | union | yes | — | Los seis valores de arriba. |
| `onConnect` | function | yes | — | Inicia PKCE. |
| `onDisconnect` | function | yes | — | Borra el token del almacenamiento seguro. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo. |
| medio y expandido | Columna izquierda de 320 dp. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `summary`; las acciones, `button`. |
| Label | Estado y acción visibles; «Desconectar» en `color.error`. |
| Contrast ratio | `error` 6.5:1 claro / 11.1:1 oscuro. |
| Screen reader | Fuera de alcance. |
| Focus management | Tras desconectar, el foco lógico vuelve al botón «Conectar con Spotify». |

### EmptyState

| Field | Value |
|---|---|
| Component | `EmptyState` |
| Description | Bloque de lista sin contenido, con mensaje y acción. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| withAction | Icono + título + descripción + botón | lista vacía con acción posible |
| passive | Icono + título + descripción | lista vacía sin acción (p. ej. comentarios) |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | yes | — | Mensaje principal. |
| `description` | string | no | — | Ayuda de una línea. |
| `actionLabel` | string | no | — | Etiqueta del botón. |
| `onAction` | function | no | — | Acción. |
| `icon` | string | no | `musical-notes-outline` | Icono de 32 dp. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Centrado, ancho máximo 320, padding vertical 40. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `text` + `button`. |
| Label | Título y descripción visibles. |
| Contrast ratio | `text` 17.2:1; `textSecondary` 6.8:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### ErrorState

| Field | Value |
|---|---|
| Component | `ErrorState` |
| Description | Bloque de error en lenguaje llano con acción «Reintentar». |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| inline | Franja bajo la cabecera o sobre un botón | error que no invalida el contenido ya visible |
| full | Bloque que ocupa el lugar del contenido | error que impide mostrar la pantalla |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | string | yes | — | Texto en lenguaje llano, en español. |
| `onRetry` | function | no | — | Si existe, muestra «Reintentar». |
| `variant` | `'inline' \| 'full'` | no | `'full'` | Forma. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | `inline` ocupa el ancho disponible; `full` se centra con máximo 360. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `alert` en `inline`; `text` + `button` en `full`. |
| Label | El mensaje visible es la etiqueta. |
| Contrast ratio | `onErrorContainer` sobre `errorContainer`: ≥ 7:1 en ambos temas. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

**Regla de copy**: todo error dice qué pasó y qué puede hacer la persona. Prohibido «Error 500», «Network request failed», «Algo salió mal» sin acción.

### Skeleton

| Field | Value |
|---|---|
| Component | `Skeleton` |
| Description | Bloque gris con pulso que ocupa el espacio del contenido mientras carga. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| pulsing | Alterna `skeleton` y `skeletonHighlight` cada 600 ms | carga |
| static | Sin pulso | «reducir movimiento» activo |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `width` | number \| string | yes | — | Ancho. |
| `height` | number | yes | — | Alto. |
| `radius` | number | no | `radius.md` | Radio. |
| `shape` | `'block' \| 'circle'` | no | `'block'` | Círculo para avatares. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Usa el ancho del contenedor real; nunca una medida fija de pantalla. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | Decorativo (`importantForAccessibility="no"`). |
| Label | Ninguna. |
| Contrast ratio | No aplica (no transmite información por color). |
| Screen reader | Fuera de alcance; además es decorativo. |
| Focus management | No aplica. |

### Snackbar

| Field | Value |
|---|---|
| Component | `Snackbar` |
| Description | Confirmación efímera de una acción completada. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| hidden | No se renderiza | estado inicial |
| visible | Franja de una línea sobre la barra inferior | acción completada |
| leaving | Desvanecido de 180 ms | a los 4 s o al cambiar de pantalla |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | string | yes | — | Texto de la confirmación. |
| `visible` | boolean | yes | — | Control de visibilidad. |
| `onHidden` | function | no | — | Limpieza al ocultarse. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo menos 16 por lado, sobre la barra. |
| medio y expandido | Máximo 480, centrado. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `alert` no interceptable. |
| Label | El mensaje visible. |
| Contrast ratio | `inverseText` sobre `inverseSurface`: ≥ 12:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No roba el foco. |

### CommentSheet

| Field | Value |
|---|---|
| Component | `CommentSheet` |
| Description | Hoja inferior con la lista de comentarios y el campo para añadir uno. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| opening | Velo + hoja subiendo 220 ms | toque en `💬` |
| empty | «Sé el primero en comentar» | sin comentarios |
| list | Lista con scroll interno | con comentarios |
| sending | Botón de enviar con indicador; campo deshabilitado | envío en curso |
| error | Mensaje sobre el campo; texto conservado | envío fallido |
| closed | Hoja fuera de pantalla | ✕, arrastre o toque en el velo |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `opinionId` | string | yes | — | Opinión cuyos comentarios se muestran. |
| `visible` | boolean | yes | — | Control de apertura. |
| `comments` | array | yes | — | `{ id, author, text, createdAt }[]`. |
| `onSend` | function | yes | — | Recibe el texto recortado; puede rechazar. |
| `onClose` | function | yes | — | Cierra la hoja. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Alto máximo 70 % de la pantalla; esquinas superiores de 24. |
| medio y expandido | Ancho máximo 640, centrada, mismo alto relativo. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `dialog` modal. |
| Label | «Comentarios». |
| Contrast ratio | Texto 17.2:1; campo con `borderStrong` 5.3:1. |
| Screen reader | Fuera de alcance. |
| Focus management | Al abrir, el foco lógico entra en el campo; al cerrar, vuelve al icono `💬` que la abrió. |

**Reglas**: el campo no envía vacío ni solo espacios; el botón de enviar se deshabilita en ese caso. El texto se conserva ante un error. La hoja no cambia de pestaña ni desmonta la pantalla de debajo.

### SearchField

| Field | Value |
|---|---|
| Component | `SearchField` |
| Description | Campo de búsqueda con lupa, limpieza y disparo diferido. |
| Category | input |

**States**

| State | Description | Trigger |
|---|---|---|
| idle | Placeholder, lupa a la izquierda | sin texto |
| typing | Texto + ✕ para limpiar | 1+ caracteres |
| waiting | Sin indicador visible; espera los 400 ms | 1 carácter |
| searching | Texto + spinner pequeño a la derecha | petición en curso |
| disabled | Opacidad 0.5 | publicando o guardando |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `value` | string | yes | — | Texto actual. |
| `onChangeText` | function | yes | — | Cambio de texto. |
| `placeholder` | string | no | «Busca artistas, álbumes…» | Texto de ayuda. |
| `autoFocus` | boolean | no | `false` | Foco al montar (Explorar). |
| `disabled` | boolean | no | `false` | Bloquea. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo, alto 48. |
| medio y expandido | Máximo 640, alineado a la izquierda del contenido. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `searchbox`. |
| Label | «Buscar en Spotify»; el placeholder no sustituye a la etiqueta. |
| Contrast ratio | `text` 17.2:1; borde `borderStrong` 5.3:1. |
| Screen reader | Fuera de alcance. |
| Focus management | El foco permanece en el campo mientras llegan resultados; nunca se roba. |

**Regla de disparo**: mínimo 2 caracteres, 400 ms desde la última pulsación, una sola petición por consulta; repetir la misma consulta (normalizada a minúsculas y sin espacios en los extremos) devuelve la caché sin petición ni indicador.

### TextField / MultilineField

| Field | Value |
|---|---|
| Component | `TextField` (una línea) y `MultilineField` (varias) |
| Description | Campo de texto con etiqueta, ayuda y error en línea. |
| Category | input |

**States**

| State | Description | Trigger |
|---|---|---|
| default | Borde `borderStrong`, etiqueta encima | sin foco |
| focused | Borde `primary` de 2 dp + `focusRing` | foco |
| filled | Texto y ✕/ojo cuando aplica | con contenido |
| error | Borde `error` + mensaje debajo | validación fallida |
| disabled | Opacidad 0.5 | envío en curso |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | yes | — | Etiqueta visible. |
| `value` | string | yes | — | Texto. |
| `onChangeText` | function | yes | — | Cambio. |
| `placeholder` | string | no | — | Ayuda dentro del campo. |
| `error` | string | no | — | Mensaje en línea. |
| `multiline` | boolean | no | `false` | Varias líneas. |
| `secureTextEntry` | boolean | no | `false` | Contraseña. |
| `maxLength` | number | no | — | Se fija cuando Functional Design cierre el límite. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo; multilínea mínimo 120, máximo 240. |
| medio y expandido | Máximo 640. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `textbox`. |
| Label | Etiqueta visible asociada. |
| Contrast ratio | Texto 17.2:1; error 6.5:1. |
| Screen reader | Fuera de alcance. |
| Focus management | El foco se mantiene al mostrar un error; no se cierra el teclado. |

### Buttons

| Field | Value |
|---|---|
| Component | `PrimaryButton`, `SecondaryButton`, `TextButton` |
| Description | Tres jerarquías de acción: principal, secundaria y de texto. |
| Category | input |

**States**

| State | Description | Trigger |
|---|---|---|
| enabled | Fondo primario / borde / sin fondo | acción disponible |
| pressed | Opacidad 0.85 + escala 0.99 durante 100 ms | toque |
| disabled | Fondo `border`, texto `textMuted`, sin interacción | falta un requisito |
| loading | Indicador 16 dp + texto de progreso; deshabilitado | operación en curso |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | yes | — | Texto del botón. |
| `onPress` | function | yes | — | Acción. |
| `disabled` | boolean | no | `false` | Bloquea. |
| `loading` | boolean | no | `false` | Indicador + bloqueo. |
| `tone` | `'primary' \| 'neutral' \| 'destructive'` | no | `'primary'` | Color. |
| `fullWidth` | boolean | no | `true` | Ocupa el ancho del contenedor. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo menos márgenes; alto 48. |
| medio y expandido | Ancho del formulario (máx. 640), no de la pantalla. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `button`; estado `disabled` expuesto. |
| Label | El texto visible. |
| Contrast ratio | `onPrimary`/`primary` 8.1:1 claro y 9.6:1 oscuro; deshabilitado no informativo. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### WorkResultRow

| Field | Value |
|---|---|
| Component | `WorkResultRow` |
| Description | Fila de resultado de búsqueda o de sugerencia del catálogo de ejemplo. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| withOpinions | Portada, título, artista y «N opiniones» | obra con opiniones locales |
| first | Portada, título, artista y «Sé el primero en opinar» | obra sin opiniones |
| skeleton | Bloque con la altura de la fila | carga |
| pressed | Fondo `surfaceSunken` | toque |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `work` | object | yes | — | `{ id, title, artist, coverUrl, opinionCount }`. |
| `onPress` | function | yes | — | Abre el detalle de obra. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo, alto mínimo 72. |
| medio y expandido | Dos columnas en Explorar. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `button`. |
| Label | «{título}, {artista}, {n} opiniones» o «…, sé el primero en opinar». |
| Contrast ratio | Texto 17.2:1; secundario 6.8:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### ActivityRow

| Field | Value |
|---|---|
| Component | `ActivityRow` |
| Description | Evento de actividad con icono, texto, tiempo relativo y chevron. |
| Category | display |

**States**

| State | Description | Trigger |
|---|---|---|
| publication | `★` + «Publicaste tu opinión de «…»» | evento propio de publicación |
| like | `♡` + «A alguien le gustó tu opinión de «…»» | me gusta recibido |
| comment | `💬` + «Comentaron tu opinión de «…»» | comentario recibido |
| pressed | Fondo `surfaceSunken` | toque |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `'publication' \| 'like' \| 'comment'` | yes | — | Tipo de evento. |
| `workTitle` | string | yes | — | Título entre comillas. |
| `relativeTime` | string | yes | — | «hace 1 h», «hace 2 d». |
| `onPress` | function | yes | — | Abre el detalle de la opinión. |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| compacto | Ancho completo. |
| medio y expandido | Ancho máximo 720, centrado. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `button`. |
| Label | El texto completo de la fila. |
| Contrast ratio | Texto 17.2:1; tiempo 6.8:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### DayHeader

| Field | Value |
|---|---|
| Component | `DayHeader` |
| Description | Encabezado pegajoso de un grupo de días en Actividad. |
| Category | layout |

**States**

| State | Description | Trigger |
|---|---|---|
| sticky | Fondo `color.bg`, texto secundario | mientras dura el grupo |
| pushed | El siguiente encabezado empuja al anterior | al llegar al grupo siguiente |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | string | yes | — | «Hoy», «Ayer», «6 nov 2026». |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Ancho del contenido, alto 32. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `header`. |
| Label | El texto visible. |
| Contrast ratio | `textSecondary` 6.8:1. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

### Banner

| Field | Value |
|---|---|
| Component | `Banner` |
| Description | Franja informativa bajo la cabecera: sin conexión o metadatos caídos. |
| Category | feedback |

**States**

| State | Description | Trigger |
|---|---|---|
| offline | Texto de sin conexión + «Reintentar» | sin red |
| degraded | Texto de metadatos caídos + «Reintentar» | fallo parcial de Spotify |
| hidden | No se renderiza | estado normal |

**Props / Inputs**

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | string | yes | — | Texto. |
| `onRetry` | function | no | — | Muestra «Reintentar». |

**Responsive Behaviour**

| Breakpoint | Behaviour |
|---|---|
| todos | Ancho completo; el texto puede ocupar dos líneas. |

**Accessibility**

| Requirement | Implementation |
|---|---|
| Role | `alert`. |
| Label | El texto visible. |
| Contrast ratio | 9.0:1 claro, 10.3:1 oscuro. |
| Screen reader | Fuera de alcance. |
| Focus management | No aplica. |

---

## Flujos de interacción

### Buscar en Spotify

```
foco en el campo
   └─ escribe 1 carácter → ayuda «Escribe al menos 2 caracteres» (sin petición)
   └─ escribe 2+ caracteres
        └─ cancela el temporizador anterior
        └─ espera 400 ms
             └─ ¿consulta en caché?  sí → pinta resultados (sin indicador)
                                      no → pinta esqueletos → petición
                                            ├─ ok con resultados → lista
                                            ├─ ok sin resultados → «Sin resultados para «…»»
                                            └─ error → mensaje + «Reintentar» (texto conservado)
```

- Al cambiar el texto se cancelan la petición y el temporizador pendientes; una respuesta que llega tarde para una consulta vieja se descarta.
- «Reintentar» repite la última consulta escrita.
- Limpiar (✕) vuelve al estado inicial sin petición.

### Publicar una opinión

```
Crear (sin obra)
  ├─ busca y elige obra ───────────────► formulario con obra seleccionada
  │     └─ ¿ya opinionada? ─ sí ──────► aviso + «Editar mi opinión»
  ├─ escribe texto y valora ───────────► «Publicar» habilitado
  └─ «Publicar»
        ├─ éxito → Inicio (arriba del feed) + snackbar «Opinión publicada»
        └─ error → mensaje sobre el botón + «Reintentar»; todo se conserva
```

- Publicar con obra preseleccionada (desde el detalle) es el mismo flujo, con el buscador plegado y desplegable.
- Sin sesión de Spotify, el paso «busca y elige obra» se sustituye por «elige una obra del catálogo de ejemplo»; el resto es idéntico.

### Editar una opinión

```
Detalle con mi opinión → «Editar»
   └─ formulario con obra fija, texto y valoración rellenos
        ├─ «Guardar» con cambios → mismo detalle, opinión actualizada, «Editada el …«
        ├─ «Guardar» sin cambios → mismo detalle, sin marca de edición
        ├─ error → mensaje + «Reintentar»; texto conservado
        └─ «Cancelar» → detalle sin guardar
```

### Comentar

```
Toque en 💬 → hoja sube (220 ms), velo al 40 %
   ├─ sin comentarios → «Sé el primero en comentar»
   ├─ escribe → botón de enviar activo (no vacío)
   └─ enviar
        ├─ éxito → comentario aparece al final + contador +1 + snackbar «Comentario publicado»
        └─ error → «No pudimos enviar tu comentario.» + «Reintentar», texto conservado
```

### Me gusta y seguir

- **Me gusta**: cambio optimista inmediato (`♡`→`♥`, contador ±1, latido de 120 ms). Es local, así que no hay estado de error de red; si el almacén en memoria rechazara el cambio, se revierte el icono y el contador y aparece un snackbar «No pudimos guardar tu me gusta».
- **Seguir**: «Seguir autor» → «Siguiendo», contador de Perfil ±1, snackbar «Ahora sigues a @ana» / «Ya no sigues a @ana». Local, sin red.
- Ambos se pierden al reiniciar (FR7.6); la interfaz no promete lo contrario en ningún texto.

### Conectar y desconectar Spotify

```
                    toca «Conectar»
desconectado ───────────────────────────► conectando
     ▲                                        │
     │                                        ├─ autoriza y vuelve → conectado
     │                                        ├─ cancela/falla → errorConexion
     │                                        └─ falta client ID → misconfigured
     │
     ├──────────── «Desconectar» ◄──── conectado
     │                                        │
     │                                        └─ token 401 → tokenInvalido
     │                                                          │
     └──────────────── «Conectar» ◄────────────────────────────┘
```

| Transición | Efecto |
|---|---|
| desconectado → conectando | Botón con indicador; se abre el navegador del sistema con la URL de PKCE. |
| conectando → conectado | Token en `expo-secure-store`; cabecera y tarjeta en «Conectado»; portadas reales; snackbar «Spotify conectado». |
| conectando → errorConexion | «No pudimos conectar con Spotify.» + «Reintentar»; la app sigue usable con el catálogo de ejemplo. |
| conectando → misconfigured | «La conexión con Spotify no está configurada en esta instalación.» + «Reintentar»; no se intenta autorizar. |
| conectado → tokenInvalido | Aviso «Tu sesión de Spotify caducó. Vuelve a conectar.»; portadas a bloque; el resto de la app intacto. |
| conectado → desconectado | Token borrado; snackbar «Spotify desconectado»; portadas a bloque. |
| Reinicio con token | Arranca en «Conectado» y resuelve portadas sin autorizar. |

**Regla de no bloqueo**: ninguna transición de Spotify bloquea la app. Siempre se puede leer, publicar sobre el catálogo de ejemplo, comentar y seguir.

### Cerrar sesión de la app

«Cerrar sesión» en Perfil borra el recuerdo local, **no** el token de Spotify (son dos sesiones distintas y la persona no pidió desconectar Spotify). Vuelve a Login y, al volver a entrar, el estado de Spotify sigue como estaba.

## Navegación y atrás

| Desde | Acción | Destino |
|---|---|---|
| Cualquier pestaña | Tocar otra pestaña | Esa pestaña, en su última posición |
| Pestaña raíz | Atrás del sistema | Sin efecto (no se sale de la app en la primera pulsación) |
| Detalle | «‹ Volver» o atrás | Pestaña de origen, misma posición de scroll |
| Detalle → Crear o Editar | «Cancelar» | Detalle |
| Detalle → Crear (publicado) | «Publicar» | Inicio, arriba del feed |
| Hoja de comentarios | ✕, arrastre o velo | Se cierra; foco lógico al icono que la abrió |
| Login | Atrás | Sin efecto |

## Copy de referencia

| Situación | Texto exacto |
|---|---|
| Credenciales incorrectas | «Usuario o contraseña incorrectos» |
| Pista de demo | «Demo: usuario y contraseña: demo» |
| Feed vacío | «Aún no hay opiniones. Sé el primero.» |
| Búsqueda corta | «Escribe al menos 2 caracteres.» |
| Sin resultados | «Sin resultados para «…»» |
| Error de búsqueda | «No pudimos buscar en Spotify.» |
| Sin sesión en Explorar | «Busca en todo Spotify» / «Conecta tu cuenta para buscar en el catálogo completo. Mientras tanto, estas obras del catálogo de ejemplo también se pueden opinar.» |
| Obra ya opinada | «Ya opinaste sobre esta obra.» |
| Sin opiniones en la obra | «Todavía nadie ha opinado sobre esta obra.» |
| Error al publicar | «No pudimos publicar tu opinión.» |
| Error al guardar | «No pudimos guardar los cambios.» |
| Comentarios vacíos | «Sé el primero en comentar» |
| Error al comentar | «No pudimos enviar tu comentario.» |
| Actividad vacía | «Todavía no hay actividad.» |
| Perfil sin opiniones | «Todavía no has publicado opiniones.» |
| Error de perfil | «No pudimos cargar tu perfil.» |
| Error de actividad | «No pudimos cargar tu actividad.» |
| Sin conexión | «Sin conexión. Estás viendo lo último que cargamos.» |
| Sin conexión al buscar | «Sin conexión. No podemos buscar en Spotify ahora mismo.» |
| Sin conexión al crear | «Sin conexión. Puedes opinar sobre las obras de ejemplo.» |
| Spotify desconectado | «Sin conectar» / «Conecta para ver portadas y buscar en el catálogo completo.» |
| Spotify conectando | «Conectando…» |
| Spotify conectado | «Conectado» / «Conectado con tu cuenta.» |
| Error de Spotify | «No pudimos conectar con Spotify.» |
| Token caducado | «Tu sesión de Spotify caducó. Vuelve a conectar.» |
| Client ID ausente | «La conexión con Spotify no está configurada en esta instalación.» |
| Confirmaciones | «Opinión publicada» · «Opinión actualizada» · «Comentario publicado» · «Ahora sigues a @ana» · «Ya no sigues a @ana» · «Spotify conectado» · «Spotify desconectado» |

## Assumptions & Open Questions

- `[assumption]` El envío de un comentario puede fallar aunque el almacén sea local; el estado de error se implementa como guarda del almacén y se ejercita con un doble en las pruebas (FR7.5, AC7.2.5).
- `[assumption]` «Cerrar sesión» no desconecta Spotify: son dos sesiones distintas y FR1.5 solo pide borrar el recuerdo de la app. Si se quisiera que también desconectara, sería un cambio de requisito, no de diseño.
- `[assumption]` No se añaden gestos no pedidos (deslizar para borrar, pulsación larga, doble toque). El gesto de arrastre de la hoja es el estándar de una hoja inferior y se documenta como tal.
- **Ninguna pregunta abierta bloquea la construcción.** El límite de texto y la obligatoriedad de la valoración (OQ1) no alteran ningún flujo: solo cambian la habilitación de «Publicar» y, si hay máximo, el contador del campo.

## Sources

- `inception/refined-mockups/mockups.md` (`mockups`) — pantallas, jerarquía y estados que esta especificación detalla.
- `ideation/rough-mockups/wireframes.md` (`wireframes`) — estructura y textos de partida de cada pantalla.
- `ideation/rough-mockups/user-flow.md` (`user-flow`) — camino feliz, subflujo de Spotify y recuperación de errores.
- `inception/user-stories/stories.md` (`stories`) — criterios de aceptación de cada interacción.
- `inception/requirements-analysis/requirements.md` (`requirements`) — FR1–FR12 y NFR6.
- `inception/practices-discovery/team-practices.md` (`team-practices`) — español, errores con acción y verificación en el teléfono.
- `inception/refined-mockups/design-system-mapping.md` (`design-system-mapping`) — tokens citados.
- `.aidlc/knowledge/aidlc-design-agent/component-spec-template.md` — formato de las fichas de componente.
