# User Stories Assessment — Melodify

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md`, `ideation/scope-definition/scope-document.md`, `ideation/rough-mockups/wireframes.md` y `inception/practices-discovery/team-practices.md`.
> Fecha: 2026-11-06. Etapa: User Stories. Agente: aidlc-product-agent. Profundidad: Standard.

## Decisión

**Execute** — las historias de usuario se escriben.

## Por qué

El trabajo es una app móvil con seis pantallas que una persona recorre de punta a punta. Los requisitos ya dicen qué debe hacer el sistema, pero están escritos como comportamiento del sistema (`FR…`), no como lo que una persona intenta lograr. Sin historias:

- Los criterios de aceptación llegarían al diseño funcional y a las pruebas como listas de comportamiento suelto, sin un actor ni un valor detrás, y sería fácil construir una pantalla que cumple el requisito y no sirve a quien la usa.
- Los estados de error, vacío y sin Spotify están repartidos por doce grupos de requisitos; una historia por recorrido los agrupa en el momento en que la persona los vive.
- La trazabilidad requisito → historia → criterio de aceptación es la que después permite decir qué se construyó y qué no.

## Factores considerados

- **Tipo de proyecto**: producto nuevo, con interfaz de usuario, no una refactorización ni una corrección aislada.
- **Superficie de usuario**: seis pantallas, cinco destinos en la barra inferior y tres modos de contenido (sin sesión, con sesión, sin conexión).
- **Complejidad de reglas**: opinión única por obra y persona, edición con fecha de modificación, búsqueda con pausa y caché, sesión de Spotify que persiste.
- **Coordinación**: una sola persona construye y prueba; no hay equipos que coordinar, así que las historias no sirven para repartir trabajo, sino para fijar el criterio de terminado.
- **Prácticas del equipo**: `test-after` con cobertura del 80 %; las historias y sus criterios de aceptación son la fuente de las pruebas.

## Dónde aportan más valor

1. **El recorrido completo (FR12)**: la historia que dice qué significa «la app funciona» en el teléfono.
2. **Login y sesión de la app (FR1)**: la primera pantalla y la única que no se puede abandonar sin entrar.
3. **Publicar y editar una opinión (FR5, FR6)**: el corazón del producto y donde viven las reglas (una por obra, fecha de modificación).
4. **Explorar y Crear sin Spotify (FR4.5, FR5.6)**: el modo degradado que sostiene la promesa «la app sirve sin cuenta».
5. **Conectar Spotify (FR10)**: PKCE, token persistente y los fallos que hay que contar en lenguaje llano.

## Cobertura alternativa si se hubiera omitido

No se omite. Si se hubiera omitido, los requisitos por sí solos bastaban para el diseño funcional, pero los criterios de aceptación habrían tenido que inventarse en Construction, sin el actor ni el valor que aquí quedan fijados.
