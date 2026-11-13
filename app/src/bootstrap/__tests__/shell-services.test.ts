import { defaultShellServices } from "../shell-services";

/**
 * Los servicios por defecto son lo que la cáscara recibe cuando todavía no hay red
 * ni Spotify (U1). Se prueban por su forma y por su comportamiento: una pantalla
 * puede llamarlos desde el primer día y no rompe nada.
 */
describe("servicios por defecto de la cáscara", () => {
  it("declara los tres servicios con la forma de C2", () => {
    expect(defaultShellServices.network).toEqual(
      expect.objectContaining({
        online: true,
        subscribe: expect.any(Function),
      }),
    );
    expect(defaultShellServices.spotify).toEqual(
      expect.objectContaining({
        status: "disconnected",
        subscribe: expect.any(Function),
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        retry: expect.any(Function),
      }),
    );
    expect(defaultShellServices.comments).toEqual(
      expect.objectContaining({
        state: {
          opinionId: null,
          comments: [],
          status: "empty",
        },
        subscribe: expect.any(Function),
        open: expect.any(Function),
        close: expect.any(Function),
        retry: expect.any(Function),
        submit: expect.any(Function),
      }),
    );
  });

  it("arranca con la hoja de comentarios vacía y cerrada", () => {
    const { state } = defaultShellServices.comments;

    expect(state.opinionId).toBeNull();
    expect(state.comments).toEqual([]);
    expect(state.status).toBe("empty");
  });

  it("suscribirse devuelve una baja que no lanza y no emite nada", () => {
    const networkUnsubscribe = defaultShellServices.network.subscribe(() => {});
    const spotifyUnsubscribe = defaultShellServices.spotify.subscribe(() => {});
    const commentsUnsubscribe = defaultShellServices.comments.subscribe(() => {});

    expect(typeof networkUnsubscribe).toBe("function");
    expect(() => networkUnsubscribe()).not.toThrow();
    expect(() => spotifyUnsubscribe()).not.toThrow();
    expect(() => commentsUnsubscribe()).not.toThrow();
  });

  it("ninguna acción lanza ni cambia el estado por su cuenta", () => {
    const { network, spotify, comments } = defaultShellServices;

    expect(() => {
      spotify.connect?.();
      spotify.disconnect?.();
      spotify.retry?.();
      comments.open("op-1");
      comments.close();
      comments.retry();
      comments.submit("un comentario");
    }).not.toThrow();

    expect(network.online).toBe(true);
    expect(spotify.status).toBe("disconnected");
    expect(comments.state.opinionId).toBeNull();
  });
});
