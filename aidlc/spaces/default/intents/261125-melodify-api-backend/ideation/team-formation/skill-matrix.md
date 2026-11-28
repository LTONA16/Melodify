# Matriz de Habilidades

## Fuentes

- `scope-document.md`: capacidades SC-01 a SC-10.
- `intent-backlog.md`: proto-unidades IB-01 a IB-11.
- `feasibility-assessment.md`: servicio local, LFPDPPP y contenido descartado.
- `team-formation-questions.md`: Q1 a Q6.

## Habilidades requeridas

| Habilidad | Para qué hace falta | Proto-unidades |
|---|---|---|
| Diseño y desarrollo de API | Cuentas, sesión, perfiles, opiniones, feed e interacciones. | IB-02 a IB-10 |
| Modelado de datos y contratos compartidos | Base común entre servicio y app. | IB-01 |
| Autenticación y sesión | Cuentas reales, sin login simulado. | IB-02, IB-05 |
| Privacidad bajo LFPDPPP | Consentimiento, borrado y retención desde el primer usuario. | IB-04 |
| Adaptación de app móvil | Llevar el servicio real al teléfono y conservar el respaldo local. | IB-05 |
| Calidad y pruebas | Verificar cada proto-unidad antes de pasar a la siguiente. | Todas |
| Verificación en dispositivo | Dos dispositivos reales en la misma red local. | IB-11 |

## Disponibilidad declarada

Q3 C confirma que están cubiertas las áreas de backend, app móvil y calidad. Q1 C sitúa esas habilidades en un equipo de tres o cuatro personas. Q6 A indica que se aplican de forma individual por unidad, con revisión en los gates.

| Habilidad | Estado | Quién la aporta | Comentario |
|---|---|---|---|
| Diseño y desarrollo de API | Cubierta | Rol backend | El equipo ya trabaja sobre el servicio existente. |
| Modelado de datos y contratos compartidos | Cubierta | Rol backend | Parte del punto de partida del repositorio. |
| Autenticación y sesión | Cubierta | Rol backend | Las cuentas son reales; no se asume login simulado. |
| Privacidad bajo LFPDPPP | Cubierta | Rol de privacidad del equipo | Los plazos concretos siguen abiertos (I-03), pero la capacidad de tratar el tema existe. |
| Adaptación de app móvil | Cubierta | Rol de app | Incluye el respaldo local de solo lectura. |
| Calidad y pruebas | Cubierta | Rol de calidad | Pruebas automáticas y gate de CI. |
| Verificación en dispositivo | Cubierta | Rol de app con apoyo de calidad | Requiere dos dispositivos reales en la misma red (Q4). |

## Análisis de brechas

No hay brecha de habilidades declarada: Q3 C cubre backend, app y calidad, y el resto de áreas se asignan a roles dentro del equipo de tres o cuatro personas (Q1 C). La incertidumbre no es de personas, sino de estado del código: hay que comprobar `apps/api` y `packages/contracts` antes de convertir las proto-unidades en unidades (R-01, I-04).

## Plan de resolución de brechas

No se necesita plan de formación ni apoyo externo para las habilidades declaradas. Si la comprobación del servicio existente revela una brecha técnica, se registra en la etapa que corresponda y se decide allí; no se contrata ni se inventa capacidad ahora.

## Lista de incorporación

- Leer `scope-document.md` y `intent-backlog.md` antes de tocar una proto-unidad.
- Confirmar las decisiones Q1 a Q6 del archivo de preguntas de esta etapa.
- Acceder a `apps/api`, `packages/contracts` y `app/` en el repositorio del intento.
- Acordar los gates donde el equipo decide por consenso (Q5 C) y la ejecución individual (Q6 A).
- Preparar dos dispositivos reales en la misma red para IB-11.
- No introducir tokens de Spotify en el servicio; PKCE sigue en la app (CT-04).
