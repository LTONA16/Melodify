/**
 * Buscador de una línea (C1 1.3.0). Pinta la lupa, el campo, el indicador de
 * espera y la ✕ que limpia.
 *
 * No temporiza y no busca: el disparo, los 400 ms y los 2 caracteres mínimos son
 * del contenedor (BR13.1). Si esta pieza esperara para avisar, la pantalla de
 * Crear no podría decidir cuándo parar y las pruebas tendrían dos relojes.
 *
 * La ✕ solo aparece con texto y con `onClear`; igual que el corazón de la
 * tarjeta, sin callback no hay control, solo el campo.
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../useTheme";

export interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClear?: () => void;
}

export function SearchField({
  value,
  onChangeText,
  placeholder = "Busca en Spotify…",
  autoFocus = false,
  disabled = false,
  loading = false,
  onClear,
}: SearchFieldProps) {
  const theme = useTheme();
  const showClear = !loading && !disabled && value !== "" && onClear !== undefined;

  return (
    <View
      testID="search-field"
      style={[
        styles.root,
        {
          minHeight: theme.size.field,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.space[3],
          gap: theme.space[2],
          backgroundColor: disabled
            ? theme.colors.surfaceSunken
            : theme.colors.surface,
          borderColor: theme.colors.borderStrong,
          opacity: disabled ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons
        testID="search-field-icon"
        name="search"
        size={theme.size.icon.small}
        color={theme.colors.textSecondary}
      />

      <TextInput
        testID="search-field-input"
        accessibilityLabel="Buscar en Spotify"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        returnKeyType="search"
        style={[
          theme.type.body,
          styles.input,
          {
            color: disabled ? theme.colors.textMuted : theme.colors.text,
            minHeight: theme.size.field,
          },
        ]}
      />

      {loading ? (
        <ActivityIndicator
          testID="search-field-loading"
          color={theme.colors.primary}
        />
      ) : null}

      {showClear ? (
        <Pressable
          testID="search-field-clear"
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          onPress={onClear}
          style={[
            styles.clear,
            {
              minWidth: theme.size.touch,
              minHeight: theme.size.touch,
            },
          ]}
        >
          <Ionicons
            name="close"
            size={theme.size.icon.base}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  clear: {
    alignItems: "center",
    justifyContent: "center",
  },
});
