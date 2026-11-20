/**
 * Vista pura de Actividad (BR22.4, BR23.1–BR23.4, BR24.1): recibe secciones ya mapeadas y no
 * conoce C8, C3 ni C4. Cada sección lleva su cabecera de día y sus filas; la lista
 * conserva la posición al volver del detalle y los encabezados quedan pegados
 * mientras se recorre el histórico (NFR8.17).
 *
 * Los tres estados que no son contenido no sustituyen al aviso de red: ese convive
 * con la lista y con el error, porque quedarse sin conexión no borra lo que ya se
 * había derivado.
 */
import {
  ActivityRow,
  AppHeader,
  DayHeader,
  EmptyState,
  ErrorState,
  Skeleton,
  useTheme,
} from "@melodify/design-system";
import { SectionList, StyleSheet, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import type { ActividadSection } from "./activityModel";
import type { ActividadStatus } from "../../state/useActividad";

export interface ActividadViewProps {
  status: ActividadStatus;
  sections: readonly ActividadSection[];
  online: boolean;
  onOpenOpinion: (opinionId: string) => void;
  onRetry: () => void;
  onCreate: () => void;
}

interface FeedSection extends ActividadSection {
  title: string;
  data: ActividadSection["events"];
}

export function ActividadView({
  status,
  sections,
  online,
  onOpenOpinion,
  onRetry,
  onCreate,
}: ActividadViewProps) {
  const theme = useTheme();

  const placeholder =
    status === "loading" ? (
      <View testID="actividad-loading" style={{ gap: theme.space[2] }}>
        <Skeleton shape="header" count={1} />
        <Skeleton shape="row" count={3} />
      </View>
    ) : status === "error" ? (
      <ErrorState
        message="No pudimos cargar tu actividad."
        retryLabel="Reintentar"
        onRetry={onRetry}
      />
    ) : (
      <EmptyState
        title="Todavía no hay actividad."
        actionLabel="Crear opinión"
        onAction={onCreate}
      />
    );

  const feedSections: FeedSection[] = sections.map((section) => ({
    ...section,
    title: section.label,
    data: section.events,
  }));

  return (
    <View style={styles.fill}>
      <AppHeader title="Actividad" />

      <View style={styles.content}>
        {online ? null : <OfflineBanner onRetry={onRetry} />}

        {status === "ready" ? (
          <SectionList
            testID="actividad-feed"
            sections={feedSections}
            keyExtractor={(item) => item.eventId}
            // La siembra cabe entera en la primera tanda: así el histórico no entra
            // a trozos al abrir la pestaña y las pruebas ven el feed completo.
            initialNumToRender={20}
            stickySectionHeadersEnabled
            renderSectionHeader={({ section }) => (
              <View testID="actividad-section-header">
                <DayHeader label={section.label} />
              </View>
            )}
            renderItem={({ item }) => (
              <ActivityRow
                event={item}
                onPress={() => onOpenOpinion(item.opinionId)}
              />
            )}
            ListEmptyComponent={placeholder}
            style={styles.fill}
            contentContainerStyle={{
              padding: theme.space[4],
              paddingBottom: theme.space[8],
              gap: theme.space[1],
            }}
          />
        ) : (
          <View testID="actividad-placeholder" style={styles.fill}>
            {placeholder}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  // El histórico se lee igual en un teléfono estrecho y en una tablet: la lista
  // crece hasta 720 y luego se centra, sin estirar renglones ni cabeceras.
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
});
