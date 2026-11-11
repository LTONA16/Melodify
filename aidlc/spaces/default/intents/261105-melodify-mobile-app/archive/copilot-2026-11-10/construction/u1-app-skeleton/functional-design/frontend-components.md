# Componentes frontend — U1 Esqueleto que corre

## Jerarquía

```text
App
├── ThemeProvider
├── AppSessionProvider
│   ├── StartupState
│   ├── LoginScreen
│   │   ├── TextField Usuario
│   │   ├── PasswordField Contraseña + ToggleVisibility
│   │   ├── InlineError
│   │   └── PrimaryButton Entrar
│   └── AppShell
│       ├── TabStack[Inicio, Explorar, Crear, Actividad, Perfil]
│       └── BottomTabBar
└── DesignSystem
    ├── OpinionCard
    ├── CoverArt
    ├── EmptyState
    ├── ErrorState
    └── Skeleton
```

## Contratos de componentes

| Componente | Entrada/estado | Comportamiento U1 |
|---|---|---|
| `AppSessionProvider` | `SessionView` observable (`status: signedIn \| signedOut`, `authorId` obligatorio), estado interno `loading \| signingIn`, `error`; `initialize`, `signIn`, `signOut`, `retry` | C3 no expone estados transitorios. Un 503 o valor inválido muestra Login como sin sesión y ofrece «Reintentar» de forma explícita; `retry` vuelve a leer el almacenamiento sin bloquear Login. |
| `LoginScreen` | `username`, `password`, `fieldError`, `isSubmitting`, `passwordVisible` | Conserva valores; error exacto bajo Contraseña y foco allí; toggle accesible. |
| `AppShell` | `activeTab`, cinco pilas independientes | Conserva pila y desplazamiento por pestaña; atrás en raíz sale de la app. |
| `BottomTabBar` | cinco `TabItem` | Solo aparece con sesión y mantiene el orden fijo. |
| `InicioScreen` | `contentStatus`, `opinion`, `retry` | Esqueletos, una tarjeta, vacío/error con «Reintentar». |
| `OpinionCard` | `OpinionCardModel`, `CoverArt` | Lectura; renderiza `♡ {likeCount}` y `💬 {commentCount}` como controles visuales no interactivos, sin callbacks ni navegación a detalle. |
| `EmptyState` | `title`, `message` | Mensaje genérico «No hay contenido todavía», sin acción en pestañas vacías. |
| `PerfilPlaceholder` | `onSignOut` | Estado vacío más «Cerrar sesión». |

Todos los textos visibles están en español y los controles principales tienen
área táctil mínima de 44×44. `CoverArt` muestra la inicial cuando no hay
portada. Los tokens siguen el tema del sistema.

## Flujos de interacción

```text
AppSession (loading interno) --lectura válida--> SessionView signedIn --> Inicio
AppSession (loading interno) --ausente/503/inválido--> SessionView signedOut --> Login + Reintentar
Login --demo/demo--> AppSession (signingIn interno) --signedIn--> Inicio
Login --otro valor--> InlineError bajo Contraseña + foco conservado
Inicio --seleccionar pestaña--> pila independiente de destino
Perfil --Cerrar sesión--> borrado correcto --> Login sin barra
```

La tarjeta no es pulsable en U1 para no anticipar el detalle. `♡` y `💬` son
controles visuales sin interacción ni callbacks; sus contadores solo provienen
del modelo de ejemplo. Las acciones de Spotify, búsqueda, publicación,
comentarios, me gusta y seguir pertenecen a unidades posteriores.

Las decisiones Q1-Q9 fueron confirmadas antes de generar este diseño.
