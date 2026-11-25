# Instrucciones de construcción — Melodify

> Etapa: Build and Test · Intento: `261105-melodify-mobile-app` · Alcance: `mvp` · Profundidad: Standard · Estrategia de prueba: Standard
> Fecha: 2026-11-21 · Rama: `develop` · Commit de partida: `90e003f`
> Deriva de `code-generation-plan.md`, `unit-test-instructions.md` y `code-summary.md` de las seis unidades (`u1-app-skeleton`, `u2-content-core`, `u3-create-react`, `u4-spotify-explore`, `u5-activity`, `u6-walkthrough`), y de `team.md` § Way of Working, § Testing Posture y § Deployment.

## Qué es «construir» en este proyecto

Melodify es una app **Expo / React Native** de un monorepo npm. En esta versión **no hay backend, ni artefacto de release, ni tienda**: no se compila un binario, no se firma y no se publica (RC-07, TS-48, `team.md` § Deployment).

Construir aquí significa tres cosas, en este orden:

1. **Resolver el workspace**: que `node_modules` contenga los enlaces de los nueve paquetes internos.
2. **Compilar de verdad el TypeScript**: `tsc -b` sobre las referencias de proyecto del monorepo. Es la única compilación que existe y es la que demuestra que los tipos cuadran entre paquetes.
3. **Arrancar el bundle de desarrollo** (Metro) para que Expo Go lo cargue en el teléfono.

Ninguna de las tres genera un artefacto que se despliegue. El «despliegue» de esta versión es abrir la app en el teléfono con Metro levantado.

## Prerrequisitos

| Qué | Versión / condición | Por qué |
|---|---|---|
| Node.js | **24.x** (probado con `v24.21.0`) | El runner y `tsc -b` del monorepo |
| npm | **11.x** (probado con `11.19.0`) | Espacios de trabajo y `overrides` del lockfile |
| Expo Go | SDK **57** en el teléfono | Es el contenedor de la app; no hay build propio |
| Android físico | Cualquiera con Expo Go instalado | La verificación manual se hace en dispositivo, nunca en emulador (RC-05) |
| Red local | Teléfono y ordenador en la misma red | Metro sirve el bundle por LAN |

No hace falta cuenta de Spotify para construir ni para probar. El client ID solo se usa en el teléfono para la mitad con sesión (P3 y P4 del recorrido).

## Instalación de dependencias

Desde la raíz del repositorio (nunca desde `app/`: el lockfile vive en la raíz):

```bash
npm install
```

- `npm install` resuelve los **nueve espacios de trabajo** (`app` + `packages/*`) y crea los enlaces `node_modules/@melodify/*`. Sin esos enlaces, `tsc -b` y ESLint no encuentran `@melodify/activity`, `@melodify/spotify` ni el resto, y fallan con `TS2307` / `import/no-unresolved`.
- El repositorio usa `.npmrc` con `save-exact=true`: las versiones se fijan exactas (TS-01). No se añaden rangos.
- En CI, el paso equivalente es `npm ci`, que exige el lockfile y no lo reescribe.

**Si `typecheck` o `lint` fallan con `Cannot find module '@melodify/...'`**, el workspace está desenlazado (pasa al cambiar de rama o al limpiar `node_modules` a mano). La reparación es volver a ejecutar `npm install`; no se toca ningún `package.json` ni el lockfile. Fue exactamente el estado encontrado al abrir esta etapa y quedó resuelto así, sin cambios versionados.

## Configuración del entorno

| Variable | Dónde | Obligatoria | Qué es |
|---|---|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | `.env` local, documentada en `.env.example` | **No** para construir ni para probar; sí para el recorrido con sesión (P3/P4) | Client ID del cliente **público** de Spotify. PKCE no necesita secreto. |

Reglas que no se negocian:

- **Nunca** un `client_secret` en la app, en el repositorio ni en una variable `EXPO_PUBLIC_*` (NFR3.1, `project.md` § Forbidden).
- `.env` **no se versiona**; `.env.example` documenta la variable y nada más. `.gitignore` ya cubre `.env` y `.env.*` salvo `.env.example`.
- El redirect de PKCE lo resuelve la app con `makeRedirectUri`; en Expo Go es `exp://<ip>:8081/--/spotify-callback`. El panel de Spotify debe aceptarlo para la mitad con sesión (si no, el recorrido se condiciona; ver `walkthrough-p3.md`).

No hay servicios locales que levantar: el contenido vive en memoria y no hay base de datos ni servidor.

## Comandos de construcción

Los tres comandos del CI son la puerta completa (`team.md` § Way of Working). Se ejecutan desde la raíz:

```bash
npm run typecheck     # tsc -b  → compila las referencias de proyecto
npm run lint          # eslint . → 0 errores, 0 avisos
npm test              # jest --coverage → suite completa con umbrales
```

Y para la app en el teléfono, desde `app/`:

```bash
cd app
npx expo start        # levanta Metro y muestra el QR para Expo Go
```

`npm run typecheck` deja `packages/*/dist/` como artefacto de `tsc -b`; está ignorado por git y por ESLint y no requiere limpieza.

## Verificación de la construcción

| Comprobación | Comando | Resultado esperado |
|---|---|---|
| Tipos entre paquetes | `npm run typecheck` | exit 0, sin salida de error |
| Fronteras y estilo | `npm run lint` | exit 0, `0 problems` |
| Suite completa y umbrales | `npm test -- --coverage` | exit 0; todas las suites en verde; cada árbol ≥ 80 % de líneas |
| Bundle servible | `cd app && npx expo start` | Metro arranca y el QR abre Melodify en Expo Go |
| Recorrido en el teléfono | manual, ver `walkthrough-p1.md`…`walkthrough-p4.md` | seis pantallas, en claro y en oscuro, sin cierres ni blancos |

Los umbrales de cobertura viven en `jest.config.js` (`coverageThreshold`, 80 % de líneas por árbol) y **no se bajan para hacer pasar una etapa** (`team.md` § Testing Posture).

## Problemas de construcción habituales

| Síntoma | Causa | Qué se hace |
|---|---|---|
| `TS2307: Cannot find module '@melodify/...'` | Enlaces del workspace perdidos | `npm install` desde la raíz |
| `import/no-unresolved` en las mismas rutas | Igual que arriba | `npm install`; no se toca `eslint.config.js` |
| `tsc -b` falla con errores de un paquete que no se tocó | Referencias de proyecto desincronizadas | `npx tsc -b --clean` y volver a `npm run typecheck` |
| Jest tarda y alguna pantalla agota el tiempo | Instrumentación de cobertura sobre el árbol completo | `testTimeout` ya está en 20 s en `jest.config.js`; no se sube ni se aísla la prueba |
| `--coverage` sale distinto de cero con todas las pruebas en verde | Umbral global de un árbol que el comando acotado no ejecutó | Es el caso previsto por `unit-test-instructions.md`: el suelo se juzga sobre la suite completa, aquí. No se baja ningún umbral |
| Metro no conecta el teléfono | Red distinta o firewall | Misma red Wi-Fi; `npx expo start --tunnel` solo si la LAN no es posible |
| La app abre sin datos de Spotify | Falta el client ID o el panel rechaza el redirect | Es la rama condicionada de R2; el recorrido sin sesión sigue completo |
| `npm ci` falla en CI | Lockfile desactualizado respecto de un `package.json` | `npm install` en local y commitear el lockfile junto al cambio de dependencia |

## Lo que esta etapa no construye

- **Ningún binario**: no hay EAS Build, ni firma, ni compilación en la nube, ni cuentas de desarrollador (TS-48).
- **Ningún entorno**: no hay staging ni producción; el único entorno es el teléfono con Metro.
- **Ninguna publicación**: no hay Google Play ni App Store en esta versión.
