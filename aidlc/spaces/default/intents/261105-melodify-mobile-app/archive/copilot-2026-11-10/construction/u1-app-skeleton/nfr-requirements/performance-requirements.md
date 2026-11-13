# Requisitos de rendimiento — U1

## Alcance y supuestos

U1 es una aplicación local ejecutada en Expo Go sobre un teléfono Android
físico. No tiene backend, no consulta Spotify y no procesa contenido remoto en
esta unidad.
Por tanto, estos objetivos son límites de la experiencia del esqueleto, no
SLA de una infraestructura.

## Requisitos

| ID | Requisito medible | Verificación |
|---|---|---|
| NFR2.1 | Cada pestaña autenticada debe ser alcanzable con un toque desde la barra inferior; Login no muestra la barra y el recorrido no requiere una explicación previa. | Recorrido manual de las cinco pestañas en Android físico. |
| NFR2.2 | Desde cada pantalla de U1, la acción principal definida por Functional Design debe completarse en un máximo de dos toques, sin contar la escritura de credenciales; los errores recuperables muestran «Reintentar». | Checklist del recorrido y pruebas de estados de error. |
| NFR8.4 | Inicio debe renderizar la semilla de una sola tarjeta y sus estados de esqueleto, vacío y error sin solicitar red ni crear más de una operación de preparación concurrente. | Prueba unitaria de `InicioScreen`/`AppSession` con contador de llamadas y dobles locales. |

## Restricciones de implementación

- Mantener la semilla local en memoria y usar una operación síncrona de
  preparación; no introducir paginación, caché remota ni precarga de Spotify en
  U1.
- Las transiciones de sesión deben ser explícitas (`loading` y `signingIn`
  internos), idempotentes frente a doble toque y cancelables al desmontar.
- No optimizar a costa de los estados definidos en `BR1.7`: un fallo debe
  mostrar acción «Reintentar», no ocultarse.

## Fuera de alcance

NFR8 no fija objetivos numéricos en esta versión. La verificación comprueba
que el recorrido no deja pantallas en blanco, que las transiciones responden y
que las operaciones locales no se duplican, mediante pruebas locales y el
recorrido manual del Android objetivo. No se fijan throughput, consumo de
batería, latencia de red ni objetivos de arranque de una compilación de
producción: U1 no tiene servicio remoto ni build distribuible.

## Sources

- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/functional-design/functional-spec.md`
  — flujos F1, F2 y F3, estados internos y comportamiento de Inicio.
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/functional-design/rules.md`
  — reglas `BR1.1`–`BR1.7` sobre sesión, navegación, tarjeta y estados.
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/inception/requirements-analysis/requirements.md`
  — `NFR1`, `NFR2`, `NFR8`, `FR1`, `FR2`, `FR3` y restricciones `RC-01`–`RC-05`.
