/**
 * Acceso al tema activo. Es el único camino a los tokens: si se usa fuera del
 * proveedor falla con un mensaje en español que dice qué falta, en vez de
 * devolver un tema inventado y pintar la app con colores que nadie eligió.
 */
import { useContext } from "react";

import { ThemeContext } from "./theme-context";
import type { Theme } from "./themes";

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);

  if (theme === null) {
    throw new Error(
      "useTheme debe usarse dentro de ThemeProvider: falta el proveedor del tema.",
    );
  }

  return theme;
}
