import { fireEvent, render, screen } from "@testing-library/react-native";

import { WorkResultRow } from "../components/WorkResultRow";
import type { WorkSummary } from "../models";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La fila de obra de C1 1.3.0: el resultado del buscador y la obra del selector
 * de ejemplo. El recuento se escribe con palabras, en singular y con la
 * invitación cuando no hay ninguna (US5.2).
 */
const WORK: WorkSummary = {
  workId: "work-002",
  title: "Blinding Lights",
  artist: "The Weeknd",
  coverUrl: null,
};

function renderRow(
  opinionCount: number,
  props: Partial<Parameters<typeof WorkResultRow>[0]> = {},
) {
  const onPress = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <WorkResultRow
        work={WORK}
        opinionCount={opinionCount}
        onPress={onPress}
        {...props}
      />
    </ThemeProvider>,
  );

  return onPress;
}

describe("WorkResultRow", () => {
  it("pinta la obra y su recuento en plural", () => {
    renderRow(3);

    expect(screen.getByTestId("work-result-title")).toHaveTextContent(
      "Blinding Lights",
    );
    expect(screen.getByTestId("work-result-artist")).toHaveTextContent(
      "The Weeknd",
    );
    expect(screen.getByTestId("work-result-opinions")).toHaveTextContent(
      "3 opiniones",
    );
  });

  it("con una sola opinión usa el singular", () => {
    renderRow(1);

    expect(screen.getByTestId("work-result-opinions")).toHaveTextContent(
      "1 opinión",
    );
  });

  it("sin opiniones invita a ser el primero", () => {
    renderRow(0);

    expect(screen.getByTestId("work-result-opinions")).toHaveTextContent(
      "Sé el primero en opinar",
    );
  });

  it("toda la fila es el objetivo táctil", () => {
    const onPress = renderRow(2);

    fireEvent.press(screen.getByTestId("work-result-work-002"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("sin kind no pinta etiqueta de clase", () => {
    renderRow(1);

    expect(screen.queryByTestId("work-result-kind")).toBeNull();
  });

  it("con kind pinta Canción o Álbum sin añadir una línea", () => {
    renderRow(1, { kind: "track" });
    expect(screen.getByTestId("work-result-kind")).toHaveTextContent("Canción");

    screen.unmount();

    renderRow(1, { kind: "album" });
    expect(screen.getByTestId("work-result-kind")).toHaveTextContent("Álbum");
  });
});
