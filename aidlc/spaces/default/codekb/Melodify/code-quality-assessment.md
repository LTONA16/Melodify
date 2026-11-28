# Code Quality Assessment

## Quality Snapshot

- TypeScript `strict` en todo el workspace; `npm run typecheck` (`tsc -b`) cubre la API y los paquetes móviles.
- Prettier y ESLint configurados en la raíz; el workflow exige commitlint, typecheck, lint y `npm test` en push/PR.
- Código organizado por dominio y con comentarios en español que explican decisiones no obvias (refresh rotatorio, fronteras de importación, degradación de portadas).
- Fábricas puras (`buildApp()`, `createContentStore()`, `createAppSession()`) facilitan pruebas sin singleton global.

## Test Coverage

- **Mobile**: Jest + `jest-expo`, umbral 80 % de líneas sobre `app/src/**`; pruebas de hooks, pantallas y paquetes con `@testing-library/react-native`.
- **API**: Vitest con cobertura v8, umbrales 80 % líneas/sentencias/funciones y 70 % ramas sobre `src/**` (excluye `server.ts`), con `globalSetup` que aplica migraciones a `TEST_DATABASE_URL`.
- **Calidad de pruebas**: las pruebas leídas (`health`, `tokens`, `contracts`, `env`) afirman comportamiento concreto con `inject()` y base real; no se encontraron aserciones triviales ni `assert true` en el código analizado.
- **No ejecutado**: este escaneo es de solo lectura; no se lanzaron Jest, Vitest, ESLint ni compilación.

## Quality Risks

- `npm test` en la raíz ejecuta solo Jest: la suite Vitest del API no está en `.github/workflows/ci.yml`, por lo que el backend puede romperse sin bloquear el merge.
- `README.md` describe React Native 0.87.1 / React 19.2.3, pero los manifiestos fijan 0.88.1 / 19.3.0.
- `docs/04-arquitectura.md` y `docs/03-ia-agentes-mcp.md` plantean Spotify server-side, Redis, colas y OpenAI en el backend; no coincide con el código ni con la regla de que PKCE vive en la app.
- `SEED_DEMO` se valida en `src/config/env.ts` pero no se usa en el arranque; la app sigue con `demo`/`demo` en `packages/app-session`.
- Trece `eslint-disable-next-line` en hooks/pantallas (`react-hooks/set-state-in-effect`, `exhaustive-deps`); hay justificación previa en el registro del intent móvil, pero conviene vigilarlos.
- Las vistas de `packages/contracts/src/views.ts` duplican las de `packages/content-store/src/views.ts` a propósito; la prueba de asignabilidad prevista en `@melodify/data-access` aún no existe.
- No hay adaptador HTTP que consuma el API; el móvil y el servidor están desacoplados por completo hoy.

## Technical Debt Signals

- `TODO` / `FIXME` / `HACK` en código fuente del proyecto: 0.
- Linter suprimido: 13 comentarios `eslint-disable-next-line` en `app/src`.
- Endpoints sociales declarados en contratos y base de datos, sin implementar en `apps/api/src/modules/`.
- Sin seed real del usuario demo ni migración de datos de prueba; la base queda vacía tras `migrate deploy`.

## Recommendations

1. Añadir un job de CI para `npm test -w @melodify/api` con Postgres de servicio y `TEST_DATABASE_URL`.
2. Crear `@melodify/data-access` con la prueba de asignabilidad y el primer adaptador HTTP.
3. Marcar `docs/04-arquitectura.md` como propuesta no implementada o actualizarla a la frontera real.
4. Conectar la sesión real sin romper la instancia única de `app/src/bootstrap/session.ts` y sin tocar PKCE/tokens.
