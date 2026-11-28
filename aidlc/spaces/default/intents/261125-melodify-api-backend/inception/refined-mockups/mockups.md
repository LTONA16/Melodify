# Mockups refinados

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/wireframes.md`: contexto, recorrido principal, fallos y privacidad.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/user-flow.md`: cinco recorridos y verificación con dos dispositivos.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/stories.md`: 16 historias y 48 criterios de aceptación.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: requisitos FR1-FR9 y NFR1-NFR10.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: tarjeta de opinión compartida, textos en español y errores con «Reintentar».

## Decisiones de refinamiento

- Media fidelidad: diagramas de texto con etiquetas reales, jerarquía y estados; sin valores exactos de color, tipografía ni espaciado.
- No se crean pantallas nuevas: se refinan Inicio, Explorar, Crear, Actividad, Perfil y detalle, más el flujo de acceso y privacidad.
- Cada historia se mapea a una pantalla, un estado y un componente; los criterios siguen siendo la fuente de prueba.
- Patrones elegidos: validación al abandonar campo, edición en línea, modal solo para borrado de cuenta, «Cargar más» por cursor y aviso de degradación con «Reintentar».
- Objetivo accesible: WCAG 2.1 AA con móvil primero a 320 y 375 px y tableta a 768 px.

## Mapa de historias a interfaz

| Historia | Pantalla o flujo | Estado y componente | Criterios |
|---|---|---|---|
| US1.1 | Acceso / alta de cuenta | Formulario `AccountForm`, validación al blur | AC1.1.1-AC1.1.3 |
| US1.2 | Acceso y sesión global | `AuthGate`, renovación silenciosa antes de acciones | AC1.2.1-AC1.2.3 |
| US1.3 | Perfil | Acción «Cerrar sesión» en la cabecera de sesión | AC1.3.1-AC1.3.2 |
| US2.1 | Perfil | `ProfileHeader` y edición en línea con `ProfileEditor` | AC2.1.1-AC2.1.3 |
| US3.1 | Crear | `OpinionEditor` con tipo e ID de obra y valoración | AC3.1.1-AC3.1.4 |
| US3.2 | Detalle | edición en línea de la opinión propia en `OpinionCard` | AC3.2.1-AC3.2.3 |
| US3.3 | Detalle e Inicio | lectura individual y por obra en `OpinionCard` | AC3.3.1-AC3.3.3 |
| US4.1 | Inicio y detalle | `LikeButton` con feedback en el lugar y contador persistido | AC4.1.1-AC4.1.3 |
| US4.2 | Detalle | `CommentComposer` con validación y protección de doble envío | AC4.2.1-AC4.2.3 |
| US4.3 | Detalle | `CommentThread` con «Cargar más» por cursor | AC4.3.1-AC4.3.3 |
| US5.1 | Inicio | `FeedList` global con «Cargar más» por cursor | AC5.1.1-AC5.1.3 |
| US5.2 | Actividad | `ActivityList` de acciones públicas de la cuenta consultada | AC5.2.1-AC5.2.3 |
| US6.1 | Perfil | `FollowButton` y listas de seguidores/seguidos | AC6.1.1-AC6.1.3 |
| US6.2 | Alta y Perfil | `ConsentCheckbox` y `ConfirmDeleteDialog` con regla de 30 días | AC6.2.1-AC6.2.3 |
| US7.1 | Global | `ErrorBanner` y mensajes de campo en español con acción | AC7.1.1-AC7.1.3 |
| US7.2 | Global e Inicio | `OfflineBanner`, respaldo de solo lectura y «Reintentar» | AC7.2.1-AC7.2.3 |

## Matriz de estados por pantalla

| Pantalla | Vacío | Carga | Éxito | Error | Parcial o borde |
|---|---|---|---|---|---|
| Acceso | Sin cuenta: formulario listo | Validando credenciales | Sesión iniciada | Credenciales o campo inválido con acción | Sesión vencida: conserva texto y vuelve a acceder |
| Inicio | «Todavía no hay opiniones. Publica la primera.» | Esqueleto de tarjetas | Feed global con tarjetas compartidas | Aviso con «Reintentar» | Cursor con «Cargar más» y sin duplicados |
| Explorar | Sin resultados de búsqueda: texto y nueva búsqueda | Resultados en esqueleto | Resultados del catálogo o respaldo | Búsqueda fallida con «Reintentar» | Sin Spotify: catálogo de ejemplo con aviso |
| Crear | Formulario listo con la obra pendiente | Guardando opinión | Opinión publicada y visible en el feed | Campo inválido o duplicado con conflicto | Reseña en el límite de 2000 y aviso de caracteres restantes |
| Actividad | «Todavía no hay actividad pública.» | Esqueleto de grupos | Grupos de acciones públicas | Aviso con «Reintentar» | Muchas acciones: «Cargar más» por cursor |
| Perfil | Perfil propio sin biografía ni avatar | Cargando perfil | `handle`, nombre, biografía, avatar y acciones | Error de lectura o edición con «Reintentar» | `handle` largo, avatar como referencia de texto |
| Detalle | Obra sin opiniones o sin comentarios | Cargando opinión y comentarios | Opinión, valoración y comentarios | Error de lectura o comentario con «Reintentar» | Reseña larga plegable visualmente y edición en línea |

## Boceto: Acceso y alta

```
+---------------------------------------+
| Melodify - Acceso                     |
| Handle [____________________]         |
| Contrasena [________________]         |
| [ ] Acepto el aviso de privacidad     |
| [ Entrar ]        [ Crear cuenta ]    |
| Error: texto llano bajo el campo      |
+---------------------------------------+
```

Lectura: el consentimiento aparece en el alta, no como nota separada. La validación ocurre al abandonar cada campo; el botón de envío se deshabilita solo con una explicación visible. Si la sesión vence a mitad de flujo, se conserva lo escrito y se vuelve a esta pantalla.

## Boceto: Inicio / feed

```
+---------------------------------------+
| Inicio                    [Perfil]    |
| [ aviso degradacion / Reintentar ]    |
| +-----------------------------------+ |
| | Tarjeta de opinion compartida    | |
| | autor - obra - valoracion        | |
| | reseña - me gusta - comentar     | |
| +-----------------------------------+ |
| [ Cargar mas ]                        |
+---------------------------------------+
```

Estados: el aviso de degradación solo aparece cuando el servicio falla; el feed vacío muestra explicación y «Publicar la primera opinión»; la carga usa esqueleto de tarjetas; el error mantiene el aviso en lenguaje llano y ofrece «Reintentar».

## Boceto: Explorar

```
+---------------------------------------+
| Explorar                              |
| [ buscar cancion, album, artista ]    |
| [ aviso sin Spotify / Reintentar ]    |
| + resultado 1: tipo e ID opaco      | |
| + resultado 2: tipo e ID opaco      | |
+---------------------------------------+
```

Lectura: los resultados pueden venir del catálogo real o del respaldo de ejemplo. La ausencia de Spotify no bloquea abrir una obra y publicar una opinión; el backend no recibe metadatos ni tokens.

## Boceto: Crear

```
+---------------------------------------+
| Crear opinion                         |
| Tipo: [cancion|album|artista]         |
| ID de obra [________________________] |
| Valoracion [0.5 ... 5]               |
| Reseña [________________________]     |
| 0/2000 caracteres                     |
| [ Publicar ]                          |
+---------------------------------------+
```

Lectura: los límites visibles evitan errores después del envío. Un duplicado muestra conflicto en español; la reseña no se pierde al corregir el campo.

## Boceto: Actividad

```
+---------------------------------------+
| Actividad                             |
| Hoy                                   |
| - Publico una opinion                 |
| - Dijo me gusta en una opinion        |
| - Siguio a otra cuenta                |
| [ Cargar mas ]                        |
+---------------------------------------+
```

Lectura: solo aparecen acciones públicas de la cuenta consultada. El orden es de más reciente a más antiguo y los empates se resuelven por ID en el servicio.

## Boceto: Perfil y privacidad

```
+---------------------------------------+
| @handle                               |
| Nombre visible                        |
| Biografia opcional                    |
| Avatar opcional (referencia de texto) |
| [ Editar perfil ] [ Seguir ]          |
| [ Cerrar sesion ]                     |
| [ Solicitar borrado de cuenta ]       |
+---------------------------------------+

Alta: handle -> contrasena -> consentimiento -> Crear cuenta
Borrado: Solicitar borrado -> Confirmacion -> Datos eliminados en maximo 30 dias
```

Lectura: el modal de confirmación se usa solo para el borrado porque es la acción irreversible. La edición de nombre, biografía y avatar ocurre en línea y no afecta al `handle`.

## Boceto: Detalle de obra u opinion

```
+---------------------------------------+
| Obra: tipo + ID opaco                 |
| +-----------------------------------+ |
| | Tarjeta de opinion compartida    | |
| | [ Editar ] solo si es propia     | |
| +-----------------------------------+ |
| Comentarios                           |
| [ escribir comentario ]              |
| - comentario 1                        |
| [ Cargar mas ]                        |
+---------------------------------------+
```

Lectura: la tarjeta de opinión es el componente compartido en `app/src/components/`; el detalle no la reimplementa. La edición en línea mantiene autor y fecha de creación.

## Coherencia con la verificación

Los diagramas conservan el recorrido real: crear cuenta, publicar desde un dispositivo y ver el contenido en el segundo dispositivo de la misma red local. No aparecen despliegue, túneles, moderación, audio ni publicación en tiendas.
