# Requirements Analysis — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.
- intent-statement — `ideation/intent-capture/intent-statement.md`.
- scope-document — `ideation/scope-definition/scope-document.md`.
- wireframes — `ideation/rough-mockups/wireframes.md` (incluye el cambio de alcance del 2026-11-06: catálogo real de Spotify y sesión persistente).
- team-practices — `inception/practices-discovery/team-practices.md` (postura de pruebas y prácticas afirmadas).
- `aidlc/spaces/default/memory/project.md` — reglas duras afirmadas (app recorrible sin Spotify, token en almacenamiento seguro, PKCE, Expo Go, textos en español, degradar con mensaje y acción).

## Q1. [Alcance] ¿Entran las notificaciones locales en esta versión?

El `scope-document` las marcó como «Could» y los bocetos no les dieron pantalla ni superficie: no hay campana ni bandeja. Dejarlas dentro obliga a inventar un sitio donde mostrarlas.

- A. Fuera: la app no muestra notificaciones de ningún tipo (Recommended)
- B. Dentro, como aviso simulado dentro de la app, sin servicio de push
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q2. [Sesión de la app] ¿El login simulado se recuerda entre reinicios de la app?

El `scope-document` excluyó la persistencia del contenido, pero no dijo nada del login. Hoy el recorrido empieza siempre en Login; recordarlo cambiaría la primera pantalla que se ve al abrir.

- A. No: cada apertura empieza en Login y pide `demo` / `demo` (Recommended)
- B. Sí: recuerda que ya entraste y abre directo en Inicio, hasta que cierres sesión
- C. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q3. [Navegación] ¿Hay forma de cerrar sesión y volver al Login?

Los bocetos dicen que Login no se puede abandonar sin entrar, pero no incluyen ninguna acción de salida. Sin ella, la única forma de volver a ver Login es reiniciar la app.

- A. Sí: «Cerrar sesión» en Perfil, que vuelve al Login (Recommended)
- B. No: la app no ofrece cerrar sesión en esta versión
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q4. [Opiniones] ¿Se puede publicar más de una opinión sobre la misma obra?

Los bocetos abren el detalle de una obra y ofrecen «Opinar sobre esta obra», pero no dicen qué pasa si ya opinaste de ella. Es la regla que decide si el detalle muestra una opinión o una lista.

- A. No: una opinión por obra y persona; si ya existe, el detalle la muestra y no ofrece publicar otra (Recommended)
- B. Sí: varias opiniones por obra, y el detalle las lista
- C. Aún no definido
- X. Other (please specify)

[Answer]: A — una opinión por obra, que se pueda modificar en el futuro y que muestre la fecha de modificación

## Q11. [Seguimiento de Q4] ¿La edición de una opinión existe en esta versión?

Anoté que la opinión única se puede modificar y que se muestre la fecha de modificación. Falta decidir si la acción de editar existe ya o si solo se prepara el dato para más adelante.

- A. Sí, editar en esta versión: el detalle ofrece «Editar», se guarda la fecha de modificación y se muestra cuando es posterior a la de creación (Recommended)
- B. No: solo se guarda y se muestra la fecha de creación; la edición queda para una versión futura
- C. Sí, editar, pero sin mostrar la fecha de modificación
- X. Other (please specify)

[Answer]: A

## Q5. [Opiniones] ¿Qué límites tienen el texto y la valoración?

Sin límites, «Publicar» se habilita con criterios distintos en cada pantalla y las pruebas no tienen un caso claro de error. La valoración ya se dibuja como estrellas con número (`4/5`).

- A. Texto de 1 a 280 caracteres y valoración obligatoria de 1 a 5 estrellas enteras (Recommended)
- B. Texto de 1 a 500 caracteres y valoración opcional
- C. Sin límites definidos; se ajustan en el diseño funcional
- X. Other (please specify)

[Answer]: C

## Q6. [Datos de ejemplo] ¿Qué volumen de contenido de ejemplo queremos?

El `scope-document` pidió «una o dos tarjetas por pantalla», pero los bocetos necesitan un feed creíble y un catálogo de respaldo con el que poder publicar sin Spotify.

- A. 8–10 opiniones de 4–5 autores y 6–8 obras en el catálogo de ejemplo (Recommended)
- B. Mínimo: 2–3 opiniones y 3 obras de ejemplo
- C. Generoso: 20 o más opiniones y 12 obras de ejemplo
- X. Other (please specify)

[Answer]: A

## Q7. [Spotify] ¿Qué permisos pedimos a la cuenta de Spotify?

La búsqueda, los metadatos y las portadas del catálogo son datos públicos y no necesitan permisos de usuario. Pedir el perfil añadiría nombre y avatar reales a una app cuyo Perfil es simulado.

- A. Ningún permiso de usuario: solo catálogo público (búsqueda, metadatos y portadas) (Recommended)
- B. Pedir el perfil para mostrar el nombre y el avatar reales en Perfil
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q8. [Búsqueda] ¿Cómo se comporta la búsqueda del catálogo?

Los bocetos piden buscar en Spotify desde Explorar y desde Crear, y los límites de peticiones no se han medido. La forma de buscar decide cuántas peticiones se hacen y qué se prueba.

- A. Busca desde 2 caracteres, con una pausa de 400 ms antes de pedir, y guarda los resultados en memoria mientras dure la app (Recommended)
- B. Busca solo al enviar el texto (botón o Enter)
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q9. [Actividad] ¿Qué muestra Actividad y de dónde salen sus eventos?

Los bocetos enseñan tres tipos de evento (publicaste, me gustó, comentaron) agrupados por día. Falta decir si vienen precargados o solo se generan con el uso.

- A. Publicaciones propias, me gusta y comentarios recibidos; precargados con eventos de ejemplo y ampliados en vivo al usar la app (Recommended)
- B. Solo publicaciones propias, generadas al publicar
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q10. [Calidad] ¿Fijamos objetivos medibles para esta versión?

La fase de operación está omitida, así que no hay panel ni alertas; aun así, sin números el criterio de terminado queda en «se recorre». Estos objetivos se pueden comprobar a mano en el teléfono.

- A. Feed visible en menos de 1 s, búsqueda resuelta en menos de 2 s con red normal y ningún cierre inesperado en el recorrido de las seis pantallas (Recommended)
- B. Sin objetivos numéricos: basta con recorrer las seis pantallas sin errores
- C. Aún no definido
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

- **Notificaciones**: fuera; la app no muestra notificaciones de ningún tipo.
- **Sesión de la app**: el login simulado se recuerda; al reiniciar se abre directo en Inicio hasta que se cierre sesión.
- **Cerrar sesión**: existe «Cerrar sesión» en Perfil y vuelve al Login.
- **Opiniones por obra**: una opinión por obra y persona; si ya existe, el detalle la muestra y no ofrece publicar otra.
- **Edición**: la opinión se puede editar en esta versión; se guarda la fecha de modificación y se muestra cuando es posterior a la de creación.
- **Límites del texto y la valoración**: no se fijan aquí; se ajustan en el diseño funcional.
- **Contenido de ejemplo**: 8–10 opiniones de 4–5 autores y 6–8 obras en el catálogo de ejemplo.
- **Permisos de Spotify**: ninguno de usuario; solo catálogo público (búsqueda, metadatos y portadas).
- **Búsqueda**: desde 2 caracteres, con una pausa de 400 ms antes de pedir, y resultados guardados en memoria mientras dure la app.
- **Actividad**: publicaciones propias, me gusta y comentarios recibidos, precargados con eventos de ejemplo y ampliados en vivo.
- **Objetivos de calidad**: sin números de rendimiento; el criterio es recorrer las seis pantallas sin errores.

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
