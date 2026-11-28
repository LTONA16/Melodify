# Initiative Brief — Backend de Melodify

## Fuentes

- `intent-statement.md` y `stakeholder-map.md`: problema, métrica funcional y decisor único.
- `competitive-analysis.md` y `market-trends.md`: validación de mercado sin objetivos numéricos.
- `feasibility-assessment.md`, `constraint-register.md` y `raid-log.md`: viabilidad, restricciones y riesgos.
- `scope-document.md` y `intent-backlog.md`: frontera del MVP y orden por dependencias.
- `team-assessment.md`, `skill-matrix.md` y `mob-composition.md`: equipo, capacidades y forma de trabajo.
- `wireframes.md` y `user-flow.md`: visuales conceptuales y recorridos.
- `decision-log.md`: decisión Q1 de este stage y trazabilidad de las decisiones de Ideación.

## Intento y problema

Melodify guarda hoy autores, opiniones e interacciones simuladas en la memoria del teléfono. Lo que una persona publica no lo ven otras ni aparece desde otro dispositivo. Este trabajo pone detrás de la app un servicio local que hace reales las cuentas y compartido el contenido, con la app conectada al servicio y el respaldo local de solo lectura conservado (`intent-statement.md`, `stakeholder-map.md`).

La métrica de éxito es funcional: publicar, comentar, dar me gusta y seguir desde un segundo dispositivo, y que el contenido siga disponible al reinstalar la app o cambiar de teléfono. No hay objetivo numérico de audiencia ni de rendimiento.

## Validación de mercado

`competitive-analysis.md` sitúa a Melodify frente a redes generales, apps de reseñas musicales y la capa social de Spotify. El hueco está en la opinión breve atada a una canción, con feed y actividad propios, frente a la reseña larga y al feed general. `market-trends.md` marca esas conclusiones como hipótesis apoyadas en productos públicos y en las respuestas de la persona, no como medición de mercado.

Lo mínimo esperado es cuenta real, publicar, ver lo de otros, me gusta, comentarios, seguir y catálogo integrado desde la app. La inversión se valida con uso real entre unas pocas personas, no con cifras de audiencia (Q5 D de `market-research-questions.md`).

## Viabilidad y riesgos

La iniciativa es viable en el alcance pedido: se construye sobre `apps/api` y `packages/contracts`, sin cambiar de tecnología ni adoptar un proveedor gestionado (`feasibility-assessment.md`, `build-vs-buy.md`). El servicio y su base de datos corren solo en el portátil con Docker; no hay despliegue, entorno público ni túnel (CT-01). La normativa rectora es la LFPDPPP de México (CT-03); los datos personales se tratan desde el primer usuario (CT-09). Spotify sigue en la app con PKCE y token en el dispositivo; el servicio no recibe tokens ni client secret (CT-04).

`raid-log.md` registra R-01 a R-05 con mitigación: comprobar el servicio existente antes de fijar unidades, llevar privacidad a requisitos, comunicar que el contenido simulado se descarta, verificar el acceso desde dos dispositivos y vigilar la política de Spotify. Siguen abiertos I-03 (plazos concretos de retención) e I-04 (estado real del servicio). La revisión de maquetas cerró en `READY` con dos precisiones menores, R-01 y R-02, aceptadas como riesgo en el gate anterior (`reviews/review-01.md`).

## Frontera del alcance

Entran las capacidades SC-01 a SC-10 de `scope-document.md`: cuentas reales, perfiles, publicar y leer opiniones, feed, me gusta, comentarios, seguimientos, actividad, conexión de la app al servicio real con respaldo de solo lectura, consentimiento/borrado/retención bajo LFPDPPP y verificación con dos dispositivos en la misma red local. `intent-backlog.md` las convierte en IB-01 a IB-11 y las ordena por dependencias: contratos y datos → cuentas y sesión → perfil, privacidad y adaptadores → opiniones → feed, interacciones y seguimientos → actividad → verificación.

Quedan fuera la migración del contenido simulado, los tokens de Spotify y el audio, el despliegue, las tiendas, el panel de administración, la moderación, los roles de administrador, las notificaciones push, el chat, un backend gestionado, el login simulado y los objetivos numéricos de audiencia o rendimiento.

## Visuales conceptuales

```
Dispositivo uno  +  Dispositivo dos  --->  Servicio local  --->  Base de datos local
        |                    |                    |
        +---- sesión real ---+                    +--- cuentas, opiniones, actividad

Acceso real ---> Perfil ---> Publicar ---> Feed en segundo dispositivo
                               |                    |
                               +--> Me gusta / Comentarios / Seguir ---> Actividad

Spotify en la app (PKCE) y respaldo local de solo lectura: contexto externo, sin tokens en el servicio.
```

Texto de respaldo: dos dispositivos con sesión real alcanzan el mismo servicio local; el servicio guarda cuentas, opiniones, interacciones, feed, actividad y privacidad en una base de datos local. Spotify y el respaldo local quedan como contexto externo; ninguno escribe en el servicio. Estos bocetos viven en `wireframes.md` y `user-flow.md` y no fijan contratos ni detalles de implementación.

## Plan de equipo

`team-assessment.md` describe un equipo pequeño de tres o cuatro personas con 10-20 horas semanales, habilidades cubiertas y prioridad sobre la iniciativa competidora (Q1 C, Q2 B, Q3 C, Q4 B). Las decisiones se toman por consenso en cada fase (Q5 C) y la ejecución es individual con revisiones en gates (Q6 A): no hay mob, conductor rotativo ni sesiones de pareja (`mob-composition.md`). Los roles son backend, app, calidad y privacidad; no se inventan nombres.

## Recomendación go/no-go

**GO a Inception.** La decisión Q1 de este stage aprueba el traspaso con los temas abiertos viajando como riesgo aceptado: I-03 pasa a Requirements Analysis, I-04 se comprueba en Reverse Engineering y R-01/R-02 de las maquetas quedan registrados como riesgo. El alcance aprobado no se reabre y la verificación final sigue siendo la métrica funcional con dos dispositivos reales en la misma red local.

## Assumptions & Open Questions

- [assumption] El éxito se mide por uso real, no por cifras de audiencia ni de rendimiento.
- [assumption] El segundo dispositivo alcanza el servicio local por la misma red; la dirección concreta se resuelve al preparar la verificación.
- Abierto: plazos concretos de consentimiento, borrado y retención bajo LFPDPPP (I-03).
- Abierto: estado real de `apps/api` y `packages/contracts` antes de fijar unidades (I-04).
- Riesgo aceptado: precisiones R-01 y R-02 de `wireframes.md` tras la revisión `READY`.
