# Accessibility Checklist — Melodify

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (NFR6, NFR2, FR11.2, FR11.5), de `inception/refined-mockups/mockups.md`, de `inception/refined-mockups/design-system-mapping.md` y de las respuestas de `refined-mockups-questions.md` (Q5 = A).
> Fecha: 2026-11-09. Etapa: Refined Mockups. Agente: aidlc-design-agent.

## Alcance

**Nivel adoptado**: el que fija NFR6, ni más ni menos.

| Dentro | Fuera |
|---|---|
| Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande e iconos, en tema claro y oscuro | Lector de pantalla (`accessibilityLabel` completo, anuncios y orden de foco para TalkBack) |
| Áreas táctiles de al menos 44×44 en barra inferior, botones principales e iconos de tarjeta | Navegación por teclado externo |
| El color nunca es el único portador de significado | Subtítulos, audiodescripción y contenido multimedia (no hay audio) |
| Texto escalable con la configuración del sistema | Internacionalización y lectores de derecha a izquierda (RC-06) |
| Movimiento reducido respetado | Verificación con herramientas automáticas de accesibilidad (no hay pipeline de a11y) |

**Por qué no se sube a AA completo**: Q5 = A lo decidió y NFR6 lo fija. Subirlo ahora añadiría etiquetas y orden de foco que la práctica del equipo no exige y que retrasarían el recorrido, que es el criterio de terminado. La deuda queda escrita para que se sepa qué falta y dónde.

## Checklist

| ID | Requisito | Dónde se aplica | Cómo se comprueba | Estado |
|---|---|---|---|---|
| A11Y-01 | Texto normal ≥ 4.5:1 | Todos los textos de las seis pantallas y las hojas | Tabla de contraste de `design-system-mapping.md`; comprobación en el teléfono con el tema claro y el oscuro | Definido |
| A11Y-02 | Texto grande ≥ 3:1 | Títulos `type.title1`/`type.title2`, «Melodify» | Igual que A11Y-01 | Definido |
| A11Y-03 | Componentes e iconos ≥ 3:1 | Bordes de campo, estrellas vacías, iconos de la barra, iconos sociales | Tabla de contraste; los iconos inactivos usan `color.textMuted` 5.3:1 | Definido |
| A11Y-04 | Área táctil ≥ 44×44 | Barra inferior, botones principales, iconos `♡`/`💬`, estrellas, ✕ de limpiar, ojo de contraseña, cerrar hoja | Medida en el dispositivo con la cuadrícula de desarrollo; tabla de áreas táctiles | Definido |
| A11Y-05 | El color no es el único significado | Valoración (estrellas + número), estado de Spotify (texto + icono), error (texto + icono), me gusta (glifo `♡`/`♥` + contador) | Revisión visual en los dos temas y en escala de grises | Definido |
| A11Y-06 | Contraste también en tema oscuro | Las seis pantallas y las hojas | Cambiar el tema del sistema y repetir A11Y-01 a A11Y-05 | Definido |
| A11Y-07 | Texto escalable sin romper la interfaz | Tarjetas, botones, formularios, barra inferior | Escala de fuente del sistema al 130 % en el teléfono; ninguna tarjeta recorta el texto de forma ilegible ni el botón se sale | Definido |
| A11Y-08 | Orden de lectura y foco lógico | Cada pantalla y la hoja de comentarios | Recorrido con TalkBack activado aunque no se optimice: el orden debe ser cabecera → contenido → acciones → barra | Parcial (solo orden, sin etiquetas) |
| A11Y-09 | Errores en lenguaje llano y con acción | Todos los estados de error | Revisión de la tabla de copy de `interaction-spec.md`; ninguna cadena técnica ni en inglés | Definido |
| A11Y-10 | Movimiento reducido | Pulso de esqueletos, latido del corazón, hoja, snackbar | Activar «Quitar animaciones» del sistema y comprobar que no hay pulso ni escala | Definido |
| A11Y-11 | Sin parpadeos > 3/s | Toda la app | No hay animaciones intermitentes; el esqueleto pulsa a 1200 ms | Definido |
| A11Y-12 | Textos en español | Todo lo visible | Recorrido completo leyendo cada pantalla | Definido |
| A11Y-13 | Estados vacíos, de carga y de error con forma | Las seis pantallas | Matriz de estados de `mockups.md`, recorrida pantalla por pantalla | Definido |
| A11Y-14 | La app no depende de la orientación | Teléfono vertical y horizontal | Girar el teléfono en Inicio, Explorar, Crear y el detalle | Definido (horizontal = compacto) |

## Contraste

La tabla completa, par por par, está en `design-system-mapping.md` § «Contraste verificado». Resumen de los mínimos:

| Elemento | Mínimo exigido | Ratio más bajo del sistema | Resultado |
|---|---|---|---|
| Texto normal | 4.5:1 | 5.3:1 (`textMuted` en claro) | ✔ |
| Texto grande | 3:1 | 6.8:1 (`textSecondary` en claro) | ✔ |
| Bordes de control | 3:1 | 5.3:1 (`borderStrong` en claro) | ✔ |
| Iconos informativos | 3:1 | 5.3:1 (`textMuted` en claro) | ✔ |
| Estrellas | 3:1 | 6.1:1 (claro) / 12.0:1 (oscuro) | ✔ |

**Único par por debajo de 3:1**: `color.border` (1.5:1) sobre el fondo. Es decorativo —separa tarjetas— y no delimita ningún control interactivo, así que no le aplica el mínimo. Queda prohibido usarlo como borde de campo o como único indicador de estado.

## Áreas táctiles

| Elemento | Tamaño visual | Área tocable | Cumple |
|---|---|---|---|
| Destino de la barra inferior | 24 icono + etiqueta | 56 × (ancho/5) ≥ 44 | ✔ |
| Botón principal | 48 de alto | 48 × ancho | ✔ |
| Icono `♡` / `💬` de la tarjeta | 20 | 44 × 44 con `hitSlop` | ✔ |
| Estrella de valoración | 24 | 44 × 44 | ✔ |
| ✕ de limpiar búsqueda | 20 | 44 × 44 | ✔ |
| Ojo de mostrar contraseña | 20 | 44 × 44 | ✔ |
| ✕ de cerrar la hoja | 24 | 44 × 44 | ✔ |
| «Seguir autor» | 32 de alto | 44 × 88 | ✔ |
| «Cancelar» de la cabecera | 20 de alto | 44 × 64 | ✔ |
| Fila de resultado | 72 de alto | 72 × ancho | ✔ |
| Fila de actividad | 64 de alto | 64 × ancho | ✔ |

Regla: cuando el icono visual mide menos de 44, el componente añade `hitSlop` hasta 44 sin agrandar el dibujo ni mover el layout.

## Color y significado

| Información | Cómo se transmite además del color |
|---|---|
| Valoración | Cinco estrellas rellenas o vacías **y** el número «4/5» |
| Me gusta dado | Glifo `♥` en lugar de `♡` **y** el contador actualizado |
| Seguimiento | El texto del botón cambia de «Seguir autor» a «Siguiendo» |
| Estado de Spotify | Texto «Conectado»/«Conectar» **más** icono de check o punto |
| Error | Texto del error **más** icono de alerta |
| Sin conexión | Texto del banner **más** icono de nube tachada |
| Pestaña activa | Icono relleno **más** color **más** etiqueta |

## Texto escalable

- Ninguna altura de texto es fija: los contenedores usan `minHeight`, no `height`, salvo la barra inferior, que crece con `safe.bottom` y con la etiqueta.
- `allowFontScaling` se deja activo. La prueba manual se hace al 130 %; si una tarjeta recorta el texto de forma que no se puede leer, se aumenta la tarjeta, no se reduce la fuente.
- La valoración y el contador de me gusta se mantienen en la misma línea base; si el texto crece y no cabe, la fila social pasa a dos líneas antes que recortar.
- El botón principal nunca parte su etiqueta en dos líneas: crece en alto.

## Orden de lectura

| Pantalla | Orden esperado |
|---|---|
| Login | «Melodify» → campo Usuario → campo Contraseña → error si lo hay → «Entrar» → pista demo |
| Inicio | «Inicio» → chip de Spotify → banner → «Para ti» → tarjeta 1 (obra, autor, valoración, texto, acciones) → tarjeta 2 → … → barra inferior |
| Explorar | «Explorar» → campo de búsqueda → ayuda o resultados → barra inferior |
| Detalle | «Volver» → título de la obra → artista → valoración → mi opinión (si existe) → otras opiniones → acción principal |
| Crear | «Crear» → «Cancelar» → obra → texto → valoración → «Publicar» → barra inferior |
| Actividad | «Actividad» → día → eventos → día → … → barra inferior |
| Perfil | «Perfil» → identidad → contadores → tarjeta de Spotify → «Mis opiniones» → lista → «Cerrar sesión» → barra inferior |
| Hoja de comentarios | «Comentarios» → lista → campo → enviar |

## Procedimiento de verificación manual

Se ejecuta en el teléfono Android físico, con Expo Go, una vez por Bolt que toque interfaz y siempre antes del recorrido final. No sustituye a las pruebas automáticas: las complementa en lo que solo se ve en pantalla.

1. **Tema claro**: recorrer las seis pantallas y la hoja de comentarios; comprobar los pares de la tabla de contraste con el selector de colores del sistema o una app de cuentagotas.
2. **Tema oscuro**: cambiar el tema del sistema y repetir el paso 1.
3. **Áreas táctiles**: activar «Mostrar límites de diseño» en las opciones de desarrollador de Android y comprobar que los objetivos de la tabla están dentro de sus 44×44.
4. **Escala de texto**: subir el tamaño de fuente del sistema al 130 % y recorrer Inicio, Crear y Perfil; ninguna etiqueta ilegible, ningún botón cortado.
5. **Escala de grises**: activar la corrección de daltonismo o una capa de escala de grises y comprobar que toda la información sigue siendo legible (A11Y-05).
6. **Movimiento reducido**: activar «Quitar animaciones»; el esqueleto no pulsa y el corazón no late.
7. **Errores**: forzar cada estado de la matriz (sin red, portada rota, búsqueda fallida, publicación fallida, token inválido) y comprobar que el texto es llano, está en español y ofrece «Reintentar».
8. **Orientación**: girar el teléfono en Inicio, Explorar, Crear y detalle; la pantalla sigue usable y el contenido no se corta.

**Evidencia**: cada Bolt anota en su PR qué pasos hizo, en qué teléfono y con qué resultado, según la plantilla `.github/pull_request_template.md`. Un «no verificado» se escribe como tal; no se da por bueno.

## Lo que las pruebas automáticas sí pueden comprobar

| Comprobación | Cómo |
|---|---|
| Que los tokens de contraste no cambian sin querer | Prueba unitaria que calcula el ratio de los pares declarados y falla si baja del mínimo |
| Que los textos de error son los de la tabla de copy | Prueba de cada pantalla en su estado de error buscando el texto exacto |
| Que los estados vacíos se renderizan | Prueba con almacén vacío (FR11.6) |
| Que los iconos sociales tienen área tocable | Prueba de estilo del componente (`minWidth`/`minHeight` 44) |
| Que la app sigue el tema del sistema | Prueba con `useColorScheme` simulado en claro y en oscuro |
| Que el esqueleto existe en carga | Prueba de la pantalla con el estado de carga |

Lo que **no** se puede comprobar en Jest y exige el teléfono: contraste real en pantalla, tamaño físico del objetivo táctil, escala de fuente del sistema y percepción del movimiento.

## Assumptions & Open Questions

- `[assumption]` El contraste se mide sobre los hexadecimales de `design-system-mapping.md`; si al construir se ajusta un tono, se actualiza el token y esta tabla, nunca se compensa con un color suelto en un componente.
- `[assumption]` El orden de lectura (A11Y-08) se comprueba con TalkBack activado aunque las etiquetas queden fuera de alcance: no se añaden etiquetas, pero tampoco se rompe el orden natural.
- `[assumption]` El 130 % de escala es el umbral de verificación acordado; Android permite más y a partir de ahí la interfaz puede crecer en vertical, pero no se compromete legibilidad por encima de ese valor.
- **Ninguna pregunta abierta bloquea la construcción.** Subir a WCAG 2.1 AA completo sería una historia nueva y una decisión de alcance, no un ajuste de esta etapa.

## Sources

- `inception/requirements-analysis/requirements.md` (`requirements`) — NFR6 (contraste, áreas táctiles, lector fuera de alcance), NFR2, FR11.2, FR11.5.
- `ideation/rough-mockups/wireframes.md` (`wireframes`) — pantallas y estados de partida que se verifican.
- `ideation/rough-mockups/user-flow.md` (`user-flow`) — recorridos que la verificación manual sigue.
- `inception/user-stories/stories.md` (`stories`) — criterios de aceptación que la checklist ayuda a probar.
- `inception/refined-mockups/mockups.md` (`mockups`) — pantallas y estados verificables.
- `inception/refined-mockups/design-system-mapping.md` (`design-system-mapping`) — valores de color y tokens de tamaño.
- `inception/refined-mockups/interaction-spec.md` (`interaction-spec`) — copy de errores y comportamiento de componentes.
- `inception/practices-discovery/team-practices.md` (`team-practices`) — verificación en el teléfono y evidencia en el PR.
- `inception/refined-mockups/refined-mockups-questions.md` (`refined-mockups-questions`) — Q5 = A.
