import { act, fireEvent, render, screen } from "@testing-library/react-native";
import {
  GlobalServicesContext,
  ShellServicesContext,
  type GlobalServices,
  type ShellServices,
} from "@melodify/app-shell";
import { createActivity, type ActivityFeed, type ActivityView } from "@melodify/activity";
import type { AppSession, SessionView } from "@melodify/app-session";
import { createContentStore } from "@melodify/content-store";
import { ThemeProvider } from "@melodify/design-system";

import type { AppLogger } from "../../../bootstrap/logger";
import { ActividadScreen } from "../ActividadScreen";

/**
 * Integración ligera de Actividad (BR23.5, BR24.1, BR24.3): C8 se construye con un C4 real
 * sembrado y la sesión/red/acciones globales son dobles, porque son fronteras de
 * otras unidades. Lo que se comprueba es el cableado y la navegación; la pintura ya
 * la cubre `actividad-view.test.tsx`.
 */
const NOW = "2026-11-19T12:00:00.000Z";
const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: "demo",
  remembered: true,
};

function silentLogger(): AppLogger {
  return { warn: jest.fn(), error: jest.fn() };
}

function sessionDouble(view: SessionView = SIGNED_IN): AppSession {
  return {
    getSession: jest.fn(async () => ({ code: 200 as const, session: view })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    subscribeSession: jest.fn((listener: (next: SessionView) => void) => {
      listener(view);
      return () => undefined;
    }),
  } as unknown as AppSession;
}

function networkDouble(initial: boolean) {
  let online = initial;
  const listeners = new Set<(next: boolean) => void>();

  function subscribe(listener: (next: boolean) => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    subscribe,
    set(next: boolean) {
      online = next;
      for (const listener of [...listeners]) {
        listener(next);
      }
    },
    shell: {
      get online() {
        return online;
      },
      subscribe,
    },
  };
}

function setup(options: { signedIn?: boolean; online?: boolean } = {}) {
  const network = networkDouble(options.online ?? true);
  const global: GlobalServices = {
    showSnackbar: jest.fn(),
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
  };
  const services: ShellServices = {
    network: network.shell,
    spotify: {
      status: "disconnected",
      subscribe: () => () => undefined,
      connect: () => undefined,
      disconnect: () => undefined,
      retry: () => undefined,
    },
    comments: {
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: () => () => undefined,
      open: () => undefined,
      close: () => undefined,
      retry: () => undefined,
      submit: () => false,
    },
  };
  const session = sessionDouble(
    options.signedIn === false
      ? { status: "signedOut", authorId: "demo", remembered: false }
      : SIGNED_IN,
  );
  const content = createContentStore({ now: NOW });
  const activity = createActivity({ content, session });
  const log = silentLogger();

  const result = render(
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={services}>
        <GlobalServicesContext.Provider value={global}>
          <ActividadScreen activity={activity} log={log} />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>,
  );

  return { ...result, activity, global, log, network };
}

interface FeedDouble {
  feed: ActivityFeed;
  retry: jest.Mock;
}

function activityDouble(initial: ActivityView): FeedDouble {
  const listeners: ((view: ActivityView) => void)[] = [];
  const retry = jest.fn(() => {
    for (const listener of [...listeners]) {
      listener(initial);
    }
  });

  const feed = {
    getActivity: jest.fn(() => initial),
    retryActivity: retry,
    subscribeActivity: jest.fn((listener: (view: ActivityView) => void) => {
      listeners.push(listener);
      listener(initial);
      return () => undefined;
    }),
  } as unknown as ActivityFeed;

  return { feed, retry };
}

function renderWithFeed(feed: ActivityFeed, network = networkDouble(true)) {
  const global: GlobalServices = {
    showSnackbar: jest.fn(),
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit: jest.fn(),
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
  };
  const services: ShellServices = {
    network: network.shell,
    spotify: {
      status: "disconnected",
      subscribe: () => () => undefined,
      connect: () => undefined,
      disconnect: () => undefined,
      retry: () => undefined,
    },
    comments: {
      state: {
        opinionId: null,
        comments: [],
        status: "empty",
        failed: false,
        maxLength: 300,
        counterFrom: 250,
      },
      subscribe: () => () => undefined,
      open: () => undefined,
      close: () => undefined,
      retry: () => undefined,
      submit: () => false,
    },
  };

  render(
    <ThemeProvider scheme="light">
      <ShellServicesContext.Provider value={services}>
        <GlobalServicesContext.Provider value={global}>
          <ActividadScreen activity={feed} log={silentLogger()} />
        </GlobalServicesContext.Provider>
      </ShellServicesContext.Provider>
    </ThemeProvider>,
  );

  return { global, network };
}

describe("ActividadScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("muestra los ocho eventos y cinco días que deriva C8 de la siembra", () => {
    setup();

    expect(screen.getAllByTestId(/^activity-row-(?:own|like|comment):/)).toHaveLength(8);
    expect(screen.getAllByTestId("actividad-section-header")).toHaveLength(5);
    expect(screen.queryByTestId("actividad-placeholder")).toBeNull();
  });

  it("abrir una fila lleva a la opinión dueña del evento", () => {
    const view = setup();

    fireEvent.press(screen.getByTestId("activity-row-comment:cm-002"));

    expect(view.global.openOpinionDetail).toHaveBeenCalledTimes(1);
    expect(view.global.openOpinionDetail).toHaveBeenCalledWith({
      opinionId: "op-004",
    });
  });

  it("sin sesión muestra el vacío y «Crear opinión» lleva a Crear", () => {
    const view = setup({ signedIn: false });

    expect(screen.getByText("Todavía no hay actividad.")).toBeVisible();

    fireEvent.press(screen.getByTestId("empty-state-action"));

    expect(view.global.goToTab).toHaveBeenCalledWith({ name: "crear" });
  });

  it("«Reintentar» delega en C8 sin reconstruir la máquina", () => {
    const double = activityDouble({ status: "error", groups: [] });

    renderWithFeed(double.feed);

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(double.retry).toHaveBeenCalledTimes(1);
  });

  it("un cambio de red añade el aviso sin borrar la lista", () => {
    const view = setup();
    expect(screen.getAllByTestId(/^activity-row-(?:own|like|comment):/)).toHaveLength(8);

    act(() => {
      view.network.set(false);
    });

    expect(
      screen.getByText("Sin conexión. Estás viendo lo último que cargamos."),
    ).toBeVisible();
    expect(screen.getAllByTestId(/^activity-row-(?:own|like|comment):/)).toHaveLength(8);
  });

  it("sin la instancia de C8 se queda en carga en vez de construir otra", () => {
    render(
      <ThemeProvider scheme="light">
        <ActividadScreen />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("actividad-loading")).toBeTruthy();
    expect(screen.queryByTestId(/^activity-row-/)).toBeNull();
  });
});
