import {
  buildSearchableParams,
  makeFilterKey,
  type EmptyReason,
  type OrvalListHookLike,
  type SortState,
} from "@simplix-react/headless";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

/** Filter state exposed by {@link useEntityFeed}. */
export interface EntityFeedFilters {
  /** Committed filter values keyed by `field.operator`. */
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  clear: () => void;
  /** Number of active (non-empty) filter values. */
  activeCount: number;
}

/** Options for the {@link useEntityFeed} hook. */
export interface UseEntityFeedOptions {
  /** Page size per fetch. Defaults to `20`. */
  pageSize?: number;
  /** Initial committed filter values (keyed by `field.operator`). */
  defaultFilters?: Record<string, unknown>;
  /** Entity field the search bar queries (`contains` operator). */
  searchField?: string;
  /** Fixed sort forwarded to the backend. */
  sort?: SortState;
  /** Transform filters before serialization (backend-specific formats). */
  transformFilters?: (filters: Record<string, unknown>) => Record<string, unknown>;
}

/** State returned by {@link useEntityFeed}. */
export interface UseEntityFeedResult<T> {
  /** Accumulated rows across loaded pages. */
  items: T[];
  /** Server total, when known. */
  total: number | undefined;
  /** Initial page load in flight (no rows yet). */
  isLoading: boolean;
  /** Follow-up page load in flight. */
  isLoadingMore: boolean;
  /** Pull-to-refresh in flight. */
  isRefreshing: boolean;
  error: Error | null;
  /** More rows exist beyond the accumulated ones. */
  hasMore: boolean;
  /** Load the next page (no-op while loading or exhausted). */
  loadMore: () => void;
  /** Reset to the first page and refetch. */
  refresh: () => void;
  /** Raw (undebounced) search text for the input. */
  search: string;
  /** Update the search text (debounced before querying). */
  setSearch: (value: string) => void;
  filters: EntityFeedFilters;
  emptyReason: EmptyReason | null;
}

function isActiveFilterValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Feed-model list state machine for React Native: infinite scroll
 * accumulation, debounced search, committed filter values, pull-to-refresh.
 *
 * The native counterpart of the web `useCrudList` page model — both speak the
 * same searchable serialization (`buildSearchableParams`) and accept
 * Orval-generated list hooks directly.
 *
 * @typeParam T - Row data type.
 * @param useListHook - Orval-generated list query hook.
 * @param options - Feed configuration.
 *
 * @example
 * ```tsx
 * const feed = useEntityFeed<VisitListDTO>(useSearchVisits, {
 *   searchField: "visitorName",
 *   sort: { field: "scheduledAt", direction: "desc" },
 * });
 * <EntityList feed={feed} renderItem={…} keyExtractor={(v) => v.id} />
 * ```
 */
export function useEntityFeed<T>(
  useListHook: OrvalListHookLike,
  options?: UseEntityFeedOptions,
): UseEntityFeedResult<T> {
  const {
    pageSize = 20,
    defaultFilters,
    searchField,
    sort,
    transformFilters,
  } = options ?? {};

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(
    defaultFilters ?? {},
  );
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Debounce search ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Assemble committed filters (search folds into `${searchField}.contains`) ──
  const committedFilters = useMemo(() => {
    const merged: Record<string, unknown> = { ...filterValues };
    if (searchField && debouncedSearch) {
      merged[makeFilterKey(searchField, "contains")] = debouncedSearch;
    }
    return merged;
  }, [filterValues, debouncedSearch, searchField]);

  const apiParams = useMemo(
    () =>
      buildSearchableParams(
        {
          filters: committedFilters,
          sort,
          pagination: { page, limit: pageSize },
        },
        { transformFilters },
      ),
    [committedFilters, sort, page, pageSize, transformFilters],
  );

  // ── Reset to page 1 whenever the query condition changes ──
  const conditionKey = useMemo(
    () => JSON.stringify({ committedFilters, sort }),
    [committedFilters, sort],
  );
  const previousConditionKey = useRef(conditionKey);
  useEffect(() => {
    if (previousConditionKey.current !== conditionKey) {
      previousConditionKey.current = conditionKey;
      setPage(1);
      setItems([]);
      setTotal(undefined);
    }
  }, [conditionKey]);

  const query = useListHook(apiParams, {
    query: { staleTime: 0, gcTime: 0 },
  }) as {
    data: unknown;
    isLoading: boolean;
    error: unknown;
    isFetching?: boolean;
    refetch?: () => Promise<unknown>;
  };

  // ── Accumulate pages ──
  // Guard against unstable data references (a hook recreating the page object
  // every render must not re-append): apply each (condition, page, content)
  // combination exactly once, comparing rows by identity.
  const appliedRef = useRef<{ key: string; page: number; content: unknown[] } | null>(null);
  useEffect(() => {
    const pageData = query.data as
      | { content?: T[]; totalElements?: number }
      | undefined;
    if (!pageData?.content) return;
    const content = pageData.content;
    const prev = appliedRef.current;
    const alreadyApplied =
      prev !== null &&
      prev.key === conditionKey &&
      prev.page === page &&
      prev.content.length === content.length &&
      prev.content.every((item, i) => item === content[i]);
    if (alreadyApplied) return;
    appliedRef.current = { key: conditionKey, page, content };
    setTotal(pageData.totalElements);
    setItems((current) => (page === 1 ? content : [...current, ...content]));
  }, [query.data, page, conditionKey]);

  // ── Clear the refreshing flag when the fetch settles ──
  useEffect(() => {
    if (isRefreshing && query.isFetching === false) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, query.isFetching]);

  const hasMore = total !== undefined && items.length < total;
  const isLoading = query.isLoading && items.length === 0;
  const isLoadingMore = page > 1 && !!query.isFetching;

  const loadMore = useCallback(() => {
    if (query.isLoading || query.isFetching || !hasMore) return;
    setPage((p) => p + 1);
  }, [query.isLoading, query.isFetching, hasMore]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    if (page !== 1) {
      setPage(1);
      setItems([]);
    } else {
      void query.refetch?.();
    }
  }, [page, query]);

  const setValue = useCallback((key: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setValues = useCallback((values: Record<string, unknown>) => {
    setFilterValues(values);
  }, []);

  const clear = useCallback(() => {
    setFilterValues({});
    setSearch("");
  }, []);

  const activeCount = useMemo(
    () => Object.values(filterValues).filter(isActiveFilterValue).length,
    [filterValues],
  );

  const emptyReason = useMemo((): EmptyReason | null => {
    if (items.length > 0) return null;
    if (query.isLoading || query.isFetching) return null;
    if (query.error) return "error";
    if (debouncedSearch) return "no-search";
    if (activeCount > 0) return "no-filter";
    return "no-data";
  }, [items.length, query.isLoading, query.isFetching, query.error, debouncedSearch, activeCount]);

  return {
    items,
    total,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error: (query.error as Error | null) ?? null,
    hasMore,
    loadMore,
    refresh,
    search,
    setSearch,
    filters: { values: filterValues, setValue, setValues, clear, activeCount },
    emptyReason,
  };
}
