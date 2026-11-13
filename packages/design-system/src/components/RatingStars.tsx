/**
 * Valoración con estrellas y número (C1). El color nunca es el único portador de
 * significado: cada estrella tiene su glifo y, con `showValue`, el número se lee
 * al lado (regla de color del sistema).
 */
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface RatingStarsProps {
  rating: number;
  max?: number;
  showValue?: boolean;
}

export function RatingStars({ rating, max = 5, showValue }: RatingStarsProps) {
  const theme = useTheme();
  const safeMax = Math.max(1, Math.floor(max));
  const filled = Math.min(safeMax, Math.max(0, Math.round(rating)));

  return (
    <View testID="rating-stars" style={styles.row}>
      {Array.from({ length: safeMax }, (_value, index) => (
        <Text
          key={index}
          testID={`star-${index + 1}`}
          style={[theme.type.caption, { color: theme.colors.accentStar }]}
        >
          {index < filled ? "★" : "☆"}
        </Text>
      ))}
      {showValue === true ? (
        <Text
          testID="rating-value"
          style={[
            theme.type.caption,
            styles.value,
            { color: theme.colors.accentStar },
          ]}
        >
          {`${rating} de ${safeMax}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  value: {
    marginLeft: 4,
  },
});
