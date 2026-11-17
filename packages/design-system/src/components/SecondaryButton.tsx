/**
 * Botón secundario (C1 1.3.0): borde y sin fondo, para la acción que acompaña a
 * la principal sin competir con ella (por ejemplo, «Cambiar» de la obra elegida).
 *
 * Comparte el mínimo de 48 de alto con `PrimaryButton` y el área táctil de 44 de
 * todo el sistema (NFR6.2): la jerarquía se ve en el color, no en el tamaño.
 */
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../useTheme";

export interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: SecondaryButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      testID="secondary-button"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          minHeight: theme.size.button,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.space[5],
          borderColor: disabled ? theme.colors.border : theme.colors.borderStrong,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <Text
        style={[
          theme.type.label,
          { color: disabled ? theme.colors.textMuted : theme.colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
});
