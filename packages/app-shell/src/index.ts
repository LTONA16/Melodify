/**
 * Superficie pública de `@melodify/app-shell` (C2 1.4.0): la cáscara, sus tipos y
 * los tres hooks de lectura. La 1.4.0 es aditiva: la ruta de obra y Crear pueden
 * llevar la `WorkView` ya resuelta, y `SpotifyStatus` es el estado que posee C1.
 */
export { AppShell } from "./AppShell";
export type { AppShellProps } from "./AppShell";
export {
  CreateEntryContext,
  GlobalServicesContext,
  ShellServicesContext,
  useCreateEntry,
  useGlobalServices,
  useShellServices,
} from "./contexts";
export { DEFAULT_CREATE_ENTRY, TAB_ITEMS } from "./types";
export type {
  CommentSheetState,
  CreateEntry,
  DetailScreen,
  GlobalServices,
  OpinionDetailScreen,
  ScreenModule,
  ScreenProps,
  ShellServices,
  SpotifyStatus,
  TabName,
  WorkDetailScreen,
} from "./types";
