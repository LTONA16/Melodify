/**
 * La tarjeta de conexión con Spotify (C1 1.4.0, BR16.7).
 *
 * Por qué recibe el estado y los callbacks en vez de conocer C7: así se prueban los
 * seis estados sin dobles de red y el sistema de diseño sigue sin saber qué es
 * Spotify, igual que `ConnectionCard` (assumption de frontend-components.md).
 *
 * Textos y acciones:
 * - `disconnected`: «Sin conectar» + conectar.
 * - `connecting`: «Conectando…» con indicador y botón deshabilitado; el estado sale
 *   siempre, así que no hay un botón que invite a pulsar dos veces.
 * - `connected`: «Conectado» + desconectar en tono de peligro.
 * - `connectionError`: «No pudimos conectar con Spotify.» + reintentar.
 * - `invalidToken`: sesión caducada + conectar otra vez.
 * - `notConfigured`: instalación sin client ID + reintentar.
 */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { SpotifyConnectionStatus } from "../models";
import { useTheme } from "../useTheme";
import { PrimaryButton } from "./PrimaryButton";
import { TextButton } from "./TextButton";

export interface SpotifyCardProps {
  status: SpotifyConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onRetry: () => void;
}

interface CardCopy {
  title: string;
  body: string | null;
}

function copyFor(status: SpotifyConnectionStatus): CardCopy {
  switch (status) {
    case "disconnected":
      return {
        title: "Sin conectar",
        body: "Conecta para ver portadas y buscar en el catálogo completo.",
      };
    case "connecting":
      return { title: "Conectando…", body: null };
    case "connected":
      return { title: "Conectado", body: "Conectado con tu cuenta." };
    case "connectionError":
      return { title: "No pudimos conectar con Spotify.", body: null };
    case "invalidToken":
      return {
        title: "Tu sesión de Spotify caducó. Vuelve a conectar.",
        body: null,
      };
    case "notConfigured":
      return {
        title: "La conexión con Spotify no está configurada en esta instalación.",
        body: null,
      };
  }
}

export function SpotifyCard({
  status,
  onConnect,
  onDisconnect,
  onRetry,
}: SpotifyCardProps) {
  const theme = useTheme();
  const copy = copyFor(status);

  return (
    <View
      testID="spotify-card"
      style={[
        styles.card,
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
        testID="spotify-card-status"
        style={[theme.type.headline, { color: theme.colors.text }]}
      >
        {copy.title}
      </Text>

      {copy.body === null ? null : (
        <Text
          testID="spotify-card-body"
          style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}
        >
          {copy.body}
        </Text>
      )}

      {status === "disconnected" ? (
        <PrimaryButton
          testID="spotify-card-connect"
          label="Conectar con Spotify"
          onPress={onConnect}
        />
      ) : null}

      {status === "connecting" ? (
        <View style={styles.connecting}>
          <ActivityIndicator
            testID="spotify-card-connecting"
            color={theme.colors.primary}
          />
          <PrimaryButton
            testID="spotify-card-connecting-button"
            label="Conectando…"
            onPress={onConnect}
            disabled
          />
        </View>
      ) : null}

      {status === "connected" ? (
        <TextButton
          testID="spotify-card-disconnect"
          label="Desconectar"
          tone="danger"
          onPress={onDisconnect}
        />
      ) : null}

      {status === "connectionError" ? (
        <PrimaryButton
          testID="spotify-card-retry"
          label="Reintentar"
          onPress={onRetry}
        />
      ) : null}

      {status === "invalidToken" ? (
        <PrimaryButton
          testID="spotify-card-connect"
          label="Conectar con Spotify"
          onPress={onConnect}
        />
      ) : null}

      {status === "notConfigured" ? (
        <PrimaryButton
          testID="spotify-card-retry"
          label="Reintentar"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  connecting: {
    gap: 12,
  },
});
