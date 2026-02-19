import { useCallback, useMemo, useState } from "react";

import type { EmptyReason, SortState } from "../shared/types";

// Minimal hook shape to avoid tight coupling with @simplix-react/react generics
interface ListHookResult<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface ListHook<T> {
  (params?: Record<string, unknown>, options?: Record<string, unknown>): ListHookResult<T>;
}

/** Configuration options for the {@link useCrudList} hook. */
export interface UseCrudListOptions {
  stateMode?: "server" | "client";
  maxRows?: number;
  defaultSort?: SortState;
  defaultPageSize?: number;
}

/** Filter state returned by {@link useCrudList}. */
export interface CrudListFilters {
  search: string;
  setSearch: (value: string) => void;
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  clear: () => void;
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
  filters: CrudListFilters;
  sort: CrudListSort;
  pagination: CrudListPagination;
  selection: CrudListSelection<T>;
  emptyReason: EmptyReason | null;
}

/**
 * State management hook for CRUD list views.
 * Handles filtering, sorting, pagination, and selection with
 * support for both server-side and client-side data processing.
 */
export function useCrudList<T>(
  useList: ListHook<T>,
  options?: UseCrudListOptions,
): UseCrudListResult<T> {
  const {
    stateMode = "server",
    defaultSort,
    defaultPageSize = 10,
  } = options ?? {};

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  const setFilterValue = useCallback((key: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterValues({});
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

    const filters: Record<string, unknown> = { ...filterValues };
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
  }, [stateMode, filterValues, search, sortField, sortDirection, page, pageSize]);

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
    for (const [key, val] of Object.entries(filterValues)) {
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
  }, [queryResult.data, stateMode, search, filterValues, sortField, sortDirection]);

  // ── Compute total and paginate (client mode) ──
  const total = stateMode === "client" ? processedData.length : (queryResult.data?.length ?? 0);

  const paginatedData = useMemo(() => {
    if (stateMode === "server") return processedData;

    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [stateMode, processedData, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── Empty reason detection ──
  const emptyReason = useMemo((): EmptyReason | null => {
    if (paginatedData.length > 0) return null;
    if (queryResult.isLoading) return null;

    if (search) return "no-search";
    if (Object.values(filterValues).some((v) => v !== undefined && v !== null && v !== "")) {
      return "no-filter";
    }
    return "no-data";
  }, [paginatedData.length, queryResult.isLoading, search, filterValues]);

  return {
    data: paginatedData,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    filters: {
      search,
      setSearch,
      values: filterValues,
      setValue: setFilterValue,
      clear: clearFilters,
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
