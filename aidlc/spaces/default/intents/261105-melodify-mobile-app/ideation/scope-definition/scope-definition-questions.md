# Scope Definition — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.
- [Q1]–[Q8] Respuestas de la etapa Feasibility & Constraints.
- intent-statement — `ideation/intent-capture/intent-statement.md`.
- feasibility-assessment, constraint-register — `ideation/feasibility/`.

## Q1. [Alcance] ¿Qué es el mínimo viable de esta versión?

El pedido nombra seis pantallas. Esta pregunta define qué significa "terminado" para la primera entrega, porque cambia cuánto trabajo entra antes de poder recorrer la app.

- A. Las seis pantallas navegables con contenido de ejemplo: es el mínimo que cumple el pedido
- B. Un subconjunto primero (login, inicio, explorar) y el resto en una segunda pasada
- C. Solo el esqueleto de navegación con las seis pantallas vacías, sin contenido
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q2. [Alcance] ¿Entran las funciones sociales avanzadas en esta versión?

En la etapa anterior quedó abierto si seguir usuarios, comentarios anidados y mensajería están dentro o fuera. Es la decisión que más cambia el tamaño de las pantallas de inicio, actividad y perfil.

- A. Fuera: solo se muestran opiniones de ejemplo, sin interacción social entre usuarios
- B. Dentro, pero simuladas con datos locales (seguir y comentar sin backend)
- C. Solo seguir usuarios; comentarios anidados y mensajería quedan fuera
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q3. [Alcance] ¿Entran las notificaciones push y la publicación en tiendas?

Ambas quedaron sin decisión y ambas chocan con la restricción de no usar cuentas de pago ni compilación en la nube.

- A. Fuera: solo Expo Go en el teléfono Android, sin notificaciones ni tiendas
- B. Notificaciones locales simuladas dentro de la app, sin servicio de push y sin tiendas
- C. Publicación en tienda, aunque requiera cuenta de desarrollador
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q4. [Alcance] ¿Cómo debe comportarse el login simulado?

Es la primera pantalla y define qué ve el usuario al abrir la app.

- A. Cualquier usuario y contraseña entran; no se valida nada
- B. Credenciales de ejemplo fijas (por ejemplo usuario `demo` / contraseña `demo`)
- C. Botón «Entrar» sin campos, o «Entrar como invitado»
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q5. [Priorización] ¿Cómo prefieres secuenciar el trabajo?

- A. Valor primero: login, luego inicio, explorar, crear, actividad y perfil, cada pantalla terminada antes de pasar a la siguiente
- B. Riesgo primero: primero la navegación y los componentes compartidos, después el contenido de cada pantalla
- C. Dependencia primero: el orden que impongan las dependencias técnicas, aunque no sea el más visible
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q6. [Datos] ¿Cuánto contenido de ejemplo necesita cada pantalla?

- A. Suficiente para que cada pantalla se vea poblada: varias tarjetas u opiniones por pantalla
- B. Mínimo: una o dos tarjetas por pantalla, solo para demostrar el diseño
- C. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q7. [Datos] ¿Lo que se crea en «crear» y lo que aparece en «actividad» debe sobrevivir al cierre de la app?

- A. No: todo vive en memoria y se reinicia al recargar; es una demo
- B. Sí: guardar en el almacenamiento local del dispositivo
- C. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q8. [Datos] Dejaste abierto si lo creado debe sobrevivir al cierre. ¿Lo cerramos para el backlog?

Lo pregunto porque es la diferencia entre una pantalla de «crear» que solo demuestra el flujo y una que guarda de verdad, y eso cambia el tamaño de esa pantalla y de «actividad».

- A. No guardar: lo creado vive en memoria y se reinicia al recargar (recomendado para esta versión)
- B. Guardar en el almacenamiento local del dispositivo con `AsyncStorage`
- C. Aún no definido; se decide al construir la pantalla de «crear»
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Resumen de lo respondido en esta etapa:

- **Mínimo viable**: las seis pantallas navegables con contenido de ejemplo; ese es el criterio de terminado.
- **Funciones sociales**: dentro, pero simuladas con datos locales — seguir y comentar sin backend.
- **Notificaciones y tiendas**: notificaciones locales simuladas dentro de la app; sin servicio de push y sin publicación en tiendas.
- **Login simulado**: credenciales de ejemplo fijas (`demo` / `demo`).
- **Secuenciación**: riesgo primero — navegación y componentes compartidos antes que el contenido de cada pantalla.
- **Contenido de ejemplo**: mínimo, una o dos tarjetas u opiniones por pantalla.
- **Persistencia**: no; lo creado vive en memoria y se reinicia al recargar.

- Looks correct
- Request changes

[Answer]: Looks correct
