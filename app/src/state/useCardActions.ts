/**
 * Las cuatro acciones de una tarjeta (BR14.1–BR14.3, BR14.8): me gusta, comentar,
 * seguir y editar, resueltas una sola vez para Inicio, los dos detalles y Perfil.
 *
 * Por qué un hook compartido y no una copia por pantalla: cuatro cableados del mismo
 * `toggleLike` se desincronizarían en cuanto una unidad siguiente añadiera una acción
 * o cambiara un texto. Cada pantalla decide la variante de tarjeta que pinta y le pasa
 * el paquete; ninguna vuelve a saber cómo se escribe en C4.
 *
 * Decisiones:
 * - **La opinión propia solo ofrece comentar y editar** (BR14.2, Q3 = A): el me gusta
 *   se pinta como contador no pulsable y el seguir no existe. La tarjeta ya oculta sus
 *   controles; aquí se cumple la otra mitad —no se entrega la acción—.
 * - **Sin `viewerId` no hay acciones**: las cuatro escrituras necesitan identidad, y
 *   un control que no puede hacer nada se entrega vacío en lugar de fallar al tocarlo.
 * - **El estado no se toca en el hook**: el `200` de C4 llega por su suscripción y la
 *   tarjeta se repinta sola (BR14.1). Un fallo solo pide el aviso y deja todo igual
 *   (desviación registrada de FR11.2: snackbar sin acción, con el propio control en
 *   pantalla).
 * - **Los textos son los de `functional-spec.md` § Textos exactos**, y el handle del
 *   autor se lee de la opinión que la persona está viendo, no del resultado: el
 *   resultado de seguir no trae handle.
 */
import type { GlobalServices, ShellServices } from "@melodify/app-shell";
import type { ContentStore, OpinionView } from "@melodify/content-store";
import { useCallback } from "react";

/** Lo que una tarjeta puede recibir. `undefined` en un campo = control sin efecto. */
export interface CardActions {
  onLike?: () => void;
  onComment?: () => void;
  onFollow?: () => void;
  onEdit?: () => void;
}

export type CardActionsFor = (opinion: OpinionView) => CardActions;

/** Lo que el hook necesita de C4: las dos alternancias que no necesitan la sesión entera. */
export type CardActionsContentPort = Pick<
  ContentStore,
  "toggleLike" | "toggleFollow"
>;

export interface CardActionsDeps {
  content: CardActionsContentPort;
  viewerId: string | null;
  /** El controlador de la hoja de C2; solo se usa `open`. */
  comments: Pick<ShellServices["comments"], "open">;
  /** El snackbar y la navegación de la cáscara. */
  global: Pick<GlobalServices, "showSnackbar" | "openEdit">;
}

export function useCardActions({
  content,
  viewerId,
  comments,
  global,
}: CardActionsDeps): CardActionsFor {
  return useCallback(
    (opinion: OpinionView): CardActions => {
      if (viewerId === null) {
        return {};
      }

      const onComment = (): void => {
        // La hoja se monta en la cáscara sobre la pestaña activa: ni navegación ni
        // desmontaje de lo de debajo (BR14.3).
        comments.open(opinion.opinionId);
      };

      if (opinion.isOwn) {
        return {
          onComment,
          onEdit: () => global.openEdit({ opinionId: opinion.opinionId }),
        };
      }

      const onLike = (): void => {
        const result = content.toggleLike({
          opinionId: opinion.opinionId,
          authorId: viewerId,
        });

        if (!result.ok) {
          // El contador no se pinta a mano: C4 no emitió, así que nada cambió.
          global.showSnackbar({ message: "No pudimos guardar tu me gusta" });
        }
      };

      const onFollow = (): void => {
        const result = content.toggleFollow({
          authorId: opinion.author.authorId,
          followerId: viewerId,
        });

        if (!result.ok) {
          global.showSnackbar({
            message: "No pudimos guardar tu seguimiento",
          });
          return;
        }

        global.showSnackbar({
          message: result.value.followedByMe
            ? `Ahora sigues a @${opinion.author.handle}`
            : `Ya no sigues a @${opinion.author.handle}`,
        });
      };

      return { onLike, onComment, onFollow };
    },
    [content, viewerId, comments, global],
  );
}
