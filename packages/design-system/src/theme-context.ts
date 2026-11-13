/**
 * El contexto del tema activo. Vive en su propio archivo para que el proveedor y
 * el hook se importen sin ciclo, y para que `useTheme` sea el único acceso: ningún
 * componente lee el contexto por su cuenta.
 */
import { createContext } from "react";

import type { Theme } from "./themes";

export const ThemeContext = createContext<Theme | null>(null);
