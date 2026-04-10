import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import type { OrvalOptionsHookLike } from "./use-orval-options";

/** Configuration for useServerSearchOptions. */
export interface UseServerSearchOptionsConfig<TItem> {
  /**
   * Map each ListDTO item to a combobox option.
   * Same pattern as useOrvalOptions.toOption.
   * @example (item) => ({ label: item.menuName, value: item.menuId })
   */
  toOption: (item: TItem) => { label: string; value: string; icon?: ReactNode };

  /**
   * Search field name for the backend query param.
   * Combined with ".contains" operator: "menuName.contains=query"
   * @example "menuName"
   */
  searchField: string;

  /**
   * Pre-resolved option for the current value (FK label display).
   * Source: JPA join nested object in parent DTO.
   * Merged into options array when value not in search results.
   * @example { label: editData.parentMenu?.menuName, value: editData.parentMenuId }
   */
  selectedOption?: { label: string; value: string; icon?: ReactNode } | null;

  /** Debounce delay in milliseconds. Default: 300. */
  debounceMs?: number;

  /** Minimum query length to trigger search. Default: 1. */
  minQueryLength?: number;

  /** Maximum results per search (maps to page size). Default: 20. */
  limit?: number;

  /** Additional static search params (e.g., fixed filters). */
  params?: Record<string, string>;
}

/** Return type of useServerSearchOptions — ready to spread into ComboboxField. */
export interface UseServerSearchOptionsReturn {
  /** Mapped options from server response. Includes selectedOption if not in results. */
  options: Array<{ label: string; value: string; icon?: ReactNode }>;
  /** Loading state — spread to ComboboxField loading prop. */
  isLoading: boolean;
  /** Search handler — spread to ComboboxField onSearch prop. */
  onSearch: (query: string) => void;
}

/**
 * Server-side search hook for ComboboxField.
 * Follows useOrvalOptions conventions with reactive search capability.
 *
 * Reuses existing /search endpoints with @SearchableParams format.
 * Handles debounce, minimum query length, TanStack Query lifecycle,
 * and Page<ListDTO> response unwrapping (same as useOrvalOptions).
 *
 * @param useSearchQuery - Orval-generated search hook for the domain.
 * @param config - Search field, mapping, and behavior configuration.
 */
export function useServerSearchOptions<TItem>(
  useSearchQuery: OrvalOptionsHookLike,
  config: UseServerSearchOptionsConfig<TItem>,
): UseServerSearchOptionsReturn {
  const {
    toOption,
    searchField,
    selectedOption,
    debounceMs = 300,
    minQueryLength = 1,
    limit = 20,
    params: staticParams,
  } = config;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce: useState + useEffect + setTimeout (per design §2.4)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const enabled = debouncedQuery.length >= minQueryLength;

  // Build search params: field.contains=value format (existing @SearchableParams convention)
  const queryParams = useMemo(() => {
    const merged: Record<string, string> = {
      ...staticParams,
      page: "0",
      size: String(limit),
    };
    if (debouncedQuery) {
      merged[`${searchField}.contains`] = debouncedQuery;
    }
    return merged;
  }, [staticParams, searchField, debouncedQuery, limit]);

  // Reuse Orval-generated search hook (same as useOrvalOptions pattern)
  const { data, isLoading } = useSearchQuery(
    enabled ? queryParams : undefined,
    { query: { enabled, staleTime: 30_000, gcTime: 300_000, placeholderData: keepPreviousData } },
  );

  const options = useMemo(() => {
    // Return empty list when query does not meet minimum length — no results to show
    if (!enabled) {
      if (!selectedOption) return [];
      return [selectedOption];
    }
    // Page<ListDTO> unwrap — identical to useOrvalOptions pattern (use-orval-options.ts:54-57)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = data as any;
    const items: TItem[] = page?.content ?? [];
    const mapped = items.map(toOption);

    // Merge selectedOption if not already in results
    if (selectedOption && !mapped.some((o) => o.value === selectedOption.value)) {
      return [selectedOption, ...mapped];
    }
    return mapped;
  }, [data, toOption, selectedOption]);

  const onSearch = useCallback((q: string) => setQuery(q), []);

  return { options, isLoading: enabled && isLoading, onSearch };
}
