# Monitoring de `u6-walkthrough`

> U6 no añade plataforma que observar, así que este documento no describe telemetría nueva. Lo que sí cambia respecto a U5 es **qué cuenta como señal**: la unidad no mide latencia ni disponibilidad, sino que la evidencia esté completa, que el recorrido llegue a un estado terminal legítimo y que ningún secreto o contenido ajeno se cuele en el PR. El «monitoring» de U6 es el CI, la consola existente y cuatro registros leídos por personas.

## Métricas y KPI

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Estado de los jobs `commit-lint` y `code-quality` | GitHub Actions | **Verde obligatorio** para mergear en `develop` y para entregar a `main` | Es la única puerta automática del proyecto (NFR5.13, `team.md` § Way of Working) |
| Cobertura de líneas por árbol | `npm test` (`jest --coverage`), job `code-quality` | **≥ 80 %** en cada árbol existente: `app/src/**` y los ocho `packages/*/src/**` | U6 no baja el suelo ni añade un árbol nuevo; una arreglo que rompa la cobertura deja el PR en rojo (NFR5.13) |
| Errores de `typecheck` | `npm run typecheck` (`tsc -b`) | **Cero**, con `strict: true` | Un arreglo de pasada no puede mover una firma pública sin actualizar consumidores (NFR3.25) |
| Avisos del linter | `npm run lint` | **Cero**, con las reglas de U2 y U4 intactas | Ninguna frontera se relaja para hacer pasar un síntoma del recorrido |
| Violaciones de Conventional Commits | `commit-lint` y título del PR | **Cero** | El historial de `main` sigue siendo la historia de lo entregado |
| Filas escritas en el recorrido | Cuatro registros `walkthrough-p{1..4}.md` | **52** en total: 36 de R1 y 16 de P3/P4, con S02–S08 en N/A motivadas si R2 se condiciona | Cierra el recuento de `performance-design.md`; ni una fila menos ni una de relleno |
| Capturas adjuntas al PR | PR a `develop` | **24** si R2 se ejecuta; **13** si se condiciona (12 de R1 + 1 de S01) | Sin captura no hay fila demostrada; el recuento distingue los dos desenlaces (BR27.1, NFR1.20) |
| Estado terminal de cada pasada | Veredicto del registro | Solo `Completada`, `Condicionada` o `Abortada`, con todos los campos llenos | Un `EnCurso` sin cierre no puede sostener el veredicto de la unidad (NFR1.19) |
| Celdas vacías en el registro | Revisión de las cuatro tablas | **Cero**; cada N/A explica su motivo y cada ❌ tiene fila en la tabla de defectos | Es la condición para escribir el veredicto (BR27.5) |
| Cadenas de token en la evidencia | Búsqueda en los cuatro registros y revisión de capturas | **Cero** resultados para `Bearer`, `access_token` y `refresh_token` | La credencial nunca debe aparecer en capturas ni registros (NFR3.24) |
| Archivos de configuración tocados | `git diff --stat` de manifiestos y logger | **Vacío** para los nueve `package.json`, lockfile, `jest.config.js`, `eslint.config.js`, `tsconfig.json`, `.env.example` y `logger.ts` | Prueba que U6 verificó sin construir (NFR3.25, NFR7.9) |
| Contraste cuando hay duda | `contrastRatio` de C1 sobre tokens del tema | Texto normal **≥ 4.5:1**; texto grande e iconos **≥ 3:1**, con valor y commit en la nota | No se sustituye la prueba de C1; se produce el número que la fila necesita (NFR6.11) |
| Recorrido en el teléfono | Persona, en Android físico | P1, P2 y P3/P4 completas o condicionadas, con y sin Spotify | Es el criterio de terminado; el CI no puede ver el teléfono ni el panel de Spotify |

## Alertas

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Check rojo en el PR | Falla cualquiera de los dos jobs | Bloqueante para el merge | Autor del PR, en la página del PR |
| `develop` roto | Un push a `develop` deja un job en rojo | Bloqueante para el siguiente PR | Quien tenga el siguiente cambio: se arregla o se revierte antes de seguir |
| Árbol por debajo del 80 % | La cobertura de cualquier árbol baja del umbral | Bloqueante para el merge | Autor del PR: se prueba la rama que falta, no se baja el umbral (`team.md` § Testing Posture) |
| Registro incompleto | Falta una fila, una celda, un motivo de N/A o el commit de un defecto | Bloqueante para el veredicto | Quien escribió la pasada; se corrige antes de cerrar |
| Captura ausente | El recuento no llega a 24 o a 13 según el desenlace | Bloqueante para el veredicto | Quien recorrió: se adjunta la captura o la fila no se cuenta como demostrada |
| Token o `.env` en el `diff` | Aparece `.env`, un fichero de token o alguna de las tres cadenas de búsqueda | Bloqueante para el PR; se detiene la entrega | Autor del PR, antes de cualquier merge (NFR3.24) |
| Redirect condicionado sin igualdad | El mapa lleva la línea pero el registro no lleva el mismo valor y fecha, o al revés | Bloqueante para cerrar R2 como condicionada | Autor del PR; se corrige la constancia (BR26.7, BR28.2) |
| Defecto sin commit | Una fila ❌ no tiene su entrada en la tabla de defectos o su repetición | Bloqueante para la pasada | Autor del arreglo; la pasada no se cierra hasta repetir el tramo |
| App cerrada o en blanco durante una fila | El paso termina en ❌ | Informativa en el registro; bloqueante si rompe una AC | Quien recorre: se clasifica y se corrige si está en alcance (BR26.1, BR27.3) |

**Ninguna alerta despierta a nadie.** No hay guardias ni servicio en producción; la alerta real es un check rojo o un registro incompleto, y su destinatario es quien abrió el PR. No se añade un escáner de secretos ni un validador de registros: TS-48 y Q1 = A dejaron la revisión en manos del checklist y de la lectura del PR.

## SLI / SLO

**No se definen.** Un SLI mide un servicio en funcionamiento —disponibilidad, latencia, tasa de error— y aquí no hay servicio desplegado. Lo más cercano a un objetivo es el veredicto de las cuatro pasadas, que se comprueba una vez por commit y no se expresa en porcentaje. Fijar un «99,9 %» sería copiar una cifra de otro proyecto y prometer algo que la app no puede sostener.

| SLI | SLO target | Measurement window |
|---|---|---|
| — | — | No aplica: no hay servicio desplegado; el catálogo remoto es de Spotify y la app corre en Expo Go |

## Logs y trazas

| Pieza | Qué hace | Dónde se ve | Qué **no** hace |
|---|---|---|---|
| `app/src/bootstrap/logger.ts` (LC-5) | Escribe `(code, message)` en la consola del runtime | Terminal de Metro y consola del teléfono | No cambia en U6; no envía nada a la red, no agrega y no persiste |
| `AppLogCode` | Vocabulario cerrado en U5 | Igual | No gana un código para la demo; un diagnóstico nuevo sería un cambio de contrato (NFR3.25, NFR9.9) |
| Registros `walkthrough-p{1..4}.md` (LC-20) | Guardan lo observado: pantalla, acción, esperado, obtenido, resultado y nota | Árbol del intento y PR | No son un canal de logs; no se importan desde la app ni entran en el bundle (TS-45) |
| Tabla de defectos | Clasifica cada ❌ y deja su commit y su repetición | Registro de la pasada | No mezcla pendientes con defectos en alcance (BR27.2) |
| Capturas | Muestran lo que la app pintó | Adjuntas al PR | No se commitean; no sustituyen a la fila ni permiten copiar contenido ajeno (TS-45) |
| Línea condicional del mapa | Anota redirect y fecha solo si R2 se condiciona | `external-dependency-map.md` | No crea una columna, un campo de cabecera ni una fuente de verdad paralela |

**La diferencia entre diagnóstico y evidencia es la frontera que U6 no cruza.** El logger describe fallos internos con códigos cerrados; el registro describe lo que vio una persona con palabras. Un error de búsqueda se anota como «No pudimos buscar en Spotify.» con «Reintentar», no como `ContentErrorCode`; una portada fallida se describe por su efecto visible, no por el título de la obra (NFR9.9).

| Situación | Se muestra a la persona | Se registra en la evidencia |
|---|---|---|
| Paso en ✅ | El estado esperado | La fila con obtenido y ✅ |
| Paso en ❌ | Lo que la app muestra | Fila, tabla de defectos y commit de la corrección |
| Paso N/A | — | Fila con motivo explícito |
| Modo avión en Inicio | Aviso «Sin conexión…» con «Reintentar» | Texto visible y acción; no código técnico |
| Modo avión en Crear | Aviso sin acción | La diferencia con Inicio se anota como decisión de BR26.4, no como error |
| Spotify sin redirect válido | Estado literal de la tarjeta y su «Reintentar» | Estado de contrato, mensaje, redirect y fecha; solo si R2 se condiciona |
| Token en el llavero | Nada | Nada; se buscan tres cadenas y deben dar cero |
| Texto de un comentario sembrado | Se ve en la hoja y en su captura | No se transcribe; la búsqueda debe dar cero en los cuatro registros |

## Paneles

No hay paneles nuevos. Los dos sitios que se miran ya existen:

| Sitio | Qué dice | Qué no dice |
|---|---|---|
| Pestaña **Actions** del repositorio | Si el commit pasa commitlint, tipos, lint, pruebas y cobertura | Nada del teléfono, del tema ni de Spotify |
| PR a `develop` | Registros, capturas, checklist y estado de los checks | Nada de latencia, disponibilidad ni telemetría de producto |

Añadir un panel exigiría primero un servicio que recibiera los datos, y eso es justo lo que `project.md` § Forbidden y NFR4.10 prohíben.

## Cómo se revisa la evidencia

| Comprobación | Cómo se hace | Resultado esperado |
|---|---|---|
| Cabecera repetible | Leer los ocho datos de los cuatro registros | Fecha, modelo, Android, Expo Go, commit, tema, Spotify, client ID y Metro; ninguno secreto |
| Cobertura del catálogo | Contar filas por pasada | 18 en P1, 18 en P2, 8 en P3 y 8 en P4, sin filas inventadas |
| Desenlace de R2 | Contar capturas y leer S01 | 12 capturas si se ejecuta; 1 captura de tarjeta y S02–S08 N/A motivadas si se condiciona |
| Defectos | Leer la tabla de defectos de cada registro | Cada ❌ con clasificación, commit y repetición del tramo |
| Secretos | Buscar `Bearer`, `access_token` y `refresh_token`; revisar `git ls-files` y el `diff` | Cero coincidencias, sin `.env` ni ficheros de token |
| Contenido ajeno | Buscar el texto de un comentario sembrado y los handles | Comentario: cero; handles: solo dentro de capturas o notas que reproducen la pantalla |
| Equidad condicional | Comparar registro y mapa | Mismo redirect y misma fecha, o ausencia en ambos |
| Cierre en verde | Ejecutar los tres comandos al final de la última pasada | `npm run typecheck`, `npm run lint` y `npm test` en verde |

## Assumptions & Open Questions

- `[assumption]` La consola de Metro sigue accesible durante el recorrido; si no lo estuviera, el diagnóstico se haría con `adb logcat`, sin cambiar el diseño ni añadir instrumentación.
- `[assumption]` La revisión de secretos y contenido es manual porque U6 no añade un paso al CI; el checklist de la plantilla y las búsquedas concretas son la compuerta.
- **Pregunta abierta para el cierre del workflow**: si R2 se condiciona, el veredicto debe decir qué mitad no se demostró y enlazar la línea del redirect; no puede afirmar «con sesión demostrada».
- **Pregunta abierta de `performance-design.md`**: el coste de las pasadas se cierra de antemano, pero el tiempo de cada una no es objetivo; la única señal de rendimiento es que ningún estado se quede en carga.

## Sources

- `performance-design.md` — NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20, NFR7.9 y NFR6.11: recuento de filas y capturas, cabecera de ocho datos, estados terminales y medición de contraste.
- `security-design.md` — NFR3.24, NFR3.25, NFR4.12 y NFR9.9: búsqueda de secretos, compuertas del arreglo, handles y texto de comentarios, y registro que no es telemetría.
- `logical-components.md` — LC-5 y LC-20: logger sin cambios y evidencia como artefacto de proceso.
- `components.md` — dependencias externas existentes y contexto del dispositivo; U6 no añade ninguna superficie de monitorización.
- `functional-spec.md` — catálogo de pasos P1–P4, salida condicionada de R2, forma del registro, tabla de defectos y criterio de cierre.
- `contract-summary.md` — C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0 y C8 1.1.0; U6 consume sin publicar contrato.
- `team.md` § Testing Posture y § Deployment — tres comandos como puerta, suelo del 80 % y recorrido manual como criterio de terminado.
- `project.md` § Mandated y § Forbidden — app recorrible sin Spotify, token en almacenamiento seguro y nada de código de demo ni secretos en la evidencia.
