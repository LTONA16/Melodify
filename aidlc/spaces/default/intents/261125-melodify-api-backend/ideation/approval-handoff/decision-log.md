# Registro de Decisiones — Ideación

## Fuentes

- Archivos `*-questions.md` de cada etapa de Ideación, con las respuestas `[Answer]:` dadas por la persona.
- `intent-statement.md`, `stakeholder-map.md`, `competitive-analysis.md`, `market-trends.md`, `build-vs-buy.md`, `feasibility-assessment.md`, `constraint-register.md`, `raid-log.md`, `scope-document.md`, `intent-backlog.md`, `team-assessment.md`, `skill-matrix.md`, `mob-composition.md`, `wireframes.md` y `user-flow.md`.
- Revisiones registradas en `intent-capture/reviews/review-01.md` y `rough-mockups/reviews/review-01.md`.
- `approval-handoff-questions.md`: decisión Q1 de este stage.

## Captura del intento

| ID | Decisión | Origen |
|---|---|---|
| IC-Q1 | A — las cuentas y las opiniones dejan de ser simuladas; cada persona tiene cuenta real y lo que publica lo ven las demás desde cualquier dispositivo. | `intent-capture-questions.md` |
| IC-Q2 | A — se extiende y completa el servicio de `apps/api`; faltan perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad. | `intent-capture-questions.md` |
| IC-Q3 | A — personas que escuchan música y quieren compartir y leer opiniones con otros oyentes. | `intent-capture-questions.md` |
| IC-Q4 | D (A y B) — éxito funcional con interacciones vistas desde un segundo dispositivo y contenido que no se pierde al reinstalar o cambiar de teléfono. | `intent-capture-questions.md` |
| IC-Q5 | C — disparador técnico: la lógica y los datos no pueden seguir viviendo dentro de la app. | `intent-capture-questions.md` |
| IC-Q6 | B — propietario del producto y equipo de desarrollo; al equipo le importan mantenimiento, pruebas y CI. | `intent-capture-questions.md` |
| IC-Q7 | A — decide el propietario; no hay reporte más allá de las aprobaciones de este trabajo. | `intent-capture-questions.md` |
| IC-Q8 | A, B, C — fuera: tokens de Spotify y audio, tiendas y compilación en la nube, panel de administración, moderación y roles. | `intent-capture-questions.md` |
| IC-CONF | Consolidated summary aceptado como `Looks correct`; supuestos aceptados. | `intent-capture-questions.md` |

El primer veredicto de `aidlc-product-lead-agent` fue `NOT-READY` con ocho hallazgos; el gate se aprobó después de resolver el límite del producto, la influencia del equipo y la métrica funcional. Quedó registrado como Risk/Aware para el traspaso.

## Investigación de mercado

| ID | Decisión | Origen |
|---|---|---|
| MR-Q1 | B — competencia principal: apps dedicadas a valorar música y discos. | `market-research-questions.md` |
| MR-Q2 | A, B — mínimos: cuenta, publicar, ver lo de otros, me gusta, comentar, seguir y catálogo de Spotify; diferenciadores: opinión breve y comunidad con feed. | `market-research-questions.md` |
| MR-Q3 | A, B — exigencias externas: privacidad con cuentas reales y términos de la API de Spotify. | `market-research-questions.md` |
| MR-Q4 | A — construir sobre lo ya existente en `apps/api`. | `market-research-questions.md` |
| MR-Q5 | D — sin objetivo de tamaño de audiencia; basta con que funcione para quien la pruebe. | `market-research-questions.md` |
| MR-CONF | Consolidated summary aceptado como `Looks correct`. | `market-research-questions.md` |

## Viabilidad y restricciones

| ID | Decisión | Origen |
|---|---|---|
| F-Q1 | A — servicio y Postgres solo en el portátil con Docker; sin despliegue. | `feasibility-questions.md` |
| F-Q2 | X — Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), México. | `feasibility-questions.md` |
| F-Q3 | A — contenido simulado de los teléfonos descartado; cada cuenta empieza de cero. | `feasibility-questions.md` |

## Definición del alcance

| ID | Decisión | Origen |
|---|---|---|
| SD-Q1 | A — MVP completo: cuentas, publicar, comentar, me gusta, seguir, feed y actividad. | `scope-definition-questions.md` |
| SD-Q2 | A — backend, contratos y app conectada al servicio real, con respaldo local de solo lectura. | `scope-definition-questions.md` |
| SD-Q3 | C — orden por dependencias: datos y contratos, contenido, interacciones. | `scope-definition-questions.md` |
| SD-Q4 | A — verificación con dos dispositivos reales en la misma red local. | `scope-definition-questions.md` |
| SD-Q5 | B — hay fecha de demostración, pero no reduce capacidades. | `scope-definition-questions.md` |

## Formación del equipo

| ID | Decisión | Origen |
|---|---|---|
| TF-Q1 | C — equipo pequeño de tres o cuatro personas, en roles sin nombres. | `team-formation-questions.md` |
| TF-Q2 | B — dedicación reservada de 10 a 20 horas semanales. | `team-formation-questions.md` |
| TF-Q3 | C — backend, app móvil y calidad cubiertos. | `team-formation-questions.md` |
| TF-Q4 | B — hay otra iniciativa, pero este intento tiene prioridad. | `team-formation-questions.md` |
| TF-Q5 | C — decisiones por consenso del equipo en cada fase. | `team-formation-questions.md` |
| TF-Q6 | A — ejecución individual de unidades con revisiones en gates; sin mob. | `team-formation-questions.md` |

## Maquetas conceptuales

| ID | Decisión | Origen |
|---|---|---|
| RM-Q1 | A — contexto con app en dos dispositivos, servicio local y base de datos; Spotify y respaldo local como externos, sin tokens en el servicio. | `rough-mockups-questions.md` |
| RM-Q2 | A — caminos de fallo: sin sesión válida, sin conexión al servicio local y feed vacío, con recuperación. | `rough-mockups-questions.md` |
| RM-Q3 | A — privacidad como recorrido propio: consentimiento al alta, borrado y retención sobre opiniones e interacciones. | `rough-mockups-questions.md` |
| RM-REV | Veredicto `READY` con R-01 y R-02 menores; el gate los aceptó como riesgo. | `rough-mockups/reviews/review-01.md` |

## Aprobación y traspaso

| ID | Decisión | Origen |
|---|---|---|
| AH-Q1 | A — aprobar el traspaso: I-03 pasa a Requirements Analysis, I-04 se comprueba en Reverse Engineering y R-01/R-02 de las maquetas quedan como riesgo aceptado. | `approval-handoff-questions.md` |
| AH-GO | Recomendación `GO` a Inception sin reabrir el alcance aprobado. | `initiative-brief.md` |

## Contradicciones resueltas

- La normativa pasó de RGPD asumido a LFPDPPP confirmada; el RGPD queda solo como referencia prudente (I-01, F-Q2).
- El contenido local de los teléfonos pasó de duda abierta a descarte sin migración (I-02, F-Q3).
- La métrica del segundo dispositivo se cerró con dos dispositivos reales en la misma red local, sin servidor ni túnel (R-04, SD-Q4).
- El equipo pequeño que decide por consenso y la ejecución individual se declararon compatibles: las decisiones se revisan en gates, no se hace mob (TF-Q5, TF-Q6).
- El tiempo real y el chat, que quedaron fuera de la selección inicial de IC-Q8, se mantienen fuera del alcance mediante CT-05 y la frontera del MVP.
- La ausencia de moderación se mantiene como decisión explícita de esta versión; no se añaden roles ni capacidades de administración.

## Riesgos y temas abiertos que viajan a Inception

- I-03: plazos concretos de consentimiento, borrado y retención bajo LFPDPPP → Requirements Analysis.
- I-04: comprobación del estado real de `apps/api` y `packages/contracts` → Reverse Engineering.
- R-01/R-02 de `rough-mockups/reviews/review-01.md`: persistencia visible tras reinstalar/cambiar teléfono y destino del contenido publicado al borrar una cuenta → riesgo aceptado en el handoff.
- R-01 a R-05 de `raid-log.md`: mitigaciones registradas; ninguna bloquea el traspaso.

## Reglas arrastradas

- El backend, la autenticación real y la persistencia en servidor están permitidos solo para este intento; el client secret de Spotify sigue prohibido y PKCE permanece en la app.
- Toda decisión posterior debe conservar el alcance SC-01 a SC-10 / IB-01 a IB-11 y las restricciones CT-01 a CT-09 salvo aprobación explícita.
