/**
 * Aviso en línea (C1). En U1 no se pinta: queda montado para el aviso de sin
 * conexión de U2, que llega con su propia unidad de red. Lleva texto e icono, no
 * solo color.
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface BannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Banner({ message, actionLabel, onAction }: BannerProps) {
  const theme = useTheme();
  const hasAction = actionLabel !== undefined && onAction !== undefined;

  return (
    <View
      testID="banner"
      accessibilityRole="alert"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.warningContainer,
          borderRadius: theme.radius.md,
          padding: theme.space[4],
          gap: theme.space[2],
        },
      ]}
    >
      <View style={[styles.messageRow, { gap: theme.space[2] }]}>
        <Ionicons
          name="cloud-offline-outline"
          size={theme.size.icon.small}
          color={theme.colors.onWarningContainer}
        />
        <Text
          style={[
            theme.type.bodySmall,
            styles.message,
            { color: theme.colors.onWarningContainer },
          ]}
        >
          {message}
        </Text>
      </View>

      {hasAction ? (
        <Pressable
          testID="banner-action"
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={[styles.action, { minHeight: theme.size.touch }]}
        >
          <Text style={[theme.type.label, { color: theme.colors.onWarningContainer }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  message: {
    flexShrink: 1,
  },
  action: {
    justifyContent: "center",
  },
});
