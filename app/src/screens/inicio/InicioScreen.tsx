/**
 * Inicio (F6, BR3.1–BR3.3): la cabecera con el chip de Spotify, el encabezado de
 * sección «Para ti» y la tarjeta sembrada. Es una pantalla de lectura: no navega,
 * no tiene acciones sociales y no hay estados de carga ni de error en U1.
 *
 * La pantalla mapea la semilla a `OpinionCardModel` (el sistema de diseño no conoce
 * el contenido) y acepta una lista para que la prueba del estado vacío recorra el
 * mismo camino que recorrería U2 con el feed sin datos.
 */
import {
  AppHeader,
  EmptyState,
  OpinionCard,
  useTheme,
  type OpinionCardModel,
} from "@melodify/design-system";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { inicioSeed } from "./seed";

export interface InicioScreenProps {
  /** Semilla a pintar. Sin elementos pinta el estado vacío sin acción (BR3.1). */
  opinions?: readonly OpinionCardModel[];
}

export function InicioScreen({ opinions = inicioSeed }: InicioScreenProps) {
  const theme = useTheme();

  return (
    <View style={styles.fill}>
      <AppHeader title="Inicio" rightSlot={<SpotifyChip />} />

      <ScrollView
        testID="inicio-scroll"
        contentContainerStyle={[
          styles.content,
          { padding: theme.space[4], gap: theme.space[3] },
        ]}
      >
        <Text style={[theme.type.title2, { color: theme.colors.text }]}>
          Para ti
        </Text>

        {opinions.length === 0 ? (
          // La pieza pide título y cuerpo; la especificación da una sola frase, así
          // que va entera en el título y el cuerpo queda vacío a propósito.
          <EmptyState title="Aún no hay opiniones. Sé el primero." body="" />
        ) : (
          opinions.map((opinion) => (
            <OpinionCard
              key={opinion.opinionId}
              opinion={opinion}
              variant="feed"
              isOwn={false}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

/**
 * El chip de estado de Spotify (F6.2). En U1 siempre dice «Conectar» y no hace
 * nada: lo cablea U4 al servicio de Spotify inyectado en la cáscara. Se pinta como
 * control porque en la versión final se toca, y mide el mínimo táctil desde ya.
 */
function SpotifyChip() {
  const theme = useTheme();

  return (
    <Pressable
      testID="spotify-chip"
      accessibilityRole="button"
      accessibilityLabel="Conectar"
      onPress={() => undefined}
      style={[
        styles.chip,
        {
          minHeight: theme.size.touch,
          borderRadius: theme.radius.pill,
          paddingHorizontal: theme.space[3],
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      <Text style={[theme.type.label, { color: theme.colors.onPrimaryContainer }]}>
        Conectar
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  chip: {
    alignItems: "center",
    justifyContent: "center",
  },
});
