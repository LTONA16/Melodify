# Reglas de negocio — U1 `u1-app-skeleton`

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (FR1, FR2, FR3.2, FR3.4, FR11.5), `inception/user-stories/stories.md` (US1.1–US1.3), `inception/contract-design/contract-summary.md` (C2, C3), `inception/domain-design/components.md` (AppSession, AppShell) y las respuestas de `functional-design-questions.md` (Q2–Q5).
> Fecha: 2026-11-11. Etapa: Functional Design · Unidad: `u1-app-skeleton`.

El bloque `yaml` es la fuente de verdad; la tabla de después es la misma información puesta para leerla. Los grupos son: **BR1** sesión de la app, **BR2** navegación y **BR3** contenido mínimo de Inicio. La numeración es por unidad: cada unidad numera sus propios grupos en su propio `rules.md`.

```yaml
rules:
  - id: BR1.1
    statement: >
      Solo las credenciales de demostración demo/demo permiten entrar en la app.
    category: validation
    applies_to: "Pantalla Login y operación signIn de AppSession (C3)"
    trigger: "La persona toca «Entrar» con los dos campos no vacíos."
    logic: >
      IF el usuario y la contraseña, recortados de espacios al principio y al final,
      son exactamente «demo» y «demo»
      THEN guardar la sesión recordada y navegar a Inicio.
      ELSE mostrar «Usuario o contraseña incorrectos» bajo el campo de Contraseña,
      conservar los dos valores escritos y permanecer en Login.
    violation: >
      No se navega, no se limpia ningún campo, no se cuentan los intentos y no se
      bloquea la cuenta.
    source: FR1.2

  - id: BR1.2
    statement: >
      Entrar guarda el recuerdo de la sesión antes de abandonar Login.
    category: policy
    applies_to: "AppSession y el arranque de la app"
    trigger: "Credenciales correctas en Login."
    logic: >
      IF la sesión se guarda correctamente en el almacenamiento seguro
      THEN navegar a Inicio con Inicio como pestaña activa.
      ELSE no entrar: mostrar «No pudimos guardar tu sesión. Inténtalo de nuevo.»
      en línea bajo el botón, poner el botón en «Reintentar» —que repite la entrada con
      lo escrito— y dejar a la persona en Login con los dos valores que había escrito.
    violation: >
      Una app que entra sin haber guardado la sesión se considera un fallo: el
      arranque siguiente pediría credenciales y la promesa de FR1.4 quedaría rota.
      Un fallo de guardado contado como credenciales incorrectas manda a la persona a
      corregir unos campos que estaban bien.
    source: FR1.3

  - id: BR1.3
    statement: >
      El arranque decide Login o Inicio leyendo la sesión recordada, y trata
      cualquier lectura fallida o inválida como «sin sesión», sin aviso ni reintento.
    category: policy
    applies_to: "Arranque de la app y AppSession"
    trigger: "La app se abre."
    logic: >
      IF el almacenamiento devuelve una sesión válida con autor demo y recuerdo
      verdadero THEN abrir Inicio.
      ELSE abrir Login, intentar borrar el valor inválido y no bloquear la app.
      El fallo de lectura (`503` de getSession) sigue el mismo camino: Login, sin
      mensaje y sin acción que reintentar, porque entrar de nuevo es la salida.
    violation: >
      Nunca se muestra un formulario a medio pintar ni una pantalla de error de
      arranque: como mucho, Login. Un aviso con «Reintentar» sobre un almacenamiento
      local promete una recuperación que no existe.
    source: FR1.4

  - id: BR1.4
    statement: >
      Cerrar sesión borra el recuerdo y devuelve a Login, sin tocar Spotify ni el
      contenido.
    category: policy
    applies_to: "AppSession y la pantalla Perfil"
    trigger: "La persona elige «Cerrar sesión»."
    logic: >
      IF se borra el recuerdo de sesión THEN volver a Login con Inicio como
      pestaña activa para la próxima entrada.
      Y en ningún caso borrar el token de Spotify, su estado de conexión ni el
      contenido de ejemplo.
    violation: >
      Dejar el recuerdo escrito hace que el arranque siguiente entre sin permiso;
      borrar el token de Spotify desconecta una sesión que no se pidió cerrar.
    source: FR1.5

  - id: BR1.5
    statement: >
      Login no muestra barra inferior y no se puede abandonar sin entrar.
    category: constraint
    applies_to: "Pantalla Login y AppShell"
    trigger: "La persona está en Login y usa la barra, el gesto o el botón atrás."
    logic: >
      IF la persona está en Login THEN no pintar barra inferior y no responder a
      atrás ni a ningún gesto de navegación que la saque de la pantalla.
    violation: >
      Cualquier salida de Login sin credenciales deja la app en un estado que no
      existe en el diseño.
    source: FR1.6

  - id: BR1.6
    statement: >
      Login muestra exactamente los elementos de acceso: la marca «Melodify», el
      lema «Opiniones sobre música», los campos «Usuario» —con el marcador «demo»— y
      «Contraseña», el botón «Entrar» y la pista «Demo: usuario y contraseña: demo».
    category: constraint
    applies_to: "Pantalla Login"
    trigger: "Se pinta Login."
    logic: >
      IF se pinta Login THEN mostrar esos seis elementos, con la Contraseña oculta y
      su control de ojo de 44×44, sin barra inferior y sin ningún otro contenido.
    violation: >
      Un elemento ausente deja a la persona sin saber cómo entrar; uno añadido
      promete algo que esta versión no ofrece.
    source: FR1.1

  - id: BR2.1
    statement: >
      La app tiene cinco pestañas hermanas, con Inicio como pantalla de llegada.
    category: constraint
    applies_to: "AppShell y BottomTabBar"
    trigger: "La persona está dentro de la app, con sesión iniciada."
    logic: >
      IF hay sesión de la app THEN mostrar siempre los cinco destinos en el orden
      Inicio, Explorar, Crear, Actividad y Perfil, con Inicio activo al entrar.
    violation: >
      Un orden distinto, un sexto destino o una pestaña oculta rompe los enlaces
      que las demás unidades dan por hechos.
    source: "FR2.1, FR2.2"

  - id: BR2.2
    statement: >
      Cada pestaña conserva su propia pila y su posición de desplazamiento.
    category: policy
    applies_to: "AppShell"
    trigger: "La persona cambia de pestaña y vuelve a la anterior."
    logic: >
      IF la persona vuelve a una pestaña que ya visitó THEN mostrar la misma
      pantalla interna y el mismo desplazamiento que dejó.
      ELSE mostrar la raíz de esa pestaña.
    violation: >
      Reiniciar la pestaña en su raíz hace perder el sitio y contradice el
      comportamiento de «Volver» de los mockups.
    source: "Q2 = A"

  - id: BR2.3
    statement: >
      El detalle se apila dentro de la pestaña de origen y nunca es un sexto
      destino de la barra.
    category: constraint
    applies_to: "AppShell, DetailScreen y la barra inferior"
    trigger: "Se abre el detalle de una obra o de una opinión."
    logic: >
      IF se abre un detalle THEN apilarlo sobre la pestaña activa, con «Volver»,
      manteniendo la barra inferior y sin cambiar de destino.
    violation: >
      Un detalle como destino propio rompe FR2.3 y el modelo de pila de BR2.2.
    source: FR2.3

  - id: BR2.4
    statement: >
      El botón atrás del sistema cierra la app en una raíz, desapila en una
      pantalla interna y no hace nada en Login.
    category: policy
    applies_to: "AppShell y la pantalla Login"
    trigger: "La persona usa el gesto o el botón atrás de Android."
    logic: >
      IF está en Login THEN no hacer nada.
      ELSE IF hay una pantalla apilada THEN desapilarla y volver a la pestaña de
      origen en su desplazamiento anterior.
      ELSE cerrar la app y dejarla en segundo plano.
    violation: >
      Cerrar la app desde Login incumple FR1.6; no cerrarla nunca desde una raíz
      contradice el comportamiento esperado de Android.
    source: "FR1.6; Q3 = B"

  - id: BR2.5
    statement: >
      La app sigue el tema claro u oscuro del sistema, sin selector manual.
    category: policy
    applies_to: "DesignSystem y AppShell"
    trigger: "La app se abre o el sistema cambia de tema."
    logic: >
      IF el sistema informa tema oscuro THEN usar los tokens oscuros.
      ELSE IF informa tema claro o no informa nada THEN usar los tokens claros.
    violation: >
      Un tema fijo o un selector manual no existe en el alcance y rompería FR2.4.
    source: FR2.4

  - id: BR3.1
    statement: >
      Inicio pinta una sola opinión sembrada, sin estados de carga ni de error en
      U1; si la semilla estuviera vacía, muestra el estado vacío sin acción.
    category: policy
    applies_to: "Pantalla Inicio y la semilla mínima de U1"
    trigger: "La persona llega a Inicio."
    logic: >
      IF hay una opinión sembrada THEN pintar la tarjeta en variante feed bajo el
      encabezado «Para ti».
      ELSE mostrar «Aún no hay opiniones. Sé el primero.» sin botón de acción.
    violation: >
      Un esqueleto o un error sin causa real promete estados que esta unidad no
      puede producir; los tres estados de FR11.1 pertenecen a U2.
    source: "FR3.1; Q4 = A"

  - id: BR3.2
    statement: >
      La tarjeta sembrada es de lectura: sus acciones sociales no responden y no
      navega al detalle.
    category: constraint
    applies_to: "OpinionCard en la pantalla Inicio de U1"
    trigger: "La persona toca la tarjeta, el corazón o el bocadillo."
    logic: >
      IF la tarjeta es la sembrada de U1 THEN no navegar, no cambiar contadores,
      no mostrar «Seguir autor» y no mostrar la marca de opinión propia.
    violation: >
      Una acción que cambia datos sin ContentStore deja estado que U2 no puede
      reconciliar.
    source: "FR3.1; Q5 = A"

  - id: BR3.3
    statement: >
      La semilla referencia una obra real por su identificador de Spotify y no
      depende de la red.
    category: constraint
    applies_to: "Semilla mínima de Inicio"
    trigger: "Se pinta la tarjeta sembrada."
    logic: >
      IF se pinta la tarjeta THEN usar el identificador de una obra del catálogo
      de ejemplo y su título y artista guardados en local, y resolver la portada
      como bloque con la inicial, sin petición de red ni credencial.
    violation: >
      Un identificador inventado o una petición de red en el esqueleto rompe
      FR3.2 y RC-01.
    source: FR3.2

  - id: BR3.4
    statement: >
      Todo texto visible está en español y en lenguaje llano.
    category: constraint
    applies_to: "Todas las pantallas y componentes de U1"
    trigger: "Se pinta cualquier texto de interfaz."
    logic: >
      IF se escribe un texto visible THEN escribirlo en español, sin códigos
      técnicos ni mensajes en inglés.
    violation: >
      Un texto en otro idioma o un código técnico incumple FR11.5 y NFR2.
    source: FR11.5
```

## Resumen de reglas

| Regla | Categoría | Enunciado corto | Origen |
|---|---|---|---|
| **BR1.1** | validation | Solo `demo`/`demo` entra; el resto ve el error en línea y conserva lo escrito. | FR1.2 |
| **BR1.2** | policy | Entrar exige guardar la sesión; si el guardado falla, no se entra y se ofrece «Reintentar». | FR1.3 |
| **BR1.3** | policy | El arranque lee la sesión y trata cualquier fallo o valor inválido como «sin sesión», sin aviso ni reintento. | FR1.4 |
| **BR1.4** | policy | Cerrar sesión borra el recuerdo, vuelve a Login y no toca Spotify ni el contenido. | FR1.5 |
| **BR1.5** | constraint | Login no tiene barra y no se abandona sin entrar. | FR1.6 |
| **BR1.6** | constraint | Login muestra marca, lema, los dos campos (Usuario con marcador «demo»), «Entrar» y la pista demo. | FR1.1 |
| **BR2.1** | constraint | Cinco pestañas hermanas, con Inicio como llegada. | FR2.1, FR2.2 |
| **BR2.2** | policy | Cada pestaña conserva su pila y su scroll. | Q2 = A |
| **BR2.3** | constraint | El detalle se apila dentro de la pestaña, nunca como sexto destino. | FR2.3 |
| **BR2.4** | policy | Atrás: cierra en raíz, desapila dentro, no hace nada en Login. | FR1.6; Q3 = B |
| **BR2.5** | policy | El tema sigue al sistema, sin selector manual. | FR2.4 |
| **BR3.1** | policy | Inicio pinta la semilla; sin semilla, vacío sin acción; sin carga ni error en U1. | FR3.1; Q4 = A |
| **BR3.2** | constraint | La tarjeta sembrada no responde a toques ni navega. | FR3.1; Q5 = A |
| **BR3.3** | constraint | La semilla usa una obra real por identificador, sin red. | FR3.2 |
| **BR3.4** | constraint | Todo texto visible va en español y en lenguaje llano. | FR11.5 |

## Assumptions & Open Questions

- `[assumption]` Las reglas de U1 no introducen estados de negocio nuevos: describen la puerta de entrada, la navegación de la cáscara y el contenido mínimo que la semilla pinta. `BR1.6` fija el contenido de Login porque AC1.1.1 enumera esos elementos y ninguna otra regla los enunciaba.
- `[assumption]` `BR2.2`, `BR2.3`, `BR2.5`, `BR3.2`, `BR3.3` y `BR3.4` no tienen un criterio de aceptación propio en US1.x porque son capacidades o políticas que las unidades posteriores ejercitan; se trazan en `traceability.json` como `N/A` con su razón. `BR2.4` **sí** sostiene AC1.1.4 (no hay forma de salir de Login sin entrar), y por eso no aparece en esa lista.
- **Open question**: ninguna bloquea la construcción. El límite del texto de la opinión (OQ1) pertenece a U3 y el redirect de PKCE se confirma en U4.
