# Mapeo al sistema de diseño

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/wireframes.md`: contexto y recorridos ya aprobados.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/user-flow.md`: estados de fallo y privacidad.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/stories.md`: componentes implicados en las 16 historias.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: NFR8 sobre calidad y NFR9 sobre compatibilidad Expo Go.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: organización por dominio, tarjeta compartida y textos en español.

## Componentes existentes que se reutilizan

| Elemento existente | Ubicación | Uso en el refinamiento | Adaptación necesaria |
|---|---|---|---|
| `AppHeader` | `app-shell` | Cabecera de las seis pantallas y acceso a perfil | Mostrar aviso de degradación sin cubrir la navegación |
| `BottomTabs` | `app-shell` | Navegación entre Inicio, Explorar, Crear, Actividad y Perfil | Sin cambios estructurales; conservar la pestaña activa |
| Tarjeta de opinión compartida | `app/src/components/` | Feed, detalle y actividad | Ninguna reimplementación; añadir solo edición en línea cuando `isOwn` |
| Estados de carga y error | `app-shell` | Esqueletos y avisos con «Reintentar» | Reutilizar con textos en español y acción visible |
| Tema, tipografía, botones y primitivas | `design-system` | Todos los componentes | Usar tokens existentes; no fijar valores nuevos en este stage |
| `AppSession` | `packages/app-session` | `AuthGate` y cierre de sesión | Sustituir la sesión `demo` por la real sin cambiar el punto de composición |
| `content-store` | `packages/content-store` | Respaldo local de solo lectura | Mantener `subscribe()` y snapshots; nunca destino de escrituras |
| `catalog` | `packages/catalog` | Explorar y selección de obra en Crear | Enviar solo tipo e ID opaco al backend |
| `spotify` | `packages/spotify` | PKCE y token en el dispositivo | Sin cambios; ningún token viaja a la API |
| `activity` | `packages/activity` | Actividad | Mostrar grupos derivados del estado persistido |
| `connectivity` | `packages/connectivity` | `OfflineBanner` | Conectar estado de red con salud del servicio local |

## Componentes a adaptar o crear

| Componente | Origen previsto | Motivo | Frontera de código |
|---|---|---|---|
| `AccountForm` | Adaptación del formulario de acceso actual | Registro real con consentimiento y validación al blur | `app/src/screens/<acceso>/` usando primitivas de `design-system` |
| `ConsentCheckbox` | Nuevo control compuesto | Consentimiento explícito con fecha y versión del aviso en el registro | `app/src/components/` |
| `ProfileEditor` | Extracto del perfil actual | Edición en línea de nombre, biografía y avatar como texto | `app/src/screens/perfil/` |
| `OpinionEditor` | Extracto de Crear | Publicar y editar con los mismos límites de valoración y reseña | `app/src/screens/crear/` y detalle |
| `LikeButton` | Estado local actual convertido a acción persistida | Idempotencia y contador compartido | `app/src/components/` dentro de la tarjeta compartida |
| `FollowButton` | Estado local actual convertido a acción persistida | Seguir y dejar de seguir sin auto-seguimiento | `app/src/components/` o perfil |
| `CommentComposer` | Nuevo componente de entrada | Comentarios de 1 a 1000 caracteres y doble envío | `app/src/components/` |
| `CommentThread` | Lista local actual convertida a cursor | Orden estable y paginación por cursor | `app/src/components/` |
| `FeedList` | Lista local actual convertida a cursor | Feed global con «Cargar más» | `app/src/screens/inicio/` |
| `ActivityList` | Vista local actual convertida a cursor | Actividad pública paginada | `app/src/screens/actividad/` |
| `ConfirmDeleteDialog` | Nuevo modal | Única confirmación irreversible del alcance | `app/src/screens/perfil/` |
| `OfflineBanner` | Mensajes actuales de conectividad | Aviso de degradación con «Reintentar» y bloqueo de escrituras | `app-shell` o `app/src/components/` |

## Tokens y estilos

- No se introducen valores exactos de color, tipografía ni espaciado en este refinamiento; se consumen los tokens vigentes de `design-system`.
- El contraste se verifica contra los tokens existentes; si alguno no alcanza WCAG 2.1 AA, se corrige en `design-system`, no en cada pantalla.
- Los textos visibles se escriben en español en el archivo que los usa; los mensajes del servicio llegan ya en español y con acción.
- El estado de error se comunica con texto e icono, nunca solo con color; la valoración se anuncia como número, no solo con estrellas.
- Las animaciones de feedback se mantienen por debajo de 300 ms y respetan la preferencia de movimiento reducido.

## Fronteras de código

- Las pantallas siguen en `app/src/screens/<pantalla>/`; los componentes reutilizables en `app/src/components/`.
- La tarjeta de opinión permanece como pieza compartida; ninguna pantalla la reimplementa.
- Los contratos de vista y paginación se consumen desde `packages/contracts`, sin introducir `packages/data-access`.
- Las reglas de negocio siguen en el servicio; la app solo envía tipo e ID opaco de Spotify y muestra los estados definidos aquí.

## Coherencia con CI

Los componentes nuevos o adaptados se implementan con TypeScript estricto, Prettier y ESLint con fronteras de importación. Las pruebas siguen la cadencia `test-after`; ninguna prueba de app sale a la red ni necesita credenciales reales de Spotify.
