# Instrucciones de prueba de la unidad — U2 `u2-content-core`

> **Provenance**: deriva de `nfr-requirements/tech-stack-decisions.md` (TS-10, TS-16 a TS-22), `nfr-requirements/performance-requirements.md` (NFR8.4, NFR8.5, NFR5.7), `nfr-design/security-design.md` (§ NFR4.5, § NFR4.6, § NFR9.4), `nfr-design/logical-components.md` (§ Superficie, cobertura y compatibilidad), `team.md` § Testing Posture, `inception/contract-design/contract-summary.md` (C4, C5, C6), `functional-spec.md` § Semilla y § Textos exactos, y del `## Testing Contract` de `code-generation-plan.md` (test-after, Standard, mvp).
> Fecha: 2026-11-12. Etapa: Code Generation · Unidad: `u2-content-core`.

## Qué corre esta unidad

| Pieza | Decisión |
|---|---|
| Runner | Jest con el preset `jest-expo`, un solo proyecto en la raíz (`jest.config.js`). |
| Render | `@testing-library/react-native`, consultando por texto y por rol accesible. |
| Paquetes nuevos | `@melodify/content-store`, `@melodify/catalog` y `@melodify/connectivity`, con su `src/index.ts`, sus pruebas y su referencia de proyecto (NFR5.5). |
| Estrategia | **test-after**: se implementa la capa y después se escriben y ejecutan sus pruebas antes de la siguiente. |
| Volumen | Standard: 5–8 pruebas por componente, más las de integración de los límites de la composición. |

## Comando exacto de esta unidad

```bash
npx jest packages/content-store/src packages/catalog/src packages/connectivity/src packages/design-system/src packages/app-shell/src app/src
```

Los seis argumentos son los árboles que esta unidad crea o modifica: los tres paquetes nuevos, las dos versiones 1.2.0 y la app. Ninguna prueba de `packages/app-session/src` se ejecuta aquí, porque esta unidad no toca C3; sus pruebas siguen corriendo en el `npm test` del CI y en la suite completa.

**Con cobertura** (el mismo alcance, más el informe y los umbrales por árbol):

```bash
npx jest --coverage packages/content-store/src packages/catalog/src packages/connectivity/src packages/design-system/src packages/app-shell/src app/src
```

### Comandos por capa, para el ciclo corto

| Capa | Comando |
|---|---|
| Modelo y operaciones de C4 | `npx jest packages/content-store/src` |
| Catálogo | `npx jest packages/catalog/src` |
| Conectividad | `npx jest packages/connectivity/src` |
| Sistema de diseño 1.2.0 | `npx jest packages/design-system/src` |
| Cáscara 1.2.0 | `npx jest packages/app-shell/src` |
| Estado, componentes y pantallas | `npx jest app/src` |
| Un archivo concreto | `npx jest app/src/screens/inicio/__tests__/inicio-view.test.tsx` |

### El suelo de cobertura no se juzga aquí

El 80 % de líneas **por árbol** —`./app/src/**` y cada `./packages/*/src/**` con umbral propio, incluidos los tres paquetes nuevos— está configurado en `coverageThreshold`. **Build and Test mide ese suelo sobre la suite completa del proyecto.** Si el comando con `--coverage` sale distinto de cero **solo** por un umbral y todas las pruebas seleccionadas pasan, se registra así en `code-summary.md`: no es una prueba rota y **no se toca el umbral** para que pase. El comando con cobertura va solo, sin ningún paso después que un umbral pueda detener.

## Configuración

- `jest.config.js` de raíz: `preset: "jest-expo"`, `setupFilesAfterEnv` → `jest.setup.js`, `collectCoverageFrom` sobre `app/src/**/*.{ts,tsx}` y `packages/*/src/**/*.{ts,tsx}`.
- Tres `moduleNameMapper` nuevos: `^@melodify/content-store$`, `^@melodify/catalog$` y `^@melodify/connectivity$` hacia su `src`. Sin el mapeo, el preset resuelve el paquete por el enlace de workspaces a un `.ts` que no transforma y las pruebas no llegan a ejecutarse.
- Tres `coverageThreshold` nuevos al 80 % de líneas para los tres árboles nuevos, junto a los tres que ya existen.
- Exclusiones de TS-10 sin cambios: `**/*.d.ts`, `**/__tests__/**`, `**/*.test.{ts,tsx}`, `**/jest.setup.*` y `app/index.ts`. **`app/src/bootstrap/` no se excluye.**
- `jest.setup.js` ya carga `@testing-library/react-native` y los dobles de `expo-splash-screen` y `expo-secure-store`.

## Dobles y datos de prueba

| Qué se dobla | Cómo | Regla |
|---|---|---|
| Red del sistema operativo | `jest.mock("expo-network")` en las pruebas del adaptador; un `NetworkAdapter` en memoria en las de `createConnectivity` y en las de pantalla | Ninguna prueba toca el sistema operativo (NFR4.5) |
| Sesión de la app | Un objeto con `getSession`, `signIn`, `signOut` y `subscribeSession` inyectado en `App`, `InicioScreen` y `PerfilScreen` por props o por doble de módulo | No se construye una sesión real ni se toca el almacenamiento seguro |
| Contenido | `createContentStore({ now, seed })` con el reloj fijo o una siembra mínima (lista vacía, una opinión, varias obras) | El estado vacío y el de una sola opinión se fuerzan por la siembra, no con esperas |
| Catálogo | La instancia real con `session`, `search` y `resolve` en `null`; un doble solo para forzar `getCoverFailure` | En U2 no hay puertos que resolver |
| Reloj | `now = "2026-11-12T09:00:00.000Z"` pasado a `createContentStore` | Ninguna prueba llama a `new Date()` sin argumento ni a `Date.now()` (NFR5.7) |
| Logger | Un espía con la firma de `AppLogger` inyectado en `createContentStore`, `createConnectivity` y los hooks | Se comprueba el código y el mensaje literal, nunca datos de contenido (NFR4.6) |

Datos: la siembra de producción es una constante de `packages/content-store/src/seed.ts` y las pruebas **leen sus invariantes** (10 opiniones, 5 autores, 8 obras, 3 de `demo`, 2 seguidos, 4 me gusta, 3 comentarios) en lugar de duplicar la tabla. Para los textos de pantalla se usan literales de `functional-spec.md` § Textos exactos, comparados completos.

## Qué debe quedar probado por capa

| Capa | Pruebas |
|---|---|
| Modelo | Siembra e invariantes, edades contra `now`, orden del feed, `revision`, aislamiento entre dos almacenes. |
| Acceso a datos | `listOpinions`, `getOpinion`, `getAuthor`, `listFollowing`, `listLikes`, `listComments`: `200`/`404`/`422`; `subscribeContent` con emisión inmediata, tras escritura y baja. |
| Negocio | Escrituras de C4 (`201`/`409`/`403`/`422`), decisión de portada de C5, estado de red de C6 con degradación a en línea. |
| Superficie | Los tres `src/index.ts` exponen lo que su contrato nombra; `AppLogger` asignable a `SessionLogger`; los tres puertos siguen en `null`. |
| Interfaz | `ErrorState`, `TextButton`, `formatCalendarDate`, estado `own` de `OpinionCard`, `AppHeader.leftSlot` y `EmptyState.body`; pila de C2 con la raíz montada; hooks (`loading`, `ready`, `error`, `attempt`, contador de catálogo); `toOpinionCardModel`; `OfflineBanner`; `WorkHeader`; Inicio, Detalle de obra, Detalle de opinión y Perfil en carga, vacío, error y sin conexión. |
| Integración | Una sola instancia por dominio; `shell-services` con la red real; arranque → Inicio con 10 tarjetas; detalle apilado que conserva la raíz; «‹ Volver» al feed; banner sin conexión en las tres pantallas; Perfil → detalle con «Editar». |

## Fuera del alcance automático

El recorrido real en el teléfono (Expo Go sobre Android físico) es verificación manual y sigue siendo el criterio de terminado de la versión: incluye comprobar que la posición del feed se conserva al abrir y cerrar un detalle, y que el aviso responde al modo avión. Ninguna prueba demuestra el arranque en frío de 2 s (NFR8.1) ni mide milisegundos: las dos pruebas que podrían hacerlo cuentan llamadas.

## Pruebas que no valen

Nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma. Una prueba de un texto exacto compara la cadena completa, no un fragmento. Una prueba de «sin conexión» que no cambie el estado del adaptador no demuestra nada.
