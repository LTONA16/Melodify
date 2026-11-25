/**
 * Cabecera de pantalla (C1 1.2.0): un solo `h1`, altura fija del sistema y una
 * ranura a cada lado para lo que cada pantalla necesite —en Inicio, el chip de
 * Spotify a la derecha; en el detalle, «‹ Volver» a la izquierda—.
 *
 * Por qué una ranura y no una prop `onBack`: volver es una operación que solo
 * posee la cáscara. Una ranura deja que quien compone la cabecera decida qué se
 * pinta (un botón, un icono o nada) sin que C1 conozca la navegación, y es la
 * enmienda aditiva de la revisión 12 del contrato.
 *
 * `app-header` marca el bloque del título —título y ranura derecha—, no la barra
 * entera: es lo que se lee para saber en qué pantalla se está, y el texto de una
 * acción como «‹ Volver» no forma parte de esa respuesta.
 */
import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { useTheme } from "../useTheme";

export interface AppHeaderProps {
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export function AppHeader({ title, leftSlot, rightSlot }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          minHeight: theme.size.header,
          backgroundColor: theme.colors.bg,
          borderBottomColor: theme.colors.border,
          paddingHorizontal: theme.space[4],
        },
      ]}
    >
      {leftSlot ?? null}
      <View testID="app-header" style={styles.main}>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[theme.type.title1, styles.title, { color: theme.colors.text }]}
        >
          {title}
        </Text>
        {rightSlot ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flexShrink: 1,
  },
});
