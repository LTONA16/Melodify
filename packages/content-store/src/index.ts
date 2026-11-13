/**
 * Superficie pública de `@melodify/content-store` (C4 1.0.0).
 *
 * Publica una sola fábrica —`createContentStore`— y los tipos con los que se habla
 * con ella. **Nada de React dentro del paquete** (desviación registrada de ADR-010):
 * C4 es una fuente externa de datos con suscripción, y las pantallas la consumen a
 * través de los hooks de `app/src/state/`.
 *
 * `ContentSeed` viaja con la superficie porque `CreateContentStoreOptions` lo
 * referencia: una declaración pública no puede apoyarse en un tipo que no se puede
 * nombrar desde fuera.
 */
export { createContentStore } from "./store";
export type {
  ContentStore,
  CreateContentStoreOptions,
  CreateOpinionInput,
  UpdateOpinionInput,
} from "./store";
export type { ContentSeed } from "./seed";
export type {
  AuthorDetailView,
  AuthorView,
  CommentView,
  ContentErrorCode,
  ContentFailure,
  ContentResult,
  ContentSnapshot,
  ContentSuccess,
  ContentSuccessCode,
  FollowingList,
  LikeList,
  LikeView,
  OpinionView,
  ToggleFollowResult,
  ToggleLikeResult,
} from "./views";
