import { useCallback } from "react";

/** Minimal mutation shape used by {@link useCrudFormSubmit}. */
export interface CrudMutation<TInput> {
  mutate: (input: TInput, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
}

/** Options for the {@link useCrudFormSubmit} hook. */
export interface UseCrudFormSubmitOptions<T, TId = unknown> {
  entityId?: TId;
  create: CrudMutation<T>;
  update?: CrudMutation<{ id: TId; dto: T }>;
  onSuccess?: () => void;
}

/** Return type of {@link useCrudFormSubmit}. */
export interface UseCrudFormSubmitResult<T> {
  isEdit: boolean;
  handleSubmit: (values: T) => void;
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
