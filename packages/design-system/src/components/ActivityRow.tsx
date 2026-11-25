/**
 * Fila de actividad de C1 1.5.0. El texto lo decide la pieza a partir de `kind`
 * y del título: ninguna pantalla reescribe estas frases (BR24.2). El icono es
 * decorativo —no tiene etiqueta de accesibilidad— y toda la fila es el objetivo
 * táctil, con el texto completo como etiqueta accesible (NFR6.2).
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ActivityEventSummary } from "../models";
import { formatRelativeTime } from "../relative-time";
import { useTheme } from "../useTheme";

export interface ActivityRowProps {
  event: ActivityEventSummary;
  onPress: () => void;
}

const ICONS: Record<ActivityEventSummary["kind"], string> = {
  ownOpinion: "★",
  likeReceived: "♡",
  commentReceived: "💬",
};

function description(event: ActivityEventSummary): string {
  switch (event.kind) {
    case "ownOpinion":
      return `Publicaste tu opinión de «${event.workTitle}»`;
    case "likeReceived":
      return `A alguien le gustó tu opinión de «${event.workTitle}»`;
    case "commentReceived":
      return `Comentaron tu opinión de «${event.workTitle}»`;
  }
}

export function ActivityRow({ event, onPress }: ActivityRowProps) {
  const theme = useTheme();
  const label = description(event);

  return (
    <Pressable
      testID={`activity-row-${event.eventId}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: theme.size.touch,
          paddingHorizontal: theme.space[4],
          paddingVertical: theme.space[3],
          gap: theme.space[3],
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          backgroundColor: pressed
            ? theme.colors.surfaceSunken
            : theme.colors.surface,
        },
      ]}
    >
      <Text
        testID={`activity-row-icon-${event.eventId}`}
        accessible={false}
        style={[theme.type.title2, { color: theme.colors.primary, width: 28 }]}
      >
        {ICONS[event.kind]}
      </Text>

      <View style={styles.copy}>
        <Text
          testID={`activity-row-text-${event.eventId}`}
          numberOfLines={2}
          style={[theme.type.bodySmall, { color: theme.colors.text }]}
        >
          {label}
        </Text>
        <Text
          testID={`activity-row-time-${event.eventId}`}
          style={[theme.type.caption, { color: theme.colors.textMuted }]}
        >
          {formatRelativeTime(event.createdAt)}
        </Text>
      </View>

      <Text
        testID={`activity-row-chevron-${event.eventId}`}
        accessible={false}
        style={[theme.type.body, { color: theme.colors.textMuted }]}
      >
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
