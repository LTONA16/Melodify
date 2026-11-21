# Configuración de CI — Melodify

> Etapa: CI Pipeline · Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Profundidad: Standard
> Fecha: 2026-11-21 · Rama de trabajo: `develop` · Agente: `aidlc-pipeline-deploy-agent`
> Insumos: `build-and-test-summary` (`construction/build-and-test/build-and-test-summary.md`), `build-test-results` (`construction/build-and-test/test-results.md`), `construction/build-and-test/cross-unit-traceability.md` y los seis `code-summary` de `construction/u*/code-generation/`.
> Repositorio: `github.com/LTONA16/Melodify` · Workflow: `.github/workflows/ci.yml`

## Alcance de la etapa

La etapa es **condicional**: se ejecuta «cuando el CI necesita crearse o modificarse de forma significativa». Aquí el CI ya existe desde el inicio del proyecto y su diseño es el correcto para esta versión: dos jobs, cuatro puertas, sin despliegue. Por eso la etapa **no rediseña el pipeline**: lo audita contra las prácticas del equipo, comprueba que las puertas son las que Build and Test declaró, y repara lo que lo mantenía en rojo.

Y estaba en rojo: `develop` llevaba sin pasar el CI desde el 19 de noviembre. La última corrida verde antes de esta etapa fue `44477956268` (2026-11-19T07:13:30Z); desde entonces, cinco corridas consecutivas fallaron. Tres fallos distintos se acumulaban, cada uno tapando al siguiente (§ Hallazgos).

## Configuración vigente

```yaml
name: CI/CD Pipeline

on:
    push:
        branches:
            - main
            - develop
    pull_request:
        branches:
            - main
            - develop

permissions:
    contents: read
    pull-requests: read

jobs:
    commit-lint:
        name: Validar Convención de Commits
        runs-on: ubuntu-latest
        steps:
            - name: Clonar repositorio con historial completo
              uses: actions/checkout@v4
              with:
                  fetch-depth: 0

            - name: Validar commits con Conventional Commits
              uses: wagoid/commitlint-github-action@v6
              with:
                  configFile: .commitlintrc.json

    code-quality:
        name: Calidad y Sintaxis de Código
        runs-on: ubuntu-latest
        steps:
            - name: Clonar repositorio
              uses: actions/checkout@v4

            - name: Detectar directorio del proyecto
              id: project-dir
              run: |
                  # Un proyecto en subcarpeta solo lo es si tiene su propio lockfile:
                  # en el monorepo de Melodify el lockfile vive en la raíz y el
                  # paquete `app/` no instala por su cuenta.
                  if [ -f "./app/package.json" ] && [ -f "./app/package-lock.json" ]; then
                    echo "path=app" >> "$GITHUB_OUTPUT"
                  elif [ -f "./Ratetify/package.json" ] && [ -f "./Ratetify/package-lock.json" ]; then
                    echo "path=Ratetify" >> "$GITHUB_OUTPUT"
                  else
                    echo "path=." >> "$GITHUB_OUTPUT"
                  fi

            - name: Configurar Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: 22
                  cache: "npm"
                  cache-dependency-path: ${{ steps.project-dir.outputs.path }}/package-lock.json

            - name: Instalar dependencias
              working-directory: ${{ steps.project-dir.outputs.path }}
              run: npm ci

            - name: Validar sintaxis de código (TypeScript)
              working-directory: ${{ steps.project-dir.outputs.path }}
              run: npm run typecheck

            - name: Ejecutar linter (ESLint)
              working-directory: ${{ steps.project-dir.outputs.path }}
              run: npm run lint

            - name: Ejecutar pruebas unitarias (Jest)
              working-directory: ${{ steps.project-dir.outputs.path }}
              run: npm test

            # El título del PR también es un commit: se valida con el mismo
            # `.commitlintrc.json` que los commits, y el binario ya está instalado
            # por `npm ci` en el paso anterior.
            - name: Validar el título del PR con Conventional Commits
              if: github.event_name == 'pull_request'
              working-directory: ${{ steps.project-dir.outputs.path }}
              env:
                  PR_TITLE: ${{ github.event.pull_request.title }}
              run: printf '%s\n' "$PR_TITLE" | npx --no-install commitlint
```

No se modificó este archivo en la etapa: el YAML no era la causa de ningún fallo.

## Entorno de ejecución

| Pieza | Valor | Por qué importa |
|---|---|---|
| Runner | `ubuntu-latest` | Sin servicios externos, sin credenciales, sin caché propia que mantener |
| Node | `22` — observado `v22.23.5` en la corrida verde | Es el Node que trae el runner; el proyecto no fija engine |
| npm | `10.9.9` (el que acompaña a Node 22) | **Diferencia decisiva**: npm 10 no aplica `overrides` de la misma forma que npm 11 con workspaces, y por eso el fallo del lockfile no aparecía en la máquina local |
| Caché | `actions/setup-node` con `cache: npm` sobre `package-lock.json` | La caché se invalida con el lockfile; no sirve para tapar un lockfile incoherente |
| Permisos | `contents: read`, `pull-requests: read` | Solo lectura: el pipeline nunca escribe en el repositorio, ni etiquetas, ni releases, ni paquetes |

El contraste de versiones explica el retraso en detectar el primer fallo: la evidencia de Build and Test se produjo en local con **Node 24.21.0 / npm 11.19.0**, donde `npm ci` resolvía bien. El CI corre con **Node 22 / npm 10.9.9**. Un mismo `package-lock.json` se comportaba distinto en cada uno. La lección para el equipo: **el CI es el árbitro, no la máquina local**; un verde local en otro Node no demuestra nada sobre el pipeline.

## Disparadores y permisos

- **`push` a `main` y a `develop`**: cada integración se valida en la rama de integración.
- **`pull_request` contra `main` y `develop`**: el PR no se valida en abstracto, se valida el resultado del merge.
- El job de commitlint corre también en push, así que un mensaje mal formado se ve **antes** de abrir el PR.
- **Sin `concurrency`**: dos pushes seguidos corren dos pipelines. Es aceptable con un solo desarrollador; si el equipo crece, conviene cancelar la corrida anterior de la misma rama.
- **Sin `timeout-minutes`**: la suite tarda entre 20 y 60 s; el límite por defecto de 360 min no es un riesgo real hoy.

## Detección del directorio del proyecto

El workspace es un monorepo npm: la raíz tiene `package.json`, `package-lock.json`, `workspaces: ["app", "packages/*"]` y los nueve paquetes enlazados. El paso `Detectar directorio del proyecto` existe porque el workflow se comparte con otro proyecto (`Ratetify`) que sí vive en subcarpeta con su propio lockfile. La regla —«solo es un proyecto en subcarpeta si tiene su propio lockfile»— es la correcta para Melodify: `app/package.json` existe pero `app/package-lock.json` no, así que el pipeline resuelve `path=.` y opera sobre la raíz. Verificado en la corrida verde: `npm ci` instala **1083 paquetes** desde el lockfile de la raíz.

## Artefactos y despliegue

**No hay artefactos.** El pipeline no sube nada: ni imágenes, ni binarios, ni paquetes, ni informes de cobertura. Tampoco hay paso de despliegue, ni EAS Build, ni EAS Update, ni publicación en tiendas — coherente con `team.md` § Deployment y con el plan del alcance `mvp`, que omite las etapas de operación (4.1–4.7).

La consecuencia práctica: **no existe un «rollback del pipeline»** que deshacer. Revertir un cambio es `git revert` del squash del Bolt en `develop` (y en `main` si ya viajó en una entrega) y recargar Metro.

## Hallazgos y correcciones de esta etapa

Tres defectos, ninguno en el YAML del workflow. Los tres se reproducían en un árbol limpio con Node 22 y no en el árbol local, que arrastraba `dist/` y enlaces ya resueltos.

| ID | Defecto | Cómo se manifestaba | Corrección | Commit |
|---|---|---|---|---|
| CI-F0 | `packages/app-shell` y `packages/spotify` pedían `@melodify/design-system@1.4.0` mientras el paquete del workspace ya era `1.5.0`; el `overrides` de la raíz lo tapaba solo con npm 11 | `npm ci` en Node 22/npm 10.9.9 → `E404 '@melodify/design-system@1.4.0' is not in this registry` | Alinear las dos declaraciones y el lockfile a `1.5.0` y retirar el `overrides`, que ya no hace falta | `083a43e` |
| CI-F1 | `packages/activity/tsconfig.json` no declaraba sus referencias de proyecto, aunque `activity` importa `@melodify/content-store` y `@melodify/app-session` | En un árbol limpio, `tsc -b` compila `activity` antes que sus dependencias → 13 errores `TS2307` y `TS7006` | Declarar `references` a `../app-session` y `../content-store` | `40a64a2` |
| CI-F2 | La zona horaria de las pruebas se fijaba en `jest.setup.js`, que se carga **después** de que Jest arranque sus workers | `groupActivityEvents › usa el calendario local cerca de la medianoche` fallaba en UTC (el CI) y pasaba en Madrid (local) | Fijar `process.env.TZ` en `jest.config.js`, que se carga en el proceso padre | `89ded53` |

Detalle de por qué se colaron: los tres son defectos que **solo aparecen en un árbol limpio**. `npm ci` no reutiliza el `node_modules` de nadie; `tsc -b` con `dist/` ya construidos no recompila en el orden equivocado; y Jest hereda la zona del runner. La verificación se hizo borrando `app/dist` y `packages/*/dist` antes de cada comprobación, y ejecutando la suite completa desde `TZ=UTC` y desde `TZ=Pacific/Kiritimati`.

## Verificación del pipeline

| Corrida | Commit | Resultado | Dónde falló |
|---|---|---|---|
| `44926066102` | `ed69f72` | ❌ failure | `Instalar dependencias` — E404 de `@melodify/design-system@1.4.0` (CI-F0) |
| `44942073649` | `083a43e` | ❌ failure | `Validar sintaxis de código (TypeScript)` — 13 errores de `activity` (CI-F1) |
| `44942371571` | `40a64a2` | ❌ failure | `Ejecutar pruebas unitarias (Jest)` — la prueba de la medianoche en UTC (CI-F2) |
| **`44942753511`** | **`89ded53`** | **✅ success** | **Ninguno: los dos jobs en verde** |

La corrida verde ejecutó, en orden y sin saltos: `commitlint` sobre los commits del push → `npm ci` → `npm run typecheck` → `npm run lint` → `npm test`. URL: `https://github.com/LTONA16/Melodify/actions/runs/44942753511`.

Con eso, el criterio que Build and Test dejó como `N/A` (BT-13: «las pruebas se ejecutan en CI antes del merge») **pasa a `Met`**, demostrado sobre el árbol real y no sobre la máquina de nadie.

## Nota sobre la evidencia de Build and Test

`build-and-test-summary.md` afirma que «no se tocó `jest.config.js` ni `jest.setup.js`». Eso era cierto en esa etapa y **dejó de serlo aquí**: CI-F2 mueve la fijación de la zona horaria de `jest.setup.js` a `jest.config.js`. La afirmación se conserva como historia de Build and Test; este documento es la fuente vigente. Los nueve umbrales de cobertura no se tocaron, y el total medido en la corrida verde sigue por encima de todos ellos.

## Fuentes

- `.github/workflows/ci.yml` — pipeline vigente (copiado arriba sin cambios).
- `package.json` (raíz) — `workspaces`, scripts `typecheck` / `lint` / `test`, y el `overrides` retirado.
- `packages/app-shell/package.json`, `packages/spotify/package.json`, `package-lock.json` — declaración y lockfile alineados a `design-system@1.5.0`.
- `packages/activity/tsconfig.json` — referencias de proyecto añadidas.
- `jest.config.js`, `jest.setup.js` — zona horaria y umbrales.
- `construction/build-and-test/build-and-test-summary.md`, `construction/build-and-test/test-results.md` (`build-test-results`) y `construction/build-and-test/cross-unit-traceability.md`.
- `construction/u1-app-skeleton/code-generation/code-summary.md` … `construction/u6-walkthrough/code-generation/code-summary.md`.
- `aidlc/spaces/default/memory/team.md` — § Way of Working, § Testing Posture, § Deployment.
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/ci-pipeline/ci-pipeline-questions.md` — decisiones Q1–Q4 y sus fuentes.
- Corridas de GitHub Actions citadas en § Verificación del pipeline.
