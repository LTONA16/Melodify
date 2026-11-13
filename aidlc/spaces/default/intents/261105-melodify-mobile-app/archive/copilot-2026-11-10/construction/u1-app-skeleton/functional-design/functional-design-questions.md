# Functional Design — Preguntas de `u1-app-skeleton`

> **Modo**: QUESTION-ONLY. Estas preguntas cierran decisiones funcionales de U1 antes de generar los artefactos de diseño.
>
> **Fuentes**: `unit-of-work.md`, `unit-of-work-story-map.md`, `stories.md`, `requirements.md`, `components.md` y `contract-summary.md`.

## Q1. [Navegación] ¿Qué debe ocurrir con la pila interna de una pestaña al cambiar de pestaña?

U1 define cinco pestañas hermanas y deja el detalle para las unidades posteriores (FR2.1–FR2.3, C2). Aunque U1 solo muestra pantallas contenedoras, necesitamos fijar el comportamiento de la navegación para que las unidades siguientes no tengan que reinterpretarlo.

- A. Cada pestaña conserva su propia pila y posición; al volver a una pestaña se recupera la pantalla interna y el desplazamiento anterior (Recommended).
- B. Cada cambio de pestaña reinicia esa pestaña en su pantalla raíz.
- C. Las pestañas no tienen pila interna en U1; cada destino reemplaza la vista actual y las unidades posteriores definirán el comportamiento de detalle.
- X. Other (please specify)

[Answer]:

## Consolidated Summary Confirmation

Resumen de respuestas: Q1 A; Q2 B; Q3 A; Q4 A; Q5 A; Q6 A; Q7 B; Q8 B; Q9 A.

[Answer]: Looks correct

## Q2. [Navegación] ¿Cómo debe comportarse el botón «Volver» del dispositivo cuando la persona está en una pestaña raíz?

Login no se puede abandonar sin entrar (FR1.6), mientras que Inicio, Explorar, Crear, Actividad y Perfil son destinos de la barra inferior (FR2.1–FR2.3). Hace falta decidir el resultado observable del botón atrás de Android en las pantallas raíz del esqueleto.

- A. En una pestaña raíz no hace nada y la persona permanece en la app; el sistema no cierra la app (Recommended).
- B. Sale de la app; al abrirla de nuevo se aplica la decisión de sesión persistida.
- C. Vuelve siempre a Inicio, salvo cuando ya está en Inicio, donde no hace nada.
- X. Other (please specify)

[Answer]:

## Q3. [Sesión demo] ¿Qué comportamiento exacto debe tener el formulario al fallar `demo`/`demo`?

FR1.1–FR1.3 y AC1.1.3 exigen conservar lo escrito y mostrar un error en línea, pero no fijan el texto, el campo asociado ni el estado de foco.

- A. Mostrar «Usuario o contraseña incorrectos» bajo el campo de Contraseña, conservar ambos valores, mantener el foco en Contraseña y no limpiar ningún campo (Recommended).
- B. Mostrar el mismo mensaje bajo el formulario, conservar ambos valores y no mover el foco automáticamente.
- C. Mostrar un mensaje específico bajo cada campo inválido y limpiar solo el campo de Contraseña.
- X. Other (please specify)

[Answer]:

## Q4. [Sesión demo] ¿Qué tratamiento visual debe tener el campo «Contraseña»?

La credencial demo es visible como pista (`demo`/`demo`), pero el requisito no decide si lo que se escribe en el campo se oculta ni si existe una acción para revelarlo.

- A. Ocultar la contraseña con entrada segura y ofrecer un control accesible para mostrarla u ocultarla (Recommended).
- B. Mostrar la contraseña en texto plano para simplificar la demostración en Expo Go.
- C. Ocultarla con entrada segura, sin control para mostrarla.
- X. Other (please specify)

[Answer]:

## Q5. [Persistencia local de sesión] ¿Qué debe hacer `AppSession` si no puede leer o validar el recuerdo de sesión al arrancar?

La sesión demo debe persistir entre reinicios y borrarse al cerrar sesión (FR1.4–FR1.5, AC1.2.1–AC1.3.3). El arranque espera la lectura antes de elegir Login o Inicio, pero aún falta definir la degradación ante un almacenamiento vacío, corrupto o temporalmente indisponible.

- A. Tratar cualquier lectura fallida o valor inválido como «sin sesión», borrar la entrada inválida si es posible, mostrar Login y permitir entrar de nuevo; no bloquear la app (Recommended).
- B. Mostrar un error con «Reintentar» y no presentar Login ni Inicio hasta recuperar el almacenamiento.
- C. Entrar a Inicio de forma provisional y pedir la sesión solo si la persona intenta una acción protegida.
- X. Other (please specify)

[Answer]:

## Q6. [Estados vacíos y de error] ¿Qué estado debe mostrar Inicio en U1 mientras la tarjeta de ejemplo se prepara o si el sembrado mínimo falla?

U1 entrega una sola opinión de ejemplo y el walking skeleton debe evitar pantallas en blanco; los requisitos generales exigen estados de carga, vacío y error con mensajes en español y acción cuando corresponda (FR3.5, FR11.1–FR11.2). Debemos decidir cuál de esos estados entra realmente en el primer tramo.

- A. Mostrar esqueletos breves durante la preparación; si no hay opinión sembrada, mostrar «Todavía no hay opiniones» con «Reintentar»; si falla la carga, mostrar un error en lenguaje llano con «Reintentar» y conservar la pantalla navegable (Recommended).
- B. Mostrar directamente la tarjeta sembrada, sin estado de carga ni error simulable en U1; los estados completos quedan para U2.
- C. Mostrar un estado vacío sin acción si la siembra falla, porque U1 no tiene una fuente externa que reintentar.
- X. Other (please specify)

[Answer]:

## Q7. [Estados vacíos y de error] ¿Qué deben mostrar las cuatro pestañas todavía vacías de U1?

U1 deja Explorar, Crear, Actividad y Perfil como destinos navegables con una pantalla vacía y título; las historias posteriores añaden sus estados completos. Hace falta fijar el contrato visual temporal para el checkpoint del esqueleto.

- A. Cada pantalla muestra su título, un mensaje contextual («Esta sección estará disponible próximamente») y ningún botón de acción; no muestra error ni estado de carga (Recommended).
- B. Cada pantalla muestra su título y el estado vacío genérico «No hay contenido todavía», sin acción.
- C. Cada pantalla muestra su título y un estado de error con «Reintentar» para demostrar el componente de error desde U1.
- X. Other (please specify)

[Answer]:

## Q8. [Tarjeta de opinión] ¿Qué alcance visual e interactivo debe tener la única tarjeta del walking skeleton?

U1 debe pintar una tarjeta real con datos sembrados y `OpinionCard` es el componente compartido (FR3.1–FR3.4, C1). Las acciones sociales, el detalle y el contenido completo pertenecen a unidades posteriores, por lo que hay que decidir qué se demuestra sin adelantar comportamiento de U2/U3.

- A. Tarjeta de lectura con autor, obra, artista, valoración, texto truncado a dos o tres líneas, portada de bloque con la inicial y acciones sociales deshabilitadas u omitidas; tocar la tarjeta no abre todavía un detalle (Recommended).
- B. Igual que A, pero incluir `♡` y `💬` con contadores de ejemplo como controles visuales sin ejecutar acciones.
- C. Incluir `♡`, `💬` y «Seguir» funcionando en memoria desde U1, además de abrir el detalle al tocar la tarjeta.
- X. Other (please specify)

[Answer]:

## Q9. [Tarjeta de opinión] ¿Qué datos fijos debe usar la opinión de ejemplo del walking skeleton?

El requisito fija una tarjeta sobre contenido sembrado en memoria, pero no fija los valores concretos. Los datos deben ser deterministas para la demostración manual y las pruebas de U1, sin conectarse a Spotify ni introducir credenciales.

- A. Usar una obra del catálogo local ya prevista, con autor `Demo`, identificador estable, valoración de 4 estrellas, texto breve en español y contadores en cero (Recommended).
- B. Usar una obra y autor de ejemplo definidos libremente durante la implementación, siempre que los textos sean visibles en español.
- C. Usar una opinión que pertenezca a otro autor de ejemplo y reservar las opiniones del usuario demo para U2.
- X. Other (please specify)

[Answer]:
