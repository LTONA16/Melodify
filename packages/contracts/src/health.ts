/**
 * La sonda de salud del servicio.
 *
 * `database` no es decorativo: un proceso que responde pero no alcanza su base
 * de datos está roto para quien lo usa, y el despliegue local necesita poder
 * distinguir «vivo» de «listo».
 */

export interface HealthResponse {
  status: "ok" | "degraded";
  version: string;
  database: "up" | "down";
}
