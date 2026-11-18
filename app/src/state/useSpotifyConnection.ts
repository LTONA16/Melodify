/**
 * El estado de conexión de Spotify tal como lo leen las pantallas (R-07).
 *
 * `null` significa «todavía no sabemos»: la hidratación del token es silenciosa y
 * la cáscara no debe pintar `disconnected` ni `connecting` durante ese tramo. En
 * cuanto llega la primera emisión, el estado es el real y ya no vuelve a `null`.
 *
 * Las acciones se delegan en `ShellServices.spotify`; este hook no conoce el
 * paquete de Spotify, sólo el contrato de C2.
 */
import { useShellServices, type SpotifyStatus } from "@melodify/app-shell";
import { useCallback, useEffect, useState } from "react";

export interface UseSpotifyConnectionResult {
  status: SpotifyStatus | null;
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
}

export function useSpotifyConnection(): UseSpotifyConnectionResult {
  const { spotify } = useShellServices();
  const [status, setStatus] = useState<SpotifyStatus | null>(null);

  useEffect(() => {
    return spotify.subscribe(setStatus);
  }, [spotify]);

  const connect = useCallback(() => {
    spotify.connect();
  }, [spotify]);

  const disconnect = useCallback(() => {
    spotify.disconnect();
  }, [spotify]);

  const retry = useCallback(() => {
    spotify.retry();
  }, [spotify]);

  return { status, connect, disconnect, retry };
}
