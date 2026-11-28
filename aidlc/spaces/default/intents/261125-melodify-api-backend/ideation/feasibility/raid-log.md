# Registro RAID — Viabilidad y Restricciones

## Risks

| ID | Riesgo | Impacto | Probabilidad | Mitigación | Origen |
|---|---|---|---|---|---|
| R-01 | El servicio existente resulte incompleto o difícil de ampliar. | Alto: cambia el trabajo de la primera entrega. | Media | Comprobar el estado real de `apps/api` y `packages/contracts` antes de fijar unidades de trabajo; decidir qué se conserva. | `build-vs-buy.md` |
| R-02 | Las obligaciones de la LFPDPPP no se concreten a tiempo (consentimiento, borrado y retención). | Alto: datos personales sin tratamiento definido. | Media | Llevar los tres puntos como requisitos explícitos desde Requirements Analysis; no inventar plazos en esta etapa. | Q2 de `feasibility-questions.md`; `market-trends.md` |
| R-03 | Quien probó la app espere conservar sus opiniones al pasar a cuentas reales. | Medio: decepción o pérdida de contenido de prueba. | Media | Comunicar desde el alcance que el contenido simulado se descarta y que cada cuenta empieza de cero. | Q3 de `feasibility-questions.md`; `intent-statement.md` |
| R-04 | La verificación desde un segundo dispositivo no sea posible con el servicio solo en el portátil. | Medio: la métrica de éxito no se pueda demostrar. | Media | Definir en Scope Definition cómo se alcanza el servicio local desde la misma red; sin desplegar nada. | Q1 de `feasibility-questions.md`; `intent-statement.md` |
| R-05 | Cambios en términos o política de la API de Spotify afecten la consulta del catálogo desde la app. | Medio: hay que limitar qué se muestra. | Media | Mantener la integración en la app y consultar el catálogo sin copiarlo en masa; vigilar la documentación de la plataforma. | `market-trends.md`; `competitive-analysis.md` |

## Assumptions

| ID | Supuesto | Por qué se asume | Cómo se comprueba |
|---|---|---|---|
| A-01 | El contenido que hoy vive en los teléfonos es de ejemplo y no hay nada real que conservar. | La persona eligió descartarlo en Q3 y la descripción inicial lo describe como simulado. | Revisar el alcance: no se incluye migración ni importación desde el dispositivo. |
| A-02 | El servicio local es suficiente para esta versión; no se necesita servidor ni entorno público. | Respuesta Q1. | La verificación se hace en local, sin configuración de despliegue. |
| A-03 | El segundo dispositivo alcanza el servicio local desde la misma red. | La métrica de éxito pide ver contenido desde otro dispositivo y Q1 descarta un servidor. | Probar el recorrido con dos dispositivos en la misma red durante la verificación. |
| A-04 | El equipo prefiere mantener el control del dato frente a la comodidad de un proveedor. | `build-vs-buy.md` lo recoge como criterio de decisión, sin evaluación de coste real. | Confirmar en Scope Definition que no se reabre la comparación con servicios gestionados. |
| A-05 | No hay métricas numéricas de mercado ni objetivo de audiencia. | `market-trends.md` y `intent-statement.md`. | Medir el éxito por uso real, no por cifras de tamaño. |

## Issues

| ID | Problema detectado | Resolución | Estado |
|---|---|---|---|
| I-01 | `market-trends.md` asume RGPD como referencia de privacidad, pero Q2 confirma LFPDPPP (México). | La LFPDPPP pasa a ser la norma rectora; el RGPD queda como referencia prudente, no como norma aplicable. | Resuelto en esta etapa; reflejar en requisitos. |
| I-02 | `intent-statement.md` deja abierto qué pasa con el contenido creado en los teléfonos. | Q3 lo cierra: se descarta, sin migración única. | Resuelto en esta etapa; reflejar en alcance. |
| I-03 | La normativa confirmada no incluye aún plazos concretos de consentimiento, borrado y retención. | Registrar como R-02 y resolver en Requirements Analysis, sin fijar valores aquí. | Abierto. |
| I-04 | No se ha comprobado el estado real del servicio existente. | Registrar como R-01 y comprobarlo antes de dividir el trabajo en unidades. | Abierto. |

## Dependencies

| ID | Dependencia | Necesaria para | Estado |
|---|---|---|---|
| D-01 | Servicio existente en `apps/api` y contratos compartidos en `packages/contracts`. | Completar cuentas, contenido y feed sobre lo ya construido. | Presente en el repositorio; estado por verificar (R-01). |
| D-02 | Docker en el portátil para levantar el servicio y la base de datos. | Operación y verificación local (CT-01). | Dada por la descripción inicial. |
| D-03 | Definición de requisitos de privacidad bajo LFPDPPP. | Diseño de datos y consentimiento (R-02). | Pendiente de Requirements Analysis. |
| D-04 | Acceso desde un segundo dispositivo a la misma red local. | Demostrar la métrica de éxito (R-04, A-03). | Pendiente de Scope Definition y verificación. |
| D-05 | App móvil con PKCE y token en el dispositivo. | Mantener la integración con Spotify fuera del backend (CT-04). | Ya existente según la descripción inicial y las reglas del proyecto. |

## Fuentes

- `intent-statement.md`
- `competitive-analysis.md`
- `market-trends.md`
- `build-vs-buy.md`
- `feasibility-questions.md`
