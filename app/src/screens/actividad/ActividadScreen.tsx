/**
 * Contenedor de Actividad (BR23.5, BR24.1, BR24.3). No deriva nada: recibe la máquina de C8
 * ya construida, lee la red de la cáscara y entrega a la vista secciones ya
 * mapeadas y acciones ya resueltas. La vista sigue sin conocer C8, C3 ni C4.
 *
 * Las dependencias son opcionales mientras el punto de composición no entrega la
 * instancia única. Sin ella la pantalla se queda en carga —su estado honesto— en
 * vez de construir una segunda máquina con otro almacén y otra sesión.
 */
import { useGlobalServices } from "@melodify/app-shell";
import { useMemo } from "react";

import { logger } from "../../bootstrap/logger";
import { useActividad } from "../../state/useActividad";
import { useNetwork } from "../../state/useNetwork";
import type { ScreenDependencies } from "../dependencies";
import { toActividadSections } from "./activityModel";
import { ActividadView } from "./ActividadView";

export type ActividadScreenProps = ScreenDependencies;

const NO_ACTION = () => undefined;

export function ActividadScreen({ activity, log = logger }: ActividadScreenProps) {
  if (activity === undefined) {
    return (
      <ActividadView
        status="loading"
        sections={[]}
        online
        onOpenOpinion={NO_ACTION}
        onRetry={NO_ACTION}
        onCreate={NO_ACTION}
      />
    );
  }

  return <ActividadConnected activity={activity} log={log} />;
}

interface ActividadConnectedProps {
  activity: NonNullable<ScreenDependencies["activity"]>;
  log: NonNullable<ScreenDependencies["log"]>;
}

function ActividadConnected({ activity, log }: ActividadConnectedProps) {
  const { status, groups, retry } = useActividad(activity, log);
  const online = useNetwork();
  const global = useGlobalServices();
  const sections = useMemo(() => toActividadSections(groups), [groups]);

  return (
    <ActividadView
      status={status}
      sections={sections}
      online={online}
      onOpenOpinion={(opinionId) => global.openOpinionDetail({ opinionId })}
      onRetry={retry}
      onCreate={() => global.goToTab({ name: "crear" })}
    />
  );
}
