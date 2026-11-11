# Asignación de equipo — Melodify

**Confirmación del resumen:** Looks correct (confirmación renovada, 2026-11-10). 

## Equipo y forma de trabajo

El proyecto es greenfield y lo construye una sola persona con asistencia de IA. Cada Bolt lo ejecuta `aidlc-developer-agent` como único mob AI; no se crean equipos paralelos. La persona mantiene la decisión y la aprobación, y el agente actúa como conductor técnico, implementador y apoyo de pruebas dentro de cada unidad.

La asignación se mantiene deliberadamente estable durante los seis Bolts para evitar handoffs artificiales en un proyecto de una sola persona.

La ejecución es serial aunque el grafo permita que U3, U4 y U5 sean independientes después de U2. La razón es evitar conflictos sobre `ContentStore`, `app/src/bootstrap/`, la tarjeta de opinión y la composición de servicios. Cada Bolt se entrega por PR a `develop` y solo se abre el siguiente tras CI verde y demostración cuando corresponda.

## Programa de Bolts

| Bolt | Responsable | Enfoque principal | Dependencias |
|---|---|---|---|
| U1 — `u1-app-skeleton` | `aidlc-developer-agent` | Expo Go, navegación, DesignSystem, AppSession | Ninguna |
| U2 — `u2-content-core` | `aidlc-developer-agent` | ContentStore, Catalog, Connectivity, Inicio, detalle, Perfil | U1 |
| U4 — `u4-spotify-explore` | `aidlc-developer-agent` | PKCE, token seguro, adaptador Spotify y Explorar | U2; Functional Design fija redirect URI |
| U3 — `u3-create-react` | `aidlc-developer-agent` | Escritura y reacciones locales | U2; usa los contratos de U2 |
| U5 — `u5-activity` | `aidlc-developer-agent` | Actividad derivada | U2 |
| U6 — `u6-walkthrough` | `aidlc-developer-agent` | Recorrido y ajustes de integración | U3, U4, U5 |

## Normas de coordinación

- El dueño de cada paquete propone cambios en su contrato; las unidades consumidoras no cambian contratos unilateralmente.
- Las pruebas de Spotify usan dobles y nunca salen a la red.
- La cobertura mínima es 80 % de líneas por árbol según las prácticas afirmadas.
- La comprobación manual en Expo Go no sustituye `npm test`, `npm run typecheck` ni `npm run lint`.
- Los hallazgos que afecten una interfaz compartida se corrigen en el Bolt dueño y se reflejan en el PR correspondiente.

## Handoff a Construction

Construction recibe el DAG de `unit-of-work-dependency.md`, los contratos C1–C10 de `contract-summary.md`, el orden económico de `bolt-plan.md` y los riesgos de `risk-and-sequencing-rationale.md`. El primer checkpoint exige demostrar U1 en el teléfono; una revisión de diseño no cuenta como demostración del esqueleto.
