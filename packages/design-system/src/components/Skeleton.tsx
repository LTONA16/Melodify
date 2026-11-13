/**
 * Relleno de carga (C1). En U1 no se pinta: la semilla de Inicio está en memoria y
 * no hay espera que enseñar (Q4 = A). Queda lista para el feed de U2.
 *
 * En U1 no pulsa: la animación llega con quien la use, y para entonces respetará
 * «reducir movimiento» del sistema.
 */
import { View } from "react-native";

import type { SkeletonShape } from "../models";
import { useTheme } from "../useTheme";

export interface SkeletonProps {
  shape: SkeletonShape;
  count: number;
}

const HEIGHTS: Record<SkeletonShape, number> = {
  card: 96,
  row: 24,
  header: 32,
};

export function Skeleton({ shape, count }: SkeletonProps) {
  const theme = useTheme();
  const blocks = Math.max(1, Math.floor(count));

  return (
    <View testID="skeleton" style={{ gap: theme.space[2] }}>
      {Array.from({ length: blocks }, (_value, index) => (
        <View
          key={index}
          testID={`skeleton-${shape}-${index + 1}`}
          style={{
            height: HEIGHTS[shape],
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.skeleton,
          }}
        />
      ))}
    </View>
  );
}
