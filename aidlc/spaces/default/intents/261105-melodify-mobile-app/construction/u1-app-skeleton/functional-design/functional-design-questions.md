# Functional Design — Preguntas de `u1-app-skeleton`

> **Unidad**: `u1-app-skeleton` (Esqueleto que corre) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U1), `unit-of-work-story-map.md` (US1.1–US1.3), `stories.md` (AC1.1.x–AC1.3.x), `requirements.md` (FR1, FR2, FR11, RC-01, A6), `components.md` (AppShell, DesignSystem, AppSession), `contract-summary.md` (C1, C2, C3), `mockups.md` (Arranque, Login, Inicio, Sistema de navegación) y `design-system-mapping.md` (tokens e inventario).

Estas seis preguntas cierran lo que las etapas anteriores dejaron abierto para U1: cuánto del sistema de diseño entra en el esqueleto, cómo se comporta la navegación que las demás unidades van a heredar, qué estados cubre Inicio antes de existir el feed, cómo es la tarjeta de ejemplo y qué esquema de app se fija para el redirect de PKCE.

## Q1. [Alcance de `DesignSystem`] ¿Se construye el inventario completo de componentes en U1 o solo lo que U1 pinta?

Hay una contradicción real entre dos artefactos aprobados. `unit-of-work.md` dice que en U1 «los componentes de `DesignSystem` que se crean aquí son los que usan las demás unidades; el resto del inventario llega con la pantalla que lo necesita». El contrato **C1** dice lo contrario: que `DesignSystem` implementa **todo** el inventario de `design-system-mapping.md` (22 filas, ~23 componentes) y que así «U1 compila el inventario completo sin esperar a U2 ni a U5».

La cobertura se mide **por paquete** con umbral del 80 % (`contract-summary.md` § Estructura del monorepo), así que un componente que nadie usa todavía hay que probarlo igualmente en U1. En cambio, C1 también admite crecer de forma aditiva («añadir una pieza sube la versión menor»).

- A. **Incremental (Recommended)**: U1 construye el tema completo (tokens de color, tipografía, espaciado, radios, tamaños) y solo las piezas que el esqueleto pinta —`AppHeader`, `BottomTabBar`, `OpinionCard`, `CoverArt`, `RatingStars`, `Avatar`, `SocialActionBar`, `TextField`, `PrimaryButton`, `EmptyState`, `Banner`, `Skeleton`—. Cada unidad posterior añade las suyas a `@melodify/design-system` y sube la versión menor. Se enmienda C1 en este artefacto, dejando el inventario como objetivo final y no como entrega de U1.
- B. **Completo en U1**: se implementan las 22 filas del inventario en el primer Bolt, incluidas las que ninguna pantalla usa todavía (`RatingInput`, `CommentSheet`, `WorkResultRow`, `ActivityRow`, `DayHeader`, `SpotifyCard`…). Se respeta C1 al pie de la letra; el esqueleto pesa mucho más y hay que probar pantallas que aún no existen.
- C. **Completo en U1 sin pruebas**: se implementan todas las piezas y se dejan sin cubrir las que todavía no usa nadie, aceptando que la cobertura de `packages/design-system` baje del 80 % en U1 y suba después.
- X. Other (please specify)

[Answer]: A

## Q2. [Navegación] Al cambiar de pestaña, ¿cada pestaña conserva su propia pila interna?

U1 fija la navegación que heredan las cinco unidades siguientes (C2, FR2.1–FR2.3): cinco pestañas hermanas y el detalle apilado dentro de la pestaña de origen. Aunque en U1 las pantallas son contenedores, la decisión de qué pasa al volver a una pestaña condiciona cómo se construye `AppShell` y cómo se comportan Detalle y Crear después.

- A. **Cada pestaña conserva su pila y su posición de desplazamiento (Recommended)**: salir de una pestaña y volver recupera la pantalla interna y el scroll donde estaba. Es lo que describe `mockups.md` § Sistema de navegación para «Volver».
- B. **Cada cambio de pestaña reinicia esa pestaña en su raíz**: más simple, pero al volver del detalle se pierde el sitio y hay que reabrir la tarjeta.
- C. **Sin pila en U1**: cada destino reemplaza la vista y la pila se decide cuando exista el detalle (U2/U3).
- X. Other (please specify)

[Answer]: A

## Q3. [Navegación] ¿Qué hace el botón atrás de Android en una pestaña raíz y en Login?

Login no se puede abandonar sin entrar (FR1.6) y las cinco pestañas son destinos raíz (FR2.2). Falta decidir el resultado observable del gesto o botón atrás del sistema en esos dos casos, que es lo primero que va a tocar cualquiera al probar el esqueleto en el teléfono.

- A. **En raíz no hace nada y en Login tampoco (Recommended)**: la app nunca se cierra por atrás y Login atrapa el gesto. Es coherente con «no hay forma de salir de Login sin entrar» y con pestañas hermanas.
- B. **En raíz cierra la app; en Login no hace nada**: comportamiento por defecto de Android en la pantalla principal, sin confirmación.
- C. **En raíz vuelve a Inicio; en Login no hace nada**: atrás actúa como un «ir a Inicio» global.
- X. Other (please specify)

[Answer]: B

## Q4. [Inicio] ¿Qué estados cubre Inicio en U1?

U1 pinta una sola tarjeta sobre una semilla local, sin red y sin `ContentStore` (que llega en U2). FR11.1 pide que toda pantalla salvo Login cubra vacío, carga y error, pero en el esqueleto no hay nada que pueda fallar ni tardar: la semilla es una constante en memoria. Hay que decidir si se demuestran estados que todavía no tienen causa o si se aplazan a U2 junto con el feed real.

- A. **Solo el contenido (Recommended)**: Inicio pinta la tarjeta sembrada; si la semilla estuviera vacía, muestra el estado vacío «Aún no hay opiniones. Sé el primero.» sin acción. Sin esqueletos ni error, porque no hay lectura que pueda fallar; los tres estados de FR11.1 se implementan y se prueban en U2, cuando exista el feed y la portada.
- B. **Contenido + esqueleto + error**: se añaden un esqueleto breve de una tarjeta y un estado de error con «Reintentar», ejercitados con una semilla que puede fallar. Cumple FR11.1 desde U1, a costa de construir estados sin causa real.
- C. **Contenido + esqueleto**: esqueleto mientras se resuelve el arranque y tarjeta después, sin estado de error.
- X. Other (please specify)

[Answer]: A

## Q5. [Tarjeta de ejemplo] ¿De quién es la opinión sembrada y qué se puede tocar en ella?

La tarjeta es `OpinionCard` en variante `feed` (C1) y el mockup de Inicio la muestra con `♡`, `💬` y «Seguir autor». En U1 no existe `ContentStore`, ni me gusta, ni comentarios, ni detalle: esas acciones llegan en U2 y U3. La decisión cambia el aspecto del esqueleto y lo que se puede prometer en la demostración del teléfono.

- A. **Opinión de otro autor, tarjeta de lectura (Recommended)**: la semilla es una opinión de un autor de ejemplo (no `demo`) sobre una obra real del catálogo local, con valoración y texto breve. La tarjeta pinta autor, obra, artista, estrellas con número, texto a tres líneas y portada de bloque con la inicial. `♡` y `💬` aparecen con sus contadores en cero y no responden; no hay «Seguir autor» ni navegación al detalle. Es la forma más fiel al mockup sin prometer acciones que no existen.
- B. **Opinión de otro autor con acciones sociales activas en memoria**: `♡` y «Seguir autor» funcionan sobre la semilla, con contadores que cambian. Adelanta parte de U3 y deja acciones sueltas cuando llegue `ContentStore`.
- C. **Opinión del usuario `demo`**: la semilla es una opinión propia, lo que prepara el terreno de Perfil y de «Editar», pero muestra una marca de opinión propia (`isOwn`) cuya acción todavía no existe.
- X. Other (please specify)

[Answer]: A

## Q6. [Esquema de app] ¿Qué esquema se fija en `app.json` para el redirect de PKCE (A6)?

`requirements.md` A6 y `external-dependency-map.md` piden fijar el redirect URI de PKCE en Functional Design y cargarlo en el panel de Spotify antes del Bolt 3. U1 es quien crea `app.json`, así que aquí se decide el esquema; la forma exacta del redirect depende de Expo Go y se confirma contra el panel real en U4.

Con Expo Go el redirect que devuelve `makeRedirectUri()` es del tipo `exp://<ip-de-la-lan>:8081/--/…`, no un esquema propio de la app, y el panel de Spotify exige un valor exacto y estable. Si Spotify no acepta ese valor, la conexión real no se puede demostrar y el recorrido con sesión se cae aunque el código esté bien: es el riesgo que Delivery Planning ya marcó.

- A. **Esquema propio `melodify` y redirect `melodify://spotify-callback` (Recommended)**: se declara `scheme: "melodify"` en `app.json` y ese valor es el que se pega en el panel de Spotify. En Expo Go se sigue usando el redirect de desarrollo; la diferencia se documenta y se prueba en U4. Si el panel rechaza el esquema propio, se registra el motivo y se decide entonces entre el proxy local y demostrar solo sin sesión, sin tocar requisitos.
- B. **Solo el redirect de Expo Go**: no se declara esquema propio; se pega en Spotify lo que devuelva `makeRedirectUri()` en el dispositivo. Depende de la IP del ordenador, así que cambia cada vez que cambia la red.
- C. **Dejarlo para U4**: U1 no declara esquema y la decisión completa se toma al construir la conexión. `app.json` se toca otra vez en el Bolt 3.
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Resumen de lo que se convertirá en los artefactos de U1:

- **Q1 = A**: `DesignSystem` entra **incremental**. U1 construye el tema completo (tokens de color, tipografía, espaciado, radios y tamaños) y solo las piezas que el esqueleto pinta: `AppHeader`, `BottomTabBar`, `OpinionCard`, `CoverArt`, `RatingStars`, `Avatar`, `SocialActionBar`, `TextField`, `PrimaryButton`, `EmptyState`, `Banner` y `Skeleton`. Cada unidad posterior añade las suyas y sube la versión menor. C1 se enmienda: el inventario completo es el objetivo final, no la entrega de U1.
- **Q2 = A**: cada pestaña conserva su propia pila y su posición de desplazamiento; volver a una pestaña recupera la pantalla interna donde estaba.
- **Q3 = B**: en una pestaña raíz el botón atrás de Android cierra la app; en Login no hace nada y la persona sigue en Login.
- **Q4 = A**: Inicio pinta la tarjeta sembrada y, si la semilla estuviera vacía, el estado vacío «Aún no hay opiniones. Sé el primero.» sin acción. Sin esqueleto ni estado de error en U1: los tres estados de FR11.1 se construyen y prueban en U2.
- **Q5 = A**: la semilla es una opinión de un autor de ejemplo (no `demo`) sobre una obra real del catálogo local, con valoración y texto breve; la tarjeta es de lectura, con portada de bloque, `♡` y `💬` en cero sin responder, sin «Seguir autor» y sin navegación al detalle.
- **Q6 = A**: `app.json` declara `scheme: "melodify"` y el redirect de PKCE es `melodify://spotify-callback`, el valor que se cargará en el panel de Spotify. En Expo Go se usa el redirect de desarrollo y la diferencia se prueba en U4; si el panel rechaza el esquema propio, se registra el motivo y se decide entonces.

- Looks correct
- Request changes

[Answer]: Looks correct
