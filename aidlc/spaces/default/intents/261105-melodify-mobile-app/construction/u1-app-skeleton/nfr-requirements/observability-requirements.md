# Requisitos de observabilidad — U1

## Restricción de operación

NFR9 prohíbe paneles y telemetría en esta versión. La observabilidad de U1 es
diagnóstico local y visible para la persona; no se envían logs, métricas,
trazas ni identificadores a terceros.

| ID | Requisito | Verificación |
|---|---|---|
| NFR9.1 | Cada estado recuperable de sesión y de Inicio tiene una representación visible y en español: cargando interno, vacío, error y acción «Reintentar» cuando corresponda. Nunca se muestra un código técnico. | Pruebas de estado y recorrido manual de cada error. |
| NFR9.2 | Los errores de almacenamiento se clasifican como lectura, guardado o borrado dentro del estado interno, pero la UI solo muestra el mensaje de lenguaje llano definido por Functional Design. | Revisión de tipos/estado y pruebas de mapeo de errores. |
| NFR9.3 | No usar `console.log` de depuración ni registrar credenciales, payloads de sesión o datos de opinión; los dobles de prueba pueden contar llamadas sin salir del proceso. | Lint/revisión de código y pruebas sin red. |
| NFR9.4 | La verificación manual registra únicamente resultado de recorrido, dispositivo Android, versión de Expo Go y evidencia de los estados probados; no captura ni transmite datos personales. | Checklist del PR/checkpoint. |

No se implementan dashboards, alertas, tracing distribuido, SLI operativos ni
telemetría real en U1.

