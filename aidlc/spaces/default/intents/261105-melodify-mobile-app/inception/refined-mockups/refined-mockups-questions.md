# Refined Mockups — Preguntas

> **Provenance**: deriva de `ideation/rough-mockups/wireframes.md`, `ideation/rough-mockups/user-flow.md`, `inception/user-stories/stories.md`, `inception/requirements-analysis/requirements.md` y `inception/practices-discovery/team-practices.md`.
> Fecha: 2026-11-09. Etapa: Refined Mockups. Agente: aidlc-design-agent.

## Qué decide esta etapa

Los wireframes de la ideación fijaron la estructura en baja fidelidad: qué bloque va dónde, sin color ni tipografía. Esta etapa baja a **fidelidad media-alta en texto**: cada pantalla con su jerarquía, sus textos reales, sus estados y los tokens concretos (color, tipografía, espaciado, radios, alturas táctiles) con los que se construye. No reabre el alcance ni añade funciones: las 24 historias y los 112 criterios ya están aprobados y aquí solo se les da forma visible.

**Fuera del alcance de esta etapa.** No se eligen librerías de navegación ni de estado (eso es Domain Design), no se fija el redirect URI de PKCE (Functional Design, A6) y no se rediseña ninguna pantalla ya acordada.

## Q1. [Representación] ¿Cómo representamos cada pantalla?

De la respuesta depende el tamaño de `mockups.md` y cómo se comprueba que ninguna historia se queda sin forma visible.

- A. Un mockup por pantalla —Login, Inicio, Explorar, Detalle de obra, Crear, Actividad y Perfil— con diagrama de bloques, jerarquía, textos exactos y tokens concretos, y una tabla que mapea cada historia a los bloques donde vive (Recommended)
- B. Un mockup por historia: 24 bloques, aunque varias historias compartan la misma pantalla y se repitan
- C. Un mockup por componente compartido (tarjeta de opinión, cabecera, barra inferior, hoja) y las pantallas descritas como composición de esos componentes
- X. Other (please specify)

[Answer]: A

## Q2. [Interacción] ¿Qué patrones fijamos?

Las historias ya insinúan algunos patrones (hoja de comentarios, buscador plegado, formulario en modo edición). Aquí se cierran para que el desarrollo no improvise uno distinto en cada pantalla.

- A. Los que las historias ya describen: hoja inferior modal para comentarios, formulario dedicado para crear y editar, buscador plegable, avisos en línea para errores de red y confirmación efímera (snackbar) para publicar, editar, comentar y seguir (Recommended)
- B. Pantallas completas para comentarios y edición: sin hojas ni plegados, todo navega a una pantalla propia
- C. Diálogos modales centrados para todo: comentarios, edición y confirmaciones
- X. Other (please specify)

[Answer]: A

## Q3. [Estados] ¿Cómo documentamos los estados de cada pantalla?

La práctica del equipo exige probar el render de cada pantalla en vacío, carga, error, sin Spotify y sin conexión. Hay que decidir dónde vive esa definición.

- A. Una matriz por pantalla con los cinco estados de la práctica, qué se ve en cada uno y el texto exacto que aparece, más una tabla de qué estado aplica a qué pantalla (Recommended)
- B. Solo los estados no triviales de cada pantalla, con los comunes —carga y error— definidos una vez para toda la app
- C. Un catálogo único de estados reutilizables por componente, sin matriz por pantalla
- X. Other (please specify)

[Answer]: A

## Q4. [Sistema de diseño] ¿Con qué base construimos la interfaz?

El proyecto es greenfield, corre en Expo Go, necesita tema claro y oscuro y contraste 4.5:1. La elección condiciona `design-system-mapping.md` y lo que Code Generation tendrá que instalar.

- A. Sistema propio mínimo sobre React Native puro: tokens de color para claro y oscuro, escala tipográfica, espaciado, radios y elevación, sin librería de componentes pesada (Recommended)
- B. React Native Paper (Material 3) con un tema propio encima
- C. Otra librería de componentes con theming (NativeBase, Tamagui u similar)
- X. Other (please specify)

[Answer]: A

## Q5. [Accesibilidad] ¿Qué nivel adoptamos?

NFR6 ya fija contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande e iconos, áreas táctiles de al menos 44×44 y deja el lector de pantalla fuera de esta versión. Falta decidir si eso es todo o si se sube.

- A. Lo que fija NFR6, ni más ni menos: contraste 4.5:1 / 3:1, áreas táctiles de 44×44 y nada de lector de pantalla (Recommended)
- B. WCAG 2.1 AA completo, incluidos `accessibilityLabel`, roles y orden de foco para lector de pantalla
- C. Mínimo práctico: solo contraste y tamaños táctiles, sin comprobaciones adicionales de foco u objetivos
- X. Other (please specify)

[Answer]: A

## Q6. [Responsive] ¿Qué tamaños de pantalla cubrimos?

RC-05 fija la verificación en un teléfono Android físico y NFR7 deja iOS fuera. Falta acotar qué anchos y orientaciones entran en el diseño.

- A. Solo teléfono Android en vertical, de 360×640 a 430×932 dp; horizontal y tablet quedan fuera y se documenta por qué (Recommended)
- B. Teléfono en vertical y horizontal, con la misma jerarquía adaptada
- C. Teléfono y tablet, con rejilla adaptable y cambios de disposición por ancho
- X. Other (please specify)

[Answer]: C

## Consolidated Summary Confirmation

- **Representación**: un mockup por pantalla —Login, Inicio, Explorar, Detalle de obra, Crear, Actividad y Perfil— con jerarquía de bloques, textos exactos y tokens concretos, más una tabla que mapea cada una de las 24 historias a los bloques donde vive.
- **Interacción**: hoja inferior modal para comentarios; formulario dedicado para crear y editar, con la obra fija en modo edición; buscador plegable; avisos en línea para errores de red con «Reintentar»; confirmación efímera (snackbar) al publicar, guardar, comentar, seguir y desconectar.
- **Estados**: matriz por pantalla con los cinco estados de la práctica —carga, vacío, error, sin Spotify y sin conexión—, qué se ve en cada uno y el texto exacto; más una tabla de qué estados aplican a qué pantalla.
- **Sistema de diseño**: sistema propio mínimo sobre React Native puro, sin librería de componentes: tokens de color para tema claro y oscuro, escala tipográfica, espaciado de 4 pt, radios y elevación; la tarjeta de opinión es el componente compartido.
- **Accesibilidad**: el nivel que fija NFR6 —contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande e iconos, áreas táctiles de al menos 44×44— y sin lector de pantalla en esta versión.
- **Responsive**: teléfono y tablet, con rejilla adaptable. Se fijan tres anchos —compacto (< 600 dp), medio (600–839 dp) y expandido (≥ 840 dp)—: en compacto una columna y barra inferior; en medio, feed y listas a dos columnas y la barra sigue abajo; en expandido, detalle a dos paneles (obra a la izquierda, opiniones a la derecha) y barra lateral de navegación. Horizontal en teléfono se trata como compacto.
- **Consecuencia a tener presente**: RC-05 fija la verificación en un teléfono Android físico y esta versión no tiene tablet a mano, así que **el diseño de tablet y de los tres anchos queda especificado, pero solo se verifica el recorrido en teléfono**. La tabla de breakpoints se escribe como contrato de diseño para Construction y no como criterio de aceptación de esta versión; si quieres que la tablet sea criterio de terminado, dímelo y lo recojo.

Does this all look correct before I generate the artifacts?

- Looks correct
- Request changes

[Answer]: Looks correct