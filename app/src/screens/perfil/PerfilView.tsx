/**
 * La vista de Perfil (F10, BR9.1–BR9.9): pura.
 *
 * Identidad, contadores y opiniones propias en variante `compact`, de la más
 * reciente a la más antigua. «Cerrar sesión» es un `TextButton` en tono de error
 * porque es la única acción destructiva de la pantalla (BR9.7). En U2 **no** hay
 * tarjeta de Spotify: el hueco lo llena U4 (BR9.9).
 *
 * Los contadores se escriben con singular: «1 opinión · 1 siguiendo», no «1
 * opiniones».
 */
import type { OpinionCardModel } from "@melodify/design-system";
import {
  AppHeader,
  Avatar,
  EmptyState,
  ErrorState,
  OpinionCard,
  Skeleton,
  TextButton,
  useTheme,
} from "@melodify/design-system";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import { formatOpinionCount } from "../../components/WorkHeader";
import type { ContentStatus } from "../../state/useContent";

export interface PerfilAuthorView {
  displayName: string;
  handle: string;
  opinionCount: number;
  followingCount: number;
}

export interface PerfilViewProps {
  status: ContentStatus;
  author: PerfilAuthorView | null;
  cards: readonly OpinionCardModel[];
  online: boolean;
  onOpenOpinion: (opinionId: string) => void;
  onRetry: () => void;
  onRetryCovers: () => void;
  onCreate: () => void;
  onSignOut: () => void;
}

function formatFollowingCount(count: number): string {
  return count === 1 ? "1 siguiendo" : `${count} siguiendo`;
}

export function PerfilView({
  status,
  author,
  cards,
  online,
  onOpenOpinion,
  onRetry,
  onRetryCovers,
  onCreate,
  onSignOut,
}: PerfilViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.fill}>
      <AppHeader title="Perfil" />

      <ScrollView
        testID="perfil-scroll"
        contentContainerStyle={[
          styles.content,
          { padding: theme.space[4], gap: theme.space[4] },
        ]}
      >
        {online ? null : <OfflineBanner onRetry={onRetryCovers} />}

        {status === "loading" ? (
          <View testID="perfil-loading" style={{ gap: theme.space[3] }}>
            <Skeleton shape="header" count={1} />
            <Skeleton shape="row" count={2} />
            <Skeleton shape="card" count={3} />
          </View>
        ) : status === "error" ? (
          <ErrorState
            message="No pudimos cargar tu perfil."
            retryLabel="Reintentar"
            onRetry={onRetry}
          />
        ) : author === null ? (
          <ErrorState
            message="No pudimos cargar tu perfil."
            retryLabel="Reintentar"
            onRetry={onRetry}
          />
        ) : (
          <>
            <View style={[styles.identity, { gap: theme.space[3] }]}>
              <Avatar author={author} size="large" />
              <View style={{ gap: theme.space[1] }}>
                <Text
                  testID="perfil-name"
                  style={[theme.type.title2, { color: theme.colors.text }]}
                >
                  {author.displayName}
                </Text>
                <Text
                  testID="perfil-handle"
                  style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
                >
                  {`@${author.handle}`}
                </Text>
              </View>
            </View>

            <Text
              testID="perfil-counters"
              style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
            >
              {`${formatOpinionCount(author.opinionCount)} · ${formatFollowingCount(author.followingCount)}`}
            </Text>

            <Text style={[theme.type.title2, { color: theme.colors.text }]}>
              Mis opiniones
            </Text>

            {cards.length === 0 ? (
              <EmptyState
                title="Todavía no has publicado opiniones."
                actionLabel="Crear opinión"
                onAction={onCreate}
              />
            ) : (
              <View style={{ gap: theme.space[3] }}>
                {cards.map((opinion) => (
                  <OpinionCard
                    key={opinion.opinionId}
                    opinion={opinion}
                    variant="compact"
                    isOwn
                    onPress={() => onOpenOpinion(opinion.opinionId)}
                  />
                ))}
              </View>
            )}

            <TextButton
              label="Cerrar sesión"
              tone="danger"
              onPress={onSignOut}
              testID="perfil-sign-out"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
  },
});
