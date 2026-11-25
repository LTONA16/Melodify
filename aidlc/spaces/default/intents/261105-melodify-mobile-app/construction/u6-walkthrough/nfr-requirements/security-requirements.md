# Requisitos de seguridad, privacidad y diagnóstico — U6 `u6-walkthrough`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR10.1, FR10.2, FR10.4, FR11.3–FR11.6, FR12.1, FR12.2, RC-02, RC-05, RC-09, A6), de `aidlc/spaces/default/memory/project.md` (§ Forbidden: client secret, backend, persistencia, `.env` y tokens, reproducción y publicación; § Mandated: recorrido sin Spotify, token en almacenamiento seguro, PKCE, Expo Go, textos en español, degradar con mensaje y acción), de `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Deployment, § Testing Posture, § Code Style), de `inception/domain-design/decisions.md` (ADR-010, ADR-012), de `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C7 1.0.0, C8 1.1.0, C9, C10), de `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § Salida condicionada de R2, § El registro de la pasada, § Defectos) y de `construction/u6-walkthrough/functional-design/rules.md` (BR25.2, BR26.3, BR26.6, BR26.7, BR27.1–BR27.4, BR28.3, BR28.4).

> Fecha: 2026-11-20. Etapa: NFR Requirements · Unidad: `u6-walkthrough` · Agente: aidlc-architect-agent · Profundidad: Standard.

## Cómo se lee este artefacto

Este archivo reúne tres objetivos que el motor no emite por separado para una unidad de tipo `ui`:

- **NFR3 — Seguridad**: U6 no importa un módulo nuevo ni abre una conexión, pero es la primera unidad que **saca evidencia del teléfono**. La pregunta ya no es «qué superficie abre la app», sino **qué superficie abre la demostración**: unas capturas y un registro que viajan en un PR.
- **NFR4 — Privacidad**: las capturas muestran el contenido de una cuenta y, en R2, resultados reales de Spotify. Lo que hay que decidir es **qué de lo visto se conserva fuera del teléfono y qué no**.
- **NFR9 — Diagnóstico**: `observability-requirements.md` no se produce para unidades `ui`; el logger de U1, ampliado en U2–U5, sigue siendo la única superficie. Aquí se fija que el registro del recorrido **no es telemetría** y qué se escribe en él.

**La frontera que esta unidad NO cruza.** U4 abrió red y guardó una credencial; U5 compuso sin abrir nada. **U6 cierra el proyecto sin añadir superficie técnica**: no añade dependencia, no añade módulo nativo, no añade almacenamiento, no añade un campo al logger y solo toca código para corregir lo que rompa una AC (BR25.1, BR27.4). Su superficie nueva es **documental** —cuatro ficheros markdown y las capturas del PR—, y por eso el análisis de esta unidad se parece más a una revisión de publicación que a un diseño de seguridad.

## Superficie de la unidad en una tabla

| Qué | Dónde vive en U6 | Quién lo ve después | Secreto |
|---|---|---|---|
| Texto de cada paso recorrido | `construction/u6-walkthrough/code-generation/walkthrough-p{1..4}.md` (en el repositorio del intento) | El equipo, en el PR y en el registro del intento | No |
| Capturas de las seis pantallas | Adjuntas al PR, referenciadas por nombre; **no** se commitean al árbol | El equipo que revisa el PR | No, pero es contenido de una cuenta |
| Tabla de defectos y commits | `walkthrough-pN.md` y el PR | El equipo | No |
| Modelo de teléfono y versión de Android | Cabecera de cada registro | El equipo | No: es entorno, no identidad de persona |
| Redirect literal de Expo Go (`exp://<ip>:8081/--/spotify-callback`) | Registro y `inception/delivery-planning/external-dependency-map.md` (BR26.7) | El equipo | No es credencial: es una URL de retorno con la IP privada del equipo de desarrollo |
| Estado de la tarjeta de Spotify en S01 | Registro, con su texto literal y su «Reintentar» | El equipo | No |
| Client ID de Spotify | **No se transcribe**: la cabecera solo dice si estaba configurado (`sí`/`no`) | — | No es secreto, pero no hace falta y no se copia |
| Token de Spotify | **No aparece**: vive en `expo-secure-store` y ninguna pantalla lo pinta (NFR3.18 de U4) | — | **Sí** |
| `.env` | **No se commitea**: `.env.example` solo documenta nombres de variables | — | **Sí** (contiene el valor real) |
| Client secret de Spotify | **No existe** en el proyecto: PKCE sin secreto (CT-04) | — | **Sí**, si existiera |
| Mensajes de diagnóstico de la app | `app/src/bootstrap/logger.ts`, sin cambios en esta unidad | Todo el proyecto | No |

## NFR3 — Seguridad

### NFR3.24 — La evidencia no lleva un secreto: ni token, ni `.env`, ni client secret

| Superficie de la evidencia | Regla de esta unidad |
|---|---|
| Capturas | Muestran solo lo que la app pinta. La tarjeta de Spotify muestra su estado y su texto (`Conectado`, `No pudimos conectar con Spotify.`, `La conexión con Spotify no está configurada en esta instalación.`), nunca un token: el token no se renderiza en ninguna pantalla y U6 no puede hacerlo aparecer. |
| Registros `walkthrough-pN.md` | Escriben el estado observado, el texto literal de la pantalla y el resultado; **no** escriben el token, ni el contenido de `expo-secure-store`, ni el valor del client ID. |
| Redirect literal | Se anota porque BR26.7 lo exige, y es una URL de retorno con la IP privada del equipo, no una credencial. Se anota **una vez** en el registro y **una vez** en el mapa de dependencias externas, con la misma fecha. |
| `.env` | No se commitea en ningún caso; si aparece en el `diff`, el PR se detiene (`.github/pull_request_template.md` § checklist de calidad; `project.md` § Forbidden). |
| Client secret | No existe en el proyecto y U6 no lo introduce: PKCE S256 no lo necesita (CT-04, `project.md` § Forbidden). |
| PR | Rellena la plantilla con plataformas probadas, capturas y checklist, incluida la casilla de que no viaja ningún secreto (BR28.4). |

**Por qué importa en una unidad de verificación.** La app no puede filtrar el token por la interfaz —nunca lo pinta—, pero una captura mal elegida, un registro que copia el contenido del almacén seguro o un `.env` que se cuela en el commit sí lo filtrarían. El riesgo de U6 no está en el código que ejecuta la persona, sino en el material que la persona entrega.

**Cómo se verifica**: revisión del `diff` del PR que confirma que no hay `.env`, ni un fichero de token, ni un `.p12`/`.jks`; revisión de las capturas adjuntas contra la lista de doce (o trece si R2 se condiciona) y de que en ninguna aparece el token ni el valor del client ID; búsqueda en los cuatro registros de cadenas de token (`Bearer`, `access_token`, `refresh_token`) que debe dar cero resultados; revisión de `app/src/**` de que ninguna pantalla lee el token para pintarlo.

### NFR3.25 — Un arreglo de U6 no abre una puerta nueva

- **El arreglo cabe en las props y los estados que el contrato ya declara** (BR27.4). No añade red, ni almacenamiento, ni un permiso, ni un módulo nativo, ni un estado nuevo a una pantalla. Si lo exige, deja de ser un arreglo y se registra como pendiente (BR27.2).
- **No se añade código que solo sirva a la demostración**: ni un conmutador de depuración para vaciar el almacén, ni una pantalla de estados, ni un reloj visible, ni una instrumentación (Q2 = A, NFR8.19). Ese código sería la única superficie que no existiría en la app que se entrega.
- **No se toca el logger ni `AppLogCode`.** La unión quedó cerrada en U5; si un defecto necesitara un diagnóstico nuevo, sería una decisión de contrato y no un arreglo (NFR9.9).
- **No se toca C1–C8 más allá de lo que el propio contrato permite a sus consumidores.** Un ajuste de copy, de espaciado o de uso de un token existente no cambia el contrato; un cambio de token, de prop o de estado sí, y se convierte en pendiente (functional-spec § Límite del arreglo).
- **Una sola instancia de cada fuente sigue siendo la regla** (TS-05, TS-18): el recorrido no construye una segunda instancia ni una fuente de prueba paralela.
- **Cómo se verifica**: revisión de cada commit de la tabla de defectos contra BR27.4; `git diff --stat` de `package.json`, `package-lock.json` y `eslint.config.js` sin cambios; `npm run typecheck` y `npm run lint` en verde como prueba de que ninguna firma pública se movió sin actualizar consumidores.

## NFR4 — Privacidad

### NFR4.12 — Las capturas y el registro no exponen más de lo que la persona ya ve en su teléfono

**Lo que la evidencia conserva, y por qué:**

| Dato | Se conserva | Dónde | Por qué |
|---|---|---|---|
| Pantallas de la app con el contenido de la siembra | Sí | Capturas del PR | Es la demostración de `AC11.1.1` y `AC11.1.5` |
| Autores y handles sembrados (`lucia`, `ana`, `bruno`) | Solo lo que la pantalla pinta | Capturas y filas | Son datos de ejemplo; la pantalla ya los muestra (US2.3) |
| Texto de un comentario recibido | **No** se copia al registro | — | Se lee en la pantalla y en su captura; copiarlo a otro fichero no añade evidencia (BR26.1) |
| Títulos y portadas reales de Spotify (R2) | Sí, cuando R2 se ejecuta | Capturas del PR | Son catálogo público y la AC pide demostrar portadas reales (AC11.2.2) |
| Historial de escucha, perfil de Spotify, correo o nombre de la cuenta | **Nada** | — | La app no lo pide ni lo pinta; el token solo autoriza catálogo (FR10.4) |
| Modelo de teléfono y versión de Android | Sí | Cabecera | Reproducibilidad (NFR1.20); no identifica a una persona |
| IP privada en el redirect | Sí, literal | Registro y mapa de dependencias | BR26.7 lo exige; es una dirección de red local, no pública |
| Token, almacén seguro | **No** | — | NFR3.24 |

**Tres consecuencias que conviene dejar escritas:**

- **La evidencia es la pantalla, no una transcripción.** El registro dice qué se vio y qué se esperaba; no copia el contenido de otras personas a un fichero nuevo. Así la captura (que muestra lo mismo que la pantalla) es la única copia, y su alcance es el del PR.
- **R2 usa la cuenta real de quien recorre.** Q8 = D de Delivery Planning registró la app de Spotify y el recorrido se hace con sesión; la cuenta es la de la persona que verifica, y lo único que la app lee es el catálogo bajo su token. El token no se copia a la evidencia y se borra al desconectar (S08), que es también la comprobación de que el borrado ocurre.
- **El contenido demo se trata como si fuera real.** La cuenta es `demo` y el contenido es de ejemplo, pero el inventario se escribe como si fueran datos de personas: el día que existan cuentas, el hábito de no copiar contenido ajeno ya estará en el procedimiento.

**Cómo se verifica**: revisión de las capturas y de los cuatro registros contra la tabla; búsqueda del texto de un comentario sembrado y de los handles fuera de las capturas; revisión de que el registro de R2 no incluye ningún dato de la cuenta de Spotify distinto de lo que pinta la app; comprobación de que el mapa de dependencias externas y el registro llevan el mismo redirect y la misma fecha.

## NFR9 — Diagnóstico y observabilidad

Se cumple con el logger que entregó U1 y que U2–U5 ampliaron. Esta unidad **no** añade superficie: ni panel, ni telemetría, ni un servicio de errores (NFR9 aprobado). U6 **no añade un código de diagnóstico**: `AppLogCode` se cierra tal como lo dejó U5.

### NFR9.9 — El registro del recorrido no es telemetría: se anota lo que se vio, en lenguaje llano

| Situación | Se muestra a la persona | Se registra en la evidencia |
|---|---|---|
| Un paso termina en ✅ | El estado esperado | La fila con el obtenido y ✅ |
| Un paso termina en ❌ | Lo que la app muestra (mensaje y acción) | La fila, la tabla de defectos y su commit |
| Un paso queda N/A | — | La fila con el motivo (BR27.5: un N/A siempre explica por qué) |
| El error de búsqueda de Spotify (S07) | «No pudimos buscar en Spotify.» + «Reintentar» | El texto visible y la acción; **no** el `ContentErrorCode` ni la traza |
| La tarjeta de Spotify en S01 | El texto literal de su estado y «Reintentar» | El nombre del estado (`connectionError`, `notConfigured`) como identificador de contrato, y su texto |
| Una pasada condicionada | Lo que se observó en S01 | El redirect literal, el mensaje del panel, la fecha y el motivo |
| Cualquier otra fila | — | Solo lo observado: sin códigos internos, sin trazas, sin contenido de terceros |

- **El registro lo leen personas, no un colector.** No hay envío, ni almacenamiento remoto, ni agregación: los cuatro ficheros viven en el registro del intento y las capturas en el PR. Llamarlo «observabilidad» sería confundir la evidencia de una verificación con la telemetría de un producto que no la tiene.
- **Se anota el síntoma, no el dato.** Un defecto de portada se describe como «el bloque quedó vacío» y no con el título de la obra; un fallo de búsqueda se describe con el mensaje que la pantalla dio, no con la consulta de la persona.
- **Los nombres de estado del contrato sí se escriben**: `connectionError`, `notConfigured`, `connected` son el vocabulario de `SpotifyCard` y lo que hace verificable BR26.7. No son mensajes para la persona —esos van en español—, sino el identificador de lo observado.
- **Si un defecto necesitara un diagnóstico nuevo, no se inventa aquí**: sería un cambio de `AppLogCode` y una decisión de contrato (NFR3.25), no una nota del registro.

**Cómo se verifica**: revisión de la tabla de defectos y de las notas de cada fila de que no hay códigos internos, trazas ni contenido de terceros; comprobación de que `app/src/bootstrap/logger.ts` no cambia en el `diff`; comprobación de que ninguna captura ni registro contiene el token.

## Consideraciones de amenaza de esta unidad

| Amenaza | Cómo la cierra esta unidad |
|---|---|
| Un token acaba en una captura o en el registro | La app no pinta el token; la evidencia se revisa contra la lista de capturas y se buscan cadenas de token (NFR3.24) |
| Un `.env` con el valor real se cuela en el commit | Revisión del `diff` y checklist del PR (NFR3.24, `project.md` § Forbidden) |
| Un arreglo introduce un módulo nativo o una dependencia | BR27.4 y revisión de `package.json`/`package-lock.json` (NFR3.25) |
| Queda código de depuración que solo servía a la demo | Q2 = A: los estados no se fuerzan con un conmutador; revisión del diff (NFR3.25) |
| El registro copia contenido de otras personas | El registro anota lo observado; la única copia es la captura (NFR4.12) |
| La IP privada del equipo queda publicada | Se anota una vez, con fecha, porque BR26.7 lo exige; es una dirección local (NFR4.12) |
| Se declara «con sesión demostrada» sin fila que lo respalde | Un veredicto exige filas sin celdas vacías y una captura por pantalla (BR28.2) |
| Un fallo se disfraza de pendiente | BR27.2 y la tabla de defectos con su clasificación (NFR1.19) |
| El diagnóstico del producto se ensancha para cubrir la demo | `AppLogCode` no cambia; el registro no es un canal de logs (NFR9.9) |
| Se toca un contrato compartido en el último paso | Un cambio de C1–C8 es pendiente, no arreglo (BR27.4, NFR3.25) |

## Controles que adopta esta unidad

| Control | Dónde se materializa | Qué evita |
|---|---|---|
| Evidencia sin secretos | Capturas y registros revisados; `.env` fuera del commit | Filtrar el token o el valor real por el PR |
| Arreglos dentro del contrato | Tabla de defectos con su commit y BR27.4 | Abrir superficie nueva en la última unidad |
| Sin código de demostración | Q2 = A; sin conmutador ni instrumentación | Entregar una app distinta de la que se probó |
| Evidencia de la pantalla, no transcripción | El registro anota lo observado (NFR4.12) | Copiar contenido ajeno a otro fichero |
| Redirect anotado con fecha y motivo | Registro y mapa de dependencias (BR26.7) | Publicar una dependencia sin constancia |
| Veredicto respaldado por filas | BR27.5 y BR28.2 | Cerrar la unidad sin haber mirado una pantalla |
| Registro en lenguaje llano | NFR9.9 | Convertir la evidencia en un volcado técnico |
| Cierre con CI verde y suelo intacto | BR28.1, TS-47 | Bajar la puerta para terminar antes |

## Assumptions & Open Questions

- `[assumption]` Las capturas se adjuntan al PR y no se commitean al árbol: es la práctica del equipo (`team.md` § Way of Working: el PR es el registro de lo verificado) y evita que el repositorio crezca con binarios de una demostración.
- `[assumption]` El redirect literal se anota aunque contenga la IP privada del equipo: BR26.7 lo exige como constancia del prerrequisito y no es una credencial. Si el equipo publicara el repositorio, la anotación seguiría siendo una dirección de red local sin acceso.
- `[assumption]` R2 usa la cuenta de Spotify de quien verifica (Q8 = D). La app solo lee catálogo con ese token y no pide historial, perfil ni correo; lo único que la evidencia conserva es el catálogo público que la pantalla muestra.
- `[assumption]` Los nombres de estado de `SpotifyCard` se escriben en la evidencia porque son la prueba de BR26.7. No se traducen: son vocabulario del contrato, y la traducción es el texto que la pantalla muestra al lado.
- **Open question para el cierre del workflow**: si la persona decide publicar el repositorio más adelante, conviene revisar que las capturas adjuntas al PR no queden accesibles fuera del equipo; hoy viven en el PR y su alcance es el del repositorio. No es una decisión de U6 y no bloquea el cierre.

## Sources

- `requirements` — `inception/requirements-analysis/requirements.md` (NFR3, NFR4, NFR9, FR10.1, FR10.2, FR10.4, FR11.3–FR11.6, FR12.1, FR12.2, RC-02, RC-05, RC-09).
- `project.md` — `aidlc/spaces/default/memory/project.md` (§ Forbidden: client secret, backend, persistencia, `.env` y tokens; § Mandated: recorrido sin Spotify, token en almacenamiento seguro, PKCE, Expo Go, textos en español, degradar con mensaje y acción).
- `team.md` — `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Deployment, § Testing Posture, § Code Style).
- `decisions` — `inception/domain-design/decisions.md` (ADR-010, ADR-012).
- `contract-summary` — `inception/contract-design/contract-summary.md` (C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C7 1.0.0, C8 1.1.0, C9, C10).
- `functional-spec` — `construction/u6-walkthrough/functional-design/functional-spec.md` (§ Las pasadas, § Salida condicionada de R2, § El registro de la pasada, § Defectos).
- `rules` — `construction/u6-walkthrough/functional-design/rules.md` (BR25.2, BR26.3, BR26.6, BR26.7, BR27.1–BR27.4, BR28.3, BR28.4).
- `performance-requirements` — `construction/u6-walkthrough/nfr-requirements/performance-requirements.md` (NFR8.19, NFR1.19, NFR1.20).
