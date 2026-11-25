import { fireEvent, render, screen } from "@testing-library/react-native";

import { SocialActionBar } from "../components/SocialActionBar";
import { ThemeProvider } from "../ThemeProvider";

/**
 * La barra de acciones de C1 1.3.0. La novedad es `showLike`: en la opinión
 * propia el número sigue a la vista pero no hay control ni rol, para que un me
 * gusta propio no se lea como recibido (Q3 = A).
 */
function renderBar(
  props: Partial<Parameters<typeof SocialActionBar>[0]> = {},
) {
  const onLike = jest.fn();
  const onComment = jest.fn();

  render(
    <ThemeProvider scheme="light">
      <SocialActionBar
        likeCount={2}
        commentCount={1}
        likedByMe={false}
        onLike={onLike}
        onComment={onComment}
        {...props}
      />
    </ThemeProvider>,
  );

  return { onLike, onComment };
}

describe("SocialActionBar con showLike apagado", () => {
  it("conserva el número visible", () => {
    renderBar({ showLike: false });

    expect(screen.getByTestId("social-like")).toHaveTextContent("♡ 2");
  });

  it("no hay control con rol de botón ni responde al toque", () => {
    const { onLike } = renderBar({ showLike: false });

    const like = screen.getByTestId("social-like");

    expect(like.props.accessibilityRole).toBeUndefined();
    expect(like.props.accessibilityState).toBeUndefined();

    fireEvent.press(like);

    expect(onLike).not.toHaveBeenCalled();
  });

  it("el comentario sigue siendo un botón", () => {
    const { onComment } = renderBar({ showLike: false });

    fireEvent.press(screen.getByTestId("social-comment"));

    expect(onComment).toHaveBeenCalledTimes(1);
  });

  it("por defecto el me gusta sí se puede dar", () => {
    const { onLike } = renderBar();

    fireEvent.press(screen.getByTestId("social-like"));

    expect(onLike).toHaveBeenCalledTimes(1);
  });
});
