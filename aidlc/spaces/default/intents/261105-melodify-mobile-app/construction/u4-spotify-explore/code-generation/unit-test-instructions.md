# Instrucciones de prueba de la unidad — U4 `u4-spotify-explore`

> **Provenance**: deriva de `nfr-requirements/tech-stack-decisions.md` (TS-31…TS-38, más TS-01, TS-05, TS-13, TS-16…TS-21 y TS-29 heredados), `nfr-requirements/security-requirements.md` (NFR3.17–3.20, NFR4.9–4.10, NFR9.7), `nfr-requirements/performance-requirements.md` (NFR1.12–1.15, NFR2.10–2.12, NFR8.12–8.15), `nfr-design/security-design.md`, `nfr-design/performance-design.md`, `functional-design/functional-spec.md` § Textos exactos, `team.md` § Testing Posture y el `## Testing Contract` de `code-generation-plan.md` (test-after, Standard, mvp).
> Fecha: 2026-11-18. Etapa: Code Generation · Unidad: `u4-spotify-explore`.

## Qué corre esta unidad

| Pieza | Decisión |
|---|---|
| Runner | Jest con preset `jest-expo`, un solo proyecto en la raíz (`jest.config.js`). Se amplía con los tres mapeos de `@melodify/spotify`. |
| Render | `@testing-library/react-native`, consultando por texto, rol accesible y `data-testid`. |
| Paquetes tocados | `@melodify/spotify` 1.0.0 (nuevo), `@melodify/design-system` 1.4.0, `@melodify/app-shell` 1.4.0 y `@melodify/catalog` 1.2.0. |
| Estrategia | **test-after**: se implementa una capa y después se escriben y ejecutan sus pruebas antes de pasar a la siguiente. |
| Volumen | Standard: 5–8 pruebas por componente, más integraciones ligeras en catálogo, hooks, arranque y Explorar. |
| frontera de red | Ninguna prueba sale a la red, usa credenciales reales ni necesita cuenta de Spotify. |

## Comando exacto de esta unidad

Comando de descubrimiento, ejecutable antes de que existan las pruebas nuevas:

```bash
npx jest --config jest.config.js --coverage=false --passWithNoTests --listTests --testPathPattern='(packages/spotify|spotify-card|artist-result-row|cover-art|work-result-row|app-shell|stack|create-entry|create-close|bootstrap|use-work-search|explorar|inicio|perfil|detalle-obra|crear)'
```

Comando agregado de esta unidad, con rutas exactas (sin `npm test` suelto):

```bash
npx jest --config jest.config.js --coverage=false --runTestsByPath \
  packages/spotify/src/__tests__/http.test.ts \
  packages/spotify/src/__tests__/spotify-log-port.test.ts \
  packages/spotify/src/auth/__tests__/device.test.ts \
  packages/spotify/src/auth/__tests__/pkce.test.ts \
  packages/spotify/src/auth/__tests__/token.test.ts \
  packages/spotify/src/auth/__tests__/spotify-auth.test.ts \
  packages/spotify/src/catalog/__tests__/spotify-catalog.test.ts \
  packages/design-system/src/__tests__/spotify-card.test.tsx \
  packages/design-system/src/__tests__/artist-result-row.test.tsx \
  packages/design-system/src/__tests__/cover-art.test.tsx \
  packages/design-system/src/__tests__/work-result-row.test.tsx \
  packages/design-system/src/__tests__/components.test.tsx \
  packages/app-shell/src/__tests__/stack.test.tsx \
  packages/app-shell/src/__tests__/app-shell.test.tsx \
  packages/app-shell/src/__tests__/create-entry.test.tsx \
  packages/app-shell/src/__tests__/create-close.test.tsx \
  packages/app-shell/src/__tests__/sheet-snackbar-mount.test.tsx \
  packages/catalog/src/__tests__/catalog.test.ts \
  packages/catalog/src/__tests__/index.test.ts \
  app/src/state/__tests__/use-work-search.test.ts \
  app/src/state/__tests__/use-spotify-connection.test.tsx \
  app/src/screens/explorar/__tests__/explorar-view.test.tsx \
  app/src/screens/explorar/__tests__/explorar-screen.test.tsx \
  app/src/screens/inicio/__tests__/inicio-screen.test.tsx \
  app/src/screens/inicio/__tests__/inicio-view.test.tsx \
  app/src/screens/perfil/__tests__/perfil-screen.test.tsx \
  app/src/screens/perfil/__tests__/perfil-view.test.tsx \
  app/src/screens/detalle-obra/__tests__/detalle-obra-screen.test.tsx \
  app/src/screens/detalle-obra/__tests__/detalle-obra-view.test.tsx \
  app/src/screens/crear/__tests__/crear-screen.test.tsx \
  app/src/screens/crear/__tests__/use-crear.test.ts \
  app/src/screens/crear/__tests__/crear-view.test.tsx \
  app/src/bootstrap/__tests__/ports.test.ts \
  app/src/bootstrap/__tests__/instances.test.ts \
  app/src/bootstrap/__tests__/shell-services.test.ts \
  app/src/bootstrap/__tests__/logger.test.ts \
  app/src/bootstrap/__tests__/app-bootstrap.test.tsx \
  app/src/bootstrap/__tests__/app-session-wiring.test.tsx \
  app/src/bootstrap/__tests__/harness.test.tsx \
  app/src/bootstrap/__tests__/comments-instance.test.ts
```

**Con cobertura**, el mismo alcance en un comando aparte:

```bash
npx jest --config jest.config.js --coverage --runTestsByPath \
  packages/spotify/src/__tests__/http.test.ts \
  packages/spotify/src/__tests__/spotify-log-port.test.ts \
  packages/spotify/src/auth/__tests__/device.test.ts \
  packages/spotify/src/auth/__tests__/pkce.test.ts \
  packages/spotify/src/auth/__tests__/token.test.ts \
  packages/spotify/src/auth/__tests__/spotify-auth.test.ts \
  packages/spotify/src/catalog/__tests__/spotify-catalog.test.ts \
  packages/design-system/src/__tests__/spotify-card.test.tsx \
  packages/design-system/src/__tests__/artist-result-row.test.tsx \
  packages/design-system/src/__tests__/cover-art.test.tsx \
  packages/design-system/src/__tests__/work-result-row.test.tsx \
  packages/design-system/src/__tests__/components.test.tsx \
  packages/app-shell/src/__tests__/stack.test.tsx \
  packages/app-shell/src/__tests__/app-shell.test.tsx \
  packages/app-shell/src/__tests__/create-entry.test.tsx \
  packages/app-shell/src/__tests__/create-close.test.tsx \
  packages/app-shell/src/__tests__/sheet-snackbar-mount.test.tsx \
  packages/catalog/src/__tests__/catalog.test.ts \
  packages/catalog/src/__tests__/index.test.ts \
  app/src/state/__tests__/use-work-search.test.ts \
  app/src/state/__tests__/use-spotify-connection.test.tsx \
  app/src/screens/explorar/__tests__/explorar-view.test.tsx \
  app/src/screens/explorar/__tests__/explorar-screen.test.tsx \
  app/src/screens/inicio/__tests__/inicio-screen.test.tsx \
  app/src/screens/inicio/__tests__/inicio-view.test.tsx \
  app/src/screens/perfil/__tests__/perfil-screen.test.tsx \
  app/src/screens/perfil/__tests__/perfil-view.test.tsx \
  app/src/screens/detalle-obra/__tests__/detalle-obra-screen.test.tsx \
  app/src/screens/detalle-obra/__tests__/detalle-obra-view.test.tsx \
  app/src/screens/crear/__tests__/crear-screen.test.tsx \
  app/src/screens/crear/__tests__/use-crear.test.ts \
  app/src/screens/crear/__tests__/crear-view.test.tsx \
  app/src/bootstrap/__tests__/ports.test.ts \
  app/src/bootstrap/__tests__/instances.test.ts \
  app/src/bootstrap/__tests__/shell-services.test.ts \
  app/src/bootstrap/__tests__/logger.test.ts \
  app/src/bootstrap/__tests__/app-bootstrap.test.tsx \
  app/src/bootstrap/__tests__/app-session-wiring.test.tsx \
  app/src/bootstrap/__tests__/harness.test.tsx \
  app/src/bootstrap/__tests__/comments-instance.test.ts
```

### Comandos por capa, para el ciclo corto

| Capa | Comando |
|---|---|
| Descubrir el alcance | `npx jest --config jest.config.js --coverage=false --passWithNoTests --listTests --testPathPattern='(packages/spotify|spotify-card|artist-result-row|cover-art|work-result-row|app-shell|stack|create-entry|create-close|bootstrap|use-work-search|explorar|inicio|perfil|detalle-obra|crear)'` |
| Modelo y repositorio Spotify | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/spotify/src/__tests__/http.test.ts packages/spotify/src/__tests__/spotify-log-port.test.ts packages/spotify/src/auth/__tests__/device.test.ts packages/spotify/src/auth/__tests__/pkce.test.ts packages/spotify/src/auth/__tests__/token.test.ts` |
| Autorización | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/spotify/src/auth/__tests__/spotify-auth.test.ts` |
| Catálogo Spotify | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/spotify/src/catalog/__tests__/spotify-catalog.test.ts` |
| Diseño | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/design-system/src/__tests__/spotify-card.test.tsx packages/design-system/src/__tests__/artist-result-row.test.tsx packages/design-system/src/__tests__/cover-art.test.tsx packages/design-system/src/__tests__/work-result-row.test.tsx packages/design-system/src/__tests__/components.test.tsx` |
| Cáscara | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/app-shell/src/__tests__/stack.test.tsx packages/app-shell/src/__tests__/app-shell.test.tsx packages/app-shell/src/__tests__/create-entry.test.tsx packages/app-shell/src/__tests__/create-close.test.tsx packages/app-shell/src/__tests__/sheet-snackbar-mount.test.tsx` |
| Catálogo de ejemplo | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/catalog/src/__tests__/catalog.test.ts packages/catalog/src/__tests__/index.test.ts` |
| Hooks | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/state/__tests__/use-work-search.test.ts app/src/state/__tests__/use-spotify-connection.test.tsx` |
| Explorar | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/screens/explorar/__tests__/explorar-view.test.tsx app/src/screens/explorar/__tests__/explorar-screen.test.tsx` |
| Cuatro pantallas restantes | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/screens/inicio/__tests__/inicio-screen.test.tsx app/src/screens/inicio/__tests__/inicio-view.test.tsx app/src/screens/perfil/__tests__/perfil-screen.test.tsx app/src/screens/perfil/__tests__/perfil-view.test.tsx app/src/screens/detalle-obra/__tests__/detalle-obra-screen.test.tsx app/src/screens/detalle-obra/__tests__/detalle-obra-view.test.tsx app/src/screens/crear/__tests__/crear-screen.test.tsx app/src/screens/crear/__tests__/use-crear.test.ts app/src/screens/crear/__tests__/crear-view.test.tsx` |
| Arranque e integración | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/bootstrap/__tests__/ports.test.ts app/src/bootstrap/__tests__/instances.test.ts app/src/bootstrap/__tests__/shell-services.test.ts app/src/bootstrap/__tests__/logger.test.ts app/src/bootstrap/__tests__/app-bootstrap.test.tsx app/src/bootstrap/__tests__/app-session-wiring.test.tsx app/src/bootstrap/__tests__/harness.test.tsx app/src/bootstrap/__tests__/comments-instance.test.ts` |
| Un archivo concreto | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/spotify/src/auth/__tests__/pkce.test.ts` |

## Expected coverage targets

- El suelo es **80 % de líneas por árbol** para `app/src/**`, `packages/spotify/src/**`, `packages/design-system/src/**`, `packages/app-shell/src/**`, `packages/catalog/src/**` y el resto de paquetes ya configurados.
- U4 añade `"./packages/spotify/src/**": { "lines": 80 }` a `coverageThreshold`; ningún umbral existente se baja, se relaja o se desactiva.
- Build and Test mide el suelo sobre la **suite completa del proyecto**. Un comando acotado con `--coverage` puede salir distinto de cero sólo por un umbral global con todas las pruebas seleccionadas en verde: se registra en `code-summary.md`, no se considera prueba rota y no se toca la configuración para forzarlo.
- El comando con cobertura va solo, sin ningún paso posterior que un umbral pueda detener. Las puertas finales del proyecto son `npm run typecheck`, `npm run lint` y `npm test`.

## Configuración

- `jest.config.js`: añadir los mapeos `^@melodify/spotify$`, `^@melodify/spotify/auth$` y `^@melodify/spotify/catalog$` a sus carpetas `src`, `src/auth` y `src/catalog`; mantener `preset: "jest-expo"`, `testMatch`, `setupFilesAfterEnv`, `testTimeout: 20000` y los umbrales existentes.
- `jest.setup.js`: conservar los dobles de `expo-splash-screen` y `expo-secure-store`; U4 no añade un doble global que oculte una frontera. Los adaptadores de Expo se doblan en `device.test.ts` y el resto usa puertos inyectados.
- `tsconfig.json` y `app/tsconfig.json`: añadir la referencia al paquete Spotify. `packages/spotify/tsconfig.json` referencia `@melodify/design-system`.
- `eslint.config.js`: permitir `expo-secure-store`, `expo-web-browser`, `expo-crypto` y `makeRedirectUri` sólo en `packages/spotify/src/auth/device.ts`; el resto de `packages/spotify/src/**` sigue sin imports de dispositivo.
- `.env.example`: `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` sin valores secretos. Ningún `client_secret`.

## Dobles y datos de prueba

| Qué se dobla | Cómo | Regla |
|---|---|---|
| `fetch` | Función que devuelve `Response`-like con `ok`, `status` y `json()` | URLs y headers se comprueban; nunca se llama a la red |
| Secure store | Adaptador en memoria con `getItem`, `setItem`, `deleteItem` | Se puede forzar lectura, guardado o borrado fallido |
| Navegador | Adaptador con `openAuthSessionAsync` que devuelve `success` con `state`/`code` o `cancel`/`error` | La URL devuelta nunca se registra |
| Crypto | Adaptador con bytes deterministas para verifier y `state` | El vector RFC 7636 usa valores fijos, no aleatoriedad real |
| Reloj | `clock.now()` fijo en `"2026-11-18T09:00:00.000Z"` | Ninguna prueba usa `new Date()` sin argumento |
| Conectividad | Doble booleano para `useNetwork` | `offline` se demuestra cambiando el doble |
| Sesión de Spotify | Doble con `getState`, `subscribe`, `connect`, `disconnect`, `retry`, `getAccessToken` | No se construye una sesión real ni se guarda un token real |
| Logger | Espía con la firma `(code, message)` | Se comprueba el código literal; se prohíbe token, verifier, `state`, código, URL de retorno, query y textos de opinión |
| Temporizadores | `jest.useFakeTimers()` en `useWorkSearch` | Avanzar 400 ms con `jest.advanceTimersByTime`, nunca esperas reales |

Datos fijos: `clientId = "test-client"`, `redirectUri = "exp://127.0.0.1:8081/--/spotify-callback"`, token con `accessToken`, `refreshToken`, `expiresAt`, `obtainedAt`; respuesta de búsqueda con un track válido, un álbum válido, un artista válido y entradas incompletas que deben descartarse. Los textos se comparan completos: «Busca en todo Spotify», «Conecta tu cuenta para buscar en el catálogo completo. Mientras tanto, estas obras del catálogo de ejemplo también se pueden opinar.», «Conectar con Spotify», «Conectando…», «Conectado», «Conectado con tu cuenta.», «Desconectar», «Sin conectar», «Conecta para ver portadas y buscar en el catálogo completo.», «No pudimos conectar con Spotify.», «Reintentar», «Tu sesión de Spotify caducó. Vuelve a conectar.», «Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.», «Volver a conectar», «La conexión con Spotify no está configurada en esta instalación.», «Sin conexión. No podemos buscar en Spotify ahora mismo.», «Artista», «Canción», «Álbum», «Conectado»/«Conectar» en Inicio, «No pudimos actualizar las portadas.» y «Spotify desconectado».

## Qué debe quedar probado por capa

| Capa | Pruebas |
|---|---|
| Modelo y token | Seis estados, cuatro campos del token, clave exacta, validación, expiración y `SpotifyLogPort` sin logger implícito. |
| Repositorio | URL exacta, codificación, timeout de 10 s, sin reintento, `workId` inválido, mapeo de `401`/`429`/timeout/red/`5xx`, redirect por entorno y aislamiento de imports de Expo. |
| Autorización | PKCE RFC 7636, verifier y challenge, `state` rechazado, body sin secreto, hidratación neutral, `notConfigured`, `connecting` siempre resuelve, renovación single-flight, borrado según regla y `retry`. |
| Catálogo Spotify | Búsqueda con `Bearer`, mapeo y orden, `resolve` track/álbum, entradas incompletas y `markInvalid()` en `401`. |
| C1 | Seis estados de `SpotifyCard`, «Conectando…» deshabilitado, reintento, artista con «Artista», `kind` con «Canción»/«Álbum» y portada rota con inicial. |
| C2 | `data` conservado en detalle y Crear, `preselectedWork` sobre `preselectedWorkId`, llamadas antiguas sin `data`. |
| C5 | Artistas cacheados y propagados, `workKind`, una sola resolución compartida, cero resoluciones sin sesión u offline, fallback de portada. |
| Hooks | Hook de conexión nullable antes de la primera emisión; búsqueda con 2 caracteres, 400 ms, descartes, `offline`, `artists`, `empty`, `clear` y `retry`. |
| Explorar | Todos los estados, sin campo sin sesión, `invalidToken` sin sugerencias y sin búsquedas, cinco skeletons, reintento, artista y apertura de detalle con `data`. |
| Otras pantallas | Chip de Inicio, tarjeta de Perfil, precedencia de catálogo sobre `data` en detalle, y preselección en Crear. |
| Arranque | Un solo auth y un solo catálogo, redirect registrado una vez, servicios reales en la cáscara y Explorar real registrado. |

## Fuera del alcance automático

El recorrido real en Expo Go sobre Android físico sigue siendo verificación manual y criterio de terminado de la versión: seis pantallas sin sesión y con sesión, login `demo`/`demo`, persistencia del token tras reinicio, conexión y desconexión, búsqueda real de canciones/álbumes/artistas, portadas rotas y sin conexión. Ninguna prueba demuestra la latencia en dispositivo ni sustituye ese recorrido.

## Pruebas que no valen

Nada de aserciones que siempre pasan, ni pruebas de pantalla que sólo comprueban que el componente monta sin mirar el estado afirmado. Una prueba de texto exacto compara la cadena completa. Una prueba de temporizador que no avance el reloj falso no demuestra el debounce. Una prueba de red que no compruebe URL/headers no demuestra la integración. Una prueba de «offline» que no cambie el doble no demuestra el estado.
