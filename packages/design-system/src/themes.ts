/**
 * Los dos temas del sistema (C1). Un tema es la paleta del esquema más las
 * escalas que no cambian con él, de modo que un componente lee `theme.colors.text`
 * o `theme.type.body` y nunca un valor crudo.
 */
import {
  darkColors,
  lightColors,
  radius,
  size,
  space,
  type,
  type ColorRoles,
  type RadiusScale,
  type SizeScale,
  type SpaceScale,
  type TypeScale,
} from "./tokens";

export type ColorSchemeName = "light" | "dark";

export interface Theme {
  scheme: ColorSchemeName;
  colors: ColorRoles;
  type: TypeScale;
  space: SpaceScale;
  radius: RadiusScale;
  size: SizeScale;
}

export const lightTheme: Theme = {
  scheme: "light",
  colors: lightColors,
  type,
  space,
  radius,
  size,
};

export const darkTheme: Theme = {
  scheme: "dark",
  colors: darkColors,
  type,
  space,
  radius,
  size,
};
