/**
 * La suscripción de C4 (paso 6 del plan): `/changes` de BR4.7.
 *
 * La emisión es la única vía por la que las pantallas salen de los esqueletos, así
 * que estas pruebas fijan sus tres compromisos: llega una emisión inmediata con el
 * estado actual, cada escritura emite **una sola vez** con la revisión incrementada
 * y la baja detiene las emisiones. El reloj es fijo (`NOW`) para que las fechas no
 * dependan de la máquina (NFR5.7).
 */
import { createContentStore, type ContentStore } from "../store";
import type { ContentSnapshot, ContentResult } from "../views";

const NOW = "2026-11-12T09:00:00.000Z";
const AS_IT_WAS = "4LRPiXqCikLlN15c3yImP7";

type Listener = jest.Mock<void, [ContentSnapshot]>;

function newListener(): Listener {
  return jest.fn<void, [ContentSnapshot]>();
}

function newStore(): ContentStore {
  return createContentStore({ now: NOW });
}

function subscribe(
  store: ContentStore,
  viewerId: string | null | undefined,
  listener: Listener,
): ContentResult<() => void> {
  return store.subscribeContent(viewerId, listener);
}

function snapshotAt(listener: Listener, index: number): ContentSnapshot {
  const call = listener.mock.calls[index];
  if (call === undefined) {
    throw new Error(`El oyente no recibió la emisión ${index}.`);
  }
  return call[0];
}

function lastSnapshot(listener: Listener): ContentSnapshot {
  return snapshotAt(listener, listener.mock.calls.length - 1);
}

function revisionsOf(listener: Listener): number[] {
  return listener.mock.calls.map((call) => call[0].revision);
}

describe("subscribeContent", () => {
  it("emite la siembra completa nada más suscribirse, con revisión cero", () => {
    const store = newStore();
    const listener = newListener();

    const subscription = subscribe(store, "demo", listener);

    expect(subscription.ok).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    const snapshot = snapshotAt(listener, 0);
    expect(snapshot.revision).toBe(0);
    expect(snapshot.opinions).toHaveLength(10);
    const ids = snapshot.opinions.map((opinion) => opinion.opinionId);
    expect(ids[0]).toBe("op-002");
    expect(ids[9]).toBe("op-008");
  });

  it("emite una sola vez tras cada escritura, con la revisión incrementada y el contenido nuevo", () => {
    const store = newStore();
    const listener = newListener();
    subscribe(store, "demo", listener);

    const created = store.createOpinion({
      authorId: "demo",
      workId: AS_IT_WAS,
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "La pongo en bucle desde ayer.",
      rating: 5,
    });

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(listener).toHaveBeenCalledTimes(2);
    expect(revisionsOf(listener)).toEqual([0, 1]);
    const snapshot = lastSnapshot(listener);
    expect(snapshot.opinions).toHaveLength(11);
    expect(snapshot.opinions.map((opinion) => opinion.opinionId)[0]).toBe(
      created.value.opinionId,
    );
  });

  it("deja de emitir cuando quien se suscribió se da de baja", () => {
    const store = newStore();
    const listener = newListener();
    const subscription = subscribe(store, "demo", listener);

    if (!subscription.ok) {
      throw new Error(`No se pudo suscribir: ${subscription.code}`);
    }
    subscription.value();

    const created = store.createOpinion({
      authorId: "demo",
      workId: AS_IT_WAS,
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "Sin suscripción no hay emisión.",
      rating: 4,
    });

    expect(created.ok).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("entrega la misma revisión y el mismo contenido a dos suscriptores", () => {
    const store = newStore();
    const demoListener = newListener();
    const luciaListener = newListener();
    subscribe(store, "demo", demoListener);
    subscribe(store, "lucia", luciaListener);

    const created = store.createOpinion({
      authorId: "demo",
      workId: AS_IT_WAS,
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "Una emisión para los dos.",
      rating: 4,
    });

    expect(created.ok).toBe(true);
    const fromDemo = lastSnapshot(demoListener);
    const fromLucia = lastSnapshot(luciaListener);

    expect(fromDemo.revision).toBe(1);
    expect(fromLucia.revision).toBe(1);
    expect(fromDemo.opinions.map((opinion) => opinion.opinionId)).toEqual(
      fromLucia.opinions.map((opinion) => opinion.opinionId),
    );
  });

  it("no suscribe sin quién mira: responde 422 y no llama al oyente", () => {
    const store = newStore();
    const listener = newListener();

    const missing = subscribe(store, undefined, listener);
    const nullViewer = subscribe(store, null, listener);

    expect(missing.ok).toBe(false);
    expect(nullViewer.ok).toBe(false);
    if (missing.ok || nullViewer.ok) {
      return;
    }
    expect(missing.code).toBe(422);
    expect(nullViewer.code).toBe(422);
    expect(listener).not.toHaveBeenCalled();
  });

  it("rellena los campos derivados con el `viewerId` de cada suscriptor", () => {
    const store = newStore();
    const demoListener = newListener();
    const luciaListener = newListener();
    subscribe(store, "demo", demoListener);
    subscribe(store, "lucia", luciaListener);

    // Antes de escribir, cada uno ve solo lo suyo.
    const demoInitial = snapshotAt(demoListener, 0);
    const luciaInitial = snapshotAt(luciaListener, 0);
    expect(demoInitial.opinions.filter((opinion) => opinion.isOwn)).toHaveLength(3);
    expect(luciaInitial.opinions.filter((opinion) => opinion.isOwn)).toHaveLength(2);

    const created = store.createOpinion({
      authorId: "demo",
      workId: AS_IT_WAS,
      workTitle: "As It Was",
      workArtist: "Harry Styles",
      text: "Solo es mía para quien la escribió.",
      rating: 5,
    });

    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    const opinionId = created.value.opinionId;
    const findOwn = (snapshot: ContentSnapshot) =>
      snapshot.opinions.find((opinion) => opinion.opinionId === opinionId);

    expect(findOwn(lastSnapshot(demoListener))?.isOwn).toBe(true);
    expect(findOwn(lastSnapshot(luciaListener))?.isOwn).toBe(false);
  });
});
