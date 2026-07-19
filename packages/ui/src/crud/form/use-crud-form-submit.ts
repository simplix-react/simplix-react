import { useCallback, useState } from "react";

import {
  getValidationErrors,
  type ValidationFieldError,
} from "@simplix-react/api";
import type { CrudMutation } from "@simplix-react/headless";
import { applyI18nFallback } from "./i18n-submit-helper";

export type { CrudMutation } from "@simplix-react/headless";

/** Options for the {@link useCrudFormSubmit} hook. */
export interface UseCrudFormSubmitOptions<T, TId = unknown> {
  /** Entity ID for edit mode. When nullish, create mode is used. */
  entityId?: TId;
  /** Create mutation hook result. */
  create: CrudMutation<T>;
  /** Update mutation hook result. Required for edit mode. */
  update?: CrudMutation<{ id: TId; dto: T }>;
  /**
   * Map of i18n field name → plain field name. Before submit, each plain
   * field is populated from `applyI18nFallback(values[i18nField], locales)`.
   */
  i18nFields?: Record<string, string>;
  /**
   * Locale config order for fallback (typically `useLocalePicker().locales`).
   * Required when `i18nFields` is provided.
   */
  locales?: ReadonlyArray<{ value: string }>;
  /** Called after a successful create or update. */
  onSuccess?: () => void;
  /**
   * Optional client-side validator. Runs on submit BEFORE the server
   * mutation. Receives the raw form values (pre-i18n-fallback) and must
   * return either `null` / `{}` to pass, or `Record<field, message>` to
   * block the submit.
   *
   * When the validator returns errors:
   *   - `fieldErrors` is set to the returned errors
   *   - the create/update mutation is NOT called
   *   - the form stays on screen
   *
   * Client and server errors are temporally mutually exclusive: a failing
   * validator prevents the network call, so server errors cannot coexist
   * with client errors in the same submit attempt. A subsequent submit
   * either replaces the errors with new client errors, new server errors,
   * or clears them on success.
   *
   * Wrap inline validator functions with `useCallback` / `useMemo` to keep
   * `handleSubmit` identity stable across renders.
   *
   * @example Zod (use `zodToFieldErrors` from `@simplix-react/form`):
   * ```ts
   * import { zodToFieldErrors } from "@simplix-react/form";
   * import { createUserSchema } from "@my-app/domain-user";
   *
   * validator: (v) => zodToFieldErrors(createUserSchema, v)
   * ```
   *
   * @example Custom rules:
   * ```ts
   * validator: (v) => v.email?.includes("@")
   *   ? null
   *   : { email: "Invalid email" }
   * ```
   */
  validator?: (values: T) => Record<string, string> | null;
}

/** Return type of {@link useCrudFormSubmit}. */
export interface UseCrudFormSubmitResult<T> {
  /** Whether the form is in edit mode (entity already exists). */
  isEdit: boolean;
  /** Submit handler that dispatches to create or update mutation. */
  handleSubmit: (values: T) => void;
  /** Whether the active mutation is pending. */
  isPending: boolean;
  /** Server validation errors keyed by field name. Empty when no errors. */
  fieldErrors: Record<string, string>;
}

/**
 * Handles create/update mutation dispatch for CRUD forms.
 * Determines whether to create or update based on `entityId` presence.
 *
 * Automatically extracts server validation errors (e.g. Spring Boot `errorDetail`)
 * and exposes them as `fieldErrors` for per-field error display.
 *
 * @remarks
 * Validation errors are suppressed from the global error dialog
 * (requires `MutationCache.onError` to skip `category === "validation"`).
 * Non-validation errors still propagate to the global dialog.
 *
 * @example
 * ```tsx
 * const { isEdit, handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
 *   entityId,
 *   create: adaptOrvalCreate(_create, { onSettled: invalidate }),
 *   update: adaptOrvalUpdate(_update, "id", { onSettled: invalidate }),
 *   onSuccess,
 * });
 *
 * <FormFields.TextField
 *   label={fieldLabel("name")}
 *   value={name}
 *   onChange={setName}
 *   error={fieldErrors["name"]}
 * />
 * ```
 *
 * @example With client-side validation (Zod):
 * ```tsx
 * import { zodToFieldErrors } from "@simplix-react/form";
 * import { createUserSchema, updateUserSchema } from "@my-app/domain-user";
 *
 * const { isEdit, handleSubmit, fieldErrors } = useCrudFormSubmit<FormValues>({
 *   entityId,
 *   create: adaptOrvalCreate(_create),
 *   update: adaptOrvalUpdate(_update, "userId"),
 *   validator: (v) => zodToFieldErrors(isEdit ? updateUserSchema : createUserSchema, v),
 *   onSuccess,
 * });
 * ```
 */
export function useCrudFormSubmit<T, TId = unknown>(
  options: UseCrudFormSubmitOptions<T, TId>,
): UseCrudFormSubmitResult<T> {
  const { entityId, create, update, onSuccess, i18nFields, locales, validator } = options;
  const isEdit = entityId != null && entityId !== "";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (values: T) => {
      setFieldErrors({});

      // ── client-side validation gate ──
      // Validator receives the raw form values (pre-i18n-fallback) so the
      // user's input is checked exactly as typed. On failure, skip the
      // server mutation entirely.
      const clientErrs = validator?.(values);
      if (clientErrs && Object.keys(clientErrs).length > 0) {
        setFieldErrors(clientErrs);
        return;
      }

      let prepared: T = values;
      if (i18nFields && locales) {
        const next: Record<string, unknown> = { ...(values as Record<string, unknown>) };
        for (const [i18nField, plainField] of Object.entries(i18nFields)) {
          const i18nValue = next[i18nField] as Record<string, string> | null | undefined;
          next[plainField] = applyI18nFallback(i18nValue, locales);
        }
        prepared = next as T;
      }

      const doMutate =
        isEdit && update
          ? () => update.mutateAsync({ id: entityId, dto: prepared })
          : () => create.mutateAsync(prepared);

      doMutate()
        .then(() => onSuccess?.())
        .catch((error: unknown) => {
          const errors = getValidationErrors(error);
          if (errors) {
            setFieldErrors(groupByField(errors));
          }
        });
    },
    [isEdit, entityId, create, update, onSuccess, i18nFields, locales, validator],
  );

  const isPending = isEdit ? (update?.isPending ?? false) : create.isPending;

  return { isEdit, handleSubmit, isPending, fieldErrors };
}

function groupByField(
  errors: ValidationFieldError[],
): Record<string, string> {
  const grouped: Record<string, string> = {};
  for (const err of errors) {
    grouped[err.field] = grouped[err.field]
      ? `${grouped[err.field]}, ${err.message}`
      : err.message;
  }
  return grouped;
}
