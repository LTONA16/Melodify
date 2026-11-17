/**
 * El aviso de sin conexión (BR10.5), uno solo para las pantallas: mismo texto,
 * mismo reintento, misma altura. Vive en la app y no en C1 porque su texto es de
 * esta versión y su acción pide reintentar la resolución de portadas, dos cosas
 * que el sistema de diseño no tiene por qué conocer.
 *
 * Sustituye al `Banner` de C1 en lugar de envolverlo con otro componente: así el
 * texto exacto se escribe una vez y no hay forma de pintar un aviso distinto en
 * una pantalla y otro en otra.
 *
 * U3 lo abre en dos props opcionales: `message` para el texto de Crear —«puedes
 * opinar sobre las obras de ejemplo»— y `onRetry` opcional para el mismo aviso
 * sin acción. Sin `onRetry`, el banner se pinta solo con el texto.
 */
import { Banner } from "@melodify/design-system";

export const OFFLINE_MESSAGE =
  "Sin conexión. Estás viendo lo último que cargamos.";

export interface OfflineBannerProps {
  /** Reintenta la resolución de portadas; el aviso solo se va cuando vuelve la red. */
  onRetry?: () => void;
  /** Texto del aviso; por defecto, el de las cuatro pantallas. */
  message?: string;
}

export function OfflineBanner({
  onRetry,
  message = OFFLINE_MESSAGE,
}: OfflineBannerProps) {
  return (
    <Banner
      message={message}
      actionLabel={onRetry === undefined ? undefined : "Reintentar"}
      onAction={onRetry}
    />
  );
}
