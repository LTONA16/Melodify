/**
 * Contraste según WCAG 2.1: la fórmula de luminancia relativa que el sistema usa
 * para razonar sobre pares nuevos (NFR6.1). No decide por sí solo: devuelve el
 * ratio para que una prueba o una revisión lo compare con 4.5:1 (texto normal) o
 * 3:1 (texto grande e iconos).
 *
 * Acepta hexadecimal (`#RGB`, `#RRGGBB`) y `rgb()`/`rgba()`; la transparencia no se
 * compone porque no hay fondo conocido en el cálculo aislado, así que el alfa se
 * ignora a propósito.
 */

type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i;

function toChannel(raw: string): number {
  const value = Number.parseInt(raw, 10);
  if (value < 0 || value > 255) {
    throw new Error(`Canal de color fuera de rango: «${raw}».`);
  }
  return value;
}

function parseColor(color: string): Rgb {
  const value = color.trim();

  const hex = HEX.exec(value);
  if (hex?.[1] !== undefined) {
    const digits = hex[1];
    if (digits.length === 3) {
      return [
        Number.parseInt(`${digits[0]}${digits[0]}`, 16),
        Number.parseInt(`${digits[1]}${digits[1]}`, 16),
        Number.parseInt(`${digits[2]}${digits[2]}`, 16),
      ];
    }
    return [
      Number.parseInt(digits.slice(0, 2), 16),
      Number.parseInt(digits.slice(2, 4), 16),
      Number.parseInt(digits.slice(4, 6), 16),
    ];
  }

  const rgb = RGB.exec(value);
  if (rgb) {
    return [
      toChannel(rgb[1] ?? ""),
      toChannel(rgb[2] ?? ""),
      toChannel(rgb[3] ?? ""),
    ];
  }

  throw new Error(
    `Color no reconocido: «${color}». Usa hexadecimal (#RRGGBB) o rgb()/rgba().`,
  );
}

/** Luminancia relativa de WCAG 2.1, entre 0 y 1. */
export function relativeLuminance(color: string): number {
  const [r, g, b] = parseColor(color).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Ratio de contraste entre dos colores, siempre ≥ 1. El orden no importa para el
 * resultado (el más claro va en el numerador), así que una prueba puede pasar
 * texto y fondo en el orden en que los lee del tema.
 */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);

  return (lighter + 0.05) / (darker + 0.05);
}
