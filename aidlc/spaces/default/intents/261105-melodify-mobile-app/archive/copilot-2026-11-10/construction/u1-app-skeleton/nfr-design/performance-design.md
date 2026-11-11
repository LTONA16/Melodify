# Diseño de rendimiento — U1 `u1-app-skeleton`

## Alcance y objetivos

La aplicación corre como un único proceso local en Expo Go, sin backend, red,
telemetría ni precarga de Spotify. Por ello el diseño optimiza el hilo de UI,
el arranque y las transiciones, no throughput de servidor.

| ID | Diseño verificable |
|---|---|
| NFR2.1 | `AppShell` monta una barra inferior única con cinco destinos autenticados; cada selección es una transición declarativa de un toque. |
| NFR2.2 | `AppSession` y las pantallas exponen una acción primaria directa; los fallos recuperables usan `ErrorState` con «Reintentar». |
| NFR8.4 | `InicioScreen` usa la semilla local en memoria y un guard de preparación por montaje; una sola operación concurrente y reintento explícito. |

## Estrategias

- **Bootstrap:** `bootstrap/` compone `AppSession`, `AppShell`, C1 y servicios
  por defecto. No hace trabajo de dominio ni importa pantallas concretas
  fuera de los módulos de composición. La lectura de sesión se inicia una vez,
  con cancelación lógica al desmontar.
- **Estado:** la semilla de una `OpinionCardModel` permanece en memoria. No hay
  caché remoto, paginación, base de datos ni precarga de Spotify en U1.
- **UI:** listas futuras deberán ser virtualizadas, pero U1 renderiza una sola
  tarjeta. Componentes presentacionales C1 reciben modelos ya preparados y no
  hacen I/O.
- **Operaciones asíncronas:** solo C3 puede leer/escribir el adaptador seguro.
  Los estados `loading` y `signingIn` son internos; las promesas se resuelven
  antes de publicar la vista observable y se ignoran si el componente ya no
  está montado.
- **Doble toque:** `signIn` y `signOut` son idempotentes mientras la operación
  esté pendiente; los controles se deshabilitan y se mantiene el foco/acción
  de recuperación.

## Presupuesto y evidencia

NFR8 no fija objetivos numéricos en esta versión. La evidencia comprueba que
no haya pantallas en blanco, que las transiciones respondan y que las
operaciones locales no se dupliquen mediante pruebas locales con contadores y
el recorrido manual del Android objetivo. No se añade instrumentación
permanente ni telemetría.

## ADR-PERF-01 — Render local y bootstrap mínimo

### Contexto
U1 necesita cumplir objetivos de latencia en Expo Go y no tiene servicio
remoto. El trabajo inicial debe ser pequeño y no dejar Login en blanco.

### Decisión
Mantener la semilla y el estado de navegación en memoria, hacer una sola
lectura controlada de C3 al arrancar y separar composición de presentación.

### Consecuencias
El arranque es predecible y testeable sin red; el contenido se pierde al
cerrar la app, conforme al alcance. No se puede ofrecer persistencia de
opiniones ni medir rendimiento remotamente.

### Alternativas rechazadas
- **Redux/estado global pesado:** añade trabajo y renders sin necesidad en U1.
- **Caché o precarga remota:** contradice la ejecución sin backend y el alcance
  del esqueleto.
- **Trabajo síncrono de almacenamiento dentro del render:** bloquearía el hilo
  de UI y dificultaría la cancelación.

## ADR-PERF-02 — Guard de operación única

### Contexto
El arranque y la semilla tienen estados de error y reintento; una doble
preparación podría duplicar trabajo o producir resultados fuera de orden.

### Decisión
Cada controlador mantiene un estado de operación (`idle`, `loading`,
`signingIn`) y un guard de generación/montaje. Solo el propietario inicia la
operación y cada resultado se aplica si sigue vigente.

### Consecuencias
La UI es estable y no duplica preparación; el código requiere pruebas de
cancelación, error y doble toque.

### Alternativas rechazadas
- **Permitir promesas concurrentes:** riesgo de carreras y estados obsoletos.
- **Bloqueo global de la app:** evita carreras pero degrada la recuperación y
  viola la separación AppShell/AppSession.

## Sources

- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/performance-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/security-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/scalability-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/reliability-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/observability-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/tech-stack-decisions.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/functional-design/functional-spec.md`
