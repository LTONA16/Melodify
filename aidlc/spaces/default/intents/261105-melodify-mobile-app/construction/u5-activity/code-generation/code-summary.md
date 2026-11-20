# Resumen de código — U5 `u5-activity`

> Etapa: Code Generation · Unidad: `u5-activity` · Fecha: 2026-11-19
> Metodología: test-after · Estrategia: Standard · Alcance: `mvp`
> Plan aprobado: `code-generation-plan.md` (124 casillas marcadas)

## Qué se construyó

La Actividad completa: un paquete nuevo `@melodify/activity` 1.1.0 que deriva el histórico desde C4 en memoria, las piezas nuevas de `@melodify/design-system` 1.5.0, el mapper, el hook, la vista y el contenedor de la pantalla, y el cableado de arranque con una sola instancia compartida.

| Pieza | Contenido |
|---|---|
| `@melodify/activity` 1.1.0 (nuevo) | Modelos de C8, derivación pura desde C4, orden con desempate por `eventId`, grupos por día natural local, máquina `ActivityFeed` con suscripción perezosa y `retryActivity`, y superficie pública acotada. |
| `@melodify/design-system` 1.5.0 | `ActivityRow` con tres textos literales, icono decorativo, tiempo relativo y fila entera pulsable; `DayHeader` con cabecera pegajosa de 32 pt; `ActivityEventSummary` exportado. |
| `app/src` | `activityModel.ts`, `useActividad`, `ActividadView` y `ActividadScreen`; cuatro estados, aviso sin conexión conservando la lista, apertura del detalle, reintento y diagnóstico acotado. |
| Arranque | `activityFeed` construido una sola vez sobre `contentStore` y `appSession`; ruta real de Actividad con detalle de opinión registrado; retirado el placeholder. |
| Configuración | Mapeo y umbral de `@melodify/activity` en Jest, referencias de TypeScript, regla ESLint de fronteras, y versiones de workspace coherentes. CI sin cambios. |

## Archivos creados y modificados

- **Paquete nuevo**: `packages/activity/` completo (`package.json`, `tsconfig.json`, `src/{index,types,derive,grouping,activity}.ts`, `__tests__/` y `__tests__/activity-fixture.ts`).
- **Diseño**: `packages/design-system/package.json`, `src/{index,models}.ts`, `components/{ActivityRow,DayHeader}.tsx` y sus pruebas.
- **App**: `app/src/state/useActividad.ts`, `app/src/screens/actividad/{activityModel.ts,ActividadView.tsx,ActividadScreen.tsx}` y sus pruebas.
- **Arranque**: `app/src/bootstrap/{instances.ts,App.tsx,logger.ts}`, `app/src/screens/dependencies.ts`, `app/src/bootstrap/__tests__/activity-wiring.test.tsx` y `app/src/state/__tests__/use-actividad.test.tsx`.
- **Retirado**: `app/src/screens/placeholders/ActividadScreen.tsx` (placeholder ya sin uso y con 0 % de cobertura).
- **Configuración**: `package.json` de la raíz, `jest.config.js`, `jest.setup.js` (zona horaria fija de la agrupación), `eslint.config.js`, `tsconfig.json`, `app/tsconfig.json`, `app/package.json`, `package-lock.json` y `packages/design-system/package.json`.
- **Workspace**: `packages/app-shell/package.json` y `packages/spotify/package.json` conservan su declaración de `@melodify/design-system` en `1.4.0`; un `overrides` acotado en la raíz resuelve esa dependencia al workspace `1.5.0` sin registry externo.
- **Correctivo ajeno al comportamiento de U5**: `packages/spotify/src/auth/__tests__/device.test.ts` (normalización de separadores de ruta en Windows).

## Decisiones de implementación (las del plan, verificadas en código)

- `ActivityFeed` no recibe logger ni almacén: su constructor sigue siendo `{ content, session }`. El único código nuevo, `ACTIVITY_LOAD_FAILED`, lo emite `useActividad` con el logger inyectado.
- C8 arranca en `loading` y no lee hasta la primera petición; la primera suscripción abre C3 y C4, y la baja del último observador cierra ambas. `retryActivity()` vuelve a `loading` sobre la misma instancia sin duplicar suscripciones.
- Los listeners que lanzan se aíslan; no cambian el estado y C8 no registra nada.
- `derive.ts` usa `createdAt`, descarta interacciones propias y ajenas, y solo llama a `listLikes`/`listComments` cuando el contador correspondiente es mayor que cero.
- `grouping.ts` ordena por fecha descendente y desempata por `eventId` ascendente, sin prioridad entre tipos; agrupa por el calendario local del dispositivo, calcula «ayer» restando un día natural y no importa C1.
- `activityModel.ts` copia los campos del contrato sin reordenar; la vista no importa C8, C3 ni C4.
- `ActivityRow` pinta los tres textos completos con comillas angulares; `actorHandle` viaja en el modelo pero no se pinta.
- La instancia única vive en `instances.ts`; la pestaña Actividad registra `details: [{ kind: "opinion", component: DetalleOpinionRoute }]`.
- La coherencia del workspace se resuelve con `overrides` en `package.json` de la raíz, limitado a `@melodify/app-shell` y `@melodify/spotify`. Sus declaraciones siguen en `1.4.0`, `package-lock.json` apunta al workspace `1.5.0` y `npm ci --dry-run --offline --ignore-scripts` valida la instalación sin pedir paquetes al registro.
- La prueba de cableado lee el modelo compartido por suscripción, sin llamar a `getActivity` fuera de `act`: comprueba ocho eventos, un grupo por fecha del calendario local, etiquetas no vacías y el mismo orden de eventos en las filas montadas. El ejemplo fijo de cinco días queda afirmado en `grouping.test.ts`; la siembra usa desfases relativos, pero la zona fija en `jest.setup.js` mantiene el número de fechas determinista.

## Pruebas y cobertura

| Comprobación | Resultado final |
|---|---|
| Comando acotado de la unidad (11 rutas exactas, `--coverage=false`) | **11 suites, 68 pruebas, todas en verde** |
| `npm run typecheck` | Sin salida de error, exit 0 |
| `npm run lint` | Sin salida de error, exit 0 |
| `npm test` (suite completa del proyecto) | **97 suites, 826 pruebas, todas en verde** |
| Comando acotado con `--coverage` | **11 suites, 68 pruebas, todas en verde**; exit 1 solo por umbrales globales de archivos ajenos al alcance |

**Cobertura de los árboles de U5** medida en la suite completa: `packages/activity/src` **93,33 %** de líneas (`grouping.ts` **96,96 %**), `app/src/screens/actividad` **100 %**, `packages/design-system/src/components` **98,87 %** (ActivityRow y DayHeader al 100 %) y `app/src/state` **98,65 %**. El suelo de 80 % se cumple sin exclusiones nuevas.

**Nota sobre la corrida acotada con cobertura:** el mismo comando con `--coverage` deja todas las pruebas seleccionadas en verde pero sale distinto de cero únicamente por umbrales globales de archivos ajenos al alcance. Es el caso previsto por `unit-test-instructions.md`; no se bajó, relajó ni desactivó ningún umbral. Build and Test mide el suelo sobre la suite completa, que pasa limpia.

## Pruebas escritas y no ejecutadas en esta etapa

Ninguna. Todas las pruebas de la unidad se ejecutaron en esta etapa.

## Desviaciones del plan

- El ejemplo trabajado y `functional-spec.md` producen **cinco grupos** («Hoy», «Ayer», «17 nov 2026», «16 nov 2026», «15 nov 2026»). El plan y las instrucciones de prueba ya describen cinco, y el caso se afirma en `grouping.test.ts` y `actividad-view.test.tsx`.
- El esqueleto de carga usa `Skeleton shape="row" count={3}` en lugar de `shape="card"`: NFR8.16 y la prueba de vista describen seis bloques de fila, y `row` es la forma con altura de fila. No cambia el estado, los textos ni el número de bloques.
- `initialNumToRender={20}` en la `SectionList` permite que la siembra completa entre en la primera tanda; es una medida de render para que las pruebas vean las ocho filas sin depender del viewport.

## Correcciones durante la generación

| Hallazgo | Qué se corrigió |
|---|---|
| Chip de Spotify en el arranque | `app-spotify-flow.test.tsx` espera ahora el `testID` con `findByTestId`: ver «Para ti» no garantiza que ya llegó la primera emisión del puerto, y el fallo aparecía solo bajo la carga de la suite completa. |
| Declaración de C1 en el workspace | Se restauró `1.4.0` en `packages/app-shell/package.json` y `packages/spotify/package.json`; la raíz añade `overrides` acotados para resolverlos al workspace `1.5.0`, validado con `npm ci --dry-run --offline --ignore-scripts`. |
| Día local y desempate (Q1/Q7) | `grouping.ts` usa el calendario local (con «ayer» por día natural) y `eventId` ascendente a igual instante, sin prioridad por tipo. `jest.setup.js` fija `Europe/Madrid`, y las pruebas de agrupación y cableado comprueban la medianoche local y un cambio de horario. El plan y las instrucciones de prueba se alinearon sin perder las 124 casillas marcadas. |
| Días en el cableado | `activity-wiring.test.tsx` compara el modelo compartido con las filas montadas: ocho eventos, un grupo por fecha del calendario local, etiquetas no vacías y el mismo orden de eventos, sin leer encabezados virtualizados. El caso fijo de cinco días sigue en `grouping.test.ts`. |
| Fronteras de lint en C8 | Las pruebas de `@melodify/activity` usan `packages/activity/src/__tests__/activity-fixture.ts`, un doble local de C4 con solo `import type`; no importan runtime de C4 ni C1. |
| `ActivityView.groups` opcional | `useActividad` normaliza `view.groups ?? []` para que los estados sin grupos no rompan el mapper. |
| Tipos de resultado C4 | La fixture y las pruebas usan `result.ok ? result.value : []` y `failure<T, C extends ContentSuccessCode = 200>`, cumpliendo `strict: true`. |
| TestIDs y texto | Se conservan los `data-testid` del contrato y las cadenas exactas de interfaz; la fila entera es `Pressable` con etiqueta accesible igual al texto completo. |
| Referencias de BR inexistentes | Comentarios de `useActividad`, vista, contenedor y sus pruebas apuntan ahora a BR23 y BR24.1–BR24.4, que son los ID reales de `rules.md`. |
| Prueba de dispositivo en Windows | `packages/spotify/src/auth/__tests__/device.test.ts` normaliza `\\` a `/` antes de comprobar el sufijo `auth/device.ts`. |

## Verificación manual pendiente (no automatizable)

Sigue siendo criterio de terminado de la versión el recorrido en **Expo Go sobre Android físico**: entrada `demo`/`demo`, Actividad con ocho filas y un encabezado por día derivado (cinco en el ejemplo de la especificación), encabezados pegajosos, apertura y vuelta del detalle, publicación nueva sin reiniciar, y aviso sin conexión conservando la lista. Ninguna prueba sustituye ese recorrido.

## Observaciones para la revisión

- No se tocó `.github/workflows/ci.yml`, README, licencia ni archivos personales.
- La corrida final de `npm test` terminó 97 suites y 826 pruebas en verde. `jest.config.js` y los umbrales no cambiaron; `jest.setup.js` solo fija la zona horaria de la agrupación. No se añadieron pragmas de cobertura.
- La nota histórica de `reviews/review-02.md` se conserva sin tocar, como exige la instrucción de no modificar review files; describe el estado anterior del cableado, no el código actual.
- La corrida acotada sin cobertura emite un `console.warn` preexistente de `ports.ts` al resolver el redirect de Spotify; no proviene de código nuevo de U5 ni de C8.
