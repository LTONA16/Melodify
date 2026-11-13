/**
 * Portada de una obra (C1). Si no hay imagen, pinta el bloque con la inicial: la
 * tarjeta nunca deja un hueco roto (FR11.3). El tamaño lo fija el token `cover`,
 * así que la misma pieza sirve en la tarjeta, en el resultado y en el detalle.
 */
import { Image, StyleSheet, Text, View } from "react-native";

import type { CoverSize } from "../models";
import { useTheme } from "../useTheme";

export interface CoverArtProps {
  title: string;
  coverUrl: string | null;
  size: CoverSize;
}

function initialOf(title: string): string {
  const first = title.trim().charAt(0);
  return first === "" ? "?" : first.toUpperCase();
}

export function CoverArt({ title, coverUrl, size }: CoverArtProps) {
  const theme = useTheme();
  // El token de portada se llama `feed` para la tarjeta; el tamaño de C1 usa
  // `card`, así que el mapeo se declara aquí y no se inventa un token paralelo.
  const dimension = {
    card: theme.size.cover.feed,
    result: theme.size.cover.result,
    detail: theme.size.cover.detail,
  }[size];
  const borderRadius = theme.radius.sm;

  if (coverUrl !== null) {
    return (
      <Image
        testID="cover-art"
        accessibilityLabel={`Portada de ${title}`}
        source={{ uri: coverUrl }}
        style={{ width: dimension, height: dimension, borderRadius }}
      />
    );
  }

  return (
    <View
      testID="cover-art"
      accessibilityLabel={`Portada de ${title}`}
      style={[
        styles.block,
        {
          width: dimension,
          height: dimension,
          borderRadius,
          backgroundColor: theme.colors.surfaceSunken,
        },
      ]}
    >
      <Text
        testID="cover-initial"
        style={[theme.type.title2, { color: theme.colors.textSecondary }]}
      >
        {initialOf(title)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: "center",
    justifyContent: "center",
  },
});
