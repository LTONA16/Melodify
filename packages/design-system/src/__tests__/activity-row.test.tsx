import { fireEvent, render, screen } from "@testing-library/react-native";

import { ActivityRow } from "../components/ActivityRow";
import type { ActivityEventSummary } from "../models";
import { ThemeProvider } from "../ThemeProvider";

/**
 * Fila de actividad de C1 1.5.0 (paso 12). Las frases se comparan completas,
 * comillas angulares incluidas: el contrato no admite una versión «parecida».
 */
const BASE: ActivityEventSummary = {
  eventId: "comment:cm-002",
  kind: "commentReceived",
  opinionId: "op-004",
  workTitle: "Blinding Lights",
  createdAt: "2026-11-19T10:00:00.000Z",
  actorHandle: "bruno",
};

function renderRow(event: ActivityEventSummary = BASE) {
  const onPress = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <ActivityRow event={event} onPress={onPress} />
    </ThemeProvider>,
  );

  return onPress;
}

describe("ActivityRow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-11-19T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("pinta las tres frases literales según la clase del evento", () => {
    renderRow({ ...BASE, eventId: "own:op-004", kind: "ownOpinion" });
    expect(screen.getByTestId("activity-row-text-own:op-004")).toHaveTextContent(
      "Publicaste tu opinión de «Blinding Lights»",
    );

    screen.unmount();
    renderRow({ ...BASE, eventId: "like:op-004:ana", kind: "likeReceived" });
    expect(
      screen.getByTestId("activity-row-text-like:op-004:ana"),
    ).toHaveTextContent("A alguien le gustó tu opinión de «Blinding Lights»");

    screen.unmount();
    renderRow(BASE);
    expect(screen.getByTestId("activity-row-text-comment:cm-002")).toHaveTextContent(
      "Comentaron tu opinión de «Blinding Lights»",
    );
  });

  it("usa un icono distinto por clase y ninguno lleva etiqueta propia", () => {
    const cases: [ActivityEventSummary["kind"], string, string][] = [
      ["ownOpinion", "own:op-001", "★"],
      ["likeReceived", "like:op-001:lucia", "♡"],
      ["commentReceived", "comment:cm-001", "💬"],
    ];

    for (const [kind, eventId, icon] of cases) {
      renderRow({ ...BASE, eventId, kind });
      const node = screen.getByTestId(`activity-row-icon-${eventId}`);

      expect(node).toHaveTextContent(icon);
      expect(node.props.accessibilityLabel).toBeUndefined();
      screen.unmount();
    }
  });

  it("pinta el tiempo relativo con el reloj fijado", () => {
    renderRow();

    expect(screen.getByTestId("activity-row-time-comment:cm-002")).toHaveTextContent(
      "hace 2 h",
    );
  });

  it("toda la fila es el objetivo táctil y su etiqueta es la frase completa", () => {
    const onPress = renderRow();

    const row = screen.getByTestId("activity-row-comment:cm-002");
    expect(row.props.accessibilityRole).toBe("button");
    expect(row.props.accessibilityLabel).toBe(
      "Comentaron tu opinión de «Blinding Lights»",
    );

    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("no pinta el handle: el texto no nombra a quien interactuó", () => {
    renderRow();

    expect(screen.getByTestId("activity-row-text-comment:cm-002")).toHaveTextContent(
      "Comentaron tu opinión de «Blinding Lights»",
    );
    expect(screen.queryByText("bruno")).toBeNull();
  });

  it("pinta el chevron decorativo", () => {
    renderRow();

    expect(
      screen.getByTestId("activity-row-chevron-comment:cm-002"),
    ).toHaveTextContent("›");
  });
});
