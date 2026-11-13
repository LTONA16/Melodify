/**
 * Campo de texto de una línea (C1). Muestra la etiqueta, el valor, el error en
 * línea y —cuando se pide— oculta el texto con un control de ojo de 44×44 que no
 * pierde lo escrito.
 *
 * El error va con texto e icono, nunca solo con color (regla de color del
 * sistema), y el borde del campo usa `borderStrong` porque es un control
 * interactivo (NFR6.1).
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useTheme } from "../useTheme";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoFocus?: boolean;
  testID?: string;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = "sentences",
  autoFocus = false,
  testID = "text-field",
}: TextFieldProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const hasError = error !== undefined && error !== "";

  return (
    <View style={styles.root}>
      <Text
        testID={`${testID}-label`}
        style={[theme.type.label, { color: theme.colors.textSecondary }]}
      >
        {label}
      </Text>

      <View style={styles.fieldRow}>
        <TextInput
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry && !visible}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoFocus={autoFocus}
          style={[
            theme.type.body,
            styles.input,
            {
              minHeight: theme.size.field,
              borderRadius: theme.radius.sm,
              paddingHorizontal: theme.space[3],
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: hasError
                ? theme.colors.error
                : theme.colors.borderStrong,
            },
          ]}
        />

        {secureTextEntry ? (
          <Pressable
            testID={`${testID}-toggle-visibility`}
            accessibilityRole="button"
            accessibilityLabel={
              visible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            onPress={() => setVisible((current) => !current)}
            style={[
              styles.eye,
              {
                minWidth: theme.size.touch,
                minHeight: theme.size.touch,
              },
            ]}
          >
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={theme.size.icon.base}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <View style={[styles.errorRow, { gap: theme.space[1] }]}>
          <Ionicons
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
  },
  eye: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    flexShrink: 1,
  },
});
