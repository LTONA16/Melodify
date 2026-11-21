# Instrucciones de prueba de integración — Melodify

> Etapa: Build and Test · Intento: `261105-melodify-mobile-app` · Estrategia: **Standard**
> Fecha: 2026-11-21 · Deriva de `code-generation-plan.md` (§ Testing Contract), `unit-test-instructions.md` y `code-summary.md` de las seis unidades, y de `team.md` § Testing Posture.

## Por qué existe este archivo

La estrategia **Standard** obliga a dos cosas por encima de las pruebas de unidad: **cinco a ocho pruebas por componente** y **pruebas de integración en las fronteras clave**. El Testing Contract de los seis `code-generation-plan.md` lo dice en `obligations.strategy_volume`: «Unit tests plus integration tests for key boundaries».

La suite del proyecto ya contiene esas pruebas de frontera: no se añade una segunda infraestructura ni un runner distinto. Este documento dice **cuáles son**, **cómo se ejecutan solas** y **qué demuestran**.

## Entorno

- **Runner**: el único `jest` del monorepo (`jest.config.js`, preset `jest-expo`), con `jest.setup.js` y el `coverageThreshold` por árbol. No se instala nada.
- **Entorno de ejecución**: **Node con `jest-expo`**, no un navegador. Las pruebas de pantalla montan el árbol de React Native con `@testing-library/react-native`; el `FlatList`, la `SectionList` y los `Pressable` se renderizan en el renderizador de pruebas, no en un motor de navegador ni en un dispositivo. Por eso **nada de lo que sigue es evidencia de navegador ni de extremo a extremo**: es evidencia de integración en Node.
- **Dobles**: `expo-secure-store`, `expo-network`, `expo-web-browser`, `expo-crypto` y las llamadas HTTP a Spotify se sustituyen por dobles. Ninguna prueba sale a la red, ninguna necesita credenciales y ninguna toca el dispositivo.
- **Zona horaria**: `jest.setup.js` fija `Europe/Madrid`, porque la agrupación por día de Actividad depende del calendario local.
- **Datos**: la siembra de C4 (5 autores, 8 obras, 10 opiniones, 4 me gusta, 3 comentarios, 2 seguimientos) es la de todas las pruebas. Cada prueba construye su propia instancia: no hay estado compartido entre suites.

## Las fronteras que se prueban

| Frontera | Suites | Qué demuestra |
|---|---|---|
| Arranque completo → Login → cáscara | `app/src/bootstrap/__tests__/app-bootstrap.test.tsx` | La máquina `arranque / login / inicio` resuelve el recuerdo de sesión, monta la cáscara con las cinco pestañas y la pestaña Crear monta el formulario real, no un placeholder |
| Instancia única de sesión | `app-session-wiring.test.tsx` | `App`, Login y el «Cerrar sesión» de Perfil leen **la misma** instancia: cerrar sesión devuelve la app a Login (R-01 de U1) |
| Instancia única por dominio | `instances.test.ts` | `contentStore`, `catalog`, `connectivity` y `activityFeed` se construyen una vez por arranque |
| Spotify de punta a punta sin red | `app-spotify-flow.test.tsx` | Chip de Inicio → `connecting` → `connected` con el puerto sustituido; el `testID` se espera con `findByTestId` porque ver «Para ti» no garantiza la primera emisión del puerto |
| Actividad sobre el contenido vigente | `activity-wiring.test.tsx` | C8 deriva de C3/C4 la misma lista que pinta la pantalla: ocho eventos, un grupo por fecha local y el mismo orden |
| Hoja de comentarios y snackbar de la cáscara | `sheet-snackbar-mount.test.tsx`, `comments-instance.test.ts` | Una sola hoja y un solo snackbar, provistos por C2 y compartidos por las cuatro pantallas; el controlador es el mismo que ve la cáscara |
| Cáscara: pila que conserva la raíz | `packages/app-shell/src/__tests__/stack.test.tsx` | Abrir un detalle no desmonta la raíz: se oculta con `display: none` y el feed conserva su posición (AC2.3.2) |
| Obra que viaja por la ruta | `work-data.test.tsx` | La obra preseleccionada llega de Explorar a Detalle y a Crear por `data`, con `preselectedWork` por defecto `null` |
| Pantalla ↔ hook ↔ almacén/catálogo | `app/src/screens/*/__tests__/*-screen.test.tsx` | Cada contenedor resuelve sus dependencias inyectadas y refleja los cuatro estados (vacío, carga, error, sin conexión) sin construir instancias |
| Catálogo ↔ puertos de Spotify | `packages/catalog/src/__tests__/catalog.test.ts` | La decisión de portada y la caché se ejercitan contra puertos sustituidos; cero resoluciones sin sesión o sin red (NFR8.14) |

## Cómo se ejecutan

### Las diez suites de frontera, solas

```bash
npx jest --coverage=false --runTestsByPath \
  app/src/bootstrap/__tests__/app-bootstrap.test.tsx \
  app/src/bootstrap/__tests__/app-session-wiring.test.tsx \
  app/src/bootstrap/__tests__/app-spotify-flow.test.tsx \
  app/src/bootstrap/__tests__/activity-wiring.test.tsx \
  app/src/bootstrap/__tests__/comments-instance.test.ts \
  app/src/bootstrap/__tests__/instances.test.ts \
  app/src/bootstrap/__tests__/shell-services.test.ts \
  packages/app-shell/src/__tests__/stack.test.tsx \
  packages/app-shell/src/__tests__/work-data.test.tsx \
  packages/app-shell/src/__tests__/sheet-snackbar-mount.test.tsx
```

**Resultado en esta etapa: 10 suites, 49 pruebas, todas en verde, 16,4 s.**

### La suite completa, que es la puerta

```bash
npm test -- --coverage
```

Aquí es donde se miden los umbrales. Una corrida acotada con `--coverage` puede salir distinta de cero **solo** por umbrales de árboles que el filtro no ejecutó; eso no es un fallo y no se arregla bajando el umbral.

### Una suite de frontera concreta, mientras se depura

```bash
npx jest app/src/bootstrap/__tests__/app-bootstrap.test.tsx
```

## Cobertura esperada

| Ámbito | Objetivo | Quién lo mide |
|---|---|---|
| `app/src/**` | ≥ 80 % de líneas | `npm test -- --coverage`, suite completa |
| Cada `packages/*/src/**` (8 paquetes) | ≥ 80 % de líneas | Ídem, por árbol |
| Estas diez suites | No fijan umbral propio | Aportan cobertura al árbol de la app y al de `app-shell` |

Las pruebas de integración **no** sustituyen a las de unidad ni elevan el suelo: el 80 % se mide por árbol sobre la suite completa y un paquete bien probado no compensa a otro (`jest.config.js` § comentario de `coverageThreshold`).

## Gestión de datos y de entorno

- **Sin red, sin credenciales, sin dispositivo.** Si una prueba de frontera necesitara un client ID real, una cuenta de Spotify o el teléfono, no sería una prueba de integración de esta suite: sería la verificación manual del recorrido.
- **Instancias por prueba.** Cada suite construye sus dobles y su almacén; no hay singletons compartidos entre archivos de prueba.
- **Nada de aserciones vacías.** Una prueba de pantalla que solo comprueba que el componente monta no cuenta; las de esta suite afirman el estado que se pinta (textos literales, número de filas, orden de eventos, llamadas al puerto).
- **Ruido conocido**: `inicio-screen.test.tsx` y `app-bootstrap.test.tsx` emiten avisos de `act`/`VirtualizedList` al montar el `FlatList`. Son ruido del entorno de pruebas; ninguna aserción depende de ellos.

## Lo que estas pruebas no pueden demostrar

Ninguna de estas suites demuestra el recorrido real: ni el arranque en frío de 2 s (NFR8.1), ni los gestos, ni las áreas táctiles al dedo, ni la conexión real con Spotify, ni el modo avión. Eso es **verificación manual en Expo Go sobre Android físico** y vive en `walkthrough-p1.md`…`walkthrough-p4.md`. Presentar estas suites como evidencia de navegador o de extremo a extremo sería incorrecto: corren en Node.
