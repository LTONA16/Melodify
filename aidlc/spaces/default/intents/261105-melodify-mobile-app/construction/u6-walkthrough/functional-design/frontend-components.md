# Componentes de interfaz — U6 `u6-walkthrough`

> **Provenance**: deriva de `inception/domain-design/components.md` (`DesignSystem`, `AppShell` y las pantallas), `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0), `inception/refined-mockups/mockups.md` (§ Matriz de estados, § Responsive), `inception/refined-mockups/interaction-spec.md`, `inception/user-stories/stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3) y `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § Criterio de cierre).
> Fecha: 2026-11-20. Etapa: Functional Design · Unidad: `u6-walkthrough`.

## Principio: U6 no añade interfaz

U6 no crea pantallas, componentes, tokens ni estados nuevos. Su trabajo de interfaz es **comprobar** lo que U1–U5 construyeron y, cuando un defecto en alcance lo exija, **ajustar** una pieza existente sin cambiar su contrato (BR25.1, BR27.4). Cualquier necesidad que no quepa en esa frase se registra como pendiente y se decide fuera de la unidad.

Consecuencia práctica: si el recorrido pide una pantalla nueva, un componente nuevo o una prop nueva en C1/C2, la respuesta no es «ya que estoy, lo hago»; es «pendiente» (BR27.2).

## Inventario por pantalla

Las rutas son las del árbol construido; los componentes son los que cada vista monta hoy.

| Pantalla | Vista | Componentes implicados | Estados que se ven en el recorrido | Qué puede ajustar U6 |
|---|---|---|---|---|
| **Login** | `app/src/screens/login/LoginScreen.tsx` | `TextField`, `PrimaryButton`, `useTheme` | Por defecto; error de credenciales en línea; error de guardado con «Reintentar» | Textos en español, orden y separación de los campos, estilo del mensaje en línea, foco y teclado |
| **Inicio** | `app/src/screens/inicio/InicioView.tsx` + `InicioHeader.tsx` | `Banner`, `EmptyState`, `ErrorState`, `OpinionCard`, `Skeleton`, `OfflineBanner` | Feed completo; carga; vacío; error de contenido; sin conexión; sin Spotify (portadas de bloque) | Copy, espaciado, orden de avisos, uso de tokens, portada de bloque |
| **Explorar** | `app/src/screens/explorar/ExplorarView.tsx` | `AppHeader`, `ArtistResultRow`, `ConnectionCard`, `EmptyState`, `ErrorState`, `PrimaryButton`, `SearchField`, `Skeleton`, `WorkResultRow` | Sin sesión (tarjeta de conexión + sugerencias); resultados; sin resultados; error de búsqueda; carga; token caído | Copy, jerarquía de la tarjeta, separación entre sugerencias y resultados, estilo del error |
| **Crear / Editar** | `app/src/screens/crear/CrearView.tsx` + `CrearHeader.tsx` | `ConnectionCard`, `ErrorState`, `MultilineField`, `PrimaryButton`, `RatingInput`, `SearchField`, `Skeleton`, `TextButton`, `WorkResultRow` | Sin Spotify (selector de ejemplo); con Spotify (buscador); validación; error de envío; edición | Copy de validación, orden de campos, estilo del error sobre el botón, legibilidad del selector |
| **Actividad** | `app/src/screens/actividad/ActividadView.tsx` | `ActivityRow`, `AppHeader`, `DayHeader`, `EmptyState`, `ErrorState`, `Skeleton`, `OfflineBanner` | Lista agrupada por día; carga; vacío; error; sin conexión | Copy de la fila, espaciado del grupo, encabezado pegajoso, uso de tokens |
| **Perfil** | `app/src/screens/perfil/PerfilView.tsx` | `AppHeader`, `Avatar`, `EmptyState`, `ErrorState`, `OpinionCard`, `Skeleton`, `SpotifyCard`, `TextButton`, `OfflineBanner` | Identidad y contadores; lista propia; vacío; carga; error; tarjeta de Spotify en sus estados; sin conexión | Copy, orden identidad/contadores/lista, estado de la tarjeta, estilo del botón de sesión |
| **Detalle de opinión** | `app/src/screens/detalle-opinion/DetalleOpinionView.tsx` | `OpinionCard` (modo detalle), `ErrorState`, `Skeleton`, `SocialActionBar`, `CommentSheet` | Texto completo; carga; error; hoja de comentarios | Copy, espaciado, vuelta con «‹ Volver» |
| **Detalle de obra** | `app/src/screens/detalle-obra/DetalleObraView.tsx` | `WorkHeader`, `OpinionCard`, `EmptyState`, `ErrorState`, `Skeleton` | Con opiniones; sin opiniones; carga; error | Copy, orden cabecera/lista, estado vacío |

**Lo que U6 no toca**: la estructura de la barra inferior (`BottomTabBar`), la forma de `OpinionCardModel`, `ActivityView`/`ActivityEventView`, las props públicas de C1 y C2, los tokens de `DesignSystem` y los seis estados de `SpotifyCard` (`disconnected`, `connecting`, `connected`, `connectionError`, `invalidToken`, `notConfigured`). Tocarlos es cambiar un contrato compartido (BR27.4).

## Qué cuenta como «ajuste»

| Permitido dentro de U6 | Requiere pendiente |
|---|---|
| Corregir un texto visible que quedó en inglés o es técnico | Añadir un texto nuevo que el flujo no tenía |
| Corregir un error que no ofrece «Reintentar» teniendo algo que reintentar | Añadir un estado nuevo a una pantalla |
| Arreglar un hueco roto cuando falla una portada (debe quedar el bloque con la inicial) | Cambiar la regla de portada de C4/C5 |
| Corregir contraste o área táctil por debajo de NFR6 usando los tokens existentes | Añadir o cambiar un token de `DesignSystem` |
| Corregir un espaciado o una alineación que rompe la lectura | Rediseñar la jerarquía de una pantalla |
| Arreglar una navegación que no vuelve o pierde la posición | Cambiar el modelo de navegación de `AppShell` |
| Corregir el estado vacío para que muestre el texto y la acción ya definidos | Inventar una acción nueva para el vacío |
| Ajustar la tarjeta de Spotify para que muestre el estado que ya declara | Añadir un séptimo estado a `SpotifyCard` |

Todo ajuste se prueba en el teléfono después de aplicarlo (BR27.3) y no baja ningún umbral de cobertura (BR28.1).

## Comprobaciones transversales de interfaz

| Qué se mira | Criterio | Dónde se ve |
|---|---|---|
| Idioma | Todo texto visible en español, sin códigos técnicos | Las seis pantallas y las vistas de paso (BR26.3) |
| Errores con acción | Lenguaje llano y «Reintentar» cuando hay algo que reintentar: se toca en R1 (aviso sin conexión) y en R2 (error de búsqueda); en Crear el aviso va sin acción porque no hay nada que reintentar | Inicio, Actividad y Perfil (R1); Explorar y Crear (R2); Login (error de guardado) |
| Hoja de comentarios | Abre con lista, vacío o error; el envío confirma y el texto no se pierde si falla; «Cerrar» devuelve al detalle | Detalle de opinión (W05b) |
| Portada caída | Bloque con la inicial, nunca un hueco roto | Inicio, detalle, Actividad y Perfil (FR11.3) |
| Tema | Claro y oscuro siguen el sistema; contraste ≥ 4.5:1 en texto normal y ≥ 3:1 en texto grande e iconos; cuando hay duda se mide con `contrastRatio` y el valor va en la nota | Las seis pantallas en P1/P2 y P3/P4 (AC11.1.5, NFR6) |
| Áreas táctiles | ≥ 44×44 en barra inferior, botones principales e iconos de la tarjeta | Las seis pantallas (NFR6) |
| Pantalla en blanco | Ninguna pantalla ni vista de paso queda en blanco; la carga pinta esqueletos | Las seis pantallas (AC11.1.1) |
| Navegación | «‹ Volver» regresa a la lista en la misma posición; el detalle se apila en la pestaña de origen | Inicio → detalle; Explorar → obra; Actividad → detalle |

## Estados por pantalla en el recorrido

La matriz de `mockups.md` sigue siendo la fuente. El recorrido comprueba a mano los que se provocan de verdad; los demás quedan cubiertos por pruebas y así se anota (Q2 = A).

| Pantalla | Se provoca en el teléfono | Se cubre con pruebas |
|---|---|---|
| Login | Error de credenciales | — |
| Inicio | Sin conexión y su «Reintentar»; sin Spotify | Carga, vacío, error de contenido |
| Explorar | Sin sesión; sin resultados; error de búsqueda (R2, modo avión) | Carga; token caído |
| Crear | Sin Spotify; validación; error de envío (R2) | Carga de resultados |
| Actividad | Sin conexión | Carga, vacío, error |
| Perfil | Sin conexión; tarjeta de Spotify en sus estados | Carga, vacío, error |
| Detalle de opinión / obra | Portada de bloque sin Spotify; hoja de comentarios con lista y con vacío | Carga, error, vacío de obra; envío fallido de comentario |

## Puntos de integración

U6 no añade ninguno. La conexión con Spotify ya está cableada por U4 (`SpotifyAuth` + `SpotifyCatalog`), el aviso de red por U2 (`Connectivity` + `OfflineBanner`) y la actividad por U5. El recorrido solo consume esas piezas a través de la app; si un ajuste necesitara una integración nueva, sería una función nueva y no entraría en la unidad.

## Assumptions & Open Questions

- `[assumption]` Los componentes listados son los que montan hoy las vistas; si un ajuste mueve una pieza de una vista a otra sin cambiar su contrato, sigue dentro de U6.
- `[assumption]` El recorrido no necesita un modo de depuración ni un conmutador de estados: los que no se provocan en el teléfono se cubren con pruebas (Q2 = A).
- `[assumption]` La comprobación de contraste se hace sobre los colores del tema en el teléfono, no con una herramienta de escritorio: lo que se juzga es lo que se ve.
- `None.`

## Sources

- `components` — `inception/domain-design/components.md` (`DesignSystem`, `AppShell`, pantallas).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1, C2 y los contratos que consumen las pantallas).
- `mockups` — `inception/refined-mockups/mockups.md` (§ Matriz de estados, § Responsive).
- `interaction-spec` — `inception/refined-mockups/interaction-spec.md` (textos y estados de las piezas).
- `stories` — `inception/user-stories/stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3).
- `functional-spec` — `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § Criterio de cierre).
- `rules` — `construction/u6-walkthrough/functional-design/rules.md` (BR25–BR28).
