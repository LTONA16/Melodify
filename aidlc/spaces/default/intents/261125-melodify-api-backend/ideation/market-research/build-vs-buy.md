# Construir, Comprar o Integrar

Parte de `intent-statement.md` y de las respuestas de esta etapa. El repositorio ya contiene un servicio en `apps/api`, así que la decisión no es «construir desde cero» sino qué se hace con lo que ya existe.

## 1. Decisión

**Construir sobre lo que ya hay en `apps/api`** (Fastify, Prisma y PostgreSQL), completando perfiles, opiniones, me gusta, comentarios, seguimientos, feed y actividad.

## 2. Alternativas consideradas

| Alternativa | Qué implicaría | Por qué no se elige ahora |
|---|---|---|
| Construir sobre `apps/api` | Ampliar el servicio existente con las piezas que faltan | **Elegida**: conserva lo ya construido y probado, y no cambia de tecnología a mitad del producto |
| Contratar un backend como servicio (Supabase, Firebase u otro) | Migrar cuentas, datos y permisos a un proveedor, y adaptar la app | Supone rehacer lo que ya existe, ata el producto a un proveedor y añade coste y migración |
| Integrar una comunidad musical ya existente | Apoyarse en un producto de terceros y no construir el propio | No da el feed ni la opinión breve con la forma que buscamos, y deja el producto en manos de otro |
| Comparar construir y comprar antes de decidir | Abrir una evaluación formal antes de escribir código | Añade tiempo sin cambiar la conclusión: el servicio ya está en el repositorio y la app ya lo espera |

## 3. Criterios de la decisión

| Criterio | Construir sobre `apps/api` | Comprar un servicio | Integrar uno existente |
|---|---|---|---|
| ¿Es el diferenciador del producto? | Sí: cuentas, contenido compartido, feed y actividad son el producto | No: el proveedor da infraestructura, no la experiencia | No: la experiencia sería la de otro |
| Tiempo hasta algo usable | Corto: se amplía lo que ya funciona | Medio: migración y adaptación | Largo: negociación e integración ajena |
| Coste | El del equipo y la infraestructura que ya se usa | Suscripción recurrente y coste de salida | Depende del tercero |
| Personalización | Total | Limitada a lo que el proveedor permita | Limitada a lo que el producto ajeno ofrezca |
| Datos y privacidad | Control directo del tratamiento | Sujeto a la política del proveedor | Sujeto a la política del tercero |
| Mantenimiento | Del equipo | Del proveedor, con dependencia | Del tercero, con dependencia |
| Encaje con lo ya construido | Alto: mismo lenguaje, mismas pruebas, mismo CI | Bajo: obliga a rehacer | Bajo: obliga a adaptar la app a otro modelo |

## 4. Consecuencias

- El equipo asume el mantenimiento del servicio y de su base de datos; a cambio, controla el producto y sus datos.
- Las decisiones de privacidad y protección de datos se toman en casa, sin depender de la política de un proveedor.
- La app móvil sigue hablando con el mismo servicio que ya conoce, con los contratos compartidos en `packages/contracts`.
- La integración con Spotify se queda en la app; el backend no toca tokens de Spotify.
- Si en el futuro el producto crece hasta necesitar servicios gestionados, esa será una decisión propia y no una consecuencia de esta.

## Assumptions & Open Questions

- [assumption] No se evaluó el coste real de un backend como servicio ni de integrar un producto de terceros; la comparación es cualitativa y se apoya en lo que cada alternativa implica para este producto.
- [assumption] Se asume que el servicio de `apps/api` está en condiciones de ampliarse; si al revisarlo resulta incompleto, habrá que decidir qué parte se conserva.
- [assumption] El equipo prefiere mantener el control del dato y del producto frente a la comodidad de un proveedor; no se ha preguntado explícitamente por el coste.
