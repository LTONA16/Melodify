# NFR Requirements — Preguntas de `u1-app-skeleton`

> **Unidad**: `u1-app-skeleton` (Esqueleto que corre) · **Etapa**: NFR Requirements · **Modo**: Guided.
>
> **Fuentes**: `requirements.md` (NFR1–NFR9, RC-01…RC-09, A3), `functional-spec.md` (U1), `rules.md` (BR1.x–BR3.x), `contract-summary.md` (C1, C2, C3, estructura del monorepo), `components.md` y `decisions.md` de Domain Design (ADR-009 navegación, ADR-010 estado, ADR-011 almacenamiento de la sesión), `design-system-mapping.md` (tokens, contraste y tamaños) y `team.md` / `project.md` (prácticas del equipo).

Estas cuatro preguntas cierran lo que las etapas anteriores dejaron abierto para U1 en materia no funcional: qué versión de Expo se fija, si el rendimiento lleva número o no, qué registra el proyecto cuando algo falla y dónde vive la variable de entorno de Spotify. El resto de los objetivos no funcionales ya está decidido en artefactos aprobados y no se vuelve a preguntar: TypeScript `strict`, Prettier y ESLint en CI (NFR5), cobertura del 80 % por ruta (NFR5 y contrato), contraste y áreas táctiles de los tokens (NFR6), Expo Go en Android (NFR7, RC-01, RC-05) y cero telemetría (NFR4, NFR9).

## Q1. [Compatibilidad] ¿Cómo se fija la versión del SDK de Expo?

`package.json` todavía no existe: lo crea U1. La versión del SDK de Expo decide qué módulos se pueden usar y, sobre todo, si la app arranca en el Expo Go que ya está instalado en el teléfono (RC-05, NFR7). Un SDK que el Expo Go del teléfono no soporte obliga a actualizar la app del teléfono antes de la primera prueba del esqueleto.

- A. **Fijar el SDK que ya soporta tu Expo Go (Recommended)**: dime qué versión de SDK muestra Expo Go en el teléfono (pantalla de inicio de Expo Go) y `package.json` fija esa versión exacta. El esqueleto corre en el teléfono el mismo día, sin actualizar nada.
- B. **Fijar el último SDK estable al crear el proyecto**: `npx create-expo-app` con la última versión; puede exigir actualizar Expo Go en el teléfono antes de la primera prueba.
- C. **No fijar versión**: se deja que `expo install` resuelva en cada instalación; reproducible solo mientras el registro no cambie.
- X. Other (please specify)

[Answer]: A

## Q2. [Rendimiento] ¿El esqueleto lleva objetivos numéricos o se queda con el criterio de NFR8?

NFR8 dice, literalmente, que «no se fijan objetivos numéricos en esta versión; el criterio es el recorrido sin errores». Lo único que puede tardar en U1 es la lectura de la sesión en el almacenamiento seguro antes de pintar Login o Inicio (ADR-011 asume que es algo más lenta que `AsyncStorage`). Hay que decidir si se hereda NFR8 tal cual o si U1 añade un presupuesto medible que las unidades siguientes heredan.

- A. **Heredar NFR8 sin números (Recommended)**: U1 no fija milisegundos. La única exigencia medible es que el arranque no añada esperas artificiales —ni temporizadores ni pantallas de carga propias— y que el splash termine cuando resuelve la lectura. Se comprueba recorriendo la app en el teléfono.
- B. **Añadir un presupuesto medible**: arranque en frío ≤ 3 s y cambio de pestaña ≤ 100 ms, medidos a mano en el teléfono físico al cerrar el Bolt. Da un número comprobable, a costa de una medición manual que nadie repite después.
- C. **Solo el arranque**: arranque en frío ≤ 2 s; el resto se queda con NFR8.
- X. Other (please specify)

[Answer]: C

## Q3. [Observabilidad] ¿Qué registra el proyecto cuando algo falla?

NFR9 dice que no hay panel ni telemetría, y la práctica del equipo prohíbe `console.log` de depuración en `main` y pide «el logger del proyecto». Además, el flujo F3 deja un fallo de borrado del recuerdo que no se puede mostrar a la persona: algo tiene que registrarlo o se pierde. Como el andamiaje del repositorio es de U1, aquí se decide qué logger existe desde el primer commit.

- A. **Logger propio mínimo (Recommended)**: un módulo `app/src/bootstrap/logger.ts` con `warn` y `error`, que en desarrollo escribe por consola y en release solo registra errores, sin red, sin datos personales y sin dependencias nuevas. Es el único sitio del proyecto que llama a `console`.
- B. **Sin logger**: los fallos que no se muestran no se registran. Cumple NFR9 al pie de la letra, pero deja el fallo de borrado de F3 invisible y contradice la práctica del equipo.
- C. **Servicio externo de errores** (Sentry u otro): añade dependencia, cuenta y envío de datos; choca con NFR4 y con RC-04 (coste cero).
- X. Other (please specify)

[Answer]: A

## Q4. [Configuración] ¿Dónde se documenta la variable `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`?

La variable la usa U4, pero el andamiaje del repositorio —`package.json`, `app.json`, `tsconfig`, Jest, ESLint, Prettier— lo crea U1. La práctica del equipo exige `.env.example` y prohíbe commitear `.env`. Falta decidir si U1 deja el archivo preparado desde el primer commit o si llega con la integración de Spotify.

- A. **U1 lo crea vacío (Recommended)**: `.env.example` con la variable documentada y sin valor, y `.env` en `.gitignore`. U4 solo rellena su valor local cuando registre la app en Spotify, y el CI nunca la necesita porque las pruebas usan dobles.
- B. **U4 lo crea**: el archivo llega junto con la integración de Spotify; hasta entonces el repositorio no lo menciona.
- X. Other (please specify)

[Answer]: A

## Q5. [Compatibilidad] ¿Qué versión de SDK muestra Expo Go en el teléfono?

La respuesta `1A` deja la versión del SDK dependiendo del Expo Go instalado, y esa versión no la conozco: hay que leerla del teléfono. Sin ella, `package.json` no puede fijar el SDK y el esqueleto podría no arrancar en la primera prueba (RC-05, NFR7).

- A. **SDK 54**
- B. **SDK 53**
- C. **Otra** — escribe la versión que muestra Expo Go en su pantalla de inicio, junto al nombre de la app.
- X. Other (please specify)

[Answer]: C — SDK 57

## Consolidated Summary Confirmation

Resumen de las cinco respuestas antes de generar los artefactos:

- **Q1 — SDK de Expo**: se fija el SDK que ya soporta el Expo Go del teléfono, en su versión exacta, para que el esqueleto corra el mismo día sin actualizar nada.
- **Q2 — Rendimiento**: solo el arranque lleva número — arranque en frío ≤ 2 s; el cambio de pestaña y el resto del recorrido se quedan con el criterio de NFR8 (sin objetivo numérico, se comprueba en el teléfono).
- **Q3 — Observabilidad**: logger propio mínimo en `app/src/bootstrap/logger.ts`, con `warn` y `error`; escribe por consola en desarrollo, en release solo errores, sin red, sin datos personales y sin dependencias nuevas. Es el único sitio del proyecto que llama a `console`.
- **Q4 — Configuración**: U1 crea `.env.example` vacío con `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` documentada, y `.env` queda en `.gitignore`; U4 solo rellena su valor local.
- **Q5 — Versión concreta**: SDK **57**, con `package.json` fijándolo exactamente, porque es lo que el Expo Go del teléfono reporta.

¿Está todo correcto antes de generar los artefactos?

- Looks correct
- Request changes

[Answer]: Looks correct
