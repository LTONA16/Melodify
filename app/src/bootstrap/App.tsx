/**
 * El punto de composición de la app (U1): decide entre Login e Inicio, monta el
 * tema y entrega a la cáscara las cinco pestañas, los servicios por defecto y la
 * sesión.
 *
 * Decisiones del arranque (F1, NFR8.2):
 * - El splash del sistema sigue visible mientras `getSession` resuelve; no se pinta
 *   ni Login ni Inicio y no existe una pantalla de carga propia.
 * - `SplashScreen.hideAsync()` va en `finally`: se oculta también cuando la lectura
 *   falla o la sesión es inválida, porque en los tres casos hay una pantalla que
 *   enseñar (Login).
 * - Un `503` de `getSession` se trata como «sin sesión», sin aviso ni reintento.
 * - Login se monta como rama de entrada de la cáscara, así que la barra inferior no
 *   existe mientras se está dentro (BR1.5). Al volver a Inicio la cáscara se monta
 *   de nuevo y la pestaña activa es Inicio otra vez (F3 paso 3).
 * - La suscripción a la sesión es lo que devuelve a Login cuando U2 monte el botón
 *   «Cerrar sesión»: la operación ya existe en C3 y aquí solo se escucha.
 * - La sesión no se construye aquí: hay una sola instancia para toda la app y se
 *   importa de `./session`, para que el «Cerrar sesión» de U2 mueva esta misma
 *   máquina de estados en vez de una copia.
 */
import { AppShell, type ScreenModule } from "@melodify/app-shell";
import { ThemeProvider } from "@melodify/design-system";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { ActividadScreen } from "../screens/placeholders/ActividadScreen";
import { CrearScreen } from "../screens/placeholders/CrearScreen";
import { ExplorarScreen } from "../screens/placeholders/ExplorarScreen";
import { DetalleObraScreen } from "../screens/detalle-obra/DetalleObraScreen";
import { DetalleOpinionScreen } from "../screens/detalle-opinion/DetalleOpinionScreen";
import { InicioScreen } from "../screens/inicio/InicioScreen";
import { LoginScreen } from "../screens/login/LoginScreen";
import { PerfilScreen } from "../screens/perfil/PerfilScreen";
import { catalog, contentStore } from "./instances";
import { appSession } from "./session";
import { defaultShellServices } from "./shell-services";

/** Los estados visibles del arranque (F1). «Arranque» no pinta pantalla: es el splash. */
export type AppPhase = "arranque" | "login" | "inicio";

/*
 * La cáscara monta cada pantalla sin props (`ScreenProps`) y a los detalles solo les
 * pasa su identificador, así que las dependencias de composición se entregan en
 * adaptadores de una línea en vez de en cada render. Existen para que las instancias
 * de C4 y C5 se construyan **una vez**, aquí, y no una por pantalla (TS-18, R-01):
 * dos almacenes de contenido darían dos feeds con revisiones distintas.
 *
 * Van en el módulo y no dentro de `App` para que su identidad no cambie entre
 * renders: una función nueva en cada render remontaría la pestaña entera.
 */
function InicioRoute() {
  return (
    <InicioScreen
      session={appSession}
      content={contentStore}
      catalog={catalog}
    />
  );
}

function DetalleObraRoute({ work }: { work: { workId: string } }) {
  return (
    <DetalleObraScreen
      work={work}
      session={appSession}
      content={contentStore}
      catalog={catalog}
    />
  );
}

function DetalleOpinionRoute({
  opinion,
}: {
  opinion: { opinionId: string };
}) {
  return (
    <DetalleOpinionScreen
      opinion={opinion}
      session={appSession}
      content={contentStore}
      catalog={catalog}
    />
  );
}

function PerfilRoute() {
  return (
    <PerfilScreen
      session={appSession}
      content={contentStore}
      catalog={catalog}
    />
  );
}

/**
 * Las cinco pestañas en el orden de la barra (F4.1). Inicio y Perfil ya son las
 * pantallas de U2; Explorar, Crear y Actividad siguen siendo contenedoras hasta U3–U5.
 */
const screens: ScreenModule[] = [
  {
    name: "inicio",
    title: "Inicio",
    component: InicioRoute,
    details: [
      { kind: "work", component: DetalleObraRoute },
      { kind: "opinion", component: DetalleOpinionRoute },
    ],
  },
  { name: "explorar", title: "Explorar", component: ExplorarScreen },
  { name: "crear", title: "Crear", component: CrearScreen },
  { name: "actividad", title: "Actividad", component: ActividadScreen },
  {
    name: "perfil",
    title: "Perfil",
    component: PerfilRoute,
    details: [{ kind: "opinion", component: DetalleOpinionRoute }],
  },
];

export function App() {
  // La sesión es la instancia compartida de `./session`: no se construye aquí
  // porque una segunda instancia no escucharía el cierre de sesión de U2.
  const session = appSession;
  const [phase, setPhase] = useState<AppPhase>("arranque");

  useEffect(() => {
    let active = true;

    async function boot(): Promise<void> {
      try {
        const result = await session.getSession();

        if (!active) {
          return;
        }

        const signedIn =
          result.code === 200 && result.session.status === "signedIn";
        setPhase(signedIn ? "inicio" : "login");
      } finally {
        // Sin el módulo nativo el arranque sigue: el splash es cosmético y no un
        // paso del flujo, así que un fallo al ocultarlo no bloquea la app.
        await SplashScreen.hideAsync().catch(() => undefined);
      }
    }

    void boot();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (phase === "arranque") {
      return;
    }

    // Entrar o cerrar sesión mueve la máquina; la app no navega a mano (F3).
    return session.subscribeSession((view) => {
      setPhase(view.status === "signedIn" ? "inicio" : "login");
    });
  }, [phase, session]);

  if (phase === "arranque") {
    return null;
  }

  return (
    <ThemeProvider>
      <AppShell
        screens={screens}
        initialRoute="inicio"
        services={defaultShellServices}
        entry={
          phase === "login" ? (
            <LoginScreen
              session={session}
              onSignedIn={() => setPhase("inicio")}
            />
          ) : undefined
        }
      />
    </ThemeProvider>
  );
}
