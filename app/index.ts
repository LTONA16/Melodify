import { registerRootComponent } from "expo";
import * as SplashScreen from "expo-splash-screen";

import { App } from "./src/bootstrap/App";

// El splash se retiene aquí, al importar el módulo y antes de cualquier render,
// para que una excepción temprana no lo deje oculto a medias (NFR8.2). Se oculta
// en la composición, cuando ya hay una pantalla que enseñar.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Sin el módulo nativo el arranque sigue: el splash es cosmético, no un paso del flujo.
});

registerRootComponent(App);
