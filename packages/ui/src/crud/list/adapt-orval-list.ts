import type { ListHook, ListHookResult } from "./use-crud-list";

/**
 * Loose hook shape that accepts any Orval-generated list hook.
 * Orval hooks have concretely typed params / return that are incompatible
 * with generic signatures due to contravariance.
 * We use `any` at this adapter boundary intentionally.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OrvalListHookLike = (params?: any, options?: any) => {
  data: unknown;
  isLoading: boolean;
  error: unknown;
};

/** Default: no cache for CRUD pages — always fetch fresh data. */
const DEFAULT_QUERY_OPTIONS: Record<string, unknown> = {
  staleTime: 0,
  gcTime: 0,
};

export interface AdaptOrvalListOptions {
  /** Extra query options forwarded to Orval's second argument (`{ query: {...} }`).
   *  Merged with defaults (`staleTime: 0, gcTime: 0`). */
  queryOptions?: Record<string, unknown>;
  /** Transform filter key-value pairs before sending to the API.
   *  Use this to convert generic filter formats to backend-specific formats
   *  (e.g., searchable-jpa BETWEEN operator, date format conversion). */
  transformFilters?: (filters: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Adapt an Orval-generated list hook to the {@link ListHook} interface
 * expected by {@link useCrudList} with `stateMode: "server"`.
 *
 * @remarks
 * Handles the following conversions:
 * - Page: 1-based (`useCrudList`) to 0-based (Spring Data).
 * - Size: `pagination.limit` to `size`.
 * - Sort: `{ field, direction }` to `["field.direction"]`.
 * - Response: Spring Data Page (`content`, `totalElements`) to `ListHookResult`.
 *
 * @typeParam T - Row data type.
 * @param useApiHook - Orval-generated list query hook.
 * @param options - Optional query configuration (e.g. cache overrides).
 * @returns A {@link ListHook} compatible with `useCrudList`.
 *
 * @example
 * ```ts
 * const useListPetsAdapted = adaptOrvalList<Pet>(useGetPets);
 * const list = useCrudList(useListPetsAdapted, { stateMode: "server" });
 * ```
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

      let filters = params.filters as Record<string, unknown> | undefined;
      if (filters) {
        if (options?.transformFilters) {
          filters = options.transformFilters(filters);
        }
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
