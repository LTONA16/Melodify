# Trazabilidad entre unidades — Melodify

> Etapa: Build and Test · Intento: `261105-melodify-mobile-app` · Fecha: 2026-11-21
> Fuente: `aidlc engine sensor-traceability --stage build-and-test` (exit 0, `pass: false`)
> Alcance: los seis `traceability.json` de `construction/*/code-generation/` y los criterios de `inception/requirements-analysis/requirements.md` y `inception/user-stories/stories.md`.

> **Corrección 2026-11-21 (CI Pipeline):** la causa B se cerró re-registrando `AC1.3.1` en U2 y `AC9.1.8` en U4. El sensor volvió a correr: **32 → 21 IDs sin cubrir**, todos de la causa A. El análisis de abajo es el estado original de Build and Test; la cifra vigente está en `verification/phase-check-construction.md`.

## Veredicto

**FALLA — con matiz.** El sensor devuelve `pass: false`: de **197 identificadores** trazados, **165 están cubiertos** y **32 no**. Ninguno de los 32 es un hueco de código nuevo; se reparten en dos causas, y solo una de ellas exige trabajo:

| Causa | IDs | Qué significa | Quién lo cierra |
|---|---|---|---|
| **A. Recorrido manual de U6 pendiente de ejecución** | 20 | Los criterios de la versión (AC11.x) y los FR/NFR que cuelgan de ellos siguen `Deferred` porque los cuatro registros `walkthrough-p*.md` son plantillas sin ejecutar | La persona, en Android físico con Expo Go |
| **B. Criterio construido y probado, pero no reclamado por ninguna unidad** | 2 AC + 10 FR | AC1.3.1 y AC9.1.8 funcionan y tienen prueba; el hueco es que `traceability.json` no los recoge (cada unidad los difirió a la siguiente y la última no los adoptó) | Una corrección de registro en la trazabilidad de las unidades, no de código |

**No hay ningún criterio que se declare cubierto sin serlo**, y **no hay ningún criterio `Deferred` que se haya contado como `Met`**. Presentar los 20 de la causa A como cubiertos sería falso: la app no se ha recorrido en el teléfono.

## Cobertura por familia

| Familia | Total | Cubiertos | Sin cubrir |
|---|---|---|---|
| Requisitos funcionales (FR) | 72 | 56 | 16 |
| Grupos de NFR | 9 | 3 (NFR5, NFR6, NFR7) | 6 (NFR1, NFR2, NFR3, NFR4, NFR8, NFR9) |
| Criterios de aceptación (AC) | 116 | 106 | 10 |
| **Total** | **197** | **165** | **32** |

## Elementos sin cubrir

| ID | Causa | Estado real | Dónde está lo que falta |
|---|---|---|---|
| AC11.1.1 | A | Plantilla sin ejecutar | `construction/u6-walkthrough/code-generation/walkthrough-p1.md` (y P2 en oscuro) |
| AC11.1.2 | A | Plantilla sin ejecutar | `walkthrough-p1.md`, `walkthrough-p2.md` |
| AC11.1.3 | A | Plantilla sin ejecutar | `walkthrough-p1.md`, `walkthrough-p2.md` |
| AC11.1.4 | A | Plantilla sin ejecutar | `walkthrough-p1.md`, `walkthrough-p2.md` |
| AC11.1.5 | A | Plantilla sin ejecutar | `walkthrough-p1.md`, `walkthrough-p2.md` |
| AC11.2.1 | A | Plantilla sin ejecutar | `walkthrough-p3.md`, `walkthrough-p4.md` |
| AC11.2.2 | A | Plantilla sin ejecutar | `walkthrough-p3.md`, `walkthrough-p4.md` |
| AC11.2.3 | A | Plantilla sin ejecutar | `walkthrough-p3.md`, `walkthrough-p4.md` |
| FR2.4 | A | Cuelga de AC11.1.1–AC11.1.5 | Recorrido P1/P2 |
| FR10.4 | A | Cuelga de AC11.2.1–AC11.2.3 | Recorrido P3/P4 |
| FR11.2 | A | Cuelga de AC11.1.1–AC11.1.5 | Recorrido P1/P2 |
| FR11.5 | A | Cuelga de AC11.1.1–AC11.1.5 | Recorrido P1/P2 |
| FR12.1 | A | Cuelga de AC11.1.x y AC11.2.x | Recorrido P1–P4 |
| FR12.2 | A | Cuelga de AC11.1.x y AC11.2.x | Recorrido P1–P4 |
| FR11.1 | A + B | Cuelga de AC9.1.8 y de AC11.1.x | Registro de AC9.1.8 + recorrido |
| FR11.6 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR3.7 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR9.1 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR9.2 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR9.4 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR9.5 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR9.6 | B | Cuelga de AC9.1.8 | Registro de AC9.1.8 |
| FR1.5 | B | Cuelga de AC1.3.1 | Registro de AC1.3.1 |
| FR9.3 | B | Cuelga de AC1.3.1 | Registro de AC1.3.1 |
| NFR1 | A | Cierra por las entradas de U6 (`NFR1.18`, `NFR1.19`, `NFR1.20`), que siguen `Deferred` | Recorrido P1–P4 |
| NFR2 | A | Ídem (`NFR2.14`, `NFR2.15`) | Recorrido P1–P4 |
| NFR3 | A | Ídem (`NFR3.18`, `NFR3.24`, `NFR3.25`) | Recorrido P1–P4 |
| NFR4 | A | Ídem (`NFR4.12`) | Recorrido P1–P4 |
| NFR8 | A | Ídem (`NFR8.1`, `NFR8.18`, `NFR8.19`, `NFR8.20`) | Recorrido P1–P4 + cronómetro de NFR8.1 |
| NFR9 | A | Ídem (`NFR9.9`) | Recorrido P1–P4 |
| AC1.3.1 | B | **Construido y probado**: Perfil cierra sesión sobre la instancia única y `App` vuelve a Login | `app/src/screens/perfil/__tests__/perfil-screen.test.tsx`; `app/src/bootstrap/__tests__/app-session-wiring.test.tsx` |
| AC9.1.8 | B | **Construido y probado**: `SpotifyCard` de seis estados en Perfil, con conexión y desconexión | `packages/design-system/src/__tests__/spotify-card.test.tsx`; `app/src/screens/perfil/__tests__/perfil-view.test.tsx`; `app/src/state/__tests__/use-spotify-connection.test.tsx` |

### Detalle de la causa B

| ID | Unidad que lo construyó | Qué dijo su `traceability.json` |
|---|---|---|
| AC1.3.1 | U1 entrega la suscripción; U2 construye Perfil con «Cerrar sesión» | U1: `Deferred` → «el botón vive en Perfil y esa pantalla llega con U2». U2 no lo recogió |
| AC9.1.8 | U4 construye la tarjeta de Spotify de Perfil | U2: `Deferred` → «llega con U4». U4 no lo recogió |

Ambos criterios están demostrados por pruebas que corren en la suite completa. Lo que falta es que la unidad que los construyó los reclame en su `traceability.json`; eso es una corrección de registro en Code Generation, no un cambio de comportamiento.

## Elementos cubiertos

### Criterios de aceptación (106)

| Criterios | Archivo que los construye / prueba |
|---|---|
| AC1.1.1, AC1.1.2, AC1.1.3 | `app/src/screens/login/__tests__/login-screen.test.tsx` |
| AC1.1.4, AC1.2.2 | `packages/app-shell/src/__tests__/app-shell.test.tsx` |
| AC1.2.1, AC1.2.3, AC1.3.2, AC1.3.4, AC2.3.1, AC7.2.1 | `app/src/bootstrap/__tests__/app-bootstrap.test.tsx` |
| AC1.3.3 | `packages/app-session/src/__tests__/app-session.test.ts` |
| AC2.1.1 | `app/src/screens/inicio/__tests__/inicio-screen.test.tsx` |
| AC2.1.2, AC2.1.4, AC2.1.5, AC2.1.6 | `app/src/screens/inicio/__tests__/inicio-view.test.tsx` |
| AC2.1.3 | `packages/content-store/src/__tests__/writes.test.ts` |
| AC2.2.1, AC3.1.4, AC3.1.5, AC3.1.7 | `app/src/screens/explorar/ExplorarView.tsx` |
| AC2.2.2, AC2.2.4 | `app/src/screens/inicio/__tests__/inicio-view.test.tsx` + `app/src/screens/explorar/ExplorarView.tsx` |
| AC2.2.3 | `packages/design-system/src/__tests__/opinion-card.test.tsx` + `app/src/screens/explorar/ExplorarView.tsx` |
| AC2.3.2 | `packages/app-shell/src/__tests__/stack.test.tsx` |
| AC2.3.3 | `app/src/screens/detalle-opinion/__tests__/detalle-opinion.test.tsx` |
| AC3.1.1, AC3.2.4 | `app/src/state/useWorkSearch.ts` |
| AC3.1.2, AC3.1.3 | `packages/design-system/src/components/WorkResultRow.tsx` |
| AC3.1.6 | `packages/catalog/src/catalog.ts` |
| AC3.1.8 | `packages/app-shell/src/AppShell.tsx` |
| AC3.2.1, AC3.2.2, AC3.2.3 | `packages/spotify/src/catalog/spotify-catalog.ts` |
| AC4.1.1–AC4.1.6, AC4.2.2, AC4.2.3, AC4.3.1, AC4.3.3, AC5.2.4 | `app/src/screens/detalle-obra/__tests__/detalle-obra-view.test.tsx` |
| AC4.2.1, AC4.2.4, AC6.1.4 | `packages/design-system/src/__tests__/own-opinion.test.tsx` |
| AC4.3.2 | `app/src/screens/detalle-obra/__tests__/detalle-obra-screen.test.tsx` |
| AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4, AC5.1.6, AC5.2.2, AC5.2.3, AC5.3.1, AC5.3.2, AC5.3.4, AC6.1.1, AC6.1.3, AC6.1.5 | `app/src/screens/crear/__tests__/crear-screen.test.tsx` |
| AC5.1.5 | `app/src/state/__tests__/use-work-search.test.ts` |
| AC5.2.1, AC6.1.2 | `app/src/screens/crear/__tests__/crear-view.test.tsx` |
| AC5.3.3 | `packages/app-shell/src/__tests__/create-close.test.tsx` |
| AC7.1.1–AC7.1.4, AC7.3.1, AC7.3.2, AC7.3.4 | `app/src/state/__tests__/use-card-actions.test.tsx` |
| AC7.2.2, AC7.2.3, AC7.2.4, AC7.2.5 | `packages/design-system/src/__tests__/comment-sheet.test.tsx` |
| AC7.2.6 | `app/src/comments/__tests__/comments-controller.test.ts` |
| AC7.3.3, AC9.1.4 | `app/src/screens/perfil/__tests__/perfil-screen.test.tsx` |
| AC8.1.1, AC8.1.2 | `packages/activity/src/derive.ts` |
| AC8.1.3 | `packages/activity/src/activity.ts` |
| AC8.1.4 | `app/src/screens/actividad/ActividadScreen.tsx` |
| AC8.1.5, AC8.1.6, AC8.1.7 | `app/src/screens/actividad/ActividadView.tsx` |
| AC9.1.1, AC9.1.2, AC9.1.3, AC9.1.5, AC9.1.6, AC9.1.7 | `app/src/screens/perfil/__tests__/perfil-view.test.tsx` |
| AC10.1.1 | `packages/spotify/src/auth/pkce.ts` |
| AC10.1.2, AC10.1.5 | `packages/spotify/src/auth/spotify-auth.ts` |
| AC10.1.3, AC10.1.4 | `packages/spotify/src/auth/token.ts` |
| AC10.1.6, AC10.2.1–AC10.2.5 | `packages/design-system/src/components/SpotifyCard.tsx` |

### Requisitos funcionales (56)

| FR | Cobertura | Criterios que lo cubren |
|---|---|---|
| FR1.1 | ✅ | AC1.1.1, AC1.1.2, AC1.1.3, AC1.1.4 |
| FR1.2 | ✅ | AC1.1.1, AC1.1.2, AC1.1.3, AC1.1.4 |
| FR1.3 | ✅ | AC1.1.1, AC1.1.2, AC1.1.3, AC1.1.4 |
| FR1.4 | ✅ | AC1.2.1, AC1.2.2, AC1.2.3 |
| FR1.6 | ✅ | AC1.1.1, AC1.1.2, AC1.1.3, AC1.1.4 |
| FR2.1 | ✅ | AC1.2.1, AC1.2.2, AC1.2.3 |
| FR2.2 | ✅ | AC1.2.1, AC1.2.2, AC1.2.3 |
| FR2.3 | ✅ | AC2.3.1, AC2.3.2, AC2.3.3, AC4.1.1 … (+5) |
| FR3.1 | ✅ | AC2.1.1, AC2.1.2, AC2.1.3, AC2.1.4 … (+2) |
| FR3.2 | ✅ | AC2.1.1, AC2.1.2, AC2.1.3, AC2.1.4 … (+2) |
| FR3.3 | ✅ | AC2.1.1, AC2.1.2, AC2.1.3, AC2.1.4 … (+2) |
| FR3.4 | ✅ | AC2.2.1, AC2.2.2, AC2.2.3, AC2.2.4 |
| FR3.5 | ✅ | AC2.1.1, AC2.1.2, AC2.1.3, AC2.1.4 … (+6) |
| FR3.6 | ✅ | AC2.1.1, AC2.1.2, AC2.1.3, AC2.1.4 … (+2) |
| FR3.8 | ✅ | AC2.3.1, AC2.3.2, AC2.3.3 |
| FR4.1 | ✅ | AC3.1.1, AC3.1.2, AC3.1.3, AC3.1.4 … (+4) |
| FR4.2 | ✅ | AC3.1.1, AC3.1.2, AC3.1.3, AC3.1.4 … (+4) |
| FR4.3 | ✅ | AC3.1.1, AC3.1.2, AC3.1.3, AC3.1.4 … (+4) |
| FR4.4 | ✅ | AC3.1.1, AC3.1.2, AC3.1.3, AC3.1.4 … (+4) |
| FR4.5 | ✅ | AC3.2.1, AC3.2.2, AC3.2.3, AC3.2.4 |
| FR4.6 | ✅ | AC3.1.1, AC3.1.2, AC3.1.3, AC3.1.4 … (+4) |
| FR5.1 | ✅ | AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4 … (+2) |
| FR5.2 | ✅ | AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4 … (+2) |
| FR5.3 | ✅ | AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4 … (+6) |
| FR5.4 | ✅ | AC5.3.1, AC5.3.2, AC5.3.3, AC5.3.4 |
| FR5.5 | ✅ | AC5.3.1, AC5.3.2, AC5.3.3, AC5.3.4 |
| FR5.6 | ✅ | AC5.2.1, AC5.2.2, AC5.2.3, AC5.2.4 |
| FR5.7 | ✅ | AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4 … (+6) |
| FR6.1 | ✅ | AC5.1.1, AC5.1.2, AC5.1.3, AC5.1.4 … (+7) |
| FR6.2 | ✅ | AC4.2.1, AC4.2.2, AC4.2.3, AC4.2.4 … (+5) |
| FR6.3 | ✅ | AC6.1.1, AC6.1.2, AC6.1.3, AC6.1.4 … (+1) |
| FR6.4 | ✅ | AC4.2.1, AC4.2.2, AC4.2.3, AC4.2.4 … (+5) |
| FR6.5 | ✅ | AC4.1.1, AC4.1.2, AC4.1.3, AC4.1.4 … (+6) |
| FR6.6 | ✅ | AC4.3.1, AC4.3.2, AC4.3.3 |
| FR6.7 | ✅ | AC4.1.1, AC4.1.2, AC4.1.3, AC4.1.4 … (+2) |
| FR6.8 | ✅ | AC4.2.1, AC4.2.2, AC4.2.3, AC4.2.4 |
| FR6.9 | ✅ | AC4.1.1, AC4.1.2, AC4.1.3, AC4.1.4 … (+5) |
| FR7.1 | ✅ | AC7.1.1, AC7.1.2, AC7.1.3, AC7.1.4 |
| FR7.2 | ✅ | AC7.2.1, AC7.2.2, AC7.2.3, AC7.2.4 … (+2) |
| FR7.3 | ✅ | AC7.2.1, AC7.2.2, AC7.2.3, AC7.2.4 … (+2) |
| FR7.4 | ✅ | AC7.3.1, AC7.3.2, AC7.3.3, AC7.3.4 |
| FR7.5 | ✅ | AC7.2.1, AC7.2.2, AC7.2.3, AC7.2.4 … (+2) |
| FR7.6 | ✅ | AC7.1.1, AC7.1.2, AC7.1.3, AC7.1.4 … (+10) |
| FR8.1 | ✅ | AC7.1.1, AC7.1.2, AC7.1.3, AC7.1.4 … (+7) |
| FR8.2 | ✅ | AC8.1.1, AC8.1.2, AC8.1.3, AC8.1.4 … (+3) |
| FR8.3 | ✅ | AC8.1.1, AC8.1.2, AC8.1.3, AC8.1.4 … (+3) |
| FR8.4 | ✅ | AC8.1.1, AC8.1.2, AC8.1.3, AC8.1.4 … (+3) |
| FR10.1 | ✅ | AC10.1.1, AC10.1.2, AC10.1.3, AC10.1.4 … (+2) |
| FR10.2 | ✅ | AC10.1.1, AC10.1.2, AC10.1.3, AC10.1.4 … (+2) |
| FR10.3 | ✅ | AC10.1.1, AC10.1.2, AC10.1.3, AC10.1.4 … (+7) |
| FR10.5 | ✅ | AC10.2.1, AC10.2.2, AC10.2.3, AC10.2.4 … (+1) |
| FR10.6 | ✅ | AC10.1.1, AC10.1.2, AC10.1.3, AC10.1.4 … (+2) |
| FR10.7 | ✅ | AC10.2.1, AC10.2.2, AC10.2.3, AC10.2.4 … (+1) |
| FR10.8 | ✅ | AC10.1.1, AC10.1.2, AC10.1.3, AC10.1.4 … (+2) |
| FR11.3 | ✅ | AC2.2.1, AC2.2.2, AC2.2.3, AC2.2.4 |
| FR11.4 | ✅ | AC2.2.1, AC2.2.2, AC2.2.3, AC2.2.4 … (+8) |

### Grupos de NFR (3)

| Grupo | Cobertura | Cómo se cierra |
|---|---|---|
| NFR5 — Mantenibilidad | ✅ | 5 objetivos de unidad (`NFR5.1–NFR5.4` de U1, `NFR5.12` de U5) |
| NFR6 — Accesibilidad | ✅ | 9 objetivos de unidad (`NFR6.1–NFR6.4`, `NFR6.6`, `NFR6.10`) |
| NFR7 — Compatibilidad con Expo Go | ✅ | 4 objetivos de unidad (`NFR7.1–NFR7.3`, `NFR7.8`) |

## Qué se lleva a la puerta de aprobación

1. **Los 20 identificadores de la causa A no se pueden cerrar desde aquí.** Exigen ejecutar P1–P4 en el teléfono. Mientras no se ejecuten, la versión no cumple su criterio de terminado, por mucho que la suite esté en verde.
2. **AC1.3.1 y AC9.1.8 están construidos y probados pero sin reclamar** en `traceability.json`; arrastran 10 FR. Es un defecto de registro de Code Generation, no de la app. Se puede corregir en una revisión de las unidades sin tocar código.
3. **Ningún ID se declara cubierto sin evidencia**: los 165 cubiertos apuntan a un archivo real del árbol o a un criterio que sí lo está.
