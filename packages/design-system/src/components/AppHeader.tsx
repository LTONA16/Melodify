/**
 * Cabecera de pantalla (C1): un solo `h1`, altura fija del sistema y una ranura a
 * la derecha para lo que cada pantalla necesite —en Inicio, el chip de Spotify—.
 */
import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { useTheme } from "../useTheme";

export interface AppHeaderProps {
  title: string;
  rightSlot?: ReactNode;
}

export function AppHeader({ title, rightSlot }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View
      testID="app-header"
      style={[
        styles.root,
        {
          minHeight: theme.size.header,
          backgroundColor: theme.colors.bg,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.space[4],
        },
      ]}
    >
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={[theme.type.title1, styles.title, { color: theme.colors.text }]}
      >
        {title}
      </Text>
      {rightSlot ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  title: {
    flexShrink: 1,
  },
});
