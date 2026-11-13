# NFR Design — Preguntas de `u1-app-skeleton`

> **Unidad**: `u1-app-skeleton` (Esqueleto que corre) · **Etapa**: NFR Design · **Modo**: Guided.
>
> **Fuentes**: `nfr-requirements/performance-requirements.md` (NFR1, NFR2, NFR6.4, NFR8), `nfr-requirements/security-requirements.md` (NFR3, NFR4, NFR9), `nfr-requirements/tech-stack-decisions.md` (NFR5.1–NFR7.3, TS-01…TS-15), `functional-design/functional-spec.md` (F1–F6), `inception/contract-design/contract-summary.md` (C1, C2, C3), `inception/domain-design/components.md` y `decisions.md` (ADR-009, ADR-010, ADR-011), `inception/refined-mockups/design-system-mapping.md` y las prácticas de `team.md` / `project.md`.

## Qué se decide aquí y qué no

Los requisitos no funcionales ya están fijados. Esta etapa decide **cómo se cumplen**: los patrones concretos, dónde vive cada mecanismo y cómo se comprueba. No se reabre nada aprobado —ni el presupuesto de arranque, ni el logger, ni la cobertura, ni las versiones— y no se escribe código de implementación: como mucho, fragmentos ilustrativos.

Lo que llega abierto y merece una decisión tuya son cinco puntos. Los otros —navegación, estado, almacenamiento, tokens, herramientas— ya vienen decididos por ADR-009/010/011 y por `tech-stack-decisions.md`.

## Q1. [Rendimiento] ¿Cómo se evita el fotograma en blanco entre el splash y la primera pantalla?

F1 exige que mientras el arranque no resuelva **no se pinte Login ni Inicio**, y NFR8.2 prohíbe una pantalla de carga propia. El splash nativo de Expo se oculta solo cuando la app está montada, que puede ser antes de que termine la lectura de la sesión: sin hacer nada, hay una ventana en la que se ve el fondo vacío.

- A. **`expo-splash-screen`, ocultando el splash a mano (Recommended)**: se llama a `preventAutoHideAsync()` al arrancar y a `hideAsync()` cuando el arranque resuelve. La persona ve el splash del sistema hasta que hay una pantalla de verdad; no hay ni fondo vacío ni espera añadida. Viene con Expo Go.
- B. **Splash propio con la marca**: se oculta el nativo y se pinta una pantalla de carga propia con «Melodify». Control total del aspecto, pero es la pantalla de carga que NFR8.2 prohíbe y un componente más que probar.
- C. **No hacer nada**: el splash se oculta solo y, hasta que resuelve la sesión, se ve el fondo del tema. Es una línea menos, a costa de un parpadeo en cada arranque.
- X. Other (please specify)

[Answer]: A

## Q2. [Seguridad] ¿Cómo se valida el registro de sesión que se lee del almacenamiento?

El arranque trata lo leído como entrada no confiable (NFR3.5): JSON ilegible, `authorId` distinto de `demo` o `startedAt` inválido se convierten en «sin sesión». Falta decidir con qué se comprueba.

- A. **Guarda escrita a mano con resultado discriminado (Recommended)**: una función `parseSessionRecord(raw): SessionRecord | null` en `@melodify/app-session`, con las tres comprobaciones explícitas. Sin dependencias nuevas, totalmente probable con casos uno a uno, y el fallo es un valor, no una excepción.
- B. **Librería de esquemas (`zod` u otra)**: declarativa y con buenos mensajes de error. Añade una dependencia de ejecución por un objeto de dos campos, y su mensaje de error habría que traducirlo igualmente.
- C. **Confiar en el JSON y comprobar solo que existe**: menos código, pero un valor manipulado o de una versión anterior se colaría como sesión válida y rompería NFR3.5.
- X. Other (please specify)

[Answer]: A

## Q3. [Observabilidad] ¿Cómo distingue el logger entre desarrollo y release?

NFR9.1 pide que en desarrollo se escriba por consola y en release solo se registren errores. Hay tres formas de saber en cuál de los dos se está, y la elección condiciona cómo se prueba el logger.

- A. **`__DEV__` (Recommended)**: la constante global que Expo y Metro definen, verdadera en desarrollo y falsa en un binario de release. No requiere importación, y la prueba la puede forzar. Es la forma idiomática en React Native.
- B. **`process.env.NODE_ENV`**: estándar en el ecosistema de Node, pero en React Native su valor depende de cómo lo transforme Metro y en las pruebas hay que manipularlo.
- C. **`expo-constants` (`executionEnvironment`)**: describe el entorno del contenedor (`storeClient`, `standalone`…), que no es lo mismo que «desarrollo frente a release»: con Expo Go siempre parece el mismo entorno.
- X. Other (please specify)

[Answer]: A

## Q4. [Accesibilidad] ¿Cómo se verifica el contraste de los tokens?

NFR6.1 exige 4.5:1 en texto normal y 3:1 en texto grande e iconos, en ambos temas. `design-system-mapping.md` trae la tabla de pares y sus ratios, pero una tabla escrita a mano no detecta que alguien cambie un token mañana.

- A. **Prueba automática del ratio, más la revisión en el teléfono (Recommended)**: una utilidad pequeña en `@melodify/design-system` que calcula el ratio entre dos colores, y una prueba que recorre los pares que las pantallas usan en claro y en oscuro y falla por debajo del umbral. La tabla deja de ser una promesa y pasa a ser una aserción; cuesta una función y su prueba, y no añade dependencias.
- B. **Solo la revisión visual en el teléfono**: cero código nuevo, pero el contraste se rompe sin que nadie se entere hasta que alguien mira.
- C. **Solo la tabla de `design-system-mapping.md`**: se confía en el diseño y no se comprueba nada en el código; si un token cambia, la tabla queda desactualizada en silencio.
- X. Other (please specify)

[Answer]: A

## Q5. [Componentes lógicos] ¿Con qué granularidad se describen los componentes lógicos de esta unidad?

`logical-components.md` pide un inventario de componentes, dominios de fallo y radio de impacto. En una app de cliente sin servidor no hay servicios que aislar, así que hay que decidir qué se está describiendo.

- A. **Por preocupación de ejecución, mapeada a los paquetes (Recommended)**: cáscara y navegación, sistema de diseño, sesión, arranque y composición, y diagnóstico. Son cinco áreas con un fallo propio y distinguible —si la sesión falla, se abre Login; si el tema falla, la app sigue— y cada una cae en un paquete que ya existe o es `app/src`.
- B. **Solo los tres paquetes de contrato**: `design-system`, `app-shell` y `app-session`. Es lo que ya está versionado, pero deja fuera el arranque y el diagnóstico, que son justamente donde se concentran los fallos de esta unidad.
- C. **Por pantalla**: Login, Inicio y las cuatro pestañas vacías. Se lee como el recorrido, pero describe pantallas y no áreas de fallo, que es lo que el artefacto pide.
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Resumen de las cinco respuestas antes de generar los artefactos de diseño:

- **Q1 — Arranque sin fotograma en blanco**: el splash nativo se oculta a mano con `expo-splash-screen` — `preventAutoHideAsync()` al arrancar, `hideAsync()` cuando el arranque resuelve—. La persona ve el splash hasta que hay pantalla de verdad, sin pantalla de carga propia y sin espera añadida.
- **Q2 — Validación del registro de sesión**: guarda escrita a mano `parseSessionRecord(raw): SessionRecord | null` en `@melodify/app-session`, con las tres comprobaciones explícitas (JSON legible, `authorId` = `demo`, `startedAt` válido). Sin dependencias nuevas y probable caso a caso.
- **Q3 — Desarrollo frente a release en el logger**: la constante `__DEV__`, sin importación, que la prueba puede forzar.
- **Q4 — Contraste de los tokens**: utilidad pequeña de ratio en `@melodify/design-system` y una prueba que recorre los pares usados en claro y en oscuro y falla por debajo de 4.5:1 / 3:1; la revisión en el teléfono se mantiene.
- **Q5 — Componentes lógicos**: por preocupación de ejecución, mapeados a los paquetes — cáscara y navegación, sistema de diseño, sesión, arranque y composición, y diagnóstico.

¿Está todo correcto antes de generar los artefactos?

- Looks correct
- Request changes

[Answer]: Looks correct
