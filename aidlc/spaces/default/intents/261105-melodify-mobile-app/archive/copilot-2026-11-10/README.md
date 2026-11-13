# Artefactos de la sesión de Copilot (10–11 nov 2026)

Estos archivos se generaron en una sesión de GitHub Copilot que **no quedó registrada** en
`aidlc-state.md` ni en `audit/lion-6140fbf90a77.md`. Se movieron aquí el 2026-11-10 para que no
se confundan con lo que genere el motor al entrar de verdad a Construction.

## Qué contienen

- `construction/functional-design/`, `construction/nfr-requirements/`, `construction/nfr-design/`:
  los diarios de etapa que creó el motor.
- `construction/u1-app-skeleton/`: lo único trabajado en esa sesión — Functional Design
  (2 revisiones), NFR Requirements (4 revisiones) y NFR Design (1 revisión) de la unidad U1.

## Por qué están aparte

- La etapa Delivery Planning nunca se reportó: el estado del workflow sigue en esa etapa.
- El intento de aprobar `nfr-requirements` a nivel de etapa fue rechazado por el motor
  («6 of 6 work items are not complete»), y de U2 a U6 no existe nada.
- La auditoría no tiene eventos de Construction: el último `write-audit-log` es del 9 de nov, 23:47.

## Cómo usarlos

Como referencia, no como registro. Al cerrar Delivery Planning y entrar a Construction, el motor
creará sus propios artefactos en `construction/`. Si algo de aquí sirve —sobre todo el reparto de
componentes y las decisiones de stack de U1— se copia al artefacto nuevo cuando se genere.

**No se movió nada más**: los cuatro artefactos de Delivery Planning y
`verification/phase-check-inception.md` siguen en su sitio, porque pertenecen a esa etapa y se
corrigen, no se archivan.
