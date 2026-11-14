/**
 * Quién mira (NFR8.4): el `authorId` de la sesión, o `null` mientras no se sabe.
 *
 * Por qué devuelve `null` en vez de la cuenta demo: `authorId` existe también sin
 * sesión, pero sin sesión no hay quien mire, y las lecturas de C4 que calculan
 * `isOwn` responderían por un autor que no está usando la app. La pantalla que aún
 * no tiene identidad se queda cargando en lugar de pintar datos ajenos como propios.
 *
 * La instancia de sesión llega por argumento —y no se importa aquí— para que el
 * hook se pueda probar con una sesión de doble y para que siga habiendo una sola
 * instancia en la app (`app/src/bootstrap/session.ts`, R-01).
 */
import type { AppSession, SessionView } from "@melodify/app-session";
import { useEffect, useState } from "react";

/** La sesión solo aporta identidad cuando está iniciada. */
function viewerIdOf(view: SessionView): string | null {
  return view.status === "signedIn" ? view.authorId : null;
}

export function useViewerId(session: AppSession): string | null {
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Primero la suscripción y después la lectura: si la lectura terminara antes
    // de suscribirse, un cambio de sesión ocurrido en el medio se perdería y la
    // pantalla se quedaría con la identidad anterior.
    const unsubscribe = session.subscribeSession((view) => {
      if (!active) {
        return;
      }
      setViewerId(viewerIdOf(view));
    });

    void (async () => {
      try {
        const result = await session.getSession();
        if (!active || result.code !== 200) {
          return;
        }
        setViewerId(viewerIdOf(result.session));
      } catch {
        // C3 registra sus propios fallos de lectura; aquí solo se evita que una
        // promesa rechazada deje la app esperando una identidad que no va a llegar.
      }
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [session]);

  return viewerId;
}
