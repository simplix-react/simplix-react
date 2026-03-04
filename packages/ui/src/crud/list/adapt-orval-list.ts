import type { ListHook, ListHookResult } from "./use-crud-list";

/**
 * Loose hook shape that accepts any Orval-generated list hook.
 * Orval hooks have concretely typed params / return that are incompatible
 * with generic signatures due to contravariance.
 * We use `any` at this adapter boundary intentionally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrvalListHookLike = (params?: any, options?: any) => {
  data: unknown;
  isLoading: boolean;
  error: unknown;
};

/** Default: no cache for CRUD pages — always fetch fresh data. */
const DEFAULT_QUERY_OPTIONS: Record<string, unknown> = {
  staleTime: 0,
  gcTime: 0,
};

interface AdaptOrvalListOptions {
  /** Extra query options forwarded to Orval's second argument (`{ query: {...} }`).
   *  Merged with defaults (`staleTime: 0, gcTime: 0`). */
  queryOptions?: Record<string, unknown>;
}

/**
 * Adapts an Orval-generated list hook to the {@link ListHook} interface
 * expected by `useCrudList` with `stateMode: "server"`.
 *
 * Handles:
 * - Page conversion: 1-based (useCrudList) to 0-based (Spring Data)
 * - Size mapping: `pagination.limit` to `size`
 * - Sort formatting: `{ field, direction }` to `["field.direction"]`
 * - Response extraction: Spring Data Page (`content`, `totalElements`)
 */
export function adaptOrvalList<T>(
  useApiHook: OrvalListHookLike,
  options?: AdaptOrvalListOptions,
): ListHook<T> {
  const queryOpts = { ...DEFAULT_QUERY_OPTIONS, ...options?.queryOptions };

  return (params?: Record<string, unknown>): ListHookResult<T> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiParams: Record<string, any> = {};

    if (params) {
      const pagination = params.pagination as
        | { page: number; limit: number }
        | undefined;
      const sort = params.sort as
        | { field: string; direction: "asc" | "desc" }
        | undefined;

      if (pagination) {
        apiParams.page = pagination.page - 1; // 1-based -> 0-based
        apiParams.size = pagination.limit;
      }

      if (sort) {
        apiParams.sort = [`${sort.field}.${sort.direction}`];
      }

      const filters = params.filters as Record<string, unknown> | undefined;
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (key === "_search") continue;
          if (value === undefined || value === null || value === "") continue;
          if (Array.isArray(value) && value.length === 0) continue;
          apiParams[key] = value;
        }
      }
    }

    const query = useApiHook(apiParams, { query: queryOpts });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = query.data as any;

    return {
      data: page?.content as T[] | undefined,
      total: page?.totalElements as number | undefined,
      isLoading: query.isLoading,
      error: query.error as Error | null,
    };
  };
}
