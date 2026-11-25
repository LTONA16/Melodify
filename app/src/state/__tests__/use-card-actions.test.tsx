/**
 * `useCardActions` (paso 17 del plan): el paquete de acciones de una tarjeta, con
 * los textos exactos de § Textos exactos y los cuatro caminos de F19/F20.
 *
 * El doble de C4 solo devuelve resultados: la tarjeta se repinta por la emisión del
 * almacén, y lo que se comprueba aquí es que la escritura se pide con la identidad
 * derivada, que el fallo deja el estado igual y pide el aviso correcto, y que la
 * opinión propia no ofrece «me gusta» ni «seguir».
 */
import {
  GlobalServicesContext,
  ShellServicesContext,
  type GlobalServices,
  type ShellServices,
} from "@melodify/app-shell";
import type {
  ContentResult,
  ContentStore,
  OpinionView,
  ToggleFollowResult,
  ToggleLikeResult,
} from "@melodify/content-store";
import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

import {
  FOLLOW_FAILED_MESSAGE,
  LIKE_FAILED_MESSAGE,
  useCardActions,
} from "../useCardActions";

const VIEWER = "demo";
const AUTHOR = "ana";

function opinionFixture(overrides: Partial<OpinionView> = {}): OpinionView {
  return {
    opinionId: "op-1",
    workId: "work-1",
    workTitle: "Cielo de Neón",
    workArtist: "Aurora Vega",
    author: {
      authorId: AUTHOR,
      displayName: "Ana Ruiz",
      handle: "ana",
      followedByMe: false,
    },
    text: "Un disco que se escucha entero.",
    rating: 4,
    createdAt: "2026-11-04T10:00:00.000Z",
    updatedAt: "2026-11-04T10:00:00.000Z",
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    isOwn: false,
    ...overrides,
  };
}

function ok<T>(value: T): ContentResult<T> {
  return { ok: true, code: 200, value };
}

function failure(): ContentResult<never> {
  return { ok: false, code: 422, message: "No entra." };
}

interface Harness {
  actionsFor: ReturnType<typeof useCardActions>;
  toggleLike: jest.Mock;
  toggleFollow: jest.Mock;
  showSnackbar: jest.Mock;
  openEdit: jest.Mock;
  openComments: jest.Mock;
}

function renderActions(
  options: {
    viewerId?: string | null;
    like?: () => ContentResult<ToggleLikeResult>;
    follow?: () => ContentResult<ToggleFollowResult>;
  } = {},
): Harness {
  const toggleLike = jest.fn(
    options.like ??
      (() => ok({ opinionId: "op-1", likeCount: 1, likedByMe: true })),
  );
  const toggleFollow = jest.fn(
    options.follow ??
      (() =>
        ok({
          authorId: AUTHOR,
          followedByMe: true,
          followerCount: 1,
          viewerFollowingCount: 1,
        })),
  );

  const content = {
    toggleLike,
    toggleFollow,
  } as unknown as ContentStore;

  const showSnackbar = jest.fn();
  const openEdit = jest.fn();
  const openComments = jest.fn();

  const global = {
    showSnackbar,
    setHeader: jest.fn(),
    openWorkDetail: jest.fn(),
    openOpinionDetail: jest.fn(),
    openCreate: jest.fn(),
    openEdit,
    closeCreate: jest.fn(),
    goToTab: jest.fn(),
  } as unknown as GlobalServices;

  const noopUnsubscribe = () => {};
  const shell = {
    network: { online: true, subscribe: () => noopUnsubscribe },
    spotify: {
      status: "disconnected",
      subscribe: () => noopUnsubscribe,
      connect: jest.fn(),
      disconnect: jest.fn(),
      retry: jest.fn(),
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
      subscribe: () => noopUnsubscribe,
      open: openComments,
      close: jest.fn(),
      retry: jest.fn(),
      submit: jest.fn(),
    },
  } as unknown as ShellServices;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <GlobalServicesContext.Provider value={global}>
      <ShellServicesContext.Provider value={shell}>
        {children}
      </ShellServicesContext.Provider>
    </GlobalServicesContext.Provider>
  );

  const viewerId = options.viewerId === undefined ? VIEWER : options.viewerId;
  const { result } = renderHook(() => useCardActions(content, viewerId), {
    wrapper,
  });

  return {
    actionsFor: result.current,
    toggleLike,
    toggleFollow,
    showSnackbar,
    openEdit,
    openComments,
  };
}

describe("useCardActions — me gusta", () => {
  it("pide el me gusta con la identidad derivada y no avisa al ir bien", () => {
    const harness = renderActions();
    const actions = harness.actionsFor(opinionFixture());

    act(() => {
      actions.onLike?.();
    });

    expect(harness.toggleLike).toHaveBeenCalledWith({
      opinionId: "op-1",
      authorId: VIEWER,
    });
    expect(harness.showSnackbar).not.toHaveBeenCalled();
  });

  it("un fallo deja el estado igual y pide el texto exacto, sin acción", () => {
    const harness = renderActions({ like: () => failure() });
    const actions = harness.actionsFor(opinionFixture({ likedByMe: false }));

    act(() => {
      actions.onLike?.();
    });

    expect(harness.showSnackbar).toHaveBeenCalledWith({
      message: LIKE_FAILED_MESSAGE,
    });
    expect(LIKE_FAILED_MESSAGE).toBe("No pudimos guardar tu me gusta");
    // Quitar el me gusta es la misma llamada: C4 alterna.
    expect(harness.toggleLike).toHaveBeenCalledTimes(1);
  });
});

describe("useCardActions — seguir", () => {
  it("seguir avisa «Ahora sigues a @ana» con el handle del autor", () => {
    const harness = renderActions();
    const actions = harness.actionsFor(opinionFixture());

    act(() => {
      actions.onFollow?.();
    });

    expect(harness.toggleFollow).toHaveBeenCalledWith({
      authorId: AUTHOR,
      followerId: VIEWER,
    });
    expect(harness.showSnackbar).toHaveBeenCalledWith({
      message: "Ahora sigues a @ana",
    });
  });

  it("dejar de seguir avisa «Ya no sigues a @ana»", () => {
    const harness = renderActions({
      follow: () =>
        ok({
          authorId: AUTHOR,
          followedByMe: false,
          followerCount: 0,
          viewerFollowingCount: 0,
        }),
    });
    const actions = harness.actionsFor(opinionFixture({ isOwn: false }));

    act(() => {
      actions.onFollow?.();
    });

    expect(harness.showSnackbar).toHaveBeenCalledWith({
      message: "Ya no sigues a @ana",
    });
  });

  it("un fallo de seguimiento pide su texto exacto y no confirma nada", () => {
    const harness = renderActions({ follow: () => failure() });
    const actions = harness.actionsFor(opinionFixture());

    act(() => {
      actions.onFollow?.();
    });

    expect(harness.showSnackbar).toHaveBeenCalledTimes(1);
    expect(harness.showSnackbar).toHaveBeenCalledWith({
      message: FOLLOW_FAILED_MESSAGE,
    });
    expect(FOLLOW_FAILED_MESSAGE).toBe("No pudimos guardar tu seguimiento");
  });
});

describe("useCardActions — opinión propia y comentarios", () => {
  it("en la opinión propia solo ofrece comentar y editar", () => {
    const harness = renderActions();
    const actions = harness.actionsFor(
      opinionFixture({
        isOwn: true,
        author: {
          authorId: VIEWER,
          displayName: "Usuario demo",
          handle: "demo",
          followedByMe: false,
        },
      }),
    );

    expect(actions.onLike).toBeUndefined();
    expect(actions.onFollow).toBeUndefined();
    expect(actions.onComment).toBeDefined();
    expect(actions.onEdit).toBeDefined();
  });

  it("«Editar» abre Crear en modo edición con esa opinión", () => {
    const harness = renderActions();
    const actions = harness.actionsFor(
      opinionFixture({
        isOwn: true,
        author: {
          authorId: VIEWER,
          displayName: "Usuario demo",
          handle: "demo",
          followedByMe: false,
        },
      }),
    );

    act(() => {
      actions.onEdit?.();
    });

    expect(harness.openEdit).toHaveBeenCalledWith({ opinionId: "op-1" });
  });

  it("comentar abre la hoja de esa opinión", () => {
    const harness = renderActions();
    const actions = harness.actionsFor(opinionFixture());

    act(() => {
      actions.onComment?.();
    });

    expect(harness.openComments).toHaveBeenCalledWith("op-1");
  });

  it("sin identidad no hay ninguna acción y los controles no responden", () => {
    const harness = renderActions({ viewerId: null });
    const actions = harness.actionsFor(opinionFixture());

    expect(actions).toEqual({});
  });
});
