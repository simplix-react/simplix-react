import { useCallback, useEffect, useRef } from "react";

import { useRouter } from "../../adapters/router-provider";
import type { FilterState, PaginationState, SortState } from "../shared/types";

/** Options for the {@link useUrlSync} hook. */
export interface UseUrlSyncOptions {
  filters: FilterState;
  sort: SortState | null;
  pagination: PaginationState;
  setFilters: (filters: FilterState) => void;
  setSort: (field: string, direction: "asc" | "desc") => void;
  setPage: (page: number) => void;
}

// Serialize list state → URLSearchParams
function stateToParams(
  filters: FilterState,
  sort: SortState | null,
  pagination: PaginationState,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("q", filters.search);
  }

  for (const [key, value] of Object.entries(filters.values)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(`filters[${key}]`, String(value));
    }
  }

  if (sort?.field) {
    params.set("sort", `${sort.field}:${sort.direction}`);
  }

  if (pagination.page > 1) {
    params.set("page", String(pagination.page));
  }

  return params;
}

// Parse URLSearchParams → partial state
function paramsToState(params: URLSearchParams) {
  const filters: FilterState = { search: "", values: {} };
  let sort: SortState | null = null;
  let page = 1;

  const searchVal = params.get("q");
  if (searchVal) filters.search = searchVal;

  for (const [key, value] of params.entries()) {
    const match = key.match(/^filters\[(.+)]$/);
    if (match?.[1]) {
      filters.values[match[1]] = value;
    }
  }

  const sortVal = params.get("sort");
  if (sortVal) {
    const [field, direction] = sortVal.split(":");
    if (field && (direction === "asc" || direction === "desc")) {
      sort = { field, direction };
    }
  }

  const pageVal = params.get("page");
  if (pageVal) {
    const parsed = Number.parseInt(pageVal, 10);
    if (!Number.isNaN(parsed) && parsed > 0) page = parsed;
  }

  return { filters, sort, page };
}

/** Syncs list state (filters, sort, pagination) with URL query parameters. Reads from URL on mount and writes changes with 300ms debounce. */
// Sync list state ↔ URL query string
export function useUrlSync(options: UseUrlSyncOptions): void {
  const { filters, sort, pagination, setFilters, setSort, setPage } = options;
  const router = useRouter();
  const initialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read initial state from URL on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = router
      ? router.getSearchParams()
      : new URLSearchParams(globalThis.location?.search ?? "");

    const state = paramsToState(params);

    if (state.filters.search || Object.keys(state.filters.values).length > 0) {
      setFilters(state.filters);
    }
    if (state.sort) {
      setSort(state.sort.field, state.sort.direction);
    }
    if (state.page > 1) {
      setPage(state.page);
    }
    // Only run on mount
  }, []);

  // Write state to URL (debounced 300ms)
  const updateUrl = useCallback(
    (nextFilters: FilterState, nextSort: SortState | null, nextPagination: PaginationState) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        const params = stateToParams(nextFilters, nextSort, nextPagination);
        const search = params.toString();

        if (router) {
          router.setSearchParams(params, { replace: true });
        } else if (typeof globalThis.history?.replaceState === "function") {
          const url = search
            ? `${globalThis.location.pathname}?${search}`
            : globalThis.location.pathname;
          globalThis.history.replaceState(null, "", url);
        }
      }, 300);
    },
    [router],
  );

  // Sync state changes to URL
  useEffect(() => {
    // Skip the first render (we read from URL on mount)
    if (!initialized.current) return;

    updateUrl(filters, sort, pagination);
  }, [filters, sort, pagination, updateUrl]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);
}
