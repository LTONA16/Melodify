import { contrastRatio, relativeLuminance } from "../contrast";
import { darkColors, lightColors } from "../tokens";

/**
 * Los pares que la interfaz usa de verdad, con los umbrales de NFR6.1: 4.5:1 para
 * texto normal y 3:1 para texto grande e iconos. Si un token de la paleta se
 * ajusta, esta prueba dice si el par sigue pasando.
 */
const NORMAL_TEXT_PAIRS = [
  "text",
  "textSecondary",
  "textMuted",
  "primary",
] as const;

const LARGE_TEXT_PAIRS = [
  "accentStar",
  "success",
  "error",
  "borderStrong",
] as const;

describe("ratio de contraste (WCAG 2.1)", () => {
  it("devuelve 1 para un color consigo mismo", () => {
    expect(contrastRatio("#1B1B1F", "#1B1B1F")).toBeCloseTo(1, 5);
  });

  it("el blanco sobre negro es el máximo, 21:1", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 2);
  });

  it("no depende del orden de los colores", () => {
    expect(contrastRatio("#7B2D8E", "#FFFFFF")).toBeCloseTo(
      contrastRatio("#FFFFFF", "#7B2D8E"),
      10,
    );
  });

  it("calcula la luminancia relativa de los extremos", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 10);
  });

  it("acepta rgb() y rgba() y falla con un color que no reconoce", () => {
    expect(contrastRatio("rgb(27, 27, 31)", "rgba(255, 255, 255, 1)")).toBeCloseTo(
      contrastRatio("#1B1B1F", "#FFFFFF"),
      10,
    );
    expect(() => contrastRatio("azul", "#FFFFFF")).toThrow(
      "Color no reconocido",
    );
    expect(() => contrastRatio("rgb(300, 0, 0)", "#FFFFFF")).toThrow(
      "Canal de color fuera de rango",
    );
  });

  it("el borde decorativo no alcanza 3:1: no puede delimitar un control", () => {
    expect(contrastRatio(lightColors.border, lightColors.bg)).toBeLessThan(3);
    expect(contrastRatio(darkColors.border, darkColors.bg)).toBeLessThan(3);
  });
});

describe.each([
  ["claro", lightColors],
  ["oscuro", darkColors],
] as const)("pares del tema %s", (_name, colors) => {
  it.each(NORMAL_TEXT_PAIRS)(
    "%s sobre el fondo supera 4.5:1",
    (role) => {
      expect(contrastRatio(colors[role], colors.bg)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(LARGE_TEXT_PAIRS)(
    "%s sobre el fondo supera 3:1",
    (role) => {
      expect(contrastRatio(colors[role], colors.bg)).toBeGreaterThanOrEqual(3);
    },
  );

  it("el texto del botón principal supera 4.5:1 sobre el primario", () => {
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it("el texto del banner supera 4.5:1 sobre su contenedor", () => {
    expect(
      contrastRatio(colors.onWarningContainer, colors.warningContainer),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("el texto sobre el contenedor primario supera 4.5:1", () => {
    expect(
      contrastRatio(colors.onPrimaryContainer, colors.primaryContainer),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
