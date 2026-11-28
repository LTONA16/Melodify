# Maquetas Conceptuales — Preguntas

Tres decisiones bastan para dibujar los bocetos de interacción del backend: qué queda dentro del límite del sistema, qué caminos de fallo se muestran y cómo aparece la privacidad. El resto se resuelve con los artefactos anteriores.

## Sources

- `intent-statement.md`: cuentas reales, contenido compartido y métrica de éxito desde un segundo dispositivo.
- `scope-document.md`: capacidades SC-01 a SC-10, frontera del MVP y verificación en dos dispositivos de la misma red local.
- `intent-backlog.md`: proto-unidades IB-01 a IB-11 y orden por dependencias.

## Q1. [Producto] ¿Qué límite muestra el diagrama de contexto del sistema?

El boceto puede quedar solo en el servicio o incluir lo que ya ocurre en el teléfono; esto decide qué flechas se dibujan desde el primer dispositivo y el segundo.

A. App en dos dispositivos, servicio en el portátil y su base de datos; Spotify y el respaldo local de solo lectura aparecen como contexto externo, sin tokens en el servicio.
B. Solo app y servicio local; la base de datos, Spotify y el respaldo local quedan fuera del dibujo.
C. App, servicio local y base de datos; Spotify y el respaldo local se omiten por no formar parte del backend.
D. App en dos dispositivos, servicio local y Spotify como integración directa del servicio; el respaldo local se omite.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q2. [Diseño] ¿Qué caminos de fallo se dibujan junto al recorrido principal?

Los bocetos de interacción pueden quedarse en el caso correcto o mostrar también la recuperación; esto define los estados que el equipo verá antes de convertirlos en requisitos.

A. Sin sesión válida, sin conexión al servicio local y feed vacío, cada uno con su acción de recuperación.
B. Solo sin conexión al servicio local, con mensaje llano y «Reintentar».
C. Solo sin sesión válida, con vuelta al acceso.
D. Ninguno: solo el recorrido correcto.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q3. [Cumplimiento] ¿Cómo se representa la privacidad bajo LFPDPPP en los bocetos?

La capacidad de consentimiento, borrado y retención entra en el alcance; falta decidir si se dibuja como recorrido propio o como una nota junto a las opiniones.

A. Como recorrido propio: consentimiento al crear la cuenta, borrado de datos de la cuenta y regla de retención sobre opiniones e interacciones.
B. Como nota junto al alta de cuenta y al borrado; la retención queda descrita en texto, sin flechas propias.
C. Solo como nota de alcance, sin dibujo: se detallará en requisitos.
D. Fuera de los bocetos: se tratará solo en la verificación con dos dispositivos.
E. Not yet defined.
X. Other (please specify)

[Answer]: A
