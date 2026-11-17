/**
 * Hoja de comentarios (C1 1.3.0): la lista, su estado, el campo y el envío.
 *
 * El borrador vive aquí y no en el controlador, por eso sobrevive al error de
 * envío: la hoja no se desmonta, se le dice que el último envío falló (`failed`) y
 * el texto sigue donde estaba (BR14.5). Se limpia cuando el comentario aparece ya
 * en la lista —la señal de que la escritura salió bien—, nunca al pulsar, porque
 * limpiar al pulsar sería exactamente perder lo escrito cuando falla.
 *
 * El contador y el tope llegan como props: C1 no importa C4 (TS-28). La cáscara
 * los toma de `CommentSheetState`, que los rellena el controlador.
 *
 * El aviso de la cáscara se pinta **dentro** del modal cuando llega en `snackbar`:
 * el `Modal` de React Native queda por encima del cuerpo de la app y un snackbar
 * montado fuera quedaría detrás del velo (BR14.6).
 *
 * React Native no tiene un rol `dialog`; la semántica modal se declara con
 * `accessibilityViewIsModal` y la etiqueta, sin inventar un rol que no existe.
 */
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { formatRelativeTime } from "../relative-time";
import { useTheme } from "../useTheme";
import { Avatar } from "./Avatar";
import { MultilineField } from "./MultilineField";
import { Skeleton } from "./Skeleton";
import { Snackbar } from "./Snackbar";
import { TextButton } from "./TextButton";
import type { CommentModel } from "../models";

export type CommentSheetStatus = "loading" | "ready" | "empty" | "error";

export interface CommentSheetSnackbar {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export interface CommentSheetProps {
  opinionId: string;
  comments: CommentModel[];
  status: CommentSheetStatus;
  failed?: boolean;
  maxLength?: number;
  counterFrom?: number;
  snackbar?: CommentSheetSnackbar;
  onSubmit: (text: string) => void;
  onRetry: () => void;
  onClose: () => void;
}

const SHEET_HEIGHT_RATIO = 0.7;

export function CommentSheet({
  opinionId,
  comments,
  status,
  failed = false,
  maxLength,
  counterFrom,
  snackbar,
  onSubmit,
  onRetry,
  onClose,
}: CommentSheetProps) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  // El borrador se guarda por opinión y no se reinicia desde un efecto: una hoja
  // nueva es otra clave del mapa, así que empieza vacía sin tocar el estado de la
  // anterior (react-hooks prohíbe el `setState` síncrono dentro de un efecto).
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{
    opinionId: string;
    text: string;
    baseline: number;
  } | null>(null);

  // El texto se limpia cuando el comentario ya está en la lista —la señal de que
  // la escritura salió bien—, no al pulsar «Enviar»: si el envío falla, lo
  // escrito sigue en el campo. `baseline` evita que un comentario viejo con el
  // mismo texto se confunda con la llegada del nuevo.
  const arrived =
    submitted !== null &&
    submitted.opinionId === opinionId &&
    comments.length > submitted.baseline &&
    comments.some((comment) => comment.text === submitted.text);

  const draft = arrived ? "" : (drafts[opinionId] ?? "");
  const trimmed = draft.trim();
  const canSend = trimmed !== "";

  function changeDraft(text: string): void {
    if (submitted !== null) {
      setSubmitted(null);
    }
    setDrafts((current) => ({ ...current, [opinionId]: text }));
  }

  function send(text: string): void {
    const value = text.trim();
    if (value === "") {
      return;
    }
    setSubmitted({ opinionId, text: value, baseline: comments.length });
    onSubmit(value);
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        testID="comment-sheet"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.root}
      >
        <Pressable
          testID="comment-sheet-overlay"
          accessibilityRole="button"
          accessibilityLabel="Cerrar comentarios"
          onPress={onClose}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.overlay },
          ]}
        />

        <View
          accessibilityViewIsModal
          accessibilityLabel="Comentarios"
          style={[
            styles.sheet,
            {
              maxHeight: height * SHEET_HEIGHT_RATIO,
              backgroundColor: theme.colors.surfaceRaised,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingTop: theme.space[4],
              paddingHorizontal: theme.space[4],
              paddingBottom: theme.space[4],
              gap: theme.space[3],
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              testID="comment-sheet-title"
              accessibilityRole="header"
              style={[theme.type.title2, { color: theme.colors.text }]}
            >
              Comentarios
            </Text>
            <Pressable
              testID="comment-sheet-close"
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              onPress={onClose}
              style={[
                styles.iconButton,
                {
                  minWidth: theme.size.touch,
                  minHeight: theme.size.touch,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={theme.size.icon.base}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.body}>
            {status === "loading" ? (
              <View testID="comment-sheet-loading">
                <Skeleton shape="row" count={3} />
              </View>
            ) : null}

            {status === "empty" ? (
              <Text
                testID="comment-sheet-empty"
                style={[
                  theme.type.bodySmall,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Sé el primero en comentar
              </Text>
            ) : null}

            {status === "error" ? (
              <View
                testID="comment-sheet-load-error"
                accessibilityRole="alert"
                style={[styles.messageRow, { gap: theme.space[2] }]}
              >
                <Text
                  style={[
                    theme.type.bodySmall,
                    styles.message,
                    { color: theme.colors.error },
                  ]}
                >
                  No pudimos cargar los comentarios.
                </Text>
                <TextButton
                  testID="comment-sheet-retry-load"
                  label="Reintentar"
                  onPress={onRetry}
                />
              </View>
            ) : null}

            {status === "ready" ? (
              <ScrollView
                testID="comment-sheet-list"
                style={styles.list}
                contentContainerStyle={{ gap: theme.space[3] }}
                keyboardShouldPersistTaps="handled"
              >
                {comments.map((comment) => (
                  <View
                    key={comment.commentId}
                    testID={`comment-row-${comment.commentId}`}
                    style={[styles.commentRow, { gap: theme.space[2] }]}
                  >
                    <Avatar
                      author={{
                        displayName: comment.authorName,
                        handle: comment.authorHandle,
                      }}
                      size="small"
                    />
                    <View style={styles.commentTexts}>
                      <View style={[styles.commentMeta, { gap: theme.space[2] }]}>
                        <Text
                          style={[
                            theme.type.label,
                            { color: theme.colors.text },
                          ]}
                        >
                          {comment.authorName}
                        </Text>
                        <Text
                          style={[
                            theme.type.caption,
                            { color: theme.colors.textMuted },
                          ]}
                        >
                          {`@${comment.authorHandle} · ${formatRelativeTime(
                            comment.createdAt,
                          )}`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          theme.type.bodySmall,
                          { color: theme.colors.text },
                        ]}
                      >
                        {comment.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>

          {failed ? (
            <View
              testID="comment-sheet-send-error"
              accessibilityRole="alert"
              style={[styles.messageRow, { gap: theme.space[2] }]}
            >
              <Text
                style={[
                  theme.type.caption,
                  styles.message,
                  { color: theme.colors.error },
                ]}
              >
                No pudimos enviar tu comentario.
              </Text>
              <TextButton
                testID="comment-sheet-retry-send"
                label="Reintentar"
                onPress={() => send(draft)}
                disabled={!canSend}
              />
            </View>
          ) : null}

          {snackbar === undefined ? null : (
            <Snackbar
              message={snackbar.message}
              visible={snackbar.visible}
              onDismiss={snackbar.onDismiss}
            />
          )}

          <View style={[styles.composer, { gap: theme.space[2] }]}>
            <View style={styles.field}>
              <MultilineField
                testID="comment-sheet-field"
                label=""
                value={draft}
                onChangeText={changeDraft}
                placeholder="Escribe un comentario…"
                maxLength={maxLength}
                counterFrom={counterFrom}
                minHeight={72}
                autoFocus
              />
            </View>
            <Pressable
              testID="comment-sheet-send"
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              onPress={() => send(draft)}
              style={[
                styles.iconButton,
                {
                  minWidth: theme.size.touch,
                  minHeight: theme.size.touch,
                  opacity: canSend ? 1 : 0.4,
                },
              ]}
            >
              <Ionicons
                name="send"
                size={theme.size.icon.base}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 640,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  body: {
    flexShrink: 1,
  },
  list: {
    flexGrow: 0,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentTexts: {
    flex: 1,
    gap: 2,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  message: {
    flexShrink: 1,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  field: {
    flex: 1,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
