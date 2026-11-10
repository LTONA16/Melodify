# Rough Mockups — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.
- scope-document, intent-backlog — `ideation/scope-definition/`.
- intent-statement — `ideation/intent-capture/intent-statement.md`.

## Q1. [Navegación] ¿Qué patrón de navegación usamos para las seis pantallas?

Es la decisión que más condiciona los bocetos: define dónde vive cada pantalla y cómo se llega a ella.

- A. Login como pantalla previa y, dentro de la app, barra inferior con cinco pestañas: inicio, explorar, crear, actividad y perfil
- B. Login como pantalla previa y barra inferior con cuatro pestañas, con «crear» como botón flotante
- C. Login como pantalla previa y menú lateral (drawer) con las cinco secciones
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q2. [Estilo visual] ¿Qué dirección visual tomamos para los bocetos?

- A. Oscura, tipo app musical: fondo oscuro, acentos de color vivo, tipografía grande para títulos de obra
- B. Clara y minimalista: fondo claro, mucho espacio en blanco, acentos sobrios
- C. Seguir el tema del sistema: claro u oscuro según la preferencia del teléfono
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q3. [Contenido visual] ¿Cómo representamos las portadas de discos sin servicios externos?

La app no puede pedir imágenes a Spotify ni a ningún servicio, así que la portada tiene que generarse localmente.

- A. Bloques de color o degradado con la inicial de la obra: se ve intencional y no requiere archivos
- B. Iconos genéricos de música, iguales en todas las tarjetas
- C. Imágenes de ejemplo incluidas en el proyecto, una distinta por obra
- D. Aún no definido
- X. Other (please specify)

[Answer]: Other — «podemos usar la api de Spotify para developers»

## Q4. [Accesibilidad] ¿Qué nivel de accesibilidad aplicamos en esta versión?

- A. WCAG 2.1 AA como base: contraste suficiente, etiquetas para lector de pantalla, áreas táctiles de al menos 44×44
- B. Solo lo básico: contraste y textos legibles, sin etiquetas ni áreas táctiles mínimas
- C. No es prioridad en esta versión; se aborda más adelante
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q5. [Flujo] ¿Cuál es el camino feliz que define el flujo principal?

- A. Login → Inicio → Explorar → Crear → Actividad → Perfil: recorre las seis pantallas
- B. Login → Inicio → Crear → Actividad: solo el núcleo de opinar y ver el resultado
- C. Login → Inicio → Perfil: el recorrido más corto que muestra identidad y contenido
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q6. [Estados] ¿Qué estados hay que diseñar además del estado con contenido?

Con Spotify dentro del alcance, la app ya depende de la red: la búsqueda y las portadas pueden tardar o fallar. Eso cambia esta pregunta, que antes no aplicaba.

- A. Vacío, carga y error en las pantallas que tocan la red (explorar, inicio, perfil); las demás solo con estado vacío
- B. Solo estado vacío; si la red falla se muestra el contenido de ejemplo local sin avisar
- C. Vacío, carga y error en todas las pantallas, para que el comportamiento sea uniforme
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q7. [Contradicción] La API de Spotify choca con la frontera de producto ya aprobada. ¿Cómo lo resolvemos?

Tu respuesta abre una contradicción que no puedo resolver por mi cuenta. La frontera de producto aprobada en Intent Capture y en Feasibility dice explícitamente **sin integración con Spotify, Apple Music o Last.fm**, y el registro de restricciones lo repite (CT-04). Además, la etapa de viabilidad confirmó que esta versión corre solo en local con Expo Go y sin cuentas de pago.

Lo que implicaría integrar la API de Spotify en esta versión:

- Registrar una app en el portal de desarrolladores de Spotify (la cuenta es gratuita, pero es una cuenta más y hay que mantenerla).
- Enviar credenciales desde el teléfono. **Un client secret no se puede esconder en una app móvil**: cualquiera puede extraerlo del paquete. La alternativa correcta es el flujo PKCE, que exige que cada persona inicie sesión con su cuenta de Spotify, o un backend que guarde el secreto — y un backend está fuera de alcance.
- Depender de la red: sin conexión, las portadas desaparecen, y el criterio de terminado habla de recorrer la app sin errores.
- Reabrir la frontera de producto aprobada, que hoy es una decisión cerrada de dos etapas anteriores.

- A. Mantener la frontera: sin Spotify; las portadas se generan localmente con bloques de color
- B. Cambiar el alcance: integrar la API de Spotify solo para portadas y metadatos, aceptando cuenta de desarrollador, conexión a internet y reabrir la frontera de producto
- C. Dejarlo preparado: una capa de datos con la misma interfaz, que hoy devuelve datos locales y mañana puede llamar a Spotify sin reescribir las pantallas
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q8. [Contradicción] Con Spotify dentro del alcance, ¿cómo se autentica la app?

Elegiste cambiar el alcance, pero la integración todavía no es implementable sin decidir esto. El punto delicado es el **client secret**: una app móvil no puede guardarlo en secreto, porque el paquete se puede abrir y el valor se extrae.

- A. Script de siembra local: un script con credenciales consulta Spotify una vez y genera un archivo de datos local con metadatos y URLs de portada; la app no lleva credenciales ni necesita red en tiempo de ejecución
- B. PKCE en la app: cada persona inicia sesión con su propia cuenta de Spotify; es el flujo oficial para apps públicas y no requiere secreto en el cliente
- C. Client Credentials desde la app: el secreto viaja en el paquete; funciona, pero cualquiera puede extraerlo — aceptable solo si la app es una demo local y la credencial se revoca después
- D. Añadir un backend/proxy mínimo que guarde el secreto
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

Resumen de lo respondido en esta etapa:

- **Navegación**: login como pantalla previa y, dentro de la app, barra inferior con cinco pestañas (inicio, explorar, crear, actividad, perfil).
- **Estilo visual**: la app sigue el tema del sistema, claro u oscuro según el teléfono.
- **Portadas y metadatos**: se integra la API de Spotify. Esto **cambia la frontera de producto** aprobada en las dos etapas anteriores.
- **Autenticación**: PKCE; cada persona inicia sesión con su propia cuenta de Spotify y no hay secreto en el cliente.
- **Accesibilidad**: no es prioridad en esta versión; se aborda más adelante.
- **Flujo principal**: login → inicio → explorar → crear → actividad → perfil, recorriendo las seis pantallas.
- **Estados**: vacío, carga y error en todas las pantallas.

- Looks correct
- Request changes

[Answer]: Looks correct
