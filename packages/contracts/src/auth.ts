/**
 * Cuentas y sesiones del API.
 *
 * La app recibe dos credenciales en cada inicio de sesión: un access token de
 * vida corta (el que viaja en `Authorization: Bearer …`) y un refresh token de
 * vida larga que solo sirve para pedir un par nuevo. El refresh rota en cada
 * uso y se guarda hasheado en el servidor: quien lea la base de datos no puede
 * suplantar a nadie.
 */

/** La cuenta tal como la ve la app. Nunca incluye el hash de la contraseña. */
export interface UserView {
  userId: string;
  handle: string;
  displayName: string;
  /** ISO 8601 con zona. */
  createdAt: string;
}

/** Una sesión abierta: quién es y con qué credenciales seguir hablando. */
export interface SessionView {
  user: UserView;
  accessToken: string;
  refreshToken: string;
  /** Segundos que le quedan de vida al access token. */
  expiresIn: number;
}

export interface RegisterInput {
  handle: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  handle: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}
