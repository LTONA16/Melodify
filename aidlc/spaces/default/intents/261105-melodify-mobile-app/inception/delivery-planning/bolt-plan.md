# Plan de Bolts — Melodify

**Confirmación del resumen:** Looks correct (confirmación renovada, 2026-11-10). 

## Contexto y entradas

Este plan usa `requirements.md`, `stories.md`, `mockups.md`, `components.md`, `unit-of-work.md`, `unit-of-work-dependency.md`, `unit-of-work-story-map.md`, `contract-summary.md` y `team-practices.md`. Un **Bolt** es una pasada de construcción sobre una o más unidades que termina en algo que corre y se puede demostrar.

El orden económico elegido es **walking-skeleton-first y luego risk-first**: primero se prueba el tramo integrado mínimo; después se ataca Spotify, la principal incertidumbre externa; luego se entrega la escritura y la actividad; por último se comprueba todo el recorrido.

Esta secuencia queda confirmada para la ejecución de Construction; las decisiones de detalle pendientes siguen perteneciendo a Functional Design.

## Secuencia de implementación

| Orden | Bolt | Unidad | Dependencias | Propósito |
|---|---|---|---|---|
| 1 | `u1-app-skeleton` | U1 | Ninguna | Probar Expo Go, navegación, login demo, sesión recordada y una tarjeta real. |
| 2 | `u2-content-core` | U2 | U1 | Entregar el producto legible sin Spotify: contenido, Inicio, detalle y Perfil. |
| 3 | `u4-spotify-explore` | U4 | U2 | Resolver pronto PKCE, token seguro, catálogo real, portadas y Explorar. |
| 4 | `u3-create-react` | U3 | U2 | Añadir publicación, edición y reacciones sobre el núcleo estable. |
| 5 | `u5-activity` | U5 | U2 | Derivar y mostrar la actividad recibida. |
| 6 | `u6-walkthrough` | U6 | U3, U4, U5 | Demostrar las seis pantallas sin Spotify y, si el prerrequisito está resuelto, con Spotify. |

El orden respeta el DAG aprobado: `U1 → U2 → {U3, U4, U5} → U6`. La única elección económica dentro de las ramas es construir U4 antes que U3 y U5 para descubrir temprano los riesgos de la integración externa.

## Bolts y Definition of Done

### Bolt 1 — Esqueleto que corre (`u1-app-skeleton`)

- **Incluye:** proyecto Expo, DesignSystem mínimo, navegación, Login `demo/demo`, sesión recordada y una tarjeta de ejemplo.
- **Walking skeleton:** sí. Demuestra el camino mínimo de entrada hasta Inicio en Expo Go sobre el teléfono Android físico.
- **Definition of Done:** PR a `develop`, CI verde (`npm run typecheck`, `npm run lint`, `npm test` cuando el proyecto exista), recorrido U1 en el teléfono y aprobación humana del checkpoint.
- **Hipótesis de confianza:** la composición Expo, la navegación y la sesión pueden sostener el resto de la app sin módulos nativos fuera de Expo Go.
- **Demo:** abrir la app, entrar con `demo/demo`, llegar a Inicio, reiniciar y volver a Inicio sin credenciales.

### Bolt 2 — Núcleo de contenido (`u2-content-core`)

- **Incluye:** `ContentStore`, catálogo local, conectividad, feed completo, detalle y Perfil.
- **Definition of Done:** contenido demo sembrado con las cifras acordadas; estados de carga, vacío y error ejercitados; PR a `develop`, CI verde y recorrido sin Spotify de Inicio → detalle → Perfil.
- **Hipótesis de confianza:** la promesa principal funciona sin cuenta de Spotify y las pantallas pueden consumir los contratos C1–C6.
- **Demo:** leer opiniones, abrir una obra, ver las tres opiniones propias y el estado desconectado.

### Bolt 3 — Spotify y Explorar (`u4-spotify-explore`)

- **Incluye:** `SpotifyAuth`, PKCE S256, almacenamiento seguro, renovación, `SpotifyCatalog`, Explorar y portadas reales.
- **Definition of Done:** dobles cubren autorización, token, búsqueda y fallos; el client ID solo llega por `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`; el redirect URI se fija en Functional Design; PR a `develop`, CI verde y prueba manual de conexión si RC-09 está listo.
- **Hipótesis de confianza:** la integración externa puede funcionar en Expo Go sin client secret y degradar al catálogo de ejemplo cuando no está configurada.
- **Demo:** conectar o mostrar el estado sin configurar, buscar con dos caracteres y ver la portada real o el bloque de inicial.

### Bolt 4 — Crear, editar y reaccionar (`u3-create-react`)

- **Incluye:** Crear, edición, me gusta, comentarios, seguir y snackbar.
- **Definition of Done:** una opinión por obra y persona; errores conservan lo escrito; validación conforme a Functional Design; pruebas de cada capa y CI verde; PR a `develop`.
- **Hipótesis de confianza:** el núcleo de contenido soporta escritura local sin romper la lectura ni la navegación.
- **Demo:** publicar desde catálogo de ejemplo, editar, dar/quitar me gusta, comentar y seguir autor.

### Bolt 5 — Actividad (`u5-activity`)

- **Incluye:** derivación de actividad, agrupación por día, estados y navegación al detalle.
- **Definition of Done:** aparecen publicaciones propias, me gusta recibidos y comentarios recibidos; publicar actualiza Actividad sin recargar; pruebas y CI verdes; PR a `develop`.
- **Hipótesis de confianza:** la actividad derivada evita una segunda fuente de verdad y refleja los cambios del contenido.
- **Demo:** abrir eventos precargados, publicar y comprobar el nuevo evento.

### Bolt 6 — Recorrido completo (`u6-walkthrough`)

- **Incluye:** verificación y ajustes del recorrido completo, no funciones nuevas.
- **Definition of Done:** recorrido de las seis pantallas sin Spotify en el teléfono; recorrido con Spotify cuando RC-09 y A6 están resueltos; CI verde, documentación de variables actualizada y PR a `develop`.
- **Hipótesis de confianza:** las unidades integradas cumplen el criterio de terminado del MVP en un dispositivo real.
- **Demo:** recorrer Login, Inicio, Explorar, Crear, Actividad y Perfil en ambos estados de Spotify disponibles.

## Criterio común de entrega

Cada Bolt se integra mediante Pull Request a `develop`, con Conventional Commits y la plantilla del repositorio. `main` solo recibe entregas posteriores mediante squash desde `develop`. No hay despliegue: demostrar significa ejecutar Metro y Expo Go en el teléfono Android físico.
