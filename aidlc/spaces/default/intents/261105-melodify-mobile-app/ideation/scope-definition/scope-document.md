# Scope Document — Melodify

> **Provenance**: deriva de `ideation/intent-capture/intent-statement.md` (`intent-statement`), de `ideation/feasibility/feasibility-assessment.md` (`feasibility-assessment`) y de `ideation/feasibility/constraint-register.md` (`constraint-register`), más las respuestas de esta etapa (`scope-definition-questions.md`, Q1–Q8).
> Fecha: 2026-11-05. Etapa: Scope Definition. Agente: aidlc-product-agent.

## Propósito

Definir qué entra y qué queda fuera de esta primera versión de Melodify, y en qué orden se construye. El alcance de workflow es `mvp`: se omite toda la fase de operación. [scope]

## Definición de terminado

La primera versión está terminada cuando **las seis pantallas existen, se navegan entre sí y se recorren sin errores en Expo Go sobre un teléfono Android físico**, con contenido de ejemplo local. [Q1] [Q7-feasibility]

Ese es el criterio que manda cuando haya que recortar: se prefiere una pantalla menos ambiciosa pero recorrible antes que una pantalla rica que rompe el recorrido.

## Dentro de alcance

### Capacidades incluidas

| Capacidad | Qué incluye | Prioridad | Origen |
|---|---|---|---|
| Fundación de la app | Proyecto Expo, navegación entre pantallas, tema visual y componentes compartidos (tarjeta de opinión, encabezado, botón) | Must | Q5 |
| Login simulado | Pantalla de entrada con credenciales de ejemplo fijas (`demo` / `demo`); al entrar lleva al inicio | Must | Q4 |
| Inicio | Feed de opiniones musicales de ejemplo, con autor, disco o canción y texto de la opinión | Must | Q1 |
| Explorar | Descubrimiento de contenido de ejemplo: búsqueda o filtro simple sobre el mismo conjunto de datos | Must | Q1 |
| Crear | Formulario para publicar una opinión: canción o disco, texto y valoración; se añade a la lista en memoria | Must | Q1, Q8 |
| Actividad | Historial de interacción simulada: lo publicado y las reacciones de otros usuarios de ejemplo | Must | Q1, Q2 |
| Perfil | Usuario de ejemplo con sus opiniones y la lista de usuarios que sigue | Must | Q1, Q2 |
| Interacción social simulada | Seguir y comentar sobre datos locales, sin backend | Should | Q2 |
| Notificaciones locales | Avisos simulados dentro de la app; no hay servicio de push | Could | Q3 |
| Recorrido completo verificado | Recorrer las seis pantallas de punta a punta en el teléfono Android sin errores | Must | Q1, Q7-feasibility |

### Reglas de alcance

- **Contenido de ejemplo mínimo**: una o dos tarjetas u opiniones por pantalla, suficiente para demostrar el diseño. [Q6]
- **Sin persistencia**: lo creado vive en memoria y se reinicia al recargar; la app es una demo. [Q8]
- **Secuenciación riesgo primero**: primero la navegación y los componentes compartidos, después el contenido de cada pantalla. [Q5]
- **Interfaz en español**: todos los textos visibles. [intent-statement]
- **Privacidad como estructura**: el login no pide datos reales y los puntos de extensión de privacidad quedan previstos. [constraint-register CR-01..CR-04]

## Fuera de alcance

| Exclusión | Motivo | Origen |
|---|---|---|
| Backend, API y base de datos | La versión es una demo con datos locales | [Q8-intent-capture] |
| Autenticación real | El login simula el ingreso con credenciales fijas | Q4 |
| Integración con Spotify, Apple Music, Last.fm o cualquier servicio musical | Frontera de producto confirmada en la etapa anterior | [intent-statement], [Q1-feasibility] |
| Servicio de notificaciones push | Requiere backend y cuentas; se sustituye por avisos locales simulados | Q3 |
| Publicación en Google Play o App Store | Requiere cuenta de desarrollador y compilación en la nube | Q3, [Q6-feasibility] |
| Persistencia local entre sesiones | La demo se reinicia al recargar | Q8 |
| Módulos nativos que exijan build propio | El entorno es Expo Go | [constraint-register CT-05] |
| Internacionalización | La interfaz va solo en español | [intent-statement] |
| Reproducción de audio | No se pidió y no aporta al criterio de terminado | [desc] |
| Fase de operación (observabilidad, despliegue, incidentes) | El alcance `mvp` la omite | [scope] |

## Value Stream Map

```
Login simulado
   └─> Inicio (feed de opiniones de ejemplo)
          ├─> Explorar (descubrir contenido)
          │      └─> Ver una opinión ─> seguir o comentar (simulado)
          ├─> Crear (publicar una opinión)
          │      └─> La opinión aparece en Inicio y en Actividad
          ├─> Actividad (lo publicado y las reacciones de ejemplo)
          └─> Perfil (usuario demo, sus opiniones, a quién sigue)
```

**Resultado para el usuario**: entra a la app, ve opiniones musicales, descubre contenido, publica la suya y comprueba que aparece en su actividad y en su perfil. El recorrido completo es el valor; ninguna pantalla aislada lo es.

## Secuenciación

El orden es **riesgo primero**: la incertidumbre está en el stack (React Native y Expo, nuevos para el equipo) y en la navegación, no en el contenido. [Q5] [feasibility-assessment]

1. Fundación: proyecto Expo, navegación y componentes compartidos.
2. Login simulado.
3. Inicio, Explorar, Crear, Actividad y Perfil sobre la base ya establecida.
4. Recorrido completo verificado en el teléfono.

Construir primero el contenido de las pantallas antes que la navegación obligaría a rehacerlo cuando cambie la estructura; por eso se invierte el orden habitual.

## Assumptions & Open Questions

- Las versiones mínimas de sistema operativo se fijarán al crear el proyecto Expo. [assumption]
- El nombre `Melodify` y la identidad visual no se definieron más allá del nombre; el diseño se resuelve en la etapa de mockups. [assumption]
- No se definió si «Explorar» será búsqueda por texto, filtro por género o ambas; se decide en el diseño funcional. [assumption]

## Sources

- `[desc]` Descripción inicial del pedido.
- `[scope]` Alcance de workflow: `mvp`.
- `[Q1]`–`[Q8]` Respuestas de esta etapa (`scope-definition-questions.md`).
- `[Q1-feasibility]`–`[Q8-feasibility]` Respuestas de la etapa anterior (`feasibility-questions.md`).
- `[Q8-intent-capture]` Respuesta de alcance técnico de intent-capture.
- `intent-statement` — `ideation/intent-capture/intent-statement.md`.
- `feasibility-assessment` — `ideation/feasibility/feasibility-assessment.md`.
- `constraint-register` — `ideation/feasibility/constraint-register.md`.
