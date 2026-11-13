/**
 * Barra inferior de cinco destinos (C1). Se pinta solo dentro de las pestañas, y
 * nunca en Login. Cada destino mide al menos 44×44, su etiqueta está siempre
 * visible y el estado activo se comunica por color **y** por icono relleno: el
 * color no es el único portador (NFR6.2, NFR6.4).
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TabIcon, TabItem } from "../models";
import { useTheme } from "../useTheme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const ICON_NAMES: Record<TabIcon, { filled: IoniconName; outline: IoniconName }> =
  {
    home: { filled: "home", outline: "home-outline" },
    search: { filled: "search", outline: "search-outline" },
    plus: { filled: "add-circle", outline: "add-circle-outline" },
    activity: { filled: "heart", outline: "heart-outline" },
    profile: { filled: "person", outline: "person-outline" },
  };

export interface BottomTabBarProps {
  items: TabItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function BottomTabBar({
  items,
  activeIndex,
  onSelect,
}: BottomTabBarProps) {
  const theme = useTheme();

  return (
    <View
      testID="bottom-tab-bar"
      accessibilityRole="tablist"
      style={[
        styles.root,
        {
          minHeight: theme.size.tabBar,
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        const names = ICON_NAMES[item.icon];
        const color = active ? theme.colors.primary : theme.colors.textMuted;

        return (
          <Pressable
            key={item.name}
            testID={`tab-${item.name}`}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(index)}
            style={[
              styles.tab,
              {
                minWidth: theme.size.touch,
                minHeight: theme.size.touch,
                paddingVertical: theme.space[1],
              },
            ]}
          >
            <Ionicons
              testID={`tab-icon-${item.name}-${active ? "filled" : "outline"}`}
              name={active ? names.filled : names.outline}
              size={theme.size.icon.base}
              color={color}
            />
            <Text
              testID={`tab-label-${item.name}`}
              style={[theme.type.caption, { color }]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "stretch",
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
