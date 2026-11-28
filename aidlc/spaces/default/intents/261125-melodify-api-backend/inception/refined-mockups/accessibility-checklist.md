# Checklist de accesibilidad

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/wireframes.md`: todos los diagramas se leen en texto y no dependen de color.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/user-flow.md`: avisos en lenguaje llano y recuperación explícita.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/stories.md`: criterios AC7.1.1, AC7.1.2 y AC7.2.2 sobre errores y degradación.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: FR7.1, FR7.2, NFR1 y NFR9.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: errores con «Reintentar», tarjeta compartida y APIs de Expo Go.

## Objetivo

WCAG 2.1 AA sobre la app Expo Go, con diseño móvil primero a 320 y 375 px y adaptación a tableta a 768 px. La verificación automática no sustituye la revisión manual en dispositivo; el recorrido real entre dos dispositivos sigue siendo el criterio de terminado del intento.

## Checklist

| ID | Requisito | Implementación en el diseño | Verificación |
|---|---|---|---|
| A-01 | Idioma y lenguaje comprensible | Todos los textos visibles y mensajes de error están en español | Revisión de pantallas y mensajes del servicio |
| A-02 | Contraste de texto | Mínimo 4.5:1 para texto normal con los tokens de `design-system` | Comprobación de tokens y muestra en dispositivo |
| A-03 | Contraste de componentes | Mínimo 3:1 para botones, bordes, iconos y estado de valoración | Comprobación visual con el tema vigente |
| A-04 | Sin dependencia del color | Estado de me gusta, error y valoración llevan texto o icono además del color | Revisión de cada componente con escala de grises |
| A-05 | Objetivos táctiles | Botones y controles de al menos 44x44 px con separación de 8 px | Medición en el layout de 320 px |
| A-06 | Etiquetas visibles | `handle`, contraseña, tipo de obra, ID, valoración, reseña y comentario tienen etiqueta antes del campo | Revisión de formularios; ningún placeholder como única etiqueta |
| A-07 | Errores identificados | El error aparece bajo el campo afectado y dice qué corregir, sin códigos técnicos | Casos inválidos de FR1.5, FR3.5 y FR5.2 |
| A-08 | Acción de recuperación | Todo error de red o servicio ofrece «Reintentar» | Recorrido de servicio no disponible |
| A-09 | Anuncios dinámicos | Estados de carga, envío, recuperación y errores usan `aria-live` con tono apropiado | Prueba con TalkBack en Android |
| A-10 | Semántica nativa | Botones, formularios, listas y diálogo usan componentes nativos o roles correctos | Inspección de accesibilidad en dispositivo |
| A-11 | Navegación y foco | Orden de foco sigue la lectura; el modal confina foco y Escape lo cierra | Navegación sin puntero por Acceso, Crear, Detalle y Perfil |
| A-12 | Jerarquía y encabezados | Cada pantalla tiene un título claro; la tarjeta de opinión usa encabezado para autor y obra | Revisión de jerarquía con lector de pantalla |
| A-13 | Sesión expirada sin pérdida | Aviso comprensible, texto conservado y reanudación tras reautenticar | Recorrido 2 de `user-flow.md` |
| A-14 | Degradación comprensible | Respaldo local en solo lectura con aviso y «Reintentar»; escrituras bloqueadas | Recorrido 3 de `user-flow.md` |
| A-15 | Movimiento reducido | Feedback por debajo de 300 ms y sin animaciones cuando el sistema pide menos movimiento | Revisión con preferencia de movimiento reducido |
| A-16 | Zoom y texto largo | Layout usable con texto ampliado y reseña de 2000 caracteres sin recortes | Revisión en 320 px y con texto límite |
| A-17 | Sin tiempo límite | La sesión expirada se puede recuperar; ninguna acción depende de un contador visible | Casos de sesión vencida y renovación |
| A-18 | Compatibilidad Expo Go | Todas las etiquetas, roles y gestos usan APIs disponibles en Expo Go | Ejecución en teléfono Android con Expo Go |

## Criterios de aceptación de accesibilidad

- El recorrido principal se completa sin ratón en el dispositivo y se entiende con TalkBack.
- Ningún error muestra un código técnico ni depende solo del color rojo.
- Los estados vacío, carga, éxito, error y parcial son distinguibles en Inicio, Detalle y Actividad.
- El modal de borrado explica el impacto y permite cancelar sin perder el contexto previo.
- La verificación final se repite en los dos dispositivos de la misma red local sin sesión de Spotify y con ella.
