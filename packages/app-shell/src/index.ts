/**
 * Superficie pública de `@melodify/app-shell` (C2 1.1.0): la cáscara, sus tipos y
 * los tres hooks de lectura.
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
