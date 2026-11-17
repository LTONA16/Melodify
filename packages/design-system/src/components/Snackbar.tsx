/**
 * Franja de aviso (C1 1.3.0): un solo mensaje, sin acciones, que se va a los 4 s.
 *
 * El temporizador es de la propia pieza (TS-29) y no se reinicia al volver a
 * pintar el mismo mensaje que ya estaba: el efecto depende de `visible` y de
 * `onDismiss`, y quien la monta entrega un `onDismiss` estable. Un aviso que se
 * recreara cada segundo no llegaría a irse nunca.
 *
 * No se posiciona a sí misma: quien la monta decide dónde va —la cáscara sobre la
 * barra inferior, la hoja de comentarios dentro del modal—. Así la misma franja
 * sirve en los dos sitios sin una prop de coordenadas que el sistema de diseño no
 * necesita.
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export const SNACKBAR_DURATION_MS = 4000;

export interface SnackbarProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function Snackbar({ message, visible, onDismiss }: SnackbarProps) {
  const theme = useTheme();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(onDismiss, SNACKBAR_DURATION_MS);

    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) {
    return null;
  }

  return (
    <View
      testID="snackbar"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.inverseSurface,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.space[4],
          paddingVertical: theme.space[3],
        },
      ]}
    >
      <Text
        testID="snackbar-message"
        style={[theme.type.bodySmall, { color: theme.colors.inverseText }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
  },
});
