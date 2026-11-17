/**
 * Campo de varias líneas (C1 1.3.0): el texto de la opinión y el de un comentario.
 *
 * Crece entre `minHeight` (120 por defecto) y 240 con scroll interno, para que el
 * formulario no empuje el botón fuera de la pantalla y el texto largo siga siendo
 * editable. El contador «N/max» aparece desde `counterFrom` y no desde el primer
 * carácter: un «1/500» permanente es ruido, y el umbral es lo que avisa de que
 * queda poco.
 *
 * `label` vacío no pinta etiqueta: la hoja de comentarios no tiene una en el
 * mockup y no se inventa texto visible. El resto de los campos sí la llevan.
 *
 * `autoFocus` no forma parte de la lista del contrato, pero NFR6.8 (TS-23) pide
 * que el foco entre en el campo al abrir la hoja; en vez de que la hoja pinte su
 * propio campo, la pieza lo acepta como prop opcional y el foco sigue viviendo en
 * el texto, no en la pantalla.
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../useTheme";

export interface MultilineFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  counterFrom?: number;
  editable?: boolean;
  minHeight?: number;
  autoFocus?: boolean;
  testID?: string;
}

const MAX_HEIGHT = 240;

export function MultilineField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength,
  counterFrom,
  editable = true,
  minHeight = 120,
  autoFocus = false,
  testID = "multiline-field",
}: MultilineFieldProps) {
  const theme = useTheme();
  const hasError = error !== undefined && error !== "";
  const showCounter =
    counterFrom !== undefined && value.length >= counterFrom;
  const counter =
    maxLength === undefined ? `${value.length}` : `${value.length}/${maxLength}`;

  return (
    <View style={styles.root}>
      {label === "" ? null : (
        <Text
          testID={`${testID}-label`}
          style={[theme.type.label, { color: theme.colors.textSecondary }]}
        >
          {label}
        </Text>
      )}

      <TextInput
        testID={testID}
        accessibilityLabel={label === "" ? undefined : label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        maxLength={maxLength}
        editable={editable}
        multiline
        autoFocus={autoFocus}
        autoCorrect
        scrollEnabled
        textAlignVertical="top"
        style={[
          theme.type.body,
          styles.input,
          {
            minHeight,
            maxHeight: MAX_HEIGHT,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.space[3],
            paddingVertical: theme.space[2],
            backgroundColor: editable
              ? theme.colors.surface
              : theme.colors.surfaceSunken,
            color: editable ? theme.colors.text : theme.colors.textMuted,
            borderColor: hasError
              ? theme.colors.error
              : theme.colors.borderStrong,
          },
        ]}
      />

      <View style={[styles.footerRow, { gap: theme.space[2] }]}>
        {hasError ? (
          <View style={[styles.errorRow, { gap: theme.space[1] }]}>
            <Ionicons
              testID={`${testID}-error-icon`}
              name="alert-circle"
              size={theme.size.icon.small}
              color={theme.colors.error}
            />
            <Text
              testID={`${testID}-error`}
              accessibilityRole="alert"
              style={[
                theme.type.caption,
                styles.errorText,
                { color: theme.colors.error },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : (
          <View />
        )}

        {showCounter ? (
          <Text
            testID={`${testID}-counter`}
            style={[theme.type.caption, { color: theme.colors.textSecondary }]}
          >
            {counter}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  errorText: {
    flexShrink: 1,
  },
});
