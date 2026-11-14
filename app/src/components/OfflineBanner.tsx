/**
 * El aviso de sin conexión (BR10.5), uno solo para las cuatro pantallas: mismo
 * texto, mismo reintento, misma altura. Vive en la app y no en C1 porque su texto
 * es de esta versión y su acción pide reintentar la resolución de portadas, dos
 * cosas que el sistema de diseño no tiene por qué conocer.
 *
 * Sustituye al `Banner` de C1 en lugar de envolverlo con otro componente: así el
 * texto exacto se escribe una vez y no hay forma de pintar un aviso distinto en una
 * pantalla y otro en otra.
 */
import { Banner } from "@melodify/design-system";

export const OFFLINE_MESSAGE =
  "Sin conexión. Estás viendo lo último que cargamos.";

export interface OfflineBannerProps {
  /** Reintenta la resolución de portadas; el aviso solo se va cuando vuelve la red. */
  onRetry: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
  return (
    <Banner
      message={OFFLINE_MESSAGE}
      actionLabel="Reintentar"
      onAction={onRetry}
    />
  );
}
