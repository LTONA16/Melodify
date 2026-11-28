# Practices Discovery — Preguntas

> Re-ejecución brownfield del intent `261125-melodify-api-backend`. El borrador del release engineer ya estableció la mayoría de las prácticas desde `team.md`, `project.md`, CI, git y los artefactos de CodeKB. Estas preguntas cubren solo lo que la evidencia no pudo decidir.

## Q1. Way of Working — puerta de CI

El CI actual corre `commitlint`, `npm run typecheck`, `npm run lint` y `npm test` desde la raíz; `npm test` lanza solo Jest, mientras la suite de `apps/api` usa Vitest y hoy no bloquea el merge. ¿Qué debe considerarse la puerta de CI a partir de ahora?

A. Añadir un job de Vitest con PostgreSQL de prueba y `TEST_DATABASE_URL` antes de autorizar el merge; se convierte en práctica afirmada del equipo. (Recommended)

B. Mantener los cuatro chequeos actuales como puerta y dejar Vitest de `apps/api` como ejecución local, sin bloqueo de PR.

C. Sustituir `npm test` por una orden que ejecute Jest y Vitest juntos sobre la misma base local de prueba, y usar esa orden como puerta.

D. No cambiar el CI en este intento; diferir la decisión a Requirements Analysis o Build and Test.

X. Other (please specify)

[Answer]: A

## Q2. Walking Skeleton — primer tramo

¿Construir primero un corte mínimo que funcione de punta a punta? Un walking skeleton es una versión mínima que recorre todo el camino, hecha antes que las funciones reales para comprobar que las piezas encajan. El alcance `feature` lo tiene activado; falta confirmar la demostración concreta.

A. Confirmar la propuesta: crear cuenta real, publicar una opinión desde un dispositivo y verla en el segundo dispositivo en la misma red local, con el servicio y PostgreSQL levantados en el portátil. (Recommended)

B. Confirmar el recorrido propuesto, pero dejar que el comando exacto de verificación se registre más adelante en Construction, no ahora.

C. Usar un recorrido más corto: registro y acceso desde los dos dispositivos, sin publicar todavía.

D. No activar el checkpoint de esqueleto para este intento aunque el alcance lo declare.

X. Other (please specify)

[Answer]: A

## Q3. Testing Posture — cadencia y cobertura del servicio

La línea base afirma `test-after` y un 80 % de líneas sobre `app/src/**`. En `apps/api`, `vitest.config.mts` configura 80 % de líneas/sentencias/funciones y 70 % de ramas sobre `apps/api/src/**` sin `server.ts`, pero eso no está afirmado como regla. ¿Qué práctica se afirma para el servicio?

A. Mantener `test-after` para todo el repo y elevar los umbrales de Vitest a puerta de equipo junto al 80 % de la app. (Recommended)

B. Mantener `test-after`, pero dejar los umbrales de Vitest como configuración local del repositorio, no como regla afirmada.

C. Usar TDD para autenticación y reglas de contenido del servicio, y `test-after` para el resto; se registraría como `custom`.

D. Mantener solo `test-after` y decidir los umbrales del servicio en Build and Test.

X. Other (please specify)

[Answer]: A

## Q4. Deployment — permanencia y rollback de esquema

`team.md` dice que no hay despliegue y describe rollback por `git revert` con contenido en memoria; este intento tiene PostgreSQL y migraciones. ¿Qué se afirma como práctica?

A. Mantener «sin entornos remotos, staging, nube ni túneles» como regla permanente; ante un cambio de esquema, revertir el squash y aplicar una migración de reversión revisada, autorizada por quien aprueba el PR. (Recommended)

B. Tratar la ausencia de entornos remotos como decisión solo de este intento; dejar el rollback de esquema para cuando aparezca la primera migración real.

C. Mantener la regla permanente de no despliegue remoto y revertir esquema restaurando una copia local de PostgreSQL, sin autorización adicional.

D. No tocar `team.md`; documentar PostgreSQL como excepción de este intento y conservar el texto actual de rollback.

X. Other (please specify)

[Answer]: A

## Q5. Code Style — pieza compartida y Swagger

Dos detalles no están resueltos: `team.md` sitúa la tarjeta de opinión compartida en `app/src/components/`, mientras los artefactos de código la sitúan en el paquete de UI; y los artefactos dicen que Swagger UI se sirve solo fuera de producción. ¿Qué se afirma?

A. La tarjeta compartida vive en `app/src/components/` y Swagger solo fuera de producción es comportamiento estable. (Recommended)

B. La tarjeta compartida vive en el paquete de UI y Swagger solo fuera de producción queda como detalle de implementación, no como regla.

C. La tarjeta compartida vive en el paquete de UI y Swagger solo fuera de producción se eleva a regla de equipo.

D. Mantener `team.md` tal cual y corregir el código o la documentación en otro cambio; no afirmar nada nuevo ahora.

X. Other (please specify)

[Answer]: A
