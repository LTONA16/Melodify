/**
 * Fila de obra (C1 1.3.0): el resultado del buscador y la obra del selector de
 * ejemplo. Portada, título, artista y el recuento de opiniones.
 *
 * El recuento se escribe con palabras y en singular cuando toca; sin opiniones no
 * se pinta un «0 opiniones» que parezca un error, sino la invitación de la
 * historia (US5.2). La fila entera es el objetivo táctil, así que no lleva una
 * acción aparte que compita con ella.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { WorkSummary } from "../models";
import { useTheme } from "../useTheme";
import { CoverArt } from "./CoverArt";

export interface WorkResultRowProps {
  work: WorkSummary;
  opinionCount: number;
  onPress: () => void;
}

function opinionsLabel(count: number): string {
  if (count <= 0) {
    return "Sé el primero en opinar";
  }
  if (count === 1) {
    return "1 opinión";
  }
  return `${count} opiniones`;
}

export function WorkResultRow({
  work,
  opinionCount,
  onPress,
}: WorkResultRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      testID={`work-result-${work.workId}`}
      accessibilityRole="button"
      accessibilityLabel={`${work.title}, de ${work.artist}`}
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
      <CoverArt title={work.title} coverUrl={work.coverUrl} size="result" />

      <View style={styles.texts}>
        <Text
          testID="work-result-title"
          numberOfLines={1}
          style={[theme.type.bodySmall, { color: theme.colors.text }]}
        >
          {work.title}
        </Text>
        <Text
          testID="work-result-artist"
          numberOfLines={1}
          style={[theme.type.caption, { color: theme.colors.textSecondary }]}
        >
          {work.artist}
        </Text>
        <Text
          testID="work-result-opinions"
          style={[theme.type.caption, { color: theme.colors.textMuted }]}
        >
          {opinionsLabel(opinionCount)}
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
  texts: {
    flex: 1,
    gap: 2,
  },
});
