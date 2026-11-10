# Unidades de trabajo — Melodify

> **Provenance**: deriva de `inception/domain-design/components.md` (`components`), `inception/domain-design/decisions.md` (`decisions`), `inception/requirements-analysis/requirements.md` (`requirements`), `inception/user-stories/stories.md` (`stories`) y del plan aprobado en `units-generation-plan.md` (respuestas Q1–Q6).
> Fecha: 2026-11-09. Etapa: Units Generation. Agente: aidlc-architect-agent. Profundidad: Standard.

## Cómo se cortó

Las unidades se cortan **por tramo del recorrido**, no por componente: cada una entrega algo que la persona puede usar de punta a punta en el teléfono, y las interfaces de componente del Domain Design son el contrato entre ellas. Seis unidades, todas de tipo `ui`, todas empaquetadas en la misma app. La secuencia en la que se entregan —qué Bolt va primero y por qué— se decide en Delivery Planning; este documento solo fija qué es cada unidad y de qué depende.

| Unit ID | Directory | Nombre | Tipo | Complejidad | Depende de |
|---|---|---|---|---|---|
| U1 | `u1-app-skeleton` | Esqueleto que corre | `ui` | S | — |
| U2 | `u2-content-core` | Contenido, Inicio, detalle y Perfil | `ui` | L | U1 |
| U3 | `u3-create-react` | Crear, editar y reaccionar | `ui` | L | U2 |
| U4 | `u4-spotify-explore` | Spotify y Explorar | `ui` | L | U2 |
| U5 | `u5-activity` | Actividad | `ui` | S | U2 |
| U6 | `u6-walkthrough` | Recorrido completo | `ui` | S | U3, U4, U5 |

## U1 — Esqueleto que corre (`u1-app-skeleton`)

**Qué entrega.** El proyecto Expo con su configuración, el tema con los tokens y los componentes compartidos mínimos (`DesignSystem`), la navegación de cinco pestañas con Login fuera de la barra (`AppShell`), el login simulado `demo`/`demo` con la sesión recordada en almacenamiento seguro (`AppSession`) y la pantalla Inicio con una sola tarjeta de opinión de ejemplo sobre contenido sembrado en memoria.

**Qué queda fuera.** El feed completo, el detalle, el Perfil, Crear, Explorar, Actividad y Spotify. Las cuatro pestañas restantes existen y navegan, pero muestran una pantalla vacía con su título: son el hueco que llenan las unidades siguientes.

**Por qué es una unidad.** Es el tramo que demuestra que las piezas encajan: proyecto, tema, navegación, sesión y una tarjeta real pintada con datos reales. El alcance `mvp` activa el walking skeleton y esta es la unidad que lo cumple; su aprobación en el teléfono físico es un checkpoint, no una revisión de diseño.

**Notas de implementación.** Nada de módulos nativos: solo lo que corre en Expo Go (RC-01/CT-05). El arranque espera la lectura de la sesión en `expo-secure-store` antes de decidir Login o Inicio. Los componentes de `DesignSystem` que se crean aquí son los que usan las demás unidades; el resto del inventario llega con la pantalla que lo necesita.

## U2 — Contenido, Inicio, detalle y Perfil (`u2-content-core`)

**Qué entrega.** `ContentStore` completo con el contenido de ejemplo (8–10 opiniones, 4–5 autores, 6–8 obras, 3 opiniones del usuario demo, 2 seguidos, 2 me gusta y 3 comentarios recibidos con fecha), `Catalog` con el catálogo local y la decisión de portada, `Connectivity` con el aviso de sin conexión, y las pantallas Inicio (feed completo), Detalle de obra y Perfil con sus estados de vacío, carga y error.

**Qué queda fuera.** Escribir (publicar, editar, reaccionar), Spotify, Explorar y Actividad. Las tarjetas se pintan en modo lectura con los contadores que ya trae la siembra; las acciones sociales llegan en U3.

**Por qué es una unidad.** Es el corazón del producto sin sesión: con esta unidad la app ya cuenta el contenido de ejemplo, se navega y se lee. Deja el estado del que dependen las tres unidades siguientes.

**Notas de implementación.** Un solo `ContentStore` con `useReducer`, sin librería de estado (ADR-010). La regla de una opinión por obra y persona se implementa aquí aunque la escritura llegue en U3. La caché de búsqueda y la portada de bloque viven en `Catalog`.

## U3 — Crear, editar y reaccionar (`u3-create-react`)

**Qué entrega.** La pantalla Crear con búsqueda colapsable sobre el catálogo, el formulario de opinión con validación y las dos entradas (desde Crear y desde el detalle con la obra preseleccionada), la edición de la propia opinión con fecha de modificación, la hoja de comentarios, el me gusta y quitar me gusta, seguir y dejar de seguir, y el snackbar de confirmación.

**Qué queda fuera.** Todo lo de Spotify y Actividad. La hoja de comentarios se abre sobre la pantalla actual sin cambiar de pestaña.

**Por qué es una unidad.** Es la unidad de escritura: todo lo que toca `ContentStore` con acciones nuevas y la validación del formulario. Separarla de la lectura deja a U2 probar el contenido sin interacción y aquí probar las reglas de escritura con sus fechas y contadores.

**Notas de implementación.** El límite de texto y la obligatoriedad de la valoración se fijan en Functional Design (OQ1, A1); aquí se implementa lo que esa etapa decida. Dar me gusta no genera evento de actividad (ADR-006). Los textos de error llevan «Reintentar» cuando hay algo que reintentar.

## U4 — Spotify y Explorar (`u4-spotify-explore`)

**Qué entrega.** `SpotifyAuth` con PKCE S256, client ID por entorno, token en almacenamiento seguro con su recuperación y borrado, y sus estados (desconectado, conectando, conectado, error, token inválido, sin configurar); `SpotifyCatalog` con búsqueda y resolución de metadatos y portadas; la pantalla Explorar con y sin sesión, con búsqueda desde dos caracteres y 400 ms de espera; los estados de conexión y desconexión en Perfil; y las portadas reales en Inicio y detalle.

**Qué queda fuera.** Publicar una obra encontrada desde Crear ya existe en U3; aquí solo cambia de dónde salen las obras. Nada de actividad.

**Por qué es una unidad.** Spotify es la única integración externa real y arrastra el trabajo de seguridad (NFR3) y los dobles de prueba; agruparla deja que U2 y U3 se construyan sin credenciales ni red.

**Notas de implementación.** El redirect URI de PKCE se fija en Functional Design (A6); hasta entonces `SpotifyAuth` acepta el prefijo que se configure. Ningún client secret, ninguna variable `EXPO_PUBLIC_*` que lo contenga (CT-04). Sin sesión, Explorar muestra el catálogo de ejemplo.

## U5 — Actividad (`u5-activity`)

**Qué entrega.** `ActivityFeed` como derivación de solo lectura del contenido, la pantalla Actividad con sus eventos recibidos, la agrupación por día (Hoy, Ayer, fecha), el contrato `loading`/`ready`/`empty`/`error` con reintento, y la apertura de la opinión desde un evento.

**Qué queda fuera.** Todo lo demás; esta unidad no escribe.

**Por qué es una unidad.** Es la única pantalla que no posee datos y se calcula al abrirse; separarla deja explícito que es una lectura y permite probar la derivación sin montar el resto.

**Notas de implementación.** Solo eventos recibidos (ADR-006): publicaciones propias, me gusta recibidos y comentarios recibidos. El error es defensivo y se prueba con un doble que falle (ADR-012). La lista se recalcula al cambiar el contenido.

## U6 — Recorrido completo (`u6-walkthrough`)

**Qué entrega.** El recorrido de las seis pantallas sin sesión de Spotify y con sesión conectada, en el teléfono Android físico; los ajustes que ese recorrido destape en las pantallas ya construidas; y la verificación manual que es criterio de terminado de esta versión.

**Qué queda fuera.** Funciones nuevas. Si el recorrido descubre una función que falta, se decide si entra aquí o se registra como pendiente.

**Por qué es una unidad.** El criterio de terminado del alcance `mvp` es el recorrido completo, no la suma de pantallas probadas por separado. Esta unidad es donde se comprueba de verdad, con el servidor de desarrollo y el teléfono.

**Notas de implementación.** Requiere el registro de la app en Spotify (RC-09, A6) hecho de antemano para la mitad con sesión. El CI valida, no publica: no hay build, ni firma, ni tienda.

## Modelo de despliegue

Una sola app, todas las unidades empaquetadas juntas. Ninguna unidad tiene despliegue propio: «desplegar» significa abrir la app en Expo Go con Metro levantado, y la entrega se demuestra recorriendo las pantallas en el dispositivo. El CI corre `commitlint`, `npm run typecheck`, `npm run lint` y `npm test` en cada push y cada PR; un rojo bloquea el merge.

## Assumptions & Open Questions

- `[assumption]` Las seis unidades comparten un único `package.json` y un único árbol `app/src/`; no hay paquetes internos ni monorepo. La separación es de trabajo y de revisión, no de artefactos publicables.
- `[assumption]` U1 incluye el contenido de ejemplo mínimo (una opinión) y U2 lo reemplaza por la siembra completa; no se mantienen dos sembrados en paralelo.
- `[assumption]` Las cuatro pantallas vacías de U1 son contenedores con su título, no pantallas de «próximamente» con diseño propio: desaparecen al llegar su unidad.
- **Pendiente fuera de esta etapa**: el límite de texto y la obligatoriedad de la valoración (OQ1, A1) y el redirect URI de PKCE (A6) se fijan en Functional Design; no cambian el corte de unidades.

## Sources

- `components` — `inception/domain-design/components.md` (nueve componentes, entidades y dependencias).
- `decisions` — `inception/domain-design/decisions.md` (ADR-001…ADR-012).
- `requirements` — `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9, RC-01–RC-09, A1–A6, OQ1–OQ4).
- `stories` — `inception/user-stories/stories.md` (US1.1–US11.2).
- `team-practices` — `aidlc/spaces/default/memory/team.md` y `project.md` (CI, cobertura, ramas, prohibiciones).
- `units-generation-plan` — `inception/units-generation/units-generation-plan.md` (plan aprobado).
