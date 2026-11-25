# Instrucciones de prueba — U6 `u6-walkthrough`

> Fecha: 2026-11-21. Etapa: Code Generation · Unidad: `u6-walkthrough`. Deriva de `construction/u6-walkthrough/nfr-design/performance-design.md` (§ NFR6.11, § NFR1.20), `construction/u6-walkthrough/infrastructure-design/cicd-pipeline.md` (§ Los archivos que no cambian, § Qué demuestra el CI) y `aidlc/spaces/default/memory/team.md` § Testing Posture.

## Qué prueba esta unidad, y qué no

**Esta unidad no escribe pruebas nuevas, y no es una rebaja del suelo.** U6 no añade una línea de código de producto: no hay comportamiento nuevo que probar, no hay componente nuevo que renderizar y no hay contrato nuevo que ejercitar (BR25.1, TS-44). La suite de U1–U5 sigue siendo la que prueba la app, y sigue siendo la puerta.

Lo que esta unidad sí verifica es su propio entregable: cuatro registros de pasada sin celdas vacías, con un `Resultado` válido por fila y un veredicto que solo aparece cuando todas las filas están cerradas (BR27.5). Eso se comprueba a ojo contra el catálogo del `functional-spec.md` y, cuando hace falta un número, con el comando de contraste de § Instrumentos de abajo.

| Qué | Cómo se comprueba en esta unidad |
|---|---|
| Las seis pantallas en el teléfono, en claro y en oscuro | Recorrido manual en Expo Go sobre Android físico (P1–P4) |
| La mitad con Spotify | Recorrido manual P3 y P4, o salida condicionada con S01 observada |
| Que la unidad no movió la superficie de la app | El comando de superficie congelada de abajo |
| Que el suelo de cobertura sigue intacto | La suite completa en Build and Test, no un comando de esta unidad |
| Que la evidencia no lleva secretos | Revisión del PR: sin `.env`, sin tokens, sin capturas en el árbol |

## Entorno de pruebas

No hay nada que instalar ni configurar para esta unidad, y eso es parte del contrato (NFR7.9):

- **Runner**: el `jest-expo` de la raíz, ya configurado en `jest.config.js`, con `jest.setup.js` y el `coverageThreshold` por árbol. **No se tocan**: ni el archivo, ni el setup, ni los umbrales, ni el `testMatch`.
- **Descubrimiento**: `jest.config.js` solo recoge `app/src/**/*.test.{ts,tsx}` y `packages/*/src/**/*.test.{ts,tsx}`. Los registros de pasada viven fuera de esos dos árboles, así que **no entran en la suite** y no alteran el recuento ni la cobertura (TS-45).
- **Dobles de prueba**: los de U1–U5, sin cambios. U6 no añade ningún doble global ni conmutador para forzar estados: un estado que solo se pueda provocar con un interruptor nuevo es un pendiente (FR11.6, ADR-012), no una prueba de esta unidad.
- **Zona horaria y reloj**: `jest.setup.js` sigue fijando `Europe/Madrid`; U6 no escribe código que dependa de la fecha.

## Cómo se ejecuta esta unidad

### 1. Superficie congelada — el comando acotado de la unidad

Este es el comando propio de U6: demuestra que la unidad verificó y no construyó. Su salida esperada es **vacía**, salvo la línea del redirect en el mapa de dependencias externas cuando R2 queda condicionada.

```bash
git diff --stat -- package.json app/package.json packages/*/package.json package-lock.json jest.config.js eslint.config.js tsconfig.json app/tsconfig.json .env.example app/src/bootstrap/logger.ts
```

Interpretación de la salida:

| Lo que sale | Qué significa | Qué se hace |
|---|---|---|
| Nada | La unidad no movió dependencias, versiones, umbrales ni el `AppLogCode` | Correcto: la pasada demostró, no construyó |
| `app/src/bootstrap/logger.ts` | El registro de pasada se convirtió en telemetría (NFR9.9) | Se revierte el cambio; el registro es evidencia, no un canal de log |
| Un `package.json`, `jest.config.js` o `eslint.config.js` | Un arreglo «se saltó» una compuerta relajándola | Se revierte y se corrige el síntoma sin tocar la regla |
| `external-dependency-map.md` (fuera del comando, por diseño) | R2 quedó condicionada y se anotó la línea del redirect | Correcto si el registro lleva el mismo valor y la misma fecha |

### 2. La suite existente — la mide Build and Test, no esta unidad

No hay un comando acotado de pruebas que ejecutar aquí: la unidad no aporta archivos de prueba, y cualquier filtro que se inventara solo repetiría pruebas de otras unidades. La suite completa y el suelo del **80 % de líneas por árbol** se ejecutan una vez, al cierre, en Build and Test:

```bash
npm test
```

Si esa ejecución sale distinta de cero **solo** por un umbral de cobertura con todas las pruebas seleccionadas en verde, se registra en `code-summary.md` como umbral y no como prueba fallida; el umbral no se toca.

### 3. Las tres compuertas del cierre

Al cerrar la última pasada, y antes del PR:

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

Las tres en verde. Un rojo no se mergea «y luego se arregla» (`team.md` § Way of Working).

## Cobertura esperada

| Ámbito | Objetivo | Quién lo mide |
|---|---|---|
| `app/src/**` | 80 % de líneas | Build and Test sobre la suite completa |
| Cada `packages/*/src/**` | 80 % de líneas | Build and Test sobre la suite completa |
| Esta unidad | Ninguna línea nueva que cubrir | — |

U6 **no añade un árbol de cobertura ni un umbral** y no baja ninguno. El número de árboles sigue siendo nueve; el suelo, el mismo.

## Gestión de datos de prueba

- **La siembra es la de U2–U5 y no se toca**: ocho a diez opiniones, cuatro o cinco autores, tres opiniones propias, dos seguidos, dos me gusta y tres comentarios recibidos. Una recarga completa devuelve el contenido intacto porque vive en memoria (ADR-010).
- **Cada pasada arranca del mismo estado**: recarga completa de la app y sesión cerrada desde Perfil. Sin ese arranque, cada pasada mide el estado de la anterior y deja de ser comparable (NFR8.20).
- **Nada de datos reales ni de red**: las pruebas usan dobles y ninguna sale a internet (TS-44). Lo único que toca la red en toda la unidad es la autorización de Spotify en el teléfono, y no pasa por la suite.
- **La evidencia no lleva secretos**: el client ID se anota como «configurado: sí/no»; el token, el `refreshToken` y el `.env` no aparecen ni en el registro, ni en una nota, ni en una captura (NFR3.24, NFR4.12).

## Instrumentos

El único instrumento que esta unidad puede usar, cuando una fila pone el contraste en duda, es la función que ya existe en el sistema de diseño, ejecutada desde el repositorio y en el mismo commit que la cabecera del registro:

```bash
node --input-type=module -e "import { contrastRatio } from './packages/design-system/src/contrast.ts'; import { lightColors as L, darkColors as D } from './packages/design-system/src/tokens.ts'; console.log('claro', contrastRatio(L.textMuted, L.bg).toFixed(2)); console.log('oscuro', contrastRatio(D.textMuted, D.bg).toFixed(2));"
```

Se anota el par medido, el valor, el tema y el commit corto en la nota de la fila. No se añade pantalla de medición, ni conmutador, ni temporizador, ni contador de renders (TS-44, NFR6.11). La prueba `packages/design-system/src/__tests__/contrast.test.ts` sigue afirmando los umbrales y no se sustituye por este comando.
