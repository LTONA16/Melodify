import { formatCalendarDate } from "../calendar-date";

/**
 * La fecha de calendario de la tarjeta propia: «4 nov 2026». Se prueba con fechas
 * fijas y en español, sin depender del reloj ni del idioma del dispositivo (CT-08).
 */
describe("formatCalendarDate", () => {
  it("escribe el día, el mes abreviado en español y el año", () => {
    expect(formatCalendarDate("2026-11-04T10:00:00.000Z")).toBe("4 nov 2026");
    expect(formatCalendarDate("2026-01-01T10:00:00.000Z")).toBe("1 ene 2026");
  });

  it("no rellena el día con ceros y abrevia el mes a tres letras", () => {
    expect(formatCalendarDate("2026-08-09T10:00:00.000Z")).toBe("9 ago 2026");
  });

  it("lee el instante en UTC, así que no retrocede de día con la zona horaria", () => {
    expect(formatCalendarDate("2026-11-04T23:30:00.000Z")).toBe("4 nov 2026");
    expect(formatCalendarDate("2026-11-04T00:30:00.000Z")).toBe("4 nov 2026");
  });

  it("devuelve cadena vacía con una fecha ilegible", () => {
    expect(formatCalendarDate("no es una fecha")).toBe("");
  });

  it("abrevia los doce meses en español, sin depender del locale del teléfono", () => {
    const expected = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];

    for (const [index, month] of expected.entries()) {
      const iso = `2026-${String(index + 1).padStart(2, "0")}-15T10:00:00.000Z`;
      expect(formatCalendarDate(iso)).toBe(`15 ${month} 2026`);
    }
  });
});
