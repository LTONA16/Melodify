# Viabilidad y Restricciones — Preguntas

Solo se preguntan tres cosas: las que cambian el registro de restricciones o el alcance. Todo lo demás se resuelve leyendo el repositorio y queda como supuesto en el registro RAID.

## Sources

- [desc] Initial description: "Backend de Melodify: servicio REST /api/v1 en apps/api con Fastify, TypeScript, PostgreSQL y Prisma. Cuentas reales con handle y contrasena (Argon2id), JWT de acceso corto y refresh rotatorio; perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad. Contratos compartidos en packages/contracts y adaptadores en la app movil con respaldo local de solo lectura. Spotify permanece intacto en la app: PKCE y token en el dispositivo, el backend no toca tokens de Spotify."
- [scope] Workflow-selected scope: `feature`.
- [memory:M1] `aidlc/spaces/default/memory/project.md#Corrections`: el backend, la autenticación real y la persistencia en servidor quedan permitidos para este intento; el client secret de Spotify sigue prohibido y PKCE sigue en la app.
- Repositorio: `apps/api` (Fastify, Prisma, PostgreSQL, Vitest, Docker en el puerto 55432), `packages/contracts` (Zod y tipos compartidos), `app/` (Expo).

## Q1. [Técnico] ¿Dónde corre el servicio en esta versión?

El registro de restricciones necesita saber si hablamos de algo que solo vive en el portátil o de algo que otras personas alcanzan por red. Cambia las restricciones de despliegue, de datos y de seguridad, y cambia qué se puede probar de verdad.

A. Solo local: el API y Postgres corren en el portátil con Docker; en esta versión no se despliega a ningún servidor.
B. Un servidor propio o un VPS pequeño, con Postgres en el mismo sitio.
C. Un servicio gestionado (Railway, Render, Fly.io, Supabase u otro) para el API y la base de datos.
D. Todavía no se decide; se deja para la etapa de despliegue.
E. Not yet defined.
X. Other (please specify)

[Answer]: A

## Q2. [Cumplimiento] ¿Qué normativa de protección de datos aplica?

Con cuentas reales hay datos personales desde el primer usuario. El supuesto del que partimos es el RGPD, pero no está confirmado y afecta a consentimiento, borrado y retención.

A. España y la Unión Europea: RGPD y LOPDGDD.
B. Unión Europea, pero otro país (dilo en «Other»).
C. Fuera de la Unión Europea, con su propia normativa (dilo en «Other»).
D. No está definido; se asume el RGPD como referencia prudente.
E. Not yet defined.
X. Other (please specify)

[Answer]: X — Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), México

## Q3. [Producto] ¿Qué pasa con el contenido que hoy vive en los teléfonos?

La app guarda opiniones simuladas en memoria y un respaldo local de solo lectura. Antes de que exista el backend hay que decidir si eso se sube, se descarta o se queda donde está: cambia el alcance y el trabajo de la primera entrega.

A. Se descarta: el contenido simulado no se migra; cada persona empieza de cero con su cuenta real.
B. Se migra una sola vez desde el teléfono al crear la cuenta, y pasa a estar compartido.
C. Se queda solo en el teléfono como respaldo de lectura, sin subir al servidor.
D. No hay contenido real que conservar (es de ejemplo), así que da igual.
E. Not yet defined.
X. Other (please specify)

[Answer]:
