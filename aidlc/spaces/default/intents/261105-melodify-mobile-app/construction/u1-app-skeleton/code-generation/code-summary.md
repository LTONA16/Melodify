# Resumen de código — U1 `u1-app-skeleton`

> **Provenance**: deriva de `code-generation-plan.md` (plan aprobado, 18 pasos), `unit-test-instructions.md`, el informe del agente de desarrollo que ejecutó la construcción y el informe de reparación de la revisión adversarial.
> Fecha: 2026-11-11. Etapa: Code Generation · Unidad: `u1-app-skeleton` · Agente: aidlc-developer-agent · Profundidad: Standard.

## Qué se construyó

El tramo mínimo que corre de punta a punta: raíz de monorepo con espacios de trabajo, `@melodify/app` (Expo Go), `@melodify/design-system` (C1 1.1.0), `@melodify/app-shell` (C2 1.1.0) y `@melodify/app-session` (C3 1.1.0). Arranque con lectura del registro de sesión, Login simulado (`demo` / `demo`) que recuerda la sesión en `expo-secure-store`, cáscara de cinco pestañas con Login fuera de la barra, e Inicio con una tarjeta de opinión sembrada.

**Pasos del plan**: 60 de las 61 casillas completas y marcadas. Los pasos 1–16 y el 18 están completos. Del paso 17 quedan dos de tres: `eslint.config.js`, `.prettierrc`, `.gitignore` y las dos puertas están hechos, y la tercera casilla («comprobar que el CI existente corre **sin cambios**») queda sin marcar a propósito porque el flujo **sí se cambió** para que el monorepo compile en CI (ver desviación 1).

## Archivos

### Raíz del monorepo

| Archivo | Qué es |
|---|---|
| `package.json` | Espacios de trabajo `app` + `packages/*` y los tres scripts del CI (`test`, `typecheck`, `lint`). |
| `package-lock.json` | Árbol de dependencias resuelto por `npm install`. |
| `tsconfig.json` | Referencias de proyecto a los cuatro paquetes. |
| `tsconfig.base.json` | `strict: true` compartido por todos los paquetes. |
| `jest.config.js` | Preset `jest-expo`, `collectCoverageFrom` explícito, exclusiones de TS-10 y `coverageThreshold` por árbol al 80 % de líneas. |
| `jest.setup.js` | Testing Library y los dobles de `expo-splash-screen` y `expo-secure-store`. |
| `eslint.config.js` | `eslint-config-expo`, `no-console` con la única excepción de `app/src/bootstrap/logger.ts` y las tres reglas `no-restricted-imports` (NFR3.2, R-03 de NFR Design). |
| `.prettierrc` | Formato del repositorio. |
| `.npmrc` | `save-exact=true` (TS-01). |
| `.env.example` | `EXPO_PUBLIC_SPOTIFY_CLIENT_ID=` vacía; ningún client secret. |
| `.gitignore` | Se añadieron `.env`, `.env.*` con la excepción de `.env.example`, `.expo/`, `coverage`, artefactos de compilación. |
| `.github/workflows/ci.yml` | Se corrigió la detección del directorio del proyecto: un subproyecto solo cuenta como tal si tiene su propio lockfile, así que en este monorepo el directorio es la raíz (ver desviación 1). |

### `app/` — `@melodify/app`

- `app.json` (`scheme: "melodify"`, `userInterfaceStyle: "automatic"`), `babel.config.js`, `index.ts` (registra la app y `SplashScreen.preventAutoHideAsync()`), `package.json` (privado, `0.0.0`), `tsconfig.json`, `src/types/globals.d.ts`.
- `src/bootstrap/App.tsx` — máquina de estados `"arranque" | "login" | "inicio"`, `ThemeProvider`, cáscara con las cinco pestañas, Login fuera de la barra, `SplashScreen.hideAsync()` en `finally`.
- `src/bootstrap/session.ts` — **la única instancia de sesión de la app**, construida con el logger del proyecto (`createAppSession({ logger })`). `App`, `LoginScreen` y el «Cerrar sesión» de U2 leen esta misma instancia.
- `src/bootstrap/logger.ts` — implementa `SessionLogger`: `warn` bajo `__DEV__`, `error` siempre, prefijo `[melodify]`, firma cerrada a dos cadenas.
- `src/bootstrap/shell-services.ts` — valores por defecto de C2.
- `src/bootstrap/ports.ts` — los tres puertos de Spotify declarados y sin implementación (C5).
- `src/screens/login/LoginScreen.tsx`, `src/screens/inicio/InicioScreen.tsx` + `seed.ts`, y `src/screens/placeholders/{Explorar,Crear,Actividad,Perfil}Screen.tsx`.

### `packages/app-session/` — C3 v1.1.0

- `session-record.ts` (`SessionRecord`, `parseSessionRecord`), `storage-keys.ts` (`melodify.session`), `secure-store-adapter.ts` (**único** archivo que importa `expo-secure-store`, con `SecureStorePort`), `app-session.ts` (`createAppSession`, `getSession`, `signIn`, `signOut`, `subscribeSession`, `SessionLogger`, `SessionLogCode`, logger silencioso por defecto), `index.ts` (superficie pública).

### `packages/design-system/` — C1 v1.1.0

- `tokens.ts`, `themes.ts`, `theme-context.ts`, `ThemeProvider.tsx`, `useTheme.ts`, `contrast.ts` (ratio WCAG), `relative-time.ts`, `models.ts`, `index.ts`.
- `src/components/`: `AppHeader`, `Avatar`, `Banner`, `BottomTabBar`, `CoverArt`, `EmptyState`, `OpinionCard`, `PrimaryButton`, `RatingStars`, `Skeleton`, `SocialActionBar`, `TextField` — los doce de C1, con `data-testid` en cada elemento interactivo.

### `packages/app-shell/` — C2 v1.1.0

- `AppShell.tsx`, `contexts.ts`, `types.ts`, `index.ts` — `NavigationContainer`, cinco pestañas hermanas en el orden recibido, una pila por pestaña, `GlobalServices`, `useShellServices`, `useGlobalServices`, `CreateEntry`/`useCreateEntry`, `DetailScreen`, `entry?` (la rama de Login fuera de la barra) y los dos puntos de montaje condicionales vacíos.

### Pruebas (19 suites, 177 pruebas)

`packages/app-session/src/__tests__/`: `parse-session-record` (8), `secure-store-adapter` (6), `app-session` (17), `index` (2).
`packages/design-system/src/__tests__/`: `contrast` (5), `theme` (4), `bottom-tab-bar` (6), `opinion-card` (5), `components` (7), `relative-time` (3).
`packages/app-shell/src/__tests__/app-shell` (19).
`app/src/bootstrap/__tests__/`: `logger` (2), `shell-services` (2), `ports` (1), `harness` (2), `app-bootstrap` (6), `app-session-wiring` (2).
`app/src/screens/login/__tests__/login-screen` (8), `app/src/screens/inicio/__tests__/inicio-screen` (6).

## Decisiones de implementación

- **Un solo proyecto de Jest en la raíz** con `jest-expo`, para que las pruebas de pantalla y las de módulos puros convivan sin dos configuraciones que se desincronicen.
- **Una sola instancia de sesión, en el punto de composición.** `app/src/bootstrap/session.ts` construye `appSession` con el logger del proyecto; `App` se suscribe a ella y U2 cierra sesión con ella. La superficie por defecto de C3 sigue publicada para pruebas y para quien no necesite logger, pero un cierre de sesión por esa instancia no devuelve la app a Login: por eso el punto único está expuesto y probado (`app-session-wiring`).
- **El adaptador del almacenamiento vive en el paquete** y la dependencia de `expo-secure-store` está en `packages/app-session/package.json`; la sesión recibe `store` y `logger` por inyección, con logger silencioso por defecto, de modo que `createAppSession()` sin argumentos sigue siendo válido (C3 § Revisión 10).
- **Login se monta fuera de la cáscara** de pestañas mediante `AppShell entry?`, y la cáscara no pinta la barra en esa rama (BR1.5, NFR2.1).
- **Pilas de pestaña hechas a mano** con el estado de la cáscara, sin `@react-navigation/native-stack` ni `@react-navigation/bottom-tabs`: la navegación que U1 necesita cabe en el estado de C2 y evita dependencias nativas en Expo Go. `@react-navigation/native` se queda por `NavigationContainer`.
- **Textos de interfaz en español y literales de F2 y F6** copiados carácter a carácter; las pruebas comparan la cadena completa.
- **Contratos enmendados, no silenciados.** Las props y exportaciones aditivas que la unidad envía quedan registradas en `contract-summary.md` § Revisión 11, con C1 y C2 en `1.1.0` y el reparto de versiones futuras desplazado un escalón.

## Cobertura y puertas

Ejecutado en esta etapa, sobre el árbol tal como quedó:

```
npx jest --coverage app/src packages/design-system/src packages/app-shell/src packages/app-session/src
→ 19 suites, 177 pruebas, todas en verde
```

| Árbol | Líneas | Umbral |
|---|---|---|
| `app/src/**` | 97,18 % (69/71) | 80 % |
| `packages/design-system/src/**` | 99,17 % (119/120) | 80 % |
| `packages/app-shell/src/**` | 93,28 % (111/119) | 80 % |
| `packages/app-session/src/**` | 100,00 % (90/90) | 80 % |
| **Total** | **97,25 % (389/400)** | — |

`npm test` → verde. `npm run typecheck` (`tsc -b`) → verde. `npm run lint` (`eslint .`) → 0 errores, 0 avisos. No se bajó ningún umbral: la primera medición dejó `app-shell` en 72,54 % y se cerró la brecha con seis pruebas de las operaciones de `GlobalServices`, no tocando la configuración.

## Pruebas escritas pero no ejecutadas en esta etapa

Ninguna: las 177 pruebas se ejecutaron aquí y quedaron en verde.

**Lo que ninguna prueba automática demuestra** y sigue siendo verificación manual: el recorrido real en Expo Go sobre el teléfono Android físico (arranque en frío de 2 s de NFR8.1, gestos, áreas táctiles al dedo). Está fuera del alcance automático por `unit-test-instructions.md` y se demuestra en el checkpoint del esqueleto.

## Desviaciones del plan

1. **El CI se corrigió (paso 17, tercera casilla sin marcar).** `.github/workflows/ci.yml` detectaba `./app/package.json` y fijaba `working-directory: app` con `cache-dependency-path: app/package-lock.json`; en este monorepo el lockfile está en la raíz y `app/package.json` solo tiene `start`, así que `npm ci`, `typecheck`, `lint` y `test` habrían fallado en CI. La detección ahora exige que el subproyecto tenga **su propio lockfile**, con lo que el directorio del proyecto es la raíz y los tres comandos corren donde viven los scripts. La casilla del plan pedía comprobar que corría «sin cambios»; no era cierto, y se deja sin marcar para que la persona vea la decisión. Reversible con un `git checkout` del archivo.
2. **Instancia de sesión única (R-01 de la revisión).** `App` construía su propia sesión y C3 publicaba otra, así que el «Cerrar sesión» de U2 no habría vuelto a Login. Ahora la única instancia vive en `app/src/bootstrap/session.ts` y se prueba de punta a punta. **U2 debe cerrar sesión con `appSession`, no con la exportación por defecto del paquete.**
3. **Contratos enmendados (R-02 y R-05).** C1 y C2 suben a `1.1.0` y `contract-summary.md` § Revisión 11 registra la superficie aditiva realmente enviada; el token `space` se alinea con los ocho pasos reales de `design-system-mapping.md`. El reparto de piezas por versión de la revisión 9 se desplaza a `1.2.0` (U2), `1.3.0` (U4), `1.4.0` (U3) y `1.5.0` (U5), sin cambiar qué piezas entran en cada una.
4. **Traza ampliada (R-03).** `traceability.json` incluye NFR5.1–NFR5.4, NFR6.2 y NFR7.1–NFR7.3, que esta unidad sí implementa, con su archivo real.
5. **Dependencia retirada (R-06).** `@react-navigation/bottom-tabs` sale de `packages/app-shell/package.json` y de `app/package.json`: ningún archivo la importaba.
6. **`InicioScreen` acepta `opinions?` (aditivo)** para que la prueba del estado vacío recorra el mismo camino que recorrerá U2; el registro de la pestaña no cambia y la semilla sigue siendo la constante exportada del módulo de presentación.
7. **`EmptyState` recibe la frase de F6 entera en el título** y el cuerpo vacío: la especificación da una sola frase y el componente pide título y cuerpo.
8. **Chip de Spotify**: `Pressable` de 44×44 con etiqueta «Conectar» y acción nula; U4 la cablea al servicio inyectado.
9. **Props aditivas sobre C1/C2**: `TextField`, `PrimaryButton` y `SocialActionBar` reciben props opcionales nuevas, `AppShell` acepta `entry?` y `ThemeProvider` acepta `scheme`. Ya no son una desviación sin registrar: están en la § Revisión 11 del contrato.
10. **`expo-asset` y `expo-font`** quedaron con `npm dedupe` por el emparejamiento que exige el SDK 57; no se añadió ninguna dependencia fuera del SDK.

## Desviaciones que conviene mirar en la revisión

- **U2 y el cierre de sesión**: el punto obligatorio es `appSession` de `app/src/bootstrap/session.ts`. Usar `signOut` de la superficie por defecto del paquete no mueve la máquina de estados de `App`; conviene que el artefacto funcional de U2 lo nombre.
- **Ruido de consola en las pruebas**: `app-bootstrap.test.tsx` provoca dos `console.warn` del logger (`SESSION_RECORD_INVALID`, `SESSION_READ_FAILED`) al ejercitar los caminos de fallo. Es el comportamiento correcto del logger bajo `__DEV__`, no un fallo.
