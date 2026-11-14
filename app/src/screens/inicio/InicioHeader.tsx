/**
 * La cabecera de Inicio (F6.2, BR7.9): el título de la pestaña y el chip de Spotify.
 *
 * El chip dice «Conectado», con su punto verde, solo cuando el estado de Spotify es
 * `connected`; en cualquier otro caso dice «Conectar». En U2 nunca hay sesión de
 * Spotify, así que se pinta «Conectar» y tocarlo no inicia nada: la acción la cablea
 * U4 (Q2 = A). Se pinta como control desde ya para reservar el área táctil mínima.
 *
 * El punto verde acompaña al texto y no lo sustituye: el color no puede ser el único
 * portador de significado (regla de color del sistema).
 */
import { AppHeader, useTheme } from "@melodify/design-system";
import type { SpotifyStatus } from "@melodify/app-shell";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface InicioHeaderProps {
  /** El estado de Spotify que publica la cáscara; en U2 siempre `disconnected`. */
  spotifyStatus: SpotifyStatus;
}

export function InicioHeader({ spotifyStatus }: InicioHeaderProps) {
  return (
    <AppHeader
      title="Inicio"
      rightSlot={<SpotifyChip connected={spotifyStatus === "connected"} />}
    />
  );
}

function SpotifyChip({ connected }: { connected: boolean }) {
  const theme = useTheme();
  const label = connected ? "Conectado" : "Conectar";

  return (
    <Pressable
      testID="spotify-chip"
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => undefined}
      style={[
        styles.chip,
        {
          minHeight: theme.size.touch,
          gap: theme.space[1],
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.space[3],
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      {connected ? (
        <View
          testID="spotify-chip-dot"
          style={[styles.dot, { backgroundColor: theme.colors.success }]}
        />
      ) : null}
      <Text
        style={[theme.type.label, { color: theme.colors.onPrimaryContainer }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
