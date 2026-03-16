import { useTranslation } from "@simplix-react/i18n/react";
import type { ReactNode } from "react";

import { Badge } from "../../base/display/badge";
import { Button, type ButtonProps } from "../../base/controls/button";

/**
 * Props for the {@link SaveButton} component.
 *
 * Combines isDirty, loading, and validation states into a single self-contained save button.
 */
export interface SaveButtonProps extends Omit<ButtonProps, "loading" | "disabled" | "variant" | "size"> {
  /** Whether form/editor has unsaved changes. Defaults to `true` (create mode). */
  isDirty?: boolean;
  /** Whether the save mutation is in progress. Shows spinner and disables button. */
  isSaving?: boolean;
  /** Client-side validation error count. Takes priority over fieldErrors. Disables button and shows badge. */
  validationCount?: number;
  /** Server-side field errors from useCrudFormSubmit. Shows error count badge when non-empty. */
  fieldErrors?: Record<string, string>;
  /** Text shown while saving. Defaults to `t("common.saving")`. */
  savingText?: string;
  /** Additional disabled condition beyond isDirty and validation. */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Self-contained save button for CRUD forms and editors.
 *
 * Handles three states automatically:
 * - **isDirty** — disabled when no changes (`isDirty=false`). Omit for create mode.
 * - **validation** — `validationCount` (client) disables button + badge. `fieldErrors` (server) shows badge only (allows retry).
 * - **loading** — shows spinner and loading text when `isSaving=true`.
 *
 * @example CrudForm (edit mode — server validation via fieldErrors)
 * ```tsx
 * const isDirty = useIsDirty(values, initialValues);
 * <SaveButton type="submit" isDirty={isDirty} isSaving={isPending} fieldErrors={fieldErrors}>
 *   {t("entity.save")}
 * </SaveButton>
 * ```
 *
 * @example CrudForm (create mode — isDirty omitted)
 * ```tsx
 * <SaveButton type="submit" isSaving={isPending} fieldErrors={fieldErrors}>
 *   {t("entity.create")}
 * </SaveButton>
 * ```
 *
 * @example Editor with client-side validation (validationCount takes priority)
 * ```tsx
 * <SaveButton isDirty={isDirty} isSaving={isSaving} validationCount={errors.length} onClick={handleSave}>
 *   {t("entity.saveChanges")}
 * </SaveButton>
 * ```
 */
export function SaveButton({
  isDirty = true,
  isSaving = false,
  validationCount,
  fieldErrors,
  savingText,
  disabled,
  children,
  ...rest
}: SaveButtonProps) {
  const { t } = useTranslation("simplix/ui");
  const clientErrorCount = validationCount ?? 0;
  const serverErrorCount = Object.keys(fieldErrors ?? {}).length;
  const errorCount = clientErrorCount || serverErrorCount;
  const isDisabled = disabled || !isDirty;

  return (
    <Button
      size="sm"
      variant="primary"
      disabled={isDisabled}
      loading={isSaving}
      loadingText={savingText ?? t("common.saving")}
      {...rest}
    >
      {children}
      {!isSaving && errorCount > 0 && (
        <Badge variant="destructive" className="size-5 justify-center p-0 text-[0.625rem]">
          {errorCount}
        </Badge>
      )}
    </Button>
  );
}
