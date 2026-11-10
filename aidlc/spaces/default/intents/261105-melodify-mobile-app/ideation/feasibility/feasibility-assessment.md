# Feasibility Assessment — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`) y de las respuestas de esta etapa registradas en `feasibility-questions.md` (Q1–Q8).
> Fecha: 2026-11-05. Etapa: Feasibility & Constraints. Agente: aidlc-architect-agent.

## Resumen ejecutivo

La iniciativa es **viable**. Se trata de una app móvil con Expo React Native, sin backend, con seis pantallas y contenido de ejemplo, que se probará con Expo Go en un teléfono Android físico. No hay integraciones de producto, no hay cuentas de pago y no hay plazo formal. [Q1] [Q6] [Q7] [Q4]

La única fuente real de trabajo adicional no es técnica sino documental: la respuesta de cumplimiento exige dejar preparada la estructura de privacidad desde ahora, porque la app apuntará a datos reales más adelante. [Q2] [Q8]

El riesgo principal es de **experiencia del equipo**: hay solvencia en React web pero es la primera vez con React Native y Expo, y eso concentra el esfuerzo en el andamiaje, la navegación y las particularidades de la plataforma móvil. [Q3]

## Viability Assessment

### Viabilidad técnica — Alta

| Factor | Evaluación | Fundamento |
|---|---|---|
| Stack | Viable sin reservas | Expo React Native es un stack maduro para una app de pantallas y navegación; el pedido original ya lo nombra. [desc] |
| Alcance funcional | Viable | Seis pantallas con datos de ejemplo locales, sin backend ni autenticación real. [Q8] |
| Integraciones | Sin riesgo | Solo herramientas de desarrollo (Expo Go, emuladores); ninguna integración de producto. [Q1] |
| Entorno de prueba | Viable | Expo Go sobre un teléfono Android físico, sin cuentas ni compilación en la nube. [Q6] [Q7] |
| Persistencia | No aplica en esta versión | No se definió almacenamiento local como requisito; el contenido es de ejemplo y vive en el código. [Q1] [Q8] |
| Plataformas | Android primero, iOS contemplado | La app se prueba en Android físico; iOS queda como objetivo secundario no verificado en esta versión. [Q7] |

**Lectura**: no hay incógnitas técnicas que puedan bloquear el trabajo. Lo que sí existe es una **curva de aprendizaje** en React Native y Expo que conviene asumir de forma explícita en la estimación. [Q3]

### Viabilidad organizativa — Alta

- Una sola persona puede crear el proyecto y avanzar sin aprobaciones. [Q5]
- No hay bloqueos de cambio ni prioridades en competencia declaradas. [Q5]
- No se requieren cuentas de desarrollador ni gasto en servicios. [Q6]

### Viabilidad regulatoria — Media, por decisión de diseño

Se declararon requisitos formales de protección de datos, pero esta versión no maneja datos personales reales: todo el contenido es de ejemplo. [Q2] [Q8]

La lectura acordada es preparar la estructura de privacidad desde ahora para no rehacerla cuando lleguen datos reales, sin convertir esta versión en un ejercicio de cumplimiento completo. [Q8]

Consecuencia práctica: la app debe **no pedir datos personales reales** en el login simulado y debe dejar los puntos de extensión de privacidad (aviso, consentimiento, tratamiento de datos) identificados en el diseño, aunque su contenido definitivo llegue con el backend.

### Viabilidad de plazo — Sin restricción

No hay plazo formal; el avance ocurre por sesiones de trabajo. [Q4] Esto permite priorizar que las seis pantallas existan y se recorran sin errores antes que la profundidad de cada una.

## Risk Analysis

| Riesgo | Probabilidad | Impacto | Mitigación propuesta |
|---|---|---|---|
| Curva de aprendizaje de React Native y Expo frena el avance | Media | Medio | Empezar por un esqueleto mínimo con navegación y una pantalla, y replicar el patrón en las cinco restantes. [Q3] |
| El requisito de privacidad se interpreta como un trabajo de cumplimiento completo y desborda el alcance | Media | Medio | Acotar esta versión a estructura y puntos de extensión; el contenido formal llega con el backend. [Q8] |
| La app se valida solo en Android y las diferencias de iOS aparecen tarde | Media | Bajo | Escribir componentes sin APIs específicas de plataforma y revisar en iOS cuando haya dispositivo disponible. [Q7] |
| Ambigüedad entre "producto real" y "pieza de portafolio" lleva a sobreinvertir | Media | Medio | Se registra como supuesto abierto en el RAID log; en esta versión pesa la completitud de las pantallas. |
| Las áreas sociales avanzadas y las notificaciones push quedan sin decisión y se asumen por error | Media | Bajo | Se registran como pregunta abierta en el RAID log para que las etapas siguientes pregunten en lugar de asumir. |
| Sin versiones mínimas de sistema operativo definidas, una decisión de compatibilidad se toma por accidente | Baja | Bajo | Se registra como supuesto abierto; se fija cuando se cree el proyecto Expo. |

## Conclusion

La etapa concluye **viable**. Las condiciones para avanzar son tres: asumir la curva de aprendizaje del stack en la estimación, mantener la privacidad como estructura preparada y no como cumplimiento completo, y resolver en las etapas siguientes las decisiones que quedaron abiertas (funciones sociales, notificaciones push, versiones mínimas de sistema operativo y el peso relativo entre portafolio y producto).

## Sources

- `[desc]` Descripción inicial del pedido.
- `[scope]` Alcance de workflow seleccionado: `mvp`.
- `[Q1]`–`[Q8]` Respuestas registradas en `feasibility-questions.md` de esta etapa.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.

## Assumptions & Open Questions

- **Versiones mínimas de sistema operativo**: no definidas; se fijarán al crear el proyecto Expo. [assumption]
- **Funciones sociales avanzadas** (seguir usuarios, comentarios anidados, mensajería) y **notificaciones push / publicación en tiendas**: sin decisión registrada en esta versión. [assumption]
- **Peso relativo entre producto real y pieza de portafolio**: esta versión prioriza la completitud de las pantallas; el problema de la comunidad musical es la dirección de largo plazo. [assumption]
- **Persistencia local**: no se definió si algún dato debe sobrevivir al cierre de la app; se asume que no en esta versión. [assumption]
