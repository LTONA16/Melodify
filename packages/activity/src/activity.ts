/**
 * La máquina de C8 1.1.0 (TS-40, NFR8.17). Guarda las dependencias y no hace
 * trabajo al construirse. `getActivity` es una lectura puntual que deriva sin
 * quedarse escuchando; la primera suscripción abre C3 y C4, y la baja del último
 * observador cierra ambas puertas. Toda derivación pasa por `deriveActivityEvents`
 * y `groupActivityEvents`, y cualquier fallo se convierte en una vista `error`
 * sin lanzar hacia quien llama ni registrar desde el paquete.
 */
import type { AppSession, SessionView } from "@melodify/app-session";
import type { ContentStore } from "@melodify/content-store";
import { deriveActivityEvents } from "./derive";
import { groupActivityEvents } from "./grouping";
import type { ActivityFeed, ActivityView } from "./types";

type ActivityListener = (view: ActivityView) => void;

export interface CreateActivityOptions {
  content: ContentStore;
  session: AppSession;
}

function loadingView(): ActivityView {
  return { status: "loading", groups: [] };
}

function emptyView(): ActivityView {
  return { status: "empty", groups: [] };
}

function errorView(): ActivityView {
  return { status: "error", groups: [] };
}

export function createActivity(options: CreateActivityOptions): ActivityFeed {
  const { content, session } = options;
  const listeners = new Set<ActivityListener>();

  let current: ActivityView = loadingView();
  let sessionView: SessionView | null = null;
  let identityPromise: Promise<void> | null = null;
  let detachSession: (() => void) | null = null;
  let detachContent: (() => void) | null = null;
  let contentViewerId: string | null = null;

  function notify(): void {
    // Un suscriptor que lanza es un defecto del consumidor, no de la derivación:
    // se aísla para que el resto reciba la misma vista (NFR1.17).
    for (const listener of [...listeners]) {
      try {
        listener(current);
      } catch {
        // Sin logger: el constructor de C8 no recibe puerto de diagnóstico.
      }
    }
  }

  function deriveForViewer(viewerId: string | null): void {
    if (viewerId === null) {
      current = emptyView();
      notify();
      return;
    }

    try {
      const derived = deriveActivityEvents({
        viewerId,
        now: new Date().toISOString(),
        listOpinions: (input) => content.listOpinions(input),
        listLikes: (input) => content.listLikes(input),
        listComments: (input) => content.listComments(input),
      });

      if (!derived.ok) {
        current = errorView();
      } else {
        const groups = groupActivityEvents(derived.events, derived.now);
        current = groups.length > 0 ? { status: "ready", groups } : emptyView();
      }
    } catch {
      current = errorView();
    }

    notify();
  }

  function closeContent(): void {
    if (detachContent !== null) {
      detachContent();
      detachContent = null;
    }
    contentViewerId = null;
  }

  function closeSession(): void {
    if (detachSession !== null) {
      detachSession();
      detachSession = null;
    }
  }

  function ensureContentSubscription(viewerId: string): void {
    if (detachContent !== null && contentViewerId === viewerId) {
      return;
    }

    closeContent();
    contentViewerId = viewerId;

    const result = content.subscribeContent(viewerId, () => {
      deriveForViewer(viewerId);
    });

    if (!result.ok) {
      contentViewerId = null;
      current = errorView();
      notify();
      return;
    }

    detachContent = result.value;
  }

  function handleSession(view: SessionView): void {
    sessionView = view;

    if (view.status === "signedOut") {
      closeContent();
      current = emptyView();
      notify();
      return;
    }

    if (contentViewerId !== view.authorId) {
      closeContent();
    }

    deriveForViewer(view.authorId);
    if (listeners.size > 0) {
      ensureContentSubscription(view.authorId);
    }
  }

  function ensureSessionSubscription(): void {
    if (detachSession !== null) {
      return;
    }

    detachSession = session.subscribeSession(handleSession);
  }

  function resolveSessionOnce(): void {
    if (sessionView !== null || identityPromise !== null) {
      return;
    }

    identityPromise = Promise.resolve(session.getSession())
      .then((result) => {
        identityPromise = null;
        if (result.code !== 200) {
          current = errorView();
          notify();
          return;
        }

        sessionView = result.session;
        deriveForViewer(
          result.session.status === "signedIn" ? result.session.authorId : null,
        );
      })
      .catch(() => {
        identityPromise = null;
        current = errorView();
        notify();
      });
  }

  function getActivity(): ActivityView {
    if (sessionView === null) {
      resolveSessionOnce();
    } else {
      deriveForViewer(
        sessionView.status === "signedIn" ? sessionView.authorId : null,
      );
    }
    return current;
  }

  function retryActivity(): ActivityView {
    current = loadingView();
    notify();

    if (listeners.size > 0) {
      ensureSessionSubscription();
      if (sessionView !== null) {
        handleSession(sessionView);
      }
    } else {
      resolveSessionOnce();
    }

    return current;
  }

  function subscribeActivity(listener: ActivityListener): () => void {
    listeners.add(listener);

    if (listeners.size === 1) {
      ensureSessionSubscription();
      if (sessionView !== null) {
        handleSession(sessionView);
      }
    }

    // La emisión inmediata al suscribirse también se aísla: un listener que
    // lanza aquí no debe impedir que quien suscribe reciba la baja.
    try {
      listener(current);
    } catch {
      // Sin logger: es un defecto del consumidor, no de la derivación.
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        closeContent();
        closeSession();
      }
    };
  }

  return { getActivity, retryActivity, subscribeActivity };
}
