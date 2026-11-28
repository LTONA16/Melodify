# Recorridos del Sistema — Backend de Melodify

## Fuentes

- `intent-statement.md`: cuentas reales, contenido compartido y métrica de éxito desde un segundo dispositivo.
- `scope-document.md`: capacidades SC-01 a SC-10, frontera del MVP y verificación con dos dispositivos en la misma red local.
- `intent-backlog.md`: proto-unidades IB-01 a IB-11 y orden por dependencias.

## Recorrido 1: contenido compartido entre dos dispositivos

- **Persona**: una persona con cuenta real en la app.
- **Disparo**: quiere publicar una opinión y comprobar que otra persona, o ella misma desde otro dispositivo, puede verla.
- **Resultado correcto**: la opinión aparece en el feed del segundo dispositivo y la actividad de la cuenta queda actualizada.

Pasos:

1. La persona entra con su cuenta en el primer dispositivo y ve su perfil.
2. Publica una opinión sobre contenido musical; la app envía la acción al servicio local.
3. El servicio conserva la opinión asociada a esa cuenta.
4. En el segundo dispositivo, la misma cuenta u otra distinta abre el feed y ve la opinión.
5. La persona del segundo dispositivo da me gusta, comenta o sigue al autor.
6. La actividad reciente muestra publicaciones, interacciones y seguimientos de ese recorrido.

```
Perfil -----> Publicar opinion -----> Servicio local
     |                                      |
     v                                      v
Feed en segundo dispositivo <--------------+
     |
     v
Me gusta y comentarios -----> Actividad
     |
     v
Seguir autor -----> Actividad
```

Lectura: el recorrido cruza dos dispositivos reales y termina en la actividad; ningún paso usa despliegue, túnel ni contenido simulado migrado.

## Recorrido 2: sesión no válida

- **Persona**: una persona que abre la app con una sesión vencida o inexistente.
- **Disparo**: intenta publicar, comentar o abrir su actividad.
- **Resultado correcto**: vuelve al acceso y puede continuar después de entrar con su cuenta.

Pasos:

1. La app comprueba que la sesión sigue siendo válida.
2. Si no lo es, muestra un aviso en lenguaje llano.
3. La persona vuelve al acceso; no se guarda una publicación a medias.
4. Tras entrar de nuevo, puede retomar la acción.

```
Accion con sesion vencida -----> Aviso claro -----> Acceso real
```

Lectura: el aviso explica qué pasó y qué hacer; no muestra un código técnico.

## Recorrido 3: servicio local no disponible

- **Persona**: una persona con sesión válida en cualquiera de los dispositivos.
- **Disparo**: la app no alcanza el servicio en la red local.
- **Resultado correcto**: la persona entiende el fallo, puede reintentar y ve contenido de respaldo de solo lectura si existe.

Pasos:

1. La app intenta hablar con el servicio local.
2. Si no responde, muestra un aviso comprensible con una acción de reintento.
3. El respaldo local puede mostrar contenido ya conocido, sin publicar ni cambiar nada allí.
4. La persona reintenta cuando el servicio vuelve a estar disponible.

```
Servicio local no disponible -----> Aviso claro -----> Reintentar
Respaldo local -----> Solo lectura
```

Lectura: la degradación mantiene la app recorrible sin convertir el respaldo en una segunda fuente de escritura.

## Recorrido 4: feed vacío

- **Persona**: una cuenta nueva o una cuenta sin opiniones compartidas todavía.
- **Disparo**: abre el feed.
- **Resultado correcto**: entiende que aún no hay contenido y sabe publicar la primera opinión.

Pasos:

1. El feed muestra un estado vacío con explicación.
2. La acción principal invita a publicar la primera opinión.
3. Tras publicar, el recorrido 1 toma el relevo y la opinión aparece desde el segundo dispositivo.

```
Feed vacio -----> Explicacion -----> Publicar primera opinion
```

Lectura: el estado vacío no es una lista en blanco; da una acción concreta en español.

## Recorrido 5: privacidad bajo LFPDPPP

- **Persona**: una persona que crea una cuenta, decide borrarla o genera opiniones e interacciones.
- **Disparo**: alta de cuenta, solicitud de borrado o paso del tiempo sobre el contenido.
- **Resultado correcto**: consentimiento, borrado y retención quedan visibles como parte del uso real.

Pasos:

1. Al crear la cuenta, la persona recoge el consentimiento para el tratamiento de sus datos.
2. Si pide borrado, el sistema pide confirmación y elimina los datos de la cuenta.
3. Las opiniones e interacciones quedan sujetas a una regla de retención.
4. Los plazos concretos no se fijan aquí; permanecen abiertos en el alcance.

```
Alta de cuenta -----> Consentimiento
Borrado de cuenta -----> Confirmacion -----> Datos eliminados
Opiniones e interacciones -----> Regla de retencion
```

Lectura: la privacidad no es una nota al margen: acompaña a la identidad y al contenido desde el primer usuario.

## Verificación del recorrido

Dos dispositivos reales en la misma red local ejecutan el recorrido 1 sin sesión de Spotify y con ella. En ambos se publica, comenta, da me gusta y sigue a otra persona; el contenido aparece en el feed y en la actividad del segundo dispositivo, y sigue ahí tras reinstalar la app.

## Accesibilidad de los recorridos

Todos los pasos se leen en texto, con el mismo orden en los diagramas y en las listas. No se depende de color ni de una sola imagen para entender el flujo; los avisos usan lenguaje llano y una acción de recuperación.

## Assumptions & Open Questions

- [assumption] Los plazos concretos de retención siguen abiertos; este recorrido no los inventa.
- [assumption] La verificación usa dos dispositivos reales en la misma red local; la dirección de acceso del portátil se resuelve al preparar la prueba.
- [assumption] El respaldo local de solo lectura existe, pero no sustituye al servicio para publicar ni interactuar.
