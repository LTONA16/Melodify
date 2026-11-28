# Evaluación del Equipo

## Fuentes

- `scope-document.md`: capacidades SC-01 a SC-10 y verificación con dos dispositivos.
- `intent-backlog.md`: 11 proto-unidades `Must Have`.
- `feasibility-assessment.md`: servicio local en el portátil, sin despliegue ni proveedor externo.
- `team-formation-questions.md`: decisiones Q1 a Q6.

## Resumen

Hay un equipo pequeño de tres o cuatro personas (Q1 C), con dedicación reservada de 10 a 20 horas semanales (Q2 B) y todas las habilidades que pide el alcance cubiertas de entrada (Q3 C). Existe otra iniciativa que compite por el mismo tiempo, pero este intento tiene prioridad (Q4 B). El equipo decide por consenso en cada fase (Q5 C), mientras que la ejecución de cada unidad es individual con revisiones en los gates (Q6 A).

## Disponibilidad y capacidad

| Aspecto | Situación declarada | Consecuencia |
|---|---|---|
| Tamaño | Tres o cuatro personas (Q1 C). | No se nombra a nadie: se habla de roles, no de personas concretas. |
| Dedicación | 10 a 20 horas por semana (Q2 B). | Capacidad limitada; se evita paralelismo innecesario entre unidades. |
| Otras iniciativas | Sí hay una iniciativa competidora, pero este intento va primero (Q4 B). | No se recorta el alcance; se vigila que la otra iniciativa no desplace el trabajo. |
| Topología | Equipo alineado al flujo del producto; no se crean equipos de plataforma ni de subsistema. | Un solo equipo cubre backend, app, calidad y verificación. |

## Contradicción resuelta

Q1 y Q5 describen un equipo pequeño que decide en conjunto; Q6 describe trabajo individual. No son incompatibles: el equipo se reúne para decidir y revisar en los gates, pero nadie hace mob ni pareja durante la ejecución de una unidad. No se inventan rotaciones de conductor ni sesiones de programación en grupo.

## Matriz RACI

| Actividad | Responsable | Aprobador | Consultado | Informado |
|---|---|---|---|---|
| Frontera del alcance y cambios | Equipo pequeño | Equipo por consenso (Q5 C) | Persona que sigue el producto | Todo el equipo |
| Diseño de cuentas, sesión y datos | Rol backend | Equipo por consenso | Rol de calidad y rol de privacidad | Rol de app |
| Adaptación de la app al servicio | Rol de app | Equipo por consenso | Rol backend | Rol de calidad |
| Consentimiento, borrado y retención | Rol de privacidad | Equipo por consenso | Rol backend | Todo el equipo |
| Pruebas y gates de calidad | Rol de calidad | Equipo por consenso | Rol backend y rol de app | Todo el equipo |
| Verificación con dos dispositivos | Rol de app con apoyo de calidad | Equipo por consenso | Rol backend | Todo el equipo |

## Acuerdo de asignación de capacidad

- La capacidad semanal declarada es de 10 a 20 horas (Q2 B). No se desglosa por persona porque no se dieron nombres ni distribución individual.
- El orden por dependencias de `intent-backlog.md` se mantiene: se avanza en una unidad a la vez salvo los pares que el backlog marca como paralelos.
- La iniciativa competidora no reduce capacidades del MVP; solo limita el paralelismo.

## Riesgos de equipo

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La iniciativa competidora absorba tiempo del equipo. | Media | Recordar en cada gate que Q4 B da prioridad a este intento; renegociar alcance solo con aprobación explícita. |
| Sobrecarga al querer cubrir backend, app, privacidad y calidad con tres o cuatro personas. | Media | Mantener ejecución individual y una sola unidad activa por tramo; usar los gates para revisar, no para añadir trabajo. |
| Suponer que hay más personas de las declaradas. | Baja | Los artefactos hablan solo de roles; cualquier nombre concreto se añadiría con una respuesta nueva de la persona. |

## Fuente de decisiones

- Q1: equipo pequeño de tres o cuatro personas.
- Q2: dedicación de 10 a 20 horas semanales.
- Q3: todas las habilidades requeridas están cubiertas.
- Q4: hay competencia por tiempo, con prioridad de este intento.
- Q5: decisiones por consenso del equipo.
- Q6: ejecución individual con revisiones en gates.
