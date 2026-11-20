# Infraestructura de `u6-walkthrough`

> U6 no añade infraestructura y, sin embargo, es la unidad donde ese «no añade» hay que escribir con más cuidado. No hay servidor, ni entorno nuevo, ni dependencia nueva; lo que hay es un **entorno de demostración**: un teléfono Android físico, Metro en el ordenador, el repositorio en verde y un PR que acepta la evidencia. Si esa envuelta no se describe, el veredicto del recorrido parece una opinión y no una verificación repetible.

## Qué decide esta etapa

`team.md` § Deployment sigue mandando lo mismo desde U1: en esta versión no hay despliegue, no hay entornos y «abrir la app» es el único equivalente a producción. La respuesta de infraestructura para U6 es **no provisionar nada**, y la etapa trabaja sobre lo que NFR Design y Functional Design ya decidieron: no abre un fichero de preguntas nuevo porque no hay ninguna decisión de plataforma pendiente.

Lo que U6 aporta al borde no es código, sino **condiciones de ejecución y de entrega**:

| Condición | Por qué es infraestructura aunque no se aprovisione |
|---|---|
| El mismo commit para las cuatro pasadas | La cabecera de ocho datos y el `git rev-parse --short HEAD` son el único modo de repetir la demostración |
| Teléfono Android físico + Expo Go | El criterio de terminado del MVP no admite emulador ni build propio (CT-05, `team.md` § Deployment) |
| Metro levantado desde `app/` | Es el servidor de desarrollo que sirve el bundle; sin él no hay pasada |
| Tema del sistema controlado | Claro en P1/P3, oscuro en P2/P4; el cambio se hace fuera de la app, en el dispositivo |
| Modo avión como interruptor de red | W12, W12b, W12c y S07 provocan el estado sin conexión sin dobles ni conmutadores de demo |
| Spotify opcional y condicionado | R2 depende de client ID y redirect admitido; si falta, la unidad cierra con R1 y deja la deuda escrita |
| Evidencia fuera del bundle | Los registros viven en el árbol del intento y las capturas se adjuntan al PR, nunca en `app/` ni en `packages/` |
| CI en verde al cierre | Los tres comandos existentes son la puerta; no se añade un paso para medir la pasada |

## Qué no se diseña

| No se diseña | Por qué |
|---|---|
| Clúster, contenedores, funciones o VMs | No hay servidor: no hay backend (RC-02, `project.md` § Forbidden) |
| Base de datos, caché remota, cola, búsqueda o CDN propios | El contenido vive en memoria (C4), la caché de búsqueda en C5 y las portadas vienen de Spotify o del bloque con inicial |
| Backend, proxy o intermediario | `project.md` § Forbidden lo prohíbe; la app habla con Spotify directamente desde el teléfono en U4 |
| VPC, subredes, ingress, DNS, balanceador o TLS propio | Una app de Expo Go no escucha conexiones; la única red es saliente y ya está acotada en U4 |
| Entornos staging/producción | `team.md` § Deployment: no existen; la promoción es de ramas, no de entornos |
| APM, agregación de logs, alertas remotas o SLIs | No hay servicio desplegado que medir; la evidencia se lee, no se telemetrea (NFR9.9) |
| EAS Build, EAS Update, firma o tiendas | CT-05 y `team.md` § Deployment: la app corre en Expo Go, sin compilación propia |
| Nueva dependencia, versión o lockfile | NFR7.9 y TS-44: nada nuevo que instalar ni compilar; el `git diff --stat` de los nueve `package.json` y del lockfile debe quedar vacío |
| Paso nuevo en el CI | TS-48: los siete pasos de U2 bastan; el recorrido se demuestra en el teléfono y se narra en el PR |
| Secuenciador, capturador o intermediario de evidencia | Q1 = A y TS-44: los registros se escriben a mano; un script que recorra no demostraría lo que la persona ve |
| Instrumentación de rendimiento | NFR8.19: la espera se juzga por su estado final, no se cronometra |

## Despliegue

| Facet | Choice | Rationale |
|---|---|---|
| **Modelo de cómputo** | Ninguno propio. El código corre en el teléfono dentro de **Expo Go**; el ordenador solo ejecuta **Metro** | No hay servidor que alojar ni proceso que escalar. U6 no cambia el runtime de U1–U5 (NFR7.9, CT-05) |
| **Red e ingress** | Sin ingress, sin VPC y sin puertos abiertos. Red local ordenador↔teléfono para Metro; salida HTTPS a Spotify solo en R2 | El sentido de la red es saliente y ya quedó acotado en U4 a `accounts.spotify.com`, `api.spotify.com` y su CDN. W12 y S07 provocan la pérdida de red con el modo avión del dispositivo |
| **Almacenamiento** | Nada provisionado. En el llavero siguen dos claves: `melodify.session` y `melodify.spotify.token`; el contenido y las cachés siguen en memoria | U6 no añade persistencia (RC-03); el recorrido solo comprueba que la siembra vuelve al recargar y que S08 borra el token |
| **Entornos** | Uno: teléfono + Metro + repositorio en el commit de la cabecera | No hay staging ni producción (`team.md` § Deployment). Dos entornos sin backend solo añadirían configuración que nadie consume |
| **Infraestructura como código** | Ninguna. La configuración de plataforma es la que ya existe: `.github/workflows/ci.yml`, `jest.config.js`, `eslint.config.js`, `tsconfig.json` y los `package.json` | Ninguno de esos archivos cambia en U6. Su detalle está en `cicd-pipeline.md` |
| **Dimensionamiento** | No aplica: no hay servidor que dimensionar. El presupuesto es el de NFR Design: 52 filas y 24 capturas, o 52 filas escritas y 13 capturas si R2 se condiciona | El límite es el coste de la demostración, no CPU ni memoria remota (§ Coste del recorrido de `performance-design.md`) |
| **Dependencias** | **Ninguna nueva.** Los nueve paquetes y `@melodify/app` quedan en las versiones que dejó U5; `package-lock.json` no se mueve | NFR7.9, TS-44 y `security-design.md` § NFR3.25: un `package.json` movido sería la señal de que la verificación se convirtió en construcción |
| **Servicios de terceros** | Spotify sigue siendo opcional. R2 usa el client ID local y el redirect registrado; si falta, se ejecuta S01 y se condiciona | BR25.4, BR26.7, BR28.2: la mitad con sesión es deseable pero no bloquea el cierre de R1 |
| **Dispositivo y sistema** | Android físico con Expo Go, tema del sistema y modo avión; modelo, versión de Android y versión de Expo Go se anotan en la cabecera | Son VIII de los ocho datos de la cabecera (NFR1.20): sin ellos otra persona no puede repetir la pasada |

## Servicios de infraestructura

| Service | Role | Configuration | Notes |
|---|---|---|---|
| **GitHub Actions** (`ubuntu-latest`) | Ejecutor de la tubería de validación | Dos jobs, `commit-lint` y `code-quality`; Node 22 con caché de `npm`; permisos `contents: read` y `pull-requests: read`; **el YAML no cambia** | No publica ni despliega. U6 le pide que siga juzgando tipos, lint, pruebas, cobertura y título de PR (NFR5.13) |
| **Metro** (ordenador de desarrollo) | Servidor de desarrollo del bundle | `npx expo start` desde `app/`, sin módulos ausentes ni avisos nuevos | Es precondición 2; si cae, la pasada queda `Abortada` y no cuenta (BR25.2, NFR1.19) |
| **Expo Go** (teléfono Android) | Runtime del cliente | Cliente instalado a mano, sin `expo-dev-client`, sin build propio y sin `prebuild` | Debe abrir el mismo commit que declara la cabecera; el tema y la red se controlan desde el sistema |
| **`expo-secure-store`** (dispositivo) | Almacenamiento seguro del sistema operativo | Dos claves, dos dueños: `melodify.session` (U1) y `melodify.spotify.token` (U4) | U6 no escribe ni lee el llavero para pintar evidencia; S08 comprueba que el token se borra (NFR3.24) |
| **`accounts.spotify.com`** | Autorización PKCE de terceros | Solo en R2; sin client secret; redirect resuelto por `resolveRedirectUri()` | S01 observa el estado exacto de la tarjeta; si el panel rechaza el redirect, se anota y R2 se condiciona |
| **`api.spotify.com`** y su CDN | Catálogo y portadas reales | Solo en R2; lectura con token y manejo previsto de `401`, `429`, red y `5xx` | S02–S07 recorren el catálogo real; la evidencia no copia datos de la cuenta (NFR4.12) |
| **GitHub PR** | Registro de entrega y contenedor de capturas | Plantilla del repositorio, checklist de calidad, capturas adjuntas | No es un servicio que se configure aquí; es el sitio donde la evidencia se hace revisable (TS-45) |
| **Registro del dispositivo** | Sumidero de diagnóstico existente | `AppLogCode` cerrado en U5, consola de Metro y del teléfono | U6 no añade códigos; el registro de pasada no es un canal de logs (NFR9.9) |

## Infraestructura compartida

**No hay recursos compartidos que provisionar.** Las seis unidades, los ocho paquetes y `@melodify/app` siguen siendo parte del mismo monorepo y del mismo binario de Expo Go: lo que comparten es el repositorio, el CI y el llavero del dispositivo, no un recurso con dueño y consumidores.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| — | — | — | No existe ninguno: U6 no crea un recurso aprovisionable |

**Lo que U6 comparte, y no es infraestructura.** Estos son los puntos donde duplicar una instancia convertiría la verificación en otra cosa:

| Lo compartido | Cuántas instancias | Quién lo crea | Si se duplicara |
|---|---|---|---|
| El commit de la cabecera | Uno por pasada | `git rev-parse --short HEAD` | Dos pasadas podrían estar comparando árboles distintos y el veredicto no sería repetible (NFR1.20) |
| `authorId` = `demo` y la sesión de la app | Una | `createAppSession`, clave `melodify.session` | W13 no demostraría que cerrar sesión vuelve a Login al reabrir (C3) |
| Token de Spotify | Uno | `auth`, clave `melodify.spotify.token` | S06 y S08 dejarían de ser comprobables; U6 no construye una segunda fuente (TS-05, TS-18) |
| Contenido sembrado | Una fuente | `createContentStore`, memoria del proceso | Cada pasada arrancaría con un contenido distinto y las filas no serían comparables (C4, NFR1.20) |
| Evidencia de la pasada | Un fichero por pasada | `walkthrough-p{1..4}.md`, fuera del bundle | Un fichero único con cuatro tablas mezclaría pasadas y no permitiría cerrarlas por separado (§ El registro de la pasada) |
| Capturas | 24 o 13, por nombre | Persona, adjuntas al PR | Sin captura obligatoria no hay fila demostrada (BR27.1, NFR1.20) |
| Configuración de CI | Una | Repositorio, sin cambios | Un paso nuevo para «medir» el recorrido añadiría instrumentación prohibida por TS-44 |

## Archivos de plataforma: ninguno se mueve

| Artefacto | Estado en U6 | Por qué |
|---|---|---|
| `.github/workflows/ci.yml` | **No cambia** | Los siete pasos y los disparadores siguen siendo los mismos; lo que cambia es lo que se exige en el PR |
| `package.json` (raíz y ocho paquetes) | **No cambian** | Ninguna versión se mueve: un cambio sería construcción encubierta (NFR3.25, NFR7.9) |
| `package-lock.json` | **No cambia** | No hay dependencias nuevas que instalar; `npm ci` debe instalar exactamente lo mismo |
| `jest.config.js` | **No cambia** | Los nueve umbrales al 80 % y los mapas de módulos siguen vigentes; no se baja el suelo para cerrar la unidad |
| `eslint.config.js` | **No cambia** | Las fronteras de U2 y U4 siguen cerradas; U6 no relaja una regla para arreglar un síntoma |
| `tsconfig.json` y `app/tsconfig.json` | **No cambian** | Ningún módulo ni paquete nuevo que referenciar |
| `.env.example` | **No cambia** | Sigue documentando `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` y `EXPO_PUBLIC_SPOTIFY_REDIRECT_URI`; U6 no añade variables |
| `app/src/bootstrap/logger.ts` | **No cambia** | `AppLogCode` quedó cerrado en U5; el registro de la pasada no es diagnóstico de producto (NFR9.9) |
| `inception/delivery-planning/external-dependency-map.md` | **Solo si R2 se condiciona** | Gana una línea bajo la tabla con el redirect literal y la fecha; no cambia el esquema de columnas |
| `construction/u6-walkthrough/code-generation/walkthrough-p{1..4}.md` | **Nuevos, fuera del producto** | Son evidencia del intento; no los importa la app ni los ve el bundle (LC-20) |
| Capturas `p{1..4}-*.png` | **Nuevas, adjuntas al PR** | No se commitean al árbol: el PR es el registro y el repositorio no crece con binarios de demo (TS-45) |

## Qué queda escrito y dónde

| Dato | Dónde vive | Lo crea | Lo borra |
|---|---|---|---|
| `authorId` = `demo` y `startedAt` | `expo-secure-store`, clave `melodify.session` | U1 | W13, «Cerrar sesión» |
| Token de Spotify | `expo-secure-store`, clave `melodify.spotify.token` | U4 | S08, renovación fallida y `401` |
| Opiniones, autores, me gusta, comentarios y seguimientos | Memoria del proceso (C4) | Siembra de U2; W07 y W05b escriben | Recargar la app |
| Caché de búsquedas y registro de obras | Memoria del proceso (C5) | U2; R2 la alimenta | Recargar la app |
| Estado de red y de Spotify | Memoria del proceso | U2 y U4 | Recargar la app |
| Modelo, Android y Expo Go, commit, tema, Spotify, client ID y Metro | Cabecera de los cuatro registros | Persona, ocho datos por pasada | No aplica: es la evidencia |
| Resultado de cada paso | Fila de `walkthrough-p{1..4}.md` | Persona | No aplica; un N/A siempre lleva motivo |
| Defectos y pendientes | Tabla de defectos del registro | Persona | El defecto se cierra con commit y repetición; el pendiente queda con dependencia |
| Capturas | Adjuntas al PR | Persona | El PR; no se commitean |
| Redirect literal y fecha | Nota de S01 y línea bajo la tabla del mapa | Solo si R2 se condiciona | No aplica: es la constancia de la dependencia |

**La fila que importa es la del redirect.** Es la única información nueva que puede salir del registro hacia un artefacto de planificación, y solo ocurre cuando R2 no se pudo completar. No es un secreto —es una URL de retorno con una IP de red local—, pero por eso mismo se escribe una sola vez, con fecha y con el mismo valor en los dos sitios (§ NFR3.24 de `security-design.md`).

## Precondiciones con lectura de plataforma

| # | Precondición | Superficie de plataforma | Si falla |
|---|---|---|---|
| 1 | Teléfono Android físico | Dispositivo + Expo Go | Pasada `Abortada` con bloqueo; se reanuda |
| 2 | Metro levantado desde `app/` | Ordenador + bundle | Pasada `Abortada`; no se sustituye por emulador |
| 3 | Commit identificado y árbol limpio salvo evidencia | Git | Se anota el commit real; sobre cambios sin commitear la pasada no cuenta |
| 4 | Sesión de la app cerrada | `melodify.session` | W13 la cierra antes de empezar |
| 5 | Tema del sistema fijado | Ajustes de Android | Se cambia en el sistema; no se recarga por el tema |
| 6 | Client ID configurado | `.env` local, nunca commiteado | S01 observa `notConfigured` y R2 se condiciona |
| 7 | Redirect admitido | Panel de Spotify | S01 observa `connectionError` y R2 se condiciona |

Las cinco primeras son bloqueantes; las dos últimas no. Esa diferencia es de infraestructura: sin teléfono o sin Metro no hay entorno donde demostrar; sin client ID o sin redirect hay un entorno parcial que todavía permite demostrar R1 y dejar constancia de lo que falta.

## Assumptions & Open Questions

- `[assumption]` El teléfono Android físico usado en U1–U5 sigue disponible y sirve para las cuatro pasadas; el registro guarda modelo y versiones para que otra persona pueda repetirlo.
- `[assumption]` Metro puede levantarse desde `app/` con el mismo `node_modules` que valida el CI; si un módulo faltara, la pasada se aborta y se reanuda, no se cambia la dependencia.
- `[assumption]` El modo avión del dispositivo es suficiente para provocar los estados sin conexión de W12, W12b, W12c y S07 sin tocar el código.
- **Pregunta abierta para el cierre del workflow**: si R2 queda condicionada, la mitad con sesión se cierra como deuda con dependencia externa. El registro y el mapa de dependencias externas deben llevar el mismo redirect y la misma fecha (BR26.7, BR28.2).
- **Pregunta abierta heredada de U2**: el paso «Detectar directorio del proyecto» sigue resolviendo `.` porque sus dos ramas no se cumplen. U6 no lo toca: simplificarlo sería un cambio de tubería ajeno a la verificación.

## Sources

- `performance-design.md` — NFR8.19, NFR8.20, NFR2.15, NFR1.19, NFR1.20, NFR7.9 y NFR6.11: coste cerrado de las pasadas, siete precondiciones, cabecera de ocho datos y ninguna medición nueva.
- `security-design.md` — NFR3.24, NFR3.25, NFR4.12 y NFR9.9: evidencia sin secretos, compuertas del arreglo, inventario de datos y registro que no es telemetría.
- `logical-components.md` — LC-1 a LC-20: inventario sin componentes nuevos de producto y LC-20 como artefacto de proceso fuera del bundle.
- `components.md` — dependencias externas ya existentes: `expo-secure-store`, estado de red, Spotify Accounts API y Spotify Web API.
- `functional-spec.md` — pasadas P1–P4, precondiciones, catálogo de pasos, salida condicionada de R2, registro de pasada y criterio de cierre.
- `contract-summary.md` — C1 1.5.0, C2 1.4.0, C3 1.1.0, C4 1.2.0, C5 1.2.0, C6 1.0.0, C7 1.0.0 y C8 1.1.0; U6 consume sin publicar contrato propio.
- `team.md` § Deployment, § Way of Working y § Testing Posture — sin entornos, PR obligatorio, CI en verde y recorrido manual en el teléfono.
- `project.md` § Forbidden y § Mandated — sin backend, sin persistencia del contenido, sin client secret, token en almacenamiento seguro y app recorrible sin Spotify.
