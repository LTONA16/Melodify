/**
 * El catálogo de C5 1.2.0: las obras de ejemplo, la decisión de portada, el
 * recuento de opiniones por obra y los tres puertos de Spotify.
 *
 * Qué decide este paquete y qué no:
 * - **Portada** (BR18.1): solo es una URL real cuando hay sesión de Spotify, hay
 *   conexión y la obra tiene `coverUrl` o C5 consigue resolverla. En cualquier otro
 *   caso es el bloque con la inicial. Un `coverFor` con la obra pendiente devuelve
 *   el bloque de inmediato y dispara **una** resolución de fondo; al terminar,
 *   C5 emite para que las pantallas vuelvan a preguntar. La decisión nunca se
 *   guarda por obra: desconectar o perder la red cambia el resultado sin invalidar
 *   nada (BR18.4).
 * - **Recuento** (BR5.4): el «N opiniones» se cuenta sobre C4 en el instante de la
 *   llamada; el catálogo no guarda el número.
 * - **Búsqueda** (BR5.5): sin puerto responde `offline` sin tocar la red. Con
 *   puerto, normaliza el fallo de Spotify, guarda obras y artistas por consulta y
 *   registra solo las obras para que el detalle las encuentre (BR20.8).
 *
 * El catálogo no importa `@melodify/spotify` en ninguna forma: los tipos de los
 * puertos los declara él mismo y las implementaciones llegan inyectadas (BR5.6,
 * NFR3.11).
 */
import type { Connectivity } from "@melodify/connectivity";
import type { ContentStore } from "@melodify/content-store";

import type {
  ArtistHit,
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

export type SearchStatus = "ok" | "empty" | "offline" | "rateLimited" | "error";

/** `GET /works`: el estado de la búsqueda, sus obras y los artistas encontrados. */
export interface SearchResult {
  status: SearchStatus;
  works: WorkView[];
  artists?: ArtistHit[];
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
 * —`offline`—, `rateLimited` conserva su identidad para que la pantalla pueda decir
 * que es un límite temporal y ofrecer «Reintentar» —lo que ya prometía el `429` del
 * contrato—, y el resto de fallos son `error`. El error de Spotify nunca se propaga
 * (C5 § `x-ports`).
 */
function toSearchResult(result: SearchPortResult): SearchResult {
  if (result.kind === "ok") {
    return {
      status: "ok",
      works: result.works ?? [],
      artists: result.artists ?? [],
    };
  }
  if (result.kind === "empty") {
    return { status: "empty", works: [], artists: [] };
  }
  if (result.failure === "rateLimited") {
    return { status: "rateLimited", works: [], artists: [] };
  }
  return {
    status: result.failure === "network" ? "offline" : "error",
    works: [],
    artists: [],
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
  const pendingCovers = new Set<string>();

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
      workKind: current.workKind ?? resolved.workKind,
    };
    return changed;
  };

  /** La resolución exige sesión, red y un puerto; sin los tres no se toca la red. */
  const canResolveCover = (): boolean =>
    resolve !== null &&
    session?.isConnected() === true &&
    connectivity.getNetworkState().online;

  /**
   * Resuelve la portada de una obra pendiente y emite al terminar. El conjunto
   * `pendingCovers` es la garantía de una sola petición: dos `coverFor` en el
   * mismo tick ven la obra ya en vuelo y no la piden otra vez.
   */
  const resolveCover = async (workId: string): Promise<void> => {
    if (
      resolve === null ||
      pendingCovers.has(workId) ||
      !canResolveCover()
    ) {
      return;
    }

    const work = findWork(workId);
    if (work === undefined || work.coverUrl !== null) {
      return;
    }

    pendingCovers.add(workId);
    try {
      const resolved = await resolve.resolve(workId);
      if (resolved.kind === "ok" && isRecordableWork(resolved.work)) {
        const changed = mergeResolvedWork(resolved.work);
        const failureChanged = coverFailure;
        coverFailure = false;
        if (changed || failureChanged) {
          notify();
        }
      } else {
        if (!coverFailure) {
          coverFailure = true;
          notify();
        }
      }
    } catch {
      // Un fallo deja el bloque con la inicial y enciende el aviso de portadas
      // (BR18.5); no se propaga a la pantalla ni cambia la lista.
      if (!coverFailure) {
        coverFailure = true;
        notify();
      }
    } finally {
      pendingCovers.delete(workId);
    }
  };

  const retryPendingCovers = async (
    resolver: NonNullable<CatalogPorts["resolve"]>,
  ): Promise<void> => {
    const pending = works.filter((work) => work.coverUrl === null);
    let failed = false;
    let changed = false;

    for (const work of pending) {
      if (pendingCovers.has(work.workId)) {
        continue;
      }

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
      // C4 publica el recuento sin identidad (enmienda de U2 al contrato, C4
      // 1.1.0): contar con `listOpinions` obligaría a inventar un `viewerId`
      // para un dato que no depende de quién mira.
      return { workId, count: content.countOpinions(workId) };
    },

    coverFor(workId) {
      const work = findWork(workId);
      if (work === undefined || work.coverUrl === null) {
        // Con sesión y red, la obra sin portada se resuelve de fondo y esta
        // llamada devuelve ya el bloque; `notify` hará que se vuelva a preguntar.
        if (work !== undefined && canResolveCover()) {
          void resolveCover(workId);
        }
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
        return { status: "empty", works: [], artists: [] };
      }

      if (search === null || session?.isConnected() !== true) {
        // Sin puerto o sin sesión no hay red que tocar: es la invitación a
        // conectar de U4 (BR19.5). La sesión se consulta aquí, no en el puerto,
        // para que desconectar no convierta la falta de Spotify en un `error`.
        return { status: "offline", works: [], artists: [] };
      }

      const cached = searchCache.get(normalized);
      if (cached !== undefined) {
        return {
          status: cached.status,
          works: cached.works.map((work) => ({ ...work })),
          artists: (cached.artists ?? []).map((artist) => ({ ...artist })),
        };
      }

      let result: SearchResult;
      try {
        result = toSearchResult(await search.search(query));
      } catch {
        // Un puerto que lanza es un defecto suyo, no un fallo de Spotify: se
        // responde `error` y no se guarda, para que se pueda reintentar.
        return { status: "error", works: [], artists: [] };
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

      return {
        status: result.status,
        works: result.works.map((work) => ({ ...work })),
        artists: (result.artists ?? []).map((artist) => ({ ...artist })),
      };
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
