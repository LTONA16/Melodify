# Technology Stack

## Lenguajes y entornos de ejecución

- TypeScript 5.9.3 en todo el monorepo; `strict: true`, ES2022, módulos `bundler` en la app y `commonjs`/Node16 en la API.
- Node.js 20+ para la API; Node.js 22 en el workflow de CI.
- npm workspaces (`app`, `apps/*`, `packages/*`) con `package-lock.json` en la raíz.

## Servidor

| Area | Choice | Version |
| --- | --- | --- |
| Framework | Fastify | 5.12.8 |
| Validación y OpenAPI | Zod + `fastify-type-provider-zod` + `@fastify/swagger` / `swagger-ui` | 4.6.7 / 7.0.0 / 9.9.5 / 6.1.5 |
| ORM y base de datos | Prisma Client + PostgreSQL (Docker `postgres:16-alpine`) | 6.19.3 |
| Autenticación | `@node-rs/argon2` + `@fastify/jwt` | 2.2.2 / 10.2.9 |
| Seguridad HTTP | `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit` | 11.4.3 / 13.2.0 / 11.3.0 |
| Pruebas | Vitest con cobertura v8 | 5.1.2 |

## Móvil

| Area | Choice | Version |
| --- | --- | --- |
| Plataforma | Expo SDK 58 + React Native | 0.88.1 |
| UI | React 19.3.0, React Navigation 7.5.1, `@expo/vector-icons` | — |
| Almacenamiento seguro | `expo-secure-store` | ~58.0.3 |
| Navegador y cifrado | `expo-web-browser`, `expo-crypto`, `expo-network` | ~58.1.0 / ~58.0.8 / ~58.0.5 |
| Pruebas | Jest 29.7.0 + `jest-expo` 58.0.15 + Testing Library RN 13.3.3 | — |
| Estado | Reductores propios con `subscribe()`; sin Redux ni TanStack Query | — |

## Compartido y herramientas

- `@melodify/contracts`: Zod 4.6.7 como única fuente de validación y documentación HTTP.
- ESLint 9.39.5 con `eslint-config-expo` 58.0.4 y reglas de frontera por directorio; Prettier 3.9.10; `@commitlint/config-conventional` 21.2.4.
- Sin Docker Compose en producción: `apps/api/docker-compose.yml` solo levanta PostgreSQL local de desarrollo/pruebas.
- Sin EAS Build, EAS Update ni GitHub Actions de despliegue.

## Desviación de versiones

`README.md` cita React Native 0.87.1 y React 19.2.3, mientras `app/package.json` fija 0.88.1 y 19.3.0; los manifiestos son la fuente autoritativa.
