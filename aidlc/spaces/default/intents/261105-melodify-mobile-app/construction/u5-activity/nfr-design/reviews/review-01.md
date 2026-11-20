## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-20T02:16:40Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u5-activity/nfr-design/performance-design.md > NFR8.17, sección "Las cuatro lecturas de la siembra, contadas", tabla de lecturas y "Cómo se comprueba" | El diseño fija y verifica "cuatro lecturas" o "cuatro llamadas a C4", pero la propia tabla suma 1 `listOpinions` + 2 `listLikes` + 3 `listComments` = 6. `traceability.json` NFR8.17 repite "las cuatro lecturas", mientras el requisito de partida registra seis con el mismo desglose. Un desarrollador que siga la cifra escribirá una prueba que contradiga el algoritmo y el conteo real. | Corregir todas las cifras de NFR8.17 en `performance-design.md` y `traceability.json` a seis lecturas con la siembra, y dejar la comprobación alineada con el desglose 1 + 2 + 3 y con el requisito de origen. | New |
| R-02 | Major | aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u5-activity/nfr-design/security-design.md > NFR3.22, tabla "Qué viaja y qué se pinta, campo por campo", fila `actorHandle`, y "Amenazas de la unidad y qué las cierra", fila "La pantalla se convierte en un directorio de handles ajenos" | La tabla y el texto dicen que `actorHandle` llega a C1 y se copia al modelo de presentación, respaldado por C1 `ActivityEventSummary.actorHandle?` y R-38; la tabla de amenazas afirma lo contrario, "no llega a C1 ni al árbol". La prueba de privacidad queda ambigua: no se sabe si se debe comprobar la ausencia en el modelo o solo en el árbol renderizado. | Unificar el diseño: declarar que `actorHandle` viaja y llega opcionalmente a `ActivityEventSummary` pero que `ActivityRow` no lo pinta, y corregir la fila de amenazas y las comprobaciones para afirmar únicamente la ausencia en el árbol renderizado. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u5-activity/nfr-design/security-design.md > NFR3.22, filas `eventId` y `authorId` / `viewerId`, y "Riesgos asumidos y su porqué", fila `eventId` | El diseño afirma que `eventId` no llega a C1 y que no hay `authorId`, pero C1 declara `eventId`, la lista lo usa como clave y el propio diseño reconoce que el `eventId` de un me gusta codifica `<authorId>`. La redacción actual mezcla "no hay campo `authorId`" con "no viaja ningún identificador de autor". | Precisar que no se expone un campo `authorId` ni `viewerId`, pero que `eventId` es una clave estable que contiene el autor en los eventos de me gusta; indicar explícitamente que no se pinta ni se registra y ajustar las filas y comprobaciones afectadas. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u5-activity/nfr-design/performance-design.md > NFR1.16, diagrama Mermaid de estados y "Cómo se comprueba" | El diagrama no incluye la transición `ready → ready` ante una nueva emisión de contenido con eventos, aunque los requisitos de entrada y la máquina funcional la exigen; el texto describe recálculos, pero la fuente visual usada para implementar y probar transiciones carece de esa salida. | Añadir `ready → ready` al diagrama con la condición de emisión de C4 que sigue produciendo eventos, y citarla en la lista de transiciones que deben probarse. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Sin herramientas de validación listadas | No ejecutada | El frontmatter de la definición de etapa no enumera herramientas de validación; la revisión se hizo con lectura cruzada de artefactos y contratos consumidos. |

### Summary

El diseño NFR de U5 es implementable en términos generales: define límites claros, contención de fallos y un radio de impacto acotado a la pestaña Actividad. Los dos hallazgos Major son contradicciones internas que deben corregirse para que las cifras y las pruebas de privacidad no induzcan a implementar una versión distinta de la diseñada.
