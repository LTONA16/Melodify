# Historias de usuario

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: 51 requisitos con IDs FR1-FR9 y NFR1-NFR10.
- `aidlc/spaces/default/codekb/Melodify/business-overview.md`: reglas de negocio vigentes y recursos pendientes en el servicio.
- `aidlc/spaces/default/codekb/Melodify/component-inventory.md`: frontera entre API, contratos, app y paquetes compartidos.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/personas.md`: tres personas funcionales.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/user-stories-questions.md`: Q1-A, Q2-A, Q3-A y Q4-A.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: esqueleto activado y verificación real entre dos dispositivos.

## Plan de historias

- **Personas**: 3 (`Reseñador`, `Oyente`, `Curador social`).
- **Historias**: 16, agrupadas por área de dominio funcional.
- **Formato**: `Como [persona], quiero [acción], para que [beneficio]` con criterios Dado/Cuando/Entonces.
- **Prioridades**: `Must Have` para identidad, perfil, opiniones, feed y cumplimiento; `Should Have` para interacciones y actividad; `Could Have` para edición, paginación avanzada y degradación. Ninguna capacidad del alcance aprobado se marca `Won't Have`.

## US1.1 — Crear cuenta real

- **Historia**: Como `Reseñador`, quiero crear una cuenta con un `handle` único y una contraseña segura, para que mi contenido tenga una identidad real compartida entre dispositivos.
- **Prioridad**: Must Have
- **Requisitos**: FR1.1, FR1.5, FR2.2, A1, NFR1, NFR5.
- **Dependencias**: Ninguna.
- **Criterios de aceptación**:
  - **AC1.1.1**: Dado un `handle` y una contraseña válidos, cuando creo la cuenta, entonces se guarda solo el hash Argon2id y la respuesta no incluye contraseña ni hash.
  - **AC1.1.2**: Dado un `handle` existente escrito con otra capitalización, cuando intento crear otra cuenta, entonces recibo un conflicto en español y no se crea una segunda cuenta.
  - **AC1.1.3**: Dado un `handle` o una contraseña vacíos, fuera de rango o con formato inválido, cuando envío el registro, entonces recibo el error del campo correspondiente y no se crea la cuenta.
- **INVEST**: Independiente y pequeña: cubre solo registro; valiosa para la identidad real; estimable con las reglas A1; verificable con el duplicado case-insensitive; negociable solo en los límites de A1 antes de Contract Design.

## US1.2 — Acceder y renovar sesión

- **Historia**: Como `Reseñador`, quiero iniciar sesión y renovar mi sesión con un refresh rotatorio, para que pueda publicar desde cualquiera de los dos dispositivos sin credenciales persistentes en claro.
- **Prioridad**: Must Have
- **Requisitos**: FR1.2, FR1.3, NFR2.
- **Dependencias**: US1.1.
- **Criterios de aceptación**:
  - **AC1.2.1**: Dado un acceso válido, cuando inicio sesión, entonces recibo un JWT de 15 minutos y un refresh de 30 días guardado solo como hash.
  - **AC1.2.2**: Dado un refresh vigente, cuando renuevo la sesión, entonces recibo un par nuevo y el refresh anterior deja de ser válido.
  - **AC1.2.3**: Dado un refresh ya rotado, cuando intento reutilizarlo, entonces se revoca toda su familia y debo iniciar sesión de nuevo.
- **INVEST**: Independiente de las historias de contenido; valiosa para escribir desde dos dispositivos; estimable por los TTL acordados; verificable con reloj de confianza; negociable solo en los tiempos ya fijados en Q6-A.

## US1.3 — Cerrar sesión

- **Historia**: Como `Reseñador`, quiero cerrar sesión, para que el refresh de ese dispositivo y sus derivados dejen de renovar acceso.
- **Prioridad**: Must Have
- **Requisitos**: FR1.4.
- **Dependencias**: US1.2.
- **Criterios de aceptación**:
  - **AC1.3.1**: Dado una sesión activa, cuando cierro sesión, entonces se revoca el refresh actual y todos los derivados de esa familia.
  - **AC1.3.2**: Dado un refresh revocado, cuando intento renovar, entonces recibo un error en español y no se emite un access token nuevo.
- **INVEST**: Independiente del resto del dominio social; valiosa para control de sesión; estimable por una sola revocación; verificable con la familia de refresh; negociable solo en el mensaje de error.

## US2.1 — Ver y editar perfil público

- **Historia**: Como `Oyente`, quiero ver el perfil público de otra cuenta y editar el mío, para que la comunidad pueda reconocer quién publica cada opinión sin exponer secretos.
- **Prioridad**: Must Have
- **Requisitos**: FR2.1, FR2.2, FR2.3, A3.
- **Dependencias**: US1.1.
- **Criterios de aceptación**:
  - **AC2.1.1**: Dado cualquier cuenta autenticada, cuando consulto el perfil de otra cuenta, entonces veo `handle`, nombre visible, biografía opcional y avatar opcional, sin secretos.
  - **AC2.1.2**: Dado el perfil propio, cuando actualizo nombre, biografía o avatar, entonces se guardan los cambios; otra cuenta no puede modificarlos.
  - **AC2.1.3**: Dado un avatar configurado, cuando consulto el perfil, entonces el servicio devuelve una referencia de texto y no intenta almacenar un archivo.
- **INVEST**: Independiente de opiniones; valiosa para atribución; estimable por tres campos; verificable con permisos de edición; negociable en el formato de avatar ya acotado por A3.

## US3.1 — Publicar opinión sobre una obra

- **Historia**: Como `Reseñador`, quiero publicar una opinión con valoración y reseña sobre una obra identificada por su tipo e ID externo, para que el resto de cuentas puedan descubrir y leer mi criterio.
- **Prioridad**: Must Have
- **Requisitos**: FR3.1, FR3.2, FR3.5, A2, A4, NFR5.
- **Dependencias**: US1.2, US2.1.
- **Criterios de aceptación**:
  - **AC3.1.1**: Dado un tipo `cancion`, `album` o `artista` y un ID externo opaco, cuando publico, entonces el servicio conserva mayúsculas, ceros a la izquierda y longitud exacta, sin consultar Spotify ni guardar metadatos o tokens.
  - **AC3.1.2**: Dado un autor y una obra sin opinión previa, cuando publico con valoración y reseña válidas, entonces se crea una sola opinión.
  - **AC3.1.3**: Dado un duplicado del mismo autor y obra, cuando publico de nuevo, entonces recibo un conflicto en español y no se crea otra opinión.
  - **AC3.1.4**: Dado 0.49, 5.1, 0.75, reseña vacía, solo espacios o 2001 caracteres, cuando publico, entonces el servicio rechaza el campo responsable; 0.5, 5 y 2000 caracteres son aceptados.
- **INVEST**: Independiente del feed; valiosa como contenido central; estimable por reglas ya fijadas; verificable en servidor y segundo dispositivo; negociable solo en mensajes de error.

## US3.2 — Editar propia opinión

- **Historia**: Como `Reseñador`, quiero editar mi opinión publicada, para que puedo corregir mi valoración o reseña sin perder la autoría ni la fecha original.
- **Prioridad**: Could Have
- **Requisitos**: FR3.3.
- **Dependencias**: US3.1.
- **Criterios de aceptación**:
  - **AC3.2.1**: Dado que soy autor de una opinión, cuando edito valoración y reseña válidas, entonces el cambio se guarda y autor y fecha de creación permanecen iguales.
  - **AC3.2.2**: Dado que no soy el autor, cuando intento editar, entonces recibo un error en español y la opinión queda intacta.
  - **AC3.2.3**: Dado un valor inválido durante la edición, cuando guardo, entonces la opinión anterior sigue vigente y veo el error del campo.
- **INVEST**: Independiente de otras historias de lectura; valiosa para corregir contenido; estimable por una edición; verificable con autoría y fechas; negociable en la magnitudes permitidas ya cerradas.

## US3.3 — Leer opiniones

- **Historia**: Como `Oyente`, quiero leer una opinión individual y las opiniones de una obra, para que puedo decidir qué contenido musical me interesa sin depender de una sesión de Spotify.
- **Prioridad**: Must Have
- **Requisitos**: FR3.4, FR4.4.
- **Dependencias**: US3.1.
- **Criterios de aceptación**:
  - **AC3.3.1**: Dado una opinión publicada, cuando la consulto de forma individual o por obra, entonces la respuesta incluye autor, obra, valoración, reseña y fechas, sin secretos.
  - **AC3.3.2**: Dado una obra sin opiniones, cuando consulto su lista, entonces recibo una respuesta vacía que dice que todavía no hay contenido.
  - **AC3.3.3**: Dado un fallo de lectura, cuando la app muestra el estado, entonces distingue error de lista vacía y ofrece «Reintentar» con mensaje en español.
- **INVEST**: Independiente de la escritura; valiosa para el segundo dispositivo; estimable por dos formas de lectura; verificable con respuesta y estados; negociable en el texto del estado vacío.

## US4.1 — Dar y quitar me gusta

- **Historia**: Como `Curador social`, quiero dar y quitar mi me gusta a una opinión, para que mi reacción cuente una sola vez y sea visible igual en ambos dispositivos.
- **Prioridad**: Should Have
- **Requisitos**: FR5.1, FR5.4, NFR4.
- **Dependencias**: US3.3, US1.2.
- **Criterios de aceptación**:
  - **AC4.1.1**: Dado una opinión existente, cuando doy me gusta dos veces, entonces existe una sola relación y el contador no se duplica.
  - **AC4.1.2**: Dado un me gusta propio, cuando lo retiro dos veces, entonces el contador no cuenta dos bajas y la operación sigue siendo idempotente.
  - **AC4.1.3**: Dado dos dispositivos conectados, cuando una escritura se confirma, entonces ambos ven el mismo contador persistido.
- **INVEST**: Independiente de comentarios; valiosa como señal social mínima; estimable por una relación única; verificable con doble llamada y dos dispositivos; negociable en el texto del contador.

## US4.2 — Comentar una opinión

- **Historia**: Como `Curador social`, quiero comentar una opinión con texto válido, para que puedo conversar sobre una obra sin crear comentarios duplicados por un doble toque.
- **Prioridad**: Should Have
- **Requisitos**: FR5.2, FR7.3, A2.
- **Dependencias**: US3.3, US1.2.
- **Criterios de aceptación**:
  - **AC4.2.1**: Dado texto de 1 a 1000 caracteres no solo en blanco, cuando comento, entonces el comentario queda asociado a mi cuenta y a la opinión.
  - **AC4.2.2**: Dado texto vacío, solo espacios o de 1001 caracteres, cuando comento, entonces el servidor rechaza el campo con mensaje en español.
  - **AC4.2.3**: Dado un doble envío del mismo formulario, cuando la petición se repite, entonces no se crea un segundo comentario y el texto introducido se conserva si hay error.
- **INVEST**: Independiente de me gusta; valiosa para conversación; estimable por un límite de texto; verificable con boundary y doble envío; negociable en el mensaje de validación.

## US4.3 — Listar comentarios

- **Historia**: Como `Oyente`, quiero listar los comentarios de una opinión con paginación estable, para que puedo seguir una conversación sin perder ni repetir elementos.
- **Prioridad**: Could Have
- **Requisitos**: FR5.3, FR5.4, FR4.4.
- **Dependencias**: US4.2.
- **Criterios de aceptación**:
  - **AC4.3.1**: Dado varios comentarios, cuando listo una página, entonces el orden es de más reciente a más antiguo y los empates se resuelven por ID.
  - **AC4.3.2**: Dado un cursor inválido, cuando solicito la siguiente página, entonces recibo un error de campo en español.
  - **AC4.3.3**: Dado que no hay comentarios, cuando listo, entonces veo un estado vacío distinto del estado de error con «Reintentar».
- **INVEST**: Independiente de la creación; valiosa para lectura ordenada; estimable por el esquema de cursor ya acordado; verificable con empates y cursor inválido; negociable en el tamaño de página dentro del máximo 50.

## US5.1 — Ver feed global

- **Historia**: Como `Oyente`, quiero ver un feed global de opiniones, para que una opinión publicada en un dispositivo aparezca en el otro aunque no siga a su autor.
- **Prioridad**: Must Have
- **Requisitos**: FR4.1, FR4.3, FR4.4, FR6.3.
- **Dependencias**: US3.1, US1.2.
- **Criterios de aceptación**:
  - **AC5.1.1**: Dado una opinión creada en el dispositivo A, cuando el dispositivo B consulta el feed sin seguir a A, entonces la opinión aparece.
  - **AC5.1.2**: Dado más de 20 opiniones, cuando consulto sin parámetros, entonces recibo 20 elementos ordenados de más reciente a más antiguo con ID como desempate; el máximo es 50.
  - **AC5.1.3**: Dado un cursor inválido, cuando consulto, entonces recibo un error de campo en español y no una página vacía silenciosa.
- **INVEST**: Independiente de seguimientos; valiosa para la métrica de éxito; estimable por paginación ya definida; verificable en dos dispositivos; negociable solo en el tamaño de página, nunca en la visibilidad global.

## US5.2 — Ver actividad pública

- **Historia**: Como `Curador social`, quiero ver la actividad pública de una cuenta, para que puedo entender qué acciones realizó sin ver acciones privadas.
- **Prioridad**: Should Have
- **Requisitos**: FR4.2, FR4.3, FR4.4.
- **Dependencias**: US3.1, US4.1, US4.2, US6.1.
- **Criterios de aceptación**:
  - **AC5.2.1**: Dado una cuenta consultada, cuando veo su actividad, entonces aparecen solo publicación, edición, me gusta, comentario, seguimiento y dejar de seguir de esa cuenta.
  - **AC5.2.2**: Dado una acción privada o de otra cuenta, cuando consulto la actividad, entonces esa acción no aparece.
  - **AC5.2.3**: Dado un histórico largo, cuando pagino, entonces uso el mismo cursor, orden por fecha e ID y estados vacío/error del feed.
- **INVEST**: Independiente del feed; valiosa para transparencia social; estimable por seis tipos de acción; verificable con exclusiones y paginación; negociable en el formato de agrupación de actividad.

## US6.1 — Seguir y dejar de seguir

- **Historia**: Como `Curador social`, quiero seguir y dejar de seguir a otra cuenta, para que puedo organizar mis relaciones sin restringir el feed global.
- **Prioridad**: Should Have
- **Requisitos**: FR6.1, FR6.2, FR6.3.
- **Dependencias**: US2.1, US1.2.
- **Criterios de aceptación**:
  - **AC6.1.1**: Dado otra cuenta, cuando la sigo o dejo de seguirla dos veces, entonces existe como máximo una relación y la operación es idempotente.
  - **AC6.1.2**: Dado que intento seguirme a mí mismo, cuando envío la acción, entonces recibo un error en español y no se crea la relación.
  - **AC6.1.3**: Dado que sigo o no sigo a alguien, cuando consulto seguidores, seguidos y feed, entonces las listas usan cursor estable con perfiles públicos y el feed sigue siendo global.
- **INVEST**: Independiente de opiniones; valiosa para grafo social; estimable por una relación por par; verificable con duplicados y auto-seguimiento; negociable en el orden de las listas dentro del criterio estable.

## US6.2 — Consentimiento, rectificación y borrado

- **Historia**: Como `Reseñador`, quiero dar consentimiento explícito, rectificar mi perfil y solicitar el borrado de mi cuenta, para que mis datos personales se traten con las reglas LFPDPPP acordadas.
- **Prioridad**: Must Have
- **Requisitos**: FR8.1, FR8.2, FR8.3, FR3.6, NFR10.
- **Dependencias**: US1.1, US3.1, US4.1, US4.2, US6.1.
- **Criterios de aceptación**:
  - **AC6.2.1**: Dado el registro, cuando creo la cuenta, entonces el consentimiento explícito queda asociado con fecha y versión del aviso; sin consentimiento no se crea la cuenta.
  - **AC6.2.2**: Dado una cuenta activa, cuando pasa el tiempo, entonces cuenta y contenido se conservan; tras solicitar borrado, cuenta, perfil, opiniones, me gusta, comentarios y seguimientos se eliminan o anonimizan en un máximo de 30 días.
  - **AC6.2.3**: Dado un borrado completado, cuando consulto la API, entonces no queda dato personal accesible ni opinión que muestre el `handle` de esa cuenta; la rectificación de perfil sigue disponible mientras la cuenta esté activa.
- **INVEST**: Independiente en su interfaz de borrado; valiosa para cumplimiento; estimable por el plazo de 30 días; verificable con evidencia y búsqueda de datos residuales; negociable solo en el mecanismo de anonimización, no en el plazo.

## US7.1 — Errores comprensibles y acciones seguras

- **Historia**: Como `Curador social`, quiero que los errores y envíos dudosos se gestionen con mensajes claros y sin pérdida de lo escrito, para que puedo corregir la acción y reintentarla.
- **Prioridad**: Must Have
- **Requisitos**: FR7.1, FR7.3, NFR1, NFR7.
- **Dependencias**: US1.2.
- **Criterios de aceptación**:
  - **AC7.1.1**: Dado un error del servicio que llega a una pantalla, cuando se muestra, entonces el texto está en español, en lenguaje llano, nombra campo o acción y no muestra códigos técnicos, stack traces ni mensajes en inglés.
  - **AC7.1.2**: Dado un doble toque, entrada inválida o sesión expirada a mitad de flujo, cuando gestiono la acción, entonces no se crean duplicados, se conserva lo escrito y tras reautenticar se reanuda sin pérdida.
  - **AC7.1.3**: Dado un error registrado en el servicio, cuando se escribe el log, entonces identifica operación y resultado sin contraseñas, tokens ni datos personales.
- **INVEST**: Independiente de cada acción concreta; valiosa para recuperación del usuario; estimable como comportamiento transversal; verificable con casos de error y reintento; negociable en el texto exacto, nunca en idioma ni acción.

## US7.2 — Fallo del servicio y verificación de salud

- **Historia**: Como `Oyente`, quiero que la app degrade a lectura local cuando el servicio no responde, para que puedo seguir leyendo con un aviso honesto y reintentar sin reinicio manual.
- **Prioridad**: Could Have
- **Requisitos**: FR7.2, FR9.1, NFR3.
- **Dependencias**: US7.1, US5.1.
- **Criterios de aceptación**:
  - **AC7.2.1**: Dado API y PostgreSQL disponibles, cuando consulto la ruta de salud, entonces responde correctamente; si falta la base, falla de forma explícita.
  - **AC7.2.2**: Dado que el servicio local no responde, cuando abro contenido, entonces veo el respaldo local en solo lectura con aviso en español y «Reintentar», sin permitir publicar, comentar, dar me gusta ni seguir.
  - **AC7.2.3**: Dado que el servicio vuelve, cuando reintento, entonces los datos frescos sustituyen al respaldo sin reinicio manual y ninguna escritura ya confirmada se presenta como perdida.
- **INVEST**: Independiente de las acciones de escritura; valiosa para honestidad del estado; estimable por dos modos; verificable con servicio apagado y reencendido; negociable en el texto del aviso, no en el bloqueo de escrituras.
