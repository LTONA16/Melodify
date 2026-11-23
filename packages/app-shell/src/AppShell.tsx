/**
 * La cáscara de la app (C2 1.4.0): decide entre la pantalla de entrada y las cinco
 * pestañas, compone la barra inferior y ofrece los tres contextos que leen las
 * pantallas —servicios, acciones globales y la entrada de Crear—.
 *
 * Decisiones de esta unidad:
 * - **Login vive fuera de la barra**: si recibe `entry`, la cáscara pinta esa rama
 *   y ni siquiera monta la barra (BR1.5).
 * - **Cada pestaña conserva su pila y su posición**: las cinco raíces siguen
 *   montadas y la inactiva se oculta con `display: none`, así volver a una pestaña
 *   no reinicia lo que había dentro ni su scroll (BR2.2, F4.4).
 * - **La pila de una pestaña se pinta entera y se oculta lo que no está arriba**
 *   (1.2.0, revisión 12 del contrato): abrir un detalle ya no desmonta la raíz, de
 *   modo que el feed vuelve con su scroll y su estado de carga tal como se dejó
 *   (AC2.3.2). Solo se pinta una entrada por nivel visible, así que no hay dos
 *   pantallas midiendo a la vez.
 * - **La cabecera del detalle la pinta la cáscara**, con «‹ Volver» en la ranura
 *   izquierda: volver es una operación suya (C1 no conoce la navegación) y al
 *   desapilar el título se limpia para que el siguiente detalle no herede el
 *   anterior.
 * - **La barra se pinta una sola vez**, fuera de las pilas, nunca en Login.
 * - **1.4.0 — la obra viaja con la ruta**: el detalle y Crear reciben la `data`
 *   que ya estaba resuelta, sin que la cáscara conozca C5 ni vuelva a pedirla. Si
 *   sólo llega `workId`, todo sigue funcionando como antes y la pantalla resuelve.
 * - **1.3.0 — el ciclo de Crear**: `formKey` sube en cada entrada para que la
 *   pantalla descarte el borrador anterior; «Cancelar», «Guardar» y el atrás del
 *   sistema en Crear vuelven a `returnTo` **sin reiniciar su pila**, y el atrás
 *   consume el evento porque es la única pantalla con texto que se perdería.
 * - **1.3.0 — los dos montajes reales**: la hoja de comentarios se pinta desde
 *   `services.comments` y el aviso desde `showSnackbar`. Con la hoja abierta el
 *   aviso viaja **dentro** del modal (un `Snackbar` fuera quedaría detrás del
 *   velo); cualquier cambio de pestaña limpia el mensaje pendiente.
 */
import type { WorkView } from "@melodify/catalog";
import {
  AppHeader,
  BottomTabBar,
  CommentSheet,
  Snackbar,
  TextButton,
  useTheme,
  type TabItem,
} from "@melodify/design-system";
import { NavigationContainer } from "@react-navigation/native";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  CreateEntryContext,
  GlobalServicesContext,
  ShellServicesContext,
} from "./contexts";
import {
  DEFAULT_CREATE_ENTRY,
  TAB_ITEMS,
  type CreateEntry,
  type DetailScreen,
  type GlobalServices,
  type ScreenModule,
  type ShellServices,
  type TabName,
} from "./types";

type StackEntry =
  | { kind: "root"; key: string; screen: ScreenModule }
  | {
      kind: "work";
      key: string;
      detail: Extract<DetailScreen, { kind: "work" }>;
      workId: string;
      /** La obra ya resuelta por quien abrió la ruta; opcional como en C2. */
      data?: WorkView;
    }
  | {
      kind: "opinion";
      key: string;
      detail: Extract<DetailScreen, { kind: "opinion" }>;
      opinionId: string;
    };

interface AppShellProps {
  screens: ScreenModule[];
  initialRoute: string;
  services: ShellServices;
  /** La rama de sesión: Login. Cuando llega, la barra no se monta (BR1.5). */
  entry?: ReactNode;
}

function rootEntry(screen: ScreenModule): StackEntry {
  return { kind: "root", key: `${screen.name}-root`, screen };
}

function initialStacks(screens: ScreenModule[]): Record<string, StackEntry[]> {
  const entries: [string, StackEntry[]][] = screens.map((screen) => [
    screen.name,
    [rootEntry(screen)],
  ]);
  return Object.fromEntries(entries);
}

function tabItemsFor(screens: ScreenModule[]): TabItem[] {
  return screens.map((screen) => {
    const known = TAB_ITEMS.find((item) => item.name === screen.name);

    return {
      name: screen.name,
      label: screen.title,
      icon: known?.icon ?? "home",
    };
  });
}

function renderEntry(entry: StackEntry | undefined): ReactNode {
  if (entry === undefined) {
    return null;
  }

  if (entry.kind === "root") {
    const ScreenComponent = entry.screen.component;
    return <ScreenComponent />;
  }

  if (entry.kind === "work") {
    const DetailComponent = entry.detail.component;
    return (
      <DetailComponent work={{ workId: entry.workId, data: entry.data }} />
    );
  }

  const DetailComponent = entry.detail.component;
  return <DetailComponent opinion={{ opinionId: entry.opinionId }} />;
}

function EntryBranch({ entry }: { entry: ReactNode }) {
  const theme = useTheme();
  // Android pinta a sangre por el borde (edge-to-edge) desde RN 0.86, así que la
  // barra de estado se superpone al contenido si nadie reserva su alto. El área
  // segura de arriba se aplica una sola vez, aquí: Login también la necesita.
  const insets = useSafeAreaInsets();

  // En Login el gesto atrás no hace nada: la app no se cierra ni cambia de
  // pantalla (BR1.5, F5).
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, []);

  return (
    <View
      testID="app-shell-entry"
      style={[
        styles.fill,
        {
          backgroundColor: theme.colors.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {entry}
    </View>
  );
}

function TabShell({
  screens,
  initialRoute,
  services,
}: {
  screens: ScreenModule[];
  initialRoute: string;
  services: ShellServices;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyCounter = useRef(0);
  const formKeyCounter = useRef(0);

  const [activeName, setActiveName] = useState(() => {
    const found = screens.find((screen) => screen.name === initialRoute);
    return found?.name ?? screens[0]?.name ?? initialRoute;
  });
  const [stacks, setStacks] = useState<Record<string, StackEntry[]>>(() =>
    initialStacks(screens),
  );
  const [createEntry, setCreateEntry] =
    useState<CreateEntry>(DEFAULT_CREATE_ENTRY);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  // El estado de la hoja se lee del controlador que inyecta la app: la cáscara
  // no conoce C4, solo este contrato (LC-1).
  const comments = useSyncExternalStore(
    services.comments.subscribe,
    () => services.comments.state,
  );
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  /** Una marca nueva por visita: el borrador anterior no se hereda. */
  const nextFormKey = (): number => {
    formKeyCounter.current += 1;
    return formKeyCounter.current;
  };

  const indexOfTab = (name: string): number => {
    const index = screens.findIndex((screen) => screen.name === name);
    return index >= 0 ? index : 0;
  };

  const resetStack = useCallback(
    (name: string): void => {
      const screen = screens.find((candidate) => candidate.name === name);
      if (screen === undefined) {
        return;
      }

      setStacks((previous) => ({ ...previous, [name]: [rootEntry(screen)] }));
    },
    [screens],
  );

  const goToTab = (name: TabName): void => {
    setActiveName(name);
    resetStack(name);
    setCreateEntry(DEFAULT_CREATE_ENTRY);
    setHeaderTitle(null);
    // Un aviso no viaja de una pestaña a otra (LC-1).
    setSnackbar(null);
  };

  const pushDetail = (
    kind: "work" | "opinion",
    params: { workId?: string; opinionId?: string; data?: WorkView },
  ): void => {
    const screen = screens.find((candidate) => candidate.name === activeName);
    const registered = screen?.details?.find((item) => item.kind === kind);

    if (registered === undefined) {
      return;
    }

    keyCounter.current += 1;
    const key = `${activeName}-${kind}-${keyCounter.current}`;
    const entry: StackEntry =
      registered.kind === "work"
        ? {
            kind: "work",
            key,
            detail: registered,
            workId: params.workId ?? "",
            data: params.data,
          }
        : {
            kind: "opinion",
            key,
            detail: registered,
            opinionId: params.opinionId ?? "",
          };

    setStacks((previous) => ({
      ...previous,
      [activeName]: [...(previous[activeName] ?? []), entry],
    }));
    setHeaderTitle(null);
  };

  /**
   * Desapila una entrada de la pestaña activa. El título de la cabecera vuelve a
   * vaciarse aquí y no en el render: si se limpiara al pintar, el detalle que se
   * abre después heredaría el título del anterior antes de que su pantalla lo fije.
   */
  const popDetail = useCallback((): void => {
    setStacks((previous) => ({
      ...previous,
      [activeName]: (previous[activeName] ?? []).slice(0, -1),
    }));
    setHeaderTitle(null);
  }, [activeName]);

  const openCreateTab = (
    mode: CreateEntry["mode"],
    extra: Pick<
      CreateEntry,
      "preselectedWork" | "preselectedWorkId" | "editingOpinionId"
    >,
  ): void => {
    setCreateEntry({
      mode,
      preselectedWork: extra.preselectedWork,
      preselectedWorkId: extra.preselectedWorkId,
      editingOpinionId: extra.editingOpinionId,
      // «Editar mi opinión» desde Crear conserva el destino de la entrada vigente;
      // si se tomara `activeName` como destino, «Guardar» volvería al formulario
      // limpio en vez de al detalle (BR12.3, AC6.1.3).
      returnTo: activeName === "crear" ? createEntry.returnTo : activeName,
      formKey: nextFormKey(),
    });
    setActiveName("crear");
    resetStack("crear");
    setHeaderTitle(null);
  };

  /**
   * Sale de Crear sin escribir. Vuelve a `returnTo` **sin tocar su pila**: el
   * detalle desde el que se abrió sigue donde estaba (AC6.1.3, AC5.3.3). Es lo
   * mismo para «Cancelar», «Guardar» y el atrás del sistema (FR5.4, FR6.2).
   *
   * Va en `useCallback` porque el atrás del sistema la usa como dependencia del
   * efecto: sin él, cada render reinstalaría el oyente.
   */
  const closeCreate = useCallback((): void => {
    const returnTo = createEntry.returnTo;
    setCreateEntry(DEFAULT_CREATE_ENTRY);
    if (
      returnTo !== null &&
      screens.some((screen) => screen.name === returnTo)
    ) {
      setActiveName(returnTo);
    } else {
      resetStack("crear");
    }
    setHeaderTitle(null);
    setSnackbar(null);
  }, [createEntry.returnTo, resetStack, screens]);

  const global: GlobalServices = {
    showSnackbar: ({ message }) => setSnackbar(message),
    setHeader: ({ title }) => setHeaderTitle(title),
    openWorkDetail: ({ workId, data }) =>
      pushDetail("work", { workId, data }),
    openOpinionDetail: ({ opinionId }) => pushDetail("opinion", { opinionId }),
    openCreate: ({ workId, data } = {}) =>
      openCreateTab("create", {
        preselectedWork: data ?? null,
        preselectedWorkId: workId ?? data?.workId ?? null,
        editingOpinionId: null,
      }),
    openEdit: ({ opinionId }) =>
      openCreateTab("edit", {
        preselectedWork: null,
        preselectedWorkId: null,
        editingOpinionId: opinionId,
      }),
    closeCreate,
    goToTab: ({ name }) => goToTab(name),
  };

  const handleSelect = (index: number): void => {
    const target = screens[index];
    if (target === undefined) {
      return;
    }

    if (target.name === "crear") {
      // Una visita nueva a Crear nunca arrastra la obra ni la opinión anterior, y
      // «Cancelar» vuelve a la pestaña de donde se vino (invariante de C2).
      setCreateEntry({
        mode: "create",
        preselectedWork: null,
        preselectedWorkId: null,
        editingOpinionId: null,
        returnTo: activeName,
        formKey: nextFormKey(),
      });
      resetStack("crear");
    }

    setActiveName(target.name);
    setHeaderTitle(null);
    setSnackbar(null);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // En Crear el atrás cancela: es la única pantalla con un borrador que se
        // perdería, y se comporta como «Cancelar» consumiendo el evento
        // (revisión 15 del contrato).
        if (activeName === "crear") {
          closeCreate();
          return true;
        }

        const stack = stacks[activeName] ?? [];

        // Con algo apilado, atrás desapila; en la raíz, deja que Android cierre la
        // app (F5, BR2.4).
        if (stack.length > 1) {
          popDetail();
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [activeName, stacks, popDetail, closeCreate]);

  const items = tabItemsFor(screens);
  const activeIndex = indexOfTab(activeName);
  const topEntry = (stacks[activeName] ?? []).at(-1);
  const showsDetailHeader =
    topEntry !== undefined && topEntry.kind !== "root";
  const commentsOpen = comments.opinionId !== null;
  // Se guarda aparte para que la hoja reciba un `string` ya estrechado y no haya
  // que afirmar con `!` que la opinión existe.
  const openOpinionId = comments.opinionId;

  return (
    <CreateEntryContext.Provider value={createEntry}>
      <GlobalServicesContext.Provider value={global}>
        <NavigationContainer>
          <View
            testID="app-shell-tabs"
            style={[
              styles.fill,
              // La franja de la barra de estado se reserva aquí, una sola vez
              // para las cinco pestañas y la cabecera de detalle. Sin esto, en
              // Android el reloj y los iconos del sistema se pintan encima del
              // título y del primer control de cada pantalla.
              { backgroundColor: theme.colors.bg, paddingTop: insets.top },
            ]}
          >
            {showsDetailHeader ? (
              <AppHeader
                title={headerTitle ?? "Detalle"}
                leftSlot={
                  <TextButton
                    label="‹ Volver"
                    onPress={popDetail}
                    testID="header-back"
                  />
                }
              />
            ) : null}

            <View style={styles.fill}>
              {screens.map((screen) => {
                const stack = stacks[screen.name] ?? [];

                return (
                  <View
                    key={screen.name}
                    testID={`tab-panel-${screen.name}`}
                    style={[
                      styles.fill,
                      {
                        display:
                          screen.name === activeName ? "flex" : "none",
                      },
                    ]}
                  >
                    {stack.map((entry, index) => (
                      <View
                        key={entry.key}
                        testID={`stack-entry-${entry.key}`}
                        style={[
                          styles.fill,
                          {
                            // Solo el nivel de arriba se ve; el resto queda
                            // montado y oculto para no perder su estado.
                            display:
                              index === stack.length - 1 ? "flex" : "none",
                          },
                        ]}
                      >
                        {renderEntry(entry)}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>

            {/*
              Con la hoja cerrada el aviso va aquí, sobre la barra inferior y sin
              tapar la acción principal (mockups § Snackbar). Con la hoja abierta
              viaja dentro del modal, porque un `Snackbar` montado aquí quedaría
              detrás del velo (BR14.6).
            */}
            {snackbar !== null && !commentsOpen ? (
              <View
                pointerEvents="none"
                style={[
                  styles.snackbarSlot,
                  { bottom: theme.size.tabBar + theme.space[2] },
                ]}
              >
                <Snackbar
                  message={snackbar}
                  visible
                  onDismiss={dismissSnackbar}
                />
              </View>
            ) : null}

            {commentsOpen && openOpinionId !== null ? (
              <CommentSheet
                opinionId={openOpinionId}
                comments={comments.comments}
                status={comments.status}
                failed={comments.failed}
                maxLength={comments.maxLength}
                counterFrom={comments.counterFrom}
                snackbar={
                  snackbar === null
                    ? undefined
                    : {
                        message: snackbar,
                        visible: true,
                        onDismiss: dismissSnackbar,
                      }
                }
                onSubmit={(text) => {
                  if (services.comments.submit(text)) {
                    setSnackbar("Comentario publicado");
                  }
                }}
                onRetry={services.comments.retry}
                onClose={services.comments.close}
              />
            ) : null}

            <View testID="app-shell-tabbar" style={{ paddingBottom: insets.bottom }}>
              <BottomTabBar
                items={items}
                activeIndex={activeIndex}
                onSelect={handleSelect}
              />
            </View>
          </View>
        </NavigationContainer>
      </GlobalServicesContext.Provider>
    </CreateEntryContext.Provider>
  );
}

export function AppShell({
  screens,
  initialRoute,
  services,
  entry,
}: AppShellProps) {
  return (
    <SafeAreaProvider>
      <ShellServicesContext.Provider value={services}>
        {entry !== undefined ? (
          <EntryBranch entry={entry} />
        ) : (
          <TabShell
            screens={screens}
            initialRoute={initialRoute}
            services={services}
          />
        )}
      </ShellServicesContext.Provider>
    </SafeAreaProvider>
  );
}

export type { AppShellProps };

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  snackbarSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
});
