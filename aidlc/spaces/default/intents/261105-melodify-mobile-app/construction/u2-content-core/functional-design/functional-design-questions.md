# Functional Design — Preguntas de `u2-content-core`

> **Unidad**: `u2-content-core` (Contenido, Inicio, detalle y Perfil) · **Etapa**: Functional Design · **Modo**: Guided.
>
> **Fuentes**: `unit-of-work.md` (U2), `unit-of-work-story-map.md` (US2.1–US2.3, US4.1–US4.3, US9.1), `stories.md` (AC2.1.x–AC2.3.x, AC4.1.x–AC4.3.x, AC9.1.x), `requirements.md` (FR3, FR6, FR9, FR11, FR2.3, FR3.7), `components.md` (ContentStore, Catalog, Connectivity, AppShell), `contract-summary.md` (C1 versión 1.1.0, C2, C3, C4, C5, C6 y § Revisión 11), `mockups.md` (Inicio, Detalle de obra, Detalle de opinión, Perfil, Matriz de estados), `interaction-spec.md` y `design-system-mapping.md`.

Estas tres preguntas cierran lo que las etapas anteriores dejaron abierto para U2 y que cambia el contrato entre unidades, no solo el contenido de esta especificación: de dónde sale el estado de red, qué superficie de Spotify se pinta antes de que exista U4 y cómo se llega a la pantalla de detalle de obra sin Explorar.

## Q1. [Connectivity] ¿De dónde sale el estado de red que alimenta el aviso de «sin conexión»?

`FR11.4` y `AC2.2.4` exigen que, sin conexión, la app conserve lo cargado, pase las portadas a bloque y avise en la cabecera. `Connectivity` es de U2 (C6) y hasta U4 no hay ninguna petición de red real en la app: el feed y el Perfil leen de memoria. Hay que decidir si U2 detecta la red de verdad desde el primer día o si el aviso se ejercita solo con dobles hasta que U4 traiga las peticiones.

`project.md` prohíbe cualquier módulo nativo que exija compilación propia (CT-05): solo lo que corre en Expo Go.

- A. **`expo-network`, el módulo de red del SDK de Expo (Recommended)**: `addNetworkStateListener` da el estado real (`isConnected`/`isInternetReachable`) y funciona en Expo Go sin compilación propia. `Connectivity` sustituye en `bootstrap/` el valor por defecto de `ShellServices.network`, emite el estado al suscribirse y tras cada cambio, y el banner de Inicio sale cuando `online` es falso. U2 ya se puede probar en el teléfono apagando el wifi o los datos; las pruebas usan un doble del módulo y no tocan la red.
- B. **Puerto inyectado con valor por defecto «en línea»**: `Connectivity` recibe un adaptador y en U2 arranca siempre en línea; la detección real llega en U4 a partir de los fallos de las peticiones de Spotify. Menos dependencias y cero riesgo de que el módulo no esté en Expo Go, pero el aviso de sin conexión no se puede demostrar en el teléfono hasta U4 y `AC2.2.4` se verifica solo con dobles.
- C. **`@react-native-community/netinfo`**: es la librería de red más usada de React Native, pero no forma parte de Expo Go; habría que comprobar si la versión que Expo Go trae la cubre y, si no, incumple CT-05.
- X. Other (please specify)

[Answer]: A

## Q2. [Spotify en U2] ¿Qué superficie de Spotify se pinta en U2, antes de que exista U4?

`US9.1` (Perfil) es de U2 y su criterio `AC9.1.8` pide que la tarjeta de Spotify muestre el estado de la conexión y la acción que toca. Pero el reparto de piezas de C1 (`contract-summary.md` § Revisión 11) pone `SpotifyCard` en la versión **1.2.0 y en U4**, que es quien implementa conectar, desconectar y los cinco estados. El chip de Inicio (`AC2.1.2`) tiene el mismo problema: su estado real depende de U4.

Hay tres caminos y cambian el contrato, no solo la pantalla:

- A. **U2 no adelanta la pieza: el chip se queda en «Conectar» sin efecto y Perfil no pinta la tarjeta todavía (Recommended)**: `AC9.1.8` se marca `Deferred` hacia `u4-spotify-explore`, que ya declara «los estados de conexión y desconexión en Perfil» en su definición de unidad. U2 respeta el reparto de piezas de C1 (`contract-summary.md` § «Entrega por versiones»: 1.2.0 = `ErrorState` y `TextButton`, de U2; 1.3.0 = `SpotifyCard`, de U4) y el chip de Inicio sigue como en U1 hasta que U4 lo cablea. Perfil se aprueba en U2 sin la tarjeta y la recupera en U4.
- B. **U2 adelanta `SpotifyCard` a la 1.1.0 y pinta solo el estado «Sin conectar»**: la tarjeta aparece en Perfil con «Sin conectar», su explicación y «Conectar con Spotify» sin efecto; U4 completa los cinco estados y cablea la acción. `AC9.1.8` se cubre en U2 a medias y U4 hereda una pieza ya montada. Se adelanta una pieza del inventario y se sube el alcance de U2.
- C. **U2 pinta la tarjeta con el estado de `ShellServices.spotify` (siempre `disconnected`) y un botón que avisa de que la conexión llega después**: parece completo en el teléfono, pero inventa un texto que no está en los mockups y deja un botón que no hace lo que dice.
- X. Other (please specify)

[Answer]: A

## Q3. [Navegación] ¿Cómo se llega al detalle de obra en U2, si Explorar todavía no existe?

`US4.1`–`US4.3` (detalle de obra) son de U2 y su punto de entrada natural es Explorar (tocar un resultado, `FR4.4`), que llega en U4. En U2 solo existe Inicio, y sus tarjetas abren el **detalle de opinión** (`US2.3`), no el de obra. Sin una decisión, la pantalla de detalle de obra se construye y ningún camino visible lleva a ella.

- A. **Se construye y se registra, sin entrada visible hasta U4 (Recommended)**: la pantalla se registra con `openWorkDetail` (C2 ya lo expone) y se prueba con pruebas de pantalla y de navegación; U4 la abre desde Explorar y U6 la recorre en el teléfono. No se inventa navegación y los mockups se respetan tal cual.
- B. **La cabecera de obra del detalle de opinión se vuelve tocable y abre el detalle de obra**: permite recorrerla en el teléfono desde U2 y enlaza dos pantallas que comparten cabecera, pero añade una navegación que los mockups no tienen y que después habría que mantener o retirar.
- C. **El detalle de obra se aplaza a U4**: U2 se queda con Inicio, detalle de opinión y Perfil. Contradice el mapa de historias, que asigna `US4.1`–`US4.3` a U2, y deja la unidad sin la mitad de su contenido.
- X. Other (please specify)

[Answer]: A
