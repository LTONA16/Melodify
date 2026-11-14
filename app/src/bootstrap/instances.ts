/**
 * Las **únicas** instancias de C4, C5 y C6 de la app (TS-18, R-01).
 *
 * Por qué viven aquí y no en cada pantalla: el contenido, el catálogo y la red son
 * fuentes externas que varias pantallas leen a la vez. Una instancia por pantalla
 * daría dos respuestas a la misma pregunta —dos feeds con revisiones distintas, dos
 * decisiones de portada— y rompería la suscripción que hace que un cambio se vea en
 * todas partes. Se construyen una sola vez, al importar este archivo, y las pruebas
 * sustituyen el módulo con `jest.mock` (NFR1.8).
 *
 * La siembra se construye al importar, no en el primer render: así el feed no paga
 * su coste y el arranque, que ya tiene su presupuesto, es quien lo asume (NFR8.1).
 *
 * Los tres puertos de Spotify siguen en `null` hasta U4 (`ports.ts`): sin sesión, la
 * búsqueda responde `offline` y toda portada es el bloque con la inicial (BR5.5,
 * BR5.6).
 */
import { createCatalog } from "@melodify/catalog";
import { createConnectivity, expoNetworkAdapter } from "@melodify/connectivity";
import { createContentStore } from "@melodify/content-store";

import { logger } from "./logger";
import { catalogPorts } from "./ports";

export const contentStore = createContentStore();

export const connectivity = createConnectivity({
  network: expoNetworkAdapter,
  logger,
});

export const catalog = createCatalog({
  content: contentStore,
  connectivity,
  session: catalogPorts.session,
  search: catalogPorts.search,
  resolve: catalogPorts.resolve,
});
