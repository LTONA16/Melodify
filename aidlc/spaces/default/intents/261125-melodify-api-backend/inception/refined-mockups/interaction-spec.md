# Especificación de interacción

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/wireframes.md`: recorrido principal, fallos y privacidad.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/user-flow.md`: sesión vencida, servicio no disponible, feed vacío y borrado.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/stories.md`: criterios de aceptación de las 16 historias.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: FR1-FR9 y NFR1-NFR10.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: errores en español con «Reintentar» y tarjeta compartida.

## Patrones globales

- Validar al abandonar el campo, no en cada pulsación; el error aparece bajo el campo y nombra la acción o el campo afectado.
- Editar perfil y opinión en línea; usar modal solo para confirmar borrado de cuenta.
- Listas con cursor y botón «Cargar más», sin desplazamiento infinito; el estado vacío es distinto de carga y error.
- Aviso de degradación persistente mientras el servicio no responda, con «Reintentar» y bloqueo de escrituras.
- Acciones idempotentes con feedback en el lugar; un doble toque no duplica opiniones, comentarios, me gusta ni seguimientos.
- Si la sesión vence a mitad de flujo, conservar lo escrito, mostrar aviso en español y reanudar la acción tras reautenticar.

## AccountForm

| Field | Value |
|---|---|
| Component | `AccountForm` |
| Description | Formulario de registro y acceso con consentimiento explícito en el alta. |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Campos listos y acción principal visible | apertura de Acceso |
| focus | Campo activo con indicador visible | Tab o toque |
| loading | Envío en curso con botón deshabilitado | acción de entrada o alta |
| error | Error de campo o credencial en español | validación o respuesta del servicio |
| disabled | Envío no disponible con explicación visible | campos obligatorios incompletos |
| session-expired | Texto conservado y aviso para volver a entrar | sesión vencida durante el flujo |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| mode | string | yes | — | `sign-in` o `sign-up` |
| consentRequired | boolean | no | false | Muestra `ConsentCheckbox` en el alta |
| errorMessage | string \| null | no | null | Mensaje en lenguaje llano |
| onSubmit | function | yes | — | Envía los campos validados |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Una columna, campos apilados y botón a ancho completo |
| tablet (768–1024px) | Formulario centrado con ancho máximo |
| desktop (>1024px) | Mismo formulario centrado; sin nuevas secciones |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `form` con etiquetas asociadas a cada campo |
| Keyboard interaction | Tab entre campos, Enter en el botón de envío |
| Label / aria-label | Etiquetas visibles «Handle» y «Contraseña» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia el error del campo y el consentimiento como obligatorio en el alta |
| Focus management | Foco al primer campo inválido tras un error |

### Usage Example

```
<AccountForm mode="sign-up" consentRequired onSubmit={crearCuenta} />
```

## AuthGate

| Field | Value |
|---|---|
| Component | `AuthGate` |
| Description | Comprueba la sesión antes de mostrar acciones que escriben. |
| Category | feedback |

### States

| State | Description | Trigger |
|---|---|---|
| default | Sesión válida, contenido visible | arranque de la app |
| checking | Comprobando renovación | arranque o reanudación |
| expired | Aviso en español y vuelta a Acceso | access token vencido y refresh inválido |
| offline | Aviso de degradación sin culpar a la sesión | servicio local no disponible |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| session | object | yes | — | Sesión actual de `packages/app-session` |
| onReauth | function | yes | — | Lleva a Acceso conservando la acción pendiente |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Aviso en línea sobre el contenido |
| tablet (768–1024px) | Aviso centrado sobre el contenido |
| desktop (>1024px) | Aviso centrado con ancho máximo |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `alert` para caducidad, `status` para comprobación |
| Keyboard interaction | No intercepta Tab; el aviso ofrece botón alcanzable |
| Label / aria-label | Texto visible en español y acción «Iniciar sesión» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia caducidad y reanudación de la acción |
| Focus management | Foco al botón de acceso cuando la sesión expira |

### Usage Example

```
<AuthGate session={session} onReauth={volverAcceso}>
  <CrearOpinion />
</AuthGate>
```

## OpinionCard

| Field | Value |
|---|---|
| Component | `OpinionCard` |
| Description | Tarjeta compartida que muestra autor, obra, valoración, reseña y acciones. |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| default | Contenido publicado y acciones disponibles | render de una opinión |
| own | Muestra «Editar» solo para la autora | `isOwn` |
| liked | Me gusta activo con texto e icono | `likedByMe` |
| loading | Contador o acción pendiente | envío de me gusta |
| error | Error de acción en español junto al botón | respuesta fallida |
| long-text | Reseña extensa con lectura completa | reseña cerca de 2000 caracteres |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| opinion | object | yes | — | Vista de la opinión desde contratos compartidos |
| isOwn | boolean | no | false | Habilita edición en línea |
| likedByMe | boolean | no | false | Estado del me gusta |
| onLike | function | no | — | Alterna me gusta de forma idempotente |
| onEdit | function | no | — | Abre edición en línea |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Una columna y acciones debajo de la reseña |
| tablet (768–1024px) | Tarjeta centrada con ancho máximo |
| desktop (>1024px) | Misma tarjeta sin reimplementación por pantalla |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `article` con encabezado para autor y obra |
| Keyboard interaction | Botones de me gusta, comentar y editar alcanzables con Tab |
| Label / aria-label | «Me gusta», «Comentar» y «Editar opinión» como etiquetas visibles |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia valoración como texto, no solo estrellas |
| Focus management | Tras editar, foco vuelve al botón «Editar» |

### Usage Example

```
<OpinionCard opinion={opinion} isOwn onLike={alternarLike} onEdit={editar} />
```

## OpinionEditor

| Field | Value |
|---|---|
| Component | `OpinionEditor` |
| Description | Editor de valoración y reseña para publicar o editar una opinión. |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Tipo e ID de obra, valoración y reseña listos | apertura de Crear o edición |
| focus | Campo activo con indicador visible | Tab o toque |
| loading | Guardado en curso | envío |
| error | Campo inválido o conflicto de duplicado | validación o respuesta del servicio |
| disabled | Guardar deshabilitado con explicación visible | datos incompletos |
| editing | Autor y fecha de creación se muestran solo lectura | edición de opinión propia |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| workType | string | yes | — | `cancion`, `album` o `artista` |
| workId | string | yes | — | ID externo opaco, sin normalizar |
| rating | number | no | 0 | Valoración de 0.5 a 5 |
| review | string | no | — | Reseña de 1 a 2000 caracteres |
| mode | string | no | `create` | `create` o `edit` |
| onSubmit | function | yes | — | Envía los datos válidos |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Controles apilados y selector de valoración de fácil toque |
| tablet (768–1024px) | Editor centrado con ancho máximo |
| desktop (>1024px) | Mismo editor sin paneles adicionales |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `form` con grupo de valoración etiquetado |
| Keyboard interaction | Tab entre campos y flechas en el selector de valoración |
| Label / aria-label | Etiquetas visibles para tipo, ID, valoración y reseña |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia valoración numérica y caracteres restantes |
| Focus management | Foco al campo inválido y conservación del texto tras error |

### Usage Example

```
<OpinionEditor workType="cancion" workId={opaqueId} onSubmit={publicar} />
```

## FeedList

| Field | Value |
|---|---|
| Component | `FeedList` |
| Description | Lista global de opiniones con paginación por cursor. |
| Category | display |

### States

| State | Description | Trigger |
|---|---|---|
| empty | Explicación y acción para publicar la primera opinión | sin elementos |
| loading | Esqueleto de tarjetas | carga inicial o cursor |
| success | Tarjetas compartidas ordenadas | respuesta válida |
| error | Aviso con «Reintentar» | respuesta fallida |
| partial | Botón «Cargar más» sin duplicados | cursor disponible |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| opinions | array | yes | — | Opiniones recibidas del servicio |
| cursor | string \| null | no | null | Cursor de la página siguiente |
| onLoadMore | function | no | — | Pide la siguiente página |
| onRetry | function | no | — | Reintenta la carga fallida |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Una columna con tarjetas apiladas |
| tablet (768–1024px) | Una columna centrada con ancho máximo |
| desktop (>1024px) | Una columna centrada; sin cuadrícula ancha |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `list` con elementos `listitem` |
| Keyboard interaction | «Cargar más» y «Reintentar» alcanzables con Tab |
| Label / aria-label | «Cargar más opiniones» y «Reintentar» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia el estado vacío, carga y número de elementos añadidos |
| Focus management | Tras cargar, foco queda en «Cargar más» o en la primera tarjeta nueva |

### Usage Example

```
<FeedList opinions={opiniones} cursor={cursor} onLoadMore={cargarMas} onRetry={reintentar} />
```

## CommentThread

| Field | Value |
|---|---|
| Component | `CommentThread` |
| Description | Compositor y lista de comentarios de una opinión. |
| Category | input |

### States

| State | Description | Trigger |
|---|---|---|
| default | Compositor y comentarios visibles | apertura del detalle |
| empty | Explicación de que todavía no hay comentarios | sin elementos |
| loading | Comentarios en esqueleto | carga o cursor |
| submitting | Envío en curso y botón deshabilitado | publicar comentario |
| error | Error de campo o de carga con «Reintentar» | validación o servicio |
| partial | «Cargar más» con orden estable | cursor disponible |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| comments | array | yes | — | Comentarios recibidos |
| cursor | string \| null | no | null | Cursor siguiente |
| onSubmit | function | yes | — | Envía texto validado |
| onRetry | function | no | — | Reintenta carga o envío |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Compositor sobre la lista y una columna de comentarios |
| tablet (768–1024px) | Ancho máximo centrado |
| desktop (>1024px) | Mismo layout sin columnas dobles |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `form` y `list` con `aria-live="polite"` en el estado de envío |
| Keyboard interaction | Tab al compositor, Enter o botón para enviar |
| Label / aria-label | «Escribe un comentario» y «Publicar comentario» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia comentario publicado y errores sin códigos técnicos |
| Focus management | Tras publicar, foco al comentario nuevo; tras error, al campo |

### Usage Example

```
<CommentThread comments={comentarios} onSubmit={comentar} onRetry={reintentar} />
```

## ConfirmDeleteDialog

| Field | Value |
|---|---|
| Component | `ConfirmDeleteDialog` |
| Description | Modal de confirmación para borrado de cuenta. |
| Category | feedback |

### States

| State | Description | Trigger |
|---|---|---|
| default | Explica qué se elimina y el plazo máximo de 30 días | apertura desde Perfil |
| focus | Foco confinado dentro del modal | apertura |
| loading | Borrado en curso | confirmación |
| error | Error en español con salida segura | respuesta fallida |
| success | Cierre de sesión y vuelta a Acceso | borrado completado |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| visible | boolean | yes | false | Controla la apertura |
| onConfirm | function | yes | — | Confirma el borrado |
| onCancel | function | yes | — | Cierra sin eliminar |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Modal a ancho casi completo con botones apilados |
| tablet (768–1024px) | Modal centrado con ancho máximo |
| desktop (>1024px) | Mismo modal centrado |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `dialog` con `aria-modal="true"` |
| Keyboard interaction | Escape cierra; Tab queda confinado mientras está abierto |
| Label / aria-label | Título visible «Borrar cuenta» y botones «Cancelar» y «Borrar cuenta» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia el impacto del borrado y el plazo antes de confirmar |
| Focus management | Foco al botón «Cancelar» al abrir y al disparador al cerrar |

### Usage Example

```
<ConfirmDeleteDialog visible={confirmar} onConfirm={borrar} onCancel={cerrar} />
```

## OfflineBanner

| Field | Value |
|---|---|
| Component | `OfflineBanner` |
| Description | Aviso persistente cuando el servicio local no responde. |
| Category | feedback |

### States

| State | Description | Trigger |
|---|---|---|
| default | Oculto mientras la API responde | salud correcta |
| offline | Aviso en español con «Reintentar» | fallo de red o health |
| retrying | Comprobando disponibilidad | pulsación de «Reintentar» |
| recovered | Desaparece y muestra datos frescos | servicio disponible |

### Props / Inputs

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| available | boolean | yes | true | Resultado de salud/connectivity |
| onRetry | function | yes | — | Comprueba de nuevo |
| readOnly | boolean | no | true | Bloquea escrituras mientras falla |

### Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| mobile (<768px) | Banda bajo la cabecera, no modal |
| tablet (768–1024px) | Banda centrada bajo la cabecera |
| desktop (>1024px) | Banda centrada con ancho máximo |

### Accessibility

| Requirement | Implementation |
|---|---|
| ARIA role | `status` para recuperación y `alert` para caída |
| Keyboard interaction | «Reintentar» alcanzable con Tab |
| Label / aria-label | Texto visible en español y acción «Reintentar» |
| Contrast ratio | WCAG AA (4.5:1 texto, 3:1 componentes) |
| Screen reader | Anuncia caída, reintento y recuperación sin interrumpir la lectura |
| Focus management | No roba foco al aparecer; foco va a «Reintentar» solo si la persona lo pide |

### Usage Example

```
<OfflineBanner available={salud.ok} onRetry={reintentarSalud} />
```
