/**
 * Máquina `ActivityFeed` (paso 10). Los dobles de C3 y C4 son locales: cuentan
 * suscripciones, lecturas y bajas, y pueden forzar los tres fallos de la lista.
 * El reloj se fija con Jest, no se lee el de la máquina.
 */
import type { ContentStore } from "@melodify/content-store";
import type { AppSession, GetSessionResult, SessionView } from "@melodify/app-session";
import { createActivity } from "../activity";
import type { ActivityFeed, ActivityView } from "../types";
import { createFixtureContentStore } from "./activity-fixture";

const NOW = "2026-11-19T12:00:00.000Z";

const SIGNED_IN: SessionView = {
  status: "signedIn",
  authorId: "demo",
  remembered: true,
};
const SIGNED_OUT: SessionView = {
  status: "signedOut",
  authorId: "demo",
  remembered: false,
};
const OTHER_ACCOUNT: SessionView = {
  status: "signedIn",
  authorId: "lucia",
  remembered: true,
};

interface HarnessOptions {
  seed?: "default" | "empty";
  session?: SessionView | null;
  sessionResult?: GetSessionResult | Promise<GetSessionResult>;
  failListOpinions?: boolean;
  failSubscribe?: boolean;
  throwOnDerive?: boolean;
}

function makeHarness(options: HarnessOptions = {}) {
  const store = createFixtureContentStore({ now: NOW, seed: options.seed });
  let listOpinionsReads = 0;
  let contentSubscriptions = 0;
  let contentUnsubscribes = 0;
  let sessionSubscriptions = 0;
  const contentListeners = new Set<() => void>();

  const content: ContentStore = {
    listOpinions(input) {
      listOpinionsReads += 1;
      if (options.throwOnDerive) {
        throw new Error("Fallo forzado en la derivación.");
      }
      if (options.failListOpinions) {
        return { ok: false, code: 422, message: "Fallo de C4." };
      }
      return store.listOpinions(input);
    },
    getOpinion: (input) => store.getOpinion(input),
    createOpinion: (input) => store.createOpinion(input),
    updateOpinion: (input) => store.updateOpinion(input),
    toggleLike: (input) => store.toggleLike(input),
    listLikes: (input) => store.listLikes(input),
    addComment: (input) => store.addComment(input),
    listComments: (input) => store.listComments(input),
    toggleFollow: (input) => store.toggleFollow(input),
    listFollowing: (input) => store.listFollowing(input),
    getAuthor: (input) => store.getAuthor(input),
    countOpinions: (workId) => store.countOpinions(workId),
    subscribeContent(viewerId, listener) {
      contentSubscriptions += 1;
      if (options.failSubscribe) {
        return { ok: false, code: 422, message: "No se pudo suscribir." };
      }

      const id = viewerId ?? "";
      const entry = () => {
        const result = store.listOpinions({ viewerId: id });
        listener({
          revision: store.countOpinions(id),
          opinions: result.ok ? result.value : [],
        });
      };
      contentListeners.add(entry);
      entry();

      return {
        ok: true,
        code: 200,
        value: () => {
          contentUnsubscribes += 1;
          contentListeners.delete(entry);
        },
      };
    },
  };

  let currentSession: SessionView | null = options.session ?? null;
  const sessionListeners = new Set<(session: SessionView) => void>();

  const getSession = async (): Promise<GetSessionResult> => {
    if (options.sessionResult !== undefined) {
      return options.sessionResult;
    }
    if (currentSession !== null) {
      return { code: 200, session: currentSession };
    }
    return { code: 200, session: SIGNED_OUT };
  };

  const session: AppSession = {
    getSession,
    async signIn() {
      return { code: 200, session: SIGNED_IN };
    },
    async signOut() {
      return { code: 204 };
    },
    subscribeSession(listener) {
      sessionSubscriptions += 1;
      sessionListeners.add(listener);

      if (currentSession !== null) {
        listener(currentSession);
      } else {
        void getSession().then((result) => {
          if (result.code === 200) {
            currentSession = result.session;
            sessionListeners.forEach((entry) => entry(result.session));
          }
        });
      }

      return () => {
        sessionListeners.delete(listener);
      };
    },
  };

  return {
    feed: createActivity({ content, session }),
    emitContent: () => contentListeners.forEach((listener) => listener()),
    emitSession: (view: SessionView) => {
      currentSession = view;
      sessionListeners.forEach((listener) => listener(view));
    },
    addOpinion: () =>
      store.createOpinion({
        authorId: "demo",
        workId: "work-nueva",
        workTitle: "Nueva canción",
        workArtist: "Artista nuevo",
        text: "Opinión recién publicada.",
        rating: 4,
      }),
    counts: {
      listOpinions: () => listOpinionsReads,
      contentSubscriptions: () => contentSubscriptions,
      contentUnsubscribes: () => contentUnsubscribes,
      sessionSubscriptions: () => sessionSubscriptions,
    },
  };
}

function flatIds(view: ActivityView): string[] {
  return (view.groups ?? []).flatMap((group) =>
    group.events.map((event) => event.eventId),
  );
}

function observe(feed: ActivityFeed) {
  const views: ActivityView[] = [];
  const detach = feed.subscribeActivity((view) => views.push(view));
  return { views, detach, last: () => views[views.length - 1] };
}

describe("createActivity", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("no lee ni se suscribe al construirse", () => {
    const harness = makeHarness();

    expect(harness.counts.listOpinions()).toBe(0);
    expect(harness.counts.contentSubscriptions()).toBe(0);
    expect(harness.counts.sessionSubscriptions()).toBe(0);
    expect(harness.feed.getActivity()).toBeDefined();
  });

  it("getActivity devuelve loading antes de la primera emisión y la suscripción lo emite", () => {
    const harness = makeHarness({
      session: null,
      sessionResult: new Promise<GetSessionResult>(() => undefined),
    });

    expect(harness.feed.getActivity()).toEqual({
      status: "loading",
      groups: [],
    });

    const observed = observe(harness.feed);
    expect(observed.views[0]).toEqual({ status: "loading", groups: [] });
    observed.detach();
  });

  it("con sesión demo, la primera emisión de C4 produce ready con ocho eventos", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const observed = observe(harness.feed);
    const last = observed.last();

    expect(last?.status).toBe("ready");
    expect(flatIds(last as ActivityView)).toHaveLength(8);
    expect(harness.counts.contentSubscriptions()).toBe(1);
    observed.detach();
  });

  it("sin eventos produce empty", () => {
    const harness = makeHarness({ session: SIGNED_IN, seed: "empty" });
    const observed = observe(harness.feed);

    expect(observed.last()).toEqual({ status: "empty", groups: [] });
    observed.detach();
  });

  it("sin sesión produce empty y no abre C4", () => {
    const harness = makeHarness({ session: SIGNED_OUT });
    const observed = observe(harness.feed);

    expect(observed.last()).toEqual({ status: "empty", groups: [] });
    expect(harness.counts.contentSubscriptions()).toBe(0);
    observed.detach();
  });

  it("una escritura posterior añade un evento sin perder los eventId existentes", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const observed = observe(harness.feed);
    const before = flatIds(observed.last() as ActivityView);

    expect(harness.addOpinion().ok).toBe(true);
    harness.emitContent();

    const after = flatIds(observed.last() as ActivityView);
    expect(after).toHaveLength(9);
    expect(after).toContain("own:op-011");
    for (const id of before) {
      expect(after).toContain(id);
    }
    observed.detach();
  });

  it("un fallo de listOpinions se traduce a error sin lanzar", () => {
    const harness = makeHarness({ session: SIGNED_IN, failListOpinions: true });
    const observed = observe(harness.feed);

    expect(observed.last()).toEqual({ status: "error", groups: [] });
    observed.detach();
  });

  it("un fallo de subscribeContent se traduce a error sin lanzar", () => {
    const harness = makeHarness({ session: SIGNED_IN, failSubscribe: true });
    const observed = observe(harness.feed);

    expect(observed.last()).toEqual({ status: "error", groups: [] });
    observed.detach();
  });

  it("una excepción en la derivación se traduce a error sin lanzar", () => {
    const harness = makeHarness({ session: SIGNED_IN, throwOnDerive: true });
    const observed = observe(harness.feed);

    expect(observed.last()).toEqual({ status: "error", groups: [] });
    observed.detach();
  });

  it("retry pasa por loading, vuelve a derivar y no duplica suscripciones", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const observed = observe(harness.feed);
    const beforeSubscriptions = harness.counts.contentSubscriptions();
    const beforeSession = harness.counts.sessionSubscriptions();
    const viewCount = observed.views.length;

    harness.feed.retryActivity();

    expect(observed.views[viewCount]).toEqual({ status: "loading", groups: [] });
    expect(observed.last()?.status).toBe("ready");
    expect(harness.counts.contentSubscriptions()).toBe(beforeSubscriptions);
    expect(harness.counts.sessionSubscriptions()).toBe(beforeSession);
    expect(harness.counts.contentUnsubscribes()).toBe(0);
    observed.detach();
  });

  it("cambiar de cuenta cierra la suscripción anterior y deriva con el nuevo viewerId", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const observed = observe(harness.feed);

    harness.emitSession(OTHER_ACCOUNT);

    expect(harness.counts.contentUnsubscribes()).toBe(1);
    expect(harness.counts.contentSubscriptions()).toBe(2);
    expect(flatIds(observed.last() as ActivityView)).toEqual([
      "like:op-002:bruno",
      "own:op-002",
      "own:op-007",
    ]);
    observed.detach();
  });

  it("un listener que lanza no impide que los demás reciban la vista", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const views: ActivityView[] = [];

    const detachBad = harness.feed.subscribeActivity(() => {
      throw new Error("Defecto del consumidor.");
    });
    const detachGood = harness.feed.subscribeActivity((view) => {
      views.push(view);
    });

    expect(views.length).toBeGreaterThan(0);
    expect(views[views.length - 1]?.status).toBe("ready");
    expect(harness.feed.getActivity().status).toBe("ready");
    detachGood();
    detachBad();
  });

  it("la baja del último observador cierra la suscripción a C4", () => {
    const harness = makeHarness({ session: SIGNED_IN });
    const observed = observe(harness.feed);

    expect(harness.counts.contentUnsubscribes()).toBe(0);
    observed.detach();
    expect(harness.counts.contentUnsubscribes()).toBe(1);
  });
});
