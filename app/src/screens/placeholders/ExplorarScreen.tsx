/**
 * Explorar (U1): pestaña registrada y navegable con su título en la cabecera. El
 * buscador y sus estados llegan con U4; aquí no se inventan mensajes de
 * «próximamente» (frontend-components.md § Pantallas contenedoras).
 */
import { AppHeader } from "@melodify/design-system";

export function ExplorarScreen() {
  return <AppHeader title="Explorar" />;
}
