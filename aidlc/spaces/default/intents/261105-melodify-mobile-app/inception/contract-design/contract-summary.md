# Contratos — Melodify

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (`unit-of-work`), `inception/units-generation/unit-of-work-dependency.md` (`unit-of-work-dependency`), `inception/domain-design/components.md` (`components`), `inception/requirements-analysis/requirements.md` (`requirements`) y de las respuestas de `contract-design-questions.md` (Q1–Q5, F1 y F2).
> Fecha: 2026-11-09. Etapa: Contract Design. Agente: aidlc-architect-agent. Profundidad: Standard.
> Revisión 13 (2026-11-12): enmienda de NFR Requirements de U2 — C6 publica su superficie de construcción, `createConnectivity({ network })`, que hasta ahora vivía solo en el Functional Design; C2 corrige la invariante del aviso de sin conexión (lo pinta cada pantalla bajo su cabecera, no la cáscara), sin cambio de props; C3 y C4 no cambian: los códigos de diagnóstico de U2 se declaran en `app/src/bootstrap/logger.ts` con un tipo de la app asignable a `SessionLogger`.
> Revisión 12 (2026-11-12): enmiendas del Functional Design de U2 — C1 completa su `1.2.0` (`AppHeader.leftSlot`, `EmptyState.body` opcional, estado `own` de `OpinionCard` y `formatCalendarDate`); C2 sube a `1.2.0` por comportamiento (`AppShell` monta toda la pila de la pestaña y oculta las entradas de debajo, para que volver del detalle conserve el feed y AC2.3.2 se cumpla; sin cambio de props ni exportaciones); C4 declara `createContentStore({ now?, seed? })` y el `422` de lectura sin `viewerId`; C5 sube a `1.1.0` con `subscribe`, `getCoverFailure`, `retryCovers` y `createCatalog({ content, connectivity, session, search, resolve })`; C6 se publica en `1.0.0` sin cambios. La revisión 11 (2026-11-11) registró la superficie aditiva realmente enviada por U1 —C1 y C2 a `1.1.0`, el token `space` alineado y C3 completa—. La revisión 10 (2026-11-11) enmendó C3 con el puerto de registro `SessionLogger` y las opciones de `createAppSession`, sin cambiar ninguna operación. La revisión 9 enmendó C1 (entrega por versiones) y el fallo de lectura de C3 (sin reintento). La revisión 8 cerró R-44…R-47, la 7 cerró R-39 y R-41…R-43, la 6 R-33…R-40, la 5 R-27…R-32, la 4 R-19 y R-22…R-26, la 3 R-12…R-21 y la 2 R-01…R-11. El registro de cambios está al final.

## Cómo leer este documento

Cada frontera entre unidades es un contrato: qué cruza, en qué forma y qué pasa cuando algo falla. Los contratos tienen **forma de petición y respuesta** (operación, entrada, salida, códigos), pero se ejecutan **en proceso**: son funciones y contextos tipados dentro de la app, no un servidor HTTP. Las dos únicas fronteras HTTP reales son las de Spotify, que la app consume.

Los paquetes viven en un monorepo con espacios de trabajo: cada uno tiene su `package.json`, su versión semántica y su dueño. La app (`@melodify/app`) los resuelve como cualquier dependencia. La estructura concreta y cómo la atraviesan los tres scripts del CI están en «Estructura del monorepo».

**Dirección de las dependencias**: ningún paquete interno importa a otro que dependa de él. Donde el Domain Design hace que un componente «pida» algo a otro que llega en una unidad posterior, la frontera se invierte: el paquete que necesita el dato declara un **puerto**, el paquete que lo produce lo implementa, y `@melodify/app` los conecta al arrancar. Hay **tres inversiones de puerto**, todas de U2 hacia U4:

1. `SpotifySessionPort` — `Catalog` necesita saber si hay sesión.
2. `SpotifySearchPort` — `Catalog` necesita buscar.
3. `SpotifyResolvePort` — `Catalog` necesita la portada y los metadatos de una obra conocida.

Aparte de los puertos, hay una **inyección de la cáscara**: `ShellServices` lleva a `AppShell` el estado de red, el estado de Spotify y sus acciones, con valores por defecto que U1 puede usar sola. No es un puerto hacia una unidad posterior y no cuenta entre las inversiones; la cáscara nunca importa `@melodify/connectivity` ni `@melodify/spotify`.

## Tabla de contratos

| # | Proveedor (paquete) | Consumidor | Mecanismo | Dueño |
|---|---|---|---|---|
| C1 | U1 · `@melodify/design-system` | U2, U3, U4, U5, U6 | esquema compartido, en proceso | U1 |
| C2 | U1 · `@melodify/app-shell` | U2, U3, U4, U5, U6 | esquema compartido, en proceso | U1 |
| C3 | U1 · `@melodify/app-session` | U2, U3, U5 | petición/respuesta, en proceso | U1 |
| C4 | U2 · `@melodify/content-store` | U3, U5 | petición/respuesta, en proceso | U2 |
| C5 | U2 · `@melodify/catalog` | U3, U4 | petición/respuesta + puertos, en proceso | U2 |
| C6 | U2 · `@melodify/connectivity` | U2 (Catalog) y el punto de composición | petición/respuesta, en proceso | U2 |
| C7 | U4 · `@melodify/spotify` | punto de composición de `@melodify/app` (lo crea U1, lo rellena U4) y U6 | petición/respuesta, en proceso | U4 |
| C8 | U5 · `@melodify/activity` | U6 | petición/respuesta, en proceso | U5 |
| C9 | Spotify Accounts API | U4 | HTTP real | Spotify |
| C10 | Spotify Web API | U4 | HTTP real | Spotify |

U6 no expone contrato propio: consume los de C1–C8 y verifica el recorrido. U3 no publica paquete: sus pantallas viven en `@melodify/app` y consumen C1–C5. U2 **no** figura como consumidor de C7: solo declara los tres puertos que U4 implementa, y `@melodify/catalog` nunca importa `@melodify/spotify` en tiempo de ejecución. U1 no figura como consumidor de C6 ni de C7: la cáscara recibe `ShellServices` inyectado y arranca con valores por defecto.

## Estructura del monorepo

```text
melodify/
├── package.json              # raíz: espacios de trabajo y los tres scripts del CI
├── jest.config.js            # un solo proyecto; cobertura de app/src y packages/*/src
├── tsconfig.json             # referencias de proyecto a cada paquete
├── eslint.config.js          # ESLint de Expo sobre todo el árbol
├── app/                      # @melodify/app — Expo Go, navegación, pantallas y arranque
│   ├── package.json          # privado, versión 0.0.0: no es un contrato versionado
│   └── src/
│       ├── bootstrap/        # punto de composición (U1 lo crea; U2, U3 y U4 lo rellenan)
│       ├── comments/         # controlador de presentación de la hoja de comentarios (U3)
│       ├── screens/          # una carpeta por pantalla: U2 (Inicio, Detalle, Perfil),
│       │                     # U3 (Crear), U4 (Explorar), U5 (Actividad) y U6 (recorrido)
│       └── ...
└── packages/
    ├── design-system/        # @melodify/design-system   (U1)
    ├── app-shell/            # @melodify/app-shell       (U1)
    ├── app-session/          # @melodify/app-session     (U1)
    ├── content-store/        # @melodify/content-store   (U2)
    ├── catalog/              # @melodify/catalog         (U2)
    ├── connectivity/         # @melodify/connectivity    (U2)
    ├── spotify/              # @melodify/spotify         (U4)
    └── activity/             # @melodify/activity        (U5)
```

**Cómo el CI alcanza los paquetes** (el `.github/workflows/ci.yml` no cambia de comandos; cambia lo que cada comando recorre):

| Comando | Qué hace ahora |
|---|---|
| `npm test` | `jest --coverage` en la raíz, con un solo proyecto que incluye `app/` y `packages/*`. Ningún paquete tiene script propio: la raíz manda. |
| `npm run typecheck` | `tsc -b` sobre las referencias de proyecto: cada paquete se comprueba y los consumidores ven sus tipos. |
| `npm run lint` | `eslint .` sobre todo el árbol, con la configuración de Expo en la raíz. |

**Cobertura**: el umbral del 80 % de líneas se mide **por ruta**, con una entrada de `coverageThreshold` por árbol: `./app/src/**`, `./packages/design-system/src/**`, `./packages/app-shell/src/**`, `./packages/app-session/src/**`, `./packages/content-store/src/**`, `./packages/catalog/src/**`, `./packages/connectivity/src/**`, `./packages/spotify/src/**` y `./packages/activity/src/**`, todas a 80. Así ningún paquete puede compensarse con otro ni con `app/src`: cada uno cumple o el CI se pone rojo. La cobertura se mide sobre las rutas existentes; una ruta de paquete que aún no se ha creado se añade a su entrada cuando la unidad que lo crea lo cree.

**Dueño de `@melodify/app`**: es la aplicación, no un paquete de contrato, y su `package.json` es privado, queda en `0.0.0` y no sigue semver. U1 es dueño del arranque, la navegación y `bootstrap/`; cada unidad es dueña de sus carpetas de pantalla y de los archivos que crea dentro de `app/src/`. La regla «un consumidor propone, no cambia» se aplica a los paquetes de contrato; las pantallas se coordinan por PR, como cualquier cambio de la app.

**Enmienda a `unit-of-work.md`**: esa etapa asumió «un único `package.json` y un único árbol `app/src/`; no hay paquetes internos ni monorepo». La respuesta F2 = B sustituye esa suposición. El trabajo por unidad no cambia; cambia dónde aterriza el código de cada una.

## C1 — Sistema de diseño

```yaml
shared-schema:
  package: '@melodify/design-system'
  version: 1.1.0
  owner: U1
  transport: import en proceso
  exports:
    ThemeProvider:
      props: { scheme: "light | dark | system" }
    tokens:
      color: { bg, surface, surfaceSunken, surfaceRaised, text, textSecondary, textMuted,
               border, borderStrong, primary, onPrimary, primaryContainer, onPrimaryContainer,
               accentStar, success, error, onError, errorContainer, onErrorContainer,
               warningContainer, onWarningContainer, overlay, skeleton, skeletonHighlight,
               focusRing, inverseSurface, inverseText }
      type: { display, title1, title2, headline, body, bodySmall, label, caption }
      space: { 1, 2, 3, 4, 5, 6, 8, 10 }
      radius: { sm, md, lg, xl, pill }
      size: { header, tabBar, touch, cover, field, button, avatar, icon }
    components:
      AppHeader:            { title: string, rightSlot?: ReactNode }
      BottomTabBar:         { items: "TabItem[]", activeIndex: number, onSelect: "(index: number) => void" }
      OpinionCard:          { opinion: OpinionCardModel, variant: "feed | compact | detail",
                              isOwn: boolean, onPress?: "() => void", onLike?: "() => void",
                              onComment?: "() => void", onFollow?: "() => void", onEdit?: "() => void" }
      CoverArt:             { title: string, coverUrl: "string | null", size: "card | result | detail" }
      RatingStars:          { rating: number, max?: number, showValue?: boolean }
      RatingInput:          { value: number, onChange: "(value: number) => void", disabled?: boolean }
      Avatar:               { author: AuthorSummary, size?: "small | medium | large" }
      SocialActionBar:      { likeCount: number, commentCount: number, likedByMe: boolean,
                              onLike?: "() => void", onComment?: "() => void" }
      ConnectionCard:       { title: string, body: string, actionLabel: string, onAction: "() => void" }
      SpotifyCard:          { status: "disconnected | connecting | connected | connectionError | invalidToken | notConfigured",
                              onConnect: "() => void", onDisconnect: "() => void", onRetry: "() => void" }
      EmptyState:           { title: string, body: string, actionLabel?: string, onAction?: "() => void" }
      ErrorState:           { message: string, retryLabel: string, onRetry: "() => void" }
      Skeleton:             { shape: "card | row | header", count: number }
      Snackbar:             { message: string, visible: boolean, onDismiss: "() => void" }
      CommentSheet:         { opinionId: string, comments: "CommentModel[]", status: "loading | ready | empty | error",
                              onRetry: "() => void", onSubmit: "(text: string) => void", onClose: "() => void" }
      SearchField:          { value: string, placeholder: string, onChange: "(text: string) => void" }
      TextField:            { label: string, value: string, onChange: "(text: string) => void",
                              error?: string, maxLength?: number, placeholder?: string,
                              secureTextEntry?: boolean,
                              autoCapitalize?: "none | sentences | words | characters",
                              autoFocus?: boolean, testID?: string }
      MultilineField:       { label: string, value: string, onChange: "(text: string) => void",
                              error?: string, maxLength?: number }
      PrimaryButton:        { label: string, onPress: "() => void", disabled?: boolean, loading?: boolean,
                              testID?: string }
      SecondaryButton:      { label: string, onPress: "() => void", disabled?: boolean }
      TextButton:           { label: string, onPress: "() => void", tone?: "default | danger", disabled?: boolean }
      WorkResultRow:        { work: WorkSummary, opinionCount: number, onPress: "() => void" }
      ActivityRow:          { event: ActivityEventSummary, onPress: "() => void" }
      DayHeader:            { label: string }
      Banner:               { message: string, actionLabel?: string, onAction?: "() => void" }
    view-models:
      OpinionCardModel:
        fields: { opinionId: string, authorId: string, authorName: string, authorHandle: string,
                  followedByMe: boolean, workId: string, workTitle: string, workArtist: string,
                  coverUrl: string | null, text: string, rating: number, createdAt: string,
                  updatedAt: string, likeCount: number, commentCount: number,
                  likedByMe: boolean }
      CommentModel:
        fields: { commentId: string, authorName: string, authorHandle: string, text: string, createdAt: string }
      WorkSummary:
        fields: { workId: string, title: string, artist: string, coverUrl: string | null }
      ActivityEventSummary:
        fields: { eventId: string, kind: "ownOpinion | likeReceived | commentReceived",
                  opinionId: string, workTitle: string, createdAt: string, actorHandle?: string }
      AuthorSummary:
        fields: { displayName: string, handle: string }
      TabItem:
        fields: { name: string, label: string, icon: "home | search | plus | activity | profile" }
      rule: >
        Los modelos de presentación son de C1 y viven en `@melodify/design-system`; son la
        única forma de datos que el sistema de diseño conoce. No importa `OpinionView`,
        `CommentView`, `WorkView` ni `ActivityEventView` de C4, C5 o C8, ni esos paquetes
        importan C1. El mapeo es una función explícita de presentación —los nombres no
        coinciden (`author.displayName` frente a `authorName`) y hay campos que la vista no
        trae—, por ejemplo `toOpinionCardModel(view: OpinionView): OpinionCardModel`. Vive en
        la pantalla (`app/src/screens/…`) o en el controlador de presentación
        (`app/src/comments/…` para la hoja de comentarios), nunca en el sistema de diseño ni
        en el paquete de la entidad, y lo comprueba `tsc`.
    states:
      EmptyState: reusable en toda pantalla vacía
      ErrorState: reusable en todo error con reintento
      Skeleton: relleno de carga
      Banner: aviso de sin conexión (FR11.4)
  invariants:
    - "Ningún consumidor usa colores ni tamaños crudos; todo pasa por `tokens` del tema activo."
    - "`OpinionCard` es la única tarjeta de opinión; `isOwn` es una propiedad, no una variante, y vive solo ahí — el modelo no la lleva y la pantalla la pasa desde `OpinionView.isOwn`."
    - "El inventario de `design-system-mapping.md` es la lista autoritativa de piezas, pero se entrega por versiones: la 1.0.0 exporta los tokens completos y las doce piezas del esqueleto, y cada unidad posterior añade las suyas (§ «Enmienda de la revisión 9»). Ninguna pantalla reimplementa una pieza: cada pieza existe en C1 antes de que la unidad que la usa construya su pantalla."
    - "Los contrastes y tamaños son los de `design-system-mapping.md`."
    - "El inventario crece de forma aditiva: añadir una pieza sube la versión menor; cambiar props existentes, la mayor."
    - "C1 no importa tipos de C4, C5 ni C8: las props usan sus propios modelos de presentación y la pantalla mapea. Así U1 compila su subconjunto sin esperar a U2 ni a U5."
```

### Enmienda de la revisión 9 — qué exporta cada versión de C1

Esta enmienda sustituye dos frases que afirmaban una entrega única en U1: el invariante anterior «El inventario de `design-system-mapping.md` está completo aquí» y la de `components.md` § DesignSystem («Implementa **todo** el inventario de `design-system-mapping.md`»). El inventario sigue siendo la lista autoritativa; lo que cambia es **cuándo** entra cada pieza, porque el 80 % de cobertura se mide por paquete y una pieza que ninguna pantalla usa hay que probarla igual.

La 1.0.0 —la versión que U1 publica— exporta los **tokens completos** (`color`, `type`, `space`, `radius`, `size`), `ThemeProvider` y estas **doce piezas**: `AppHeader`, `BottomTabBar`, `OpinionCard`, `CoverArt`, `RatingStars`, `Avatar`, `SocialActionBar`, `TextField`, `PrimaryButton`, `EmptyState`, `Banner` y `Skeleton`. Las trece restantes del inventario entran así, en el orden en que se construyen los Bolts:

| Versión | Unidad que la entrega | Piezas que entran | Por qué ahí |
|---|---|---|---|
| 1.0.0 | — (borrador de la revisión 9) | tokens, `ThemeProvider` y las doce piezas del esqueleto | Base planificada antes de construir U1; ninguna unidad la consumió. |
| 1.1.0 | U1 | la base más las props aditivas y las utilidades de la § Revisión 11 | Es lo que el tramo mínimo pinta y prueba de verdad. |
| 1.2.0 | U2 | `ErrorState`, `TextButton`; y, en la misma versión, tres adiciones opcionales de la revisión 12: `AppHeader.leftSlot?`, `EmptyState.body?` y el estado `own` de `OpinionCard` con `formatCalendarDate` | Los estados de error del feed y de Perfil (FR11.1, FR11.2); el botón de reintento es el `TextButton` de `ErrorState`. Las tres adiciones son las que hacen falta para el «‹ Volver» del detalle, el vacío de Perfil y la opinión propia «destacada» (AC2.3.2, AC9.1.5, AC4.2.1, AC4.2.4). |
| 1.3.0 | U4 | `SearchField`, `ConnectionCard`, `SpotifyCard`, `WorkResultRow` | Explorar busca, conecta y lista resultados (FR4.1, FR4.5); U4 se construye antes que U3 en la secuencia acordada. |
| 1.4.0 | U3 | `RatingInput`, `MultilineField`, `SecondaryButton`, `CommentSheet`, `Snackbar` | El formulario de Crear, la hoja de comentarios y los avisos que la acompañan (FR5.1, FR5.4, FR7.x). `SecondaryButton` aparece con el «Cancelar» de Crear; `SearchField` de Crear se reutiliza de la 1.3.0. |
| 1.5.0 | U5 | `ActivityRow`, `DayHeader` | La lista de Actividad y sus encabezados por día (FR8.x). |

Cada fila es un cambio **aditivo**: añade exportaciones y sube la versión menor; las props de una pieza existente solo cambian cuando lo añadido es opcional, como `AppHeader.leftSlot?`, `EmptyState.body?` y el estado `own` de `OpinionCard` de la revisión 12, que dejan compilando a quien use la forma anterior. Un consumidor que importe una pieza antes de su versión no compila, y eso es deliberado: obliga a que la unidad que la necesita la haya entregado antes. `Snackbar` y `CommentSheet` siguen siendo de U3 aunque la cáscara de U1 ya declare sus puntos de montaje: en U1 ninguno de los dos llega a pintarse, porque el aviso nunca se dispara y la hoja solo se pinta con un `opinionId` que en el esqueleto nunca existe.

## C2 — Cáscara de la app

```yaml
shared-schema:
  package: '@melodify/app-shell'
  version: 1.2.0
  owner: U1
  transport: import en proceso
  exports:
    AppShell:
      props:
        screens: ScreenModule[]
        initialRoute: string
        services: ShellServices
        entry?: ReactNode   # rama de sesión (Login), fuera de la barra; cuando viene, la barra no se pinta
    ShellServices:
      shape:
        network:
          online: boolean
          subscribe: "(listener: (online: boolean) => void) => unsubscribe"
        spotify:
          status: SpotifyStatus
          subscribe: "(listener: (status: SpotifyStatus) => void) => unsubscribe"
          connect: "() => void"
          disconnect: "() => void"
          retry: "() => void"
        comments:
          state: CommentSheetState
          subscribe: "(listener: (state: CommentSheetState) => void) => unsubscribe"
          open: "(opinionId: string) => void"
          close: "() => void"
          retry: "() => void"
          submit: "(text: string) => void"
      hook: 'useShellServices(): ShellServices — las pantallas leen estado y acciones por aquí'
      default_by_owner: >
        U1 arranca con `{ network: { online: true, subscribe: () => noop } }`,
        `{ spotify: { status: 'disconnected', subscribe: () => noop, connect: noop,
        disconnect: noop, retry: noop } }` y una hoja de comentarios vacía
        (`{ state: { opinionId: null, comments: [], status: 'empty' }, subscribe: () => noop,
        open: noop, close: noop, retry: noop, submit: noop }`) desde
        `app/src/bootstrap/shell-services.ts`. U2 y U4 sustituyen las implementaciones de red y
        de Spotify en el punto de composición; U3 sustituye el controlador de comentarios por el
        que construye con `createCommentsController({ content, session })` en
        `app/src/comments/`: `content` es C4 (`listComments`, `addComment`) y `session` es C3, de
        donde toma el `authorId` que exige `addComment`. La cáscara y las pantallas no cambian.
    CommentSheetState:
      fields: { opinionId: "string | null", comments: "CommentModel[]", status: "loading | ready | empty | error" }
    ScreenModule:
      shape:
        name: string
        title: string
        component: React.ComponentType<ScreenProps>
        details?: DetailScreen[]
    DetailScreen:
      shape:
        kind: "work | opinion"
        component: "React.ComponentType<{ work: { workId: string } }>"   # cuando kind: 'work'
    DetailScreenProps:
      work: { workId: string }        # solo para kind: 'work'; lo rellena openWorkDetail
      opinion: { opinionId: string }  # solo para kind: 'opinion'; lo rellena openOpinionDetail
      rule: >
        La forma del props va con la de su `kind`: el detalle de obra recibe solo `{ workId }`
        y el de opinión solo `{ opinionId }`. El `component` del `DetailScreen` se tipa con
        esa misma forma (`React.ComponentType<{ work: { workId: string } }>` o
        `React.ComponentType<{ opinion: { opinionId: string } }>`), así que
        `openWorkDetail({ workId })` no puede rellenar un identificador que la vista no recibe.
    ScreenProps:
      fields: {}   # las pantallas no reciben props: leen de los contextos
    CreateEntry:
      fields:
        mode: "create | edit"
        preselectedWorkId: "string | null"
        editingOpinionId: "string | null"
        returnTo: "string | null"
      hook: 'useCreateEntry(): CreateEntry — Crear y Editar leen aquí el modo, la obra, la opinión y el origen'
    GlobalServices:
      shape:
        showSnackbar: "{ message: string } => void"
        setHeader: "{ title: string } => void"
        openWorkDetail: "{ workId: string } => void"
        openOpinionDetail: "{ opinionId: string } => void"
        openCreate: "{ workId?: string } => void"
        openEdit: "{ opinionId: string } => void"
        closeCreate: "() => void"
        goToTab: "{ name: 'inicio' | 'explorar' | 'crear' | 'actividad' | 'perfil' } => void"
      hook: 'useGlobalServices(): GlobalServices — las pantallas lo leen por aquí'
    SpotifyStatus: "disconnected | connecting | connected | connectionError | invalidToken | notConfigured"
  invariants:
    - "Login vive fuera de la barra de pestañas; las cinco pestañas son Inicio, Explorar, Crear, Actividad y Perfil."
    - "La hoja de comentarios es un modal sobre la pantalla actual: no cambia de pestaña ni desmonta lo de abajo. La pinta una sola vez la cáscara con lo que le da `useShellServices().comments`; U1 trae el controlador vacío y U3 lo sustituye por `createCommentsController({ content, session })`, que vive en `app/src/comments/`, lee `listComments` de C4, envía con `addComment` tomando el `authorId` de C3 y entrega ya `CommentModel` a la hoja, mapeando desde `CommentView`. `@melodify/app-shell` no importa `@melodify/content` ni la hoja de U3."
    - "«Crear» y «Editar» son dos modos del mismo `ScreenModule` de U3, con dos entradas cada uno: la pestaña con el formulario vacío y el tercer nivel apilado sobre el detalle (`mockups.md` § Navegación). `openCreate({ workId })` apila el formulario de publicación con la obra preseleccionada; `openEdit({ opinionId })` apila el mismo formulario en modo edición con la opinión de origen, y `CreateEntry.returnTo` guarda desde dónde se abrió."
    - "El ciclo de `CreateEntry` está cerrado. `openCreate({ workId })` deja `mode: 'create'` y `openEdit({ opinionId })` deja `mode: 'edit'` con `editingOpinionId` y los campos rellenos desde `getOpinion` de C4. «Guardar» en modo edición actualiza con `updateOpinion` y llama a `closeCreate()`, que desapila y vuelve a `returnTo` (FR6.3); «Cancelar» llama a `closeCreate()` sin guardar (FR5.4, FR6.2). Publicar llama a `goToTab({ name: 'inicio' })` (FR5.3), que desapila y limpia `CreateEntry`. Tocar la pestaña Crear en `BottomTabBar.onSelect` selecciona esa pestaña con formulario vacío y reescribe `CreateEntry` como `{ mode: 'create', preselectedWorkId: null, editingOpinionId: null, returnTo: <la pestaña que estaba activa> }`: una visita nueva nunca arrastra la obra ni la opinión de la anterior, y «Cancelar» desde ahí vuelve a la pestaña anterior."
    - "`DetailScreenProps` va con la forma de su `kind`: el detalle de obra recibe `{ workId }` y el de opinión `{ opinionId }`."
    - "El snackbar se pinta una sola vez, en la cáscara. El banner de sin conexión lo pinta **cada pantalla** bajo su propia cabecera con la pieza `Banner` y el texto único de `interaction-spec.md`, y la cáscara **no** lo pinta: las raíces de pestaña llevan su `AppHeader` dentro de la pantalla, así que un banner en la cáscara quedaría por encima de la cabecera, al revés que el mockup. Se conserva la invariante de fondo —una sola pieza y un solo texto, sin duplicar el aviso— (revisión 13; `functional-spec.md` § Precisión a C2)."
    - "La cáscara no importa `@melodify/connectivity` ni `@melodify/spotify`: el estado de red y el de Spotify le llegan en `services`, inyectado por `@melodify/app` desde `bootstrap/`. Con el valor por defecto de U1, U1 funciona sola."
    - "Las pantallas leen el estado y lanzan las acciones de Spotify con `useShellServices()`, no reciben props y no importan `@melodify/spotify`: el chip de Inicio (FR3.3) y la tarjeta de Perfil (AC9.1.8) usan el mismo cauce."
    - "La vista de detalle se apila dentro de la pestaña activa y se abre con `openWorkDetail({ workId })` o `openOpinionDetail({ opinionId })`; las rutas y los parámetros los fija C2, no cada unidad. U2 aporta el detalle de obra **y el detalle de opinión** —US2.3 es suya y Perfil lo necesita para AC9.1.4; U3 no lo rehace y solo cablea «Editar», como registran la revisión 12 y `construction/u2-content-core/functional-design/functional-spec.md` § Assumptions—; en los dos, «Editar» de una opinión propia llama a `openEdit({ opinionId })`, y cualquier pestaña abre el detalle con las mismas operaciones, sin conocer el componente."
    - "La pila de cada pestaña se pinta **entera**: la entrada de la cima se ve y las de debajo se ocultan con `display: none`, igual que la cáscara ya oculta las pestañas inactivas. Así la pantalla que abre un detalle sigue montada y «‹ Volver» la devuelve con su desplazamiento y su estado, que es lo que pide AC2.3.2 (revisión 12; antes el panel pintaba solo la última entrada y la raíz se desmontaba)."
    - "Un cambio en `ShellServices` es un cambio incompatible de C2: se sube la versión mayor y se actualiza el punto de composición en el mismo PR."
```

## C3 — Sesión de la app

```yaml
openapi: 3.1.0
info: { title: AppSession, version: 1.1.0, x-owner: U1, x-transport: in-process }
paths:
  /session:
    get:
      operationId: getSession
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SessionView' }
        '503': { description: no se pudo leer el almacenamiento seguro; la interfaz lo trata como «sin sesión» y abre Login sin aviso ni reintento — ver § Revisión 9 de C3 }
    post:
      operationId: signIn
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [handle, password]
              properties: { handle: { type: string }, password: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SessionView' }
        '401': { description: credenciales rechazadas; solo demo/demo es válida }
        '503': { description: no se pudo guardar la sesión; no se entra }
  /session/sign-out:
    post:
      operationId: signOut
      responses:
        '204': { description: recuerdo borrado; la app vuelve a Login }
  /session/changes:
    get:
      operationId: subscribeSession
      description: Emite el valor actual nada más suscribirse y el valor completo tras cada cambio.
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/SessionView' }
components:
  schemas:
    SessionView:
      type: object
      required: [status, authorId, remembered]
      properties:
        status: { enum: [signedIn, signedOut] }
        authorId: { type: string, const: demo }
        remembered: { type: boolean }
```

### Revisión 9 — enmienda de C3 al fallo de lectura

`getSession` responde `503` cuando el almacenamiento seguro no se puede leer, y **en esta versión ese `503` no ofrece reintento**. La interfaz lo trata como «sin sesión»: abre Login, intenta borrar el valor ilegible y no muestra aviso (FR1.4; `mockups.md` Pantalla 0, que decide Login sin reintento, y `mockups.md` § Pantalla 1, que declara que en Login no existe estado de error de arranque).

El motivo: no hay nada que la persona pueda reintentar con una acción, porque el fallo es del almacenamiento local y la salida natural —entrar de nuevo— es la propia pantalla de Login. FR11.2 pide «Reintentar» para los errores **que se muestran**; aquí no se muestra error alguno, así que la regla no se incumple. `signIn` conserva su `503` de guardado, y ese sí se pinta con acción: el texto y el botón los fija U1 en `construction/u1-app-skeleton/functional-design/functional-spec.md` § Flujo F2.

### Revisión 10 — superficie aditiva de C3

`@melodify/app-session` sube a **`1.1.0`**. Ninguna operación, respuesta ni esquema de C3 cambia: lo que crece es la superficie de construcción del paquete, en tres exportaciones nuevas que la app importa.

```ts
// Exportaciones nuevas de @melodify/app-session (aditivas, 1.1.0).
export type SessionLogCode =
  | "SESSION_READ_FAILED" | "SESSION_RECORD_INVALID"
  | "SESSION_SAVE_FAILED" | "SESSION_DELETE_FAILED";

export interface SessionLogger {
  warn(code: SessionLogCode, message: string): void;
  error(code: SessionLogCode, message: string): void;
}

export interface SecureStorePort {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export function createAppSession(options?: {
  store?: SecureStorePort;
  logger?: SessionLogger;
}): AppSession;
```

Por qué es aditivo y no incompatible:

- **`getSession`, `signIn`, `signOut` y `subscribeSession` responden lo mismo**, incluido el `503` de lectura de la § Revisión 9. La distinción entre «no había registro» y «registro inválido» se registra dentro del paquete y no cruza el contrato: U2, U3 y U5 siguen viendo `signedOut` en los dos casos.
- **Las tres exportaciones son opcionales de usar.** Un paquete consumidor no necesita construir la sesión —eso lo hace `app/src/bootstrap/`— ni implementar `SessionLogger`; solo la app lo hace. `store` y `logger` tienen valor por defecto, así que `createAppSession()` sin argumentos sigue siendo válido.
- **El adaptador real vive en el paquete** (`packages/app-session/src/secure-store-adapter.ts`) y es el único archivo que importa `expo-secure-store`; `SecureStorePort` es el tipo que permite sustituirlo en las pruebas. La dependencia queda en `packages/app-session/package.json`.
- **Un cambio aditivo sube la versión menor** (§ Reglas de propiedad y versionado), y ningún consumidor tiene que tocar su código en el mismo PR. El diseño de la unidad lo desarrolla en `construction/u1-app-skeleton/nfr-design/security-design.md` § NFR9.1.

## C4 — Contenido

```yaml
openapi: 3.1.0
info: { title: ContentStore, version: 1.0.0, x-owner: U2, x-transport: in-process }
x-identity:
  rule: >
    C4 no depende de C3 y no guarda «quién soy». La identidad viaja como parámetro
    explícito en cada operación que la necesita —`authorId` al escribir, `viewerId` al
    leer— y quien llama la toma de `AppSession`. Los campos derivados (`isOwn`,
    `likedByMe`, `followedByMe`) se calculan contra `viewerId`.
  viewer_operations: >
    `listOpinions`, `getOpinion`, `updateOpinion`, `listFollowing`, `getAuthor` y
    `subscribeContent` reciben `viewerId`; sin él C4 no puede rellenar los campos
    derivados y no los inventa.
  counters: >
    El «N opiniones» y el «N siguiendo» del Perfil salen de `getAuthor`; la lista de
    seguidos sale de `listFollowing`. `followerCount` es el número de seguidores del autor
    y no se pinta en Perfil.
paths:
  /opinions:
    get:
      operationId: listOpinions
      parameters:
        - { name: viewerId, in: query, required: true, schema: { type: string } }
        - { name: workId, in: query, schema: { type: string } }
        - { name: authorId, in: query, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/OpinionView' } }
    post:
      operationId: createOpinion
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [authorId, workId, workTitle, workArtist, text, rating]
              properties:
                authorId: { type: string, description: quién publica }
                workId: { type: string }
                workTitle: { type: string }
                workArtist: { type: string }
                text: { type: string }
                rating: { type: integer, minimum: 1, maximum: 5 }
      responses:
        '201':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/OpinionView' }
        '409': { description: ya existe una opinión de esta persona sobre esta obra (FR6.1) }
        '422': { description: texto o valoración fuera de las reglas del formulario }
  /opinions/{opinionId}:
    get:
      operationId: getOpinion
      parameters:
        - { name: opinionId, in: path, required: true, schema: { type: string } }
        - { name: viewerId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/OpinionView' }
        '404': { description: la opinión no existe }
    patch:
      operationId: updateOpinion
      parameters:
        - { name: opinionId, in: path, required: true, schema: { type: string } }
        - { name: viewerId, in: query, required: true, schema: { type: string }, description: quien edita; alimenta isOwn y likedByMe de la respuesta }
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [authorId]
              properties:
                authorId: { type: string, description: quién edita; debe ser el autor }
                text: { type: string }
                rating: { type: integer }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/OpinionView' }
        '403': { description: solo se edita la propia }
        '404': { description: la opinión no existe }
        '422': { description: fuera de las reglas del formulario }
  /opinions/{opinionId}/likes:
    get:
      operationId: listLikes
      description: Quién dio me gusta y cuándo; U5 deriva de aquí los eventos «me gusta recibido» (FR8.1, AC8.1.1).
      parameters: [{ name: opinionId, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [opinionId, likeCount, likes]
                properties:
                  opinionId: { type: string }
                  likeCount: { type: integer }
                  likes: { type: array, items: { $ref: '#/components/schemas/LikeView' } }
        '404': { description: la opinión no existe }
    post:
      operationId: toggleLike
      parameters:
        - { name: opinionId, in: path, required: true, schema: { type: string } }
        - { name: authorId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [opinionId, likeCount, likedByMe]
                properties: { opinionId: { type: string }, likeCount: { type: integer }, likedByMe: { type: boolean } }
  /opinions/{opinionId}/comments:
    get:
      operationId: listComments
      parameters: [{ name: opinionId, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema: { type: array, items: { $ref: '#/components/schemas/CommentView' } }
        '404': { description: la opinión no existe }
    post:
      operationId: addComment
      parameters: [{ name: opinionId, in: path, required: true, schema: { type: string } }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [authorId, text]
              properties: { authorId: { type: string }, text: { type: string } }
      responses:
        '201':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CommentView' }
        '422': { description: texto vacío o fuera de límite }
  /authors/{authorId}/follow:
    post:
      operationId: toggleFollow
      parameters:
        - { name: authorId, in: path, required: true, schema: { type: string } }
        - { name: followerId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [authorId, followedByMe, followerCount, viewerFollowingCount]
                properties:
                  authorId: { type: string }
                  followedByMe: { type: boolean }
                  followerCount: { type: integer, description: seguidores del autor; es el contador de su tarjeta }
                  viewerFollowingCount: { type: integer, description: autores que sigue quien actúa; es el «N siguiendo» de Perfil (AC9.1.1, AC9.1.2) }
        '409': { description: no se puede seguir a la propia persona }
  /authors/{authorId}/following:
    get:
      operationId: listFollowing
      description: Autores que sigue el autor consultado; Perfil lo usa para «N siguiendo».
      parameters:
        - { name: authorId, in: path, required: true, schema: { type: string } }
        - { name: viewerId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [authorId, followingCount, following]
                properties:
                  authorId: { type: string }
                  followingCount: { type: integer }
                  following: { type: array, items: { $ref: '#/components/schemas/AuthorView' } }
        '404': { description: el autor no existe }
  /authors/{authorId}:
    get:
      operationId: getAuthor
      description: Identidad del autor con sus contadores; Perfil lo usa aunque el almacén esté vacío (AC9.1.5).
      parameters:
        - { name: authorId, in: path, required: true, schema: { type: string } }
        - { name: viewerId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AuthorDetailView' }
        '404': { description: el autor no existe }
  /changes:
    get:
      operationId: subscribeContent
      description: Emite el contenido actual nada más suscribirse y el contenido completo tras cada escritura.
      parameters:
        - { name: viewerId, in: query, required: true, schema: { type: string } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [revision, opinions]
                properties:
                  revision: { type: integer, description: sube en cada escritura }
                  opinions: { type: array, items: { $ref: '#/components/schemas/OpinionView' } }
components:
  schemas:
    OpinionView:
      type: object
      required: [opinionId, workId, workTitle, workArtist, author, text, rating, createdAt, updatedAt, likeCount, commentCount, likedByMe, isOwn]
      properties:
        opinionId: { type: string }
        workId: { type: string }
        workTitle: { type: string }
        workArtist: { type: string }
        author: { $ref: '#/components/schemas/AuthorView' }
        text: { type: string }
        rating: { type: integer }
        createdAt: { type: string, format: date-time }
        updatedAt: { type: string, format: date-time }
        likeCount: { type: integer }
        commentCount: { type: integer }
        likedByMe: { type: boolean }
        isOwn: { type: boolean }
    AuthorView:
      type: object
      properties: { authorId: { type: string }, displayName: { type: string }, handle: { type: string }, followedByMe: { type: boolean } }
    AuthorDetailView:
      type: object
      required: [authorId, displayName, handle, followedByMe, opinionCount, followingCount]
      properties:
        authorId: { type: string }
        displayName: { type: string }
        handle: { type: string }
        followedByMe: { type: boolean }
        opinionCount: { type: integer, description: opiniones del autor; «N opiniones» de Perfil }
        followingCount: { type: integer, description: autores que sigue; «N siguiendo» de Perfil }
    CommentView:
      type: object
      required: [commentId, opinionId, author, text, createdAt]
      properties:
        commentId: { type: string }
        opinionId: { type: string }
        author: { $ref: '#/components/schemas/AuthorView' }
        text: { type: string }
        createdAt: { type: string, format: date-time }
    LikeView:
      type: object
      required: [opinionId, author, createdAt]
      properties:
        opinionId: { type: string }
        author: { $ref: '#/components/schemas/AuthorView' }
        createdAt: { type: string, format: date-time }
x-construction:
  file: '@melodify/content-store'
  signature: "createContentStore({ now?, seed? })"
  rule: >
    Sin opciones siembra el contenido de ejemplo con el reloj real; `now` fija el instante
    desde el que se calculan las edades de la siembra y `seed` la sustituye por una mínima
    (lista vacía, una sola opinión, varias obras) para ejercitar los estados de las
    pantallas (revisión 12).
x-read-errors:
  rule: >
    Las lecturas y la suscripción —`listOpinions`, `getOpinion`, `updateOpinion`,
    `listFollowing`, `getAuthor` y `subscribeContent`— responden `422` cuando falta
    `viewerId`, porque sin él no se pueden calcular `isOwn`, `likedByMe` ni `followedByMe`
    y C4 no los inventa (revisión 12).
```

## C5 — Catálogo

```yaml
openapi: 3.1.0
info: { title: Catalog, version: 1.1.0, x-owner: U2, x-transport: in-process }
paths:
  /works:
    get:
      operationId: searchWorks
      parameters:
        - { name: query, in: query, schema: { type: string, minLength: 2 } }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [status, works]
                properties:
                  status: { enum: [ok, empty, offline, error] }
                  works: { type: array, items: { $ref: '#/components/schemas/WorkView' } }
        '503': { description: sin red o Spotify no responde; la interfaz muestra «Reintentar» }
  /works/sample:
    get:
      operationId: listSampleWorks
      description: Catálogo de ejemplo local, disponible con o sin sesión (FR4.5, FR5.6).
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [works]
                properties:
                  works: { type: array, items: { $ref: '#/components/schemas/WorkView' } }
  /works/{workId}:
    get:
      operationId: getWork
      parameters: [{ name: workId, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/WorkView' }
        '404': { description: la obra no está en el catálogo }
  /works/{workId}/opinion-count:
    get:
      operationId: countOpinions
      parameters: [{ name: workId, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [workId, count]
                properties: { workId: { type: string }, count: { type: integer } }
  /cover:
    get:
      operationId: coverFor
      description: Decide la portada de una obra. Si la obra es de Spotify y aún no tiene `coverUrl`, la resuelve con `SpotifyResolvePort`; si el puerto no está o falla, devuelve `initialBlock`.
      parameters: [{ name: workId, in: query, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [kind, value]
                properties:
                  kind: { enum: [url, initialBlock] }
                  value: { type: [string, 'null'] }
  /catalog/changes:
    get:
      operationId: subscribe
      description: >
        Emite el catálogo actual nada más suscribirse y tras cada cambio de catálogo o de
        resultado de portada; devuelve la baja. Lo usan las pantallas para repintar portadas
        sin volver a preguntar (revisión 12).
      responses:
        '200': { description: 'emisión del catálogo vigente; la suscripción devuelve su función de baja' }
  /catalog/cover-failure:
    get:
      operationId: getCoverFailure
      description: Último resultado de resolución de metadatos; es lo que enciende el aviso de portadas (BR7.5).
      responses:
        '200':
          content:
            application/json:
              schema: { type: boolean }
  /catalog/retry-covers:
    post:
      operationId: retryCovers
      description: Reintenta las portadas pendientes; sin `SpotifyResolvePort` no hace nada (revisión 12).
      responses:
        '204': { description: reintento iniciado o nada que reintentar }
components:
  schemas:
    WorkView:
      type: object
      required: [workId, title, artist, coverUrl, origin]
      properties:
        workId: { type: string, description: identificador de Spotify de la obra }
        title: { type: string }
        artist: { type: string }
        coverUrl: { type: [string, 'null'] }
        origin: { enum: [sample, spotify] }
x-ports:
  types_location: '@melodify/catalog/src/ports.ts'
  injection: >
    `createCatalog({ content, connectivity, session, search, resolve })` recibe el contenido (C4),
    la conectividad (C6) y las implementaciones de los tres puertos como parámetros en la
    construcción; `session`, `search` y `resolve` viajan en `null` hasta U4 (revisión 12).
    No hay registro global: `@melodify/catalog` no importa
    `@melodify/spotify`, y `@melodify/spotify` solo toma de `@melodify/catalog` los tipos
    de los puertos con `import type`, que no crea arista de ejecución.
  declared:
    - name: SpotifySessionPort
      declared_by: U2
      implemented_by: U4
      shape:
        isConnected: () => boolean
        onConnectionChange: (listener) => unsubscribe
      rule: Catalog pregunta si hay sesión; no conoce a Spotify ni importa su paquete.
    - name: SpotifySearchPort
      declared_by: U2
      implemented_by: U4
      shape:
        search: "(query: string) => Promise<SearchPortResult>"
      SearchPortResult:
        kind: ok | empty | failure
        works?: WorkView[]
        failure?: unauthorized | rateLimited | timeout | network | error
      rule: >
        Catalog normaliza `failure` a `offline` (network) o `error` (resto) y nunca
        propaga el error de Spotify; el puerto no conoce `Catalog`.
    - name: SpotifyResolvePort
      declared_by: U2
      implemented_by: U4
      shape:
        resolve: "(workId: string) => Promise<ResolvePortResult>"
      ResolvePortResult:
        kind: ok | failure
        work?: WorkView
        failure?: unauthorized | rateLimited | timeout | network | notFound | error
      rule: >
        Resuelve metadatos y portada de una obra ya conocida (FR3.4, AC2.2.1). Es lo que
        permite que una obra del catálogo de ejemplo, que nunca se buscó, muestre su
        portada real cuando hay sesión.
x-composition:
  file: app/src/bootstrap/ports.ts
  created_by: U1
  filled_by: U4
  rule: >
    U1 crea el archivo con los tres puertos sin implementar —sin sesión, sin búsqueda y
    sin resolución—; U4 registra las implementaciones al montar `@melodify/spotify` y
    `@melodify/app` construye `Catalog` con ellas. La prohibición es de importación en
    tiempo de ejecución: `@melodify/catalog` y `@melodify/spotify` no se importan entre
    sí para ejecutar; solo fluyen tipos con `import type`.
```

## C6 — Conectividad

```yaml
openapi: 3.1.0
info: { title: Connectivity, version: 1.0.0, x-owner: U2, x-transport: in-process }
paths:
  /network:
    get:
      operationId: getNetworkState
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/NetworkView' }
  /network/changes:
    get:
      operationId: subscribeNetwork
      description: Emite el estado actual nada más suscribirse y el estado completo tras cada cambio.
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/NetworkView' }
components:
  schemas:
    NetworkView:
      type: object
      required: [online, measuredAt]
      properties: { online: { type: boolean }, measuredAt: { type: string, format: date-time } }
x-construction:
  factory: 'createConnectivity({ network })'
  rule: >
    El paquete expone una sola función de construcción que recibe sus colaboradores en un
    objeto de opciones. `network` es el adaptador de plataforma —el de `expo-network` en la
    app, un doble en las pruebas— con la forma `{ getState(): Promise<NetworkState>,
    addListener(cb): () => void }`. Sin adaptador no se construye: no hay valor por defecto
    que lea el sistema operativo por su cuenta. La degradación a «en línea» cuando el
    adaptador falla (BR6.3) es comportamiento, no superficie: la decide la implementación
    sin cambiar esta firma.
```

## C7 — Spotify (paquete propio)

```yaml
openapi: 3.1.0
info: { title: Spotify, version: 1.0.0, x-owner: U4, x-transport: in-process }
x-modules:
  rule: >
    Un paquete con dos módulos de superficie pública separada, que conservan la separación
    de `SpotifyAuth` y `SpotifyCatalog` de ADR-004: `@melodify/spotify/auth` es el único
    módulo que toca el token y el almacenamiento seguro; `@melodify/spotify/catalog` pide
    el token a `auth` y nunca lo lee ni lo guarda. El punto de composición usa `auth` para
    los tres puertos de sesión y `catalog` para los de búsqueda y resolución.
paths:
  /auth/connect:
    post:
      operationId: connectSpotify
      responses:
        '200': { description: token obtenido y guardado en almacenamiento seguro }
        '400': { description: "client ID ausente o inválido: instalación sin configurar" }
        '409': { description: ya hay una conexión activa }
        '504': { description: la persona abandonó o la autorización no volvió }
  /auth/disconnect:
    post:
      operationId: disconnectSpotify
      responses: { '204': { description: token borrado del almacenamiento seguro } }
  /auth/state:
    get:
      operationId: getSpotifyState
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AuthorizationStateView' }
  /auth/changes:
    get:
      operationId: subscribeSpotifyState
      description: Emite el estado actual nada más suscribirse y el estado completo tras cada cambio.
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AuthorizationStateView' }
  /search:
    get:
      operationId: searchSpotify
      parameters: [{ name: query, in: query, schema: { type: string } }]
      responses:
        '200': { description: resultados normalizados a WorkView }
        '401': { description: token inválido; el estado pasa a invalidToken }
        '429': { description: límite de peticiones; se ofrece reintentar }
        '504': { description: tiempo de espera agotado (10 s) }
  /tracks/{workId}:
    get:
      operationId: resolveSpotifyWork
      description: Resuelve metadatos y portada de una obra ya conocida (implementa SpotifyResolvePort).
      parameters: [{ name: workId, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/WorkView' }
        '401': { description: token inválido; el estado pasa a invalidToken }
        '404': { description: la obra no existe en Spotify }
        '429': { description: límite de peticiones; se ofrece reintentar }
        '504': { description: tiempo de espera agotado (10 s) }
components:
  schemas:
    AuthorizationStateView:
      type: object
      required: [status]
      properties:
        status: { enum: [disconnected, connecting, connected, connectionError, invalidToken, notConfigured] }
    WorkView:
      type: object
      required: [workId, title, artist, coverUrl, origin]
      properties:
        workId: { type: string }
        title: { type: string }
        artist: { type: string }
        coverUrl: { type: [string, 'null'] }
        origin: { const: spotify }
x-implements:
  - SpotifySessionPort
  - SpotifySearchPort
  - SpotifyResolvePort
x-token-storage:
  mechanism: expo-secure-store
  key: melodify.spotify.token
  cleared_on: disconnect
x-token-lifecycle:
  refresh_before_seconds: 60
  trigger: antes de cada llamada a C10 cuando al token le quedan menos de 60 s de vida
  concurrency: una sola renovación a la vez; las llamadas en vuelo esperan el mismo resultado
  observable_state: connected (la persona sigue viendo «Conectado»; renovar no cambia la pantalla)
  on_success: el token nuevo se guarda en almacenamiento seguro y el estado sigue connected
  on_failure: el estado pasa a invalidToken con «Tu sesión de Spotify caducó. Vuelve a conectar.»
  manual_retry: «Volver a conectar» relanza el flujo PKCE completo
  persistence: al arrancar se lee el token guardado; si caducó, se renueva antes de la primera búsqueda
```

## C8 — Actividad

```yaml
openapi: 3.1.0
info: { title: ActivityFeed, version: 1.0.0, x-owner: U5, x-transport: in-process }
paths:
  /activity:
    get:
      operationId: getActivity
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ActivityView' }
  /activity/retry:
    post:
      operationId: retryActivity
      responses:
        '200':
          content:
            application/json:
              schema: { $ref: '#/components/schemas/ActivityView' }
components:
  schemas:
    ActivityView:
      type: object
      required: [status]
      properties:
        status: { enum: [loading, ready, empty, error] }
        groups:
          type: array
          items:
            type: object
            properties:
              day: { enum: [today, yesterday, date] }
              label: { type: string }
              events: { type: array, items: { $ref: '#/components/schemas/ActivityEventView' } }
    ActivityEventView:
      type: object
      required: [eventId, kind, opinionId, workTitle, createdAt]
      properties:
        eventId: { type: string }
        kind: { enum: [ownOpinion, likeReceived, commentReceived] }
        opinionId: { type: string }
        workTitle: { type: string, description: título de la obra, ya resuelto por U5 al derivar el evento }
        createdAt: { type: string, format: date-time }
        actorHandle: { type: string, description: autor de la interacción; ausente en los eventos `ownOpinion`, que no tienen actor externo }
x-inputs:
  constructor: createActivity({ content, session })
  content: >-
    C4 — `listOpinions({ viewerId })` da las opiniones propias (FR8.1, AC8.1.1) y
    `subscribeContent({ viewerId })` avisa de cada escritura para recalcular (AC8.1.3). Los otros
    dos tipos de evento no salen de los contadores de `OpinionView`: «me gusta recibido» sale de
    `listLikes(opinionId)` (autor y fecha) y «comentario recibido», de `listComments(opinionId)`,
    ambos recorridos para las opiniones del autor actual. `OpinionView.likeCount` y `commentCount`
    solo sirven para saber si hay algo que leer y para no repetir la lectura.
  session: C3 — el autor actual, que actúa como `viewerId` al leer C4.
  recalculation: se suscribe a `/changes` de C4 y vuelve a derivar los eventos tras cada escritura (AC8.1.3); sin suscripción no hay estado `ready` posterior a un cambio.
  work_title: el título viaja en `OpinionView.workTitle`, así que U5 lo copia al evento sin pedir nada más a C5.
  rule: '@melodify/activity importa solo los tipos de C4 y C3 con import type; las implementaciones llegan por constructor, como en C5.'
```

## C9 — Spotify Accounts API (externa)

```yaml
openapi: 3.1.0
info: { title: Spotify Accounts API, version: '1', x-consumer: U4, x-transport: https }
servers: [{ url: https://accounts.spotify.com }]
paths:
  /authorize:
    get:
      operationId: authorizeUrl
      description: El paquete construye esta URL y la abre en el navegador; no la llama desde la app.
      parameters:
        - { name: client_id, in: query, required: true, schema: { type: string } }
        - { name: response_type, in: query, required: true, schema: { const: code } }
        - { name: redirect_uri, in: query, required: true, schema: { type: string } }
        - { name: code_challenge, in: query, required: true, schema: { type: string } }
        - { name: code_challenge_method, in: query, required: true, schema: { const: S256 } }
        - { name: state, in: query, required: true, schema: { type: string } }
      responses:
        '302': { description: vuelve al redirect_uri con code y state }
  /api/token:
    post:
      operationId: exchangeOrRefreshToken
      requestBody:
        content:
          application/x-www-form-urlencoded:
            schema:
              oneOf:
                - type: object
                  required: [grant_type, code, redirect_uri, client_id, code_verifier]
                  properties:
                    grant_type: { const: authorization_code }
                    code: { type: string }
                    redirect_uri: { type: string }
                    client_id: { type: string }
                    code_verifier: { type: string }
                - type: object
                  required: [grant_type, refresh_token, client_id]
                  properties:
                    grant_type: { const: refresh_token }
                    refresh_token: { type: string }
                    client_id: { type: string }
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                required: [access_token, expires_in, token_type]
                properties:
                  access_token: { type: string }
                  refresh_token: { type: string, description: solo en el intercambio inicial }
                  expires_in: { type: integer }
                  token_type: { type: string }
        '400': { description: código, verificador o refresh token inválidos }
x-rules:
  - Autorización con PKCE S256; nunca viaja un client secret.
  - No se piden permisos de usuario; el alcance es público (búsqueda del catálogo).
  - El token se guarda cifrado en el dispositivo y se borra al desconectar.
```

## C10 — Spotify Web API (externa)

```yaml
openapi: 3.1.0
info: { title: Spotify Web API, version: '1', x-consumer: U4, x-transport: https }
servers: [{ url: https://api.spotify.com/v1 }]
paths:
  /search:
    get:
      operationId: searchTracks
      parameters:
        - { name: q, in: query, required: true, schema: { type: string } }
        - { name: type, in: query, schema: { const: track } }
        - { name: limit, in: query, schema: { type: integer, default: 20 } }
      security: [{ bearerAuth: [] }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  tracks:
                    type: object
                    properties:
                      items:
                        type: array
                        items:
                          type: object
                          properties:
                            id: { type: string }
                            name: { type: string }
                            artists: { type: array, items: { type: object, properties: { name: { type: string } } } }
                            album: { type: object, properties: { images: { type: array, items: { type: object, properties: { url: { type: string } } } } } }
        '401': { description: token inválido o caducado }
        '429': { description: límite de peticiones alcanzado }
  /tracks/{id}:
    get:
      operationId: getTrack
      description: Metadatos y portada de una obra conocida por su identificador.
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      security: [{ bearerAuth: [] }]
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
                  name: { type: string }
                  artists: { type: array, items: { type: object, properties: { name: { type: string } } } }
                  album: { type: object, properties: { images: { type: array, items: { type: object, properties: { url: { type: string } } } } } }
        '401': { description: token inválido o caducado }
        '404': { description: la obra no existe }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer }
x-timeouts:
  request: 10s
  retry: nunca automático; reintenta la persona
```

## Reglas de propiedad y versionado

- **Dueño**: cada contrato pertenece a la unidad que crea el paquete. Un consumidor propone, no cambia: si necesita otra cosa, se acuerda con el dueño en el PR.
- **Versión**: cada paquete interno arranca en `1.0.0` porque ningún contrato se ha publicado todavía; los números de revisión de este documento (revisión 2, revisión 3) no son versiones de paquete y no se copian a `version`. Cambio incompatible → versión mayor; cambio aditivo → menor; corrección → parche.
- **Cambio incompatible**: se sube la mayor **y** se actualizan en el mismo PR todos los consumidores; el CI (`typecheck`, `lint`, `test`) es la garantía. No conviven dos versiones de un paquete interno.
- **Cambio aditivo**: añadir campos opcionales, componentes del sistema de diseño o estados nuevos no rompe; el consumidor ignora lo que no usa.
- **Fronteras externas** (C9, C10): las versiona Spotify. Si cambian, se adapta `@melodify/spotify` y ninguna otra unidad se entera.
- **Puertos**: `SpotifySessionPort`, `SpotifySearchPort` y `SpotifyResolvePort` los declara U2 y los implementa U4. Sus tipos viven en `@melodify/catalog/src/ports.ts`; U4 los importa solo con `import type` y `createCatalog({ content, connectivity, session, search, resolve })` los recibe como parámetro. U2 no conoce a Spotify; U4 no conoce `Catalog`. El punto de composición `app/src/bootstrap/ports.ts` nace vacío con U1 y lo rellena U4. Sin implementación registrada, el catálogo de ejemplo y los bloques de inicial funcionan solos.
- **Servicios de la cáscara**: `ShellServices` no es un puerto hacia una unidad posterior: la cáscara recibe el estado de red y el de Spotify ya resueltos, con valores por defecto que U1 puede usar sola. Añadir un servicio o cambiar su forma es incompatible y sube la versión mayor de C2.
- **Módulos de C7**: `auth` es la única superficie que toca el token; `catalog` lo pide a `auth`. Ningún otro módulo ni unidad lee `expo-secure-store`.

## Fallos, tiempos y reintentos

| Frontera | Qué puede fallar | Qué ve la persona |
|---|---|---|
| C3 sesión | almacenamiento seguro ilegible o credenciales rechazadas | mensaje en la pantalla de Login; «Reintentar» al leer, error en el campo al rechazar |
| C4 contenido | conflicto de opinión duplicada, texto inválido, identidad ausente | mensaje junto al formulario; la opinión no se crea |
| C5 catálogo | sin red, Spotify caído, obra inexistente, resolución de portada fallida, puerto sin implementar | estado `offline` (banner) o `error` con «Reintentar»; portada a bloque de inicial; sin sesión, catálogo de ejemplo |
| C6 conectividad | el sistema no informa | se cae al error de la petición; el aviso no se inventa |
| C7 Spotify | token inválido, límite, tiempo de espera, abandono, refresco fallido | estado de conexión con su texto y «Reintentar»; refresco fallido → «token inválido» |
| C8 actividad | derivación o siembra fallida | bloque «No pudimos cargar tu actividad.» + «Reintentar» |
| C9, C10 | 400, 401, 429, 5xx, 10 s | error en lenguaje llano con acción; nunca reintento automático |

## Open questions

| Contrato | Pregunta | Bloquea |
|---|---|---|
| C7, C9 | El redirect URI exacto de PKCE (A6) y el esquema de enlaces de React Navigation. | U4 completa (la conexión real), no su forma |
| C4 | Límite de texto de la opinión y obligatoriedad de la valoración (OQ1, A1). | La validación de U3 |
| C10 | Límite de resultados por búsqueda y si se pagina. | Nada: hoy se pide una página de 20 |

## Assumptions & Open Questions

- `[assumption]` Los paquetes internos no se publican en ningún registro; los resuelve el espacio de trabajo del monorepo y los consume solo `@melodify/app`.
- `[assumption]` `@melodify/spotify` se registra en el punto de composición al montarse; sin él, `Catalog` funciona con el catálogo de ejemplo y portadas de bloque.
- `[assumption]` Las obras del catálogo de ejemplo se siembran con su identificador de Spotify y `coverUrl: null`; la portada real llega al resolverla con `SpotifyResolvePort` cuando hay sesión. Sin sesión se pinta el bloque de inicial.
- `[assumption]` Las pantallas de U3 viven en `@melodify/app` y no exponen contrato: consumen C1–C5.
- `[assumption]` El punto de composición `app/src/bootstrap/ports.ts` y los servicios por defecto `app/src/bootstrap/shell-services.ts` son infraestructura de arranque, no contrato de ninguna unidad: U1 los crea vacíos y U2, U3 y U4 los rellenan.
- `[assumption]` `@melodify/app` es privado, no versionado y no es contrato; solo los ocho paquetes de `packages/` llevan semver.
- `[assumption]` El mapeo de una vista de C4/C5/C8 a un modelo de C1 vive en la pantalla (`app/src/screens/…`), no en el sistema de diseño ni en el paquete de la entidad.
- **Ninguna pregunta abierta impide empezar**: las tres afectan a detalle de una operación, no a la forma de la frontera.

## Sources

- `unit-of-work` — `inception/units-generation/unit-of-work.md` (seis unidades y su tipo).
- `unit-of-work-dependency` — `inception/units-generation/unit-of-work-dependency.md` (aristas y puntos de integración).
- `components` — `inception/domain-design/components.md` (componentes, entidades e interfaces).
- `requirements` — `inception/requirements-analysis/requirements.md` (FR1–FR12, NFR1–NFR9, RC-01–RC-09, A1–A6, OQ1–OQ4).
- `team-practices` — `aidlc/spaces/default/memory/team.md` y `project.md`.
- `contract-design-questions` — `inception/contract-design/contract-design-questions.md` (Q1–Q5, F1, F2 y confirmación).

## Registro de las revisiones

### Revisión 2 — R-01…R-11

| Hallazgo | Qué se cambió |
|---|---|
| R-01 Critical | `SpotifySearchPort` declarado por U2 e implementado por U4, registrado en `app/src/bootstrap/ports.ts`; U2 sale de los consumidores de C7; se escribe la regla de que `@melodify/catalog` no importa `@melodify/spotify` ni al revés. |
| R-02 Major | C4 añade `GET /opinions/{opinionId}` (`getOpinion`) y `GET /opinions/{opinionId}/comments` (`listComments`) con su `CommentView`. |
| R-03 Major | La identidad viaja explícita: `authorId` al escribir, `viewerId` al leer; `x-identity` declara que C4 no depende de C3. |
| R-04 Major | C1 publica el inventario completo de `design-system-mapping.md` con props mínimas, y la regla de crecimiento aditivo. |
| R-05 Major | Nueva sección «Estructura del monorepo»: árbol, recorrido de los tres scripts del CI, medición de cobertura y enmienda a `unit-of-work.md`. |
| R-06 Major | C5 añade `GET /works/sample` (`listSampleWorks`). |
| R-07 Major | C9 añade `GET /authorize` con parámetros PKCE y el grant `refresh_token`; C7 añade `x-token-lifecycle` con disparador, concurrencia, estado observable y fallo. |
| R-08 Minor | Consumidores corregidos: C6 → U1, U2, U4; C7 → punto de composición y U6; nota de quién implementa el puerto corregida. |
| R-09 Minor | Las tres suscripciones declaran esquema y emiten el valor actual al suscribirse; C4 publica `revision` + opiniones. |
| R-10 Minor | C7 conserva un paquete con dos módulos (`auth`, `catalog`), con la frontera única del token explícita. |
| R-11 Minor | Esquemas de respuesta añadidos en `getWork`, `countOpinions`, `toggleLike`, `toggleFollow`, `retryActivity`, `createOpinion` y `signIn`. |

### Revisión 3 — R-12…R-21

| Hallazgo | Qué se cambió |
|---|---|
| R-12 Major | C2 recibe `services: ShellServices` con el estado de red y de Spotify; U1 arranca con valores por defecto (`online: true`, `disconnected`) y U2/U4 los sustituyen en el punto de composición. U1 sale de los consumidores de C6 y C7. Se declaran las tres inversiones. |
| R-13 Major | Nuevo `SpotifyResolvePort` (U2 lo declara, U4 lo implementa), `GET /tracks/{workId}` en C7 (`resolveSpotifyWork`) y `GET /tracks/{id}` en C10 (`getTrack`); `coverFor` explica de dónde sale la portada y se siembra el catálogo de ejemplo con `coverUrl: null`. |
| R-14 Major | C4 añade `GET /authors/{authorId}/following` (`listFollowing`) con `followingCount`; `toggleFollow` devuelve también `viewerFollowingCount` y se distingue de `followerCount`. El «N opiniones» del Perfil se lee con `listOpinions?authorId=`. |
| R-15 Major | `subscribeContent` recibe `viewerId` obligatorio y `x-identity` lista qué operaciones de lectura lo necesitan. |
| R-16 Minor | Los tipos de los puertos viven en `@melodify/catalog/src/ports.ts`; `createCatalog({ session, search, resolve })` los recibe como parámetro; U4 los importa solo con `import type` y la prohibición se acota a la importación en tiempo de ejecución. |
| R-17 Minor | `tokens.radius` publica `lg`. |
| R-18 Minor | C1, C4, C5 y C7 vuelven a `1.0.0`; el número de revisión del documento se separa de la versión del paquete. |
| R-19 Minor | `app/src/screens/` se atribuye a U2, U3, U5 y U6; `@melodify/app` se declara privado, sin semver, con U1 dueño del arranque y cada unidad dueña de su carpeta de pantalla. |
| R-20 Minor | Cobertura por ruta: una entrada de `coverageThreshold` a 80 por `app/src/**` y por cada `packages/<paquete>/src/**`, sin medición conjunta. |
| R-21 Minor | Fuera la clave `'200-changes'`; `/auth/changes` declara `AuthorizationStateView` y la emisión inicial, igual que las demás suscripciones. |

### Revisión 4 — R-19 y R-22…R-26

| Hallazgo | Qué se cambió |
|---|---|
| R-19 Minor | `app/src/screens/` nombra a U2, U3, U4, U5 y U6; Explorar entra en la lista. |
| R-22 Critical | C1 define sus propios modelos de presentación (`OpinionCardModel`, `CommentModel`, `WorkSummary`, `ActivityEventSummary`, `AuthorSummary`) y sus props los usan. El sistema de diseño no importa vistas de C4, C5 ni C8; cada pantalla mapea. U1 compila el inventario completo sin esperar a U2 ni a U5. |
| R-23 Major | `ShellServices.spotify` gana `connect`, `disconnect` y `retry`; C2 publica `useShellServices()` y las pantallas leen estado y acciones por ahí. El chip de Inicio y la tarjeta de Perfil no importan `@melodify/spotify`. |
| R-24 Minor | `updateOpinion` recibe `viewerId` para poder rellenar `likedByMe` e `isOwn` en su respuesta. |
| R-25 Minor | La introducción enumera las tres inversiones de puerto (`SpotifySessionPort`, `SpotifySearchPort`, `SpotifyResolvePort`) y describe `ShellServices` aparte, como inyección de la cáscara. |
| R-26 Minor | C4 añade `GET /authors/{authorId}` (`getAuthor`) con `AuthorDetailView` (identidad, `opinionCount`, `followingCount`), para que Perfil muestre la identidad con el almacén vacío. |

### Revisión 5 — R-27…R-32

| Hallazgo | Qué se cambió |
|---|---|
| R-27 Major | `OpinionCardModel` lleva lo que la tarjeta pinta: `workId`, `workTitle`, `workArtist`, `coverUrl`, `updatedAt`, `followedByMe` y `authorId`; las props añaden `onFollow` y `onEdit`. Cambio aditivo de C1. |
| R-28 Major | C2 declara `DetailScreen` (`kind: 'work' | 'opinion'`) con sus parámetros, `details` en `ScreenModule` y `openWorkDetail({ workId })`/`openOpinionDetail({ opinionId })` en `GlobalServices`; las rutas y parámetros son de C2, U2 aporta el detalle de obra y U3 el de opinión. |
| R-29 Minor | El mapeo se declara como función explícita por pantalla (`toOpinionCardModel(view: OpinionView): OpinionCardModel`), no como asignación directa. |
| R-30 Minor | C8 añade `x-inputs` con `createActivity({ content, session })`, la suscripción a `/changes` de C4 para recalcular (AC8.1.3) y el origen del título de la obra. |
| R-31 Minor | `ActivityEventView` y `ActivityEventSummary` llevan `workTitle`; U5 lo copia de `OpinionView`, sin lectura extra. |
| R-32 Minor | `TabItem` se declara en los modelos de C1; `SpotifyStatus` se declara en C2 y lo usan `ShellServices` y el chip; `Avatar` recibe `AuthorSummary`, que deja de estar sin uso. |

### Revisión 6 — R-33…R-40

| Hallazgo | Qué se cambió |
|---|---|
| R-33 Major | C2 añade `openCreate({ workId? })`, `goToTab({ name })` y `CreateEntry` con su hook `useCreateEntry()`; el detalle de obra de U2 abre el formulario de U3 sin conocer su componente y U3 vuelve a Inicio al publicar (FR5.3, FR5.5, AC4.3.2, AC5.3.1). |
| R-34 Major | La hoja de comentarios pasa a ser un controlador de `ShellServices.comments` (`state`, `open`, `close`, `retry`, `submit`) que la cáscara pinta una sola vez; `openCommentSheet` sale de `GlobalServices` y el punto de composición inyecta el controlador que lee `listComments` y escribe con `addComment`. U1 trae el controlador vacío. |
| R-35 Major | C4 añade `GET /opinions/{opinionId}/likes` (`listLikes`) con `LikeView` (autor y fecha) y C8 cita `listLikes` y `listComments` como origen de los eventos de me gusta y comentario recibidos; los contadores de `OpinionView` solo deciden si hay algo que leer. |
| R-36 Minor | `DetailScreenProps` se declara por tipo: `{ workId }` para `kind: 'work'` y `{ opinionId }` para `kind: 'opinion'`, con el `component` tipado con esa misma forma. |
| R-37 Minor | `GlobalServices` pasa a tener `shape` y su cauce `useGlobalServices()`, como `ShellServices` con `useShellServices()`. |
| R-38 Minor | `actorHandle` es opcional en `ActivityEventView` y en `ActivityEventSummary`, y se dice que falta en los eventos `ownOpinion`, que no tienen actor externo. |
| R-39 Minor | `BottomTabBar` y `OpinionCard` vuelven a ocupar líneas separadas y el bloque `yaml` de C1 se puede analizar. |
| R-40 Minor | `isOwn` queda solo en las props de `OpinionCard`; sale de `OpinionCardModel` y el invariante dice que la pantalla la pasa desde `OpinionView.isOwn`. |

### Revisión 7 — R-39, R-41…R-43

| Hallazgo | Qué se cambió |
|---|---|
| R-39 Minor | Los cuatro bloques que no se analizaban se reescriben: uniones entre comillas (`"light \| dark \| system"`), tipos de función entre comillas y descripciones con `: ` entre comillas. Los diez bloques `yaml` del documento se analizan con un analizador YAML estándar. |
| R-41 Major | C2 declara las dos entradas de Crear —pestaña vacía y tercer nivel apilado sobre el detalle, como en `mockups.md` § Navegación—, añade `closeCreate()` para el «Cancelar» de FR5.4, guarda el origen en `CreateEntry.returnTo` y cierra el ciclo de `preselectedWorkId`: se limpia al publicar, al cancelar y al entrar por la barra, que llama a `openCreate()` sin obra. |
| R-42 Minor | `default_by_owner` nombra a U3 como quien sustituye el controlador de comentarios y publica sus insumos: `createCommentsController({ content, session })` en `app/src/comments/`, con `content` = C4 (`listComments`, `addComment`) y `session` = C3, de donde sale el `authorId`. |
| R-43 Minor | C2, C5 y C7 se corrigen igual que C1: firmas de función y descripciones con `: ` entre comillas. |

### Revisión 8 — R-44…R-47

| Hallazgo | Qué se cambió |
|---|---|
| R-44 Major | `GlobalServices` añade `openEdit({ opinionId })` y `CreateEntry` gana `mode: "create \| edit"` y `editingOpinionId`; «Editar» del detalle de obra y del de opinión abre el mismo formulario de U3 en modo edición con los campos rellenos desde `getOpinion`, «Guardar» actualiza con `updateOpinion` y vuelve al detalle con `closeCreate()`, y «Cancelar» vuelve sin guardar (FR6.2, FR6.3). U2 solo cablea `OpinionCard.onEdit`. |
| R-45 Minor | El invariante del ciclo de `CreateEntry` fija qué hace la barra: selecciona la pestaña Crear con formulario vacío y reescribe la entrada con `returnTo` igual a la pestaña que estaba activa, de modo que «Cancelar» tiene destino y no se arrastra la obra ni la opinión anterior. La llamada de ejemplo pasa a `goToTab({ name: 'inicio' })`, con la forma declarada. |
| R-46 Minor | El árbol nombra a U2, U3 y U4 como quienes rellenan `app/src/bootstrap/`, añade `app/src/comments/` como carpeta de U3 y el supuesto del punto de composición dice lo mismo. |
| R-47 Minor | La regla de `view-models` cubre el mapeo en la pantalla o en el controlador de presentación (`app/src/comments/`), y el invariante de la hoja dice que el controlador entrega ya `CommentModel` mapeando desde `CommentView`. |

### Revisión 9 — enmienda de U1 (2026-11-11)

| Cambio | Qué se cambió |
|---|---|
| Inventario de C1 repartido por versiones | C1 ya no afirma que la 1.0.0 publique el inventario completo: la 1.0.0 exporta los tokens completos, `ThemeProvider` y las doce piezas del esqueleto, y las trece restantes entran con la unidad que las usa (1.1.0 U2, 1.2.0 U4, 1.3.0 U3, 1.4.0 U5). Sustituye la frase «El inventario está completo aquí» del invariante y la de `components.md` § DesignSystem. El reparto completo está en C1, § «Enmienda de la revisión 9». |
| Fallo de lectura de C3 sin reintento | El `503` de `getSession` se declara como «se trata como sin sesión, se abre Login sin aviso ni reintento», en lugar de «la interfaz ofrece reintentar». Se alinea con `mockups.md` Pantalla 0 y con FR11.2, que exige acción solo para los errores que se muestran. El detalle está en C3, § «Revisión 9 — enmienda de C3 al fallo de lectura». |
| Fallo de guardado de C3 con acción | No cambia el contrato: `signIn` mantiene su `503` («no se pudo guardar la sesión; no se entra»). U1 fija en su Functional Design el texto y la acción que lo acompañan («No pudimos guardar tu sesión. Inténtalo de nuevo.», con el botón en «Reintentar»). |

### Revisión 10 — superficie aditiva de C3 (2026-11-11)

| Cambio | Qué se cambió |
|---|---|
| C3 sube a `1.1.0` | El NFR Design de U1 declara el puerto de registro de la sesión y lo hace exportación pública del paquete, porque la app lo implementa y lo inyecta. Cambio aditivo, versión menor; ninguna operación ni respuesta cambia. |
| Exportaciones nuevas | `SessionLogger`, `SessionLogCode`, `SecureStorePort` y las opciones `createAppSession({ store?, logger? })`. Las tres tienen valor por defecto: `createAppSession()` sin argumentos sigue siendo válido, y ningún consumidor necesita tocar su código. |
| Dueño del adaptador | El único archivo del repositorio que importa `expo-secure-store` para la sesión es `packages/app-session/src/secure-store-adapter.ts`, y la dependencia se declara en `packages/app-session/package.json`. `SecureStorePort` es lo que permite sustituirlo por un doble en las pruebas. |
| Sin cambio de comportamiento | `getSession`, `signIn`, `signOut` y `subscribeSession` responden exactamente lo mismo, incluido el `503` de lectura de la revisión 9. La distinción «registro vacío» / «registro inválido» se registra dentro del paquete y no cruza el contrato. El detalle está en `construction/u1-app-skeleton/nfr-design/security-design.md` § NFR9.1. |

### Revisión 11 — superficie aditiva realmente enviada por U1 (2026-11-11)

La revisión de Code Generation de U1 encontró que los paquetes se enviaban con más superficie que la publicada y sin subir versión. Esta revisión registra lo que de verdad se envía y sube la versión menor de los paquetes afectados. Ningún consumidor existente (no hay ninguno todavía: U2–U6 empiezan después) tiene que tocar su código. Las props añadidas son **opcionales**: una pantalla que use la forma anterior de la revisión 9 sigue compilando.

| Cambio | Qué se cambió |
|---|---|
| C1 sube a `1.1.0` | El sistema de diseño envía props aditivas que el contrato no recogía. `TextField` añade `placeholder?`, `secureTextEntry?`, `autoCapitalize?`, `autoFocus?` y `testID?`; `PrimaryButton` añade `testID?`; `SocialActionBar` vuelve opcionales `onLike?` y `onComment?` (sin ellas las acciones no responden, que es el estado de la tarjeta sembrada). Se exportan además `contrastRatio`, `relativeLuminance`, `formatRelativeTime`, `lightTheme`, `darkTheme`, `useTheme`, `ThemeScheme`, los tipos de props de cada pieza y `TabIcon`. Es la sección «Enmienda de la revisión 9» la que reparte las piezas por versión: la fila de U1 pasa a `1.1.0` y las de U2, U4, U3 y U5 suben un escalón a `1.2.0`, `1.3.0`, `1.4.0` y `1.5.0`, sin cambiar qué piezas entran en cada una. |
| Token `space` corregido | C1 publicaba `space: { 1..12 }`, pero `design-system-mapping.md` define ocho pasos (`1, 2, 3, 4, 5, 6, 8, 10`) y es la lista autoritativa de valores. El contrato se alinea con la escala real: un consumidor que escriba `theme.space[7]` no compila, y nunca compiló. |
| C2 sube a `1.1.0` | `AppShell` acepta `entry?: ReactNode`: la rama de sesión (Login) que se monta **fuera** de la barra y que, cuando viene, impide pintar la barra inferior (BR1.5, NFR2.1). Es aditivo y opcional; sin `entry` la cáscara se comporta como en la revisión 9. Se exportan además `DEFAULT_CREATE_ENTRY`, `TAB_ITEMS`, `TabName`, `WorkDetailScreen`, `OpinionDetailScreen`, `AppShellProps` y los tres contextos de lectura (`CreateEntryContext`, `ShellServicesContext`, `GlobalServicesContext`). |
| C3 completa su `1.1.0` | La 1.1.0 de la revisión 10 no llegó a consumirse (U1 es su primer y único consumidor), así que sus exportaciones se completan en la misma versión: `parseSessionRecord`, `SESSION_STORAGE_KEY` y el tipo `SessionRecord`. Siguen siendo aditivas y ninguna operación cambia. |
| Punto único de composición de la sesión | La app construye **una sola** instancia de sesión, con el logger del proyecto inyectado, y vive en `app/src/bootstrap/session.ts` (`appSession`). `App` se suscribe a esa instancia y U2 cierra sesión con ella. La superficie por defecto que C3 publica (`getSession`, `signIn`, `signOut`, `subscribeSession`) sigue existiendo para las pruebas y para un consumidor que no necesite logger, pero el cierre de sesión de la app debe usar `appSession`: usar la instancia por defecto no devuelve la app a Login. Es una nota de composición, no un cambio de contrato. |
| Por qué es aditivo | Ninguna prop existente cambia de tipo ni se vuelve obligatoria, ninguna operación de C3 cambia de respuesta y la cáscara se comporta igual sin `entry`. Todo lo añadido tiene valor por defecto o es opcional, y las pruebas de U1 lo cubren (`app/src/bootstrap/__tests__/app-session-wiring.test.tsx`, `packages/design-system/src/__tests__/components.test.tsx`, `packages/app-shell/src/__tests__/app-shell.test.tsx`). |
| Dependencia retirada | `@react-navigation/bottom-tabs` sale de `packages/app-shell/package.json` y de `app/package.json`: la cáscara usa `NavigationContainer` con pilas propias por pestaña y ningún archivo la importaba. `@react-navigation/native` se queda, porque `NavigationContainer` lo necesita. |

### Revisión 12 — enmiendas de U2 en su Functional Design (2026-11-12)

El Functional Design de `u2-content-core` cruzó cuatro fronteras que el contrato no tenía escritas. Las tres primeras eran huecos reales —quien implemente desde el contrato cablearía una superficie que no existe o una navegación que no cumple AC2.3.2—; la cuarta es la primera publicación de un paquete que aún no tenía consumidor. Todo lo añadido es aditivo salvo el cambio de comportamiento de `AppShell`, que no cambia ninguna prop ni exportación.

| Cambio | Qué se cambió |
|---|---|
| C1 completa su `1.2.0` | La 1.2.0 ya estaba contratada para `ErrorState` y `TextButton` (revisión 9). U2 añade tres cosas en la misma versión, todas opcionales: `AppHeader` gana `leftSlot?: ReactNode`; `EmptyState.body` pasa a opcional; `OpinionCard` implementa el estado `own` del `interaction-spec.md` —en `variant: "detail"` con `isOwn`, fondo `primaryContainer`, etiqueta «Tu opinión», acción «Editar» pintada con `isOwn` y no con `onEdit`, y línea de fechas en lugar del tiempo relativo— y exporta `formatCalendarDate(iso)`. Sin `isOwn` la tarjeta se pinta como hoy: ninguna pantalla de U1 cambia. |
| C2 sube a `1.2.0` (comportamiento, sin cambio de superficie) | `AppShell` pasa a montar **todas** las entradas de la pila de cada pestaña y a ocultar las que no están en la cima con `display: none`, igual que ya hace entre pestañas. Hasta ahora el panel pintaba solo `(stacks[nombre] ?? []).at(-1)`, así que abrir un detalle desmontaba la pantalla raíz y al volver se recomponía desde cero: el feed perdía su desplazamiento y AC2.3.2 no se podía cumplir. No cambia ninguna prop, exportación ni contexto; `entry`, `GlobalServices`, `ShellServices` y `CreateEntry` siguen exactamente igual. La cabecera de detalle usa `leftSlot` (C1 1.2.0) para pintar «‹ Volver» y desapila con la misma operación que el atrás del sistema. `GlobalServices` **no** gana `goBack`. |
| C4 declara su superficie de construcción y su `422` de lectura | El contrato define las operaciones pero no cómo se construye el almacén ni qué responde una lectura sin `viewerId`. Se declara `createContentStore({ now?, seed? })` —`now` fija el reloj de la siembra y `seed` la sustituye, ambos con valor por defecto— y el `422` de `listOpinions`, `getOpinion`, `updateOpinion`, `listFollowing`, `getAuthor` y `subscribeContent` cuando falta `viewerId`, que es lo que `x-identity` ya exigía sin decir la respuesta. Ninguna operación cambia de forma. |
| C5 sube a `1.1.0` | Primera publicación del paquete, sin consumidor previo, y el contrato no tenía todo lo que AC2.1.6 necesita. Se añaden `subscribe` (aviso de cambio de catálogo o de portada resuelta), `getCoverFailure` y `retryCovers` —las tres cosas que sostienen el banner «No pudimos actualizar las portadas.» con «Reintentar»—, y `countOpinions` devuelve `{ workId, count }`. La construcción pasa a `createCatalog({ content, connectivity, session, search, resolve })`: `content` (C4) y `connectivity` (C6) son entradas nuevas y necesarias, porque el recuento de opiniones por obra sale de C4 y la decisión de portada consulta C6; los tres puertos conservan nombre, forma y dueño, y siguen siendo `null` hasta U4. Sin puertos, `searchWorks` responde `{ status: "offline", works: [] }` y no toca la red. |
| C6 sin cambios | Se publica en `1.0.0` tal y como está escrito. El adaptador de `expo-network` y la degradación a «en línea» cuando el módulo falla son construcción, no superficie: no cruzan el contrato. |
| Por qué es aditivo | Ninguna prop existente cambia de tipo ni se vuelve obligatoria; el único cambio de comportamiento es el montaje de la pila en `AppShell`, que hace que la pantalla de abajo siga viva y no puede romper a nadie que hoy dependa de que se desmonte. `getCoverFailure` y `retryCovers` son operaciones nuevas y `createCatalog` gana dos entradas que en U1–U3 viajan con valor. El reparto de piezas por versión de C1 no cambia: U4 sigue en `1.3.0`, U3 en `1.4.0` y U5 en `1.5.0`. |

### Revisión 13 — superficie de construcción de C6 (2026-11-12)

NFR Requirements de `u2-content-core` encontró la última firma que vivía solo en el Functional Design: C6 no publicaba cómo se construye la conectividad, y el artefacto de pila técnica y el de componentes ya no coincidían entre sí. Se escribe en el contrato para que no vuelva a derivar.

| Cambio | Qué se cambió |
|---|---|
| C6 gana `x-construction` | `createConnectivity({ network })`: una sola función, con el adaptador de plataforma en un objeto de opciones (`{ getState(): Promise<NetworkState>, addListener(cb): () => void }`). Es la misma forma que las otras dos fábricas de U2, se puede sustituir por un doble en las pruebas y no obliga a importar `expo-network` fuera de `@melodify/connectivity`. La degradación a «en línea» cuando el adaptador falla (BR6.3) es comportamiento y no cambia la firma. La versión de C6 no cambia: sigue en `1.0.0`, aún sin consumidor. |
| C2 corrige la invariante del aviso de sin conexión | La invariante decía que snackbar y banner de sin conexión se pintaban una sola vez en la cáscara, y el Functional Design de U2 ya había precisado lo contrario: las raíces de pestaña pintan su `AppHeader` dentro de la pantalla, así que un banner en la cáscara quedaría **encima** de la cabecera. El banner lo pinta cada pantalla bajo su propia cabecera; la cáscara solo conserva el snackbar. No cambia ninguna prop, exportación ni la versión de C2 (`1.2.0`). |
| C3 y C4 no cambian | Los códigos de diagnóstico que U2 necesita (`CONTENT_SUBSCRIBE_FAILED`, `CONTENT_READ_FAILED`, `NETWORK_STATE_UNAVAILABLE`) no entran en `SessionLogCode`: U2 declara en `app/src/bootstrap/logger.ts` un tipo de la aplicación que es un superconjunto y sigue siendo asignable a `SessionLogger`. Ampliar C3 habría metido códigos de contenido en el contrato de la sesión y roto su cierre. |
| Por qué es aditivo | C6 no tenía consumidor: la app la construye en su punto de composición y la inyecta en `ShellServices`. Añadir `x-construction` no cambia ninguna operación, ningún esquema ni la versión, y ninguna otra unidad depende de la firma anterior porque no existía. |
