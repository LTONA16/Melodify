# Registro de Restricciones

## Restricciones

| ID | Categoría | Restricción | Origen | Consecuencia | Cómo se verifica |
|---|---|---|---|---|---|
| CT-01 | Operación | El servicio y su base de datos corren solo en el portátil con Docker; en esta versión no se despliega a ningún servidor. | Q1 de `feasibility-questions.md` | No hay entornos remotos ni publicación; la verificación es local. | El arranque y las pruebas funcionan en el entorno local, sin configuración de despliegue. |
| CT-02 | Alcance de datos | El contenido simulado que hoy vive en los teléfonos se descarta; no se migra ni se sube al servicio. | Q3 de `feasibility-questions.md`; `intent-statement.md` | Cada cuenta real empieza de cero; no hay tarea de migración en la primera entrega. | El servicio no expone ningún mecanismo de importación desde el dispositivo. |
| CT-03 | Cumplimiento | La normativa de protección de datos aplicable es la LFPDPPP de México. | Q2 de `feasibility-questions.md` | Consentimiento, borrado y retención se definen para esa norma; el RGPD queda solo como referencia prudente. | Los requisitos de privacidad de etapas posteriores citan la LFPDPPP como norma rectora. |
| CT-04 | Integración | La conexión con Spotify permanece en la app con PKCE y token en el dispositivo; el servicio no gestiona tokens ni client secret. | `intent-statement.md`; reglas del proyecto | El backend no amplía su superficie de datos sensibles ni depende de la API de Spotify. | Ningún componente del servicio recibe, almacena ni envía tokens de Spotify. |
| CT-05 | Alcance del producto | Quedan fuera la reproducción de audio, las notificaciones push, la moderación, los roles de administrador, el panel de administración y la publicación en tiendas. | `intent-statement.md`; `competitive-analysis.md`; reglas del proyecto | No se construyen esos mecanismos en esta versión. | El alcance y las pruebas no incluyen esas capacidades. |
| CT-06 | Arquitectura existente | Se construye sobre el servicio y los contratos que ya están en el repositorio; no se adopta un backend como servicio. | `build-vs-buy.md` | Se conservan la tecnología, las pruebas y el encaje con la app; el equipo asume el mantenimiento. | El trabajo amplía `apps/api` y `packages/contracts` sin migrar cuentas ni datos a un proveedor. |
| CT-07 | Seguridad de cuentas | Las cuentas son reales: el servicio verifica identidad con credenciales propias y gestiona sesiones de forma segura. | `intent-statement.md`; descripción inicial | No hay login simulado en el servicio; los mecanismos concretos se deciden en etapas de diseño. | Las pruebas del servicio cubren registro, acceso y renovación de sesión sin credenciales de ejemplo. |
| CT-08 | Interfaz | Todo texto visible para quien usa la app está en español. | Reglas affirmadas del proyecto | Las respuestas y mensajes de error del servicio que llegan a la pantalla se escriben en español. | La revisión de textos visibles no encuentra mensajes en inglés. |
| CT-09 | Datos personales | Los datos personales se tratan desde el primer usuario, no solo al crecer la comunidad. | `market-trends.md`; Q2 | Privacidad y borrado se diseñan con el primer registro, no como añadido posterior. | El diseño de datos incluye consentimiento, borrado y retención desde la primera versión. |

## Supuestos que afectan a las restricciones

- [assumption] El servicio existente en `apps/api` está en condiciones de ampliarse; si al revisarlo resulta incompleto, se decide qué se conserva.
- [assumption] Un segundo dispositivo puede alcanzar el servicio local desde la misma red; la forma de demostrarlo se decide en Scope Definition sin introducir despliegue.
- [assumption] No hay objetivo numérico de tamaño de audiencia; la viabilidad se juzga con uso real por parte de unas pocas personas.

## Fuentes

- `intent-statement.md`
- `competitive-analysis.md`
- `market-trends.md`
- `build-vs-buy.md`
- `feasibility-questions.md`
