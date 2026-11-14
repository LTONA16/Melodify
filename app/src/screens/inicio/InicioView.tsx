/**
 * La vista pura de Inicio (BR7.1–BR7.6, BR7.9): recibe ya resueltos el estado, las
 * tarjetas mapeadas, la red, el fallo de metadatos y el estado de Spotify, y no
 * pregunta nada a C4 ni a C5. Todo lo que necesita para pintarse llega por props, así
 * que cada estado se puede recorrer en una prueba sin almacén ni catálogo.
 *
 * Por qué una lista y no un `ScrollView` con las tarjetas dentro: el feed son diez
 * tarjetas y crecerá con cada opinión publicada; la lista solo pinta lo que cabe y
 * conserva la posición al volver del detalle (AC2.3.2, NFR8.7). La cabecera y los
 * avisos van en `ListHeaderComponent`, que se desplaza con el contenido y no se queda
 * fijo tapando la lista.
 *
 * Los tres estados de la lista son excluyentes y se pintan en el hueco de las
 * tarjetas: `loading` con tres esqueletos, `error` con el error de contenido y, con
 * la lista vacía, el vacío con su acción (BR7.2–BR7.4). Los avisos de metadatos y de
 * sin conexión no sustituyen a la lista: conviven con ella (BR7.5, BR7.6).
 */
import type { SpotifyStatus } from "@melodify/app-shell";
import {
  Banner,
  EmptyState,
  ErrorState,
  OpinionCard,
  Skeleton,
  useTheme,
  type OpinionCardModel,
} from "@melodify/design-system";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import type { ContentStatus } from "../../state/useContent";
import { InicioHeader } from "./InicioHeader";

/**
 * Una tarjeta del feed con su condición de propia. `isOwn` viaja al lado del modelo
 * y no dentro de él: `OpinionCardModel` es la forma de C1 y el mapeo de C4
 * (`toOpinionCardModel`) no la inventa; el dato sale de la vista de C4 (BR4.6).
 */
export interface InicioCard {
  opinion: OpinionCardModel;
  isOwn: boolean;
}

export interface InicioViewProps {
  status: ContentStatus;
  cards: readonly InicioCard[];
  /** Si hay red; con `false` se pinta el aviso y las portadas siguen en bloque. */
  online: boolean;
  /** Si la última resolución de metadatos falló (BR7.5). */
  metadataError: boolean;
  spotifyStatus: SpotifyStatus;
  onOpenOpinion: (opinionId: string) => void;
  onRetry: () => void;
  onRetryCovers: () => void;
  onCreate: () => void;
}

export function InicioView({
  status,
  cards,
  online,
  metadataError,
  spotifyStatus,
  onOpenOpinion,
  onRetry,
  onRetryCovers,
  onCreate,
}: InicioViewProps) {
  const theme = useTheme();

  const header = (
    <View style={{ gap: theme.space[3] }}>
      {metadataError ? (
        <Banner
          message="No pudimos actualizar las portadas."
          actionLabel="Reintentar"
          onAction={onRetryCovers}
        />
      ) : null}

      {online ? null : <OfflineBanner onRetry={onRetryCovers} />}

      <Text style={[theme.type.title2, { color: theme.colors.text }]}>
        Para ti
      </Text>
    </View>
  );

  const empty =
    status === "loading" ? (
      // Tres tarjetas de esqueleto: el mismo hueco que ocuparán las reales, para que
      // el paso a contenido no mueva la pantalla (BR7.2).
      <Skeleton shape="card" count={3} />
    ) : status === "error" ? (
      <ErrorState
        message="No pudimos cargar las opiniones."
        retryLabel="Reintentar"
        onRetry={onRetry}
      />
    ) : (
      <EmptyState
        title="Aún no hay opiniones."
        body="Sé el primero."
        actionLabel="Crear opinión"
        onAction={onCreate}
      />
    );

  return (
    <View style={styles.fill}>
      <InicioHeader spotifyStatus={spotifyStatus} />

      <FlatList
        testID="inicio-feed"
        data={status === "ready" ? cards : []}
        keyExtractor={(card) => card.opinion.opinionId}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        style={styles.fill}
        contentContainerStyle={{
          padding: theme.space[4],
          paddingBottom: theme.space[8],
          gap: theme.space[3],
        }}
        renderItem={({ item }) => (
          <OpinionCard
            opinion={item.opinion}
            variant="feed"
            isOwn={item.isOwn}
            onPress={() => onOpenOpinion(item.opinion.opinionId)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
