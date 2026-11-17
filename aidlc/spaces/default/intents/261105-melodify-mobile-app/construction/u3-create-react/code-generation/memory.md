<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs.

## Interpretations
- 2026-11-17T00:00:00Z — Los dos topes de C4 (`MAX_OPINION_LENGTH = 500`, `MAX_COMMENT_LENGTH = 300`) recortan antes de medir y rechazan con `422`; el texto vacío tras recortar también es `422`. Ningún tope cambia firmas ni vistas, así que la 1.2.0 es aditiva.
- 2026-11-17T00:00:00Z — `SEARCH_PORT_UNAVAILABLE` se registra solo en el defecto interno del puerto de búsqueda —puerto ausente o consulta que falla sin ser `offline`—, nunca en el `offline` previsto y nunca con el texto de la consulta: NFR9.6 pide diagnóstico sin filtrar lo que la persona escribió.
- 2026-11-17T00:00:00Z — La hoja de comentarios no conoce navegación ni aviso: `submit` devuelve `boolean` y es la cáscara quien decide qué snackbar pintar y que el aviso se vea dentro del modal cuando la hoja está abierta (BR14.6).

## Deviations
- 2026-11-17T00:00:00Z — `useCardActions` lee sus colaboradores de `useGlobalServices()` y `useShellServices()` en vez de recibirlos por argumento como decía el plan: la hoja y el snackbar los provee `AppShell`, y bajarlos por props hasta cuatro pantallas habría duplicado el cableado y permitido una segunda hoja. Queda `useCardActions(content, viewerId) → { actionsFor(opinion) }`.
- 2026-11-17T00:00:00Z — El aviso de fallo de una acción de reacción no ofrece «Reintentar» (FR11.2 pedía acción): el control que falló sigue en pantalla, así que la franja solo informa. Los textos son los exactos de la especificación.
- 2026-11-17T00:00:00Z — El temporizador de 4 s vive en `Snackbar` y no en quien la monta: TS-29 lo fija, la pieza lo cancela al desmontar y así la cáscara y la hoja comparten la misma franja sin duplicar temporizadores.
- 2026-11-17T00:00:00Z — `useDetalleObra` devuelve además `ownView` y `otherViews` (las `OpinionView` de C4) porque `OpinionCardModel` no lleva `isOwn` ni el autor que pide seguir; la vista sigue sin conocer C4 y recibe `actionsFor(opinionId)`.
- 2026-11-17T00:00:00Z — La prueba de `useCardActions` es `use-card-actions.test.tsx` y no `.test.ts`: el hook consume los dos contextos de la cáscara y hay que montarlo con proveedores. Se borró el `.test.ts` que había dejado un intento paralelo con la API antigua de dependencias.
- 2026-11-17T00:00:00Z — Se corrigieron tres errores de tipos en `crear-screen.test.tsx` que ya estaban en el árbol (el genérico de `ok()` no aceptaba el `201`, dos `invocationCallOrder[0]` podían ser `undefined`). `npm run typecheck` tiene que quedar verde y ninguna aserción cambió.

## Tradeoffs
- 2026-11-17T00:00:00Z — `useWorkSearch` descarta respuestas tardías con un testigo por consulta en vez de `AbortController`: el puerto de C5 no acepta señal y añadirla tocaría un contrato de inception por una necesidad de la pantalla.
- 2026-11-17T00:00:00Z — Un solo `formKey` que sube en las tres entradas de Crear es más simple que remontar la pantalla, pero obliga a `CrearScreen` a reaccionar al cambio; se eligió porque remontar perdía el foco y el estado de la hoja de comentarios.
- 2026-11-17T00:00:00Z — La validación se aisló en `validateOpinionDraft` (función pura que dice qué falta) en vez de calcular el «Publicar» habilitado dentro del hook: así la regla se prueba sin temporizadores ni almacén.
- 2026-11-17T00:00:00Z — `jest --coverage` con el comando acotado de la unidad sale con código 1 por tres archivos de árboles que la unidad no toca (`session-record.ts`, `catalog.ts`, `expo-network-adapter.ts`). Se deja documentado en vez de tocar umbrales: el suelo se juzga en Build and Test sobre la suite completa.

## Open questions
- 2026-11-17T00:00:00Z — La verificación en el teléfono queda pendiente del cierre de la unidad: levantar Metro en Expo Go y recorrer Crear, la hoja de comentarios y el aviso dentro de ella.
