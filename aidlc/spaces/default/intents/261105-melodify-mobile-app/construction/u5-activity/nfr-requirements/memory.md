<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-19T13:52:00Z — NFR4 (privacidad) se lee aquí como «qué se pinta de quién», no como «qué se envía»: U5 no envía nada, y el riesgo real es convertir la lista en un directorio de handles ajenos. De ahí la regla de que `actorHandle` viaje en el contrato pero no llegue a C1 ni al árbol renderizado.
- 2026-11-19T13:58:00Z — la fiabilidad de NFR1 vuelve a `performance-requirements.md` (como en U3 y U4) y la observabilidad de NFR9 vive en `security-requirements.md` § Diagnóstico; `ui` filtra los tres artefactos restantes. La escalabilidad no se absorbe en ningún sitio porque no hay servidor ni concurrencia (RC-02, RC-04).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-19T14:02:00Z — `ActivityFeed` **no recibe puerto de diagnóstico**, contra el patrón de U4. El único hecho diagnosticable (`status: 'error'`) ya cruza su contrato público, así que el código `ACTIVITY_LOAD_FAILED` lo emite `useActividad` en la app; añadir un `ActivityLogPort` habría abierto una dependencia para un solo código. Se corrigió NFR1.17 en `performance-requirements.md`, que decía que C8 «registra» al listener que lanza: lo aísla y no lo registra.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-19T14:06:00Z — la suscripción perezosa (TS-40) compra «cero trabajo al arrancar» a cambio de una máquina de estados de suscripción dentro de C8 (abrir en la primera observación, cerrar en la última baja, no duplicar en el reintento). Se acepta: la alternativa —suscribirse al construir— deriva en balde todo el tiempo que Actividad no se abre, y la app tiene seis pestañas.
- 2026-11-19T14:09:00Z — BR21.6 pasa de convención de revisión a regla de linter (`no-restricted-imports` para catálogo y Spotify, `no-restricted-globals` para `fetch`). Cuesta un bloque de `eslint.config.js` y compra que «no pide red» sea comprobable en CI y no solo en una revisión.
- 2026-11-19T14:12:00Z — el esqueleto de fila reutiliza `Skeleton shape="card"` (96) en vez de estrenar una forma: el salto de altura se acepta a cambio de no publicar un miembro de `SkeletonShape` para un solo consumidor. Queda como open question de U6.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-19T14:15:00Z — para U6: el salto entre el esqueleto de fila (96) y la fila real (56) se juzga en el teléfono, y el caso de cambiar de cuenta y volver a Actividad se verifica en el recorrido, no en una prueba.
- 2026-11-19T14:16:00Z — si C8 necesitara distinguir por qué falló una derivación (para reintentar solo la lectura caída), el contrato tendría que exponerlo y entonces sí haría falta un código de diagnóstico por causa; hoy hay un único estado `error` y un único código lo cubre.
