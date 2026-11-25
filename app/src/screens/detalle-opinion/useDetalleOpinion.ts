/**
 * El detalle de una opinión (F8): la opinión completa y la identidad de su obra.
 *
 * Se suscribe a C4 con el `viewerId` y, en cada emisión, lee la opinión con
 * `getOpinion`. Si la obra no está en el catálogo, no se pinta un error: la cabecera
 * usa el título y el artista que la propia opinión guarda y la portada cae al bloque
 * con la inicial (BR5.2). Un `404` de la opinión sí es un error de pantalla, pero
 * **no** se registra como `CONTENT_READ_FAILED`: no hay nada roto, el identificador
 * no existe. Un almacén que lanza sí se registra (NFR9.4).
 *
 * Las dependencias llegan como argumentos, igual que en `detalle-obra`: este hook no
 * importa ninguna instancia de la composición, así que la pantalla decide cuál usa y
 * la prueba puede pasar un C4 y un C5 reales sin doblar módulos (NFR1.8).
 *
 * La media y el recuento se calculan sobre las opiniones de la obra, una vez por
 * emisión; la portada se resuelve aparte por `(workId, catalogVersion, online)`
 * (NFR8.5).
 */
import type { Catalog, CoverDecision } from "@melodify/catalog";
import type { ContentStore, OpinionView } from "@melodify/content-store";
import { useCallback, useEffect, useMemo, useState } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { averageRating } from "../../state/ratings";
import { useCatalog } from "../../state/useCatalog";
import type { ContentStatus } from "../../state/useContent";

export interface DetalleOpinionState {
  status: ContentStatus;
  opinion: OpinionView | null;
  workTitle: string;
  workArtist: string;
  average: number;
  opinionCount: number;
  cover: CoverDecision;
  retry: () => void;
}

interface Snapshot {
  /** A qué opinión y a quién mira corresponde esta foto; si no coincide, está vieja. */
  key: string;
  status: ContentStatus;
  opinion: OpinionView | null;
  workTitle: string;
  workArtist: string;
  average: number;
  opinionCount: number;
}

const INITIAL_BLOCK: CoverDecision = { kind: "initialBlock", value: null };

function keyOf(
  opinionId: string,
  viewerId: string | null,
  attempt: number,
): string {
  return `${opinionId}|${viewerId ?? ""}|${attempt}`;
}

function loadingSnapshot(key: string): Snapshot {
  return {
    key,
    status: "loading",
    opinion: null,
    workTitle: "",
    workArtist: "",
    average: 0,
    opinionCount: 0,
  };
}

export function useDetalleOpinion(
  opinionId: string,
  viewerId: string | null,
  content: ContentStore,
  catalog: Catalog,
  online: boolean,
  log: AppLogger = logger,
): DetalleOpinionState {
  const [attempt, setAttempt] = useState(0);
  const key = keyOf(opinionId, viewerId, attempt);
  const [snapshot, setSnapshot] = useState<Snapshot>(() =>
    loadingSnapshot(key),
  );
  const catalogVersion = useCatalog(catalog);

  useEffect(() => {
    if (viewerId === null) {
      // Sin identidad no se lee: C4 respondería `422` y el error sería una mentira,
      // porque lo que falta es la sesión, no la opinión (BR4.6).
      return undefined;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const fail = (): void => {
      if (active) {
        setSnapshot({ ...loadingSnapshot(key), status: "error" });
      }
    };

    const apply = (): void => {
      const read = content.getOpinion({ opinionId, viewerId });

      if (!read.ok) {
        // El `404` es la degradación prevista; solo el resto se diagnostica.
        if (read.code !== 404) {
          log.error("CONTENT_READ_FAILED", read.message);
        }
        fail();
        return;
      }

      const opinion = read.value;
      const work = catalog.getWork(opinion.workId);
      const listed = content.listOpinions({ workId: opinion.workId, viewerId });

      if (active) {
        setSnapshot({
          key,
          status: "ready",
          opinion,
          workTitle: work.ok ? work.value.title : opinion.workTitle,
          workArtist: work.ok ? work.value.artist : opinion.workArtist,
          // Si el listado fallara, la media se calcula con la única valoración que
          // sí se pudo leer: la de esta opinión. BR5.4 pide la media de la obra, y
          // una media de un elemento es preferible a un hueco en la cabecera.
          average: averageRating(
            listed.ok ? listed.value.map((item) => item.rating) : [opinion.rating],
          ),
          opinionCount: catalog.countOpinions(opinion.workId).count,
        });
      }
    };

    try {
      const result = content.subscribeContent(viewerId, apply);

      if (result.ok) {
        unsubscribe = result.value;
      } else {
        log.error("CONTENT_READ_FAILED", result.message);
        fail();
      }
    } catch {
      log.error(
        "CONTENT_READ_FAILED",
        "la suscripción al contenido lanzó al abrir la opinión",
      );
      fail();
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [key, opinionId, viewerId, content, catalog, log]);

  // Si la foto no es de esta opinión y esta identidad, se pinta carga: es lo que
  // evita enseñar la opinión anterior durante un fotograma.
  const current = snapshot.key === key ? snapshot : loadingSnapshot(key);

  const workId = current.opinion?.workId ?? null;
  const cover = useMemo(
    () => (workId === null ? INITIAL_BLOCK : catalog.coverFor(workId)),
    // `catalogVersion` y `online` son la clave de la decisión de portada, no una
    // lectura: C5 recalcula con la red y avisa por `subscribe`, y sin las dos en la
    // clave la portada se quedaría con la decisión anterior (BR5.3, NFR8.5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, workId, catalogVersion, online],
  );

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return {
    status: current.status,
    opinion: current.opinion,
    workTitle: current.workTitle,
    workArtist: current.workArtist,
    average: current.average,
    opinionCount: current.opinionCount,
    cover,
    retry,
  };
}
