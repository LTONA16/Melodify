# Contract Design — preguntas

> Etapa: Contract Design (11 de 19). Agente: aidlc-architect-agent. Profundidad: Standard.
> Responde con la letra de cada pregunta. Si eliges «X», escribe tu respuesta.

## Q1 — Mecanismo por frontera

Las unidades no se hablan por red: viven en la misma app Expo. ¿Cómo se formaliza cada frontera?

- A. **Esquema compartido en proceso**: cada frontera se especifica como los tipos y las firmas del componente que la cruza (TypeScript), con sus estados publicados. No hay REST, ni eventos, ni base de datos compartida.
- B. **Contratos REST locales**: cada unidad expone una interfaz HTTP aunque corra en el mismo proceso.
- C. **Eventos internos**: las unidades se comunican por un bus de eventos en memoria.
- X. Other (please specify)

[Answer]: B

## Q2 — Qué se especifica en cada contrato

¿Qué detalle lleva cada frontera?

- A. **Entradas, salidas y estados**: para cada componente que cruza unidad, qué recibe, qué devuelve o publica, y qué estados puede observar el consumidor (incluidos vacío, carga y error).
- B. **Solo los datos**: la forma de los objetos que viajan, sin estados ni funciones.
- C. **Solo las funciones**: las firmas, sin describir la forma de los datos.
- X. Other (please specify)

[Answer]: A

## Q3 — Propiedad de cada contrato

¿Quién manda en cada frontera?

- A. **La unidad que crea el componente**: `DesignSystem`, `AppShell` y `AppSession` son de U1; `ContentStore`, `Catalog` y `Connectivity` de U2; `SpotifyAuth` y `SpotifyCatalog` de U4; `ActivityFeed` de U5. Quien consume no cambia el contrato por su cuenta.
- B. **La unidad consumidora**, que pide lo que necesita.
- C. **Sin dueño**: se negocia en cada cambio.
- X. Other (please specify)

[Answer]: A

## Q4 — Cambios que rompen

¿Cómo se cambia un contrato ya acordado?

- A. **Sin versionado formal**: un cambio incompatible se hace en el mismo PR que actualiza a todos los consumidores, y el CI (`typecheck`, `lint`, `test`) es la garantía. Un cambio aditivo no rompe porque el consumidor ignora lo que no usa.
- B. **Versionado semántico de módulos internos**, con varias versiones conviviendo.
- C. **Congelado**: los contratos no cambian después de esta etapa.
- X. Other (please specify)

[Answer]: B

## Q5 — Errores, tiempos de espera y reintentos

¿Qué se acuerda en cada frontera para cuando algo falla?

- A. **Cada frontera declara sus estados de error y la interfaz decide**: los fallos llegan como estado con mensaje en lenguaje llano y acción de reintento; las llamadas a Spotify llevan un tiempo de espera (10 s) y **no** reintentan solas, para no repetir peticiones ni gastar cuota; reintentar es siempre una acción de la persona.
- B. **Reintento automático con backoff** en todas las llamadas, y luego el error.
- C. **Sin acuerdo**: cada unidad lo resuelve como quiera.
- X. Other (please specify)

[Answer]: A

## Follow-up F1 — REST local dentro de Expo Go (deriva de Q1 = B)

Un servidor HTTP dentro de la app no existe en Expo Go: React Native no levanta un servidor, y uno aparte sería un backend, que el alcance prohíbe (CT-02, RC-01). ¿Cómo seguimos?

- A. **Mantener la forma REST en el contrato, sin servidor**: cada frontera se especifica como petición y respuesta tipadas con su código de resultado y su tiempo de espera, pero se ejecuta en proceso. El contrato se lee como HTTP y las pruebas usan el mismo doble.
- B. **Cambiar el mecanismo a esquema compartido en proceso**: tipos y firmas TypeScript, sin forma de petición/respuesta.
- C. **REST real con un servidor local de desarrollo** fuera de la app: la app deja de funcionar sin él y contradice «sin backend» y el criterio de correr en Expo Go.
- X. Other (please specify)

[Answer]: A

## Follow-up F2 — Versionado semántico de módulos internos (deriva de Q4 = B)

El versionado semántico exige módulos publicables y separados. Hoy las seis unidades comparten un único `package.json`. ¿Qué hacemos?

- A. **Semver sobre el papel**: cada contrato lleva su número de versión en la especificación y un cambio incompatible actualiza a todos los consumidores en el mismo PR; no hay paquetes separados.
- B. **Monorepo con paquetes internos versionados**: cada unidad publica su paquete y las versiones conviven; sigue siendo una sola app, pero añade espacios de trabajo y configuración de resolución.
- C. **Sin versionado formal**: un solo paquete y el CI como garantía.
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

- **Mecanismo**: contratos con forma de petición y respuesta (estilo REST), pero ejecutados en proceso dentro de la app; no hay servidor HTTP. Las dos únicas fronteras HTTP reales son las de Spotify, que la app consume.
- **Contenido de cada contrato**: qué recibe y qué devuelve o publica cada componente que cruza unidad, más los estados observables —incluidos vacío, carga y error—.
- **Propiedad**: cada contrato es de la unidad que crea el componente. `DesignSystem`, `AppShell` y `AppSession` son de U1; `ContentStore`, `Catalog` y `Connectivity` de U2; el paquete de Spotify de U4; `ActivityFeed` de U5. Quien consume no cambia el contrato por su cuenta.
- **Cambios**: versionado semántico por paquete en un monorepo con espacios de trabajo; un cambio incompatible sube la versión mayor del paquete y actualiza a sus consumidores en el mismo PR.
- **Fallos**: cada frontera declara sus estados de error; Spotify con 10 s de espera y sin reintento automático; reintentar es siempre una acción de la persona.
- **Inversión resuelta**: `Catalog` (U2) necesita saber si hay sesión de Spotify, pero Spotify llega en U4. U2 declara el puerto y U4 lo implementa; ninguna unidad mira hacia arriba.
- **Consecuencia del monorepo**: las seis unidades dejan de compartir un único `package.json`; cada paquete tiene el suyo y la app los resuelve por espacios de trabajo. Sigue siendo una sola app en Expo Go.

Does this all look correct before I generate the contract summary?

- Looks correct
- Request changes

[Answer]: Looks correct
