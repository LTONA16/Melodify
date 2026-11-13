# RAID Log — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`) y de las respuestas de esta etapa (`feasibility-questions.md`, Q1–Q8).
> Fecha: 2026-11-05. Etapa: Feasibility & Constraints.

RAID = **R**iesgos, **A**ssumptions (supuestos), **I**ssues (problemas), **D**ependencies (dependencias). Este registro se mantiene vivo: las etapas siguientes lo leen y lo actualizan en lugar de crear uno nuevo.

## Risks (Riesgos)

| ID | Riesgo | Prob. | Impacto | Mitigación | Origen |
|---|---|---|---|---|---|
| R-01 | La falta de experiencia en React Native y Expo alarga el andamiaje inicial más de lo previsto. | Media | Medio | Arrancar con un esqueleto mínimo —una pantalla y navegación— y replicar el patrón en las cinco restantes. | [Q3] |
| R-02 | La exigencia de privacidad se interpreta como cumplimiento completo y desborda el alcance de una versión con datos de ejemplo. | Media | Medio | Acotar a estructura y puntos de extensión; las políticas definitivas llegan con el backend. | [Q2], [Q8] |
| R-03 | El trabajo se valida solo en Android y las diferencias de iOS aparecen cuando ya es tarde para corregirlas. | Media | Bajo | Evitar APIs exclusivas de plataforma; revisar en iOS cuando haya un dispositivo disponible. | [Q7] |
| R-04 | El artefacto de intent-capture describe a la vez una comunidad musical real y una pieza de portafolio; sin una lectura dominante, las etapas siguientes sobreinvierten en la lectura de producto real. | Media | Medio | Se registra la lectura dominante en el supuesto A-03 y se aplica al recortar alcance. | Review de intent-capture R-03 |
| R-05 | Las funciones sociales avanzadas y las notificaciones push no tienen decisión registrada; alguna etapa podría asumirlas dentro del alcance. | Media | Bajo | Se registran como pregunta abierta (A-02) para que las etapas siguientes pregunten. | Review de intent-capture R-02 |

## Assumptions (Supuestos)

| ID | Supuesto | Estado | Qué pasa si es falso |
|---|---|---|---|
| A-01 | Las versiones mínimas de sistema operativo se fijarán al crear el proyecto Expo; hoy no están definidas. | Abierto | Si se exige compatibilidad con versiones antiguas, habrá que revisar dependencias y APIs. |
| A-02 | Las funciones sociales avanzadas (seguir usuarios, comentarios anidados, mensajería) y las notificaciones push quedan **fuera** de esta versión hasta que se decidan. | Abierto | Si entran, el alcance de las pantallas de inicio, actividad y perfil crece de forma significativa. |
| A-03 | Esta primera versión es una pieza de demostración: pesa más que las seis pantallas existan y se recorran sin errores que un resultado medible de usuario. | Abierto | Si se espera un producto real, el alcance y las métricas de éxito cambian por completo. |
| A-04 | No se requiere persistencia local: el contenido de ejemplo vive en el código y no sobrevive a cambios de estado. | Abierto | Si se requiere persistencia, aparece trabajo de almacenamiento y de tratamiento de datos en el dispositivo. |
| A-05 | El login simulado no pide credenciales reales ni datos identificables. | Confirmado por diseño | Si se pidieran datos reales, se activaría el trabajo de privacidad completo. |

## Issues (Problemas)

| ID | Problema | Estado | Acción |
|---|---|---|---|
| I-01 | El artefacto aprobado de intent-capture conserva seis hallazgos de revisión aceptados como riesgo, entre ellos un Critical sobre el mapa de interesados. | Abierto, aceptado | No se corrigen en esta etapa; se dejan registrados aquí para que no se pierdan. |
| I-02 | No hay una decisión registrada sobre si la app debe publicarse en tiendas. | Abierto | Se difiere; esta versión corre solo en Expo Go. |

## Dependencies (Dependencias)

| ID | Dependencia | Tipo | Estado | Nota |
|---|---|---|---|---|
| D-01 | `intent-statement` aprobado en la etapa anterior. | Interna | Cumplida | Base de esta etapa. |
| D-02 | Expo Go instalado en el teléfono Android físico de prueba. | Herramienta | Pendiente de verificar | Es el único entorno de ejecución de esta versión. |
| D-03 | Node.js y el gestor de paquetes del ecosistema Expo en la máquina de desarrollo. | Herramienta | Pendiente de verificar | Requisito del andamiaje; sin costo. |
| D-04 | Decisión sobre funciones sociales y notificaciones push, antes de diseñar inicio, actividad y perfil. | Decisión | Pendiente | Bloquea el alcance de tres pantallas si entra en esta versión. |

## Sources

- `[desc]` Descripción inicial del pedido.
- `[Q1]`–`[Q8]` Respuestas registradas en `feasibility-questions.md`.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.
- Revisión de intent-capture (`ideation/intent-capture/reviews/`), hallazgos R-02 y R-03 aceptados como riesgo.

## Assumptions & Open Questions

- **Versiones mínimas de sistema operativo**: sin definir; se fijan al crear el proyecto Expo. [assumption]
- **Funciones sociales avanzadas y notificaciones push**: sin decisión registrada; ver A-02 y D-04. [assumption]
- **Peso relativo entre portafolio y producto real**: ver A-03. [assumption]
- **Persistencia local**: ver A-04. [assumption]
