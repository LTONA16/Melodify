/**
 * Contadores de me gusta y comentarios de la tarjeta (C1). Los glifos son texto
 * porque los requisitos los nombran así (FR7.1, FR7.2), y cada control mide al
 * menos 44×44 aunque parezca un símbolo.
 *
 * Con el callback ausente el control no responde: así la tarjeta sembrada de U1 es
 * de lectura sin que ninguna pantalla tenga que inventar un no-op.
 *
 * La 1.3.0 añade `showLike`: con `false` el glifo y el contador se pintan como
 * texto, sin control ni rol, que es lo que pide la opinión propia (Q3 = A). El
 * número sigue visible —lo que se oculta es poder dárselo—.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface SocialActionBarProps {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  showLike?: boolean;
  onLike?: () => void;
  onComment?: () => void;
}

export function SocialActionBar({
  likeCount,
  commentCount,
  likedByMe,
  showLike = true,
  onLike,
  onComment,
}: SocialActionBarProps) {
  const theme = useTheme();
  const touch = theme.size.touch;
  const likeText = `${likedByMe ? "♥" : "♡"} ${likeCount}`;

  return (
    <View testID="social-action-bar" style={styles.row}>
      {showLike ? (
        <Pressable
          testID="social-like"
          accessibilityRole="button"
          accessibilityLabel={
            likedByMe ? "Quitar me gusta" : "Me gusta"
          }
          accessibilityState={{ selected: likedByMe, disabled: onLike === undefined }}
          disabled={onLike === undefined}
          onPress={onLike}
          style={[styles.action, { minWidth: touch, minHeight: touch }]}
        >
          <Text
            style={[
              theme.type.label,
              { color: likedByMe ? theme.colors.error : theme.colors.textSecondary },
            ]}
          >
            {likeText}
          </Text>
        </Pressable>
      ) : (
        // En la opinión propia el número sigue a la vista, pero no es un control:
        // un me gusta propio no se cuenta como recibido (Q3 = A del diseño).
        <View
          testID="social-like"
          style={[styles.action, { minWidth: touch, minHeight: touch }]}
        >
          <Text
            style={[theme.type.label, { color: theme.colors.textSecondary }]}
          >
            {likeText}
          </Text>
        </View>
      )}

      <Pressable
        testID="social-comment"
        accessibilityRole="button"
        accessibilityLabel="Comentarios"
        accessibilityState={{ disabled: onComment === undefined }}
        disabled={onComment === undefined}
        onPress={onComment}
        style={[styles.action, { minWidth: touch, minHeight: touch }]}
      >
        <Text style={[theme.type.label, { color: theme.colors.textSecondary }]}>
          {`💬 ${commentCount}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
  },
});
