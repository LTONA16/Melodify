/**
 * Valoración del formulario (C1 1.3.0): cinco estrellas de 44×44 y la lectura en
 * palabras debajo («Sin valorar» o «n de 5»).
 *
 * Repetir el toque **no borra**: la persona quita la valoración con la acción de
 * texto de la pantalla, no adivinando que un segundo toque la deja a cero
 * (BR11.4). Por eso aquí no hay alternancia.
 *
 * El grupo se anuncia como `radiogroup` y cada estrella como `radio` seleccionada:
 * es una elección entre cinco, no cinco botones sueltos.
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const STARS = [1, 2, 3, 4, 5];

export function RatingInput({
  value,
  onChange,
  disabled = false,
}: RatingInputProps) {
  const theme = useTheme();
  const selected = Math.min(5, Math.max(0, Math.round(value)));

  return (
    <View style={styles.root}>
      <View
        testID="rating-input"
        accessibilityRole="radiogroup"
        accessibilityLabel="Valoración"
        style={styles.row}
      >
        {STARS.map((star) => {
          const isOn = star <= selected;

          return (
            <Pressable
              key={star}
              testID={`rating-input-star-${star}`}
              accessibilityRole="radio"
              accessibilityLabel={`${star} de 5`}
              accessibilityState={{ selected: star === selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(star)}
              style={[
                styles.star,
                {
                  minWidth: theme.size.touch,
                  minHeight: theme.size.touch,
                  opacity: disabled ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons
                name={isOn ? "star" : "star-outline"}
                size={theme.size.icon.base}
                color={theme.colors.accentStar}
              />
            </Pressable>
          );
        })}
      </View>

      <Text
        testID="rating-input-value"
        style={[
          theme.type.caption,
          { color: theme.colors.textSecondary },
        ]}
      >
        {selected === 0 ? "Sin valorar" : `${selected} de 5`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    alignItems: "center",
    justifyContent: "center",
  },
});
