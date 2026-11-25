# Puertas de calidad — Melodify

> Etapa: CI Pipeline · Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Profundidad: Standard
> Fecha: 2026-11-21 · Rama de trabajo: `develop` · Agente: `aidlc-pipeline-deploy-agent`
> Insumos: `build-and-test-summary` (`construction/build-and-test/build-and-test-summary.md`), `build-test-results` (`construction/build-and-test/test-results.md`), los seis `code-summary` de `construction/u*/code-generation/` y la configuración auditada en `ci-config.md`.
> Repositorio: `github.com/LTONA16/Melodify` · Workflow: `.github/workflows/ci.yml`

## Qué fija este documento

Las puertas que un cambio debe pasar **antes de entrar en `develop` o en `main`**, con el comando exacto que las ejecuta, el umbral que las hace rojas y la evidencia que las sostiene. No inventa puertas nuevas: **materializa en el CI las comprobaciones que Build and Test ya declaró** y añade la única puerta de proceso que el equipo afirma en `team.md` § Way of Working (la convención de commits).

La regla que gobierna todo lo demás: **el CI es el árbitro, no la máquina local**. Un verde en local con otro Node o con `dist/` ya construido no demuestra nada sobre el pipeline; la evidencia válida es la corrida de GitHub Actions sobre un árbol limpio (`ci-config.md` § Entorno de ejecución).

## Las puertas

| ID | Puerta | Comando / acción | Pasa cuando | Bloquea el merge | Dónde corre |
|---|---|---|---|---|---|
| QG-1 | Convención de commits | `wagoid/commitlint-github-action@v6` con `.commitlintrc.json` sobre los commits del push/PR, y `npx --no-install commitlint` sobre el **título del PR** | Todo commit y el título del PR cumplen Conventional Commits | Sí | Job `Validar Convención de Commits` y paso final del job `Calidad y Sintaxis de Código` |
| QG-2 | Sintaxis y tipos | `npm run typecheck` (`tsc -b`) | Exit 0, sin errores de TypeScript (`strict: true`) | Sí | Job `Calidad y Sintaxis de Código` |
| QG-3 | Linter | `npm run lint` (`eslint .`) | Exit 0, **0 errores y 0 avisos** | Sí | Job `Calidad y Sintaxis de Código` |
| QG-4 | Pruebas | `npm test` (Jest con `jest-expo`) | Todas las suites y pruebas en verde | Sí | Job `Calidad y Sintaxis de Código` |
| QG-5 | Suelos de cobertura | `npm test -- --coverage`, umbrales de `jest.config.js` | Los **nueve** árboles por encima del **80 % de líneas** | Sí | Job `Calidad y Sintaxis de Código` |
| QG-6 | Instalación reproducible | `npm ci` | Instala desde `package-lock.json` sin `E404` ni cambios de lockfile | Sí (si falla, no se ejecuta nada más) | Job `Calidad y Sintaxis de Código` |
| QG-7 | Pull Request con su plantilla | `.github/pull_request_template.md` | El PR declara plataformas probadas, capturas, checklist de calidad y variables de entorno | Sí (regla de proceso del equipo) | Revisión humana del PR |

## Correspondencia con Build and Test

Cada puerta automática cierra uno o más objetivos que Build and Test dejó registrados. Ninguna puerta queda por debajo de lo que esa etapa midió.

| Target de Build and Test | Qué pedía | Puerta que lo hace cumplir |
|---|---|---|
| BT-01 | `tsc -b` exit 0 | QG-2 |
| BT-02 | `eslint .` exit 0, 0 problemas | QG-3 |
| BT-03 | Suite completa en verde | QG-4 |
| BT-04 … BT-12 | Los nueve árboles ≥ 80 % de líneas | QG-5 |
| BT-13 | Las pruebas se ejecutan en CI antes del merge | QG-4 (en el job `Calidad y Sintaxis de Código`) |
| BT-20, BT-21, BT-23 | Sin secretos; token solo en almacenamiento seguro; fronteras de importación | QG-3 (reglas `no-restricted-imports` y `no-console` de `eslint.config.js`) |

BT-13 estaba en `N/A` en Build and Test porque la etapa `ci-pipeline` aún no había corrido. Con la corrida verde `44942753511` (ver `ci-config.md` § Verificación del pipeline), **pasa a `Met`**: las pruebas se ejecutan en CI antes del merge, demostrado sobre el árbol real.

## Suelos de cobertura

Los nueve umbrales viven en `jest.config.js` (`coverageThreshold`) y **no se bajan para hacer pasar una etapa**. Un cambio que rompa cualquiera de ellos es rojo, igual que una prueba fallida.

| Árbol | Umbral | Medido en Build and Test |
|---|---|---|
| `app/src/**` | 80 % líneas | 96,44 % (840/871) |
| `packages/design-system/src/**` | 80 % líneas | 98,74 % (236/239) |
| `packages/activity/src/**` | 80 % líneas | 93,33 % (154/165) |
| `packages/app-shell/src/**` | 80 % líneas | 94,33 % (133/141) |
| `packages/app-session/src/**` | 80 % líneas | 100,00 % (90/90) |
| `packages/content-store/src/**` | 80 % líneas | 98,24 % (223/227) |
| `packages/catalog/src/**` | 80 % líneas | 90,98 % (121/133) |
| `packages/connectivity/src/**` | 80 % líneas | 97,50 % (39/40) |
| `packages/spotify/src/**` | 80 % líneas | 89,28 % (308/345) |

Medido en la corrida verde del CI sobre un árbol limpio: **95,24 % global (2144/2251)**, con los nueve árboles por encima de su suelo. No se añadieron exclusiones ni pragmas de cobertura.

## Qué **no** es una puerta

- **No hay paso de build, firma, release ni despliegue.** El CI valida, nunca publica (`team.md` § Deployment). No hay EAS Build, EAS Update ni publicación en tiendas.
- **No hay pruebas E2E ni de navegador**: la app es nativa y no hay motor que lanzar.
- **No hay SAST/DAST automatizado**: la estrategia es Standard; la superficie de seguridad se cubre con pruebas de comportamiento (token, PKCE, fronteras) y con el linter.
- **No hay repositorio de artefactos**: el pipeline no sube imágenes, binarios ni paquetes (`ci-pipeline-questions.md` Q4 = A).
- **No hay caché propia ni servicios externos**: `actions/setup-node` con `cache: npm` sobre el lockfile, y nada más.

## Reglas de merge

- **Un rojo bloquea el merge.** No se mergea «y luego se arregla» (`team.md` § Way of Working).
- **Todo cambio entra por Pull Request**, con la plantilla del repositorio, aunque la misma persona abra y mergee el PR. Un cambio pequeño tampoco se salta el PR.
- **Los Bolts nacen de `develop` y vuelven a `develop` por squash**, con un commit nombrado por el slug. `main` recibe solo entregas por squash desde `develop`.
- **El título del PR se valida con commitlint**, no solo los commits: el título es lo que acaba en el historial de `main` tras el squash.

## Cuando una puerta falla

1. **Se lee el job que falló**, no se reintenta a ciegas: los tres defectos que mantuvieron el CI en rojo (`CI-F0`, `CI-F1`, `CI-F2` en `ci-config.md`) eran de árbol limpio y no se reproducían en local.
2. **Se reproduce en un árbol limpio** con la misma versión del CI (Node 22 / npm 10.9.9) antes de tocar nada: borrar `dist/` y ejecutar `npm ci` desde cero.
3. **No se toca el umbral ni se añade una exclusión** para hacer pasar la puerta. Se arregla la causa.
4. **Se corrige en la rama del Bolt** y se vuelve a empujar; la corrida verde es la evidencia, no la promesa.

## Fuentes

- `.github/workflows/ci.yml` — jobs, pasos y comandos de las puertas QG-1 … QG-6.
- `jest.config.js` — los nueve `coverageThreshold` de 80 % de líneas.
- `eslint.config.js` — `no-console` y las reglas `no-restricted-imports` que sostienen QG-3 y BT-20/BT-21/BT-23.
- `.commitlintrc.json` — configuración de Conventional Commits.
- `.github/pull_request_template.md` — checklist del PR (QG-7).
- `aidlc/spaces/default/memory/team.md` — § Way of Working, § Testing Posture, § Deployment.
- `construction/build-and-test/build-and-test-summary.md` — targets BT-01 … BT-41 y la matriz de verificación.
- `construction/build-and-test/test-results.md` — resultados por comando y cobertura medida.
- `construction/u1-app-skeleton/code-generation/code-summary.md` … `construction/u6-walkthrough/code-generation/code-summary.md` — los comandos y umbrales que cada unidad dejó en verde.
- `construction/ci-pipeline/ci-config.md` — configuración auditada y corridas de GitHub Actions.
- `construction/ci-pipeline/ci-pipeline-questions.md` — decisiones Q1–Q4.
