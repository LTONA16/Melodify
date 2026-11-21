# Preguntas de CI Pipeline — Melodify

> Etapa: CI Pipeline · Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Profundidad: Standard
> Fecha: 2026-11-21 · Modo de respuesta: **Guide me** (elegido al inicio del trabajo, reutilizado en todas las etapas)
> Insumos: `construction/build-and-test/build-and-test-summary.md`, `build-test-results` (`construction/build-and-test/test-results.md`), `construction/build-and-test/cross-unit-traceability.md` y los seis `code-summary` de `construction/u1-app-skeleton/` … `construction/u6-walkthrough/code-generation/`.

## Cómo se respondió este archivo

**Ninguna de las cuatro preguntas se le hizo a la persona en esta etapa.** Construction es la fase en la que las preguntas son la excepción, y el protocolo prohíbe volver a preguntar lo que el registro ya responde. Las cuatro respuestas ya estaban fijadas por las prácticas afirmadas del equipo (`aidlc/spaces/default/memory/team.md`), por el alcance `mvp` y por el pipeline que lleva funcionando desde el inicio del proyecto. Se registran aquí con su fuente para que la decisión quede auditable, y cada `[Answer]:` dice de dónde sale.

## Q1. [plataforma] ¿Con qué herramienta se ejecuta el pipeline?

- A. GitHub Actions, dentro del propio repositorio
- B. AWS CodePipeline y CodeBuild
- C. Jenkins u otro servidor de CI propio
- D. Todavía no hay CI y hay que crearlo
- X. Other (please specify)

[Answer]: A — el repositorio ya contiene `.github/workflows/ci.yml` con dos jobs (`Validar Convención de Commits` y `Calidad y Sintaxis de Código`), y el proyecto vive en GitHub (`LTONA16/Melodify`). No hay cuenta de AWS, ni servidor propio, ni credenciales de nube en este trabajo. (fuente: `.github/workflows/ci.yml`; `team.md` § Way of Working) (2026-11-21)

## Q2. [proceso] ¿Qué estrategia de ramas sigue el pipeline?

- A. `develop` integra y `main` recibe solo entregas por squash
- B. Una sola rama (`main`) y todo se commitea ahí
- C. GitFlow completo con ramas `release/*` y `hotfix/*`
- D. Trunk-based con ramas de un día y merge a `main`
- X. Other (please specify)

[Answer]: A — `develop` es la rama de integración y `main` recibe solo entregas; los Bolts de Construction nacen de `develop` y vuelven a `develop` por squash, y todo cambio entra por Pull Request con la plantilla del repositorio. El pipeline corre en push y en PR contra las dos ramas. (fuente: `team.md` § Way of Working; `.github/workflows/ci.yml` § `on`) (2026-11-21)

## Q3. [proceso] ¿Qué puertas de calidad tienen que pasar antes de un merge?

- A. Convención de commits, tipos, linter y pruebas con umbrales de cobertura
- B. Solo las pruebas
- C. Solo el linter
- D. Ninguna automática: la revisión humana basta
- X. Other (please specify)

[Answer]: A — cuatro puertas: `commitlint` sobre los commits del push o del PR y sobre el título del PR (Conventional Commits con `.commitlintrc.json`), `npm run typecheck` (`tsc -b`), `npm run lint` (`eslint .`) y `npm test` (Jest con los nueve umbrales de cobertura de `jest.config.js`). Un rojo bloquea el merge; no se mergea «y luego se arregla». (fuente: `team.md` § Way of Working y § Testing Posture; `.github/workflows/ci.yml`; `jest.config.js`) (2026-11-21)

## Q4. [plataforma] ¿Qué repositorios de artefactos usa el pipeline (imágenes, paquetes, binarios)?

- A. Ninguno: el CI no produce artefactos que se publiquen
- B. Amazon ECR para imágenes de contenedor
- C. CodeArtifact o un registro npm privado
- D. S3 con los binarios de cada build
- X. Other (please specify)

[Answer]: A — esta versión no se despliega y no compila binarios: no hay `build`, ni EAS Build, ni firma, ni publicación en tiendas. El CI solo verifica; «desplegar» es abrir la app en Expo Go con Metro levantado. Tampoco se publica ningún paquete del workspace: los nueve son `private` y se consumen por enlace del workspace. (fuente: `team.md` § Deployment; `package.json` de cada paquete; plan del alcance `mvp`, que omite las etapas 4.x) (2026-11-21)

## Assumptions & Open Questions

None.

## Requested Changes Feedback

<!-- Se rellena solo si la persona pide cambios en la puerta de aprobación. -->
