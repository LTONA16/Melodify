# Units Generation — plan de descomposición

> Etapa: Units Generation (10 de 19). Agente: aidlc-architect-agent. Profundidad: Standard.
> Respuestas: Q1 A, Q2 A, Q3 A, Q4 A, Q5 A, Q6 A.
> Este plan se aprueba antes de generar los artefactos. La secuencia de entrega (qué Bolt va primero y por qué) es de Delivery Planning; aquí solo se fija la topología.

## Unidades propuestas

| ID | Nombre | Qué entrega | Tipo | Complejidad | Depende de |
|---|---|---|---|---|---|
| U1 | `u1-app-skeleton` | Proyecto Expo, tema (DesignSystem), navegación de cinco pestañas (AppShell), login demo con sesión recordada (AppSession) e Inicio con una tarjeta de opinión de ejemplo. El tramo que corre en el teléfono. | `ui` | S | — |
| U2 | `u2-content-core` | ContentStore completo con el contenido de ejemplo, Catalog con catálogo local y decisión de portada, Connectivity con el aviso de sin conexión, Inicio con feed, Detalle de obra y Perfil. | `ui` | L | U1 |
| U3 | `u3-create-react` | Crear y Editar opinión, hoja de comentarios, me gusta y seguir; el resto de escrituras de ContentStore y el snackbar. | `ui` | L | U2 |
| U4 | `u4-spotify-explore` | SpotifyAuth (PKCE, token en almacenamiento seguro), SpotifyCatalog (búsqueda y portadas), Explorar con y sin sesión, los estados de conexión en Perfil y las portadas reales. | `ui` | L | U2 |
| U5 | `u5-activity` | ActivityFeed derivado del contenido y la pantalla Actividad con sus estados y agrupación por día. | `ui` | S | U2 |
| U6 | `u6-walkthrough` | Recorrido completo de las seis pantallas sin Spotify y con Spotify, ajustes que salgan de ese recorrido y la verificación en el teléfono. | `ui` | S | U3, U4, U5 |

## Grafo

```yaml
units:
  - name: u1-app-skeleton
    kind: ui
    depends_on: []
  - name: u2-content-core
    kind: ui
    depends_on: [u1-app-skeleton]
  - name: u3-create-react
    kind: ui
    depends_on: [u2-content-core]
  - name: u4-spotify-explore
    kind: ui
    depends_on: [u2-content-core]
  - name: u5-activity
    kind: ui
    depends_on: [u2-content-core]
  - name: u6-walkthrough
    kind: ui
    depends_on: [u3-create-react, u4-spotify-explore, u5-activity]
```

## Historias por unidad

| Historia | Unidad |
|---|---|
| US1.1, US1.2, US1.3 | U1 |
| US2.1, US2.3, US4.1, US4.2, US4.3, US9.1 | U2 |
| US2.2 | U4 |
| US3.1, US3.2, US10.1, US10.2 | U4 |
| US5.1, US5.2, US5.3, US6.1, US7.1, US7.2, US7.3 | U3 |
| US8.1 | U5 |
| US11.1, US11.2 | U6 |

## Puntos de integración

- **Contrato**: las interfaces de componente del Domain Design (props, contexto y estados publicados). No se inventan contratos nuevos entre unidades.
- **U1 → resto**: tema (tokens y componentes compartidos), navegación y sesión de la app.
- **U2 → U3, U4, U5**: `ContentStore` (lectura y escritura), `Catalog` (obra y portada), `Connectivity` (estado de red).
- **U3 → U6**: escritura del contenido y hoja de comentarios.
- **U4 → U6**: `SpotifyAuth` (estado de conexión y token) y `SpotifyCatalog` (búsqueda y portadas).
- **U5 → U6**: lista de actividad con su contrato de estados.

## Modelo de despliegue

Una sola app. Todas las unidades se empaquetan juntas y «desplegar» es abrir la app en Expo Go con Metro levantado. Ninguna unidad se publica por separado.
