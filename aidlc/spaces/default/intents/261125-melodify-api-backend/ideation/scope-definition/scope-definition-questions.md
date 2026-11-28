# Definición del Alcance — Preguntas

Estas cinco decisiones fijan el corte de la primera entrega, cómo se ordena y cómo se demuestra. Todo lo demás se resuelve con los artefactos anteriores y queda registrado como supuesto.

## Sources

- [desc] Descripción inicial: backend de Melodify sobre `apps/api` y `packages/contracts`; cuentas reales, opiniones, interacciones, feed y actividad; Spotify sigue en la app con PKCE.
- [scope] Alcance seleccionado: `feature`.
- `intent-statement.md`: métrica de éxito (publicar, comentar, dar me gusta y seguir desde un segundo dispositivo) y exclusiones explícitas.
- `feasibility-assessment.md`: servicio local, LFPDPPP y contenido de los teléfonos descartado.
- `constraint-register.md`: restricciones CT-01 a CT-09.

## Q1. [Producto] ¿Qué capacidades entran en el MVP de esta entrega?

La métrica de éxito pide cuentas reales e interacciones compartidas. Este corte decide qué se construye antes y qué queda fuera de la primera versión.

A. Todo lo que pide la métrica: cuentas, publicar, comentar, me gusta, seguir, feed y actividad.
B. Cuentas, publicar y leer opiniones; comentarios, me gusta, seguir, feed y actividad quedan para después.
C. Solo cuentas y lectura del catálogo de ejemplo; publicar queda para después.
D. No hay corte claro; decide el equipo según lo que encuentre en `apps/api`.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿La primera entrega conecta la app al servicio real?

El trabajo puede quedar solo en el backend o cerrar el recorrido completo desde el teléfono; cambia el alcance y la verificación.

A. Sí: backend, contratos y app conectada al servicio real, con el respaldo local de solo lectura.
B. No: solo backend y contratos; la app se conecta en una entrega posterior.
C. Sí, pero solo para publicar y leer; el resto de interacciones sigue en memoria.
D. No definido; se decide al repartir las unidades.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q3. [Entrega] ¿Cómo prefieres ordenar el trabajo?

El orden afecta a cuándo se ve el primer resultado y a cuándo se descubren los riesgos; no cambia qué entra, sino por qué camino.

A. Por valor: primero el recorrido completo que demuestra contenido compartido.
B. Por riesgo: primero comprobar `apps/api`, la sesión y la privacidad.
C. Por dependencias: primero datos y contratos, luego contenido, luego interacciones.
D. Mixto: valor primero, con una comprobación temprana del servicio existente.
E. Not yet defined.
X. Other (please specify)

[Answer]: C

## Q4. [Verificación] ¿Cómo se demuestra que el contenido se ve desde un segundo dispositivo?

La métrica de éxito pide un segundo dispositivo y la viabilidad fijó el servicio solo en el portátil; hace falta cerrar cómo se prueba sin desplegar nada.

A. Dos dispositivos reales en la misma red local que alcanzan el servicio del portátil.
B. Un dispositivo real y un emulador en la misma máquina, ambos contra el servicio local.
C. Solo se verifica en el mismo dispositivo y se documenta la limitación.
D. Se levanta un túnel temporal solo para la prueba; sigue sin ser un despliegue.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q5. [Producto] ¿Hay fechas límite que condicionen capacidades concretas?

Una fecha de demostración puede reducir el MVP; si no hay presión de tiempo, el corte se decide solo por valor y riesgo.

A. No hay fechas; el corte se decide por valor y riesgo.
B. Hay una fecha de demostración, pero no reduce capacidades.
C. Hay una fecha y reduce capacidades: se indicará cuáles en «Other».
D. No se ha decidido todavía.
E. Not yet defined.
X. Other (please specify)

[Answer]: B
