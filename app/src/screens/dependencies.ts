/**
 * Lo que un contenedor de pantalla necesita de la composición (NFR8.5, R-01).
 *
 * Las cuatro pantallas de esta unidad piden las mismas piezas —la sesión (C3), el
 * contenido (C4), el catálogo (C5) y el logger del proyecto— y esta es la única
 * declaración de esa forma: cuatro copias se desincronizarían en cuanto una unidad
 * siguiente añadiera una pieza.
 *
 * Son **opcionales a propósito** mientras el punto de composición
 * (`app/src/bootstrap/instances.ts`) no exista: `App.tsx` monta hoy las pantallas por
 * el registro de la cáscara, que no pasa props, y una pantalla que recibiera estas
 * piezas como obligatorias obligaría a construir instancias dentro de ella —dos
 * almacenes de contenido, dos catálogos— y rompería la invariante de instancia única.
 * Mientras falten, la pantalla se queda en carga en lugar de inventar una segunda.
 * La composición las pasa una vez, en el paso 29, y la pantalla deja de estar a medias.
 */
import type { AppSession } from "@melodify/app-session";
import type { Catalog } from "@melodify/catalog";
import type { ContentStore } from "@melodify/content-store";

import type { AppLogger } from "../bootstrap/logger";

export interface ScreenDependencies {
  /** La instancia única de sesión (`app/src/bootstrap/session.ts`). */
  session?: AppSession;
  /** La instancia única de contenido (C4). */
  content?: ContentStore;
  /** La instancia única de catálogo (C5). */
  catalog?: Catalog;
  /** El logger del proyecto; sin él se usa el de la app. */
  log?: AppLogger;
}
