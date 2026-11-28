# Bocetos del Sistema — Backend de Melodify

## Fuentes

- `intent-statement.md`: cuentas reales, contenido compartido y métrica de éxito desde un segundo dispositivo.
- `scope-document.md`: capacidades SC-01 a SC-10, frontera del MVP y verificación con dos dispositivos en la misma red local.
- `intent-backlog.md`: proto-unidades IB-01 a IB-11 y orden por dependencias.

## Decisiones que fijan estos bocetos

- El contexto incluye la app en dos dispositivos, el servicio local y su base de datos; Spotify y el respaldo local de solo lectura quedan como contexto externo.
- El servicio no gestiona tokens de Spotify ni client secret: la conexión con Spotify sigue en la app con PKCE.
- Junto al recorrido correcto se dibujan tres caminos de fallo: sin sesión válida, sin conexión al servicio local y feed vacío.
- La privacidad bajo LFPDPPP aparece como recorrido propio: consentimiento al alta, borrado de la cuenta y regla de retención sobre opiniones e interacciones.

## Diagrama de contexto del sistema

```
+-----------------------+        +-----------------------+
| Dispositivo uno       |        | Dispositivo dos       |
| App con sesion real   |        | App con sesion real   |
+-----------+-----------+        +-----------+-----------+
            |                                |
            |                                |
            v                                v
        +---------------------------------------+
        | Servicio local en el portatil         |
        | Cuentas opiniones interacciones feed   |
        | Actividad y privacidad                |
        +-------------------+-------------------+
                            |
                            v
                +-----------------------+
                | Base de datos local   |
                +-----------------------+

+---------------------------+   +---------------------------+
| Spotify en la app         |   | Respaldo local de lectura |
| PKCE sin token service    |   | Solo lectura sin publicar |
+-------------+-------------+   +-------------+-------------+
```

Lectura: dos dispositivos con sesión real alcanzan el mismo servicio local; el servicio guarda cuentas, opiniones, interacciones, feed, actividad y privacidad en una base de datos local. Spotify sigue viviendo en la app y el respaldo local solo se consulta; ninguno de los dos envía tokens al servicio ni publica contenido por él.

## Boceto del recorrido principal

```
Acceso real -----> Perfil -----> Publicar opinion
      |                            |
      v                            v
Feed en dispositivo dos <---------+
      |
      v
Me gusta y comentarios -----> Actividad
      |
      v
Seguir a otra persona -----> Actividad
```

Lectura: una persona entra con su cuenta, publica una opinión desde el primer dispositivo y la ve en el feed del segundo dispositivo. Desde ahí puede dar me gusta, comentar y seguir a otra persona; cada acción se refleja en la actividad de la cuenta.

## Boceto de caminos de fallo

```
Sin sesion -----> Acceso real
Sin conexion -----> Aviso claro -----> Reintentar
Feed vacio -----> Publicar primera opinion
```

Lectura: sin sesión se vuelve al acceso; sin conexión al servicio se muestra un aviso en lenguaje llano con una acción de reintento; con el feed vacío se invita a publicar la primera opinión. No aparecen códigos técnicos ni mensajes en inglés.

## Boceto de privacidad

```
Alta de cuenta -----> Consentimiento
Borrado de cuenta -----> Confirmacion -----> Datos eliminados
Opiniones e interacciones -----> Regla de retencion
```

Lectura: el consentimiento se recoge al crear la cuenta, el borrado pide confirmación y la retención se aplica a opiniones e interacciones. Los plazos concretos siguen abiertos en el alcance; este boceto no inventa una ventana de retención.

## Coherencia con el alcance

Las tres decisiones refuerzan la métrica acordada: contenido compartido entre dos dispositivos reales en la misma red, sin despliegue ni túnel. No aparecen capacidades fuera de alcance como administración, moderación, notificaciones, audio ni migración del contenido simulado de los teléfonos.

## Accesibilidad de los bocetos

Cada diagrama se lee en texto y usa caracteres ASCII simples; no depende de color, imagen ni posición espacial para entender el recorrido. Las palabras dentro de los bloques van sin tildes para que el dibujo se mantenga alineado; la explicación junto a cada bloque recupera el español completo.

## Assumptions & Open Questions

- [assumption] Los plazos concretos de consentimiento, borrado y retención bajo LFPDPPP siguen abiertos; el boceto solo muestra que existen.
- [assumption] El segundo dispositivo alcanza el servicio por la misma red local; la dirección concreta se resuelve al preparar la verificación.
- [assumption] El respaldo local de solo lectura se mantiene, pero no se convierte en destino de las publicaciones del servicio.
