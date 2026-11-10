<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-09T10:40:00Z — «componente» aquí es un módulo interno de la app, no un servicio desplegable: todo se empaqueta junto y Units Generation decide después en cuántas unidades se agrupa.
- 2026-11-09T10:40:00Z — las pantallas no son componentes del catálogo: son contenedores finos dentro de `AppShell`, con sus estados documentados en los mockups y no aquí. Una pantalla sin entidad ni regla propia no aporta nada al catálogo.
- 2026-11-09T10:40:00Z — la obra se modela una sola vez en `Catalog` con un campo `origin` (ejemplo o Spotify); la interfaz no necesita distinguir una obra de ejemplo de una real.
- 2026-11-09T10:40:00Z — la opinión guarda `workTitle` y `workArtist` como resumen del estado de la obra en el momento de escribir, no como una segunda entidad de obra. Es lo que permite pintar la tarjeta sin sesión y sin red (FR3.2).
- 2026-11-09T10:40:00Z — «me gusta recibido» se interpreta como el me gusta que otra persona dio a una opinión del usuario demo; el dado por el demo no genera evento (ADR-006).
- 2026-11-09T23:20:00Z — revisión 1: revisada la etapa, «mis opiniones» sale de `AppSession` (constante `demo`), no de dos sitios; `ActivityFeed` depende de ella y `AppSession` no consulta `ContentStore`.
- 2026-11-09T23:20:00Z — revisión 1: los estados de Actividad y Perfil se resuelven con un contrato explícito (`loading`/`ready`/`empty`/`error`) en lugar de corregir FR8.4 y los criterios de aceptación; el error es defensivo pero tiene texto, reintento y prueba (ADR-012).

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-09T10:40:00Z — no hubo ronda de revisión por pares antes del revisor de arquitectura: los colaboradores están apagados en este alcance y el agente arquitecto trabajó solo.
- 2026-11-09T10:40:00Z — `traceability.json` se mapea a nivel de historia y no de criterio de aceptación: el catálogo es de componentes (estructura), no de reglas, y los 112 criterios pertenecen a Functional Design.
- 2026-11-09T23:20:00Z — revisión 1: el error de carga de Perfil no recibe componente propio; `AppShell` aplica el mismo contrato de estados que Actividad, porque la vista de Perfil es un contenedor y no una pieza con datos propios.
- 2026-11-09T10:40:00Z — el esquema de datos no se detalla a propósito (tipos, cardinalidades, validaciones): esta etapa fija dueño, identificador, atributos por nombre y referencias; el resto es Functional Design.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-09T10:40:00Z — nueve componentes para una app que cabe en un archivo: se paga estructura de más y se gana que cada pieza se pruebe con dobles, sin red ni credenciales, y que la cobertura del 80 % sea alcanzable por unidad.
- 2026-11-09T10:40:00Z — Context y `useReducer` en lugar de Zustand o Redux Toolkit: cero dependencias nuevas y reductores puros fáciles de cubrir, a cambio de repintados que este volumen no nota (ADR-010).
- 2026-11-09T10:40:00Z — `expo-secure-store` también para la sesión de la app, que no es un secreto: una dependencia menos y un solo mecanismo de persistencia, a cambio de una lectura algo más lenta en el arranque (ADR-011).
- 2026-11-09T10:40:00Z — actividad derivada en lugar de registrada: no puede desincronizarse y no hay que sembrarla, a cambio de recalcular en cada apertura —irrelevante con una decena de opiniones (ADR-005).
- 2026-11-09T10:40:00Z — `AppShell` concentra siete dependencias: es el punto más acoplado del grafo; se acepta porque la alternativa era seis componentes de pantalla sin contenido propio.
- 2026-11-09T23:20:00Z — revisión 1: `Catalog` pasa de una arista a cuatro (SpotifyCatalog, ContentStore, SpotifyAuth, Connectivity). Se acepta el acoplamiento porque sin esas entradas la decisión de portada y el «N opiniones» no tienen de dónde salir; la alternativa era que `AppShell` le pasara tres datos y el catálogo dejara de ser dueño de su propia regla.
- 2026-11-09T23:20:00Z — revisión 1: `workId` se define como el identificador de Spotify y se elimina `spotifyId`, en lugar de mantener dos campos: menos flexibilidad si algún día hay obras que no estén en Spotify, a cambio de que la referencia de FR3.2 no pueda discrepar.
- 2026-11-09T10:40:00Z — se corrige AC7.1.3 como error de redacción en lugar de implementar el me gusta dado: cierra la contradicción con FR8.1 al precio de que la historia queda pendiente de edición.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-09T10:40:00Z — el redirect URI de PKCE (A6) y el esquema de enlaces de React Navigation se fijan juntos en Functional Design; `SpotifyAuth` acepta el prefijo que se decida.
- 2026-11-09T10:40:00Z — el límite de texto y la obligatoriedad de la valoración (OQ1, A1) afectan a la validación del formulario, no a qué componentes existen.
- 2026-11-09T10:40:00Z — dónde se pinta el error de conexión fuera de Perfil (R-01) y si Explorar necesita un estado explícito «sin sesión + sin conexión» (R-02): `SpotifyAuth` ya expone el estado y `Catalog` ya tiene el catálogo local, así que es una decisión de superficie.
- 2026-11-09T10:40:00Z — la corrección de AC7.1.3 está decidida pero la historia sigue sin editarse; hay que aplicarla antes de que Code Generation la lea como criterio.
- 2026-11-09T23:20:00Z — resuelto en la revisión 1: AC7.1.3 se editó en `stories.md` con nota fechada y la fila US7.1 de la traza lo recuerda. Queda pendiente de una segunda mirada el resto de hallazgos de la revisión.
- 2026-11-09T10:40:00Z — R-07, R-08, R-10 y R-11 (token de portada de 48, barra lateral sin tokens, `own` fuera de `variant`, rol del chip) siguen aceptados como riesgo; `isOwn` atiende R-10 por el lado del componente.
