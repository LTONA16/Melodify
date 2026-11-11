# Riesgos y justificación de secuencia — Melodify

**Confirmación del resumen:** Looks correct (confirmación renovada, 2026-11-10). 

## Heurística elegida

Se combina **walking skeleton-first** con **risk-first**. El walking skeleton es el primer tramo mínimo integrado que corre de Login a Inicio; después se prioriza el riesgo de Spotify antes de invertir en la escritura completa. No se usa WSJF formal: el número de unidades es pequeño, el proyecto es de una persona y el valor de la decisión está en hacer explícitos los riesgos, no en producir una puntuación artificial.

La decisión prioriza aprendizaje temprano sin alterar las dependencias técnicas aprobadas.

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Bolt que lo trata |
|---|---|---|---|---|
| PKCE, redirect URI o retorno desde Spotify no funcionan en Expo Go | Media | Alto | Fijar redirect URI en Functional Design, probar URL/intercambio con dobles y ejecutar conexión real antes de U6 si RC-09 está disponible | U4 |
| Token o client ID se manejan de forma insegura | Baja | Crítico | PKCE sin client secret, `expo-secure-store`, doble de almacenamiento seguro y prohibición de `EXPO_PUBLIC_*` para secretos | U4 |
| U2 concentra siembra, tres pantallas y estados | Alta | Alto | Implementar por capas test-after, cerrar primero ContentStore/Catalog y mantener una Definition of Done pequeña | U2 |
| El monorepo y los contratos invertidos generan ciclos o tipos incompatibles | Media | Alto | Crear los puertos en U2, inyectar implementaciones desde `bootstrap/` y ejecutar `tsc -b` en cada PR | U1–U4 |
| La cobertura del 80 % por nueve árboles bloquea la entrega | Alta | Medio | Escribir pruebas por capa antes de pasar a la siguiente y mantener dobles para Spotify y almacenamiento | U1–U5 |
| El recorrido en el teléfono revela errores de integración tardíos | Media | Alto | Checkpoint físico para U1, demostración por Bolt y recorrido sin/con Spotify en U6 | U1 y U6 |
| Falta el registro de Spotify o el redirect URI al llegar a U6 | Media | Alto | Registrar la app y acordar el redirect URI durante Functional Design; si se retrasa, demostrar sin sesión y dejar el motivo documentado | U4 y U6 |

## Por qué este orden

1. **U1** reduce el riesgo estructural: confirma Expo Go, navegación, sesión simulada y la primera tarjeta en el dispositivo real.
2. **U2** crea el valor local mínimo y las superficies compartidas que necesitan las tres ramas restantes.
3. **U4** va antes que U3 y U5 porque Spotify es la única dependencia externa real y puede invalidar decisiones de integración, persistencia segura o portadas.
4. **U3** añade el valor central de publicar y reaccionar cuando el modelo de lectura ya está estable.
5. **U5** es una rama pequeña y derivada; se deja después de la escritura para comprobar la actividad con cambios reales.
6. **U6** integra y demuestra todo, sin convertirse en un lugar para inventar funciones nuevas.

## Dependencias de secuencia

La secuencia respeta `U1 → U2 → {U3, U4, U5} → U6`. La elección U4 antes de U3 y U5 es económica, no una alteración del DAG. No se paraleliza porque una sola persona modifica superficies compartidas y el equipo afirmó trabajo serial.
