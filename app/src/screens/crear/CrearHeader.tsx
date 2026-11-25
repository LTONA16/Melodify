/**
 * La cabecera de Crear y Editar (BR11.1, BR12.1): el título del modo y «Cancelar»
 * en la ranura derecha.
 *
 * Vive en su propio archivo porque la vista pura la pinta en los tres estados
 * —cargando, error de carga y formulario— y una cabecera repetida en cada rama
 * acabaría con un título distinto en una de ellas.
 */
import { AppHeader, TextButton } from "@melodify/design-system";

export interface CrearHeaderProps {
  /** «Crear» o «Editar opinión», según la entrada de C2. */
  title: string;
  /** Vuelve sin escribir: la cáscara conserva el origen de la entrada (BR12.6). */
  onCancel: () => void;
}

export function CrearHeader({ title, onCancel }: CrearHeaderProps) {
  return (
    <AppHeader
      title={title}
      rightSlot={
        <TextButton
          label="Cancelar"
          testID="crear-cancel"
          onPress={onCancel}
        />
      }
    />
  );
}
