/**
 * Los esquemas Zod del contrato (subpath `@melodify/contracts/schemas`).
 *
 * Por qué van en un archivo aparte del índice: la app importa **solo los tipos**
 * (se borran al compilar) y no paga el peso de Zod en el bundle del móvil. El
 * servidor importa este subpath y valida con los mismos esquemas con los que
 * genera la documentación OpenAPI, así que la especificación no puede mentir.
 *
 * Solo viven aquí los esquemas que ya usa una ruta: cada etapa añade los suyos
 * junto al endpoint que los estrena, en vez de adelantar un contrato sin probar.
 */
import { z } from "zod";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./pagination";

/**
 * La misma regla que usa la app para sus marcas de tiempo
 * (`packages/app-session/src/session-record.ts`): ISO 8601 con zona. `Date.parse`
 * suelto aceptaría «demo» y convertiría la comprobación en un trámite.
 */
const ISO_8601_WITH_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export const isoTimestampSchema = z
  .string()
  .regex(ISO_8601_WITH_ZONE, "no es una fecha ISO 8601 con zona horaria");

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string().min(1),
  database: z.enum(["up", "down"]),
});

export const apiErrorDetailSchema = z.object({
  path: z.string().min(1),
  message: z.string().min(1),
});

export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.array(apiErrorDetailSchema).optional(),
  }),
});

export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PaginationQueryInput = z.input<typeof paginationQuerySchema>;
export type PaginationQueryOutput = z.output<typeof paginationQuerySchema>;
