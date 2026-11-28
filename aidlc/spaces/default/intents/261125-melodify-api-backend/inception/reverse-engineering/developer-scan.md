## Developer Code Scan Results

Repo: `Melodify` (raíz del workspace; identidad operativa del engine, sin entrada en `repos`). Barrido completo de `./` sobre código escrito por personas; primer escaneo (`NO_STORE`). No se ejecutaron tests, builds ni programas del proyecto.

### Scan Coverage

- **Analyzed deeply**:
  - `apps/api/` — composición de Fastify (`src/app.ts`, `src/server.ts`), configuración validada (`src/config/env.ts`), errores, logger, contraseñas y tokens (`src/lib/`), plugins de JWT/Prisma/OpenAPI/errores (`src/plugins/`), rutas de salud, autenticación y `/me` (`src/modules/`), esquema Prisma y migración inicial, documentación del paquete, `vitest.config.mts` y helpers de prueba.
  - `packages/contracts/` — los siete ficheros de `src/`: tipos de sesión, errores, salud, paginación y vistas, más los esquemas Zod del subpath `/schemas`.
  - `packages/content-store/src/` y `packages/app-session/src/` — reductor en memoria, vistas derivadas, registro seguro de sesión y adaptador de `expo-secure-store`.
  - `app/src/bootstrap/` — punto de composición, puertos de Spotify, instancias únicas, sesión, servicios de la cáscara y `App.tsx`; también `app/src/screens/dependencies.ts`.
  - `app/package.json`, `apps/api/package.json`, `apps/api/.env.example`, `app/.env.example`, `package.json`, `tsconfig.json`, `tsconfig.base.json`, `eslint.config.js`, `jest.config.js`, `jest.setup.js`, `.gitignore`, `.github/workflows/ci.yml`, `README.md`, `docs/04-arquitectura.md`.
- **Skimmed only**:
  - `app/src/screens/`, `app/src/state/`, `app/src/comments/` y `app/src/components/` — pantallas, hooks y sus pruebas, a nivel de estructura y contratos consumidos.
  - `packages/catalog/`, `packages/spotify/`, `packages/app-shell/`, `packages/design-system/`, `packages/activity/` y `packages/connectivity/` — superficies públicas (`src/index.ts`) y organización de carpetas; historias internas y tests no leídos en detalle.
  - `apps/api/test/*.test.ts` salvo helpers y `contracts.test.ts` — inventario por nombre, sin lectura completa.
  - `docs/01-objetivo.md`, `docs/02-features.md`, `docs/03-ia-agentes-mcp.md`, `.github/pull_request_template.md`, `.commitlintrc.json`, `.prettierrc`, `.npmrc`, `opencode.json`.
- **Left out**:
  - `.aidlc/`, `.opencode/`, `aidlc/`, `.github/agents/`, `.github/skills/`, `.github/hooks/` y `.agents/` — instalación y andamiaje de AI-DLC, no código del proyecto.
  - `.git/`, `node_modules/`, `coverage/`, `app/dist/`, `packages/*/dist/`, `.DS_Store` — ignorados por `.gitignore` o salidas de build/dependencias/cachés.

### Packages Found

- `@melodify/api` — servicio Node/Fastify — TypeScript — REST `/api/v1`, base de datos Prisma/Postgres.
- `@melodify/contracts` — biblioteca de tipos y esquemas — TypeScript — vocabulario HTTP compartido app/servidor.
- `@melodify/app` — aplicación Expo — TypeScript/TSX — seis pantallas y punto de composición.
- `@melodify/app-shell`, `@melodify/design-system`, `@melodify/app-session`, `@melodify/content-store`, `@melodify/catalog`, `@melodify/connectivity`, `@melodify/spotify`, `@melodify/activity` — paquetes internos — TypeScript/TSX — cáscara, UI, sesión, contenido, catálogo, red, Spotify y actividad.

### Build System

- **Type**: npm workspaces (`app`, `apps/*`, `packages/*`), raíz del monorepo.
- **Config Files**: `package.json`, `tsconfig.json` (referencias de proyecto), `tsconfig.base.json`, `apps/api/tsconfig.json` (Node16/CommonJS), `jest.config.js`, `vitest.config.mts`, `eslint.config.js`, `.prettierrc`.
- **Build Dependencies**: la API apunta solo a `packages/contracts`; la app apunta a los ocho paquetes móviles; ningún paquete importa la app.

### APIs Discovered

- REST (Fastify) — `apps/api/src/app.ts` y `src/modules/` — ocho rutas públicas: salud (1), autenticación (4), cuenta actual (1) y documentación (2).
- OpenAPI 3.0.3 — `src/plugins/openapi.ts` — generado desde los esquemas Zod; Swagger UI en `/api/v1/docs`, fuera de producción.
- Contrato interno — `packages/contracts/src/` — tipos de sesión, error, paginación y vistas sociales; los recursos sociales aún no tienen rutas.

### Frameworks & Libraries

- Fastify 5.12.8, Prisma 6.19.3, PostgreSQL 16, Zod 4.6.7, `@node-rs/argon2` 2.2.2, `@fastify/jwt` 10.2.9, Vitest 5.1.2.
- Expo 58, React Native 0.88.1, React 19.3.0, React Navigation 7.5.1, Jest 29.7.0 con `jest-expo` 58.0.15, ESLint 9.39.5, Prettier 3.9.10, TypeScript 5.9.3.

### Test Coverage

- **Test Directories**: `apps/api/test/` (Vitest, Postgres real), `app/src/**/__tests__/` y `packages/*/src/__tests__/` (Jest).
- **Test Frameworks**: Vitest con `v8` para la API; Jest con `jest-expo` y `@testing-library/react-native` para el móvil.
- **Coverage Config**: presente en ambos: API 80 % líneas/sentencias/funciones y 70 % ramas sobre `src/**` (sin `server.ts`); móvil 80 % de líneas por árbol en `jest.config.js`.

### Code Quality Indicators

- **Linting**: ESLint 9 plano en la raíz; reglas de frontera arquitectónica por archivo y `no-console` salvo `app/src/bootstrap/logger.ts`.
- **CI/CD**: `.github/workflows/ci.yml` — commitlint, `npm run typecheck`, `npm run lint` y `npm test` (solo Jest) en push/PR a `main` y `develop`.
- **Documentation**: `README.md` y `apps/api/README.md` completos; contratos y módulos con comentarios de intención en español; `docs/04-arquitectura.md` describe un backend aspiracional que hoy no existe.

### Technical Debt Signals

- La app todavía entra con `demo`/`demo` en `packages/app-session/src/app-session.ts`; no hay adaptador HTTP que consuma el API (`@melodify/data-access` no existe en `packages/`).
- `docs/04-arquitectura.md` y `docs/03-ia-agentes-mcp.md` dibujan servicio de catálogo, Redis, IA y OAuth de Spotify en el servidor: contradicen la frontera actual (PKCE y catálogo en la app).
- `SEED_DEMO` se valida en `src/config/env.ts` pero no se usa en el código de arranque.
- Trece `eslint-disable-next-line` en hooks/pantallas de `app/src` y duplicación deliberada de las vistas entre `packages/contracts/src/views.ts` y `packages/content-store/src/views.ts` (la prueba de asignabilidad prevista no está).
- La suite Vitest del API no está en el workflow de CI; `npm test` desde la raíz solo lanza Jest.

## Handoff Summary

- **Intent-relevant finding**: el backend ya tiene base operativa y autenticación completa en `apps/api/` (`src/app.ts:45`, `src/modules/auth/service.ts:95`, `prisma/schema.prisma:31`), y el contrato compartido ya declara las vistas sociales y paginación (`packages/contracts/src/views.ts:14`, `pagination.ts:9`), pero no existen rutas sociales ni adaptador HTTP en la app; el móvil sigue con sesión demo y almacén en memoria (`app/src/bootstrap/instances.ts:28`, `packages/app-session/src/app-session.ts:137`).
- **Risks / follow-up**: preservar la frontera servidor→móvil (solo `@melodify/contracts`, reforzada en `eslint.config.js:276`), no tocar PKCE ni tokens de Spotify, reutilizar los esquemas Zod como única fuente de validación/OpenAPI, respetar los índices compuestos y los `CHECK` de la migración para el feed por cursor, y decidir cómo se conectará la sesión real sin romper la instancia única de `app/src/bootstrap/session.ts`.
