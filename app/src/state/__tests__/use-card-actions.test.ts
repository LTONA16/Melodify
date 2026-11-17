import { act, renderHook } from "@testing-library/react-native";
import type {
  ContentResult,
  OpinionView,
  ToggleFollowResult,
  ToggleLikeResult,
} from "@melodify/content-store";

import type { CardActionsDeps } from "../useCardActions";
import { useCardActions } from "../useCardActions";

/**
 * Las cuatro acciones de tarjeta (BR14.1, BR14.2, BR14.3, BR14.8 y la desviación
 * registrada de FR11.2): el estado no se toca, un fallo solo pide el aviso exacto y
 * la opinión propia no ofrece me gusta ni seguir.
 */
function opinionView(overrides: Partial<OpinionView> = {}): OpinionView {
  return {
    opinionId: "op-4",
    workId: "work-1",
    workTitle: "Bad Guy",
    workArtist: "Billie Eilish",
    author: {
      authorId: "ana",
      displayName: "Ana Ruiz",
      handle: "anaruiz",
      followedByMe: false,
    },
    text: "Un temazo.",
    rating: 5,
    createdAt: "2026-11-10T09:00:00.000Z",
    updatedAt: "2026-11-10T09:00:00.000Z",
    likeCount: 3,
    commentCount: 1,
    likedByMe: false,
    isOwn: false,
    ...overrides,
  };
}

function likeResult(likedByMe: boolean): ContentResult<ToggleLikeResult> {
  return {
    ok: true,
    code: 200,
    value: {
      opinionId: "op-4",
      likeCount: likedByMe ? 4 : 3,
      likedByMe,
    },
  };
}

function followResult(followedByMe: boolean): ContentResult<ToggleFollowResult> {
  return {
    ok: true,
    code: 200,
    value: {
      authorId: "ana",
      followedByMe,
      followerCount: 2,
      viewerFollowingCount: followedByMe ? 3 : 2,
    },
  };
}

function setup(options: { viewerId?: string | null } = {}) {
  const content = {
    toggleLike: jest.fn((): ContentResult<ToggleLikeResult> => likeResult(true)),
    toggleFollow: jest.fn(
      (): ContentResult<ToggleFollowResult> => followResult(true),
    ),
  };
  const comments = { open: jest.fn() };
  const global = { showSnackbar: jest.fn(), openEdit: jest.fn() };

  const deps: CardActionsDeps = {
    content,
    viewerId: options.viewerId === undefined ? "demo" : options.viewerId,
    comments,
    global,
  };

  const view = renderHook(() => useCardActions(deps));

  return { ...view, content, comments, global };
}

describe("useCardActions — me gusta", () => {
  it("da me gusta con la identidad de quien mira y no avisa: C4 repinta", () => {
    const { result, content, global } = setup();

    act(() => {
      result.current(opinionView()).onLike?.();
    });

    expect(content.toggleLike).toHaveBeenCalledWith({
      opinionId: "op-4",
      authorId: "demo",
    });
    expect(global.showSnackbar).not.toHaveBeenCalled();
  });

  it("volver a tocar vuelve a alternar en C4", () => {
    const { result, content } = setup();
    const actions = result.current(opinionView());

    act(() => {
      actions.onLike?.();
      actions.onLike?.();
    });

    expect(content.toggleLike).toHaveBeenCalledTimes(2);
  });

  it("si la escritura falla, avisa con el texto exacto y nada más", () => {
    const { result, content, global } = setup();
    content.toggleLike.mockReturnValue({
      ok: false,
      code: 422,
      message: "no se pudo",
    });

    act(() => {
      result.current(opinionView()).onLike?.();
    });

    expect(global.showSnackbar).toHaveBeenCalledWith({
      message: "No pudimos guardar tu me gusta",
    });
    expect(content.toggleFollow).not.toHaveBeenCalled();
    expect(global.openEdit).not.toHaveBeenCalled();
  });
});

describe("useCardActions — seguir", () => {
  it("seguir confirma con el handle del autor", () => {
    const { result, content, global } = setup();

    act(() => {
      result.current(opinionView()).onFollow?.();
    });

    expect(content.toggleFollow).toHaveBeenCalledWith({
      authorId: "ana",
      followerId: "demo",
    });
    expect(global.showSnackbar).toHaveBeenCalledWith({
      message: "Ahora sigues a @anaruiz",
    });
  });

  it("dejar de seguir confirma con el otro texto", () => {
    const { result, content, global } = setup();
    content.toggleFollow.mockReturnValue(followResult(false));

    act(() => {
      result.current(opinionView()).onFollow?.();
    });

    expect(global.showSnackbar).toHaveBeenCalledWith({
      message: "Ya no sigues a @anaruiz",
    });
  });

  it("si la escritura falla, avisa con el texto exacto", () => {
    const { result, content, global } = setup();
    content.toggleFollow.mockReturnValue({
      ok: false,
      code: 422,
      message: "no se pudo",
    });

    act(() => {
      result.current(opinionView()).onFollow?.();
    });

    expect(global.showSnackbar).toHaveBeenCalledWith({
      message: "No pudimos guardar tu seguimiento",
    });
  });
});

describe("useCardActions — comentar y editar", () => {
  it("comentar abre la hoja sobre la opinión, sea propia o ajena", () => {
    const { result, comments } = setup();

    act(() => {
      result.current(opinionView()).onComment?.();
      result.current(opinionView({ isOwn: true })).onComment?.();
    });

    expect(comments.open).toHaveBeenCalledTimes(2);
    expect(comments.open).toHaveBeenNthCalledWith(1, "op-4");
    expect(comments.open).toHaveBeenNthCalledWith(2, "op-4");
  });

  it("la opinión propia solo ofrece comentar y editar", () => {
    const { result, global } = setup();

    const actions = result.current(opinionView({ isOwn: true }));

    expect(actions.onLike).toBeUndefined();
    expect(actions.onFollow).toBeUndefined();
    expect(actions.onComment).toEqual(expect.any(Function));
    expect(actions.onEdit).toEqual(expect.any(Function));

    act(() => {
      actions.onEdit?.();
    });

    expect(global.openEdit).toHaveBeenCalledWith({ opinionId: "op-4" });
  });

  it("la opinión ajena no ofrece editar", () => {
    const { result } = setup();

    expect(result.current(opinionView()).onEdit).toBeUndefined();
  });
});

describe("useCardActions — sin identidad", () => {
  it("sin `viewerId` no entrega ninguna acción", () => {
    const { result, content, comments, global } = setup({ viewerId: null });

    expect(result.current(opinionView())).toEqual({});
    expect(result.current(opinionView({ isOwn: true }))).toEqual({});

    expect(content.toggleLike).not.toHaveBeenCalled();
    expect(content.toggleFollow).not.toHaveBeenCalled();
    expect(comments.open).not.toHaveBeenCalled();
    expect(global.openEdit).not.toHaveBeenCalled();
  });
});
