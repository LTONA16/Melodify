import {
  createSessionRecord,
  parseSessionRecord,
  serializeSessionRecord,
} from "../session-record";

describe("parseSessionRecord", () => {
  it("devuelve null cuando no hay ningún valor guardado", () => {
    expect(parseSessionRecord(null)).toBeNull();
  });

  it("devuelve null cuando el valor guardado es una cadena vacía", () => {
    expect(parseSessionRecord("")).toBeNull();
  });

  it("devuelve null cuando el texto no es JSON legible", () => {
    expect(parseSessionRecord("demo")).toBeNull();
    expect(parseSessionRecord('{"authorId":"demo",')).toBeNull();
  });

  it.each(["[]", "null", "42", '"demo"', "true"])(
    "devuelve null cuando el JSON no es un objeto: %s",
    (raw) => {
      expect(parseSessionRecord(raw)).toBeNull();
    },
  );

  it("devuelve null cuando falta authorId", () => {
    expect(
      parseSessionRecord('{"startedAt":"2026-11-11T08:00:00.000Z"}'),
    ).toBeNull();
  });

  it("devuelve null cuando authorId no es la cuenta demo", () => {
    expect(
      parseSessionRecord(
        '{"authorId":"ana","startedAt":"2026-11-11T08:00:00.000Z"}',
      ),
    ).toBeNull();
  });

  it.each([
    "ayer",
    "2026-11-11",
    "2026-11-11T08:00:00",
    "2026-13-45T99:00:00.000Z",
    "11/11/2026 08:00",
  ])(
    "devuelve null cuando startedAt no es un instante ISO 8601 con zona: %s",
    (startedAt) => {
      expect(
        parseSessionRecord(JSON.stringify({ authorId: "demo", startedAt })),
      ).toBeNull();
    },
  );

  it("devuelve un registro nuevo cuando el valor guardado es válido", () => {
    const record = parseSessionRecord(
      '{"authorId":"demo","startedAt":"2026-11-11T08:00:00.000Z"}',
    );

    expect(record).toEqual({
      authorId: "demo",
      startedAt: "2026-11-11T08:00:00.000Z",
    });
  });

  it("descarta los campos extra del valor guardado", () => {
    const record = parseSessionRecord(
      '{"authorId":"demo","startedAt":"2026-11-11T08:00:00.000Z","password":"demo","extra":1}',
    );

    expect(record).toEqual({
      authorId: "demo",
      startedAt: "2026-11-11T08:00:00.000Z",
    });
    expect(record).not.toHaveProperty("password");
    expect(record).not.toHaveProperty("extra");
  });
});

describe("serialización del registro", () => {
  it("construye el registro con el autor demo y la fecha recibida", () => {
    expect(createSessionRecord("2026-11-11T08:00:00.000Z")).toEqual({
      authorId: "demo",
      startedAt: "2026-11-11T08:00:00.000Z",
    });
  });

  it("serializa el registro en el JSON que la guarda acepta", () => {
    const record = createSessionRecord("2026-11-11T08:00:00.000Z");

    expect(parseSessionRecord(serializeSessionRecord(record))).toEqual(record);
  });
});
