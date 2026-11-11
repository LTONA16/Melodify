# Reglas de negocio — U1 Esqueleto que corre

```yaml
unit: u1-app-skeleton
rules:
  - id: BR1.1
    statement: Solo demo/demo autoriza la entrada simulada.
    category: authorization
    applies_to: Login
    trigger: persona solicita entrar
    logic: IF usuario y contraseña, tras quitar espacios extremos, son exactamente demo THEN crear sesión válida.
    violation_behaviour: permanecer en Login y mostrar el error de credenciales.
    source: FR1.2
  - id: BR1.2
    statement: Una credencial inválida conserva ambos valores y enfoca Contraseña.
    category: validation
    applies_to: Login
    trigger: validación fallida
    logic: IF la combinación no es demo/demo THEN mostrar «Usuario o contraseña incorrectos» bajo Contraseña, conservar los valores y mantener el foco en Contraseña.
    violation_behaviour: no navegar ni limpiar campos.
    source: FR1.2
  - id: BR1.3
    statement: La sesión válida se recuerda y la sesión borrada no se recupera; SessionView solo expone signedIn o signedOut.
    category: policy
    applies_to: AppSession
    trigger: arranque, entrada o cierre de sesión
    logic: IF existe un recuerdo válido THEN emitir SessionView signedIn con authorId=demo y abrir Inicio; IF no existe recuerdo THEN emitir SessionView signedOut y abrir Login; IF la lectura falla o el valor es inválido THEN emitir SessionView signedOut, abrir Login y ofrecer Reintentar; IF cerrar sesión termina correctamente THEN eliminar el recuerdo y emitir SessionView signedOut.
    violation_behaviour: loading y signingIn solo viven dentro de AppSession; una lectura fallida o inválida no bloquea Login, y Reintentar vuelve a ejecutar la lectura.
    source: FR1.4, FR1.5
  - id: BR1.4
    statement: La barra autenticada contiene exactamente cinco destinos.
    category: constraint
    applies_to: AppShell
    trigger: sesión signedIn
    logic: IF la sesión está iniciada THEN mostrar Inicio, Explorar, Crear, Actividad y Perfil en ese orden.
    violation_behaviour: sin sesión no renderizar la barra.
    source: FR1.6, FR2.1, FR2.2
  - id: BR1.5
    statement: Login no puede abandonarse por navegación; atrás en una raíz autenticada cierra la aplicación.
    category: policy
    applies_to: navegación
    trigger: botón atrás o cambio de pestaña
    logic: IF no hay sesión THEN ignorar atrás y no mostrar pestañas; IF se está en una raíz autenticada THEN permitir la salida de la aplicación; IF se cambia de pestaña THEN conservar la pila y el desplazamiento de cada pestaña.
    violation_behaviour: nunca abrir una pantalla autenticada desde Login.
    source: FR1.6, FR2.2
  - id: BR1.6
    statement: U1 usa una opinión local y no llama a Spotify.
    category: constraint
    applies_to: Inicio y OpinionCard
    trigger: preparación o render de la tarjeta
    logic: IF U1 prepara contenido THEN usar la semilla Demo con valoración 4 y contadores cero; IF coverUrl es nulo o falla THEN mostrar bloque con la inicial.
    violation_behaviour: no mostrar hueco roto ni solicitar red.
    source: FR3.1, FR3.2, FR3.4
  - id: BR1.7
    statement: Los estados observables son claros, navegables y están en español.
    category: policy
    applies_to: todas las pantallas U1
    trigger: carga, vacío o error reintentable
    logic: IF se prepara la tarjeta THEN mostrar esqueletos breves; IF no hay semilla THEN mostrar «Todavía no hay opiniones» y «Reintentar»; IF ocurre un error recuperable THEN mostrar lenguaje llano y «Reintentar»; IF falla la lectura de sesión (503) THEN mostrar Login como sin sesión y ofrecer «Reintentar» de forma explícita; IF una pestaña está vacía THEN mostrar «No hay contenido todavía» sin acción.
    violation_behaviour: no dejar pantalla en blanco ni usar códigos técnicos o inglés.
    source: FR3.5, FR11.1, FR11.2, FR11.5
```

| ID | Resumen | Aplicación |
|---|---|---|
| `BR1.1`–`BR1.2` | Credencial demo y error bajo Contraseña. | Login |
| `BR1.3` | Forma C3, recuperación tolerante, reintento explícito y borrado de la sesión. | Arranque/Perfil |
| `BR1.4`–`BR1.5` | Cinco raíces, pila por pestaña y atrás según estado. | AppShell |
| `BR1.6` | Una tarjeta local determinista, sin Spotify. | Inicio |
| `BR1.7` | Estados de carga, vacío y error en español. | Todas las vistas U1 |

Las decisiones Q1-Q9 fueron confirmadas antes de generar este diseño. `SessionView`
no usa `loading` ni `signingIn`; son estados internos de `AppSession`.
