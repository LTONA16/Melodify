# Verificación de fase — Construction → Operation

> Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Fecha: 2026-11-21
> Etapa que la ejecuta: CI Pipeline (paso 5, verificación de frontera) · Agente: `aidlc-pipeline-deploy-agent`
> Insumos: `construction/build-and-test/cross-unit-traceability.md`, los seis `construction/u*/code-generation/traceability.json`, `construction/build-and-test/build-and-test-summary.md` y `construction/ci-pipeline/quality-gates.md`.

## Veredicto

**NO PASA — la transición Construction → Operation sigue bloqueada, pero por una sola causa.** El código está construido y probado y el CI está configurado y en verde. De **197 identificadores**, **176 están cubiertos (89,3 %)** y **21 no**. Los 21 restantes son todos el **recorrido manual de U6 pendiente de ejecución**; el hueco de registro de `AC1.3.1` y `AC9.1.8` se cerró en esta etapa y ya no cuenta.

El paso 5 de la etapa es explícito: «If any traceability file is missing or any unresolved finding remains, stop the Construction → Operation transition and revisit the owning stage.» Queda un hallazgo abierto, así que la transición se detiene aquí.

## Corrección aplicada en esta etapa

La persona eligió corregir la trazabilidad antes de seguir. Se aplicaron dos correcciones de **registro**, sin tocar código:

| ID | Dónde se reclamó | `target` |
|---|---|---|
| `AC1.3.1` | `u2-content-core/code-generation/traceability.json` (añadido a `upstream_ids` y `coverage`) | `app/src/screens/perfil/__tests__/perfil-screen.test.tsx` |
| `AC9.1.8` | `u4-spotify-explore/code-generation/traceability.json` (añadido a `coverage`) | `packages/design-system/src/__tests__/spotify-card.test.tsx` |

El sensor `aidlc engine sensor-traceability --stage build-and-test` volvió a correr tras la corrección: **32 → 21 IDs sin cubrir**, y los 11 cerrados son exactamente los 2 AC y los 9 FR que dependían solo de ellos (FR1.5, FR3.7, FR9.1, FR9.2, FR9.3, FR9.4, FR9.5, FR9.6, FR11.6). `FR11.1` sigue abierto porque también cuelga de AC11.1.x.

## Evidencia revisada

| Artefacto | Resultado |
|---|---|
| `construction/build-and-test/cross-unit-traceability.md` | `pass: false` original (32); corregido a 21 tras el re-registro |
| `construction/u1-app-skeleton/code-generation/traceability.json` | 56 filas: 1 `Deferred` justificada (`AC1.3.1`, ahora reclamada por U2), 1 `N/A` justificada (`NFR4.3`), resto `OK` |
| `construction/u2-content-core/code-generation/traceability.json` | `AC1.3.1` reclamada `OK`; siguen `Deferred` `AC2.2.1`, `AC9.1.8` (U4 la reclama), `NFR8.1` |
| `construction/u3-create-react/code-generation/traceability.json` | 88 filas: 1 `Deferred` justificada (`NFR8.1`), resto `OK` |
| `construction/u4-spotify-explore/code-generation/traceability.json` | `AC9.1.8` reclamada `OK`; 100 filas, todas `OK`, `reverse` vacío |
| `construction/u5-activity/code-generation/traceability.json` | 52 filas, todas `OK`, `reverse` vacío |
| `construction/u6-walkthrough/code-generation/traceability.json` | 42 filas `GAP` — el recorrido manual está preparado y **no ejecutado** |

## Cobertura por familia

| Familia | Total | Cubiertos | Sin cubrir |
|---|---|---|---|
| Requisitos funcionales (FR) | 72 | 65 | 7 |
| Grupos de NFR | 9 | 3 (NFR5, NFR6, NFR7) | 6 (NFR1, NFR2, NFR3, NFR4, NFR8, NFR9) |
| Criterios de aceptación (AC) | 116 | 108 | 8 |
| **Total** | **197** | **176 (89,3 %)** | **21** |

## Bloqueo único — Recorrido manual de U6 pendiente (21 IDs)

Los criterios de la versión (AC11.1.1–AC11.1.5 y AC11.2.1–AC11.2.3), los siete FR que cuelgan de ellos (FR2.4, FR10.4, FR11.1, FR11.2, FR11.5, FR12.1, FR12.2) y las seis filas de grupo NFR1, NFR2, NFR3, NFR4, NFR8 y NFR9 siguen `Deferred` porque los cuatro registros `walkthrough-p{1..4}.md` son plantillas con veredicto `Pendiente de ejecución manual`.

- **Unidad propietaria**: `u6-walkthrough` (Code Generation).
- **Quién lo cierra**: la persona, en **Android físico con Expo Go**, con Metro levantado y —para P3/P4— el client ID de Spotify y el panel aceptando el redirect de Expo Go.
- **Por qué no lo cierra esta etapa**: ninguna prueba automática sustituye el recorrido; `build-and-test-summary.md` ya lo registra como `Unverified` y `team.md` § Deployment lo define como el criterio de terminado de la versión.

## Lo que sí se cumple

- **Todas las unidades de código están construidas y probadas**: U1–U5 con sus suites en verde; U6 no produce código y su verificación es manual por diseño.
- **La suite completa pasa**: 97 suites, 826 pruebas, 0 fallos; `tsc -b` y `eslint .` limpios.
- **Los nueve suelos de cobertura** (80 % de líneas por árbol) se superan sin exclusiones nuevas.
- **El CI está configurado y en verde**: la corrida `44942753511` (commit `89ded53`) ejecuta commitlint → `npm ci` → `npm run typecheck` → `npm run lint` → `npm test` sin saltos (`ci-config.md` § Verificación del pipeline).
- **Las puertas del CI materializan lo que Build and Test declaró** (`quality-gates.md`): QG-2 … QG-5 cubren BT-01 … BT-13, y BT-13 pasa de `N/A` a `Met`.
- **El hueco de registro está cerrado**: `AC1.3.1` y `AC9.1.8` ya están reclamados por las unidades que los construyeron.
- **No hay archivos de trazabilidad ausentes**: los seis existen y son válidos; lo que queda son filas `GAP` de una verificación manual no ejecutada.

## Comprobaciones de consistencia

- **Ningún ID se declara cubierto sin evidencia**: los 176 cubiertos apuntan a un archivo real del árbol o a un criterio que sí lo está.
- **Ningún `GAP` se cuenta como `Met`**: los 21 restantes están explícitamente sin cerrar.
- **Las filas `N/A` tienen justificación**: `NFR4.3` (no hay distribución en esta versión) lo dice en su `target`.
- **Sin contradicciones entre fases**: requisitos → historias → componentes → unidades cierran; el único hueco es la ejecución del recorrido.
- **El DAG se respetó**: `U1 → U2 → {U3, U4, U5} → U6`.

## Qué falta para que la frontera pase

1. **Ejecutar P1–P4** en Android físico con Expo Go y cerrar los 21 IDs restantes (acción de la persona).
2. **Volver a correr** `aidlc engine sensor-traceability --stage build-and-test` y confirmar `pass: true` antes de cruzar la frontera.

## Aprobación humana

- [ ] La persona revisó el bloqueo restante y decidió cómo proceder con la transición Construction → Operation.

## Fuentes

- `construction/build-and-test/cross-unit-traceability.md`
- `construction/build-and-test/build-and-test-summary.md`
- `construction/build-and-test/test-results.md`
- `construction/u1-app-skeleton/code-generation/traceability.json`
- `construction/u2-content-core/code-generation/traceability.json`
- `construction/u3-create-react/code-generation/traceability.json`
- `construction/u4-spotify-explore/code-generation/traceability.json`
- `construction/u5-activity/code-generation/traceability.json`
- `construction/u6-walkthrough/code-generation/traceability.json`
- `construction/u6-walkthrough/code-generation/walkthrough-p1.md` … `walkthrough-p4.md`
- `construction/ci-pipeline/quality-gates.md`
- `construction/ci-pipeline/ci-config.md`
- `aidlc/spaces/default/memory/team.md` — § Testing Posture, § Deployment
