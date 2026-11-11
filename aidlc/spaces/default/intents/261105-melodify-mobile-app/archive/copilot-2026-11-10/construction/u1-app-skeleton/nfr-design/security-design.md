# Diseño de seguridad — U1 `u1-app-skeleton`

## Modelo de controles

U1 usa autenticación demo, no autenticación real. La separación evita confundir
la sesión local con una frontera de seguridad para usuarios reales.

| ID | Control de diseño |
|---|---|
| NFR3.1 | `AppSession` recorta espacios solo para comparar `demo`/`demo`; conserva campos en memoria de Login, nunca contraseña en logs, errores o snapshots. |
| NFR3.2 | C3 persiste únicamente `{ authorId: "demo", remembered: true }` mediante el adaptador acordado de Secure Store; no guarda contraseña, Spotify ni datos de terceros. |
| NFR3.3 | `signOut` borra primero; solo tras éxito emite `signedOut`. Un fallo conserva sesión y ofrece «Reintentar». |
| NFR3.4 | `SessionView` solo publica `signedIn` o `signedOut`; forma almacenada inválida se trata como ausencia y Login queda fuera de C2. |
| NFR3.5 | No se incluyen secretos ni `.env`; U1 no define client ID ni integra Spotify. Revisión de secretos y `.gitignore` bloquea filtraciones. |
| NFR4.1 | No hay fetch, SDK analítico, logger remoto, permisos nuevos ni envío de opinión/autor/contadores; todo el contenido U1 es memoria local. |
| NFR6.1 | C1 concentra tokens y componentes; controles y barra usan tamaño mínimo 44×44, textos en español y estados claro/oscuro. |
| NFR5.2 | Jest local cubre AppSession, navegación y estados de pantalla; se mantiene el umbral CI de 80 % sin excluir lógica crítica. |
| NFR6.2 | C1 define tokens de contraste ≥4.5:1 para texto y ≥3:1 para texto grande/iconos, verificados en ambos temas. |
| NFR7.1 | Solo APIs y módulos disponibles en Expo Go; ningún módulo exige prebuild, EAS o compilación nativa propia. |

## Fronteras y validación

- **AppSession:** única autoridad de transición de sesión. Valida la forma
  persistida con allowlist estricta (`authorId === "demo"` y booleano válido);
  cualquier otra forma es ausencia. Si la limpieza de un valor corrupto falla,
  no se bloquea el acceso al formulario, pero el estado visible sigue siendo
  `signedOut`.
- **AppShell:** decide si monta Login o las cinco pestañas según `SessionView`;
  nunca recibe contraseña ni conoce el formato de Secure Store.
- **Design-system:** consume tokens y modelos de presentación, no identidad ni
  almacenamiento.
- **Bootstrap:** inyecta adaptadores y valores por defecto sin secretos.
- **Entrada:** se normaliza para validar, se limita al contrato de Login y no se
  refleja en mensajes de error. Contraseña usa entrada segura y control
  accesible.
- **Fallo de C3:** 503 de lectura muestra Login y «Reintentar»; 503 de guardado
  no permite entrar; fallo de borrado conserva sesión. No se navega
  prematuramente.

## Enmienda obligatoria de C3 antes de Code Generation

El contrato actual documenta `POST /session/sign-out` únicamente con respuesta
`204`. Para implementar NFR3.3 y el flujo F4, C3 debe declarar antes de Code
Generation una respuesta `503`:

```yaml
'503':
  description: no se pudo borrar el recuerdo del almacenamiento seguro;
               se conserva la sesión y la interfaz ofrece reintentar
```

El comportamiento observable asociado es conservar `signedIn`, no emitir
`signedOut`, y permitir repetir la petición. El dueño de C3/U1 debe actualizar
`contract-summary.md` y su versión/artefacto de contrato antes de generar código.

## ADR-SEC-01 — Puerto de almacenamiento seguro y allowlist

### Contexto
La sesión debe recordarse entre reinicios, pero U1 no puede almacenar
credenciales ni introducir infraestructura nativa fuera de Expo Go.

### Decisión
Definir un puerto de almacenamiento en C3 e inyectar un adaptador compatible
con Expo Go (Secure Store). Persistir solo la allowlist de identidad demo y
validarla al leer.

### Consecuencias
La implementación es sustituible en pruebas y evita acoplar AppShell a
almacenamiento. Secure Store sigue siendo almacenamiento local del dispositivo,
no una autenticación real ni garantía contra un dispositivo comprometido.

### Alternativas rechazadas
- **AsyncStorage:** no ofrece el nivel de protección requerido por la decisión
  de seguridad del proyecto.
- **Guardar contraseña o token:** aumenta exposición y contradice NFR3.1–3.2.
- **Backend/JWT:** fuera de alcance y no ejecutable como requisito de U1.

## ADR-SEC-02 — Fallo de cierre como estado conservador

### Contexto
Navegar a Login antes de borrar el recuerdo puede dejar una sesión reutilizable
y contradice el contrato de cierre seguro.

### Decisión
Borrado exitoso es condición previa a `signedOut`; un fallo devuelve 503
semántico, conserva sesión, muestra acción en español y no filtra detalles.

### Consecuencias
El usuario puede reintentar sin perder contexto; una sesión no se invalida
visualmente hasta confirmar la limpieza. Requiere la enmienda C3 indicada arriba.

### Alternativas rechazadas
- **Navegar siempre a Login:** oculta un fallo de seguridad.
- **Reintento automático infinito:** puede bloquear UI y no es idempotencia
  visible; se usa reintento explícito.

## Sources

- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/security-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/reliability-requirements.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/construction/u1-app-skeleton/nfr-requirements/tech-stack-decisions.md`
- `aidlc/spaces/default/intents/261105-melodify-mobile-app/inception/contract-design/contract-summary.md`
