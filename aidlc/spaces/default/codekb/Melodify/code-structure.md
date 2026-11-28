# Code Structure

## Repository Layout

```text
.
├── app/                    # app Expo: pantallas, estado y composición
│   └── src/bootstrap/      # puertos, instancias, sesión y App.tsx
├── apps/api/               # servicio Fastify + Prisma + Vitest
│   ├── prisma/             # schema.prisma y migración inicial
│   ├── src/{config,lib,modules,plugins}/
│   └── test/               # helpers, health, tokens, contratos, env
├── packages/
│   ├── contracts/          # tipos y esquemas Zod compartidos
│   ├── app-session/        # sesión demo y secure-store
│   ├── content-store/      # opiniones, likes, follows y comentarios en memoria
│   ├── catalog/            # puerto de búsqueda y catálogo de ejemplo
│   ├── spotify/            # PKCE y Web API desde el dispositivo
│   ├── connectivity/       # estado de red con expo-network
│   ├── activity/           # agrupación de actividad
│   ├── app-shell/          # navegación y chrome de las seis pantallas
│   ├── design-system/      # primitivas visuales
│   └── data-access/        # NO EXISTE todavía
├── docs/                   # documentación de producto y arquitectura aspiracional
└── .github/workflows/ci.yml
```

## Directory Classification

- **Source**: `app/src/`, `apps/api/src/`, `packages/*/src/`.
- **Tests**: `app/src/**/__tests__/`, `apps/api/test/`, `packages/*/src/__tests__/`.
- **Configuration**: `package.json`, `tsconfig*.json`, `eslint.config.js`, `jest.config.js`, `jest.setup.js`, `vitest.config.mts`, `.prettierrc`, `.commitlintrc.json`, `.gitignore`, `.env.example`.
- **Data/schema**: `apps/api/prisma/schema.prisma` y `apps/api/prisma/migrations/`.
- **Docs/AI-DLC**: `README.md`, `apps/api/README.md`, `docs/`, `aidlc/`, `.aidlc/` (estos últimos no son código del proyecto).

## Entry Points

- `app/src/bootstrap/App.tsx`: provee sesión, tarjetas, navegación y pantalla de carga.
- `apps/api/src/server.ts`: `buildApp()` + `listen()` + cierre ordenado (SIGINT/SIGTERM).
- `apps/api/src/app.ts`: registro de plugins y rutas; se usa con `inject()` en pruebas.
- `packages/contracts/src/index.ts` y `src/schemas.ts`: dos subpaths públicos, tipos y runtime.

## Naming and Conventions

- TypeScript `strict`, camelCase para valores, PascalCase para componentes/tipos, SCREAMING_SNAKE_CASE para constantes de módulo.
- Componentes en `PascalCase.tsx`; hooks en `useAlgo.ts`; comentarios en español explicando el porqué.
- Textos de interfaz en español; errores en lenguaje llano con acción «Reintentar».
- Formateo con Prettier (80 columnas, comillas dobles, coma final) y lint con ESLint plano de Expo.

## Boundaries

- `eslint.config.js` prohíbe que `src/` de la app importe módulos de `app-shell` y `design-system`, y prohíbe que el servidor y los paquetes importen la app.
- `packages/contracts` solo exporta tipos y esquemas: sin React, red ni lógica de negocio.
- `packages/spotify` guarda token y PKCE en el dispositivo; el backend no conoce credenciales de Spotify.
- El workspace `apps/api` solo depende de `@melodify/contracts` en producción; `vitest`, Prisma y Fastify son dependencias suyas.
