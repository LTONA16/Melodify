/**
 * La vista del detalle de opinión (F8, AC2.3.3): pura.
 *
 * Pinta la identidad de la obra y la opinión **completa**, sin recortar; la tarjeta
 * es la misma de C1 en variante `detail`, y si la opinión es propia muestra «Tu
 * opinión», «Editar» y la línea de fechas (AC9.1.4). El texto no se reescribe aquí:
 * la tarjeta lo recibe ya mapeado.
 *
 * Si la obra no está en el catálogo, el contenedor trae el título y el artista de la
 * propia opinión y `coverUrl` nulo, así que la cabecera se ve igual con el bloque
 * con la inicial (BR5.2).
 */
import type { OpinionCardModel } from "@melodify/design-system";
import {
  ErrorState,
  OpinionCard,
  Skeleton,
  useTheme,
} from "@melodify/design-system";
import { ScrollView, StyleSheet, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import { WorkHeader } from "../../components/WorkHeader";
import type { ContentStatus } from "../../state/useContent";

export interface DetalleOpinionViewProps {
  status: ContentStatus;
  card: OpinionCardModel | null;
  isOwn: boolean;
  workTitle: string;
  workArtist: string;
  coverUrl: string | null;
  average: number;
  opinionCount: number;
  online: boolean;
  onRetry: () => void;
  onRetryCovers: () => void;
}

export function DetalleOpinionView({
  status,
  card,
  isOwn,
  workTitle,
  workArtist,
  coverUrl,
  average,
  opinionCount,
  online,
  onRetry,
  onRetryCovers,
}: DetalleOpinionViewProps) {
  const theme = useTheme();

  return (
    <ScrollView
      testID="detalle-opinion"
      contentContainerStyle={[
        styles.content,
        { padding: theme.space[4], gap: theme.space[4] },
      ]}
    >
      {online ? null : <OfflineBanner onRetry={onRetryCovers} />}

      {status === "loading" ? (
        <View testID="detalle-opinion-loading" style={{ gap: theme.space[3] }}>
          <Skeleton shape="header" count={1} />
          <Skeleton shape="card" count={1} />
        </View>
      ) : status === "error" ? (
        <ErrorState
          message="No pudimos cargar esta opinión."
          retryLabel="Reintentar"
          onRetry={onRetry}
        />
      ) : card === null ? (
        <ErrorState
          message="No pudimos cargar esta opinión."
          retryLabel="Reintentar"
          onRetry={onRetry}
        />
      ) : (
        <>
          <WorkHeader
            title={workTitle}
            artist={workArtist}
            coverUrl={coverUrl}
            average={average}
            opinionCount={opinionCount}
          />
          <OpinionCard opinion={card} variant="detail" isOwn={isOwn} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
});
