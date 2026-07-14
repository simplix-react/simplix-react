import { useCallback, useState } from "react";

import type { CrudListFilters } from "../list/use-crud-list";

const EMPTY_FILTERS: Record<string, unknown> = {};

/** Configuration options for the {@link useFilterBarState} hook. */
export interface UseFilterBarStateOptions {
  /** Initial filter values (both pending and committed). */
  defaultFilters?: Record<string, unknown>;
}

/**
 * Standalone filter state for a {@link FilterBar} that is not backed by
 * `useCrudList` — an aggregation report, a dashboard section, or any custom
 * query surface that still wants the standard search-popover chrome.
 *
 * Implements the same deferred-apply contract as `useCrudList`'s filter state:
 * popover fields edit the pending `values`, `apply()` commits them, and badges
 * plus the consumer's query read `committedValues`.
 *
 * @example
 * ```tsx
 * const filters = useFilterBarState({ defaultFilters: { "period.greaterThanOrEqualTo": from } });
 * const companyId = String(filters.committedValues["companyId.in"] ?? "");
 * <FilterBar filters={defs} state={filters} count={rows.length} />
 * ```
 */
export function useFilterBarState(options?: UseFilterBarStateOptions): CrudListFilters {
  const defaults = options?.defaultFilters ?? EMPTY_FILTERS;

  const [search, setSearchState] = useState("");
  const [pendingValues, setPendingValues] = useState(defaults);
  const [committedValues, setCommittedValues] = useState(defaults);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const setValue = useCallback((key: string, value: unknown) => {
    setPendingValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setValues = useCallback((updates: Record<string, unknown>) => {
    setPendingValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const setAll = useCallback((state: { search: string; values: Record<string, unknown> }) => {
    setSearchState(state.search);
    setPendingValues(state.values);
    setCommittedValues(state.values);
  }, []);

  const clear = useCallback(() => {
    setSearchState("");
    setPendingValues({});
    setCommittedValues({});
  }, []);

  const apply = useCallback(() => {
    setPendingValues((pending) => {
      setCommittedValues(pending);
      return pending;
    });
  }, []);

  const commitValue = useCallback((key: string, value: unknown) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, [key]: value });
    setPendingValues(updater);
    setCommittedValues(updater);
  }, []);

  const commitValues = useCallback((updates: Record<string, unknown>) => {
    const updater = (prev: Record<string, unknown>) => ({ ...prev, ...updates });
    setPendingValues(updater);
    setCommittedValues(updater);
  }, []);

  return {
    search,
    setSearch,
    values: pendingValues,
    setValue,
    setValues,
    setAll,
    clear,
    apply,
    isPending: pendingValues !== committedValues,
    committedValues,
    commitValue,
    commitValues,
  };
}
