# Intent Statement

## Problem Statement

Melodify hoy funciona con autores, opiniones e interacciones simuladas que viven en la memoria del teléfono [desc]. Lo que una persona publica no lo ven las demás ni lo ve ella misma desde otro dispositivo [Q1]. Este trabajo pone detrás de la app un servicio que hace reales las cuentas y compartido el contenido [Q1] [Q2].

## Target Customer

Personas que escuchan música y quieren compartir y leer opiniones con otros oyentes, no solo consigo mismas [Q3]. Su dolor hoy es que el contenido que crean se queda en su teléfono y no llega a otros oyentes [Q1] [Q3].

## Success Metrics

- Cuentas reales en uso: alguien publica, comenta, da me gusta y sigue a otra persona, y todo eso se ve desde un segundo dispositivo [Q4].
- El contenido deja de perderse al reinstalar la app o cambiar de teléfono [Q4].

## Initiative Trigger

- Necesidad técnica: la lógica y los datos no pueden seguir viviendo dentro de la app [Q5].
- El repositorio ya contiene el servicio en `apps/api` y los contratos compartidos en `packages/contracts`; este trabajo los extiende y completa [desc] [Q2].
- El proyecto ya permite backend, autenticación real y persistencia en servidor para este trabajo [memory:M1].

## Initial Scope Signal

- **workflow-selected**: alcance `feature`, elegido para este trabajo [scope].
- **Product boundary, confirmed by the person**: esta primera versión no gestiona tokens de Spotify ni reproduce audio; la conexión con Spotify sigue en la app con PKCE [Q8] [memory:M2] [memory:M3]. No publica en Google Play ni en App Store ni configura compilación en la nube [Q8]. No incluye panel de administración, moderación ni roles de administrador [Q8].
- **In scope**: extender y completar el servicio de `apps/api` con perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad sobre la base actual [Q2] [desc].
- La app móvil conserva su respaldo local de solo lectura [desc].

## Assumptions & Open Questions

- [assumption] No se fijó un objetivo numérico de éxito; la medida acordada es funcional (contenido compartido entre dispositivos y que sobreviva a reinstalar).
- [assumption] No se decidió qué pasa con el contenido creado localmente en los teléfonos antes de que exista el backend: si se migra, se descarta o se queda solo en el dispositivo.
- [assumption] La moderación queda fuera de esta primera versión por decisión explícita; conviene revisarla si el contenido pasa a ser público.
