/**
 * Los tipos de C2 (1.3.0): la cáscara, sus servicios y lo que cada pantalla
 * declara al registrarse. Nada de esto conoce C4, C5 ni C8; la cáscara recibe el
 * estado de red, de Spotify y de la hoja ya resuelto en `services`.
 *
 * La 1.3.0 añade `CreateEntry.formKey`, los tres campos de `CommentSheetState`
 * (`failed`, `maxLength`, `counterFrom`) y amplía `comments.submit` para que
 * devuelva si la escritura salió bien. Ninguna exportación cambia de forma: quien
 * solo leía la versión anterior sigue compilando.
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
  /** Verdadero si el último envío falló; la lista leída no se borra por ello. */
  failed: boolean;
  /** El tope del comentario, que llega de C4 a través del controlador (TS-28). */
  maxLength: number;
  /** Desde cuántos caracteres se pinta el contador (BR14.5). */
  counterFrom: number;
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
    /**
     * Envía el comentario y dice si la escritura salió bien: la cáscara usa ese
     * resultado para pedir la confirmación sin que el controlador conozca el aviso.
     */
    submit: (text: string) => boolean;
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
  /**
   * Marca que sube en cada visita a Crear: la pantalla la observa para descartar
   * el borrador de la visita anterior sin que la cáscara guarde texto.
   */
  formKey: number;
}

export const DEFAULT_CREATE_ENTRY: CreateEntry = {
  mode: "create",
  preselectedWorkId: null,
  editingOpinionId: null,
  returnTo: null,
  formKey: 0,
};

/** Los destinos de la barra, con el icono que les corresponde. */
export const TAB_ITEMS: TabItem[] = [
  { name: "inicio", label: "Inicio", icon: "home" },
  { name: "explorar", label: "Explorar", icon: "search" },
  { name: "crear", label: "Crear", icon: "plus" },
  { name: "actividad", label: "Actividad", icon: "activity" },
  { name: "perfil", label: "Perfil", icon: "profile" },
];
