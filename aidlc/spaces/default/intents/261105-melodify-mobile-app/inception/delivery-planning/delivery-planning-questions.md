# Preguntas — Delivery Planning (Melodify)

> **Qué decide esta etapa**: el orden en que se construyen las seis unidades de trabajo. Units Generation ya fijó qué es cada unidad y de qué depende (U1 → U2 → {U3, U4, U5} → U6); aquí se elige por dónde se recorre ese grafo, cuánto abarca cada Bolt y qué se considera terminado en cada uno. Un **Bolt** es una pasada de construcción sobre una o más unidades que termina en algo que corre.
>
> Fecha: 2026-11-09. Alcance: `mvp`. Profundidad: Standard. Agente: aidlc-delivery-agent.

## Q1. [entrega] ¿Por dónde empezamos?

El alcance `mvp` ya activa el walking skeleton (el tramo mínimo que corre de punta a punta), así que la primera unidad del grafo —U1, el esqueleto— es fija. La pregunta es qué criterio manda después: si el riesgo de Spotify, el valor de leer y escribir, o la base técnica.

- A. **Esqueleto primero y después riesgo**: U1 y, en cuanto U2 exista, Spotify (U4) antes que Crear y Actividad, para descubrir pronto el riesgo de PKCE y del token.
- B. **Esqueleto primero y después valor**: U1, luego U2 (Inicio, detalle y Perfil completos) y luego U3 (publicar, editar y reaccionar) antes que Spotify; la app se siente completa sin cuenta antes de tocar la integración.
- C. **Esqueleto primero y después lo más simple**: U1, U2, U5 (Actividad) y U3 antes que Spotify, dejando la integración para el final.
- D. **Esqueleto primero, luego riesgo y luego valor**: U1, U2, U4, U3, U5 y U6.
- X. Other (please specify)

[Answer]: D

> Cambiado de C a D el 2026-11-10: se construye U4 antes que U3 y U5 para descubrir el riesgo de PKCE y del token cuanto antes. `bolt-plan.md` ya sigue este orden.

## Q2. [entrega] ¿Qué tamaño tiene un Bolt?

Cada Bolt se cierra con una demostración y una definición de terminado. Un Bolt más pequeño enseña antes y abarata el error; uno más grande reduce el número de paradas.

- A. **Un Bolt por unidad**: seis Bolts, uno por unidad del grafo. Cada uno se demuestra en el teléfono y se mergea antes de abrir el siguiente.
- B. **Cinco Bolts**: U3, U4 y U5 se agrupan en un solo Bolt de «interacción», porque comparten la tarjeta de opinión y el contenido.
- C. **Cuatro Bolts**: esqueleto (U1), contenido (U2), interacción y Spotify (U3+U4), Actividad (U5) y recorrido (U6).
- D. **Dos Bolts**: esqueleto (U1) y todo lo demás (U1→U6), con el recorrido como cierre.
- X. Other (please specify)

[Answer]: A

## Q3. [entrega] ¿Se construyen varios Bolts a la vez?

Después de U2, las ramas U3, U4 y U5 no dependen entre sí y podrían ir en paralelo. En este proyecto las construye una sola persona y todas tocan el mismo repositorio y varios archivos compartidos (`ContentStore`, la tarjeta, `bootstrap/`).

- A. **En serie, un Bolt a la vez**: nada se abre hasta que el anterior está mergeado y demostrado. Menos fricción de ramas y de archivos compartidos.
- B. **En serie, pero con ramas paralelas al llegar a U3/U4/U5**: se abren las tres ramas y se integran en el orden que pida el riesgo, aunque el trabajo sea uno detrás de otro.
- C. **Todo lo que el grafo permita**: U3, U4 y U5 se construyen en paralelo de verdad, cada una en su copia del proyecto.
- X. Other (please specify)

[Answer]: B

## Q4. [entrega] ¿Hace falta una fórmula de priorización?

Con seis unidades y un grafo casi lineal, una fórmula puede dar una falsa sensación de precisión; lo que sí hace falta es dejar escrita la razón de cada orden.

- A. **Sin fórmula**: el orden se justifica por riesgo y valor en `risk-and-sequencing-rationale.md`, unidad por unidad.
- B. **WSJF ligero**: puntuar valor, urgencia y reducción de riesgo contra tamaño, con pesos sencillos, y ordenar por esa puntuación.
- C. **WSJF completo**: la fórmula de (valor + urgencia + reducción de riesgo) ÷ tamaño, documentada y aplicada a cada Bolt.
- D. **Risk-first con matriz**: probabilidad × impacto de cada riesgo y el Bolt que lo ataca antes.
- X. Other (please specify)

[Answer]: A

## Q5. [entrega] El prerrequisito externo de Spotify (RC-09, A6)

Para demostrar el recorrido con sesión hace falta una app registrada en el portal de Spotify, con su client ID entregado por entorno y un redirect URI que PKCE usa para volver a la app. El redirect URI se decide en Functional Design. Sin ese registro, el recorrido se demuestra solo sin sesión.

- A. **Registrar la app antes de empezar U4**: el redirect URI se fija en Functional Design y el registro se hace antes de que U4 necesite probar la conexión real.
- B. **Dejarlo para U6**: si al llegar al recorrido no está, se demuestra solo la mitad sin sesión y se dice por qué.
- C. **Registrarlo ya, antes de Construction**: empezar Construction con el prerrequisito resuelto y el redirect URI solo confirmado en Functional Design.
- D. **No demostrar con sesión en esta versión**: se construye U4 igual, pero el criterio de terminado se limita al recorrido sin Spotify.
- X. Other (please specify)

[Answer]: D

> Superada por Q8: la app de Spotify ya está registrada; en Functional Design se fija el redirect URI y U6 sí demuestra el recorrido con sesión.

## Q6. [entrega] ¿Qué te preocupa más de esta construcción?

Se usa para poner la mirada y el margen de la primera unidad donde más falta hace, no para cambiar el alcance.

- A. **La integración con Spotify en Expo Go**: PKCE, redirect URI, token en almacenamiento seguro, caducidad y refresco.
- B. **El 80 % de cobertura en nueve árboles**: app más ocho paquetes, cada uno con su umbral.
- C. **El recorrido final en el teléfono físico**: que las seis pantallas se recorran sin errores con y sin sesión.
- D. **El tamaño de U2**: contenido de ejemplo, tres pantallas y sus estados de vacío, carga y error en una sola unidad.
- X. Other (please specify)

[Answer]: C

## Q7. [entrega] ¿Qué significa «terminado» al cerrar un Bolt?

- A. **PR a `develop` con CI verde y el tramo demostrado en Expo Go**, más el checkpoint humano del Bolt. La demostración en el teléfono forma parte del cierre, no del final.
- B. **CI verde y revisión del PR**, y la demostración en el teléfono se hace una sola vez al final, en U6.
- C. **PR a `develop`, CI verde, demostración en el teléfono y documentación actualizada** (README, `.env.example`) en cada Bolt.
- X. Other (please specify)

[Answer]: A

## Q8. [entrega] El recorrido con sesión de Spotify, tras elegir no demostrarlo

El requisito FR12.2 y la historia US11.2 piden demostrar el recorrido dos veces, sin sesión y con sesión, y la práctica de Deployment del equipo dice lo mismo. La respuesta a Q5 deja fuera esa segunda mitad, así que hay que decir qué pasa con ese criterio de terminado: si se mantiene condicionado, si se reduce el alcance de la versión o si queda como deuda.

- A. **Condicional**: U6 demuestra el recorrido con sesión solo si el registro de Spotify y el redirect URI están resueltos antes de U6; si no, se demuestra sin sesión y se registra el motivo. Los requisitos no cambian y el riesgo queda abierto.
- B. **Reducción formal del alcance**: el criterio de terminado de esta versión es el recorrido sin sesión. Se enmiendan FR12.2, US11.2 y la práctica de Deployment, y el recorrido con sesión queda como trabajo posterior.
- C. **Deuda posterior sin enmendar requisitos**: U4 se construye y se prueba con dobles, pero la conexión real no se verifica en esta versión; se anota como deuda y los requisitos quedan como están.
- D. **Registrar la app ahora con guía**: en Functional Design fijamos el redirect URI, te acompaño en el registro del portal de Spotify y U6 demuestra el recorrido con sesión.
- X. Other (please specify)

[Answer]: D

## Consolidated Summary Confirmation

- Looks correct
- Request changes

[Answer]: Looks correct
