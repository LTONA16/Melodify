/**
 * La vista pura del detalle de obra (BR8.1–BR8.8): recibe la identidad ya resuelta,
 * la opinión propia (si existe), las ajenas, la media, el recuento y la portada, y no
 * pregunta nada a C4 ni a C5.
 *
 * Las cuatro variantes —mía + ajenas, mía sola, ajenas sin mía, sin opiniones— salen
 * de la misma composición y no de cuatro pantallas: la tarjeta propia va primero y
 * sin encabezado de sección, porque la etiqueta «Tu opinión» vive dentro de la
 * tarjeta; «Otras opiniones» aparece solo si hay ajenas; y el botón de opinar solo
 * aparece sin opinión propia (BR8.3–BR8.5). Ese orden es una regla de la
 * especificación, no una preferencia de dibujo.
 *
 * La identidad (`WorkHeader`) se pinta siempre que se conozca, también cuando la
 * lectura falla: la persona sigue sabiendo qué obra abrió y el error se queda debajo
 * (BR8.8). Solo cuando ni la obra se pudo resolver —o mientras carga— hay hueco para
 * los esqueletos y para el error a solas.
 *
 * `ScrollView` y no lista: el detalle muestra una obra concreta y su número de
 * opiniones no justifica virtualizar; además, el texto de las tarjetas va completo
 * —sin recortar— y la altura es la que pida el contenido (AC4.1.2).
 */
import {
  ErrorState,
  OpinionCard,
  PrimaryButton,
  Skeleton,
  useTheme,
  type OpinionCardModel,
} from "@melodify/design-system";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import { WorkHeader } from "../../components/WorkHeader";
import type { ContentStatus } from "../../state/useContent";
import type { DetalleObraWork } from "./useDetalleObra";

export interface DetalleObraViewProps {
  status: ContentStatus;
  /** La identidad, o `null` si ni la obra se pudo resolver (BR8.8). */
  work: DetalleObraWork | null;
  /** La URL de portada ya decidida por C5; `null` deja el bloque con la inicial. */
  coverUrl: string | null;
  /** Media de las valoraciones ya redondeada al entero. */
  average: number;
  opinionCount: number;
  /** La opinión de quien mira, si existe: va primero y en estado `own` (BR8.4). */
  own: OpinionCardModel | null;
  others: readonly OpinionCardModel[];
  /** Si hay red; con `false` se pinta el aviso de sin conexión (BR10.5). */
  online: boolean;
  onRetry: () => void;
  /** Reintenta la resolución de portadas; es la acción del aviso de sin conexión. */
  onRetryCovers: () => void;
  onCreateOpinion: () => void;
}

export function DetalleObraView({
  status,
  work,
  coverUrl,
  average,
  opinionCount,
  own,
  others,
  online,
  onRetry,
  onRetryCovers,
  onCreateOpinion,
}: DetalleObraViewProps) {
  const theme = useTheme();
  const hasOwn = own !== null;
  const hasOthers = others.length > 0;
  const showCreate = status === "ready" && !hasOwn;

  return (
    <ScrollView
      testID="detalle-obra"
      style={styles.fill}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: theme.space[8], gap: theme.space[4] },
      ]}
    >
      {online ? null : (
        <View style={{ paddingHorizontal: theme.space[4], paddingTop: theme.space[4] }}>
          <OfflineBanner onRetry={onRetryCovers} />
        </View>
      )}

      {work === null ? null : (
        <WorkHeader
          title={work.title}
          artist={work.artist}
          coverUrl={coverUrl}
          average={average}
          opinionCount={opinionCount}
        />
      )}

      <View
        style={{
          paddingHorizontal: theme.space[4],
          gap: theme.space[4],
        }}
      >
        {status === "loading" ? (
          // El mismo hueco que ocuparán la identidad y las dos tarjetas, para que el
          // paso a contenido no mueva la pantalla (BR8.12).
          <>
            <Skeleton shape="header" count={1} />
            <Skeleton shape="card" count={2} />
          </>
        ) : status === "error" ? (
          <ErrorState
            message="No pudimos cargar esta obra."
            retryLabel="Reintentar"
            onRetry={onRetry}
          />
        ) : (
          <>
            {own === null ? null : (
              <OpinionCard opinion={own} variant="detail" isOwn />
            )}

            {hasOthers ? (
              <View style={{ gap: theme.space[3] }}>
                <Text style={[theme.type.title2, { color: theme.colors.text }]}>
                  Otras opiniones
                </Text>
                {others.map((card) => (
                  <OpinionCard
                    key={card.opinionId}
                    opinion={card}
                    variant="detail"
                    isOwn={false}
                  />
                ))}
              </View>
            ) : hasOwn ? (
              <Text
                style={[theme.type.body, { color: theme.colors.textSecondary }]}
              >
                Nadie más ha opinado todavía.
              </Text>
            ) : (
              <Text
                style={[theme.type.body, { color: theme.colors.textSecondary }]}
              >
                Todavía nadie ha opinado sobre esta obra.
              </Text>
            )}

            {showCreate ? (
              <PrimaryButton
                label="Opinar sobre esta obra"
                testID="detalle-obra-create"
                onPress={onCreateOpinion}
              />
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
