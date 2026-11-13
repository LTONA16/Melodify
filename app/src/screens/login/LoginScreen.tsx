/**
 * Login (F2, BR1.5, BR1.6): la única pantalla de entrada de la app. Vive fuera de
 * la barra inferior y la cáscara se encarga de que no se pueda abandonar sin
 * entrar; aquí solo se pinta el formulario y se resuelve la entrada.
 *
 * Decisiones de la pantalla:
 * - El formulario no compara credenciales: llama a `session.signIn` y decide con
 *   el código de respuesta. La comparación y el recorte de espacios viven en C3
 *   para que la regla sea una sola (BR1.1).
 * - El error de credenciales se pinta bajo Contraseña, dentro del propio campo;
 *   el de guardado, bajo el botón y con acción propia («Reintentar»), porque es
 *   el único de esta unidad que se puede repetir sin salir de la pantalla (F2).
 * - El botón no se deshabilita al fallar: «Reintentar» repite la entrada con lo
 *   escrito, sin limpiar ningún campo.
 */
import type { AppSession } from "@melodify/app-session";
import { PrimaryButton, TextField, useTheme } from "@melodify/design-system";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Los dos únicos errores de la unidad, con el texto exacto de F2. */
export type LoginError = "credentials" | "save" | null;

const CREDENTIALS_ERROR = "Usuario o contraseña incorrectos";
const SAVE_ERROR = "No pudimos guardar tu sesión. Inténtalo de nuevo.";

export interface LoginScreenProps {
  session: Pick<AppSession, "signIn">;
  onSignedIn: () => void;
}

export function LoginScreen({ session, onSignedIn }: LoginScreenProps) {
  const theme = useTheme();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    handle.length > 0 && password.length > 0 && !submitting;

  async function submit(): Promise<void> {
    if (!canSubmit) {
      return;
    }

    // «Entrar» cierra el teclado y el mensaje anterior se limpia antes de
    // resolver el intento nuevo: solo se pinta el que corresponda (F2).
    Keyboard.dismiss();
    setError(null);
    setSubmitting(true);

    try {
      const result = await session.signIn({ handle, password });

      if (result.code === 200) {
        onSignedIn();
        return;
      }

      setError(result.code === 401 ? "credentials" : "save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        testID="login-screen"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { padding: theme.space[5], gap: theme.space[5] },
        ]}
      >
        <View style={{ gap: theme.space[1] }}>
          <Text
            accessibilityRole="header"
            style={[theme.type.display, { color: theme.colors.text }]}
          >
            Melodify
          </Text>
          <Text
            style={[theme.type.body, { color: theme.colors.textSecondary }]}
          >
            Opiniones sobre música
          </Text>
        </View>

        <View style={{ gap: theme.space[3] }}>
          <TextField
            testID="login-handle"
            label="Usuario"
            value={handle}
            onChange={setHandle}
            placeholder="demo"
            autoCapitalize="none"
            autoFocus
          />

          <TextField
            testID="login-password"
            label="Contraseña"
            value={password}
            onChange={setPassword}
            secureTextEntry
            error={error === "credentials" ? CREDENTIALS_ERROR : undefined}
          />
        </View>

        <View style={{ gap: theme.space[2] }}>
          <PrimaryButton
            testID="login-submit"
            label={error === "save" ? "Reintentar" : "Entrar"}
            onPress={() => {
              void submit();
            }}
            disabled={!canSubmit}
          />

          {error === "save" ? (
            <Text
              testID="login-save-error"
              accessibilityRole="alert"
              style={[theme.type.caption, { color: theme.colors.error }]}
            >
              {SAVE_ERROR}
            </Text>
          ) : null}
        </View>

        <Text
          testID="login-demo-hint"
          style={[theme.type.caption, { color: theme.colors.textMuted }]}
        >
          Demo: usuario y contraseña: demo
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    justifyContent: "center",
    flexGrow: 1,
  },
});
