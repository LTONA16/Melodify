/**
 * El contenido que ve la pantalla (NFR8.4): se suscribe a C4 y traduce la
 * suscripción a los tres estados que las vistas entienden.
 *
 * Por qué la suscripción y no una lectura suelta: C4 emite al establecerse y
 * después de cada escritura, así que el feed se entera de una opinión nueva sin que
 * nadie vuelva a preguntar (BR4.7). La primera emisión llega de forma síncrona, así
 * que el paso de `loading` a `ready` no necesita temporizadores ni un fotograma de
 * espera artificial.
 *
 * `retry` existe porque «Reintentar» es el único texto de acción de los errores
 * (BR10.4): vuelve a suscribirse desde cero, con `loading` por delante, en lugar de
 * dar por buena la suscripción que falló.
 */
import type {
  ContentSnapshot,
  ContentStore,
  OpinionView,
} from "@melodify/content-store";
import { useCallback, useEffect, useState } from "react";

import { logger, type AppLogger } from "../bootstrap/logger";

export type ContentStatus = "loading" | "ready" | "error";

export interface ContentState {
  status: ContentStatus;
  opinions: OpinionView[];
  revision: number;
  retry: () => void;
}

interface Snapshot {
  status: ContentStatus;
  opinions: OpinionView[];
  revision: number;
}

const LOADING: Snapshot = { status: "loading", opinions: [], revision: 0 };

/**
 * El almacén llega por argumento —y no de un import— porque la instancia única la
 * construye el punto de composición (`app/src/bootstrap/instances.ts`, R-01); este
 * hook no puede crear una segunda.
 */
export function useContent(
  viewerId: string | null,
  content: ContentStore,
  log: AppLogger = logger,
): ContentState {
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot>(LOADING);

  useEffect(() => {
    if (viewerId === null) {
      // Sin identidad no se suscribe: C4 respondería `422` y el error sería una
      // mentira, porque lo que falta es la sesión, no el contenido (BR4.6).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSnapshot(LOADING);
      return undefined;
    }

    let active = true;
    // Reintentar vuelve a empezar por `loading`; la suscripción emite de forma
    // síncrona, así que no hay fotograma de espera artificial.
    setSnapshot(LOADING);

    const apply = (next: ContentSnapshot): void => {
      if (!active) {
        return;
      }
      setSnapshot({
        status: "ready",
        opinions: next.opinions,
        revision: next.revision,
      });
    };

    const fail = (message: string): void => {
      log.error("CONTENT_SUBSCRIBE_FAILED", message);
      if (active) {
        setSnapshot({ status: "error", opinions: [], revision: 0 });
      }
    };

    let unsubscribe: (() => void) | null = null;

    try {
      const result = content.subscribeContent(viewerId, apply);

      if (!result.ok) {
        fail(result.message);
        return undefined;
      }
      unsubscribe = result.value;
    } catch {
      fail("la suscripción al contenido lanzó al establecerse");
      return undefined;
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [viewerId, content, attempt, log]);

  const retry = useCallback(() => {
    setAttempt((previous) => previous + 1);
  }, []);

  return { ...snapshot, retry };
}
