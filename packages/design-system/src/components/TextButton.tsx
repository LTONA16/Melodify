/**
 * Botón de texto (C1 1.2.0): la acción secundaria del sistema. Es el único botón
 * de texto de la versión, y por eso lo usan tanto el «Reintentar» de `ErrorState`
 * como el «Cerrar sesión» de Perfil y el «‹ Volver» de la cabecera del detalle.
 *
 * Por qué el área táctil llega a `size.touch`: la etiqueta es corta y el botón no
 * tiene caja visible, así que sin el mínimo de 44 el dedo acierta a medias
 * (NFR6.2). El tono `danger` es el único que cambia de color: el rojo de error se
 * reserva a las acciones destructivas, no a reintentar.
 */
import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../useTheme";

export type TextButtonTone = "default" | "danger";

export interface TextButtonProps {
  label: string;
  onPress: () => void;
  tone?: TextButtonTone;
  disabled?: boolean;
  testID?: string;
}

export function TextButton({
  label,
  onPress,
  tone = "default",
  disabled = false,
  testID = "text-button",
}: TextButtonProps) {
  const theme = useTheme();
  const color = disabled
    ? theme.colors.textMuted
    : tone === "danger"
      ? theme.colors.error
      : theme.colors.primary;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          minHeight: theme.size.touch,
          paddingHorizontal: theme.space[2],
        },
      ]}
    >
      <Text style={[theme.type.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
