# Melodify

> **Red social móvil para el descubrimiento, la calificación y la reseña de música.**  
> *(Identificador del proyecto: `Ratetify`)*

Melodify reúne en una sola plataforma la experiencia de registrar lo que escuchas, calificar álbumes y canciones, escribir reseñas e interactuar con una comunidad apasionada por la música, inspirándose en modelos como Letterboxd o Goodreads.

---

## 📑 Documentación del Proyecto

Toda la especificación técnica y funcional se encuentra detallada en la carpeta [`docs/`](docs/):

| Módulo | Documento | Descripción |
| :---: | :--- | :--- |
| **01** | [Objetivo de la App](docs/01-objetivo.md) | Visión, enfoque social/reseñas vs. streaming y principios de privacidad. |
| **02** | [Features Principales](docs/02-features.md) | Detalle de las 5 funciones clave (perfiles, catálogo, reseñas, feed e historial). |
| **03** | [IA, Agentes y MCP](docs/03-ia-agentes-mcp.md) | Resúmenes narrativos con IA, arquitectura de agentes, herramientas MCP y salvaguardas. |
| **04** | [Arquitectura Básica](docs/04-arquitectura.md) | Diagramas de arquitectura, componentes móviles, backend API, servicios externos y flujos. |

---

## Stack Tecnológico

- **Frontend Móvil**: [React Native](https://reactnative.dev) `0.87.1` con React `19.2.3`
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) `6.x`
- **Metadatos Musicales**: [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- **Calidad y Estilo**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) y [Jest](https://jestjs.io/)
- **Convención de Commits**: [Conventional Commits](https://www.conventionalcommits.org/) validado con [commitlint](.commitlintrc.json)
- **Integración Continua (CI)**: [GitHub Actions Workflow](.github/workflows/ci.yml)
- **Plantilla de PR**: [Pull Request Template](.github/pull_request_template.md)

---

## 📋 Requisitos Previos

Asegúrate de contar con el entorno de desarrollo para React Native configurado:
- **Node.js**: `>= 22.11.0` y **npm**
- **JDK**: Java Development Kit (versión recomendada 17)
- **Android Studio** (con SDK de Android y emulador configurado)
- **Xcode** y **CocoaPods** *(únicamente si desarrollas para macOS / iOS)*
- Para más detalles, consulta la [Guía oficial de configuración de React Native](https://reactnative.dev/docs/set-up-your-environment).

---

## Inicio Rápido

El código fuente de la aplicación móvil se encuentra ubicado en la carpeta [`app/`](app/).

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Melodify.git
cd Melodify
```

El repositorio es un monorepo de npm: `app/` es la app Expo y `packages/` sus paquetes internos.

### 2. Configurar variables de entorno

Las variables públicas de la app viven en `app/.env` (Expo lee el `.env` del directorio donde está `app.json`). Cópialo del ejemplo y rellena el client ID de Spotify:

```bash
cp app/.env.example app/.env
```

| Variable | Para qué sirve |
|---|---|
| `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` | Client ID de tu app en el [panel de Spotify](https://developer.spotify.com/dashboard). Sin él, la app funciona con el catálogo de ejemplo y la tarjeta de conexión lo explica. |
| `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` | Opcional. El redirect exacto registrado en el panel. Si se deja vacío, la app lo calcula para Expo Go. |

#### Registrar el redirect en Spotify

El redirect tiene que coincidir **carácter por carácter** con el que registra la app:

1. Arranca Metro (`npm start` desde `app/`) y busca en la salida la línea `redirect de Spotify resuelto: …`.
2. Copia ese valor tal cual y añádelo en el panel de Spotify, en **Redirect URIs** de tu app.
3. Si prefieres fijarlo tú, escribe el mismo valor en `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI` y regístralo en el panel.
4. Reinicia Metro con `npm start -- --clear` después de tocar el `.env`: las variables `EXPO_PUBLIC_*` se incrustan al empaquetar.

> [!NOTE]
> Sin `app/.env` la app no se rompe: entra con `demo` / `demo`, Inicio y Actividad funcionan completos, y Explorar y Crear usan el catálogo de ejemplo con la tarjeta «La conexión con Spotify no está configurada en esta instalación».

> [!TIP]
> Las variables documentadas están en [app/.env.example](app/.env.example).

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar el servidor Metro

Desde la carpeta `app/`, inicia el empaquetador de JavaScript:

```bash
cd app
npm start
```

### 5. Abrir la app en el teléfono

Con la app **Expo Go** instalada en el teléfono Android:

1. Conecta el teléfono y el ordenador a la misma red.
2. Escanea el código QR que imprime Metro (o introduce la URL `exp://…` a mano).
3. Entra con el usuario `demo` y la contraseña `demo`.

La app no necesita compilación nativa ni tiendas: se ejecuta en Expo Go.

---

## 🧪 Calidad de Código y Pruebas

Para asegurar la calidad antes de abrir un Pull Request, ejecuta los scripts de validación:

```bash
# Validar sintaxis y tipos con TypeScript
npm run typecheck

# Validar reglas de estilo con ESLint
npm run lint

# Ejecutar pruebas unitarias con Jest
npm test
```

Estas comprobaciones se ejecutan de manera automática en el pipeline de CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) en cada push o pull request hacia las ramas `main` y `develop`.

---

## Flujo de Contribución

1. Crea una rama descriptiva a partir de `develop`:
   ```bash
   git checkout -b feat/mi-nueva-funcionalidad
   ```
2. Realiza tus commits respetando el formato de [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: descripción de nueva característica`
   - `fix: corrección de error`
   - `docs: cambios en la documentación`
3. Verifica que las pruebas y el linter pasen localmente (`npm run typecheck && npm run lint && npm test`).
4. Abre tu Pull Request completando la [plantilla oficial de PR](.github/pull_request_template.md).
