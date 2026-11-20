# Reglas de negocio — U6 `u6-walkthrough`

> **Provenance**: deriva de `inception/units-generation/unit-of-work.md` (U6), `inception/units-generation/unit-of-work-story-map.md` (US11.1, US11.2), `inception/user-stories/stories.md` (AC11.1.1–AC11.1.5, AC11.2.1–AC11.2.3), `inception/requirements-analysis/requirements.md` (FR11.1–FR11.6, FR12.1, FR12.2, RC-05, RC-09, NFR6, NFR7, A6), `inception/refined-mockups/mockups.md` (§ Matriz de estados, § Responsive), `inception/contract-design/contract-summary.md` (C1–C8), `inception/delivery-planning/bolt-plan.md` (Bolt 6), `inception/delivery-planning/external-dependency-map.md`, `aidlc/spaces/default/memory/team.md` (§ Way of Working, § Deployment, § Testing Posture) y `aidlc/spaces/default/memory/project.md` (§ Mandated).
> Fecha: 2026-11-20. Etapa: Functional Design · Unidad: `u6-walkthrough`.

El bloque `yaml` es la fuente de verdad; la tabla del final es la misma información puesta para leerla. Los grupos son: **BR25** el alcance y la preparación del recorrido, **BR26** las pasadas y sus pasos, **BR27** el registro y el tratamiento de defectos, y **BR28** el cierre de la unidad. La numeración continúa la de U5 (que cierra en BR24) para que la traza de la unidad no colisione con reglas ya publicadas.

```yaml
rules:
  - id: BR25.1
    statement: >
      U6 no añade funciones, pantallas ni componentes: verifica lo construido y solo
      corrige lo que incumpla un criterio de aceptación, un estado declarado o una
      prohibición vigente del proyecto.
    category: policy
    applies_to: "La unidad u6-walkthrough completa"
    trigger: "Aparece un fallo o una idea de mejora durante el recorrido."
    logic: >
      Cada hallazgo se clasifica primero contra BR27.2. Solo entra en U6 lo que rompe
      US11.1, US11.2, la matriz de estados de `mockups.md` o una regla de `project.md`
      (texto en inglés, error sin «Reintentar», hueco roto, tema ignorado, client
      secret). Una función que falta o una mejora de estilo se registra como pendiente
      y no se construye aquí (`unit-of-work.md` § U6, Q4 = A).
    violation: >
      Sin este límite la verificación se convierte en una unidad de mejoras sin criterio
      de cierre, y el recorrido deja de poder afirmar qué se comprobó y qué se cambió.
    source: "unit-of-work.md § U6; Q4 = A"

  - id: BR25.2
    statement: >
      El recorrido se ejecuta en Expo Go sobre un teléfono Android físico, con Metro
      levantado desde el equipo, y el registro identifica el dispositivo y la versión
      de Android usados.
    category: constraint
    applies_to: "Toda pasada del recorrido"
    trigger: "Se empieza una pasada."
    logic: >
      No vale emulador, navegador ni la vista web de Expo: FR12.1, RC-05 y NFR7 fijan
      el teléfono Android físico como el entorno de demostración, y la práctica del
      equipo dice que «desplegar» es abrir la app en el teléfono con el servidor de
      desarrollo levantado (`team.md` § Deployment). Si el teléfono no está disponible,
      la pasada no se ejecuta: se registra el bloqueo y se reanuda cuando lo esté.
    violation: >
      Un emulador no demuestra lo que la persona va a tocar, y presentarlo como
      demostración convierte el criterio de terminado en una ficción.
    source: "FR12.1, RC-05, NFR7; team.md § Deployment; external-dependency-map.md"

  - id: BR25.3
    statement: >
      Cada pasada empieza con un arranque limpio: recarga completa de la app y sesión
      de la app cerrada, de modo que Login sea la primera pantalla y el contenido vuelva
      a la siembra.
    category: constraint
    applies_to: "Preparación de cada pasada"
    trigger: "Se va a empezar una pasada nueva."
    logic: >
      El contenido vive en memoria, así que una recarga de Metro devuelve la siembra y
      hace comparables dos pasadas. La sesión de la app persiste en almacenamiento
      seguro: si la app abre en Inicio, se cierra sesión desde Perfil antes de empezar,
      y ese cierre cuenta como el paso W13. No se reinstala la app ni se borran datos
      del dispositivo.
    violation: >
      Empezar con contenido ya modificado por la pasada anterior hace que dos personas
      no vean lo mismo y que un fallo atribuido a una pantalla venga de un estado
      heredado.
    source: "AC11.1.1; US1.3; ADR-010 (contenido en memoria)"

  - id: BR25.4
    statement: >
      La pasada con sesión de Spotify exige la app de Spotify registrada, el client ID
      entregado por entorno y el redirect exacto que devuelve `makeRedirectUri()`
      aceptado en el panel; esos requisitos se comprueban antes de empezar, pero su
      ausencia no impide registrar el intento de conexión ni lo que la app dice.
    category: constraint
    applies_to: "Pasadas P3 y P4 (R2)"
    trigger: "Se intenta conectar Spotify en el teléfono."
    logic: >
      La conexión usa PKCE S256 sin client secret y vuelve a la app por el redirect
      registrado (FR10.1, RC-09, A6). Antes de empezar R2 se comprueba que
      `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` está definido y que el valor que la app resuelve
      como redirect está cargado en el panel. Si falta algo, R2 no se salta en silencio:
      ejecuta S01 igualmente, registra el estado exacto de la tarjeta (`notConfigured` o
      `connectionError`, con su texto y su acción) y a partir de ahí se aplica BR26.7.
      Un cierre condicionado sin esa observación no es válido.
    violation: >
      Probar la conexión sin el redirect registrado produce un fallo que parece de la
      app y es del panel, y condicionar la pasada sin mirar la tarjeta deja a la persona
      sin la constancia de lo que la app le dijo.
    source: "FR10.1, RC-09, A6, AC11.2.1, AC11.2.3; project.md § Mandated"

  - id: BR26.1
    statement: >
      R1 recorre, sin sesión de Spotify y en este orden, Login, Inicio, Explorar, Crear,
      Actividad y Perfil, incluidas las vistas que se abren desde ellas (detalle de
      opinión, detalle de obra y hoja de comentarios); cada pantalla carga sin cierre
      inesperado ni pantalla en blanco.
    category: constraint
    applies_to: "Pasadas P1 y P2 (R1)"
    trigger: "Se ejecuta R1."
    logic: >
      El orden es el de la barra inferior, empezando por Login porque BR25.3 deja la
      sesión cerrada. Las vistas de paso se comprueban dentro del paso que las abre: la
      tarjeta de Inicio abre el detalle de opinión (US2.3) y, desde ahí, la hoja de
      comentarios con su lista y su envío (US7.3); una sugerencia de Explorar abre el
      detalle de obra (US3.2); y la fila de Actividad abre el detalle de la opinión
      (AC8.1.4). La hoja de comentarios se abre **siempre**, aunque la opinión no tenga
      comentarios: el estado vacío también es parte de la vista. Un cierre de la app, una
      pantalla en blanco o una vista que no vuelve con «‹ Volver» o «Cerrar» es un fallo,
      no una observación.
    violation: >
      Recorrer solo las pestañas deja fuera la navegación que la persona usa de verdad y
      convierte AC11.1.1 en una comprobación de cinco pantallas de título.
    source: "AC11.1.1, US2.3, US3.2, US7.3, AC8.1.4; unit-of-work.md § U6"

  - id: BR26.2
    statement: >
      Una opinión publicada en R1 desde el catálogo de ejemplo aparece en la misma
      sesión en Inicio, en Actividad y en Perfil.
    category: constraint
    applies_to: "Pasadas P1 y P2 (R1)"
    trigger: "Se publica una opinión desde Crear."
    logic: >
      Tras publicar, se visita Inicio (la opinión está en el feed), Actividad (el evento
      «Publicaste tu opinión de «…»» está arriba del grupo de hoy) y Perfil (la opinión
      está en la lista propia y los contadores suben). No se reinicia la app entre las
      tres comprobaciones: lo que se demuestra es que la misma sesión ve el cambio
      (AC11.1.2, AC8.1.3). Si la opinión aparece en una y no en otra, el defecto es de
      la pantalla que no la ve.
    violation: >
      Comprobar la publicación en una sola pantalla deja pasar justo el fallo que la
      unidad existe para encontrar: contenido que se escribe y no se ve en todas partes.
    source: "AC11.1.2, AC8.1.3; unit-of-work-story-map.md"

  - id: BR26.3
    statement: >
      Todo texto visible durante el recorrido está en español; no aparece ningún mensaje
      en inglés, ningún código técnico ni ningún texto sin traducir.
    category: validation
    applies_to: "Todas las pantallas y vistas de paso"
    trigger: "Se lee cada pantalla durante la pasada."
    logic: >
      Se revisan títulos, etiquetas, botones, mensajes de error, textos de estado vacío,
      pistas y avisos, incluidos los que solo aparecen al provocar un estado (BR26.4).
      Un identificador técnico visible, un mensaje del sistema en inglés o un texto de
      relleno es un fallo de AC11.1.3 y de FR11.5.
    violation: >
      Un solo texto en inglés rompe la regla de producto y delata que la pantalla se
      probó solo por el camino que no lo muestra.
    source: "AC11.1.3, FR11.5; project.md § Mandated (textos en español)"

  - id: BR26.4
    statement: >
      Cuando algo falla, la pantalla lo dice en lenguaje llano y, si hay algo que
      reintentar, ofrece «Reintentar»; el recorrido puede continuar sin reiniciar la app.
    category: policy
    applies_to: "Inicio, Explorar, Crear y las vistas de paso"
    trigger: "Se provoca un fallo con el modo avión o una búsqueda sin red."
    logic: >
      En R1 el fallo provocable es la pérdida de red y se recorre **entero**: Inicio
      muestra el aviso de sin conexión con lo cargado intacto (FR11.4) y con su acción
      «Reintentar»; se toca esa acción y se comprueba que no rompe nada, que el aviso
      sigue mientras no vuelve la red y que desaparece al recuperarla. En Crear el mismo
      aviso se pinta **sin** acción, porque no hay nada que reintentar y el catálogo de
      ejemplo es local: esa diferencia es parte de lo que se observa, no un fallo. El
      camino de «Reintentar» sobre un error de contenido se comprueba en R2 con una
      búsqueda sin red («No pudimos buscar en Spotify.» + «Reintentar», FR11.2). Si R2 se
      condiciona, el reintento de R1 ya ha dejado la cláusula cubierta y el error de
      contenido se anota como cubierto por ADR-012 y FR11.6, no como demostrado. En
      ningún caso el fallo es un mensaje técnico, y en ningún caso obliga a cerrar y
      abrir la app para seguir.
    violation: >
      Un fallo silencioso o un mensaje técnico deja a la persona sin saber qué pasó ni
      qué hacer, y contradice la práctica de errores con acción del proyecto. Dejar el
      único «Reintentar» en la mitad opcional haría que, al condicionarse R2, la unidad
      cerrara sin haber visto nunca una acción de reintento.
    source: "AC11.1.4, FR11.2, FR11.4, FR11.6, ADR-012; Q2 = A"

  - id: BR26.5
    statement: >
      R1 se ejecuta dos veces, una con el tema claro del sistema y otra con el oscuro, y
      en ambas las seis pantallas mantienen el contraste y las áreas táctiles mínimas.
    category: constraint
    applies_to: "Pasadas P1 (claro) y P2 (oscuro)"
    trigger: "Se cambia el tema del sistema."
    logic: >
      Cada pantalla se revisa en los dos temas con el mismo contenido: el texto normal
      mantiene al menos 4.5:1 de contraste, el texto grande y los iconos al menos 3:1, y
      la barra inferior, los botones principales y los iconos de la tarjeta conservan al
      menos 44×44 (NFR6). El ojo sirve para detectar el problema, no para dar el número:
      cuando un par de colores ofrezca duda, se mide con `contrastRatio` del sistema de
      diseño y el valor queda escrito en la nota de la fila, de modo que el veredicto no
      dependa de la vista de quien recorre. Los bloques con inicial se ven en ambos temas
      sin perder legibilidad (AC11.1.5). Cada pasada deja captura de las seis pantallas en
      su tema.
    violation: >
      Verificar solo el tema claro deja el oscuro a merced de los tokens y permite que
      una pantalla concreta pierda contraste sin que nadie lo vea en el teléfono.
    source: "AC11.1.5, NFR6; Q6 = A"

  - id: BR26.6
    statement: >
      R2 repite el recorrido con Spotify conectado: conecta la cuenta, busca en el
      catálogo real, publica sobre una obra real, ve portadas reales en Inicio, Actividad
      y Perfil, comprueba que la conexión persiste al reabrir y desconecta al final.
    category: constraint
    applies_to: "Pasadas P3 y P4 (R2)"
    trigger: "BR25.4 se cumple y se ejecuta R2."
    logic: >
      Los pasos son: conectar desde la tarjeta de Spotify, que pasa por sus seis estados
      —`disconnected`, `connecting`, `connected`, `connectionError`, `invalidToken` y
      `notConfigured`— (FR10.1); buscar en Explorar desde dos caracteres y 400 ms;
      publicar sobre una obra real
      encontrada; comprobar la portada real en Inicio, la actividad y Perfil (AC11.2.2,
      FR10.4); cerrar y reabrir la app y seguir conectado (token en almacenamiento
      seguro); y desconectar, comprobando que las portadas vuelven a bloque y que al
      reabrir sigue desconectado (token borrado). No se usa client secret en ningún
      paso.
    violation: >
      Demostrar la conexión y no la desconexión deja sin comprobar que el token se borra,
      que es una regla afirmada del proyecto y la mitad de US10.2.
    source: "AC11.2.1, AC11.2.2, FR10.4, US10.2; project.md § Mandated"

  - id: BR26.7
    statement: >
      Si el prerrequisito de Spotify no está resuelto, S01 se ejecuta igualmente y se
      registra lo que la app muestra en la tarjeta; el resto de R2 queda condicionado con
      el redirect literal y el motivo, y R1 sigue siendo válido para cerrar la unidad.
    category: policy
    applies_to: "Pasadas P3 y P4 (R2)"
    trigger: "Falta el client ID o el panel rechaza el redirect."
    logic: >
      Antes de dar la pasada por condicionada se toca «Conectar con Spotify» una vez y se
      anota el estado exacto de la tarjeta —`notConfigured` con «La conexión con Spotify no
      está configurada en esta instalación.», o `connectionError` con «No pudimos conectar
      con Spotify.»—, su botón «Reintentar», y que Inicio y Explorar siguen usables después
      del intento. Se anota también el valor literal que la app resuelve como redirect, el
      mensaje que devuelve el panel o el navegador y la fecha. La pasada queda
      `condicionada`, no `fallida`: S01 conserva el resultado que se observó (❌, con el
      motivo en la nota) y S02–S08 quedan N/A con ese mismo motivo; AC11.2.1–AC11.2.3 se
      cierran como condicionadas y el pendiente queda con su dependencia externa (FR12.2,
      AC11.2.3). No se improvisa `expo-dev-client` ni un build propio: CT-05 y `team.md` §
      Deployment lo prohíben.
    violation: >
      Bloquear la entrega por una decisión del panel, o dar por demostrada la sesión con
      dobles, son las dos formas de mentir sobre lo que se verificó; condicionar la pasada
      sin mirar la tarjeta deja además sin constancia de lo que la app le dijo a la persona.
    source: "FR12.2, AC11.2.3, RC-09; Q5 = A; team.md § Deployment"

  - id: BR27.1
    statement: >
      Cada pasada deja un registro con una fila por paso que dice qué se hizo, qué se
      esperaba, qué se obtuvo, el resultado y una nota, más las capturas que lo
      respaldan.
    category: policy
    applies_to: "Los cuatro registros `walkthrough-p1.md` … `walkthrough-p4.md` de la unidad"
    trigger: "Se empieza y se cierra cada pasada."
    logic: >
      Cada pasada tiene su propio fichero en `<record>/construction/u6-walkthrough/code-generation/`,
      nombrado por la pasada (`walkthrough-p1.md` para R1 en claro, `walkthrough-p3.md` para
      R2 en claro, etc.): un fichero único con cuatro tablas dentro se vuelve ilegible y no
      permite cerrar una pasada sin tocar las demás. La cabecera identifica fecha, dispositivo,
      versión de Android, versión de Expo Go, commit sobre el que se recorre, tema, estado de
      Spotify y si el client ID está configurado. Cada fila lleva el identificador del paso
      (W01…, S01…), la pantalla o vista, la acción, el resultado esperado, el obtenido, ✅/❌/N/A
      y una nota. Las capturas se adjuntan al PR de la unidad y se referencian por nombre de
      archivo (`p1-inicio-claro.png`, etc.).
    violation: >
      Sin fila y sin captura, el cierre se apoya en la memoria de quien recorrió y el PR
      deja de ser el registro de lo verificado que la práctica del equipo exige.
    source: "team.md § Way of Working (PR como registro); Q1 = A"

  - id: BR27.2
    statement: >
      Todo ❌ se clasifica como defecto en alcance o como pendiente; solo el defecto en
      alcance se corrige dentro de U6.
    category: policy
    applies_to: "Los defectos encontrados en cualquier pasada"
    trigger: "Un paso termina en ❌."
    logic: >
      Es defecto en alcance si rompe una AC de US11.1/US11.2, una regla BR26.x de esta
      unidad (incluidas la navegación que no vuelve y la vista de paso que no abre), un
      estado de la matriz de `mockups.md` o una prohibición de `project.md`. Es pendiente si
      pide una función nueva, un rediseño o una mejora cosmética. El pendiente se anota con
      qué falta y de qué depende; el defecto entra en el bucle de BR27.3.
    violation: >
      Mezclar las dos categorías hace que la unidad no sepa cuándo termina y que un
      arreglo cosmético retrase el criterio de terminado.
    source: "Q4 = A; unit-of-work.md § U6"

  - id: BR27.3
    statement: >
      Un defecto en alcance se corrige en el momento, se repite el tramo afectado y se
      anota con el commit del arreglo; al final se hace una pasada completa con la suite
      en verde.
    category: policy
    applies_to: "Bucle de corrección durante el recorrido"
    trigger: "BR27.2 clasifica un hallazgo como defecto en alcance."
    logic: >
      Se corrige con el cambio mínimo que devuelve el paso a lo esperado, se recarga y se
      repite el tramo desde el paso anterior al fallo. La fila del defecto guarda qué se
      cambió y el commit. Al terminar, una pasada completa (BR28.1) confirma que el
      arreglo no rompió otro paso y que `npm run typecheck`, `npm run lint` y `npm test`
      siguen en verde.
    violation: >
      Corregir sin repetir deja el arreglo sin probar en el teléfono; repetir solo el
      tramo sin pasada final deja pasar la regresión que el cambio introdujo en otra
      pantalla.
    source: "Q3 = A; team.md § Testing Posture, § Way of Working"

  - id: BR27.4
    statement: >
      Una corrección no cambia los contratos C1–C8, no añade pantallas, tokens ni
      componentes, y no introduce módulos nativos; si el arreglo lo exige, se convierte
      en una decisión pendiente.
    category: constraint
    applies_to: "Cualquier arreglo hecho en U6"
    trigger: "El arreglo mínimo exige tocar una interfaz compartida."
    logic: >
      Se ajusta dentro de las props y estados que el contrato ya declara; un cambio de
      contrato afecta a más de una unidad y necesita su propia decisión, no un arreglo de
      verificación. Tampoco se añade nada que no corra en Expo Go (CT-05) ni se tocan los
      umbrales de cobertura (`team.md` § Testing Posture).
    violation: >
      Un «arreglo» que cambia un contrato compartido sin revisión rompe la promesa de la
      unidad y convierte la última entrega en la más arriesgada.
    source: "contract-summary.md C1–C8; CT-05; team.md § Testing Posture"

  - id: BR27.5
    statement: >
      Ninguna pasada se cierra mientras tenga pasos sin resultado; un paso solo puede
      quedar N/A con su motivo escrito.
    category: validation
    applies_to: "El registro de cada pasada"
    trigger: "Se cierra una pasada."
    logic: >
      Antes de poner el veredicto de la pasada se recorre la tabla: no hay celdas vacías,
      no hay ❌ sin clasificar y cada N/A explica por qué (por ejemplo, un estado que solo
      existe con sesión). Un paso que no se pudo hacer se marca ❌ o N/A según la causa,
      nunca se omite.
    violation: >
      Una tabla a medias parece completa y permite cerrar la unidad sin haber mirado una
      pantalla.
    source: "AC11.1.1; Q1 = A"

  - id: BR28.1
    statement: >
      U6 se cierra con R1 completa en los dos temas, el registro cerrado, CI en verde y
      el suelo de cobertura intacto.
    category: constraint
    applies_to: "Cierre de la unidad"
    trigger: "Se termina la última pasada."
    logic: >
      Se exige: P1 y P2 completas (BR26.5), las doce capturas de R1 —las seis pantallas en
      claro y las seis en oscuro— adjuntas al PR, `npm run typecheck`, `npm run lint` y
      `npm test` en verde, y el umbral de 80 % de líneas sobre `app/src/**` sin bajar ni
      excluir nada (`team.md` § Testing Posture). Un rojo detiene el cierre: no se mergea «y
      luego se arregla».
    violation: >
      Cerrar con la suite en rojo o con una pasada a medias convierte el criterio de
      terminado del MVP en una declaración sin respaldo.
    source: "FR12.1, NFR1; team.md § Testing Posture, § Way of Working"

  - id: BR28.2
    statement: >
      R2 se cierra completa o condicionada; si es condicionada, el registro guarda el
      redirect literal y el motivo del rechazo, y la unidad dice qué mitad no se demostró.
    category: policy
    applies_to: "Cierre de R2"
    trigger: "Termina P3 o P4."
    logic: >
      Completa significa S01–S08 en verde en el tema correspondiente, con sus doce capturas
      de R2 (las seis pantallas en claro y en oscuro, ya con portadas reales). Condicionada
      significa que BR26.7 se aplicó: S01 conserva el resultado observado en la tarjeta, S02–S08
      quedan N/A con su motivo y el registro y el mapa de dependencias externas llevan el valor
      exacto del redirect, el mensaje del panel y la fecha. En ningún caso se declara «con
      sesión demostrada» sin una fila que lo respalde, y una pasada condicionada nunca se
      cuenta como completa.
    violation: >
      Un cierre que nombra la sesión sin fila deja la deuda invisible y hace creer que la
      integración real se probó.
    source: "FR12.2, AC11.2.3; Q5 = A"

  - id: BR28.3
    statement: >
      Los pendientes se registran con lo que falta y de qué dependen, y no se presentan
      como hechos ni como parte de lo entregado.
    category: policy
    applies_to: "Cierre de la unidad y PR"
    trigger: "Un hallazgo se clasifica como pendiente o una pasada queda condicionada."
    logic: >
      Cada pendiente dice qué falta, por qué no entró y qué lo desbloquea. El resumen de
      la unidad y el PR los listan aparte de lo demostrado. Un pendiente que se pueda
      resolver en la misma pasada no es pendiente: es un defecto (BR27.2).
    violation: >
      Un pendiente disfrazado de entrega es deuda invisible, y la persona que lea el PR
      creerá que la app hace algo que no hace.
    source: "project.md § Mandated (degradar con mensaje, nunca fallar en silencio); unit-of-work.md § U6"

  - id: BR28.4
    statement: >
      La unidad se entrega por Pull Request a `develop` con Conventional Commits, la
      plantilla del repositorio, CI en verde y la evidencia del recorrido adjunta.
    category: policy
    applies_to: "Entrega de U6"
    trigger: "BR28.1 se cumple."
    logic: >
      La rama sale de `develop`, el título y los commits siguen Conventional Commits
      (validado por commitlint en CI), y el PR rellena la plantilla con las plataformas
      probadas, las capturas y el checklist. `main` no recibe el trabajo del día: solo
      entregas por squash desde `develop` (`team.md` § Way of Working). No hay build, ni
      firma, ni tienda (`team.md` § Deployment).
    violation: >
      Saltarse el PR o el CI convierte la verificación en algo que nadie puede revisar y
      rompe la regla de integración del equipo.
    source: "team.md § Way of Working, § Deployment; .github/pull_request_template.md"
```

## Resumen de reglas

| Regla | Qué fija | Fuente |
|---|---|---|
| BR25.1 | U6 verifica y corrige; no añade funciones | `unit-of-work.md` U6; Q4 |
| BR25.2 | Expo Go en teléfono Android físico, con Metro | FR12.1, RC-05, NFR7 |
| BR25.3 | Arranque limpio por pasada: Login primero, siembra fresca | AC11.1.1, US1.3 |
| BR25.4 | Prerrequisito de Spotify para R2, con S01 ejecutada aunque falle | RC-09, A6, FR10.1 |
| BR26.1 | R1 recorre seis pantallas y sus vistas de paso —incluida la hoja de comentarios— sin cierres ni blancos | AC11.1.1, US7.3 |
| BR26.2 | Lo publicado se ve en Inicio, Actividad y Perfil en la misma sesión | AC11.1.2 |
| BR26.3 | Todo texto visible en español | AC11.1.3, FR11.5 |
| BR26.4 | Fallo en lenguaje llano, «Reintentar» probado en R1 y el recorrido sigue | AC11.1.4, FR11.2 |
| BR26.5 | R1 en claro y en oscuro, con contraste y 44×44 | AC11.1.5, NFR6 |
| BR26.6 | R2: conectar, buscar, publicar, portadas reales, persistencia y desconexión (seis estados) | AC11.2.1–2, FR10.4, US10.2 |
| BR26.7 | Sin prerrequisito, S01 se observa, R2 se condiciona y R1 cierra la unidad | FR12.2, AC11.2.3 |
| BR27.1 | Un registro por pasada (`walkthrough-pN.md`) más capturas en el PR | Práctica del equipo; Q1 |
| BR27.2 | Defecto en alcance —incluidas las reglas BR26.x— frente a pendiente | Q4 |
| BR27.3 | Corregir, repetir el tramo y pasada final | Q3 |
| BR27.4 | El arreglo no cambia contratos, pantallas, tokens ni módulos nativos | C1–C8, CT-05 |
| BR27.5 | Ninguna pasada cierra con pasos sin resultado | Q1 |
| BR28.1 | Cierre con R1 en dos temas (doce capturas), CI verde y suelo intacto | FR12.1, práctica del equipo |
| BR28.2 | R2 completa o condicionada con constancia exacta | FR12.2, AC11.2.3 |
| BR28.3 | Pendientes explícitos, nunca presentados como entrega | `project.md` |
| BR28.4 | PR a `develop` con Conventional Commits y evidencia | Práctica del equipo |
