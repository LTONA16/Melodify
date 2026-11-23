/**
 * La vista pura de Explorar (BR17.1–BR17.11, BR18.6, BR19.1–BR19.3): recibe la
 * sesión, la red, la búsqueda y las sugerencias ya resueltas, y no pregunta nada a
 * C5, a C7 ni a la cáscara.
 *
 * Por qué la lista es un `FlatList` y no un `ScrollView`: los resultados pueden ser
 * sesenta filas —veinte canciones, veinte álbumes y veinte artistas— y la lista solo
 * debe pintar lo que cabe, conservando la posición al volver del detalle. Las
 * sugerencias usan la misma lista, así que el paso de «sin sesión» a «resultados» no
 * cambia de contenedor ni pierde el sitio.
 *
 * La capa de token caído (BR18.6) no sustituye la búsqueda: se pinta encima y deja
 * vivas la consulta y la lista. El campo sigue editable pero el contenedor no pide
 * nada mientras la capa está puesta; aquí solo se muestra el aviso y su acción.
 */
import {
  AppHeader,
  ArtistResultRow,
  ConnectionCard,
  EmptyState,
  ErrorState,
  PrimaryButton,
  SearchField,
  Skeleton,
  WorkResultRow,
  useTheme,
  type ArtistSummary,
} from "@melodify/design-system";
import type { WorkView } from "@melodify/catalog";
import type { SpotifyStatus } from "@melodify/app-shell";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import type { WorkSearchStatus } from "../../state/useWorkSearch";
import type { ExplorarSuggestion } from "./useExplorar";

/** El cuerpo común de la tarjeta de conexión en sus tres estados sin sesión. */
export const EXPLORAR_CONNECT_BODY =
  "Conecta tu cuenta para buscar en el catálogo completo. Mientras tanto, estas obras del catálogo de ejemplo también se pueden opinar.";

/**
 * Sin client ID no hay nada que reintentar: el valor se fija al empaquetar la app,
 * así que la tarjeta informa del hueco en vez de ofrecer un botón que no hace nada.
 */
export const EXPLORAR_NOT_CONFIGURED_BODY =
  "Falta el client ID de Spotify en esta instalación. Las obras del catálogo de ejemplo se pueden buscar y opinar igual.";

/** El aviso de red de Explorar cuando ya hay sesión (BR17.10). */
export const EXPLORAR_OFFLINE_MESSAGE =
  "Sin conexión. No podemos buscar en Spotify ahora mismo.";

/** El aviso de token caído con resultados (BR18.6). */
export const EXPLORAR_TOKEN_MESSAGE =
  "Tu sesión de Spotify caducó. Vuelve a conectar para buscar en el catálogo completo.";

export interface ExplorarViewProps {
  /** `null` mientras la hidratación no ha entregado el primer estado real. */
  spotifyStatus: SpotifyStatus | null;
  connecting: boolean;
  sinSesion: boolean;
  tokenCaido: boolean;
  online: boolean;
  onConnect: () => void;
  onRetryConnection: () => void;
  onVolverAConectar: () => void;

  query: string;
  searchStatus: WorkSearchStatus;
  results: readonly WorkView[];
  artists: readonly ArtistSummary[];
  onChangeQuery: (text: string) => void;
  onClearQuery: () => void;
  onSearchRetry: () => void;

  onOpenWork: (work: WorkView) => void;
  onOpenArtist: (artist: ArtistSummary) => void;
  /** El recuento lo decide C5; la vista no inventa un cero (BR17.5). */
  opinionCountFor: (workId: string) => number;
  sugerencias: readonly ExplorarSuggestion[];
}

type ResultItem =
  | { key: string; kind: "heading"; label: string }
  | { key: string; kind: "work"; work: WorkView; opinionCount: number }
  | { key: string; kind: "artist"; artist: ArtistSummary }
  | { key: string; kind: "suggestion"; work: WorkView; opinionCount: number };

function resultItems(
  results: readonly WorkView[],
  artists: readonly ArtistSummary[],
  countOpinions: (workId: string) => number,
): ResultItem[] {
  const items: ResultItem[] = [];

  if (results.length > 0) {
    items.push({ key: "heading-works", kind: "heading", label: "Obras" });
    for (const work of results) {
      items.push({
        key: `work-${work.workId}`,
        kind: "work",
        work,
        opinionCount: countOpinions(work.workId),
      });
    }
  }

  if (artists.length > 0) {
    items.push({ key: "heading-artists", kind: "heading", label: "Artistas" });
    for (const artist of artists) {
      items.push({
        key: `artist-${artist.artistId}`,
        kind: "artist",
        artist,
      });
    }
  }

  return items;
}

function suggestionItems(
  sugerencias: readonly ExplorarSuggestion[],
): ResultItem[] {
  return sugerencias.map(({ work, opinionCount }) => ({
    key: `suggestion-${work.workId}`,
    kind: "suggestion",
    work,
    opinionCount,
  }));
}

function listTitle(theme: ReturnType<typeof useTheme>, label: string) {
  return (
    <Text
      testID="explorar-section-title"
      style={[theme.type.label, { color: theme.colors.textSecondary }]}
    >
      {label}
    </Text>
  );
}

export function ExplorarView({
  spotifyStatus,
  connecting,
  sinSesion,
  tokenCaido,
  online,
  onConnect,
  onRetryConnection,
  onVolverAConectar,
  query,
  searchStatus,
  results,
  artists,
  onChangeQuery,
  onClearQuery,
  onSearchRetry,
  onOpenWork,
  onOpenArtist,
  opinionCountFor,
  sugerencias,
}: ExplorarViewProps) {
  const theme = useTheme();
  const showSearch = spotifyStatus === "connected" || tokenCaido;
  const showConnectionCard = sinSesion && !tokenCaido;
  const showSuggestions =
    !tokenCaido && (sinSesion || connecting || searchStatus === "idle");

  const data: ResultItem[] = tokenCaido
    ? searchStatus === "results"
      ? resultItems(results, artists, opinionCountFor)
      : []
    : showSuggestions
      ? suggestionItems(sugerencias)
      : searchStatus === "results"
        ? resultItems(results, artists, opinionCountFor)
        : [];

  const empty = (() => {
    if (spotifyStatus === null) {
      return <Skeleton shape="row" count={5} />;
    }

    if (tokenCaido) {
      // La capa conserva la lista si la había; si el 401 llegó en la primera
      // búsqueda, la zona queda vacía a propósito, sin error ni esqueletos.
      return null;
    }

    if (showSuggestions) {
      return null;
    }

    if (searchStatus === "short") {
      return (
        <Text
          testID="explorar-query-short"
          style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
        >
          Escribe al menos 2 caracteres.
        </Text>
      );
    }

    if (searchStatus === "searching") {
      return (
        <View testID="explorar-search-loading">
          <Skeleton shape="row" count={5} />
        </View>
      );
    }

    if (searchStatus === "empty") {
      return (
        <EmptyState
          title={`Sin resultados para «${query.trim()}»`}
          body="Prueba con otra grafía o con el nombre del artista."
        />
      );
    }

    if (searchStatus === "error") {
      return (
        <ErrorState
          message="No pudimos buscar en Spotify."
          retryLabel="Reintentar"
          onRetry={onSearchRetry}
        />
      );
    }

    if (searchStatus === "offline") {
      return (
        <ErrorState
          message={EXPLORAR_OFFLINE_MESSAGE}
          retryLabel="Reintentar"
          onRetry={onSearchRetry}
        />
      );
    }

    return null;
  })();

  const header = (
    <View style={{ gap: theme.space[3] }}>
      {online ? null : sinSesion ? (
        <OfflineBanner />
      ) : (
        <OfflineBanner
          message={EXPLORAR_OFFLINE_MESSAGE}
          onRetry={onSearchRetry}
        />
      )}

      {connecting ? (
        <View
          testID="explorar-connecting"
          style={[
            styles.connecting,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              padding: theme.space[4],
              gap: theme.space[3],
            },
          ]}
        >
          <Text
            style={[theme.type.headline, { color: theme.colors.text }]}
          >
            Conectando…
          </Text>
          <PrimaryButton
            testID="explorar-connecting-action"
            label="Conectando…"
            onPress={onConnect}
            disabled
            loading
          />
        </View>
      ) : null}

      {showConnectionCard ? (
        spotifyStatus === "notConfigured" ? (
          <ConnectionCard
            title="La conexión con Spotify no está configurada en esta instalación."
            body={EXPLORAR_NOT_CONFIGURED_BODY}
          />
        ) : (
          <ConnectionCard
            title={
              spotifyStatus === "connectionError"
                ? "No pudimos conectar con Spotify."
                : "Busca en todo Spotify"
            }
            body={EXPLORAR_CONNECT_BODY}
            actionLabel={
              spotifyStatus === "connectionError"
                ? "Reintentar"
                : "Conectar con Spotify"
            }
            onAction={
              spotifyStatus === "connectionError"
                ? onRetryConnection
                : onConnect
            }
          />
        )
      ) : null}

      {showSearch ? (
        <SearchField
          value={query}
          onChangeText={onChangeQuery}
          onClear={onClearQuery}
          placeholder="Busca canciones, álbumes o artistas…"
          autoFocus
          loading={!tokenCaido && searchStatus === "searching"}
        />
      ) : null}

      {tokenCaido ? (
        <View testID="explorar-token-expired" style={{ gap: theme.space[2] }}>
          <Text style={[theme.type.bodySmall, { color: theme.colors.text }]}>
            {EXPLORAR_TOKEN_MESSAGE}
          </Text>
          <PrimaryButton
            testID="explorar-reconnect"
            label="Volver a conectar"
            onPress={onVolverAConectar}
          />
        </View>
      ) : null}

      {searchStatus === "idle" && !sinSesion && !tokenCaido ? (
        <View style={{ gap: theme.space[1] }}>
          <Text style={[theme.type.title2, { color: theme.colors.text }]}>
            Encuentra tu próxima opinión
          </Text>
          <Text
            style={[theme.type.body, { color: theme.colors.textSecondary }]}
          >
            Busca en el catálogo completo de Spotify o empieza por una de estas.
          </Text>
        </View>
      ) : null}

      {showSuggestions ? listTitle(theme, "Sugerencias para empezar") : null}
    </View>
  );

  return (
    <View testID="explorar-view" style={styles.fill}>
      <AppHeader title="Explorar" />

      <FlatList
        testID="explorar-list"
        data={data}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: theme.space[4],
          paddingBottom: theme.space[8],
          gap: theme.space[3],
        }}
        renderItem={({ item }) => {
          if (item.kind === "heading") {
            return listTitle(theme, item.label);
          }

          if (item.kind === "artist") {
            return (
              <ArtistResultRow
                artist={item.artist}
                onPress={() => onOpenArtist(item.artist)}
              />
            );
          }

          return (
            <WorkResultRow
              work={item.work}
              opinionCount={item.opinionCount}
              kind={item.work.workKind}
              onPress={() => onOpenWork(item.work)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  connecting: {
    borderWidth: 1,
  },
});
