# Composición y Forma de Trabajo

## Fuentes

- `team-assessment.md`: tamaño, capacidad, prioridad y matriz RACI.
- `skill-matrix.md`: habilidades cubiertas y lista de incorporación.
- `intent-backlog.md`: orden por dependencias de IB-01 a IB-11.
- `team-formation-questions.md`: Q1 a Q6.

## Decisión de composición

El equipo es pequeño, de tres o cuatro personas (Q1 C), y decide por consenso en cada fase (Q5 C). No se compone un mob: Q6 A elige trabajo individual por unidad con revisiones en los gates. Por tanto no hay conductor rotativo, navegadores ni temporizador de rotación; esas prácticas se descartan explícitamente para esta entrega.

La topología es un único equipo alineado al flujo del producto. No se crean equipos de plataforma, habilitación ni subsistema complejo: el alcance cabe en un equipo pequeño con las habilidades ya cubiertas (Q3 C).

## Roles, no nombres

| Rol | Cubre | Forma de participación |
|---|---|---|
| Rol backend | IB-01 a IB-04, IB-06 a IB-10 | Ejecución individual de sus unidades; consulta en los gates. |
| Rol de app | IB-05 e IB-11 | Ejecución individual; apoyo en verificación con dos dispositivos. |
| Rol de calidad | Todas las unidades | Pruebas y gate de CI; revisión en los puntos de aprobación. |
| Rol de privacidad | IB-04 | Consentimiento, borrado y retención bajo LFPDPPP. |

No se han dado nombres, así que los artefactos no inventan personas. Si aparecen, se añadirán con una respuesta nueva de la persona.

## Secuencia de trabajo

Se mantiene el orden por dependencias de `intent-backlog.md`: contratos y datos → cuentas y sesión → perfil, privacidad y adaptadores → opiniones → feed, interacciones y seguimientos → actividad → verificación en dos dispositivos. IB-03, IB-04 e IB-05 pueden avanzar en paralelo; IB-07, IB-08 e IB-09 también. Todo lo demás se ejecuta de una unidad a la vez.

La capacidad semanal reservada es de 10 a 20 horas (Q2 B) y la otra iniciativa existente no desplaza este intento (Q4 B). El paralelismo se limita a los pares ya marcados para no repartir la capacidad entre demasiadas unidades.

## Normas de la sesión de trabajo

- Una unidad activa por tramo, salvo los pares declarados en el backlog.
- Las decisiones de alcance, diseño y cierre se llevan al equipo y se aprueban por consenso (Q5 C).
- Cada unidad termina con pruebas y gate de CI antes de pasar a la siguiente.
- Los temas tangenciales se anotan y se llevan a un gate; no se añaden unidades sobre la marcha.
- No se programan sesiones de mob ni de pareja sin una respuesta nueva que cambie Q6.

## Verificación final

IB-11 se ejecuta con dos dispositivos reales en la misma red local (Q4, SC-10). El rol de app prepara el acceso y el rol de calidad comprueba que publicar, comentar, dar me gusta y seguir se ven en el segundo dispositivo. No se levanta túnel ni entorno público.

## Si cambia la decisión

Cualquier cambio a mob completo o a trabajo en pareja exige una respuesta nueva de la persona. Hasta entonces, la composición descrita aquí es la que rige la entrega.
