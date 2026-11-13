<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-06T00:39:37Z — la entrevista separó la práctica permanente del equipo de la decisión de este intento; el walking skeleton queda fuera de `team.md` como obligación y dentro del alcance `mvp` de este trabajo, tal como se escribió en Q3 y Q10.
- 2026-11-06T00:39:37Z — con `develop` como rama de integración (Q1 = C) hubo que añadir Q9 para fijar dónde aterrizan los Bolts; se escribió en `team-practices.md` que la base y el destino son `develop` y que la entrega es un squash a `main`, porque de ahí dependen Delivery Planning y la configuración de worktree.

## Deviations
- 2026-11-06T00:39:37Z — el borrador del lead proponía retirar `develop`; la persona eligió conservarla como rama de integración, así que se reescribió `## Way of Working` en contra del default de `org.md` (trunk-based sobre `main`).

## Tradeoffs
- 2026-11-06T00:39:37Z — se preguntaron dos seguimientos (Q9, Q10) en lugar de aceptar las respuestas de Q1 y Q3 tal cual; ambas cambiaban la mecánica de Construction y dejarlas sin resolver habría producido un `team.md` incoherente con el plan del intento.

## Open questions
- 2026-11-06T00:39:37Z — el comando de verificación de Construction del primer tramo sigue sin elegir; se fija al entrar a Construction.
- 2026-11-06T00:39:37Z — el README describe React Native con `npm run android` mientras el proyecto corre en Expo Go; queda desactualizado hasta que exista `app/`.
