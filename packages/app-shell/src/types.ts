/**
 * Los tipos de C2: la cáscara, sus servicios y lo que cada pantalla declara al
 * registrarse. Nada de esto conoce C4, C5 ni C8; la cáscara recibe el estado de red
 * y de Spotify ya resuelto en `services`.
 */
import type { CommentModel, TabItem } from "@melodify/design-system";
import type { ComponentType } from "react";

export type TabName =
  | "inicio"
  | "explorar"
  | "crear"
  | "actividad"
  | "perfil";

export type SpotifyStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "connectionError"
  | "invalidToken"
  | "notConfigured";

export interface CommentSheetState {
  opinionId: string | null;
  comments: CommentModel[];
  status: "loading" | "ready" | "empty" | "error";
}

export interface ShellServices {
  network: {
    online: boolean;
    subscribe: (listener: (online: boolean) => void) => () => void;
  };
  spotify: {
    status: SpotifyStatus;
    subscribe: (listener: (status: SpotifyStatus) => void) => () => void;
    connect: () => void;
    disconnect: () => void;
    retry: () => void;
  };
  comments: {
    state: CommentSheetState;
    subscribe: (listener: (state: CommentSheetState) => void) => () => void;
    open: (opinionId: string) => void;
    close: () => void;
    retry: () => void;
    submit: (text: string) => void;
  };
}

/** Las pantallas no reciben props: leen de los contextos. */
export type ScreenProps = Record<string, never>;

export interface WorkDetailScreen {
  kind: "work";
  component: ComponentType<{ work: { workId: string } }>;
}

export interface OpinionDetailScreen {
  kind: "opinion";
  component: ComponentType<{ opinion: { opinionId: string } }>;
}

export type DetailScreen = WorkDetailScreen | OpinionDetailScreen;

export interface ScreenModule {
  name: string;
  title: string;
  component: ComponentType<ScreenProps>;
  details?: DetailScreen[];
}

export interface GlobalServices {
  showSnackbar: (input: { message: string }) => void;
  setHeader: (input: { title: string }) => void;
  openWorkDetail: (input: { workId: string }) => void;
  openOpinionDetail: (input: { opinionId: string }) => void;
  openCreate: (input?: { workId?: string }) => void;
  openEdit: (input: { opinionId: string }) => void;
  closeCreate: () => void;
  goToTab: (input: { name: TabName }) => void;
}

/** Lo que Crear y Editar leen para saber en qué modo y desde dónde se abrieron. */
export interface CreateEntry {
  mode: "create" | "edit";
  preselectedWorkId: string | null;
  editingOpinionId: string | null;
  returnTo: string | null;
}

export const DEFAULT_CREATE_ENTRY: CreateEntry = {
  mode: "create",
  preselectedWorkId: null,
  editingOpinionId: null,
  returnTo: null,
};

/** Los destinos de la barra, con el icono que les corresponde. */
export const TAB_ITEMS: TabItem[] = [
  { name: "inicio", label: "Inicio", icon: "home" },
  { name: "explorar", label: "Explorar", icon: "search" },
  { name: "crear", label: "Crear", icon: "plus" },
  { name: "actividad", label: "Actividad", icon: "activity" },
  { name: "perfil", label: "Perfil", icon: "profile" },
];
