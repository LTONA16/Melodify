import { formatRelativeTime } from "../relative-time";

/**
 * El tiempo transcurrido de la tarjeta: cortes gruesos y texto en español. Se
 * calcula con un instante fijo, así que no depende del reloj de la máquina.
 */
const NOW = Date.parse("2026-11-11T12:00:00.000Z");

function ago(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

describe("formatRelativeTime", () => {
  it("dice «ahora» en el primer minuto", () => {
    expect(formatRelativeTime(ago(0), NOW)).toBe("ahora");
    expect(formatRelativeTime(ago(59_000), NOW)).toBe("ahora");
  });

  it("cuenta los minutos de la primera hora", () => {
    expect(formatRelativeTime(ago(60_000), NOW)).toBe("hace 1 min");
    expect(formatRelativeTime(ago(59 * 60_000), NOW)).toBe("hace 59 min");
  });

  it("cuenta las horas del primer día", () => {
    expect(formatRelativeTime(ago(60 * 60_000), NOW)).toBe("hace 1 h");
    expect(formatRelativeTime(ago(23 * 60 * 60_000), NOW)).toBe("hace 23 h");
  });

  it("cuenta los días a partir del segundo día", () => {
    expect(formatRelativeTime(ago(24 * 60 * 60_000), NOW)).toBe("hace 1 d");
    expect(formatRelativeTime(ago(72 * 60 * 60_000), NOW)).toBe("hace 3 d");
  });

  it("no muestra un tiempo futuro como negativo", () => {
    expect(formatRelativeTime(new Date(NOW + 60_000).toISOString(), NOW)).toBe(
      "ahora",
    );
  });

  it("devuelve una cadena vacía con una fecha ilegible", () => {
    expect(formatRelativeTime("ayer", NOW)).toBe("");
  });
});
