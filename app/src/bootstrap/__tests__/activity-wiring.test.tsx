import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { SESSION_STORAGE_KEY } from "@melodify/app-session";

import { App } from "../App";
import { activityFeed, contentStore } from "../instances";

/**
 * Cableado real de U5 (BR24.3, AC8.1.1–AC8.1.7): la app arranca con la sesión
 * recordada, abre la pestaña que monta `activityFeed`, publica en la instancia
 * compartida de C4 y comprueba que el histórico se mueve sin reiniciar. No hay
 * dobles de C8 ni de C4 aquí: una copia de cualquiera de los dos convertiría la
 * prueba en una mentira.
 */
const stored = new Map<string, string>();
const VALID_RECORD = JSON.stringify({
  authorId: "demo",
  startedAt: "2026-11-11T09:00:00.000Z",
});

const readItem = jest.mocked(SecureStore.getItemAsync);
const writeItem = jest.mocked(SecureStore.setItemAsync);
const deleteItem = jest.mocked(SecureStore.deleteItemAsync);

beforeEach(() => {
  jest.clearAllMocks();
  stored.clear();
  stored.set(SESSION_STORAGE_KEY, VALID_RECORD);

  readItem.mockImplementation(async (key) => stored.get(key) ?? null);
  writeItem.mockImplementation(async (key, value) => {
    stored.set(key, value);
  });
  deleteItem.mockImplementation(async (key) => {
    stored.delete(key);
  });
  jest.mocked(SplashScreen.hideAsync).mockResolvedValue(undefined);
});

describe("el cableado de la actividad", () => {
  it("arranca, deriva la siembra, ve una publicación nueva y abre el detalle", async () => {
    expect(activityFeed).toBeDefined();

    render(<App />);
    await screen.findByText("Para ti");

    fireEvent.press(screen.getByTestId("tab-actividad"));
    await screen.findByTestId("actividad-feed");

    const rows = await screen.findAllByTestId(
      /^activity-row-(?:own|like|comment):/,
    );
    expect(rows).toHaveLength(8);

    // La lista montada y el modelo compartido deben contar lo mismo. El número
    // exacto de días depende de la hora local en que se construyó la siembra, así
    // que se afirma el invariante estable: un grupo por fecha del calendario y
    // los ocho eventos en orden, sin depender de los encabezados virtualizados.
    let activity: ReturnType<typeof activityFeed.getActivity> = {
      status: "loading",
      groups: [],
    };
    const stopWatching = activityFeed.subscribeActivity((view) => {
      activity = view;
    });
    stopWatching();

    expect(activity.status).toBe("ready");
    const groups = activity.groups ?? [];
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((group) => group.label.length > 0)).toBe(true);
    expect(groups.every((group) => group.events.length > 0)).toBe(true);
    const events = groups.flatMap((group) => group.events);
    expect(events).toHaveLength(8);
    expect(
      new Set(events.map((event) => new Date(event.createdAt).toDateString()))
        .size,
    ).toBe(groups.length);
    const expectedEventIds = events.map((event) => event.eventId);
    expect(
      rows.map((row) => String(row.props.testID).replace("activity-row-", "")),
    ).toEqual(expectedEventIds);

    // Publicar en la instancia compartida debe sumar un evento propio sin que
    // nadie vuelva a montar la pantalla ni a construir otro feed.
    act(() => {
      contentStore.createOpinion({
        authorId: "demo",
        workId: "0yLdNVWF3Srea0uzk55zFn",
        workTitle: "Flowers",
        workArtist: "Miley Cyrus",
        text: "La añado ahora para ver la actividad en vivo.",
        rating: 4,
      });
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId(/^activity-row-(?:own|like|comment):/),
      ).toHaveLength(9);
    });

    fireEvent.press(
      screen.getAllByTestId(/^activity-row-(?:own|like|comment):/)[0]!,
    );

    expect(await screen.findByTestId("detalle-opinion")).toBeVisible();
  });
});
