# 🎯 01. Objetivo de la Aplicación

## 1.1. Visión General

**Melodify** es una red social enfocada en el **descubrimiento, la calificación y la reseña de música**, diseñada para reunir en una misma plataforma la experiencia de explorar obras musicales y compartir opiniones con otros usuarios.

Inspirada en plataformas consagradas de reseñas de películas y libros (como *Letterboxd* o *Goodreads*), Melodify permitirá a los usuarios:
- Construir un **perfil musical propio** que refleje su identidad auditiva.
- Calificar canciones, álbumes y lanzamientos musicales.
- Publicar reseñas profundas o breves impresiones sobre sus escuchas.
- Interactuar con una comunidad activa con intereses afines.

---

## 1.2. Enfoque: Registro y Comunidad vs. Streaming

> [!NOTE]
> **Melodify no es un reproductor de música en streaming.**  
> Su propósito central es funcionar como un espacio social de registro, descubrimiento e intercambio de opiniones.

La aplicación contempla una integración inicial con **Spotify Web API** para:
- Consultar metadatos musicales estructurados (títulos, artistas, álbumes, portadas, géneros).
- Acceder a información musical autorizada por el usuario cuando los permisos y las capacidades de la API lo permitan.
- Facilitar enlaces directos a reproductores externos para la escucha de las canciones.

---

## 1.3. Principios de Seguridad y Privacidad

El proyecto prioriza una experiencia social centrada en la música respaldada por mecanismos de seguridad y controles de privacidad claros:
1. **Control del usuario**: El usuario decide en todo momento qué información comparte en su perfil público.
2. **Conexiones externas voluntarias**: La vinculación con servicios de terceros (Spotify) es totalmente opcional.
3. **Privacidad de datos**: Se previene el acceso indebido a información privada y se establecen límites estrictos para cualquier procesamiento externo.
