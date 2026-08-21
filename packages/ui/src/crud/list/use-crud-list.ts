import { useCallback, useMemo, useRef, useState } from "react";

import { resolveEmptyReason, type ListHook, type ListHookResult } from "@simplix-react/headless";

import type { EmptyReason, SortState } from "../shared/types";

const EMPTY_FILTERS: Record<string, unknown> = {};

export type { ListHook, ListHookResult } from "@simplix-react/headless";

/** Configuration options for the {@link useCrudList} hook. */
export interface UseCrudListOptions {
  /** Whether filtering/sorting/pagination is handled by the server or client. Defaults to `"server"`. */
  stateMode?: "server" | "client";
  /** Whether filter changes apply immediately or require an explicit `apply()` call. Defaults to `"deferred"`. */
  filterMode?: "immediate" | "deferred";
  /** Maximum number of rows to display. */
  maxRows?: number;
  /** Initial sort field and direction. */
  defaultSort?: SortState;
  /** Initial page size. Defaults to `10`. */
  defaultPageSize?: number;
  /** Initial filter values. */
  defaultFilters?: Record<string, unknown>;
  /**
   * What the list is narrowed to from outside — a tab, a chip row, a parent record.
   *
   * <p><b>Pass this whenever something other than the list's own filters decides which records it
   * asks for.</b> The page index is state the list keeps, and a narrowing that arrives from
   * outside changes how many pages there are without touching it: a reader on page 5 of 활성 who
   * presses 정지 asks the server for page 5 of three rows and is given nothing. The total in the
   * toolbar comes from the same response and is right, so the screen states a count over an empty
   * table — the one shape a reader reads as a broken list rather than as an empty one.
   *
   * <p>Changing it returns the list to the first page and clears the selection, which is about the
   * rows that were there rather than the ones now. Any stable string will do: the tab's key, or
   * the forced parameters serialised.
   */
  scopeKey?: string;
}

/** Filter state returned by {@link useCrudList}. */
export interface CrudListFilters {
  search: string;
  setSearch: (value: string) => void;
  /** Pending (draft) filter values — used by popover form fields. */
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  setValues: (updates: Record<string, unknown>) => void;
  setAll: (filters: { search: string; values: Record<string, unknown> }) => void;
  clear: () => void;
  apply: () => void;
  isPending: boolean;
  /**
   * Whether the list's first page is still in flight — no rows and no total
   * have arrived yet. `CrudList.FilterBar` reads it to hold the total-count
   * badge in its unknown state instead of stating `Total 0`, which a reader
   * takes as "there is nothing here". Stays `false` on a refetch that already
   * has data, so paging does not blank a known count.
   */
  isLoading?: boolean;
  /** Committed (applied) filter values — used by badges, URL sync, and queries. */
  committedValues: Record<string, unknown>;
  /** Update a single filter in both pending and committed state, triggering a re-query. */
  commitValue: (key: string, value: unknown) => void;
  /** Update multiple filters in both pending and committed state, triggering a re-query. */
  commitValues: (updates: Record<string, unknown>) => void;
}

/** Sort state returned by {@link useCrudList}. */
export interface CrudListSort {
  field: string | null;
  direction: "asc" | "desc";
  setSort: (field: string, direction: "asc" | "desc") => void;
  toggleSort: (field: string) => void;
}

/** Pagination state returned by {@link useCrudList}. */
export interface CrudListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/** Selection state returned by {@link useCrudList}. */
export interface CrudListSelection<T> {
  selected: Set<number>;
  toggle: (index: number) => void;
  toggleAll: (data: T[]) => void;
  clear: () => void;
  isSelected: (index: number) => boolean;
}

/** Complete state returned by {@link useCrudList}. */
export interface UseCrudListResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  /**
   * Whether the underlying query is in flight but stalled (React Query
   * `fetchStatus === "paused"`). Such a query reports `isLoading: false` and
   * `error: null`; consult this before treating an empty `data` as "no data".
   */
  isPaused: boolean;
  /**
   * Consecutive failed fetch attempts on the underlying query. Greater than `0`
   * with `error === null` means a retry is pending.
   */
  failureCount: number;
  filters: CrudListFilters;
  sort: CrudListSort;
  pagination: CrudListPagination;
  selection: CrudListSelection<T>;
  emptyReason: EmptyReason | null;
}

/**
 * State management hook for CRUD list views.
 *
 * @remarks
 * Handles filtering, sorting, pagination, and row selection with
 * support for both server-side and client-side data processing.
 * In `"server"` mode, filter/sort/pagination params are forwarded to the list hook.
 * In `"client"` mode, all processing happens in-memory.
 *
 * This is the **headless escape hatch** for the list view: it returns the full
 * data/filter/sort/pagination/selection state so a consumer can render any
 * markup they want and still drive it with the framework's list engine — total
 * control without forking. This guarantee is **list-only**; the form and tree
 * views have no single equivalent hook, so their ceiling for deep customization
 * is per-instance slots / render-props (e.g. {@link ListTableSlots}), not a
 * headless hook.
 *
 * @typeParam T - Row data type.
 * @param useList - Data fetching hook (e.g. Orval-generated `useListPets`).
 * @param options - Configuration for state mode, defaults, and filter behavior.
 * @returns Unified state object for data, filters, sort, pagination, selection, and empty detection.
 *
 * @example
 * ```ts
 * const list = useCrudList(useListPets, {
 *   stateMode: "server",
 *   defaultPageSize: 20,
 *   defaultSort: { field: "name", direction: "asc" },
 * });
 *
 * // Use in CrudList component
 * <CrudList.Table data={list.data} sort={list.sort} ... />
 * <CrudList.Pagination {...list.pagination} ... />
 * ```
 */
export function useCrudList<T>(
  useList: ListHook<T>,
  options?: UseCrudListOptions,
): UseCrudListResult<T> {
  const {
    stateMode = "server",
    filterMode = "deferred",
    defaultSort,
    defaultPageSize = 10,
    defaultFilters,
    scopeKey,
  } = options ?? {};

  const isImmediate = filterMode === "immediate";

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [pendingFilterValues, setPendingFilterValues] = useState(defaultFilters ?? EMPTY_FILTERS);
  const [committedFilterValues, setCommittedFilterValues] = useState(defaultFilters ?? EMPTY_FILTERS);

  const setFilterValue = useCallback((key: string, value: unknown) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, [key]: value });
    setPendingFilterValues(updater);
    if (isImmediate) {
      setCommittedFilterValues(updater);
      setPage(1);
    }
  }, [isImmediate]);

  const setFilterValuesBatch = useCallback((updates: Record<string, unknown>) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, ...updates });
    setPendingFilterValues(updater);
    if (isImmediate) {
      setCommittedFilterValues(updater);
      setPage(1);
    }
  }, [isImmediate]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setPendingFilterValues({});
    setCommittedFilterValues({});
    setPage(1);
  }, []);

  const setAllFilters = useCallback((state: { search: string; values: Record<string, unknown> }) => {
    setSearch(state.search);
    setPendingFilterValues(state.values);
    setCommittedFilterValues(state.values);
  }, []);

  const applyFilters = useCallback(() => {
    setCommittedFilterValues(pendingFilterValues);
    setPage(1);
  }, [pendingFilterValues]);

  const commitFilterValue = useCallback((key: string, value: unknown) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, [key]: value });
    setPendingFilterValues(updater);
    setCommittedFilterValues(updater);
    setPage(1);
  }, []);

  const commitFilterValuesBatch = useCallback((updates: Record<string, unknown>) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, ...updates });
    setPendingFilterValues(updater);
    setCommittedFilterValues(updater);
    setPage(1);
  }, []);

  const filtersPending = !isImmediate && pendingFilterValues !== committedFilterValues;

  const setSearchWithReset = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  // ── Sort state ──
  const [sortField, setSortField] = useState<string | null>(defaultSort?.field ?? null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    defaultSort?.direction ?? "asc",
  );

  const setSort = useCallback((field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const toggleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  // ── Pagination state ──
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // ── Selection state ──
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // The page belongs to the scope it was turned to. Kept across a change of scope it addresses a
  // page of a different result set: the request comes back empty and the total that comes back
  // with it is correct, so the screen states a count over no rows and nothing contradicts it.
  // Done during the render that sees the new scope rather than in an effect, so the request never
  // goes out with the stale page — an effect would fetch the empty page first and correct after.
  const scopeSeen = useRef(scopeKey);
  if (scopeSeen.current !== scopeKey) {
    scopeSeen.current = scopeKey;
    if (page !== 1) setPage(1);
    // The selection is a set of row indices, which name different records under a new narrowing.
    if (selected.size > 0) setSelected(new Set());
  }

  const toggleSelection = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const toggleAllSelection = useCallback((data: T[]) => {
    setSelected((prev) => {
      if (prev.size === data.length) {
        return new Set();
      }
      return new Set(data.map((_, i) => i));
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback(
    (index: number) => selected.has(index),
    [selected],
  );

  // ── Build query params ──
  const listParams = useMemo(() => {
    if (stateMode === "client") return undefined;

    const params: Record<string, unknown> = {};

    const filters: Record<string, unknown> = { ...committedFilterValues };
    if (search) filters._search = search;
    if (Object.keys(filters).length > 0) params.filters = filters;

    if (sortField) {
      params.sort = { field: sortField, direction: sortDirection };
    }

    params.pagination = {
      type: "offset" as const,
      page,
      limit: pageSize,
    };

    return params;
  }, [stateMode, committedFilterValues, search, sortField, sortDirection, page, pageSize]);

  // ── Data fetching ──
  const queryResult = useList(
    stateMode === "server" ? listParams : undefined,
  );

  // ── Client-side processing ──
  const processedData = useMemo(() => {
    const raw = queryResult.data ?? [];

    if (stateMode === "server") return raw;

    // Client-side: filter, sort, paginate locally
    let filtered = raw;

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((item) => {
        const record = item as Record<string, unknown>;
        return Object.values(record).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(lowerSearch),
        );
      });
    }

    // Apply filter values
    for (const [key, val] of Object.entries(committedFilterValues)) {
      if (val !== undefined && val !== null && val !== "") {
        filtered = filtered.filter((item) => {
          const record = item as Record<string, unknown>;
          return record[key] === val;
        });
      }
    }

    // Apply sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aRecord = a as Record<string, unknown>;
        const bRecord = b as Record<string, unknown>;
        const aVal = aRecord[sortField];
        const bVal = bRecord[sortField];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  }, [queryResult.data, stateMode, search, committedFilterValues, sortField, sortDirection]);

  // ── Compute total and paginate (client mode) ──
  const total = stateMode === "client"
    ? processedData.length
    : (queryResult.total ?? queryResult.data?.length ?? 0);

  const paginatedData = useMemo(() => {
    if (stateMode === "server") return processedData;

    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [stateMode, processedData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Empty reason detection ──
  const isPaused = queryResult.isPaused ?? false;
  const failureCount = queryResult.failureCount ?? 0;

  const emptyReason = useMemo((): EmptyReason | null => resolveEmptyReason({
    hasRows: paginatedData.length > 0,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    isPaused,
    failureCount,
    hasSearch: !!search,
    hasFilters: Object.values(committedFilterValues).some(
      (v) => v !== undefined && v !== null && v !== "",
    ),
  }), [
    paginatedData.length,
    queryResult.isLoading,
    queryResult.error,
    isPaused,
    failureCount,
    search,
    committedFilterValues,
  ]);

  return {
    data: paginatedData,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    isPaused,
    failureCount,
    filters: {
      isLoading: queryResult.isLoading,
      search,
      setSearch: setSearchWithReset,
      values: pendingFilterValues,
      setValue: setFilterValue,
      setValues: setFilterValuesBatch,
      setAll: setAllFilters,
      clear: clearFilters,
      apply: applyFilters,
      isPending: filtersPending,
      committedValues: committedFilterValues,
      commitValue: commitFilterValue,
      commitValues: commitFilterValuesBatch,
    },
    sort: {
      field: sortField,
      direction: sortDirection,
      setSort,
      toggleSort,
    },
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      setPage,
      setPageSize,
    },
    selection: {
      selected,
      toggle: toggleSelection,
      toggleAll: toggleAllSelection,
      clear: clearSelection,
      isSelected,
    },
    emptyReason,
  };
}
