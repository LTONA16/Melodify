# Requirements Analysis — Preguntas

Estas decisiones cierran los puntos que los artefactos anteriores dejaron abiertos antes de escribir requisitos verificables. El resto de capacidades ya está decidido en las fuentes de abajo y no se vuelve a preguntar.

## Sources

- [desc] Descripción inicial autoritativa: "Backend de Melodify: servicio REST /api/v1 en apps/api con Fastify, TypeScript, PostgreSQL y Prisma. Cuentas reales con handle y contrasena (Argon2id), JWT de acceso corto y refresh rotatorio; perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad. Contratos compartidos en packages/contracts y adaptadores en la app movil con respaldo local de solo lectura. Spotify permanece intacto en la app: PKCE y token en el dispositivo, el backend no toca tokens de Spotify."
- [scope] Alcance seleccionado: `feature`.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/intent-capture/intent-statement.md`: cuentas reales, contenido compartido y éxito funcional entre dispositivos.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/scope-definition/scope-document.md`: capacidades SC-01 a SC-10, LFPDPPP y verificación con dos dispositivos en la misma red local.
- `aidlc/spaces/default/codekb/Melodify/business-overview.md`: servicios implementados, recursos pendientes y reglas de negocio actuales.
- `aidlc/spaces/default/codekb/Melodify/architecture.md`: modular monolith Fastify, contratos compartidos y paginación prevista por cursor.
- `aidlc/spaces/default/codekb/Melodify/code-structure.md`: fronteras de código, servicios existentes y ausencia de `packages/data-access`.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`:CI con Vitest, esqueleto activado, `test-after`, sin entornos remotos y errores en español con «Reintentar».

## Q1. [Cumplimiento] ¿Qué regla concreta de consentimiento, borrado y retención se aplica bajo LFPDPPP?

La capacidad SC-09 y las maquetas ya fijaron consentimiento al crear la cuenta, borrado y retención; `scope-document.md` dejó abierto el plazo concreto (I-03). Este plazo tiene que quedar verificable antes de escribir los requisitos.

A. Consentimiento explícito al crear la cuenta; conservar cuenta y contenido mientras la cuenta esté activa; borrar o anonimizar en un plazo máximo de 30 días desde la solicitud de borrado. (Recommended)

B. Igual que A, pero con un plazo máximo de 90 días desde la solicitud de borrado.

C. Consentimiento implícito al usar la app; conservar los datos indefinidamente y dejar el borrado como acción manual sin plazo garantizado.

D. Consentimiento explícito al crear la cuenta; borrado inmediato de cuenta y contenido, conservando solo un registro de auditoría durante 30 días.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q2. [Producto] ¿Sobre qué obra musical se publica una opinión y cómo se identifica en el servicio?

La descripción dice «opiniones sobre contenido musical» y el backend no debe gestionar tokens ni credenciales de Spotify. Esta decisión fija el identificador que viaja en los contratos y evita inventar metadatos que el servicio no puede consultar.

A. Se permite opinar sobre canciones, álbumes y artistas; cada obra se identifica por su tipo y un ID externo opaco de Spotify guardado como texto, sin consultar ni guardar metadatos en el backend. (Recommended)

B. Solo se puede opinar sobre canciones, identificadas por un ID externo opaco de Spotify guardado como texto.

C. Solo se puede opinar sobre álbumes o artistas, identificados por un ID externo opaco de Spotify guardado como texto.

D. El servicio crea su propia obra con ID interno y la app le envía título y artista como texto libre.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q3. [Producto] ¿Qué reglas de contenido se aplican a una opinión?

El esquema actual ya fija valoración entre 0.5 y 5 y unicidad por autor y obra; falta cerrar el tamaño de la reseña y si la opinión publicada se edita, para que las pruebas tengan un criterio claro.

A. Valoración de 0.5 a 5 en pasos de 0.5; reseña de 1 a 2000 caracteres, sin aceptar texto solo en blanco; una opinión por autor y obra; la opinión publicada se puede editar. (Recommended)

B. Valoración de 0.5 a 5 en pasos de 0.5; reseña de 1 a 2000 caracteres, sin aceptar texto solo en blanco; una opinión por autor y obra; la opinión publicada no se edita: solo se crea y se lee.

C. Valoración entera de 1 a 5; reseña de 1 a 500 caracteres; una opinión por autor y obra; la opinión publicada se puede editar.

D. Sin límite de longitud ni unicidad por autor y obra; solo se exige que la reseña no esté vacía.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q4. [Producto] ¿Quién ve las opiniones en el feed y en la actividad?

Las capacidades SC-04 y SC-06 piden feed y seguimientos, pero no aclaran si el feed es global o depende de a quién se sigue. Esto cambia las reglas de visibilidad que hay que probar desde el segundo dispositivo.

A. Todas las cuentas ven todas las opiniones en un feed global; la actividad de cada cuenta muestra sus acciones públicas, y seguir a alguien no restringe esa lectura. (Recommended)

B. El feed muestra solo las opiniones de las cuentas que sigues y las propias; la actividad muestra lo mismo.

C. El feed es global, pero la actividad de una cuenta solo la ve su autor.

D. No hay feed global: solo se consulta la actividad desde el perfil de cada cuenta.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q5. [Técnico] ¿Cómo se paginan y ordenan el feed y la actividad?

`architecture.md` propone paginación por cursor con 20 elementos por defecto y 50 como máximo. Fijarlo como requisito evita respuestas ilimitadas y define el desempate cuando dos publicaciones tienen la misma fecha.

A. Paginación por cursor, 20 elementos por defecto y 50 como máximo; orden de más reciente a más antiguo con el ID como desempate estable. (Recommended)

B. Paginación por número de página, 20 por página y 50 como máximo; mismo orden y desempate.

C. Sin paginación: cada respuesta devuelve todo el contenido disponible.

D. Paginación por cursor, 10 elementos por defecto y 20 como máximo; mismo orden y desempate.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q6. [Seguridad] ¿Qué duración concreta se fija para la sesión?

El servicio ya tiene JWT de acceso corto, refresh rotatorio y hash del refresh en base de datos; la descripción no da minutos ni días. Estos valores son necesarios para requisitos y pruebas de expiración y reutilización.

A. Accesos de 15 minutos y refresh de 30 días; cada renovación rota el token y la reutilización de uno revocado revoca toda su familia. (Recommended)

B. Accesos de 30 minutos y refresh de 7 días; la rotación y la revocación por reutilización funcionan igual.

C. Accesos de 60 minutos y refresh de 90 días; la rotación y la revocación por reutilización funcionan igual.

D. Los tiempos los decide cada despliegue mediante variables de entorno, sin valores por defecto ni pruebas de una duración concreta.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q7. [Fiabilidad] ¿Qué hace la app cuando el servicio local no responde?

Las maquetas pidieron estados de error con recuperación y el equipo exige mensajes en español con «Reintentar». La app tiene un respaldo local de solo lectura; falta decidir si ese respaldo se muestra o se oculta durante el fallo.

A. Mostrar el respaldo local en solo lectura con un aviso en español y «Reintentar»; no permitir publicar, comentar, dar me gusta ni seguir hasta recuperar el servicio. (Recommended)

B. Bloquear la pantalla con un error en español y «Reintentar», sin mostrar el respaldo local.

C. Permitir seguir publicando en local y subir el contenido cuando el servicio vuelva.

D. Ocultar el error y seguir mostrando el contenido en memoria sin aviso.

E. Not yet defined.

X. Other (please specify)

[Answer]: A
