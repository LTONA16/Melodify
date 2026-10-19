# 🏛️ 04. Arquitectura Básica del Sistema

Este documento describe la arquitectura global, las capas de software, el flujo de datos y los componentes técnicos que integran **Melodify**.

---

## 4.1. Diagrama de Arquitectura Global

```mermaid
flowchart TB
    subgraph ClientLayer["📱 Capa Cliente (Frontend Móvil)"]
        RNApp["React Native App (iOS / Android)\nTypeScript + React 19"]
        SecureStorage["Secure Storage (Tokens / Sesión)"]
        LocalCache["Cache Local / Estado Global"]
    end

    subgraph APILayer["☁️ Capa de Servicios (Backend Melodify)"]
        Gateway["API Gateway / Router REST"]
        AuthService["Servicio de Autenticación & Usuarios"]
        SocialService["Servicio Social (Feed, Reseñas, Calificaciones)"]
        MusicCatalog["Servicio de Catálogo Musical & Cache"]
        StatsEngine["Motor de Estadísticas & Agregaciones"]
        MCPServer["Servidor MCP / Capa de Agentes (Fase 3)"]
    end

    subgraph DataLayer["💾 Capa de Persistencia"]
        PrimaryDB[("Base de Datos Principal\n(Usuarios, Reseñas, Logs)")]
        RedisCache[("Redis / Cache de Metadatos")]
    end

    subgraph ExternalServices["🌐 Servicios Externos"]
        SpotifyAPI["Spotify Web API\n(Metadatos musicales & OAuth)"]
        AIProvider["Proveedor de IA Generativa\n(Resúmenes Narrativos)"]
    end

    RNApp <-->|HTTPS / REST API| Gateway
    Gateway --> AuthService
    Gateway --> SocialService
    Gateway --> MusicCatalog
    Gateway --> StatsEngine
    Gateway -.-> MCPServer

    AuthService --> PrimaryDB
    SocialService --> PrimaryDB
    StatsEngine --> PrimaryDB
    MusicCatalog <--> RedisCache

    MusicCatalog <-->|Client Credentials| SpotifyAPI
    AuthService <-->|OAuth 2.0 Auth Code| SpotifyAPI
    StatsEngine -->|Datos Agregados Saneados| AIProvider
    MCPServer -.-> AIProvider
```

---

## 4.2. Capa Cliente (Aplicación Móvil)

La aplicación está construida sobre **React Native**:
- **Framework**: React Native `0.87.x` con React `19.x`.
- **Lenguaje**: TypeScript en modo estricto (`tsc --noEmit`).
- **Gestión de Estilos y UI**:
  - `react-native-safe-area-context` para manejo de áreas seguras (notches, barras del sistema).
  - Tema adaptativo claro/oscuro (`useColorScheme`).
- **Arquitectura Interna Recomendada**:
  ```text
  app/src/
  ├── api/             # Clientes HTTP y llamadas a endpoints
  ├── assets/          # Íconos, imágenes estáticas y fuentes
  ├── components/      # Componentes reutilizables (Botones, Estrellas, Cards)
  ├── navigation/      # Stacks y Bottom Tabs de navegación
  ├── screens/         # Pantallas principales (Feed, Perfil, Detalle Álbum, etc.)
  ├── hooks/           # Custom hooks de lógica reutilizable
  ├── services/        # Servicios de autenticación y conectividad
  └── types/           # Definiciones de TypeScript (User, Review, Album, Track)
  ```

---

## 4.3. Capa de Backend y Servicios

El backend actúa como un intermediario seguro para orquestar la lógica de negocio y proteger credenciales sensibles:

1. **Servicio de Autenticación**:
   - Registro e inicio de sesión seguro (JWT / Tokens con rotación).
   - Gestión de vinculación OAuth 2.0 con Spotify.
2. **Servicio de Catálogo Musical**:
   - Abstracción de llamadas hacia la **Spotify Web API**.
   - Almacenamiento en caché de álbumes, canciones y artistas consultados frecuentemente para optimizar la cuota de peticiones.
3. **Servicio Social y Reseñas**:
   - CRUD de calificaciones (1 a 5 estrellas) y reseñas textuales.
   - Algoritmo de feed o muro social basado en relaciones de seguimiento (`followers` / `following`).
4. **Motor de Estadísticas y Privacidad**:
   - Agregación previa de métricas musicales (frecuencias, notas promedio, artistas más escuchados).
   - Filtrado de PII (Información Personal Identificable) antes de interactuar con modelos de IA.

---

## 4.4. Flujo de Datos Típico

### Flujo 1: Calificación y Reseña de un Álbum
```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant App as React Native App
    participant Backend as Backend API
    participant DB as Base de Datos

    Usuario->>App: Busca álbum y selecciona "Calificar"
    App->>Backend: POST /api/v1/reviews { albumId, rating, comment }
    Backend->>Backend: Valida token JWT y payload
    Backend->>DB: Guarda reseña y actualiza promedio del álbum
    DB-->>Backend: Confirmación
    Backend-->>App: Reseña creada exitosamente
    App-->>Usuario: Muestra confirmación y actualiza feed local
```

### Flujo 2: Generación de Resumen Musical con IA
```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant App as React Native App
    participant Backend as Backend API
    participant AI as Proveedor IA

    Usuario->>App: Solicita "Generar Resumen de mi Mes"
    App->>Backend: POST /api/v1/ai/summary { period: "month" }
    Backend->>Backend: Calcula métricas agregadas del usuario
    Backend->>Backend: Sanitiza y genera prompt sin identificadores personales
    Backend->>AI: Envía prompt con métricas agregadas
    AI-->>Backend: Retorna narrativa generada
    Backend-->>App: Envía texto del resumen
    App-->>Usuario: Muestra resumen en pantalla (con opción de descartar o compartir)
```

---

## 4.5. Configuración y Seguridad

- **Variables de Entorno**: Se definen en [app/.env.example](../app/.env.example).
- **Secretos de API**: Las llaves privadas (`SPOTIFY_CLIENT_SECRET`, API keys de IA) **nunca** residen en el cliente móvil; se resguardan en las variables del servidor backend.
- **Tokens de Usuario**: En el dispositivo móvil se resguardan utilizando almacenamiento seguro cifrado (Keychain en iOS, Keystore / EncryptedSharedPreferences en Android).
