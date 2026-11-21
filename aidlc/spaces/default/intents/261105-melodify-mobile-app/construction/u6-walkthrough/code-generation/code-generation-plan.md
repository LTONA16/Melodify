# Plan de generación de código — U6 `u6-walkthrough`

> **Provenance**: deriva de `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § El registro de la pasada, § Defectos, § Criterio de cierre), `rules.md` (BR25–BR28) y `frontend-components.md`; de `construction/u6-walkthrough/nfr-requirements/performance-requirements.md` (NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20, NFR6.11), `security-requirements.md` (NFR3.24, NFR3.25, NFR4.12, NFR9.9) y `tech-stack-decisions.md` (TS-44–TS-48); de `construction/u6-walkthrough/nfr-design/performance-design.md`, `security-design.md` y `logical-components.md` (LC-20); de `construction/u6-walkthrough/infrastructure-design/infrastructure-specification.md`, `cicd-pipeline.md` y `monitoring-design.md`; de `inception/units-generation/unit-of-work.md` § U6 y `unit-of-work-story-map.md`; de `inception/user-stories/stories.md` (US11.1, US11.2, AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3); y de `inception/delivery-planning/bolt-plan.md` (Bolt 6).
> Fecha: 2026-11-21. Etapa: Code Generation · Unidad: `u6-walkthrough` · Agente: `aidlc-developer-agent` · Profundidad: Standard.

## Summary

- Builds: los cuatro registros de pasada del recorrido (P1–P4) con su catálogo de 52 filas, la tabla de defectos de cada uno y el procedimiento de arranque limpio; ninguna función nueva.
- Touches: `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u6-walkthrough/code-generation/` (registros y resumen); ningún archivo de `app/`, `packages/` ni configuración.
- Tests: ninguna prueba nueva —la unidad no escribe código de producto—; la suite existente y el suelo de 80 % por árbol siguen siendo la puerta y los mide Build and Test sobre la suite completa.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "implementamos cada capa (utilidad, hook, pantalla), y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.",
  "scope": "mvp",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Ordering**: implementamos cada capa (utilidad, hook, pantalla), y después escribimos y ejecutamos las pruebas de esa capa antes de pasar a la siguiente.\n- **Herramientas**: Jest con `jest-expo` y `@testing-library/react-native`; los tres comandos que ya invoca el CI son la puerta: `npm test`, `npm run typecheck` y `npm run lint`.\n- **Cobertura**: umbral del **80 % de líneas sobre `app/src/**`**, medido con `--coverage` y excluyendo configuración generada, assets y ficheros de arranque. No se baja el umbral para hacer pasar una etapa.\n- **Qué se prueba**: la lógica de estado (opiniones en memoria, publicar, me gusta, seguir, comentar), las utilidades de Spotify (construcción de la URL de autorización PKCE, intercambio de código, lectura y borrado del token, parseo de resultados de búsqueda y de portadas) y el render de cada pantalla en sus estados: vacío, carga, error, sin Spotify y sin conexión.\n- **Qué no se prueba automáticamente**: el recorrido real en el teléfono. Eso es verificación manual en Expo Go y sigue siendo el criterio de terminado de la versión.\n- **Dobles de prueba**: las llamadas a la API de Spotify se sustituyen por dobles. Ninguna prueba sale a la red ni necesita credenciales, cuenta de Spotify ni un client ID real.\n- **Pruebas que no valen**: nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:7b9c0cd94fbb4321ea082bafcfd9b27828b26b5cc39a10b1f579a6c77cfea746",
  "contract_sha256": "sha256:c6f2307e77daeec95951a4f46c0c4ca676e462a781537060331c7a19c4dde0c9"
}
```

## Cómo se ordena este plan

La metodología es **test-after** y la unidad **no tiene capas que probar**: U6 no escribe código de producto, no estrena componente, no toca contrato y no añade pruebas (BR25.1, TS-44, `cicd-pipeline.md` § Assumptions). Lo que produce son los cuatro registros de pasada, que son evidencia de verificación y no un artefacto del bundle (TS-45, LC-20).

| Capa del perfil | En esta unidad | Dónde vive |
|---|---|---|
| Data model / database behavior | **No aplica** — U6 no posee entidades ni datos; recorre los de C3, C4 y C8 | — |
| Repository / data access | **No aplica** — no hay lectura nueva | — |
| Business logic | **No aplica** — no hay reglas nuevas; las de la pasada son un procedimiento escrito, no código | — |
| API / endpoint | **No aplica** — U6 no publica contrato (C1–C8 quedan como están) | — |
| Frontend behavior | **Verificación manual** — las seis pantallas se recorren en el teléfono; los arreglos puntuales, si los hay, se hacen en la pantalla que falló | `walkthrough-p{1..4}.md` |

El runner ya existe y no se toca: `jest.config.js`, `jest.setup.js` y el `coverageThreshold` por árbol quedan intactos (`cicd-pipeline.md` § Los archivos que no cambian). El comando acotado de esta unidad no ejecuta pruebas nuevas, porque no las hay; su verificación es el diff congelado más el recorrido manual, y `unit-test-instructions.md` lo registra con esa misma honestidad.

## Decisiones y desviaciones registradas

- **No se escriben pruebas nuevas en U6**, y no es una rebaja del suelo: la unidad no añade una sola línea de `app/src/**` ni de `packages/*/src/**`, así que no hay comportamiento nuevo que probar. El suelo del 80 % sigue midiéndose por árbol sobre la suite completa y Build and Test es quien lo mide.
- **Los cuatro registros viven en el registro del intento**, no en el árbol de la app: `construction/u6-walkthrough/code-generation/walkthrough-p{1..4}.md`. Ningún archivo de `app/` ni de `packages/` los referencia (TS-45).
- **Un fichero por pasada y no uno solo con cuatro tablas**: la forma la fija `functional-spec.md` § El registro de la pasada, y permite cerrar P1 sin tocar P3.
- **Las filas del catálogo se escriben completas desde el principio**, con `Paso`, `Pantalla`, `Acción` y `Esperado` leídos del catálogo de `functional-spec.md`; `Obtenido`, `Resultado` y `Nota` se rellenan durante el recorrido en el teléfono. No se añade ni se quita ninguna fila (BR27.5, NFR8.19).
- **P1 y P2 llevan 18 filas** (W01–W14 más W05b, W06b, W12b y W12c); **P3 y P4 llevan 8** (S01–S08). Son 52 filas y 24 capturas si R2 se ejecuta, 52 filas escritas y 13 capturas si R2 se condiciona (NFR8.19).
- **R2 condicionada no es un fallo de la unidad**: si falta el client ID o el panel rechaza el redirect, S01 se ejecuta igualmente y se anotan el estado literal de la tarjeta, el redirect que resuelve la app y la fecha; S02–S08 se marcan N/A con su motivo (BR26.7, BR28.2).
- **Un defecto en alcance se corrige con el cambio mínimo**, dentro de props y estados de C1–C8. Si la corrección exigiera tocar un contrato, añadir una pantalla o un módulo nativo, se registra como pendiente y no se construye (BR27.4).
- **Nada de instrumentación**: ni temporizador, ni reloj visible, ni contador de renders, ni conmutador de depuración. El rendimiento se juzga —cada estado llega— y el contraste, si hay duda, se mide con `contrastRatio` de C1 sobre los tokens del tema, desde el repositorio y en el mismo commit (NFR6.11, TS-44).
- **No se commitean capturas ni `.env`**: las capturas se adjuntan al PR y cada registro las referencia por nombre; el client ID se anota como «configurado: sí/no», nunca su valor (NFR3.24, NFR4.12).
- **`external-dependency-map.md` solo se toca en el desenlace condicionado**, con una línea bajo la tabla: `Redirect URI de PKCE — <valor literal> — <fecha>`.

## Trazabilidad historia → paso

| Historia / criterio | Qué lo cumple | Pasos |
|---|---|---|
| US11.1 / AC11.1.1 — recorrer las seis pantallas sin sesión, sin cierres ni blancos | Catálogo W01–W14 y sus variantes en P1 y P2, con las vistas de paso | 1, 3, 5, 6 |
| AC11.1.2 — la opinión publicada se ve en Inicio, Actividad y Perfil | W07–W11 y su repetición en P2 | 1, 3, 5, 6 |
| AC11.1.3 — todo en español, sin mensajes técnicos | W02, W08, W14 y la lista de lo prohibido de `performance-design.md` § NFR2.15 | 1, 3, 5, 6 |
| AC11.1.4 — aviso de sin conexión con «Reintentar» y su diferencia con Crear | W12, W12b, W12c y S07 | 1, 3, 5–7 |
| AC11.1.5 — los dos temas y las doce capturas de R1 | P1 y P2 con sus seis capturas por pasada y el contraste cuando hay duda | 1, 3, 4, 5, 6 |
| US11.2 / AC11.2.1 — PKCE, conexión y búsqueda real | S01–S02 en P3 y P4 | 2, 3, 7 |
| AC11.2.2 — publicación real y portadas reales en las tres pantallas | S03–S05 | 2, 3, 7 |
| AC11.2.3 — salida condicionada cuando falta el prerrequisito | S01 observada, S02–S08 en N/A con motivo, redirect y fecha en el registro y en el mapa | 2, 7 |
| BR25–BR28 — pasadas, registro, defectos y criterio de cierre | Cabecera de ocho datos, una fila por paso, tabla de defectos y veredicto | 1–4, 8, 9 |
| NFR8.19 / NFR8.20 — coste cerrado y arranque limpio | Recuento 18/18/8/8 y 12/12/6/6 capturas; siete precondiciones con su salida | 1–4 |
| NFR1.19 / NFR1.20 — máquina de estados y evidencia que se sostiene sola | Estados terminales por pasada, sin celdas vacías y veredicto al final | 3, 4, 5–7 |
| NFR3.24 / NFR3.25 / NFR9.9 — evidencia sin secretos y superficie congelada | Anotación del client ID como sí/no, diff congelado y `logger.ts` intacto | 4, 9 |
| TS-44–TS-48 — sin instrumentación, sin binarios, sin build propio | Ausencia de temporizadores y de capturas en el árbol; sin EAS | 1–4, 9 |

## Pasos

### Paso 1 — Registros de R1: P1 y P2

- [ ] Crear `walkthrough-p1.md` con la forma fija de `functional-spec.md` § El registro de la pasada: título `# Recorrido — P1 — 2026-11-21`, cabecera de ocho datos, tabla de pasos, tabla de defectos y hueco de veredicto.
- [ ] Escribir en la cabecera los ocho datos —fecha, modelo, Android, Expo Go, commit corto, tema, estado de Spotify y client ID configurado— más la constancia de que Metro se levantó desde `app/`; los valores del dispositivo y del commit se rellenan antes de la pasada.
- [ ] Escribir las 18 filas de R1 —W01–W14 más W05b, W06b, W12b y W12c— con `Pantalla`, `Acción` y `Esperado` copiados del catálogo, y `Obtenido`, `Resultado` y `Nota` en blanco para el recorrido.
- [ ] Dejar en cada fila la columna `Nota` preparada para el nombre de la captura cuando la fila la justifique (`p1-{pantalla}-claro.png`).
- [ ] Crear `walkthrough-p2.md` con la misma forma, las mismas 18 filas y el tema oscuro en la cabecera; las capturas se nombran `p2-{pantalla}-oscuro.png`.

### Paso 2 — Registros de R2: P3 y P4

- [ ] Crear `walkthrough-p3.md` y `walkthrough-p4.md` con la forma fija y las 8 filas de R2 —S01–S08—, con su `Esperado` y su AC copiados del catálogo.
- [ ] Escribir en la cabecera de P3 y P4 el estado de Spotify y si el client ID estaba configurado; nunca el valor del client ID ni el del token.
- [ ] Preparar en S01 la nota de la salida condicionada: estado literal de la tarjeta (`connectionError` o `notConfigured`), mensaje mostrado, redirect que resuelve la app y fecha.
- [ ] Preparar en S02–S08 el marcado N/A con el motivo «prerrequisito externo no resuelto», sin rellenarlo hasta saber el desenlace.

### Paso 3 — Defectos y veredicto en los cuatro registros

- [ ] Dejar en cada registro la tabla `## Defectos` con sus columnas —ID, paso, síntoma, AC o regla, decisión y commit— y sin filas de ejemplo.
- [ ] Dejar el `## Veredicto` con las tres salidas posibles —Completada, Condicionada, Abierta— y la regla escrita de que no se escribe hasta que no queden celdas vacías.
- [ ] Comprobar que `Resultado` solo admite ✅, ❌ o N/A, y que todo N/A lleva su motivo en `Nota`.

### Paso 4 — Arranque limpio y nombres de captura

- [ ] Escribir en el plan y en `unit-test-instructions.md` el procedimiento de arranque limpio con las siete precondiciones y su salida, para que la pasada sea repetible por otra persona.
- [ ] Fijar los nombres de captura `p{1|2|3|4}-{pantalla}-{claro|oscuro}.png`, con las doce de R1 y las doce de R2, o la única de la tarjeta en S01 si R2 se condiciona.
- [ ] Verificar que ninguna captura se commitea al árbol y que `.gitignore` ya cubre `.env`.

### Paso 5 — Ejecución de P1 y relleno del registro

- [ ] Levantar Metro desde `app/` y confirmar las cinco precondiciones bloqueantes con la persona; si falta el teléfono o Metro, la pasada queda `Abortada` con su bloqueo escrito.
- [ ] Recorrer W01–W14 y sus variantes con la persona, fila a fila, y escribir `Obtenido`, `Resultado` y `Nota` con lo que ocurre en el teléfono.
- [ ] Anotar en `## Defectos` cada ❌ con su clasificación; un defecto en alcance se corrige antes de seguir y un pendiente se registra y no se construye.
- [ ] Completar la cabecera con el commit corto y el dispositivo reales al cerrar la pasada.

### Paso 6 — Ejecución de P2 en tema oscuro

- [ ] Cambiar el tema del sistema a oscuro y repetir W01–W14 con sus variantes, comprobando que las seis pantallas cambian sin recargar y sin esqueletos nuevos.
- [ ] Rellenar las 18 filas de P2 y anotar las seis capturas oscuras.
- [ ] Medir el contraste con `contrastRatio` sobre los tokens del tema oscuro solo si alguna fila lo pone en duda, y dejar el par medido, el valor y el commit en la nota.

### Paso 7 — Ejecución de P3 y P4, o condicionar R2

- [ ] Comprobar el client ID y el redirect cargado en el panel de Spotify; si falta cualquiera de los dos, ejecutar S01 igualmente y aplicar la salida condicionada.
- [ ] Recorrer S01–S08 con la persona y rellenar las 8 filas de P3; repetir en oscuro para P4.
- [ ] Si R2 se condiciona: anotar el estado literal de la tarjeta y su «Reintentar», el redirect que resuelve la app y la fecha, marcar S02–S08 como N/A con motivo y añadir la línea del redirect en `inception/delivery-planning/external-dependency-map.md` con el mismo valor y la misma fecha.
- [ ] Dejar el veredicto de P3 y P4 como `Completada` o `Condicionada`, nunca como «demostrada con sesión» si falta una fila.

### Paso 8 — Corrección de defectos en alcance

- [ ] Corregir cada defecto en alcance con el cambio mínimo, dentro de props y estados de C1–C8, y recargar Metro antes de repetir el tramo.
- [ ] Anotar en la tabla de defectos la decisión y el commit del arreglo; si el arreglo no basta, volver a `Defecto` y no cerrar la pasada.
- [ ] Convertir en pendiente cualquier arreglo que exija tocar un contrato, añadir una pantalla o un token, o introducir un módulo nativo, con qué falta y de qué depende.
- [ ] Añadir a `source-manifest.json` cada ruta de `app/src/**` o `packages/*/src/**` que un arreglo haya tocado.

### Paso 9 — Cierre técnico y evidencia del PR

- [ ] Ejecutar `npm run typecheck`, `npm run lint` y `npm test` al cerrar la última pasada, con el suelo del 80 % por árbol intacto.
- [ ] Comprobar que el diff de los archivos congelados —`package.json`, `app/package.json`, los ocho `packages/*/package.json`, `package-lock.json`, `jest.config.js`, `eslint.config.js`, `tsconfig.json`, `app/tsconfig.json`, `.env.example` y `app/src/bootstrap/logger.ts`— está vacío salvo la línea condicional del mapa de dependencias externas.
- [ ] Revisar que el diff de cada arreglo tocó solo la pantalla que falló y que no entra ni `.env`, ni tokens, ni capturas.
- [ ] Preparar la descripción del PR: plataformas probadas, capturas adjuntas, checklist de la plantilla y Conventional Commits.

### Paso 10 — Documentación y trazabilidad

- [ ] Escribir `code-summary.md` con los archivos creados, las decisiones, el resumen de la verificación y las pruebas escritas pero no ejecutadas con su motivo.
- [ ] Escribir `source-manifest.json` con las rutas que la unidad haya tocado —vacío si el recorrido no obligó a ningún arreglo—.
- [ ] Generar `traceability.json` con el sensor de trazabilidad y dejar cada criterio con su `target` real o su `GAP`.
