# Instrucciones de prueba de la unidad — U1 `u1-app-skeleton`

> **Provenance**: deriva de `nfr-requirements/tech-stack-decisions.md` (TS-10, TS-11), `nfr-design/security-design.md` (§ Cómo se demuestra cada requisito), `team.md` § Testing Posture, `inception/contract-design/contract-summary.md` (§ Estructura del monorepo, § Cobertura) y del `## Testing Contract` de `code-generation-plan.md` (test-after, Standard, mvp).
> Fecha: 2026-11-11. Etapa: Code Generation · Unidad: `u1-app-skeleton`.

## Qué corre esta unidad

| Pieza | Decisión |
|---|---|
| Runner | Jest con el preset `jest-expo`. |
| Render | `@testing-library/react-native`, consultando por texto y por rol accesible. |
| Proyecto | Uno solo en la raíz (`jest.config.js`), con `app/` y `packages/*`. |
| Entorno | `node` para los módulos puros y el preset de Expo para las pantallas (`jest-expo` resuelve `react-native`). |
| Estrategia | **test-after**: se implementa la capa y después se escriben y ejecutan sus pruebas antes de la siguiente. |
| Volumen | Standard: 5–8 pruebas por componente, más las de integración de los límites de arranque y de entrada. |

## Comando exacto de esta unidad

```bash
npx jest app/src packages/design-system/src packages/app-shell/src packages/app-session/src
```

**Con cobertura** (el mismo alcance, más el informe):

```bash
npx jest --coverage app/src packages/design-system/src packages/app-shell/src packages/app-session/src
```

Los cuatro argumentos son los árboles que esta unidad posee; ningún otro paquete existe todavía, así que el comando es completo para U1 y no ejecuta pruebas de otras unidades cuando las haya. Es el comando que se ejecuta **antes del primer ciclo de prueba** y después de cada capa.

### El suelo de cobertura no se juzga aquí

El 80 % de líneas por árbol (`./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**`, `./packages/app-session/src/**`) está configurado en `coverageThreshold`. **Build and Test mide ese suelo sobre la suite completa del proyecto**. Si el comando con `--coverage` sale distinto de cero **solo** por el umbral y todas las pruebas seleccionadas pasan, se registra así en `code-summary.md`: no es una prueba rota y no se toca el umbral para que pase.

## Configuración

- `jest.config.js` de raíz: `preset: "jest-expo"`, `setupFilesAfterEach` → `jest.setup.js`, `collectCoverageFrom` sobre `app/src/**/*.{ts,tsx}` y `packages/*/src/**/*.{ts,tsx}`.
- Exclusiones (solo las de TS-10): `**/*.d.ts`, `**/__tests__/**`, `**/*.test.{ts,tsx}`, `**/jest.setup.*` y `app/index.ts`. **`app/src/bootstrap/` no se excluye.**
- `coverageThreshold` por ruta con las cuatro entradas de esta unidad al 80 % de líneas.
- `jest.setup.js` carga `@testing-library/react-native` y los dobles de módulos nativos que ninguna prueba debe tocar de verdad (`expo-splash-screen`, `expo-secure-store`).

## Dobles y datos de prueba

| Qué se dobla | Cómo | Regla |
|---|---|---|
| Almacenamiento seguro | Objeto en memoria con `getItemAsync`/`setItemAsync`/`deleteItemAsync` inyectado en `createAppSession({ store })` | Ninguna prueba toca el módulo nativo; el adaptador real se prueba aparte con `jest.mock("expo-secure-store")`. |
| Splash | `jest.mock("expo-splash-screen")` y aserción sobre `hideAsync` | Se comprueba que se llama **siempre**, también cuando la lectura falla. |
| Reloj | Valores ISO fijos pasados a la semilla y al registro | Ninguna prueba depende de la hora real. |
| Red | No existe en U1 | Si una prueba necesitara red, está mal escrita. |

Datos: los registros de sesión se construyen en la propia prueba (`{ authorId: "demo", startedAt: "2026-11-11T08:00:00.000Z" }`) y la semilla de Inicio es una constante exportada del módulo de presentación, no un fixture duplicado.

## Qué debe quedar probado por capa

| Capa | Pruebas |
|---|---|
| Modelo | `parseSessionRecord`: seis entradas inválidas, válida y con campos extra. |
| Acceso a datos | Adaptador: lee, escribe y borra **solo** `melodify.session`; traduce el rechazo a código de fallo. |
| Negocio | `getSession`/`signIn`/`signOut`/`subscribeSession` con `200`, `401`, `503`, `204`; los cuatro códigos del logger; los servicios por defecto de C2. |
| Superficie pública | Los símbolos de C3 1.1.0 y `createAppSession()` sin argumentos. |
| Frontend | Contraste y tema; los doce componentes de C1 1.0.0; la navegación de la cáscara (orden, estado activo, pila por pestaña); Login (deshabilitado, acierto, error, reintento, textos exactos); Inicio (semilla, lectura, vacío). |
| Integración | Arranque → Login o Inicio en los cuatro caminos (válida, vacía, inválida, `503`) con el splash oculto; Login → Inicio con la sesión guardada. |

## Fuera del alcance automático

El recorrido real en el teléfono (Expo Go sobre Android físico) es verificación manual y sigue siendo el criterio de terminado de la versión. Ninguna prueba demuestra el arranque en frío de 2 s (NFR8.1): eso se mide con el protocolo de `nfr-requirements/performance-requirements.md`.

## Pruebas que no valen

Nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma. Una prueba de un texto exacto compara la cadena completa, no un fragmento.

## Registro de ejecución del arnés

Antes de la primera prueba de la unidad se ejecutó el comando exacto sobre el árbol vacío, con `jest.config.js`, `jest.setup.js` y una prueba de humo (`app/src/bootstrap/__tests__/harness.test.tsx`) que monta un componente de React Native:

```bash
npx jest app/src packages/design-system/src packages/app-shell/src packages/app-session/src
```

Resultado: 1 suite y 2 pruebas en verde. La variante con `--coverage` avisó de que aún no había datos para los cuatro árboles (el código llega en los pasos siguientes) y terminó sin fallar. El arnés queda así verificado antes de escribir la primera capa.
