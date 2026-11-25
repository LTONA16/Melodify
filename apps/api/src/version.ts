import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * La versión que el servicio declara en `/health`, leída de su `package.json`.
 *
 * Se prueban dos ubicaciones porque el mismo archivo se ejecuta desde `src/`
 * (con `tsx`, en desarrollo y pruebas) y desde `dist/src/` (cuando `tsc -b`
 * compila el proyecto). Si ninguna se puede leer, se devuelve `0.0.0` en vez de
 * impedir el arranque: la versión es información, no un requisito de vida.
 */
const CANDIDATE_PATHS = [
  join(__dirname, "..", "package.json"),
  join(__dirname, "..", "..", "package.json"),
];

function readVersion(): string {
  for (const path of CANDIDATE_PATHS) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
      if (typeof parsed === "object" && parsed !== null && "version" in parsed) {
        const candidate = (parsed as { version?: unknown }).version;
        if (typeof candidate === "string" && candidate.length > 0) {
          return candidate;
        }
      }
    } catch {
      // Se prueba la siguiente ubicación; ninguna es obligatoria.
    }
  }
  return "0.0.0";
}

export const API_VERSION = readVersion();
