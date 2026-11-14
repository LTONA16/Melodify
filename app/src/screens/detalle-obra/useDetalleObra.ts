/**
 * Los datos del detalle de obra (BR8.1–BR8.8, NFR8.5): la identidad de la obra, sus
 * opiniones repartidas entre la propia y las ajenas, la media redondeada, el recuento
 * y la portada que decide C5.
 *
 * Por qué se suscribe a C4 en lugar de leer una vez: editar la opinión propia (U3) o
 * cualquier escritura futura tienen que verse aquí sin volver a montar la pantalla
 * (BR4.7). La primera emisión llega de forma síncrona, así que el paso de carga a
 * contenido no necesita temporizadores.
 *
 * La media se calcula sobre las valoraciones de las opiniones de la obra y se redondea
 * `.5` hacia arriba, como el resto de la app; el recuento sale de C5
 * (`countOpinions`), que es el que C4 cuenta en el instante de la llamada y no un
 * número guardado (BR5.4).
 *
 * `online` forma parte de la clave de la portada porque la decisión de C5 depende de
 * la red (BR5.3): cuando cambia la conexión hay que volver a preguntar aunque el
 * catálogo no haya cambiado.
 */
import type { Catalog, CoverDecision } from "@melodify/catalog";
import type { ContentStore, OpinionView } from "@melodify/content-store";
import type { OpinionCardModel } from "@melodify/design-system";
import { useCallback, useEffect, useMemo, useState } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import { toOpinionCardModel } from "../../state/opinionCardModel";
import { useCatalog } from "../../state/useCatalog";
import type { ContentStatus } from "../../state/useContent";

export interface DetalleObraWork {
  workId: string;
  title: string;
  artist: string;
}

export interface DetalleObraState {
  status: ContentStatus;
  /** La identidad, o `null` si ni siquiera la obra se pudo resolver (BR8.8). */
  work: DetalleObraWork | null;
  /** La opinión de quien mira, si existe: va primero y en estado `own` (BR8.4). */
  own: OpinionCardModel | null;
  others: OpinionCardModel[];
  /** Media de las valoraciones ya redondeada al entero; 0 sin opiniones. */
  average: number;
  opinionCount: number;
  cover: CoverDecision;
  retry: () => void;
}

interface Snapshot {
  /** A qué obra y a quién mira corresponde esta foto; si no coincide, está vieja. */
  key: string;
  status: ContentStatus;
  work: DetalleObraWork | null;
  opinions: OpinionView[];
  opinionCount: number;
}

function keyOf(
  workId: string,
  viewerId: string | null,
  attempt: number,
): string {
  return `${workId}|${viewerId ?? ""}|${attempt}`;
}

function loadingSnapshot(key: string): Snapshot {
  return {
    key,
    status: "loading",
    work: null,
    opinions: [],
    opinionCount: 0,
  };
}

export function useDetalleObra(
  workId: string,
  viewerId: string | null,
  content: ContentStore,
  catalog: Catalog,
  online: boolean,
  log: AppLogger = logger,
): DetalleObraState {
  const [attempt, setAttempt] = useState(0);
  const key = keyOf(workId, viewerId, attempt);
  const [snapshot, setSnapshot] = useState<Snapshot>(() =>
    loadingSnapshot(key),
  );
  const catalogVersion = useCatalog(catalog);

  useEffect(() => {
    if (viewerId === null) {
      // Sin identidad no se lee: C4 respondería `422` y el error sería una mentira,
      // porque lo que falta es la sesión (BR4.6). La foto vieja de otra identidad no
      // se pinta porque la clave ya no coincide.
      return undefined;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const fail = (code: "CONTENT_READ_FAILED" | "CONTENT_SUBSCRIBE_FAILED", message: string, work: DetalleObraWork | null): void => {
      log.error(code, message);
      if (active) {
        setSnapshot({ key, status: "error", work, opinions: [], opinionCount: 0 });
      }
    };

    const apply = (): void => {
      const work = catalog.getWork(workId);

      if (!work.ok) {
        fail("CONTENT_READ_FAILED", work.message, null);
        return;
      }

      const identity: DetalleObraWork = {
        workId,
        title: work.value.title,
        artist: work.value.artist,
      };
      const opinions = content.listOpinions({ workId, viewerId });

      if (!opinions.ok) {
        // BR8.8: si la identidad ya se puede pintar, se queda sobre el error.
        fail("CONTENT_READ_FAILED", opinions.message, identity);
        return;
      }

      if (active) {
        setSnapshot({
          key,
          status: "ready",
          work: identity,
          opinions: opinions.value,
          opinionCount: catalog.countOpinions(workId).count,
        });
      }
    };

    try {
      const result = content.subscribeContent(viewerId, apply);

      if (result.ok) {
        unsubscribe = result.value;
      } else {
        fail("CONTENT_SUBSCRIBE_FAILED", result.message, null);
      }
    } catch {
      fail(
        "CONTENT_SUBSCRIBE_FAILED",
        "la suscripción al contenido lanzó al establecerse",
        null,
      );
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [key, workId, viewerId, content, catalog, log]);

  // Si la foto no es de esta obra y esta identidad, se pinta carga: es lo que evita
  // enseñar las opiniones de la obra anterior durante un fotograma.
  const current = snapshot.key === key ? snapshot : loadingSnapshot(key);

  const cover = useMemo(
    () => catalog.coverFor(workId),
    // `catalogVersion` y `online` son la clave de la decisión de portada, no una
    // lectura: C5 recalcula con la red y avisa por `subscribe`, y sin las dos en la
    // clave la portada se quedaría con la decisión anterior (BR5.3, NFR8.5).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, workId, catalogVersion, online],
  );

  const { own, others } = useMemo(() => {
    const own: OpinionCardModel[] = [];
    const others: OpinionCardModel[] = [];

    for (const opinion of current.opinions) {
      const card = toOpinionCardModel({ opinion, cover });
      if (opinion.isOwn) {
        own.push(card);
      } else {
        others.push(card);
      }
    }

    // Solo puede haber una propia por obra (BR4.3); si hubiera más, la primera es la
    // que esta pantalla destaca.
    return { own: own[0] ?? null, others };
  }, [current.opinions, cover]);

  const average = useMemo(() => {
    if (current.opinions.length === 0) {
      return 0;
    }
    const total = current.opinions.reduce(
      (sum, opinion) => sum + opinion.rating,
      0,
    );
    return Math.round(total / current.opinions.length);
  }, [current.opinions]);

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return {
    status: current.status,
    work: current.work,
    own,
    others,
    average,
    opinionCount: current.opinionCount,
    cover,
    retry,
  };
}
