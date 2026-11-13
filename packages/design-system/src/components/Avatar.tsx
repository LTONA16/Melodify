/**
 * Avatar circular con la inicial del autor (C1). Sin imágenes ni carga: el nombre
 * basta y el círculo se lee igual con el tema claro y con el oscuro.
 */
import { StyleSheet, Text, View } from "react-native";

import type { AuthorSummary, AvatarSize } from "../models";
import { useTheme } from "../useTheme";

export interface AvatarProps {
  author: AuthorSummary;
  size?: AvatarSize;
}

export function Avatar({ author, size = "medium" }: AvatarProps) {
  const theme = useTheme();
  const dimension =
    size === "large"
      ? theme.size.avatar.profile
      : size === "small"
        ? theme.size.avatar.base - theme.space[2]
        : theme.size.avatar.base;
  const first = author.displayName.trim().charAt(0);

  return (
    <View
      testID="avatar"
      accessibilityLabel={author.displayName}
      style={[
        styles.circle,
        {
          width: dimension,
          height: dimension,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      <Text
        style={[
          size === "large" ? theme.type.title2 : theme.type.label,
          { color: theme.colors.onPrimaryContainer },
        ]}
      >
        {first === "" ? "?" : first.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
});
