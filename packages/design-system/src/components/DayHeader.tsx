/**
 * Encabezado de día de C1 1.5.0: la cabecera pegajosa de cada grupo de la
 * Actividad. No es tocable y no decide la etiqueta: la recibe ya escrita («Hoy»,
 * «Ayer» o una fecha) de la vista (BR22.2).
 */
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../useTheme";

export interface DayHeaderProps {
  label: string;
}

export function DayHeader({ label }: DayHeaderProps) {
  const theme = useTheme();

  return (
    <View
      testID="day-header"
      style={[
        styles.header,
        {
          height: 32,
          paddingHorizontal: theme.space[4],
          backgroundColor: theme.colors.bg,
          justifyContent: "center",
        },
      ]}
    >
      <Text
        testID="day-header-label"
        style={[theme.type.label, { color: theme.colors.textSecondary }]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "center",
  },
});
