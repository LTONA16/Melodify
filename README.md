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

### 1. Clonar el repositorio y acceder a la aplicación

```bash
git clone https://github.com/tu-usuario/Melodify.git
cd Melodify/app
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y completa las credenciales requeridas (por ejemplo, las llaves de Spotify):

```bash
cp .env.example .env
```

> [!TIP]
> Puedes revisar las variables documentadas en [app/.env.example](app/.env.example).

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar el servidor Metro

Inicia el empaquetador de JavaScript de React Native:

```bash
npm start
```

### 5. Compilar y ejecutar la aplicación

En una nueva terminal (dentro de la carpeta `app/`):

#### Para Android:
```bash
npm run android
```

#### Para iOS (solo macOS):
La primera vez o tras actualizar dependencias nativas, instala los pods:
```bash
bundle install
bundle exec pod install
```
Luego ejecuta la aplicación:
```bash
npm run ios
```

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
