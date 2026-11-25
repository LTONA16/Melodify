<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
- 2026-11-13T00:00:00Z — Las escrituras de C4 numeran desde el sufijo más alto de la siembra (`op-011`, `cm-004`); la primera versión reutilizaba `op-001` y heredaba los me gusta y comentarios de la opinión sembrada.
- 2026-11-13T00:00:00Z — Los hooks de `app/src/state/` reciben sus colaboradores por argumento (`useContent(viewerId, content, log?)`, `useCatalog(catalog)`, `useViewerId(session)`): la instancia única es del paso 29 y un hook no puede construir una segunda (R-01). `useNetwork` sí lee `useShellServices()`.
- 2026-11-13T00:00:00Z — `useViewerId` devuelve `null` sin sesión iniciada, aunque C3 lleve un `authorId` por defecto: sin sesión no hay quien mire y C4 calcularía `isOwn` por un autor que no usa la app.

## Deviations
- 2026-11-13T00:00:00Z — `app/src/bootstrap/ports.ts` deja de duplicar tipos y re-exporta los de `@melodify/catalog`; `PortWorkView` desaparece porque su forma era `WorkView` sin `origin` y el contrato devuelve la vista completa. Sin consumidores en el repositorio.
- 2026-11-13T00:00:00Z — C4 expone `countOpinions(workId)`, que no está en el contrato C4, porque C5 lo consume para «N opiniones».
- 2026-11-13T00:00:00Z — La semilla de C4 (`SeedWork`) no lleva `coverUrl`: la decisión de portada vive en C5 (`WorkView`), y la prueba comprueba la ausencia de la propiedad.
- 2026-11-13T00:00:00Z — El adaptador de `expo-network` es un objeto constante, no una fábrica; sigue siendo el único archivo que importa el módulo.

## Tradeoffs
- 2026-11-13T00:00:00Z — El estado `own` de `OpinionCard` se limita a `variant: "detail" && isOwn`; en `feed`/`compact` se conserva la regla anterior (`isOwn && onEdit`), que mantiene verde `opinion-card.test.tsx` sin reescribirlo.
- 2026-11-13T00:00:00Z — `app-header` marca el bloque del título (título y ranura derecha) y no la barra entera: con «‹ Volver» dentro, la aserción `toHaveTextContent("Otra obra")` de la cáscara cambiaría de significado.
- 2026-11-13T00:00:00Z — `OfflineBanner` sustituye al `Banner` de C1 en vez de envolverlo: el texto exacto se escribe una sola vez, a cambio de no exponer un `testID` propio.
- 2026-11-13T00:00:00Z — La pila de C2 1.2.0 mantiene montada la raíz y oculta lo de debajo con `display: none`; el coste de memoria crece con la pila y ninguna pantalla de U2 apila más de un nivel.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
