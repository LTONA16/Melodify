# Instrucciones de prueba de la unidad — U5 `u5-activity`

> **Provenance**: deriva de `nfr-requirements/tech-stack-decisions.md` (TS-39…TS-43), `nfr-requirements/security-requirements.md` (NFR9.8), `nfr-design/security-design.md`, `nfr-design/performance-design.md`, `functional-design/functional-spec.md` § Textos exactos y § Máquina de estados, `functional-design/rules.md` (BR21–BR24) y el `## Testing Contract` de `code-generation-plan.md` (test-after, Standard, mvp).
> Fecha: 2026-11-19. Etapa: Code Generation · Unidad: `u5-activity`.

## Qué corre esta unidad

| Pieza | Decisión |
|---|---|
| Runner | Jest con preset `jest-expo`, un solo proyecto en la raíz (`jest.config.js`). Se amplía con el mapeo de `@melodify/activity` y su umbral de cobertura. |
| Render | `@testing-library/react-native`, consultando por texto completo, rol accesible y `data-testid`. |
| Paquetes tocados | `@melodify/activity` 1.1.0 (nuevo), `@melodify/design-system` 1.5.0 y `@melodify/app`. C2, C3, C4 y C6 no cambian. |
| Estrategia | **test-after**: se implementa una capa y después se escriben y ejecutan sus pruebas antes de pasar a la siguiente. |
| Volumen | Standard: 5–8 pruebas por componente, más integraciones ligeras en C8, el hook, el contenedor y el arranque. |
| Frontera | Ninguna prueba sale a la red, usa credenciales, sesión real de Spotify ni reloj de la máquina sin inyectar. La zona de la agrupación se fija en `jest.setup.js`. |

## Comando exacto de esta unidad

Comando de descubrimiento, ejecutable antes de que existan las pruebas nuevas:

```bash
npx jest --config jest.config.js --coverage=false --passWithNoTests --listTests --testPathPattern='(packages/activity|activity-row|day-header|use-actividad|activity-model|actividad-view|actividad-screen|activity-wiring)'
```

Comando agregado de esta unidad, con rutas exactas (sin `npm test` suelto):

```bash
npx jest --config jest.config.js --coverage=false --runTestsByPath \
  packages/activity/src/__tests__/types.test.ts \
  packages/activity/src/__tests__/derive.test.ts \
  packages/activity/src/__tests__/grouping.test.ts \
  packages/activity/src/__tests__/activity.test.ts \
  packages/design-system/src/__tests__/activity-row.test.tsx \
  packages/design-system/src/__tests__/day-header.test.tsx \
  app/src/state/__tests__/use-actividad.test.tsx \
  app/src/screens/actividad/__tests__/activity-model.test.ts \
  app/src/screens/actividad/__tests__/actividad-view.test.tsx \
  app/src/screens/actividad/__tests__/actividad-screen.test.tsx \
  app/src/bootstrap/__tests__/activity-wiring.test.tsx
```

**Con cobertura**, el mismo alcance en un comando aparte:

```bash
npx jest --config jest.config.js --coverage --runTestsByPath \
  packages/activity/src/__tests__/types.test.ts \
  packages/activity/src/__tests__/derive.test.ts \
  packages/activity/src/__tests__/grouping.test.ts \
  packages/activity/src/__tests__/activity.test.ts \
  packages/design-system/src/__tests__/activity-row.test.tsx \
  packages/design-system/src/__tests__/day-header.test.tsx \
  app/src/state/__tests__/use-actividad.test.tsx \
  app/src/screens/actividad/__tests__/activity-model.test.ts \
  app/src/screens/actividad/__tests__/actividad-view.test.tsx \
  app/src/screens/actividad/__tests__/actividad-screen.test.tsx \
  app/src/bootstrap/__tests__/activity-wiring.test.tsx
```

### Comandos por capa, para el ciclo corto

| Capa | Comando |
|---|---|
| Descubrir el alcance | `npx jest --config jest.config.js --coverage=false --passWithNoTests --listTests --testPathPattern='(packages/activity|activity-row|day-header|use-actividad|activity-model|actividad-view|actividad-screen|activity-wiring)'` |
| Modelos | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/activity/src/__tests__/types.test.ts` |
| Derivación | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/activity/src/__tests__/derive.test.ts` |
| Orden y agrupación | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/activity/src/__tests__/grouping.test.ts` |
| Máquina C8 | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/activity/src/__tests__/activity.test.ts` |
| C1 1.5.0 | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/design-system/src/__tests__/activity-row.test.tsx packages/design-system/src/__tests__/day-header.test.tsx` |
| Hook | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/state/__tests__/use-actividad.test.tsx` |
| Mapa y vista | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/screens/actividad/__tests__/activity-model.test.ts app/src/screens/actividad/__tests__/actividad-view.test.tsx` |
| Contenedor | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/screens/actividad/__tests__/actividad-screen.test.tsx` |
| Arranque e integración | `npx jest --config jest.config.js --coverage=false --runTestsByPath app/src/bootstrap/__tests__/activity-wiring.test.tsx` |
| Un archivo concreto | `npx jest --config jest.config.js --coverage=false --runTestsByPath packages/activity/src/__tests__/grouping.test.ts` |

## Expected coverage targets

- El suelo es **80 % de líneas por árbol** para `app/src/**` y `packages/*/src/**`. U5 añade `"./packages/activity/src/**": { "lines": 80 }` a `coverageThreshold`; ningún umbral existente se baja, se relaja o se desactiva.
- Build and Test mide el suelo sobre la **suite completa del proyecto**. Un comando acotado con `--coverage` puede salir distinto de cero sólo por un umbral global con todas las pruebas seleccionadas en verde: se registra en `code-summary.md`, no se considera prueba rota y no se toca la configuración para forzarlo.
- El comando con cobertura va solo, sin ningún paso posterior que un umbral pueda detener. Las puertas finales del proyecto son `npm run typecheck`, `npm run lint` y `npm test`.
- No se añaden pragmas de ignición de cobertura: la lógica de C8, el mapper, el hook y la vista son código de esta unidad y deben medirse.

## Configuración

- `jest.config.js`: añadir `"^@melodify/activity$": "<rootDir>/packages/activity/src"` a `moduleNameMapper` y `"./packages/activity/src/**": { "lines": 80 }` a `coverageThreshold`; mantener `preset`, `testMatch`, `setupFilesAfterEnv`, `testTimeout: 20000` y los umbrales existentes.
- `jest.setup.js`: fija `process.env.TZ = "Europe/Madrid"` antes de cargar módulos, para que el calendario local de la agrupación sea el mismo en todos los runners. No se añade un doble global que oculte una frontera; C3, C4, C8 y el logger se doblan en cada prueba.
- `tsconfig.json` y `app/tsconfig.json`: añadir la referencia a `packages/activity`; `packages/activity/tsconfig.json` extiende `tsconfig.base.json` y no declara referencias a C1, C5 ni C7.
- `eslint.config.js`: añadir una regla para `packages/activity/src/**` que prohíba `react`, `@melodify/design-system`, `@melodify/catalog`, `@melodify/spotify` y `**/app/**`; C3 y C4 se permiten sólo con `allowTypeImports: true`.
- `package.json` de `app`: `@melodify/design-system: "1.5.0"` y `@melodify/activity: "1.1.0"`. `packages/app-shell/package.json` mantiene `1.4.0`.

## Dobles y datos de prueba

| Qué se dobla | Cómo | Regla |
|---|---|---|
| Sesión C3 | `subscribeSession(listener)` emite un `SessionView` fijo; se puede forzar `signedOut` y un cambio de cuenta | C8 no construye sesión real ni asume `demo` |
| Contenido C4 | Doble con `listOpinions`, `listLikes`, `listComments` y `subscribeContent(viewerId, listener)` | `subscribeContent` emite una vez al suscribirse y devuelve `{ ok: true, code: 200, value: unsubscribe }`; los fallos son `ok: false` |
| Reloj | `now` inyectado en la derivación y en la agrupación, fijado en `"2026-11-19T12:00:00.000Z"`; zona fija `Europe/Madrid` en `jest.setup.js` | «Hoy» y «Ayer» son fechas del calendario local; ninguna prueba usa `new Date()` sin argumento ni depende de la zona del runner |
| Actividad C8 | Doble con `getActivity`, `retryActivity` y `subscribeActivity(listener)` | Emite la vista vigente al suscribirse; expone la baja; puede emitir `error` para el hook |
| Logger | Espía con la firma `(code, message)` | Sólo `ACTIVITY_LOAD_FAILED`, con el mensaje fijo `"No se pudo derivar la actividad"`; sin títulos, `eventId`, handles ni códigos de C4 |
| Servicios de cáscara | Contextos doblados con `openOpinionDetail`, `goToTab` y `network.subscribe` | La vista no conoce la cáscara; el contenedor comprueba las llamadas |
| Offline | Doble de red que cambia `online` a `false` | La lista sigue visible; no se convierte en `error` |

Datos fijos para la derivación: autor `demo`, opiniones propias `op-001`, `op-004` y `op-008`; me gusta recibidos de `lucia` sobre `op-001` y de `ana` sobre `op-004`; comentarios recibidos de `ana` en `op-001`, `bruno` en `op-004` y `lucia` en `op-008`; dos me gusta ajenos sobre opiniones ajenas que deben descartarse. Los identificadores esperados son `own:<opinionId>`, `like:<opinionId>:<authorId>` y `comment:<commentId>`. Los textos se comparan completos: «Publicaste tu opinión de «{título}»», «A alguien le gustó tu opinión de «{título}»», «Comentaron tu opinión de «{título}»», «Hoy», «Ayer», «16 nov 2026», «Todavía no hay actividad.», «Crear opinión», «No pudimos cargar tu actividad.», «Reintentar» y «Sin conexión. Estás viendo lo último que cargamos.»

## Qué debe quedar probado por capa

| Capa | Pruebas |
|---|---|
| Modelos | Cuatro estados, tres clases, `groups` opcional y `actorHandle?` sin campos de contenido. |
| Derivación | Ocho eventos de la siembra, exclusión de interacciones propias y ajenas, contadores que evitan lecturas, fechas de creación y fallos de C4 sin lanzar. |
| Orden y agrupación | Orden exacto con empates por `eventId`, grupos por día natural local con etiquetas «Hoy»/«Ayer»/fecha, límite de medianoche y cambio de horario. |
| C8 | `loading` inicial, emisión al suscribirse, `ready`/`empty`/`error`, recálculo tras escritura, reintento, cambio de cuenta y aislamiento de listeners. |
| C1 1.5.0 | Tres textos literales, iconos decorativos, tiempo relativo, fila pulsable y cabeceras de día. |
| Mapa | Copia total de grupos y eventos, sin reordenar ni inventar textos. |
| Hook | Traducción de estados, baja al desmontar, `retry` y un `ACTIVITY_LOAD_FAILED` por intento fallido; ninguno en `ready`/`empty`. |
| Vista | Cuatro estados con textos completos, dos grupos de esqueleto, `SectionList` pegajosa, clave por `eventId`, aviso offline y callbacks. |
| Contenedor y arranque | Instancia única, sin feed propio, cableado de detalle/vacío/reintento, integración con la semilla real y ausencia de imports prohibidos en C8. |

## Fuera del alcance automático

El recorrido real en Expo Go sobre Android físico sigue siendo verificación manual y criterio de terminado de la versión: entrada `demo`/`demo`, ocho filas en Actividad, encabezados pegajosos, apertura del detalle y vuelta, publicación nueva sin reiniciar y aviso sin conexión. Ninguna prueba sustituye ese recorrido.

## Pruebas que no valen

Nada de aserciones que siempre pasan, ni pruebas de pantalla que sólo comprueban que el componente monta sin mirar el estado afirmado. Una prueba de texto compara la cadena completa. Una prueba de «recálculo» que no dispara una escritura de C4 no demuestra BR23.5. Una prueba de «offline» que no cambia el doble de red no demuestra BR23.4. Una prueba de diagnóstico que no comprueba el código, el mensaje fijo y la ausencia de datos de contenido no demuestra NFR9.8.
