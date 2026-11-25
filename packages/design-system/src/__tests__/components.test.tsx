import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { Avatar } from "../components/Avatar";
import { Banner } from "../components/Banner";
import { CoverArt } from "../components/CoverArt";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { RatingStars } from "../components/RatingStars";
import { Skeleton } from "../components/Skeleton";
import { SocialActionBar } from "../components/SocialActionBar";
import { TextField } from "../components/TextField";
import { ThemeProvider } from "../ThemeProvider";

function renderWithTheme(node: React.ReactElement) {
  return render(<ThemeProvider scheme="light">{node}</ThemeProvider>);
}

describe("CoverArt", () => {
  it("pinta el bloque con la inicial cuando la portada es nula", () => {
    renderWithTheme(<CoverArt title="cielo de neón" coverUrl={null} size="card" />);

    expect(screen.getByTestId("cover-initial")).toHaveTextContent("C");
  });

  it("pinta la imagen recibida cuando hay portada", () => {
    renderWithTheme(
      <CoverArt
        title="Cielo de Neón"
        coverUrl="https://example.test/cover.png"
        size="result"
      />,
    );

    expect(screen.getByTestId("cover-art").props.source).toEqual({
      uri: "https://example.test/cover.png",
    });
  });
});

describe("TextField", () => {
  it("pinta la etiqueta y el error en línea", () => {
    renderWithTheme(
      <TextField
        label="Contraseña"
        value="demo"
        onChange={() => {}}
        error="Usuario o contraseña incorrectos"
        testID="login-password"
      />,
    );

    expect(screen.getByTestId("login-password-label")).toHaveTextContent(
      "Contraseña",
    );
    expect(screen.getByTestId("login-password-error")).toHaveTextContent(
      "Usuario o contraseña incorrectos",
    );
  });

  it("oculta la contraseña y el control de ojo la muestra sin perder el texto", () => {
    renderWithTheme(
      <TextField
        label="Contraseña"
        value="demo"
        onChange={() => {}}
        secureTextEntry
        testID="login-password"
      />,
    );

    const input = () => screen.getByTestId("login-password");
    expect(input().props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getByTestId("login-password-toggle-visibility"));

    expect(input().props.secureTextEntry).toBe(false);
    expect(input().props.value).toBe("demo");
  });

  it("no pinta error ni control de ojo cuando no corresponden", () => {
    renderWithTheme(
      <TextField label="Usuario" value="" onChange={() => {}} />,
    );

    expect(screen.queryByTestId("text-field-error")).toBeNull();
    expect(screen.queryByTestId("text-field-toggle-visibility")).toBeNull();
  });
});

describe("PrimaryButton", () => {
  it("pinta la etiqueta recibida y avisa al tocarlo", () => {
    const onPress = jest.fn();

    renderWithTheme(
      <PrimaryButton label="Entrar" onPress={onPress} testID="login-submit" />,
    );

    fireEvent.press(screen.getByTestId("login-submit"));

    expect(screen.getByText("Entrar")).toBeVisible();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("deshabilitado no dispara la acción", () => {
    const onPress = jest.fn();

    renderWithTheme(
      <PrimaryButton
        label="Entrar"
        onPress={onPress}
        disabled
        testID="login-submit"
      />,
    );

    fireEvent.press(screen.getByTestId("login-submit"));

    expect(onPress).not.toHaveBeenCalled();
    expect(
      screen.getByTestId("login-submit").props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it("cargando muestra actividad y no dispara la acción", () => {
    const onPress = jest.fn();

    renderWithTheme(
      <PrimaryButton label="Entrar" onPress={onPress} loading testID="login-submit" />,
    );

    fireEvent.press(screen.getByTestId("login-submit"));

    expect(screen.getByTestId("login-submit-loading")).toBeTruthy();
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("EmptyState", () => {
  it("pinta el título y el cuerpo sin acción cuando no la recibe", () => {
    renderWithTheme(
      <EmptyState
        title="Aún no hay opiniones. Sé el primero."
        body="Cuando alguien comparta lo que escucha, aparecerá aquí."
      />,
    );

    expect(
      screen.getByText("Aún no hay opiniones. Sé el primero."),
    ).toBeVisible();
    expect(screen.queryByTestId("empty-state-action")).toBeNull();
  });

  it("pinta la acción cuando se le pasa", () => {
    const onAction = jest.fn();

    renderWithTheme(
      <EmptyState
        title="Sin resultados"
        body="Prueba con otra búsqueda."
        actionLabel="Reintentar"
        onAction={onAction}
      />,
    );

    fireEvent.press(screen.getByTestId("empty-state-action"));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("omite el cuerpo cuando no se le pasa", () => {
    renderWithTheme(<EmptyState title="Todavía no has publicado opiniones." />);

    expect(screen.queryByTestId("empty-state-body")).toBeNull();
    expect(
      screen.getByText("Todavía no has publicado opiniones."),
    ).toBeVisible();
  });
});

describe("Banner", () => {
  it("pinta el mensaje y su acción", () => {
    const onAction = jest.fn();

    renderWithTheme(
      <Banner
        message="Sin conexión"
        actionLabel="Reintentar"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Sin conexión")).toBeVisible();

    fireEvent.press(screen.getByTestId("banner-action"));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("sin acción solo pinta el mensaje", () => {
    renderWithTheme(<Banner message="Sin conexión" />);

    expect(screen.queryByTestId("banner-action")).toBeNull();
  });
});

describe("AppHeader", () => {
  it("pinta el título y la ranura derecha", () => {
    renderWithTheme(
      <AppHeader title="Inicio" rightSlot={<Text>Conectar</Text>} />,
    );

    expect(screen.getByText("Inicio")).toBeVisible();
    expect(screen.getByText("Conectar")).toBeVisible();
  });

  it("pinta solo el título cuando no hay ranura", () => {
    renderWithTheme(<AppHeader title="Perfil" />);

    expect(screen.getByText("Perfil")).toBeVisible();
  });

  it("pinta la ranura izquierda además del título", () => {
    renderWithTheme(
      <AppHeader title="Detalle de obra" leftSlot={<Text>‹ Volver</Text>} />,
    );

    expect(screen.getByText("‹ Volver")).toBeVisible();
    expect(screen.getByText("Detalle de obra")).toBeVisible();
  });
});

describe("RatingStars", () => {
  it("rellena tantas estrellas como la valoración y pinta el número", () => {
    renderWithTheme(<RatingStars rating={4} showValue />);

    expect(screen.getByTestId("star-4")).toHaveTextContent("★");
    expect(screen.getByTestId("star-5")).toHaveTextContent("☆");
    expect(screen.getByTestId("rating-value")).toHaveTextContent("4 de 5");
  });

  it("no pinta el número si no se pide", () => {
    renderWithTheme(<RatingStars rating={3} />);

    expect(screen.queryByTestId("rating-value")).toBeNull();
  });
});

describe("Avatar", () => {
  it("pinta la inicial del autor", () => {
    renderWithTheme(
      <Avatar author={{ displayName: "ana ruiz", handle: "anaruiz" }} />,
    );

    expect(screen.getByTestId("avatar")).toHaveTextContent("A");
  });

  it("usa la inicial de reserva con un nombre vacío", () => {
    renderWithTheme(<Avatar author={{ displayName: "  ", handle: "x" }} />);

    expect(screen.getByTestId("avatar")).toHaveTextContent("?");
  });
});

describe("SocialActionBar", () => {
  it("pinta los contadores que recibe", () => {
    renderWithTheme(
      <SocialActionBar likeCount={0} commentCount={0} likedByMe={false} />,
    );

    expect(screen.getByTestId("social-like")).toHaveTextContent("♡ 0");
    expect(screen.getByTestId("social-comment")).toHaveTextContent("💬 0");
  });

  it("avisa de cada acción cuando recibe sus callbacks", () => {
    const onLike = jest.fn();
    const onComment = jest.fn();

    renderWithTheme(
      <SocialActionBar
        likeCount={2}
        commentCount={1}
        likedByMe
        onLike={onLike}
        onComment={onComment}
      />,
    );

    fireEvent.press(screen.getByTestId("social-like"));
    fireEvent.press(screen.getByTestId("social-comment"));

    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onComment).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("social-like")).toHaveTextContent("♥ 2");
  });
});

describe("Skeleton", () => {
  it("pinta tantos bloques como se le piden", () => {
    renderWithTheme(<Skeleton shape="card" count={2} />);

    expect(screen.getByTestId("skeleton-card-1")).toBeTruthy();
    expect(screen.getByTestId("skeleton-card-2")).toBeTruthy();
    expect(screen.queryByTestId("skeleton-card-3")).toBeNull();
  });

  it("pinta al menos un bloque aunque el número sea cero", () => {
    renderWithTheme(<Skeleton shape="row" count={0} />);

    expect(screen.getByTestId("skeleton-row-1")).toBeTruthy();
  });
});
