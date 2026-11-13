<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-13T02:40:00Z — [unit u2-content-core] La etapa no diseña una topología de nube, diseña el borde de lo que existe: el runner del CI, Metro, Expo Go y `expo-secure-store`. Provisionar cualquier cosa para una app de Expo Go sin backend sería infraestructura sin sustrato.
- 2026-11-13T02:40:00Z — [unit u2-content-core] `monitoring-design.md` no se queda vacío: los jobs del CI son las métricas reales (verde, cobertura por árbol, typecheck, lint, commitlint) y el registro del dispositivo es el único sumidero de diagnóstico. Un documento que dijera «no hay monitoring» sin más no le diría a nadie dónde mirar cuando algo falla.
- 2026-11-13T02:52:00Z — [unit u2-content-core] La revisión de la iteración 2 corrige un hecho que dimos por bueno: `wagoid/commitlint-github-action@v6` carga `@commitlint/config-conventional` como respaldo cuando `configFile` no existe, así que el job no estaba rojo por la configuración ausente. El diseño deja de contarlo como avería y crea `.commitlintrc.json` por otra razón: que las reglas estén en el repositorio y que el `configFile` y el enlace de `README.md` apunten a algo real. El único hueco real frente a `team.md` es el título del PR.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-13T02:40:00Z — [unit u2-content-core] La sección «Infraestructura compartida» se escribe aunque no haya recursos compartidos: una tabla con una fila «no existe ninguno» evita que una unidad posterior suponga que hereda algo que provisionar.
- 2026-11-13T02:40:00Z — [unit u2-content-core] Se añade a la lista de cambios del CI la validación del **título** del PR con commitlint, que hoy no ocurre: `team.md` § Way of Working lo pide y la tubería solo valida los commits. Queda marcado como decisión abierta para que se pueda quitar en la puerta.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-13T02:40:00Z — [unit u2-content-core] Se retira `--passWithNoTests` al pasar a `--coverage`: se gana que una suite vacía falle en vez de pasar en verde, a costa de que el job no pueda ejecutarse en un árbol sin pruebas (que ya no es el caso).
- 2026-11-13T02:40:00Z — [unit u2-content-core] Se deja intacto el paso «Detectar directorio del proyecto», aunque resuelve siempre `.`: se gana no mezclar un cambio de CI ajeno con la unidad de contenido, a costa de conservar una rama muerta hasta el PR que la limpie.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-13T02:40:00Z — [unit u2-content-core] ¿Se valida el título del PR en este PR de U2 o se deja para otra unidad? El diseño lo incluye porque `team.md` lo exige; se puede quitar sin tocar nada más.
- 2026-11-13T02:40:00Z — [unit u2-content-core] Si en U4 el flujo de Spotify necesitara el client ID en algún paso de build, entra como variable del repositorio y nunca como secreto: PKCE no tiene secreto de cliente.
