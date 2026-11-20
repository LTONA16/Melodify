/**
 * Superficie pública de `@melodify/activity` (C8 1.1.0).
 *
 * Solo se publica la fábrica y los modelos que cruzan el contrato. Las piezas
 * internas de derivación y agrupación se prueban por rutas relativas, no se
 * exportan: nadie fuera del paquete debe reconstruir la actividad por su cuenta.
 */
export { createActivity } from "./activity";
export type { CreateActivityOptions } from "./activity";
export type {
  ActivityDay,
  ActivityEventKind,
  ActivityEventView,
  ActivityFeed,
  ActivityGroupView,
  ActivityStatus,
  ActivityView,
} from "./types";
