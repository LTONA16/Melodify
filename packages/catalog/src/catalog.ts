/**
 * El catálogo de C5 1.1.0: las obras de ejemplo, la decisión de portada, el
 * recuento de opiniones por obra y los tres puertos de Spotify, que en esta unidad
 * viajan en `null`.
 *
 * Qué decide este paquete y qué no:
 * - **Portada** (BR5.3): solo es una URL real cuando hay sesión de Spotify, hay
 *   conexión y la obra tiene `coverUrl`. En cualquier otro caso es el bloque con la
 *   inicial. La decisión se recalcula en cada llamada y nunca se guarda por obra,
 *   para que desconectar o perder la red cambie el resultado sin invalidar nada.
 * - **Recuento** (BR5.4): el «N opiniones» se cuenta sobre C4 en el instante de la
 *   llamada; el catálogo no guarda el número.
 * - **Búsqueda** (BR5.5): sin puerto responde `offline` sin tocar la red. Con
 *   puerto, normaliza el fallo de Spotify y guarda el resultado por consulta.
 *
 * El catálogo no importa `@melodify/spotify` en ninguna forma: los tipos de los
 * puertos los declara él mismo y las implementaciones llegan inyectadas (BR5.6,
 * NFR3.11).
 */
import type { Connectivity } from "@melodify/connectivity";
import type { ContentStore } from "@melodify/content-store";

import type {
  CatalogPorts,
  ResolvePortResult,
  SearchPortResult,
  WorkView,
} from "./ports";
import { cloneSampleWorks } from "./sample";

/** Respuesta con código de C5: `200` con la obra o `404` si no está en el catálogo. */
export interface CatalogSuccess<T> {
  ok: true;
  code: 200;
  value: T;
}

export interface CatalogFailure {
  ok: false;
  code: 404;
  message: string;
}

export type CatalogResult<T> = CatalogSuccess<T> | CatalogFailure;

export type SearchStatus = "ok" | "empty" | "offline" | "error";

/** `GET /works`: el estado de la búsqueda y sus obras. */
export interface SearchResult {
  status: SearchStatus;
  works: WorkView[];
}

/** `GET /works/{workId}/opinion-count`. */
export interface WorkOpinionCount {
  workId: string;
  count: number;
}

/** `GET /cover`: la portada elegida y, si toca, la URL que la tarjeta puede pintar. */
export interface CoverDecision {
  kind: "url" | "initialBlock";
  value: string | null;
}

/** Lo que emite `subscribe`: el catálogo vigente y si la última resolución falló. */
export interface CatalogSnapshot {
  works: WorkView[];
  coverFailure: boolean;
}

export interface Catalog {
  listSampleWorks(): { works: WorkView[] };
  getWork(workId: string): CatalogResult<WorkView>;
  countOpinions(workId: string): WorkOpinionCount;
  coverFor(workId: string): CoverDecision;
  searchWorks(query: string): Promise<SearchResult>;
  subscribe(listener: (snapshot: CatalogSnapshot) => void): () => void;
  getCoverFailure(): boolean;
  retryCovers(): void;
}

export interface CreateCatalogOptions extends CatalogPorts {
  /** El contenido de C4: es la única fuente del recuento de opiniones (BR5.4). */
  content: ContentStore;
  /** La conectividad de C6: la portada real exige red (BR5.3). */
  connectivity: Connectivity;
}

const INITIAL_BLOCK: CoverDecision = { kind: "initialBlock", value: null };

function isRecordableWork(work: WorkView | undefined): work is WorkView {
  return work !== undefined && typeof work.workId === "string";
}

/**
 * Normaliza lo que devuelve el puerto de búsqueda. `network` es falta de cobertura
 * —`offline`— y el resto de fallos son `error`; el error de Spotify nunca se
 * propaga (C5 § `x-ports`).
 */
function toSearchResult(result: SearchPortResult): SearchResult {
  if (result.kind === "ok") {
    return { status: "ok", works: result.works ?? [] };
  }
  if (result.kind === "empty") {
    return { status: "empty", works: [] };
  }
  return {
    status: result.failure === "network" ? "offline" : "error",
    works: [],
  };
}

/**
 * La clave de la caché de búsquedas: la consulta normalizada. Sin esto, «Bad Guy» y
 * «bad guy  » serían dos peticiones a Spotify para el mismo resultado (BR5.5).
 */
function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

export function createCatalog(options: CreateCatalogOptions): Catalog {
  const { content, connectivity, session, search, resolve } = options;

  const works: WorkView[] = cloneSampleWorks();
  const searchCache = new Map<string, SearchResult>();
  const listeners = new Set<(snapshot: CatalogSnapshot) => void>();

  let coverFailure = false;

  const findWork = (workId: string): WorkView | undefined =>
    works.find((work) => work.workId === workId);

  const snapshot = (): CatalogSnapshot => ({
    works: works.map((work) => ({ ...work })),
    coverFailure,
  });

  const notify = (): void => {
    for (const listener of [...listeners]) {
      listener(snapshot());
    }
  };

  /**
   * Registra una obra que llegó por búsqueda para que `getWork` pueda resolverla.
   * Las de origen `sample` no se duplican: ya están en el catálogo.
   */
  const registerSearchedWork = (work: WorkView): boolean => {
    if (findWork(work.workId) !== undefined) {
      return false;
    }
    works.push({ ...work });
    return true;
  };

  /**
   * Aplica el resultado de resolver una obra. Se conservan `workId` y `origin`
   * —la pieza entró al catálogo como de ejemplo y sigue siéndolo— y se toman el
   * título, el artista y la portada que resolvió Spotify.
   */
  const mergeResolvedWork = (resolved: WorkView): boolean => {
    const index = works.findIndex((work) => work.workId === resolved.workId);
    if (index < 0) {
      works.push({ ...resolved });
      return true;
    }
    const current = works[index];
    if (current === undefined) {
      return false;
    }
    const changed = current.coverUrl !== resolved.coverUrl;
    works[index] = {
      ...current,
      title: resolved.title,
      artist: resolved.artist,
      coverUrl: resolved.coverUrl,
    };
    return changed;
  };

  const retryPendingCovers = async (
    resolver: NonNullable<CatalogPorts["resolve"]>,
  ): Promise<void> => {
    const pending = works.filter((work) => work.coverUrl === null);
    let failed = false;
    let changed = false;

    for (const work of pending) {
      let resolved: ResolvePortResult;
      try {
        resolved = await resolver.resolve(work.workId);
      } catch {
        // El puerto no propaga sus errores: una obra que no se resuelve cae al
        // bloque con la inicial y enciende el aviso de portadas (BR7.5).
        failed = true;
        continue;
      }

      if (resolved.kind === "ok" && isRecordableWork(resolved.work)) {
        if (mergeResolvedWork(resolved.work)) {
          changed = true;
        }
      } else {
        failed = true;
      }
    }

    const failureChanged = coverFailure !== failed;
    coverFailure = failed;

    if (changed || failureChanged) {
      notify();
    }
  };

  return {
    listSampleWorks() {
      return {
        works: works
          .filter((work) => work.origin === "sample")
          .map((work) => ({ ...work })),
      };
    },

    getWork(workId) {
      const work = findWork(workId);
      if (work === undefined) {
        return { ok: false, code: 404, message: "La obra no está en el catálogo." };
      }
      return { ok: true, code: 200, value: { ...work } };
    },

    countOpinions(workId) {
      return { workId, count: content.countOpinions(workId) };
    },

    coverFor(workId) {
      const work = findWork(workId);
      if (work === undefined || work.coverUrl === null) {
        return { ...INITIAL_BLOCK };
      }

      const connected = session?.isConnected() === true;
      const online = connectivity.getNetworkState().online;

      if (connected && online) {
        return { kind: "url", value: work.coverUrl };
      }
      return { ...INITIAL_BLOCK };
    },

    async searchWorks(query) {
      const normalized = normalizeQuery(query);
      // El contrato pide dos caracteres como mínimo: una consulta más corta no
      // busca nada, y devolverla vacía evita una petición que no puede acertar.
      if (normalized.length < 2) {
        return { status: "empty", works: [] };
      }

      if (search === null) {
        // Sin puerto no hay red que tocar: es la invitación a conectar de U4.
        return { status: "offline", works: [] };
      }

      const cached = searchCache.get(normalized);
      if (cached !== undefined) {
        return { status: cached.status, works: cached.works.map((work) => ({ ...work })) };
      }

      let result: SearchResult;
      try {
        result = toSearchResult(await search.search(query));
      } catch {
        // Un puerto que lanza es un defecto suyo, no un fallo de Spotify: se
        // responde `error` y no se guarda, para que se pueda reintentar.
        return { status: "error", works: [] };
      }

      if (result.status === "ok") {
        // Solo se cachea lo que se encontró: un `offline` o un `error` guardado
        // dejaría la búsqueda condenada hasta reiniciar la app (BR5.5).
        searchCache.set(normalized, result);
        let added = false;
        for (const work of result.works) {
          if (registerSearchedWork(work)) {
            added = true;
          }
        }
        if (added) {
          notify();
        }
      }

      return { status: result.status, works: result.works.map((work) => ({ ...work })) };
    },

    subscribe(listener) {
      listeners.add(listener);
      // Emisión inmediata: es lo que hace que las pantallas repinten portadas sin
      // volver a preguntar, y sin ella se quedarían con el primer dibujo (LC-9).
      listener(snapshot());
      return () => {
        listeners.delete(listener);
      };
    },

    getCoverFailure() {
      return coverFailure;
    },

    retryCovers() {
      if (resolve === null) {
        // Sin puerto de resolución no hay nada que reintentar (NFR3.11).
        return;
      }
      void retryPendingCovers(resolve);
    },
  };
}
