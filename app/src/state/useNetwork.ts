/**
 * Si hay red (BR6.4): lee el estado de la cáscara y se suscribe a sus cambios.
 *
 * La fuente es `shellServices.network` y no C6 directamente, porque la cáscara ya
 * cablea la instancia de conectividad una sola vez y todas las pantallas deben leer
 * el mismo valor; un contexto propio daría dos respuestas a la misma pregunta.
 *
 * El valor inicial sale del servicio y no de `true`: sin conexión al arrancar, la
 * primera pintura ya trae el aviso en lugar de aparecer un fotograma después.
 */
import { useShellServices } from "@melodify/app-shell";
import { useEffect, useState } from "react";

export function useNetwork(): boolean {
  const services = useShellServices();
  const [online, setOnline] = useState(services.network.online);

  useEffect(() => {
    // El servicio puede cambiar de valor entre el render y la suscripción; sin
    // esta lectura se perdería el cambio ocurrido en ese hueco.
    setOnline(services.network.online);

    return services.network.subscribe((next) => setOnline(next));
  }, [services]);

  return online;
}
