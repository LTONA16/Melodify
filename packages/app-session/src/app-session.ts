/**
 * La sesión de la app (C3 v1.1.0): leer, entrar y salir, más la suscripción a sus
 * cambios. Las operaciones responden con códigos en vez de lanzar, porque la
 * interfaz decide con ellos qué pinta.
 *
 * El fallo del almacenamiento se traduce aquí a códigos y a eventos de
 * diagnóstico; el paquete nunca llama a `console` ni importa el logger de la app:
 * recibe el puerto `SessionLogger` y la app le pasa el suyo (NFR9.1).
 */
import {
  createSessionStorage,
  type SecureStorePort,
  type SessionStorage,
} from "./secure-store-adapter";
import {
  DEMO_AUTHOR_ID,
  createSessionRecord,
  parseSessionRecord,
  serializeSessionRecord,
} from "./session-record";

export type SessionLogCode =
  | "SESSION_READ_FAILED"
  | "SESSION_RECORD_INVALID"
  | "SESSION_SAVE_FAILED"
  | "SESSION_DELETE_FAILED";

/**
 * Firma cerrada a dos cadenas: sin sobrecarga que acepte un objeto no se puede
 * «pasar el registro por si acaso» y arrastrar la contraseña a un mensaje (NFR3.4).
 */
export interface SessionLogger {
  warn(code: SessionLogCode, message: string): void;
  error(code: SessionLogCode, message: string): void;
}

/** La vista que cruza el contrato. No lleva `startedAt` ni el nombre tecleado. */
export interface SessionView {
  status: "signedIn" | "signedOut";
  authorId: string;
  remembered: boolean;
}

export type GetSessionResult =
  | { code: 200; session: SessionView }
  | { code: 503 };

export type SignInResult =
  | { code: 200; session: SessionView }
  | { code: 401 }
  | { code: 503 };

export type SignOutResult = { code: 204 };

export interface AppSession {
  getSession(): Promise<GetSessionResult>;
  signIn(input: { handle: string; password: string }): Promise<SignInResult>;
  signOut(): Promise<SignOutResult>;
  subscribeSession(listener: (session: SessionView) => void): () => void;
}

export interface AppSessionOptions {
  store?: SecureStorePort;
  logger?: SessionLogger;
}

const LOG_MESSAGES = {
  read: "no se pudo leer la sesión recordada",
  invalid: "se descartó un registro de sesión inválido",
  save: "no se pudo guardar la sesión",
  remove: "no se pudo borrar el recuerdo de sesión",
} as const;

const SILENT_LOGGER: SessionLogger = {
  warn() {},
  error() {},
};

const SIGNED_OUT: SessionView = {
  status: "signedOut",
  authorId: DEMO_AUTHOR_ID,
  remembered: false,
};

function signedInView(): SessionView {
  return { status: "signedIn", authorId: DEMO_AUTHOR_ID, remembered: true };
}

/**
 * Construir la sesión con `store` y `logger` inyectados es lo que permite probarla
 * sin dispositivo y sin ruido en consola; sin argumentos usa el almacenamiento real
 * y un logger silencioso, así que `createAppSession()` siempre es válido.
 */
export function createAppSession(options: AppSessionOptions = {}): AppSession {
  const storage: SessionStorage = createSessionStorage(options.store);
  const logger: SessionLogger = options.logger ?? SILENT_LOGGER;

  let current: SessionView | null = null;
  const listeners = new Set<(session: SessionView) => void>();

  function publish(view: SessionView): SessionView {
    current = view;
    listeners.forEach((listener) => listener(view));
    return view;
  }

  async function readSession(): Promise<GetSessionResult> {
    const read = await storage.read();

    if (!read.ok) {
      // El 503 no se pinta: desemboca en Login, que es la acción (enmienda a C3).
      logger.warn("SESSION_READ_FAILED", LOG_MESSAGES.read);
      return { code: 503 };
    }

    if (read.value === null || read.value === "") {
      return { code: 200, session: publish(SIGNED_OUT) };
    }

    const record = parseSessionRecord(read.value);
    if (record === null) {
      logger.warn("SESSION_RECORD_INVALID", LOG_MESSAGES.invalid);
      // Un valor inválido se intenta borrar para no volver a tropezar con él.
      const cleared = await storage.clear();
      if (!cleared.ok) {
        logger.warn("SESSION_DELETE_FAILED", LOG_MESSAGES.remove);
      }
      return { code: 200, session: publish(SIGNED_OUT) };
    }

    return { code: 200, session: publish(signedInView()) };
  }

  return {
    getSession: readSession,

    async signIn(input) {
      const handle = input.handle.trim();
      const password = input.password.trim();

      if (handle !== DEMO_AUTHOR_ID || password !== DEMO_AUTHOR_ID) {
        // La contraseña no se guarda, no se registra y no se devuelve (NFR3.4).
        return { code: 401 };
      }

      const record = createSessionRecord(new Date().toISOString());
      const written = await storage.write(serializeSessionRecord(record));

      if (!written.ok) {
        // Sin escritura no se entra: una sesión que el arranque siguiente no
        // recordaría rompería la promesa de FR1.4 (BR1.2).
        logger.error("SESSION_SAVE_FAILED", LOG_MESSAGES.save);
        return { code: 503 };
      }

      return { code: 200, session: publish(signedInView()) };
    },

    async signOut() {
      const cleared = await storage.clear();

      if (!cleared.ok) {
        // La app vuelve a Login igualmente: bloquear la salida sería peor.
        logger.error("SESSION_DELETE_FAILED", LOG_MESSAGES.remove);
      }

      publish(SIGNED_OUT);
      return { code: 204 };
    },

    subscribeSession(listener) {
      listeners.add(listener);

      if (current !== null) {
        listener(current);
      } else {
        // La primera lectura resuelve la vista y publica; quien se suscribió antes
        // recibe el valor en cuanto existe.
        void readSession();
      }

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
