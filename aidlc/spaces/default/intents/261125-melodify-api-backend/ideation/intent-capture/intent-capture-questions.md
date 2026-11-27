# Captura y Encuadre del Intento — Preguntas

## Sources

- [desc] Initial description: "Backend de Melodify: servicio REST /api/v1 en apps/api con Fastify, TypeScript, PostgreSQL y Prisma. Cuentas reales con handle y contrasena (Argon2id), JWT de acceso corto y refresh rotatorio; perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad. Contratos compartidos en packages/contracts y adaptadores en la app movil con respaldo local de solo lectura. Spotify permanece intacto en la app: PKCE y token en el dispositivo, el backend no toca tokens de Spotify."
- [scope] Workflow-selected scope: `feature`.
- [memory:M1] `aidlc/spaces/default/memory/project.md#Corrections`: "El backend, la autenticación real y la persistencia en servidor están permitidos en este proyecto a partir del intento 261125-melodify-api-backend: quedan sustituidas para ese trabajo las reglas NEVER de §Forbidden que los prohibían, con su alcance y sus límites en el scope-document del intento (el client secret de Spotify sigue prohibido y PKCE sigue vigente en la app). (learned 2026-11-25)"
- [memory:M2] `aidlc/spaces/default/memory/project.md#Forbidden`: "NEVER incluir el client secret de Spotify en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*`: es un cliente público y PKCE no lo necesita. (`wireframes` §Cambio de alcance; `constraint-register` CT-04) (affirmed 2026-11-06)"
- [memory:M3] `aidlc/spaces/default/memory/project.md#Mandated`: "ALWAYS obtener el client ID de Spotify desde una variable de entorno (`EXPO_PUBLIC_SPOTIFY_CLIENT_ID`) y autorizar con PKCE. (`wireframes` §Cambio de alcance; `constraint-register` CT-04 sustituida) (affirmed 2026-11-06)"

## Q1. [Producto] ¿Qué problema de negocio resuelve este backend?

La app de Melodify guarda hoy autores, opiniones y me gusta en la memoria del teléfono. Esta iniciativa pone un servicio detrás de esa app, y necesito saber qué mejora perseguimos para no diseñar de más.

A. Las cuentas y las opiniones dejan de ser simuladas: cada persona tiene su cuenta real y lo que publica lo ven las demás, desde cualquier dispositivo.
B. La app necesita un lugar único donde vivir el contenido, para que el equipo pueda evolucionar sin publicar una versión nueva en las tiendas.
C. Queremos una API reutilizable para que en el futuro otros clientes (web, escritorio, terceros) consuman Melodify.
D. Una combinación de las anteriores.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿Cómo se relaciona este trabajo con el servicio que ya existe en `apps/api`?

En el repositorio ya hay un servicio con Fastify, Prisma, autenticación con Argon2id y JWT, y pruebas. Saber si se extiende o se rehace cambia cuánto se conserva y qué se documenta.

A. Se extiende y completa: lo que falta es perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad sobre la base actual.
B. Se toma como prototipo y se rehace con el diseño que salga de este trabajo.
C. Solo se documenta y valida lo ya construido; no se añade funcionalidad nueva.
D. Parte se conserva y parte se rehace; hay que decidirlo dentro de este trabajo.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q3. [Producto] ¿Quién usa la app y qué dolor tiene hoy que este backend resuelve?

El mapa de interesados y las métricas de éxito dependen de quién es el cliente, así que quiero fijarlo antes de escribir nada.

A. Personas que escuchan música y quieren compartir y leer opiniones con otros oyentes, no solo consigo mismas.
B. Un grupo cerrado (equipo, comunidad, aula) que quiere un espacio propio para comentar música.
C. El propio equipo de Melodify, que necesita datos reales para probar y evolucionar la app.
D. Varios de los anteriores.
E. Not identified.
X. Other (please specify)

[Answer]: A

## Q4. [Producto] ¿Qué resultado medible dirá que este trabajo salió bien?

Sin una medida concreta no podremos decir si el backend cumplió su propósito.

A. Personas con cuenta real que publican, comentan, dan me gusta y siguen a otras, y todo eso se ve desde un segundo dispositivo.
B. El contenido deja de perderse al reinstalar la app o cambiar de teléfono.
C. La app sigue funcionando con el respaldo de solo lectura cuando no hay conexión, y completa cuando el servicio está disponible.
D. Varias de las anteriores.
E. Not yet defined.
X. Other (please specify)

[Answer]: D (A y B)

## Q5. [Producto] ¿Qué dispara este trabajo ahora?

La app móvil ya está construida y validada; el backend sería el siguiente paso. Saber el disparador ayuda a decidir qué se adelanta y qué puede esperar.

A. La app móvil ya está terminada y el contenido simulado es el límite natural para seguir.
B. Hay personas esperando usar la app con cuentas reales.
C. Una necesidad técnica: la lógica y los datos no pueden seguir viviendo dentro de la app.
D. Una oportunidad o exigencia externa (descríbela en «Other»).
E. Not yet defined.
X. Other (please specify)

[Answer]: C

## Q6. [Negocio] ¿Quiénes son las partes interesadas y qué le importa a cada una?

El mapa de interesados no puede inventar roles: dime quién más tiene voz en este trabajo y qué le preocupa.

A. Solo yo (propietario del producto y desarrollador); me importa que la app siga siendo usable y que el trabajo no se desborde.
B. Yo y el equipo de desarrollo; al equipo le importan el mantenimiento, las pruebas y el CI.
C. Hay una persona de producto o negocio que define prioridades y un equipo que las ejecuta.
D. Hay usuarios o una comunidad que ya esperan la función y dan su opinión.
E. Not identified.
X. Other (please specify)

[Answer]: B

## Q7. [Negocio] ¿Quién decide el alcance y cómo se comunica el avance?

Con esto fijo quién aprueba los cortes del trabajo y qué cadencia de reporte queda registrada.

A. Decido yo; no hace falta reporte más allá de las aprobaciones de este trabajo.
B. Decido yo, con el criterio técnico del equipo; reporte al cerrar cada etapa.
C. Deciden producto y técnico en conjunto; demostración al final de cada bloque.
D. Hay aprobación externa (cliente, socio) antes de avanzar; reporte periódico acordado.
E. Not applicable.
X. Other (please specify)

[Answer]: A

## Q8. [Producto] ¿Qué NO debe hacer esta primera versión? (select all that apply)

El alcance de este trabajo ya está elegido (feature); lo que falta es el límite del producto. Marca todo lo que queda fuera de esta primera versión.

A. No gestionar tokens de Spotify ni reproducir audio: la conexión con Spotify sigue en la app con PKCE.
B. No publicar en Google Play ni en App Store, ni configurar compilación en la nube.
C. No incluir panel de administración, moderación ni roles de administrador.
D. No incluir tiempo real (websockets, notificaciones push) ni chat.
E. Ninguno de estos: todo lo anterior entra en esta versión.
X. Other (please specify)

[Answer]: A, B, C

## Consolidated Summary Confirmation

- Problema: las cuentas y las opiniones dejan de ser simuladas; cada persona tiene su cuenta real y lo que publica lo ven las demás desde cualquier dispositivo.
- Relación con lo existente: se extiende y completa el servicio de `apps/api`; falta perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad sobre la base actual.
- Cliente: personas que escuchan música y quieren compartir y leer opiniones con otros oyentes, no solo consigo mismas.
- Éxito: cuentas reales en uso (publicar, comentar, dar me gusta, seguir, y verse desde un segundo dispositivo) y el contenido ya no se pierde al reinstalar la app o cambiar de teléfono.
- Disparador: necesidad técnica — la lógica y los datos no pueden seguir viviendo dentro de la app.
- Interesados: yo (producto y desarrollo) y el equipo de desarrollo, al que le importan el mantenimiento, las pruebas y el CI.
- Decisión y comunicación: decido yo; no hay reporte más allá de las aprobaciones de este trabajo.
- Fuera de esta primera versión: tokens de Spotify y reproducción de audio, publicación en tiendas y compilación en la nube, panel de administración, moderación y roles de administrador.

- Looks correct
- Request changes

[Answer]: Looks correct

## Assumption Confirmation

Supuestos declarados en `intent-statement.md`:

1. No se fijó un objetivo numérico de éxito; la medida acordada es funcional (contenido compartido entre dispositivos y que sobreviva a reinstalar).
2. No se decidió qué pasa con el contenido creado localmente en los teléfonos antes de que exista el backend: si se migra, se descarta o se queda solo en el dispositivo.
3. La moderación queda fuera de esta primera versión por decisión explícita; conviene revisarla si el contenido pasa a ser público.

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions
