# Personas

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: FR1-FR9 y NFR1-NFR10.
- `aidlc/spaces/default/codekb/Melodify/business-overview.md`: dominio de red social de descubrimiento y reseña musical.
- `aidlc/spaces/default/codekb/Melodify/component-inventory.md`: sesión real pendiente, almacén de contenido local y catálogo con respaldo.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/user-stories-questions.md`: Q1-A fijó tres personas funcionales.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: verificación funcional entre dos dispositivos en la misma red local.

## Persona 1 — `Reseñador`

- **Rol**: cuenta real que publica y edita una única opinión por obra musical.
- **Objetivos**: crear una cuenta con `handle` único, iniciar sesión, valorar entre 0.5 y 5, escribir una reseña de 1 a 2000 caracteres, editar su opinión sin cambiar autor ni fecha de creación y comprobar que otra dispositivo ve la misma opinión.
- **Dolores**: perder el texto al recibir un error de validación; no saber si una obra ya tiene su opinión; dudar de que la publicación se guardó realmente en el servicio compartido.
- **Contexto**: usa la app Expo Go sobre un dispositivo de la misma red local; el backend guarda tipo e ID opaco de Spotify, sin metadatos ni tokens.
- **Historias**: US1.1, US1.2, US1.3, US3.1, US3.2, US3.3, US6.2.

## Persona 2 — `Oyente`

- **Rol**: persona que descubre música, lee opiniones y consulta perfiles antes de decidir qué escuchar.
- **Objetivos**: ver el feed global, leer opiniones individuales y por obra, consultar el perfil público de otra cuenta y seguir teniendo lectura comprensible cuando el servicio local falla.
- **Dolores**: encontrar huecos vacíos sin explicación; no distinguir entre «todavía no hay contenido», carga y error; depender de una sesión de Spotify para leer contenido social.
- **Contexto**: la app debe degradar a un respaldo local de solo lectura con aviso en español y «Reintentar»; nunca necesita credenciales de Spotify en el backend.
- **Historias**: US2.1, US3.3, US5.1, US7.2.

## Persona 3 — `Curador social`

- **Rol**: cuenta que reacciona, comenta, sigue y consulta la actividad pública de otras cuentas.
- **Objetivos**: dar y quitar me gusta sin duplicar contadores, comentar con texto válido, listar comentarios de forma estable, seguir y dejar de seguir sin seguirse a sí misma y ver la actividad pública correspondiente.
- **Dolores**: que dos dispositivos vean contadores distintos; que una acción se pierda silenciosamente o se repita por un doble toque; que el feed cambie al seguir a alguien.
- **Contexto**: las acciones son públicas, el feed permanece global y las listas usan cursor con orden estable por fecha e ID.
- **Historias**: US4.1, US4.2, US4.3, US5.2, US6.1, US7.1.

## Relaciones entre personas

Una misma cuenta real puede actuar como `Reseñador`, `Oyente` y `Curador social`; las personas no son roles excluyentes ni jerarquías de permisos. `Reseñador` y `Oyente` intervienen en el tramo mínimo que debe demostrarse entre dos dispositivos; `Curador social` amplía la misma base con interacciones y actividad.

## Prioridad de personas

1. `Reseñador`: origen del contenido compartido y eje del checkpoint de esqueleto.
2. `Oyente`: destino de la lectura en el segundo dispositivo y de la degradación comprensible.
3. `Curador social`: breadth social sobre la identidad y las opiniones ya verificadas.
