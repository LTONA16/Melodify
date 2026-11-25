/**
 * La invitación a conectar Spotify (C1 1.3.0): título, explicación y una acción.
 *
 * Es una tarjeta de `surfaceRaised` con borde, como el resto del sistema: aquí no
 * hay sombras ni elevación. El sistema de diseño no sabe qué es Spotify; recibe el
 * texto y el callback, y por eso la acción puede seguir sin efecto hasta U4 sin que
 * nada de esta pieza cambie (BR11.9).
 */
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";
import { PrimaryButton } from "./PrimaryButton";

export interface ConnectionCardProps {
  title: string;
  body: string;
  /**
   * La acción es opcional a propósito: cuando no hay nada que la persona pueda
   * hacer —una instalación sin client ID, por ejemplo— un botón que no cambia
   * nada se lee como una app rota. Sin `actionLabel` la tarjeta informa y calla.
   */
  actionLabel?: string;
  onAction?: () => void;
  /** Mientras la acción está en curso se muestra, pero no se puede repetir. */
  actionDisabled?: boolean;
}

export function ConnectionCard({
  title,
  body,
  actionLabel,
  onAction,
  actionDisabled = false,
}: ConnectionCardProps) {
  const theme = useTheme();

  return (
    <View
      testID="connection-card"
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.space[4],
          gap: theme.space[3],
        },
      ]}
    >
      <Text
        testID="connection-card-title"
        style={[theme.type.headline, { color: theme.colors.text }]}
      >
        {title}
      </Text>
      <Text
        testID="connection-card-body"
        style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
      >
        {body}
      </Text>
      {actionLabel === undefined ? null : (
        <PrimaryButton
          testID="connection-card-action"
          label={actionLabel}
          onPress={onAction ?? (() => undefined)}
          disabled={actionDisabled}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
