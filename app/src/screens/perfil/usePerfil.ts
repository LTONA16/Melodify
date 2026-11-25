/**
 * El perfil de quien usa la app (F10): identidad, contadores y opiniones propias.
 *
 * Se suscribe a C4 y, en cada emisión, lee el autor y sus seguimientos con C4 y las
 * opiniones propias ya ordenadas por C4 de la más reciente a la más antigua (BR9.3).
 * Sin `viewerId` no se llama a `getAuthor`: la pantalla sigue en `loading` hasta que
 * C3 emite, en lugar de pintar un error por algo que se resuelve solo (NFR1.4).
 *
 * Las dependencias llegan como argumentos: el hook no importa la composición, así que
 * la pantalla decide qué C4 usa y la prueba pasa un almacén real sin doblar módulos
 * (NFR1.8).
 *
 * Una lectura que falla se pinta con `ErrorState` y se registra con
 * `CONTENT_READ_FAILED`; el mensaje del almacén no llega a la pantalla (NFR9.4).
 */
import type { AuthorDetailView, ContentStore, OpinionView } from "@melodify/content-store";
import { useCallback, useEffect, useState } from "react";

import { logger, type AppLogger } from "../../bootstrap/logger";
import type { ContentStatus } from "../../state/useContent";

export interface PerfilState {
  status: ContentStatus;
  author: AuthorDetailView | null;
  opinions: OpinionView[];
  retry: () => void;
}

interface Snapshot {
  /** A quién mira esta foto; si la identidad cambia, la foto está vieja. */
  key: string;
  status: ContentStatus;
  author: AuthorDetailView | null;
  opinions: OpinionView[];
}

function keyOf(viewerId: string | null, attempt: number): string {
  return `${viewerId ?? ""}|${attempt}`;
}

function loadingSnapshot(key: string): Snapshot {
  return { key, status: "loading", author: null, opinions: [] };
}

export function usePerfil(
  viewerId: string | null,
  content: ContentStore,
  log: AppLogger = logger,
): PerfilState {
  const [attempt, setAttempt] = useState(0);
  const key = keyOf(viewerId, attempt);
  const [snapshot, setSnapshot] = useState<Snapshot>(() =>
    loadingSnapshot(key),
  );

  useEffect(() => {
    if (viewerId === null) {
      return undefined;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const fail = (message: string): void => {
      log.error("CONTENT_READ_FAILED", message);
      if (active) {
        setSnapshot({ ...loadingSnapshot(key), status: "error" });
      }
    };

    const apply = (): void => {
      const author = content.getAuthor({ authorId: viewerId, viewerId });

      if (!author.ok) {
        fail(author.message);
        return;
      }

      const following = content.listFollowing({
        authorId: viewerId,
        viewerId,
      });
      const listed = content.listOpinions({ viewerId, authorId: viewerId });

      if (!listed.ok) {
        fail(listed.message);
        return;
      }

      if (active) {
        setSnapshot({
          key,
          status: "ready",
          author: {
            ...author.value,
            followingCount: following.ok
              ? following.value.followingCount
              : author.value.followingCount,
          },
          opinions: listed.value,
        });
      }
    };

    try {
      const result = content.subscribeContent(viewerId, apply);

      if (result.ok) {
        unsubscribe = result.value;
      } else {
        fail(result.message);
      }
    } catch {
      fail("la suscripción al contenido lanzó al abrir el perfil");
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [key, viewerId, content, log]);

  const current = snapshot.key === key ? snapshot : loadingSnapshot(key);

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return {
    status: current.status,
    author: current.author,
    opinions: current.opinions,
    retry,
  };
}
