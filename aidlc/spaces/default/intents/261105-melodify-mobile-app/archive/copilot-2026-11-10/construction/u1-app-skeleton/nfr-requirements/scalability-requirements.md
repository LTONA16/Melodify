# Requisitos de escalabilidad — U1

## Aplicabilidad

La unidad no contiene backend, base de datos, sincronización ni tráfico
multiusuario. No se requiere escalado horizontal ni capacidad de servicio.
Estos límites evitan que el esqueleto cree accidentalmente una arquitectura de
servidor.

| ID | Requisito medible | Verificación |
|---|---|---|
| NFR8.5 | La memoria de contenido de U1 queda acotada al modelo de una opinión, una obra y una identidad demo; no se permite crecimiento por cada render, cambio de pestaña o reintento. | Pruebas de identidad/reutilización de la semilla y revisión del estado. |
| NFR8.6 | Las cinco pilas de pestañas se mantienen independientes y solo contienen la navegación local creada por la persona; U1 no agrega almacenamiento compartido ni colas globales. | Prueba de cambio repetido de pestañas y revisión de `AppShell`. |
No se fijan usuarios concurrentes, RPS, tamaño de base de datos, réplicas,
autoscaling ni particionamiento porque serían infraestructura inventada y están
fuera de RC-01–RC-05.

