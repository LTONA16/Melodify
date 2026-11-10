# Design System Mapping — Melodify

> **Provenance**: deriva de `inception/refined-mockups/mockups.md`, de `inception/requirements-analysis/requirements.md` (NFR6, RC-01, RC-06), de `inception/practices-discovery/team-practices.md` (Code Style) y de las respuestas de `refined-mockups-questions.md` (Q4 = A, Q5 = A).
> Fecha: 2026-11-09. Etapa: Refined Mockups. Agente: aidlc-design-agent.

## Decisión

**Sistema propio mínimo sobre React Native puro.** No se adopta ninguna librería de componentes (ni React Native Paper, ni NativeBase, ni Tamagui). Razones:

- La app tiene seis pantallas y una decena de componentes; una librería añadiría más superficie de la que ahorra.
- RC-01 limita a lo disponible en Expo Go: cada dependencia extra es una cosa más que puede pedir compilación propia o romper el arranque.
- El tema claro/oscuro y el contraste de NFR6 se controlan mejor con tokens propios que peleando con los valores por defecto de una librería.
- El equipo ya fijó la organización por dominio y la tarjeta de opinión como componente compartido; el sistema se alinea con eso.

**Qué sí se usa del ecosistema** (todo incluido en Expo Go, sin módulo nativo):

| Pieza | Uso | Por qué |
|---|---|---|
| `StyleSheet` de React Native | Estilos | Sin dependencias, tipado, rendimiento. |
| `useColorScheme` | Tema claro/oscuro | Sigue el tema del sistema (FR2.4) sin estado propio. |
| `expo-status-bar` | Barra de estado | Ajusta el contraste de los iconos del sistema al tema. |
| `@expo/vector-icons` (Ionicons) | Iconos de la barra inferior y de acciones | Viene con Expo, no requiere instalación ni compilación. |
| `expo-secure-store` | Token de Spotify | Ya exigido por FR10.3; aquí solo se documenta que no afecta al sistema visual. |

## Organización de los tokens

```
app/src/theme/
├── tokens.ts        # valores crudos: colores, tipografía, espacio, radios, tamaños
├── themes.ts        # lightTheme / darkTheme = tokens + roles semánticos
├── ThemeProvider.tsx# useColorScheme → tema activo, sin persistencia
└── useTheme.ts      # hook de acceso; ningún componente importa tokens.ts directo
```

Regla: **los componentes usan roles semánticos** (`color.text`, `color.surface`, `type.body`), nunca valores crudos (`#1B1B1F`, `16`). Así el tema oscuro no exige tocar componentes.

## Color

### Tokens de color

| Token | Claro | Oscuro | Rol |
|---|---|---|---|
| `color.bg` | `#FFFFFF` | `#121014` | Fondo de pantalla. |
| `color.surface` | `#F7F5F9` | `#1D1A21` | Superficie de tarjetas y filas. |
| `color.surfaceSunken` | `#EFEBF2` | `#171419` | Bloques hundidos: pista demo, skeletons base. |
| `color.surfaceRaised` | `#FFFFFF` | `#262230` | Hojas y elementos elevados sobre el fondo. |
| `color.text` | `#1B1B1F` | `#F2EFF4` | Texto principal. |
| `color.textSecondary` | `#5A5A63` | `#C9C3CE` | Texto secundario: artista, ayudas. |
| `color.textMuted` | `#6E6A75` | `#9E97A6` | Texto terciario e iconos inactivos. |
| `color.border` | `#D6D2D9` | `#3A3540` | Bordes decorativos de tarjeta. |
| `color.borderStrong` | `#6F6A75` | `#8C8698` | Bordes de campos interactivos y foco. |
| `color.primary` | `#7B2D8E` | `#E9B8F5` | Acción principal, pestaña activa, enlaces. |
| `color.onPrimary` | `#FFFFFF` | `#3B0A47` | Texto e icono sobre primario. |
| `color.primaryContainer` | `#F3E3F7` | `#3E1D49` | Fondo de destacados y de mi opinión. |
| `color.onPrimaryContainer` | `#3B0A47` | `#F3E3F7` | Texto sobre el contenedor primario. |
| `color.accentStar` | `#8F5400` | `#FFC46B` | Estrellas y su número. |
| `color.success` | `#1E6B3A` | `#7BD99B` | Punto de «Conectado» y confirmaciones. |
| `color.error` | `#B3261E` | `#FFB4AB` | Errores y acciones destructivas. |
| `color.onError` | `#FFFFFF` | `#5F1410` | Texto sobre error. |
| `color.errorContainer` | `#FCEEEE` | `#3B1214` | Fondo de bloques de error. |
| `color.onErrorContainer` | `#6B1A16` | `#FFDAD6` | Texto sobre el contenedor de error. |
| `color.warningContainer` | `#FFF4D6` | `#3A2A00` | Banner de sin conexión. |
| `color.onWarningContainer` | `#5C3D00` | `#FFD98E` | Texto del banner. |
| `color.overlay` | `rgba(18,16,20,0.40)` | `rgba(0,0,0,0.60)` | Velo tras la hoja de comentarios. |
| `color.skeleton` | `#E7E3EA` | `#2A2630` | Base de los esqueletos. |
| `color.skeletonHighlight` | `#F3F0F6` | `#353040` | Brillo del esqueleto (pulso de 1200 ms). |
| `color.focusRing` | `#7B2D8E` | `#E9B8F5` | Anillo de foco de 2 dp. |
| `color.inverseSurface` | `#2E2A33` | `#EDE8F2` | Fondo del snackbar. |
| `color.inverseText` | `#F7F5F9` | `#1B1B1F` | Texto del snackbar. |

### Contraste verificado

Ratios calculados con la fórmula de luminancia relativa de WCAG 2.1, sobre los pares que la interfaz usa de verdad. El mínimo de NFR6 es **4.5:1** para texto normal y **3:1** para texto grande (≥ 18.66 px bold o ≥ 24 px) e iconos.

| Par | Tema | Ratio | Uso | Cumple |
|---|---|---|---|---|
| `text` sobre `bg` | Claro | 17.2:1 | Texto principal | 4.5:1 ✔ |
| `textSecondary` sobre `bg` | Claro | 6.8:1 | Artista, ayuda | 4.5:1 ✔ |
| `textMuted` sobre `bg` | Claro | 5.3:1 | Texto terciario | 4.5:1 ✔ |
| `primary` sobre `bg` | Claro | 8.1:1 | Enlaces y acción | 4.5:1 ✔ |
| `onPrimary` sobre `primary` | Claro | 8.1:1 | Texto del botón | 4.5:1 ✔ |
| `onPrimaryContainer` sobre `primaryContainer` | Claro | 13.0:1 | Mi opinión destacada | 4.5:1 ✔ |
| `accentStar` sobre `bg` | Claro | 6.1:1 | Estrellas y «4/5» | 4.5:1 ✔ |
| `success` sobre `bg` | Claro | 6.5:1 | «Conectado» | 4.5:1 ✔ |
| `error` sobre `bg` | Claro | 6.5:1 | Mensajes de error | 4.5:1 ✔ |
| `onWarningContainer` sobre `warningContainer` | Claro | 9.0:1 | Banner sin conexión | 4.5:1 ✔ |
| `borderStrong` sobre `bg` | Claro | 5.3:1 | Borde de campo | 3:1 ✔ |
| `border` sobre `bg` | Claro | 1.5:1 | Borde decorativo, no informativo | No aplica |
| `text` sobre `bg` | Oscuro | 16.6:1 | Texto principal | 4.5:1 ✔ |
| `textSecondary` sobre `bg` | Oscuro | 11.0:1 | Artista, ayuda | 4.5:1 ✔ |
| `textMuted` sobre `bg` | Oscuro | 6.7:1 | Texto terciario | 4.5:1 ✔ |
| `primary` sobre `bg` | Oscuro | 11.4:1 | Acción | 4.5:1 ✔ |
| `onPrimary` sobre `primary` | Oscuro | 9.6:1 | Texto del botón | 4.5:1 ✔ |
| `accentStar` sobre `bg` | Oscuro | 12.0:1 | Estrellas | 4.5:1 ✔ |
| `success` sobre `bg` | Oscuro | 11.0:1 | «Conectado» | 4.5:1 ✔ |
| `error` sobre `bg` | Oscuro | 11.1:1 | Errores | 4.5:1 ✔ |
| `onWarningContainer` sobre `warningContainer` | Oscuro | 10.3:1 | Banner sin conexión | 4.5:1 ✔ |
| `borderStrong` sobre `bg` | Oscuro | 5.4:1 | Borde de campo | 3:1 ✔ |

**Reglas de color**

1. El color nunca es el único portador de significado: la valoración lleva estrellas **y** número; el estado de Spotify lleva texto **e** icono; el error lleva texto **e** icono.
2. `color.border` (1.5:1) es decorativo y no puede delimitar un control interactivo. Los campos usan `color.borderStrong`.
3. Prohibido introducir un color fuera de esta tabla. Si hace falta uno, entra como token con su par de contraste verificado.

## Tipografía

**Familia**: fuente del sistema (`Roboto` en Android). No se cargan fuentes propias: una fuente descargada añade una pantalla de espera y un fallback visible, y no aporta al objetivo de esta versión.

**Escala** (tamaño / altura de línea / peso):

| Token | Tamaño | Altura | Peso | Uso |
|---|---|---|---|---|
| `type.display` | 32 | 40 | 700 | «Melodify» en Login. |
| `type.title1` | 24 | 32 | 700 | Título de pantalla (`h1`), nombre en Perfil. |
| `type.title2` | 20 | 28 | 600 | Encabezados de sección: «Para ti», «Tu opinión», «Mis opiniones». |
| `type.headline` | 18 | 26 | 600 | Título de obra en el detalle. |
| `type.body` | 16 | 24 | 400 | Texto de opinión, campos, párrafos. |
| `type.bodySmall` | 15 | 22 | 400 | Texto de tarjeta en el feed, filas. |
| `type.label` | 14 | 20 | 500 | Botones, pestañas, contadores, encabezado de día. |
| `type.caption` | 12 | 16 | 400 | Fechas, ayudas, pista demo, «4 de 5». |

**Reglas**

- Un solo `h1` por pantalla; los encabezados de sección son `title2`, no compiten con el título.
- El texto de opinión se recorta por líneas (`numberOfLines`), nunca por caracteres; el detalle no recorta.
- `allowFontScaling` se mantiene activo (por defecto). La interfaz se prueba al 130 % de escala del sistema: ninguna altura de texto es fija, las tarjetas crecen.
- Los textos de botón nunca bajan de 14 dp; los de cuerpo, de 15 dp en tarjeta y 16 dp en el resto.

## Espaciado, radios y tamaños

**Escala de espaciado** (múltiplos de 4):

| Token | dp | Uso típico |
|---|---|---|
| `space.1` | 4 | Separación icono-texto. |
| `space.2` | 8 | Dentro de una fila. |
| `space.3` | 12 | Entre tarjetas del feed. |
| `space.4` | 16 | Margen lateral de pantalla en compacto; padding de tarjeta. |
| `space.5` | 20 | Entre secciones. |
| `space.6` | 24 | Margen lateral en medio; bloques grandes. |
| `space.8` | 32 | Separación antes de un botón principal. |
| `space.10` | 40 | Aire en estados vacíos. |

**Radios**

| Token | dp | Uso |
|---|---|---|
| `radius.sm` | 8 | Campos, chips, bloques de inicial. |
| `radius.md` | 12 | Tarjetas, banners, botones. |
| `radius.lg` | 16 | Hojas y contenedores grandes. |
| `radius.xl` | 24 | Hoja de comentarios (esquinas superiores). |
| `radius.pill` | 999 | Avatar circular, píldora de estado. |

**Tamaños**

| Token | dp | Uso |
|---|---|---|
| `size.touch` | 44 | Mínimo de toda área tocable (NFR6). |
| `size.header` | 56 | Altura de `AppHeader`. |
| `size.tabBar` | 56 | Altura de la barra inferior, más `safe.bottom`. |
| `size.field` | 48 | Campo de una línea. |
| `size.button` | 48 | Botón principal. |
| `size.cover.feed` | 56 | Portada en tarjeta de feed. |
| `size.cover.result` | 56 | Portada en resultado de búsqueda. |
| `size.cover.detail` | 96 | Portada en detalle de obra. |
| `size.avatar` | 40 | Avatar en tarjeta y comentario. |
| `size.avatar.profile` | 72 | Avatar en Perfil. |
| `size.icon` | 24 | Icono estándar. |
| `size.icon.small` | 20 | Iconos sociales de la tarjeta. |

**Elevación**: el sistema es **plano**. Las tarjetas se separan con borde de 1 dp y color de superficie; la única elevación real es la hoja de comentarios (`shadowOpacity 0.18`, `shadowRadius 16`, `elevation 12` en Android) y el snackbar (`elevation 8`).

**Movimiento**

| Interacción | Duración | Curva |
|---|---|---|
| Aparición de la hoja | 220 ms | `ease-out` |
| Snackbar entra/sale | 180 ms | `ease-in-out` |
| Pulso del esqueleto | 1200 ms, bucle | `ease-in-out` |
| Cambio de pestaña | Sin animación | — |
| Corazón al dar me gusta | 120 ms, escala 1 → 1.2 → 1 | `ease-out` |

Se respeta «reducir movimiento» del sistema: con la opción activa, el corazón cambia sin escala y el esqueleto no pulsa (queda estático).

## Iconografía

| Uso | Icono | Origen |
|---|---|---|
| Pestañas | `home` / `home-outline`, `search` / `search-outline`, `add-circle` / `add-circle-outline`, `heart` / `heart-outline`, `person` / `person-outline` | Ionicons |
| Volver | `chevron-back` | Ionicons |
| Cerrar hoja | `close` | Ionicons |
| Reintentar | `refresh` | Ionicons |
| Sin conexión | `cloud-offline-outline` | Ionicons |
| Error | `alert-circle` | Ionicons |
| Conectado | `checkmark-circle` | Ionicons |
| Enviar comentario | `send` | Ionicons |
| Limpiar búsqueda | `close-circle` | Ionicons |
| Me gusta en la tarjeta | Glifo de texto `♡` / `♥` | FR7.1 lo nombra así y la prueba lo comprueba |
| Comentario en la tarjeta | Glifo de texto `💬` | FR7.2 lo nombra así |
| Valoración | Glifo `★` / `☆` | La tarjeta usa glifos para que la valoración se lea igual en cualquier dispositivo |

Regla: los iconos de navegación y acción son vectoriales; los glifos sociales y de valoración son texto, porque los requisitos los nombran literalmente y porque así el número y el símbolo se alinean en la misma línea base.

## Inventario de componentes y tokens

| Componente | Superficie | Tokens propios |
|---|---|---|
| `AppHeader` | `color.bg`, borde inferior `color.border` | `type.title1`, `size.header`, `space.4` |
| `BottomTabBar` | `color.bg`, borde superior `color.border` | `size.tabBar`, `size.touch`, `color.primary` / `color.textMuted` |
| `OpinionCard` | `color.surface`, `radius.md`, borde `color.border` | `space.4`, `type.bodySmall`, `type.caption` |
| `CoverArt` | Bloque de inicial `color.surfaceSunken` | `radius.sm`, `type.title2`, `size.cover.*` |
| `RatingStars` | — | `color.accentStar`, `type.caption` |
| `RatingInput` | — | `color.accentStar`, `size.touch` |
| `Avatar` | `color.primaryContainer` | `radius.pill`, `type.label`, `size.avatar` |
| `SocialActionBar` | — | `color.textSecondary`, `color.error` (corazón activo), `size.touch` |
| `ConnectionCard` | `color.primaryContainer`, `radius.md` | `space.4`, `type.title2`, `type.body`, `PrimaryButton` |
| `SpotifyCard` | `color.surface`, `radius.md`, borde `color.border` | `space.4`, `type.label`, `TextButton` |
| `EmptyState` | — | `type.title2`, `type.body`, `space.10` |
| `ErrorState` | `color.errorContainer`, `radius.md` | `type.body`, `color.onErrorContainer`, `TextButton` |
| `Skeleton` | `color.skeleton` / `color.skeletonHighlight` | `radius.md` |
| `Snackbar` | `color.inverseSurface`, `radius.md`, `elevation 8` | `type.bodySmall`, `color.inverseText` |
| `CommentSheet` | `color.surfaceRaised`, `radius.xl`, `shadow*` | `space.4`, `type.title2`, `size.touch` |
| `SearchField` | `color.surface`, borde `color.borderStrong`, `radius.sm` | `size.field`, `type.body`, `color.textMuted` |
| `TextField` / `MultilineField` | igual que `SearchField` | `size.field`, `type.body` |
| `PrimaryButton` / `SecondaryButton` / `TextButton` | primario / borde / sin fondo | `size.button`, `radius.md`, `type.label` |
| `WorkResultRow` | `color.surface` | `size.cover.result`, `type.body`, `type.caption` |
| `ActivityRow` | `color.surface`, `radius.md` | `type.bodySmall`, `type.caption`, `size.icon.small` |
| `DayHeader` | `color.bg` | `type.label`, `color.textSecondary` |
| `Banner` | `color.warningContainer` | `type.bodySmall`, `color.onWarningContainer` |

## Correspondencia con React Native

| Token del sistema | Se escribe como |
|---|---|
| `color.*` | Objeto `colors` del tema activo; se consume con `useTheme().colors`. |
| `type.*` | `{ fontSize, lineHeight, fontWeight }`; se aplica con `StyleSheet.compose(textStyle, type.body)`. |
| `space.*`, `radius.*`, `size.*` | Números en `tokens.ts`; nunca literales en componentes. |
| Tema | `useColorScheme()` devuelve `'light'` o `'dark'`; `null` se trata como `'light'`. No hay selector manual ni persistencia: la app sigue al sistema (FR2.4). |
| Barra de estado | `expo-status-bar` con `style="auto"`. |
| Borde de tarjeta | `borderWidth: 1, borderColor: colors.border` en lugar de sombra. |
| Altura de la barra inferior | `size.tabBar + insets.bottom` con `react-native-safe-area-context` (incluido en Expo). |

Ningún componente importa `tokens.ts` directamente: todos pasan por `useTheme()`. Así el tema oscuro es una consecuencia del token, no una condición repartida por el código.

## Lo que cambia respecto a los wireframes

| Wireframe | Mockup refinado | Por qué |
|---|---|---|
| Sin color ni tipografía | Paleta plum + neutros cálidos, escala de 8 pasos, fuente del sistema | A4 pedía resolver color y tipografía aquí. |
| Iconos `⌂ ⌕ + ♡ ☺` | Ionicons con relleno/contorno según estado | Un icono de contorno no distingue la pestaña activa; el relleno sí. |
| Cabecera «⚙ Spotify» | Chip de estado «● Conectado» / botón «Conectar» | El engranaje sugería ajustes que no existen. |
| Perfil «12 opiniones · 8 siguiendo» | «3 opiniones · 2 siguiendo» | FR3.7 y AC9.1.2 fijan el contenido de ejemplo. |
| Tarjeta con texto libre | Texto a 3 líneas en el feed, completo en el detalle | Coherencia con FR3.1 y AC2.3.3. |

## Assumptions & Open Questions

- `[assumption]` Los valores hexadecimales son la propuesta del diseño y se validan al construir la primera pantalla con un comprobador de contraste; si un tono falla en el dispositivo, se ajusta el token, no el componente.
- `[assumption]` El límite de texto de la opinión (OQ1) no altera la tipografía: si Functional Design fija un máximo, se añade el contador bajo el campo con `type.caption` y `color.textMuted`.
- `[assumption]` No se cargan fuentes propias; si el proyecto crece y quiere una identidad tipográfica, entra como token nuevo y una pantalla de carga, decisión que no se toma aquí.
- **Ninguna pregunta abierta bloquea la construcción.**

## Sources

- `inception/refined-mockups/mockups.md` (`mockups`) — pantallas y componentes que consumen estos tokens.
- `ideation/rough-mockups/wireframes.md` (`wireframes`) — seis pantallas y tarjeta compartida que el sistema viste.
- `ideation/rough-mockups/user-flow.md` (`user-flow`) — camino feliz y recuperación de errores que los estados de color y movimiento deben sostener.
- `inception/user-stories/stories.md` (`stories`) — criterios que exigen los componentes y sus estados.
- `inception/requirements-analysis/requirements.md` (`requirements`) — NFR6 (contraste y áreas táctiles), RC-01 (Expo Go), RC-06 (solo español).
- `inception/practices-discovery/team-practices.md` (`team-practices`) — Prettier, ESLint, TypeScript estricto, organización por dominio.
- `inception/refined-mockups/refined-mockups-questions.md` (`refined-mockups-questions`) — Q4 = sistema propio, Q5 = accesibilidad de NFR6.
