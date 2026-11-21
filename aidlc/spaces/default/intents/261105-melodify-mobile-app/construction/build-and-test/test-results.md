# Resultados de construcción y pruebas — Melodify

> Etapa: Build and Test · Intento: `261105-melodify-mobile-app` · Fecha: 2026-11-21
> Rama: `develop` · Commit de partida: `90e003f` · Entorno: Windows, Node `v24.21.0`, npm `11.19.0`
> Comandos ejecutados desde la raíz del repositorio, en este orden y sobre este árbol de trabajo.

## Estado de la construcción

**La construcción pasa.** El workspace se resolvió, el TypeScript compila entre los nueve paquetes y las tres compuertas del CI están en verde.

No hay artefacto de release que construir: en esta versión «construir» es resolver el workspace, compilar los tipos con `tsc -b` y servir el bundle con Metro (ver `build-instructions.md`). No hay EAS, ni firma, ni tienda.

### Preparación del entorno

| Paso | Comando | Resultado |
|---|---|---|
| Enlaces del workspace | `npm install` | `added 8 packages, and audited 1062 packages in 44s` — restaura los enlaces `node_modules/@melodify/*`. Sin cambios en archivos versionados |
| Estado de git antes/después | `git status --porcelain` | Solo el shard de auditoría del motor (`aidlc/.../audit/*.md`); ningún `package.json` ni `package-lock.json` modificado |

El estado inicial del árbol tenía los enlaces del workspace perdidos: `typecheck` fallaba con `TS2307: Cannot find module '@melodify/activity'` en cuatro archivos y `lint` con `import/no-unresolved`. Es el problema ya documentado en el cierre de `u6-walkthrough`, y se reparó con `npm install`, no tocando configuración.

## Resultados de las pruebas

| Comprobación | Comando | Exit | Resultado |
|---|---|---|---|
| Compilación de tipos | `npm run typecheck` | **0** | Sin salida de error (`tsc -b` sobre las referencias de proyecto) |
| Lint y fronteras | `npm run lint` | **0** | `0 problems (0 errors, 0 warnings)` |
| Suite completa con cobertura | `npm test -- --coverage` | **0** | **97 suites, 826 pruebas, 0 fallos, 0 omitidas, 58,9 s** |
| Pruebas de integración de frontera | `npx jest --coverage=false --runTestsByPath <10 rutas>` | **0** | **10 suites, 49 pruebas, 0 fallos, 16,4 s** |

Totales de la suite completa: **97/97 suites** y **826/826 pruebas** en verde. Cero capturas (`0 snapshots`), cero suites omitidas.

### Comandos acotados de las unidades

No se re-ejecutaron los comandos acotados de U1–U6: sus resultados están en el `code-summary.md` de cada unidad y sus comandos son subconjuntos de la suite completa que sí se ejecutó aquí. Cuando un comando acotado sale distinto de cero **solo** por umbrales globales de archivos fuera de su alcance, con todas sus pruebas en verde, el caso ya está registrado en cada `unit-test-instructions.md` y no es un fallo: el suelo se juzga sobre la suite completa, que aquí pasa limpia.

## Cobertura

Medida con `npm test -- --coverage` sobre la suite completa, agregada desde `coverage/lcov.info` por árbol de umbral (`jest.config.js` § `coverageThreshold`).

| Árbol | Líneas cubiertas / totales | % líneas | Umbral | Veredicto |
|---|---|---|---|---|
| `app/src/**` | 840 / 871 | **96,44 %** | 80 % | ✅ |
| `packages/design-system/src/**` | 236 / 239 | **98,74 %** | 80 % | ✅ |
| `packages/activity/src/**` | 154 / 165 | **93,33 %** | 80 % | ✅ |
| `packages/app-shell/src/**` | 133 / 141 | **94,33 %** | 80 % | ✅ |
| `packages/app-session/src/**` | 90 / 90 | **100,00 %** | 80 % | ✅ |
| `packages/content-store/src/**` | 223 / 227 | **98,24 %** | 80 % | ✅ |
| `packages/catalog/src/**` | 121 / 133 | **90,98 %** | 80 % | ✅ |
| `packages/connectivity/src/**` | 39 / 40 | **97,50 %** | 80 % | ✅ |
| `packages/spotify/src/**` | 308 / 345 | **89,28 %** | 80 % | ✅ |
| **Total del proyecto** | 2144 / 2251 | **95,24 %** | — | — |

Los nueve árboles superan el suelo. **No se bajó, relajó ni desactivó ningún umbral**, y no se añadieron exclusiones de cobertura.

El árbol de Spotify es el más ajustado (89,28 %); su parte de catálogo está en 83,14 % y la de autorización en 90,39 %, ambas por encima del 80 %.

## Detalle de fallos

**Ningún comando falló y ninguna prueba falló.** No hay traza que reportar.

Lo que sí queda **sin demostrar** son cinco objetivos que exigen un Android físico y que ninguna prueba de esta etapa puede producir:

| Objetivo | Por qué no se puede demostrar aquí | Dónde queda |
|---|---|---|
| NFR8.1 — arranque en frío ≤ 2 s (mediana de tres, con y sin sesión) | Necesita Expo Go ya abierto, el paquete cargado y un cronómetro de mano; Metro en el ordenador no mide el arranque del teléfono | `construction/u6-walkthrough/code-generation/walkthrough-p1.md` |
| NFR1.1 / NFR1.4 / NFR1.9 / NFR1.16 / NFR1.19 / NFR1.20 — el recorrido no cierra ni deja pantallas en blanco | Es el criterio de terminado de la versión, medido recorriendo el teléfono | `walkthrough-p1.md`…`walkthrough-p4.md` |
| US11.1 / AC11.1.1–AC11.1.5 — seis pantallas sin sesión, en claro y en oscuro | Requiere dispositivo, control del tema del sistema y modo avión | `walkthrough-p1.md`, `walkthrough-p2.md` |
| US11.2 / AC11.2.1–AC11.2.3 — la mitad con Spotify | Requiere client ID configurado y el panel de Spotify aceptando el redirect de Expo Go | `walkthrough-p3.md`, `walkthrough-p4.md` |
| NFR6.2 / NFR6.7 / NFR6.9 / NFR6.10 — 44×44 en toda la superficie táctil | Los componentes con aserción automática están cubiertos; el tamaño real al dedo se juzga en el dispositivo | `walkthrough-p1.md` § áreas táctiles |

Estos cinco objetivos se registran en la matriz como **`Unverified`**. No se marcan `Met` con evidencia de Node: sería falso. La etapa no puede resolverlos con ningún cambio de código, de versión de librería, de imagen o de bandera: la única acción que los resuelve es que una persona recorra la app en el teléfono.

**Ningún objetivo quedó `Not Met`.** Todo lo que se puede ejecutar en este entorno se ejecutó y pasó.

### Decisión sobre los objetivos no demostrados

La etapa se detuvo y preguntó, como manda la escalera de fallos: no existe ningún arreglo en las dimensiones intercambiables (código, versión de librería, imagen, bandera) que convierta un objetivo de dispositivo en evidencia de este entorno. **La persona eligió «Aceptar el fallo»**: los cinco objetivos quedan registrados como limitación declarada y la etapa pasa a la compuerta de aprobación.

Consecuencias de esa decisión, dichas sin rodeos:

- **El criterio de terminado de la versión no está cumplido.** `team.md` § Testing Posture lo dice: el recorrido real en el teléfono es el criterio, y sigue pendiente. Aceptar el fallo no lo convierte en cumplido; lo deja escrito como deuda visible para que no se pierda.
- **No se abre loop-back.** No hay causa raíz que reabrir en Code Generation: el código no es lo que falta, falta el dispositivo.
- **La compuerta de aprobación es el lugar donde esa deuda se decide**: aprobar la etapa con el recorrido pendiente, o pedir cambios para ejecutarlo antes. La etapa no la cierra por su cuenta.

## Evidencia de navegador y de dispositivo

Ninguna comprobación de esta etapa se ejecutó en un navegador real, en un DOM emulado ni en un dispositivo. Las pruebas de pantalla corren en **Node con `jest-expo`**, que es evidencia de integración de componentes, no de comportamiento nativo. Por eso ninguna fila de la matriz afirma comportamiento de navegador, y las cuatro filas de dispositivo quedan `Unverified` en vez de presentarse como demostradas.

## Loop-Back Log

No se abrió ningún loop-back: no hubo comando fallido, ni objetivo `Not Met`, ni causa raíz que reabrir en Code Generation. La única incidencia de entorno —los enlaces del workspace perdidos— se resolvió con `npm install` antes de la primera compuerta y está registrada arriba como preparación, no como fallo de la etapa.

## Limitaciones conocidas

- **La verificación en el teléfono sigue pendiente.** Es el criterio de terminado de la versión (`team.md` § Testing Posture) y no se sustituye con pruebas.
- **Ruido de consola en dos suites**: `inicio-screen.test.tsx` y `app-bootstrap.test.tsx` imprimen avisos de `act`/`VirtualizedList`. Las 826 pruebas pasan; ninguna aserción depende de esos avisos.
- **`tsc -b` deja `packages/*/dist/`** como artefacto de compilación. Está ignorado por git y por ESLint.
- **`npm install` reporta 8 vulnerabilidades moderadas** en el árbol de dependencias de desarrollo. No se ejecutó `npm audit fix`: cambiar versiones del árbol no es un arreglo de esta etapa y puede romper el pin exacto del SDK 57. Queda anotado para la etapa que decida dependencias.
