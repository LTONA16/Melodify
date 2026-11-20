# Diseño de rendimiento, usabilidad y fiabilidad — U6 `u6-walkthrough`

> **Provenance**: deriva de `nfr-requirements/performance-requirements.md` (NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20 y los heredados NFR8.1–NFR8.18, NFR2.1–NFR2.14, NFR1.1–NFR1.18), de `nfr-requirements/security-requirements.md` (NFR3.24, NFR4.12, NFR9.9, para lo que la evidencia puede contener y lo que no), de `nfr-requirements/tech-stack-decisions.md` (TS-44 a TS-48, NFR6.11 y NFR7.9), de `functional-design/functional-spec.md` (§ Las pasadas, § Salida condicionada de R2, § El registro de la pasada, § Defectos, § Máquina de estados de la pasada, § Criterio de cierre), de `functional-design/rules.md` (BR25.1–BR25.4, BR26.1–BR26.7, BR27.1–BR27.5, BR28.1–BR28.4), de `functional-design/frontend-components.md` (§ Comprobaciones transversales, § Estados por pantalla en el recorrido), de `inception/requirements-analysis/requirements.md` (NFR1, NFR2, NFR6, NFR8, FR11.1–FR11.6, FR12.1, FR12.2, RC-05) y de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0, C8 1.1.0).
> Fecha: 2026-11-20. Etapa: NFR Design · Unidad: `u6-walkthrough` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Qué resuelve este diseño

U6 no construye una pantalla ni un flujo: construye **una demostración**. Por eso los NFR de esta unidad no hablan de latencia ni de concurrencia, sino de dos cosas que sí se pueden diseñar y sí se pueden incumplir: **cuánto cuesta la demostración** y **qué hace que su resultado signifique algo**.

Este archivo convierte los siete requisitos de rendimiento, usabilidad y fiabilidad de la unidad en mecanismos concretos:

| Requisito | Qué decide este diseño |
|---|---|
| **NFR8.19** | Ningún paso se queda en carga sin salida, y la unidad no estrena instrumento de medida: la espera se juzga, no se cronometra |
| **NFR8.20** | El arranque limpio es un procedimiento con siete comprobaciones y una salida por cada una, no una intención |
| **NFR2.15** | El presupuesto de toques se apoya en piezas que ya existen, y el español se comprueba con una lista de lo prohibido |
| **NFR6.11** | El contraste tiene un camino ejecutable con la función y los tokens que ya están en el repositorio; el 44×44 se mide en C1 |
| **NFR1.19** | La máquina de estados de la pasada no tiene estado mudo: un ❌ no termina la pasada, la clasifica |
| **NFR1.20** | La evidencia está completa o no hay veredicto, y la cabecera de ocho datos la hace repetible |
| **NFR7.9** | Nada nuevo que instalar ni compilar: el entorno de la demostración es el de U1–U5 |

## Alcance: lo que esta etapa no diseña aquí

- **Escalabilidad** (`scalability-design`): no se diseña. `requirements.md` no fija objetivo y U6 no introduce ninguno: la app la usa una persona, el contenido vive en memoria y no hay servidor (RC-02, RC-03). Su ausencia es una decisión, no un olvido.
- **Fiabilidad** (`reliability-design`): filtrada por `produces_kinds`; se diseña en este archivo § NFR1, porque en esta unidad «fiabilidad» es «la pasada no se rompe y su evidencia no miente», no «el servicio aguanta».
- **Observabilidad** (`observability-design`): filtrada igual; se diseña en `security-design.md` § NFR9 (el registro es evidencia, no telemetría, y `AppLogCode` no cambia).
- **Seguridad y privacidad**: `security-design.md`. **Inventario de componentes**: `logical-components.md`.

## NFR8.19 — Ningún paso se queda esperando, y U6 no estrena una medición

**La decisión de diseño: en U6 el rendimiento se juzga, no se mide.** Medir latencia exigiría un instrumento que la unidad no puede añadir —un reloj visible, un contador de renders, un conmutador de depuración— y Q2 = A los descartó; además produciría un número que ninguna AC pide. Lo que sí se puede afirmar, y es lo que el recorrido afirma, es que **cada estado llega**: la pantalla sale de `loading` sola, a contenido, a vacío o a error con su acción.

### Los presupuestos heredados que el recorrido confirma

| Lo que se observa en el teléfono | Qué presupuesto heredado confirma | Dónde se ve |
|---|---|---|
| El feed de Inicio aparece y no queda en esqueleto | NFR8 de U2: la siembra se lee de memoria, sin red | W04 |
| La búsqueda de Explorar deja de esperar y muestra resultados o su vacío | `debounce` de 400 ms y tope de petición de U4 (NFR8 de U4) | W06 |
| La búsqueda con Spotify caído termina en «No pudimos buscar en Spotify.» con «Reintentar» | Tope de petición y traducción del error de U4 (NFR1 de U4) | S07 |
| Actividad abre con contenido o con su vacío, sin quedarse en carga | Carga de un fotograma cuando la sesión ya está resuelta (U5, NFR8.16–8.18) | W10 |
| Las seis pantallas cambian de tema sin recargar y sin esqueletos nuevos | El tema es un token, no una consulta (C1, NFR8 de U1) | P2, P4 |

Ninguna fila introduce un umbral nuevo. Si una espera **no termina** —un esqueleto que sigue a los pocos segundos, una pantalla en blanco—, no es una observación de rendimiento: es un defecto en alcance contra `AC11.1.1` y entra en BR27.2, con su corrección y su repetición del tramo (BR27.3). El registro no admite «tardó mucho»: o el estado llegó, o es ❌.

### El coste del recorrido, cerrado de antemano

| Pasada | Filas | Capturas |
|---|---|---|
| P1 (R1, claro) | 18 (W01–W14 + W05b, W06b, W12b, W12c) | 6 (una por pantalla) |
| P2 (R1, oscuro) | 18 (las mismas, en oscuro) | 6 |
| P3 (R2, claro) | 8 (S01–S08) | 6 |
| P4 (R2, oscuro) | 8 | 6 |
| **Total con R2 ejecutada** | **52** | **24** (12 de R1 + 12 de R2) |
| **Total con R2 condicionada** | **52 filas escritas** (36 de R1 + 16 de P3/P4: S01 observada y S02–S08 registradas como N/A con motivo) | **13** (12 de R1 + 1 de la tarjeta en S01) |

Este recuento **cierra el desvío detectado en la revisión de NFR Requirements (R-02)**: el número de capturas de R2 es doce cuando R2 se ejecuta —seis en P3 y seis en P4— y no una; la captura única de la tarjeta sustituye a esas doce solo en el desenlace condicionado, como dice el functional-spec § El registro de la pasada. La revisión de la evidencia se hace contra **24** en el camino normal y contra **13** en el condicionado, nunca contra doce o trece en abstracto.

**Cómo se comprueba.** El registro de cada pasada tiene exactamente las filas de su catálogo, sin añadidos ni huecos (BR27.5); una pantalla que no sale de carga aparece en la tabla de defectos con su commit; y la revisión del `diff` confirma que no se añadió ningún temporizador, reloj visible, contador ni instrumentación (TS-44). El coste no puede crecer durante la unidad: si un defecto pidiera una fila nueva, sería una función nueva y un pendiente (BR25.1).

## NFR8.20 — El arranque limpio es un procedimiento, no una intención

El contenido vive en memoria (ADR-010), así que la recarga devuelve la siembra; la sesión de la app persiste en almacenamiento seguro (C3), así que hay que cerrarla a mano. Sin ese arranque, cada pasada mide el estado de la anterior y dos pasadas dejan de ser comparables.

### Las siete precondiciones, con su salida

| # | Precondición | Cómo se comprueba | Si falla |
|---|---|---|---|
| 1 | Teléfono Android físico disponible | El dispositivo responde y abre Expo Go | La pasada no arranca: bloqueo registrado, se reanuda (BR25.2) |
| 2 | Metro levantado desde `app/` | `npx expo start` sin aviso de módulo ausente | Ídem: sin Metro no hay pasada |
| 3 | Commit identificado | `git rev-parse --short HEAD` y árbol limpio salvo la evidencia | Se anota el commit real; una pasada sobre cambios sin commitear no cuenta |
| 4 | Sesión de la app cerrada | La app abre en Login | Se cierra sesión desde Perfil y ese cierre cuenta como W13 |
| 5 | Tema del sistema | Claro en P1/P3, oscuro en P2/P4 | Se cambia en el sistema del teléfono; no se recarga por el tema |
| 6 | Client ID configurado | `.env` con `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` presente (nunca commiteado) | R2 se condiciona con `notConfigured` observado en S01 (BR26.7) |
| 7 | Redirect admitido por el panel de Spotify | S01 autoriza y vuelve a la app | R2 se condiciona con `connectionError` observado y constancia del redirect (BR26.7) |

Las precondiciones 6 y 7 no bloquean la unidad: ejecutan S01 y condicionan R2 (BR25.4, BR26.7). Las cinco primeras sí: sin teléfono, sin Metro, sin commit, con sesión abierta o con el tema equivocado, la pasada no empieza, porque empezarla sería medir otra cosa.

### La cabecera que hace la pasada repetible

Ocho datos, los mismos en los cuatro registros: **fecha, modelo de dispositivo, versión de Android, versión de Expo Go, commit corto, tema, estado de Spotify y si el client ID estaba configurado**, más la constancia de que Metro se levantó desde `app/`. Son **ocho** y no siete: la revisión de NFR Requirements (R-04) detectó que la cabecera enumera ocho campos —los que fija BR27.1— y el texto hablaba de siete. Este diseño fija el número correcto y el registro no gana un campo: los que hay son los que la cabecera ya escribía.

Con esos ocho datos, otra persona llega al mismo commit, levanta Metro, cambia el tema, cierra la sesión y repite la pasada. **Ninguno de los ocho es secreto** (NFR3.24): el client ID se anota como «configurado: sí/no», nunca su valor.

**Cómo se comprueba.** La cabecera de cada `walkthrough-pN.md` tiene los ocho campos; W13 demuestra que la sesión se cerró y que al reabrir se vuelve a Login; una pasada que empieza con contenido ya modificado se repite, no se anota «dio igual».

## NFR2.15 — Un toque, y el estado dicho en español

El presupuesto de toques no se diseña aquí: lo cumplen piezas que ya existen, y la unidad lo único que hace es **comprobarlo y anotarlo**. Esto es lo que hay detrás de cada fila del presupuesto:

| Acción del recorrido | Toques | Qué lo hace posible (ya construido) |
|---|---|---|
| Cambiar de pestaña | 1 | La barra de cinco pestañas de C2 (`@melodify/app-shell` 1.4.0) |
| Entrar con `demo` / `demo` | 1 tras escribir | El formulario de Login con su acción primaria (U1) |
| Abrir y volver del detalle de opinión | 1 + 1 | La tarjeta entera tocable y «‹ Volver» en la cabecera de la pila (C2) |
| Abrir la hoja de comentarios y enviar | 1 + 1 | El icono social de la barra de la tarjeta y la acción de envío (U3) |
| Abrir una obra desde Explorar y volver | 1 + 1 | La fila de resultado entera tocable (U4) |
| Publicar una opinión | 1 tras elegir, escribir y valorar | La acción primaria de Crear (U3) |
| Recorrer un evento de Actividad | 1 | La fila entera de 56 de alto (U5) |
| Conectar y desconectar Spotify | 1 (+ autorización externa) / 1 | La tarjeta de Spotify y sus acciones (U4) |
| Reintentar un aviso o un error | 1 | El banner de conectividad en Inicio y el error de búsqueda de Explorar |

**Ningún paso exige leer una explicación previa.** Si un paso necesitara un tercer toque para llegar a la acción principal, no se rodea: se anota como hallazgo contra `NFR2` en la fila y, si rompe una AC, entra en la tabla de defectos.

### El español se comprueba con una lista de lo prohibido, no con una impresión

W14 no es «leer y ver qué tal»: es un repaso contra cuatro patrones que se pueden buscar.

| Patrón | Qué se busca | Dónde |
|---|---|---|
| Inglés | Palabras de interfaz en inglés (`Loading`, `Retry`, `Cancel`, `Sign in`, `Error`) | Capturas y textos de la app tocada |
| Código técnico | Identificadores y códigos en la interfaz (`HTTP 401`, `ContentErrorCode`, `connectionError` pintado) | Cada estado provocado |
| Mensaje sin acción habiendo algo que reintentar | Aviso sin «Reintentar» donde sí hay reintento (W12, W12b, S07) | Inicio, Explorar |
| Acción donde no hay nada que reintentar | «Reintentar» en el aviso de Crear, que es local (W12c, BR26.4) | Crear |

La cuarta fila es la que más se presta a «corregir» lo que está bien: la diferencia de acción entre Inicio y Crear **no es una inconsistencia**, es la decisión de BR26.4, y el recorrido la comprueba como tal. Un texto distinto del de `interaction-spec.md` pero en español, llano y con acción, se anota; un texto con código, en inglés o sin acción habiendo reintento es ❌ de `AC11.1.3`/`FR11.5` y de `project.md` § Mandated (BR26.3).

### El registro se lee sin el teléfono

Una fila por paso, con pantalla, acción, esperado, obtenido, resultado y nota; `Resultado` solo ✅, ❌ o N/A; un N/A siempre explica su motivo (BR27.5). Quien no recorrió puede leer el veredicto y saber qué se demostró.

## NFR6.11 — Contraste y 44×44 con el instrumento que ya existe

**La decisión de diseño: el número se obtiene con `contrastRatio` de C1 y los tokens del tema, desde el repositorio y en el mismo commit.** Esto cierra el hueco detectado en R-05: NFR6.11 y TS-46 piden el valor «si hay duda» y a la vez prohíben añadir una pantalla de medición, un conmutador o instrumentación, así que no había camino escrito para obtenerlo. El camino existe y no añade código: la función ya se exporta desde `@melodify/design-system` y el tema que pinta la pantalla son exactamente `lightColors`/`darkColors` de `packages/design-system/src/tokens.ts`.

```bash
node --input-type=module -e "import { contrastRatio } from './packages/design-system/src/contrast.ts'; import { lightColors as L, darkColors as D } from './packages/design-system/src/tokens.ts'; console.log('claro', contrastRatio(L.textMuted, L.bg).toFixed(2)); console.log('oscuro', contrastRatio(D.textMuted, D.bg).toFixed(2));"
```

- **Por qué mide lo que se ve.** La pantalla no transforma colores: consume `theme.colors.<rol>` del tema activo. Medir el par de tokens del tema es medir el par que se pinta; no hay opacidades ni mezclas intermedias en las piezas que el recorrido toca.
- **Qué se anota.** El par medido (`textMuted/bg`), el valor (por ejemplo **5.27** en claro y **6.70** en oscuro, medidos con la función del repositorio), el tema y el commit corto de la cabecera. La nota queda autocontenida: quien la lea puede repetir el comando.
- **Qué no se hace.** No se elige un color nuevo en la pantalla; si un par existente no alcanza el umbral, se busca otro par existente y, si ninguno sirve, es un pendiente de C1 (BR27.4, `frontend-components` § Qué cuenta como «ajuste»). No se añade una herramienta de escritorio ni una pantalla de medición.
- **La compuerta que ya existe.** `packages/design-system/src/__tests__/contrast.test.ts` afirma los mismos umbrales sobre los mismos roles en los dos temas (texto normal ≥ 4.5:1, texto grande e iconos ≥ 3:1). El comando de arriba no sustituye esa prueba: produce el número cuando una fila lo necesita, y la prueba evita que un token se degrade sin que nadie lo note.
- **El 44×44 no necesita instrumento**: la altura declarada está en C1 (la fila de Actividad mide 56, la barra y los botones declaran su área) y el dedo confirma lo que la declaración dice. Un área que se siente pequeña y mide menos de 44 es ❌; una que mide 44 y se siente pequeña no lo es.

## NFR1.19 — La máquina de estados de la pasada, y por qué un ❌ no la termina

La máquina del functional-spec se implementa como un **procedimiento con salidas obligatorias**, no como un diagrama decorativo. Cada transición tiene un disparador observable y una consecuencia escrita en el registro:

| Estado | Se entra cuando | Qué obliga a escribir | Salida |
|---|---|---|---|
| `Preparada` | Las siete precondiciones se cumplen | La cabecera completa | `EnCurso`; o `Abortada` si falta teléfono o Metro |
| `EnCurso` | Empieza el primer paso | Una fila por paso con su resultado | `Defecto` ante un ❌; `Completada` al cerrar el último paso |
| `Defecto` | Un paso queda en ❌ | La fila del defecto, su clasificación (BR27.2) y su AC | `Corrigiendo` si está en alcance; `EnCurso` si es pendiente |
| `Corrigiendo` | El defecto está en alcance | El cambio mínimo y el commit | `ReVerificando` tras recargar |
| `ReVerificando` | El cambio está aplicado y Metro recargado | El tramo repetido | `EnCurso` si vuelve ✅; `Defecto` si el arreglo no basta |
| `Completada` | Todos los pasos tienen resultado | La pasada final completa | Terminal |
| `Condicionada` | R2 pierde su prerrequisito | S01 observada, S02–S08 en N/A con motivo, redirect y fecha | Terminal para R2; R1 sigue cerrando la unidad |
| `Abortada` | Falta teléfono o Metro | El bloqueo y cuándo se reanuda | Terminal hasta reanudar; no cuenta |

**Solo se aborta por falta de entorno.** Un fallo de la app no aborta: se clasifica. Es la diferencia entre «no pude demostrar» y «demostré que falla», y la unidad solo puede cerrar sobre la segunda. La app no se queda cerrada ni en blanco como forma de continuar: si un paso la cierra, ese cierre es el ❌ del paso, después se recarga y se repite el tramo (BR26.1, BR27.3).

**Una pasada condicionada es un terminal legítimo, no una pasada a medias**: conserva el ❌ de S01 con su nota, marca S02–S08 como N/A con «prerrequisito externo no resuelto» y no se cuenta como completa. R1 sigue cerrando la unidad (BR28.1, BR28.2).

**Pendiente y defecto no se mezclan.** Un pendiente se registra con qué falta y de qué depende y no bloquea la pasada; un defecto que rompe una AC se corrige antes de seguir. Mezclarlos deja la unidad sin criterio de cierre (BR27.2, BR28.3).

## NFR1.20 — La evidencia se sostiene sola

Cuatro invariantes, y ninguna admite excepción:

1. **Sin celdas vacías.** Cada fila del catálogo de la pasada tiene resultado; cada N/A explica su motivo; cada ❌ está en la tabla de defectos con su decisión y, si se corrigió, su commit. Sin eso no se escribe el veredicto (BR27.5).
2. **Las capturas son las que son.** 12 de R1 y 12 de R2 cuando R2 se ejecuta; 12 de R1 y 1 de la tarjeta en S01 cuando R2 se condiciona. Se referencian por nombre (`p1-inicio-claro.png`) y viven en el PR, no en el árbol (TS-45).
3. **El contenido de partida es el mismo para todos.** Recarga completa → siembra: ocho a diez opiniones, cuatro o cinco autores, tres opiniones propias, dos seguidos, dos me gusta y tres comentarios recibidos. U6 no siembra nada y no conserva datos entre pasadas.
4. **La unidad cierra con el repositorio en verde.** `npm run typecheck`, `npm run lint` y `npm test` al final de la última pasada, con el suelo del **80 % de líneas sobre `app/src/**`** intacto (BR28.1). Un arreglo no baja el suelo ni deja la suite en rojo «para arreglar luego» (`team.md` § Testing Posture, § Way of Working).

**Cómo se comprueba.** Releer cada registro contra las siete precondiciones y el criterio de cierre de siete puntos del functional-spec; ejecutar los tres comandos al final; revisar que el `diff` de cada defecto tocó solo la pantalla que falló (`git diff --stat` del commit del defecto).

## Presupuesto en una línea

| Ruta | Objetivo | Cómo se comprueba |
|---|---|---|
| Preparar una pasada | Arranque limpio: recarga + sesión cerrada, siete precondiciones o bloqueo escrito | Cabecera de ocho datos + W13 |
| P1 y P2 (R1) | 18 filas por pasada y 12 capturas entre las dos | Registros `walkthrough-p1.md` y `walkthrough-p2.md` |
| P3 y P4 (R2) | 8 filas por pasada y 12 capturas si se ejecutan; 1 captura y S01 observada si se condicionan | Registros `walkthrough-p3.md` y `walkthrough-p4.md` |
| Coste total | 52 filas y 24 capturas; con R2 condicionada, 52 filas escritas (36 de R1 + 16 de P3/P4 con S02–S08 en N/A motivadas) y 13 capturas | Recuento de las cuatro tablas |
| Repetir una pasada | Los ocho datos de cabecera bastan para volver al mismo estado | Relectura del registro por otra persona |
| Medir el rendimiento | **No se mide**: se juzga que cada estado llega y que ninguna pantalla queda en carga | Filas ✅/❌ y tabla de defectos |
| Medir contraste | Solo si hay duda: `contrastRatio` sobre los tokens del tema activo, valor y commit en la nota | Comando de § NFR6.11 + `contrast.test.ts` |
| Entorno | Android físico, Expo Go, Metro; nada nuevo que instalar ni compilar | `npx expo start` + `git diff --stat` de los `package.json` |

## Assumptions & Open Questions

- `[assumption]` Cuatro pasadas completas son el coste mínimo de `AC11.1.5` y `AC11.2.1`–`AC11.2.3`: dos temas por cada mitad de Spotify. Si R2 se condiciona, el coste baja a dos pasadas completas y una captura, y el veredicto lo dice.
- `[assumption]` No se mide latencia en el teléfono. El criterio de NFR8 es el recorrido sin errores, y el recorrido solo puede decir si el estado llegó.
- `[assumption]` El tiempo de una pasada no es un objetivo. Lo que se acota es el número de filas y capturas, no los minutos.
- `[assumption]` La medición de contraste se hace sobre los tokens del tema activo con la función de C1, desde el repositorio y en el commit de la cabecera. No sustituye a la prueba de C1 ni mide un color que la app no pinte: mide el par exacto que la pantalla compone.
- `[assumption]` Las filas del catálogo no cambian durante la unidad. Si un defecto obligara a añadir un paso, sería una función nueva y un pendiente (BR25.1), no una fila más.
- **Open question para el cierre del workflow**: si R2 queda condicionada, la mitad con sesión deja de estar demostrada y pasa a ser deuda con dependencia externa. El registro y el mapa de dependencias externas deben llevar el mismo redirect y la misma fecha (BR26.7, BR28.2); el diseño de esa constancia está en `security-design.md` § El redirect literal.

## Sources

- `performance-requirements` — `construction/u6-walkthrough/nfr-requirements/performance-requirements.md` (NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20).
- `security-requirements` — `construction/u6-walkthrough/nfr-requirements/security-requirements.md` (NFR3.24, NFR4.12, NFR9.9).
- `tech-stack-decisions` — `construction/u6-walkthrough/nfr-requirements/tech-stack-decisions.md` (TS-44–TS-48, NFR6.11, NFR7.9).
- `functional-spec` — `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § El registro de la pasada, § Máquina de estados, § Criterio de cierre).
- `rules` — `construction/u6-walkthrough/functional-design/rules.md` (BR25.2–BR25.4, BR26.1–BR26.7, BR27.1–BR27.5, BR28.1–BR28.3).
- `frontend-components` — `construction/u6-walkthrough/functional-design/frontend-components.md` (§ Comprobaciones transversales, § Estados por pantalla en el recorrido).
- `contrast` — `packages/design-system/src/contrast.ts`, `tokens.ts` y `__tests__/contrast.test.ts` (función, tokens y prueba vigentes).
