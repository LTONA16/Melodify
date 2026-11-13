import { logger } from "../logger";

/**
 * El logger es el único sitio que llama a `console` (NFR9.1). El entorno de
 * `jest-expo` define `__DEV__` como verdadero y escribible, así que cada prueba
 * lo pone en el valor que mide y lo devuelve al original al terminar.
 */
const originalDev = __DEV__;

let warnSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
});

describe("logger del proyecto", () => {
  it("en desarrollo registra el aviso y el error con el prefijo del proyecto", () => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = true;

    logger.warn("SESSION_READ_FAILED", "no se pudo leer la sesión");
    logger.error("SESSION_SAVE_FAILED", "no se pudo guardar la sesión");

    expect(warnSpy).toHaveBeenCalledWith(
      "[melodify] SESSION_READ_FAILED: no se pudo leer la sesión",
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "[melodify] SESSION_SAVE_FAILED: no se pudo guardar la sesión",
    );
  });

  it("fuera de desarrollo calla el aviso y conserva el error", () => {
    (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

    logger.warn("SESSION_READ_FAILED", "no se pudo leer la sesión");
    logger.error("SESSION_SAVE_FAILED", "no se pudo guardar la sesión");

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      "[melodify] SESSION_SAVE_FAILED: no se pudo guardar la sesión",
    );
  });
});
