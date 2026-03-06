import { useCallback } from "react";

/** Minimal mutation shape used by {@link useCrudFormSubmit}. */
export interface CrudMutation<TInput> {
  /** Trigger the mutation with the given input. */
  mutate: (input: TInput, options?: { onSuccess?: () => void }) => void;
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
}

/**
 * Handles create/update mutation dispatch for CRUD forms.
 * Determines whether to create or update based on `entityId` presence.
 *
 * @example
 * ```tsx
 * const create = entityHooks.useCreate() as any;
 * const update = entityHooks.useUpdate() as any;
 * const { isEdit, handleSubmit } = useCrudFormSubmit<FormValues>({
 *   entityId,
 *   create,
 *   update,
 *   onSuccess,
 * });
 * ```
 */
export function useCrudFormSubmit<T, TId = unknown>(
  options: UseCrudFormSubmitOptions<T, TId>,
): UseCrudFormSubmitResult<T> {
  const { entityId, create, update, onSuccess } = options;
  const isEdit = entityId != null && entityId !== "";

  const handleSubmit = useCallback(
    (values: T) => {
      if (isEdit && update) {
        update.mutate({ id: entityId, dto: values }, { onSuccess });
      } else {
        create.mutate(values, { onSuccess });
      }
    },
    [isEdit, entityId, create, update, onSuccess],
  );

  const isPending = isEdit ? (update?.isPending ?? false) : create.isPending;

  return { isEdit, handleSubmit, isPending };
}
