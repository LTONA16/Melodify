/**
 * Estado vacío reutilizable (C1 1.2.0). Sin acción cuando no se le pasa una: Inicio
 * sin semilla no inventa un botón (BR3.1).
 *
 * `body` es opcional desde la revisión 12: el vacío de Perfil tiene una sola frase
 * («Todavía no has publicado opiniones.») y sus acciones, e inventarle un cuerpo
 * sería texto de relleno que los mockups no traen.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface EmptyStateProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();
  const hasAction = actionLabel !== undefined && onAction !== undefined;

  return (
    <View
      testID="empty-state"
      style={[styles.root, { padding: theme.space[10] }]}
    >
      <Text
        style={[
          theme.type.title2,
          styles.centered,
          { color: theme.colors.text },
        ]}
      >
        {title}
      </Text>
      {body !== undefined ? (
        <Text
          testID="empty-state-body"
          style={[
            theme.type.body,
            styles.centered,
            { color: theme.colors.textSecondary },
          ]}
        >
          {body}
        </Text>
      ) : null}

      {hasAction ? (
        <Pressable
          testID="empty-state-action"
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={[styles.action, { minHeight: theme.size.touch }]}
        >
          <Text style={[theme.type.label, { color: theme.colors.primary }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: 8,
  },
  centered: {
    textAlign: "center",
  },
  action: {
    justifyContent: "center",
  },
});
