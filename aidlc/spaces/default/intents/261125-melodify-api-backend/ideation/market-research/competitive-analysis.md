# Análisis Competitivo

Parte de `intent-statement.md` (captura del intento) y de las respuestas dadas en esta etapa. El objetivo no es ganar a nadie en una tabla, sino saber de dónde tiene que destacar Melodify y qué se da por sentado.

## 1. Categorías de competencia

| Categoría | Qué ofrece hoy | Fortaleza | Debilidad | Relación con Melodify |
|---|---|---|---|---|
| Redes y apps sociales generales (Instagram, TikTok, X) | Opinión de música dentro de un feed general, con vídeo y comunidad masiva | Audiencia enorme y hábito diario | La música compite con todo lo demás; la opinión se pierde en el feed | No es competencia directa del backend, pero sí del tiempo y la atención de quien opina |
| Apps dedicadas a valorar música y discos (RateYourMusic, Album of the Year, un «Letterboxd de música») | Catálogo, reseñas largas, listas y puntuaciones | Foco musical y comunidad que valora en serio | Publicar exige esfuerzo: escribir una reseña larga frena a quien solo quiere una frase | Competencia directa: mismo problema, distinto esfuerzo de publicación |
| Spotify y sus funciones sociales (perfiles, playlists colaborativas, sesiones compartidas) | El oyente ya está escuchando; puede ver y compartir lo que suena | Está donde ocurre la escucha; catálogo completo | Su capa social es fina y no está pensada para opinar ni discutir | Es la plataforma de la que Melodify depende y, a la vez, su competidor más cercano en atención |

## 2. Comparación por capacidad

| Capacidad | Redes generales | Apps de valoración musical | Spotify | Melodify (objetivo de esta versión) |
|---|---|---|---|---|
| Cuenta real | Sí | Sí | Sí | Sí |
| Opinión breve atada a una canción | Sí, pero diluida | No, tiende a la reseña larga | No | Sí |
| Comentar, me gusta, seguir | Sí | Sí | Parcial | Sí |
| Feed y actividad propios | Sí | Parcial | No | Sí |
| Catálogo musical integrado | No | Parcial | Sí | Sí, vía Spotify |
| Foco exclusivamente musical | No | Sí | Sí | Sí |

## 3. Posicionamiento

Dos ejes explican la diferencia: **esfuerzo de publicación** (una frase frente a una reseña) y **foco musical** (general frente a dedicado).

```
                    Foco musical alto
                           ^
                           |
        Apps de valoración |        Melodify
        (reseña larga)     |        (opinión breve)
   ------------------------+------------------------> 
   Esfuerzo alto           |            Esfuerzo bajo
                           |
        Redes generales    |        Spotify
                           |
                    Foco musical bajo
```

<!-- Text fallback: Melodify se sitúa en el cuadrante de foco musical alto y esfuerzo de publicación bajo, frente a las apps de valoración (foco alto, esfuerzo alto), las redes generales (foco bajo, esfuerzo bajo) y Spotify (foco alto, pero sin capa de opinión). -->

El hueco que Melodify ocupa es el de quien quiere decir algo de una canción en diez segundos, sin escribir una reseña, y que eso lo vea gente que también escucha música.

## 4. Mínimos y diferenciación

**Se da por sentado (sin esto no se usa):**

- Cuenta real, publicar, ver lo de otras personas, me gusta, comentar y seguir.
- El catálogo de Spotify integrado: sin la canción delante, la opinión no tiene anclaje.

**Nos diferencia:**

- La opinión breve atada a una canción concreta, en lugar de la reseña larga.
- Una comunidad con su propio feed y actividad, no un apéndice social de Spotify.

## 5. Qué implica para el backend

- El backend tiene que hacer reales las cuentas y compartido el contenido: perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad.
- La integración con Spotify sigue en la app; el backend no toca tokens de Spotify.
- Tiempo real, notificaciones push y chat quedan fuera de esta primera versión.

## Assumptions & Open Questions

- [assumption] No se hizo investigación primaria (entrevistas ni encuestas): las conclusiones se apoyan en cómo se presentan públicamente estos productos y en las respuestas de la persona, no en una medición.
- [assumption] Las fortalezas y debilidades de cada categoría son una lectura de sus productos públicos; conviene revisarlas con uso real cuando haya usuarios.
- [assumption] Que Spotify no cubra bien la opinión musical es una lectura de su producto actual y puede cambiar si amplía sus funciones sociales.
