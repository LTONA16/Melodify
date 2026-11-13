/**
 * Superficie pública de `@melodify/app-session` (C3 v1.1.0).
 *
 * Las cuatro operaciones del contrato se exportan sobre una instancia compartida
 * con el almacenamiento real. **Esa no es la instancia de la app**: la app tiene
 * exactamente una, con el logger del proyecto inyectado, y vive en
 * `app/src/bootstrap/session.ts`. U2 (US1.3) cierra sesión con ella, porque
 * desconectar por otra instancia no devolvería la app a Login. Los tipos
 * acompañan a sus valores.
 */
import { createAppSession } from "./app-session";

export { createAppSession } from "./app-session";
export type {
  AppSession,
  AppSessionOptions,
  GetSessionResult,
  SessionLogger,
  SessionLogCode,
  SessionView,
  SignInResult,
  SignOutResult,
} from "./app-session";
export { parseSessionRecord } from "./session-record";
export type { SessionRecord } from "./session-record";
export type { SecureStorePort } from "./secure-store-adapter";
export { SESSION_STORAGE_KEY } from "./storage-keys";

const defaultSession = createAppSession();

export const getSession = defaultSession.getSession;
export const signIn = defaultSession.signIn;
export const signOut = defaultSession.signOut;
export const subscribeSession = defaultSession.subscribeSession;
