<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
- 2026-11-15T12:20:00Z — «No se provisiona nada» se comprobó en lugar de repetirse: antes de escribirlo se verificó que U3 no mueve el lockfile (sin dependencias nuevas), que las siete entradas de `coverageThreshold` y los siete `moduleNameMapper` ya existen a 80 en `jest.config.js`, y que `packages/design-system/src` y `packages/app-shell/src` no importan hoy `@melodify/content-store`; la respuesta heredada de U2 se sostiene con evidencia de este árbol, no por costumbre.
- 2026-11-15T12:24:00Z — La única compuerta nueva de la unidad es de lint, no de tubería: `eslint.config.js` gana dos prohibiciones (C1 ni C2 importan C4) que el paso `npm run lint` que ya existe ejecuta. Por eso `cicd-pipeline.md` dedica su sección central a lo que **no** cambia, con los ocho candidatos evaluados y su razón.
- 2026-11-15T12:31:00Z — `upstream-coverage` solo acepta un archivo de artefacto, no el directorio de la etapa: apuntar a la carpeta devuelve `could-not-run` con `script-error: exit-1`. Se disparó una vez por cada uno de los tres artefactos.

## Deviations
- 2026-11-15T12:18:00Z — No se dispararon los sensores `linter` y `type-check`: su filtro es `**/*.{ts,js}` y los tres artefactos son Markdown; el único fragmento de código es el del bloque ilustrativo de `eslint.config.js`, que el sensor rechaza por ruta, no por contenido.
- 2026-11-15T12:33:00Z — `infrastructure-design-questions.md` se respondió en modo `ve con lo recomendado`, la preferencia ya usada en U2, porque las seis respuestas ya estaban fijadas por `team.md` § Deployment, `project.md` § Forbidden y el diseño de NFR de esta misma unidad; cada `[Answer]` lleva la razón y no solo la letra.

## Tradeoffs
- 2026-11-15T12:27:00Z — La tabla de «Infraestructura compartida» se deja en `—` como en U2 —no hay recurso con dueño y consumidores—, pero se añade una segunda tabla con lo que U3 sí comparte en el proceso (`commentsController`, el snackbar y las dos constantes de tope). Se escribe ahí precisamente para que nadie lo confunda con un recurso que haya que aprovisionar.
- 2026-11-15T12:29:00Z — Se declara por escrito que la regla de lint no cubre un import por ruta relativa (`../../content-store/src`). Preferible un límite conocido y con su compuerta nombrada —revisión del PR y el `package.json` del paquete— que una compuerta que se lea como completa.

## Open questions
- 2026-11-15T12:35:00Z — Para U4: el lockfile se mueve por primera vez desde U2 cuando entre la dependencia de autorización. Esa unidad tendrá que justificar su `npm ci` y decir si el paquete exige `prebuild` o módulo nativo; si lo exigiera, esta etapa se reabre porque la tubería dejaría de ser solo `typecheck`/`lint`/`test`.
- 2026-11-15T12:36:00Z — Sigue abierta, desde U2, la simplificación del paso «Detectar directorio del proyecto» de `ci.yml` (sus dos ramas no se cumplen y resuelve `.`). Es un cambio de una línea ajeno a esta unidad; se arrastra como pregunta, no como deuda silenciosa.
