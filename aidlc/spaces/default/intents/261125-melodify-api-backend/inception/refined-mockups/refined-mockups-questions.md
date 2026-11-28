# Refined Mockups — Preguntas

Estas decisiones refinan la presentación y la interacción sobre pantallas y flujos ya decididos. No reabren el alcance, las reglas de contenido, las personas ni la verificación entre dos dispositivos.

## Sources

- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/wireframes.md`: contexto, recorrido principal, fallos y privacidad.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/ideation/rough-mockups/user-flow.md`: cinco recorridos y verificación en dos dispositivos.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/user-stories/stories.md`: 16 historias y 48 criterios de aceptación.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/requirements-analysis/requirements.md`: FR1-FR9 y NFR1-NFR10.
- `aidlc/spaces/default/intents/261125-melodify-api-backend/inception/practices-discovery/team-practices.md`: tarjeta de opinión compartida, textos en español y errores con «Reintentar».

## Q1. [Fidelidad y alcance] ¿Qué nivel de detalle visual debe tener el refinamiento?

El intento no añade pantallas nuevas: adapta las seis pantallas existentes y sus estados al servicio real. La pregunta fija si el entregable es una especificación estructural o una spec visual completa.

A. Media fidelidad: estados de las seis pantallas existentes y flujos de cuenta/privacidad en diagramas de texto con etiquetas reales, jerarquía y componentes; sin valores exactos de color, tipografía ni espaciado. (Recommended)

B. Alta fidelidad: mismas pantallas con tokens de color, tipografía, espaciado y medidas exactas por componente.

C. Solo el esqueleto: cuatro pantallas críticas (acceso, publicar, feed, detalle) con estados vacío/carga/error; el resto queda para Construction.

D. No hay refinamiento visual: sustituirlo por una especificación de experiencia de desarrollador de la API `/api/v1`.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q2. [Trazabilidad de historias] ¿Cómo se representa cada historia en la UI?

Los 16 historias y 48 criterios deben quedar reconocibles en los artefactos de diseño sin convertirlos en 16 pantallas independientes.

A. Una tabla de las 16 historias que indica pantalla o pantallas, estado, componente compartido y criterios afectados, más un mapa por pantalla con sus estados. (Recommended)

B. Organizar por pantalla y tratar las historias como notas de aceptación dentro de cada pantalla.

C. Organizar por recorrido de persona y situar las historias dentro de cada paso del flujo.

D. Un boceto independiente por historia, sin mapa agregado por pantalla.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q3. [Patrones de interacción] ¿Qué patrones se usan para formularios, edición, paginación y avisos?

Estas decisiones afectan directamente a los componentes que Construction debe reutilizar y a cómo se evitan duplicados y pérdidas de texto.

A. Validación al abandonar el campo; edición en línea de perfil y opinión; modal solo para confirmar borrado de cuenta; «Cargar más» con cursor y aviso persistente de degradación con «Reintentar»; acciones idempotentes con feedback en el lugar. (Recommended)

B. Asistentes de varios pasos para registro y publicación; modales para toda edición y borrado; paginación numerada.

C. Solo errores en línea y avisos temporales; sin modales ni asistentes; desplazamiento infinito en el feed.

D. Divulgación progresiva con secciones plegables, guardado automático de borradores y confirmación de borrado con aviso de deshacer.

E. Not yet defined.

X. Other (please specify)

[Answer]: A

## Q4. [Accesibilidad y responsive] ¿Qué objetivo de accesibilidad y breakpoints se especifica?

El equipo no ha fijado un objetivo accesible distinto del estándar del framework; hace falta cerrarlo para que la checklist sea verificable.

A. WCAG 2.1 AA, móvil primero a 320 y 375 px, tableta a 768 px; objetivos táctiles mínimos de 44x44, contraste 4.5:1 en texto y 3:1 en componentes, etiquetas visibles y anuncios `aria-live`, sin depender solo del color. (Recommended)

B. WCAG 2.1 A solo, con un único ancho móvil de 375 px.

C. WCAG 2.2 AA, con objetivos táctiles de 48x48 y soporte explícito de zoom al 400 %.

D. Sin objetivo formal: seguir solo lo que ya aporte `design-system`.

E. Not yet defined.

X. Other (please specify)

[Answer]: A
