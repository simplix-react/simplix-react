import { useCallback, useState } from "react";

import {
  getValidationErrors,
  type ValidationFieldError,
} from "@simplix-react/api";
import { applyI18nFallback } from "./i18n-submit-helper";

/** Minimal mutation shape used by {@link useCrudFormSubmit}. */
export interface CrudMutation<TInput> {
  /** Trigger the mutation with the given input. */
  mutate: (input: TInput, options?: { onSuccess?: () => void }) => void;
  /** Promise-based mutation trigger for error handling. */
  mutateAsync: (input: TInput) => Promise<unknown>;
  /** Whether the mutation is currently in flight. */
  isPending: boolean;
}

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
 */
export function useCrudFormSubmit<T, TId = unknown>(
  options: UseCrudFormSubmitOptions<T, TId>,
): UseCrudFormSubmitResult<T> {
  const { entityId, create, update, onSuccess, i18nFields, locales } = options;
  const isEdit = entityId != null && entityId !== "";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (values: T) => {
      setFieldErrors({});

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
    [isEdit, entityId, create, update, onSuccess, i18nFields, locales],
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
