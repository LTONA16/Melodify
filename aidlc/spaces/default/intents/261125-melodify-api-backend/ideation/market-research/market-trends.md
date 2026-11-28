# Tendencias de Mercado

Parte de `intent-statement.md` y de las respuestas de esta etapa. Cada tendencia se marca con su base: lo que la persona confirmó y lo que es una hipótesis por validar.

## 1. Tendencias relevantes

### Opinión breve por encima de la reseña larga

Las apps que piden una reseña larga (RateYourMusic, Album of the Year) tienen comunidades fieles pero exigen esfuerzo. Al mismo tiempo, las redes generales demuestran que la gente opina en una frase cuando el formato se lo pone fácil.

- **Base:** respuesta de la persona en esta etapa (categorías de competencia y mínimos esperados).
- **Hipótesis:** existe demanda de una opinión breve atada a una canción concreta, sin el coste de escribir una reseña.

### Descubrimiento social de la música

El oyente descubre música a través de otras personas tanto como a través de recomendaciones automáticas. Las funciones sociales de Spotify (perfiles, playlists colaborativas, sesiones compartidas) apuntan en esa dirección, pero no están pensadas para discutir ni para dejar opinión.

- **Base:** producto público de Spotify; respuesta de la persona sobre competencia y diferenciación.
- **Hipótesis:** un feed propio de opiniones añade algo que el oyente no encuentra hoy en su app de música.

### Cuentas reales y datos personales

El paso de contenido simulado a cuentas reales convierte a Melodify en un producto que trata datos personales: identificadores de cuenta, correo o handle, y el contenido que la persona publica. Eso trae obligaciones de privacidad y protección de datos (por ejemplo, el RGPD en la Unión Europea).

- **Base:** respuesta de la persona en esta etapa (exigencias externas); `intent-statement.md` (cuentas reales y contenido compartido).
- **Hipótesis:** la obligación aplica desde el primer usuario real, no solo al crecer.

### Dependencia de la plataforma de Spotify

Melodify se apoya en el catálogo de Spotify y en su API. Los términos de uso y la política de desarrollador de Spotify marcan qué se puede mostrar, guardar y ofrecer, y pueden cambiar.

- **Base:** respuesta de la persona en esta etapa (exigencias externas); `intent-statement.md` (la conexión con Spotify sigue en la app con PKCE).
- **Hipótesis:** el producto puede convivir con esos límites si el catálogo se consulta y no se copia en masa.

### Productos pequeños que empiezan por una comunidad concreta

Muchos productos sociales de nicho crecen primero en una comunidad pequeña y luego se abren. No hay, en esta etapa, un objetivo de tamaño de audiencia: basta con que funcione para quien la pruebe.

- **Base:** respuesta de la persona en esta etapa (audiencia).
- **Hipótesis:** el valor se demuestra con pocas personas publicando de verdad, antes que con números.

## 2. Qué implica para este trabajo

- El producto tiene que funcionar con pocas cuentas reales: no se diseñan mecanismos que solo tengan sentido a gran escala.
- La privacidad y el tratamiento de datos personales son parte del trabajo desde el principio, no un añadido posterior.
- La integración con Spotify se mantiene en la app y dentro de lo que su API permita; el backend no gestiona tokens de Spotify.
- El feed y la actividad propios son la pieza que ninguna de las alternativas cubre bien, así que son el centro de esta versión.

## 3. Riesgos externos

| Riesgo | Efecto si ocurre | Señal para vigilarlo |
|---|---|---|
| Cambio en los términos o la política de la API de Spotify | Hay que limitar qué se muestra o cómo se integra el catálogo | Avisos de la plataforma y cambios en su documentación |
| Endurecimiento de las obligaciones de privacidad | Más trabajo de consentimiento, borrado y retención | Normativa aplicable y guías de la autoridad de protección de datos |
| La opinión breve no engancha | El producto se queda sin uso real | Personas que publican una vez y no vuelven |

## Assumptions & Open Questions

- [assumption] No se ha medido el mercado: no hay cifras de tamaño, crecimiento ni disposición a pagar, y ninguna conclusión de este documento debe leerse como una estimación numérica.
- [assumption] Las tendencias descritas son hipótesis apoyadas en productos públicos y en las respuestas de la persona; se validan con uso real, no con más análisis.
- [assumption] Se asume el RGPD como referencia de privacidad por el contexto del proyecto; no se ha confirmado qué jurisdicción aplica.
