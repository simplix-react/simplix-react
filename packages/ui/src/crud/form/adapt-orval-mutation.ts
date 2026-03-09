import type { CrudMutation } from "./use-crud-form-submit";

/**
 * Loose mutation shape that accepts any Orval-generated hook result.
 * Orval hooks return concretely typed `mutate` signatures (e.g. `{ petId: number }`)
 * that are incompatible with generic `Record<string, unknown>` due to contravariance.
 * We use `any` at this adapter boundary intentionally.
 */
interface OrvalMutationLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutateAsync: (...args: any[]) => Promise<any>;
  isPending: boolean;
}

/**
 * Adapts an Orval **create** mutation (`mutate({ data: T })`) to the
 * {@link CrudMutation} interface (`mutate(values)`).
 */
export function adaptOrvalCreate<T>(
  mutation: OrvalMutationLike,
  opts?: { onSettled?: () => void },
): CrudMutation<T> {
  return {
    mutate: (values, options) =>
      mutation.mutate({ data: values }, { ...options, onSettled: opts?.onSettled }),
    mutateAsync: (values) =>
      mutation.mutateAsync({ data: values }, { onSettled: opts?.onSettled }),
    isPending: mutation.isPending,
  };
}

/**
 * Adapts an Orval **update** mutation to the {@link CrudMutation} interface
 * (`mutate({ id, dto })`).
 *
 * - With `pathParam`: sends `{ [pathParam]: id, data: dto }`
 * - Without `pathParam`: sends `{ data: dto }` (body-only update)
 *
 * @param mutation - Orval update mutation hook result
 * @param pathParam - The path parameter name used by Orval (e.g. `"petId"`).
 *   Omit for endpoints that identify the resource via the request body.
 */
export function adaptOrvalUpdate<T, TId = string>(
  mutation: OrvalMutationLike,
  pathParam?: string,
  opts?: { onSettled?: () => void },
): CrudMutation<{ id: TId; dto: T }> {
  return {
    mutate: ({ id, dto }, options) =>
      pathParam
        ? mutation.mutate({ [pathParam]: id, data: dto }, { ...options, onSettled: opts?.onSettled })
        : mutation.mutate({ data: dto }, { ...options, onSettled: opts?.onSettled }),
    mutateAsync: ({ id, dto }) =>
      pathParam
        ? mutation.mutateAsync({ [pathParam]: id, data: dto }, { onSettled: opts?.onSettled })
        : mutation.mutateAsync({ data: dto }, { onSettled: opts?.onSettled }),
    isPending: mutation.isPending,
  };
}

/**
 * Adapts an Orval **delete** mutation (`mutate({ [pathParam]: id })`) to the
 * {@link CrudMutation} interface (`mutate(id)`).
 *
 * @param mutation - Orval delete mutation hook result
 * @param pathParam - The path parameter name used by Orval (e.g. `"petId"`)
 */
export function adaptOrvalDelete<TId = string | number>(
  mutation: OrvalMutationLike,
  pathParam: string,
  opts?: { onSettled?: () => void },
): CrudMutation<TId> {
  return {
    mutate: (id, options) =>
      mutation.mutate({ [pathParam]: id }, { ...options, onSettled: opts?.onSettled }),
    mutateAsync: (id) =>
      mutation.mutateAsync({ [pathParam]: id }, { onSettled: opts?.onSettled }),
    isPending: mutation.isPending,
  };
}

/**
 * Adapts an Orval **order** mutation to produce a reorder callback.
 * Transforms reordered data into `[{ [idField]: id, [orderField]: index+1 }]`
 * and calls the mutation.
 *
 * @param mutation - Orval order mutation hook result (e.g. `useOrderSite()`)
 * @param idField - Row ID field name (e.g. "id")
 * @param orderField - Order field name (e.g. "displayOrder", "sortOrder")
 */
export function adaptOrvalOrder<T>(
  mutation: OrvalMutationLike,
  idField: string,
  orderField: string,
  opts?: { onSettled?: () => void },
): (items: T[]) => Promise<void> {
  return (items) =>
    new Promise<void>((resolve, reject) => {
      const orderUpdates = items.map((item, index) => ({
        [idField]: (item as Record<string, unknown>)[idField],
        [orderField]: index + 1,
      }));
      mutation.mutate(
        { data: orderUpdates },
        {
          onSuccess: () => resolve(),
          onError: (err: unknown) => reject(err),
          onSettled: opts?.onSettled,
        },
      );
    });
}
