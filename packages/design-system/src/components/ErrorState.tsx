/**
 * Error con reintento (C1 1.2.0): la pieza de todo error que la persona puede
 * repetir. El mensaje llega ya escrito por la pantalla —en español y en lenguaje
 * llano— y la etiqueta del reintento también, porque el contrato pide «Reintentar»
 * y no una palabra que C1 decida por su cuenta.
 *
 * El mensaje es el texto principal, no un pie: es lo único que explica qué pasó, y
 * el botón queda debajo para que se lea antes de tocarlo (FR11.2).
 */
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { TextButton } from "./TextButton";

export interface ErrorStateProps {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}

export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      testID="error-state"
      accessibilityRole="alert"
      style={[
        styles.root,
        {
          padding: theme.space[8],
          gap: theme.space[3],
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text
        testID="error-state-message"
        style={[
          theme.type.body,
          styles.centered,
          { color: theme.colors.text },
        ]}
      >
        {message}
      </Text>
      <TextButton
        label={retryLabel}
        onPress={onRetry}
        testID="error-state-retry"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    borderWidth: 1,
  },
  centered: {
    textAlign: "center",
  },
});
