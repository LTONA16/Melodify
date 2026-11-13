# Intent Capture & Framing — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.

## Q1. [Producto] ¿Qué problema de negocio resuelve Melodify?

Melodify nace como una app móvil sobre opiniones musicales. Antes de diseñar pantallas necesito entender qué necesidad concreta mueve el proyecto, porque eso define qué se prioriza cuando haya que recortar.

- A. Las personas no tienen un lugar dedicado para opinar y discutir sobre música con otros oyentes
- B. Las reseñas musicales existentes son demasiado profesionales o frías; falta una voz cotidiana y personal
- C. Descubrir música nueva depende de algoritmos; faltan recomendaciones de personas reales
- D. Es un proyecto académico o de portafolio para practicar desarrollo móvil con Expo
- E. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿Quién es el cliente objetivo y qué dolor tiene hoy?

**SAY:** "Esto define el tono de la app y el nivel de detalle de las pantallas."

- A. Oyentes casuales que quieren compartir qué les parece una canción o un álbum
- B. Fans intensos o coleccionistas que quieren debatir en profundidad con otros fans
- C. Creadores y músicos que buscan retroalimentación de su público
- D. Estudiantes y público joven que buscan una comunidad musical social
- E. No identificado
- X. Other (please specify)

[Answer]: D

## Q3. [Producto] ¿Cómo se mide el éxito de esta primera versión?

- A. Que las seis pantallas existan y se puedan recorrer sin errores en un dispositivo
- B. Que un usuario pueda registrarse, publicar una opinión y verla en el feed
- C. Que alguien externo al equipo entienda y use la app sin explicación
- D. Métricas de uso reales (usuarios, publicaciones, retención)
- E. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q4. [Producto] ¿Qué dispara la iniciativa ahora?

- A. Es un encargo o proyecto de evaluación con fecha de entrega
- B. Quiero lanzar una idea propia y probarla rápido
- C. Quiero practicar y demostrar habilidades de desarrollo móvil
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q5. [Producto] ¿Quiénes son los interesados y qué le importa a cada uno?

- A. Solo yo: me importa tener una base sólida para seguir construyendo
- B. Un equipo pequeño de desarrollo: les importa el código limpio y la estructura
- C. Un docente o evaluador: le importa el cumplimiento de los requisitos y la presentación
- D. Usuarios finales de prueba: les importa que la app se entienda y funcione
- E. No identificado
- X. Other (please specify)

[Answer]: B

## Q6. [Producto] ¿Quién decide el alcance y cómo se comunica el avance?

- A. Yo decido todo, sin cadencia de reporte formal
- B. Yo decido y reporto avances al equipo de forma informal
- C. Se revisa con un docente o cliente en hitos definidos
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q7. [Producto] ¿Qué deja fuera esta primera versión?

El alcance de trabajo elegido ya es `mvp` (un MVP que omite operaciones). La pregunta es sobre el producto: qué no debe hacer todavía esta primera entrega con pantallas de ejemplo.

- A. Sin backend real ni autenticación verdadera: todo con datos de ejemplo locales
- B. Sin integración con servicios musicales (Spotify, Apple Music, Last.fm)
- C. Sin funciones sociales avanzadas (seguir usuarios, comentarios anidados, mensajería)
- D. Sin notificaciones push ni publicación en tiendas de apps
- E. Ninguna de las anteriores; todo lo anterior queda también fuera
- X. Other (please specify)

[Answer]: B

## Q8. [Producto] ¿Esta primera versión incluye backend real o solo datos de ejemplo?

El pedido original dice "por el momento utiliza placeholders" y el éxito se midió como recorrer las pantallas sin errores, pero también se pidió una pantalla de login. Necesito saber si el login debe validar cuentas reales contra un servidor o solo simular el ingreso.

- A. Solo placeholders: sin backend, el login simula el ingreso y todo el contenido es datos de ejemplo locales
- B. Login simulado con datos locales persistidos en el dispositivo (sin servidor)
- C. Backend real para autenticación y publicaciones desde esta primera versión
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Resumen de lo respondido:

- **Problema**: las personas no tienen un lugar dedicado para opinar y discutir sobre música con otros oyentes.
- **Cliente objetivo**: estudiantes y público joven que buscan una comunidad musical social.
- **Éxito de esta primera versión**: que las seis pantallas existan y se puedan recorrer sin errores en un dispositivo.
- **Disparador**: practicar y demostrar habilidades de desarrollo móvil.
- **Interesados**: un equipo pequeño de desarrollo al que le importa el código limpio y la estructura.
- **Decisión y comunicación**: tú decides el alcance y reportas avances al equipo de forma informal, sin cadencia formal.
- **Fuera de esta versión**: integración con servicios musicales (Spotify, Apple Music, Last.fm).
- **Alcance técnico**: solo placeholders, sin backend; el login simula el ingreso y todo el contenido son datos de ejemplo locales.

- Looks correct
- Request changes

[Answer]: Looks correct

## Assumption Confirmation

Supuestos registrados en los documentos de esta etapa:

- La app apuntará a iOS y Android sobre Expo React Native; todavía no se definieron versiones mínimas de sistema operativo.
- La interfaz y los textos de la app estarán en español, igual que esta conversación.

- A. Accept assumptions
- B. Convert to follow-up questions

[Answer]: A. Accept assumptions

## Q9. [Producto] ¿A qué plataformas apunta la app y en qué idioma va la interfaz?

Surgió al revisar los supuestos de esta etapa: la plataforma objetivo y el idioma de la interfaz.

- A. Principalmente Android, contemplando también iOS
- B. Solo Android
- C. iOS y Android por igual
- D. Aún no definido
- X. Other (please specify)

[Answer]: Principalmente Android, contemplando también iOS; la interfaz está bien en español
