/**
 * Puente entre C8 y la vista de Actividad (NFR8.16, NFR9.8, BR23.1–BR23.5): traduce la
 * suscripción a los cuatro estados que la pantalla pinta y guarda el aviso de red
 * aparte. C8 sigue siendo el dueño de la derivación; este hook no la repite.
 *
 * El error se registra una vez por intento: C8 puede emitir `error` más de una vez
 * mientras falla el mismo intento (derivación y siguiente emisión de C4), y un log
 * por emisión llenaría la consola con el mismo defecto. `retryActivity` emite
 * `loading` antes de volver a intentar, y ese cambio rearma el registro.
 */
import type {
  ActivityFeed,
  ActivityGroupView,
  ActivityStatus,
  ActivityView,
} from "@melodify/activity";
import { useCallback, useEffect, useRef, useState } from "react";

import { logger, type AppLogger } from "../bootstrap/logger";

export type ActividadStatus = ActivityStatus;

export interface ActividadState {
  status: ActividadStatus;
  groups: ActivityGroupView[];
  retry: () => void;
}

interface Snapshot {
  status: ActividadStatus;
  groups: ActivityGroupView[];
}

const LOADING: Snapshot = { status: "loading", groups: [] };

export function useActividad(
  activity: ActivityFeed,
  log: AppLogger = logger,
): ActividadState {
  const [snapshot, setSnapshot] = useState<Snapshot>(LOADING);
  const lastStatus = useRef<ActividadStatus>("loading");

  useEffect(() => {
    let active = true;
    lastStatus.current = "loading";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshot(LOADING);

    const apply = (view: ActivityView): void => {
      if (!active) {
        return;
      }

      if (view.status === "error" && lastStatus.current !== "error") {
        // Texto fijo y sin contexto: ni títulos, ni ids, ni handles, ni códigos C4.
        log.error("ACTIVITY_LOAD_FAILED", "No se pudo derivar la actividad");
      }
      lastStatus.current = view.status;
      setSnapshot({ status: view.status, groups: view.groups ?? [] });
    };

    const unsubscribe = activity.subscribeActivity(apply);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [activity, log]);

  const retry = useCallback(() => {
    activity.retryActivity();
  }, [activity]);

  return { ...snapshot, retry };
}
