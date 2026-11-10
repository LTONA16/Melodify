# Feasibility & Constraints — Preguntas

## Sources

- [desc] Initial description: "construye una app movil con expo react native, el Nombre seria Melodify, una app sobre opiniones musicales. Se necesita pantalla de login, inicio, explorar, crear, actividad, perfil, por el momento utiliza placeholders."
- [scope] Workflow-selected scope: `mvp`.

## Q1. [Arquitectura] ¿Con qué sistemas existentes debe integrarse esta primera versión?

El intent statement ya fija que no habrá backend ni servicios musicales externos. Esta pregunta confirma si queda alguna integración fuera de esa frontera.

- A. Ninguna: la app funciona sola con datos locales de ejemplo
- B. Solo el sistema de archivos local del dispositivo (persistencia simple)
- C. Herramientas de desarrollo (Expo Go, emuladores) pero ninguna integración de producto
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q2. [Cumplimiento] ¿Hay requisitos regulatorios o de datos personales que apliquen?

Aunque no haya backend, la app tendrá una pantalla de login y podría guardar datos en el dispositivo.

- A. Ninguno: no se manejan datos personales reales, todo es de ejemplo
- B. Solo buenas prácticas de privacidad (no pedir datos reales, avisar que es una demo)
- C. Requisitos formales de protección de datos (por ejemplo GDPR o ley local de datos personales)
- D. Aún no definido
- X. Other (please specify)

[Answer]: C

## Q3. [Equipo] ¿Cuál es la experiencia del equipo con el stack previsto?

El pedido nombra Expo React Native. Saber el punto de partida cambia cuánto andamiaje conviene generar y qué tan estricto debe ser el tipado y las pruebas.

- A. Experiencia previa con React Native o Expo; cómodos con TypeScript
- B. Experiencia con React web pero nueva en React Native o Expo
- C. Poca experiencia en React; se aprende sobre la marcha
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Q4. [Entrega] ¿Qué plazo y presupuesto enmarcan esta primera versión?

- A. Sin plazo formal; se avanza por sesiones de trabajo
- B. Plazo corto, menos de dos semanas, priorizando que las pantallas existan
- C. Plazo de varias semanas con margen para pruebas
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q5. [Organización] ¿Existe algún bloqueo organizativo para avanzar?

- A. Ninguno: una sola persona puede crear el proyecto y avanzar sin aprobaciones
- B. Se necesita autorización para crear el repositorio o instalar herramientas
- C. Hay otras prioridades que competirán por el tiempo del equipo
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q6. [Plataforma] ¿Se usarán servicios en la nube o cuentas de desarrollador en esta versión?

Publicar en tiendas o usar servicios de compilación en la nube (como EAS) requiere cuentas y a veces costo.

- A. No: solo desarrollo local con Expo Go o emulador, sin cuentas de pago
- B. Se puede usar una cuenta gratuita de Expo (EAS) para compilar
- C. Hay cuentas de desarrollador de Google Play o App Store disponibles
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q7. [Plataforma] ¿Cómo se probará la app en esta primera versión?

El criterio de éxito habla de recorrer las pantallas sin errores en un dispositivo, así que necesito saber en qué se va a probar.

- A. Expo Go en un teléfono Android físico
- B. Emulador de Android en la computadora
- C. Ambos: Expo Go en teléfono y emulador
- D. Aún no definido
- X. Other (please specify)

[Answer]: A

## Q8. [Cumplimiento] Elegiste requisitos formales de protección de datos, pero la app no maneja datos reales. ¿Qué significa en la práctica?

Lo pregunto porque cambia cuánto trabajo de privacidad hay que hacer en esta versión: documentar políticas y consentimiento, o solo evitar pedir datos reales.

- A. Es una exigencia de la evaluación o del curso: hay que documentar privacidad y consentimiento aunque los datos sean de ejemplo
- B. La app se preparará para datos reales más adelante, así que conviene dejar la estructura de privacidad desde ahora
- C. Fue una elección equivocada: aplican solo buenas prácticas de privacidad
- D. Aún no definido
- X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

Resumen de lo respondido en esta etapa:

- **Integraciones**: solo herramientas de desarrollo (Expo Go, emuladores); ninguna integración de producto.
- **Cumplimiento**: se prepara la estructura de privacidad desde ahora porque la app apuntará a datos reales más adelante, aunque esta versión use datos de ejemplo.
- **Equipo**: experiencia con React web, nueva en React Native y Expo.
- **Plazo y presupuesto**: sin plazo formal; se avanza por sesiones de trabajo.
- **Bloqueos organizativos**: ninguno; una sola persona puede crear el proyecto y avanzar.
- **Cuentas y nube**: solo desarrollo local, sin cuentas de pago ni publicación en tiendas.
- **Pruebas**: Expo Go en un teléfono Android físico.

- Looks correct
- Request changes

[Answer]: Looks correct
