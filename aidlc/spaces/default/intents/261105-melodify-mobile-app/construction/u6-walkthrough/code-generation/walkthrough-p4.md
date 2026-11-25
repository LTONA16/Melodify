# Recorrido — P4 — 2026-11-20

> Registro de ejecución de la pasada **P4 (R2, tema oscuro)**. Este fichero es una **plantilla de ejecución**: ningún paso se ha ejecutado en este entorno, porque no hay teléfono Android físico, Expo Go, Metro, cuenta de Spotify ni autorización en navegador. Los resultados quedan `⏳` a la espera de la verificación manual. No se presenta como pasada cerrada y **no satisface BR27.5**.

- **Dispositivo**: Pendiente de identificar en el teléfono · **Android**: Pendiente · **Expo Go**: Pendiente
- **Commit**: `9dc6824` · **Tema**: oscuro · **Spotify**: conectado (previsto; sin observar)
- **Client ID configurado**: pendiente de comprobar (sin secretos ni tokens en este registro) · **Metro**: pendiente de levantar desde `app/`

## Precondiciones

| # | Precondición | Estado | Nota |
|---|---|---|---|
| 1 | Teléfono Android físico con Expo Go instalado | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 2 | Metro levantado desde `app/` con la app en la misma red | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 3 | App abierta sobre el commit que se entrega (`9dc6824`) | ⏳ Pendiente | Confirmar el `git rev-parse --short HEAD` real al ejecutar |
| 4 | Sesión de la app cerrada (si abre en Inicio, cerrar desde Perfil = W13) | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| 5 | Tema del sistema en oscuro | ⏳ Pendiente | El tema se cambia en el dispositivo, no en la app; mismo contenido de siembra que P3 |
| 6 | `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` definido | ⏳ Pendiente | Comprobar sin escribir secretos; solo se documenta el nombre de la variable |
| 7 | Redirect exacto que resuelve la app cargado en el panel de Spotify | ⏳ Pendiente | Sin valor observado: no se inventa un redirect ni un mensaje de rechazo |

## Prerrequisitos de R2 y salida condicionada

| Dato | Estado | Nota |
|---|---|---|
| App de Spotify instalada y registrada | ⏳ Pendiente | Requiere verificación manual en teléfono Android físico con Expo Go |
| Client ID entregado por entorno | ⏳ Pendiente | Sin client secret: PKCE S256 no lo necesita |
| Redirect literal resuelto por la app | ⏳ Pendiente | Se anotará aquí tal cual se observe en S01; no se escribe un valor inventado |
| Mensaje del panel o navegador | ⏳ Pendiente | Igual: solo constancia de lo observado |
| Fecha de la comprobación | ⏳ Pendiente | Se anotará al ejecutar |
| Mapa de dependencias externas | Sin cambios | No se modifica `inception/delivery-planning/external-dependency-map.md`: no existe una observación condicionada real. La rama BR26.7/BR28.2 queda pendiente de ejecución manual |

Si al ejecutar S01 falta el client ID o el panel rechaza el redirect: ejecutar S01 igualmente, anotar el estado exacto de la tarjeta (`notConfigured` o `connectionError`), su texto literal, su «Reintentar» y que Inicio y Explorar siguen usables; S02–S08 pasan a N/A con «prerrequisito externo no resuelto» y la pasada se cierra como `Condicionada`, nunca como sesión demostrada. No se improvisan `expo-dev-client`, build propio ni cuenta distinta.

## Protocolo de la pasada

- **Arranque limpio** (BR25.3): recarga completa, cierre de sesión desde Perfil si abre en Inicio y vuelta a la siembra de C4, sin reinstalar ni borrar datos del dispositivo; **pendiente de ejecutar**.
- **Resultado de cada fila**: ✅, ❌ o N/A cuando se ejecute; N/A siempre con motivo y ninguna celda vacía (BR27.5). Mientras no se ejecuta, `⏳` y `Obtenido: Pendiente`.
- **Resultado visual en oscuro** (BR26.5, NFR6): contraste de texto e iconos y áreas táctiles de barra inferior, botones principales e iconos de tarjeta; si un par de colores ofrece duda, medir con `contrastRatio` y escribir el valor en la nota. Sin medición en este entorno.
- **Clasificación de un ❌** (BR27.2): defecto en alcance o pendiente; un ❌ de S01 por dependencia externa se clasifica como «condicionado por dependencia externa», no como pendiente.
- **Bucle del defecto en alcance** (BR27.3, BR27.4): cambio mínimo dentro de props y estados ya declarados, recarga, repetir el tramo, anotar el commit y pasada final completa; sin tocar C1–C8, pantallas, tokens ni módulos nativos.
- **Sin cambios en `app/**`**: no se ha observado ningún defecto, porque no se ha ejecutado la pasada.

## Pasos — S01–S08 (tema oscuro)

| Paso | Pantalla | Acción | Esperado | Obtenido | Resultado | Nota |
|---|---|---|---|---|---|---|
| S01 | Perfil o Explorar | Tocar «Conectar con Spotify» y autorizar en el navegador | Autorización PKCE S256, vuelta a la app y tarjeta «Conectado» en oscuro; si falla, estado exacto `connectionError` «No pudimos conectar con Spotify.» o `notConfigured` «La conexión con Spotify no está configurada en esta instalación.», con «Reintentar», e Inicio y Explorar usables | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S02 | Explorar | Buscar una obra real desde dos caracteres | Resultados del catálogo real con portadas reales legibles en oscuro | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S03 | Crear | Elegir una obra real encontrada y publicar | La opinión se publica sobre la obra real | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S04 | Inicio | Volver al feed | Opinión nueva con portada real; las demás obras reales también la muestran | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S05 | Actividad y Perfil | Abrir ambas | Evento y opinión con portada real, sin huecos | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S06 | App | Cerrar y reabrir la app | Sigue conectada y las portadas reales siguen ahí | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S07 | Explorar | Activar el modo avión y buscar | «No pudimos buscar en Spotify.» con «Reintentar»; al recuperar la red, «Reintentar» devuelve resultados y el recorrido sigue | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |
| S08 | Perfil | Tocar «Desconectar» y reabrir | Tarjeta «Sin conectar», portadas de bloque y estado desconectado al reabrir (token borrado) | Pendiente | ⏳ | Requiere verificación manual en teléfono Android físico con Expo Go |

## Capturas

Doce obligatorias de R2 si la pasada se ejecuta (seis pantallas en oscuro con portadas reales), o **una** captura de la tarjeta de Spotify en el estado observado en S01 si R2 queda condicionada. Todas **pendientes de capturar** y se adjuntan al PR, nunca al árbol:

| Captura | Pantalla | Estado |
|---|---|---|
| `p4-login-oscuro.png` | Login | ⏳ Pendiente de capturar en el teléfono |
| `p4-inicio-oscuro.png` | Inicio | ⏳ Pendiente de capturar en el teléfono |
| `p4-explorar-oscuro.png` | Explorar | ⏳ Pendiente de capturar en el teléfono |
| `p4-crear-oscuro.png` | Crear | ⏳ Pendiente de capturar en el teléfono |
| `p4-actividad-oscuro.png` | Actividad | ⏳ Pendiente de capturar en el teléfono |
| `p4-perfil-oscuro.png` | Perfil | ⏳ Pendiente de capturar en el teléfono |
| `p4-spotify-card-oscuro.png` | Tarjeta de Spotify en S01 | ⏳ Captura de respaldo si R2 queda condicionada; sustituye a las seis anteriores |

## Defectos

| ID | Paso | Síntoma | AC o regla | Decisión | Commit |
|---|---|---|---|---|---|
| — | — | Sin hallazgos: la pasada no se ha ejecutado | — | Pendiente de clasificación BR27.2 | — |

No hay ❌ observados. Todo hallazgo real se anotará aquí con su AC o regla, su clasificación, el commit del arreglo mínimo y el tramo repetido. Los pendientes se registrarán con qué falta y de qué dependen (BR28.3).

## Veredicto

Pendiente de ejecución manual — Requiere verificación manual en teléfono Android físico con Expo Go y prerrequisitos de Spotify resueltos; no se ha ejecutado ningún paso, no se han tomado capturas ni medido contraste, y no hay constancia de redirect ni motivo de rechazo. La salida condicionada de BR26.7/BR28.2 queda pendiente de una observación real de S01. Esta plantilla no satisface BR27.5, no cuenta como demostración de AC11.2.1–AC11.2.3 y no se presenta como sesión de Spotify demostrada.
