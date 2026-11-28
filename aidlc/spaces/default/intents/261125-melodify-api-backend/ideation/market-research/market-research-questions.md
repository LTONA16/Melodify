# Investigación de Mercado — Preguntas

Contexto de partida: `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/intent-capture/intent-statement.md`.

## Q1. [Producto] ¿Contra qué compite Melodify en la cabeza de quien la usa?

Esta investigación decide qué comparamos y qué contamos como alternativa real. Hoy la gente ya opina de música en varios sitios, y el backend solo tiene sentido si sabemos de dónde tiene que destacar.

A. Redes y apps sociales generales (Instagram, TikTok, X): la opinión de música vive dentro de un feed general.
B. Apps dedicadas a valorar música y discos (RateYourMusic, Album of the Year, o un «Letterboxd de música»): catálogo y reseñas largas.
C. La propia app de Spotify y sus funciones sociales (perfiles, playlists colaborativas, sesiones compartidas): el oyente ya está ahí.
D. Varias de las anteriores conviven y no hay un competidor claro.
E. Not yet defined.
X. Other (please specify)

[Answer]: B

## Q2. [Producto] ¿Qué se da por sentado y qué nos diferenciaría?

«Table stakes» es lo que cualquiera espera encontrar y sin lo cual la app no se usa; el diferenciador es lo que hace que alguien la elija. Sin esto, la comparación con la competencia no dice nada.

A. Lo mínimo es cuenta, publicar, ver lo de otros, me gusta, comentar y seguir; nos diferenciaría la opinión breve atada a una canción concreta.
B. Lo mínimo es el catálogo de Spotify integrado; nos diferenciaría la comunidad y el feed.
C. Lo mínimo es el feed social; nos diferenciaría la calidad de las reseñas.
D. No lo tengo claro; descríbelo en «Other».
E. Not yet defined.
X. Other (please specify)

[Answer]: A, B

## Q3. [Negocio] ¿Qué tendencias o exigencias externas condicionan este trabajo?

Las cuentas reales y el contenido compartido cambian lo que el producto toca: datos personales, dependencia de la API de Spotify y lo que su política permita. Quiero saber qué factores externos tenemos que mirar de frente.

A. Privacidad y protección de datos: con cuentas reales hay datos personales y hay que tratarlos con cuidado.
B. Términos y política de desarrollador de la API de Spotify: el producto depende de lo que permitan.
C. Ninguna relevante para esta primera versión.
D. Varias de las anteriores.
E. Not yet defined.
X. Other (please specify)

[Answer]: A, B

## Q4. [Producto] ¿Construimos el backend, compramos un servicio o integramos algo que ya existe?

El repositorio ya tiene un servicio en `apps/api`. Antes de ampliarlo conviene dejar escrito por qué construimos en vez de comprar o integrar, para no descubrirlo a mitad del trabajo.

A. Construir sobre lo que ya hay en `apps/api` (Fastify, Prisma y PostgreSQL).
B. Contratar un backend como servicio (Supabase, Firebase u otro) y adaptar la app.
C. Integrar un producto de comunidad musical ya existente y no construir el nuestro.
D. Comparar construir y comprar antes de decidir.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q5. [Negocio] ¿A quién apuntamos primero y qué tamaño de audiencia esperamos?

Esto fija si hablamos de un producto para un grupo pequeño o de algo pensado para crecer. Cambia qué conclusiones de mercado importan y qué métricas de éxito tienen sentido.

A. Oyentes hispanohablantes que ya usan Spotify y quieren opinar; audiencia pequeña al principio (decenas o cientos).
B. Comunidad global de personas que valoran música; audiencia mediana (miles).
C. Público masivo; audiencia grande (decenas de miles o más).
D. No hay objetivo de tamaño; basta con que funcione para quien la pruebe.
E. Not yet defined.
X. Other (please specify)

[Answer]: D

## Consolidated Summary Confirmation

- Competencia: apps dedicadas a valorar música y discos (RateYourMusic, Album of the Year, un «Letterboxd de música»), con catálogo y reseñas largas.
- Mínimos y diferenciación: lo mínimo es cuenta, publicar, ver lo de otros, me gusta, comentar y seguir, más el catálogo de Spotify integrado; nos diferenciaría la opinión breve atada a una canción concreta y la comunidad con su feed.
- Exigencias externas: privacidad y protección de datos por las cuentas reales, y los términos y la política de desarrollador de la API de Spotify.
- Construir o comprar: construir sobre lo que ya hay en `apps/api` (Fastify, Prisma y PostgreSQL).
- Audiencia: no hay objetivo de tamaño; basta con que funcione para quien la pruebe.

- Looks correct
- Request changes

[Answer]: Looks correct
