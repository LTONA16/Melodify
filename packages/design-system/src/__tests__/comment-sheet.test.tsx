import { fireEvent, render, screen } from "@testing-library/react-native";

import { CommentSheet } from "../components/CommentSheet";
import type { CommentModel } from "../models";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La hoja de comentarios de C1 1.3.0 (BR14.3–BR14.7). Cada prueba afirma el
 * estado que describe —el borrador sigue ahí, la lista no se borra, el aviso se
 * ve dentro del modal— y no solo que la pieza monta.
 */
const COMMENTS: CommentModel[] = [
  {
    commentId: "cm-1",
    authorName: "Ana Ruiz",
    authorHandle: "anaruiz",
    text: "Totalmente de acuerdo.",
    createdAt: "2026-11-10T09:00:00.000Z",
  },
  {
    commentId: "cm-2",
    authorName: "Leo Márquez",
    authorHandle: "leom",
    text: "A mí me pasó lo mismo.",
    createdAt: "2026-11-11T09:00:00.000Z",
  },
];

type Props = Parameters<typeof CommentSheet>[0];

function renderSheet(overrides: Partial<Props> = {}) {
  const onSubmit = jest.fn();
  const onRetry = jest.fn();
  const onClose = jest.fn();

  const props: Props = {
    opinionId: "op-004",
    comments: [],
    status: "empty",
    onSubmit,
    onRetry,
    onClose,
    ...overrides,
  };

  const view = render(
    <ThemeProvider scheme="light">
      <CommentSheet {...props} />
    </ThemeProvider>,
  );

  return { ...view, onSubmit, onRetry, onClose, props };
}

function rerenderSheet(
  rerender: ReturnType<typeof render>["rerender"],
  props: Props,
): void {
  rerender(
    <ThemeProvider scheme="light">
      <CommentSheet {...props} />
    </ThemeProvider>,
  );
}

describe("CommentSheet: estados de la lista", () => {
  it("cargando pinta esqueletos y ni lista ni vacío", () => {
    renderSheet({ status: "loading" });

    expect(screen.getByTestId("comment-sheet-loading")).toBeTruthy();
    expect(screen.queryByTestId("comment-sheet-empty")).toBeNull();
    expect(screen.queryByTestId("comment-sheet-list")).toBeNull();
  });

  it("vacía invita a ser el primero", () => {
    renderSheet({ status: "empty" });

    expect(screen.getByTestId("comment-sheet-empty")).toHaveTextContent(
      "Sé el primero en comentar",
    );
  });

  it("con comentarios pinta autor, handle y texto de cada uno", () => {
    renderSheet({ status: "ready", comments: COMMENTS });

    expect(screen.getByTestId("comment-row-cm-1")).toHaveTextContent(
      /Ana Ruiz/,
    );
    expect(screen.getByTestId("comment-row-cm-1")).toHaveTextContent(
      /@anaruiz/,
    );
    expect(screen.getByTestId("comment-row-cm-1")).toHaveTextContent(
      /Totalmente de acuerdo\./,
    );
    expect(screen.getByTestId("comment-row-cm-2")).toHaveTextContent(
      /A mí me pasó lo mismo\./,
    );
  });

  it("error de carga ofrece «Reintentar» y relee la lista", () => {
    const { onRetry } = renderSheet({ status: "error" });

    expect(screen.getByText("No pudimos cargar los comentarios.")).toBeTruthy();

    fireEvent.press(screen.getByTestId("comment-sheet-retry-load"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("el ✕ y el velo cierran la hoja", () => {
    const { onClose } = renderSheet({ status: "ready", comments: COMMENTS });

    fireEvent.press(screen.getByTestId("comment-sheet-close"));
    // El velo es hermano de la hoja y `accessibilityViewIsModal` lo oculta a las
    // consultas de accesibilidad: se busca explícitamente entre los ocultos,
    // porque un toque real sí llega.
    fireEvent.press(
      screen.getByTestId("comment-sheet-overlay", {
        includeHiddenElements: true,
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("CommentSheet: el envío", () => {
  it("con el campo vacío no se puede enviar", () => {
    renderSheet({ status: "empty" });

    const send = screen.getByTestId("comment-sheet-send");

    expect(send.props.accessibilityState).toMatchObject({ disabled: true });

    fireEvent.press(send);

    expect(screen.getByTestId("comment-sheet-send")).toBeTruthy();
  });

  it("envía el texto recortado", () => {
    const { onSubmit } = renderSheet({ status: "empty" });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "  Qué temazo  ",
    );
    fireEvent.press(screen.getByTestId("comment-sheet-send"));

    expect(onSubmit).toHaveBeenCalledWith("Qué temazo");
  });

  it("con `failed`, el texto sigue escrito y no se ha borrado la lista", () => {
    const { onSubmit } = renderSheet({
      status: "ready",
      comments: COMMENTS,
      failed: true,
    });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "Otra vez será",
    );

    expect(screen.getByTestId("comment-row-cm-1")).toBeTruthy();
    expect(screen.getByText("No pudimos enviar tu comentario.")).toBeTruthy();
    expect(screen.getByTestId("comment-sheet-field").props.value).toBe(
      "Otra vez será",
    );

    fireEvent.press(screen.getByTestId("comment-sheet-retry-send"));

    expect(onSubmit).toHaveBeenCalledWith("Otra vez será");
  });

  it("limpia el borrador cuando el comentario aparece ya en la lista", () => {
    const { rerender, onSubmit, props } = renderSheet({ status: "empty" });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "Buenísima",
    );
    fireEvent.press(screen.getByTestId("comment-sheet-send"));

    expect(onSubmit).toHaveBeenCalledWith("Buenísima");

    rerenderSheet(rerender, {
      ...props,
      status: "ready",
      comments: [
        {
          commentId: "cm-3",
          authorName: "Demo",
          authorHandle: "demo",
          text: "Buenísima",
          createdAt: "2026-11-12T09:00:00.000Z",
        },
      ],
    });

    expect(screen.getByTestId("comment-sheet-field").props.value).toBe("");
  });
});

describe("CommentSheet: topes y aviso dentro del modal", () => {
  it("el contador aparece desde 250 con el tope de 300", () => {
    renderSheet({ status: "empty", maxLength: 300, counterFrom: 250 });

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "a".repeat(249),
    );
    expect(screen.queryByTestId("comment-sheet-field-counter")).toBeNull();

    fireEvent.changeText(
      screen.getByTestId("comment-sheet-field"),
      "a".repeat(250),
    );
    expect(screen.getByTestId("comment-sheet-field-counter")).toHaveTextContent(
      "250/300",
    );
  });

  it("el tope de 300 llega al campo", () => {
    renderSheet({ status: "empty", maxLength: 300, counterFrom: 250 });

    expect(
      screen.getByTestId("comment-sheet-field").props.maxLength,
    ).toBe(300);
  });

  it("pinta el aviso de la cáscara dentro del modal", () => {
    renderSheet({
      status: "ready",
      comments: COMMENTS,
      snackbar: {
        message: "Comentario publicado",
        visible: true,
        onDismiss: jest.fn(),
      },
    });

    const message = screen.getByTestId("snackbar-message");

    expect(message).toHaveTextContent("Comentario publicado");
  });
});
