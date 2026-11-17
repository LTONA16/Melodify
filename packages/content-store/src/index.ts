/**
 * Superficie pública de `@melodify/content-store` (C4 1.2.0).
 *
 * Publica una sola fábrica —`createContentStore`—, los dos topes de longitud de
 * la 1.2.0 —`MAX_OPINION_LENGTH` y `MAX_COMMENT_LENGTH`— y los tipos con los que
 * se habla con ella. **Nada de React dentro del paquete** (desviación registrada de ADR-010):
 * C4 es una fuente externa de datos con suscripción, y las pantallas la consumen a
 * través de los hooks de `app/src/state/`.
 *
 * `ContentSeed` viaja con la superficie porque `CreateContentStoreOptions` lo
 * referencia: una declaración pública no puede apoyarse en un tipo que no se puede
 * nombrar desde fuera.
 */
export { createContentStore, MAX_COMMENT_LENGTH, MAX_OPINION_LENGTH } from "./store";
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
