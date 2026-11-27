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

/**
 * El `handle` es la identidad pública y la clave con la que se entra. Se admite
 * en mayúsculas al escribirlo, pero el servicio lo normaliza a minúsculas antes
 * de guardarlo o buscarlo: `Demo` y `demo` son la misma cuenta.
 */
export const handleSchema = z
  .string()
  .min(3, "debe tener al menos 3 caracteres")
  .max(24, "no puede tener más de 24 caracteres")
  .regex(/^[A-Za-z0-9_]+$/, "solo admite letras, números y guion bajo");

export const displayNameSchema = z
  .string()
  .min(1, "es obligatorio")
  .max(40, "no puede tener más de 40 caracteres");

/** Argon2id no tiene el límite de 72 de bcrypt, pero 128 evita abusos. */
export const passwordSchema = z
  .string()
  .min(8, "debe tener al menos 8 caracteres")
  .max(128, "no puede tener más de 128 caracteres");

export const registerBodySchema = z.object({
  handle: handleSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  handle: handleSchema,
  password: z.string().min(1, "es obligatoria").max(128),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(20, "no es un refresh token válido").max(512),
});

export const userViewSchema = z.object({
  userId: z.string().min(1),
  handle: z.string().min(1),
  displayName: z.string().min(1),
  createdAt: isoTimestampSchema,
});

export const sessionViewSchema = z.object({
  user: userViewSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});
