/**
 * El proveedor del tema (C1). Sigue al sistema con `useColorScheme()`: `dark` usa
 * la paleta oscura, y `light` o `null` usan la clara. No hay selector manual ni
 * persistencia (NFR6.3, BR2.5).
 *
 * La prop `scheme` existe en el contrato para poder fijar un esquema sin cambiar
 * el sistema —lo usan las pruebas—; por defecto es `system`.
 */
import { useColorScheme } from "react-native";
import type { ReactNode } from "react";

import { ThemeContext } from "./theme-context";
import { darkTheme, lightTheme } from "./themes";

export type ThemeScheme = "light" | "dark" | "system";

export interface ThemeProviderProps {
  children: ReactNode;
  scheme?: ThemeScheme;
}

export function ThemeProvider({
  children,
  scheme = "system",
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolved =
    scheme === "system" ? (systemScheme === "dark" ? "dark" : "light") : scheme;

  return (
    <ThemeContext.Provider value={resolved === "dark" ? darkTheme : lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
