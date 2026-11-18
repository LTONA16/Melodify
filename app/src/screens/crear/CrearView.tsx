/**
 * La vista pura de Crear y Editar (BR11.1–BR11.11, BR12.1–BR12.7, BR13.1–BR13.5):
 * recibe ya resueltos el modo, el borrador, el buscador, las obras de ejemplo y los
 * callbacks, y no pregunta nada a C4, a C5 ni a la sesión.
 *
 * Por qué la pantalla se parte en contenedor y vista: el formulario tiene dos ramas
 * —buscador de Spotify o selector del catálogo de ejemplo— y cinco estados de
 * pantalla, y cada uno se recorre en una prueba sin montar almacenes ni temporizadores
 * (frontend-components.md § Crear).
 *
 * Decisiones:
 * - **La fila de obra elegida reutiliza `WorkResultRow`** y añade «Cambiar» como
 *   `TextButton` al lado: la pieza es la de C1 y la acción es de esta pantalla. En
 *   edición no hay «Cambiar» ni buscador (BR12.2).
 * - **Sin Spotify no se monta el buscador**: va la `ConnectionCard` y, debajo, las
 *   ocho obras de ejemplo con su recuento (BR13.5, AC5.2.1).
 * - **El error de envío se pinta sobre el botón principal** y no oculta los campos
 *   (BR11.7, BR12.5); «Reintentar» repite la misma escritura.
 * - **El aviso de sin conexión no lleva acción en Crear**: no hay nada que
 *   reintentar, el catálogo de ejemplo es local y el formulario funciona (BR15.4).
 */
import type { WorkSummary } from "@melodify/design-system";
import {
  ConnectionCard,
  ErrorState,
  MultilineField,
  PrimaryButton,
  RatingInput,
  SearchField,
  Skeleton,
  TextButton,
  WorkResultRow,
  useTheme,
} from "@melodify/design-system";
import { MAX_OPINION_LENGTH } from "@melodify/content-store";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { OfflineBanner } from "../../components/OfflineBanner";
import type { WorkSearchStatus } from "../../state/useWorkSearch";
import type {
  CrearMode,
  CrearScreenStatus,
  CrearSubmitError,
} from "./useCrear";
import type { SelectedWork } from "./validateOpinionDraft";
import { CrearHeader } from "./CrearHeader";

/** El texto propio de Crear sin red; el de Editar es el aviso único de U2 (BR15.4). */
export const CREAR_OFFLINE_MESSAGE =
  "Sin conexión. Puedes opinar sobre las obras de ejemplo.";

/** Desde cuántos caracteres se enseña el contador del campo (BR11.3). */
export const CREAR_COUNTER_FROM = MAX_OPINION_LENGTH - 100;

/** Una obra de ejemplo con el recuento que C5 resuelve para su fila. */
export interface CrearSampleWork {
  work: WorkSummary;
  opinionCount: number;
}

/** Un resultado de búsqueda; el rótulo de tipo es opcional (BR20.9). */
export interface CrearSearchWork extends WorkSummary {
  workKind?: "track" | "album";
}

export interface CrearViewProps {
  mode: CrearMode;
  screenStatus: CrearScreenStatus;
  /** Si hay red; con `false` se pinta el aviso informativo y se puede publicar. */
  online: boolean;
  /** Si hay sesión de Spotify; sin ella no se monta el buscador (BR13.5). */
  spotifyConnected: boolean;

  work: SelectedWork | null;
  text: string;
  rating: number;
  canSubmit: boolean;
  /** La obra elegida ya tiene opinión propia: «Editar mi opinión» sustituye. */
  alreadyOpined: boolean;
  submitError: CrearSubmitError;

  /** Si el buscador (o el selector) está desplegado en modo publicar. */
  searchVisible: boolean;
  query: string;
  searchStatus: WorkSearchStatus;
  results: readonly CrearSearchWork[];
  onChangeQuery: (text: string) => void;
  onClearQuery: () => void;
  /** «Cambiar»: vuelve a desplegar el buscador con el texto vacío (BR13.3). */
  onToggleSearch: () => void;
  onChooseWork: (work: SelectedWork) => void;
  onSearchRetry: () => void;

  /** Las ocho obras de ejemplo de C5 con su recuento (BR11.9). */
  sampleWorks: readonly CrearSampleWork[];

  onPublish: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditExisting: () => void;
  onClearRating: () => void;
  onRate: (value: number) => void;
  onChangeText: (text: string) => void;
  onRetryLoad: () => void;
}

const NO_ACTION = () => undefined;

function sectionTitle(theme: ReturnType<typeof useTheme>, label: string) {
  return (
    <Text style={[theme.type.title2, { color: theme.colors.text }]}>{label}</Text>
  );
}

interface SelectedWorkRowProps {
  work: SelectedWork;
  opinionCount: number;
  /** En edición la obra es fija: ni buscador ni «Cambiar» (BR12.2). */
  canChange: boolean;
  onChange: () => void;
}

function SelectedWorkRow({
  work,
  opinionCount,
  canChange,
  onChange,
}: SelectedWorkRowProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[2] }}>
      <WorkResultRow
        work={work}
        kind={work.workKind}
        opinionCount={opinionCount}
        onPress={canChange ? onChange : NO_ACTION}
      />
      {canChange ? (
        <TextButton
          label="Cambiar"
          testID="crear-change-work"
          onPress={onChange}
        />
      ) : null}
    </View>
  );
}

interface SearchBranchProps {
  query: string;
  searchStatus: WorkSearchStatus;
  results: readonly CrearSearchWork[];
  onChangeQuery: (text: string) => void;
  onClearQuery: () => void;
  onSearchRetry: () => void;
  onChooseWork: (work: SelectedWork) => void;
}

function SearchBranch({
  query,
  searchStatus,
  results,
  onChangeQuery,
  onClearQuery,
  onSearchRetry,
  onChooseWork,
}: SearchBranchProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      <SearchField
        value={query}
        onChangeText={onChangeQuery}
        onClear={onClearQuery}
        loading={searchStatus === "searching"}
      />

      {searchStatus === "short" ? (
        <Text style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}>
          Escribe al menos 2 caracteres.
        </Text>
      ) : null}

      {searchStatus === "searching" ? <Skeleton shape="row" count={3} /> : null}

      {searchStatus === "results"
        ? results
            .slice(0, 5)
            .map((work) => (
              <WorkResultRow
                key={work.workId}
                work={work}
                kind={work.workKind}
                opinionCount={0}
                onPress={() => onChooseWork(work)}
              />
            ))
        : null}

      {searchStatus === "empty" ? (
        <Text style={[theme.type.bodySmall, { color: theme.colors.textSecondary }]}>
          No encontramos esa obra. Prueba con otro nombre.
        </Text>
      ) : null}

      {searchStatus === "error" ? (
        <View style={{ gap: theme.space[2] }}>
          <Text style={[theme.type.bodySmall, { color: theme.colors.text }]}>
            No pudimos buscar en Spotify.
          </Text>
          <TextButton
            label="Reintentar"
            testID="crear-search-retry"
            onPress={onSearchRetry}
          />
        </View>
      ) : null}
    </View>
  );
}

interface SampleBranchProps {
  sampleWorks: readonly CrearSampleWork[];
  onChooseWork: (work: SelectedWork) => void;
}

function SampleBranch({ sampleWorks, onChooseWork }: SampleBranchProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.space[3] }}>
      <ConnectionCard
        title="Busca en todo Spotify"
        body="Conecta Spotify para buscar en el catálogo completo."
        actionLabel="Conectar con Spotify"
        onAction={NO_ACTION}
      />

      {sampleWorks.map(({ work, opinionCount }) => (
        <WorkResultRow
          key={work.workId}
          work={work}
          opinionCount={opinionCount}
          onPress={() => onChooseWork(work)}
        />
      ))}
    </View>
  );
}

export function CrearView({
  mode,
  screenStatus,
  online,
  spotifyConnected,
  work,
  text,
  rating,
  canSubmit,
  alreadyOpined,
  submitError,
  searchVisible,
  query,
  searchStatus,
  results,
  onChangeQuery,
  onClearQuery,
  onToggleSearch,
  onChooseWork,
  onSearchRetry,
  sampleWorks,
  onPublish,
  onSave,
  onCancel,
  onEditExisting,
  onClearRating,
  onRate,
  onChangeText,
  onRetryLoad,
}: CrearViewProps) {
  const theme = useTheme();
  const isEdit = mode === "edit";
  // En edición nunca hay buscador ni selector (BR12.2); en publicar, la obra elegida
  // se pliega salvo que la persona haya tocado «Cambiar» (BR13.3).
  const showPicker = !isEdit && (work === null || searchVisible);
  const selectedOpinionCount =
    work === null
      ? 0
      : (sampleWorks.find((sample) => sample.work.workId === work.workId)
          ?.opinionCount ?? 0);
  const submitLabel = isEdit ? "Guardar" : "Publicar";
  const submit = isEdit ? onSave : onPublish;

  return (
    <View testID="crear-view" style={styles.fill}>
      <CrearHeader title={isEdit ? "Editar opinión" : "Crear"} onCancel={onCancel} />

      <ScrollView
        testID="crear-scroll"
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { padding: theme.space[4], paddingBottom: theme.space[8], gap: theme.space[4] },
        ]}
      >
        {online ? null : <OfflineBanner message={isEdit ? undefined : CREAR_OFFLINE_MESSAGE} />}

        {screenStatus === "loading" ? (
          <View testID="crear-loading" style={{ gap: theme.space[3] }}>
            <Skeleton shape="header" count={1} />
            <Skeleton shape="card" count={2} />
          </View>
        ) : screenStatus === "loadError" ? (
          <ErrorState
            message="No pudimos cargar tu opinión."
            retryLabel="Reintentar"
            onRetry={onRetryLoad}
          />
        ) : (
          <>
            <View style={{ gap: theme.space[3] }}>
              {sectionTitle(theme, "Obra")}

              {showPicker ? (
                spotifyConnected ? (
                  <SearchBranch
                    query={query}
                    searchStatus={searchStatus}
                    results={results}
                    onChangeQuery={onChangeQuery}
                    onClearQuery={onClearQuery}
                    onSearchRetry={onSearchRetry}
                    onChooseWork={onChooseWork}
                  />
                ) : (
                  <SampleBranch
                    sampleWorks={sampleWorks}
                    onChooseWork={onChooseWork}
                  />
                )
              ) : work === null ? null : (
                <SelectedWorkRow
                  work={work}
                  opinionCount={selectedOpinionCount}
                  canChange={!isEdit}
                  onChange={onToggleSearch}
                />
              )}
            </View>

            <View style={{ gap: theme.space[2] }}>
              {sectionTitle(theme, "Tu opinión")}
              <MultilineField
                label=""
                testID="crear-text"
                value={text}
                onChangeText={onChangeText}
                placeholder="Escribe lo que piensas…"
                maxLength={MAX_OPINION_LENGTH}
                counterFrom={CREAR_COUNTER_FROM}
              />
            </View>

            <View style={{ gap: theme.space[2] }}>
              {sectionTitle(theme, "Valoración")}
              <RatingInput value={rating} onChange={onRate} />
              {rating > 0 ? (
                <TextButton
                  label="Quitar valoración"
                  testID="crear-clear-rating"
                  onPress={onClearRating}
                />
              ) : null}
            </View>

            {alreadyOpined && !isEdit ? (
              <View style={{ gap: theme.space[2] }}>
                <Text
                  testID="crear-already-opined"
                  style={[theme.type.body, { color: theme.colors.text }]}
                >
                  Ya opinaste sobre esta obra.
                </Text>
                <PrimaryButton
                  label="Editar mi opinión"
                  testID="crear-edit-existing"
                  onPress={onEditExisting}
                />
              </View>
            ) : (
              <View style={{ gap: theme.space[3] }}>
                {submitError === null ? null : (
                  <ErrorState
                    message={
                      submitError === "publish"
                        ? "No pudimos publicar tu opinión."
                        : "No pudimos guardar los cambios."
                    }
                    retryLabel="Reintentar"
                    onRetry={submit}
                  />
                )}
                <PrimaryButton
                  label={submitLabel}
                  testID="crear-submit"
                  disabled={!canSubmit}
                  onPress={submit}
                />
              </View>
            )}
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
    flexGrow: 1,
  },
});
