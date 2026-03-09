import { useMemo, type ReactNode } from "react";

/**
 * Loose hook shape for Orval-generated list/search hooks.
 * Reuses the same boundary type as {@link adaptOrvalList}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrvalOptionsHookLike = (params?: any, options?: any) => {
  data: unknown;
  isLoading: boolean;
};

/** Configuration for {@link useOrvalOptions}. */
export interface UseOrvalOptionsConfig<TItem> {
  /** Map each item to a combobox option. */
  toOption: (item: TItem) => { label: string; value: string; icon?: ReactNode };
  /** Query params forwarded to the Orval hook (default: `{ page: 0, size: 100 }`). */
  params?: Record<string, unknown>;
}

/** Return type of {@link useOrvalOptions}. */
export interface UseOrvalOptionsResult {
  options: Array<{ label: string; value: string; icon?: ReactNode }>;
  isLoading: boolean;
}

/**
 * Convert an Orval-generated list/search hook result into `{ label, value }[]` options
 * suitable for {@link ComboboxField}, {@link SelectField}, or {@link MultiSelectField}.
 *
 * Handles Boot-envelope-unwrapped responses (Spring Data Page: `{ content: T[] }`).
 *
 * @typeParam TItem - Item type in the paginated response.
 * @param useQuery - Orval-generated list/search hook.
 * @param config - Mapping and query configuration.
 *
 * @example
 * ```tsx
 * const { options, isLoading } = useOrvalOptions(useHolidayTypeRestSimpleSearch, {
 *   toOption: (t) => ({ label: t.name, value: String(t.id) }),
 * });
 * ```
 */
export function useOrvalOptions<TItem>(
  useQuery: OrvalOptionsHookLike,
  config: UseOrvalOptionsConfig<TItem>,
): UseOrvalOptionsResult {
  const { toOption, params } = config;
  const queryParams = params ?? { page: 0, size: 100 };

  const { data, isLoading } = useQuery(queryParams);

  const options = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = data as any;
    const items: TItem[] = page?.content ?? [];
    return items.map(toOption);
  }, [data, toOption]);

  return { options, isLoading };
}
