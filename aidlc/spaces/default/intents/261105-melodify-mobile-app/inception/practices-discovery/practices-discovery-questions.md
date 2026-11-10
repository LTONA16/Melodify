# Practices Discovery — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.
- `org.md` — cinco secciones de práctica por defecto del espacio `default` (defaults sugeridos, no hechos del equipo).
- `team.md` — solo comentarios de plantilla: no hay prácticas afirmadas que heredar.
- `project.md` — dos correcciones registradas en rough-mockups (catálogo real de Spotify; sesión persistente con token en almacenamiento seguro).
- `constraint-register` — `ideation/feasibility/constraint-register.md`.
- `scope-document` — `ideation/scope-definition/scope-document.md`.
- `wireframes` — `ideation/rough-mockups/wireframes.md`.
- `.github/workflows/ci.yml`, `.github/pull_request_template.md`, `README.md` — configuración y stack declarados en el repositorio.
- Borrador del lead: `inception/practices-discovery/team-practices.md`, `discovered-rules.md`, `evidence.md`.

## Q1. [Forma de trabajo] ¿Cómo organizamos las ramas del repositorio?

El repositorio trae un workflow de CI y un README que mencionan `main` y `develop`, pero el historial y el trabajo actual viven en `main`, y el framework crea las ramas de cada Bolt desde `main` con squash. Con una sola persona y sin entornos, `develop` añade un merge extra por cambio.

- A. Una sola rama de larga vida, `main`: ramas cortas por cambio y squash; retiramos `develop` (Recommended)
- B. `main` como base, pero conservamos `develop` como colchón de integración
- C. `develop` como rama de integración y `main` solo para entregas
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q2. [Forma de trabajo] ¿Todo cambio entra por Pull Request aunque trabajes solo?

La plantilla de PR del repositorio ya obliga a declarar plataformas probadas, capturas, variables de entorno y un checklist de calidad. Es el registro de verificación más barato que el proyecto puede tener, aunque nadie más revise.

- A. Sí, siempre PR con la plantilla, aunque la misma persona lo abra y lo mergee (Recommended)
- B. Solo para cambios grandes; los pequeños van directo a `main`
- C. No, commits directos a `main`
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q3. [Walking Skeleton] ¿Construimos primero un tramo delgado de punta a punta? Un walking skeleton (esqueleto caminante) es una versión mínima que recorre todo el camino de punta a punta, hecha antes que las funciones reales para comprobar que las piezas encajan.

En este proyecto el tramo sería: proyecto Expo, navegación entre pantallas, login simulado (`demo` / `demo`) y llegada a Inicio con una tarjeta de ejemplo, corriendo en Expo Go sobre el teléfono Android físico. El alcance `mvp` ya declara esta práctica activada y el plan del proyecto ordena el trabajo con el mismo criterio.

- A. Sí, ese tramo primero y ninguna otra pantalla hasta recorrerlo en el teléfono (Recommended)
- B. No, construir las pantallas en el orden del plan sin un tramo previo
- C. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q4. [Postura de pruebas] ¿Qué metodología seguimos para escribir pruebas?

No hay una postura afirmada por un equipo. React Native y Expo son nuevos para ti, y el criterio de terminado de la versión es un recorrido real en el teléfono, no una suite.

- A. test-after: implementas cada capa y después escribes y ejecutas sus pruebas (Recommended)
- B. tdd: escribes primero la prueba que falla y después el código que la pasa
- C. bdd: describes escenarios de comportamiento en lenguaje natural antes del código
- D. atdd: pruebas de aceptación derivadas de criterios acordados antes del código
- E. custom: una mezcla (por ejemplo, escenarios de comportamiento antes y pruebas unitarias después)
- F. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q5. [Postura de pruebas] ¿Qué umbral de cobertura exigimos en CI?

El default del `org.md` para `mvp` es un 80 % de líneas con ejecución en CI antes del merge. En una app de seis pantallas con datos de ejemplo, lo útil está en la lógica de estado y en los estados de cada pantalla (vacío, carga, error, sin Spotify).

- A. 80 % de líneas sobre `app/src/**`, medido con `--coverage`, excluyendo configuración, assets y arranque (Recommended)
- B. Sin umbral numérico: basta con que cada capa tenga sus pruebas y el CI las corra
- C. Un umbral más bajo, alrededor del 60 %
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q6. [Despliegue] ¿Cómo entendemos «desplegar» en esta versión?

El `org.md` propone desplegar al mergear a staging y aprobar producción a mano, pero este proyecto no tiene entornos, ni backend, ni artefacto desplegable, y el alcance `mvp` omite la fase de operación.

- A. No hay despliegue: Metro en el ordenador y Expo Go en el teléfono; el CI valida y nunca publica (Recommended)
- B. Además del local, build en la nube con EAS para generar un APK de prueba
- C. Publicar en Google Play en esta misma versión
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q7. [Estilo de código] ¿Qué reglas de formato, tipado y organización adoptamos?

El `org.md` propone Prettier, ESLint en CI y convenciones idiomáticas, y el repositorio ya declara ese stack. Lo que se decide aquí es cuánto se especializa para este proyecto.

- A. Prettier + ESLint (config de Expo) + TypeScript `strict`, organización por dominio (`screens/<pantalla>/`, `components/`, `state/`, `spotify/`, `data/`) (Recommended)
- B. Prettier + ESLint + TypeScript `strict`, pero organización por tipo de archivo
- C. Solo TypeScript `strict`; formateador y linter no bloquean el merge
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q8. [Restricciones duras] ¿Confirmamos como reglas duras del proyecto las diez que propone el borrador?

El borrador de `discovered-rules.md` propone seis reglas `ALWAYS` (app recorrible sin sesión de Spotify, token en almacenamiento seguro, client ID por variable de entorno con PKCE, solo APIs disponibles en Expo Go, textos en español, degradar con mensaje y acción) y cuatro `NEVER` (client secret en la app, backend o autenticación real, audio/push/tiendas, commitear `.env` o tokens). Al aprobar, se añaden a `project.md` bajo `## Mandated` y `## Forbidden`.

- A. Sí, las diez tal como están (Recommended)
- B. Sí, pero quiero ajustar alguna
- C. No, ninguna regla dura en esta etapa
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q9. [Seguimiento de Q1] Con `develop` como rama de integración, ¿dónde se integran los Bolts de Construction?

AI-DLC crea cada Bolt en una rama corta y, por defecto, la integra a `main` con squash. Si `develop` pasa a ser la rama de integración, hay que decir dónde aterriza ese squash, porque cambia lo que ve el plan de entrega y lo que dispara el CI.

- A. Los Bolts se integran a `develop`; `main` recibe solo entregas, con un squash desde `develop`
- B. Los Bolts siguen entrando a `main`; `develop` queda para trabajo manual fuera de AI-DLC
- C. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q10. [Seguimiento de Q3] El plan de este alcance `mvp` tiene el esqueleto activado, así que Construction pedirá el checkpoint del primer tramo. ¿Qué hacemos con este trabajo?

Sin tramo previo, la primera unidad se construye y se aprueba como cualquier otra, sin checkpoint de esqueleto. Es una decisión de este trabajo, no de la práctica permanente del equipo.

- A. Desactivarlo en este trabajo: sin checkpoint de esqueleto, se entra directo a la primera unidad
- B. Mantenerlo activado en este trabajo aunque no sea práctica permanente del equipo
- C. Aún no definido
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

- **Forma de trabajo**: dos ramas de larga vida; `develop` es la rama de integración y `main` recibe solo entregas, con un squash desde `develop`.
- **Forma de trabajo**: todo cambio entra por Pull Request con la plantilla del repositorio, aunque la misma persona lo abra y lo mergee.
- **Walking skeleton**: no se adopta como práctica permanente del equipo.
- **Walking skeleton**: en este trabajo el alcance `mvp` lo mantiene activado, así que la primera unidad pasa por el checkpoint de esqueleto.
- **Postura de pruebas**: metodología `test-after` — implementar cada capa y después escribir y ejecutar sus pruebas.
- **Postura de pruebas**: umbral del 80 % de líneas sobre `app/src/**`, medido con `--coverage`, excluyendo configuración, assets y arranque.
- **Despliegue**: no hay despliegue; Metro en el ordenador y Expo Go en el teléfono, y el CI valida sin publicar.
- **Estilo de código**: Prettier + ESLint (config de Expo) + TypeScript `strict`, con organización por dominio (`screens/<pantalla>/`, `components/`, `state/`, `spotify/`, `data/`).
- **Restricciones duras**: se confirman las diez reglas del borrador (seis `ALWAYS` y cuatro `NEVER`) y se promueven a `project.md`.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
