# Requisitos — Backend de Melodify

## Sources

- [desc] Descripción inicial autoritativa: "Backend de Melodify: servicio REST /api/v1 en apps/api con Fastify, TypeScript, PostgreSQL y Prisma. Cuentas reales con handle y contrasena (Argon2id), JWT de acceso corto y refresh rotatorio; perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad. Contratos compartidos en packages/contracts y adaptadores en la app movil con respaldo local de solo lectura. Spotify permanece intacto en la app: PKCE y token en el dispositivo, el backend no toca tokens de Spotify."
- [scope] Alcance `feature`, con esqueleto activado y verificación real entre dos dispositivos en la misma red local.
- `intent-statement.md`: origen del problema y de la métrica de éxito funcional.
- `scope-document.md`: capacidades SC-01 a SC-10, límites del MVP y obligación LFPDPPP.
- `business-overview.md`: servicios ya implementados, recursos pendientes y reglas de negocio existentes.
- `architecture.md`: modular monolith Fastify, contratos compartidos, paginación prevista y health check.
- `code-structure.md`: fronteras de código, servicios existentes y ausencia de `packages/data-access`.
- `team-practices.md`: CI con Vitest y PostgreSQL de prueba, `test-after`, sin entornos remotos y errores en español con «Reintentar».
- `requirements-analysis-questions.md`: decisiones Q1 a Q7 sobre retención, obra musical, contenido de la opinión, visibilidad, paginación, sesión y degradación.

## Intent analysis

Melodify necesita sustituir el contenido en memoria de la app por un servicio REST local con identidad real y persistencia compartida, sin tocar el flujo de Spotify en el dispositivo. El objetivo no es añadir pantallas: es que dos dispositivos en la misma red local vean el mismo contenido creado por cuentas reales.

El éxito se observa con este recorrido: crear una cuenta real en el dispositivo A, publicar una opinión sobre una obra musical, verla en el dispositivo B, y mantener el recorrido también para perfiles, me gusta, comentarios, seguimientos, feed y actividad. El esqueleto de este intento usa la parte mínima de ese recorrido; el resto de capacidades se construye sobre la misma base.

La complejidad es estándar: el dominio está acotado, el servicio ya tiene autenticación y esquema, y las incógnitas abiertas se cerraron en Q1-Q7. El tipo de cambio es una feature brownfield con integración en la app móvil.

## Functional requirements

### FR1 — Cuentas y sesión

- **FR1.1** Registro de cuenta con `handle` único y contraseña almacenada solo como hash Argon2id. Criterio: dos registros con el mismo `handle` no crean dos cuentas; la respuesta nunca incluye la contraseña ni el hash.
- **FR1.2** El acceso usa JWT de 15 minutos y un refresh de 30 días guardado como hash en base de datos. Criterio: un token de acceso caduca a los 15 minutos y el refresh a los 30 días; el valor plano del refresh no se persiste.
- **FR1.3** Cada renovación rota el refresh y devuelve un par nuevo. Criterio: reutilizar un refresh ya rotado revoca toda su familia y obliga a iniciar sesión de nuevo.
- **FR1.4** Cierre de sesión revoca el refresh de la sesión actual. Criterio: después del cierre, ese refresh y los derivados de él dejan de renovar acceso.
- **FR1.5** Registro y acceso validan los límites de `handle` y contraseña definidos en A1. Criterio: valores vacíos, fuera de rango o con formato inválido devuelven un error de campo en español y no crean cuenta ni sesión.

### FR2 — Perfiles

- **FR2.1** Toda cuenta tiene un perfil público con `handle`, nombre visible, biografía opcional y avatar opcional. Criterio: cualquier cuenta autenticada puede leer el perfil de otra cuenta.
- **FR2.2** El `handle` es único de forma case-insensitive y sirve como identificador público estable. Criterio: `Ana` y `ana` no pueden coexistir como dos cuentas distintas.
- **FR2.3** La cuenta dueña puede actualizar nombre, biografía y avatar. Criterio: otra cuenta no puede modificar esos campos; el avatar se guarda como referencia de texto, no como archivo en el servicio.

### FR3 — Obras y opiniones

- **FR3.1** Una obra se identifica por su tipo —`cancion`, `album` o `artista`— y un ID externo opaco de Spotify guardado como texto. Criterio: se conservan mayúsculas, ceros a la izquierda y longitud exacta del ID; el backend no consulta Spotify ni guarda metadatos ni tokens.
- **FR3.2** Una cuenta autenticada puede publicar una opinión con valoración de 0.5 a 5 en pasos de 0.5 y reseña de 1 a 2000 caracteres, sin texto solo en blanco. Criterio: solo existe una opinión por autor y obra; un duplicado se rechaza con conflicto y mensaje en español.
- **FR3.3** La cuenta autenticada puede editar su propia opinión respetando las mismas reglas de valoración y reseña. Criterio: autor y fecha de creación no cambian; otra cuenta no puede editarla.
- **FR3.4** Toda cuenta autenticada puede leer una opinión individual y las opiniones asociadas a una obra. Criterio: las respuestas devuelven autor, obra, valoración, reseña y fechas, sin secretos.
- **FR3.5** Una valoración o reseña inválida se rechaza en el servidor con el campo responsable. Criterio: 0.49, 5.1, 0.75, reseña vacía, solo espacios y 2001 caracteres son rechazados; 0.5, 5 y 2000 caracteres son aceptados.
- **FR3.6** Al borrar una cuenta se eliminan o anonimizan sus opiniones dentro del plazo de FR8.2. Criterio: no queda opinión que muestre el handle o datos personales de la cuenta borrada.

### FR4 — Feed y actividad

- **FR4.1** El feed es global: todas las cuentas autenticadas ven todas las opiniones publicadas. Criterio: la opinión creada en el dispositivo A aparece en el dispositivo B aunque B no siga a A.
- **FR4.2** La actividad de una cuenta muestra sus acciones públicas: publicación, edición, me gusta, comentario, seguimiento y dejar de seguir. Criterio: solo se muestran acciones de la cuenta consultada y ninguna acción privada.
- **FR4.3** Feed y actividad usan paginación por cursor con 20 elementos por defecto y 50 como máximo. Criterio: el orden es de más reciente a más antiguo y los empates se resuelven por ID de forma estable; un cursor inválido devuelve error de campo en español.
- **FR4.4** Una lista vacía, una lista en carga y una lista con error son estados distintos. Criterio: la respuesta vacía dice que todavía no hay contenido; el error dice qué pasó y ofrece «Reintentar» en la app.

### FR5 — Me gusta y comentarios

- **FR5.1** Una cuenta puede dar y quitar su me gusta a una opinión, con operación idempotente. Criterio: repetir me gusta no duplica el contador ni crea varias filas; repetir la retirada no cuenta dos bajas.
- **FR5.2** Una cuenta puede comentar una opinión con texto de 1 a 1000 caracteres, sin texto solo en blanco. Criterio: el comentario queda asociado a su autor y a la opinión; el servidor rechaza los mismos casos inválidos que rechaza la app.
- **FR5.3** Los comentarios se pueden listar con el mismo esquema de cursor que el feed. Criterio: una lista vacía se distingue de un error y el orden es estable por fecha e ID.
- **FR5.4** Contadores de me gusta y comentarios se derivan de los registros persistidos. Criterio: dos dispositivos que consultan la misma opinión ven el mismo contador después de que la escritura se confirme.

### FR6 — Seguimientos

- **FR6.1** Una cuenta puede seguir y dejar de seguir a otra cuenta, sin seguirse a sí misma. Criterio: la operación es idempotente y existe como máximo una relación por par de cuentas.
- **FR6.2** Se pueden listar seguidores y seguidos con paginación por cursor. Criterio: las listas respetan el orden estable por fecha e ID y devuelven perfiles públicos, nunca secretos.
- **FR6.3** Seguir a una cuenta no restringe el feed global. Criterio: FR4.1 sigue cumpliéndose aunque la cuenta no siga a ninguna otra.

### FR7 — Errores y degradación en la app

- **FR7.1** Todo mensaje de error del servicio que llega a una pantalla está en español, en lenguaje llano y nombra el campo o la acción afectada. Criterio: la pantalla no muestra códigos técnicos, stack traces ni mensajes en inglés.
- **FR7.2** Si el servicio local no responde, la app muestra el respaldo local en solo lectura con aviso en español y «Reintentar». Criterio: mientras falla el servicio no se permiten publicar, comentar, dar me gusta ni seguir; cuando vuelve, datos frescos sustituyen al respaldo sin reinicio manual.
- **FR7.3** Formularios y acciones gestionan envío duplicado, entrada inválida y sesión expirada a mitad de flujo. Criterio: un doble toque no crea dos opiniones ni dos comentarios; el error mantiene lo escrito; tras reautenticar se reanuda la acción sin pérdida.

### FR8 — Consentimiento, retención y borrado

- **FR8.1** El registro exige consentimiento explícito y queda asociado a la cuenta con fecha y versión del aviso. Criterio: no se puede crear cuenta sin ese consentimiento y la evidencia se elimina con la cuenta.
- **FR8.2** Cuenta y contenido se conservan mientras la cuenta esté activa. Criterio: tras solicitar borrado, cuenta, perfil, opiniones, me gusta, comentarios y seguimientos se eliminan o anonimizan en un plazo máximo de 30 días, sin conservación adicional de datos personales.
- **FR8.3** Los derechos de la persona sobre sus datos se atienden dentro del alcance implementado: consentimiento, rectificación de perfil y borrado. Criterio: no queda dato personal accesible desde la API después de completarse el borrado.

### FR9 — Salud del servicio

- **FR9.1** El servicio expone una ruta de salud para el recorrido local. Criterio: responde correctamente cuando la API y la conexión a PostgreSQL están disponibles y falla de forma explícita cuando no lo están.

## Non-functional requirements

- **NFR1 — Seguridad.** Contraseñas con Argon2id, secretos solo por variables de entorno, entradas validadas en el servidor, sin secretos en logs, URLs, respuestas ni mensajes de pantalla. Las reglas de la app se refuerzan siempre en el servicio.
- **NFR2 — Sesión.** Los tiempos de FR1.2 y FR1.3 se aplican mediante un reloj de confianza; en el instante exacto de caducidad el token deja de ser válido y la reutilización de refresh revoca la familia completa.
- **NFR3 — Fiabilidad.** Toda llamada a base de datos o al servicio tiene timeout; un fallo de un recurso degrada solo ese recurso; las escrituras multientidad usan transacción y una escritura rechazada no se presenta como aceptada. El respaldo local de FR7.2 no pierde escrituras ya confirmadas.
- **NFR4 — Concurrencia y consistencia.** Restricciones únicas en base de datos para handle, opinión por autor y obra, me gusta y seguimiento. Dos dispositivos que actúan a la vez producen el mismo resultado que en secuencia; la respuesta más reciente prevalece y ninguna acción se pierde silenciosamente.
- **NFR5 — Datos y tiempo.** IDs externos se tratan como cadenas opacas preservando caso, longitud y ceros; `handle` se compara de forma case-insensitive; instantes se guardan con offset; los empates se ordenan por ID; textos con emoji, marcas combinantes o saltos de línea se validan por caracteres visibles.
- **NFR6 — Rendimiento y escalabilidad.** No hay objetivo numérico de latencia en este alcance. Las respuestas de listas están limitadas a 50 elementos por página, con cursor, para evitar respuestas ilimitadas.
- **NFR7 — Observabilidad.** Health check de FR9.1 y logs que identifiquen operación y resultado sin contraseñas, tokens ni datos personales. Los errores se registran en el servicio y se devuelven al cliente con mensaje en español.
- **NFR8 — Calidad y pruebas.** TypeScript estricto, ESLint y Prettier, contratos en `packages/contracts`, cadencia `test-after`, Vitest con `TEST_DATABASE_URL` y PostgreSQL de servicio. Umbrales: 80 % de líneas en `app/src/**`; 80 % de líneas, sentencias y funciones y 70 % de ramas en `apps/api/src/**`, sin `server.ts`.
- **NFR9 — Despliegue y compatibilidad.** Solo ejecución local con Docker y PostgreSQL en el portátil; sin staging, nube ni túneles. La API es `/api/v1`; Swagger UI se sirve solo fuera de producción; la app se mantiene dentro de APIs de Expo Go.
- **NFR10 — Cumplimiento.** Reglas de LFPDPPP para consentimiento, minimización, rectificación y borrado dentro del plazo de FR8.2, sin conservar datos personales una vez completada la eliminación.

## Constraints

- Backend en `apps/api` con Fastify, TypeScript, PostgreSQL y Prisma; contratos compartidos en `packages/contracts`.
- Servicio y base de datos solo en el portátil con Docker; verificación con dos dispositivos en la misma red local.
- Spotify sigue en la app con PKCE y token en almacenamiento seguro del dispositivo; el backend no recibe tokens ni client secret.
- `develop` es rama de integración; `main` recibe solo entregas por squash. Todo cambio entra por PR con plantilla, título Conventional Commit y CI en verde.
- CI ejecuta commitlint, `npm run typecheck`, `npm run lint`, `npm test` y Vitest de `apps/api` con `TEST_DATABASE_URL`.
- Cambios de esquema requieren migración de reversión revisada y autorización en el PR.
- El estado actual del código: autenticación, esquema y contratos ya existen; faltan las rutas sociales y el adaptador HTTP de la app.

## Assumptions

- **A1** `handle` de 3 a 30 caracteres, letras minúsculas, dígitos y guion bajo; contraseña de 8 a 128 caracteres no solo espacios. Motivo: el esquema no fija límites y el servidor necesita reglas comprobables; se puede corregir antes de Contract Design.
- **A2** Comentario de 1 a 1000 caracteres no solo espacios. Motivo: extiende la validación de texto ya aplicada a reseñas sin introducir almacenamiento nuevo.
- **A3** Avatar es una URL de texto opcional, sin subida de archivos en el backend. Motivo: el alcance no incluye almacenamiento de imágenes ni entornos remotos.
- **A4** La app envía tipo e ID opaco; el backend no resuelve metadatos de Spotify. Motivo: Q1-Q7 y la descripción prohíben que el servicio gestione tokens o credenciales.
- **A5** No se fija objetivo numérico de latencia ni disponibilidad. Motivo: el alcance excluye objetivos numéricos de rendimiento y la verificación acordada es funcional entre dos dispositivos.
- **A6** La exportación automática de datos personales no forma parte de esta versión. Motivo: el alcance pide consentimiento, borrado y retención; no define una experiencia de exportación.

## Out of scope

- Reproducción de audio, notificaciones push y publicación en tiendas.
- Chat, moderación, roles, panel de administración y cuentas de administrador.
- Login simulado, contenido simulado y persistencia en memoria como fuente de verdad; el respaldo local solo permite lectura temporal.
- Token, client secret o cualquier credencial de Spotify en el backend.
- Staging, producción, nube, túneles y backend gestionado.
- Objetivos numéricos de audiencia o rendimiento.
- Feed filtrado por seguimientos; Q4 eligió feed global.
- Borrado independiente de opiniones o comentarios fuera del borrado de cuenta; Q3 eligió edición, no borrado suelto.
- Exportación automática de datos personales; queda descrita en A6.

## Open questions

None.
