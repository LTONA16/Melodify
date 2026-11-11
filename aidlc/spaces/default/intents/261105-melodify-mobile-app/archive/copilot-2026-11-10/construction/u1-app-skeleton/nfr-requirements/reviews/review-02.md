## Review

**Verdict:** NOT-READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-11T06:02:54Z
**Iteration:** 2
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | `construction/u1-app-skeleton/nfr-requirements/reliability-requirements.md` > NFR1.4; `construction/u1-app-skeleton/nfr-requirements/security-requirements.md` > NFR3.3; `inception/contract-design/contract-summary.md` > C3 `/session/sign-out` | El NFR exige que un fallo al borrar la sesión conserve la sesión y permita reintentar, pero C3 solo define `signOut` con respuesta `204` de éxito y no define una respuesta de error ni su semántica. El desarrollador no puede implementar ni probar de forma contractual la rama de fallo sin inventar el protocolo. | Añadir a C3 el resultado de error de borrado (incluido su estado/forma y comportamiento de reintento) y alinear NFR1.4/NFR3.3 con esa forma. | Unresolved |
| R-02 | Major | `construction/u1-app-skeleton/nfr-requirements/traceability.json` > `coverage` de NFR5 y NFR6; `construction/u1-app-skeleton/nfr-requirements/tech-stack-decisions.md` > NFR5.1; `construction/u1-app-skeleton/nfr-requirements/security-requirements.md` > NFR6.1; `inception/requirements-analysis/requirements.md` > NFR5 y NFR6 | La cobertura declara `OK` para NFR5 y NFR6, pero los derivados no cubren todos los compromisos upstream: NFR5.1 omite explícitamente el umbral de cobertura de líneas del 80 %, y NFR6.1 omite los contrastes mínimos 4.5:1/3:1. La matriz tampoco ofrece objetivos derivados para esas partes. La trazabilidad NFR1–NFR9 no es completa aunque el JSON la marque completa. | Crear requisitos derivados verificables para el 80 % de cobertura y ambos umbrales de contraste (o justificar formalmente una exclusión de U1), añadirlos a los objetivos de `traceability.json` y definir cómo se verifican. | Resolved (reviewer) |
| R-03 | Major | `construction/u1-app-skeleton/nfr-requirements/performance-requirements.md` > NFR8.1–NFR8.3 y sus verificaciones | Los umbrales de arranque de 3 s, interacción de 100 ms en 19/20 casos y navegación posterior al guardado de 500 ms se presentan como medibles en Expo Go, pero la verificación indicada es cronometraje/checklist manual y una prueba de render; no define puntos de medida, instrumento, condiciones del teléfono/red/Metro ni cómo demostrar 19/20. Además, el arranque con Expo Go y Metro introduce variabilidad externa que puede hacer que 3 s no sea un objetivo reproducible. Así no se puede distinguir una regresión de ruido del entorno ni confirmar el SLO de forma implementable. | Sustituir estos objetivos por límites reproducibles para el entorno de Expo Go (por ejemplo, medición instrumentada local con condiciones y percentiles definidos) o rebajar/justificar los umbrales y documentar un protocolo de medición repetible, incluyendo inicio/fin y criterios de aceptación. | Unresolved |
| R-04 | Minor | `construction/u1-app-skeleton/nfr-requirements/scalability-requirements.md` > NFR8.7 | NFR8.7 impone a unidades posteriores que no cambien límites de U1 ni introduzcan infraestructura. Es una obligación de diseño fuera del alcance de esta unidad, no un NFR de escalabilidad verificable de U1, y puede entrar en conflicto con contratos C4/C5 que son propiedad de otras unidades. | Retirar NFR8.7 del conjunto de NFR de U1 o convertirlo en una decisión/contrato compartido explícitamente aprobado, sin atribuir a U1 la obligación de las unidades posteriores. | Resolved (reviewer) |
| R-05 | Major | `inception/requirements-analysis/requirements.md` > NFR8; `construction/u1-app-skeleton/nfr-requirements/performance-requirements.md` > NFR8.1–NFR8.3 | El upstream fija que NFR8 no tiene objetivos numéricos en esta versión y que el criterio es recorrer sin errores, mientras U1 introduce límites de 3 s, 100 ms y 500 ms y los presenta como requisitos obligatorios. La trazabilidad marca NFR8 como `OK`, pero no resuelve esta contradicción de alcance. | Alinear ambos artefactos: o retirar los tres SLO numéricos y conservar solo el criterio upstream, o actualizar/aprobar explícitamente NFR8 upstream y su fuente de decisión antes de mantenerlos; después ajustar la trazabilidad y las verificaciones al texto elegido. | New |

> R-01 Reviewer note: `reliability-requirements.md` y `security-requirements.md` describen un `503` de borrado y conservación de sesión, pero `inception/contract-design/contract-summary.md` > C3 `/session/sign-out` sigue declarando únicamente `204`. La rama de fallo aún no tiene forma contractual.

> R-02 Reviewer note: `NFR5.2` declara explícitamente el 80 % de cobertura de líneas y `NFR6.2` declara los contrastes 4.5:1 y 3:1; ambos aparecen en los objetivos de `traceability.json`.

> R-03 Reviewer note: NFR8.1–NFR8.3 ahora tienen repeticiones y conteos, pero siguen sin constituir un protocolo reproducible: no fijan un evento de inicio/fin observable y uniforme, versión de Android/Expo Go, estado de caché, modo de conexión, condiciones de Metro ni el formato de evidencia. NFR8.2 permite indistintamente vídeo cuadro a cuadro o un monitor sin definir resolución, reloj ni criterio de latencia; NFR8.3 mezcla una prueba de integración con una repetición manual en Expo Go sin definir cuál demuestra el umbral.

> R-04 Reviewer note: NFR8.7 ya no aparece en `scalability-requirements.md`; no se atribuyen obligaciones a unidades posteriores.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Herramienta declarada por la etapa | No declarada | No había comando formal que ejecutar; la revisión se basó en lectura y cruce de artefactos. |
| Cruce de C3 con NFR1.4/NFR3.3 y Functional Design | FAIL | C3 no contiene el `503` de `signOut` que los NFR y el diseño funcional requieren. |
| Cruce de NFR5/NFR6 con requisitos derivados y `traceability.json` | PASS | El 80 % y los contrastes 4.5:1/3:1 están expresos, tienen verificación y están incluidos en los objetivos de cobertura. |
| Cruce de NFR8 y sus derivados | FAIL | `requirements.md` prohíbe objetivos numéricos para NFR8, pero los artefactos de U1 los introducen sin resolver la contradicción ni definir medición reproducible completa. |
| Comprobación de IDs y regresión de NFR8.7 | PASS | Los IDs derivados revisados son únicos y coherentes; NFR8.7 fue retirado y no se detectó una obligación explícita para unidades posteriores. |

### Summary

La cobertura de NFR5/NFR6 y la eliminación de NFR8.7 corrigen dos hallazgos previos. Siguen bloqueando la implementación la discrepancia contractual de `signOut`, la medición no reproducible en Expo Go y la contradicción entre el NFR8 upstream y los nuevos SLO numéricos.
