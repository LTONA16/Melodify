# NFR Design — Preguntas de `u1-app-skeleton`

## Consolidated Summary Confirmation

El diseño técnico separa `AppShell`, `AppSession`, `design-system` y
`bootstrap`; mantiene el estado local y la recuperación visible de errores;
usa únicamente Expo Go; no añade backend ni telemetría; y deja documentada la
enmienda de C3 para que `signOut` devuelva `503` cuando no pueda borrar la
sesión. La trazabilidad cubre los NFR derivados.

[Answer]: Looks correct
