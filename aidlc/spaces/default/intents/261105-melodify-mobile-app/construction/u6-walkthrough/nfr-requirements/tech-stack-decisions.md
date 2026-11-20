# Decisiones de pila técnica — U6 `u6-walkthrough`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR5, NFR6, NFR7, FR12.1, FR12.2, RC-04, RC-05, RC-09), de `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Deployment, § Testing Posture, § Code Style), de `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0, C8 1.1.0), de `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Precondiciones, § Las pasadas, § El registro de la pasada, § Criterio de cierre), de `construction/u6-walkthrough/functional-design/rules.md` (BR25.2, BR26.5, BR27.1, BR27.3, BR27.4, BR28.1, BR28.4) y de `construction/u6-walkthrough/functional-design/frontend-components.md` (§ Comprobaciones transversales, § Qué cuenta como «ajuste»).
> Fecha: 2026-11-20. Etapa: NFR Requirements · Unidad: `u6-walkthrough` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Cada decisión lleva un identificador estable (`TS-44`…`TS-48`, continuando la numeración de U5, que terminó en `TS-43`), el objetivo no funcional que sirve y las alternativas que se descartaron. Lo que U1–U5 ya decidieron no se repite: **TS-01 (versiones exactas), TS-02 (`strict`), TS-03 (monorepo), TS-05 (una sola instancia y fábricas), TS-10 (Jest y `jest-expo` con cobertura por árbol), TS-11 (ESLint, Prettier y CI), TS-13 (solo Expo Go), TS-14 (tokens), TS-17 (paquetes con `src/index.ts`), TS-18 (fábricas explícitas, sin contenedor), TS-20 (reloj inyectable) y TS-29 (temporizadores propios) siguen vigentes y esta unidad los hereda sin reabrirlos.**

**La regla que gobierna el resto**: **U6 no añade ninguna tecnología**. Ni una dependencia, ni un paquete, ni un script, ni un paso de CI, ni un módulo de Expo. Es la única unidad cuyo trabajo es demostrar que la pila construida funciona, y una herramienta nueva en la última unidad sería una forma de no demostrarlo o de cambiar lo que se entrega mientras se prueba.

**Qué cambia respecto a U1–U5.** Hasta ahora cada unidad ampliaba el inventario: U1 la cáscara y el CI, U2 el contenido, U3 las pantallas de escritura, U4 la red y una credencial, U5 un paquete de composición. **U6 no amplía nada**: produce cuatro ficheros markdown de evidencia, un puñado de arreglos que caben en el contrato, y una pasada de los tres comandos del CI. Su dificultad no está en las herramientas sino en tres decisiones que sí son de proceso:

1. **Qué cuenta como evidencia** (cuatro registros, no uno; capturas en el PR, no en el árbol).
2. **Cómo se verifica** (teléfono físico con Expo Go y Metro; sin conmutador de depuración).
3. **Cuándo se cierra** (CI verde y suelo de cobertura intacto, no una pasada «suficiente»).

## Resumen de decisiones

| ID | Decisión | Sirve a |
|---|---|---|
| TS-44 | U6 no añade dependencia, paquete, script ni paso de CI; los únicos cambios de código son arreglos en alcance que caben en el contrato, y ni `package.json` ni el lockfile cambian | NFR5, NFR3, NFR7 |
| TS-45 | La evidencia son cuatro registros markdown en `construction/u6-walkthrough/code-generation/` más las capturas adjuntas al PR; ningún binario se commitea al árbol | NFR5, NFR4 |
| TS-46 | La verificación es manual en un teléfono Android físico con Expo Go y Metro; el contraste se mide con `contrastRatio` de C1 cuando hay duda; no se añade conmutador, pantalla de estados ni instrumentación | NFR6, NFR7, NFR2 |
| TS-47 | La suite no crece por la unidad: los tres comandos del CI son la puerta y el suelo del 80 % se mantiene; un arreglo que cambie lógica añade su prueba dirigida (test-after) | NFR5, NFR1 |
| TS-48 | El cierre es un PR a `develop` con Conventional Commits, la plantilla del repositorio, CI en verde y la evidencia adjunta; no hay build, ni firma, ni tienda | NFR7, NFR5 |

## Requisitos derivados de esta unidad

| Requisito | Qué exige | Decisión |
|---|---|---|
| NFR5.13 | La unidad no mueve el suelo ni la puerta: 80 % de líneas sobre `app/src/**`, sin excluir ni bajar, y los tres comandos del CI en verde | TS-44, TS-47 |
| NFR6.11 | Contraste ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande e iconos), 44×44 en barra, botones e iconos de tarjeta, en los dos temas; el número solo cuando hay duda | TS-46 |
| NFR7.9 | Mismo entorno de siempre: Android físico, Expo Go, Metro; nada nuevo que instalar ni compilar | TS-44, TS-46 |
| NFR3.25 (seguridad) | El arreglo no abre red, almacenamiento, módulo ni estado nuevo | TS-44, TS-47 |
| NFR4.12 (privacidad) | Las capturas van al PR y el registro anota lo observado | TS-45 |

## NFR7 — Compatibilidad: el entorno de la demostración es el de siempre

### NFR7.9 — La unidad no estrena un solo módulo, y por tanto no puede sacar la app de Expo Go

- **El entorno es el que fijó U1 y confirmaron U2–U5**: un teléfono Android físico, Expo Go instalado y Metro levantado desde `app/` (BR25.2, `team.md` § Deployment). No hay emulador, ni navegador, ni build propio, ni `expo-dev-client` (CT-05).
- **Nada nuevo que instalar en ningún `package.json`.** Ni `app/`, ni un `packages/`, ni la raíz. `npx expo install` no se ejecuta en esta unidad y `git diff --stat package-lock.json` no debe mostrar una dependencia externa nueva ni una versión movida.
- **Nada nuevo que compilar.** U6 no genera código nativo, no firma, no publica y no configura EAS Build ni EAS Update (`team.md` § Deployment). «Desplegar» sigue significando abrir la app en el teléfono con Metro encendido.
- **Cómo se comprueba**: `npx expo start` levanta Metro sin aviso de módulo ausente y las seis pantallas se abren en Expo Go; `git diff --stat` de los `package.json` y del lockfile sin cambios; el `diff` del PR no contiene `android/`, `ios/` ni `eas.json`.

## TS-44 — U6 no añade tecnología: solo evidencia y arreglos que caben en el contrato

**Lo que U6 puede escribir:**

| Qué | Dónde | Forma |
|---|---|---|
| Cuatro registros de pasada | `construction/u6-walkthrough/code-generation/walkthrough-p1.md` … `-p4.md` | Markdown con la estructura fija del functional-spec |
| Una fila en el mapa de dependencias externas | `inception/delivery-planning/external-dependency-map.md` (solo si R2 se condiciona) | La fila del redirect, con valor y fecha |
| Arreglos en alcance | El fichero de la pantalla o pieza que falló | Cambio mínimo dentro de props y estados existentes (BR27.4) |

**Lo que U6 no puede escribir:**

- Un `package.json` o un lockfile con una dependencia nueva o una versión movida.
- Un `jest.config.js` con un umbral nuevo o un `collectCoverageFrom` distinto (TS-47).
- Un `eslint.config.js` con una regla nueva, salvo que un arreglo lo exija y el arreglo lo cubra BR27.4 —no ocurre en el diseño.
- Un `tsconfig` con una referencia nueva.
- Un `.github/workflows/ci.yml` con un paso nuevo.
- Un código de diagnóstico, un estado de pantalla, una prop pública o un token.

**La regla de oro del arreglo**: si el cambio mínimo exige tocar C1–C8, añadir una pantalla o un componente, o introducir un módulo nativo, **no es un arreglo**: se registra como pendiente con qué falta y de qué depende (BR27.2, BR27.4, BR28.3). La última unidad no es el lugar para cambiar un contrato que cinco unidades anteriores ya consumieron.

**Alternativas descartadas**: añadir un detector de regresiones visuales (exigiría dependencias y una referencia de capturas que el proyecto no tiene); añadir un script `npm run walkthrough` (automatizaría lo que Q1 = A decidió hacer a mano y no demuestra el teléfono); añadir un conmutador de depuración para forzar estados (Q2 = A lo descarta y sería código que solo existe para la demo); subir la cobertura con pruebas nuevas de pantallas que ya están probadas (el suelo es el 80 %, no un objetivo de premio).

## TS-45 — La evidencia son cuatro registros y capturas en el PR, no binarios en el árbol

- **Un fichero por pasada, no uno con cuatro tablas.** `walkthrough-p1.md` (R1 claro), `-p2.md` (R1 oscuro), `-p3.md` (R2 claro) y `-p4.md` (R2 oscuro): una pasada se puede cerrar sin tocar las demás y una que se repite se reescribe sola (BR27.1).
- **La estructura es fija** (functional-spec § El registro de la pasada): cabecera con los siete datos, tabla de pasos con `Resultado` limitado a ✅, ❌ o N/A, tabla de defectos y veredicto. Sin celdas vacías y sin veredicto antes de tiempo (BR27.5).
- **Las capturas no se commitean**: se adjuntan al PR y se referencian por nombre (`p1-inicio-claro.png`, etc.). El nombre ya dice pasada, pantalla y tema, así que no hace falta una convención aparte (BR27.1, NFR4.12).
- **Los registros viven en el árbol del intento**, no en `app/`: son evidencia de la verificación, no parte del producto. `app/` no gana un fichero de documentación y el bundle no los incluye.
- **Cómo se comprueba**: `git status` no muestra imágenes nuevas; el PR las lista y el registro las nombra; los cuatro ficheros existen solo para las pasadas ejecutadas (una pasada condicionada deja su fichero con S01 observada y S02–S08 en N/A).

## TS-46 — Verificación manual en el teléfono, con el número solo cuando hay duda

- **El teléfono es el instrumento**: las seis pantallas, los estados que se provocan (credenciales erróneas, modo avión, falta de sesión de Spotify, tema) y las vistas de paso se juzgan en el dispositivo. Las pruebas automáticas cubren lo que no se puede provocar (carga, vacío, error de contenido) y así se anota (Q2 = A, FR11.6, ADR-012).
- **El contraste se juzga a ojo y se mide cuando hay duda**: el ojo detecta el problema; si un par de colores ofrece duda, se mide con `contrastRatio` de C1 —la misma función que usa el sistema de diseño— y el valor queda en la nota de la fila, de modo que el veredicto no dependa de la vista de quien recorre (BR26.5, NFR6). No se añade una herramienta de escritorio ni una pantalla de medición.
- **Las áreas táctiles se comprueban con el dedo y con la altura declarada**: 44×44 en la barra inferior, los botones principales y los iconos de la tarjeta (NFR6). Un área que se siente pequeña y mide menos de 44 es ❌; una que mide 44 y se siente pequeña no lo es.
- **No se añade instrumentación**: ni un reloj visible, ni un contador de renders, ni un conmutador de tema dentro de la app. El tema se cambia en el sistema del teléfono, como lo cambia la persona.
- **La comprobación de contraste no cambia tokens**: si un par de tokens existentes no alcanza el umbral, se busca otro par existente; si ninguno lo alcanza, es un pendiente de C1 y no se elige un color a ojo en la pantalla (BR27.4, frontend-components § Qué cuenta como «ajuste»).

## NFR5 — Mantenibilidad: la puerta del CI no se mueve

### NFR5.13 — El suelo del 80 % y los tres comandos siguen siendo el criterio

- **El umbral no se baja ni se amplía**: 80 % de líneas sobre `app/src/**` y sobre cada `packages/*/src/**`, sin excluir nada (`team.md` § Testing Posture, TS-10, TS-11). U6 no toca `jest.config.js`.
- **La suite es la red del arreglo**: cada corrección que cambie lógica añade su prueba dirigida —test-after, como el resto del proyecto— y la suite entera se ejecuta al final de la última pasada (BR27.3, BR28.1). Un arreglo que solo cambia un texto visible no necesita una prueba nueva si la prueba de la pantalla ya afirma el texto; si no lo afirma, se añade.
- **El recorrido no sustituye a las pruebas**: un ✅ en el teléfono no cubre la carga, el vacío ni el error de contenido, y se anota así en el registro (Q2 = A). Presentar el recorrido como cobertura sería vender lo mismo dos veces.
- **La puerta del CI no gana un paso**: `.github/workflows/ci.yml` sigue con commitlint, `npm run typecheck`, `npm run lint` y `npm test`. La evidencia va en el PR; el CI no ejecuta un teléfono.
- **Cómo se comprueba**: `npm test -- --coverage` y lectura del resumen por ruta; `npm run typecheck` y `npm run lint` en verde; `git diff --stat .github/workflows/ci.yml` vacío.

### TS-47 — Pruebas: las que ya existen más la del arreglo, sin reloj ni red

- **Qué se prueba en esta unidad**: ninguna prueba nueva por el mero hecho de recorrer; y, por cada defecto en alcance corregido, la prueba del comportamiento que fallaba —una transición, un texto, un estado— en el árbol que lo posee (la pantalla en `app/src/**`, la pieza en `packages/design-system`).
- **Ninguna prueba nueva sale a la red, usa una cuenta de Spotify real ni necesita el teléfono**: el recorrido sigue siendo manual y las pruebas siguen con dobles (`team.md` § Testing Posture, TS-43).
- **Nada de aserciones que siempre pasan.** Una prueba del arreglo afirma el valor exacto que cambió; una que solo compruebe que el componente monta no documenta la corrección.
- **Los cuatro registros no son pruebas**: son evidencia. No se enlazan desde Jest ni se leen en un `test`.

## NFR6 — Accesibilidad de la verificación

### NFR6.11 — Contraste, 44×44 y los dos temas

| Qué se comprueba | Umbral | Cómo |
|---|---|---|
| Texto normal | ≥ 4.5:1 | Ojo en el teléfono; `contrastRatio` en la nota si hay duda |
| Texto grande e iconos | ≥ 3:1 | Ídem |
| Barra inferior, botones principales e iconos de la tarjeta | ≥ 44×44 | Dedo en el teléfono + altura declarada en C1 |
| Temas | Claro y oscuro | P1/P2 (R1) y P3/P4 (R2), con captura de las seis pantallas por tema |

- **Ambos temas son obligatorios**: `AC11.1.5` pide que las seis pantallas mantengan la legibilidad en claro y en oscuro, y los bloques con inicial se ven en los dos (BR26.5).
- **El contraste se mide sobre el tema activo**, no sobre una paleta aislada: lo que se juzga es lo que se ve en la pantalla que la persona toca (functional-components § Assumptions).
- **Un fallo de contraste que exija un token nuevo es un pendiente**, no un arreglo (BR27.4): la corrección es elegir un par existente o registrar la deuda de C1 con su propio consumidor.
- **Cómo se comprueba**: cada registro anota el valor medido cuando lo hubo; las capturas de los dos temas existen; la tabla de defectos incluye cualquier par que no alcanzara el umbral con su decisión.

## TS-48 — Cierre: PR a `develop` con CI verde y evidencia, sin build ni tienda

- **La rama sale de `develop` y vuelve a `develop`** con squash, un commit por Bolt nombrado con el slug (`team.md` § Way of Working). `main` solo recibe entregas por squash desde `develop`.
- **El PR rellena la plantilla del repositorio**: plataformas probadas, capturas, checklist de calidad, variables de entorno documentadas y el Conventional Commit en el título (BR28.4).
- **CI en verde es la puerta**: commitlint, `npm run typecheck`, `npm run lint` y `npm test`. Un rojo bloquea el merge; no se mergea «y luego se arregla».
- **Nada de build, firma, EAS ni tienda** (`team.md` § Deployment): la entrega se demuestra abriendo la app en el teléfono con Metro encendido, sin Spotify conectado y con Spotify conectado.
- **Rollback**: `git revert` del squash del Bolt en `develop` y recarga de Metro. No hay artefacto desplegado ni migración que deshacer.
- **Cómo se comprueba**: el PR existe con la plantilla completa, los cuatro registros y las capturas adjuntas; los cuatro checks del CI están en verde; el `diff` no contiene `android/`, `ios/`, `eas.json` ni un secreto.

## Versiones y fijación

| Paquete | Versión que publica U6 | Por qué |
|---|---|---|
| `@melodify/app` | 0.0.0 (sin cambios) | U6 no añade código de producto más allá del arreglo; no publica. |
| `@melodify/design-system` | 1.5.0 (sin cambios) | Los arreglos usan props y tokens existentes; ningún token ni pieza nueva. |
| `@melodify/app-session` | 1.1.0 (sin cambios) | No se toca. |
| `@melodify/content-store` | 1.2.0 (sin cambios) | No se toca. |
| `@melodify/catalog` | 1.2.0 (sin cambios) | No se toca. |
| `@melodify/connectivity` | 1.0.0 (sin cambios) | No se toca. |
| `@melodify/spotify` | 1.0.0 (sin cambios) | No se toca; el recorrido conecta y desconecta por la app. |
| `@melodify/activity` | 1.1.0 (sin cambios) | No se toca. |
| `@melodify/app-shell` | 1.4.0 (sin cambios) | No se toca. |

**Un cambio de versión de un paquete interno sería la señal de que U6 dejó de verificar y empezó a construir.** Si un defecto exigiera subir una versión, el cambio sería de contrato y pasaría a pendiente (BR27.4).

Todas las versiones se escriben exactas (`.npmrc` con `save-exact=true`, TS-01).

## Dependencias nuevas

**Ninguna.** Es la segunda unidad del proyecto que no añade un módulo externo, y la única que no añade ni un workspace. La tabla se deja explícita para que la ausencia se lea como decisión y no como olvido:

| Paquete | Versión | Dónde entra | Para qué |
|---|---|---|---|
| — | — | — | — |

## Assumptions & Open Questions

- `[assumption]` La evidencia no se versiona como imagen. Si el equipo quisiera capturas en el repositorio, sería una decisión de `team.md` con su propio coste de tamaño y sin cambiar la sustancia de BR27.1.
- `[assumption]` No se introduce una herramienta de pruebas de extremo a extremo (Detox, Maestro, `expo-detox`). Añadiría dependencias y un entorno que CT-05 y `team.md` § Deployment no contemplan, y el criterio de terminado del MVP es el recorrido manual.
- `[assumption]` La medición de contraste con `contrastRatio` se hace en el teléfono, en el momento, y el valor se escribe en la nota. Medirlo por separado en el escritorio mediría colores distintos del tema activo y no lo que se ve.
- `[assumption]` Si un defecto obliga a añadir una prueba en un paquete que hoy no la tiene, esa prueba entra en el árbol del paquete y cuenta para su umbral; no se compensa con `app/src/**` (TS-10).
- **Open question para el cierre del workflow**: la unidad no fija el tiempo que puede durar una pasada. Si el equipo quiere un límite, es una decisión de proceso y no de esta etapa; lo que sí queda cerrado es el número de filas y capturas (NFR8.19).

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR5, NFR6, NFR7, FR12.1, FR12.2, RC-04, RC-05, RC-09).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Deployment, § Testing Posture, § Code Style).
- `contract-summary` — `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0, C8 1.1.0).
- `functional-spec` — `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Precondiciones, § Las pasadas, § El registro de la pasada, § Criterio de cierre).
- `rules` — `construction/u6-walkthrough/functional-design/rules.md` (BR25.2, BR26.5, BR27.1, BR27.3, BR27.4, BR28.1, BR28.4).
- `frontend-components` — `construction/u6-walkthrough/functional-design/frontend-components.md` (§ Comprobaciones transversales, § Qué cuenta como «ajuste»).
- `performance-requirements` — `construction/u6-walkthrough/nfr-requirements/performance-requirements.md` (NFR8.19, NFR2.15, NFR1.19, NFR1.20).
- `security-requirements` — `construction/u6-walkthrough/nfr-requirements/security-requirements.md` (NFR3.24, NFR3.25, NFR4.12, NFR9.9).
