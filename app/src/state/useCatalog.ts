/**
 * Un contador de cambios del catálogo (NFR8.5): sube cada vez que C5 cambia —una
 * portada resuelta, una obra nueva de una búsqueda— para que las tarjetas se
 * repinten con la decisión vigente.
 *
 * Por qué un contador y no el catálogo en el estado: guardar las obras copiaría en
 * cada pantalla lo que ya vive en una instancia estable y volvería a mapear lo que
 * no cambió. Con el número en las dependencias de un `useMemo`, el mapeo se rehace
 * solo cuando de verdad hay algo nuevo (§ NFR8.5 de `performance-requirements.md`).
 *
 * La primera emisión no cuenta: `subscribe` emite al establecerse y ese primer aviso
 * no es un cambio, es el estado que las tarjetas ya pintaron al montarse (LC-9).
 */
import type { Catalog } from "@melodify/catalog";
import { useEffect, useState } from "react";

export function useCatalog(catalog: Catalog): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let primed = false;

    const unsubscribe = catalog.subscribe(() => {
      if (!primed) {
        primed = true;
        return;
      }
      setVersion((previous) => previous + 1);
    });

    return unsubscribe;
  }, [catalog]);

  return version;
}
