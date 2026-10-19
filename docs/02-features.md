# 🚀 02. Features Principales

Este documento detalla las 5 funcionalidades centrales definidas para **Melodify**.

---

## 1. Perfil Musical Personalizado

Cada usuario podrá crear una cuenta y configurar su espacio personal dentro de la plataforma.

- **Identidad de usuario**: Configuración de nombre de usuario, biografía y fotografía de perfil (ambas opcionales).
- **Vitrina musical**: Agrupación centralizada de sus calificaciones, reseñas publicadas, álbumes favoritos y selecciones musicales destacadas.
- **Estadísticas de perfil**: Visualización de recuentos de reseñas emitidas, álbumes escuchados y puntuación promedio otorgada.

---

## 2. Catálogo y Descubrimiento Musical

Permite a los usuarios explorar y buscar información detallada sobre el universo musical.

- **Búsqueda global**: Consulta de canciones, artistas, géneros y álbumes con autocompletado y resultados rápidos.
- **Metadatos enriquecidos**: Fichas técnicas con portadas en alta resolución, listas de canciones (tracklists), fechas de lanzamiento y créditos principales, alimentados inicialmente mediante **Spotify Web API**.
- **Futura expansión**: Arquitectura preparada para incorporar fuentes adicionales de metadatos (como Last.fm o MusicBrainz).

---

## 3. Calificaciones y Reseñas

El núcleo de la experiencia de opinión y crítica musical dentro de Melodify.

- **Sistema de puntuación**: Asignación de valoraciones de 1 a 5 estrellas (admitiendo medias estrellas para mayor granularidad).
- **Publicación de reseñas**: Espacio para redactar críticas de texto con formateo básico, permitiendo registrar reflexiones personales o análisis profundos.
- **Registro cronológico (Log musical)**: Capacidad de marcar álbumes o temas como "escuchados" con fecha, permitiendo llevar un diario musical.
- **Comentarios y retroalimentación**: Los demás usuarios pueden leer las reseñas para orientar sus decisiones de escucha y descubrir nuevas obras.

---

## 4. Comunidad e Interacción Social

Fomenta el intercambio y la creación de redes entre amantes de la música.

- **Muro social / Feed de actividad**: Línea de tiempo donde se muestran las calificaciones recientes, reseñas y publicaciones compartidas por los usuarios seguidos.
- **Seguimiento entre usuarios**: Posibilidad de seguir a otros perfiles para mantenerse al tanto de sus recomendaciones y descubrimientos.
- **Reacciones y comentarios**: Capacidad de interactuar con las reseñas y publicaciones mediante reacciones (likes/guardados) y comentarios públicos.
- **Alcance inicial**: El proyecto contempla un muro social enfocado en la música; la mensajería directa privada queda expresamente fuera del alcance inicial.

---

## 5. Historial y Resúmenes Musicales Personalizados

Herramienta opcional para analizar los hábitos de consumo y preferencias auditivas del usuario.

- **Vinculación externa opcional**: Los usuarios pueden autorizar la conexión con servicios compatibles (inicialmente Spotify) mediante OAuth 2.0.
- **Extracción de hábitos**: Consulta de datos permitidos (ej. top artistas, pistas más escuchadas en periodos determinados).
- **Métricas agregadas**: Generación de resúmenes visuales con las tendencias, géneros predominantes y patrones de escucha.
- **Sincronización condicionada**: La frecuencia y el detalle de los datos dependerán estrictamente de los permisos otorgados por el usuario y las capacidades vigentes de la API externa.
