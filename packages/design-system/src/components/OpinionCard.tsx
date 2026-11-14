/**
 * La tarjeta de opinión (C1): la única del sistema, y la usan todas las pantallas.
 * `isOwn` es una propiedad, no una variante: la pantalla la pasa desde su vista y
 * la tarjeta decide si muestra «Editar».
 *
 * En la variante `feed` el texto se recorta a tres líneas con elipsis; el detalle
 * no recorta. Las acciones son opcionales: sin callback no responden, que es lo que
 * convierte la tarjeta sembrada de U1 en lectura pura (BR3.2).
 *
 * Estado `own` (1.2.0, revisión 12 del contrato): en variante `detail` con `isOwn`
 * verdadero la tarjeta se destaca con el fondo `primaryContainer`, rotula «Tu
 * opinión» dentro de la tarjeta —no como encabezado de sección— y cambia el tiempo
 * transcurrido por la línea de fechas, porque AC4.2.1 pide una opinión propia
 * «destacada» y AC4.2.4 ver creación y modificación.
 *
 * «Editar» se pinta con `isOwn` y **no** con la llegada de `onEdit`: si dependiera
 * del callback, AC4.2.1 no se cumpliría hasta que U3 cablee la acción. En U2 se
 * pinta sin efecto —el mismo trato que el chip «Conectar» hasta U4— y U3 le pasa
 * `onEdit`.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatCalendarDate } from "../calendar-date";
import type { OpinionCardModel, OpinionVariant } from "../models";
import { formatRelativeTime } from "../relative-time";
import { useTheme } from "../useTheme";
import { Avatar } from "./Avatar";
import { CoverArt } from "./CoverArt";
import { RatingStars } from "./RatingStars";
import { SocialActionBar } from "./SocialActionBar";

export interface OpinionCardProps {
  opinion: OpinionCardModel;
  variant: OpinionVariant;
  isOwn: boolean;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onFollow?: () => void;
  onEdit?: () => void;
}

const TEXT_LINES: Record<OpinionVariant, number | undefined> = {
  feed: 3,
  compact: 2,
  detail: undefined,
};

/** «Creada el 4 nov 2026» y, solo si se editó, « · Editada el 6 nov 2026». */
function formatOwnDates(opinion: OpinionCardModel): string {
  const created = `Creada el ${formatCalendarDate(opinion.createdAt)}`;
  const edited = opinion.updatedAt !== opinion.createdAt;

  return edited
    ? `${created} · Editada el ${formatCalendarDate(opinion.updatedAt)}`
    : created;
}

export function OpinionCard({
  opinion,
  variant,
  isOwn,
  onPress,
  onLike,
  onComment,
  onFollow,
  onEdit,
}: OpinionCardProps) {
  const theme = useTheme();
  const coverSize = variant === "detail" ? "detail" : "card";
  const titleStyle = variant === "detail" ? theme.type.headline : theme.type.bodySmall;
  const isOwnDetail = variant === "detail" && isOwn;
  const ink = isOwnDetail ? theme.colors.onPrimaryContainer : theme.colors.text;

  return (
    <Pressable
      testID={`opinion-card-${opinion.opinionId}`}
      accessibilityRole={onPress === undefined ? undefined : "button"}
      disabled={onPress === undefined}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isOwnDetail
            ? theme.colors.primaryContainer
            : theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.space[4],
          gap: theme.space[3],
        },
      ]}
    >
      {isOwnDetail ? (
        <View style={[styles.footerRow, styles.actionsRow]}>
          <Text
            testID="opinion-own-label"
            style={[theme.type.label, { color: theme.colors.onPrimaryContainer }]}
          >
            Tu opinión
          </Text>
          <Pressable
            testID="opinion-edit"
            accessibilityRole="button"
            accessibilityLabel="Editar"
            accessibilityState={{ disabled: onEdit === undefined }}
            disabled={onEdit === undefined}
            onPress={onEdit}
            style={[styles.inlineAction, { minHeight: theme.size.touch }]}
          >
            <Text style={[theme.type.label, { color: theme.colors.primary }]}>
              Editar
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.headerRow, { gap: theme.space[3] }]}>
        <CoverArt
          title={opinion.workTitle}
          coverUrl={opinion.coverUrl}
          size={coverSize}
        />
        <View style={styles.headerText}>
          <Text
            testID="opinion-work-title"
            numberOfLines={2}
            style={[titleStyle, { color: ink }]}
          >
            {opinion.workTitle}
          </Text>
          <Text
            testID="opinion-work-artist"
            numberOfLines={1}
            style={[theme.type.caption, { color: theme.colors.textSecondary }]}
          >
            {opinion.workArtist}
          </Text>
          <RatingStars rating={opinion.rating} showValue />
        </View>
      </View>

      <Text
        testID="opinion-text"
        numberOfLines={TEXT_LINES[variant]}
        ellipsizeMode="tail"
        style={[theme.type.bodySmall, { color: ink }]}
      >
        {opinion.text}
      </Text>

      <View style={[styles.footerRow, { gap: theme.space[2] }]}>
        <Avatar
          author={{
            displayName: opinion.authorName,
            handle: opinion.authorHandle,
          }}
          size="small"
        />
        <Text
          testID="opinion-author"
          style={[theme.type.caption, styles.author, { color: theme.colors.textSecondary }]}
        >
          {opinion.authorName}
        </Text>
        {isOwnDetail ? null : (
          <Text
            testID="opinion-created-at"
            style={[theme.type.caption, { color: theme.colors.textMuted }]}
          >
            {formatRelativeTime(opinion.createdAt)}
          </Text>
        )}
      </View>

      {isOwnDetail ? (
        <Text
          testID="opinion-own-dates"
          style={[theme.type.caption, { color: theme.colors.onPrimaryContainer }]}
        >
          {formatOwnDates(opinion)}
        </Text>
      ) : null}

      <View style={[styles.footerRow, styles.actionsRow, { gap: theme.space[2] }]}>
        <SocialActionBar
          likeCount={opinion.likeCount}
          commentCount={opinion.commentCount}
          likedByMe={opinion.likedByMe}
          onLike={onLike}
          onComment={onComment}
        />

        {!isOwn && onFollow !== undefined ? (
          <Pressable
            testID="opinion-follow"
            accessibilityRole="button"
            accessibilityLabel="Seguir"
            onPress={onFollow}
            style={[styles.inlineAction, { minHeight: theme.size.touch }]}
          >
            <Text style={[theme.type.label, { color: theme.colors.primary }]}>
              Seguir
            </Text>
          </Pressable>
        ) : null}

        {!isOwnDetail && isOwn && onEdit !== undefined ? (
          <Pressable
            testID="opinion-edit"
            accessibilityRole="button"
            accessibilityLabel="Editar"
            onPress={onEdit}
            style={[styles.inlineAction, { minHeight: theme.size.touch }]}
          >
            <Text style={[theme.type.label, { color: theme.colors.primary }]}>
              Editar
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsRow: {
    justifyContent: "space-between",
  },
  author: {
    flexShrink: 1,
  },
  inlineAction: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
