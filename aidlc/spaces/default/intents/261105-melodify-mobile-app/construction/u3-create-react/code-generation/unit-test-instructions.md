# Instrucciones de prueba de la unidad — U3 `u3-create-react`

> **Provenance**: deriva de `nfr-requirements/tech-stack-decisions.md` (TS-23 a TS-30, más TS-10 y TS-14 a TS-22 heredados), `nfr-requirements/performance-requirements.md` (NFR1.9–1.11, NFR2.7–2.9, NFR8.8–8.11), `nfr-requirements/security-requirements.md` (NFR3.12–3.16, NFR4.7–4.8, NFR9.6), `nfr-design/logical-components.md` (LC-1 a LC-11), `nfr-design/performance-design.md`, `nfr-design/security-design.md`, `functional-design/functional-spec.md` § Textos exactos, `team.md` § Testing Posture y el `## Testing Contract` de `code-generation-plan.md` (test-after, Standard, mvp).
> Fecha: 2026-11-16. Etapa: Code Generation · Unidad: `u3-create-react`.

## Qué corre esta unidad

| Pieza | Decisión |
|---|---|
| Runner | Jest con el preset `jest-expo`, un solo proyecto en la raíz (`jest.config.js`). Sin configuración nueva. |
| Render | `@testing-library/react-native`, consultando por texto y por rol accesible. |
| Paquetes tocados | `@melodify/content-store` (1.2.0), `@melodify/design-system` (1.3.0) y `@melodify/app-shell` (1.3.0). `@melodify/app-session`, `@melodify/catalog` y `@melodify/connectivity` no cambian. |
| Estrategia | **test-after**: se implementa la capa y después se escriben y ejecutan sus pruebas antes de la siguiente. |
| Volumen | Standard: 5–8 pruebas por componente, más las de integración de los límites (cáscara con hoja y snackbar, arranque con Crear real). |

## Comando exacto de esta unidad

```bash
npx jest packages/content-store/src packages/design-system/src packages/app-shell/src app/src
```

Los cuatro argumentos son los árboles que esta unidad crea o modifica. `packages/app-session/src`, `packages/catalog/src` y `packages/connectivity/src` no aparecen porque U3 no los toca: sus pruebas siguen corriendo en el `npm test` del CI y en la suite completa.

**Con cobertura** (el mismo alcance, más el informe y los umbrales por árbol):

```bash
npx jest --coverage packages/content-store/src packages/design-system/src packages/app-shell/src app/src
```

### Comandos por capa, para el ciclo corto

| Capa | Comando |
|---|---|
| Topes de C4 | `npx jest packages/content-store/src` |
| Sistema de diseño 1.3.0 | `npx jest packages/design-system/src` |
| Cáscara 1.3.0 | `npx jest packages/app-shell/src` |
| Controlador de la hoja | `npx jest app/src/comments` |
| Hooks de estado | `npx jest app/src/state` |
| Crear y Editar | `npx jest app/src/screens/crear` |
| Cableado de las cuatro pantallas | `npx jest app/src/screens/inicio app/src/screens/detalle-obra app/src/screens/detalle-opinion app/src/screens/perfil` |
| Composición y arranque | `npx jest app/src/bootstrap` |
| Un archivo concreto | `npx jest app/src/comments/__tests__/comments-controller.test.ts` |

### El suelo de cobertura no se juzga aquí

El 80 % de líneas **por árbol** ya está configurado en `coverageThreshold` para `./app/src/**` y para cada `./packages/*/src/**`. **Build and Test mide ese suelo sobre la suite completa del proyecto.** Si el comando con `--coverage` sale distinto de cero **solo** por un umbral y todas las pruebas seleccionadas pasan, se registra así en `code-summary.md`: no es una prueba rota y **no se toca el umbral** para que pase. El comando con cobertura va solo, sin ningún paso después que un umbral pueda detener.

## Configuración

- `jest.config.js` **no cambia**: `testMatch` ya incluye `app/src/**/*.test.{ts,tsx}` y `packages/*/src/**/*.test.{ts,tsx}`, y las rutas nuevas de U3 caen dentro.
- Los seis `moduleNameMapper` ya resuelven los seis paquetes; U3 no añade ninguno.
- Los siete `coverageThreshold` al 80 % de líneas ya existen, incluidos los tres árboles que esta unidad publica.
- `testTimeout: 20000` se mantiene: las pruebas de pantalla montan el árbol completo con cobertura.
- `jest.setup.js` ya carga `@testing-library/react-native` y los dobles de `expo-splash-screen` y `expo-secure-store`. U3 no añade dobles globales.

## Dobles y datos de prueba

| Qué se dobla | Cómo | Regla |
|---|---|---|
| Sesión de la app | Objeto con `getSession`, `signIn`, `signOut` y `subscribeSession` | No se construye una sesión real ni se toca el almacenamiento seguro |
| Contenido | `createContentStore({ now, seed })` con reloj fijo y la siembra de producción o una mínima | `now = "2026-11-16T09:00:00.000Z"`; ninguna prueba llama a `new Date()` sin argumento (NFR5.7) |
| Catálogo | La instancia real con `session`, `search` y `resolve` en `null`; un doble de `searchWorks` para forzar `offline`, `error`, lista vacía y respuestas tardías | Sin puertos reales; en U3 la búsqueda todavía no habla con Spotify |
| Logger | Espía con la firma de `AppLogger` | Se comprueba el código literal (`SEARCH_PORT_UNAVAILABLE`) y que **no** se registre un `offline` previsto (NFR9.6) |
| Temporizadores | `jest.useFakeTimers()` en `useWorkSearch` y en `Snackbar` | Se avanzan 400 ms y 4 s con `jest.advanceTimersByTime`, nunca con esperas reales (NFR8.8, NFR8.10) |
| Red | `useNetwork` alimentado por un doble booleano | Ninguna prueba toca el sistema operativo (NFR4.5) |

Datos: la siembra de producción vive en `packages/content-store/src/seed.ts` y las pruebas **leen sus invariantes** (10 opiniones, 5 autores, 8 obras, 2 seguidos, 4 me gusta, 3 comentarios) en lugar de duplicar la tabla. Los textos de pantalla se comparan completos contra `functional-spec.md` § Textos exactos: «Publicar», «Guardar», «Editar mi opinión», «Seguir autor», «Siguiendo», «Opinión publicada», «Opinión actualizada», «Comentario publicado», «Ahora sigues a @ana», «Ya no sigues a @ana», «No pudimos publicar tu opinión.», «No pudimos guardar los cambios.», «No pudimos cargar tu opinión.», «No pudimos cargar los comentarios.», «No pudimos enviar tu comentario.», «No pudimos buscar en Spotify.», «No pudimos guardar tu me gusta», «No pudimos guardar tu seguimiento» y «Reintentar».

## Qué debe quedar probado por capa

| Capa | Pruebas |
|---|---|
| Modelo de datos (C4) | 500 acepta y 501 rechaza en `createOpinion`/`updateOpinion`; 300 acepta y 301 rechaza en `addComment`; `422` sin escritura; recorte antes de medir; el caso de más de 500 de `writes.test.ts` invertido. |
| Negocio — hoja | Los seis estados del controlador, `open` con lista vacía y con comentarios, `retry` solo con la hoja abierta, `close` que descarta el borrador, `submit` vacío, correcto y fallido, y los dos reintentos distintos. |
| Negocio — búsqueda | 2 caracteres, 400 ms, cancelación del temporizador anterior, respuesta tardía descartada, `results`/`empty`/`error`, reintento, `enabled: false` sin llamadas ni registros, y el puerto ausente registrado. |
| Negocio — acciones | Me gusta y quitarlo, seguir y dejar de seguir con sus textos, opinión propia sin me gusta ni seguir, `viewerId` ausente, «Editar» que abre la edición, y fallo que no cambia el estado. |
| Negocio — formulario | `validateOpinionDraft` (obra, texto, valoración, solo espacios, completo), `alreadyOpined`, las dos escrituras con `201`/`409`/`422`/`200`/`404`, «Guardar» sin cambios y borrador descartado al cambiar `formKey`. |
| Superficie (C1) | Las ocho piezas nuevas en sus estados, `SocialActionBar.showLike`, las dos etiquetas de seguir con sus `accessibilityLabel`, `OfflineBanner.message`, y la hoja en sus seis estados incluido el snackbar dentro del modal. |
| Superficie (C2) | `formKey` que sube en las tres entradas, `openEdit` desde Crear que conserva `returnTo`, `closeCreate` con su pila, atrás que cancela y consume, y montaje real de hoja y snackbar con limpieza por pestaña. |
| Interfaz | Crear en vacío, buscando, con obra, ya opinada, editando, error de carga, error de envío y sin conexión; el cambio de `formKey` sin desmontar el árbol deja campo vacío y sin obra; cada tarjeta de las cuatro pantallas recibe las acciones que le tocan. |
| Integración | Arranque → Crear real (no el marcador), hoja que se abre desde una tarjeta sin cambiar de pestaña, «Comentario publicado» visible con la hoja abierta, y una sola instancia del controlador por arranque. |

## Fuera del alcance automático

El recorrido real en el teléfono (Expo Go sobre Android físico) sigue siendo verificación manual y criterio de terminado de la versión: incluye publicar, editar, dar me gusta, seguir y comentar con y sin red, y comprobar que el teclado no tapa el campo. Ninguna prueba demuestra la respuesta de 400 ms en un dispositivo ni mide fotogramas.

## Pruebas que no valen

Nada de aserciones que siempre pasan, ni pruebas de pantalla que solo comprueban que el componente monta sin mirar el estado que se afirma. Una prueba de un texto exacto compara la cadena completa, no un fragmento. Una prueba de temporizador que no avance el reloj falso no demuestra nada, y una prueba de «sin conexión» que no cambie el estado del doble tampoco.
