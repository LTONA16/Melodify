# Constraint Register — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`) y de las respuestas de esta etapa (`feasibility-questions.md`, Q1–Q8).
> Fecha: 2026-11-05. Etapa: Feasibility & Constraints.

## Cómo leer este registro

Cada restricción lleva un **tipo** (técnica, organizativa o regulatoria), su **origen** en las respuestas de esta etapa, y cómo se manifiesta en el trabajo de las etapas siguientes. Una restricción no es una preferencia: si algo la contradice, el diseño debe cambiar.

## Restricciones técnicas

| ID | Restricción | Origen | Efecto en el trabajo |
|---|---|---|---|
| CT-01 | El stack es Expo React Native, como pide el pedido original. | `[desc]` | El andamiaje del proyecto y las dependencias se eligen dentro del ecosistema Expo. |
| CT-02 | No hay backend ni autenticación real: el login simula el ingreso. | `[Q8]`, `[desc]` | El estado de sesión vive en el cliente; no hay llamadas de red ni contratos de API que diseñar. |
| CT-03 | Todo el contenido es de ejemplo y local; no hay datos reales de usuarios. | `[Q8]` | Las pantallas se alimentan de constantes locales, no de fuentes externas. |
| CT-04 | No hay integración con servicios musicales (Spotify, Apple Music, Last.fm) ni con ningún sistema de producto. | `[Q1]`, `intent-statement` | Se descarta cualquier SDK de terceros para catálogo, reproducción o metadatos musicales. |
| CT-05 | El entorno de ejecución de esta versión es Expo Go sobre un teléfono Android físico. | `[Q7]`, `[Q6]` | Solo se usan APIs incluidas en Expo Go; quedan fuera los módulos nativos que exigen build propio. |
| CT-06 | No se usan cuentas de pago, compilación en la nube ni publicación en tiendas. | `[Q6]` | No se configura EAS Build ni firma de aplicaciones en esta versión. |
| CT-07 | La app apunta principalmente a Android, contemplando iOS como objetivo secundario. | `[Q7]`, `intent-statement` | Se evitan APIs exclusivas de una plataforma; la verificación en iOS no se exige en esta versión. |
| CT-08 | La interfaz y los textos de la app van en español. | `intent-statement` | Los textos de las seis pantallas se escriben en español; no se introduce infraestructura de internacionalización. |
| CT-09 | El equipo tiene experiencia en React web, no en React Native ni Expo. | `[Q3]` | Se prefiere lo convencional y bien documentado del ecosistema antes que soluciones novedosas; el andamiaje debe ser explícito. |

## Restricciones organizativas

| ID | Restricción | Origen | Efecto en el trabajo |
|---|---|---|---|
| CO-01 | Una sola persona crea el proyecto y avanza sin aprobaciones externas. | `[Q5]` | No hay proceso de revisión de terceros ni ventanas de aprobación que respetar. |
| CO-02 | No hay plazo formal; el avance ocurre por sesiones de trabajo. | `[Q4]` | La planificación se hace por unidad de trabajo, no por fechas de calendario. |
| CO-03 | No hay presupuesto asignado para servicios. | `[Q4]`, `[Q6]` | Toda decisión técnica debe tener costo cero: herramientas gratuitas y ejecución local. |
| CO-04 | No hay bloqueos de cambio ni prioridades en competencia declaradas. | `[Q5]` | No se requiere coordinación con otras iniciativas para avanzar. |

## Restricciones regulatorias

| ID | Restricción | Origen | Efecto en el trabajo |
|---|---|---|---|
| CR-01 | Aplican requisitos formales de protección de datos, aunque esta versión use datos de ejemplo. | `[Q2]` | El diseño debe identificar dónde viven los datos personales y qué consentimiento requieren, incluso si hoy son ficticios. |
| CR-02 | La app se prepara para datos reales más adelante, así que la estructura de privacidad se deja desde ahora. | `[Q8]` | Los puntos de extensión de privacidad (aviso, consentimiento, tratamiento y eliminación de datos) se prevén en el diseño de pantallas y estado. |
| CR-03 | Esta versión no debe recoger datos personales reales. | `[Q2]`, `[Q8]` | El login simulado no pide credenciales reales ni datos identificables; se advierte que es una demo. |
| CR-04 | El alcance de cumplimiento de esta versión es estructura, no certificación. | `[Q8]` | No se redactan políticas definitivas ni se ejecuta una auditoría; se prepara el terreno. |

## Restricciones fuera de alcance explícitamente

- Publicación en Google Play o App Store. [Q6]
- Notificaciones push. Sin decisión registrada; ver RAID log.
- Funciones sociales avanzadas: seguir usuarios, comentarios anidados, mensajería. Sin decisión registrada; ver RAID log.

## Sources

- `[desc]` Descripción inicial del pedido.
- `[Q1]`–`[Q8]` Respuestas registradas en `feasibility-questions.md`.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.

## Assumptions & Open Questions

- Las versiones mínimas de sistema operativo no están definidas; se fijarán al crear el proyecto Expo. [assumption]
- Las funciones sociales avanzadas y las notificaciones push no tienen decisión registrada en esta versión. [assumption]
