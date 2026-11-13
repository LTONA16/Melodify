/**
 * Los tres contextos de C2 y sus hooks de lectura. La cáscara los provee y las
 * pantallas los leen; fuera de la cáscara fallan con un mensaje en español en vez
 * de devolver un valor vacío que esconda un error de composición.
 */
import { createContext, useContext } from "react";

import type { CreateEntry, GlobalServices, ShellServices } from "./types";

export const ShellServicesContext = createContext<ShellServices | null>(null);
export const GlobalServicesContext = createContext<GlobalServices | null>(null);
export const CreateEntryContext = createContext<CreateEntry | null>(null);

export function useShellServices(): ShellServices {
  const services = useContext(ShellServicesContext);

  if (services === null) {
    throw new Error(
      "useShellServices debe usarse dentro de AppShell: falta el proveedor de servicios.",
    );
  }

  return services;
}

export function useGlobalServices(): GlobalServices {
  const services = useContext(GlobalServicesContext);

  if (services === null) {
    throw new Error(
      "useGlobalServices debe usarse dentro de AppShell: falta el proveedor de acciones globales.",
    );
  }

  return services;
}

export function useCreateEntry(): CreateEntry {
  const entry = useContext(CreateEntryContext);

  if (entry === null) {
    throw new Error(
      "useCreateEntry debe usarse dentro de AppShell: falta el proveedor de Crear.",
    );
  }

  return entry;
}
