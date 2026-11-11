# Decisiones de stack tecnológico — U1

## ADR-U1-01 — Aplicación Expo con TypeScript estricto

**Decisión:** construir U1 como app React Native con Expo Go y TypeScript
`strict: true`, usando únicamente APIs y módulos disponibles en Expo Go.

**Motivo:** satisface RC-01, NFR5 y NFR7, y permite verificar el esqueleto en
un teléfono Android sin compilación nativa propia. Prettier, ESLint de Expo,
Jest con `jest-expo` y React Native Testing Library siguen las prácticas del
equipo.

**Consecuencia:** no se añaden módulos nativos que requieran prebuild/EAS ni se
verifica iOS en esta versión.

## ADR-U1-02 — Estado local en memoria y adaptadores explícitos

**Decisión:** mantener la semilla, la navegación y el contenido de U1 en estado
React local, separado por dominios (`state`, `data`, `screens`, `components`);
aislar el recuerdo de sesión detrás de un adaptador de almacenamiento seguro
compatible con Expo Go. La dependencia se inyecta o se sustituye por doble en
pruebas.

**Motivo:** respeta RC-02, RC-03 y C3, evita persistir contenido y permite probar
fallos de lectura/guardado/borrado sin red. No se introduce base de datos,
backend, caché remoto, Redux, servidor ni sincronización.

## ADR-U1-03 — Navegación con cinco pilas hermanas

**Decisión:** usar la navegación declarativa disponible en el proyecto con una
pila independiente para Inicio, Explorar, Crear, Actividad y Perfil, montada
dentro de `AppShell`; Login queda fuera de la barra.

**Motivo:** implementa BR1.4–BR1.5 y conserva posición y pila por pestaña sin
crear un sexto destino. La decisión concreta de paquete debe permanecer en las
dependencias ya aceptadas por el proyecto y no exigir compilación propia.

## ADR-U1-04 — Sin observabilidad remota

**Decisión:** representar errores como estados de UI y usar solo evidencia
manual/pruebas locales. No añadir SDK analítico, logger remoto, panel,
telemetría ni permisos nuevos.

**Motivo:** es la aplicación directa de NFR4, NFR9 y el alcance de U1; no hay
usuarios reales ni operación que justifique infraestructura.

## Matriz de restricciones

| Decisión | Requisitos/constraints |
|---|---|
| Expo Go + TypeScript estricto | NFR5, NFR7, RC-01, RC-05 |
| Estado en memoria y adaptador de sesión | NFR3, NFR4, NFR1, RC-02, RC-03 |
| Cinco pilas hermanas | NFR2, BR1.4, BR1.5 |
| Diagnóstico solo local | NFR9, RC-04, fuera de alcance de operación |

| ID | Requisito verificable |
|---|---|
| NFR5.1 | El código de U1 usa TypeScript `strict`, Prettier, ESLint y las pruebas del CI del equipo; no introduce una dependencia que requiera configuración nativa propia. |
| NFR7.1 | El recorrido de U1 se verifica en Expo Go sobre Android físico; iOS, EAS, firma y publicación no forman parte de esta unidad. |

