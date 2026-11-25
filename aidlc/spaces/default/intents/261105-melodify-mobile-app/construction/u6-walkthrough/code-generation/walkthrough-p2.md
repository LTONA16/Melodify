# Recorrido — P2 — 2026-11-20

> Registro de ejecución de la pasada **P2 (R1, tema oscuro)**. Este fichero es una **plantilla de ejecución**: ningún paso se ha ejecutado en este entorno, porque no hay teléfono Android físico, Expo Go, Metro, control de tema ni modo avión. Los resultados quedan `⏳` a la espera de la verificación manual. No se presenta como pasada cerrada y **no satisface BR27.5**.

- **Dispositivo**: Pendiente de identificar en el teléfono · **Android**: Pendiente · **Expo Go**: Pendiente
- **Commit**: `9dc6824` · **Tema**: oscuro · **Spotify**: sin sesión
- **Client ID configurado**: no requerido en R1 · **Metro**: pendiente de levantar desde `app/`

## Precondiciones

| # | Precondición | Estado | Nota |
|---|---|---|---|
| 1 | Teléfono Android físico con Expo Go instalado | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 2 | Metro levantado desde `app/` con la app en la misma red | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 3 | App abierta sobre el commit que se entrega (`9dc6824`) | ⏳ Pendiente | Confirmar el `git rev-parse --short HEAD` real al ejecutar; sobre cambios sin commitear la pasada no cuenta |
| 4 | Sesión de la app cerrada (si abre en Inicio, cerrar desde Perfil = W13) | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 5 | Tema del sistema en oscuro | ⏳ Pendiente | El tema se cambia en el dispositivo, no en la app; mismo contenido de siembra que P1 |
| 6 | Client ID de Spotify | N/A | No requerido en R1 |
| 7 | Redirect exacto cargado en el panel de Spotify | N/A | No requerido en R1 |

## Protocolo de la pasada

- **Arranque limpio** (BR25.3): recarga completa, cierre de sesión desde Perfil si abre en Inicio y vuelta a la siembra de C4, sin reinstalar ni borrar datos del dispositivo. Aplicar antes de empezar; **pendiente de ejecutar**.
- **Resultado de cada fila**: ✅, ❌ o N/A cuando la pasada se ejecute; N/A siempre con motivo y ninguna celda vacía (BR27.5). Mientras no se ejecuta, se usa `⏳` y `Obtenido: Pendiente`.
- **Resultado visual en oscuro** (BR26.5, NFR6): cada fila debe registrar contraste de texto e iconos y áreas táctiles de barra inferior, botones principales e iconos de tarjeta; si un par de colores ofrece duda, medir con `contrastRatio` y escribir el valor en la nota. Sin medición en este entorno.
- **Clasificación de un ❌** (BR27.2): defecto en alcance si rompe una AC de US11.1/US11.2, una regla BR26.x, un estado de la matriz o una prohibición de `project.md`; pendiente si pide función nueva, rediseño o mejora cosmética.
- **Bucle del defecto en alcance** (BR27.3, BR27.4): cambio mínimo dentro de props y estados ya declarados, recarga, repetir el tramo desde el paso anterior, anotar el commit y terminar con una pasada completa; sin tocar C1–C8, pantallas, tokens ni módulos nativos. Si un arreglo compartido afecta a R1, repetir P1 y P2 completas antes de cerrar.
- **Sin cambios en `app/**`**: no se ha observado ningún defecto, porque no se ha ejecutado la pasada.

## Pasos — W01–W14 con variantes (tema oscuro)

| Paso | Pantalla | Acción | Esperado | Obtenido | Resultado | Nota |
|---|---|---|---|---|---|---|
| W01 | Login | Abrir la app con la sesión de la app cerrada | Cinco textos visibles y sin barra inferior, con contraste en oscuro | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W02 | Login | Escribir credenciales distintas de `demo` / `demo` y tocar «Entrar» | Mensaje en línea en español legible en oscuro; se sigue en Login y lo escrito se conserva | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W03 | Login → Inicio | Escribir `demo` / `demo` y tocar «Entrar» | Se abre Inicio con el feed completo | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W04 | Inicio | Leer el feed sin tocar nada | «Para ti», ocho a diez tarjetas, portadas de bloque legibles en oscuro, chip «Conectar», sin huecos rotos | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W05 | Detalle de opinión | Tocar una tarjeta y volver | Texto completo legible; «‹ Volver» regresa al feed en la misma posición | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W05b | Hoja de comentarios | Desde el detalle, tocar el icono de comentarios, escribir uno y enviarlo; después cerrar | Lista o estado vacío, campo con contador, «Comentario publicado», comentario nuevo en la lista y «Cerrar» de vuelta al detalle | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W06 | Explorar | Leer la pantalla sin sesión y buscar | Tarjeta de conexión y sugerencias; resultados desde dos caracteres; búsqueda sin coincidencias lo dice | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W06b | Detalle de obra | Tocar una sugerencia y volver | Obra con sus opiniones; «‹ Volver» regresa a Explorar | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W07 | Crear | Elegir una obra del catálogo de ejemplo, escribir una opinión, valorar y publicar | Opinión publicada y confirmada; no se pide Spotify | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W08 | Crear | Intentar publicar con el texto vacío y, después, sin valoración | Mensaje en línea en español en cada caso; no se publica nada | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W09 | Inicio | Volver al feed | La opinión recién publicada está en Inicio con su portada de bloque | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W10 | Actividad | Abrir Actividad y tocar la fila de la publicación | «Publicaste tu opinión de «…»» arriba del grupo de hoy; tocarlo abre el detalle y «‹ Volver» regresa | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W11 | Perfil | Abrir Perfil | Opinión nueva en la lista propia, contadores suben y tarjeta «Sin conectar» | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W12 | Inicio | Activar el modo avión y volver a Inicio | Aviso «Sin conexión. Estás viendo lo último que cargamos.» con «Reintentar»; lo cargado sigue visible | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W12b | Inicio | Con el modo avión puesto, tocar «Reintentar» | Sin cierre ni blanco; aviso mientras no hay red y lista visible | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W12c | Crear | Con el modo avión puesto, entrar en Crear | Aviso sin acción y formulario usable | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W13 | Perfil → Login | Desactivar el modo avión, comprobar que el aviso ya no está y tocar «Cerrar sesión» | Aviso desaparece; vuelta a Login; reapertura en Login | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| W14 | Todas | Repasar los textos vistos en la pasada | Todo en español; sin mensajes técnicos ni en inglés; contraste y 44×44 revisados en oscuro | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |

## Capturas

Seis obligatorias de R1 en oscuro, adjuntas al PR y referenciadas por nombre; **pendientes de capturar**:

| Captura | Pantalla | Estado |
|---|---|---|
| `p2-login-oscuro.png` | Login | ⏳ Pendiente de capturar en el teléfono |
| `p2-inicio-oscuro.png` | Inicio | ⏳ Pendiente de capturar en el teléfono |
| `p2-explorar-oscuro.png` | Explorar | ⏳ Pendiente de capturar en el teléfono |
| `p2-crear-oscuro.png` | Crear | ⏳ Pendiente de capturar en el teléfono |
| `p2-actividad-oscuro.png` | Actividad | ⏳ Pendiente de capturar en el teléfono |
| `p2-perfil-oscuro.png` | Perfil | ⏳ Pendiente de capturar en el teléfono |

## Defectos

| ID | Paso | Síntoma | AC o regla | Decisión | Commit |
|---|---|---|---|---|---|
| — | — | Sin hallazgos: la pasada no se ha ejecutado | — | Pendiente de clasificación BR27.2 | — |

No hay ❌ observados. Todo hallazgo real se anotará aquí con su AC o regla, su clasificación, el commit del arreglo mínimo y el tramo repetido. Los pendientes se registrarán con qué falta y de qué dependen (BR28.3).

## Veredicto

Pendiente de ejecución manual — Requiere verificación manual en teléfono Android físico con Expo Go; no se ha ejecutado ningún paso, no se han tomado capturas ni medido contraste, y no hay defectos clasificados. Esta plantilla no satisface BR27.5 y no cuenta como demostración de AC11.1.1–AC11.1.5 en tema oscuro.
