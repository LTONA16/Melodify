import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@melodify/design-system";

import type { ActividadSection } from "../activityModel";
import { ActividadView, type ActividadViewProps } from "../ActividadView";

/**
 * Vista pura de Actividad (BR22.4, BR23.1–BR23.4, BR24.1): sin sesión, sin almacén y sin red. Se
 * afirma lo que la persona ve y a qué acción lleva cada toque, no el árbol interno.
 */
const OFFLINE_MESSAGE =
  "Sin conexión. Estás viendo lo último que cargamos.";

const SECTIONS: ActividadSection[] = [
  {
    day: "today",
    label: "Hoy",
    events: [
      {
        eventId: "comment:cm-002",
        kind: "commentReceived",
        opinionId: "op-004",
        workTitle: "Blinding Lights",
        createdAt: "2026-11-19T10:00:00.000Z",
        actorHandle: "bruno",
      },
      {
        eventId: "like:op-004:ana",
        kind: "likeReceived",
        opinionId: "op-004",
        workTitle: "Blinding Lights",
        createdAt: "2026-11-19T09:00:00.000Z",
        actorHandle: "ana",
      },
    ],
  },
  {
    day: "date",
    label: "16 nov 2026",
    events: [
      {
        eventId: "own:op-001",
        kind: "ownOpinion",
        opinionId: "op-001",
        workTitle: "Cielo de Neón",
        createdAt: "2026-11-16T12:00:00.000Z",
      },
    ],
  },
];

function renderView(overrides: Partial<ActividadViewProps> = {}) {
  const props: ActividadViewProps = {
    status: "ready",
    sections: SECTIONS,
    online: true,
    onOpenOpinion: jest.fn(),
    onRetry: jest.fn(),
    onCreate: jest.fn(),
    ...overrides,
  };

  render(
    <ThemeProvider scheme="light">
      <ActividadView {...props} />
    </ThemeProvider>,
  );

  return props;
}

describe("ActividadView", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-19T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("mientras carga pinta esqueletos y no pinta lista, vacío ni error", () => {
    renderView({ status: "loading", sections: [] });

    expect(screen.getByTestId("actividad-loading")).toBeTruthy();
    expect(screen.getByTestId("skeleton-header-1")).toBeTruthy();
    expect(screen.getByTestId("skeleton-row-3")).toBeTruthy();
    expect(screen.queryByTestId("actividad-feed")).toBeNull();
    expect(screen.queryByTestId("empty-state")).toBeNull();
    expect(screen.queryByTestId("error-state")).toBeNull();
  });

  it("pinta la cabecera de la pantalla fuera de la lista", () => {
    renderView();

    expect(screen.getByTestId("app-header")).toHaveTextContent("Actividad");
  });

  it("con actividad pinta los días y una fila por evento", () => {
    renderView();

    const headers = screen.getAllByTestId("actividad-section-header");
    expect(headers).toHaveLength(2);
    expect(screen.getByText("Hoy")).toBeVisible();
    expect(screen.getByText("16 nov 2026")).toBeVisible();
    expect(screen.getByTestId("activity-row-comment:cm-002")).toBeTruthy();
    expect(screen.getByTestId("activity-row-like:op-004:ana")).toBeTruthy();
    expect(screen.getByTestId("activity-row-own:op-001")).toBeTruthy();
    expect(screen.getByTestId("actividad-feed")).toBeTruthy();
  });

  it("tocar una fila abre la opinión dueña del evento", () => {
    const props = renderView();

    fireEvent.press(screen.getByTestId("activity-row-comment:cm-002"));

    expect(props.onOpenOpinion).toHaveBeenCalledTimes(1);
    expect(props.onOpenOpinion).toHaveBeenCalledWith("op-004");
  });

  it("sin actividad pinta el texto exacto y «Crear opinión»", () => {
    const props = renderView({ status: "empty", sections: [] });

    expect(screen.getByText("Todavía no hay actividad.")).toBeVisible();

    fireEvent.press(screen.getByTestId("empty-state-action"));

    expect(props.onCreate).toHaveBeenCalledTimes(1);
  });

  it("si falla la actividad pinta el error exacto y «Reintentar»", () => {
    const props = renderView({ status: "error", sections: [] });

    expect(screen.getByText("No pudimos cargar tu actividad.")).toBeVisible();

    fireEvent.press(screen.getByTestId("error-state-retry"));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("sin conexión pinta el aviso sobre la lista y reintenta la actividad", () => {
    const props = renderView({ online: false });

    expect(screen.getByText(OFFLINE_MESSAGE)).toBeVisible();
    expect(screen.getByTestId("activity-row-comment:cm-002")).toBeTruthy();

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
