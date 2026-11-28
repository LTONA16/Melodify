# Backlog de la Intención — Backend de Melodify

## Fuentes

- `intent-statement.md`: métrica de éxito y exclusiones confirmadas.
- `scope-document.md`: capacidades SC-01 a SC-10 y frontera del MVP.
- `feasibility-assessment.md`: viabilidad y contradicciones resueltas.
- `constraint-register.md`: restricciones CT-01 a CT-09.
- `scope-definition-questions.md`: Q1 a Q5.

## Criterio de priorización

MoSCoW fija la frontera: todo lo que aparece abajo es `Must Have` porque la métrica de éxito no se cumple sin ello. La ordenación es por dependencias (Q3 C), no por valor ni por fecha. No se inventan puntuaciones RICE ni WSJF: no hay datos reales de alcance, esfuerzo o audiencia (A-05).

## Proto-unidades — Must Have

| ID | Capacidad | SC | Depende de | Orden | Origen |
|---|---|---|---|---|---|
| IB-01 | Contratos compartidos y modelo de datos para cuentas y contenido. | SC-01, SC-03 | — | 1 | CT-06; Q3 |
| IB-02 | Cuentas reales con identidad y sesión propia. | SC-01 | IB-01 | 2 | CT-07; Q1 |
| IB-03 | Perfil asociado a cada cuenta. | SC-02 | IB-02 | 3 | Q1 |
| IB-04 | Consentimiento, borrado y retención bajo LFPDPPP. | SC-09 | IB-02 | 3 | CT-03, CT-09; Q2 |
| IB-05 | Adaptadores de la app al servicio real, con respaldo local de solo lectura. | SC-08 | IB-01, IB-02 | 3 | Q2 |
| IB-06 | Publicar y leer opiniones. | SC-03 | IB-03 | 4 | Q1 |
| IB-07 | Feed de opiniones compartidas. | SC-04 | IB-06 | 5 | Q1 |
| IB-08 | Me gusta y comentarios. | SC-05 | IB-06 | 5 | Q1 |
| IB-09 | Seguir a otra persona. | SC-06 | IB-03 | 5 | Q1 |
| IB-10 | Actividad reciente de cada cuenta. | SC-07 | IB-07, IB-08, IB-09 | 6 | Descripción inicial; Q1 |
| IB-11 | Verificación con dos dispositivos reales en la misma red local. | SC-10 | IB-05, IB-10 | 7 | Q4; R-04 |

## Should Have

Ninguna en esta entrega. Lo que no es imprescindible para la métrica de éxito se declara fuera de alcance, no se deja en una lista ambigua.

## Could Have

Ninguna en esta entrega. No hay capacidad sobrante declarada ni señales reales que justifiquen añadirla.

## Won't Have (this time)

| Capacidad excluida | Motivo | Origen |
|---|---|---|
| Migrar contenido simulado desde el teléfono. | Q3 lo descarta; cada cuenta empieza de cero. | CT-02 |
| Gestionar tokens de Spotify o client secret en el servicio. | PKCE y token siguen en la app. | CT-04 |
| Reproducir audio, enviar notificaciones push ni publicar en tiendas. | Fuera de la versión. | CT-05 |
| Panel de administración, moderación ni roles de administrador. | Decisión explícita. | CT-05 |
| Desplegar en servidor, staging, nube ni compilación propia. | Servicio solo en el portátil. | CT-01 |
| Adoptar un backend gestionado o migrar cuentas a otro proveedor. | Se conserva lo construido en el repositorio. | CT-06 |
| Login simulado en el servicio. | Las cuentas son reales. | CT-07 |
| Fijar objetivos numéricos de audiencia o rendimiento. | El éxito es funcional. | A-05 |

## Notas de secuenciación

- El orden 1 a 7 es una preferencia de dependencias, no un calendario ni una división en unidades de código.
- IB-03, IB-04 e IB-05 comparten el orden 3 porque ninguno depende de los otros; pueden avanzar en paralelo.
- IB-07, IB-08 e IB-09 comparten el orden 5 por la misma razón.
- Antes de convertir estas proto-unidades en unidades de trabajo hay que comprobar el estado real de `apps/api` y `packages/contracts` (R-01, I-04).
- IB-11 cierra la entrega: sin los dos dispositivos en la misma red no se ha demostrado la métrica de éxito (Q4).
