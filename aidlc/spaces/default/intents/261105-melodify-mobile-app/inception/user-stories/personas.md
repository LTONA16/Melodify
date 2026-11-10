# Personas — Melodify

> **Provenance**: deriva de `inception/requirements-analysis/requirements.md` (FR1–FR12), `ideation/rough-mockups/wireframes.md` y la respuesta Q1 de `user-stories-questions.md` (una sola persona).
> Fecha: 2026-11-06. Etapa: User Stories. Agente: aidlc-product-agent.

## Por qué una sola persona

Melodify tiene un único tipo de usuario real: la persona que abre la app, lee opiniones, publica la suya y reacciona. No hay administradores, ni moderadores, ni cuentas de equipo. Los autores que aparecen en el feed y en las opiniones de ejemplo son **contenido**, no actores del sistema: no entran, no publican y no reciben notificaciones. El Perfil muestra a quién sigue la persona, pero ese «autor seguido» tampoco es un usuario de la app.

Modelar dos o tres personas habría duplicado cada historia con el mismo actor y habría hecho creer que hay roles que el producto no tiene.

---

## P1 — Luis, el oyente que opina

**Rol**: usuario único de Melodify; entra con la cuenta de demostración y es autor de las opiniones que publica.

**Objetivos**
1. Decir lo que piensa de una obra sin montar un perfil ni registrarse.
2. Descubrir obras que no conocía y ver qué opina la gente de ellas.
3. Volver a la app y encontrar su propia opinión y su actividad sin repetir pasos.

**Dolores**
- Las apps de música piden cuenta, permisos y suscripción antes de dejar hacer nada.
- Las reseñas se pierden en un feed infinito y no se puede volver a la que uno escribió.
- Cuando algo falla, la app se queda cargando o muestra un error técnico en inglés.

**Contexto de uso**
- Abre la app en el teléfono Android, en ratos cortos: en el transporte, esperando, en casa.
- A veces tiene sesión de Spotify y a veces no; quiere que la app sirva igual.
- Prueba la app en Expo Go sobre un teléfono físico, con el servidor de desarrollo en el ordenador.

**Comodidad técnica**: alta — instala Expo Go, conecta su cuenta de Spotify y entiende un mensaje de error si está escrito en lenguaje llano.

**Frecuencia**: varias veces al día, sesiones de uno a tres minutos.

**Qué valora por encima de todo**: que el recorrido no se rompa. Prefiere una pantalla sencilla que funcione a una pantalla rica que se quede en blanco.

---

## Relación entre personas y prioridad

| Persona | Relación | Prioridad |
|---|---|---|
| P1 — Luis, el oyente que opina | Única persona del sistema | Primaria |

## Personas descartadas y por qué

| Candidata | Por qué no se modela |
|---|---|
| El autor seguido | Es contenido de ejemplo; no entra, no publica y no recibe nada. Sus datos viven en el catálogo local. |
| El visitante que solo lee | Es la misma persona antes de publicar su primera opinión; no cambia ni una pantalla ni un permiso. |
| El administrador o moderador | No existe en esta versión: no hay backend ni contenido de otras personas reales. |
