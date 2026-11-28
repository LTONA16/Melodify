# User Stories — Preguntas

Estas decisiones cierran la forma de las historias, no el alcance. El alcance, las reglas de contenido, la visibilidad, la sesión y la degradación ya quedaron resueltos en `requirements-analysis-questions.md` y no se vuelven a preguntar.

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: requisitos FR1-FR9 y NFR1-NFR10 aprobados, con 51 IDs estables.
- `aidlc/spaces/default/codekb/Melodify/business-overview.md`: dominio de red social musical, servicios implementados y recursos pendientes.
- `aidlc/spaces/default/codekb/Melodify/component-inventory.md`: frontera entre API, contratos, app y paquetes compartidos.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: esqueleto activado, criterios de prueba y verificación real entre dos dispositivos.

## Q1. [Personas] ¿Qué conjunto de personas se usa para escribir las historias?

Las capacidades van desde crear cuenta hasta reaccionar, comentar y seguir. Conviene elegir actores funcionales verificables, sin atributos demográficos inventados, y dejar claro que una misma cuenta real puede reunir varios objetivos.

A. Tres personas funcionales: `Oyente` (descubre y lee), `Reseñador` (publica y edita opiniones) y `Curador social` (da me gusta, comenta y sigue). Una cuenta real puede actuar como las tres. (Recommended)

B. Dos personas funcionales: `Oyente` y `Reseñador`; las interacciones sociales se reparten entre ambas.

C. Una sola persona, `Usuario de Melodify`, con todos los objetivos; los actores de las historias se distinguen solo por la acción.

D. Cuatro personas, añadiendo `Cuenta sin Spotify` como actor separado para las historias de degradación y catálogo de respaldo.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q2. [Granularidad] ¿Qué tamaño deben tener las historias?

Los 51 requisitos deben quedar trazados, pero una historia por subrequisito produciría demasiadas unidades pequeñas; una por FR principal dejaría criterios muy grandes para estimar y probar.

A. Entre 12 y 16 historias verticales agrupadas por resultado de usuario; cada historia reúne varios requisitos relacionados y conserve un solo valor entregable. (Recommended)

B. Nueve historias grandes, una por FR principal, con todos sus subrequisitos como criterios de aceptación.

C. Una historia por subrequisito, aproximadamente 51 historias muy pequeñas.

D. Dos historias: el esqueleto de cuenta/opinión/feed y una historia general para el resto; las demás capacidades quedan descritas solo en los criterios.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q3. [Prioridad] ¿Cómo se reparte MoSCoW sin sacar capacidad del alcance aprobado?

MoSCoW ordena las historias para Delivery Planning; no elimina requisitos aprobados. La primera unidad debe seguir siendo el tramo real de cuenta, opinión y segundo dispositivo.

A. `Must`: cuenta/sesión, perfil, opiniones, feed global y recorrido entre dispositivos; `Should`: me gusta, comentarios, seguimientos y actividad; `Could`: edición de opinión, paginación avanzada y estados de degradación; `Won't`: todo lo que ya está fuera de alcance. (Recommended)

B. `Must`: todos los FR1-FR9 y NFR1-NFR10; `Should`, `Could` y `Won't` quedan vacíos dentro del alcance.

C. `Must`: solo el esqueleto (registro, publicar y ver en el segundo dispositivo); `Should`: resto de capacidades; `Could`: edición de opinión y borrado; `Won't`: fuera de alcance.

D. `Must`: cuenta, opiniones, feed e interacciones; `Should`: consentimiento, retención y borrado; `Could`: salud del servicio y degradación; `Won't`: fuera de alcance.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q4. [Agrupación] ¿Qué eje se usa para agrupar y nombrar las historias?

La agrupación debe ayudar a formar unidades coherentes más adelante; el stage advierte contra dividir por capas técnicas porque rompe el valor entregable.

A. Por área de dominio funcional: cuentas y sesión, perfiles, obras y opiniones, interacciones, feed y actividad, consentimiento y degradación. (Recommended)

B. Por flujo de usuario: registrarse, publicar, descubrir, interactuar, ver actividad y cerrar sesión.

C. Por persona: historias de `Oyente`, de `Reseñador` y de `Curador social`.

D. Por capa técnica: API, contratos compartidos y app; cada historia entrega solo una capa.

E. Not yet defined.

X. Other (please specify)

[Answer]: A
