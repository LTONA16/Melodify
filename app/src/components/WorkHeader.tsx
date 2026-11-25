/**
 * La identidad de una obra (BR8.1, BR8.11): portada de 96, título, artista,
 * estrellas con la media redondeada y «N opiniones». La comparten los dos detalles,
 * y por eso vive aquí y no en C1: solo lo usan esas dos pantallas.
 *
 * La media llega ya redondeada —`.5` hacia arriba, como el resto de la app— porque
 * el redondeo es una regla de la especificación, no una decisión de dibujo, y las
 * dos pantallas tienen que redondear igual.
 *
 * El recuento se escribe en singular cuando es uno: «1 opinión», no «1 opiniones»;
 * una obra recién opinada lo enseña en ese momento (BR5.4, BR10.x).
 */
import {
  CoverArt,
  RatingStars,
  useTheme,
} from "@melodify/design-system";
import { StyleSheet, Text, View } from "react-native";

export interface WorkHeaderProps {
  title: string;
  artist: string;
  coverUrl: string | null;
  /** Media de las valoraciones ya redondeada al entero. */
  average: number;
  opinionCount: number;
}

/** «1 opinión» / «N opiniones»: el singular se escribe, no se deja al azar. */
export function formatOpinionCount(count: number): string {
  return count === 1 ? "1 opinión" : `${count} opiniones`;
}

export function WorkHeader({
  title,
  artist,
  coverUrl,
  average,
  opinionCount,
}: WorkHeaderProps) {
  const theme = useTheme();

  return (
    <View
      testID="work-header"
      style={[styles.root, { gap: theme.space[4], padding: theme.space[4] }]}
    >
      <CoverArt title={title} coverUrl={coverUrl} size="detail" />

      <View style={[styles.identity, { gap: theme.space[1] }]}>
        <Text
          testID="work-header-title"
          numberOfLines={2}
          style={[theme.type.headline, { color: theme.colors.text }]}
        >
          {title}
        </Text>
        <Text
          testID="work-header-artist"
          numberOfLines={1}
          style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
        >
          {artist}
        </Text>
        <View style={[styles.rating, { gap: theme.space[2] }]}>
          <RatingStars rating={average} showValue />
          <Text
            testID="work-header-count"
            style={[theme.type.caption, { color: theme.colors.textMuted }]}
          >
            {formatOpinionCount(opinionCount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
  },
  identity: {
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
