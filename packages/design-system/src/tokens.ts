/**
 * Tokens crudos del sistema de diseño (C1), con los valores de
 * `design-system-mapping.md`. Ningún componente ni pantalla importa este archivo:
 * se consume el tema activo con `useTheme()`, que entrega los mismos tokens ya
 * resueltos. Así el tema oscuro es consecuencia del token y no una condición
 * repartida por el código.
 */
import type { TextStyle } from "react-native";

/** Los veintiocho roles de color de la paleta, iguales en los dos temas. */
export interface ColorRoles {
  bg: string;
  surface: string;
  surfaceSunken: string;
  surfaceRaised: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  accentStar: string;
  success: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  warningContainer: string;
  onWarningContainer: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
  focusRing: string;
  inverseSurface: string;
  inverseText: string;
}

export const lightColors: ColorRoles = {
  bg: "#FFFFFF",
  surface: "#F7F5F9",
  surfaceSunken: "#EFEBF2",
  surfaceRaised: "#FFFFFF",
  text: "#1B1B1F",
  textSecondary: "#5A5A63",
  textMuted: "#6E6A75",
  border: "#D6D2D9",
  borderStrong: "#6F6A75",
  primary: "#7B2D8E",
  onPrimary: "#FFFFFF",
  primaryContainer: "#F3E3F7",
  onPrimaryContainer: "#3B0A47",
  accentStar: "#8F5400",
  success: "#1E6B3A",
  error: "#B3261E",
  onError: "#FFFFFF",
  errorContainer: "#FCEEEE",
  onErrorContainer: "#6B1A16",
  warningContainer: "#FFF4D6",
  onWarningContainer: "#5C3D00",
  overlay: "rgba(18, 16, 20, 0.4)",
  skeleton: "#E7E3EA",
  skeletonHighlight: "#F3F0F6",
  focusRing: "#7B2D8E",
  inverseSurface: "#2E2A33",
  inverseText: "#F7F5F9",
};

export const darkColors: ColorRoles = {
  bg: "#121014",
  surface: "#1D1A21",
  surfaceSunken: "#171419",
  surfaceRaised: "#262230",
  text: "#F2EFF4",
  textSecondary: "#C9C3CE",
  textMuted: "#9E97A6",
  border: "#3A3540",
  borderStrong: "#8C8698",
  primary: "#E9B8F5",
  onPrimary: "#3B0A47",
  primaryContainer: "#3E1D49",
  onPrimaryContainer: "#F3E3F7",
  accentStar: "#FFC46B",
  success: "#7BD99B",
  error: "#FFB4AB",
  onError: "#5F1410",
  errorContainer: "#3B1214",
  onErrorContainer: "#FFDAD6",
  warningContainer: "#3A2A00",
  onWarningContainer: "#FFD98E",
  overlay: "rgba(0, 0, 0, 0.6)",
  skeleton: "#2A2630",
  skeletonHighlight: "#353040",
  focusRing: "#E9B8F5",
  inverseSurface: "#EDE8F2",
  inverseText: "#1B1B1F",
};

/** Escala tipográfica: tamaño, altura de línea y peso, listos para `Text`. */
export const type = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: "700" },
  title1: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  title2: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  headline: { fontSize: 18, lineHeight: 26, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  bodySmall: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} as const satisfies Record<string, TextStyle>;

/**
 * Escala de espaciado en múltiplos de 4. La tabla del sistema nombra estos ocho
 * pasos; no se inventan los intermedios que nadie usa.
 */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Tamaños de la interfaz. `touch` es el mínimo de toda área tocable (NFR6.2) y
 * no se reduce en ningún componente.
 */
export const size = {
  touch: 44,
  header: 56,
  tabBar: 56,
  field: 48,
  button: 48,
  cover: { feed: 56, result: 56, detail: 96 },
  avatar: { base: 40, profile: 72 },
  icon: { base: 24, small: 20 },
} as const;

export type TypeScale = typeof type;
export type SpaceScale = typeof space;
export type RadiusScale = typeof radius;
export type SizeScale = typeof size;
