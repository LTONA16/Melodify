# Infraestructura de U3 — preguntas

> Unidad `u3-create-react` · intento `261105-melodify-mobile-app` · 2026-11-15.
>
> Contexto que no se pregunta porque ya está decidido: la app corre en Expo Go sobre un teléfono
> Android, no hay backend, los tres puertos de Spotify siguen en `null` y `team.md` § Deployment dice
> que en esta versión no hay despliegue ni entornos. U2 ya dejó la tubería completa. Estas preguntas
> solo cierran lo que el diseño de infraestructura necesita afirmar por escrito en una unidad que
> mueve mucho código y, aun así, ninguna pieza de plataforma.
>
> **Modo de respuesta**: `ve con lo recomendado`, la preferencia que ya se usó en U2 y que no se
> re-pregunta cuando la respuesta ya está fijada por `team.md`, por `project.md` o por el diseño
> anterior. Cada `[Answer]` lleva la razón, no solo la letra.

## Q1 — Entornos y cómputo

U3 añade ocho piezas de C1, tres hooks, el controlador de comentarios y el cableado de cuatro
pantallas. Es la unidad con más código del intento.

**¿Ese volumen cambia algo del borde de infraestructura?**

A. **No: sigue sin provisionarse nada.** Las piezas son React Native con tokens, el controlador vive
   en el proceso y las cinco escrituras van a C4. El diseño lo declara y no deja preparado ningún
   punto de enganche.

B. Se provisiona algo mínimo (por ejemplo un runner propio, un hosting del bundle o un entorno de
   vista previa) porque la unidad ya es grande.

X. Otro (por favor, especifica).

[Answer]: A — No se provisiona nada. **Razón**: NFR7.6 y TS-23 a TS-29 no añaden ninguna dependencia
ni módulo nativo; el volumen de código no cambia de qué está hecho el sistema.

## Q2 — Qué corre la tubería

`.github/workflows/ci.yml` ya ejecuta `commitlint`, `npm run typecheck`, `npm run lint` y `npm test`
(que es `jest --coverage`), más el título del PR. U2 dejó los siete umbrales y los siete mapeos de
módulo.

**¿La tubería cambia en U3?**

A. **No: ni un paso, ni un umbral, ni un mapeo.** U3 solo aporta contenido nuevo que las mismas
   compuertas juzgan. Lo único nuevo es una regla de lint (`eslint.config.js`), que el paso que ya
   existe ejecuta.

B. Se añade un umbral nuevo por cada árbol que U3 toca, aunque ya existan, para dejarlo explícito.

C. Se añade un paso de build (`expo export`) que falle si el bundle no compila.

X. Otro (por favor, especifica).

[Answer]: A — La tubería no cambia. **Razón**: los siete `coverageThreshold` y los siete
`moduleNameMapper` ya están a 80 desde U1 y U2; duplicar la cifra no añade compuerta, y un `expo
export` no compila nada que el teléfono no ejecute ya (Q3).

## Q3 — Publicación y tiendas

**¿La tubería publica algo tras esta unidad?**

A. **No publica nada**: sin EAS Build, sin EAS Update, sin firma, sin artefacto que descargar. El CI
   valida y termina, y la entrega se demuestra en el teléfono.

B. Publica un artefacto interno (por ejemplo el bundle de `expo export`) como adjunto del job, sin
   firma ni tienda.

X. Otro (por favor, especifica).

[Answer]: A — No publica nada. **Razón**: CT-05 y `team.md` § Deployment; es la misma respuesta de
U2 y el criterio de terminado sigue siendo el recorrido en Expo Go.

## Q4 — Secretos en CI

Las pruebas siguen doblando todo: no hay red, no hay credenciales y U3 **ni lee**
`EXPO_PUBLIC_SPOTIFY_CLIENT_ID` (NFR3.15).

**¿Qué secretos se configuran en el CI?**

A. **Ninguno.** La variable del client ID se documenta sin valor en `.env.example` y se usa solo en el
   teléfono, a partir de U4. El client secret no existe (PKCE) y ningún token pasa por el CI.

B. Se configura `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` como variable del repositorio, por adelantado.

X. Otro (por favor, especifica).

[Answer]: A — Ninguno. **Razón**: un cliente público de PKCE no tiene secreto, y una variable que
nadie lee es una copia más que rotar (NFR3.1, NFR3.10).

## Q5 — Observabilidad de la unidad

U3 añade un código al logger (`SEARCH_PORT_UNAVAILABLE`) y es la primera unidad en la que el texto que
se maneja lo escribe una persona.

**¿Qué monitoring se diseña?**

A. **Ninguno de plataforma**: sin APM, sin agregación de logs, sin alertas, sin SLIs. El logger sigue
   escribiendo en la consola del teléfono y la lista de lo que **nunca** se registra se amplía al texto
   de la opinión, al del comentario y al borrador.

B. Se añade un servicio de errores (Sentry o similar) aprovechando que esta unidad ya maneja datos
   reales de la persona.

X. Otro (por favor, especifica).

[Answer]: A — Ninguno de plataforma. **Razón**: NFR9.1 y NFR9.5 prohíben telemetría nueva, y un
servicio de errores con texto de personas exigiría una decisión de privacidad que ninguna etapa ha
tomado (NFR4.8).

## Q6 — Vuelta atrás

`team.md` define el rollback como `git revert` del squash del Bolt en `develop` (y en `main` si ya
viajó en una entrega) más recargar Metro.

**¿Se diseña algo más para volver atrás?**

A. **No**: es exactamente ese, y el diseño lo escribe. U3 añade un matiz verificable: como no toca el
   YAML, revertir la unidad no puede dejar la tubería rota.

B. Se añade un paso de CI que impida mergear si `develop` queda roto, además del revert manual.

X. Otro (por favor, especifica).

[Answer]: A — Solo el `git revert` del repositorio. **Razón**: no hay artefacto desplegado, ni
migración de datos, ni estado del runner que limpiar; un guardia adicional sobre `develop` sería una
compuerta más que mantener sin un fallo que la justifique.
