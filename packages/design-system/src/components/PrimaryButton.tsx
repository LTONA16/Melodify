/**
 * Botón principal (C1). Deshabilitado no dispara nada y se ve distinto; cargando
 * muestra actividad y tampoco responde. La etiqueta la decide quien lo usa, así
 * que «Entrar» puede pasar a «Reintentar» sin cambiar la pieza.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../useTheme";

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  testID = "primary-button",
}: PrimaryButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.button,
        {
          minHeight: theme.size.button,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.space[5],
          backgroundColor: inactive
            ? theme.colors.surfaceSunken
            : theme.colors.primary,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          testID={`${testID}-loading`}
          color={theme.colors.onPrimary}
        />
      ) : (
        <Text
          style={[
            theme.type.label,
            {
              color: inactive ? theme.colors.textMuted : theme.colors.onPrimary,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
