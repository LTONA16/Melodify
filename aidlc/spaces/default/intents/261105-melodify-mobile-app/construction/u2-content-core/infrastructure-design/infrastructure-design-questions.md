# Infraestructura de U2 — preguntas

> Unidad `u2-content-core` · intento `261105-melodify-mobile-app` · 2026-11-12.
>
> Contexto que no se pregunta porque ya está decidido: la app corre en Expo Go sobre un teléfono Android, no hay backend, la única dependencia externa es la Web API de Spotify (aún sin usar en U2) y `team.md` § Deployment dice que en esta versión no hay despliegue ni entornos. Estas preguntas solo cierran lo que el diseño de infraestructura necesita afirmar por escrito: que no hay nada que provisionar, y qué hace exactamente la tubería que ya vive en `.github/workflows/ci.yml`.

## Q1 — Entornos y cómputo

`team.md` dice que no hay staging, ni producción, ni backend, y que «desplegar» es abrir la app en el teléfono con Metro levantado. El diseño de infraestructura tiene que decirlo con la misma claridad.

**¿Cuál es el resultado esperado de esta etapa?**

A. **Ninguno: no se provisiona infraestructura.** El diseño lo declara explícitamente (sin clúster, sin contenedores, sin base de datos, sin CDN, sin DNS propio, sin entornos) y solo documenta la tubería de CI que ya existe.

B. Se provisiona algo mínimo (por ejemplo un entorno de vista previa o un hosting del bundle) para poder enseñar la app sin el ordenador.

X. Otro (por favor, especifica).

[Answer]: A — No se provisiona infraestructura. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13): el diseño declara que no hay clúster, contenedores, base de datos, CDN, DNS propio ni entornos, y documenta solo el CI que ya existe.

## Q2 — Qué corre la tubería

`.github/workflows/ci.yml` ya ejecuta `commitlint`, `npm run typecheck`, `npm run lint` y `npm test`.

**¿Qué debe hacer la tubería tras esta unidad?**

A. **Lo mismo, más el umbral de cobertura**: `npm test -- --coverage`, para que el 80 % por árbol de NFR5.6 sea una puerta del CI y no solo del comando de verificación local.

B. Lo mismo que hoy, sin `--coverage`: la cobertura se comprueba en local con el comando de verificación.

C. Añadir además un paso de build (`expo export`) que falle si el bundle no compila.

X. Otro (por favor, especifica).

[Answer]: A — Lo mismo que hoy más `npm test -- --coverage`, para que el 80 % por árbol de NFR5.6 sea una puerta del CI. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13).

## Q3 — Publicación y tiendas

La entrega se demuestra recorriendo la app en el teléfono.

**¿La tubería publica algo?**

A. **No publica nada**: no hay EAS Build, ni EAS Update, ni firma, ni artefacto que descargar. El CI valida y termina.

B. Publica un artefacto interno (por ejemplo el bundle de `expo export`) como adjunto del job, sin firma ni tienda.

X. Otro (por favor, especifica).

[Answer]: A — No publica nada: sin EAS Build, EAS Update, firma ni artefacto que descargar; el CI valida y termina. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13).

## Q4 — Secretos en CI

Las pruebas sustituyen la API de Spotify por dobles y no necesitan credenciales. El client ID real llega por entorno (`EXPO_PUBLIC_SPOTIFY_CLIENT_ID`) y se documenta en `.env.example`; el client secret no existe (PKCE).

**¿Qué secretos se configuran en el CI?**

A. **Ninguno.** El CI no recibe `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`: sin él las pruebas y el type-check pasan igual, y no hay nada que filtrar. La variable se documenta y se usa solo en el teléfono.

B. Se configura `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` como variable del repositorio, para que un futuro paso de build la tenga.

X. Otro (por favor, especifica).

[Answer]: A — Ninguno: el CI no recibe `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13).

## Q5 — Observabilidad de la unidad

U2 no tiene servidor ni telemetría: el registro de la app (`app/src/bootstrap/logger.ts`, LC-5) escribe en la consola del teléfono y Metro lo muestra.

**¿Qué monitoring se diseña?**

A. **Ninguno de plataforma**: sin APM, sin agregación de logs, sin alertas, sin SLIs. Lo único que existe es el logger en el dispositivo y la salida de `npm test` / CI como señal.

B. Se añade un servicio de errores (Sentry o similar) más adelante, y esta etapa deja el punto de enganche preparado.

X. Otro (por favor, especifica).

[Answer]: A — Ninguno de plataforma: sin APM, sin agregación de logs, sin alertas, sin SLIs. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13).

## Q6 — Vuelta atrás

`team.md` define el rollback como `git revert` del squash del Bolt en `develop` (y en `main` si ya viajó en una entrega) más recargar Metro, porque no hay artefacto desplegado ni migración de datos.

**¿Se diseña algo más para volver atrás?**

A. **No**: el rollback es exactamente ese, y el diseño lo escribe para que nadie invente un mecanismo de despliegue azul/verde que aquí no existe.

B. Se añade un paso de CI que impida mergear si `develop` queda roto, además del revert manual.

X. Otro (por favor, especifica).

[Answer]: A — El rollback es `git revert` del squash del Bolt en `develop` (y en `main` si ya viajó) más recargar Metro; el diseño lo escribe tal cual. **Mode:** a elección del usuario («ve con lo recomendado», 2026-11-13).
