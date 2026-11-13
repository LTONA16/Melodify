# Mapa de dependencias externas — Melodify

**Confirmación del resumen:** Looks correct (confirmada el 2026-11-10).

## Dependencias registradas

El mapa distingue bloqueos reales de Construction de respaldos locales ya previstos en el alcance.

| Dependencia | Propietario | Cuándo se necesita | Bolt bloqueado | Plan si se retrasa |
|---|---|---|---|---|
| Spotify Developer App | Persona/equipo del proyecto | **Ya registrada**; solo falta cargarle el redirect URI antes de probar la conexión real | U4, U6 | El registro existe desde antes de Construction (Q8 = D). Si aun así faltara, construir y probar U4 con dobles y dejar constancia del motivo; el camino previsto es el recorrido con sesión. |
| Client ID de Spotify | Persona/equipo del proyecto | Antes de ejecutar la autorización en dispositivo | U4, U6 | Mantener `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` ausente: la app debe mostrar el aviso de instalación no configurada y seguir operativa con catálogo de ejemplo. |
| Redirect URI de PKCE | Functional Design lo fija y se pega en el panel de Spotify | Antes del primer intento de conexión real (Bolt 3) | U4, U6 | No inventar un URI: se calcula con el `makeRedirectUri()` de Expo Go y se registra. Si no estuviera cargado, dejar la conexión real pendiente y anotar el motivo. |
| Red del dispositivo y límites de Spotify | Spotify/operador de red | Búsqueda, resolución de portadas y autorización | U4, U6 | Usar caché y catálogo de ejemplo, mostrar errores con «Reintentar» y probar fallos con dobles. |
| Expo Go en teléfono Android físico | Persona que verifica | Cada checkpoint y la demostración final | U1, U6 | No sustituir por emulador: registrar el bloqueo y reanudar la demostración cuando el dispositivo esté disponible. |

## Dependencias internas relevantes

Las interfaces C1–C8 de `contract-summary.md` viajan dentro del mismo proceso; no son servicios externos. U1 entrega DesignSystem, AppShell y AppSession; U2 entrega ContentStore, Catalog y Connectivity; U4 implementa los tres puertos de Spotify; U5 entrega ActivityFeed. U6 consume todos los contratos y no publica uno nuevo.

## Criterios de seguimiento

- Cada dependencia tiene dueño y un estado explícito antes de abrir el Bolt que la consume.
- Ningún client secret se incorpora a la app, al repositorio ni a una variable `EXPO_PUBLIC_*`.
- Una dependencia retrasada no se oculta con un éxito aparente: se conserva el alcance, se usa el respaldo local previsto y se documenta qué recorrido no pudo demostrarse.
