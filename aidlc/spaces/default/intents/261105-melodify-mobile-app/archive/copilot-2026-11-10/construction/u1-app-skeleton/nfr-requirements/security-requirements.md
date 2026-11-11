# Requisitos de seguridad — U1

## Requisitos

| ID | Requisito | Verificación |
|---|---|---|
| NFR3.1 | La única entrada válida de U1 es `demo`/`demo`; la validación compara valores normalizados para espacios extremos, no registra ni muestra la contraseña y conserva el formulario solo en memoria de la pantalla. | Pruebas para credencial válida, inválida y espacios extremos; revisión de código. |
| NFR3.2 | El recuerdo de sesión se guarda mediante el adaptador de almacenamiento seguro acordado por C3; el valor solo puede representar `authorId=demo` y no contiene contraseña, tokens de Spotify ni datos de terceros. | Prueba del adaptador con doble de Secure Store y revisión del payload persistido. |
| NFR3.3 | «Cerrar sesión» elimina el recuerdo antes de emitir `signedOut`; si la eliminación falla, se conserva la sesión y se muestra «Reintentar». No se debe navegar a Login como si el borrado hubiese concluido. | Pruebas de borrado correcto y fallo de borrado. |
| NFR3.4 | Login no expone las pestañas autenticadas: `SessionView` solo emite `signedIn` o `signedOut`, y `signedIn` exige `authorId=demo` y recuerdo válido. Valores almacenados inválidos se tratan como ausencia. | Pruebas de acceso con valores inválidos y revisión de navegación. |
| NFR3.5 | No se incluyen secretos, client secret, tokens, credenciales reales ni archivos `.env` en el repositorio. U1 no integra Spotify ni define variables de Spotify. | Búsqueda de secretos y revisión de `.gitignore`/fuentes antes del PR. |
| NFR4.1 | U1 no envía datos a un servidor propio, no registra eventos de usuario y mantiene la opinión, autor y contadores de ejemplo exclusivamente en memoria. | Prueba sin red y revisión de dependencias/llamadas de red. |
| NFR6.1 | Campos, botones principales y controles de la barra mantienen un área táctil mínima de 44×44; el texto de errores y acciones es español y visible en temas claro y oscuro. | Inspección en Android y pruebas de accesibilidad visual definidas para el componente. |
| NFR5.2 | La cobertura de líneas de `app/src/**` y de cada paquete creado por U1 alcanza al menos 80 % en el comando de CI, sin excluir la lógica de sesión ni la navegación para hacer pasar la etapa. | `npm test -- --coverage` y revisión del informe de cobertura. |
| NFR6.2 | El texto normal alcanza contraste mínimo 4.5:1 y el texto grande e iconos 3:1 en tema claro y oscuro; los valores se comprueban sobre los tokens del sistema de diseño. | Revisión de tokens y comprobación visual/automática de contraste. |

## Amenazas y controles

- **Persistencia manipulada o corrupta:** validar forma, valores permitidos y
  `authorId`; ante cualquier anomalía borrar si es posible y abrir Login.
- **Doble envío de Login:** deshabilitar el botón durante `signingIn` y hacer la
  operación idempotente.
- **Filtración accidental:** prohibir `console.log` de valores de formulario y
  no copiar secretos a errores, snapshots o fixtures.

La autenticación es deliberadamente demo y no es una frontera de seguridad para
usuarios reales. Convertirla en autenticación real requiere una etapa y diseño
posteriores, fuera de U1.

