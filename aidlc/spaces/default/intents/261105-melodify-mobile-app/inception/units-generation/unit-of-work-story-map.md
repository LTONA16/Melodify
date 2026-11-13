# Mapa de historias a unidades — Melodify

> **Provenance**: deriva de `inception/user-stories/stories.md` (`stories`), `inception/requirements-analysis/requirements.md` (`requirements`) y de `unit-of-work.md` / `unit-of-work-dependency.md`.
> Fecha: 2026-11-09. Etapa: Units Generation. Agente: aidlc-architect-agent.

Una fila por historia. La columna **Unidad** nombra la unidad que implementa la historia —o las unidades que implementan partes distintas—; la columna **Destino de traza** es la unidad que la tabla `traceability.json` declara como destino, y siempre aparece en la fila.

## Historias por unidad

| Historia | Título | Unidad | Directorio | Destino de traza |
|---|---|---|---|---|
| US1.1 | Entrar con la cuenta de demostración | U1 | `u1-app-skeleton` | `U1` |
| US1.2 | Volver a la app y caer en Inicio | U1 | `u1-app-skeleton` | `U1` |
| US1.3 | Cerrar sesión y volver al Login | U1 | `u1-app-skeleton` | `U1` |
| US2.1 | Ver el feed de opiniones | U2 | `u2-content-core` | `U2` |
| US2.2 | Ver portadas y metadatos según la sesión de Spotify | U2; U4 | `u2-content-core`; `u4-spotify-explore` | `U4` |
| US2.3 | Abrir el detalle desde una tarjeta | U2 | `u2-content-core` | `U2` |
| US3.1 | Buscar obras en el catálogo de Spotify | U4 | `u4-spotify-explore` | `U4` |
| US3.2 | Explorar sin sesión de Spotify | U4 | `u4-spotify-explore` | `U4` |
| US4.1 | Ver una obra con opiniones de otros | U2 | `u2-content-core` | `U2` |
| US4.2 | Ver mi opinión junto a las de otros | U2 | `u2-content-core` | `U2` |
| US4.3 | Ver una obra sin opiniones | U2 | `u2-content-core` | `U2` |
| US5.1 | Publicar desde Crear con una obra de Spotify | U3 | `u3-create-react` | `U3` |
| US5.2 | Publicar sin sesión desde el catálogo de ejemplo | U3 | `u3-create-react` | `U3` |
| US5.3 | Publicar desde el detalle sin perder lo escrito | U3 | `u3-create-react` | `U3` |
| US6.1 | Editar mi opinión y ver la fecha | U3 | `u3-create-react` | `U3` |
| US7.1 | Dar y quitar me gusta | U3 | `u3-create-react` | `U3` |
| US7.2 | Comentar una opinión | U3 | `u3-create-react` | `U3` |
| US7.3 | Seguir a un autor | U3 | `u3-create-react` | `U3` |
| US8.1 | Ver mi actividad y abrir una opinión | U5 | `u5-activity` | `U5` |
| US9.1 | Ver mi identidad, contadores y opiniones | U2 | `u2-content-core` | `U2` |
| US10.1 | Conectar Spotify y mantener la conexión | U4 | `u4-spotify-explore` | `U4` |
| US10.2 | Desconectar y recuperarme de un fallo | U4 | `u4-spotify-explore` | `U4` |
| US11.1 | Recorrer las seis pantallas sin sesión de Spotify | U6 | `u6-walkthrough` | `U6` |
| US11.2 | Recorrer las seis pantallas con sesión de Spotify | U6 | `u6-walkthrough` | `U6` |

## Filas transversales

Estas filas no son historias: son piezas que varias unidades consumen y que conviene no perder de vista al repartir trabajo.

| Pieza | Unidad que la crea | Unidades que la consumen |
|---|---|---|
| Tema, tokens y componentes compartidos (`DesignSystem`) | U1 | Todas |
| Navegación y composición de pantallas (`AppShell`) | U1 | Todas |
| Sesión de la app y autor actual (`AppSession`) | U1 | U2, U3, U5, U6 |
| Contenido de ejemplo completo (`ContentStore`) | U2 | U3, U4, U5, U6 |
| Aviso de sin conexión (`Connectivity`) | U2 | U4, U6 |
| Catálogo local y decisión de portada (`Catalog`) | U2 | U3, U4, U6 |
| Snackbar y hoja de comentarios | U3 | U6 |
| Estado de conexión de Spotify (`SpotifyAuth`) | U4 | U2 (portada), U6 |

## Orden dentro de cada unidad

Cada unidad se construye por capas y prueba antes de pasar a la siguiente (práctica `test-after` del equipo):

| Unidad | Orden de implementación |
|---|---|
| U1 | Configuración Expo → tokens de `DesignSystem` → navegación → `AppSession` → contenido mínimo sembrado → Inicio con una tarjeta → recorrido y aprobación en el teléfono. |
| U2 | `ContentStore` y su siembra → `Catalog` → `Connectivity` → tarjeta de opinión completa → Inicio con feed → Detalle de obra → Perfil → estados vacío/carga/error de las tres pantallas. |
| U3 | Acciones de escritura en `ContentStore` → formulario de Crear con validación → edición → hoja de comentarios → me gusta y seguir → snackbar → pruebas de cada capa. |
| U4 | `SpotifyAuth` con PKCE y token seguro → `SpotifyCatalog` → Explorar con sesión → Explorar sin sesión → conexión y desconexión en Perfil → portadas reales en Inicio y detalle → pruebas con dobles. |
| U5 | Derivación de eventos → agrupación por día → contrato de estados → pantalla Actividad → apertura del detalle desde un evento. |
| U6 | Recorrido sin Spotify → registro de la app en Spotify → recorrido con Spotify → ajustes → verificación final en el dispositivo. |

## Cobertura

- 24 de 24 historias asignadas: U1 tres, U2 seis, U3 siete, U4 cuatro con US2.2 compartida, U5 una, U6 dos.
- Las seis unidades tienen al menos una historia; ninguna historia queda sin unidad.
- La suma por unidad coincide con la tabla de `traceability.json`.
- Las filas transversales no crean historias nuevas: son piezas ya trazadas por las historias que las usan.

## Assumptions & Open Questions

- `[assumption]` US2.2 se reparte entre U2 (bloque de inicial cuando no hay sesión) y U4 (portada real cuando hay sesión); la traza apunta a U4 porque la historia existe por la sesión de Spotify.
- `[assumption]` US11.1 y US11.2 no añaden funciones: verifican lo construido. Su unidad, U6, concentra los ajustes que el recorrido destape.

## Sources

- `stories` — `inception/user-stories/stories.md` (24 historias, 112 criterios).
- `requirements` — `inception/requirements-analysis/requirements.md`.
- `components` — `inception/domain-design/components.md` (piezas que cada unidad consume).
- `decisions` — `inception/domain-design/decisions.md` (ADR-010 y ADR-012 explican el estado y la actividad).
- `unit-of-work` — `inception/units-generation/unit-of-work.md`.
- `unit-of-work-dependency` — `inception/units-generation/unit-of-work-dependency.md`.
