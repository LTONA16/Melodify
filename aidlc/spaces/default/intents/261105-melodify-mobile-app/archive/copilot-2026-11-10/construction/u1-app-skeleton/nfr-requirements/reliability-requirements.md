# Requisitos de fiabilidad — U1

## Objetivo

El criterio de fiabilidad de U1 es completar el recorrido del esqueleto en
Expo Go sin cierres inesperados ni pantallas en blanco (NFR1). No se define
disponibilidad de servidor porque no existe despliegue.

| ID | Requisito | Verificación |
|---|---|---|
| NFR1.1 | El recorrido Login → Inicio → las cinco pestañas → Perfil → Cerrar sesión se completa dos veces en Android físico, sin crash ni pantalla en blanco. | Verificación manual del checkpoint del esqueleto, con y sin recuerdo inicial. |
| NFR1.2 | Un almacenamiento ausente, inválido o ilegible lleva a Login; un 503 de lectura deja el formulario disponible y ofrece «Reintentar». | Pruebas de `AppSession` para ausencia, payload inválido y 503 repetido. |
| NFR1.3 | Un fallo de guardado de sesión no abre Inicio; mantiene Login y permite reintentar sin perder los valores del formulario. | Prueba con adaptador que falla al guardar. |
| NFR1.4 | Un fallo de borrado mantiene la sesión y muestra «Reintentar»; un borrado correcto elimina la barra y vuelve a Login. | Pruebas de ambas ramas de `signOut`. |
| NFR1.5 | Inicio usa fallback determinista: semilla local, estado vacío o error en lenguaje llano con «Reintentar», y portada con inicial cuando `coverUrl` es nulo o falla. | Pruebas de los estados de `InicioScreen` y `CoverArt`. |
| NFR1.6 | Reintentos y doble toque no crean sesiones, semillas ni suscripciones duplicadas; las suscripciones se liberan al desmontar. | Pruebas de idempotencia y limpieza de listeners. |

## Alineación requerida con C3

Para que `signOut` sea observable y no finja una salida cuando el almacenamiento
falla, C3 debe incluir antes de Code Generation una respuesta `503` con la
descripción «no se pudo borrar la sesión; la interfaz conserva la sesión y
ofrece Reintentar». Solo la respuesta `204` permite emitir `signedOut` y volver
a Login. Esta ampliación mantiene el comportamiento ya definido para lectura y
guardado.

No hay backup, disaster recovery ni RTO/RPO aplicables: el contenido es
efímero y la única persistencia es el recuerdo local de sesión.

