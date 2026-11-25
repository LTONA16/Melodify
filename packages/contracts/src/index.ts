/**
 * Superficie pública de `@melodify/contracts`: el vocabulario que comparten la
 * app y el API.
 *
 * Qué es y qué no es:
 * - **Solo describe.** Aquí no hay lógica, ni React, ni acceso a red. Son los
 *   tipos que viajan por HTTP y las vistas que la app ya sabe pintar.
 * - **Los esquemas viven aparte** (`@melodify/contracts/schemas`), para que la
 *   app pueda importar los tipos sin arrastrar Zod al bundle del móvil.
 */
export * from "./errors";
export * from "./health";
export * from "./pagination";
export * from "./views";
