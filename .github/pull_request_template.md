## 📌 Descripción

<!-- Describe de forma concisa qué cambios introduce este PR y el motivo del cambio. -->

## 🔗 Issue / Tarea Relacionada

Closes #<!-- Número del issue si aplica -->

---

## 🏷️ Tipo de Cambio

Marca con una `x` la opción correspondiente (alineado a Conventional Commits):

- [ ] `feat`: Nueva funcionalidad
- [ ] `fix`: Corrección de errores
- [ ] `refactor`: Refactorización de código sin cambios en la funcionalidad
- [ ] `style`: Cambios en estilos, diseño o UI
- [ ] `perf`: Optimización de rendimiento
- [ ] `test`: Adición o actualización de pruebas
- [ ] `docs`: Modificación o adición de documentación
- [ ] `ci`: Cambios en workflows o configuración de CI/CD
- [ ] `chore`: Tareas de mantenimiento, actualización de dependencias, etc.
- [ ] **BREAKING CHANGE**: Cambio incompatible con versiones anteriores

---

## 📱 Plataformas Verificadas

- [ ] **Android** (Emulador / Dispositivo físico)
- [ ] **iOS** (Simulador / Dispositivo físico)

---

## 📸 Capturas de Pantalla / Demos (UI)

<!-- Obligatorio si el PR introduce cambios visuales o de navegación. Puedes arrastrar imágenes o videos aquí. -->

| Antes | Después |
| :---: | :---: |
| _(Opcional)_ | _(Captura / Video)_ |

---

## ⚙️ Cambios de Configuración / Variables de Entorno

- [ ] ¿Requiere nuevas variables de entorno? (Si es así, verifica que se hayan agregado a `.env.example`).
- [ ] ¿Requiere instalación de dependencias nativas? (`bundle exec pod install`, permisos en `AndroidManifest.xml` o `Info.plist`).
- [ ] No aplica ningún cambio de configuración.

---

## 🧪 Pasos para Probar

1. Clonar/actualizar la rama correspondiente.
2. Ejecutar `npm install` (y `pod install` si aplica en iOS).
3. Configurar `.env` a partir de `.env.example` si aplica.
4. Ejecutar el proyecto:
   - Android: `npm run android`
   - iOS: `npm run ios`
5. _Paso específico para validar la funcionalidad / bug fix_:
   - ...

---

## ✅ Checklist de Calidad

Antes de solicitar revisión, asegúrate de marcar cada uno de los siguientes puntos:

- [ ] El título del PR y los commits siguen la convención de [Conventional Commits](https://www.conventionalcommits.org/) (requerido por `commitlint`).
- [ ] Ejecuté `npm run typecheck` y no hay errores de TypeScript.
- [ ] Ejecuté `npm run lint` y se resolvieron las advertencias/errores de ESLint.
- [ ] Ejecuté `npm test` y todas las pruebas unitarias pasan.
- [ ] He eliminado comentarios innecesarios, código muerto y `console.log` de depuración.
- [ ] No se suben credenciales, llaves de API o tokens sensibles (revisado `.env`).
