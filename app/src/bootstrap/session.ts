/**
 * La **única** instancia de sesión de la app (C3), construida en el punto de
 * composición y exportada de aquí.
 *
 * Por qué vive en este archivo: `packages/app-session` publica sus cuatro
 * operaciones sobre una instancia por defecto, y la app necesita inyectarle el
 * logger del proyecto (NFR9.1). Si `App.tsx` construyera además la suya, habría dos
 * instancias y quien llamara a una no movería a la otra: desconectar por la
 * instancia publicada no devolvería la app a Login, que es justo el punto de
 * integración que la especificación funcional ofrece a U2 (US1.3, F5).
 *
 * Por eso U2 debe cerrar sesión con esta misma instancia: `appSession.signOut()`
 * publica el cambio, la suscripción del arranque lo escucha y la app vuelve al
 * Login sin navegar a mano.
 */
import { createAppSession, type AppSession } from "@melodify/app-session";

import { logger } from "./logger";

export const appSession: AppSession = createAppSession({ logger });
