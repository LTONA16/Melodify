/**
 * Fila de artista (C1 1.4.0): un atajo de búsqueda, no una obra.
 *
 * No pinta portada de obra ni recuento porque no existen para un artista; el bloque
 * circular con la inicial es toda la imagen que la fila necesita (BR20.6). Toda la
 * fila es el objetivo táctil y el tamaño mínimo de 44 lo garantiza el tema.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ArtistSummary } from "../models";
import { useTheme } from "../useTheme";

export interface ArtistResultRowProps {
  artist: ArtistSummary;
  onPress: () => void;
}

export function ArtistResultRow({ artist, onPress }: ArtistResultRowProps) {
  const theme = useTheme();
  const first = artist.name.trim().charAt(0);

  return (
    <Pressable
      testID={`artist-result-${artist.artistId}`}
      accessibilityRole="button"
      accessibilityLabel={`${artist.name}, Artista`}
      onPress={onPress}
      style={[
        styles.row,
        {
          minHeight: theme.size.touch,
          borderRadius: theme.radius.md,
          padding: theme.space[3],
          gap: theme.space[3],
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        testID="artist-result-avatar"
        style={[
          styles.avatar,
          {
            width: theme.size.cover.result,
            height: theme.size.cover.result,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
      >
        <Text
          style={[theme.type.title2, { color: theme.colors.onPrimaryContainer }]}
        >
          {first === "" ? "?" : first.toUpperCase()}
        </Text>
      </View>

      <View style={styles.texts}>
        <Text
          testID="artist-result-name"
          numberOfLines={1}
          style={[theme.type.bodySmall, { color: theme.colors.text }]}
        >
          {artist.name}
        </Text>
        <Text
          testID="artist-result-kind"
          style={[theme.type.caption, { color: theme.colors.textMuted }]}
        >
          Artista
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
