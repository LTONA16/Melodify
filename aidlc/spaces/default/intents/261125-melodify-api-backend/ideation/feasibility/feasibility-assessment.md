# Evaluación de Viabilidad y Restricciones

## Fuentes

- `intent-statement.md`: cuentas reales, contenido compartido, métrica de éxito funcional (publicar, comentar, dar me gusta y seguir desde un segundo dispositivo) y exclusión explícita de Spotify, audio y tiendas.
- `competitive-analysis.md`: la diferenciación está en la opinión breve atada a una canción y en un feed propio; se dan por sentadas la cuenta real y las interacciones sociales.
- `market-trends.md`: privacidad desde el primer usuario, dependencia de la plataforma de Spotify y ausencia de medición de mercado.
- `build-vs-buy.md`: se construye sobre el servicio que ya está en el repositorio; no se migran cuentas ni datos a un proveedor externo.
- `feasibility-questions.md`: decisiones Q1 (servicio local en el portátil), Q2 (LFPDPPP de México) y Q3 (el contenido de los teléfonos se descarta).

## Resumen

La iniciativa es viable en el alcance pedido. El repositorio ya contiene un servicio y contratos compartidos, así que el trabajo es completarlos, no sustituirlos. Tres decisiones delimitan la primera entrega: el servicio corre solo en el portátil, la normativa de referencia es la mexicana LFPDPPP y el contenido simulado de los teléfonos no se migra.

## Viabilidad técnica

- El punto de partida es el servicio existente en `apps/api` y los contratos compartidos en `packages/contracts`; la app móvil ya espera hablar con ese servicio. Ampliar lo que hay conserva lo construido y evita cambiar de tecnología a mitad del producto.
- La operación es local: el servicio y su base de datos corren en el portátil con Docker. No hay servidor, staging ni publicación en esta versión. La verificación es funcional y se hace en local, no contra un entorno desplegado.
- La integración con Spotify sigue siendo responsabilidad de la app, con autorización PKCE y token en el dispositivo. El servicio no recibe tokens de Spotify ni guarda el client secret; eso mantiene fuera del backend una dependencia que hoy ya está resuelta en la app.
- La capacidad de entrega está condicionada a que el servicio existente sea realmente ampliable. Esa comprobación es una hipótesis de `build-vs-buy.md`, no un hecho verificado aquí.

## Viabilidad de producto

- El valor está en que lo que publica una persona lo vean otras: cuentas reales, opinión breve, me gusta, comentarios, seguimientos, feed y actividad. Eso es lo que el análisis competitivo describe como hueco frente a reseñas largas y feeds generales.
- El contenido que hoy vive en los teléfonos se descarta. Cada cuenta empieza de cero; no hay migración ni reconciliación de opiniones antiguas. Esto reduce el trabajo de la primera entrega y evita inventar una procedencia que no existe.
- No hay métricas numéricas de mercado. El éxito se comprueba con uso real: publicar y ver la publicación desde otro dispositivo, y que el contenido sobreviva a reinstalar la app.

## Viabilidad legal y de privacidad

- Con cuentas reales hay datos personales desde el primer usuario. La persona confirmó la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), México**, como normativa aplicable.
- `market-trends.md` asumía el RGPD como referencia prudente. Esa hipótesis queda sustituida por la respuesta Q2: la LFPDPPP manda; el RGPD puede citarse solo como referencia de buenas prácticas, no como norma rectora.
- Consentimiento, borrado y retención quedan por concretar en etapas posteriores. No se inventan plazos aquí: se registran como trabajo pendiente con dueño en el registro RAID.
- El backend no trata tokens de Spotify, lo que reduce el conjunto de datos sensibles que pasan por el servicio.

## Contradicciones resueltas

- **Normativa:** RGPD asumido en `market-trends.md` frente a LFPDPPP confirmada en Q2. Se adopta LFPDPPP; se corrige el supuesto antes de Requirements Analysis.
- **Contenido local:** `intent-statement.md` lo dejaba abierto. Q3 lo cierra: se descarta, sin migración única ni respaldo que subir.
- **Alcance de red:** la métrica de éxito pide ver el contenido desde un segundo dispositivo, mientras Q1 fija el servicio en el portátil. Se asume que ese segundo dispositivo alcanza el servicio local desde la misma red; la forma de demostrarlo se concreta en Scope Definition y en la verificación, sin introducir despliegue.

## Conclusión

No hay un bloqueo que impida seguir. La viabilidad depende de tres condiciones que deben quedar reflejadas en las siguientes etapas: confirmar el estado real del servicio existente, concretar las obligaciones de la LFPDPPP (consentimiento, borrado y retención) y definir cómo se verifica el acceso desde un segundo dispositivo sin desplegar nada.
