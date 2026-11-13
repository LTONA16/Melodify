import type { SignInResult } from "@melodify/app-session";
import { ThemeProvider } from "@melodify/design-system";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { LoginScreen } from "../LoginScreen";

type SignInInput = { handle: string; password: string };

const SIGNED_IN: SignInResult = {
  code: 200,
  session: { status: "signedIn", authorId: "demo", remembered: true },
};

function renderLogin(
  signIn: (input: SignInInput) => Promise<SignInResult>,
  onSignedIn: () => void = () => {},
) {
  return render(
    <ThemeProvider scheme="light">
      <LoginScreen session={{ signIn }} onSignedIn={onSignedIn} />
    </ThemeProvider>,
  );
}

function fillCredentials(handle = "demo", password = "demo"): void {
  fireEvent.changeText(screen.getByTestId("login-handle"), handle);
  fireEvent.changeText(screen.getByTestId("login-password"), password);
}

describe("LoginScreen", () => {
  it("pinta los textos exactos de F2 y deja «Entrar» deshabilitado con un campo vacío", () => {
    const signIn = jest.fn(async () => SIGNED_IN);

    renderLogin(signIn);

    expect(screen.getByText("Melodify")).toBeVisible();
    expect(screen.getByText("Opiniones sobre música")).toBeVisible();
    expect(screen.getByTestId("login-handle-label")).toHaveTextContent("Usuario");
    expect(screen.getByTestId("login-password-label")).toHaveTextContent(
      "Contraseña",
    );
    expect(screen.getByTestId("login-handle").props.placeholder).toBe("demo");
    expect(screen.getByTestId("login-handle").props.autoCapitalize).toBe(
      "none",
    );
    expect(screen.getByTestId("login-handle").props.autoFocus).toBe(true);
    expect(screen.getByText("Entrar")).toBeVisible();
    expect(
      screen.getByTestId("login-demo-hint"),
    ).toHaveTextContent("Demo: usuario y contraseña: demo");

    // Con los dos campos vacíos no se puede entrar.
    expect(screen.getByTestId("login-submit").props.accessibilityState).toMatchObject(
      { disabled: true },
    );

    fireEvent.changeText(screen.getByTestId("login-handle"), "demo");

    // Con solo uno relleno, tampoco.
    expect(screen.getByTestId("login-submit").props.accessibilityState).toMatchObject(
      { disabled: true },
    );
  });

  it("habilita «Entrar» cuando los dos campos tienen contenido", () => {
    renderLogin(jest.fn(async () => SIGNED_IN));

    fillCredentials();

    expect(screen.getByTestId("login-submit").props.accessibilityState).toMatchObject(
      { disabled: false },
    );
  });

  it("con demo/demo llama a la sesión y navega a Inicio", async () => {
    const signIn = jest.fn(async () => SIGNED_IN);
    const onSignedIn = jest.fn();

    renderLogin(signIn, onSignedIn);
    fillCredentials();

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    expect(signIn).toHaveBeenCalledWith({ handle: "demo", password: "demo" });
    expect(onSignedIn).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("login-password-error")).toBeNull();
    expect(screen.queryByTestId("login-save-error")).toBeNull();
  });

  it("con credenciales incorrectas pinta el mensaje exacto bajo Contraseña y conserva lo escrito", async () => {
    const signIn = jest.fn(async (): Promise<SignInResult> => ({ code: 401 }));

    renderLogin(signIn);
    fillCredentials("demo", "otra");

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    expect(screen.getByTestId("login-password-error")).toHaveTextContent(
      "Usuario o contraseña incorrectos",
    );
    expect(screen.getByTestId("login-handle").props.value).toBe("demo");
    expect(screen.getByTestId("login-password").props.value).toBe("otra");
    // El botón no se mueve de su sitio ni cambia de etiqueta.
    expect(screen.getByText("Entrar")).toBeVisible();
    expect(screen.queryByTestId("login-save-error")).toBeNull();
  });

  it("si el guardado falla pinta el mensaje bajo el botón y lo convierte en «Reintentar»", async () => {
    const signIn = jest.fn(async (): Promise<SignInResult> => ({ code: 503 }));

    renderLogin(signIn);
    fillCredentials();

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    expect(screen.getByTestId("login-save-error")).toHaveTextContent(
      "No pudimos guardar tu sesión. Inténtalo de nuevo.",
    );
    expect(screen.getByText("Reintentar")).toBeVisible();
    expect(screen.getByTestId("login-handle").props.value).toBe("demo");
    expect(screen.getByTestId("login-password").props.value).toBe("demo");
  });

  it("«Reintentar» repite la entrada con los mismos valores", async () => {
    const signIn = jest.fn(async (): Promise<SignInResult> => ({ code: 503 }));

    renderLogin(signIn);
    fillCredentials("  demo  ", " demo ");

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    expect(signIn).toHaveBeenCalledTimes(2);
    expect(signIn).toHaveBeenNthCalledWith(2, {
      handle: "  demo  ",
      password: " demo ",
    });
  });

  it("limpia el mensaje anterior antes de resolver el intento nuevo y deshabilita el control", async () => {
    let resolveSecond: (result: SignInResult) => void = () => {};
    let attempt = 0;
    const signIn = jest.fn((_input: SignInInput): Promise<SignInResult> => {
      attempt += 1;

      if (attempt === 1) {
        return Promise.resolve({ code: 401 });
      }

      return new Promise<SignInResult>((resolve) => {
        resolveSecond = resolve;
      });
    });

    renderLogin(signIn);
    fillCredentials();

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });
    expect(screen.getByTestId("login-password-error")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("login-submit"));
    });

    // Mientras resuelve no hay mensaje anterior ni segundo intento posible.
    expect(screen.queryByTestId("login-password-error")).toBeNull();
    expect(screen.queryByTestId("login-save-error")).toBeNull();
    expect(screen.getByTestId("login-submit").props.accessibilityState).toMatchObject(
      { disabled: true },
    );

    await act(async () => {
      resolveSecond({ code: 401 });
    });

    expect(screen.getByTestId("login-password-error")).toBeVisible();
  });

  it("escribe la contraseña oculta y el ojo la muestra sin perder lo escrito", () => {
    renderLogin(jest.fn(async () => SIGNED_IN));

    fillCredentials("demo", "secreta");

    expect(screen.getByTestId("login-password").props.secureTextEntry).toBe(
      true,
    );

    fireEvent.press(screen.getByTestId("login-password-toggle-visibility"));

    expect(screen.getByTestId("login-password").props.secureTextEntry).toBe(
      false,
    );
    expect(screen.getByTestId("login-password").props.value).toBe("secreta");
  });
});
