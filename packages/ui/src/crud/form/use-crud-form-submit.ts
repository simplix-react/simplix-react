import { useCallback, useState } from "react";

import {
  getValidationErrors,
  type ValidationFieldError,
} from "@simplix-react/api";

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
  const { entityId, create, update, onSuccess } = options;
  const isEdit = entityId != null && entityId !== "";
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (values: T) => {
      setFieldErrors({});

      const doMutate =
        isEdit && update
          ? () => update.mutateAsync({ id: entityId, dto: values })
          : () => create.mutateAsync(values);

      doMutate()
        .then(() => onSuccess?.())
        .catch((error: unknown) => {
          const errors = getValidationErrors(error);
          if (errors) {
            setFieldErrors(groupByField(errors));
          }
        });
    },
    [isEdit, entityId, create, update, onSuccess],
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
