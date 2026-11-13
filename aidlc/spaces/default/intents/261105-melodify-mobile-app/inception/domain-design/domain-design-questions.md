# Domain Design — Preguntas

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (`requirements`), `inception/user-stories/stories.md` (`stories`), `inception/practices-discovery/team-practices.md` (`team-practices`) y del diseño aprobado en `inception/refined-mockups/` (`mockups`, `interaction-spec`, `design-system-mapping`).
> Fecha: 2026-11-09. Etapa: Domain Design. Agente: aidlc-architect-agent.

## Qué decide esta etapa

Domain Design identifica los **bloques lógicos de software** que se van a escribir: qué componentes existen, qué responsabilidad y qué datos posee cada uno, y quién llama a quién. No decide cómo se agrupan en unidades desplegables (eso es Units Generation), ni el stack o los patrones de NFR (eso es Construction). En esta app, además, todo corre en una sola app Expo: los componentes son módulos internos, no servicios.

**Fuera del alcance de esta etapa**: elegir navegador o librería de estado (se propone y se documenta como decisión, pero no se instala nada aquí), fijar el redirect URI de PKCE (Functional Design, A6), los límites de texto y la obligatoriedad de la valoración (OQ1) y cualquier detalle de esquema de datos (tipos, validaciones, cardinalidades: eso es Functional Design).

---

## Q1. [Producto] ¿Qué enseña Actividad cuando doy me gusta a la opinión de otra persona?

El requisito de Actividad (FR8.1) enumera solo lo **recibido**: mis publicaciones, los me gusta que recibo y los comentarios que recibo. En cambio, el criterio AC7.1.3 de la historia US7.1 dice que al dar me gusta «aparece el evento de me gusta correspondiente» en Actividad. Las dos cosas no pueden ser verdad a la vez, y la revisión de los mockups refinados lo dejó abierto (R-03). De la respuesta depende qué eventos existen en el modelo de Actividad y qué textos e iconos necesita.

- A. Solo eventos recibidos: publicaciones propias, me gusta recibidos y comentarios recibidos; AC7.1.3 se corrige en la historia como error de redacción (Recommended)
- B. Recibidos y también el me gusta que doy: se añade un cuarto evento, «Te gustó la opinión de «…» sobre «…»», con su propio icono
- C. Todo lo dado y lo recibido: me gusta y comentarios en ambos sentidos, con un evento por cada acción
- X. Other (please specify)

[Answer]: A

## Q2. [Arquitectura] ¿Actividad se calcula al abrirla o se registra cuando ocurre?

Los eventos de Actividad pueden salir de los propios datos del contenido (fecha de la opinión, me gusta recibidos, comentarios recibidos) o guardarse en un registro aparte que se escribe en cada acción. De la respuesta depende si hay una sola copia de la verdad o dos que pueden desincronizarse.

- A. Se calcula al abrir la pantalla a partir del contenido: fecha de cada opinión propia, me gusta recibidos y comentarios recibidos; sin almacén propio de eventos (Recommended)
- B. Un registro propio de eventos que se escribe al publicar, al recibir un me gusta y al recibir un comentario, y se siembra al arrancar
- C. Un registro propio solo para los eventos recibidos; las publicaciones se leen del contenido
- X. Other (please specify)

[Answer]: A

## Q3. [Arquitectura] ¿Cómo repartimos el estado social que vive en memoria?

Opiniones, me gusta, comentarios y seguimiento viven en memoria y se pierden al recargar (RC-03, FR7.6). Los contadores que se ven en la tarjeta —me gusta y comentarios— pertenecen a la opinión, así que dónde vive el estado decide cuántos sitios hay que mantener sincronizados al publicar, editar o reaccionar.

- A. Un único `ContentStore` que posee opiniones, me gusta, comentarios y seguimiento, y notifica los cambios a las pantallas (Recommended)
- B. Dos almacenes: uno de opiniones (crear, editar, listar) y otro social (me gusta, comentarios, seguimiento), coordinados por las pantallas
- C. Tres almacenes: opiniones, interacciones y actividad, cada uno con su ciclo de vida
- X. Other (please specify)

[Answer]: A

## Q4. [Arquitectura] ¿Quién es dueño de la obra musical?

La obra tiene metadatos que vienen de Spotify (identificador, título, artista, portada) pero también existe sin sesión, porque el catálogo de ejemplo es local (FR3.2, FR4.5). Cada entidad necesita un solo dueño; de la respuesta depende dónde se crea una obra y quién puede cambiarla.

- A. `Catalog`: posee la obra (identificador de Spotify, título, artista, portada y origen) y reúne el catálogo de ejemplo con los resultados de Spotify; las opiniones la referencian por identificador y guardan un resumen de título y artista (Recommended)
- B. `ContentStore`: la obra nace con la primera opinión y guarda los metadatos copiados en ese momento
- C. `SpotifyCatalog`: la obra pertenece al adaptador de Spotify y el catálogo de ejemplo se trata como una lista aparte de obras «de mentira»
- X. Other (please specify)

[Answer]: A

## Q5. [Arquitectura] ¿La integración con Spotify es una pieza o dos?

La autorización PKCE y el token (FR10.1–FR10.4) tienen una superficie de seguridad y unos fallos distintos de la búsqueda y los metadatos (FR4.1–FR4.3), que usan ese token en cada llamada. De la respuesta depende cuántos componentes hay que probar y dónde se puede sustituir Spotify por un doble.

- A. Dos componentes: `SpotifyAuth` (autorización PKCE, token en almacenamiento seguro, desconexión y token inválido) y `SpotifyCatalog` (búsqueda, metadatos y portadas, usando el token de `SpotifyAuth`) (Recommended)
- B. Un único `SpotifyClient` que hace PKCE, guarda el token y busca
- C. Tres componentes: `SpotifyAuth`, `SpotifyCatalog` y un `SpotifyTokenStore` aparte que solo lee y escribe el token
- X. Other (please specify)

[Answer]: A

## Q6. [Arquitectura] ¿Cómo componemos la interfaz dentro del catálogo de componentes?

El diseño aprobado tiene seis pantallas, dos vistas de detalle y veinte componentes compartidos. Dónde se traza la frontera decide si Domain Design produce seis componentes casi vacíos o una capa de presentación con las pantallas dentro.

- A. `AppShell` (navegación, seis pantallas como contenedores finos, avisos de sin conexión y snackbar) más `DesignSystem` (tema y componentes compartidos, con la tarjeta de opinión dentro) (Recommended)
- B. `AppShell` (navegación) más `Screens` (las seis pantallas juntas) más `DesignSystem`
- C. Una componente por pantalla (seis componentes) más navegación y sistema de diseño
- X. Other (please specify)

[Answer]: A

## Q7. [Arquitectura] ¿Cómo sabemos que no hay conexión?

El requisito FR11.4 pide conservar lo cargado, usar portadas de bloque y avisar en la cabecera, y hay estados de sin conexión en Inicio, Explorar y Crear. De la respuesta depende si existe una sola señal de conectividad o cada pantalla la deduce de sus fallos.

- A. Un componente `Connectivity` que escucha el estado de red del sistema y lo expone como una sola fuente de verdad; las pantallas y la cabecera lo consumen (Recommended)
- B. Sin componente: cada petición fallida se pinta como error y el aviso de sin conexión se deduce del último fallo
- C. Un componente `Connectivity` que solo consulta al arrancar, sin escuchar cambios
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- **Actividad — qué enseña**: solo eventos recibidos —publicaciones propias, me gusta recibidos y comentarios recibidos—. El criterio AC7.1.3 de la historia US7.1 se corrige como error de redacción: dar me gusta a la opinión de otra persona no genera un evento.
- **Actividad — cómo se obtiene**: se calcula al abrir la pantalla a partir del contenido (fecha de cada opinión propia, me gusta recibidos y comentarios recibidos). No hay un registro de eventos aparte que pueda desincronizarse.
- **Estado social**: un único `ContentStore` posee opiniones, me gusta, comentarios y seguimiento, y notifica los cambios; los contadores viven con la opinión y nadie más los escribe.
- **Propiedad de la obra**: `Catalog` es el dueño de la obra y reúne el catálogo de ejemplo con los resultados de Spotify. Las opiniones referencian la obra por identificador y guardan un resumen de título y artista para poder pintarse sin sesión y sin red.
- **Spotify**: dos componentes. `SpotifyAuth` lleva la autorización PKCE, el token en almacenamiento seguro, la desconexión y el token inválido; `SpotifyCatalog` lleva búsqueda, metadatos y portadas y consume el token de `SpotifyAuth`.
- **Interfaz**: `AppShell` contiene la navegación y las seis pantallas como contenedores finos, más el aviso de sin conexión y el snackbar; `DesignSystem` contiene el tema y los componentes compartidos, con la tarjeta de opinión dentro.
- **Sin conexión**: un componente `Connectivity` escucha el estado de red del sistema y es la única fuente de verdad; las pantallas y la cabecera lo consumen.
- **Consecuencia a tener presente**: al elegir esto, el catálogo de componentes queda en nueve piezas —`AppShell`, `DesignSystem`, `AppSession`, `SpotifyAuth`, `SpotifyCatalog`, `Catalog`, `ContentStore`, `ActivityFeed` y `Connectivity`— y las entidades quedan repartidas sin dueños compartidos. La actividad calculada exige sembrar me gusta y comentarios recibidos con fecha; eso entra en el contenido de ejemplo y no en un almacén nuevo.

Does this all look correct before I generate the artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct
